"use client";

import { Check, ExternalLink, Loader2, Save } from "lucide-react";
import { useActionState, useState } from "react";
import { updateHeaderAction } from "@/app/actions";
import { ProfileBody, type ProfileUser } from "@/components/profile/ProfileBody";
import { Phone } from "@/components/site/Phone";
import { Avatar } from "@/components/ui/Avatar";
import { Button } from "@/components/ui/Button";
import { Field, Input, Textarea } from "@/components/ui/Form";
import type { Collection, Link as LinkRow, Social, User } from "@/lib/types";

const LAYOUTS = [
  { id: "classic", label: "Classic" },
  { id: "hero", label: "Hero" },
  { id: "banner", label: "Banner" },
  { id: "cutout", label: "Cutout" },
  { id: "shape", label: "Shape" },
];

function LayoutThumb({ id }: { id: string }) {
  return (
    <span className="relative block h-[52px] w-full overflow-hidden rounded-lg bg-chalk">
      {id === "banner" ? <span className="absolute inset-x-0 top-0 h-4 bg-shade/20" /> : null}
      <span
        className={`absolute left-1/2 top-1/2 -translate-x-1/2 -translate-y-1/2 bg-shade/35 ${
          id === "shape" ? "h-6 w-6 rounded-md" : "rounded-full"
        } ${id === "hero" ? "h-8 w-8" : "h-6 w-6"} ${id === "cutout" ? "ring-2 ring-white" : ""}`}
      />
      <span className="absolute bottom-2.5 left-1/2 h-1 w-8 -translate-x-1/2 rounded-full bg-shade/20" />
      <span className="absolute bottom-1.5 left-1/2 h-1 w-5 -translate-x-1/2 rounded-full bg-shade/10" />
    </span>
  );
}

