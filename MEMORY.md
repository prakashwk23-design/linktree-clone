# Linktree Clone — Working Memory

> Living status file. Update it at the end of every work session: what changed, what was verified, current blockers, and the immediate next step.
> Last updated: 2026-11-16

## Snapshot

- **Objective:** full Linktree SaaS replica — marketing, auth, admin, editors, analytics, audience, earn, settings, tools, public profiles.
- **Location:** `D:\linktree-clone` (no git repo yet).
- **Stack:** Next.js 16.4.6 · React 19.3 · Tailwind 4.3.3 · SQLite (`node:sqlite`) · custom cookie auth.
- **Dev URL:** `http://localhost:3000` (`npm run dev`). If port 3000 is taken by another project, use `npm run dev -- -p 3010`.
- **Demo login:** `demo@linktr.ee` / `demo1234` (username `demo`).
- **Current phase:** feature complete — marketing site, auth, admin dashboard, editors, insights, audience, earn, settings, tools, public profiles, API, real Cashfree checkout, plus **Collections** (grouped public sections) and **profile link search + search-query logging**. Typecheck + lint + production build pass; full admin walk is console-clean.

## Status board

| Area | State | Notes |
| --- | --- | --- |
| Recon (marketing + logged-in admin) | ✅ Done | Full IA/screens mapped; screenshots captured |
| Project scaffold | ✅ Done | Next 16 + TS + Tailwind v4 + Turbopack |
| Dependencies | ✅ Installed | lucide-react, qrcode, @types/qrcode, server-only, @types/node |
| DB schema + seed | ✅ Done | `src/lib/db.ts`; seeded demo + 6 profiles + analytics |
| Data helpers | ✅ Done | `src/lib/data.ts` |
| Auth library | ✅ Done | `src/lib/auth.ts`, `src/lib/password.ts` |
| Server actions | ✅ Done | `src/app/actions.ts` (links, header, design, account, etc.) |
| Themes/plans | ✅ Done | `src/lib/themes.ts` |
| Design tokens | ✅ Done | `src/app/globals.css` |
| Root layout / fonts / metadata | ✅ Done | `instant = false` |
| Shared UI kit | ✅ Done | Button, Form, Modal, Logo, Avatar, PlatformIcon, CopyButton |
| Marketing homepage/site | ✅ Done | Header/footer, homepage, `/pricing`, `/discover`, 404 |
| Auth pages | ✅ Done | `/login`, `/register`, split layout, demo autofill |
| Admin layout/shell | ✅ Done | Sidebar + editor rail, setup checklist, mobile drawer, AI chat |
| Link editor | ✅ Done | Add-link modal, socials, reorder/hide/edit/delete, share/QR |
| Header editor | ✅ Done | Layouts/avatar/title/bio, live phone preview |
| Design editor | ✅ Done | Themes/wallpapers/buttons/fonts/corners/footer, live preview |
| Insights | ✅ Done | 7/14/30 ranges, deltas, chart, top links, collection taps, referrers, countries, CSV, search-query stats |
| Audience | ✅ Done | Contacts table, search, add contact, CSV export |
| Earn | ✅ Done | Products, revenue summary, recent sales, payout mock |
| Account/settings | ✅ Done | Details, password (signs out other devices), Cashfree plan picker, real invoices, integrations, delete |
| Tools | ✅ Done | Shortener (real), business cards, planner, IG DM, post ideas |
| Collections | ✅ Done | Schema + editor CRUD/reorder/assign, plan gate (Free 1, paid unlimited), public sections/tabs/accordions + `#slug` deep links |
| Profile search | ✅ Done | Appears at 13+ visible links; filters title/URL/collection; logs settled queries to Insights |
| Public profile | ✅ Done | `/[username]`, themed layouts, share, view/click tracking |
| API routes | ✅ Done | view (30-min dedupe)/click/qr/export/short-link redirect, Cashfree order/return/webhook |
| Pricing / discover | ✅ Done | Plan toggle, comparison, FAQ; searchable profile grid |
| Verification | ✅ Done | `tsc`, `next build`, runtime walk, interaction smoke tests |

