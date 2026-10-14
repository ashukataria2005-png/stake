import { NextRequest, NextResponse } from "next/server";
import prisma from "@/lib/prisma";
import { getOrCreateUser } from "@/lib/dbUser";
import { LGPayGateway } from "@/lib/payment/lgpay";
import { getPlatformSettings } from "@/app/api/admin/settings/route";

export const dynamic = "force-dynamic";

export async function POST(req: NextRequest) {
  try {
    const body = await req.json().catch(() => ({}));
    const { amount, userId, customerName, customerEmail } = body;

    const numAmount = parseFloat(amount);
    if (!amount || isNaN(numAmount) || numAmount < 300) {
      return NextResponse.json(
        { success: false, error: "Minimum payment order amount is ₹300" },
        { status: 400 }
      );
    }

    // 1. Fetch merchant configuration from DB/Platform Settings
    const settings = (getPlatformSettings() as any) || {};
    let merchantId = settings.lgpayMerchantId || process.env.LGPAY_MERCHANT_ID || "stake_lgpay_merchant";
    let apiKey = settings.lgpayApiKey || process.env.LGPAY_API_KEY || "lgpay_secret_key_prod_8829";
    let baseUrl = settings.lgpayBaseUrl || process.env.LGPAY_BASE_URL || "https://www.lg-pay.com";

    try {
      const dbSetting = await prisma.gameControl.findUnique({
        where: { gameName: "SYSTEM_UPI" },
      });
      if (dbSetting && dbSetting.mode) {
        const parsed = JSON.parse(dbSetting.mode);
        if (parsed.lgpayMerchantId) merchantId = parsed.lgpayMerchantId;
        if (parsed.lgpayApiKey) apiKey = parsed.lgpayApiKey;
        if (parsed.lgpayBaseUrl) baseUrl = parsed.lgpayBaseUrl;
      }
    } catch {}

    // 2. Resolve user in Neon PostgreSQL
    const { user } = await getOrCreateUser(userId || "ashuk");

    // 3. Generate unique order serial
    const order_sn = `${Date.now()}${Math.floor(100000 + Math.random() * 900000)}`;

    // 4. Record PENDING deposit transaction in Neon PostgreSQL
    try {
      await prisma.transaction.create({
        data: {
          userId: user.id,
          type: "DEPOSIT",
          amount: numAmount,
          currency: "INR",
          status: "PENDING",
          method: "LGPAY_AUTO",
          txHash: order_sn,
        },
      });
    } catch (dbErr) {
      console.error("[LGPay Create Order] Database transaction insert error:", dbErr);
    }

    // 5. Build URLs and Client IP
    const origin = req.nextUrl?.origin || process.env.NEXT_PUBLIC_APP_URL || "https://stake.internal";
    const notifyUrl = `${origin}/api/payment/webhook`;
    const returnUrl = `${origin}/casino/home`;
    const clientIp =
      req.headers.get("x-forwarded-for")?.split(",")[0]?.trim() ||
      req.headers.get("x-real-ip") ||
      "127.0.0.1";

    // 6. Initialize Gateway and call LG-Pay API
    const gateway = new LGPayGateway({
      appId: merchantId,
      secretKey: apiKey,
      baseUrl,
      notifyUrl,
      returnUrl,
    });

    const orderResponse = await gateway.createOrder({
      amount: numAmount,
      orderSn: order_sn,
      userId: user.id,
      clientIp,
      customerName,
      customerEmail,
      notifyUrl,
      returnUrl,
    });

    if (orderResponse.success && orderResponse.payUrl) {
      return NextResponse.json({
        success: true,
        orderId: order_sn,
        payUrl: orderResponse.payUrl,
        paymentUrl: orderResponse.payUrl,
      });
    }

    return NextResponse.json(
      {
        success: false,
        error: orderResponse.error || "Failed to generate LG-Pay payment order",
        orderId: order_sn,
      },
      { status: 400 }
    );
  } catch (err: any) {
    console.error("[LGPay Create Order Error]:", err);
    return NextResponse.json(
      { success: false, error: err?.message || "Internal payment gateway error" },
      { status: 500 }
    );
  }
}
