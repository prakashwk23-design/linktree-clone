"use client";

import {
  ChevronDown,
  ChevronUp,
  Eye,
  EyeOff,
  FileText,
  GripVertical,
  Layers,
  Link2,
  Pencil,
  Plus,
  ShoppingBag,
  Sparkles,
  Trash2,
  X,
} from "lucide-react";
import NextLink from "next/link";
import { useState, useTransition } from "react";
import {
  addLinkAction,
  addSocialAction,
  createCollectionAction,
  deleteCollectionAction,
  deleteLinkAction,
  deleteSocialAction,
  renameCollectionAction,
  reorderCollections,
  reorderLinks,
  toggleLinkAction,
  updateLinkAction,
} from "@/app/actions";
import { Avatar } from "@/components/ui/Avatar";
import { Button, ButtonLink } from "@/components/ui/Button";
import { Field, Input, Select, Switch } from "@/components/ui/Form";
import { Modal } from "@/components/ui/Modal";
import { PLATFORMS, PlatformBadge } from "@/components/ui/PlatformIcon";
import { canCreateCollection } from "@/lib/collections";
import type { ActionState, Collection, Link, Social, User } from "@/lib/types";

const CATEGORIES = ["Suggested", "Commerce", "Social", "Media", "Contact"] as const;
type Category = (typeof CATEGORIES)[number];

const SUGGESTIONS: Record<Category, { label: string; title: string; emoji: string; hint: string }[]> = {
  Suggested: [
    { label: "Messaging", title: "Message me", emoji: "💬", hint: "" },
    { label: "Instagram", title: "Follow me on Instagram", emoji: "📸", hint: "https://instagram.com/" },
    { label: "TikTok", title: "Watch me on TikTok", emoji: "🎵", hint: "https://tiktok.com/@" },
    { label: "Image gallery", title: "See my latest work", emoji: "🖼️", hint: "" },
    { label: "Newsletter", title: "Join my newsletter", emoji: "💌", hint: "" },
    { label: "YouTube", title: "Watch my latest video", emoji: "📺", hint: "https://youtube.com/" },
  ],
  Commerce: [
    { label: "Shop", title: "Shop my products", emoji: "🛍️", hint: "" },
    { label: "Digital download", title: "Download my free guide", emoji: "⬇️", hint: "" },
    { label: "Book a call", title: "Book a 1:1 call", emoji: "📅", hint: "" },
    { label: "Tip jar", title: "Tip me", emoji: "💸", hint: "" },
  ],
  Social: [
    { label: "X", title: "Follow me on X", emoji: "𝕏", hint: "https://x.com/" },
    { label: "Threads", title: "Follow me on Threads", emoji: "🧵", hint: "https://threads.net/@" },
    { label: "LinkedIn", title: "Connect on LinkedIn", emoji: "💼", hint: "https://linkedin.com/in/" },
    { label: "Discord", title: "Join my Discord", emoji: "🎮", hint: "https://discord.gg/" },
  ],
  Media: [
    { label: "Spotify", title: "Listen on Spotify", emoji: "🎧", hint: "https://open.spotify.com/" },
    { label: "Podcast", title: "Listen to my podcast", emoji: "🎙️", hint: "" },
    { label: "Video", title: "Watch the full video", emoji: "🎬", hint: "https://youtube.com/" },
    { label: "Playlist", title: "My playlist", emoji: "🎶", hint: "" },
  ],
  Contact: [
    { label: "Email", title: "Email me", emoji: "✉️", hint: "mailto:hello@example.com" },
    { label: "WhatsApp", title: "Message me on WhatsApp", emoji: "💚", hint: "https://wa.me/" },
    { label: "Telegram", title: "Message me on Telegram", emoji: "✈️", hint: "https://t.me/" },
    { label: "Website", title: "Visit my website", emoji: "🌐", hint: "" },
  ],
};

const EMOJIS = ["🎬", "🎧", "📸", "💌", "📅", "🌐", "🛍️", "✨", "🎟️", "📺", "💬", "🎨"];

