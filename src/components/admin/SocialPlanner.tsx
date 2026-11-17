"use client";

import { CalendarDays, ChevronLeft, ChevronRight, Clock, Plus, Trash2 } from "lucide-react";
import { useMemo, useState, useSyncExternalStore } from "react";
import { Button } from "@/components/ui/Button";
import { Field, Input, Select, Textarea } from "@/components/ui/Form";
import { Modal } from "@/components/ui/Modal";
import { PlatformBadge } from "@/components/ui/PlatformIcon";

type PlannedPost = {
  id: string;
  title: string;
  caption: string;
  platform: string;
  date: string; // yyyy-mm-dd
  time: string;
  status: "scheduled" | "draft";
};

const PLATFORM_OPTIONS = ["instagram", "tiktok", "youtube", "x", "linkedin"];

function isoDate(date: Date) {
  return `${date.getFullYear()}-${String(date.getMonth() + 1).padStart(2, "0")}-${String(date.getDate()).padStart(2, "0")}`;
}

function startOfWeek(base: Date) {
  const date = new Date(base);
  const day = date.getDay();
  const diff = day === 0 ? -6 : 1 - day;
  date.setDate(date.getDate() + diff);
  date.setHours(0, 0, 0, 0);
  return date;
}

function addDays(base: Date, amount: number) {
  const date = new Date(base);
  date.setDate(date.getDate() + amount);
  return date;
}

function buildSeed(today: Date): PlannedPost[] {
  const weekStart = startOfWeek(today);
  return [
    {
      id: "p1",
      title: "New icon set teaser",
      caption: "Sneak peek at the 40 new icons dropping Friday. Which one is your favourite? 👀",
      platform: "instagram",
      date: isoDate(addDays(weekStart, 0)),
      time: "10:00",
      status: "scheduled",
    },
    {
      id: "p2",
      title: "Behind the scenes",
      caption: "A quick look at how the set came together — grids, mistakes and all.",
      platform: "tiktok",
      date: isoDate(addDays(weekStart, 1)),
      time: "18:30",
      status: "scheduled",
    },
    {
      id: "p3",
      title: "Launch day",
      caption: "The icon set is live. Link in bio — 40% off this week only.",
      platform: "instagram",
      date: isoDate(addDays(weekStart, 3)),
      time: "09:00",
      status: "scheduled",
    },
    {
      id: "p4",
      title: "Newsletter draft",
      caption: "Five lessons from shipping a product in public.",
      platform: "linkedin",
      date: isoDate(addDays(weekStart, 4)),
      time: "12:00",
      status: "draft",
    },
    {
      id: "p5",
      title: "Weekend playlist",
      caption: "What I'm listening to while designing this weekend.",
      platform: "x",
      date: isoDate(addDays(weekStart, 5)),
      time: "16:00",
      status: "scheduled",
    },
  ];
}

