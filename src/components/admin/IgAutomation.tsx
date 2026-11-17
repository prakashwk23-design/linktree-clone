"use client";

import { ArrowDown, Camera, Check, MessageCircle, Plus, Sparkles, Trash2, Zap } from "lucide-react";
import { useState } from "react";
import { Button } from "@/components/ui/Button";
import { Field, Input, Switch, Textarea } from "@/components/ui/Form";
import { Avatar } from "@/components/ui/Avatar";

type Rule = {
  id: string;
  keyword: string;
  reply: string;
  active: boolean;
  triggers: number;
};

const SEED: Rule[] = [
  {
    id: "r1",
    keyword: "link",
    reply: "Here's everything in one place 👉 linktr.ee/you — the new icon set is 40% off this week.",
    active: true,
    triggers: 412,
  },
  {
    id: "r2",
    keyword: "kit",
    reply: "The free drum kit lives here: linktr.ee/you/drums. Drop a 🔥 if you download it!",
    active: true,
    triggers: 187,
  },
  {
    id: "r3",
    keyword: "price",
    reply: "Presets start at $19. Full pricing and bundles are on my page — happy to help if you have questions.",
    active: true,
    triggers: 96,
  },
  {
    id: "r4",
    keyword: "collab",
    reply: "Thanks for reaching out! Send your brief to hello@you.com and I'll get back within 2 days.",
    active: false,
    triggers: 24,
  },
];

