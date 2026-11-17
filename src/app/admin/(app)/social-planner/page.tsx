export const instant = false;

import { Sparkles } from "lucide-react";
import { SocialPlanner } from "@/components/admin/SocialPlanner";
import { requireUser } from "@/lib/auth";

export const metadata = { title: "Social planner" };

export default async function SocialPlannerPage() {
  const user = await requireUser();

  return (
    <div className="space-y-5">
      <header className="flex flex-col gap-3 sm:flex-row sm:items-end sm:justify-between">
        <div>
          <p className="text-[11px] font-bold uppercase tracking-[0.16em] text-shade/60">Tools</p>
          <h1 className="mt-1 font-display text-[28px] font-extrabold tracking-[-0.03em] text-shade sm:text-[32px]">
            Social planner
          </h1>
          <p className="mt-1 text-[12.5px] text-shade/60">
            Plan a week of content for @{user.username} and keep every platform in sync.
          </p>
        </div>
        <span className="inline-flex items-center gap-1.5 self-start rounded-full bg-grape/10 px-3 py-1 text-[10.5px] font-bold uppercase tracking-wide text-grape">
          <Sparkles className="h-3 w-3" /> Premium tool preview
        </span>
      </header>

      <SocialPlanner />
    </div>
  );
}
