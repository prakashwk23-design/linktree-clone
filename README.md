# Linktree Clone

A full-stack replica of [Linktree](https://linktr.ee): marketing site, auth, admin dashboard, link/header/design editors, insights, audience, earn tools, and public link-in-bio profiles.

Built with **Next.js 16**, **React 19**, **Tailwind CSS 4**, and **SQLite** via Node's built-in `node:sqlite`.

## Start here

- [`CONTEXT.md`](./CONTEXT.md) — stable project context: architecture, data model, design system, route map, and conventions.
- [`MEMORY.md`](./MEMORY.md) — living status: completed work, decisions, next steps, verification checklist.
- [`AGENTS.md`](./AGENTS.md) — auto-managed Next.js agent rules (do not hand-edit).

## Run locally

Requires **Node 22+** (developed on Node 25).

```bash
npm install
npm run dev
```

Open [http://localhost:3000](http://localhost:3000).

The SQLite database is created automatically at `data/linktree.db` on first run and seeded with demo data.

### Demo account

| Field | Value |
| --- | --- |
| Email | `demo@linktr.ee` |
| Password | `demo1234` |
| Profile | `http://localhost:3000/demo` |

Other seeded profiles include `/mayachen`, `/jordanbeats`, `/studionine`, `/nova`, `/eatwithsam`, and `/filmclub`.

## Scripts

```bash
npm run dev        # development server
npm run build      # production build
npm run start      # serve production build
npm run lint       # eslint
npx tsc --noEmit   # typecheck
```

## Status

Foundation (database, auth, server actions, themes, shared UI) is complete. The UI build is in progress — see `MEMORY.md` for the current task list.

## Notes

- This is a learning/demo clone. Payments, payouts, AI, and some tools are mocked; the link shortener, analytics tracking, QR codes, and public profiles are functional.
- The real Linktree account used for design reconnaissance was only read, never modified.
- Marketing imagery is recreated with original CSS mockups rather than copied photos.
