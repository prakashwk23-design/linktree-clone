import { verifyWebhookSignature } from "@/lib/cashfree";
import { completePayment, setPaymentStatus } from "@/lib/data";

type WebhookPayload = {
  type?: string;
  data?: {
    order?: { order_id?: string };
    payment?: { payment_status?: string; cf_payment_id?: number | string };
  };
};

export async function POST(request: Request) {
  const rawBody = await request.text();
  const signature = request.headers.get("x-webhook-signature") ?? "";
  const timestamp = request.headers.get("x-webhook-timestamp") ?? "";

  if (!verifyWebhookSignature(rawBody, timestamp, signature)) {
    return Response.json({ ok: false, error: "Invalid signature" }, { status: 401 });
  }

  let payload: WebhookPayload;
  try {
    payload = JSON.parse(rawBody) as WebhookPayload;
  } catch {
    return Response.json({ ok: false, error: "Invalid JSON" }, { status: 400 });
  }

  const orderId = payload.data?.order?.order_id ?? "";
  if (!orderId) return Response.json({ ok: true, ignored: true });

  const paymentStatus = payload.data?.payment?.payment_status ?? "";
  const cfPaymentId = payload.data?.payment?.cf_payment_id ? String(payload.data.payment.cf_payment_id) : "";

  if (paymentStatus === "SUCCESS" || payload.type === "PAYMENT_SUCCESS_WEBHOOK") {
    completePayment(orderId, cfPaymentId);
  } else if (paymentStatus === "FAILED" || payload.type === "PAYMENT_FAILED_WEBHOOK") {
    setPaymentStatus(orderId, "failed");
  }

  return Response.json({ ok: true });
}
