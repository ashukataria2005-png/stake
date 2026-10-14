import { NextRequest, NextResponse } from "next/server";
import prisma from "@/lib/prisma";
import { verifyUniversalSignature, checkRupayExOrderStatus } from "@/lib/payment/universalGateway";
import { getPlatformSettings } from "@/app/api/admin/settings/route";

export const dynamic = "force-dynamic";

export async function POST(req: NextRequest) {
  try {
    // 1. Parse both application/x-www-form-urlencoded and JSON payloads
    const rawBody = await req.text();
    let params: Record<string, any> = {};

    try {
      params = JSON.parse(rawBody);
    } catch {
      params = Object.fromEntries(new URLSearchParams(rawBody));
    }

    const order_id = String(
      params.order_id ||
      params.order_sn ||
      params.orderId ||
      params.out_trade_no ||
      params.trade_no ||
      ""
    ).trim();

    const status = String(params.status ?? "").trim();
    const rawMoney = params.money !== undefined ? parseFloat(String(params.money)) : NaN;
    const rawAmount = params.amount !== undefined ? parseFloat(String(params.amount)) : NaN;
    const sign = params.sign || params.signature;

    if (!order_id) {
      console.warn("[Universal Gateway Webhook] Missing order identifier in payload");
      return new NextResponse("fail", { status: 400, headers: { "Content-Type": "text/plain" } });
    }

    // 2. Fetch active gateway configuration from DB / platform settings
    const settings = (getPlatformSettings() as any) || {};
    let apiKey = settings.lgpayApiKey || process.env.LGPAY_API_KEY || "lgpay_secret_key_prod_8829";
    let merchantId = settings.lgpayMerchantId || process.env.LGPAY_MERCHANT_ID || "";
    let baseUrl = settings.lgpayBaseUrl || process.env.LGPAY_BASE_URL || "";
    let channel = settings.paymentChannel || (settings.gatewayMode === "LGPAY_AUTO" ? "LGPAY_STANDARD" : "MANUAL_QR");
    let amountUnit = settings.amountUnit || "PAISE";

    try {
      const dbSetting = await prisma.gameControl.findUnique({
        where: { gameName: "SYSTEM_UPI" },
      });
      if (dbSetting && dbSetting.mode) {
        const parsed = JSON.parse(dbSetting.mode);
        if (parsed.lgpayApiKey) apiKey = parsed.lgpayApiKey;
        if (parsed.lgpayMerchantId) merchantId = parsed.lgpayMerchantId;
        if (parsed.lgpayBaseUrl) baseUrl = parsed.lgpayBaseUrl;
        if (parsed.paymentChannel) channel = parsed.paymentChannel;
        if (parsed.amountUnit) amountUnit = parsed.amountUnit;
      }
    } catch (e) {
      console.warn("Failed reading DB gateway setting in webhook:", e);
    }

    // 3. Locate matching transaction in Neon PostgreSQL
    const existingTx = await prisma.transaction.findFirst({
      where: {
        OR: [{ txHash: order_id }, { id: order_id }],
      },
    });

    // Check payment status flags ("1", "SUCCESS", "PAID")
    const isSuccess =
      status === "1" ||
      status.toUpperCase() === "SUCCESS" ||
      status.toUpperCase() === "PAID";

    // 4. Branch: RupayEx Official Webhook Handling
    const isRupayEx =
      existingTx?.method === "RUPAYEX" ||
      channel === "RUPAYEX" ||
      Boolean(params.payment_token);

    if (isRupayEx) {
      if (!isSuccess) {
        console.log(`[RupayEx Webhook] Order ${order_id} status is '${status}', ignoring.`);
        return new NextResponse("ok", { status: 200, headers: { "Content-Type": "text/plain" } });
      }

      // Verify payment by querying official RupayEx order status:
      // GET https://rupayex.net/api/order-status?user_token=${token}&order_id=${order_id}
      const rupayExToken = apiKey || merchantId;
      let isVerified = true;

      try {
        const statusCheck = await checkRupayExOrderStatus(rupayExToken, order_id, baseUrl);
        if (statusCheck.success) {
          isVerified = statusCheck.isPaid;
        }
      } catch (checkErr) {
        console.warn("[RupayEx Status Verification Check Error]:", checkErr);
      }

      if (!isVerified) {
        console.warn(`[RupayEx Webhook] Status check failed for order ${order_id}`);
        return new NextResponse("ok", { status: 200, headers: { "Content-Type": "text/plain" } });
      }

      // Atomically credit user's wallet if still PENDING
      if (existingTx && existingTx.status === "PENDING") {
        const depositAmount = !isNaN(rawAmount) && rawAmount > 0
          ? rawAmount
          : Number(existingTx.amount);

        await prisma.$transaction(async (tx) => {
          await tx.transaction.update({
            where: { id: existingTx.id },
            data: {
              status: "APPROVED",
              approvedBy: "RUPAYEX_WEBHOOK",
              approvedAt: new Date(),
              utrNumber: params.utr ? String(params.utr).trim() : existingTx.utrNumber || `RPX_${Date.now()}`,
            },
          });

          const wallet = await tx.wallet.findFirst({
            where: { userId: existingTx.userId, currency: "INR" },
          });

          if (wallet) {
            await tx.wallet.update({
              where: { id: wallet.id },
              data: {
                balance: { increment: depositAmount },
                totalDeposited: { increment: depositAmount },
              },
            });
          }
        });

        console.log(
          `[RupayEx Webhook] Successfully credited ₹${depositAmount} for order ${order_id} to user ${existingTx.userId}`
        );
      }

      return new NextResponse("ok", { status: 200, headers: { "Content-Type": "text/plain" } });
    }

    // 5. Branch: Standard LG-Pay / MD5 signed gateway
    const isValidSign = verifyUniversalSignature(params, apiKey);
    if (!isValidSign && process.env.NODE_ENV === "production") {
      console.warn("[Universal Gateway Webhook] Invalid signature received for order:", { order_id, sign });
      return new NextResponse("sign error", { status: 400, headers: { "Content-Type": "text/plain" } });
    }

    if (!isSuccess) {
      console.log(`[Universal Gateway Webhook] Order ${order_id} status is '${status}', not crediting.`);
      return new NextResponse("ok", { status: 200, headers: { "Content-Type": "text/plain" } });
    }

    if (!existingTx) {
      console.warn(`[Universal Gateway Webhook] No matching transaction found for order: ${order_id}`);
      return new NextResponse("ok", { status: 200, headers: { "Content-Type": "text/plain" } });
    }

    // Atomically credit user's wallet if still PENDING
    if (existingTx.status === "PENDING") {
      let depositAmount = Number(existingTx.amount);
      if (!isNaN(rawMoney) && rawMoney > 0) {
        if (amountUnit === "PAISE" || rawMoney >= depositAmount * 50) {
          depositAmount = rawMoney / 100;
        } else {
          depositAmount = rawMoney;
        }
      }

      await prisma.$transaction(async (tx) => {
        await tx.transaction.update({
          where: { id: existingTx.id },
          data: {
            status: "APPROVED",
            approvedBy: "GATEWAY_WEBHOOK",
            approvedAt: new Date(),
            utrNumber: params.pay_time
              ? `UTR_${params.pay_time}`
              : existingTx.utrNumber || `GW_${Date.now()}`,
          },
        });

        const wallet = await tx.wallet.findFirst({
          where: { userId: existingTx.userId, currency: "INR" },
        });

        if (wallet) {
          await tx.wallet.update({
            where: { id: wallet.id },
            data: {
              balance: { increment: depositAmount },
              totalDeposited: { increment: depositAmount },
            },
          });
        }
      });

      console.log(
        `[Universal Gateway Webhook] Successfully credited ₹${depositAmount} for order ${order_id} to user ${existingTx.userId}`
      );
    }

    return new NextResponse("ok", {
      status: 200,
      headers: { "Content-Type": "text/plain" },
    });
  } catch (err: any) {
    console.error("[Universal Gateway Webhook Error]:", err);
    return new NextResponse("ok", {
      status: 200,
      headers: { "Content-Type": "text/plain" },
    });
  }
}

export async function GET(req: NextRequest) {
  // Gracefully handle browser redirect returns
  return NextResponse.redirect(new URL("/casino/home", req.url));
}
