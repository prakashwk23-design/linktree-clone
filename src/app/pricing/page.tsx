import type { Metadata } from "next";
import Link from "next/link";
import { Fragment } from "react";
import { ArrowRight, Check, Minus, Sparkles } from "lucide-react";
import { MarketingFooter } from "@/components/site/MarketingFooter";
import { MarketingHeader } from "@/components/site/MarketingHeader";
import { PricingPlans } from "@/components/site/PricingPlans";
import { ButtonLink } from "@/components/ui/Button";

export const metadata: Metadata = {
  title: "Pricing",
  description:
    "Start free, upgrade when you grow. Compare Linktree Free, Starter, Pro and Premium plans for links, analytics, selling and customization.",
};

const COMPARISON: { group: string; rows: { label: string; values: (string | boolean)[] }[] }[] = [
  {
    group: "Links & content",
    rows: [
      { label: "Unlimited basic links", values: [true, true, true, true] },
      { label: "Featured links", values: ["5", "Unlimited", "Unlimited", "Unlimited"] },
      { label: "Social icons", values: [true, true, true, true] },
      { label: "Collections", values: ["1", "Unlimited", "Unlimited", "Unlimited"] },
      { label: "Embedded video & music", values: [true, true, true, true] },
    ],
  },
  {
    group: "Design",
    rows: [
      { label: "Themes", values: ["10", "10", "10 + custom", "10 + custom"] },
      { label: "Wallpapers & button styles", values: [false, false, true, true] },
      { label: "Custom fonts", values: [false, false, true, true] },
      { label: "Remove Linktree branding", values: [false, false, true, true] },
    ],
  },
  {
    group: "Grow & earn",
    rows: [
      { label: "Profile views & clicks", values: ["7 days", "7 days", "90 days", "All time"] },
      { label: "Traffic sources & locations", values: [false, true, true, true] },
      { label: "Collect emails", values: [true, true, true, true] },
      { label: "Sell products & downloads", values: [false, false, true, true] },
      { label: "Selling fees", values: ["—", "—", "0%", "0%"] },
      { label: "Social planner", values: [false, false, false, true] },
      { label: "AI tools & post ideas", values: [false, false, false, true] },
    ],
  },
  {
    group: "Platform",
    rows: [
      { label: "Custom domain", values: [false, false, true, true] },
      { label: "Link rules & routing", values: [false, false, false, true] },
      { label: "Data export", values: [false, false, false, true] },
      { label: "Priority support", values: [false, false, true, true] },
    ],
  },
];

const FAQS = [
  {
    q: "Can I change plans later?",
    a: "Yes. You can upgrade or downgrade at any time from your account settings. Upgrades take effect immediately and downgrades apply at the end of your billing period.",
  },
  {
    q: "Is there a free plan?",
    a: "Yes. The Free plan is free forever and includes unlimited basic links, social icons and email sign-ups. Upgrade when you need more customization, analytics or selling tools.",
  },
  {
    q: "Do you charge fees on sales?",
    a: "Starter and Free have standard processing fees. Pro and Premium sellers pay 0% platform fees on products, so you keep more of what you earn.",
  },
  {
    q: "What payment methods do you accept?",
    a: "All major credit and debit cards, UPI, net banking and popular wallets. Payments are processed securely by Cashfree. Prices are in INR, annual plans are billed once per year and monthly plans renew each month. Cancel any time.",
  },
  {
    q: "Can I use Linktree for my business?",
    a: "Absolutely. Restaurants, studios, agencies and teams use Linktree for menus, bookings, portfolios and campaigns. Pro and Premium add custom domains and deeper analytics.",
  },
];

function Cell({ value }: { value: string | boolean }) {
  if (value === true) {
    return (
      <span className="inline-grid h-5 w-5 place-items-center rounded-full bg-forest/10 text-forest">
        <Check className="h-3 w-3" />
      </span>
    );
  }
  if (value === false) {
    return <Minus className="h-3.5 w-3.5 text-shade/20" />;
  }
  return <span className="text-[11.5px] font-medium text-shade/60">{value}</span>;
}

