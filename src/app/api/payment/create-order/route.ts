import { NextRequest, NextResponse } from "next/server";
import prisma from "@/lib/prisma";
import { getOrCreateUser } from "@/lib/dbUser";
import { UniversalGatewayAdapter, sanitizeGatewayBaseUrl, GatewayChannel, AmountUnit } from "@/lib/payment/universalGateway";
import { getPlatformSettings } from "@/app/api/admin/settings/route";

export const dynamic = "force-dynamic";

export async function POST(req: NextRequest) {
  try {
    const body = await req.json().catch(() => ({}));
    const { amount, userId, customerName, customerEmail, customerMobile, mobile } = body;

    const numAmount = parseFloat(amount);
    if (!amount || isNaN(numAmount) || numAmount < 300) {
      return NextResponse.json(
        { success: false, error: "Minimum payment order amount is ₹2" },
        { status: 400 }
      );
    }

    // 1. Fetch merchant configuration from DB/Platform Settings
    const settings = (getPlatformSettings() as any) || {};
    let merchantId = settings.lgpayMerchantId || process.env.LGPAY_MERCHANT_ID || "stake_lgpay_merchant";
    let apiKey = settings.lgpayApiKey || process.env.LGPAY_API_KEY || "lgpay_secret_key_prod_8829";
    let baseUrl = settings.lgpayBaseUrl || process.env.LGPAY_BASE_URL || "https://www.lg-pay.com";
    let channel: GatewayChannel = settings.paymentChannel || (settings.gatewayMode === "LGPAY_AUTO" ? "LGPAY_STANDARD" : "MANUAL_QR");
    let tradeType = settings.tradeType || "INRUPI";
    let amountUnit: AmountUnit = settings.amountUnit || "PAISE";

    try {
      const dbSetting = await prisma.gameControl.findUnique({
        where: { gameName: "SYSTEM_UPI" },
      });
      if (dbSetting && dbSetting.mode) {
        const parsed = JSON.parse(dbSetting.mode);
        if (parsed.lgpayMerchantId) merchantId = parsed.lgpayMerchantId;
        if (parsed.lgpayApiKey) apiKey = parsed.lgpayApiKey;
        if (parsed.lgpayBaseUrl) baseUrl = parsed.lgpayBaseUrl;
        if (parsed.paymentChannel) channel = parsed.paymentChannel;
        if (parsed.tradeType) tradeType = parsed.tradeType;
        if (parsed.amountUnit) amountUnit = parsed.amountUnit;
      }
    } catch (e) {
      console.warn("Failed reading DB gateway setting:", e);
    }

    baseUrl = sanitizeGatewayBaseUrl(baseUrl, channel);

    // 2. Resolve user in Neon PostgreSQL
    const { user } = await getOrCreateUser(userId || "ashuk");

    // 3. Generate unique order serial
    const order_sn = `${Date.now()}${Math.floor(100000 + Math.random() * 900000)}`;

    // 4. Record PENDING deposit transaction in Neon PostgreSQL
    const txMethod =
      channel === "RUPAYEX"
        ? "RUPAYEX"
        : channel === "MANUAL_QR"
        ? "MANUAL_UPI"
        : "LGPAY_AUTO";

    try {
      await prisma.transaction.create({
        data: {
          userId: user.id,
          type: "DEPOSIT",
          amount: numAmount,
          currency: "INR",
          status: "PENDING",
          method: txMethod,
          txHash: order_sn,
        },
      });
    } catch (dbErr) {
      console.error("[Universal Create Order] Database transaction insert error:", dbErr);
    }

    // 5. Build dynamic Notify/Return URLs and Client IP
    const origin = req.nextUrl?.origin || process.env.NEXT_PUBLIC_APP_URL || "https://stake.internal";
    const notifyUrl = `${origin}/api/payment/webhook`;
    const returnUrl = `${origin}/casino/home`;
    const clientIp =
      req.headers.get("x-forwarded-for")?.split(",")[0]?.trim() ||
      req.headers.get("x-real-ip") ||
      "127.0.0.1";

    // 6. Initialize Universal Gateway Adapter and dispatch order
    const gateway = new UniversalGatewayAdapter({
      channel,
      appId: merchantId,
      secretKey: apiKey,
      baseUrl,
      tradeType,
      amountUnit,
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
      customerMobile: customerMobile || mobile,
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
        error: orderResponse.error || "Failed to initialize payment gateway order",
        orderId: order_sn,
      },
      { status: 400 }
    );
  } catch (err: any) {
    console.error("[Universal Create Order Error]:", err);
    return NextResponse.json(
      { success: false, error: err?.message || "Internal payment gateway error" },
      { status: 500 }
    );
  }
}
