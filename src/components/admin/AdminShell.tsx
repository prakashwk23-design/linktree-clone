"use client";

import Link from "next/link";
import { usePathname } from "next/navigation";
import {
  BarChart3,
  CalendarDays,
  Camera,
  ChevronDown,
  CreditCard,
  DollarSign,
  HelpCircle,
  LayoutDashboard,
  Lightbulb,
  Link2,
  LogOut,
  Menu,
  MessageCircle,
  Newspaper,
  Settings,
  Sparkles,
  Users,
  X,
} from "lucide-react";
import { useEffect, useRef, useState, type ReactNode } from "react";
import { logoutAction } from "@/app/actions";
import { Avatar } from "@/components/ui/Avatar";
import { Logo } from "@/components/ui/Logo";
import { planName } from "@/lib/themes";
import { AdminChat } from "@/components/admin/AdminChat";

type NavItem = { label: string; href: string; icon: typeof Link2 };

const MAIN: NavItem[] = [
  { label: "My Linktree", href: "/admin", icon: LayoutDashboard },
  { label: "Earn", href: "/admin/earn", icon: DollarSign },
  { label: "Media kit", href: "/admin/media-kit", icon: Newspaper },
  { label: "Audience", href: "/admin/audience", icon: Users },
  { label: "Insights", href: "/admin/insights", icon: BarChart3 },
  { label: "Messaging", href: "/admin/messaging", icon: MessageCircle },
];

const TOOLS: NavItem[] = [
  { label: "Business cards", href: "/admin/business-cards", icon: CreditCard },
  { label: "Social planner", href: "/admin/social-planner", icon: CalendarDays },
  { label: "Instagram auto-reply", href: "/admin/igdm", icon: Camera },
  { label: "Link shortener", href: "/admin/link-shortener", icon: Link2 },
  { label: "Post ideas", href: "/admin/post-ideas", icon: Lightbulb },
];

const isActive = (pathname: string, href: string) =>
  href === "/admin" ? pathname === "/admin" : pathname === href || pathname.startsWith(`${href}/`);

function NavLink({ item, pathname, onNavigate }: { item: NavItem; pathname: string; onNavigate?: () => void }) {
  const active = isActive(pathname, item.href);
  const Icon = item.icon;
  return (
    <Link
      href={item.href}
      onClick={onNavigate}
      aria-current={active ? "page" : undefined}
      className={`group flex items-center gap-3 rounded-xl px-3 py-2.5 text-[13.5px] transition ${
        active ? "bg-chalk font-semibold text-shade" : "font-medium text-shade/65 hover:bg-chalk/70 hover:text-shade"
      }`}
    >
      <Icon className={`h-[17px] w-[17px] flex-none ${active ? "text-grape" : "text-shade/60 group-hover:text-shade/70"}`} />
      <span className="truncate">{item.label}</span>
    </Link>
  );
}

function SidebarContent({
  pathname,
  user,
  progress,
  onNavigate,
}: {
  pathname: string;
  user: { name: string; username: string; avatar: string; plan: string };
  progress: { done: number; total: number };
  onNavigate?: () => void;
}) {
  const pct = Math.round((progress.done / Math.max(progress.total, 1)) * 100);

  return (
    <div className="flex h-full flex-col">
      <div className="px-5 pb-4 pt-5">
        <Logo
          href="/admin"
          onClick={onNavigate}
          className="mb-5 text-shade"
          svgClassName="h-[20px] w-auto"
        />
        <Link
          href="/admin/account"
          onClick={onNavigate}
          className="flex items-center gap-2.5 rounded-2xl border border-shade/10 bg-white px-3 py-2.5 transition hover:border-shade/20"
        >
          <Avatar name={user.name} src={user.avatar || undefined} size={34} />
          <span className="min-w-0 flex-1">
            <span className="block truncate text-[12.5px] font-bold text-shade">{user.username}</span>
            <span className="block truncate text-[10.5px] text-shade/60">{planName(user.plan)} plan</span>
          </span>
          <ChevronDown className="h-3.5 w-3.5 flex-none text-shade/55" />
        </Link>
      </div>

      <nav className="hide-scrollbar flex-1 overflow-y-auto px-3 pb-4" aria-label="Admin">
        <div className="space-y-0.5">
          {MAIN.map((item) => (
            <NavLink key={item.href} item={item} pathname={pathname} onNavigate={onNavigate} />
          ))}
        </div>

        <p className="mb-1.5 mt-6 px-3 text-[10px] font-bold uppercase tracking-[0.16em] text-shade/55">Tools</p>
        <div className="space-y-0.5">
          {TOOLS.map((item) => (
            <NavLink key={item.href} item={item} pathname={pathname} onNavigate={onNavigate} />
          ))}
        </div>

        <div className="mt-6 rounded-2xl border border-shade/10 bg-chartreuse/35 p-3.5">
          <div className="flex items-center justify-between text-[11px] font-bold text-shade">
            <span>{pct === 100 ? "You're all set" : `${pct}% set up`}</span>
            <Sparkles className="h-3.5 w-3.5" />
          </div>
          <div className="mt-2 h-1.5 overflow-hidden rounded-full bg-shade/10">
            <div className="h-full rounded-full bg-forest transition-all" style={{ width: `${pct}%` }} />
          </div>
          <p className="mt-2 text-[11px] text-shade/55">
            {progress.done} of {progress.total} complete
          </p>
          {pct === 100 ? (
            <Link
              href={`/${user.username}`}
              target="_blank"
              onClick={onNavigate}
              className="mt-2.5 inline-flex text-[11.5px] font-semibold text-forest underline underline-offset-2"
            >
              View your page
            </Link>
          ) : (
            <Link
              href="/admin/links"
              onClick={onNavigate}
              className="mt-2.5 inline-flex text-[11.5px] font-semibold text-forest underline underline-offset-2"
            >
              Finish setup
            </Link>
          )}
        </div>

        <div className="mt-4 space-y-0.5">
          <NavLink
            item={{ label: "Settings", href: "/admin/account", icon: Settings }}
            pathname={pathname}
            onNavigate={onNavigate}
          />
          <NavLink item={{ label: "Help", href: "/", icon: HelpCircle }} pathname={pathname} onNavigate={onNavigate} />
        </div>
      </nav>

      <div className="border-t border-shade/10 p-3">
        <form action={logoutAction}>
          <button
            type="submit"
            className="flex w-full items-center gap-3 rounded-xl px-3 py-2.5 text-[13px] font-medium text-shade/55 transition hover:bg-chalk hover:text-shade"
          >
            <LogOut className="h-4 w-4" /> Log out
          </button>
        </form>
      </div>
    </div>
  );
}