function EmojiPicker({ value, onChange }: { value: string; onChange: (value: string) => void }) {
  return (
    <div>
      <p className="mb-1.5 text-[13px] font-semibold text-shade">Thumbnail</p>
      <div className="flex flex-wrap gap-1.5">
        {EMOJIS.map((emoji) => (
          <button
            key={emoji}
            type="button"
            onClick={() => onChange(value === emoji ? "" : emoji)}
            className={`grid h-9 w-9 place-items-center rounded-lg border text-base transition ${
              value === emoji ? "border-grape bg-grape/10" : "border-shade/10 bg-white hover:border-shade/25"
            }`}
            aria-pressed={value === emoji}
          >
            {emoji}
          </button>
        ))}
      </div>
    </div>
  );
}

export function LinkEditor({
  user,
  links,
  socials,
  collections,
}: {
  user: User;
  links: Link[];
  socials: Social[];
  collections: Collection[];
}) {
  const [addOpen, setAddOpen] = useState(false);
  const [editLink, setEditLink] = useState<Link | null>(null);
  const [socialOpen, setSocialOpen] = useState(false);
  const [collectionCreateOpen, setCollectionCreateOpen] = useState(false);
  const [renameTarget, setRenameTarget] = useState<Collection | null>(null);
  const [collectionName, setCollectionName] = useState("");
  const [collectionState, setCollectionState] = useState<ActionState>({});
  const [collectionPending, startCollection] = useTransition();
  const [renamePending, startRename] = useTransition();
  const [category, setCategory] = useState<Category>("Suggested");
  const [title, setTitle] = useState("");
  const [url, setUrl] = useState("");
  const [thumbnail, setThumbnail] = useState("");
  const [order, setOrder] = useState(links);
  const [syncedLinks, setSyncedLinks] = useState(links);
  const [dragging, setDragging] = useState<string | null>(null);
  const [pending, startTransition] = useTransition();
  const [addState, setAddState] = useState<ActionState>({});
  const [addPending, startAdd] = useTransition();
  const [editState, setEditState] = useState<ActionState>({});
  const [editPending, startEdit] = useTransition();
  const [socialState, setSocialState] = useState<ActionState>({});
  const [socialPending, startSocial] = useTransition();

  // Re-sync after the server revalidates (add/delete/reorder elsewhere).
  // Adjusting state during render is the React-recommended pattern here; an
  // effect would cause a second render pass with stale UI in between.
  if (links !== syncedLinks) {
    setSyncedLinks(links);
    setOrder(links);
  }

  function applySuggestion(title: string, hint: string, emoji: string) {
    setTitle(title);
    setUrl(hint);
    setThumbnail(emoji);
  }

  function openAdd() {
    setAddState({});
    setAddOpen(true);
  }

  function openEdit(link: Link) {
    setEditState({});
    setEditLink(link);
  }

  function openSocial() {
    setSocialState({});
    setSocialOpen(true);
  }

  function submitAdd(formData: FormData) {
    setAddState({});
    startAdd(async () => {
      const result = await addLinkAction(formData);
      if (result.ok) {
        setAddOpen(false);
        setTitle("");
        setUrl("");
        setThumbnail("");
      } else {
        setAddState(result);
      }
    });
  }

  function submitEdit(formData: FormData) {
    setEditState({});
    startEdit(async () => {
      const result = await updateLinkAction(formData);
      if (result.ok) setEditLink(null);
      else setEditState(result);
    });
  }

  function submitSocial(formData: FormData) {
    setSocialState({});
    startSocial(async () => {
      const result = await addSocialAction(formData);
      if (result.ok) setSocialOpen(false);
      else setSocialState(result);
    });
  }

  const atCollectionLimit = !canCreateCollection(user.plan, collections.length);
  const collectionById = new Map(collections.map((collection) => [collection.id, collection]));

  function openCollectionCreate() {
    setCollectionState({});
    setCollectionName("");
    setCollectionCreateOpen(true);
  }

  function submitCollection(formData: FormData) {
    setCollectionState({});
    startCollection(async () => {
      const result = await createCollectionAction({}, formData);
      if (result.ok) {
        setCollectionCreateOpen(false);
        setCollectionName("");
      } else {
        setCollectionState(result);
      }
    });
  }

  function submitRename(formData: FormData) {
    startRename(async () => {
      await renameCollectionAction(formData);
      setRenameTarget(null);
    });
  }

  function moveCollection(id: string, direction: -1 | 1) {
    const index = collections.findIndex((collection) => collection.id === id);
    const target = index + direction;
    if (index < 0 || target < 0 || target >= collections.length) return;
    const next = [...collections];
    [next[index], next[target]] = [next[target], next[index]];
    startTransition(() => {
      void reorderCollections(next.map((collection) => collection.id));
    });
  }

  function move(id: string, direction: -1 | 1) {
    const index = order.findIndex((link) => link.id === id);
    const target = index + direction;
    if (index < 0 || target < 0 || target >= order.length) return;
    const next = [...order];
    [next[index], next[target]] = [next[target], next[index]];
    setOrder(next);
    startTransition(() => {
      void reorderLinks(next.map((link) => link.id));
    });
  }

  function dropOn(targetId: string) {
    if (!dragging || dragging === targetId) return;
    const from = order.findIndex((link) => link.id === dragging);
    const to = order.findIndex((link) => link.id === targetId);
    if (from < 0 || to < 0) return;
    const next = [...order];
    const [moved] = next.splice(from, 1);
    next.splice(to, 0, moved);
    setOrder(next);
    setDragging(null);
    startTransition(() => {
      void reorderLinks(next.map((link) => link.id));
    });
  }

  return (
    <div className="mx-auto w-full max-w-[1040px] px-4 py-6 sm:px-6 lg:px-8">
      <div className="grid gap-6 lg:grid-cols-[1fr_360px]">
        <div className="min-w-0">
          <header className="flex flex-wrap items-center justify-between gap-3">
            <h1 className="font-display text-[24px] font-extrabold tracking-tight text-shade">Content</h1>
            <div className="flex items-center gap-2">
              <Button type="button" variant="outline" size="sm" onClick={openCollectionCreate}>
                <Layers className="h-3.5 w-3.5" /> Add collection
              </Button>
              <Button type="button" variant="primary" size="sm" onClick={openAdd}>
                <Plus className="h-3.5 w-3.5" /> Add
              </Button>
            </div>
          </header>

          <section className="mt-5 rounded-3xl border border-shade/10 bg-white p-5">
            <div className="flex items-start gap-3">
              <Avatar name={user.name} src={user.avatar || undefined} size={52} />
              <div className="min-w-0 flex-1">
                <p className="text-[15px] font-bold text-shade">{user.name}</p>
                <p className="mt-0.5 truncate text-[12px] text-shade/60">@{user.username}</p>
                <p className="mt-1 text-[11.5px] text-shade/60">
                  {links.length} link{links.length === 1 ? "" : "s"} · {socials.length} social icon
                  {socials.length === 1 ? "" : "s"}
                </p>
              </div>
              <span className="rounded-full bg-chalk px-3 py-1.5 text-[11px] font-semibold text-shade/55">
                {collections.length} collection{collections.length === 1 ? "" : "s"}
              </span>
            </div>

            <div className="mt-4 border-t border-shade/10 pt-4">
              <div className="flex items-center justify-between">
                <p className="text-[12px] font-bold text-shade">Social icons</p>
                <button
                  type="button"
                  onClick={openSocial}
                  className="text-[11.5px] font-semibold text-grape hover:underline"
                >
                  + Add icon
                </button>
              </div>
              <div className="mt-3 flex flex-wrap items-center gap-2">
                {socials.map((social) => (
                  <span key={social.id} className="group relative">
                    <PlatformBadge platform={social.platform} size={34} />
                    <form action={deleteSocialAction} className="absolute -right-1 -top-1">
                      <input type="hidden" name="id" value={social.id} />
                      <button
                        type="submit"
                        aria-label={`Remove ${social.platform}`}
                        className="grid h-4 w-4 place-items-center rounded-full bg-shade text-white opacity-0 transition group-hover:opacity-100"
                      >
                        <X className="h-2.5 w-2.5" />
                      </button>
                    </form>
                  </span>
                ))}
                {socials.length === 0 ? (
                  <span className="text-[11.5px] text-shade/55">No social icons yet.</span>
                ) : null}
              </div>
            </div>
          </section>

          <section className="mt-5 rounded-3xl border border-shade/10 bg-white p-5">
            <div className="flex flex-wrap items-start justify-between gap-3">
              <div>
                <p className="text-[12px] font-bold text-shade">Collections</p>
                <p className="mt-0.5 text-[11px] text-shade/55">
                  Group related links into sections visitors can jump to.
                </p>
              </div>
              <button
                type="button"
                onClick={openCollectionCreate}
                className="text-[11.5px] font-semibold text-grape hover:underline"
              >
                + New collection
              </button>
            </div>

            {collections.length === 0 ? (
              <button
                type="button"
                onClick={openCollectionCreate}
                className="mt-3 flex w-full items-center gap-2 rounded-2xl border border-dashed border-shade/20 px-3.5 py-3 text-left text-[11.5px] font-medium text-shade/60 transition hover:border-grape/30 hover:bg-grape/[0.03] hover:text-shade"
              >
                <Layers className="h-4 w-4 text-grape" /> Create your first collection
              </button>
            ) : (
              <ul className="mt-3 space-y-2">
                {collections.map((collection, index) => {
                  const count = links.filter((link) => link.collection_id === collection.id).length;
                  return (
                    <li
                      key={collection.id}
                      className="flex items-center gap-2 rounded-xl border border-shade/10 px-2.5 py-2"
                    >
                      <span className="grid h-8 w-8 flex-none place-items-center rounded-lg bg-grape/[0.07] text-grape">
                        <Layers className="h-3.5 w-3.5" />
                      </span>
                      <span className="min-w-0 flex-1">
                        <span className="block truncate text-[12px] font-semibold text-shade">
                          {collection.name}
                        </span>
                        <span className="block text-[10px] text-shade/55">
                          {count} link{count === 1 ? "" : "s"}
                        </span>
                      </span>
                      <span className="hidden items-center gap-0.5 sm:flex">
                        <button
                          type="button"
                          onClick={() => moveCollection(collection.id, -1)}
                          disabled={index === 0 || pending}
                          className="grid h-7 w-7 place-items-center rounded-full text-shade/55 transition hover:bg-chalk hover:text-shade disabled:opacity-20"
                          aria-label="Move collection up"
                        >
                          <ChevronUp className="h-3.5 w-3.5" />
                        </button>
                        <button
                          type="button"
                          onClick={() => moveCollection(collection.id, 1)}
                          disabled={index === collections.length - 1 || pending}
                          className="grid h-7 w-7 place-items-center rounded-full text-shade/55 transition hover:bg-chalk hover:text-shade disabled:opacity-20"
                          aria-label="Move collection down"
                        >
                          <ChevronDown className="h-3.5 w-3.5" />
                        </button>
                      </span>
                      <button
                        type="button"
                        onClick={() => setRenameTarget(collection)}
                        className="grid h-7 w-7 place-items-center rounded-full text-shade/55 transition hover:bg-chalk hover:text-shade"
                        aria-label={`Rename ${collection.name}`}
                      >
                        <Pencil className="h-3 w-3" />
                      </button>
                      <form
                        action={deleteCollectionAction}
                        onSubmit={(event) => {
                          if (
                            !window.confirm(
                              `Delete “${collection.name}”? Its links stay on your page, just ungrouped.`,
                            )
                          ) {
                            event.preventDefault();
                          }
                        }}
                      >
                        <input type="hidden" name="id" value={collection.id} />
                        <button
                          type="submit"
                          aria-label={`Delete ${collection.name}`}
                          className="grid h-7 w-7 place-items-center rounded-full text-shade/55 transition hover:bg-[#c43333]/10 hover:text-[#c43333]"
                        >
                          <Trash2 className="h-3 w-3" />
                        </button>
                      </form>
                    </li>
                  );
                })}
              </ul>
            )}

            {atCollectionLimit ? (
              <p className="mt-2 text-[10.5px] text-shade/55">
                Your Free plan includes 1 collection.{" "}
                <NextLink
                  href="/admin/account?plan=starter&billing=annual#plans"
                  className="font-semibold text-grape hover:underline"
                >
                  Upgrade for unlimited
                </NextLink>
              </p>
            ) : null}
          </section>

          <section className="mt-5">
            {order.length === 0 ? (
              <div className="rounded-3xl border border-dashed border-shade/20 bg-white px-6 py-14 text-center">
                <span className="mx-auto grid h-12 w-12 place-items-center rounded-full bg-chartreuse/40 text-forest">
                  <Link2 className="h-5 w-5" />
                </span>
                <h2 className="mt-4 font-display text-[19px] font-bold text-shade">No links yet</h2>
                <p className="mt-1 text-[13px] text-shade/60">Show the world who you are. Add links to get started.</p>
                <Button type="button" variant="primary" size="md" className="mt-5" onClick={openAdd}>
                  <Plus className="h-4 w-4" /> Add your first link
                </Button>
              </div>
            ) : (
              <ul className="space-y-2">
                {order.map((link, index) => (
                  <li
                    key={link.id}
                    draggable
                    onDragStart={() => setDragging(link.id)}
                    onDragEnd={() => setDragging(null)}
                    onDragOver={(event) => event.preventDefault()}
                    onDrop={() => dropOn(link.id)}
                    className={`group flex items-center gap-2 rounded-2xl border bg-white p-2.5 transition ${
                      dragging === link.id ? "border-grape/40 opacity-60" : "border-shade/10 hover:border-shade/20"
                    }`}
                  >
                    <span className="cursor-grab p-1 text-shade/20 active:cursor-grabbing" aria-hidden="true">
                      <GripVertical className="h-4 w-4" />
                    </span>

                    <span className="grid h-10 w-10 flex-none place-items-center rounded-xl bg-chalk text-lg">
                      {link.thumbnail || <Link2 className="h-4 w-4 text-shade/60" />}
                    </span>

                    <span className="min-w-0 flex-1">
                      <span className={`block truncate text-[13px] font-semibold ${link.visible ? "text-shade" : "text-shade/55 line-through"}`}>
                        {link.title}
                      </span>
                      <span className="block truncate text-[11px] text-shade/55">{link.url}</span>
                      {link.collection_id && collectionById.get(link.collection_id) ? (
                        <span className="mt-0.5 inline-flex items-center gap-1 rounded-full bg-grape/[0.07] px-1.5 py-0.5 text-[9.5px] font-semibold text-grape">
                          <Layers className="h-2.5 w-2.5" />
                          {collectionById.get(link.collection_id)?.name}
                        </span>
                      ) : null}
                    </span>

                    <span className="hidden items-center gap-0.5 sm:flex">
                      <button
                        type="button"
                        onClick={() => move(link.id, -1)}
                        disabled={index === 0 || pending}
                        className="grid h-7 w-7 place-items-center rounded-full text-shade/55 transition hover:bg-chalk hover:text-shade disabled:opacity-20"
                        aria-label="Move up"
                      >
                        <ChevronUp className="h-3.5 w-3.5" />
                      </button>
                      <button
                        type="button"
                        onClick={() => move(link.id, 1)}
                        disabled={index === order.length - 1 || pending}
                        className="grid h-7 w-7 place-items-center rounded-full text-shade/55 transition hover:bg-chalk hover:text-shade disabled:opacity-20"
                        aria-label="Move down"
                      >
                        <ChevronDown className="h-3.5 w-3.5" />
                      </button>
                    </span>

                    <form action={toggleLinkAction} className="flex items-center">
                      <input type="hidden" name="id" value={link.id} />
                      <input type="hidden" name="visible" value={link.visible ? "0" : "1"} />
                      <button
                        type="submit"
                        aria-label={link.visible ? "Hide link" : "Show link"}
                        className={`grid h-8 w-8 place-items-center rounded-full transition ${
                          link.visible ? "text-forest hover:bg-forest/10" : "text-shade/50 hover:bg-chalk"
                        }`}
                      >
                        {link.visible ? <Eye className="h-4 w-4" /> : <EyeOff className="h-4 w-4" />}
                      </button>
                    </form>

                    <button
                      type="button"
                      onClick={() => openEdit(link)}
                      className="grid h-8 w-8 place-items-center rounded-full text-shade/60 transition hover:bg-chalk hover:text-shade"
                      aria-label={`Edit ${link.title}`}
                    >
                      <Pencil className="h-3.5 w-3.5" />
                    </button>

                    <form
                      action={deleteLinkAction}
                      onSubmit={(event) => {
                        if (!window.confirm(`Delete “${link.title}”?`)) event.preventDefault();
                      }}
                    >
                      <input type="hidden" name="id" value={link.id} />
                      <button
                        type="submit"
                        aria-label={`Delete ${link.title}`}
                        className="grid h-8 w-8 place-items-center rounded-full text-shade/55 transition hover:bg-[#c43333]/10 hover:text-[#c43333]"
                      >
                        <Trash2 className="h-3.5 w-3.5" />
                      </button>
                    </form>
                  </li>
                ))}
              </ul>
            )}

            {order.length > 0 ? (
              <p className="mt-3 text-center text-[10.5px] text-shade/50">
                Drag the handle to reorder, or use the arrows. Hidden links stay saved.
              </p>
            ) : null}
          </section>
        </div>

        <aside className="hidden lg:block">
          <div className="sticky top-24 rounded-3xl border border-shade/10 bg-white p-4">
            <p className="text-[10.5px] font-bold uppercase tracking-[0.14em] text-shade/55">Tips</p>
            <h2 className="mt-2 font-display text-[18px] font-bold text-shade">Build a link page that converts.</h2>
            <ul className="mt-4 space-y-3 text-[12px] leading-relaxed text-shade/55">
              {[
                "Put your most important link first — it gets the most taps.",
                "Use short, benefit-led titles instead of full URLs.",
                "Add a thumbnail to make links easier to scan.",
                "Hide seasonal links instead of deleting them.",
              ].map((tip) => (
                <li key={tip} className="flex gap-2">
                  <Sparkles className="mt-0.5 h-3.5 w-3.5 flex-none text-grape" /> {tip}
                </li>
              ))}
            </ul>
            <div className="mt-5 rounded-2xl bg-chartreuse/40 p-3.5">
              <p className="text-[11.5px] font-bold text-shade">Need a hand?</p>
              <p className="mt-1 text-[11px] leading-relaxed text-shade/55">
                Use Ask Linktree to get suggestions based on your page.
              </p>
            </div>
          </div>
        </aside>
      </div>

      {/* Add link modal */}
      <Modal
        open={addOpen}
        onClose={() => setAddOpen(false)}
        title="Add to your Linktree"
        description="Link to anything — your latest post, shop, booking page or newsletter."
        size="lg"
      >
        <div className="grid grid-cols-4 gap-2">
          {[
            {
              label: "Collection",
              icon: Layers,
              active: false,
              onClick: () => {
                setAddOpen(false);
                openCollectionCreate();
              },
            },
            { label: "Link", icon: Link2, active: true, onClick: () => undefined },
            { label: "Product", icon: ShoppingBag, active: false, onClick: () => undefined },
            { label: "Form", icon: FileText, active: false, onClick: () => undefined },
          ].map(({ label, icon: Icon, active, onClick }) => (
            <button
              key={label}
              type="button"
              onClick={onClick}
              className={`flex flex-col items-center gap-1.5 rounded-xl border px-2 py-3 text-[11px] font-semibold transition ${
                active ? "border-grape bg-grape/[0.06] text-grape" : "border-shade/10 text-shade/60 hover:border-shade/25"
              }`}
            >
              <Icon className="h-4 w-4" /> {label}
            </button>
          ))}
        </div>

        <div className="mt-5 flex gap-1 overflow-x-auto border-b border-shade/10 pb-px hide-scrollbar">
          {CATEGORIES.map((item) => (
            <button
              key={item}
              type="button"
              onClick={() => setCategory(item)}
              className={`whitespace-nowrap border-b-2 px-3 py-2 text-[11.5px] font-semibold transition ${
                category === item ? "border-grape text-shade" : "border-transparent text-shade/60 hover:text-shade"
              }`}
            >
              {item}
            </button>
          ))}
        </div>

        <div className="mt-3 grid grid-cols-2 gap-2 sm:grid-cols-3">
          {SUGGESTIONS[category].map((suggestion) => (
            <button
              key={suggestion.label}
              type="button"
              onClick={() => applySuggestion(suggestion.title, suggestion.hint, suggestion.emoji)}
              className="flex items-center gap-2 rounded-xl border border-shade/10 px-2.5 py-2.5 text-left text-[11.5px] font-semibold text-shade/70 transition hover:border-grape/30 hover:bg-grape/[0.03] hover:text-shade"
            >
              <span className="text-base">{suggestion.emoji}</span> {suggestion.label}
            </button>
          ))}
        </div>

        <form action={submitAdd} className="mt-5 space-y-4 border-t border-shade/10 pt-5">
          <Field label="Title" htmlFor="new-title">
            <Input
              id="new-title"
              name="title"
              placeholder="My new video is live"
              value={title}
              onChange={(event) => setTitle(event.target.value)}
              maxLength={120}
              required
            />
          </Field>
          <Field label="URL" htmlFor="new-url" hint="Paste any URL. We'll add https:// if you leave it out.">
            <Input
              id="new-url"
              name="url"
              placeholder="https://"
              value={url}
              onChange={(event) => setUrl(event.target.value)}
              required
            />
          </Field>
          {collections.length > 0 ? (
            <Field label="Collection" htmlFor="new-collection" hint="Optional. Group this link with related content.">
              <Select id="new-collection" name="collection_id" defaultValue="">
                <option value="">No collection</option>
                {collections.map((collection) => (
                  <option key={collection.id} value={collection.id}>
                    {collection.name}
                  </option>
                ))}
              </Select>
            </Field>
          ) : null}
          <div className="grid gap-4 sm:grid-cols-[1fr_auto] sm:items-end">
            <EmojiPicker value={thumbnail} onChange={setThumbnail} />
            <input type="hidden" name="thumbnail" value={thumbnail} />
            <label className="flex items-center gap-2 pb-2 text-[12px] font-medium text-shade/60">
              <input type="checkbox" name="visible" defaultChecked className="h-4 w-4 rounded accent-grape" />
              Visible on my page
            </label>
          </div>
          {addState.error ? (
            <p role="alert" className="rounded-xl bg-[#c43333]/[0.08] px-3.5 py-2.5 text-[12px] font-medium text-[#a52727]">
              {addState.error}
            </p>
          ) : null}
          <div className="flex justify-end gap-2">
            <Button type="button" variant="ghost" size="md" onClick={() => setAddOpen(false)}>
              Cancel
            </Button>
            <Button type="submit" variant="primary" size="md" disabled={addPending}>
              {addPending ? "Adding…" : "Add link"}
            </Button>
          </div>
        </form>
      </Modal>

      {/* Edit link modal */}
      <Modal
        open={editLink !== null}
        onClose={() => setEditLink(null)}
        title="Edit link"
        description="Changes appear on your page immediately."
        size="md"
      >
        {editLink ? (
          <form
            onSubmit={(event) => {
              event.preventDefault();
              submitEdit(new FormData(event.currentTarget));
            }}
            className="space-y-4"
          >
            <input type="hidden" name="id" value={editLink.id} />
            <Field label="Title" htmlFor="edit-title">
              <Input id="edit-title" name="title" defaultValue={editLink.title} maxLength={120} required />
            </Field>
            <Field label="URL" htmlFor="edit-url">
              <Input id="edit-url" name="url" defaultValue={editLink.url} required />
            </Field>
            {collections.length > 0 ? (
              <Field label="Collection" htmlFor="edit-collection" hint="Move this link into a collection or back to the main list.">
                <Select id="edit-collection" name="collection_id" defaultValue={editLink.collection_id ?? ""}>
                  <option value="">No collection</option>
                  {collections.map((collection) => (
                    <option key={collection.id} value={collection.id}>
                      {collection.name}
                    </option>
                  ))}
                </Select>
              </Field>
            ) : null}
            <Field label="Thumbnail" htmlFor="edit-thumb" hint="One emoji, or leave blank.">
              <Input id="edit-thumb" name="thumbnail" defaultValue={editLink.thumbnail} maxLength={4} placeholder="🎬" />
            </Field>
            <Switch name="visible" label="Visible on my page" defaultChecked={editLink.visible === 1} />
            {editState.error ? (
              <p role="alert" className="rounded-xl bg-[#c43333]/[0.08] px-3.5 py-2.5 text-[12px] font-medium text-[#a52727]">
                {editState.error}
              </p>
            ) : null}
            <div className="flex justify-end gap-2 pt-1">
              <Button type="button" variant="ghost" onClick={() => setEditLink(null)}>
                Cancel
              </Button>
              <Button type="submit" variant="primary" disabled={editPending}>
                {editPending ? "Saving…" : "Save changes"}
              </Button>
            </div>
          </form>
        ) : null}
      </Modal>

      {/* Social modal */}
      <Modal
        open={socialOpen}
        onClose={() => setSocialOpen(false)}
        title="Add a social icon"
        description="Icons sit under your bio and let visitors jump straight to your profiles."
        size="md"
      >
        <form
          onSubmit={(event) => {
            event.preventDefault();
            submitSocial(new FormData(event.currentTarget));
          }}
          className="space-y-4"
        >
          <div>
            <p className="mb-1.5 text-[13px] font-semibold text-shade">Platform</p>
            <div className="grid grid-cols-5 gap-2 sm:grid-cols-6">
              {PLATFORMS.map((platform) => (
                <label
                  key={platform.id}
                  className="flex cursor-pointer flex-col items-center gap-1 rounded-xl border border-shade/10 px-1 py-2 text-[9.5px] font-medium text-shade/55 transition hover:border-grape/30 has-[:checked]:border-grape has-[:checked]:bg-grape/[0.06] has-[:checked]:text-shade"
                >
                  <input type="radio" name="platform" value={platform.id} className="sr-only" defaultChecked={platform.id === "instagram"} />
                  <PlatformBadge platform={platform.id} size={26} />
                  <span className="w-full truncate text-center">{platform.label}</span>
                </label>
              ))}
            </div>
          </div>
          <Field label="Profile URL" htmlFor="social-url" hint="For email, use your email address or mailto: link.">
            <Input id="social-url" name="url" placeholder="https://instagram.com/yourname" required />
          </Field>
          {socialState.error ? (
            <p role="alert" className="rounded-xl bg-[#c43333]/[0.08] px-3.5 py-2.5 text-[12px] font-medium text-[#a52727]">
              {socialState.error}
            </p>
          ) : null}
          <div className="flex justify-end gap-2">
            <Button type="button" variant="ghost" onClick={() => setSocialOpen(false)}>
              Cancel
            </Button>
            <Button type="submit" variant="primary" disabled={socialPending}>
              {socialPending ? "Adding…" : "Add icon"}
            </Button>
          </div>
        </form>
      </Modal>

      {/* Create collection modal */}
      <Modal
        open={collectionCreateOpen}
        onClose={() => setCollectionCreateOpen(false)}
        title="New collection"
        description="Group related links into a section on your page."
        size="sm"
      >
        {atCollectionLimit ? (
          <>
            <div className="rounded-2xl bg-chartreuse/35 p-4 text-[12.5px] leading-relaxed text-shade/70">
              Your Free plan includes 1 collection. Upgrade to Starter or higher for unlimited collections, then group
              as many links as you like.
            </div>
            <div className="mt-4 flex justify-end gap-2">
              <Button type="button" variant="outline" onClick={() => setCollectionCreateOpen(false)}>
                Not now
              </Button>
              <ButtonLink href="/admin/account?plan=starter&billing=annual#plans" variant="primary">
                See plans
              </ButtonLink>
            </div>
          </>
        ) : (
          <form
            onSubmit={(event) => {
              event.preventDefault();
              submitCollection(new FormData(event.currentTarget));
            }}
            className="space-y-4"
          >
            <Field label="Collection name" htmlFor="collection-name" hint="Keep it short — it appears as a section title.">
              <Input
                id="collection-name"
                name="name"
                value={collectionName}
                onChange={(event) => setCollectionName(event.target.value)}
                placeholder="Watch, Listen, Resources…"
                maxLength={60}
                required
              />
            </Field>
            {collectionState.error ? (
              <p role="alert" className="rounded-xl bg-[#c43333]/[0.08] px-3.5 py-2.5 text-[12px] font-medium text-[#a52727]">
                {collectionState.error}
              </p>
            ) : null}
            <div className="flex justify-end gap-2">
              <Button type="button" variant="ghost" onClick={() => setCollectionCreateOpen(false)}>
                Cancel
              </Button>
              <Button type="submit" variant="primary" disabled={collectionPending}>
                {collectionPending ? "Creating…" : "Create collection"}
              </Button>
            </div>
          </form>
        )}
      </Modal>

      {/* Rename collection modal */}
      <Modal
        open={renameTarget !== null}
        onClose={() => setRenameTarget(null)}
        title="Rename collection"
        description="The section title on your page updates immediately."
        size="sm"
      >
        {renameTarget ? (
          <form
            onSubmit={(event) => {
              event.preventDefault();
              submitRename(new FormData(event.currentTarget));
            }}
            className="space-y-4"
          >
            <input type="hidden" name="id" value={renameTarget.id} />
            <Field label="Collection name" htmlFor="rename-collection">
              <Input
                id="rename-collection"
                name="name"
                defaultValue={renameTarget.name}
                maxLength={60}
                required
              />
            </Field>
            <div className="flex justify-end gap-2">
              <Button type="button" variant="ghost" onClick={() => setRenameTarget(null)}>
                Cancel
              </Button>
              <Button type="submit" variant="primary" disabled={renamePending}>
                {renamePending ? "Saving…" : "Save name"}
              </Button>
            </div>
          </form>
        ) : null}
      </Modal>
    </div>
  );
}
