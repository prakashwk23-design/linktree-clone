import Link from "next/link";
import { Logo } from "@/components/ui/Logo";
import { PlatformIcon, PLATFORMS } from "@/components/ui/PlatformIcon";

const COLUMNS = [
  {
    title: "Company",
    links: [
      { label: "About", href: "/" },
      { label: "Careers", href: "/" },
      { label: "Press", href: "/" },
      { label: "Blog", href: "/" },
      { label: "Contact", href: "/" },
    ],
  },
  {
    title: "Community",
    links: [
      { label: "Creators", href: "/discover" },
      { label: "Discover", href: "/discover" },
      { label: "Templates", href: "/discover" },
      { label: "Marketplace", href: "/discover" },
      { label: "Events", href: "/discover" },
    ],
  },
  {
    title: "Support",
    links: [
      { label: "Help center", href: "/" },
      { label: "Trust & safety", href: "/" },
      { label: "Status", href: "/" },
      { label: "Accessibility", href: "/" },
      { label: "Developers", href: "/" },
    ],
  },
  {
    title: "Get started",
    links: [
      { label: "Sign up free", href: "/register" },
      { label: "Log in", href: "/login" },
      { label: "Pricing", href: "/pricing" },
      { label: "Link shortener", href: "/admin/link-shortener" },
      { label: "Business cards", href: "/admin/business-cards" },
    ],
  },
];

const SOCIALS = ["instagram", "tiktok", "x", "youtube", "linkedin"];

export function MarketingFooter() {
  return (
    <footer className="bg-shade text-white">
      <div className="mx-auto w-full max-w-[1240px] px-5 py-16 sm:px-8">
        <div className="grid gap-12 lg:grid-cols-[1.2fr_2fr]">
          <div>
            <Logo className="text-white" />
            <p className="mt-5 max-w-[280px] text-[14px] leading-relaxed text-white/60">
              One link to help you share everything you create, curate and sell from your social media profiles.
            </p>
            <div className="mt-6 flex gap-2">
              {SOCIALS.map((id) => {
                const platform = PLATFORMS.find((p) => p.id === id);
                return (
                  <a
                    key={id}
                    href="https://linktr.ee"
                    target="_blank"
                    rel="noreferrer"
                    aria-label={platform?.label ?? id}
                    className="grid h-9 w-9 place-items-center rounded-full bg-white/10 text-white transition hover:bg-white/20"
                  >
                    <PlatformIcon platform={id} className="h-4 w-4" />
                  </a>
                );
              })}
            </div>
          </div>

          <div className="grid grid-cols-2 gap-8 sm:grid-cols-4">
            {COLUMNS.map((column) => (
              <div key={column.title}>
                <h3 className="text-[12px] font-bold uppercase tracking-[0.14em] text-white/65">{column.title}</h3>
                <ul className="mt-4 space-y-2.5">
                  {column.links.map((item) => (
                    <li key={item.label}>
                      <Link href={item.href} className="text-[13.5px] text-white/75 transition hover:text-white">
                        {item.label}
                      </Link>
                    </li>
                  ))}
                </ul>
              </div>
            ))}
          </div>
        </div>

        <div className="mt-14 flex flex-col gap-4 border-t border-white/10 pt-6 text-[12px] text-white/65 sm:flex-row sm:items-center sm:justify-between">
          <p>© 2026 Linktree. All rights reserved.</p>
          <div className="flex flex-wrap gap-x-5 gap-y-2">
            <Link href="/" className="hover:text-white">
              Privacy
            </Link>
            <Link href="/" className="hover:text-white">
              Terms
            </Link>
            <Link href="/" className="hover:text-white">
              Cookie notice
            </Link>
            <Link href="/" className="hover:text-white">
              Do not sell my info
            </Link>
          </div>
        </div>
      </div>
    </footer>
  );
}
