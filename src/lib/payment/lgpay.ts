import crypto from "crypto";

export interface LGPayConfig {
  appId?: string;
  merchantId?: string;
  secretKey?: string;
  apiKey?: string;
  baseUrl: string;
  notifyUrl?: string;
  returnUrl?: string;
  webhookSecret?: string;
}

export interface LGPayOrderRequest {
  amount: number; // in INR (e.g. 500)
  orderSn?: string;
  userId?: string;
  clientIp?: string;
  customerName?: string;
  customerEmail?: string;
  notifyUrl?: string;
  returnUrl?: string;
}

export interface LGPayOrderResult {
  success: boolean;
  orderId: string;
  payUrl?: string;
  paymentUrl?: string;
  error?: string;
  raw?: any;
}

export interface LGPayWebhookPayload {
  order_sn?: string;
  orderId?: string;
  money?: number | string;
  amount?: number | string;
  status: string | number;
  pay_time?: string | number;
  msg?: string;
  remark?: string;
  sign?: string;
  signature?: string;
  [key: string]: any;
}

/**
 * Computes MD5 signature according to the authentic LG-Pay PHP specification:
 * 1. Sort parameter keys alphabetically.
 * 2. Filter out 'sign', 'signature', and empty/null/undefined values.
 * 3. Concatenate non-empty values as `key1=val1&key2=val2&...&key={SECRET_KEY}`.
 * 4. Return crypto.createHash('md5').update(signString).digest('hex').toUpperCase().
 */
export function generateLGPaySignature(params: Record<string, any>, secretKey: string): string {
  const sortedKeys = Object.keys(params).sort();
  const pairs: string[] = [];

  for (const k of sortedKeys) {
    if (k === "sign" || k === "signature") continue;
    const v = params[k];
    if (v !== undefined && v !== null && String(v).trim() !== "") {
      pairs.push(`${k}=${v}`);
    }
  }

  const signString = pairs.length > 0 ? `${pairs.join("&")}&key=${secretKey}` : `key=${secretKey}`;
  return crypto.createHash("md5").update(signString, "utf8").digest("hex").toUpperCase();
}

/**
 * Verifies incoming IPN signature against the shared secret key.
 */
export function verifyLGPayWebhook(params: Record<string, any>, secretKey: string): boolean {
  const incomingSign = params.sign || params.signature;
  if (!incomingSign) return false;
  const calculated = generateLGPaySignature(params, secretKey);
  return calculated.toUpperCase() === String(incomingSign).trim().toUpperCase();
}

/**
 * Production LG-Pay Gateway client.
 */
export class LGPayGateway {
  private config: LGPayConfig;
  private appId: string;
  private secretKey: string;
  private baseUrl: string;

  constructor(config: LGPayConfig) {
    this.config = config;
    this.appId = config.appId || config.merchantId || process.env.LGPAY_MERCHANT_ID || "stake_lgpay_merchant";
    this.secretKey = config.secretKey || config.apiKey || config.webhookSecret || process.env.LGPAY_API_KEY || "lgpay_secret_key_prod_8829";
    this.baseUrl = (config.baseUrl || process.env.LGPAY_BASE_URL || "https://www.lg-pay.com").replace(/\/+$/, "");
  }

  public async createOrder(req: LGPayOrderRequest): Promise<LGPayOrderResult> {
    const order_sn = req.orderSn || `${Date.now()}${Math.floor(100000 + Math.random() * 900000)}`;
    const money = Math.round(req.amount * 100); // Amount in paise
    const notify_url =
      req.notifyUrl ||
      this.config.notifyUrl ||
      `${process.env.NEXT_PUBLIC_APP_URL || "https://stake.internal"}/api/payment/webhook`;
    const return_url =
      req.returnUrl ||
      this.config.returnUrl ||
      `${process.env.NEXT_PUBLIC_APP_URL || "https://stake.internal"}/casino/home`;
    const ip = req.clientIp || "127.0.0.1";

    const payload: Record<string, any> = {
      app_id: this.appId,
      order_sn,
      money,
      trade_type: "INRUPI",
      notify_url,
      return_url,
      remark: "web pay",
      ip,
    };

    const sign = generateLGPaySignature(payload, this.secretKey);
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

      return {
        success: false,
        orderId: order_sn,
        error: resJson?.msg || resJson?.message || `Gateway returned status code: ${resJson?.status ?? res.status}`,
        raw: resJson,
      };
    } catch (err: any) {
      console.error("[LGPayGateway createOrder Error]:", err);
      return {
        success: false,
        orderId: order_sn,
        error: err?.message || "Communication failure with LG-Pay gateway server",
      };
    }
  }
}
