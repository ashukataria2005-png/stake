import { NextRequest, NextResponse } from "next/server";
import prisma from "@/lib/prisma";
import { getOrCreateUser } from "@/lib/dbUser";
import { verifyLGPayWebhook, WebhookPayload } from "@/lib/payment/lgpay";
import { getPlatformSettings } from "@/app/api/admin/settings/route";

export async function POST(req: NextRequest) {
  try {
    let payload: WebhookPayload;
    try {
      payload = await req.json();
    } catch {
      return NextResponse.json({ success: false, error: "Invalid JSON payload" }, { status: 400 });
    }

    const { orderId, amount, status, utr, signature } = payload;

    if (!orderId || !amount || !status) {
      return NextResponse.json(
        { success: false, error: "Missing required webhook parameters" },
        { status: 400 }
      );
    }

    const settings = (getPlatformSettings() as any) || {};
    const apiKey = settings.lgpayApiKey || process.env.LGPAY_API_KEY || "lgpay_secret_key_prod_8829";

    // 1. Verify IPN Signature
    if (process.env.NODE_ENV === "production" && signature) {
      const isValid = verifyLGPayWebhook(payload, apiKey);
      if (!isValid) {
        console.warn("[LGPay Webhook] Invalid signature received for order:", orderId);
        return NextResponse.json({ success: false, error: "Invalid signature" }, { status: 403 });
      }
    }

    // 2. Only process SUCCESS status
    if (status !== "SUCCESS") {
      console.log(`[LGPay Webhook] Order ${orderId} status is ${status}, no wallet credit required.`);
      return NextResponse.json({ success: true, message: `Status ${status} acknowledged` });
    }

    const numAmount = parseFloat(amount.toString());

    // 3. Atomically credit user's Neon PostgreSQL wallet
    // Look up or link to user through order or default
    const existingTx = await prisma.transaction.findFirst({
      where: { txHash: orderId },
    });

    let targetUserId = existingTx?.userId || "ashuk";
    const { user, wallet } = await getOrCreateUser(targetUserId);

    const updatedWallet = await prisma.wallet.update({
      where: { id: wallet.id },
      data: {
        balance: { increment: numAmount },
        totalDeposited: { increment: numAmount },
      },
    });

    // 4. Record Deposit Transaction
    await prisma.transaction.create({
      data: {
        userId: user.id,
        type: "DEPOSIT",
        amount: numAmount,
        currency: "INR",
        status: "APPROVED",
        method: "LGPAY_AUTO",
        txHash: utr ? `UTR:${utr}|ORDER:${orderId}` : orderId,
        approvedBy: "LGPAY_GATEWAY",
      },
    });

    console.log("[LGPay Webhook] Successfully auto-credited deposit:", {
      orderId,
      amount: numAmount,
      userId: user.id,
      newBalance: Number(updatedWallet.balance),
    });

    return NextResponse.json({
      success: true,
      orderId,
      credited: numAmount,
      balance: Number(updatedWallet.balance),
    });
  } catch (err: any) {
    console.error("[LGPay Webhook Error]:", err);
    return NextResponse.json(
      { success: false, error: err?.message || "Webhook handling error" },
      { status: 500 }
    );
  }
}
