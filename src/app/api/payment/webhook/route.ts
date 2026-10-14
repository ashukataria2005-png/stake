import { NextRequest, NextResponse } from "next/server";
import prisma from "@/lib/prisma";
import { verifyLGPayWebhook } from "@/lib/payment/lgpay";
import { getPlatformSettings } from "@/app/api/admin/settings/route";

export const dynamic = "force-dynamic";

export async function POST(req: NextRequest) {
  try {
    // 1. Parse both application/x-www-form-urlencoded and json payloads
    const rawBody = await req.text();
    let params: Record<string, any> = {};

    try {
      params = JSON.parse(rawBody);
    } catch {
      params = Object.fromEntries(new URLSearchParams(rawBody));
    }

    const order_sn = String(params.order_sn || params.orderId || params.out_trade_no || "").trim();
    const status = String(params.status ?? "").trim();
    const rawMoney = params.money !== undefined ? parseFloat(String(params.money)) : NaN;
    const sign = params.sign || params.signature;

    if (!order_sn) {
      console.warn("[LGPay Webhook] Missing order_sn identifier");
      return new NextResponse("fail", { status: 400, headers: { "Content-Type": "text/plain" } });
    }

    // 2. Fetch secret key
    const settings = (getPlatformSettings() as any) || {};
    let apiKey = settings.lgpayApiKey || process.env.LGPAY_API_KEY || "lgpay_secret_key_prod_8829";

    try {
      const dbSetting = await prisma.gameControl.findUnique({
        where: { gameName: "SYSTEM_UPI" },
      });
      if (dbSetting && dbSetting.mode) {
        const parsed = JSON.parse(dbSetting.mode);
        if (parsed.lgpayApiKey) apiKey = parsed.lgpayApiKey;
      }
    } catch {}

    // 3. Verify signature
    const isValidSign = verifyLGPayWebhook(params, apiKey);
    if (!isValidSign && process.env.NODE_ENV === "production") {
      console.warn("[LGPay Webhook] Invalid signature received for order:", { order_sn, sign });
      return new NextResponse("sign error", { status: 400, headers: { "Content-Type": "text/plain" } });
    }

    // 4. Check payment status (1, "1", or "SUCCESS" indicate paid)
    const isSuccess = status === "1" || status.toUpperCase() === "SUCCESS";
    if (!isSuccess) {
      console.log(`[LGPay Webhook] Order ${order_sn} status is '${status}', not crediting wallet.`);
      return new NextResponse("ok", { status: 200, headers: { "Content-Type": "text/plain" } });
    }

    // 5. Query matching transaction
    const existingTx = await prisma.transaction.findFirst({
      where: {
        OR: [{ txHash: order_sn }, { id: order_sn }],
      },
    });

    if (!existingTx) {
      console.warn(`[LGPay Webhook] No matching transaction found for order_sn: ${order_sn}`);
      return new NextResponse("ok", { status: 200, headers: { "Content-Type": "text/plain" } });
    }

    // 6. Atomically credit user's wallet if still PENDING
    if (existingTx.status === "PENDING") {
      let depositAmount = Number(existingTx.amount);
      if (!isNaN(rawMoney) && rawMoney > 0) {
        // LG-Pay money is in paise (cents). If rawMoney > depositAmount * 50, convert from paise to INR
        depositAmount = rawMoney >= depositAmount * 50 ? rawMoney / 100 : rawMoney;
      }

      await prisma.$transaction(async (tx) => {
        // Update transaction status
        await tx.transaction.update({
          where: { id: existingTx.id },
          data: {
            status: "APPROVED",
            approvedBy: "LGPAY_GATEWAY",
            approvedAt: new Date(),
            utrNumber: params.pay_time ? `LGPAY_${params.pay_time}` : existingTx.utrNumber || `LGPAY_${Date.now()}`,
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
        `[LGPay Webhook] Successfully credited ₹${depositAmount} for order ${order_sn} to user ${existingTx.userId}`
      );
    } else {
      console.log(`[LGPay Webhook] Order ${order_sn} was already processed (status: ${existingTx.status}).`);
    }

    // 7. Return exact string response 'ok' (HTTP 200) required by LG-Pay
    return new NextResponse("ok", {
      status: 200,
      headers: { "Content-Type": "text/plain" },
    });
  } catch (err: any) {
    console.error("[LGPay Webhook Error]:", err);
    return new NextResponse("ok", {
      status: 200,
      headers: { "Content-Type": "text/plain" },
    });
  }
}
