"use client";

import { Check, Sparkles } from "lucide-react";
import { useState } from "react";
import { ButtonLink } from "@/components/ui/Button";
import { PLANS, formatINR } from "@/lib/themes";

export function PricingPlans() {
  const [annual, setAnnual] = useState(true);

  return (
    <div>
      <div className="flex items-center justify-center gap-3">
        <span className={`text-[12.5px] font-semibold ${annual ? "text-shade/60" : "text-shade"}`}>Monthly</span>
        <button
          type="button"
          onClick={() => setAnnual((value) => !value)}
          role="switch"
          aria-checked={annual}
          aria-label="Toggle annual billing"
          className={`relative h-7 w-12 rounded-full transition ${annual ? "bg-grape" : "bg-shade/20"}`}
        >
          <span
            className={`absolute top-1 h-5 w-5 rounded-full bg-white shadow transition-all ${
              annual ? "left-6" : "left-1"
            }`}
          />
        </button>
        <span className={`text-[12.5px] font-semibold ${annual ? "text-shade" : "text-shade/60"}`}>
          Annual
          <span className="ml-1.5 rounded-full bg-chartreuse px-2 py-0.5 text-[10px] font-bold uppercase tracking-wide text-shade">
            Save 33%
          </span>
        </span>
      </div>

      <div className="mt-8 grid gap-4 md:grid-cols-2 xl:grid-cols-4">
        {PLANS.map((plan) => {
          const price = annual ? plan.price : plan.monthly;
          return (
            <div
              key={plan.id}
              className={`relative flex flex-col rounded-3xl border p-6 ${
                plan.highlight
                  ? "border-grape bg-grape text-white shadow-xl"
                  : "border-shade/12 bg-white text-shade"
              }`}
            >
              {plan.highlight ? (
                <span className="absolute -top-3 left-6 inline-flex items-center gap-1 rounded-full bg-chartreuse px-2.5 py-1 text-[10px] font-bold uppercase tracking-wider text-shade">
                  <Sparkles className="h-3 w-3" /> Most popular
                </span>
              ) : null}
              <h2 className="font-display text-[19px] font-bold">{plan.name}</h2>
              <div className="mt-3 flex items-baseline gap-1">
                <span className="font-display text-[38px] font-extrabold tracking-tight">{price}</span>
                <span className={`text-[12px] ${plan.highlight ? "text-white/55" : "text-shade/60"}`}>/mo</span>
              </div>
              <p className={`mt-1 text-[11.5px] ${plan.highlight ? "text-white/55" : "text-shade/60"}`}>
                {plan.id === "free" ? plan.tagline : annual ? `Billed ${formatINR(plan.amount)} yearly` : "Billed monthly"}
              </p>
              <ul className="mt-5 flex-1 space-y-2">
                {plan.features.map((feature) => (
                  <li
                    key={feature}
                    className={`flex items-start gap-2 text-[12.5px] leading-relaxed ${
                      plan.highlight ? "text-white/80" : "text-shade/65"
                    }`}
                  >
                    <Check
                      className={`mt-0.5 h-3.5 w-3.5 flex-none ${plan.highlight ? "text-chartreuse" : "text-forest"}`}
                    />
                    {feature}
                  </li>
                ))}
              </ul>
              <ButtonLink
                href={
                  plan.id === "free"
                    ? "/register"
                    : `/admin/account?plan=${plan.id}&billing=${annual ? "annual" : "monthly"}#plans`
                }
                variant={plan.highlight ? "chartreuse" : plan.id === "free" ? "outline" : "dark"}
                size="md"
                className="mt-6 w-full"
              >
                {plan.cta}
              </ButtonLink>
            </div>
          );
        })}
      </div>

      <p className="mt-4 text-center text-[11px] text-shade/55">
        Prices in INR. Annual plans are billed once a year. Cancel anytime. Payments are processed securely by Cashfree.
      </p>
    </div>
  );
}
