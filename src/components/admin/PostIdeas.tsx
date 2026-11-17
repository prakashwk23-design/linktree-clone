"use client";

import { Bookmark, BookmarkCheck, Lightbulb, Loader2, RefreshCw, Sparkles, Wand2 } from "lucide-react";
import Link from "next/link";
import { useState } from "react";
import { Button } from "@/components/ui/Button";

type Idea = {
  id: string;
  title: string;
  hook: string;
  format: string;
  platform: string;
  category: string;
};

const CATEGORIES = ["For you", "Behind the scenes", "Educational", "Promotional", "Personal"] as const;

const IDEAS: Idea[] = [
  {
    id: "i1",
    title: "The 3 tools I use every day",
    hook: "Open with the result, then reveal the stack. “This took 20 minutes. Here's exactly what I used.”",
    format: "Carousel · 6 slides",
    platform: "Instagram",
    category: "Educational",
  },
  {
    id: "i2",
    title: "Before / after one small change",
    hook: "Show the messy version first. People stop for transformation, not perfection.",
    format: "Reel · 15s",
    platform: "Instagram",
    category: "Behind the scenes",
  },
  {
    id: "i3",
    title: "What's inside the new drop",
    hook: "Unbox it on camera. One item per cut, price on the last frame.",
    format: "Reel · 30s",
    platform: "TikTok",
    category: "Promotional",
  },
  {
    id: "i4",
    title: "The mistake that cost me a week",
    hook: "Vulnerable, specific, useful. End with the fix so it feels worth saving.",
    format: "Talking head · 45s",
    platform: "TikTok",
    category: "Personal",
  },
  {
    id: "i5",
    title: "Answer the DM you get most",
    hook: "“I get this question every day, so here's the full answer.”",
    format: "Story set · 3 frames",
    platform: "Instagram",
    category: "Educational",
  },
  {
    id: "i6",
    title: "A day in the studio",
    hook: "Start mid-action. No intro, no “hey guys” — just the work.",
    format: "Vlog · 60s",
    platform: "YouTube",
    category: "Behind the scenes",
  },
  {
    id: "i7",
    title: "Three ways to use my product",
    hook: "One product, three outcomes. Ends with the link in bio.",
    format: "Carousel · 5 slides",
    platform: "Instagram",
    category: "Promotional",
  },
  {
    id: "i8",
    title: "The advice I'd give my younger self",
    hook: "Pick one lesson, say it plainly, then tell the story behind it.",
    format: "Text post · 1 image",
    platform: "LinkedIn",
    category: "Personal",
  },
  {
    id: "i9",
    title: "Break down a trend in your niche",
    hook: "React to a trend and explain why it works — not just that it exists.",
    format: "Reel · 25s",
    platform: "TikTok",
    category: "Educational",
  },
  {
    id: "i10",
    title: "Pack an order with me",
    hook: "Satisfying, quiet, oddly watchable. Slow hands, close shots.",
    format: "Reel · 20s",
    platform: "Instagram",
    category: "Behind the scenes",
  },
  {
    id: "i11",
    title: "Last call for the launch price",
    hook: "State the deadline in the first two seconds. Show the timer or the date.",
    format: "Story · 1 frame",
    platform: "Instagram",
    category: "Promotional",
  },
  {
    id: "i12",
    title: "What I'd do differently starting over",
    hook: "Three concrete changes. No vague motivation.",
    format: "Thread · 5 posts",
    platform: "X",
    category: "Personal",
  },
  {
    id: "i13",
    title: "A 60-second tutorial",
    hook: "Promise the outcome up front, then deliver it step by step.",
    format: "Reel · 60s",
    platform: "YouTube",
    category: "Educational",
  },
  {
    id: "i14",
    title: "Show the messy middle",
    hook: "Everyone posts the finished thing. Post the seventh draft instead.",
    format: "Photo set · 4 images",
    platform: "Instagram",
    category: "Behind the scenes",
  },
  {
    id: "i15",
    title: "A customer story",
    hook: "Let them say it in their words. Keep your face out of it.",
    format: "Quote post · 1 image",
    platform: "LinkedIn",
    category: "Promotional",
  },
  {
    id: "i16",
    title: "The weekly reset",
    hook: "A calm, repeatable routine people can copy on Sunday night.",
    format: "Reel · 40s",
    platform: "TikTok",
    category: "Personal",
  },
];

const PILLARS = [
  { label: "Teach", note: "Short, useful, saveable", pct: 40, tone: "bg-grape" },
  { label: "Show", note: "Process and proof", pct: 30, tone: "bg-cobalt" },
  { label: "Sell", note: "Offers and launches", pct: 20, tone: "bg-chartreuse" },
  { label: "Share", note: "Opinions and story", pct: 10, tone: "bg-[#780016]" },
];

