export const instant = false;

import { MousePointerClick, Link2 } from "lucide-react";
import { ShortLinkManager } from "@/components/admin/ShortLinkManager";
import { requireUser } from "@/lib/auth";
import { getShortLinks } from "@/lib/data";

export const metadata = { title: "Link shortener" };

export default async function LinkShortenerPage() {
  const user = await requireUser();
  const shortLinks = getShortLinks(user.id);
  const clicks = shortLinks.reduce((sum, link) => sum + link.clicks, 0);
  const top = shortLinks.slice().sort((a, b) => b.clicks - a.clicks)[0];

  return (
    <div className="space-y-5">
      <header>
        <p className="text-[11px] font-bold uppercase tracking-[0.16em] text-shade/60">Tools</p>
        <h1 className="mt-1 font-display text-[28px] font-extrabold tracking-[-0.03em] text-shade sm:text-[32px]">
          Link shortener
        </h1>
        <p className="mt-1 text-[12.5px] text-shade/60">
          Clean links, custom codes and click tracking — built into your Linktree.
        </p>
      </header>

      <div className="grid gap-3 sm:grid-cols-3">
        {[
          { label: "Short links", value: shortLinks.length.toLocaleString(), icon: Link2 },
          { label: "Total clicks", value: clicks.toLocaleString(), icon: MousePointerClick },
          { label: "Top link", value: top ? `/s/${top.code}` : "—", icon: MousePointerClick },
        ].map(({ label, value, icon: Icon }) => (
          <div key={label} className="rounded-2xl border border-shade/10 bg-white p-4">
            <span className="inline-flex items-center gap-1.5 text-[10.5px] font-bold uppercase tracking-[0.1em] text-shade/60">
              <Icon className="h-3.5 w-3.5" /> {label}
            </span>
            <p className="mt-2 truncate font-display text-[24px] font-extrabold leading-none tracking-tight text-shade">
              {value}
            </p>
          </div>
        ))}
      </div>

      <ShortLinkManager shortLinks={shortLinks} />
    </div>
  );
}
