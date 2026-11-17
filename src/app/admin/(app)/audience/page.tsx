export const instant = false;

import { Download, Mail, UserPlus, Users } from "lucide-react";
import { AudienceTable } from "@/components/admin/AudienceTable";
import { ButtonLink } from "@/components/ui/Button";
import { requireUser } from "@/lib/auth";
import { getContacts } from "@/lib/data";

export const metadata = { title: "Audience" };

export default async function AudiencePage() {
  const user = await requireUser();
  const contacts = getContacts(user.id);
  const thisMonth = contacts.filter((contact) => {
    const date = new Date(contact.created_at);
    const now = new Date();
    return date.getMonth() === now.getMonth() && date.getFullYear() === now.getFullYear();
  }).length;
  const sources = contacts.reduce<Record<string, number>>((acc, contact) => {
    acc[contact.source] = (acc[contact.source] ?? 0) + 1;
    return acc;
  }, {});
  const topSource = Object.entries(sources).sort((a, b) => b[1] - a[1])[0]?.[0] ?? "—";

  return (
    <div className="space-y-5">
      <header className="flex flex-col gap-3 sm:flex-row sm:items-end sm:justify-between">
        <div>
          <p className="text-[11px] font-bold uppercase tracking-[0.16em] text-shade/60">Audience</p>
          <h1 className="mt-1 font-display text-[28px] font-extrabold tracking-[-0.03em] text-shade sm:text-[32px]">
            Your people
          </h1>
          <p className="mt-1 text-[12.5px] text-shade/60">
            Everyone who shared their details through your Linktree.
          </p>
        </div>
        <ButtonLink href="/api/analytics/export?type=contacts" external variant="outline" size="sm">
          <Download className="h-3.5 w-3.5" /> Export contacts
        </ButtonLink>
      </header>

      <div className="grid gap-3 sm:grid-cols-3">
        {[
          { label: "Total contacts", value: contacts.length.toLocaleString(), icon: Users },
          { label: "New this month", value: thisMonth.toLocaleString(), icon: UserPlus },
          { label: "Top source", value: topSource, icon: Mail },
        ].map(({ label, value, icon: Icon }) => (
          <div key={label} className="rounded-2xl border border-shade/10 bg-white p-4">
            <span className="inline-flex items-center gap-1.5 text-[10.5px] font-bold uppercase tracking-[0.1em] text-shade/60">
              <Icon className="h-3.5 w-3.5" /> {label}
            </span>
            <p className="mt-2 truncate font-display text-[26px] font-extrabold leading-none tracking-tight text-shade">
              {value}
            </p>
          </div>
        ))}
      </div>

      <section className="rounded-3xl border border-shade/10 bg-white p-4 sm:p-5">
        <AudienceTable contacts={contacts} />
      </section>

      <div className="rounded-2xl border border-dashed border-shade/15 bg-chartreuse/20 px-4 py-3.5 text-[11.5px] leading-relaxed text-shade/60">
        Connect a newsletter or add a sign-up form link to keep growing this list automatically. Contacts are stored
        locally in this demo.
      </div>
    </div>
  );
}