function shuffle<T>(items: T[]): T[] {
  const copy = [...items];
  for (let i = copy.length - 1; i > 0; i -= 1) {
    const j = Math.floor(Math.random() * (i + 1));
    [copy[i], copy[j]] = [copy[j], copy[i]];
  }
  return copy;
}

export function PostIdeas({ username }: { username: string }) {
  const [category, setCategory] = useState<(typeof CATEGORIES)[number]>("For you");
  const [results, setResults] = useState<Idea[]>(() => IDEAS.slice(0, 4));
  const [saved, setSaved] = useState<Idea[]>([]);
  const [busy, setBusy] = useState(false);
  const [aiUsed, setAiUsed] = useState(false);

  async function generate(next: (typeof CATEGORIES)[number]) {
    setBusy(true);
    // Try the real AI first; fall back to the built-in idea bank when no key
    // is configured or the provider is unavailable.
    try {
      const response = await fetch("/api/ai/post-ideas", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ category: next }),
      });
      const data = (await response.json()) as {
        configured?: boolean;
        ideas?: { title: string; hook: string; format: string; platform: string; category: string }[];
      };
      if (response.ok && data.configured && data.ideas && data.ideas.length > 0) {
        setResults(
          data.ideas.map((idea, index) => ({ ...idea, id: `ai-${Date.now()}-${index}` })),
        );
        setAiUsed(true);
        setBusy(false);
        return;
      }
    } catch {
      // Offline / provider error — use the built-in bank.
    }

    const pool = next === "For you" ? IDEAS : IDEAS.filter((idea) => idea.category === next);
    setResults(shuffle(pool).slice(0, 4));
    setAiUsed(false);
    setBusy(false);
  }

  function chooseCategory(next: (typeof CATEGORIES)[number]) {
    setCategory(next);
    void generate(next);
  }

  function toggleSave(idea: Idea) {
    setSaved((current) =>
      current.some((item) => item.id === idea.id) ? current.filter((item) => item.id !== idea.id) : [...current, idea],
    );
  }

  const savedIdeas = saved;

  return (
    <div className="grid gap-5 lg:grid-cols-[minmax(0,1fr)_320px]">
      <div className="min-w-0 space-y-4">
        <section className="rounded-3xl border border-shade/10 bg-white p-5">
          <div className="flex flex-wrap items-center justify-between gap-3">
            <div className="flex items-center gap-2.5">
              <span className="grid h-10 w-10 place-items-center rounded-2xl bg-chartreuse/40 text-forest">
                <Wand2 className="h-5 w-5" />
              </span>
              <div>
                <h2 className="flex items-center gap-1.5 text-[14px] font-bold text-shade">
                  Idea generator
                  {aiUsed ? (
                    <span className="rounded-full bg-grape/10 px-1.5 py-0.5 text-[9px] font-bold uppercase tracking-wide text-grape">
                      AI
                    </span>
                  ) : null}
                </h2>
                <p className="text-[11.5px] text-shade/60">Fresh angles for @{username}, ready to plan.</p>
              </div>
            </div>
            <Button type="button" variant="dark" size="sm" onClick={() => void generate(category)} disabled={busy}>
              {busy ? <Loader2 className="h-3.5 w-3.5 animate-spin" /> : <RefreshCw className="h-3.5 w-3.5" />}
              {busy ? "Thinking…" : "New ideas"}
            </Button>
          </div>

          <div className="hide-scrollbar mt-4 flex gap-1.5 overflow-x-auto border-b border-shade/10 pb-px">
            {CATEGORIES.map((item) => (
              <button
                key={item}
                type="button"
                onClick={() => chooseCategory(item)}
                className={`whitespace-nowrap border-b-2 px-3 py-2 text-[11.5px] font-semibold transition ${
                  category === item ? "border-grape text-shade" : "border-transparent text-shade/60 hover:text-shade"
                }`}
              >
                {item}
              </button>
            ))}
          </div>

          <div className="mt-4 grid gap-3 sm:grid-cols-2">
            {results.map((idea) => {
              const isSaved = saved.some((item) => item.id === idea.id);
              return (
                <article key={idea.id} className="flex flex-col rounded-2xl border border-shade/10 bg-chalk/40 p-3.5">
                  <div className="flex items-center gap-1.5">
                    <span className="rounded-full bg-white px-2 py-0.5 text-[9px] font-bold uppercase tracking-wide text-shade/50">
                      {idea.platform}
                    </span>
                    <span className="rounded-full bg-grape/10 px-2 py-0.5 text-[9px] font-bold uppercase tracking-wide text-grape">
                      {idea.format.split(" · ")[0]}
                    </span>
                    <button
                      type="button"
                      onClick={() => toggleSave(idea)}
                      className={`ml-auto grid h-7 w-7 place-items-center rounded-full transition ${
                        isSaved ? "bg-forest/10 text-forest" : "text-shade/50 hover:bg-white hover:text-shade"
                      }`}
                      aria-label={isSaved ? `Unsave ${idea.title}` : `Save ${idea.title}`}
                    >
                      {isSaved ? <BookmarkCheck className="h-3.5 w-3.5" /> : <Bookmark className="h-3.5 w-3.5" />}
                    </button>
                  </div>
                  <h3 className="mt-2 text-[13px] font-bold leading-snug text-shade">{idea.title}</h3>
                  <p className="mt-1 flex-1 text-[11px] leading-relaxed text-shade/55">{idea.hook}</p>
                  <p className="mt-2.5 border-t border-shade/10 pt-2 text-[10px] font-medium text-shade/55">
                    {idea.format}
                  </p>
                </article>
              );
            })}
          </div>
        </section>

        <section className="rounded-3xl border border-shade/10 bg-white p-5">
          <div className="flex items-center gap-2">
            <Lightbulb className="h-4 w-4 text-grape" />
            <h2 className="text-[13.5px] font-bold text-shade">A balanced content mix</h2>
          </div>
          <p className="mt-1 text-[11.5px] text-shade/60">
            Keep these four pillars in rotation so your feed never becomes one long sales pitch.
          </p>
          <div className="mt-4 grid gap-2 sm:grid-cols-4">
            {PILLARS.map((pillar) => (
              <div key={pillar.label} className="rounded-2xl border border-shade/10 p-3">
                <span className={`block h-1.5 w-8 rounded-full ${pillar.tone}`} />
                <p className="mt-2 text-[12px] font-bold text-shade">{pillar.label}</p>
                <p className="text-[10px] text-shade/60">{pillar.note}</p>
                <p className="mt-2 font-display text-[18px] font-extrabold leading-none text-shade">{pillar.pct}%</p>
              </div>
            ))}
          </div>
        </section>
      </div>

      <aside className="lg:sticky lg:top-24 lg:self-start">
        <div className="rounded-3xl border border-shade/10 bg-white p-4">
          <div className="flex items-center justify-between">
            <h2 className="text-[13px] font-bold text-shade">Saved ideas</h2>
            <span className="text-[10.5px] text-shade/55">{savedIdeas.length}</span>
          </div>

          {savedIdeas.length === 0 ? (
            <p className="mt-3 rounded-xl border border-dashed border-shade/15 px-3 py-6 text-center text-[11px] leading-relaxed text-shade/60">
              Save an idea and it will show up here.
            </p>
          ) : (
            <ul className="mt-3 space-y-2">
              {savedIdeas.map((idea) => (
                <li key={idea.id} className="flex items-start gap-2 rounded-xl bg-chalk/60 px-3 py-2.5">
                  <Sparkles className="mt-0.5 h-3 w-3 flex-none text-grape" />
                  <span className="min-w-0 flex-1">
                    <span className="block text-[11.5px] font-semibold leading-snug text-shade">{idea.title}</span>
                    <span className="mt-0.5 block text-[9.5px] text-shade/55">{idea.format}</span>
                  </span>
                  <button
                    type="button"
                    onClick={() => toggleSave(idea)}
                    className="text-shade/25 transition hover:text-[#c43333]"
                    aria-label={`Remove ${idea.title}`}
                  >
                    <BookmarkCheck className="h-3.5 w-3.5" />
                  </button>
                </li>
              ))}
            </ul>
          )}

          <p className="mt-3 text-[10px] leading-relaxed text-shade/55">
            Saved ideas live in this browser session. Use the social planner to put them on a date.
          </p>
        </div>

        <div className="mt-3 rounded-3xl bg-grape p-4 text-white">
          <p className="text-[9.5px] font-bold uppercase tracking-[0.14em] text-chartreuse">Next step</p>
          <h3 className="mt-1.5 font-display text-[17px] font-bold leading-tight">Turn an idea into a post.</h3>
          <p className="mt-1.5 text-[11px] leading-relaxed text-white/60">
            Pick a format, write the hook, and schedule it before the week fills up.
          </p>
          <Link
            href="/admin/social-planner"
            className="mt-3 inline-flex items-center gap-1.5 rounded-full bg-chartreuse px-3 py-1.5 text-[11px] font-bold text-shade"
          >
            Open planner
          </Link>
        </div>
      </aside>
    </div>
  );
}
