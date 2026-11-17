export const instant = false;

import Link from "next/link";
import {
  ArrowRight,
  ArrowUpRight,
  CheckCircle2,
  Circle,
  ExternalLink,
  Link2,
  MousePointerClick,
  Plus,
  QrCode,
  Sparkles,
  TrendingUp,
  Users,
} from "lucide-react";
import { CopyButton } from "@/components/admin/CopyButton";
import { BarChart } from "@/components/admin/BarChart";
import { Avatar } from "@/components/ui/Avatar";
import { ButtonLink } from "@/components/ui/Button";
import { PlatformBadge } from "@/components/ui/PlatformIcon";
import { requireUser } from "@/lib/auth";
import {
  getAnalytics,
  getLinks,
  getReferrers,
  getSetupProgress,
  getTopLinks,
} from "@/lib/data";
import { planName } from "@/lib/themes";

export const metadata = { title: "Admin" };

function greeting() {
  const hour = new Date().getHours();
  if (hour < 12) return "Good morning";
  if (hour < 18) return "Good afternoon";
  return "Good evening";
}

function referrerLabel(value: string) {
  if (value === "direct") return "Direct";
  return value.replace(/^www\./, "").replace(/\.com$/, "").replace(/^\w/, (char) => char.toUpperCase());
}

