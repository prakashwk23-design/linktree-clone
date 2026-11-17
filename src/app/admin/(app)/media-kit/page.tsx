export const instant = false;

import Link from "next/link";
import {
  ArrowUpRight,
  BarChart3,
  Download,
  Globe2,
  Mail,
  MousePointerClick,
  Newspaper,
  Sparkles,
  TrendingUp,
  Users,
} from "lucide-react";
import { PrintButton } from "@/components/admin/PrintButton";
import { Avatar } from "@/components/ui/Avatar";
import { ButtonLink } from "@/components/ui/Button";
import { PlatformBadge } from "@/components/ui/PlatformIcon";
import { requireUser } from "@/lib/auth";
import { getAnalytics, getCountries, getLinks, getProducts, getReferrers, getSocials } from "@/lib/data";
import { planName } from "@/lib/themes";

export const metadata = { title: "Media kit" };

const COUNTRIES: Record<string, { name: string; flag: string }> = {
  IN: { name: "India", flag: "🇮🇳" },
  US: { name: "United States", flag: "🇺🇸" },
  GB: { name: "United Kingdom", flag: "🇬🇧" },
  DE: { name: "Germany", flag: "🇩🇪" },
  BR: { name: "Brazil", flag: "🇧🇷" },
  AU: { name: "Australia", flag: "🇦🇺" },
};

const AUDIENCE = [
  { label: "18–24", value: 34 },
  { label: "25–34", value: 41 },
  { label: "35–44", value: 17 },
  { label: "45+", value: 8 },
];

const PARTNERS = ["Northwind Studio", "Halo Audio", "Paper & Pine", "Sundae Club", "Orbit Supply"];

const RATES = [
  { title: "Instagram story set", detail: "3 frames · link sticker", price: "$850" },
  { title: "Dedicated post", detail: "Feed post · 1 link", price: "$1,400" },
  { title: "Video integration", detail: "60s segment · TikTok + Reels", price: "$2,600" },
  { title: "Newsletter feature", detail: "Primary placement", price: "$600" },
];

