import "server-only";
import { createHmac, timingSafeEqual } from "node:crypto";

const SANDBOX_BASE = "https://sandbox.cashfree.com";
const PRODUCTION_BASE = "https://api.cashfree.com";
const API_VERSION = "2023-08-01";

export type CashfreeEnv = "sandbox" | "production";

export type CashfreeOrder = {
  cf_order_id: string;
  order_id: string;
  payment_session_id: string;
  order_status: string;
  order_amount: number;
  order_currency: string;
};

export function cashfreeConfig() {
  const appId = (process.env.CASHFREE_APP_ID ?? "").trim();
  const secretKey = (process.env.CASHFREE_SECRET_KEY ?? "").trim();
  const env: CashfreeEnv =
    (process.env.CASHFREE_ENV ?? "sandbox").trim().toLowerCase() === "production" ? "production" : "sandbox";
  return {
    appId,
    secretKey,
    env,
    configured: Boolean(appId && secretKey),
    baseUrl: env === "production" ? PRODUCTION_BASE : SANDBOX_BASE,
  };
}

function headers(): Record<string, string> {
  const { appId, secretKey } = cashfreeConfig();
  return {
    "x-client-id": appId,
    "x-client-secret": secretKey,
    "x-api-version": API_VERSION,
    "Content-Type": "application/json",
  };
}

type CashfreeError = { message?: string; code?: string; type?: string };

async function readJson<T>(response: Response): Promise<(T & CashfreeError) | null> {
  try {
    return (await response.json()) as T & CashfreeError;
  } catch {
    return null;
  }
}

export async function createCashfreeOrder(input: {
  orderId: string;
  amount: number;
  customerId: string;
  customerEmail: string;
  customerName: string;
  note: string;
  returnUrl: string;
  notifyUrl: string;
}): Promise<CashfreeOrder> {
  const { baseUrl } = cashfreeConfig();
  const response = await fetch(`${baseUrl}/pg/orders`, {
    method: "POST",
    headers: headers(),
    cache: "no-store",
    body: JSON.stringify({
      order_id: input.orderId,
      order_amount: input.amount / 100,
      order_currency: "INR",
      customer_details: {
        customer_id: input.customerId,
        customer_email: input.customerEmail,
        customer_name: input.customerName,
      },
      order_meta: {
        return_url: input.returnUrl,
        notify_url: input.notifyUrl,
      },
      order_note: input.note,
    }),
  });

  const data = await readJson<CashfreeOrder>(response);
  if (!response.ok || !data?.payment_session_id) {
    throw new Error(data?.message ?? "Cashfree could not start this payment. Please try again.");
  }
  return data;
}

export async function fetchCashfreeOrder(orderId: string): Promise<CashfreeOrder | null> {
  const { baseUrl } = cashfreeConfig();
  const response = await fetch(`${baseUrl}/pg/orders/${encodeURIComponent(orderId)}`, {
    method: "GET",
    headers: headers(),
    cache: "no-store",
  });
  if (!response.ok) return null;
  return (await readJson<CashfreeOrder>(response)) as CashfreeOrder | null;
}

/**
 * Cashfree signs webhooks with base64(HMAC-SHA256(timestamp + rawBody, secret)).
 * The raw body must be used exactly as received.
 */
export function verifyWebhookSignature(rawBody: string, timestamp: string, signature: string): boolean {
  const { secretKey } = cashfreeConfig();
  if (!secretKey || !timestamp || !signature) return false;

  const expected = createHmac("sha256", secretKey).update(`${timestamp}${rawBody}`).digest("base64");
  const expectedBuffer = Buffer.from(expected);
  const receivedBuffer = Buffer.from(signature);
  if (expectedBuffer.length !== receivedBuffer.length) return false;
  return timingSafeEqual(expectedBuffer, receivedBuffer);
}
