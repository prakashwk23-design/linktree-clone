"use client";

import { Check, Loader2, Lock, Save } from "lucide-react";
import { useActionState, useState } from "react";
import { updateDesignAction } from "@/app/actions";
import { ProfileBody, type ProfileUser } from "@/components/profile/ProfileBody";
import { Phone } from "@/components/site/Phone";
import { Button } from "@/components/ui/Button";
import { Switch } from "@/components/ui/Form";
import {
  BUTTON_STYLES,
  CORNER_STYLES,
  FONTS,
  THEMES,
  WALLPAPERS,
  getTheme,
} from "@/lib/themes";
import type { Collection, Link as LinkRow, Social, User } from "@/lib/types";

export function DesignEditor({
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
  const [state, action, pending] = useActionState(updateDesignAction, {});
  const [themeId, setThemeId] = useState(user.theme);
  const [wallpaper, setWallpaper] = useState(user.wallpaper);
  const [buttonStyle, setButtonStyle] = useState(user.button_style);
  const [cornerStyle, setCornerStyle] = useState(user.corner_style);
  const [font, setFont] = useState(user.font);
  const [showFooter, setShowFooter] = useState(user.show_footer === 1);

  const theme = getTheme(themeId);
  const previewUser: ProfileUser = {
    username: user.username,
    name: user.name,
    bio: user.bio,
    avatar: user.avatar,
    theme: themeId,
    button_style: buttonStyle,
    corner_style: cornerStyle,
    font,
    wallpaper,
    show_footer: showFooter ? 1 : 0,
    layout: user.layout,
    title_style: user.title_style,
  };

  return (
    <div className="mx-auto grid w-full max-w-[1120px] gap-6 px-4 py-6 sm:px-6 lg:grid-cols-[minmax(0,1fr)_360px] lg:px-8">
      <div className="order-2 lg:order-1">
        <header className="flex flex-wrap items-center justify-between gap-3">
          <div>
            <h1 className="font-display text-[24px] font-extrabold tracking-tight text-shade">Design</h1>
            <p className="mt-1 text-[12px] text-shade/60">Make your page feel like you. Everything updates live.</p>
          </div>
          <span className="inline-flex items-center gap-1.5 rounded-full bg-grape/10 px-2.5 py-1 text-[10.5px] font-bold uppercase tracking-wide text-grape">
            Pro unlocked
          </span>
        </header>

        <form action={action} className="mt-5 space-y-4">
          <section className="rounded-3xl border border-shade/10 bg-white p-5">
            <div className="flex items-center justify-between">
              <h2 className="text-[13px] font-bold text-shade">Theme</h2>
              <span className="text-[10.5px] font-semibold text-shade/55">{THEMES.length} designs</span>
            </div>
            <div className="mt-3 grid grid-cols-2 gap-2 sm:grid-cols-3">
              {THEMES.map((item) => {
                const active = themeId === item.id;
                return (
                  <button
                    key={item.id}
                    type="button"
                    onClick={() => setThemeId(item.id)}
                    aria-pressed={active}
                    className={`relative overflow-hidden rounded-2xl border p-2 text-left transition ${
                      active ? "border-grape ring-1 ring-grape" : "border-shade/10 hover:border-shade/30"
                    }`}
                  >
                    <span
                      className="flex h-[72px] flex-col justify-between rounded-xl p-2.5"
                      style={{ background: item.background, color: item.text }}
                    >
                      <span className="flex gap-1">
                        {item.swatches.map((swatch) => (
                          <span
                            key={swatch}
                            className="h-2.5 w-2.5 rounded-full border border-black/5"
                            style={{ background: swatch }}
                          />
                        ))}
                      </span>
                      <span className="space-y-1">
                        <span className="block h-2 w-3/4 rounded-full" style={{ background: item.buttonBg, opacity: 0.95 }} />
                        <span className="block h-2 w-1/2 rounded-full" style={{ background: item.buttonBg, opacity: 0.95 }} />
                      </span>
                    </span>
                    <span className="mt-1.5 flex items-center justify-between px-0.5">
                      <span className="text-[10.5px] font-semibold text-shade/65">{item.name}</span>
                      {active ? <Check className="h-3 w-3 text-grape" /> : null}
                    </span>
                  </button>
                );
              })}
            </div>
            <input type="hidden" name="theme" value={themeId} />
          </section>

          <div className="grid gap-4 sm:grid-cols-2">
            <section className="rounded-3xl border border-shade/10 bg-white p-5">
              <div className="flex items-center justify-between">
                <h2 className="text-[13px] font-bold text-shade">Wallpaper</h2>
                <span className="inline-flex items-center gap-1 rounded-full bg-chalk px-2 py-0.5 text-[9px] font-bold uppercase tracking-wide text-shade/60">
                  <Lock className="h-2.5 w-2.5" /> Pro
                </span>
              </div>
              <div className="mt-3 space-y-1.5">
                {WALLPAPERS.map((option) => (
                  <button
                    key={option.id}
                    type="button"
                    onClick={() => setWallpaper(option.id)}
                    className={`flex w-full items-center justify-between rounded-xl border px-3 py-2.5 text-[12px] font-medium transition ${
                      wallpaper === option.id
                        ? "border-grape bg-grape/[0.04] text-shade"
                        : "border-shade/10 text-shade/55 hover:border-shade/25"
                    }`}
                  >
                    {option.name}
                    <span
                      className="h-6 w-10 rounded-md border border-shade/10"
                      style={{
                        background:
                          option.id === "fill"
                            ? theme.background
                            : option.id === "gradient"
                              ? `linear-gradient(135deg, ${theme.swatches[0]}, ${theme.swatches[2]})`
                              : `radial-gradient(${theme.text} 1px, transparent 1px) 0 0/6px 6px, ${theme.background}`,
                      }}
                    />
                  </button>
                ))}
              </div>
              <input type="hidden" name="wallpaper" value={wallpaper} />
            </section>

            <section className="rounded-3xl border border-shade/10 bg-white p-5">
              <div className="flex items-center justify-between">
                <h2 className="text-[13px] font-bold text-shade">Buttons</h2>
                <span className="inline-flex items-center gap-1 rounded-full bg-chalk px-2 py-0.5 text-[9px] font-bold uppercase tracking-wide text-shade/60">
                  <Lock className="h-2.5 w-2.5" /> Pro
                </span>
              </div>
              <div className="mt-3 space-y-1.5">
                {BUTTON_STYLES.map((option) => (
                  <button
                    key={option.id}
                    type="button"
                    onClick={() => setButtonStyle(option.id)}
                    className={`flex w-full items-center justify-between gap-2 rounded-xl border px-3 py-2.5 text-left transition ${
                      buttonStyle === option.id
                        ? "border-grape bg-grape/[0.04]"
                        : "border-shade/10 hover:border-shade/25"
                    }`}
                  >
                    <span>
                      <span className="block text-[12px] font-semibold text-shade">{option.name}</span>
                      <span className="block text-[10px] text-shade/60">{option.description}</span>
                    </span>
                    <span
                      className="h-7 w-12 rounded-full border"
                      style={{
                        background:
                          option.id === "solid" ? theme.buttonBg : option.id === "glass" ? "rgba(255,255,255,0.5)" : "transparent",
                        borderColor: option.id === "outline" ? theme.text : "transparent",
                        backdropFilter: option.id === "glass" ? "blur(4px)" : undefined,
                      }}
                    />
                  </button>
                ))}
              </div>
              <input type="hidden" name="buttonStyle" value={buttonStyle} />
            </section>
          </div>

          <section className="rounded-3xl border border-shade/10 bg-white p-5">
            <div className="flex items-center justify-between">
              <h2 className="text-[13px] font-bold text-shade">Text</h2>
              <span className="inline-flex items-center gap-1 rounded-full bg-chalk px-2 py-0.5 text-[9px] font-bold uppercase tracking-wide text-shade/60">
                <Lock className="h-2.5 w-2.5" /> Pro
              </span>
            </div>
            <div className="mt-3 grid gap-2 sm:grid-cols-3">
              {FONTS.map((option) => (
                <button
                  key={option.id}
                  type="button"
                  onClick={() => setFont(option.id)}
                  className={`rounded-xl border px-3 py-3 text-left transition ${
                    font === option.id ? "border-grape bg-grape/[0.04]" : "border-shade/10 hover:border-shade/25"
                  }`}
                  aria-pressed={font === option.id}
                >
                  <span className="text-[10px] font-bold uppercase tracking-wide text-shade/55">{option.name}</span>
                  <span className="mt-1 block text-[15px] font-semibold text-shade" style={{ fontFamily: option.family }}>
                    Aa
                  </span>
                  <span className="mt-0.5 block truncate text-[10px] text-shade/60" style={{ fontFamily: option.family }}>
                    {option.sample}
                  </span>
                </button>
              ))}
            </div>
            <input type="hidden" name="font" value={font} />
          </section>

          <div className="grid gap-4 sm:grid-cols-2">
            <section className="rounded-3xl border border-shade/10 bg-white p-5">
              <h2 className="text-[13px] font-bold text-shade">Corners</h2>
              <div className="mt-3 grid grid-cols-3 gap-2">
                {CORNER_STYLES.map((option) => (
                  <button
                    key={option.id}
                    type="button"
                    onClick={() => setCornerStyle(option.id)}
                    className={`rounded-xl border px-2 py-3 text-center transition ${
                      cornerStyle === option.id ? "border-grape bg-grape/[0.04]" : "border-shade/10 hover:border-shade/25"
                    }`}
                    aria-pressed={cornerStyle === option.id}
                  >
                    <span
                      className="mx-auto block h-7 w-12 border border-shade/25 bg-chalk"
                      style={{ borderRadius: option.radius }}
                    />
                    <span className="mt-1.5 block text-[10px] font-semibold text-shade/60">{option.name}</span>
                  </button>
                ))}
              </div>
              <input type="hidden" name="cornerStyle" value={cornerStyle} />
            </section>

            <section className="rounded-3xl border border-shade/10 bg-white p-5">
              <div className="flex items-center justify-between">
                <h2 className="text-[13px] font-bold text-shade">Colors</h2>
                <span className="text-[9px] font-bold uppercase tracking-wide text-shade/55">From theme</span>
              </div>
              <div className="mt-3 flex gap-2">
                {[theme.background, theme.text, theme.buttonBg, theme.accent].map((color, index) => (
                  <span
                    key={`${color}-${index}`}
                    className="h-12 flex-1 rounded-xl border border-shade/10"
                    style={{ background: color }}
                    title={color}
                  />
                ))}
              </div>
              <p className="mt-3 text-[11px] leading-relaxed text-shade/60">
                Theme colors keep your text and buttons readable. Switch themes above to recolor everything at once.
              </p>
            </section>
          </div>

          <section className="rounded-3xl border border-shade/10 bg-white p-5">
            <Switch
              name="showFooter"
              label="Show Linktree footer"
              description="A small badge at the bottom of your page. Pro removes it."
              checked={showFooter}
              onChange={(event) => setShowFooter(event.target.checked)}
            />
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
                `${theme.name} theme · ${FONTS.find((item) => item.id === font)?.name ?? "DM Sans"}`
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
              {theme.name}
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
          <p className="mt-3 text-center text-[10.5px] text-shade/50">
            Preview uses your saved links and social icons.
          </p>
        </div>
      </aside>
    </div>
  );
}