## Completed work log

### 1. Recon
- Explored live `linktr.ee` marketing homepage and the logged-in admin (read-only, account `prakashwk23`).
- Captured marketing colors/fonts/copy and section order.
- Mapped admin sidebar: My Linktree, Earn, Media kit, Audience, Insights, Messaging, Tools (Business cards, Social planner, Instagram auto-reply, Link shortener, Post ideas), Settings, setup checklist, AI chat.
- Mapped editor rail: Content / Header / Design / settings; profile chip; Preview; Share.
- Header editor: Classic, Hero, Banner, Cutout, Shape layouts; title 0/30; bio 0/160; Text/Logo title style.
- Design editor: Theme/Customize, Wallpaper (Pro), Buttons (Pro), Text (Pro), Colors (Pro), Stickers, Footer.
- Add-link modal: Collection, Link, Product, Form tiles; categories Suggested, Commerce, Social, Media, Contact, Events, Text, View all; suggested apps Messaging, Instagram, TikTok, Image gallery.
- Captured tokens: chartreuse `#D2E823`, shade `#1E2330`, forest `#254F1A`, cobalt `#2665D6`, oxblood `#780016`, sage `#E8EFD6`, chalk `#F3F3F1`, blush `#E9C0E9`, grape `#502274`.

### 2. Foundation
- Scaffolded app (`create-next-app@latest`), Tailwind v4 via `@tailwindcss/turbopack` loader.
- Installed `lucide-react`, `qrcode`, `@types/qrcode`, `@types/node@latest`, `server-only`.
- `src/lib/types.ts` — Plan/User/Link/Social/Contact/Product/ShortLink/ActionState/AnalyticsPoint/TopLink.
- `src/lib/db.ts` — full schema, WAL, foreign keys, seed.
- `src/lib/data.ts` — queries, analytics, setup progress, discover, normalize/clean helpers, reserved usernames.
- `src/lib/password.ts` — scrypt hash/verify (`salt:hash`).
- `src/lib/auth.ts` — `getCurrentUser`, `requireUser`, `createSession`, `destroySession`, cookie `lt_session`.
- `src/lib/themes.ts` — 10 themes, 3 fonts, 3 button styles, 3 corners, 3 wallpapers, 4 plans.
- `src/app/actions.ts` — register/login/logout; update header/design/account/password; upgrade plan; link CRUD/reorder/toggle; socials; contacts; products; short links; delete account; seed links.
- `src/app/globals.css` — Tailwind v4 `@theme` tokens, keyframes (marquee/float/pop/rise), grain, focus ring, reduced motion.
- `src/app/layout.tsx` — DM Sans + Space Grotesk + Fraunces, metadata, `export const instant = false`.
- Shared UI: `Logo.tsx` (official wordmark SVG + star), `Avatar.tsx`, `PlatformIcon.tsx` (17 platforms), `Button.tsx`, `Form.tsx`, `Modal.tsx`.

### 3. Bug fixes already applied
- Removed a malformed duplicate line in `loginAction`.
- Removed unused `getUserById` import from `actions.ts`.

### 4. Marketing, auth and admin UI
- Marketing: `MarketingHeader`, `MarketingFooter`, homepage (`src/app/page.tsx`), `/pricing` (annual toggle, comparison table, FAQ), `/discover` (searchable/filterable profile grid), global `not-found.tsx`.
- `ProfileBody.tsx`: themed renderer with classic/hero/banner/cutout/shape layouts, wallpapers, button/corner styles, title styles — shared by editors and public page.
- Auth: `(auth)/layout.tsx`, `/login`, `/register`, `LoginForm` demo autofill, `RegisterForm` live username preview.
- Shells: `AdminShell` (sidebar, checklist, mobile drawer, logout), `AdminChat` mock, `EditorShell` (icon rail, share modal with QR).
- Pages: `/admin`, links, header, design, insights, audience, earn, account, link-shortener, business-cards, media-kit, messaging, social-planner, igdm, post-ideas, settings redirect.
- Public/API: `/[username]`, `/api/click/[id]`, `/api/view`, `/api/qr`, `/api/analytics/export`, `/s/[code]`.

