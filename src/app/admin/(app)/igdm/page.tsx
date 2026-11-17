export const instant = false;

import { Camera } from "lucide-react";
import { IgAutomation } from "@/components/admin/IgAutomation";
import { requireUser } from "@/lib/auth";

export const metadata = { title: "Instagram auto-reply" };

export default async function IgdmPage() {
  const user = await requireUser();

  return (
    <div className="space-y-5">
      <header className="flex flex-col gap-3 sm:flex-row sm:items-end sm:justify-between">
        <div>
          <p className="text-[11px] font-bold uppercase tracking-[0.16em] text-shade/60">Tools</p>
          <h1 className="mt-1 font-display text-[28px] font-extrabold tracking-[-0.03em] text-shade sm:text-[32px]">
            Instagram auto-reply
          </h1>
          <p className="mt-1 text-[12.5px] text-shade/60">
            Turn DMs into link clicks with keyword-triggered replies.
          </p>
        </div>
        <span className="inline-flex items-center gap-1.5 self-start rounded-full border border-shade/15 bg-white px-3 py-1 text-[10.5px] font-bold uppercase tracking-wide text-shade/50">
          <Camera className="h-3 w-3" /> @{user.username}
        </span>
      </header>

      <IgAutomation />

      <p className="text-center text-[10.5px] text-shade/50">
        Auto-replies are simulated in this demo. No messages are sent to Instagram.
      </p>
    </div>
  );
}