export default function PricingPage() {
  return (
    <div className="bg-chalk">
      <MarketingHeader />

      <main>
        <section className="relative overflow-hidden bg-chartreuse">
          <div className="pointer-events-none absolute -left-20 top-10 h-56 w-56 rounded-full bg-white/30 blur-3xl" />
          <div className="pointer-events-none absolute -right-16 bottom-0 h-64 w-64 rounded-full bg-forest/15 blur-3xl" />
          <div className="relative mx-auto w-full max-w-[1240px] px-5 py-16 text-center sm:px-8 lg:py-20">
            <span className="inline-flex items-center gap-2 rounded-full border border-shade/20 bg-white/40 px-3 py-1 text-[11px] font-bold uppercase tracking-[0.14em] text-shade/70">
              <Sparkles className="h-3.5 w-3.5" /> Plans for every stage
            </span>
            <h1 className="mx-auto mt-5 max-w-[760px] font-display text-[46px] font-extrabold leading-[0.94] tracking-[-0.045em] text-shade sm:text-[64px]">
              Start free. Upgrade when you grow.
            </h1>
            <p className="mx-auto mt-5 max-w-[560px] text-[16px] leading-relaxed text-shade/70">
              One link, every plan. Choose the features you need today and move up the moment your audience does.
            </p>
          </div>
        </section>

        <section className="mx-auto w-full max-w-[1240px] px-5 py-14 sm:px-8 lg:py-20">
          <PricingPlans />
        </section>

        <section className="border-y border-shade/10 bg-white">
          <div className="mx-auto w-full max-w-[1240px] px-5 py-16 sm:px-8 lg:py-20">
            <div className="max-w-[640px]">
              <p className="text-[11px] font-bold uppercase tracking-[0.18em] text-grape">Compare</p>
              <h2 className="mt-3 font-display text-[34px] font-extrabold tracking-[-0.035em] text-shade sm:text-[44px]">
                Every feature, side by side.
              </h2>
            </div>

            <div className="mt-8 overflow-x-auto">
              <table className="w-full min-w-[720px] border-collapse text-left">
                <thead>
                  <tr>
                    <th className="w-[36%] pb-4 pr-4 text-[11px] font-bold uppercase tracking-[0.12em] text-shade/55">
                      Feature
                    </th>
                    {["Free", "Starter", "Pro", "Premium"].map((name) => (
                      <th
                        key={name}
                        className={`pb-4 pl-4 text-[12.5px] font-bold ${name === "Pro" ? "text-grape" : "text-shade"}`}
                      >
                        {name}
                        {name === "Pro" ? (
                          <span className="ml-1.5 rounded-full bg-chartreuse px-1.5 py-0.5 text-[8.5px] font-bold uppercase tracking-wide text-shade">
                            Popular
                          </span>
                        ) : null}
                      </th>
                    ))}
                  </tr>
                </thead>
                <tbody>
                  {COMPARISON.map((group) => (
                    <Fragment key={group.group}>
                      <tr>
                        <td colSpan={5} className="border-t border-shade/10 pb-2 pt-5">
                          <span className="text-[10px] font-bold uppercase tracking-[0.16em] text-shade/55">
                            {group.group}
                          </span>
                        </td>
                      </tr>
                      {group.rows.map((row) => (
                        <tr key={row.label} className="border-t border-shade/[0.07]">
                          <td className="py-3 pr-4 text-[12.5px] font-medium text-shade/70">{row.label}</td>
                          {row.values.map((value, index) => (
                            <td key={index} className="py-3 pl-4">
                              <Cell value={value} />
                            </td>
                          ))}
                        </tr>
                      ))}
                    </Fragment>
                  ))}
                </tbody>
              </table>
            </div>
          </div>
        </section>

        <section className="mx-auto w-full max-w-[1240px] px-5 py-16 sm:px-8 lg:py-20">
          <div className="grid gap-10 lg:grid-cols-[0.8fr_1.2fr]">
            <div>
              <p className="text-[11px] font-bold uppercase tracking-[0.18em] text-grape">FAQ</p>
              <h2 className="mt-3 max-w-[380px] font-display text-[34px] font-extrabold leading-[1.02] tracking-[-0.035em] text-shade sm:text-[44px]">
                Questions about plans.
              </h2>
              <ButtonLink href="/register" variant="dark" size="md" className="mt-6">
                Get started free <ArrowRight className="h-3.5 w-3.5" />
              </ButtonLink>
            </div>
            <div className="divide-y divide-shade/10 border-y border-shade/10">
              {FAQS.map((faq) => (
                <details key={faq.q} className="group py-5">
                  <summary className="flex cursor-pointer list-none items-center justify-between gap-6 text-[15px] font-semibold text-shade marker:hidden">
                    {faq.q}
                    <span className="grid h-7 w-7 flex-none place-items-center rounded-full border border-shade/15 transition group-open:rotate-45 group-open:bg-shade group-open:text-white">
                      <span className="text-[14px] leading-none">+</span>
                    </span>
                  </summary>
                  <p className="mt-3 max-w-[620px] pr-10 text-[13.5px] leading-relaxed text-shade/60">{faq.a}</p>
                </details>
              ))}
            </div>
          </div>
        </section>

        <section className="bg-grape text-white">
          <div className="mx-auto flex w-full max-w-[1240px] flex-col items-center px-5 py-16 text-center sm:px-8 lg:py-20">
            <h2 className="max-w-[640px] font-display text-[36px] font-extrabold leading-[1.02] tracking-[-0.04em] sm:text-[52px]">
              Your link is waiting.
            </h2>
            <p className="mt-4 max-w-[440px] text-[15px] leading-relaxed text-white/65">
              Join 70M+ creators and get everything you are behind one simple link.
            </p>
            <div className="mt-8 flex flex-col gap-3 sm:flex-row">
              <ButtonLink href="/register" variant="chartreuse" size="lg">
                Sign up free
              </ButtonLink>
              <ButtonLink href="/discover" variant="white" size="lg">
                Explore Linktrees
              </ButtonLink>
            </div>
            <Link href="/" className="mt-6 text-[12px] text-white/50 underline underline-offset-4 hover:text-white">
              Back to linktr.ee
            </Link>
          </div>
        </section>
      </main>

      <MarketingFooter />
    </div>
  );
}
