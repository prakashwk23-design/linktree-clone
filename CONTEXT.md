# Linktree Clone — Project Context

> Stable reference for what this project is, how it is built, and the rules that keep it consistent.
> For live status, decisions, and next steps, see [`MEMORY.md`](./MEMORY.md).
> `AGENTS.md` is auto-managed by `next dev` (Next.js agent rules) — do not hand-edit it; add project notes here instead.

## 1. What we are building

A full, working replica of **Linktree** (`linktr.ee`) as a self-hosted SaaS clone, not a single landing page.

Scope:

- Marketing site that closely reproduces Linktree's public homepage, pricing, discover, and footer/nav.
- Auth: register, login, logout, session persistence.
- Admin dashboard with the real Linktree information architecture.
- Link editor, header editor, design editor with live preview.
- Insights (analytics), Audience (contacts), Earn (products/sales), Account/Settings, Tools.
- Public link-in-bio profiles at `/[username]`, with themes, social icons, click/view tracking, QR codes.
- Tools: link shortener (functional), business cards, social planner, Instagram auto-reply, post ideas.

**Branding:** the user explicitly asked for exact Linktree branding — name, logo, colors, and copy. This is an intentional clone for the user's own use; keep the Linktree wordmark/visual language faithful. Do not copy third-party photos/assets that we cannot recreate; use original CSS phone/art mockups instead.

**Do not make changes in the user's real Linktree account.** Recon was read-only. The clone lives entirely in this repo.

## 2. Stack

| Layer | Choice | Notes |
| --- | --- | --- |
| Framework | Next.js 16.4.6 (App Router, Turbopack) | Cache Components enabled |
| UI | React 19.3.0 | Server Components by default |
| Styling | Tailwind CSS 4.3.3 (`@import "tailwindcss"`, `@theme`) | No tailwind.config file |
| Language | TypeScript 5 | Strict mode |
| Database | SQLite via Node 25 built-in `node:sqlite` (`DatabaseSync`) | No native dependency |
| Auth | Custom cookie sessions + scrypt | Cookie name `lt_session` |
| Icons | `lucide-react`, plus hand-written brand SVGs | |
| QR | `qrcode` | Server-side PNG generation |
| Fonts | `next/font/google`: DM Sans, Space Grotesk, Fraunces | CSS vars |

Requirements: **Node 22+** (25.2.1 currently installed) because of `node:sqlite`.

## 3. Commands

```powershell
cd D:\linktree-clone
npm run dev        # http://localhost:3000
npm run build
npx tsc --noEmit   # typecheck without a full build
npm run lint
```

The SQLite file is created lazily at `data/linktree.db` (WAL mode) on first DB access and seeded if empty. Delete `data/` to reset the database.

## 4. Architecture

```
src/
  app/
    layout.tsx            # root layout, fonts, metadata, `export const instant = false`
    globals.css           # Tailwind v4 theme tokens, keyframes, helpers; `@source not "../../data"`
    page.tsx              # marketing homepage
    actions.ts            # all server actions ("use server")
    ...
  components/
    ui/                   # Button, Form, Modal, Logo, Avatar, PlatformIcon
    site/                 # marketing header/footer/sections
    profile/              # ProfileBody (themed) + ProfileLinks (search, collections)
    admin/                # admin shells + editors + tool UIs
  lib/
    db.ts                 # schema + seed
    data.ts               # query helpers, analytics, validation helpers
    auth.ts               # session cookie helpers, requireUser()
    password.ts           # scrypt hash/verify
    themes.ts             # themes, fonts, button/corner styles, plan definitions
    collections.ts        # collection plan limits + slug generation
    cashfree.ts           # server-only Cashfree orders + webhook signature checks
    ai.ts                 # OpenAI-compatible AI client (chat + post ideas)
    social.ts             # OAuth provider configs, token exchange, profile lookup
    types.ts              # shared row/type definitions
```

### Server vs client