export function SocialPlanner() {
  // Dates are resolved after mount so the server and browser never disagree
  // about "today" (timezone / clock differences). useSyncExternalStore returns
  // false during SSR/hydration and true on the client, with no effect needed.
  const mounted = useSyncExternalStore(
    () => () => {},
    () => true,
    () => false,
  );
  const today = useMemo(() => (mounted ? new Date() : null), [mounted]);
  const [added, setAdded] = useState<PlannedPost[]>([]);
  const [deleted, setDeleted] = useState<string[]>([]);
  const [offset, setOffset] = useState(0);
  const [open, setOpen] = useState(false);
  const [draft, setDraft] = useState({
    title: "",
    caption: "",
    platform: "instagram",
    date: "",
    time: "10:00",
    status: "scheduled" as PlannedPost["status"],
  });

  const posts = useMemo(
    () => (today ? [...buildSeed(today), ...added].filter((post) => !deleted.includes(post.id)) : []),
    [today, added, deleted],
  );

  const visibleStart = useMemo(
    () => (today ? addDays(startOfWeek(today), offset * 7) : null),
    [today, offset],
  );
  const days = useMemo(
    () => (visibleStart ? Array.from({ length: 7 }, (_, index) => addDays(visibleStart, index)) : []),
    [visibleStart],
  );

  if (!today || !visibleStart) {
    return (
      <div className="space-y-4" aria-busy="true">
        <div className="h-9 w-full max-w-[420px] animate-pulse rounded-full bg-white" />
        <div className="grid gap-2 sm:grid-cols-3">
          {[0, 1, 2].map((item) => (
            <div key={item} className="h-[68px] animate-pulse rounded-2xl border border-shade/10 bg-white" />
          ))}
        </div>
        <div className="h-[360px] animate-pulse rounded-3xl border border-shade/10 bg-white" />
      </div>
    );
  }

  const rangeLabel = `${visibleStart.toLocaleDateString("en-US", { month: "short", day: "numeric" })} – ${addDays(
    visibleStart,
    6,
  ).toLocaleDateString("en-US", { month: "short", day: "numeric", year: "numeric" })}`;

  const visibleKeys = new Set(days.map(isoDate));
  const scheduled = posts.filter((post) => post.status === "scheduled").length;
  const drafts = posts.filter((post) => post.status === "draft").length;

  function addPost() {
    const title = draft.title.trim() || "Untitled post";
    setAdded((current) => [
      ...current,
      {
        id: `post-${Date.now()}`,
        title,
        caption: draft.caption.trim(),
        platform: draft.platform,
        date: draft.date,
        time: draft.time || "10:00",
        status: draft.status,
      },
    ]);
    setOpen(false);
    setDraft((current) => ({ ...current, title: "", caption: "" }));
  }

  return (
    <div className="space-y-4">
      <div className="flex flex-wrap items-center justify-between gap-3">
        <div className="inline-flex items-center gap-1 rounded-full border border-shade/10 bg-white p-1">
          <button
            type="button"
            onClick={() => setOffset((value) => value - 1)}
            className="grid h-7 w-7 place-items-center rounded-full text-shade/60 transition hover:bg-chalk hover:text-shade"
            aria-label="Previous week"
          >
            <ChevronLeft className="h-4 w-4" />
          </button>
          <span className="min-w-[190px] px-2 text-center text-[11.5px] font-semibold text-shade">{rangeLabel}</span>
          <button
            type="button"
            onClick={() => setOffset((value) => value + 1)}
            className="grid h-7 w-7 place-items-center rounded-full text-shade/60 transition hover:bg-chalk hover:text-shade"
            aria-label="Next week"
          >
            <ChevronRight className="h-4 w-4" />
          </button>
        </div>

        <div className="flex items-center gap-2">
          {offset !== 0 ? (
            <Button type="button" variant="ghost" size="sm" onClick={() => setOffset(0)}>
              Today
            </Button>
          ) : null}
          <Button
            type="button"
            variant="primary"
            size="sm"
            onClick={() => {
              if (today) setDraft((current) => ({ ...current, date: isoDate(today) }));
              setOpen(true);
            }}
          >
            <Plus className="h-3.5 w-3.5" /> Schedule post
          </Button>
        </div>
      </div>

      <div className="grid grid-cols-3 gap-2">
        {[
          { label: "Scheduled", value: scheduled },
          { label: "Drafts", value: drafts },
          { label: "This week", value: posts.filter((post) => visibleKeys.has(post.date)).length },
        ].map((item) => (
          <div key={item.label} className="rounded-2xl border border-shade/10 bg-white px-3 py-3 sm:px-4">
            <p className="text-[10px] font-bold uppercase tracking-[0.1em] text-shade/60">{item.label}</p>
            <p className="mt-1 font-display text-[20px] font-extrabold leading-none text-shade">{item.value}</p>
          </div>
        ))}
      </div>

      {/* Week grid — scrolls horizontally on small screens instead of crushing 7 columns. */}
      <div className="overflow-hidden rounded-3xl border border-shade/10 bg-white">
        <div className="hide-scrollbar overflow-x-auto">
          <div className="min-w-[560px]">
            <div className="grid grid-cols-7 border-b border-shade/10 bg-chalk/50">
              {days.map((day) => {
                const isToday = isoDate(day) === isoDate(today);
                return (
                  <div key={day.toISOString()} className="px-1.5 py-2 text-center">
                    <p className="text-[9px] font-bold uppercase tracking-wide text-shade/60">
                      {day.toLocaleDateString("en-US", { weekday: "short" })}
                    </p>
                    <p
                      className={`mx-auto mt-1 grid h-6 w-6 place-items-center rounded-full text-[11px] font-bold ${
                        isToday ? "bg-shade text-white" : "text-shade/70"
                      }`}
                    >
                      {day.getDate()}
                    </p>
                  </div>
                );
              })}
            </div>

            <div className="grid grid-cols-7 divide-x divide-shade/[0.07]">
              {days.map((day) => {
                const key = isoDate(day);
                const dayPosts = posts
                  .filter((post) => post.date === key)
                  .sort((a, b) => a.time.localeCompare(b.time));
                return (
                  <div key={key} className="min-h-[180px] space-y-1.5 p-1.5">
                    {dayPosts.map((post) => (
                      <div
                        key={post.id}
                        className={`group relative rounded-lg border p-1.5 ${
                          post.status === "draft"
                            ? "border-dashed border-shade/20 bg-chalk/50"
                            : "border-shade/10 bg-white"
                        }`}
                      >
                        <div className="flex items-center gap-1">
                          <PlatformBadge platform={post.platform} size={14} />
                          <span className="text-[8.5px] font-semibold text-shade/60">{post.time}</span>
                          <button
                            type="button"
                            onClick={() => setDeleted((current) => [...current, post.id])}
                            className="ml-auto text-shade/20 transition hover:text-[#c43333]"
                            aria-label={`Delete ${post.title}`}
                          >
                            <Trash2 className="h-2.5 w-2.5" />
                          </button>
                        </div>
                        <p className="mt-1 line-clamp-3 text-[9.5px] font-semibold leading-tight text-shade">{post.title}</p>
                        {post.status === "draft" ? (
                          <span className="mt-1 inline-block rounded-full bg-shade/10 px-1.5 py-0.5 text-[7.5px] font-bold uppercase tracking-wide text-shade/60">
                            Draft
                          </span>
                        ) : null}
                      </div>
                    ))}
                    {dayPosts.length === 0 ? (
                      <button
                        type="button"
                        onClick={() => {
                          setDraft((current) => ({ ...current, date: key }));
                          setOpen(true);
                        }}
                        className="flex h-16 w-full items-center justify-center rounded-lg border border-dashed border-shade/10 text-shade/20 transition hover:border-grape/30 hover:text-grape"
                        aria-label={`Add post on ${day.toLocaleDateString()}`}
                      >
                        <Plus className="h-3.5 w-3.5" />
                      </button>
                    ) : null}
                  </div>
                );
              })}
            </div>
          </div>
        </div>
      </div>

      {/* Upcoming list */}
      <section className="rounded-3xl border border-shade/10 bg-white p-4 sm:p-5">
        <div className="flex items-center gap-2">
          <CalendarDays className="h-4 w-4 text-grape" />
          <h2 className="text-[13.5px] font-bold text-shade">All planned posts</h2>
        </div>
        <ul className="mt-3 divide-y divide-shade/10">
          {posts
            .slice()
            .sort((a, b) => `${a.date}${a.time}`.localeCompare(`${b.date}${b.time}`))
            .map((post) => (
              <li key={post.id} className="flex items-center gap-3 py-2.5">
                <PlatformBadge platform={post.platform} size={22} />
                <div className="min-w-0 flex-1">
                  <p className="truncate text-[12px] font-semibold text-shade">{post.title}</p>
                  <p className="truncate text-[10.5px] text-shade/60">{post.caption || "No caption yet."}</p>
                </div>
                <span className="flex flex-none items-center gap-1 text-[10px] text-shade/60">
                  <Clock className="h-3 w-3" />
                  {new Date(`${post.date}T00:00:00`).toLocaleDateString("en-US", { month: "short", day: "numeric" })}
                </span>
              </li>
            ))}
        </ul>
      </section>

      <Modal
        open={open}
        onClose={() => setOpen(false)}
        title="Schedule a post"
        description="Plan your content here — posts are saved locally in this demo."
        size="md"
      >
        <div className="space-y-4">
          <Field label="Post title" htmlFor="plan-title">
            <Input
              id="plan-title"
              value={draft.title}
              onChange={(event) => setDraft((current) => ({ ...current, title: event.target.value }))}
              placeholder="New icon set teaser"
            />
          </Field>
          <Field label="Caption" htmlFor="plan-caption">
            <Textarea
              id="plan-caption"
              rows={3}
              value={draft.caption}
              onChange={(event) => setDraft((current) => ({ ...current, caption: event.target.value }))}
              placeholder="What will you share?"
            />
          </Field>
          <div className="grid gap-3 sm:grid-cols-2">
            <Field label="Platform" htmlFor="plan-platform">
              <Select
                id="plan-platform"
                value={draft.platform}
                onChange={(event) => setDraft((current) => ({ ...current, platform: event.target.value }))}
              >
                {PLATFORM_OPTIONS.map((platform) => (
                  <option key={platform} value={platform}>
                    {platform.charAt(0).toUpperCase() + platform.slice(1)}
                  </option>
                ))}
              </Select>
            </Field>
            <Field label="Status" htmlFor="plan-status">
              <Select
                id="plan-status"
                value={draft.status}
                onChange={(event) =>
                  setDraft((current) => ({ ...current, status: event.target.value as PlannedPost["status"] }))
                }
              >
                <option value="scheduled">Scheduled</option>
                <option value="draft">Draft</option>
              </Select>
            </Field>
          </div>
          <div className="grid gap-3 sm:grid-cols-2">
            <Field label="Date" htmlFor="plan-date">
              <Input
                id="plan-date"
                type="date"
                value={draft.date}
                onChange={(event) => setDraft((current) => ({ ...current, date: event.target.value }))}
              />
            </Field>
            <Field label="Time" htmlFor="plan-time">
              <Input
                id="plan-time"
                type="time"
                value={draft.time}
                onChange={(event) => setDraft((current) => ({ ...current, time: event.target.value }))}
              />
            </Field>
          </div>
          <div className="flex justify-end gap-2 pt-1">
            <Button type="button" variant="ghost" onClick={() => setOpen(false)}>
              Cancel
            </Button>
            <Button type="button" variant="primary" onClick={addPost}>
              Add to calendar
            </Button>
          </div>
        </div>
      </Modal>
    </div>
  );
}
