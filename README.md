# 🎋 Event Sync

A production-ready community event tracking platform built with the T3 stack. Two user roles — Admin (Exco) and Member — with distinct views, permissions, and interactions. Visual theme inspired by the Arashiyama Bamboo Grove, Kyoto.

## Tech Stack

| Layer | Technology |
|-------|-----------|
| Framework | Next.js 15 (App Router) |
| Language | TypeScript (strict mode) |
| API | tRPC v11 |
| Styling | Tailwind CSS v4 |
| Auth | NextAuth v5 (Discord) → migrating to Supabase Auth |
| Database | Supabase Postgres + RLS |
| Real-time | Supabase Realtime |
| File Storage | Supabase Storage |
| Deployment | Vercel |

<!-- AUTO-GENERATED -->
## Commands

| Command | Description |
|---------|-------------|
| `pnpm dev` | Start development server with Turbopack |
| `pnpm build` | Production build with type checking and lint |
| `pnpm start` | Start production server |
| `pnpm check` | Run ESLint + TypeScript checks |
| `pnpm lint` | Run ESLint |
| `pnpm lint:fix` | Run ESLint with auto-fix |
| `pnpm format:check` | Check formatting with Prettier |
| `pnpm format:write` | Auto-format all files with Prettier |
| `pnpm typecheck` | Run TypeScript compiler check only |
| `pnpm preview` | Build then start (production preview) |
<!-- /AUTO-GENERATED -->

<!-- AUTO-GENERATED -->
## Environment Variables

Copy `.env.example` to `.env` and fill in the values. Schema is validated at startup via `src/env.js`.

### Server-side (never exposed to client)

| Variable | Required | Description |
|----------|----------|-------------|
| `AUTH_SECRET` | Yes (prod) | NextAuth secret — generate with `npx auth secret` |
| `AUTH_DISCORD_ID` | Yes | Discord OAuth application client ID |
| `AUTH_DISCORD_SECRET` | Yes | Discord OAuth application client secret |
| `NEXT_PUBLIC_SUPABASE_URL` | Planned | Supabase project URL |
| `NEXT_PUBLIC_SUPABASE_ANON_KEY` | Planned | Supabase anon key (safe to expose — RLS enforced) |
| `SUPABASE_SERVICE_ROLE_KEY` | Planned | Supabase service role key — **server only, never expose** |

> Set `SKIP_ENV_VALIDATION=1` to bypass env validation (useful for Docker builds).
<!-- /AUTO-GENERATED -->

## Project Structure

```
src/
├── app/
│   ├── _components/
│   │   ├── marketing/      ← Landing page (Navbar, Hero, Features, etc.)
│   │   ├── kanban/         ← Kanban board drawers
│   │   ├── attendance/     ← Attendance components
│   │   ├── shared/         ← Shared components (SlideDrawer)
│   │   └── ui/             ← shadcn/ui component library
│   ├── api/
│   │   ├── auth/           ← NextAuth handler
│   │   └── trpc/           ← tRPC HTTP handler
│   ├── layout.tsx          ← Root layout (fonts, providers)
│   └── page.tsx            ← Landing page entry
├── server/
│   ├── api/
│   │   ├── root.ts         ← tRPC root router
│   │   └── routers/        ← Feature routers (post, attendance)
│   ├── auth/               ← NextAuth config
│   └── api/trpc.ts         ← tRPC context + procedures
├── trpc/                   ← Client-side tRPC hooks + provider
├── styles/globals.css      ← Design tokens, keyframes, Tailwind theme
└── env.js                  ← Environment variable schema (Zod)
```

## Development Setup

```bash
# Install dependencies
pnpm install

# Copy env file and fill in values
cp .env.example .env

# Start dev server
pnpm dev
```

Open [http://localhost:3000](http://localhost:3000).

## User Roles

| Feature | Admin (Exco) | Member |
|---------|-------------|--------|
| Contribution Dashboard | ✓ | ✗ |
| Kanban — Bird's Eye Overview | ✓ | ✗ |
| Kanban — Open Board | ✓ | ✓ (own tasks) |
| Kanban — Add Event / Manage Members | ✓ | ✗ |
| Add Contribution | ✗ | ✓ |
| Attendance Management | ✓ | ✗ |

## Design Tokens

| Token | Value | Usage |
|-------|-------|-------|
| `--deep-forest` | `#1C3A2B` | Navbar, hero overlays, primary buttons |
| `--bamboo-green` | `#4A7C59` | Active states, CTAs |
| `--sage-mist` | `#A8C5A0` | Badges, hover backgrounds |
| `--ivory-paper` | `#F5F0E8` | Page background |
| `--cream-white` | `#FAFAF7` | Card surfaces |
| `--accent-gold` | `#C4A35A` | CTAs, highlights |

## Deployment

Deploy to Vercel with zero config — the project is Vercel-native.

```bash
vercel deploy
```
