# Security Review

**Date:** 260714 1812 (+08:00)  
**Model:** gpt5  
**Repository:** `/Volumes/Skynet/Software Development Projects/Personal/synced/synced`  
**Scope:** Authentication/session handling, middleware, tRPC authorization, Supabase clients/RLS/RPCs, API routes, input validation, secrets/configuration, dependencies, tests, and deployment files.  
**Status:** Complete (static review; runtime/database exploit verification requires an available Supabase test environment)

## Executive Summary

Overall posture is **needs remediation before production**. The strongest finding is an RLS policy that appears to let a profile owner change their own approval `status`, defeating the pending/rejected account gate. Two security-definer quota/audit functions are callable by any authenticated user with arbitrary target user IDs. The application also relies on a process-local rate limiter keyed by a client-controlled forwarded header, and many API procedures expose raw Supabase error text. No hardcoded production secret was found in tracked source; the seed script does contain a deliberately shared default test password and must remain test-only. No P0/S0 finding was assigned because the evidence shows member-level approval/quota abuse, not demonstrated admin takeover, cross-tenant exfiltration, or total outage.

### Finding summary

| ID | Priority | Severity | Category |
|---|---:|---:|---|
| SEC-001 | P1 | S1 | Broken access control: self-service profile activation |
| SEC-002 | P1 | S1 | Security-definer RPCs accept arbitrary user IDs |
| SEC-003 | P1 | S2 | Spoofable/non-shared abuse-rate limiting |
| SEC-004 | P1 | S2 | Database/provider error disclosure |
| SEC-005 | P2 | S2 | Schema type escapes weaken security review |
| SEC-006 | P2 | S2 | Missing RLS/RPC boundary regression tests and CI gate |
| SEC-007 | P2 | S3 | Test seed contains a fixed default password |

## Findings

### SEC-001 — Profile owners can likely bypass approval status

- **Vulnerability:** Broken access control / CWE-862 (missing authorization), OWASP A01.

```text
                     ┌──────────────┐
                     │  Pending /   │
                     │  Rejected    │
                     │  User JWT    │
                     └──────┬───────┘
                            │
                            ▼
              ┌─────────────────────────┐
              │  Supabase Client        │
              │  .from('profiles')      │
              │  .update({              │
              │    status: 'active'     │
              │  })                     │
              └────────────┬────────────┘
                           │
                           ▼
              ┌─────────────────────────────┐
              │  RLS Policy Check           │
              │                             │
              │  USING: user_id = auth.uid()│
              │  ✓  Passes (own profile)    │
              │                             │
              │  WITH CHECK:                │
              │  role = old.role  ✓         │
              │  (status NOT constrained)   │
              │  ✓  Passes                  │
              └────────────┬────────────────┘
                           │
                           ▼
              ┌─────────────────────────────┐
              │  status => 'active'         │
              │  role => member (unchanged) │
              │                             │
              │  APPROVAL GATE BYPASSED     │
              └─────────────────────────────┘
```

- **Evidence:** `supabase/migrations/20260408075844_remote_schema.sql:1106-1114` defines a permissive profile-owner update policy. The `using` clause checks ownership and the `with check` clause only preserves the existing `role`; it does not preserve `status`. `supabase/migrations/20260409103000_profiles_admin_approval_gate.sql:14-22` constrains allowed status values but does not remove or replace the update policy.
- **Exploitability / proof of concept:** Using a pending or rejected user’s authenticated Supabase client, call `profiles.update({ status: 'active' }).eq('id', auth.uid())`. The submitted row keeps the same role, satisfying the shown `with check`, while `active` satisfies the status check. This must be confirmed against the deployed migrated database because this review did not have database connectivity.
- **Impact:** A user can activate their own account and bypass the admin approval gate. The evidence does not show that this changes `role` to admin, so the demonstrated impact is approval-boundary bypass rather than admin escalation.
- **Score:** **S1/P1** — meaningful authentication/authorization impact; possible on the direct authenticated data path; fix before release.
- **Remediation:** Drop the permissive policy and allow only explicitly safe profile columns, or prohibit member updates entirely. Make status transitions admin-only through a narrow RLS-protected operation. Preserve status and role in any member update `with check`.
- **Verification:** Run the POC with pending, rejected, and active member JWTs. Expect RLS denial for status/role changes; expect only the intended admin approval operation to succeed. Add negative integration tests.
- **Reference:** Supabase RLS policy behavior; OWASP A01 Broken Access Control.

### SEC-002 — Authenticated callers can target another user in quota/audit RPCs

