import { redirect } from "next/navigation";
import { getCurrentUser } from "@/lib/auth";
import { cashfreeConfig, fetchCashfreeOrder } from "@/lib/cashfree";
import { completePayment, getPaymentById } from "@/lib/data";

/**
 * Cashfree sends the browser back here after checkout. The order is verified
 * against the Cashfree API before any plan is unlocked.
 */
export async function GET(request: Request) {
  const url = new URL(request.url);
  const orderId = url.searchParams.get("order_id") ?? url.searchParams.get("orderId") ?? "";

  const user = await getCurrentUser();
  if (!user) redirect("/login");

  const payment = orderId ? getPaymentById(orderId) : null;
  if (!payment || payment.user_id !== user.id) redirect("/admin/account?payment=unknown");

  if (payment.status === "paid" || payment.status === "demo") {
    redirect(`/admin/account?upgraded=${payment.plan}`);
  }

  if (!cashfreeConfig().configured) redirect("/admin/account?payment=failed");

  const order = await fetchCashfreeOrder(payment.id).catch(() => null);
  if (order?.order_status === "PAID") {
    completePayment(payment.id);
    redirect(`/admin/account?upgraded=${payment.plan}`);
  }

  redirect(`/admin/account?payment=${order?.order_status === "ACTIVE" ? "pending" : "failed"}`);
}
