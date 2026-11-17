"use client";

import { ArrowUp, Bot, BookOpen, Loader2, Sparkles, X } from "lucide-react";
import { useRef, useState } from "react";

type Message = { role: "user" | "assistant"; text: string };

const SUGGESTIONS = [
  "Drive more link clicks",
  "Make my profile stand out",
  "Drive more visits to Linktree",
];

function greeting(): string {
  const hour = new Date().getHours();
  if (hour < 12) return "Good morning";
  if (hour < 18) return "Good afternoon";
  return "Good evening";
}

/** Offline fallback used when no AI key is configured or the provider fails. */
function replyFor(text: string): string {
  const value = text.toLowerCase();
  if (value.includes("click")) {
    return "Lead with your strongest link. Put your newest offer in the top slot, give it a clear title like “New drop — 40% off”, and hide links you are not actively promoting. Profiles with 3–6 focused links tend to get the highest click-through rate.";
  }
  if (value.includes("design") || value.includes("stand out") || value.includes("theme")) {
    return "Try a theme that matches your content, then keep the layout simple: one avatar, a two-line bio and 3–6 links. Bubblegum and Midnight are popular right now. You can change your look in Design and see it live before saving.";
  }
  if (value.includes("visit") || value.includes("traffic") || value.includes("grow") || value.includes("follow")) {
    return "Put your link everywhere people already find you: Instagram, TikTok, YouTube, X and your email signature. Post one clear call-to-action (“Everything is in my bio”), then check Insights to see which source sends the most visitors.";
  }
  if (value.includes("sell") || value.includes("product") || value.includes("earn")) {
    return "Start with one product you can deliver instantly — a preset pack, guide or 1:1 session. Add it in Earn, write a benefit-first title and link it near the top of your profile. Pro removes selling fees.";
  }
  return "I can help with links, design, analytics and growing your audience. Try asking “How do I get more clicks?” or “What should I put in my bio?”.";
}

