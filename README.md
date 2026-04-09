# Event Sync

A production-ready community event tracking platform built with the T3 stack. Two user roles - Admin (Exco) and Member - with distinct views, permissions, and interactions. Visual theme inspired by the Arashiyama Bamboo Grove, Kyoto.

## Tech Stack

| Layer | Technology |
|---|---|
| Framework | Next.js 15 (App Router) |
| Language | TypeScript (strict mode) |
| API | tRPC v11 |
| Styling | Tailwind CSS v4 |
| Auth + DB | Supabase Auth + Postgres + RLS |
| Realtime + Storage | Supabase |
| Deployment | Vercel |

## Commands

| Command | Description |
|---|---|
| `pnpm dev` | Start development server with Turbopack |
| `pnpm build` | Production build |
| `pnpm start` | Start production server |
| `pnpm check` | Run ESLint + TypeScript checks |
| `pnpm lint` | Run ESLint |
| `pnpm lint:fix` | Run ESLint with auto-fix |
| `pnpm format:check` | Check formatting with Prettier |
| `pnpm format:write` | Auto-format all files with Prettier |
| `pnpm typecheck` | Run TypeScript compiler check only |
| `pnpm test` | Run Vitest tests |
| `pnpm preview` | Build then start (production preview) |

## Environment Variables

Copy `.env.example` to `.env` and fill values:

| Variable | Required | Description |
|---|---|---|
| `NEXT_PUBLIC_SUPABASE_URL` | Yes | Supabase project URL |
| `NEXT_PUBLIC_SUPABASE_ANON_KEY` | Yes | Supabase anon key (safe to expose; RLS still applies) |
| `SUPABASE_SERVICE_ROLE_KEY` | Yes (server-only) | Privileged key for trusted server operations |
| `GOOGLE_STITCH_API_KEY` | Yes (server-only, if using Stitch) | API key for Google Stitch integration |
| `NODE_ENV` | Auto | `development`, `test`, or `production` |

Schema validation source of truth: `src/env.js`.

## Project Structure

```text
src/
  app/
    (auth)/login/                # login route
    member/
      dashboard/                 # member dashboard
      kanban/                    # member kanban
    api/trpc/[trpc]/route.ts     # tRPC HTTP handler
    _components/                 # UI components by feature
  lib/
    supabase/
      client.ts                  # browser client
      server.ts                  # SSR cookie-aware client
      admin.ts                   # service-role client (server-only)
  server/
    api/
      root.ts                    # tRPC root router
      routers/                   # domain routers
      trpc.ts                    # context + procedure guards
    ai/
      guard.ts                   # AI quota reservation + usage logging
  types/
    database.ts                  # app DB types
    supabase.ts                  # generated from linked remote project

supabase/
  migrations/                    # SQL migrations (remote + local changes)
  EVENTSYNC_SUPABASE_REFERENCE.md
```

## Supabase Architecture (Reusable Pattern)

This section is written so you can reuse the same approach in your next project.

### Core data model

Main tables:

- `profiles`
- `events`
- `event_members`
- `attendance`
- `contributions`
- `reflections`
- `testimonial_requests`
- `testimonials`

Key enums in `public`:

- `department`: `Software`, `Meet-ups`, `Inspire`, `Publicity`, `Connectors`, `Labs`
- `priority`: `high`, `medium`, `low`
- `roles`: `admin`, `lead`, `member`
- `status`: `attended`, `excused`, `absent`

### RLS policy strategy

Pattern used:

- Enable RLS on every domain table.
- Members can read/write only their own rows (`auth.uid() = user_id` style checks).
- Admin-wide access is checked from DB role state (`public.is_admin()`) instead of trusting JWT metadata.
- For risky write paths, use explicit `WITH CHECK` constraints and narrow operation scope (`INSERT` / `UPDATE` instead of broad `FOR ALL`).

Practical examples in this repo:

- `profiles`: owner or admin can read profile rows.
- `events`: authenticated users read; admin controls insert/update.
- `event_members`: member reads own assignments; admin manages globally.
- `reflections`: member insert/update own records; admin read/update oversight.

### RPC and function security

Pattern used:

- Sensitive functions are `SECURITY DEFINER` plus explicit admin guard checks.
- Execute permissions are explicitly granted/revoked per function.
- Avoid exposing privileged behavior through default `PUBLIC` execute grants.

### AI abuse/cost guardrails

DB objects added:

- `ai_usage_limits` (per-user limits / temporary blocks)
- `ai_usage_daily` (per-day counters)
- `ai_usage_events` (immutable usage/audit log)
- `consume_ai_quota(...)`
- `log_ai_usage_event(...)`

Server helpers:

- `src/lib/supabase/admin.ts`
- `src/server/ai/guard.ts`

Usage flow:

1. Reserve quota before provider call (`reserveAiQuota` -> `consume_ai_quota`).
2. Call provider with strict model/output limits.
3. Log result/tokens/cost (`logAiUsage` -> `log_ai_usage_event`).

## Supabase CLI Workflow

```bash
pnpm exec supabase link --project-ref <project-ref>
pnpm exec supabase migration list
pnpm exec supabase db pull
pnpm exec supabase db push
pnpm exec supabase gen types typescript --linked > src/types/supabase.ts
```

## Local Setup

```bash
pnpm install
cp .env.example .env
pnpm dev
```

Open `http://localhost:3000`.

## Additional Reference

For the full EventSync-specific Supabase snapshot (tables, functions, policy inventory), see:

- `supabase/EVENTSYNC_SUPABASE_REFERENCE.md`

## Security Notes

- Never expose `SUPABASE_SERVICE_ROLE_KEY` to client code.
- Keep privileged DB actions behind server routes/procedures only.
- Treat migrations as audit history; avoid ad-hoc production SQL drift.
