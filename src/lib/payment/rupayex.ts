/**
 * RupayEx Payment Gateway Adapter (Official API Specification)
 * Documentation: https://rupayex.net/api
 */

export interface RupayExOrderParams {
  userToken: string;
  amount: number; // Exact INR Rupees (e.g. 500, NOT paise)
  orderId: string;
  redirectUrl: string;
  customerMobile?: string;
  customerName?: string;
  customerEmail?: string;
  remark1?: string;
  baseUrl?: string;
}

export interface RupayExOrderResponse {
  success: boolean;
  orderId: string;
  payUrl?: string;
  paymentUrl?: string;
  error?: string;
  raw?: any;
}

export interface RupayExStatusResponse {
  success: boolean;
  isPaid: boolean;
  status?: string;
  orderId?: string;
  amount?: number;
  utr?: string;
  raw?: any;
  error?: string;
}

/**
 * Sanitizes RupayEx Base URL ensuring clean https://rupayex.net/api format
 */
export function sanitizeRupayExBaseUrl(inputUrl?: string): string {
  if (!inputUrl || typeof inputUrl !== "string" || !inputUrl.trim()) {
    return "https://rupayex.net/api";
  }

  let url = inputUrl.trim().replace(/\/+$/, "");
  url = url.replace(/\/create-order\/?$/i, "");
  url = url.replace(/\/order-status\/?$/i, "");

  if (!/^https?:\/\//i.test(url)) {
    url = `https://${url}`;
  }

  // Ensure trailing /api is present if not already
  if (!/\/api\/?$/i.test(url)) {
    url = `${url}/api`;
  }

  return url.replace(/\/+$/, "");
}

/**
 * Creates an order via official RupayEx POST /create-order endpoint
 */
export async function createRupayExOrder(params: RupayExOrderParams): Promise<RupayExOrderResponse> {
  const baseUrl = sanitizeRupayExBaseUrl(params.baseUrl);
  const endpoint = `${baseUrl}/create-order`;

  const formBody = new URLSearchParams();
  formBody.append("user_token", params.userToken);
  formBody.append("amount", String(params.amount));
  formBody.append("order_id", params.orderId);
  formBody.append("redirect_url", params.redirectUrl);

  if (params.customerMobile) {
    formBody.append("customer_mobile", params.customerMobile);
  }
  formBody.append("remark1", params.remark1 || "stake deposit");

  try {
    const res = await fetch(endpoint, {
      method: "POST",
      headers: {
        "X-Api-Token": params.userToken,
        "Content-Type": "application/x-www-form-urlencoded",
        Accept: "application/json",
      },
      body: formBody.toString(),
    });

    const data = await res.json().catch(() => null);

    // Check for payment redirect URL in various standard RupayEx response keys
    const payUrl =
      data?.payment_url ||
      data?.data?.payment_url ||
      data?.data?.pay_url ||
      data?.pay_url ||
      data?.data?.url ||
      data?.url ||
      data?.data?.payment_link ||
      data?.payment_link ||
      data?.order_url ||
      data?.data?.order_url;

    if (payUrl) {
      return {
        success: true,
        orderId: params.orderId,
        payUrl,
        paymentUrl: payUrl,
        raw: data,
      };
    }

    const errorMsg =
      data?.message ||
      data?.msg ||
      data?.error ||
      `RupayEx API Error (${res.status}: ${res.statusText})`;

    return {
      success: false,
      orderId: params.orderId,
      error: errorMsg,
      raw: data,
    };
  } catch (err: any) {
    console.error("[RupayEx createOrder Error]:", err);
    return {
      success: false,
      orderId: params.orderId,
      error: err?.message || "Failed to reach RupayEx gateway server",
    };
  }
}

/**
 * Verifies order payment status directly with RupayEx GET /order-status endpoint
 */
export async function checkRupayExOrderStatus(
  userToken: string,
  orderId: string,
  baseUrl?: string
): Promise<RupayExStatusResponse> {
  const sanitized = sanitizeRupayExBaseUrl(baseUrl);
  const endpoint = `${sanitized}/order-status?user_token=${encodeURIComponent(userToken)}&order_id=${encodeURIComponent(orderId)}`;

  try {
    const res = await fetch(endpoint, {
      method: "GET",
      headers: {
        "X-Api-Token": userToken,
        Accept: "application/json",
      },
    });

    const data = await res.json().catch(() => null);

    if (!data) {
      return {
        success: false,
        isPaid: false,
        error: `Invalid response from RupayEx status check (${res.status})`,
      };
    }

    // Inspect status flags
    const statusVal = String(
      data.status ?? data.data?.status ?? data.order_status ?? data.data?.order_status ?? ""
    ).toUpperCase();

    const isPaid =
      statusVal === "SUCCESS" ||
      statusVal === "COMPLETED" ||
      statusVal === "PAID" ||
      data.status === true ||
      data.status === 1 ||
      data.data?.status === 1;

    const utr = data.utr || data.data?.utr || data.payment_utr || data.bank_ref_no || undefined;
    const amount = Number(data.amount || data.data?.amount || data.money || 0);

    return {
      success: true,
      isPaid,
      status: statusVal,
      orderId,
      amount: !isNaN(amount) && amount > 0 ? amount : undefined,
      utr,
      raw: data,
    };
  } catch (err: any) {
    console.error("[RupayEx checkOrderStatus Error]:", err);
    return {
      success: false,
      isPaid: false,
      error: err?.message || "Failed to query RupayEx order status",
    };
  }
}
