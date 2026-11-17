export const instant = false;

import Link from "next/link";
import {
  ArrowLeft,
  ArrowUpRight,
  Check,
  CreditCard,
  Download,
  ExternalLink,
  KeyRound,
  Mail,
  ShieldCheck,
  Trash2,
  UserRound,
  Wallet,
} from "lucide-react";
import { DeleteAccountForm, PasswordForm, PersonalForm } from "@/components/admin/AccountForms";
import { disconnectSocialAction } from "@/app/actions";
import { MockButton } from "@/components/admin/MockButton";
import { PlanPicker } from "@/components/admin/PlanPicker";
import { Avatar } from "@/components/ui/Avatar";
import { Switch } from "@/components/ui/Form";
import { requireUser } from "@/lib/auth";
import { getLinkCount, getPayments, getSocialConnections, getViewCount } from "@/lib/data";
import { SOCIAL_PROVIDERS, socialConfigured } from "@/lib/social";
import { PLANS, formatINR, planName } from "@/lib/themes";
import type { BillingPeriod } from "@/lib/types";

export const metadata = { title: "Account" };

function formatDate(iso: string): string {
  return new Date(iso).toLocaleDateString("en-US", {
    month: "short",
    day: "numeric",
    year: "numeric",
    timeZone: "UTC",
  });
}

const SECTIONS = [
  { id: "personal", label: "Personal", icon: UserRound },
  { id: "privacy", label: "Data and privacy", icon: ShieldCheck },
  { id: "security", label: "Account management", icon: KeyRound },
  { id: "billing", label: "Billing", icon: CreditCard },
  { id: "plans", label: "Plans", icon: Wallet },
  { id: "invoices", label: "Invoices", icon: Download },
  { id: "integrations", label: "Integrations", icon: ExternalLink },
  { id: "danger", label: "Delete account", icon: Trash2 },
];

