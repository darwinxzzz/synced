# Event Sync

Community event tracking platform built on the T3 stack with Supabase auth, database, and RLS.

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
| `pnpm dev` | Start development server (Turbopack) |
| `pnpm build` | Build for production |
| `pnpm start` | Start production server |
| `pnpm check` | Lint + TypeScript checks |
| `pnpm lint` | ESLint |
| `pnpm lint:fix` | ESLint with auto-fix |
| `pnpm typecheck` | TypeScript only |
| `pnpm test` | Run Vitest tests |
| `pnpm preview` | Build then start |

## Environment Variables

Copy `.env.example` to `.env` and fill values:

| Variable | Required | Description |
|---|---|---|
| `NEXT_PUBLIC_SUPABASE_URL` | Yes | Supabase project URL |
| `NEXT_PUBLIC_SUPABASE_ANON_KEY` | Yes | Supabase anon key (client-safe, RLS enforced) |
| `SUPABASE_SERVICE_ROLE_KEY` | Yes (server) | Service role key for trusted server operations only |
| `NODE_ENV` | Auto | `development`, `test`, or `production` |

Schema validation lives in `src/env.js`.

## Local Setup

```bash
pnpm install
cp .env.example .env
pnpm dev
```

Open `http://localhost:3000`.

## Supabase Workflow

This repo is linked to a remote Supabase project and uses SQL migrations under `supabase/migrations`.

Useful commands:

```bash
pnpm exec supabase link --project-ref <project-ref>
pnpm exec supabase db pull
pnpm exec supabase db push
pnpm exec supabase migration list
pnpm exec supabase gen types typescript --linked > src/types/supabase.ts
```

## Security and Guardrails

Recent hardening included:

- DB-backed admin checks via `public.is_admin()`
- RLS policy hardening to avoid JWT metadata role trust
- Admin RPC guard checks for `SECURITY DEFINER` functions
- AI abuse guardrails:
  - `ai_usage_limits`
  - `ai_usage_daily`
  - `ai_usage_events`
  - `consume_ai_quota(...)`
  - `log_ai_usage_event(...)`

Server helper code for AI quota/logging:

- `src/lib/supabase/admin.ts`
- `src/server/ai/guard.ts`

## Notes

- Keep `SUPABASE_SERVICE_ROLE_KEY` server-only.
- Never expose service-role operations to client code.
- Prefer DB/RLS enforcement for sensitive permissions.