export default async function DashboardPage() {
  const user = await requireUser();
  const analytics = getAnalytics(user.id, 7);
  const links = getLinks(user.id);
  const topLinks = getTopLinks(user.id, 7).filter((link) => link.clicks > 0);
  const referrers = getReferrers(user.id, 7);
  const setup = getSetupProgress(user);
  const totalRef = referrers.reduce((sum, row) => sum + row.count, 0);
  const delta =
    analytics.prevViews > 0
      ? Math.round(((analytics.views - analytics.prevViews) / analytics.prevViews) * 100)
      : analytics.views > 0
        ? 100
        : 0;

  return (
    <div className="space-y-5">
      <header className="flex flex-col gap-3 sm:flex-row sm:items-end sm:justify-between">
        <div>
          <p className="text-[11px] font-bold uppercase tracking-[0.16em] text-shade/60">My Linktree</p>
          <h1 className="mt-1 font-display text-[28px] font-extrabold tracking-[-0.03em] text-shade sm:text-[32px]">
            {greeting()}, {user.username}
          </h1>
          <Link
            href={`/${user.username}`}
            target="_blank"
            className="mt-1 inline-flex items-center gap-1.5 text-[12.5px] font-medium text-shade/60 transition hover:text-shade"
          >
            linktr.ee/{user.username} <ExternalLink className="h-3 w-3" />
          </Link>
        </div>
        <div className="flex gap-2">
          <ButtonLink href={`/${user.username}`} external variant="outline" size="sm">
            View page
          </ButtonLink>
          <ButtonLink href="/admin/links" variant="primary" size="sm">
            <Plus className="h-3.5 w-3.5" /> Add link
          </ButtonLink>
        </div>
      </header>

      <div className="grid gap-5 lg:grid-cols-[1.6fr_1fr]">
        <div className="space-y-5">
          {/* Profile */}
          <section className="overflow-hidden rounded-3xl border border-shade/10 bg-white">
            <div className="relative h-[92px] overflow-hidden bg-chartreuse">
              <div className="absolute -right-6 -top-10 h-36 w-36 rounded-full bg-white/40 blur-2xl" />
              <div className="absolute left-10 top-4 h-20 w-20 rounded-full border border-shade/10" />
              <div className="absolute right-24 top-2 h-10 w-10 rotate-12 rounded-xl bg-forest/15" />
              <Sparkles className="absolute right-8 top-5 h-6 w-6 text-shade/60" />
            </div>
            <div className="px-5 pb-5 sm:px-6">
              <div className="-mt-8 flex items-end justify-between gap-3">
                <Avatar name={user.name} src={user.avatar || undefined} size={72} ring="#ffffff" />
                <span className="mb-1 rounded-full bg-grape/10 px-2.5 py-1 text-[10.5px] font-bold uppercase tracking-wide text-grape">
                  {planName(user.plan)}
                </span>
              </div>
              <div className="mt-2 flex flex-col gap-3 sm:flex-row sm:items-center sm:justify-between">
                <div>
                  <h2 className="font-display text-[20px] font-bold tracking-tight text-shade">{user.name}</h2>
                  <div className="mt-1 flex items-center gap-1">
                    <span className="text-[12.5px] text-shade/60">linktr.ee/{user.username}</span>
                    <CopyButton value={`/${user.username}`} label="" />
                    <a
                      href={`/api/qr?username=${encodeURIComponent(user.username)}`}
                      target="_blank"
                      rel="noreferrer"
                      className="rounded-full p-1.5 text-shade/60 transition hover:bg-chalk hover:text-shade"
                      aria-label="Open QR code"
                    >
                      <QrCode className="h-3.5 w-3.5" />
                    </a>
                  </div>
                </div>
                <ButtonLink href="/admin/links" variant="dark" size="sm">
                  Edit
                </ButtonLink>
              </div>

              {user.bio ? <p className="mt-3 max-w-[520px] text-[13px] leading-relaxed text-shade/55">{user.bio}</p> : null}

              <div className="mt-5 grid grid-cols-3 gap-2 border-t border-shade/10 pt-4">
                {[
                  { label: "Links", value: links.length, icon: Link2 },
                  { label: "Views", value: analytics.views, icon: Users },
                  { label: "Clicks", value: analytics.clicks, icon: MousePointerClick },
                ].map(({ label, value, icon: Icon }) => (
                  <div key={label} className="rounded-2xl bg-chalk/70 px-3 py-2.5">
                    <span className="flex items-center gap-1 text-[10px] font-semibold uppercase tracking-[0.1em] text-shade/60">
                      <Icon className="h-3 w-3" /> {label}
                    </span>
                    <span className="tabular mt-1 block font-display text-[20px] font-extrabold leading-none text-shade">
                      {value.toLocaleString()}
                    </span>
                  </div>
                ))}
              </div>
            </div>
          </section>

          {/* Visitors */}
          <section className="rounded-3xl border border-shade/10 bg-white p-5 sm:p-6">
            <div className="flex flex-wrap items-start justify-between gap-3">
              <div>
                <h2 className="text-[14px] font-bold text-shade">Linktree visitors</h2>
                <p className="text-[11.5px] text-shade/60">Last 7 days</p>
              </div>
              <span className="inline-flex items-center gap-1 rounded-full bg-forest/10 px-2.5 py-1 text-[11px] font-bold text-forest">
                <TrendingUp className="h-3 w-3" /> {delta >= 0 ? "+" : ""}
                {delta}%
              </span>
            </div>

            <div className="mt-5 flex items-end gap-2">
              <span className="tabular font-display text-[38px] font-extrabold leading-none tracking-tight text-shade">
                {analytics.views.toLocaleString()}
              </span>
              <span className="mb-1 text-[11.5px] text-shade/60">profile views</span>
            </div>

            <div className="mt-5">
              <BarChart points={analytics.points} height={150} compact />
            </div>

            <div className="mt-4 flex items-center gap-2 rounded-xl bg-chalk/70 px-3 py-2.5 text-[11.5px] leading-relaxed text-shade/55">
              <span className="text-base">🇮🇳</span>
              <span>
                {referrers[0]
                  ? `${Math.round(((referrers[0]?.count ?? 0) / Math.max(totalRef, 1)) * 100)}% of your visitors are coming from ${referrerLabel(referrers[0].referrer)}, mostly from India.`
                  : "Share your link to start seeing where your visitors come from."}
              </span>
            </div>
          </section>

          {/* Top links */}
          <section className="rounded-3xl border border-shade/10 bg-white p-5 sm:p-6">
            <div className="flex items-center justify-between">
              <div>
                <h2 className="text-[14px] font-bold text-shade">Your top links</h2>
                <p className="text-[11.5px] text-shade/60">Most tapped in the last 7 days</p>
              </div>
              <Link href="/admin/insights" className="inline-flex items-center gap-1 text-[11.5px] font-semibold text-grape">
                Insights <ArrowUpRight className="h-3 w-3" />
              </Link>
            </div>

            {topLinks.length === 0 ? (
              <div className="mt-5 rounded-2xl border border-dashed border-shade/15 px-4 py-8 text-center">
                <p className="text-[13px] font-semibold text-shade">No link clicks yet</p>
                <p className="mt-1 text-[12px] text-shade/60">Add a link and share your page to see what works.</p>
                <ButtonLink href="/admin/links" variant="chartreuse" size="sm" className="mt-4">
                  Add your first link
                </ButtonLink>
              </div>
            ) : (
              <ul className="mt-4 space-y-2">
                {topLinks.slice(0, 4).map((link, index) => {
                  const max = topLinks[0]?.clicks || 1;
                  return (
                    <li key={link.id} className="flex items-center gap-3 rounded-xl bg-chalk/60 px-3 py-2.5">
                      <span className="grid h-7 w-7 flex-none place-items-center rounded-full bg-white text-[11px] font-bold text-shade/50">
                        {index + 1}
                      </span>
                      <span className="min-w-0 flex-1">
                        <span className="block truncate text-[12.5px] font-semibold text-shade">{link.title}</span>
                        <span className="mt-1 block h-1 w-full overflow-hidden rounded-full bg-shade/10">
                          <span
                            className="block h-full rounded-full bg-grape"
                            style={{ width: `${Math.round((link.clicks / max) * 100)}%` }}
                          />
                        </span>
                      </span>
                      <span className="tabular flex-none text-[11.5px] font-bold text-shade/60">{link.clicks}</span>
                    </li>
                  );
                })}
              </ul>
            )}
          </section>
        </div>

        <div className="space-y-5">
          {/* Setup */}
          <section className="rounded-3xl border border-shade/10 bg-white p-5">
            <div className="flex items-start justify-between gap-2">
              <div>
                <h2 className="text-[14px] font-bold text-shade">Your setup checklist</h2>
                <p className="text-[11.5px] text-shade/60">
                  {setup.done} of {setup.total} complete
                </p>
              </div>
              <span className="grid h-10 w-10 place-items-center rounded-full border-2 border-chartreuse text-[10px] font-extrabold text-shade">
                {Math.round((setup.done / setup.total) * 100)}%
              </span>
            </div>
            <div className="mt-3 h-1.5 overflow-hidden rounded-full bg-shade/10">
              <div
                className="h-full rounded-full bg-forest transition-all"
                style={{ width: `${(setup.done / setup.total) * 100}%` }}
              />
            </div>
            <ul className="mt-4 space-y-1.5">
              {setup.steps.map((step) => (
                <li key={step.label}>
                  <Link
                    href={step.href}
                    className="flex items-center gap-2.5 rounded-lg px-1 py-1.5 text-[12px] transition hover:bg-chalk"
                  >
                    {step.done ? (
                      <CheckCircle2 className="h-4 w-4 flex-none text-forest" />
                    ) : (
                      <Circle className="h-4 w-4 flex-none text-shade/20" />
                    )}
                    <span className={step.done ? "text-shade/60 line-through" : "font-medium text-shade"}>{step.label}</span>
                  </Link>
                </li>
              ))}
            </ul>
          </section>

          {/* Referrers */}
          <section className="rounded-3xl border border-shade/10 bg-white p-5">
            <h2 className="text-[14px] font-bold text-shade">Which source drives more traffic?</h2>
            <p className="text-[11.5px] text-shade/60">Last 7 days</p>
            <div className="mt-4 space-y-3">
              {referrers.slice(0, 5).map((row) => {
                const pct = Math.round((row.count / Math.max(totalRef, 1)) * 100);
                return (
                  <div key={row.referrer}>
                    <div className="flex items-center justify-between text-[11.5px]">
                      <span className="font-medium text-shade/70">{referrerLabel(row.referrer)}</span>
                      <span className="tabular text-shade/60">{pct}%</span>
                    </div>
                    <div className="mt-1 h-1.5 overflow-hidden rounded-full bg-chalk">
                      <div className="h-full rounded-full bg-cobalt" style={{ width: `${Math.max(pct, 2)}%` }} />
                    </div>
                  </div>
                );
              })}
              {referrers.length === 0 ? <p className="text-[12px] text-shade/60">No traffic yet.</p> : null}
            </div>
          </section>

          {/* Followers */}
          <section className="rounded-3xl border border-shade/10 bg-white p-5">
            <h2 className="text-[14px] font-bold text-shade">Social follower growth</h2>
            <p className="text-[11.5px] text-shade/60">Last 7 days</p>
            <div className="mt-4 space-y-2">
              {[
                { label: "Instagram", platform: "instagram" },
                { label: "TikTok", platform: "tiktok" },
                { label: "YouTube", platform: "youtube" },
              ].map(({ label, platform }) => (
                <div key={label} className="flex items-center gap-2.5 rounded-xl border border-shade/10 px-3 py-2.5">
                  <PlatformBadge platform={platform} size={20} className="flex-none" />
                  <span className="flex-1 text-[12px] font-semibold text-shade">{label}</span>
                  <Link
                    href="/admin/account"
                    className="rounded-full bg-chalk px-2.5 py-1 text-[10.5px] font-bold text-shade/60 transition hover:bg-shade hover:text-white"
                  >
                    Connect
                  </Link>
                </div>
              ))}
            </div>
            <p className="mt-3 text-[10.5px] leading-relaxed text-shade/55">
              Follower growth isn&apos;t available for your connected platforms yet.
            </p>
          </section>

          {/* AI promo */}
          <section className="rounded-3xl bg-grape p-5 text-white">
            <span className="inline-flex items-center gap-1.5 rounded-full bg-white/15 px-2.5 py-1 text-[10px] font-bold uppercase tracking-wide">
              <Sparkles className="h-3 w-3 text-chartreuse" /> Ask Linktree
            </span>
            <h2 className="mt-3 font-display text-[20px] font-bold leading-tight">How do I grow my followers?</h2>
            <p className="mt-2 text-[12px] leading-relaxed text-white/60">
              Get ideas for links, content and design based on what is already working on your page.
            </p>
            <Link
              href="/admin/insights"
              className="mt-4 inline-flex items-center gap-1.5 text-[12px] font-semibold text-chartreuse"
            >
              Explore insights <ArrowRight className="h-3.5 w-3.5" />
            </Link>
          </section>
        </div>
      </div>
    </div>
  );
}