export default async function AccountPage({
  searchParams,
}: {
  searchParams: Promise<{
    upgraded?: string;
    downgraded?: string;
    plan?: string;
    billing?: string;
    payment?: string;
    connected?: string;
    social?: string;
    error?: string;
  }>;
}) {
  const user = await requireUser();
  const params = await searchParams;
  const upgraded = PLANS.find((plan) => plan.id === params.upgraded);
  const downgraded = PLANS.find((plan) => plan.id === params.downgraded);
  const defaultBilling: BillingPeriod | undefined =
    params.billing === "monthly" ? "monthly" : params.billing === "annual" ? "annual" : undefined;
  const links = getLinkCount(user.id);
  const views = getViewCount(user.id, 30);
  const payments = getPayments(user.id);
  const latestPaid = payments.find((payment) => payment.status === "paid" || payment.status === "demo");
  const connections = getSocialConnections(user.id);
  const connectedProvider = params.connected && params.connected in SOCIAL_PROVIDERS ? params.connected : null;
  const socialErrorProvider = params.social && params.social in SOCIAL_PROVIDERS ? params.social : null;

  return (
    <div className="space-y-5">
      <header className="flex flex-col gap-3 sm:flex-row sm:items-end sm:justify-between">
        <div>
          <Link href="/admin" className="inline-flex items-center gap-1.5 text-[11.5px] font-semibold text-shade/60 hover:text-shade">
            <ArrowLeft className="h-3 w-3" /> Back to app
          </Link>
          <h1 className="mt-2 font-display text-[28px] font-extrabold tracking-[-0.03em] text-shade sm:text-[32px]">
            Account
          </h1>
          <p className="mt-1 text-[12.5px] text-shade/60">Manage your details, security, plan and data.</p>
        </div>
        <Link
          href={`/${user.username}`}
          target="_blank"
          className="inline-flex items-center gap-1.5 self-start rounded-full border border-shade/15 bg-white px-3.5 py-2 text-[12px] font-semibold text-shade/70 transition hover:border-shade/30 hover:text-shade"
        >
          View my page <ArrowUpRight className="h-3.5 w-3.5" />
        </Link>
      </header>

      {upgraded ? (
        <div className="flex items-center gap-2 rounded-2xl border border-forest/20 bg-forest/[0.06] px-4 py-3 text-[12.5px] font-medium text-forest">
          <Check className="h-4 w-4" /> You&apos;re now on the {upgraded.name} plan. Your new features are unlocked.
        </div>
      ) : null}

      {downgraded ? (
        <div className="flex items-center gap-2 rounded-2xl border border-shade/15 bg-white px-4 py-3 text-[12.5px] font-medium text-shade/70">
          <Check className="h-4 w-4" /> You&apos;re now on the Free plan.
        </div>
      ) : null}

      {params.payment ? (
        <div className="flex items-start gap-2 rounded-2xl border border-[#b7791f]/25 bg-[#b7791f]/[0.07] px-4 py-3 text-[12.5px] font-medium text-[#8a5a12]">
          <CreditCard className="mt-0.5 h-4 w-4 flex-none" />
          <span>
            {params.payment === "pending"
              ? "Your payment is still being confirmed. This usually takes a few seconds — refresh this page in a minute."
              : "We couldn't confirm that payment, so your plan was not changed. If money left your account, contact support with your Cashfree order ID."}
          </span>
        </div>
      ) : null}

      <div className="grid gap-5 lg:grid-cols-[220px_minmax(0,1fr)]">
        <aside className="hidden lg:block">
          <nav className="sticky top-24 space-y-0.5 rounded-2xl border border-shade/10 bg-white p-2" aria-label="Account sections">
            {SECTIONS.map(({ id, label, icon: Icon }) => (
              <a
                key={id}
                href={`#${id}`}
                className="flex items-center gap-2.5 rounded-xl px-2.5 py-2 text-[12px] font-medium text-shade/55 transition hover:bg-chalk hover:text-shade"
              >
                <Icon className="h-3.5 w-3.5 text-shade/55" /> {label}
              </a>
            ))}
          </nav>
        </aside>

        <div className="space-y-4">
          <section id="personal" className="scroll-mt-24 rounded-3xl border border-shade/10 bg-white p-5 sm:p-6">
            <div className="flex flex-col gap-4 sm:flex-row sm:items-center sm:justify-between">
              <div className="flex items-center gap-3">
                <Avatar name={user.name} src={user.avatar || undefined} size={52} />
                <div>
                  <h2 className="font-display text-[18px] font-bold text-shade">Personal</h2>
                  <p className="text-[11.5px] text-shade/60">Manage your personal details and account information.</p>
                </div>
              </div>
              <span className="inline-flex self-start rounded-full bg-grape/10 px-2.5 py-1 text-[10px] font-bold uppercase tracking-wide text-grape">
                {planName(user.plan)}
              </span>
            </div>
            <div className="mt-5">
              <PersonalForm name={user.name} email={user.email} />
            </div>
            <div className="mt-5 grid gap-3 border-t border-shade/10 pt-4 sm:grid-cols-3">
              {[
                { label: "Username", value: `@${user.username}` },
                { label: "Links", value: links.toLocaleString() },
                { label: "Views (30d)", value: views.toLocaleString() },
              ].map((item) => (
                <div key={item.label} className="rounded-xl bg-chalk/60 px-3 py-2.5">
                  <p className="text-[9.5px] font-bold uppercase tracking-[0.1em] text-shade/55">{item.label}</p>
                  <p className="mt-1 truncate text-[12.5px] font-semibold text-shade">{item.value}</p>
                </div>
              ))}
            </div>
          </section>

          <section id="privacy" className="scroll-mt-24 rounded-3xl border border-shade/10 bg-white p-5 sm:p-6">
            <h2 className="font-display text-[18px] font-bold text-shade">Data and privacy</h2>
            <p className="mt-1 text-[11.5px] text-shade/60">Control your data and how your page appears.</p>

            <div className="mt-4 space-y-2">
              {[
                { label: "Export analytics", description: "Download views and clicks as a CSV.", href: "/api/analytics/export?range=30" },
                { label: "Export contacts", description: "Download your audience list as a CSV.", href: "/api/analytics/export?type=contacts" },
              ].map((item) => (
                <div key={item.label} className="flex flex-col gap-2 rounded-xl border border-shade/10 px-3.5 py-3 sm:flex-row sm:items-center sm:justify-between">
                  <div>
                    <p className="text-[12.5px] font-semibold text-shade">{item.label}</p>
                    <p className="text-[11px] text-shade/60">{item.description}</p>
                  </div>
                  <a
                    href={item.href}
                    className="inline-flex items-center gap-1.5 self-start rounded-full bg-chalk px-2.5 py-1.5 text-[10.5px] font-semibold text-shade/60 transition hover:bg-shade hover:text-white"
                  >
                    <Download className="h-3 w-3" /> Download
                  </a>
                </div>
              ))}
              <div className="flex items-center justify-between gap-3 rounded-xl border border-shade/10 px-3.5 py-3">
                <div>
                  <p className="text-[12.5px] font-semibold text-shade">Personalized recommendations</p>
                  <p className="text-[11px] text-shade/60">Use your activity to suggest links and designs.</p>
                </div>
                <Switch name="recommendations" label="" defaultChecked />
              </div>
              <div className="flex items-center justify-between gap-3 rounded-xl border border-shade/10 px-3.5 py-3">
                <div>
                  <p className="text-[12.5px] font-semibold text-shade">Search engine visibility</p>
                  <p className="text-[11px] text-shade/60">Let search engines index your public page.</p>
                </div>
                <Switch name="searchable" label="" defaultChecked />
              </div>
            </div>
            <p className="mt-3 text-[10.5px] text-shade/50">Preferences in this demo are visual only.</p>
          </section>

          <section id="security" className="scroll-mt-24 rounded-3xl border border-shade/10 bg-white p-5 sm:p-6">
            <h2 className="font-display text-[18px] font-bold text-shade">Account management</h2>
            <p className="mt-1 text-[11.5px] text-shade/60">Keep your account secure.</p>

            <div className="mt-5">
              <h3 className="text-[12.5px] font-bold text-shade">Password</h3>
              <p className="mt-0.5 text-[11px] text-shade/60">Use at least 8 characters you don&apos;t use anywhere else.</p>
              <div className="mt-3">
                <PasswordForm />
              </div>
            </div>

            <div className="mt-6 flex flex-col gap-3 rounded-xl border border-shade/10 px-3.5 py-3 sm:flex-row sm:items-center sm:justify-between">
              <div>
                <p className="text-[12.5px] font-semibold text-shade">Multi-factor authentication (MFA)</p>
                <p className="text-[11px] text-shade/60">Add an extra layer of security with a text message code.</p>
              </div>
              <MockButton
                title="Multi-factor authentication"
                message="MFA is mocked in this clone. A production build would send a verification code by SMS or an authenticator app and require it at login."
              >
                <ShieldCheck className="h-3.5 w-3.5" /> Enable
              </MockButton>
            </div>

            <div className="mt-2 flex flex-col gap-3 rounded-xl border border-shade/10 px-3.5 py-3 sm:flex-row sm:items-center sm:justify-between">
              <div>
                <p className="text-[12.5px] font-semibold text-shade">Login email</p>
                <p className="text-[11px] text-shade/60">{user.email}</p>
              </div>
              <span className="inline-flex items-center gap-1 self-start rounded-full bg-forest/10 px-2.5 py-1 text-[10px] font-bold text-forest">
                <Check className="h-3 w-3" /> Verified
              </span>
            </div>
          </section>

          <section id="plans" className="scroll-mt-24 rounded-3xl border border-shade/10 bg-white p-5 sm:p-6">
            <div className="flex flex-wrap items-center justify-between gap-2">
              <div>
                <h2 className="font-display text-[18px] font-bold text-shade">Plans</h2>
                <p className="mt-1 text-[11.5px] text-shade/60">
                  You&apos;re on <span className="font-semibold text-shade">{planName(user.plan)}</span>. Upgrade any time.
                </p>
              </div>
              <Link href="/pricing" className="text-[11.5px] font-semibold text-grape hover:underline">
                Compare plans
              </Link>
            </div>

            <PlanPicker currentPlan={user.plan} defaultPlan={params.plan} defaultBilling={defaultBilling} />
          </section>

          <section id="billing" className="scroll-mt-24 rounded-3xl border border-shade/10 bg-white p-5 sm:p-6">
            <h2 className="font-display text-[18px] font-bold text-shade">Billing</h2>
            <p className="mt-1 text-[11.5px] text-shade/60">Payment method and billing details.</p>
            <div className="mt-4 flex flex-col gap-3 rounded-xl border border-shade/10 px-3.5 py-3 sm:flex-row sm:items-center sm:justify-between">
              <div className="flex items-center gap-3">
                <span className="grid h-10 w-10 place-items-center rounded-full bg-grape/10 text-grape">
                  <CreditCard className="h-4 w-4" />
                </span>
                <div>
                  {latestPaid ? (
                    <>
                      <p className="text-[12.5px] font-semibold text-shade">
                        {planName(latestPaid.plan)} plan · {formatINR(latestPaid.amount)}
                      </p>
                      <p className="text-[11px] text-shade/60">
                        {latestPaid.billing === "annual" ? "Billed yearly" : "Billed monthly"} · paid with Cashfree on{" "}
                        {formatDate(latestPaid.created_at)}
                      </p>
                    </>
                  ) : (
                    <>
                      <p className="text-[12.5px] font-semibold text-shade">No payment method</p>
                      <p className="text-[11px] text-shade/60">
                        Pick a plan to pay securely with Cashfree. We never store card details.
                      </p>
                    </>
                  )}
                </div>
              </div>
              <a
                href="#plans"
                className="inline-flex items-center gap-1.5 self-start rounded-full bg-chalk px-3 py-1.5 text-[11px] font-semibold text-shade/70 transition hover:bg-shade hover:text-white"
              >
                <CreditCard className="h-3.5 w-3.5" /> {latestPaid ? "Change plan" : "Choose a plan"}
              </a>
            </div>
            <p className="mt-3 text-[10.5px] text-shade/50">
              Payments are processed by Cashfree. Card, UPI, net banking and wallet details are handled on Cashfree&apos;s
              secure checkout.
            </p>
          </section>

          <section id="invoices" className="scroll-mt-24 rounded-3xl border border-shade/10 bg-white p-5 sm:p-6">
            <h2 className="font-display text-[18px] font-bold text-shade">Invoices</h2>
            <p className="mt-1 text-[11.5px] text-shade/60">Your billing history.</p>
            {payments.length === 0 ? (
              <p className="mt-4 rounded-xl border border-dashed border-shade/20 px-4 py-8 text-center text-[11.5px] text-shade/60">
                No invoices yet. Your first payment will appear here.
              </p>
            ) : (
              <div className="mt-4 rounded-xl border border-shade/10">
                {payments.map((payment, index) => (
                  <div
                    key={payment.id}
                    className={`flex items-center gap-3 px-3.5 py-3 text-[11.5px] ${index > 0 ? "border-t border-shade/10" : ""}`}
                  >
                    <span className="w-24 text-shade/60">{formatDate(payment.created_at)}</span>
                    <span className="flex-1 font-semibold text-shade">{planName(payment.plan)} plan</span>
                    <span
                      className={`inline-flex rounded-full px-2 py-0.5 text-[9.5px] font-bold ${
                        payment.status === "paid" || payment.status === "demo"
                          ? "bg-forest/10 text-forest"
                          : payment.status === "pending"
                            ? "bg-[#b7791f]/10 text-[#8a5a12]"
                            : "bg-[#c43333]/10 text-[#a52727]"
                      }`}
                    >
                      {payment.status === "paid" ? "Paid" : payment.status === "demo" ? "Demo" : payment.status}
                    </span>
                    <span className="w-16 text-right font-semibold text-shade">{formatINR(payment.amount)}</span>
                  </div>
                ))}
              </div>
            )}
          </section>

          <section id="integrations" className="scroll-mt-24 rounded-3xl border border-shade/10 bg-white p-5 sm:p-6">
            <h2 className="font-display text-[18px] font-bold text-shade">Integrations</h2>
            <p className="mt-1 text-[11.5px] text-shade/60">Connect the tools you already use.</p>

            {connectedProvider ? (
              <div className="mt-4 flex items-center gap-2 rounded-2xl border border-forest/20 bg-forest/[0.06] px-4 py-3 text-[12.5px] font-medium text-forest">
                <Check className="h-4 w-4" /> {SOCIAL_PROVIDERS[connectedProvider as keyof typeof SOCIAL_PROVIDERS].label}{" "}
                connected.
              </div>
            ) : null}

            {socialErrorProvider ? (
              <div className="mt-4 rounded-2xl border border-[#b7791f]/25 bg-[#b7791f]/[0.07] px-4 py-3 text-[12px] leading-relaxed text-[#8a5a12]">
                {params.error === "not_configured" ? (
                  <>
                    {SOCIAL_PROVIDERS[socialErrorProvider as keyof typeof SOCIAL_PROVIDERS].label} isn&apos;t configured
                    yet. Add{" "}
                    <code className="rounded bg-white/60 px-1">
                      {SOCIAL_PROVIDERS[socialErrorProvider as keyof typeof SOCIAL_PROVIDERS].env.join(" and ")}
                    </code>{" "}
                    to your <code className="rounded bg-white/60 px-1">.env</code> file, then try again.
                  </>
                ) : (
                  <>
                    We couldn&apos;t connect {SOCIAL_PROVIDERS[socialErrorProvider as keyof typeof SOCIAL_PROVIDERS].label}.
                    Please try again.
                  </>
                )}
              </div>
            ) : null}

            <div className="mt-4 grid gap-2 sm:grid-cols-2">
              {(Object.keys(SOCIAL_PROVIDERS) as (keyof typeof SOCIAL_PROVIDERS)[]).map((provider) => {
                const def = SOCIAL_PROVIDERS[provider];
                const connection = connections.find((item) => item.provider === provider);
                const configured = socialConfigured(provider);
                return (
                  <div key={provider} className="flex items-center justify-between gap-2 rounded-xl border border-shade/10 px-3 py-2.5">
                    <div className="min-w-0">
                      <p className="text-[12px] font-semibold text-shade">{def.label}</p>
                      <p className="truncate text-[10.5px] text-shade/60">
                        {connection ? `Connected as ${connection.account_name}` : configured ? "Ready to connect" : "Setup required"}
                      </p>
                    </div>
                    {connection ? (
                      <form action={disconnectSocialAction}>
                        <input type="hidden" name="provider" value={provider} />
                        <button
                          type="submit"
                          className="rounded-full border border-shade/20 px-3 py-1.5 text-[11px] font-semibold text-shade/60 transition hover:border-[#c43333]/40 hover:text-[#a52727]"
                        >
                          Disconnect
                        </button>
                      </form>
                    ) : (
                      <a
                        href={`/api/social/${provider}/connect`}
                        className="inline-flex flex-none items-center rounded-full border border-shade/20 px-3 py-1.5 text-[11px] font-semibold text-shade/70 transition hover:border-shade/45 hover:bg-shade/[0.04]"
                      >
                        Connect
                      </a>
                    )}
                  </div>
                );
              })}
            </div>
            <p className="mt-3 text-[10.5px] text-shade/50">
              OAuth runs through each provider&apos;s official flow. Access tokens are stored server-side only. Add the
              matching client ID/secret to <code className="rounded bg-chalk px-1">.env</code> to enable a provider.
            </p>
          </section>

          <section id="danger" className="scroll-mt-24 rounded-3xl border border-[#c43333]/20 bg-white p-5 sm:p-6">
            <h2 className="flex items-center gap-2 font-display text-[18px] font-bold text-shade">
              <Trash2 className="h-4 w-4 text-[#c43333]" /> Delete account
            </h2>
            <p className="mt-1 max-w-[560px] text-[11.5px] leading-relaxed text-shade/60">
              Permanently remove your Linktree, links, contacts and analytics. This action cannot be undone.
            </p>
            <div className="mt-3">
              <DeleteAccountForm />
            </div>
          </section>

          <div className="flex flex-wrap items-center justify-between gap-2 rounded-2xl bg-white px-4 py-3 text-[11px] text-shade/55">
            <span className="inline-flex items-center gap-1.5">
              <Mail className="h-3.5 w-3.5" /> Need help? Contact support.
            </span>
            <Link href="/" className="font-semibold text-grape hover:underline">
              Visit help center
            </Link>
          </div>
        </div>
      </div>
    </div>
  );
}
