# ADR-0002: Auth layering — slim edge, server-side gate, one access rule

- **Status:** Accepted
- **Date:** 2026-06-28
- **Context:** Auth logic was duplicated — the status/role gate was written once in
  `middleware.ts` (Edge) and again in `trpc.ts` (Node), with two independent profile fetches and
  two copies of the "is this account active?" rule that could drift. We also want a foundation
  that scales to 1k–10k users without rework.

## Decision (the option-(b) model)

1. **Edge middleware does Ring-1 work only**: refresh the Supabase session cookie, rate-limit,
   and redirect *unauthenticated* users away from protected routes. It performs **no** profile
   fetch, no status/role decision, and no `signOut`.
2. **The role/status gate is server-side**: route-group layouts (`app/admin`, `app/member`)
   gate by role, and tRPC `protectedProcedure`/`adminProcedure` enforce the real gate per
   request. Both call **one** pure function, `evaluateAccess`, in `lib/auth/access.ts`.
3. **Postgres RLS remains the non-bypassable backstop.**

## Why (scaling + DX)

- Edge middleware sits in a POP close to the *user* but far from the single-region DB; a profile
  fetch there pays a transcontinental hop on every navigation. Moving the fetch to the
  server layout (same region as the DB) makes it cheaper and removes the redundant second fetch.
- All auth logic lives in **one runtime (Node)** → easier to read, test, and reason about.
- This is the on-ramp to **JWT custom claims**: once `role` is a verified claim, even the coarse
  redirect needs zero DB calls. The claim stays *advisory*; tRPC's DB re-check is the real gate.

## Consequences

- **Positive:** single source of truth for access (`evaluateAccess`), one fetch instead of two,
  no authz decisions in a bypassable runtime, claim-ready.
- **Behavior change:** a member hitting `/admin` is redirected by the **server layout**, not the
  edge — a few ms later, still fully safe (tRPC + RLS never release their data).
- **Trade-off:** a layout that forgets the gate leaves the *page shell* unguarded (data is still
  safe via tRPC + RLS). Mitigated by the shared `requireRole` helper + review.
