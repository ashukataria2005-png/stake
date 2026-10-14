import crypto from "crypto";

export interface LGPayConfig {
  merchantId: string;
  apiKey: string;
  baseUrl: string;
  webhookSecret: string;
}

export interface CreateOrderRequest {
  orderId: string;
  amount: number;
  userId: string;
  customerName?: string;
  customerEmail?: string;
  customerPhone?: string;
  callbackUrl?: string;
}

export interface CreateOrderResponse {
  success: boolean;
  orderId: string;
  paymentUrl?: string;
  upiIntentUrl?: string;
  qrPayload?: string;
  signature: string;
  error?: string;
}

export interface WebhookPayload {
  orderId: string;
  merchantId: string;
  amount: number;
  currency: string;
  status: "SUCCESS" | "FAILED" | "PENDING";
  utr?: string;
  signature: string;
  timestamp: number;
}

// Generate HMAC SHA256 Signature
export function generateLGPaySignature(payload: Record<string, any>, secret: string): string {
  const sortedKeys = Object.keys(payload).sort();
  const signatureString = sortedKeys
    .filter((k) => k !== "signature")
    .map((k) => `${k}=${payload[k]}`)
    .join("&");

  return crypto.createHmac("sha256", secret).update(signatureString).digest("hex");
}

// Verify incoming Webhook signature
export function verifyLGPayWebhook(payload: WebhookPayload, secret: string): boolean {
  if (!payload || !payload.signature) return false;
  const calculatedSignature = generateLGPaySignature(payload, secret);
  return crypto.timingSafeEqual(
    Buffer.from(calculatedSignature, "utf-8"),
    Buffer.from(payload.signature, "utf-8")
  );
}

// Factory client for LG-Pay Gateway
export class LGPayGateway {
  private config: LGPayConfig;

  constructor(config: LGPayConfig) {
    this.config = config;
  }

  public async createOrder(req: CreateOrderRequest): Promise<CreateOrderResponse> {
    const timestamp = Date.now();
    const payloadToSign = {
      orderId: req.orderId,
      merchantId: this.config.merchantId,
      amount: req.amount.toFixed(2),
      userId: req.userId,
      timestamp,
    };

    const signature = generateLGPaySignature(payloadToSign, this.config.apiKey);

    const upiIntent = `upi://pay?pa=lgpay.${this.config.merchantId}@bank&pn=Stake&am=${req.amount.toFixed(
      2
    )}&cu=INR&tn=${req.orderId}`;

    return {
      success: true,
      orderId: req.orderId,
      paymentUrl: `${this.config.baseUrl}/pay/${req.orderId}?sig=${signature}`,
      upiIntentUrl: upiIntent,
      qrPayload: upiIntent,
      signature,
    };
  }
}
