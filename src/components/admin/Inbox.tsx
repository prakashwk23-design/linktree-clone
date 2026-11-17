"use client";

import { ArrowLeft, Check, CheckCheck, Paperclip, Search, Send, Smile } from "lucide-react";
import { useMemo, useRef, useState } from "react";
import { Avatar } from "@/components/ui/Avatar";

type Message = { id: string; from: "them" | "me"; text: string; time: string };
type Conversation = {
  id: string;
  name: string;
  handle: string;
  unread: number;
  platform: string;
  messages: Message[];
};

const SEED: Conversation[] = [
  {
    id: "c1",
    name: "Aisha Patel",
    handle: "@aishamakes",
    unread: 2,
    platform: "Instagram",
    messages: [
      { id: "m1", from: "them", text: "Hi! I loved your latest icon set. Is the commercial license included?", time: "9:41 AM" },
      { id: "m2", from: "me", text: "Hey Aisha! Yes — the download includes a full commercial license for unlimited projects.", time: "9:44 AM" },
      { id: "m3", from: "them", text: "Amazing. Can I use it inside a client template I resell?", time: "9:46 AM" },
      { id: "m4", from: "them", text: "Also, do you offer an extended license for teams?", time: "9:46 AM" },
    ],
  },
  {
    id: "c2",
    name: "Marcus Bell",
    handle: "@marcusbell",
    unread: 0,
    platform: "TikTok",
    messages: [
      { id: "m1", from: "them", text: "Yo! When does the drum kit drop? Been waiting since last week.", time: "Yesterday" },
      { id: "m2", from: "me", text: "Friday at 10am. Everyone on the list gets it an hour early.", time: "Yesterday" },
      { id: "m3", from: "them", text: "Bet. Just joined the list 🔥", time: "Yesterday" },
    ],
  },
  {
    id: "c3",
    name: "Northwind Studio",
    handle: "@northwind",
    unread: 1,
    platform: "Email",
    messages: [
      { id: "m1", from: "them", text: "Hello, we're planning a Q1 campaign and would love to discuss a partnership.", time: "Mon" },
      { id: "m2", from: "me", text: "Thanks for reaching out — happy to chat. Could you share the scope and timeline?", time: "Mon" },
      { id: "m3", from: "them", text: "Sure. Three posts across February with a link in bio. Budget is flexible.", time: "Mon" },
    ],
  },
  {
    id: "c4",
    name: "Sam Rivera",
    handle: "@eatwithsam",
    unread: 0,
    platform: "Instagram",
    messages: [
      { id: "m1", from: "them", text: "That recipe link page is so clean. Which theme is that?", time: "Sat" },
      { id: "m2", from: "me", text: "Paper, with rounded corners. It makes the food photos feel warmer.", time: "Sat" },
      { id: "m3", from: "them", text: "Stealing it, thank you 🙏", time: "Sat" },
    ],
  },
  {
    id: "c5",
    name: "Halo Audio",
    handle: "@haloaudio",
    unread: 0,
    platform: "Email",
    messages: [
      { id: "m1", from: "them", text: "We'd like to sponsor the next newsletter issue. What are the rates?", time: "Fri" },
      { id: "m2", from: "me", text: "Primary placement is $600. I can send the media kit over.", time: "Fri" },
      { id: "m3", from: "them", text: "Perfect, send it through.", time: "Fri" },
    ],
  },
];

const PLATFORM_TONE: Record<string, string> = {
  Instagram: "bg-[#ee2a7b]/10 text-[#c41f68]",
  TikTok: "bg-shade/10 text-shade",
  Email: "bg-cobalt/10 text-cobalt",
};

