# ADR-0001: Next.js App Router as the application framework

- **Status:** Accepted
- **Date:** 2026-06-28
- **Context:** Synced is a role-aware, multi-user web app needing SSR auth, an end-to-end-typed
  API, and a single deploy target a solo developer can operate cheaply.

## Decision

Use **Next.js 15 (App Router)** as the full-stack framework: React Server Components for
data-close rendering, Edge middleware for session refresh + rate limiting, and tRPC v11 mounted
at `/api/trpc` for the typed API.

## Alternatives considered

| Alternative | Why not, for *this* app |
|---|---|
| SPA (Vite/CRA) + separate API (Express/Nest) | Two deploys, two auth surfaces, hand-rolled type-sharing. Loses the single end-to-end type contract tRPC gives. |
| Remix / React Router | Excellent, but loader/action-centric; tRPC + React Query (optimistic kanban) is more idiomatic on Next, and the Radix/shadcn/TanStack ecosystem is first-class here. |
| SvelteKit | Great DX, but we want React 19 + the existing Radix/TanStack/tRPC ecosystem and React familiarity. |
| Plain Node API + RLS only | No SSR session handling, no edge layer for the cheap UX redirect, more boilerplate. |

## Consequences

- **Positive:** one deploy; edge session refresh; RSC fetches next to the DB; one tRPC type
  contract Postgres→React (schema change = compile error, not runtime 500). The four-ring
  security model composes cleanly only on this stack.
- **Caveat (load-bearing):** Next middleware runs on the Edge runtime and **must not be the
  security boundary** — it can be bypassed and is far from the single-region DB. This is exactly
  why the real authorization gate lives in tRPC procedures (Ring 2) and Postgres RLS (Ring 3).
  See [ADR-0002](./0002-auth-layering.md).
