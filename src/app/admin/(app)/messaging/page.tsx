export const instant = false;

import { Inbox, MessageCircle, Sparkles } from "lucide-react";
import { Inbox as InboxView } from "@/components/admin/Inbox";
import { requireUser } from "@/lib/auth";

export const metadata = { title: "Messaging" };

export default async function MessagingPage() {
  const user = await requireUser();

  return (
    <div className="space-y-5">
      <header className="flex flex-col gap-3 sm:flex-row sm:items-end sm:justify-between">
        <div>
          <p className="text-[11px] font-bold uppercase tracking-[0.16em] text-shade/60">Grow & earn</p>
          <h1 className="mt-1 font-display text-[28px] font-extrabold tracking-[-0.03em] text-shade sm:text-[32px]">
            Messaging
          </h1>
          <p className="mt-1 text-[12.5px] text-shade/60">Every DM, email and enquiry in one inbox.</p>
        </div>
        <span className="inline-flex items-center gap-1.5 self-start rounded-full bg-chartreuse/40 px-3 py-1 text-[10.5px] font-bold uppercase tracking-wide text-forest">
          <Sparkles className="h-3 w-3" /> Auto-reply on
        </span>
      </header>

      <div className="grid gap-3 sm:grid-cols-3">
        {[
          { label: "Open conversations", value: "5", icon: MessageCircle },
          { label: "Unread", value: "3", icon: Inbox },
          { label: "Avg. reply time", value: "42m", icon: Sparkles },
        ].map(({ label, value, icon: Icon }) => (
          <div key={label} className="rounded-2xl border border-shade/10 bg-white p-4">
            <span className="inline-flex items-center gap-1.5 text-[10.5px] font-bold uppercase tracking-[0.1em] text-shade/60">
              <Icon className="h-3.5 w-3.5" /> {label}
            </span>
            <p className="mt-2 font-display text-[24px] font-extrabold leading-none tracking-tight text-shade">{value}</p>
          </div>
        ))}
      </div>

      <InboxView />

      <p className="text-center text-[10.5px] text-shade/50">
        Signed in as @{user.username}. Conversations here are sample data for the demo.
      </p>
    </div>
  );
}