export function HeaderEditor({
  user,
  links,
  socials,
  collections,
}: {
  user: User;
  links: LinkRow[];
  socials: Social[];
  collections: Collection[];
}) {
  const [state, action, pending] = useActionState(updateHeaderAction, {});
  const [title, setTitle] = useState(user.name);
  const [bio, setBio] = useState(user.bio);
  const [username, setUsername] = useState(user.username);
  const [avatar, setAvatar] = useState(user.avatar);
  const [layout, setLayout] = useState(user.layout || "classic");
  const [titleStyle, setTitleStyle] = useState(user.title_style || "text");

  const previewUser: ProfileUser = {
    username,
    name: title || "Your name",
    bio,
    avatar,
    theme: user.theme,
    button_style: user.button_style,
    corner_style: user.corner_style,
    font: user.font,
    wallpaper: user.wallpaper,
    show_footer: user.show_footer,
    layout,
    title_style: titleStyle,
  };

  return (
    <div className="mx-auto grid w-full max-w-[1120px] gap-6 px-4 py-6 sm:px-6 lg:grid-cols-[minmax(0,1fr)_360px] lg:px-8">
      <div className="order-2 lg:order-1">
        <header className="flex flex-wrap items-center justify-between gap-3">
          <div>
            <h1 className="font-display text-[24px] font-extrabold tracking-tight text-shade">Header</h1>
            <p className="mt-1 text-[12px] text-shade/60">Your photo, title and bio — the first thing visitors see.</p>
          </div>
          <a
            href={`/${username || user.username}`}
            target="_blank"
            rel="noreferrer"
            className="inline-flex items-center gap-1.5 text-[12px] font-semibold text-grape"
          >
            View profile <ExternalLink className="h-3 w-3" />
          </a>
        </header>

        <form action={action} className="mt-5 space-y-4">
          <section className="rounded-3xl border border-shade/10 bg-white p-5">
            <h2 className="text-[13px] font-bold text-shade">Layout</h2>
            <div className="mt-3 grid grid-cols-5 gap-2">
              {LAYOUTS.map((option) => (
                <button
                  key={option.id}
                  type="button"
                  onClick={() => setLayout(option.id)}
                  className={`rounded-xl border p-1.5 text-center transition ${
                    layout === option.id
                      ? "border-grape bg-grape/[0.05] ring-1 ring-grape"
                      : "border-shade/10 hover:border-shade/30"
                  }`}
                  aria-pressed={layout === option.id}
                >
                  <LayoutThumb id={option.id} />
                  <span className="mt-1 block text-[9.5px] font-semibold text-shade/65">{option.label}</span>
                </button>
              ))}
            </div>
            <input type="hidden" name="layout" value={layout} />
          </section>

          <section className="space-y-5 rounded-3xl border border-shade/10 bg-white p-5">
            <div>
              <div className="flex items-center gap-3 rounded-2xl bg-chalk/60 p-3">
                <Avatar name={title || user.name} src={avatar || undefined} size={48} shape={layout === "shape" ? "rounded" : "full"} />
                <div className="min-w-0 flex-1">
                  <p className="text-[12.5px] font-semibold text-shade">Profile image</p>
                  <p className="text-[10.5px] text-shade/60">Paste an image URL, or leave blank for initials.</p>
                </div>
                {avatar ? (
                  <button
                    type="button"
                    onClick={() => setAvatar("")}
                    className="rounded-full bg-white px-2.5 py-1 text-[10.5px] font-semibold text-shade/50 hover:text-shade"
                  >
                    Reset
                  </button>
                ) : null}
              </div>
              <Input
                name="avatar"
                value={avatar}
                onChange={(event) => setAvatar(event.target.value)}
                placeholder="https://example.com/avatar.jpg"
                className="mt-2"
                aria-label="Profile image URL"
              />
            </div>

            <Field label="Title" htmlFor="title" hint={<span className="tabular">{title.length}/30</span>}>
              <Input
                id="title"
                name="title"
                value={title}
                onChange={(event) => setTitle(event.target.value.slice(0, 30))}
                maxLength={30}
                placeholder="Your name or brand"
                required
              />
            </Field>

            <Field label="Bio" htmlFor="bio" hint={<span className="tabular">{bio.length}/160</span>}>
              <Textarea
                id="bio"
                name="bio"
                rows={3}
                value={bio}
                onChange={(event) => setBio(event.target.value.slice(0, 160))}
                maxLength={160}
                placeholder="Tell visitors what you do in one or two lines."
              />
            </Field>

            <Field
              label="Username"
              htmlFor="username"
              hint={
                <span>
                  Your page lives at <span className="font-semibold text-shade/60">linktr.ee/{username || "yourname"}</span>
                </span>
              }
            >
              <div className="flex items-center overflow-hidden rounded-xl border border-shade/15 bg-white focus-within:border-shade/40 focus-within:ring-4 focus-within:ring-shade/[0.06]">
                <span className="pl-3.5 text-[13px] text-shade/55">linktr.ee/</span>
                <input
                  id="username"
                  name="username"
                  value={username}
                  onChange={(event) => setUsername(event.target.value.toLowerCase().replace(/[^a-z0-9._-]/g, ""))}
                  className="h-11 w-full bg-transparent px-1.5 pr-3.5 text-[14px] text-shade outline-none"
                  required
                  minLength={3}
                  maxLength={30}
                />
              </div>
            </Field>
          </section>

          <section className="rounded-3xl border border-shade/10 bg-white p-5">
            <h2 className="text-[13px] font-bold text-shade">Title style</h2>
            <p className="mt-0.5 text-[11.5px] text-shade/60">Show your name as text, or use the Linktree wordmark.</p>
            <div className="mt-3 grid grid-cols-2 gap-2">
              {[
                { id: "text", label: "Text", sample: "Maya Chen" },
                { id: "logo", label: "Logo", sample: "Linktree" },
              ].map((option) => (
                <button
                  key={option.id}
                  type="button"
                  onClick={() => setTitleStyle(option.id)}
                  className={`rounded-xl border px-3 py-3 text-left transition ${
                    titleStyle === option.id ? "border-grape bg-grape/[0.05]" : "border-shade/10 hover:border-shade/25"
                  }`}
                  aria-pressed={titleStyle === option.id}
                >
                  <span className="text-[10px] font-bold uppercase tracking-wide text-shade/55">{option.label}</span>
                  <span className={`mt-1 block ${option.id === "logo" ? "font-display text-[14px] font-extrabold" : "text-[14px] font-semibold"} text-shade`}>
                    {option.sample}
                  </span>
                </button>
              ))}
            </div>
            <input type="hidden" name="titleStyle" value={titleStyle} />
          </section>

          {state.error ? (
            <p role="alert" className="rounded-xl bg-[#c43333]/[0.08] px-3.5 py-2.5 text-[12.5px] font-medium text-[#a52727]">
              {state.error}
            </p>
          ) : null}

          <div className="sticky bottom-3 z-20 flex items-center justify-between gap-3 rounded-2xl border border-shade/10 bg-white/95 p-3 shadow-lg backdrop-blur">
            <span className="inline-flex items-center gap-1.5 text-[11.5px] font-medium text-shade/60">
              {state.ok ? (
                <>
                  <Check className="h-3.5 w-3.5 text-forest" /> {state.message}
                </>
              ) : (
                "Changes are visible on your page after saving."
              )}
            </span>
            <Button type="submit" variant="primary" size="md" disabled={pending}>
              {pending ? <Loader2 className="h-4 w-4 animate-spin" /> : <Save className="h-4 w-4" />}
              {pending ? "Saving…" : "Save"}
            </Button>
          </div>
        </form>
      </div>

      <aside className="order-1 lg:order-2">
        <div className="sticky top-24">
          <div className="mb-3 flex items-center justify-between">
            <p className="text-[10.5px] font-bold uppercase tracking-[0.14em] text-shade/55">Live preview</p>
            <span className="rounded-full bg-chartreuse/50 px-2 py-0.5 text-[9.5px] font-bold uppercase tracking-wide text-forest">
              {layout}
            </span>
          </div>
          <div className="flex justify-center rounded-3xl border border-shade/10 bg-white p-4">
            <Phone size="sm">
              <ProfileBody
                user={previewUser}
                links={links}
                socials={socials}
                collections={collections}
                preview
                compact
                footer={false}
              />
            </Phone>
          </div>
        </div>
      </aside>
    </div>
  );
}
