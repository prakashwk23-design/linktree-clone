"use client";

import { Check, Loader2, Lock, Sparkles } from "lucide-react";
import { useState } from "react";
import { downgradePlanAction } from "@/app/actions";
import { Button, buttonClasses } from "@/components/ui/Button";
import { PLANS, formatINR } from "@/lib/themes";
import type { BillingPeriod, Plan } from "@/lib/types";

const TIER: Record<Plan, number> = { free: 0, starter: 1, pro: 2, premium: 3 };

type CheckoutResult = { error?: { message?: string } } | undefined;
type CashfreeCheckout = {
  checkout: (options: { paymentSessionId: string; redirectTarget: "_self" | "_blank" }) => Promise<CheckoutResult>;
};
type CashfreeFactory = (options: { mode: "sandbox" | "production" }) => CashfreeCheckout;

declare global {
  interface Window {
    Cashfree?: CashfreeFactory;
  }
}

let cashfreeLoader: Promise<CashfreeFactory> | null = null;

function loadCashfree(): Promise<CashfreeFactory> {
  if (typeof window === "undefined") return Promise.reject(new Error("Cashfree checkout runs in the browser."));
  if (window.Cashfree) return Promise.resolve(window.Cashfree);
  if (!cashfreeLoader) {
    cashfreeLoader = new Promise<CashfreeFactory>((resolve, reject) => {
      const script = document.createElement("script");
      script.src = "https://sdk.cashfree.com/js/v3/cashfree.js";
      script.async = true;
      script.onload = () => {
        if (window.Cashfree) resolve(window.Cashfree);
        else reject(new Error("Cashfree checkout is unavailable right now."));
      };
      script.onerror = () => {
        cashfreeLoader = null;
        reject(new Error("Could not load Cashfree checkout. Check your connection and try again."));
      };
      document.body.appendChild(script);
    });
  }
  return cashfreeLoader;
}