- Pages/layouts are Server Components; read DB via `src/lib/data.ts` and `src/lib/auth.ts`.
- Interactive parts (modals, editors, auth forms, toggles) are Client Components using `"use client"`.
- Server Actions live in `src/app/actions.ts`; import them directly into client components. They call `revalidatePath` after mutations.
- Forms that need to keep the user's input on a validation error must not use `<form action={fn}>`: React resets uncontrolled fields after every action submit. Use `onSubmit` + `event.preventDefault()` and reset manually on success (see `ShortLinkManager`, `EarnManager`, edit/social modals in `LinkEditor`).
- Never import `src/lib/db.ts`, `src/lib/auth.ts` or `src/lib/cashfree.ts` into client code. They import `server-only`.

### Next.js 16 specifics (important)

- `cookies()`, `headers()`, `params`, and `searchParams` are **async**. Always `await`.
- `cacheComponents: true` + `partialPrefetching: true` are enabled in `next.config.ts`.
- Root layout sets `export const instant = false`, but that opt-out does **not** propagate to descendant segments. Each admin `page.tsx`/`layout.tsx` repeats it. Do not remove without adding Suspense/caching boundaries.
- Route handlers: dynamic segments' `params` is a Promise.
- Server Actions used with `<form action={fn}>` are fine; forms with validation state use `useActionState`.
- `redirect()` throws — call it outside try/catch or rethrow.
- Keep `"use server"` at the top of `actions.ts`; all exports must be async functions.

## 5. Data model (`src/lib/db.ts`)

Tables (all created with `CREATE TABLE IF NOT EXISTS`):

- `users` — `id, email UNIQUE, password_hash, username UNIQUE NOCASE, name, bio, avatar, plan, theme, button_style, corner_style, font, layout, title_style, wallpaper, show_footer, created_at`
- `links` — `id, user_id → users, title, url, type ('link' | 'featured'), position, visible, thumbnail, collection_id → collections (nullable), created_at`
- `socials` — `id, user_id, platform, url, position`
- `collections` — `id, user_id → users, name, position, created_at`
- `views` — `id, user_id, created_at, referrer, country`
- `clicks` — `id, link_id, user_id, created_at, referrer`
- `searches` — `id, user_id, query, results_count, created_at`
- `contacts` — `id, user_id, name, email, source, created_at`
- `products` — `id, user_id, name, description, cover, price_cents, sales, created_at`
- `short_links` — `id, user_id, code UNIQUE, target, clicks, created_at`
- `sessions` — `token PK, user_id, expires_at`
- `social_connections` — `id, user_id → users, provider, account_name, access_token, refresh_token, expires_at, created_at` (UNIQUE per user+provider; tokens never sent to the client)
- `payments` — `id, user_id, plan, billing ('monthly' | 'annual'), amount (paise), currency, status ('pending' | 'paid' | 'failed' | 'expired' | 'demo'), cf_order_id, payment_session_id, cf_payment_id, created_at, updated_at, paid_at`

Existing databases are patched in place: missing columns (`products.cover`, `links.collection_id`) are added with `ALTER TABLE`, tolerating duplicate-column races.

Seed data (runs only when `users` is empty):

- Demo account: **`demo@linktr.ee` / `demo1234`**, username `demo`, Pro plan, 14 links, 4 socials, 3 collections (`Watch` 3, `Listen` 2, `Resources` 4), 42 search events, contacts, products, a short link, and 14 days of seeded views/clicks.
- Six public profiles: `mayachen`, `jordanbeats`, `studionine`, `nova`, `eatwithsam`, `filmclub` (all password `demo1234`, though only `demo` is intended for login).
- All seeded users and the demo password live in `db.ts`. Keep usernames synchronized with `RESERVED_USERNAMES` in `data.ts`.

`src/lib/data.ts` provides: user lookups, links/socials/collections/contacts/products/short links, counts, 7/14/30-day analytics (`getAnalytics`, `getTopLinks`, `getReferrers`, `getCollectionStats`), search stats (`getSearchStats`), setup checklist, discover profiles, platform stats, `normalizeUrl`, `cleanUsername`, `RESERVED_USERNAMES`.

`src/lib/collections.ts` owns collection plan limits (`collectionLimit`, `canCreateCollection` — Free 1, paid unlimited) and slug generation (`slugifyCollection`, `collectionSlugs` with `-2`/`-3` dedupe).

## 6. Auth