### 5. Runtime hardening (Cache Components / Next 16)
- `requireUser()` now calls `await connection()` so session + current-time reads happen at request time, and `/admin/layout.tsx` wraps the auth gate in `<Suspense>` with a shell skeleton.
- Added `export const instant = false` to every admin `page.tsx`/`layout.tsx` (root opt-out does not propagate to descendants).
- Data layer returns plain objects (`plain`/`plainAll`) so null-prototype SQLite rows can cross into Client Components.
- `SocialPlanner` resolves "today" after mount; `AudienceTable` formats dates in UTC — no hydration mismatches.
- Fixed nested `<a>` by giving `Logo` an `href`/`onClick` and using it directly in the admin sidebar.
- Fixed password-form validation reading `password_next`/`password_confirm` instead of `next`/`confirm`.
- Added `data-scroll-behavior="smooth"` to `<html>`.

### 6. Verified runtime behaviour
- All 28 routes build; `tsc --noEmit` clean.
- Admin walk (dashboard + 15 pages): no console errors, no hydration warnings.
- Smoke-tested: add/delete links, header save, design save, insights ranges, analytics/contacts CSV, short-link create/redirect/delete, contact add, account details/password/plan switch, messaging send, IG rule add/delete, post-ideas refresh/save.
- Public profile loads themed, records views, and links route through `/api/click/[id]`.
- Test data cleaned up; demo profile restored to Chartreuse / Classic / DM Sans / Rounded / Pro.

### 7. Cashfree payments + bug-fix pass
- **Payments (real, not mocked):** `src/lib/cashfree.ts` (order create/lookup, webhook HMAC verification, sandbox/production switch), `payments` table, `POST /api/cashfree/order`, `GET /api/cashfree/return`, `POST /api/cashfree/webhook`. Activation is idempotent (`completePayment` runs in `BEGIN IMMEDIATE`, no-ops if already paid/demo) so webhook + return URL can both land.
- **Pricing switched to INR:** Starter ₹199/₹299, Pro ₹499/₹749, Premium ₹1,199/₹1,799. Annual totals in paise `238800`/`598800`/`1438800`; monthly `29900`/`74900`/`179900`. `formatINR()` + `amount`/`monthlyAmount` on `PLANS`. Annual badge is "Save 33%".
- **Account:** `PlanPicker` client component (monthly/annual toggle, tier-aware buttons, Cashfree JS SDK v3 loader). Paid CTAs on `/pricing` deep-link to `/admin/account?plan=…&billing=…#plans`; Free stays `/register`. Billing summary + invoice list read from `payments` (`paid`/`demo`/`pending`/`failed`).
- **No keys configured:** in development the order route activates the plan as a `demo` payment so the clone stays demoable; in production it returns 503 instead of silently upgrading. `.env.example` documents `CASHFREE_APP_ID`, `CASHFREE_SECRET_KEY`, `CASHFREE_ENV`.
- **Validation errors surfaced:** `addLinkAction`, `updateLinkAction`, `addSocialAction`, `addProductAction`, `createShortLinkAction` now return `ActionState` instead of failing silently. Add/edit/social/product/short-link forms keep the modal open, preserve input and show the server message.
- **Form-action gotcha:** React resets *uncontrolled* fields after any `<form action={fn}>` submit — including a rejected one. Short-link, edit-link, social and product forms now use `onSubmit` + `event.preventDefault()` and reset manually on success only.
- **Other fixes:** header editor "View profile" follows the live username; short-link duplicate codes are rejected with a message instead of auto-suffixing; `changePasswordAction` deletes all sessions and re-issues one; `getCurrentUser()` strips `password_hash` (user queries use an explicit column list); `/api/view` dedupes one view per visitor/profile per 30 minutes; earn page/product covers are INR and persist a cover emoji (`products.cover`, migrated with a duplicate-column-safe `ALTER TABLE`).
- **Verified in the browser:** Premium annual ₹14,388 demo upgrade → invoice; downgrade to Free; Pro monthly ₹749 with `?plan=pro&billing=monthly` honoured; short-link duplicate error keeps input, success resets and lists; delete works; product with 🎧 cover persists; edit-link error keeps input; social add/remove; `/api/view` returns `counted:true` then `counted:false`, 404 for unknown users.
- **Test harness note:** the automation tab must be focused (`browser.tabs.focus`) before interacting — a background tab never hydrates, which looks exactly like a broken form.
- Restored the two demo links that earlier tests had deleted; DB now matches the seed (6 links, 4 socials, 3 products with covers, 1 short link, no payments).

