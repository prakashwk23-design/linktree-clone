"use client";

import Link from "next/link";
import { usePathname } from "next/navigation";
import {
  ArrowLeft,
  Check,
  Copy,
  ExternalLink,
  LayoutList,
  Palette,
  QrCode,
  Settings,
  Share2,
  UserRound,
} from "lucide-react";
import { useState, type ReactNode } from "react";
import { Avatar } from "@/components/ui/Avatar";
import { Button } from "@/components/ui/Button";
import { Modal } from "@/components/ui/Modal";

const TABS = [
  { label: "Content", href: "/admin/links", icon: LayoutList },
  { label: "Header", href: "/admin/header", icon: UserRound },
  { label: "Design", href: "/admin/design", icon: Palette },
];

export function EditorShell({
  user,
  children,
}: {
  user: { name: string; username: string; avatar: string };
  children: ReactNode;
}) {
  const pathname = usePathname();
  const [shareOpen, setShareOpen] = useState(false);
  const [copied, setCopied] = useState(false);

  async function copyLink() {
    const url = `${window.location.origin}/${user.username}`;
    try {
      await navigator.clipboard.writeText(url);
      setCopied(true);
      window.setTimeout(() => setCopied(false), 1800);
    } catch {
      setCopied(false);
    }
  }

  return (
    <div className="min-h-screen bg-chalk">
      <header className="fixed inset-x-0 top-0 z-40 flex h-16 items-center justify-between gap-3 border-b border-shade/10 bg-white px-4 sm:px-5">
        <div className="flex min-w-0 items-center gap-3">
          <Link
            href="/admin"
            className="grid h-9 w-9 flex-none place-items-center rounded-full text-shade/55 transition hover:bg-chalk hover:text-shade"
            aria-label="Back to admin"
          >
            <ArrowLeft className="h-4 w-4" />
          </Link>
          <Link
            href="/admin/account"
            className="flex min-w-0 items-center gap-2.5 rounded-full border border-shade/10 py-1 pl-1 pr-3 transition hover:border-shade/25"
          >
            <Avatar name={user.name} src={user.avatar || undefined} size={30} />
            <span className="truncate text-[12.5px] font-semibold text-shade">{user.username}</span>
          </Link>
        </div>

        <div className="flex flex-none items-center gap-2">
          <a
            href={`/${user.username}`}
            target="_blank"
            rel="noreferrer"
            className="hidden items-center gap-1.5 rounded-full px-3.5 py-2 text-[12.5px] font-semibold text-shade/70 transition hover:bg-chalk hover:text-shade sm:inline-flex"
          >
            Preview <ExternalLink className="h-3.5 w-3.5" />
          </a>
          <Button type="button" variant="primary" size="sm" onClick={() => setShareOpen(true)}>
            <Share2 className="h-3.5 w-3.5" /> Share
          </Button>
        </div>
      </header>

      <nav
        aria-label="Editor sections"
        className="fixed inset-y-16 left-0 z-30 hidden w-[84px] flex-col items-center gap-1 border-r border-shade/10 bg-white py-5 md:flex"
      >
        {TABS.map((tab) => {
          const active = pathname === tab.href;
          const Icon = tab.icon;
          return (
            <Link
              key={tab.href}
              href={tab.href}
              aria-current={active ? "page" : undefined}
              className={`flex w-[64px] flex-col items-center gap-1.5 rounded-2xl px-1 py-3 transition ${
                active ? "bg-chalk text-shade" : "text-shade/60 hover:bg-chalk/60 hover:text-shade"
              }`}
            >
              <span
                className={`grid h-9 w-9 place-items-center rounded-full ${
                  active ? "bg-shade text-white" : "bg-transparent"
                }`}
              >
                <Icon className="h-[18px] w-[18px]" />
              </span>
              <span className="text-[10.5px] font-semibold">{tab.label}</span>
            </Link>
          );
        })}

        <div className="mt-auto">
          <Link
            href="/admin/account"
            className="flex w-[64px] flex-col items-center gap-1.5 rounded-2xl px-1 py-3 text-shade/60 transition hover:bg-chalk/60 hover:text-shade"
          >
            <span className="grid h-9 w-9 place-items-center rounded-full">
              <Settings className="h-[18px] w-[18px]" />
            </span>
            <span className="text-[10.5px] font-semibold">Settings</span>
          </Link>
        </div>
      </nav>

      <div className="pb-20 pt-16 md:pb-0 md:pl-[84px]">{children}</div>

      <nav
        aria-label="Editor sections"
        className="fixed inset-x-0 bottom-0 z-40 flex items-stretch justify-around border-t border-shade/10 bg-white py-1.5 md:hidden"
      >
        {TABS.map((tab) => {
          const active = pathname === tab.href;
          const Icon = tab.icon;
          return (
            <Link
              key={tab.href}
              href={tab.href}
              aria-current={active ? "page" : undefined}
              className={`flex flex-1 flex-col items-center gap-1 rounded-xl py-2 text-[10px] font-semibold transition ${
                active ? "text-grape" : "text-shade/60"
              }`}
            >
              <Icon className="h-[19px] w-[19px]" />
              {tab.label}
            </Link>
          );
        })}
        <a
          href={`/${user.username}`}
          target="_blank"
          rel="noreferrer"
          className="flex flex-1 flex-col items-center gap-1 rounded-xl py-2 text-[10px] font-semibold text-shade/60"
        >
          <ExternalLink className="h-[19px] w-[19px]" />
          Preview
        </a>
      </nav>

      <Modal
        open={shareOpen}
        onClose={() => setShareOpen(false)}
        title="Share your Linktree"
        description="Put this link in your social bios so people can find everything you do."
        size="md"
      >
        <div className="grid gap-6 sm:grid-cols-[1fr_auto]">
          <div className="min-w-0 space-y-4">
            <div>
              <p className="text-[11px] font-bold uppercase tracking-[0.14em] text-shade/60">Your link</p>
              <div className="mt-2 flex items-center gap-2 rounded-xl border border-shade/15 bg-chalk/60 p-1.5 pl-3.5">
                <span className="min-w-0 flex-1 truncate text-[13px] font-semibold text-shade">
                  linktr.ee/{user.username}
                </span>
                <Button type="button" variant={copied ? "chartreuse" : "dark"} size="sm" onClick={copyLink}>
                  {copied ? <Check className="h-3.5 w-3.5" /> : <Copy className="h-3.5 w-3.5" />}
                  {copied ? "Copied" : "Copy"}
                </Button>
              </div>
            </div>

            <div className="flex flex-wrap gap-2">
              {[
                { label: "Open profile", href: `/${user.username}`, icon: ExternalLink },
                {
                  label: "Share on X",
                  href: `https://twitter.com/intent/tweet?url=${encodeURIComponent(`https://linktr.ee/${user.username}`)}`,
                  icon: Share2,
                },
                {
                  label: "WhatsApp",
                  href: `https://wa.me/?text=${encodeURIComponent(`https://linktr.ee/${user.username}`)}`,
                  icon: Share2,
                },
              ].map(({ label, href, icon: Icon }) => (
                <a
                  key={label}
                  href={href}
                  target="_blank"
                  rel="noreferrer"
                  className="inline-flex items-center gap-1.5 rounded-full border border-shade/15 px-3.5 py-2 text-[12px] font-semibold text-shade/70 transition hover:border-shade/30 hover:text-shade"
                >
                  <Icon className="h-3.5 w-3.5" /> {label}
                </a>
              ))}
            </div>

            <p className="text-[11.5px] leading-relaxed text-shade/60">
              Tip: add your link to Instagram, TikTok, YouTube and your email signature. Every profile uses the same
              URL.
            </p>
          </div>

          <div className="flex flex-col items-center gap-2">
            <div className="rounded-2xl border border-shade/10 bg-white p-2.5">
              {/* eslint-disable-next-line @next/next/no-img-element */}
              <img
                src={`/api/qr?username=${encodeURIComponent(user.username)}`}
                alt={`QR code for ${user.username}`}
                width={148}
                height={148}
                className="h-[148px] w-[148px] rounded-lg"
              />
            </div>
            <span className="inline-flex items-center gap-1 text-[10.5px] font-medium text-shade/60">
              <QrCode className="h-3 w-3" /> Scan to open
            </span>
          </div>
        </div>
      </Modal>
    </div>
  );
}