- **Vulnerability:** Broken function authorization / CWE-639 (authorization bypass through user-controlled key).
- **Evidence:** `supabase/migrations/20260408163822_ai_quota_and_usage_guardrails.sql:92-171` accepts `p_user_id` and mutates quota rows without comparing it to `auth.uid()`. `:173-222` accepts `p_user_id` and writes audit events without caller binding. `:224-227` grants both functions to `authenticated`.
- **Exploitability / proof of concept:** An authenticated member can invoke `rpc('consume_ai_quota', { p_user_id: other_uuid, p_estimated_tokens: 1 })` or `rpc('log_ai_usage_event', { p_user_id: other_uuid, ... })` directly through Supabase. The functions are not referenced by application code today, so exposure is through the granted database API; execution should be confirmed in a test project.
- **Impact:** Cross-user quota denial/consumption and forged usage/cost/audit records. If an AI caller is later added without changing these functions, the issue becomes a direct cost-control bypass.
- **Score:** **S1/P1** — privileged security-definer functions expose integrity and denial-of-service impact to any authenticated user; possible normal API path.
- **Remediation:** Derive user identity inside user-scoped functions from `auth.uid()`; reject mismatched IDs; separate admin/service-role reconciliation from member calls; revoke `authenticated` execution until there is a reviewed caller.
- **Verification:** Assert mismatched IDs fail and create no rows, same-user calls work only where intended, and admin/service-role operations are separately authorized.
- **Reference:** OWASP A01 Broken Access Control; PostgreSQL security-definer least privilege.

### SEC-003 — Abuse-rate limiting trusts spoofable identity and local memory

```text
                    ┌──────────────────┐
                    │   Attacker       │
                    │  (many requests) │
                    └────────┬─────────┘
                             │
              ┌──────────────┼──────────────┐
              │              │              │
              ▼              ▼              ▼
        ┌───────────┐ ┌───────────┐ ┌───────────┐
        │ Request 1 │ │ Request 2 │ │ Request 3 │
        │ X-Forward-│ │ X-Forward-│ │ X-Forward-│
        │ ed-For: A │ │ ed-For: B │ │ ed-For: C │
        └─────┬─────┘ └─────┬─────┘ └─────┬─────┘
              │             │             │
              ▼             ▼             ▼
        ┌──────────────────────────────────────┐
        │        Next.js Middleware            │
        │                                      │
        │  rateLimit Map (process-local)       │
        │  ┌──────────────────────────────┐   │
        │  │  A: { count: 1 }  ✓ under   │   │
        │  │  B: { count: 1 }  ✓ under   │   │
        │  │  C: { count: 1 }  ✓ under   │   │
        │  │  ... each IP gets a new      │   │
        │  │  bucket                      │   │
        │  └──────────────────────────────┘   │
        │                                      │
        │  Instance 1   Instance 2             │
        │  ┌─────┐     ┌─────┐                │
        │  │Map A│     │Map B│ (not shared)    │
        │  └─────┘     └─────┘                │
        └──────────────────────────────────────┘
                      │
                      ▼
              ┌──────────────────┐
              │  ALL REQUESTS   │
              │  PASS THROUGH   │
              └──────────────────┘
```

- **Vulnerability:** Ineffective rate limiting / CWE-307 and CWE-346.
- **Evidence:** `src/middleware.ts:13-25` stores counters in a process-local `Map`; `:30-32` uses the first `x-forwarded-for` value; auth and tRPC thresholds are applied at `:34-43`.
- **Exploitability / proof of concept:** Send repeated requests with changing `x-forwarded-for` values, or distribute requests across instances. The code creates a new bucket for each value and has no shared store. Whether the hosting proxy overwrites this header must be confirmed in deployment.
- **Impact:** Login/API abuse controls can be bypassed, and counters are inconsistent across serverless/edge instances. The map can retain one entry per rotating value until that key is reused.
- **Score:** **S2/P1** — medium abuse-protection impact with likely exposure on public routes; P1 because it is relied on as a security control.
- **Remediation:** Use a trusted platform client-IP signal, configure proxy header rewriting, and use a shared bounded limiter. Add account/email/device controls for authentication flows.
- **Verification:** Multi-instance and forwarded-header tests must show consistent blocking and no arbitrary client-controlled bucket creation.
- **Reference:** OWASP API4 Unrestricted Resource Consumption; OWASP Authentication Cheat Sheet.

### SEC-004 — Raw database errors are serialized to clients

- **Vulnerability:** Information disclosure / CWE-209.
- **Evidence:** `src/server/api/routers/events.ts:24,58,75`, `src/server/api/routers/reflections.ts:40,74,109,142`, `src/server/api/routers/attendance.ts:22,49,120`, and many analogous locations pass `error.message` into `TRPCError`. `src/server/api/routers/auth.ts:19-22` and `kanban.ts:269` throw raw errors.
- **Exploitability / proof of concept:** Trigger a constraint, relation, or database failure through an authenticated mutation and inspect the tRPC error payload. The route handler’s production `onError` logging is disabled (`src/app/api/trpc/[trpc]/route.ts:24-31`), but the router message remains client-facing.
- **Impact:** Authenticated callers can learn schema/provider/policy details, aiding reconnaissance and exposing operational data. Exact leakage depends on provider error content.
- **Score:** **S2/P1** — medium information-disclosure impact, possible-to-likely on error paths.
- **Remediation:** Return stable generic messages and internal error codes; log full errors server-side with request IDs and redact user-controlled content.
- **Verification:** Inject representative provider errors and assert no table names, SQL fragments, policy names, or provider internals appear in the client response.
- **Reference:** OWASP A05 Security Misconfiguration; CWE-209.