export function IgAutomation() {
  const [rules, setRules] = useState<Rule[]>(SEED);
  const [enabled, setEnabled] = useState(true);
  const [keyword, setKeyword] = useState("");
  const [reply, setReply] = useState("");
  const [preview, setPreview] = useState("link");

  const totalTriggers = rules.filter((rule) => rule.active).reduce((sum, rule) => sum + rule.triggers, 0);
  const activeRule = rules.find((rule) => rule.active && rule.keyword.toLowerCase() === preview.trim().toLowerCase());

  function addRule() {
    const clean = keyword.trim().toLowerCase();
    if (!clean || !reply.trim()) return;
    setRules((current) => [
      ...current,
      { id: `rule-${Date.now()}`, keyword: clean, reply: reply.trim(), active: true, triggers: 0 },
    ]);
    setKeyword("");
    setReply("");
  }

  function toggleRule(id: string) {
    setRules((current) =>
      current.map((rule) => (rule.id === id ? { ...rule, active: !rule.active } : rule)),
    );
  }

  return (
    <div className="grid gap-5 lg:grid-cols-[minmax(0,1fr)_340px]">
      <div className="space-y-4">
        <section className="rounded-3xl border border-shade/10 bg-white p-5">
          <div className="flex flex-wrap items-start justify-between gap-3">
            <div className="flex items-start gap-3">
              <span className="grid h-10 w-10 place-items-center rounded-2xl bg-[#ee2a7b]/10 text-[#c41f68]">
                <Camera className="h-5 w-5" />
              </span>
              <div>
                <h2 className="text-[14px] font-bold text-shade">Instagram auto-reply</h2>
                <p className="mt-0.5 max-w-[440px] text-[11.5px] leading-relaxed text-shade/60">
                  Send a link automatically when someone DMs you a keyword. Great for launches, freebies and FAQs.
                </p>
              </div>
            </div>
            <span
              className={`inline-flex items-center gap-1.5 rounded-full px-2.5 py-1 text-[10px] font-bold uppercase tracking-wide ${
                enabled ? "bg-forest/10 text-forest" : "bg-shade/10 text-shade/60"
              }`}
            >
              <Zap className="h-3 w-3" /> {enabled ? "Automation on" : "Paused"}
            </span>
          </div>

          <div className="mt-4 flex items-center justify-between gap-3 rounded-2xl bg-chalk/60 px-3.5 py-3">
            <p className="text-[11.5px] font-medium text-shade/55">
              {enabled ? "Replying to keyword DMs automatically." : "Auto-replies are paused."}
            </p>
            <Switch
              name="automation"
              label="Enable auto-reply"
              checked={enabled}
              onChange={(event) => setEnabled(event.target.checked)}
            />
          </div>

          <div className="mt-4 grid grid-cols-3 gap-2 border-t border-shade/10 pt-4">
            {[
              { label: "Active rules", value: rules.filter((rule) => rule.active).length },
              { label: "Replies sent", value: totalTriggers.toLocaleString() },
              { label: "Avg. open rate", value: "94%" },
            ].map((item) => (
              <div key={item.label} className="rounded-xl bg-chalk/70 px-3 py-2.5">
                <p className="text-[9.5px] font-bold uppercase tracking-[0.08em] text-shade/60">{item.label}</p>
                <p className="mt-1 font-display text-[18px] font-extrabold leading-none text-shade">{item.value}</p>
              </div>
            ))}
          </div>
        </section>

        <section className="rounded-3xl border border-shade/10 bg-white p-5">
          <div className="flex items-center justify-between">
            <h2 className="text-[13.5px] font-bold text-shade">Keyword rules</h2>
            <span className="text-[10.5px] text-shade/55">{rules.length} total</span>
          </div>

          <ul className="mt-3 space-y-2">
            {rules.map((rule) => (
              <li
                key={rule.id}
                className={`rounded-2xl border p-3 transition ${
                  rule.active ? "border-shade/10 bg-white" : "border-dashed border-shade/15 bg-chalk/40"
                }`}
              >
                <div className="flex items-start gap-2.5">
                  <span className="rounded-full bg-grape/10 px-2 py-0.5 text-[10px] font-bold text-grape">
                    {rule.keyword}
                  </span>
                  <span className="flex-1" />
                  <span className="flex-none text-[10px] text-shade/55">{rule.triggers} triggers</span>
                  <Switch
                    name={`rule-${rule.id}`}
                    label={rule.active ? "Pause rule" : "Activate rule"}
                    checked={rule.active}
                    onChange={() => toggleRule(rule.id)}
                  />
                  <button
                    type="button"
                    onClick={() => setRules((current) => current.filter((item) => item.id !== rule.id))}
                    className="grid h-6 w-6 flex-none place-items-center rounded-full text-shade/25 transition hover:bg-[#c43333]/10 hover:text-[#c43333]"
                    aria-label={`Delete ${rule.keyword} rule`}
                  >
                    <Trash2 className="h-3 w-3" />
                  </button>
                </div>
                <p className={`mt-2 text-[11.5px] leading-relaxed ${rule.active ? "text-shade/60" : "text-shade/55"}`}>
                  {rule.reply}
                </p>
              </li>
            ))}
          </ul>
        </section>

        <section className="rounded-3xl border border-shade/10 bg-white p-5">
          <h2 className="text-[13.5px] font-bold text-shade">Add a keyword rule</h2>
          <p className="mt-0.5 text-[11.5px] text-shade/60">When a DM contains this keyword, send the reply below.</p>
          <div className="mt-4 space-y-3">
            <Field label="Keyword" htmlFor="ig-keyword" hint="One word or short phrase, e.g. “link”.">
              <Input
                id="ig-keyword"
                value={keyword}
                onChange={(event) => setKeyword(event.target.value)}
                placeholder="link"
              />
            </Field>
            <Field label="Reply" htmlFor="ig-reply" hint={<span>{reply.length}/300</span>}>
              <Textarea
                id="ig-reply"
                rows={3}
                maxLength={300}
                value={reply}
                onChange={(event) => setReply(event.target.value)}
                placeholder="Here's the link you asked for 👉 …"
              />
            </Field>
            <div className="flex justify-end">
              <Button type="button" variant="primary" size="sm" onClick={addRule} disabled={!keyword.trim() || !reply.trim()}>
                <Plus className="h-3.5 w-3.5" /> Add rule
              </Button>
            </div>
          </div>
        </section>
      </div>

      {/* Preview */}
      <aside className="lg:sticky lg:top-24 lg:self-start">
        <div className="rounded-3xl border border-shade/10 bg-white p-4">
          <div className="flex items-center justify-between">
            <p className="text-[10.5px] font-bold uppercase tracking-[0.14em] text-shade/55">Flow preview</p>
            <span className="inline-flex items-center gap-1 rounded-full bg-chartreuse/40 px-2 py-0.5 text-[9px] font-bold uppercase tracking-wide text-forest">
              <Sparkles className="h-2.5 w-2.5" /> Live
            </span>
          </div>

          <div className="mt-3 flex items-center gap-2 rounded-2xl bg-chalk/60 px-3 py-2">
            <Avatar name="Aisha Patel" size={26} />
            <div className="min-w-0 flex-1">
              <p className="truncate text-[11px] font-semibold text-shade">Aisha Patel</p>
              <p className="text-[9.5px] text-shade/60">Direct message</p>
            </div>
          </div>

          <div className="mt-3 space-y-2">
            <div className="ml-auto w-fit max-w-[85%] rounded-2xl rounded-br-sm bg-grape px-3 py-2 text-[11px] text-white">
              {preview.trim() || "link"}
            </div>
            <div className="flex justify-center text-shade/20">
              <ArrowDown className="h-3 w-3" />
            </div>
            {activeRule ? (
              <div className="w-fit max-w-[90%] rounded-2xl rounded-bl-sm border border-shade/10 bg-white px-3 py-2 text-[11px] leading-relaxed text-shade/70">
                {activeRule.reply}
              </div>
            ) : (
              <div className="w-fit rounded-2xl border border-dashed border-shade/15 px-3 py-2 text-[10.5px] text-shade/55">
                No matching rule. Nothing is sent.
              </div>
            )}
          </div>

          <label className="mt-4 block">
            <span className="text-[10px] font-bold uppercase tracking-[0.1em] text-shade/55">Test a keyword</span>
            <input
              value={preview}
              onChange={(event) => setPreview(event.target.value)}
              className="mt-1.5 h-9 w-full rounded-full border border-shade/12 bg-chalk/60 px-3 text-[11.5px] text-shade outline-none focus:border-shade/30"
              placeholder="link"
            />
          </label>

          <div className="mt-3 space-y-1.5 rounded-xl bg-chartreuse/20 p-3">
            {[
              "Replies send within 1–2 seconds",
              "Works for keywords in any order",
              "Only one reply per conversation",
            ].map((item) => (
              <p key={item} className="flex items-start gap-1.5 text-[10px] leading-relaxed text-shade/55">
                <Check className="mt-0.5 h-2.5 w-2.5 flex-none text-forest" /> {item}
              </p>
            ))}
          </div>
        </div>

        <div className="mt-3 flex items-center gap-2 rounded-2xl border border-shade/10 bg-white px-3.5 py-3 text-[10.5px] text-shade/60">
          <MessageCircle className="h-3.5 w-3.5 flex-none" />
          Connect Instagram in Account to receive real DMs.
        </div>
      </aside>
    </div>
  );
}