export function PlanPicker({
  currentPlan,
  defaultPlan,
  defaultBilling,
}: {
  currentPlan: Plan;
  defaultPlan?: string;
  defaultBilling?: BillingPeriod;
}) {
  const [billing, setBilling] = useState<BillingPeriod>(defaultBilling ?? "annual");
  const [busy, setBusy] = useState<string | null>(null);
  const [error, setError] = useState<string | null>(null);

  async function startCheckout(planId: string) {
    setError(null);
    setBusy(planId);
    try {
      const response = await fetch("/api/cashfree/order", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ plan: planId, billing }),
      });
      const data = (await response.json()) as {
        error?: string;
        demo?: boolean;
        redirect?: string;
        paymentSessionId?: string;
        mode?: "sandbox" | "production";
      };
      if (!response.ok) throw new Error(data.error ?? "Could not start checkout.");
      if (data.demo && data.redirect) {
        window.location.assign(data.redirect);
        return;
      }
      if (!data.paymentSessionId) throw new Error("Cashfree did not return a payment session.");

      const Cashfree = await loadCashfree();
      const checkout = Cashfree({ mode: data.mode ?? "sandbox" });
      const result = await checkout.checkout({ paymentSessionId: data.paymentSessionId, redirectTarget: "_self" });
      if (result?.error) throw new Error(result.error.message ?? "Payment was not completed.");
      setBusy(null);
    } catch (caught) {
      setError(caught instanceof Error ? caught.message : "Could not start checkout.");
      setBusy(null);
    }
  }

  return (
    <div>
      <div className="mt-4 flex flex-wrap items-center justify-between gap-3">
        <p className="inline-flex items-center gap-1.5 text-[10.5px] text-shade/55">
          <Lock className="h-3 w-3" /> Secure checkout by Cashfree · Prices in INR
        </p>
        <div className="inline-flex rounded-full bg-chalk p-1" role="group" aria-label="Billing period">
          {(["monthly", "annual"] as const).map((period) => (
            <button
              key={period}
              type="button"
              onClick={() => setBilling(period)}
              aria-pressed={billing === period}
              className={`rounded-full px-3 py-1 text-[11px] font-semibold capitalize transition ${
                billing === period ? "bg-white text-shade shadow-sm" : "text-shade/60 hover:text-shade"
              }`}
            >
              {period}
              {period === "annual" ? <span className="ml-1 text-[9.5px] font-bold text-forest">−33%</span> : null}
            </button>
          ))}
        </div>
      </div>

      {error ? (
        <p role="alert" className="mt-3 rounded-xl bg-[#c43333]/[0.08] px-3.5 py-2.5 text-[12px] font-medium text-[#a52727]">
          {error}
        </p>
      ) : null}

      <div className="mt-3 grid gap-2 sm:grid-cols-2 xl:grid-cols-4">
        {PLANS.map((plan) => {
          const current = plan.id === currentPlan;
          const requested = plan.id === defaultPlan && !current;
          const price = billing === "annual" ? plan.price : plan.monthly;
          const total = billing === "annual" ? plan.amount : plan.monthlyAmount;
          const higher = TIER[plan.id] > TIER[currentPlan];

          return (
            <div
              key={plan.id}
              className={`flex flex-col rounded-2xl border p-4 ${
                current
                  ? "border-grape bg-grape/[0.04]"
                  : requested
                    ? "border-grape/50 ring-2 ring-grape/15"
                    : "border-shade/10"
              }`}
            >
              <div className="flex items-center justify-between gap-2">
                <h3 className="text-[13px] font-bold text-shade">{plan.name}</h3>
                {current ? (
                  <span className="rounded-full bg-grape px-2 py-0.5 text-[9px] font-bold uppercase tracking-wide text-white">
                    Current
                  </span>
                ) : requested ? (
                  <span className="rounded-full bg-chartreuse px-2 py-0.5 text-[9px] font-bold uppercase tracking-wide text-shade">
                    Selected
                  </span>
                ) : plan.highlight ? (
                  <span className="inline-flex items-center gap-0.5 rounded-full bg-chartreuse px-2 py-0.5 text-[9px] font-bold uppercase tracking-wide text-shade">
                    <Sparkles className="h-2.5 w-2.5" /> Popular
                  </span>
                ) : null}
              </div>
              <p className="mt-2 font-display text-[22px] font-extrabold leading-none text-shade">
                {price}
                <span className="ml-0.5 text-[10px] font-medium text-shade/55">/mo</span>
              </p>
              <p className="mt-1 text-[10px] text-shade/55">
                {plan.id === "free" ? plan.tagline : `${formatINR(total)} billed ${billing === "annual" ? "yearly" : "monthly"}`}
              </p>
              <ul className="mt-3 flex-1 space-y-1">
                {plan.features.slice(0, 3).map((feature) => (
                  <li key={feature} className="flex gap-1.5 text-[10.5px] leading-relaxed text-shade/55">
                    <Check className="mt-0.5 h-2.5 w-2.5 flex-none text-forest" /> {feature}
                  </li>
                ))}
              </ul>

              {current ? (
                <span className="mt-3 inline-flex h-8 items-center justify-center rounded-full bg-chalk text-[10.5px] font-semibold text-shade/60">
                  Your plan
                </span>
              ) : plan.id === "free" ? (
                <form action={downgradePlanAction} className="mt-3">
                  <input type="hidden" name="plan" value="free" />
                  <button type="submit" className={buttonClasses("outline", "sm", "w-full")}>
                    Switch to Free
                  </button>
                </form>
              ) : higher ? (
                <Button
                  type="button"
                  variant={plan.highlight ? "primary" : "outline"}
                  size="sm"
                  className="mt-3 w-full"
                  onClick={() => void startCheckout(plan.id)}
                  disabled={busy !== null}
                >
                  {busy === plan.id ? (
                    <>
                      <Loader2 className="h-3.5 w-3.5 animate-spin" /> Opening checkout…
                    </>
                  ) : (
                    `Upgrade to ${plan.name}`
                  )}
                </Button>
              ) : (
                <span className="mt-3 inline-flex h-8 items-center justify-center rounded-full bg-chalk text-[10.5px] font-semibold text-shade/55">
                  Lower plan
                </span>
              )}
            </div>
          );
        })}
      </div>
    </div>
  );
}