## Decisions log

| # | Decision | Rationale |
| --- | --- | --- |
| D1 | Full SaaS clone (not landing-page only) | User explicitly requested all logged-in features/pages |
| D2 | Next.js + Tailwind + SQLite | User-selected stack |
| D3 | `node:sqlite` instead of better-sqlite3 | Avoid native build deps on Windows |
| D4 | Custom sessions + scrypt | Small dependency-free auth, sufficient for clone |
| D5 | Exact Linktree branding, original CSS mockups for photos | User wants faithful branding; avoid copying proprietary photos |
| D6 | Mirror real admin routes (`/admin/links`, `/admin/header`, …) | Fidelity and predictability |
| D7 | Root `instant = false` | Cache Components would otherwise require Suspense around every cookie/DB read |
| D8 | Single-file server actions module | Simpler imports across admin client components |
| D9 | Public links route through `/api/click/[id]` | Reliable analytics without JS |
| D10 | Marketing homepage uses CSS phone/profile mockups | No licensed assets needed |
| D11 | No git init yet | Scaffold created without a repo; decide with user before committing |
| D12 | `connection()` in `requireUser()` + Suspense gate | Makes admin request-time without tripping `new Date()` prerender checks |
| D13 | `instant = false` on each admin segment | Opt-out does not inherit; admin routes are intentionally blocking |
| D14 | Plain-object mapping in data helpers | `node:sqlite` rows have null prototypes and can't be client props |
| D15 | Client-only date resolution in tools | Prevents server/browser timezone hydration mismatches |
| D16 | Muted text floors at `shade/50`–`/60` and `white/65` | Small labels were below WCAG AA on tinted surfaces |
| D17 | Planner week grid scrolls horizontally under `sm` | 7 columns can't fit 375px without crushing the day cells |
| D18 | Cashfree (INR) instead of Stripe | User asked for a real gateway; Cashfree covers cards/UPI/net banking/wallets in India |
| D19 | `onSubmit` + `preventDefault` for uncontrolled forms | React resets uncontrolled fields after a form action, wiping input on validation errors |
| D20 | Dev-only demo activation when Cashfree keys are absent | Keeps the clone demoable; production returns 503 rather than granting a plan for free |
| D21 | `collections` table + nullable `links.collection_id` | Links keep their position when grouped; deleting a collection ungroups rather than deletes |
| D22 | Collection limit free = 1, paid = unlimited | Mirrors Linktree's gating; enforced in the action and shown in the editor |
| D23 | Client-side profile search over title/URL/collection | No server round-trip; hidden links never reach the client, so they aren't searchable |
| D24 | Search shows only at 13+ visible links; never in previews | Matches Linktree's threshold and keeps small pages clean |
| D25 | Settled queries (1.4s debounce, deduped per visit) POST to `/api/search` | Captures demand without logging every keystroke; endpoint rate-limits 40/10min per IP+user |
| D26 | `@source not "../../data"` in `globals.css` | Tailwind/Turbopack tried to scan the live SQLite WAL/SHM files and panicked |

## Next steps (in order)

