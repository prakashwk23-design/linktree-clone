"use client";

import { ChevronDown, Search, X } from "lucide-react";
import { useEffect, useRef, useState, useSyncExternalStore, type CSSProperties } from "react";
import { cornerRadius, getTheme, type Theme } from "@/lib/themes";
import type { CollectionGroup, Link } from "@/lib/types";

const DESKTOP_QUERY = "(min-width: 640px)";

function subscribeDesktop(callback: () => void) {
  const query = window.matchMedia(DESKTOP_QUERY);
  query.addEventListener("change", callback);
  return () => query.removeEventListener("change", callback);
}

function getDesktopSnapshot() {
  return window.matchMedia(DESKTOP_QUERY).matches;
}

function getServerSnapshot() {
  return false;
}

function buttonStyleFor(theme: Theme, style: string): CSSProperties {
  if (style === "outline") {
    return {
      background: "transparent",
      color: theme.text,
      border: `1.6px solid ${theme.dark ? "rgba(255,255,255,0.55)" : "rgba(30,35,48,0.35)"}`,
    };
  }
  if (style === "glass") {
    return {
      background: theme.dark ? "rgba(255,255,255,0.13)" : "rgba(255,255,255,0.58)",
      color: theme.buttonText,
      border: `1px solid ${theme.dark ? "rgba(255,255,255,0.22)" : "rgba(255,255,255,0.7)"}`,
      backdropFilter: "blur(12px)",
    };
  }
  return {
    background: theme.buttonBg,
    color: theme.buttonText,
    border: `1px solid ${theme.buttonBorder}`,
    boxShadow: theme.dark ? "0 1px 0 rgba(255,255,255,0.08) inset" : "0 1px 2px rgba(30,35,48,0.06)",
  };
}

function LinkRow({
  link,
  theme,
  radius,
  style,
  compact,
  preview,
  collectionName,
}: {
  link: Link;
  theme: Theme;
  radius: string;
  style: CSSProperties;
  compact: boolean;
  preview: boolean;
  collectionName?: string;
}) {
  const content = (
    <>
      {link.thumbnail ? (
        <span
          className={`grid flex-none place-items-center overflow-hidden rounded-lg ${compact ? "h-7 w-7 text-base" : "h-10 w-10 text-xl"}`}
          style={{ background: theme.dark ? "rgba(255,255,255,0.12)" : "rgba(30,35,48,0.06)" }}
        >
          {link.thumbnail}
        </span>
      ) : null}
      <span
        className={`min-w-0 flex-1 text-center font-semibold ${compact ? "text-[12px]" : "text-[15px]"} ${link.thumbnail ? "pr-7" : ""}`}
      >
        <span className="line-clamp-2">{link.title}</span>
        {collectionName ? (
          <span className="mt-0.5 block text-[10px] font-medium opacity-65">{collectionName}</span>
        ) : null}
      </span>
    </>
  );

  const shared = {
    className: `group flex w-full items-center gap-3 px-4 text-center transition-all duration-200 ${compact ? "min-h-[42px] py-2" : "min-h-[56px] py-3"} ${preview ? "" : "hover:-translate-y-0.5 hover:brightness-[0.985]"}`,
    style: { ...style, borderRadius: radius } as CSSProperties,
  };

  return preview ? (
    <div {...shared}>{content}</div>
  ) : (
    <a href={`/api/click/${link.id}`} {...shared}>
      {content}
    </a>
  );
}