export function Inbox() {
  const [conversations, setConversations] = useState<Conversation[]>(SEED);
  const [activeId, setActiveId] = useState(SEED[0].id);
  const [query, setQuery] = useState("");
  const [value, setValue] = useState("");
  const [mobileThread, setMobileThread] = useState(false);
  const bottomRef = useRef<HTMLDivElement>(null);

  const active = conversations.find((conversation) => conversation.id === activeId) ?? conversations[0];

  const filtered = useMemo(() => {
    const clean = query.trim().toLowerCase();
    if (!clean) return conversations;
    return conversations.filter(
      (conversation) =>
        conversation.name.toLowerCase().includes(clean) || conversation.handle.toLowerCase().includes(clean),
    );
  }, [conversations, query]);

  function openConversation(id: string) {
    setActiveId(id);
    setMobileThread(true);
    setConversations((current) =>
      current.map((conversation) => (conversation.id === id ? { ...conversation, unread: 0 } : conversation)),
    );
  }

  function send() {
    const text = value.trim();
    if (!text) return;
    setConversations((current) =>
      current.map((conversation) =>
        conversation.id === activeId
          ? {
              ...conversation,
              messages: [
                ...conversation.messages,
                {
                  id: `sent-${Date.now()}`,
                  from: "me" as const,
                  text,
                  time: new Date().toLocaleTimeString("en-US", { hour: "numeric", minute: "2-digit" }),
                },
              ],
            }
          : conversation,
      ),
    );
    setValue("");
    window.setTimeout(() => bottomRef.current?.scrollIntoView({ behavior: "smooth" }), 50);
  }

  const unreadTotal = conversations.reduce((sum, conversation) => sum + conversation.unread, 0);

  return (
    <div className="overflow-hidden rounded-3xl border border-shade/10 bg-white">
      <div className="grid lg:grid-cols-[300px_minmax(0,1fr)]">
        {/* Conversation list */}
        <aside className={`border-shade/10 lg:border-r ${mobileThread ? "hidden lg:block" : "block"}`}>
          <div className="border-b border-shade/10 p-3.5">
            <div className="flex items-center justify-between">
              <h2 className="text-[13px] font-bold text-shade">Inbox</h2>
              <span className="rounded-full bg-grape/10 px-2 py-0.5 text-[10px] font-bold text-grape">
                {unreadTotal} new
              </span>
            </div>
            <div className="relative mt-2.5">
              <Search className="absolute left-3 top-1/2 h-3.5 w-3.5 -translate-y-1/2 text-shade/50" />
              <input
                value={query}
                onChange={(event) => setQuery(event.target.value)}
                placeholder="Search messages…"
                className="h-9 w-full rounded-full border border-shade/12 bg-chalk/60 pl-8 pr-3 text-[12px] text-shade outline-none transition focus:border-shade/30"
                aria-label="Search messages"
              />
            </div>
          </div>

          <ul className="hide-scrollbar max-h-[420px] overflow-y-auto lg:max-h-[560px]">
            {filtered.map((conversation) => {
              const last = conversation.messages[conversation.messages.length - 1];
              const isActive = conversation.id === activeId;
              return (
                <li key={conversation.id}>
                  <button
                    type="button"
                    onClick={() => openConversation(conversation.id)}
                    className={`flex w-full items-start gap-2.5 border-b border-shade/[0.06] px-3.5 py-3 text-left transition ${
                      isActive ? "bg-grape/[0.05]" : "hover:bg-chalk/60"
                    }`}
                  >
                    <Avatar name={conversation.name} size={34} />
                    <span className="min-w-0 flex-1">
                      <span className="flex items-center gap-1.5">
                        <span className="truncate text-[12.5px] font-semibold text-shade">{conversation.name}</span>
                        <span className="ml-auto flex-none text-[9.5px] text-shade/50">{last?.time}</span>
                      </span>
                      <span className="mt-0.5 flex items-center gap-1.5">
                        <span className={`rounded-full px-1.5 py-0.5 text-[8.5px] font-bold uppercase tracking-wide ${PLATFORM_TONE[conversation.platform] ?? "bg-chalk text-shade/50"}`}>
                          {conversation.platform}
                        </span>
                        {conversation.unread > 0 ? (
                          <span className="grid h-4 min-w-4 place-items-center rounded-full bg-grape px-1 text-[9px] font-bold text-white">
                            {conversation.unread}
                          </span>
                        ) : null}
                      </span>
                      <span className="mt-1 block truncate text-[11px] text-shade/60">{last?.text}</span>
                    </span>
                  </button>
                </li>
              );
            })}
            {filtered.length === 0 ? (
              <li className="px-4 py-10 text-center text-[12px] text-shade/60">No conversations match “{query}”.</li>
            ) : null}
          </ul>
        </aside>

        {/* Thread */}
        <section className={`flex min-h-[520px] flex-col ${mobileThread ? "flex" : "hidden lg:flex"}`}>
          <header className="flex items-center gap-2.5 border-b border-shade/10 px-4 py-3">
            <button
              type="button"
              onClick={() => setMobileThread(false)}
              className="grid h-8 w-8 place-items-center rounded-full text-shade/50 hover:bg-chalk lg:hidden"
              aria-label="Back to conversations"
            >
              <ArrowLeft className="h-4 w-4" />
            </button>
            <Avatar name={active.name} size={36} />
            <div className="min-w-0 flex-1">
              <p className="truncate text-[13px] font-bold text-shade">{active.name}</p>
              <p className="truncate text-[10.5px] text-shade/60">
                {active.handle} · via {active.platform}
              </p>
            </div>
            <span className="hidden items-center gap-1 rounded-full bg-forest/10 px-2 py-1 text-[9.5px] font-bold uppercase tracking-wide text-forest sm:inline-flex">
              <span className="h-1.5 w-1.5 rounded-full bg-forest" /> Open
            </span>
          </header>

          <div className="hide-scrollbar flex-1 space-y-3 overflow-y-auto bg-chalk/40 px-4 py-4">
            {active.messages.map((message) => (
              <div
                key={message.id}
                className={`flex ${message.from === "me" ? "justify-end" : "justify-start"}`}
              >
                <div className={`max-w-[78%] ${message.from === "me" ? "text-right" : "text-left"}`}>
                  <p
                    className={`inline-block rounded-2xl px-3.5 py-2.5 text-left text-[12.5px] leading-relaxed ${
                      message.from === "me"
                        ? "rounded-br-sm bg-grape text-white"
                        : "rounded-bl-sm border border-shade/10 bg-white text-shade/75"
                    }`}
                  >
                    {message.text}
                  </p>
                  <p className="mt-1 flex items-center gap-1 text-[9.5px] text-shade/50" style={{ justifyContent: message.from === "me" ? "flex-end" : "flex-start" }}>
                    {message.time}
                    {message.from === "me" ? <CheckCheck className="h-3 w-3 text-grape/60" /> : null}
                  </p>
                </div>
              </div>
            ))}
            <div ref={bottomRef} />
          </div>

          <form
            className="border-t border-shade/10 p-3"
            onSubmit={(event) => {
              event.preventDefault();
              send();
            }}
          >
            <div className="flex items-end gap-2 rounded-2xl border border-shade/12 bg-white p-1.5 pl-3">
              <button
                type="button"
                className="grid h-8 w-8 flex-none place-items-center rounded-full text-shade/55 hover:bg-chalk hover:text-shade"
                aria-label="Attach a file"
              >
                <Paperclip className="h-4 w-4" />
              </button>
              <textarea
                value={value}
                onChange={(event) => setValue(event.target.value)}
                onKeyDown={(event) => {
                  if (event.key === "Enter" && !event.shiftKey) {
                    event.preventDefault();
                    send();
                  }
                }}
                rows={1}
                placeholder={`Message ${active.name}…`}
                className="max-h-24 min-h-9 flex-1 resize-none bg-transparent py-2 text-[12.5px] text-shade outline-none placeholder:text-shade/50"
                aria-label="Message"
              />
              <button
                type="button"
                className="grid h-8 w-8 flex-none place-items-center rounded-full text-shade/55 hover:bg-chalk hover:text-shade"
                aria-label="Add emoji"
              >
                <Smile className="h-4 w-4" />
              </button>
              <button
                type="submit"
                disabled={!value.trim()}
                className="grid h-8 w-8 flex-none place-items-center rounded-full bg-grape text-white transition disabled:opacity-30"
                aria-label="Send message"
              >
                <Send className="h-3.5 w-3.5" />
              </button>
            </div>
            <p className="mt-1.5 flex items-center gap-1 px-1 text-[9.5px] text-shade/50">
              <Check className="h-3 w-3" /> Messages are stored locally in this demo.
            </p>
          </form>
        </section>
      </div>
    </div>
  );
}