1. **Optional product polish**
   - Make `/discover` request-time (currently a static DB snapshot at build).
   - Real drag-and-drop reorder (up/down already works; `draggable` handlers exist in `LinkEditor`).
   - Avatar/image uploads instead of URL fields.
   - Add Cashfree keys (`.env.example`) and run a sandbox payment end-to-end; the demo path has only been exercised.
   - Cashfree payouts for Earn (currently a mocked onboarding card).
2. **Repo decision** — ask before `git init`/commit (none exists).
3. **Docs sync** — update `CONTEXT.md` if architecture changes; keep this file current.

## How to re-run the audits

The audit scripts were temporary and have been removed. To redo them:

1. Start headless Edge with `--remote-debugging-port=9333`.
2. Insert `lt_session` via `Network.setCookie` using `{ url: "http://localhost:3000" }` (domain-scoped cookies silently fail).
3. For mobile widths, compare `document.scrollWidth` to the **emulated device width** (375), not `window.innerWidth` — mobile emulation inflates the layout viewport when content overflows, hiding the bug.
4. Real overflow bugs are usually a grid/flex child missing `min-w-0`.

## Verification checklist

- [x] `npx tsc --noEmit` clean
- [x] `npm run build` clean (31 routes)
- [x] `npm run dev` boots without errors
- [x] Register/login/logout works with cookie persistence
- [x] Demo login works (`demo@linktr.ee` / `demo1234`)
- [x] Add/edit/delete/reorder/toggle links persists and reflects on public page
- [x] Link/social/product/short-link validation errors render and keep the modal open with input intact
- [x] Header + design edits reflect on public page
- [x] Public profile view/click rows recorded; insights numbers move; `/api/view` dedupes within 30 minutes
- [x] QR route returns a scannable PNG
- [x] Short link create/duplicate-error/redirect/delete works and counts clicks
- [x] Plan upgrade runs through Cashfree (demo path without keys): Premium annual ₹14,388, Pro monthly ₹749, downgrade to Free, invoice rows
- [x] Password change signs out other devices and keeps the current one
- [x] Account update/password/plan switch work (delete flow present, untested by design)
- [x] Collections: create/rename/reorder/delete in the editor; assigning a link moves it into the section and the public page updates
- [x] Deleting a collection keeps its links (they return ungrouped)
- [x] Free plan allows 1 collection; a second is blocked with an upgrade prompt (editor + action guard)
- [x] Public profile renders collections as sections (1–2) or desktop tabs + mobile accordions (3+); `/[username]#slug` opens the section
- [x] Search appears at 13+ visible links; filtering works; settled queries log to `/api/search` and show in Insights (top + zero-result)
- [x] Insights Collections section shows taps per collection for the range, with an empty state for accounts without collections
- [x] 404 for unknown usernames; reserved usernames blocked
- [x] Responsive at 375 / 768 / 1440 across 20 pages × 3 widths (60 checks, zero overflow)
- [x] No console errors/hydration mismatches on the admin walk
- [x] Accessibility: 0 unnamed controls and 0 unlabeled inputs across 21 pages
- [x] Modal + mobile drawer focus trap, Escape close, focus restore
- [x] Muted text contrast raised (`text-shade/40|45 → /60`, `/35 → /55`, `/30 → /50`, `text-white/45 → /65`)
- [x] README/CONTEXT updated if architecture changes

## Open questions / watchouts

- Public profile link behavior: same-tab navigation vs new tab. Current plan: same tab via tracking route.
- Whether to add drag-and-drop reorder or up/down controls. Plan: drag with a fallback "move up/down" for accessibility/mobile.
- Upgrade/payments: real Cashfree checkout is wired (order → hosted checkout → return/webhook → plan). Only the dev demo path has been exercised; no live keys yet.
- Tools (planner, IG auto-reply, post ideas) will be interactive mocks; shortener is real.
- Media kit/messaging are invented but consistent with real Linktree IA.
- No git repo; do not initialize/commit without asking the user.
- Do not touch the user's real Linktree account.

## Session log