export function ProfileLinks({
  ungrouped,
  groups,
  allLinks,
  themeId,
  buttonStyle,
  cornerStyle,
  compact,
  preview,
  analyticsUserId,
}: {
  ungrouped: Link[];
  groups: CollectionGroup[];
  allLinks: Link[];
  themeId: string;
  buttonStyle: string;
  cornerStyle: string;
  compact: boolean;
  preview: boolean;
  analyticsUserId?: string;
}) {
  const theme = getTheme(themeId);
  const radius = cornerRadius(cornerStyle);
  const style = buttonStyleFor(theme, buttonStyle);
  const gaps = compact ? "space-y-2.5" : "space-y-3";
  const searchable = !preview && allLinks.length > 12;

  const [query, setQuery] = useState("");
  const [active, setActive] = useState("all");
  const [openSlug, setOpenSlug] = useState<string | null>(groups[0]?.slug ?? null);
  const logged = useRef(new Set<string>());
  const isDesktop = useSyncExternalStore(subscribeDesktop, getDesktopSnapshot, getServerSnapshot);

  const normalized = query.trim().toLowerCase();
  const collectionNames = new Map(groups.map((group) => [group.id, group.name]));

  const results = normalized
    ? allLinks.filter((link) => {
        const collection = collectionNames.get(link.collection_id ?? "") ?? "";
        return `${link.title} ${link.url} ${collection}`.toLowerCase().includes(normalized);
      })
    : [];

  const groupSlugs = groups.map((group) => group.slug).join("|");

  // Deep links like /demo#resources open the right section or tab.
  useEffect(() => {
    const applyHash = () => {
      const hash = decodeURIComponent(window.location.hash.replace(/^#/, ""));
      setQuery("");
      if (!hash) {
        setActive("all");
        return;
      }
      if (!groupSlugs.split("|").includes(hash)) return;
      setActive(hash);
      setOpenSlug(hash);
      window.requestAnimationFrame(() => {
        document.getElementById(hash)?.scrollIntoView({ block: "start" });
      });
    };

    applyHash();
    window.addEventListener("hashchange", applyHash);
    return () => window.removeEventListener("hashchange", applyHash);
  }, [groupSlugs]);

  // Log settled queries (not every keystroke) so Insights can show demand.
  useEffect(() => {
    if (!searchable || !analyticsUserId) return;
    const cleaned = query.trim();
    if (cleaned.length < 2) return;
    const key = cleaned.toLowerCase();
    if (logged.current.has(key)) return;

    const timer = window.setTimeout(() => {
      logged.current.add(key);
      void fetch("/api/search", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          userId: analyticsUserId,
          query: cleaned.slice(0, 80),
          results: results.length,
        }),
        keepalive: true,
      }).catch(() => undefined);
    }, 1400);

    return () => window.clearTimeout(timer);
  }, [query, results.length, searchable, analyticsUserId]);

  function selectTab(slug: string) {
    setQuery("");
    setActive(slug);
    const base = window.location.pathname + window.location.search;
    window.history.replaceState(null, "", slug === "all" ? base : `${base}#${slug}`);
  }

  function toggleGroup(slug: string) {
    setQuery("");
    const next = openSlug === slug ? null : slug;
    setOpenSlug(next);
    const base = window.location.pathname + window.location.search;
    window.history.replaceState(null, "", next ? `${base}#${slug}` : base);
  }

  function renderLink(link: Link, showCollection = false) {
    return (
      <LinkRow
        key={link.id}
        link={link}
        theme={theme}
        radius={radius}
        style={style}
        compact={compact}
        preview={preview}
        collectionName={showCollection ? collectionNames.get(link.collection_id ?? "") : undefined}
      />
    );
  }

  function renderGroup(group: CollectionGroup, showHeading = true) {
    return (
      <section key={group.id} id={group.slug} className="scroll-mt-6">
        {showHeading ? (
          <div className="mb-2 flex items-center justify-between gap-2 px-1">
            <h2
              className={`font-bold uppercase tracking-[0.16em] ${compact ? "text-[9px]" : "text-[10.5px]"}`}
              style={{ color: theme.muted }}
            >
              {group.name}
            </h2>
            <span className="text-[10px] font-semibold" style={{ color: theme.muted }}>
              {group.links.length}
            </span>
          </div>
        ) : null}
        <div className={gaps}>{group.links.map((link) => renderLink(link))}</div>
      </section>
    );
  }

  const searchInputStyle: CSSProperties = {
    background: theme.dark ? "rgba(255,255,255,0.10)" : "rgba(255,255,255,0.74)",
    border: `1px solid ${theme.dark ? "rgba(255,255,255,0.22)" : "rgba(30,35,48,0.12)"}`,
    color: theme.text,
  };

  const accordionStyle: CSSProperties = {
    background: theme.dark ? "rgba(255,255,255,0.08)" : "rgba(255,255,255,0.48)",
    border: `1px solid ${theme.dark ? "rgba(255,255,255,0.14)" : "rgba(30,35,48,0.08)"}`,
  };

  const tabStyle = (selected: boolean): CSSProperties =>
    selected
      ? {
          background: theme.buttonBg,
          color: theme.buttonText,
          border: `1px solid ${theme.buttonBorder}`,
        }
      : {
          color: theme.muted,
          border: `1px solid ${theme.dark ? "rgba(255,255,255,0.16)" : "rgba(30,35,48,0.12)"}`,
        };

  return (
    <div className="w-full">
      {searchable ? (
        <div className={compact ? "mb-3" : "mb-4"}>
          <div className="relative">
            <Search
              aria-hidden="true"
              className="pointer-events-none absolute left-3.5 top-1/2 h-4 w-4 -translate-y-1/2"
              style={{ color: theme.muted }}
            />
            <input
              type="search"
              value={query}
              onChange={(event) => setQuery(event.target.value)}
              placeholder="Search my links"
              aria-label="Search links"
              className={`w-full rounded-full pl-10 pr-10 text-[13px] outline-none transition placeholder:opacity-60 focus:ring-4 ${compact ? "h-9" : "h-11"}`}
              style={searchInputStyle}
            />
            {query ? (
              <button
                type="button"
                onClick={() => setQuery("")}
                aria-label="Clear search"
                className="absolute right-2.5 top-1/2 grid h-6 w-6 -translate-y-1/2 place-items-center rounded-full transition hover:opacity-70"
                style={{ color: theme.muted }}
              >
                <X className="h-3.5 w-3.5" />
              </button>
            ) : null}
          </div>
          {normalized ? (
            <p className="mt-2 text-center text-[11px] font-medium" style={{ color: theme.muted }} aria-live="polite">
              {results.length === 0
                ? `No links match “${query.trim()}”`
                : `${results.length} link${results.length === 1 ? "" : "s"} for “${query.trim()}”`}
            </p>
          ) : null}
        </div>
      ) : null}

      {normalized ? (
        results.length === 0 ? (
          <div
            className="rounded-2xl border border-dashed px-4 py-6 text-center text-[12px]"
            style={{
              borderColor: theme.dark ? "rgba(255,255,255,0.22)" : "rgba(30,35,48,0.18)",
              color: theme.muted,
            }}
          >
            Try a different word, or browse the collections below.
          </div>
        ) : (
          <div className={gaps}>{results.map((link) => renderLink(link, true))}</div>
        )
      ) : (
        <>
          {ungrouped.length > 0 ? <div className={gaps}>{ungrouped.map((link) => renderLink(link))}</div> : null}

          {groups.length > 0 ? (
            <div className={ungrouped.length > 0 ? (compact ? "mt-4" : "mt-5") : ""}>
              {groups.length >= 3 && isDesktop ? (
                <>
                  <div
                    role="tablist"
                    aria-label="Collections"
                    className="hide-scrollbar mb-3 flex gap-1.5 overflow-x-auto pb-0.5"
                  >
                    <button
                      type="button"
                      role="tab"
                      aria-selected={active === "all"}
                      onClick={() => selectTab("all")}
                      className="whitespace-nowrap rounded-full px-3 py-1.5 text-[11px] font-semibold transition"
                      style={tabStyle(active === "all")}
                    >
                      All
                    </button>
                    {groups.map((group) => (
                      <button
                        key={group.id}
                        type="button"
                        role="tab"
                        aria-selected={active === group.slug}
                        onClick={() => selectTab(group.slug)}
                        className="whitespace-nowrap rounded-full px-3 py-1.5 text-[11px] font-semibold transition"
                        style={tabStyle(active === group.slug)}
                      >
                        {group.name}
                      </button>
                    ))}
                  </div>
                  {active === "all" ? (
                    <div className={compact ? "space-y-4" : "space-y-5"}>{groups.map((group) => renderGroup(group))}</div>
                  ) : (
                    renderGroup(groups.find((group) => group.slug === active) ?? groups[0], false)
                  )}
                </>
              ) : groups.length >= 3 ? (
                <div className="space-y-2">
                  {groups.map((group) => {
                    const open = openSlug === group.slug;
                    return (
                      <div key={group.id} id={group.slug} className="scroll-mt-6 overflow-hidden rounded-2xl" style={accordionStyle}>
                        <button
                          type="button"
                          onClick={() => toggleGroup(group.slug)}
                          aria-expanded={open}
                          aria-controls={`panel-${group.id}`}
                          className="flex w-full items-center justify-between gap-2 px-3.5 py-3 text-left"
                        >
                          <span className="text-[12px] font-bold" style={{ color: theme.text }}>
                            {group.name}
                          </span>
                          <span className="flex items-center gap-2 text-[10px] font-semibold" style={{ color: theme.muted }}>
                            {group.links.length}
                            <ChevronDown className={`h-3.5 w-3.5 transition-transform ${open ? "rotate-180" : ""}`} />
                          </span>
                        </button>
                        {open ? (
                          <div id={`panel-${group.id}`} className={`px-2 pb-2 ${gaps}`}>
                            {group.links.map((link) => renderLink(link))}
                          </div>
                        ) : null}
                      </div>
                    );
                  })}
                </div>
              ) : (
                <div className={compact ? "space-y-4" : "space-y-5"}>
                  {groups.map((group) => renderGroup(group))}
                </div>
              )}
            </div>
          ) : null}
        </>
      )}
    </div>
  );
}