### SEC-005 — Unchecked schema casts weaken authorization-sensitive code

- **Vulnerability:** Type-safety/security-maintenance weakness / CWE-704.
- **Evidence:** `src/server/api/routers/kanban.ts:44-64,68-82,429-433,452-500` and `src/server/api/routers/dashboard.ts:53,79,144` cast Supabase results and updates through `unknown` or `Record<string, unknown>`; reflections uses a handwritten result type at `src/server/api/routers/reflections.ts:23-38`.
- **Impact:** Migration drift can silently change selected or updated fields in code that shapes user-visible and authorization-sensitive data. This is not a demonstrated bypass, but it reduces assurance that RLS/query assumptions match the schema.
- **Score:** **S2/P2** — medium assurance impact, possible likelihood.
- **Remediation:** Regenerate database types from the authoritative migration state, reconcile missing columns, remove casts, and add compile-time checks for query projections.
- **Verification:** Typecheck with regenerated types and add integration assertions for member/admin row shapes and denied fields.

### SEC-006 — Security boundaries are not gated by repository automation or direct RLS tests

- **Vulnerability:** Insufficient security testing / CWE-693.
- **Evidence:** No `.github/` CI configuration was found. `docs-project/agents/testing-strategy.md:9` says no repository-wide coverage threshold is configured. Tests cover procedure-level authorization (`tests/integration/server/api/routers/*`) but there is no direct RLS test for profile field tampering, no quota-RPC test, and no middleware test for forwarded-header/rate-limit behavior.
- **Impact:** A passing tRPC test suite can coexist with an over-permissive direct Supabase policy or RPC. Security regressions can merge without a repeatable gate.
- **Score:** **S2/P2** — medium assurance impact, likely over time.
- **Remediation:** Add disposable Supabase integration tests for member/admin RLS and RPC paths; add middleware tests; enforce them in CI alongside typecheck/lint/unit tests.
- **Verification:** Introduce intentionally failing policy and procedure cases and confirm CI blocks them.

### SEC-007 — Seed script uses a fixed shared password

- **Vulnerability:** Credential hygiene / CWE-798 (use of hard-coded credentials), limited to test tooling.
- **Evidence:** `scripts/seed-auth-users.mjs:5` defines `DEFAULT_PASSWORD = "Passw0rd!123"`; dry-run output prints it at `:136-144`; created seed users use it at `:157-165`. The script requires an explicit `--apply` flag (`:6-10`).
- **Impact:** If seed identities or the password are used outside an isolated test project, anyone with the known password can authenticate as those users. This is not a production secret in the repository, but the tooling makes unsafe reuse easy.
- **Score:** **S3/P2** — low impact if strictly isolated test data, possible operational misuse.
- **Remediation:** Require a password from an environment variable or generate random passwords; never print credentials by default; add an environment/project safety check before `--apply`.
- **Verification:** Dry-run must not print a usable password; apply must fail without an explicit test-only credential and safety confirmation.

## Positive Controls Observed

- `src/lib/supabase/admin.ts:1` uses `server-only` and the service-role client is not imported into client components.
- `src/server/api/trpc.ts:63-88` centralizes protected/admin procedure gates and `src/lib/auth/access.ts:33-62` centralizes status/role decisions.
- Zod validation covers most tRPC mutation inputs, including UUIDs, enumerations, length limits, and URL validation.
- RLS is enabled on the main application tables, and `20260408162724_security_hardening_admin_rls_and_rpc.sql` replaces several old JWT metadata policies with `public.is_admin()` checks.
- `.env` and test environment files are ignored by the repository’s normal ignore rules; no production secret value was found in tracked files.

## Recommended Timeline

### Immediate / before release

1. Fix SEC-001 and SEC-002 with migrations and direct member/admin regression tests.
2. Revoke or bind the quota RPCs before any AI feature uses them.
3. Stop serializing raw provider/database errors.

### Short term

4. Replace the process-local forwarded-header limiter and add middleware abuse tests.
5. Add CI with migration/RLS, typecheck, lint, and focused authorization gates.

### Hardening backlog

6. Regenerate database types, remove casts, bound list queries, and improve seed-script safety.

## Compliance / Privacy Notes

The application stores profile identity data, attendance, contributions, reflections, and testimonials. No specific compliance framework was supplied and no formal retention, deletion, export, audit-log retention, or incident-response controls were evidenced in the repository. Treat those as open requirements rather than confirmed violations.

## Verification Commands and Limitations

- Static scans used `rg`, `find`, `git status`, and numbered source/migration inspection.
- Attempted: `pnpm typecheck`, `pnpm test -- --reporter=dot`, `pnpm lint`, and `pnpm format:check`. Each failed to start because `pnpm` is unavailable; `node_modules/.bin/tsc`, `vitest`, and `eslint` are also absent.
- Direct RLS/RPC exploit tests were not run because no Supabase test connection was available in the checkout. Findings SEC-001 and SEC-002 therefore include precise proof-of-concept requests and must be confirmed against a disposable migrated database before closure.
- No dependency CVE status is claimed; an installed lockfile-aware vulnerability scanner and network-backed audit were not available in this environment.
