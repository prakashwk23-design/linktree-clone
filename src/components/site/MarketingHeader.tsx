"use client";

import Link from "next/link";
import { Menu, X } from "lucide-react";
import { useState } from "react";
import { Logo } from "@/components/ui/Logo";
import { ButtonLink } from "@/components/ui/Button";

const NAV = [
  { label: "Features", href: "/#features" },
  { label: "Templates", href: "/discover" },
  { label: "Pricing", href: "/pricing" },
  { label: "Discover", href: "/discover" },
  { label: "Marketplace", href: "/discover" },
];

export function MarketingHeader() {
  const [open, setOpen] = useState(false);

  return (
    <header className="sticky top-0 z-50">
      <div className="bg-shade px-4 py-2 text-center text-[12px] font-medium text-white">
        <span className="mr-2 inline-flex items-center rounded-full bg-chartreuse px-2 py-0.5 text-[10px] font-bold uppercase tracking-wide text-shade">
          New
        </span>
        Sell products, collect emails and get paid — all in one link.{" "}
        <Link href="/pricing" className="underline decoration-white/40 underline-offset-2 hover:decoration-white">
          Learn more
        </Link>
      </div>
      <div className="border-b border-shade/10 bg-white/95 backdrop-blur">
        <div className="mx-auto flex h-[68px] w-full max-w-[1240px] items-center justify-between gap-6 px-5 sm:px-8">
          <Logo className="text-shade" />

          <nav className="hidden items-center gap-7 lg:flex" aria-label="Main">
            {NAV.map((item) => (
              <Link
                key={item.label}
                href={item.href}
                className="text-[14px] font-semibold text-shade/75 transition hover:text-shade"
              >
                {item.label}
              </Link>
            ))}
          </nav>

          <div className="hidden items-center gap-2.5 md:flex">
            <ButtonLink href="/login" variant="ghost" size="sm">
              Log in
            </ButtonLink>
            <ButtonLink href="/register" variant="primary" size="sm">
              Sign up free
            </ButtonLink>
          </div>

          <button
            type="button"
            className="grid h-10 w-10 place-items-center rounded-full border border-shade/15 text-shade md:hidden"
            onClick={() => setOpen((value) => !value)}
            aria-label={open ? "Close menu" : "Open menu"}
            aria-expanded={open}
          >
            {open ? <X className="h-5 w-5" /> : <Menu className="h-5 w-5" />}
          </button>
        </div>

        {open ? (
          <div className="border-t border-shade/10 bg-white px-5 py-5 md:hidden">
            <nav className="flex flex-col gap-1" aria-label="Mobile">
              {NAV.map((item) => (
                <Link
                  key={item.label}
                  href={item.href}
                  onClick={() => setOpen(false)}
                  className="rounded-xl px-3 py-3 text-[15px] font-semibold text-shade hover:bg-chalk"
                >
                  {item.label}
                </Link>
              ))}
            </nav>
            <div className="mt-4 flex gap-2">
              <ButtonLink href="/login" variant="outline" size="md" className="flex-1">
                Log in
              </ButtonLink>
              <ButtonLink href="/register" variant="primary" size="md" className="flex-1">
                Sign up free
              </ButtonLink>
            </div>
          </div>
        ) : null}
      </div>
    </header>
  );
}