### 2026-11-16 — Full audit, bug fixes + AI/social/payment integrations
- **Bug fixes:** CSV formula-injection guard in `/api/analytics/export`; account deletion now also removes orphaned `views`/`clicks`/`searches`; `/discover` is request-time with working category filters; redirect `Location` headers are URI-encoded in `/api/click/[id]` and `/s/[code]`; Ask Linktree greeting is time-aware.
- **AI integration:** `src/lib/ai.ts` (OpenAI-compatible `/chat/completions`, env `AI_API_KEY`/`AI_MODEL`/`AI_BASE_URL`), `/api/ai/chat` + `/api/ai/post-ideas`. `AdminChat` and `PostIdeas` call the real API when configured and fall back to the offline reply/idea bank when not.
- **Social OAuth:** `src/lib/social.ts` (Instagram/TikTok/YouTube/Spotify/X), `social_connections` table, `/api/social/[provider]/connect` + `/callback` (PKCE for X, Basic auth for Spotify/X), `disconnectSocialAction`. Account → Integrations shows real Connect/Disconnect, or the exact env vars needed when unconfigured.
- **Payments:** Cashfree kept; `NEXT_PUBLIC_APP_URL` now drives return/webhook URLs.
- **Env:** `.env.example` rewritten with App/AI/Cashfree/Social sections. Keys are supplied later; everything degrades gracefully without them.
- Verified routes with a temporary session (AI returns `configured:false`, social connect redirects with `not_configured`, discover filters, integrations UI), `tsc`, `eslint --max-warnings=0`, and `next build` (34 routes).

### 2026-11-16 — Collections + profile search
- Added `collections` + `searches` tables, `links.collection_id`, indexes, and duplicate-column-safe migrations.
- Seeded the demo profile with 14 links across 3 collections (`Watch` 3, `Listen` 2, `Resources` 4) and 42 search events.
- Built collections end to end: data helpers, `createCollectionAction`/`renameCollectionAction`/`deleteCollectionAction`/`reorderCollections`, owner checks on link assignment, editor card + modals + link badges, public sections/tabs/accordions with `#slug` deep links, and Insights search stats.
- Profile search appears at 13+ visible links, filters title/URL/collection, and logs settled queries to `/api/search` (rate-limited 40/10min per IP+user).
- Verified in the browser as `demo`: create/rename/reorder/delete a collection, assign/unassign a link, `#bts` deep link selects the tab; as `filmclub` (Free): first collection allowed, second blocked with the upgrade prompt. Reverted the test data.
- Fixed a Turbopack/Tailwind panic by excluding `data/` from Tailwind's source scan (`@source not "../../data";`).
- Added a **Collections** section to Insights: taps per collection for the selected range (`getCollectionStats`), with a `Manage collections` link and an empty state when the user has none.
- `npx tsc --noEmit` and `npx eslint . --max-warnings=0` pass; `npm run build` clean (32 routes).

### 2026-11-14 — Foundation
- Finished data layer, auth, actions, tokens, root layout, shared UI primitives.
- Added `Button`, `Form`, `Modal` components.
- Created `CONTEXT.md` and this `MEMORY.md`.
- Next: marketing shell and homepage.

### 2026-11-14 — Full build + runtime hardening
- Built marketing site, auth, admin shell/pages, editors, tools, public profiles, APIs.
- Fixed Cache Components blocking-current-time errors with `connection()` + Suspense + per-segment `instant = false`.
- Fixed null-prototype SQLite rows crossing into Client Components.
- Fixed nested anchor in sidebar, planner hydration, audience date formatting, password form validation.
- Verified every admin page and key interaction in the browser with zero console errors; production build passes.
- Next: responsive/accessibility pass, optional polish (dynamic discover, drag-and-drop, uploads, Stripe).

