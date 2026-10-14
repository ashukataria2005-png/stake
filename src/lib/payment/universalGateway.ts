import crypto from "crypto";
import {
  createRupayExOrder,
  checkRupayExOrderStatus,
  sanitizeRupayExBaseUrl,
  RupayExOrderParams,
  RupayExOrderResponse,
  RupayExStatusResponse,
} from "./rupayex";

export {
  createRupayExOrder,
  checkRupayExOrderStatus,
  sanitizeRupayExBaseUrl,
};
export type { RupayExOrderParams, RupayExOrderResponse, RupayExStatusResponse };

export type GatewayChannel = "MANUAL_QR" | "LGPAY_STANDARD" | "RUPAYEX" | "CUSTOM_API";
export type AmountUnit = "PAISE" | "RUPEES";

export interface UniversalGatewayConfig {
  channel: GatewayChannel;
  baseUrl: string;
  appId: string;
  secretKey: string;
  tradeType?: string; // Default: 'INRUPI'
  amountUnit?: AmountUnit; // 'PAISE' (x100) or 'RUPEES' (normal)
  notifyUrl?: string;
  returnUrl?: string;
  customParams?: Record<string, string>;
}

export interface UniversalOrderRequest {
  amount: number; // In INR (Rupees, e.g. 500)
  userId: string;
  orderSn?: string;
  clientIp?: string;
  customerName?: string;
  customerEmail?: string;
  customerMobile?: string;
  notifyUrl?: string;
  returnUrl?: string;
}

export interface UniversalOrderResponse {
  success: boolean;
  orderId: string;
  payUrl?: string;
  paymentUrl?: string;
  error?: string;
  raw?: any;
}

/**
 * Robust URL Sanitizer:
 * Automatically cleans trailing slashes and redundant endpoint tails like '/api/order/create'
 * so requests always resolve cleanly to `${sanitizedBaseUrl}/api/order/create` without 404s.
 */
export function sanitizeGatewayBaseUrl(inputUrl?: string, channel?: GatewayChannel): string {
  if (channel === "RUPAYEX" || (typeof inputUrl === "string" && inputUrl.includes("rupayex"))) {
    return sanitizeRupayExBaseUrl(inputUrl);
  }

  if (!inputUrl || typeof inputUrl !== "string") {
    return "https://www.lg-pay.com";
  }

  let url = inputUrl.trim();
  if (!url) return "https://www.lg-pay.com";

  // Strip trailing slashes
  url = url.replace(/\/+$/, "");

  // Strip redundant endpoint suffixes if entered by user
  url = url.replace(/\/api\/order\/create\/?$/i, "");
  url = url.replace(/\/api\/order\/?$/i, "");
  url = url.replace(/\/api\/?$/i, "");

  // Ensure valid HTTP/HTTPS protocol
  if (!/^https?:\/\//i.test(url)) {
    url = `https://${url}`;
  }

  return url;
}

/**
 * Universal MD5 signature calculation (PHP ksort + &key=SECRET_KEY + MD5 UpperCase):
 * 1. Sort parameter keys alphabetically.
 * 2. Filter out 'sign', 'signature', and empty/null/undefined values.
 * 3. Concatenate non-empty values as `k1=v1&k2=v2&...&key={SECRET_KEY}`.
 * 4. Return uppercase hex MD5.
 */
export function generateUniversalSignature(
  params: Record<string, any>,
  secretKey: string,
  keyParamName: string = "key"
): string {
  const sortedKeys = Object.keys(params).sort();
  const pairs: string[] = [];

  for (const k of sortedKeys) {
    if (k === "sign" || k === "signature") continue;
    const v = params[k];
    if (v !== undefined && v !== null && String(v).trim() !== "") {
      pairs.push(`${k}=${v}`);
    }
  }

  const signString =
    pairs.length > 0 ? `${pairs.join("&")}&${keyParamName}=${secretKey}` : `${keyParamName}=${secretKey}`;

  return crypto.createHash("md5").update(signString, "utf8").digest("hex").toUpperCase();
}

/**
 * Verifies incoming webhook/IPN signature against active secret key.
 */
export function verifyUniversalSignature(
  params: Record<string, any>,
  secretKey: string,
  keyParamName: string = "key"
): boolean {
  const incomingSign = params.sign || params.signature;
  if (!incomingSign) return false;
  const calculated = generateUniversalSignature(params, secretKey, keyParamName);
  return calculated.toUpperCase() === String(incomingSign).trim().toUpperCase();
}

/**
 * Universal Multi-Payment Gateway Adapter Engine.
 * Supports LG-Pay, WatchPay, RupayEx, and Custom dynamic API configurations.
 */
