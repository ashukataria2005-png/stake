import { NextRequest, NextResponse } from "next/server";
import prisma from "@/lib/prisma";
import { verifyUniversalSignature } from "@/lib/payment/universalGateway";
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

    const order_sn = String(
      params.order_sn || params.orderId || params.out_trade_no || params.trade_no || ""
    ).trim();
    const status = String(params.status ?? "").trim();
    const rawMoney = params.money !== undefined ? parseFloat(String(params.money)) : NaN;
    const sign = params.sign || params.signature;

    if (!order_sn) {
      console.warn("[Universal Gateway Webhook] Missing order_sn identifier");
      return new NextResponse("fail", { status: 400, headers: { "Content-Type": "text/plain" } });
    }

    // 2. Fetch active gateway configuration from DB / settings
    const settings = (getPlatformSettings() as any) || {};
    let apiKey = settings.lgpayApiKey || process.env.LGPAY_API_KEY || "lgpay_secret_key_prod_8829";
    let amountUnit = settings.amountUnit || "PAISE";

    try {
      const dbSetting = await prisma.gameControl.findUnique({
        where: { gameName: "SYSTEM_UPI" },
      });
      if (dbSetting && dbSetting.mode) {
        const parsed = JSON.parse(dbSetting.mode);
        if (parsed.lgpayApiKey) apiKey = parsed.lgpayApiKey;
        if (parsed.amountUnit) amountUnit = parsed.amountUnit;
      }
    } catch (e) {
      console.warn("Failed reading DB gateway setting in webhook:", e);
    }

    // 3. Verify digital signature using Universal MD5 signature logic
    const isValidSign = verifyUniversalSignature(params, apiKey);
    if (!isValidSign && process.env.NODE_ENV === "production") {
      console.warn("[Universal Gateway Webhook] Invalid signature received for order:", { order_sn, sign });
      return new NextResponse("sign error", { status: 400, headers: { "Content-Type": "text/plain" } });
    }

    // 4. Check payment status ("1", "SUCCESS", "PAID" indicate paid)
    const isSuccess =
      status === "1" ||
      status.toUpperCase() === "SUCCESS" ||
      status.toUpperCase() === "PAID";

    if (!isSuccess) {
      console.log(`[Universal Gateway Webhook] Order ${order_sn} status is '${status}', not crediting wallet.`);
      return new NextResponse("ok", { status: 200, headers: { "Content-Type": "text/plain" } });
    }

    // 5. Query matching transaction in Neon PostgreSQL
    const existingTx = await prisma.transaction.findFirst({
      where: {
        OR: [{ txHash: order_sn }, { id: order_sn }],
      },
    });

    if (!existingTx) {
      console.warn(`[Universal Gateway Webhook] No matching transaction found for order_sn: ${order_sn}`);
      return new NextResponse("ok", { status: 200, headers: { "Content-Type": "text/plain" } });
    }

    // 6. Atomically credit user's wallet if still PENDING
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
        // Update transaction status to APPROVED
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

        // Increment wallet balance and totalDeposited
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
        `[Universal Gateway Webhook] Successfully credited ₹${depositAmount} for order ${order_sn} to user ${existingTx.userId}`
      );
    } else {
      console.log(`[Universal Gateway Webhook] Order ${order_sn} was already processed (status: ${existingTx.status}).`);
    }

    // 7. Return exact string response 'ok' (HTTP 200) required by payment gateway
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