export default async function MediaKitPage() {
  const user = await requireUser();
  const analytics = getAnalytics(user.id, 30);
  const countries = getCountries(user.id, 30);
  const referrers = getReferrers(user.id, 30);
  const socials = getSocials(user.id);
  const links = getLinks(user.id, true);
  const products = getProducts(user.id);

  const followers = 18400 + socials.length * 2150;
  const engagement = analytics.views > 0 ? Math.round((analytics.clicks / Math.max(analytics.views, 1)) * 1000) / 10 : 0;
  const totalRef = referrers.reduce((sum, row) => sum + row.count, 0);
  const topCountries = countries.slice(0, 4);

  const stats = [
    { label: "Combined followers", value: followers.toLocaleString(), icon: Users },
    { label: "Monthly views", value: analytics.views.toLocaleString(), icon: BarChart3 },
    { label: "Link clicks (30d)", value: analytics.clicks.toLocaleString(), icon: MousePointerClick },
    { label: "Engagement rate", value: `${engagement}%`, icon: TrendingUp },
  ];

  return (
    <div className="space-y-5">
      <header className="flex flex-col gap-3 sm:flex-row sm:items-end sm:justify-between">
        <div>
          <p className="text-[11px] font-bold uppercase tracking-[0.16em] text-shade/60">Grow & earn</p>
          <h1 className="mt-1 font-display text-[28px] font-extrabold tracking-[-0.03em] text-shade sm:text-[32px]">
            Media kit
          </h1>
          <p className="mt-1 text-[12.5px] text-shade/60">
            A shareable one-pager with your reach, audience and rates.
          </p>
        </div>
        <div className="flex flex-wrap gap-2">
          <PrintButton />
          <ButtonLink href={`/${user.username}`} external variant="primary" size="sm">
            <ArrowUpRight className="h-3.5 w-3.5" /> View public page
          </ButtonLink>
        </div>
      </header>

      {/* Hero card */}
      <section className="overflow-hidden rounded-3xl border border-shade/10 bg-white">
        <div className="relative overflow-hidden bg-shade px-5 py-6 text-white sm:px-7">
          <div className="pointer-events-none absolute -right-10 -top-16 h-52 w-52 rounded-full bg-chartreuse/20 blur-3xl" />
          <div className="pointer-events-none absolute -bottom-20 left-1/3 h-52 w-52 rounded-full bg-grape/40 blur-3xl" />
          <div className="relative flex flex-col gap-5 sm:flex-row sm:items-center sm:justify-between">
            <div className="flex items-center gap-4">
              <Avatar name={user.name} src={user.avatar || undefined} size={68} ring="rgba(255,255,255,0.2)" />
              <div className="min-w-0">
                <div className="flex flex-wrap items-center gap-2">
                  <h2 className="font-display text-[24px] font-extrabold tracking-tight">{user.name}</h2>
                  <span className="rounded-full bg-white/15 px-2 py-0.5 text-[9.5px] font-bold uppercase tracking-wide text-chartreuse">
                    {planName(user.plan)}
                  </span>
                </div>
                <p className="mt-0.5 text-[12px] text-white/55">@{user.username} · Creator &amp; storyteller</p>
                <div className="mt-2.5 flex gap-1.5">
                  {socials.slice(0, 6).map((social) => (
                    <PlatformBadge key={social.id} platform={social.platform} size={24} />
                  ))}
                </div>
              </div>
            </div>
            <div className="flex gap-2 self-start sm:self-auto">
              <span className="rounded-xl bg-white/10 px-3 py-2 text-center">
                <span className="block font-display text-[18px] font-extrabold leading-none">
                  {links.length}
                </span>
                <span className="mt-1 block text-[9px] font-semibold uppercase tracking-[0.12em] text-white/65">
                  Links
                </span>
              </span>
              <span className="rounded-xl bg-chartreuse px-3 py-2 text-center text-shade">
                <span className="block font-display text-[18px] font-extrabold leading-none">
                  {products.length}
                </span>
                <span className="mt-1 block text-[9px] font-semibold uppercase tracking-[0.12em] text-shade/60">
                  Products
                </span>
              </span>
            </div>
          </div>
        </div>

        <div className="grid gap-3 px-5 py-5 sm:grid-cols-2 sm:px-7 lg:grid-cols-4">
          {stats.map(({ label, value, icon: Icon }) => (
            <div key={label} className="rounded-2xl bg-chalk/70 px-3.5 py-3">
              <span className="inline-flex items-center gap-1.5 text-[10px] font-bold uppercase tracking-[0.1em] text-shade/60">
                <Icon className="h-3 w-3" /> {label}
              </span>
              <p className="tabular mt-1.5 font-display text-[22px] font-extrabold leading-none tracking-tight text-shade">
                {value}
              </p>
            </div>
          ))}
        </div>
      </section>

      <div className="grid gap-5 lg:grid-cols-[1.35fr_0.65fr]">
        <div className="space-y-5">
          {/* About */}
          <section className="rounded-3xl border border-shade/10 bg-white p-5 sm:p-6">
            <h2 className="flex items-center gap-2 text-[14px] font-bold text-shade">
              <Sparkles className="h-4 w-4 text-grape" /> About
            </h2>
            <p className="mt-3 max-w-[640px] text-[13px] leading-relaxed text-shade/65">
              {user.bio ||
                "I create content about design, creative process and the tools that make good work possible. My audience is made up of makers, designers and small business owners who act on recommendations."}
            </p>
            <div className="mt-5 grid gap-2 sm:grid-cols-2">
              <div className="rounded-xl border border-shade/10 px-3.5 py-3">
                <p className="text-[10px] font-bold uppercase tracking-[0.1em] text-shade/55">Based in</p>
                <p className="mt-1 text-[12.5px] font-semibold text-shade">
                  {topCountries[0] ? (COUNTRIES[topCountries[0].country]?.name ?? topCountries[0].country) : "India"}
                </p>
              </div>
              <div className="rounded-xl border border-shade/10 px-3.5 py-3">
                <p className="text-[10px] font-bold uppercase tracking-[0.1em] text-shade/55">Best for</p>
                <p className="mt-1 text-[12.5px] font-semibold text-shade">Creative tools, apps, lifestyle</p>
              </div>
            </div>
          </section>

          {/* Audience */}
          <section className="rounded-3xl border border-shade/10 bg-white p-5 sm:p-6">
            <div className="flex items-center justify-between">
              <div>
                <h2 className="text-[14px] font-bold text-shade">Audience snapshot</h2>
                <p className="text-[11.5px] text-shade/60">Last 30 days</p>
              </div>
              <span className="inline-flex items-center gap-1 text-[10.5px] font-semibold text-shade/60">
                <Globe2 className="h-3 w-3" /> {topCountries.length} regions
              </span>
            </div>

            <div className="mt-4 grid gap-4 sm:grid-cols-2">
              <div>
                <p className="text-[10px] font-bold uppercase tracking-[0.12em] text-shade/55">Top locations</p>
                <ul className="mt-2.5 space-y-2.5">
                  {topCountries.length === 0 ? (
                    <li className="text-[12px] text-shade/60">No location data yet.</li>
                  ) : (
                    topCountries.map((row) => {
                      const meta = COUNTRIES[row.country] ?? { name: row.country, flag: "🌐" };
                      const pct = Math.round((row.count / Math.max(totalRef, 1)) * 100);
                      return (
                        <li key={row.country}>
                          <div className="flex items-center gap-2 text-[12px]">
                            <span>{meta.flag}</span>
                            <span className="min-w-0 flex-1 truncate font-medium text-shade/70">{meta.name}</span>
                            <span className="tabular text-[11px] text-shade/60">{pct}%</span>
                          </div>
                          <div className="mt-1 h-1.5 overflow-hidden rounded-full bg-chalk">
                            <div
                              className="h-full rounded-full bg-cobalt"
                              style={{ width: `${Math.max(pct, 3)}%` }}
                            />
                          </div>
                        </li>
                      );
                    })
                  )}
                </ul>
              </div>

              <div>
                <p className="text-[10px] font-bold uppercase tracking-[0.12em] text-shade/55">Age range</p>
                <ul className="mt-2.5 space-y-2.5">
                  {AUDIENCE.map((row) => (
                    <li key={row.label}>
                      <div className="flex items-center gap-2 text-[12px]">
                        <span className="min-w-0 flex-1 font-medium text-shade/70">{row.label}</span>
                        <span className="tabular text-[11px] text-shade/60">{row.value}%</span>
                      </div>
                      <div className="mt-1 h-1.5 overflow-hidden rounded-full bg-chalk">
                        <div className="h-full rounded-full bg-grape" style={{ width: `${row.value}%` }} />
                      </div>
                    </li>
                  ))}
                </ul>
              </div>
            </div>
          </section>

          {/* Rates */}
          <section className="rounded-3xl border border-shade/10 bg-white p-5 sm:p-6">
            <h2 className="flex items-center gap-2 text-[14px] font-bold text-shade">
              <Newspaper className="h-4 w-4 text-grape" /> Rate card
            </h2>
            <p className="mt-1 text-[11.5px] text-shade/60">Sample partnership rates — edit these to match your own.</p>
            <ul className="mt-4 divide-y divide-shade/10">
              {RATES.map((rate) => (
                <li key={rate.title} className="flex items-center gap-3 py-3">
                  <div className="min-w-0 flex-1">
                    <p className="text-[12.5px] font-semibold text-shade">{rate.title}</p>
                    <p className="text-[11px] text-shade/60">{rate.detail}</p>
                  </div>
                  <span className="font-display text-[16px] font-extrabold text-shade">{rate.price}</span>
                </li>
              ))}
            </ul>
          </section>
        </div>

        <div className="space-y-4">
          <section className="rounded-3xl bg-grape p-5 text-white">
            <Mail className="h-5 w-5 text-chartreuse" />
            <h2 className="mt-3 font-display text-[20px] font-bold leading-tight">Work with me</h2>
            <p className="mt-2 text-[12px] leading-relaxed text-white/60">
              For partnerships, press and speaking requests, reach out directly. I reply within two business days.
            </p>
            <a
              href={`mailto:hello@${user.username}.com`}
              className="mt-4 inline-flex items-center gap-1.5 text-[12px] font-semibold text-chartreuse hover:underline"
            >
              hello@{user.username}.com <ArrowUpRight className="h-3.5 w-3.5" />
            </a>
          </section>

          <section className="rounded-3xl border border-shade/10 bg-white p-5">
            <h2 className="text-[13px] font-bold text-shade">Past partners</h2>
            <ul className="mt-3 space-y-2">
              {PARTNERS.map((partner) => (
                <li key={partner} className="flex items-center gap-2.5 rounded-xl bg-chalk/60 px-3 py-2.5">
                  <span className="grid h-7 w-7 place-items-center rounded-full bg-white text-[10px] font-bold text-shade/60">
                    {partner.slice(0, 1)}
                  </span>
                  <span className="truncate text-[12px] font-medium text-shade/70">{partner}</span>
                </li>
              ))}
            </ul>
          </section>

          <section className="rounded-3xl border border-dashed border-shade/15 bg-chartreuse/20 p-4">
            <p className="text-[11px] font-bold uppercase tracking-[0.12em] text-shade/60">Tip</p>
            <p className="mt-1 text-[11.5px] leading-relaxed text-shade/60">
              Add your media kit link to your profile so brands can find it without asking.
            </p>
            <ButtonLink href="/admin/links" variant="dark" size="sm" className="mt-3">
              Add as a link
            </ButtonLink>
          </section>

          <Link
            href="/admin/insights"
            className="flex items-center justify-between gap-2 rounded-2xl border border-shade/10 bg-white px-4 py-3 text-[12px] font-semibold text-shade/70 transition hover:border-shade/25 hover:text-shade"
          >
            <span className="inline-flex items-center gap-1.5">
              <Download className="h-3.5 w-3.5" /> See full analytics
            </span>
            <ArrowUpRight className="h-3.5 w-3.5" />
          </Link>
        </div>
      </div>
    </div>
  );
}
