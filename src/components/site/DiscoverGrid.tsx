"use client";

import Link from "next/link";
import { ArrowUpRight, Search } from "lucide-react";
import { useMemo, useState } from "react";
import { Avatar } from "@/components/ui/Avatar";
import { PlatformBadge } from "@/components/ui/PlatformIcon";
import { getTheme } from "@/lib/themes";

export type DiscoverProfile = {
  username: string;
  name: string;
  bio: string;
  theme: string;
  linkCount: number;
  category: string;
  followers: string;
  socials: string[];
};

export function DiscoverGrid({ profiles }: { profiles: DiscoverProfile[] }) {
  const [query, setQuery] = useState("");
  const [category, setCategory] = useState("All");

  const categories = useMemo(
    () => ["All", ...Array.from(new Set(profiles.map((profile) => profile.category)))],
    [profiles],
  );

  const filtered = useMemo(() => {
    const clean = query.trim().toLowerCase();
    return profiles.filter((profile) => {
      const matchesCategory = category === "All" || profile.category === category;
      const matchesQuery =
        !clean ||
        profile.name.toLowerCase().includes(clean) ||
        profile.username.toLowerCase().includes(clean) ||
        profile.category.toLowerCase().includes(clean);
      return matchesCategory && matchesQuery;
    });
  }, [profiles, query, category]);

  return (
    <div>
      <div className="flex flex-col gap-4 sm:flex-row sm:items-center sm:justify-between">
        <div className="relative w-full sm:max-w-[320px]">
          <Search className="absolute left-3.5 top-1/2 h-4 w-4 -translate-y-1/2 text-shade/50" />
          <input
            value={query}
            onChange={(event) => setQuery(event.target.value)}
            placeholder="Search creators, niches…"
            className="h-11 w-full rounded-full border border-shade/15 bg-white pl-10 pr-4 text-[13px] text-shade outline-none transition focus:border-shade/35"
            aria-label="Search profiles"
          />
        </div>

        <div className="hide-scrollbar flex gap-1.5 overflow-x-auto">
          {categories.map((item) => (
            <button
              key={item}
              type="button"
              onClick={() => setCategory(item)}
              className={`whitespace-nowrap rounded-full px-3.5 py-2 text-[12px] font-semibold transition ${
                category === item
                  ? "bg-shade text-white"
                  : "border border-shade/12 bg-white text-shade/55 hover:border-shade/25 hover:text-shade"
              }`}
            >
              {item}
            </button>
          ))}
        </div>
      </div>

      {filtered.length === 0 ? (
        <p className="mt-12 rounded-3xl border border-dashed border-shade/20 bg-white px-6 py-16 text-center text-[13px] text-shade/60">
          No profiles match “{query}”. Try another name or niche.
        </p>
      ) : (
        <div className="mt-8 grid gap-4 sm:grid-cols-2 lg:grid-cols-3">
          {filtered.map((profile) => {
            const theme = getTheme(profile.theme);
            return (
              <Link
                key={profile.username}
                href={`/${profile.username}`}
                className="group overflow-hidden rounded-3xl border border-shade/10 bg-white transition hover:-translate-y-1 hover:shadow-xl"
              >
                <div
                  className="relative h-[132px] overflow-hidden px-4 pt-4"
                  style={{ background: theme.background, color: theme.text }}
                >
                  <div className="flex items-center gap-2.5">
                    <Avatar
                      name={profile.name}
                      size={38}
                      ring={theme.dark ? "rgba(255,255,255,0.25)" : "rgba(255,255,255,0.7)"}
                    />
                    <div className="min-w-0">
                      <p className="truncate text-[12px] font-bold leading-tight">{profile.name}</p>
                      <p className="truncate text-[10px] opacity-60">@{profile.username}</p>
                    </div>
                    <ArrowUpRight className="ml-auto h-3.5 w-3.5 flex-none opacity-30 transition group-hover:opacity-80" />
                  </div>
                  <div className="mt-3 space-y-1">
                    {[0, 1].map((row) => (
                      <div
                        key={row}
                        className="h-4 rounded-full"
                        style={{
                          background: theme.buttonBg,
                          opacity: 0.55,
                          width: row === 0 ? "88%" : "72%",
                          border: `1px solid ${theme.buttonBorder}`,
                        }}
                      />
                    ))}
                  </div>
                  <div className="mt-3 flex gap-1">
                    {profile.socials.slice(0, 4).map((platform, index) => (
                      <PlatformBadge key={`${platform}-${index}`} platform={platform} size={16} />
                    ))}
                  </div>
                </div>

                <div className="p-4">
                  <div className="flex items-center gap-2">
                    <span className="rounded-full bg-chartreuse/40 px-2 py-0.5 text-[9.5px] font-bold uppercase tracking-wide text-forest">
                      {profile.category}
                    </span>
                    <span className="ml-auto text-[10.5px] font-semibold text-shade/55">{profile.followers} followers</span>
                  </div>
                  <p className="mt-2 line-clamp-2 min-h-[32px] text-[12px] leading-relaxed text-shade/55">
                    {profile.bio || "No bio yet."}
                  </p>
                  <p className="mt-2 text-[10.5px] font-medium text-shade/50">
                    {profile.linkCount} link{profile.linkCount === 1 ? "" : "s"}
                  </p>
                </div>
              </Link>
            );
          })}
        </div>
      )}
    </div>
  );
}
