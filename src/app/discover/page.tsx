export const instant = false;

import type { Metadata } from "next";
import { ArrowRight, Sparkles } from "lucide-react";
import { MarketingFooter } from "@/components/site/MarketingFooter";
import { MarketingHeader } from "@/components/site/MarketingHeader";
import { DiscoverGrid, type DiscoverProfile } from "@/components/site/DiscoverGrid";
import { ButtonLink } from "@/components/ui/Button";
import { getDiscoverProfiles, getPlatformStats, getSocials } from "@/lib/data";

export const metadata: Metadata = {
  title: "Discover",
  description:
    "Explore Linktree profiles from designers, musicians, studios, food creators and film clubs. Find inspiration for your own link in bio.",
};

const META: Record<string, { category: string; followers: string }> = {
  demo: { category: "Creator", followers: "12.4k" },
  mayachen: { category: "Design", followers: "84.2k" },
  jordanbeats: { category: "Music", followers: "210k" },
  studionine: { category: "Studio", followers: "36.8k" },
  nova: { category: "Illustration", followers: "52.1k" },
  eatwithsam: { category: "Food", followers: "129k" },
  filmclub: { category: "Film", followers: "18.9k" },
};

const FALLBACK_CATEGORIES = ["Creator", "Lifestyle", "Business", "Education", "Art"];

const CATEGORIES = ["All profiles", "Design", "Music", "Food", "Studio", "Creator"];

export default async function DiscoverPage({
  searchParams,
}: {
  searchParams: Promise<{ category?: string }>;
}) {
  const { category } = await searchParams;
  const active = category && CATEGORIES.includes(category) ? category : "All profiles";
  const rows = getDiscoverProfiles();
  const stats = getPlatformStats();

  const profiles: DiscoverProfile[] = rows.map((user, index) => {
    const meta = META[user.username] ?? {
      category: FALLBACK_CATEGORIES[index % FALLBACK_CATEGORIES.length],
      followers: `${(4 + index * 3.1).toFixed(1)}k`,
    };
    return {
      username: user.username,
      name: user.name,
      bio: user.bio,
      theme: user.theme,
      linkCount: user.linkCount,
      category: meta.category,
      followers: meta.followers,
      socials: getSocials(user.id).map((social) => social.platform),
    };
  });

  const visible = active === "All profiles" ? profiles : profiles.filter((profile) => profile.category === active);

  return (
    <div className="bg-chalk">
      <MarketingHeader />

      <main>
        <section className="border-b border-shade/10 bg-white">
          <div className="mx-auto w-full max-w-[1240px] px-5 py-14 sm:px-8 lg:py-16">
            <div className="flex flex-col gap-8 lg:flex-row lg:items-end lg:justify-between">
              <div className="max-w-[620px]">
                <span className="inline-flex items-center gap-2 rounded-full bg-chartreuse/40 px-3 py-1 text-[11px] font-bold uppercase tracking-[0.14em] text-forest">
                  <Sparkles className="h-3.5 w-3.5" /> Discover
                </span>
                <h1 className="mt-4 font-display text-[40px] font-extrabold leading-[0.98] tracking-[-0.04em] text-shade sm:text-[56px]">
                  See how the internet links.
                </h1>
                <p className="mt-4 max-w-[520px] text-[15.5px] leading-relaxed text-shade/55">
                  Real profiles from designers, musicians, studios and creators. Steal a layout idea, then make it your
                  own.
                </p>
              </div>

              <div className="grid grid-cols-3 gap-3 lg:gap-4">
                {[
                  { label: "Profiles", value: stats.profiles.toLocaleString() },
                  { label: "Links", value: stats.links.toLocaleString() },
                  { label: "Views", value: stats.views.toLocaleString() },
                ].map((stat) => (
                  <div key={stat.label} className="rounded-2xl bg-chalk px-4 py-3 text-center">
                    <p className="font-display text-[22px] font-extrabold leading-none text-shade">{stat.value}</p>
                    <p className="mt-1 text-[10px] font-bold uppercase tracking-[0.1em] text-shade/55">{stat.label}</p>
                  </div>
                ))}
              </div>
            </div>

            <div className="mt-8 flex flex-wrap gap-2">
              {CATEGORIES.map((label) => (
                <a
                  key={label}
                  href={label === "All profiles" ? "/discover" : `/discover?category=${encodeURIComponent(label)}`}
                  aria-current={active === label ? "page" : undefined}
                  className={`rounded-full border px-3.5 py-1.5 text-[11.5px] font-semibold transition ${
                    active === label
                      ? "border-shade bg-shade text-white"
                      : "border-shade/12 text-shade/50 hover:border-shade/30 hover:text-shade"
                  }`}
                >
                  {label}
                </a>
              ))}
            </div>
          </div>
        </section>

        <section className="mx-auto w-full max-w-[1240px] px-5 py-12 sm:px-8 lg:py-16">
          <DiscoverGrid profiles={visible} />
        </section>

        <section className="bg-cobalt text-white">
          <div className="mx-auto flex w-full max-w-[1240px] flex-col items-center px-5 py-16 text-center sm:px-8">
            <h2 className="max-w-[620px] font-display text-[34px] font-extrabold leading-[1.02] tracking-[-0.04em] sm:text-[48px]">
              Your page could be next.
            </h2>
            <p className="mt-4 max-w-[440px] text-[15px] leading-relaxed text-white/65">
              Claim your link, pick a theme and publish in minutes. It is free to start.
            </p>
            <ButtonLink href="/register" variant="chartreuse" size="lg" className="mt-8">
              Create your Linktree <ArrowRight className="h-4 w-4" />
            </ButtonLink>
          </div>
        </section>
      </main>

      <MarketingFooter />
    </div>
  );
}