- Register: validate email/password (8+ chars)/username (3+, not reserved, unique), hash with scrypt, insert, create session, `redirect('/admin')`.
- Login: accepts email **or** username; verifies scrypt hash; creates session (`lt_session`, httpOnly, sameSite=lax, 30 days).
- `requireUser()` in `lib/auth.ts` calls `await connection()` (session + current-time reads must happen per request), then redirects to `/login` when unauthenticated. Use it in admin layouts and any protected server action.
- `logoutAction` clears the DB session and cookie.
- Sessions are stored in SQLite and validated against `expires_at`.

## 7. Design system

Tokens are defined in `src/app/globals.css` under `@theme`:

| Token | Hex | Use |
| --- | --- | --- |
| `chartreuse` | `#D2E823` | Linktree primary accent, hero |
| `shade` | `#1E2330` | Primary text / dark surfaces |
| `shade-soft` | `#394154` | Secondary dark |
| `forest` | `#254F1A` | Dark green accent |
| `cobalt` | `#2665D6` | Blue feature band |
| `oxblood` | `#780016` | Deep red feature band |
| `sage` | `#E8EFD6` | Light green feature band |
| `chalk` | `#F3F3F1` | Page background |
| `blush` | `#E9C0E9` | Pink accent |
| `grape` | `#502274` | Purple CTAs / premium |
| `grape-deep` | `#3D1A5A` | Hover |
| `lilac` / `violet` | `#D9C7FF` / `#7B2CBF` | Purple accents |
| `coral` | `#FF7A59` | Warm accent |

- Body font: **DM Sans** (`--font-sans`). Display headings use DM Sans at 700–800, tight tracking. Space Grotesk and Fraunces are available as profile fonts.
- Marketing style: full-bleed color bands, oversized headings, pill buttons, black/white controls, rounded cards, subtle grain via `.grain`.
- Admin style: `chalk` page background, white rounded-2xl cards, subtle borders, purple primary actions, dense 13–14px UI text.
- Shared classes: `focus-ring`, `hide-scrollbar`, `phone-shadow`, `grain`, `tabular`, `text-balance`.
- Reusable UI:
  - `Button` / `ButtonLink` — variants primary/dark/outline/ghost/chartreuse/white/cobalt, sizes sm/md/lg.
  - `Form.tsx` — `Field`, `Input`, `Textarea`, `Select`, `Switch`, `inputClass`, `textareaClass`, `selectClass`.
  - `Modal.tsx` — client dialog with Escape/scroll lock, sizes sm/md/lg.
  - `Logo` — official Linktree wordmark SVG (recovered from live site) + `StarMark`.
  - `Avatar` — deterministic gradient avatars with initials.
  - `PlatformIcon` / `PlatformBadge` — 17 brand glyphs.

## 8. Route map

Marketing/public:

| Route | Purpose | Rendering |
| --- | --- | --- |
| `/` | Marketing homepage | Static |
| `/pricing` | Plans (Free/Starter/Pro/Premium) | Static |
| `/discover` | Public profile directory | Static (DB snapshot at build) |
| `/login`, `/register` | Auth | Static shell + action |
| `/[username]` | Public profile (collections, search, tracking) | Partial prerender (per-request tracking) |
| `/s/[code]` | Short-link redirect | Dynamic |
| `/api/click/[id]` | Track click + redirect | Dynamic |
| `/api/view` | Track profile view | Dynamic |
| `/api/search` | Log a settled profile search (rate-limited 40/10min per IP+user) | Dynamic |
| `/api/qr` | QR PNG | Dynamic |
| `/api/analytics/export` | CSV export | Dynamic |
| `/api/cashfree/order` | Create a Cashfree order for a plan | Dynamic |
| `/api/cashfree/return` | Verify the order after checkout, unlock the plan | Dynamic |
| `/api/cashfree/webhook` | Signed Cashfree webhook, idempotent activation | Dynamic |
| `/api/ai/chat` | Ask Linktree assistant (falls back offline without a key) | Dynamic |
| `/api/ai/post-ideas` | AI post idea generator (falls back offline without a key) | Dynamic |
| `/api/social/[provider]/connect` | Start OAuth for a social provider | Dynamic |
| `/api/social/[provider]/callback` | OAuth callback, stores the connection | Dynamic |

Admin (real Linktree IA; shell types in parentheses):

