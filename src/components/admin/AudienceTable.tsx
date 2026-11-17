"use client";

import { Mail, Plus, Search, UserPlus } from "lucide-react";
import { useMemo, useState } from "react";
import { addContactAction } from "@/app/actions";
import { Avatar } from "@/components/ui/Avatar";
import { Button } from "@/components/ui/Button";
import { Field, Input, Select } from "@/components/ui/Form";
import { Modal } from "@/components/ui/Modal";
import type { Contact } from "@/lib/types";

export function AudienceTable({ contacts }: { contacts: Contact[] }) {
  const [query, setQuery] = useState("");
  const [open, setOpen] = useState(false);

  const filtered = useMemo(() => {
    const value = query.trim().toLowerCase();
    if (!value) return contacts;
    return contacts.filter(
      (contact) =>
        contact.name.toLowerCase().includes(value) ||
        contact.email.toLowerCase().includes(value) ||
        contact.source.toLowerCase().includes(value),
    );
  }, [contacts, query]);

  return (
    <div>
      <div className="flex flex-col gap-3 sm:flex-row sm:items-center sm:justify-between">
        <div className="relative w-full sm:max-w-[280px]">
          <Search className="absolute left-3 top-1/2 h-4 w-4 -translate-y-1/2 text-shade/50" />
          <input
            value={query}
            onChange={(event) => setQuery(event.target.value)}
            placeholder="Search contacts…"
            className="h-10 w-full rounded-full border border-shade/15 bg-white pl-9 pr-4 text-[12.5px] text-shade outline-none transition focus:border-shade/35"
            aria-label="Search contacts"
          />
        </div>
        <Button type="button" variant="primary" size="sm" onClick={() => setOpen(true)}>
          <UserPlus className="h-3.5 w-3.5" /> Add contact
        </Button>
      </div>

      {contacts.length === 0 ? (
        <div className="mt-5 rounded-3xl border border-dashed border-shade/20 bg-white px-6 py-14 text-center">
          <span className="mx-auto grid h-12 w-12 place-items-center rounded-full bg-chartreuse/40 text-forest">
            <Mail className="h-5 w-5" />
          </span>
          <h2 className="mt-4 font-display text-[18px] font-bold text-shade">No contacts yet</h2>
          <p className="mt-1 text-[12.5px] text-shade/60">
            Collect emails from a form or newsletter link to start building your audience.
          </p>
          <Button type="button" variant="primary" size="md" className="mt-4" onClick={() => setOpen(true)}>
            <Plus className="h-4 w-4" /> Add your first contact
          </Button>
        </div>
      ) : (
        <div className="mt-4 overflow-hidden rounded-2xl border border-shade/10 bg-white">
          <table className="w-full text-left">
            <thead className="border-b border-shade/10 bg-chalk/60">
              <tr>
                <th className="px-4 py-3 text-[10px] font-bold uppercase tracking-[0.1em] text-shade/60">Name</th>
                <th className="hidden px-4 py-3 text-[10px] font-bold uppercase tracking-[0.1em] text-shade/60 sm:table-cell">
                  Email
                </th>
                <th className="px-4 py-3 text-[10px] font-bold uppercase tracking-[0.1em] text-shade/60">Source</th>
                <th className="hidden px-4 py-3 text-[10px] font-bold uppercase tracking-[0.1em] text-shade/60 md:table-cell">
                  Added
                </th>
                <th className="px-4 py-3" />
              </tr>
            </thead>
            <tbody className="divide-y divide-shade/10">
              {filtered.map((contact) => (
                <tr key={contact.id} className="transition hover:bg-chalk/40">
                  <td className="px-4 py-3">
                    <div className="flex items-center gap-2.5">
                      <Avatar name={contact.name} size={30} />
                      <div className="min-w-0">
                        <p className="truncate text-[12.5px] font-semibold text-shade">{contact.name}</p>
                        <p className="truncate text-[10.5px] text-shade/60 sm:hidden">{contact.email}</p>
                      </div>
                    </div>
                  </td>
                  <td className="hidden px-4 py-3 text-[12px] text-shade/60 sm:table-cell">{contact.email}</td>
                  <td className="px-4 py-3">
                    <span className="inline-flex rounded-full bg-chartreuse/35 px-2 py-0.5 text-[10px] font-semibold text-forest">
                      {contact.source}
                    </span>
                  </td>
                  <td className="hidden px-4 py-3 text-[11.5px] text-shade/60 md:table-cell">
                    {new Date(contact.created_at).toLocaleDateString("en-US", {
                      month: "short",
                      day: "numeric",
                      timeZone: "UTC",
                    })}
                  </td>
                  <td className="px-4 py-3 text-right">
                    <a
                      href={`mailto:${contact.email}`}
                      className="inline-grid h-7 w-7 place-items-center rounded-full text-shade/55 transition hover:bg-chalk hover:text-shade"
                      aria-label={`Email ${contact.name}`}
                    >
                      <Mail className="h-3.5 w-3.5" />
                    </a>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
          {filtered.length === 0 ? (
            <p className="px-4 py-8 text-center text-[12px] text-shade/60">No contacts match “{query}”.</p>
          ) : null}
        </div>
      )}

      <Modal
        open={open}
        onClose={() => setOpen(false)}
        title="Add a contact"
        description="Contacts can come from a newsletter, a form or a manual import."
        size="sm"
      >
        <form
          action={async (formData) => {
            await addContactAction(formData);
            setOpen(false);
          }}
          className="space-y-4"
        >
          <Field label="Name" htmlFor="contact-name">
            <Input id="contact-name" name="name" placeholder="Aisha Patel" required />
          </Field>
          <Field label="Email" htmlFor="contact-email">
            <Input id="contact-email" name="email" type="email" placeholder="aisha@example.com" required />
          </Field>
          <Field label="Source" htmlFor="contact-source">
            <Select id="contact-source" name="source" defaultValue="Linktree">
              <option>Linktree</option>
              <option>Newsletter</option>
              <option>Linktree form</option>
              <option>Instagram</option>
              <option>Event</option>
            </Select>
          </Field>
          <div className="flex justify-end gap-2">
            <Button type="button" variant="ghost" onClick={() => setOpen(false)}>
              Cancel
            </Button>
            <Button type="submit" variant="primary">
              Add contact
            </Button>
          </div>
        </form>
      </Modal>
    </div>
  );
}