export function AdminShell({
  user,
  progress,
  children,
}: {
  user: { name: string; username: string; avatar: string; plan: string };
  progress: { done: number; total: number };
  children: ReactNode;
}) {
  const pathname = usePathname();
  const [mobileOpen, setMobileOpen] = useState(false);
  const drawerRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    if (!mobileOpen) return;
    const previouslyFocused = document.activeElement as HTMLElement | null;
    drawerRef.current?.querySelector<HTMLElement>("button, a")?.focus();
    const onKey = (event: KeyboardEvent) => {
      if (event.key === "Escape") setMobileOpen(false);
    };
    document.addEventListener("keydown", onKey);
    const previous = document.body.style.overflow;
    document.body.style.overflow = "hidden";
    return () => {
      document.removeEventListener("keydown", onKey);
      document.body.style.overflow = previous;
      previouslyFocused?.focus?.();
    };
  }, [mobileOpen]);

  return (
    <div className="min-h-screen bg-chalk">
      <aside className="fixed inset-y-0 left-0 z-40 hidden w-[248px] border-r border-shade/10 bg-white lg:block">
        <SidebarContent pathname={pathname} user={user} progress={progress} />
      </aside>

      {mobileOpen ? (
        <div ref={drawerRef} className="fixed inset-0 z-50 lg:hidden" role="dialog" aria-modal="true" aria-label="Navigation">
          <button
            type="button"
            aria-label="Close navigation"
            onClick={() => setMobileOpen(false)}
            className="absolute inset-0 bg-shade/40 backdrop-blur-[1px]"
          />
          <aside className="absolute inset-y-0 left-0 w-[280px] bg-white shadow-2xl">
            <div className="absolute right-3 top-4 z-10">
              <button
                type="button"
                onClick={() => setMobileOpen(false)}
                className="grid h-8 w-8 place-items-center rounded-full bg-chalk text-shade"
                aria-label="Close menu"
              >
                <X className="h-4 w-4" />
              </button>
            </div>
            <SidebarContent
              pathname={pathname}
              user={user}
              progress={progress}
              onNavigate={() => setMobileOpen(false)}
            />
          </aside>
        </div>
      ) : null}

      <div className="lg:pl-[248px]">
        <header className="sticky top-0 z-30 flex h-14 items-center justify-between gap-3 border-b border-shade/10 bg-white/90 px-4 backdrop-blur lg:hidden">
          <button
            type="button"
            onClick={() => setMobileOpen(true)}
            className="grid h-9 w-9 place-items-center rounded-full border border-shade/15 text-shade"
            aria-label="Open navigation"
          >
            <Menu className="h-4 w-4" />
          </button>
          <Logo svgClassName="h-[18px] w-auto" className="text-shade" />
          <Link href={`/${user.username}`} target="_blank" className="text-[12px] font-semibold text-grape">
            View page
          </Link>
        </header>

        <main className="mx-auto w-full max-w-[1120px] px-4 pb-28 pt-6 sm:px-6 lg:px-8 lg:pb-10 lg:pt-8">{children}</main>
      </div>

      <AdminChat username={user.username} />
    </div>
  );
}