export function AdminChat({ username }: { username: string }) {
  const [open, setOpen] = useState(false);
  const [messages, setMessages] = useState<Message[]>([
    {
      role: "assistant",
      text: `${greeting()}, ${username}. What would you like to work on today?`,
    },
  ]);
  const [value, setValue] = useState("");
  const [busy, setBusy] = useState(false);
  const inputRef = useRef<HTMLInputElement>(null);

  async function send(text: string) {
    const clean = text.trim();
    if (!clean || busy) return;

    const history = messages;
    setMessages((current) => [...current, { role: "user", text: clean }]);
    setValue("");
    setBusy(true);

    let answer = "";
    try {
      const response = await fetch("/api/ai/chat", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          message: clean,
          history: history.slice(-8).map((message) => ({ role: message.role, content: message.text })),
        }),
      });
      const data = (await response.json()) as { configured?: boolean; text?: string; error?: string };
      if (response.ok && data.configured && data.text) {
        answer = data.text;
      }
    } catch {
      // Network failure — fall back to the built-in guidance below.
    }

    setMessages((current) => [...current, { role: "assistant", text: answer || replyFor(clean) }]);
    setBusy(false);
    inputRef.current?.focus();
  }

  return (
    <>
      {open ? (
        <div className="fixed bottom-4 right-4 z-[60] flex h-[520px] w-[min(380px,calc(100vw-2rem))] flex-col overflow-hidden rounded-3xl border border-shade/10 bg-white shadow-2xl">
          <div className="flex items-center justify-between border-b border-shade/10 px-4 py-3">
            <div className="flex items-center gap-2">
              <span className="grid h-8 w-8 place-items-center rounded-full bg-grape text-white">
                <Sparkles className="h-4 w-4" />
              </span>
              <div>
                <p className="text-[13px] font-bold text-shade">Ask Linktree</p>
                <p className="text-[10.5px] text-shade/60">Help with your page</p>
              </div>
            </div>
            <div className="flex items-center gap-1">
              <button
                type="button"
                onClick={() => setMessages([{ role: "assistant", text: "New chat. What would you like to work on?" }])}
                className="grid h-8 w-8 place-items-center rounded-full text-shade/60 hover:bg-chalk hover:text-shade"
                aria-label="New chat"
              >
                <BookOpen className="h-4 w-4" />
              </button>
              <button
                type="button"
                onClick={() => setOpen(false)}
                className="grid h-8 w-8 place-items-center rounded-full text-shade/60 hover:bg-chalk hover:text-shade"
                aria-label="Close chat"
              >
                <X className="h-4 w-4" />
              </button>
            </div>
          </div>

          <div className="hide-scrollbar flex-1 space-y-3 overflow-y-auto px-4 py-4">
            {messages.map((message, index) => (
              <div
                key={index}
                className={`flex gap-2 ${message.role === "user" ? "justify-end" : "justify-start"}`}
              >
                {message.role === "assistant" ? (
                  <span className="mt-0.5 grid h-6 w-6 flex-none place-items-center rounded-full bg-grape/10 text-grape">
                    <Bot className="h-3.5 w-3.5" />
                  </span>
                ) : null}
                <p
                  className={`max-w-[85%] whitespace-pre-wrap rounded-2xl px-3.5 py-2.5 text-[12.5px] leading-relaxed ${
                    message.role === "user"
                      ? "rounded-br-sm bg-grape text-white"
                      : "rounded-bl-sm bg-chalk text-shade/80"
                  }`}
                >
                  {message.text}
                </p>
              </div>
            ))}

            {busy ? (
              <div className="flex gap-2">
                <span className="mt-0.5 grid h-6 w-6 flex-none place-items-center rounded-full bg-grape/10 text-grape">
                  <Bot className="h-3.5 w-3.5" />
                </span>
                <p className="flex items-center gap-1.5 rounded-2xl rounded-bl-sm bg-chalk px-3.5 py-2.5 text-[12.5px] text-shade/60">
                  <Loader2 className="h-3.5 w-3.5 animate-spin" /> Thinking…
                </p>
              </div>
            ) : null}

            {messages.length === 1 ? (
              <div className="space-y-1.5 pt-2">
                {SUGGESTIONS.map((suggestion) => (
                  <button
                    key={suggestion}
                    type="button"
                    onClick={() => void send(suggestion)}
                    className="flex w-full items-center justify-between gap-2 rounded-xl border border-shade/10 px-3 py-2.5 text-left text-[12px] font-medium text-shade/70 transition hover:border-grape/30 hover:bg-grape/[0.04] hover:text-shade"
                  >
                    {suggestion}
                    <ArrowUp className="h-3.5 w-3.5 rotate-45 text-shade/50" />
                  </button>
                ))}
              </div>
            ) : null}
          </div>

          <form
            className="border-t border-shade/10 p-3"
            onSubmit={(event) => {
              event.preventDefault();
              void send(value);
            }}
          >
            <div className="flex items-center gap-2 rounded-full border border-shade/15 bg-chalk/60 pl-3.5 pr-1.5">
              <input
                ref={inputRef}
                value={value}
                onChange={(event) => setValue(event.target.value)}
                placeholder="Ask Linktree…"
                className="h-10 flex-1 bg-transparent text-[12.5px] text-shade outline-none placeholder:text-shade/55"
                aria-label="Ask Linktree"
              />
              <button
                type="submit"
                disabled={!value.trim() || busy}
                className="grid h-8 w-8 place-items-center rounded-full bg-grape text-white transition disabled:opacity-30"
                aria-label="Send"
              >
                {busy ? <Loader2 className="h-4 w-4 animate-spin" /> : <ArrowUp className="h-4 w-4" />}
              </button>
            </div>
            <p className="mt-1.5 text-center text-[9.5px] text-shade/50">AI can make mistakes. Check important info.</p>
          </form>
        </div>
      ) : null}

      <button
        type="button"
        onClick={() => setOpen((current) => !current)}
        className="fixed bottom-4 right-4 z-50 flex items-center gap-2 rounded-full bg-shade px-4 py-3 text-[12.5px] font-semibold text-white shadow-xl transition hover:bg-grape"
        aria-label={open ? "Close Ask Linktree" : "Open Ask Linktree"}
      >
        <Sparkles className="h-4 w-4 text-chartreuse" />
        Ask Linktree
      </button>
    </>
  );
}