| Route | Purpose | Shell |
| --- | --- | --- |
| `/admin` | Dashboard: greeting, profile, weekly visitors, checklist, AI chat | Sidebar |
| `/admin/links` | Link editor + Add link modal + social icons | Editor rail |
| `/admin/header` | Layout, avatar, title, bio, title style | Editor rail |
| `/admin/design` | Theme, wallpaper, buttons, text, colors, footer | Editor rail |
| `/admin/insights` | Stats, chart, top links, referrers | Sidebar |
| `/admin/audience` | Contacts table, add contact | Sidebar |
| `/admin/earn` | Products, sales, payouts | Sidebar |
| `/admin/account` | Personal, password, plan, privacy, delete | Sidebar |
| `/admin/media-kit` | Media kit | Sidebar |
| `/admin/messaging` | Inbox mock | Sidebar |
| `/admin/business-cards` | Business card + QR | Sidebar |
| `/admin/social-planner` | Content calendar | Sidebar |
| `/admin/igdm` | Instagram auto-reply flow | Sidebar |
| `/admin/link-shortener` | Short link CRUD (functional) | Sidebar |
| `/admin/post-ideas` | Content idea generator | Sidebar |

Admin layout split (shipped):

- `src/app/admin/layout.tsx` — `<Suspense>`-wrapped auth gate (`requireUser()` → `connection()`) with a sidebar skeleton fallback.
- `src/app/admin/(app)/layout.tsx` — full sidebar shell (dashboard, insights, audience, earn, account, tools).
- `src/app/admin/(editor)/layout.tsx` — icon rail shell with profile chip + Preview/Share (links, header, design).
- Every admin `page.tsx`/`layout.tsx` exports `instant = false`; the root opt-out does not inherit into descendants.

## 9. Themes and plans (`src/lib/themes.ts`)

- 10 profile themes: `chartreuse`, `midnight`, `ocean`, `sunset`, `bubblegum`, `forest`, `lavender`, `chalk`, `cherry`, `paper`. Each defines background, text, muted, button colors, border, accent, swatches, `dark`, and is consumed by `getTheme(id)`.
- Fonts: `dm-sans`, `space`, `fraunces` (`fontFamily()`).
- Button styles: `solid`, `outline`, `glass`.
- Corners: `rounded` (14px), `pill` (999px), `square` (4px).
- Wallpapers: `fill`, `gradient`, `dots`.
- Plans (INR, `formatINR()` renders paise): Free ₹0, Starter ₹199/mo billed annually (₹2,388) or ₹299 monthly, Pro ₹499 (₹5,988) or ₹749 (highlighted, 7-day trial), Premium ₹1,199 (₹14,388) or ₹1,799. Each plan carries `amount` (annual, paise) and `monthlyAmount`. `planName()` / `getPlan()` helpers.
- Paid upgrades go through Cashfree: `POST /api/cashfree/order` → hosted checkout → `GET /api/cashfree/return` (order verified against the Cashfree API) and `POST /api/cashfree/webhook` (HMAC-SHA256 over `timestamp + rawBody`). `completePayment()` is idempotent. Only Free can be switched without paying.

## 10. Conventions / guardrails

- Keep marketing copy in the Linktree voice. Preserve exact known copy where captured ("A link in bio built for you.", "Everything you are, in one simple link", etc.).
- Prefer Server Components; add `"use client"` only for interactivity. Don't import DB/auth into client files.
- Call `revalidatePath` in every mutating action (helper `refreshProfile(username)` exists for profile/editor changes).
- Ownership checks are mandatory on every mutation: SQL must include `AND user_id = ?` (or verify ownership first).
- Normalize URLs with `normalizeUrl` / the same logic already in actions; reject invalid URLs.
- Escape user text via React automatically; never use `dangerouslySetInnerHTML` with user content.
- Admin URLs should mirror real Linktree. Media kit, messaging, tools pages are new but fit the IA.
- Public profile links must go through `/api/click/[id]` for analytics; add `target` handling and open externally.
- Use `next/link` internally, plain `<a>` for external/tracking routes.
- Use `next/image` for local images if any; CSS mockups are preferred over stock photos.
- Keep files small and colocated; components under `src/components/{ui,site,admin,profile}`, data helpers in `src/lib`.
- Formatting: 2-space indent, double quotes, semicolons; Tailwind utility-first with occasional shared classes for repeated styles.

