import { randomUUID } from "node:crypto";
import { getCurrentUser } from "@/lib/auth";
import { cashfreeConfig, createCashfreeOrder } from "@/lib/cashfree";
import { completePayment, createPayment, setPaymentStatus, updatePaymentOrder } from "@/lib/data";
import { PLANS, planName } from "@/lib/themes";
import type { BillingPeriod } from "@/lib/types";

function requestOrigin(request: Request): string {
  // Prefer the configured public URL so Cashfree return/webhook URLs are stable
  // in production; fall back to the request's forwarded host.
  const configured = (process.env.NEXT_PUBLIC_APP_URL ?? "").trim().replace(/\/$/, "");
  if (configured) return configured;
  const url = new URL(request.url);
  const proto = request.headers.get("x-forwarded-proto")?.split(",")[0]?.trim() || url.protocol.replace(":", "");
  const host = request.headers.get("x-forwarded-host")?.split(",")[0]?.trim() || request.headers.get("host") || url.host;
  return `${proto}://${host}`;
}

export async function POST(request: Request) {
  const user = await getCurrentUser();
  if (!user) return Response.json({ error: "Log in to upgrade your plan." }, { status: 401 });

  let body: { plan?: string; billing?: string };
  try {
    body = (await request.json()) as { plan?: string; billing?: string };
  } catch {
    return Response.json({ error: "Invalid request." }, { status: 400 });
  }

  const plan = PLANS.find((candidate) => candidate.id === body.plan && candidate.id !== "free");
  if (!plan) return Response.json({ error: "Choose a paid plan to upgrade." }, { status: 400 });

  const billing: BillingPeriod = body.billing === "monthly" ? "monthly" : "annual";
  const amount = billing === "annual" ? plan.amount : plan.monthlyAmount;
  if (amount <= 0) return Response.json({ error: "That plan has no charge." }, { status: 400 });

  const { configured, env } = cashfreeConfig();
  const orderId = `lt_${randomUUID().replace(/-/g, "")}`;

  if (!configured) {
    // Keeps the clone demoable without keys. Production never takes this path.
    if (process.env.NODE_ENV !== "production") {
      createPayment({ id: orderId, userId: user.id, plan: plan.id, billing, amount });
      completePayment(orderId, "", "demo");
      return Response.json({
        demo: true,
        redirect: `/admin/account?upgraded=${plan.id}&demo=1`,
      });
    }
    return Response.json(
      {
        error:
          "Payments are not configured yet. Add CASHFREE_APP_ID and CASHFREE_SECRET_KEY to enable Cashfree checkout.",
      },
      { status: 503 },
    );
  }

  createPayment({ id: orderId, userId: user.id, plan: plan.id, billing, amount });

  try {
    const order = await createCashfreeOrder({
      orderId,
      amount,
      customerId: user.id,
      customerEmail: user.email,
      customerName: user.name,
      note: `Linktree ${planName(plan.id)} plan (${billing})`,
      returnUrl: `${requestOrigin(request)}/api/cashfree/return?order_id={order_id}`,
      notifyUrl: `${requestOrigin(request)}/api/cashfree/webhook`,
    });
    updatePaymentOrder(orderId, order.cf_order_id, order.payment_session_id);
    return Response.json({
      orderId,
      paymentSessionId: order.payment_session_id,
      mode: env,
    });
  } catch (error) {
    setPaymentStatus(orderId, "failed");
    return Response.json(
      { error: error instanceof Error ? error.message : "Cashfree could not start this payment." },
      { status: 502 },
    );
  }
}