export class UniversalGatewayAdapter {
  private config: UniversalGatewayConfig;
  private baseUrl: string;

  constructor(config: Partial<UniversalGatewayConfig>) {
    this.config = {
      channel: config.channel || "LGPAY_STANDARD",
      baseUrl: sanitizeGatewayBaseUrl(config.baseUrl, config.channel),
      appId: config.appId || process.env.LGPAY_MERCHANT_ID || "stake_lgpay_merchant",
      secretKey: config.secretKey || process.env.LGPAY_API_KEY || "lgpay_secret_key_prod_8829",
      tradeType: config.tradeType || "INRUPI",
      amountUnit: config.amountUnit || (config.channel === "RUPAYEX" ? "RUPEES" : "PAISE"),
      notifyUrl: config.notifyUrl,
      returnUrl: config.returnUrl,
      customParams: config.customParams || {},
    };
    this.baseUrl = sanitizeGatewayBaseUrl(this.config.baseUrl, this.config.channel);
  }

  /**
   * Generates order serial, constructs payload, signs, and dispatches to payment gateway.
   */
  public async createOrder(req: UniversalOrderRequest): Promise<UniversalOrderResponse> {
    const order_sn = req.orderSn || `${Date.now()}${Math.floor(100000 + Math.random() * 900000)}`;

    const notify_url =
      req.notifyUrl ||
      this.config.notifyUrl ||
      `${process.env.NEXT_PUBLIC_APP_URL || "https://stake.internal"}/api/payment/webhook`;

    const return_url =
      req.returnUrl ||
      this.config.returnUrl ||
      `${process.env.NEXT_PUBLIC_APP_URL || "https://stake.internal"}/casino/home`;

    // Specialized RupayEx Official Dispatch (Amount in INR, NOT paise, X-Api-Token)
    if (this.config.channel === "RUPAYEX") {
      const rupayExToken = this.config.secretKey || this.config.appId;
      return await createRupayExOrder({
        userToken: rupayExToken,
        amount: req.amount,
        orderId: order_sn,
        redirectUrl: notify_url,
        customerMobile: req.customerMobile,
        customerName: req.customerName,
        customerEmail: req.customerEmail,
        remark1: "stake deposit",
        baseUrl: this.baseUrl,
      });
    }

    // Calculate money based on amount unit (Paise vs normal Rupees)
    const money =
      this.config.amountUnit === "PAISE"
        ? Math.round(req.amount * 100) // 500 INR -> 50000 paise
        : req.amount;

    const ip = req.clientIp || "127.0.0.1";

    const payload: Record<string, any> = {
      app_id: this.config.appId,
      order_sn,
      money,
      trade_type: this.config.tradeType || "INRUPI",
      notify_url,
      return_url,
      remark: "web pay",
      ip,
      ...(this.config.customParams || {}),
    };

    const sign = generateUniversalSignature(payload, this.config.secretKey);
    payload.sign = sign;

    const endpointUrl = `${this.baseUrl}/api/order/create`;
    const formBody = new URLSearchParams();
    for (const [key, value] of Object.entries(payload)) {
      formBody.append(key, String(value));
    }

    try {
      const res = await fetch(endpointUrl, {
        method: "POST",
        headers: {
          "Content-Type": "application/x-www-form-urlencoded",
          Accept: "application/json",
        },
        body: formBody.toString(),
      });

      const resJson = await res.json().catch(() => null);

      if (resJson && (resJson.status === 1 || resJson.status === "1") && resJson.data?.pay_url) {
        return {
          success: true,
          orderId: order_sn,
          payUrl: resJson.data.pay_url,
          paymentUrl: resJson.data.pay_url,
          raw: resJson,
        };
      }

      // Handle alternate response structure (e.g. data.payment_url or direct payUrl)
      const payUrl =
        resJson?.data?.pay_url ||
        resJson?.data?.payment_url ||
        resJson?.data?.url ||
        resJson?.pay_url ||
        resJson?.payUrl;

      if (payUrl) {
        return {
          success: true,
          orderId: order_sn,
          payUrl,
          paymentUrl: payUrl,
          raw: resJson,
        };
      }

      const errMsg =
        resJson?.msg ||
        resJson?.message ||
        `Gateway error (Status: ${resJson?.status ?? res.status} - ${res.statusText})`;

      return {
        success: false,
        orderId: order_sn,
        error: errMsg,
        raw: resJson,
      };
    } catch (err: any) {
      console.error("[UniversalGatewayAdapter createOrder Error]:", err);
      return {
        success: false,
        orderId: order_sn,
        error: err?.message || "Failed to communicate with payment gateway server",
      };
    }
  }
}