## 11. Environment

All keys are optional; the app falls back to safe demo behavior when they are absent. See `.env.example` for the full, commented list.

- `NEXT_PUBLIC_APP_URL` — optional; used for payment return/webhook URLs and OAuth redirect URIs. Set to the deployed origin when hosting.
- **AI** — `AI_API_KEY` (alias `OPENAI_API_KEY`), `AI_MODEL` (default `gpt-4o-mini`), `AI_BASE_URL` (default OpenAI). Any OpenAI-compatible `/chat/completions` endpoint works. Powers `/api/ai/chat` (Ask Linktree) and `/api/ai/post-ideas`. Without a key both fall back to the built-in offline idea bank/replies.
- **Payments** — `CASHFREE_APP_ID`, `CASHFREE_SECRET_KEY`, `CASHFREE_ENV` (`sandbox` | `production`). Without keys, development activates plans as `demo` payments; production returns 503 instead of upgrading for free.
- **Social OAuth** — `INSTAGRAM_CLIENT_ID/SECRET`, `TIKTOK_CLIENT_KEY/SECRET`, `YOUTUBE_CLIENT_ID/SECRET`, `SPOTIFY_CLIENT_ID/SECRET`, `X_CLIENT_ID/SECRET`. Provider redirect URI: `{NEXT_PUBLIC_APP_URL}/api/social/<provider>/callback`. Tokens are stored in `social_connections` (server-side only).
- SQLite data is local and disposable.

## 12. Known gaps / risks

- `/discover` renders per request with working category filters (`/discover?category=Design`).
- Link reordering uses up/down buttons; real drag-and-drop is not implemented.
- Avatars and thumbnails are URL/text fields — there is no file upload pipeline.
- Products, payouts and messaging are mocked. Plan checkout is real Cashfree (only the keyless demo path has been exercised). AI chat/post ideas and social OAuth are real integrations that activate when their env keys are present; without keys they degrade to offline/mocked behavior.
- React resets uncontrolled form fields after a `<form action={fn}>` submit, even when the action returns an error — use `onSubmit` + `preventDefault` for forms that must preserve input.
- In the browser-automation harness a background tab never hydrates; focus the tab before interacting or every client form looks broken.
- The clone's public profiles use the standard Linktree link-list layout; the real `linktr.ee/linktr.ee` profile has a custom rich layout that we are not replicating.
- Photos from the live marketing site are proprietary; use original CSS/gradient mockups instead.
- `node:sqlite` prints an experimental warning; this is expected on Node 25.
- Turbopack + Tailwind v4 uses the custom loader rule in `next.config.ts`; don't replace it with a `postcss.config` without verifying the build.
- Not a git repo yet — ask before `git init`/committing.

## 13. Recon reference (read-only)

The real admin was explored while logged in as the user's account `prakashwk23`. Observed shells:

- Sidebar: `My Linktree`, `Earn`, `Media kit`, `Audience`, `Insights`, `Messaging`, `Tools` (Business cards, Social planner, Instagram auto-reply, Link shortener, Post ideas), `Settings`, setup checklist (50%, 3 of 6), AI chat panel ("Ask Linktree").
- Editor rail: profile chip, `Preview`, `Share`; icons for `Content`, `Header`, `Design`, settings. Header editor has Classic/Hero/Banner/Cutout/Shape layouts, title 0/30, bio 0/160, Text/Logo title style. Design has Theme/Customize, Wallpaper (Pro), Buttons (Pro), Text (Pro), Colors (Pro), Stickers, Footer.
- Add link modal: tiles Collection, Link, Product, Form; categories Suggested, Commerce, Social, Media, Contact, Events, Text, View all; suggested apps Messaging, Instagram, TikTok, Image gallery.

Use this as the source of truth for IA and labels.

## 14. Resume protocol

1. Read `MEMORY.md` for current status.
2. `cd D:\linktree-clone`, check `git status` (repo currently not initialized), run `npx tsc --noEmit` before and after changes.
3. Continue from the first unchecked item in `MEMORY.md` → "Next steps".
4. Verify the affected flow in the browser (`npm run dev`) and update `MEMORY.md` with what changed and any new blockers.
