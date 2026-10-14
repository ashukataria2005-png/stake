import { NextRequest, NextResponse } from "next/server";
import { LGPayGateway } from "@/lib/payment/lgpay";
import { getPlatformSettings } from "@/app/api/admin/settings/route";

export async function POST(req: NextRequest) {
  try {
    const body = await req.json();
    const { amount, userId, customerName, customerEmail } = body;

    const numAmount = parseFloat(amount);
    if (!amount || isNaN(numAmount) || numAmount < 300) {
      return NextResponse.json(
        { success: false, error: "Minimum payment order amount is ₹300" },
        { status: 400 }
      );
    }

    const settings = (getPlatformSettings() as any) || {};
    const merchantId = settings.lgpayMerchantId || process.env.LGPAY_MERCHANT_ID || "stake_lgpay_merchant";
    const apiKey = settings.lgpayApiKey || process.env.LGPAY_API_KEY || "lgpay_secret_key_prod_8829";
    const baseUrl = settings.lgpayBaseUrl || process.env.LGPAY_BASE_URL || "https://api.lgpay.internal";

    const gateway = new LGPayGateway({
      merchantId,
      apiKey,
      baseUrl,
      webhookSecret: apiKey,
    });

    const orderId = `LGPAY_${Date.now()}_${Math.floor(Math.random() * 10000)}`;

    const orderResponse = await gateway.createOrder({
      orderId,
      amount: numAmount,
      userId: userId || "guest_player",
      customerName,
      customerEmail,
    });

    return NextResponse.json({
      success: true,
      order: orderResponse,
    });
  } catch (err: any) {
    console.error("[LGPay Create Order Error]:", err);
    return NextResponse.json(
      { success: false, error: err?.message || "Internal gateway error" },
      { status: 500 }
    );
  }
}
