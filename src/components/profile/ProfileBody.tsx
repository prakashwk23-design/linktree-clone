import type { CSSProperties } from "react";
import { ProfileLinks } from "@/components/profile/ProfileLinks";
import { Avatar } from "@/components/ui/Avatar";
import { PlatformBadge } from "@/components/ui/PlatformIcon";
import { Logo } from "@/components/ui/Logo";
import { collectionSlugs } from "@/lib/collections";
import { fontFamily, getTheme } from "@/lib/themes";
import type { Collection, Link, Social } from "@/lib/types";

export type ProfileUser = {
  username: string;
  name: string;
  bio: string;
  avatar: string;
  theme: string;
  button_style: string;
  corner_style: string;
  font: string;
  wallpaper: string;
  show_footer: number;
  layout?: string;
  title_style?: string;
};

export function ProfileBody({
  user,
  links,
  socials,
  collections = [],
  analyticsUserId,
  preview = false,
  compact = false,
  footer = true,
}: {
  user: ProfileUser;
  links: Link[];
  socials: Social[];
  collections?: Collection[];
  analyticsUserId?: string;
  preview?: boolean;
  compact?: boolean;
  footer?: boolean;
}) {
  const theme = getTheme(user.theme);
  const visibleLinks = links.filter((link) => link.visible === 1);
  const layout = user.layout ?? "classic";
  const showBanner = layout === "banner" || layout === "hero";
  const avatarSize = compact ? (layout === "hero" ? 80 : 72) : layout === "hero" ? 112 : 96;

  const slugs = collectionSlugs(collections);
  const collectionIds = new Set(collections.map((collection) => collection.id));
  const groups = collections
    .map((collection) => ({
      ...collection,
      slug: slugs.get(collection.id) ?? collection.id,
      links: visibleLinks.filter((link) => link.collection_id === collection.id),
    }))
    .filter((group) => group.links.length > 0);
  const ungrouped = visibleLinks.filter(
    (link) => !link.collection_id || !collectionIds.has(link.collection_id),
  );

  const wallpaperStyle: CSSProperties | undefined =
    user.wallpaper === "dots"
      ? {
          backgroundImage: `radial-gradient(${theme.dark ? "rgba(255,255,255,0.16)" : "rgba(30,35,48,0.12)"} 1.1px, transparent 1.1px)`,
          backgroundSize: compact ? "14px 14px" : "18px 18px",
        }
      : user.wallpaper === "gradient"
        ? { backgroundImage: theme.dark ? "linear-gradient(180deg,rgba(255,255,255,0.06),transparent 55%)" : "linear-gradient(180deg,rgba(255,255,255,0.35),transparent 55%)" }
        : undefined;

  return (
    <div
      className={`relative flex min-h-full w-full flex-col items-center overflow-hidden ${compact ? "px-4 pb-6" : "px-5 pb-12"}`}
      style={{ background: theme.background, color: theme.text, fontFamily: fontFamily(user.font) }}
    >
      {wallpaperStyle ? <div aria-hidden="true" className="pointer-events-none absolute inset-0" style={wallpaperStyle} /> : null}
      {showBanner ? (
        <div
          aria-hidden="true"
          className="pointer-events-none absolute inset-x-0 top-0 h-24 w-full"
          style={{
            background: theme.dark
              ? "linear-gradient(120deg, rgba(255,255,255,0.18), transparent 72%)"
              : "linear-gradient(120deg, rgba(255,255,255,0.62), transparent 72%)",
          }}
        />
      ) : null}

      <div className={compact ? (showBanner ? "pt-16" : "pt-9") : showBanner ? "pt-24" : "pt-16"} />

      <Avatar
        name={user.name}
        src={user.avatar || undefined}
        size={avatarSize}
        shape={layout === "shape" ? "rounded" : "full"}
        ring={
          layout === "cutout"
            ? theme.dark
              ? "rgba(255,255,255,0.55)"
              : "rgba(255,255,255,0.95)"
            : theme.dark
              ? "rgba(255,255,255,0.18)"
              : "rgba(255,255,255,0.65)"
        }
      />

      {user.title_style === "logo" ? (
        <div className="relative mt-4" style={{ color: theme.text }}>
          <Logo href="/" svgClassName={compact ? "h-[16px] w-auto" : "h-[22px] w-auto"} />
        </div>
      ) : (
        <h1
          className={`relative mt-4 text-center font-bold tracking-tight ${
            compact ? (layout === "hero" ? "text-[22px]" : "text-[19px]") : layout === "hero" ? "text-[30px]" : "text-[24px]"
          }`}
          style={{ color: theme.text }}
        >
          {user.name}
        </h1>
      )}

      {user.bio ? (
        <p
          className={`relative mt-1.5 max-w-[420px] text-center leading-snug ${compact ? "text-[11.5px]" : "text-[14px]"}`}
          style={{ color: theme.muted }}
        >
          {user.bio}
        </p>
      ) : null}

      {socials.length > 0 ? (
        <div className={`relative flex flex-wrap items-center justify-center gap-2 ${compact ? "mt-4" : "mt-5"}`}>
          {socials.map((social) => {
            const badge = <PlatformBadge platform={social.platform} size={compact ? 30 : 36} />;
            return preview ? (
              <span key={social.id}>{badge}</span>
            ) : (
              <a
                key={social.id}
                href={social.url}
                target="_blank"
                rel="noreferrer"
                className="transition hover:-translate-y-0.5 hover:opacity-90"
                aria-label={social.platform}
              >
                {badge}
              </a>
            );
          })}
        </div>
      ) : null}

      <div className={`relative mt-6 w-full ${compact ? "max-w-[250px]" : "max-w-[520px]"}`}>
        {visibleLinks.length === 0 ? (
          <div
            className={`rounded-2xl border border-dashed px-4 py-6 text-center text-[12px] ${compact ? "" : "text-[14px]"}`}
            style={{ borderColor: theme.dark ? "rgba(255,255,255,0.22)" : "rgba(30,35,48,0.18)", color: theme.muted }}
          >
            No links yet. Add your first link to get started.
          </div>
        ) : (
          <ProfileLinks
            ungrouped={ungrouped}
            groups={groups}
            allLinks={visibleLinks}
            themeId={user.theme}
            buttonStyle={user.button_style}
            cornerStyle={user.corner_style}
            compact={compact}
            preview={preview}
            analyticsUserId={analyticsUserId}
          />
        )}
      </div>

      {footer && user.show_footer ? (
        <div className={`relative mt-auto flex flex-col items-center ${compact ? "pt-8" : "pt-12"}`}>
          <span style={{ color: theme.muted }} className="text-[10px] font-semibold uppercase tracking-[0.18em]">
            Link in bio
          </span>
          <div className={`mt-1.5 ${compact ? "opacity-60" : "opacity-80"}`} style={{ color: theme.text }}>
            <Logo href="/" svgClassName={compact ? "h-[13px] w-auto" : "h-[16px] w-auto"} />
          </div>
        </div>
      ) : null}
    </div>
  );
}
