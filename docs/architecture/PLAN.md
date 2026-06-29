# Synced — Architecture & Implementation Plan

> Source of truth for the architecture refactor. Companion ADRs live in `docs/adr/`;
> the layer/responsibility detail lives alongside this file in `docs/architecture/`.

## 0. Context & Goals

| | |
|---|---|
| **What** | Role-aware event-management tracker for volunteer orgs (admins run events/tasks/attendance; members own tasks, log impact, earn recognition). |
| **Scale target** | 100+ concurrent users now; infrastructure that scales to 1k–10k **without rework**. |
| **Non-negotiables** | Strong security (multi-tenant, role-based), good UX and DX. |
| **Meta-goal** | Understand the architecture, not just run it — every decision has a documented "why". |

## 1. The four security rings (defence in depth)

Trust increases inward. **Only Rings 2–4 are security boundaries**; Ring 1 is UX/performance.

| Ring | Layer | Runtime | Owns | Boundary? |
|---|---|---|---|---|
| 1 | Next.js middleware | Edge | Session-cookie refresh, rate limiting | ❌ advisory |
| 2 | Route-group layouts + tRPC procedures | Node | Coarse redirect (layouts) + auth/role/status gate (procedures), Zod validation | ✅ app gate |
| 3 | Postgres RLS | DB | `auth.uid()` ownership + `is_admin()` policies | ✅ non-bypassable |
| 4 | `security definer` RPCs | DB | Privileged audited ops (`create_event`) | ✅ narrowest |

See [security-layers.md](./security-layers.md) for the full request lifecycle.

## 2. Organizing principle for admin vs member

> **Domain is a folder. Role is a guard. View is a route group.**

Admin-kanban and member-kanban are the *same domain* → one service, one router file. They
diverge only in **which procedure guards the call** (role) and **which page renders it** (view).
Services are role-agnostic and trust that the gate already passed. Full breakdown in
[responsibilities.md](./responsibilities.md).

## 3. Three entry points, one service layer

```
 USER ──→ tRPC procedure ───────┐   (session, RLS-scoped client)
STRIPE ─→ webhook route ────────┼──→ SERVICE ──→ integration adapter ──→ external API
 CRON ──→ cron route ───────────┘      │
          (signature / secret)         └──────→ Supabase (ctx.supabase OR admin client)
```

A service **receives** its Supabase client — never creates one. User paths pass the RLS-scoped
`ctx.supabase`; webhook/cron paths pass the service-role admin client. See
[folder-structure.md](./folder-structure.md).

## 4. Key decisions (see ADRs)

1. **Next.js App Router** over SPA+API / Remix / SvelteKit — [ADR-0001](../adr/0001-why-nextjs.md).
2. **Auth layering = "option b"**: middleware does session + rate-limit only; the role/status
   gate lives in route-group layouts + tRPC procedures, backed by one shared `evaluateAccess`
   function — [ADR-0002](../adr/0002-auth-layering.md).
3. **Service layer** justified by multiple non-tRPC entry points (webhooks/cron).
4. **Schemas single-sourced** in services; routers import them.

## 5. Phased plan

| Phase | Scope | Complexity | Risk |
|---|---|---|---|
| 1 — Docs | This file + ADRs + `security-layers`/`responsibilities`/`folder-structure`. | LOW | none |
| 2 — Auth layering (option b) | `lib/auth/access.ts` (pure `evaluateAccess` + `getAuthState`). Slim `middleware.ts`. Move role/status gate into server route-group layouts + tRPC. Kills logic-drift + double-fetch + edge-mutation smells. | MEDIUM | auth path — gate behind tests |
| 2.5 — Reference service | Extract one domain (`testimonials`) to `server/services/` as the copyable pattern. | MEDIUM | low |
| 3 — DRY procedures | Shared `enforceAccess` guard composed by `protected`/`admin`. | LOW | low |
| 4 — Shared validators | Inline Zod → service `schemas.ts`; routers import. | LOW | low |

## 6. Staged scaling infrastructure (documented now, built when traffic justifies)

- **JWT custom claims + local verification** (`getClaims`/asymmetric keys) → role from the
  validated token, **zero** Auth-server round-trip per request. The biggest scaling unlock.
- **Upstash Redis rate limiting** → replaces the in-memory `Map` that breaks across instances.
  Only the `lib/rate-limit` adapter changes.
- **Pagination** on unbounded `select("*")` reads as data grows.
- Already insulated: Supabase JS over PostgREST/HTTP avoids the serverless connection-pool
  explosion — no action unless direct SQL is added (then Supavisor transaction mode).

## 7. Risks & mitigations

- **HIGH — auth refactor** could lock users out → write `protected`/`admin` + `evaluateAccess`
  tests **before** touching it; RLS is the backstop.
- **MEDIUM — JWT claim staleness** after role change → keep tRPC's DB re-check as the real gate;
  treat the claim as advisory.
- **MEDIUM — service-layer leakage** (a service starts checking roles) → enforced by convention
  in `responsibilities.md` + review.
- **LOW — doc drift** → ADRs capture *why*, which ages well.