### 2026-11-14 — Responsive + accessibility hardening
- Audited 20 pages at 375 / 768 / 1440 via headless Edge over CDP (60 checks): zero horizontal overflow, zero runtime errors.
- Fixed real mobile overflows: `min-w-0` on grid children in `LinkEditor.tsx` and `PostIdeas.tsx`; planner week grid is now horizontally scrollable (`min-w-[560px]` inside `overflow-x-auto`) with 3-across stats.
- Added `pb-28` to the admin `<main>` so the floating chat button never covers the last card.
- Accessibility: `Modal` now gets initial focus, traps Tab/Shift+Tab, closes on Escape, restores focus. Mobile nav drawer has `role="dialog"`, `aria-modal`, Escape close, scroll lock, focus restore.
- Named every control and input (0 unnamed / 0 unlabeled across 21 pages).
- Raised muted-text contrast globally; setup checklist now shows "You're all set" + "View your page" at 100%.
- Verified `npx tsc --noEmit`, `npm run build` (28 routes), and production `next start` on port 3001 (all 22 routes 200, no errors).
- Removed the temporary audit scripts and artifacts; re-run instructions are in "How to re-run the audits".

### 2026-11-14 — Cashfree checkout + bug-fix pass
- Replaced the mocked upgrade flow with real Cashfree orders, return verification and signed webhooks; plans are now INR with monthly/annual amounts in paise.
- Account page: plan picker, real billing summary and invoices; pricing CTAs deep-link into the picker.
- Fixed silent validation failures across link/social/product/short-link forms and the React form-reset-on-error trap.
- Hardened auth (password change signs out other devices, no password hash in props), analytics (30-minute view dedupe) and earn covers (`products.cover`).
- Restored demo data, re-ran `tsc`, `eslint --max-warnings=0` and `next build` (31 routes), and re-verified the money and form flows in the browser.

## Quick file index

| File | Purpose |
| --- | --- |
| `src/lib/db.ts` | Schema + seed (demo account and public profiles) |
| `src/lib/data.ts` | Query helpers + analytics + validation |
| `src/lib/auth.ts` | Session cookie helpers (`lt_session`) |
| `src/lib/password.ts` | scrypt hash/verify |
| `src/lib/themes.ts` | Themes/fonts/button/corner styles/plans (INR) |
| `src/lib/collections.ts` | Collection plan limits + slug generation |
| `src/lib/types.ts` | Shared types |
| `src/lib/cashfree.ts` | Cashfree orders + webhook signature verification |
| `src/app/actions.ts` | All server actions |
| `src/app/globals.css` | Tailwind v4 tokens, animations, helpers (excludes `data/` from scanning) |
| `src/app/layout.tsx` | Fonts, metadata, `instant = false` |
| `src/components/ui/*` | Button, Form, Modal, Logo, Avatar, PlatformIcon |
| `src/components/profile/ProfileBody.tsx` | Themed public-profile renderer |
| `src/components/profile/ProfileLinks.tsx` | Public links: search, collection tabs/accordions, hash deep links |
| `src/components/admin/*` | Shells, editors, tables, charts, tool UIs |
| `src/components/site/*` | Marketing header/footer, pricing, discover grid, phone |
| `src/app/admin/layout.tsx` | Suspense auth gate + admin loading shell |
| `src/app/[username]/page.tsx` | Public profile + metadata + tracking |
| `src/app/api/*`, `src/app/s/[code]` | Click/view/QR/CSV/short-link handlers + search logging |
| `src/app/api/cashfree/*` | Order creation, return verification, webhook |
| `src/components/admin/PlanPicker.tsx` | Billing toggle + Cashfree checkout launch |
| `CONTEXT.md` | Stable project context |
| `MEMORY.md` | This file |

## Useful snippets

```tsx
// Protected server page
import { requireUser } from "@/lib/auth";
const user = await requireUser();

// Server action form
<form action={addLinkAction}>
  <input type="hidden" name="id" value={link.id} />
  <button type="submit">Save</button>
</form>
```

```tsx
// Client form with action state
"use client";
import { useActionState } from "react";
import { updateHeaderAction } from "@/app/actions";
const [state, action, pending] = useActionState(updateHeaderAction, {});
```

```ts
// DB ownership check
db.prepare("UPDATE links SET visible = ? WHERE id = ? AND user_id = ?").run(visible, id, user.id);
```
