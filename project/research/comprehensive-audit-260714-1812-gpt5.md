# Comprehensive Repository Audit

**Date:** 260714 1812 (+08:00)  
**Model:** gpt5  
**Repository:** `/Volumes/Skynet/Software Development Projects/Personal/synced/synced`  
**Scope:** `src/`, `supabase/migrations/`, `scripts/`, `tests/`, package/build configuration, README, and project documentation. `Workflow-Scripts/` was used as the governing workflow and was not audited as application code.  
**Status:** Complete (static audit; runtime validation was attempted but blocked by the missing pnpm/toolchain)

## Executive Summary

Overall health is **C**: the application has a coherent Next.js/tRPC/Supabase shape and meaningful role-aware tests, but its system design currently relies on duplicated authorization logic, application-level orchestration for multi-write workflows, and database policies that contain a likely approval-gate bypass. The three greatest risks are the self-service profile-status update policy, authenticated quota/audit RPCs with arbitrary user IDs, and rate limiting that is both spoofable through `x-forwarded-for` and ineffective across instances. Architecturally, the strongest next step is to make Supabase the explicit invariant/authorization boundary, keep tRPC as a thin application boundary, and move multi-step domain operations into transactional services or database functions. The largest opportunities are to make RLS policies explicit and testable, remove the type escapes by regenerating database types, and add CI with security-focused integration tests. No source code was modified during this audit. A full test/lint/typecheck/build result could not be obtained because `pnpm` and `node_modules/.bin` tools are absent in the checkout.

## Repo Map

### Purpose and stack

Synced is a role-aware coordination platform for volunteer/community organisations: admins manage events, tasks, attendance, and testimonials; members manage assigned work, contributions, reflections, and recognition. The stack is Next.js 15 App Router, React 19, TypeScript, tRPC 11, Supabase Auth/Postgres/RLS, Zod, Vitest, and Playwright.

### Architecture sketch

```text
┌─────────────────────────────────────────────────────────────┐
│                    REQUEST FLOW                              │
│                                                              │
│  ┌──────────┐                                                │
│  │ Browser  │                                                │
│  └────┬─────┘                                                │
│       │                                                      │
│       ▼                                                      │
│  ┌──────────────────────────────────────────────────────┐    │
│  │           Next.js Middleware (middleware.ts)          │    │
│  │  ┌──────────┐ ┌──────────┐ ┌────────────────────┐   │    │
│  │  │  Session │ │   Rate   │ │  Route Protection  │   │    │
│  │  │  Refresh │ │  Limit   │ │  + Role Redirect   │   │    │
│  │  │          │ │  (Map)   │ │                    │   │    │
│  │  └──────────┘ └──────────┘ └────────────────────┘   │    │
│  └──────────────────────┬───────────────────────────────┘    │
│                         │                                    │
│                         ▼                                    │
│  ┌──────────────────────────────────────────────────────┐    │
│  │          tRPC HTTP Handler (/api/trpc)               │    │
│  └──────────────────────┬───────────────────────────────┘    │
│                         │                                    │
│                         ▼                                    │
│  ┌──────────────────────────────────────────────────────┐    │
│  │           tRPC Context (createTRPCContext)           │    │
│  │  ┌────────────────────────────────────────────────┐  │    │
│  │  │  Creates SSR Supabase client                   │  │    │
│  │  │  Resolves user+profile via getAuthState()      │  │    │
│  │  └────────────────────────────────────────────────┘  │    │
│  └──────────────────────┬───────────────────────────────┘    │
│                         │                                    │
│                         ▼                                    │
│  ┌──────────────────────────────────────────────────────┐    │
│  │              Procedure Gates                          │    │
│  │  ┌──────────────┐  ┌──────────────┐  ┌────────────┐ │    │
│  │  │    Public    │  │  Protected   │  │   Admin    │ │    │
│  │  └──────────────┘  └──────────────┘  └────────────┘ │    │
│  └──────────────────────┬───────────────────────────────┘    │
│                         │                                    │
│         ┌───────────────┼───────────────────────┐             │
│         │               │                       │             │
│         ▼               ▼                       ▼             │
│  ┌──────────────┐ ┌──────────────┐ ┌─────────────────────┐   │
│  │   SSR        │ │  Browser    │ │  Service-Role       │   │
│  │  Supabase    │ │  Supabase   │ │  Admin Client       │   │
│  │  Client      │ │  Client     │ │  (attendance only)  │   │
│  └──────┬───────┘ └──────┬──────┘ └──────────┬──────────┘   │
│         │               │                    │              │
└─────────┼───────────────┼────────────────────┼──────────────┘
          │               │                    │
          ▼               ▼                    ▼
┌─────────────────────────────────────────────────────────────┐
│                 Supabase Postgres + RLS                      │
│  ┌─────────┐ ┌──────────┐ ┌──────────────┐ ┌────────────┐  │
│  │  Auth   │ │ Profiles │ │ Application  │ │ RLS/       │  │
│  │(Supabase│ │  Table   │ │   Tables     │ │ Triggers   │  │
│  │  Auth)  │ │          │ │              │ │            │  │
│  └─────────┘ └──────────┘ └──────────────┘ └────────────┘  │
└─────────────────────────────────────────────────────────────┘
```

### Key directories

| Area | Role |
|---|---|
| `src/app/` | App Router pages, layouts, API routes, and feature UI |
| `src/server/api/` | tRPC context, procedure gates, router composition, domain routers |
| `src/server/services/` | Extracted testimonial service and schemas |
| `src/lib/auth/` | Shared status/role access decision |
| `src/lib/supabase/` | Browser, SSR, and server-only service-role clients |
| `supabase/migrations/` | Schema, RLS, triggers, and security-definer RPCs |
| `tests/unit/` | Component and pure-logic tests |
| `tests/integration/` | Supabase-backed router tests |
| `tests/e2e/` | Playwright role-based flows |
| `project/` | Repository metadata, plans, changelog, troubleshooting, and research |

### Surprises

- `README.md` is substantially shorter than the implementation and no longer documents the former architecture/security model in detail.
- The application has no repository-managed CI configuration (`.github/`, Docker, or deployment manifest were not found).
- The database migration set contains both a large remote schema dump and incremental security migrations; the effective state requires careful migration-order testing.

## System Design & Architecture Review

### Architecture assessment

The current design is a pragmatic single-application monolith with a managed Postgres/Auth backend. That is an appropriate maturity-level choice for the product: there is no evidence that the project needs microservices, a message broker, or an independently deployed frontend/backend. The main architectural issue is not the choice of technologies; it is where invariants are enforced and how many paths can reach the data.

The application currently has four overlapping control/data paths:

```text
┌──────────────────────────────────────────────────────────────────┐
│                    FOUR ACCESS PATHS                             │
│                                                                  │
│  PATH 1: Application Command (primary)                          │
│  ┌──────────┐    ┌────────┐    ┌────────┐    ┌──────────────┐   │
│  │ Browser  │───▶│ tRPC   │───▶│  SSR   │───▶│  Postgres +  │   │
│  │  Page    │    │ Router │    │Supabase│    │    RLS       │   │
│  └──────────┘    └────────┘    └────────┘    └──────────────┘   │
│                                                                  │
│  PATH 2: Direct Browser Supabase                                │
│  ┌──────────┐    ┌──────────────────┐    ┌──────────────────┐    │
│  │ Browser  │───▶│ Supabase Browser │───▶│ Auth / Realtime  │    │
│  │  Page    │    │     Client       │    │ / PostgREST / RLS│    │
│  └──────────┘    └──────────────────┘    └──────────────────┘    │
│                                                                  │
│  PATH 3: Middleware (edge)                                       │
│  ┌──────────┐    ┌──────────┐    ┌──────────┐    ┌──────────┐   │
│  │ Request  │───▶│Next.js   │───▶│  SSR     │───▶│ Auth /   │   │
│  │          │    │Middleware│    │Supabase  │    │ Profile  │   │
│  │          │    │          │    │          │    │ Lookup   │   │
│  └──────────┘    └──────────┘    └──────────┘    └──────────┘   │
│                                                    │           │
│                                                    ▼           │
│                                               ┌──────────┐     │
│                                               │ Redirect │     │
│                                               └──────────┘     │
│                                                                  │
│  PATH 4: Admin Service-Role (limited)                           │
│  ┌──────────┐    ┌──────────┐    ┌─────────────────────────┐    │
│  │  Admin   │───▶│ tRPC     │───▶│ Service-Role Supabase   │    │
│  │Procedure │    │ (invite) │    │   Admin Client           │    │
│  └──────────┘    └──────────┘    └─────────────────────────┘    │
└──────────────────────────────────────────────────────────────────┘
```

This is defensible only if RLS and narrowly defined database functions remain the final authority. The tRPC procedures add useful validation and UX authorization, while middleware is primarily a routing/session convenience. The risk is that the codebase sometimes treats procedure checks as the boundary even though browser code and direct Supabase APIs remain available. The profile-policy finding demonstrates why the database path must be safe independently.

### What the design does well

- **Appropriate deployment shape:** Next.js, tRPC, and Supabase keep operational complexity low for an early product while retaining a typed API and relational consistency.
- **Explicit client separation:** `src/lib/supabase/server.ts`, `client.ts`, and `admin.ts` distinguish SSR, browser, and service-role contexts. `admin.ts:1` also uses `server-only`.
- **Centralized application access decision:** `src/lib/auth/access.ts:33-62` is reused by tRPC and middleware, reducing drift in status/role decisions.
- **Defense in depth:** application gates, RLS policies, and a database trigger for kanban transitions all participate in enforcement. The duplicate state-transition checks in `src/server/api/routers/kanban.ts:8-14,153-161` and the database trigger are a good safety instinct, even though the duplication needs a clearer source-of-truth strategy.
- **Feature-oriented organization:** route groups, feature components, routers, and the testimonial service provide a reasonable path for continued monolith development.

### Architecture weaknesses and critique

#### 1. The trust boundary is conceptually correct but operationally inconsistent

The documented model says RLS is the non-bypassable boundary, but the implementation has browser-side Supabase clients for Realtime (`src/app/member/kanban/page.tsx:158-183` and `src/app/admin/kanban/[eventId]/page.tsx:77-88`) alongside tRPC commands. This creates two access surfaces and two places to reason about data shape and authorization. Realtime subscriptions are not a substitute for authorization; they must be validated by the same RLS model and tested as a separate transport.

**Recommendation:** classify every operation as one of three types: browser-safe read/subscription, protected command, or admin command. Keep browser Supabase usage limited to Auth and explicitly approved Realtime subscriptions; route mutations and sensitive reads through tRPC/domain services. Document which RLS policies protect each subscription. Add direct PostgREST/Realtime negative tests for member/admin boundaries.

#### 2. tRPC routers are acting as controllers, services, query mappers, and policy coordinators at once

`kanban.ts`, `attendance.ts`, and `testimonials.ts` contain long procedures that validate input, make several queries, enforce state transitions, construct view models, and sometimes select a privileged client. The testimonial service is a positive start, but its own contract says authorization is the procedure’s job (`src/server/services/testimonials/testimonial.service.ts:8-16`), leaving the service safe only when every caller remembers the precondition.

**Recommendation:** use a four-part boundary:

1. **Transport:** tRPC input/output schemas, error mapping, and request context.
2. **Application services:** use-case orchestration such as `MoveTask`, `ApproveMember`, `FinalizeTestimonial`, and `RecordAttendance`.
3. **Domain rules:** pure transition/eligibility logic with no Supabase dependency.
4. **Persistence:** typed repositories or database functions that own atomic writes and RLS-compatible queries.

Routers should be short adapters. Services should receive an actor/context object, not rely on a comment that the caller is trusted. This makes authorization preconditions visible and makes service tests meaningful.

#### 3. Multi-write workflows are not atomic

The member task transition updates contribution details and then updates `event_members`; the contribution update is explicitly non-fatal (`src/server/api/routers/kanban.ts:163-178`) while the status update can still succeed (`:180-190`). Testimonial finalization performs several independent writes (`src/server/services/testimonials/testimonial.service.ts:65-103`), and admin task creation uses a read-then-update/insert sequence (`src/server/api/routers/kanban.ts:597-620`).

**Consequence:** partial success can leave the system in a state the UI interprets as complete even though contribution content, testimonial request status, or assignment data failed. Concurrent admin requests can also race around the existence check.

**Recommendation:** identify an explicit transaction boundary for every use case that changes more than one invariant. Prefer a Postgres function or transaction-capable server repository for `move_task`, `finalise_testimonial`, `approve_member`, and task upsert. Return a single result after commit. If a workflow intentionally allows partial success, model it with explicit statuses and retryable steps instead of ignoring errors.

#### 4. Business state machines are split between TypeScript and SQL without a generated contract

The kanban transition table in `src/server/api/routers/kanban.ts:5-14` limits member transitions, while a database trigger also validates transitions. This is useful defense in depth, but two independently edited state machines can drift. The same risk appears in profile status rules: `evaluateAccess()` accepts only active accounts (`src/lib/auth/access.ts:43-61`), while SQL policies and migrations define what statuses can be written.

**Recommendation:** make the database state machine authoritative for persistence and expose a typed domain transition module generated or tested from the same transition table. Add migration-level tests for every allowed and forbidden transition. Treat application checks as early feedback, never as the only enforcement.

#### 5. Request context and middleware duplicate work and add latency to the hot path

Middleware calls Supabase Auth and then reads the profile for protected pages (`src/middleware.ts:76-119`). Each tRPC request creates another SSR client and calls `getAuthState()` (`src/server/api/trpc.ts:7-18`, `src/lib/auth/access.ts:75-90`). This is understandable for independent boundaries, but it means page requests and subsequent API requests repeat Auth/profile I/O, while role/status is stored in a mutable profile row.

**Recommendation:** keep middleware as a lightweight session refresh and coarse route redirect, and make tRPC/RLS the authoritative request authorization path. For scale, evaluate short-lived claims or a carefully invalidated profile authorization cache, but do not move security decisions entirely into stale JWT claims. Measure Auth/profile latency before optimizing; correctness and revocation speed take precedence.

#### 6. The data model is suitable for one organisation but underspecified for the stated product direction

The product description suggests a platform for multiple volunteer/community organisations, but the reviewed tables and application context are organized around users, events, departments, and roles without an evident organisation/tenant identifier in the request context or the documented table model. This is an architectural question rather than a confirmed vulnerability because the current product may intentionally serve one organisation per deployment.

**Recommendation:** decide now whether deployment is single-tenant-per-instance or multi-tenant-in-one-database. If multi-tenant, add an explicit `organisation_id`/tenant boundary to every tenant-owned table, derive it from the authenticated membership rather than request input, include it in every RLS policy and unique index, and test cross-tenant reads/writes. If single-tenant, state that constraint in the architecture and avoid implying a generic multi-tenant SaaS model.

#### 7. Read models are assembled in request handlers instead of being designed as bounded queries

Dashboard and kanban handlers fan out into parallel queries and then join/map records in JavaScript (`src/server/api/routers/kanban.ts:442-532`, `src/server/api/routers/testimonials.ts:43-118`). This is acceptable for small data, but it couples API latency to the number of relations and makes response shape changes expensive. It also makes authorization review harder because the handler decides which joins become a view model.

**Recommendation:** define bounded read models per screen/use case. Use explicit projections, server-side aggregation, pagination, and database views/functions where a read model is stable and security-sensitive. Keep a clear distinction between transactional tables and presentation read models. Measure query count, response size, and p95 latency with realistic data.

#### 8. There is no explicit asynchronous architecture for integrations and long-running work

Newsletter subscription is a successful no-op (`src/server/api/routers/newsletter.ts:4-14`), testimonial generation is currently deterministic UI/service behavior with an AI TODO (`src/server/api/routers/testimonials.ts:228`), and the repository has no queue, worker, outbox, or retry subsystem. This is fine while integrations are placeholders, but adding email or AI calls directly to request handlers would introduce timeout, retry, idempotency, and cost-control risks.

**Recommendation:** before enabling external side effects, add an outbox/event table with idempotency keys and a small worker/cron consumer. Model delivery states (`pending`, `processing`, `sent`, `failed`) and retry policy explicitly. Keep provider credentials and provider calls server-side; connect AI quota consumption to the same durable command boundary.

#### 9. Reliability and observability are not first-class architectural concerns yet

There is no structured application logger or error-reporting integration in the deployment documentation. Development timing logs are emitted with `console.log` in `src/server/api/trpc.ts:39-54`, while production tRPC error logging is disabled in `src/app/api/trpc/[trpc]/route.ts:24-31`. There are also no explicit idempotency keys, request correlation IDs, health checks, or operational SLOs in the repository.

**Recommendation:** introduce a small structured logging interface with request ID, actor ID (non-sensitive), procedure, duration, outcome, and error class. Redact tokens, email addresses, and reflection/testimonial content. Add error-rate/latency dashboards, database/Auth dependency visibility, and alerts for authorization failures and quota anomalies. Define initial SLOs for login, critical commands, and dashboard reads before selecting infrastructure.

### Recommended target architecture

For the next stage, retain the monolith but make its boundaries explicit:

```text
┌─────────────────────────────────────────────────────────────────┐
│                     TARGET ARCHITECTURE                         │
│                                                                 │
│  ┌─────────────────────────────────────────────────────────┐   │
│  │  ROUTE / UI LAYER (src/app/)                            │   │
│  │  Rendering, forms, cache invalidation, Realtime refresh │   │
│  └────────────────────────┬────────────────────────────────┘   │
│                           │                                    │
│  ┌────────────────────────┴────────────────────────────────┐   │
│  │  tRPC TRANSPORT LAYER (src/server/api/)                 │   │
│  │  Input/output schemas, actor extraction, stable errors, │   │
│  │  request IDs                                            │   │
│  └────────────────────────┬────────────────────────────────┘   │
│                           │                                    │
│  ┌────────────────────────┴────────────────────────────────┐   │
│  │  APPLICATION SERVICES                                   │   │
│  │  ┌──────────────┐ ┌──────────────┐ ┌────────────────┐  │   │
│  │  │ Approve      │ │  Move Task   │ │ Finalize       │  │   │
│  │  │ Member       │ │              │ │ Testimonial    │  │   │
│  │  ├──────────────┤ ├──────────────┤ ├────────────────┤  │   │
│  │  │ Record       │ │  ...         │ │                │  │   │
│  │  │ Attendance   │ │              │ │                │  │   │
│  │  └──────────────┘ └──────────────┘ └────────────────┘  │   │
│  │  Authorization preconditions + idempotency +           │   │
│  │  transaction boundary                                  │   │
│  └────────────────────────┬────────────────────────────────┘   │
│                           │                                    │
│  ┌────────────────────────┴────────────────────────────────┐   │
│  │  DOMAIN MODULES                                         │   │
│  │  Pure state machines, eligibility rules, KPI            │   │
│  │  definitions, value objects                             │   │
│  └────────────────────────┬────────────────────────────────┘   │
│                           │                                    │
│  ┌────────────────────────┴────────────────────────────────┐   │
│  │  PERSISTENCE / POSTGRES                                  │   │
│  │  Generated types, repositories or RPCs, RLS,            │   │
│  │  constraints, triggers                                  │   │
│  └────────────────────────┬────────────────────────────────┘   │
│                           │                                    │
│  ┌────────────────────────┴────────────────────────────────┐   │
│  │  ASYNC OUTBOX (when integrations are enabled)            │   │
│  │  Email/AI jobs, retries, cost/quota accounting,         │   │
│  │  delivery status                                        │   │
│  └─────────────────────────────────────────────────────────┘   │
└─────────────────────────────────────────────────────────────────┘
```

The key design rule is: **the UI may be optimistic, the service may be ergonomic, but Postgres must reject an invalid or unauthorized final state.** The browser should not need to know whether a use case is implemented by a repository or a Postgres function.

### Architecture decision records recommended

Create short ADRs for the decisions that will otherwise remain implicit:

1. **Tenant model:** single-tenant deployment versus multi-tenant database.
2. **Authorization model:** RLS as final authority; allowed direct browser Supabase operations; admin transition mechanism.
3. **Transaction model:** which workflows are atomic and which are intentionally eventual.
4. **Realtime model:** subscription scope, payload policy, invalidation strategy, and reconnect behavior.
5. **Integration model:** outbox/worker, idempotency, retries, and secret ownership.
6. **Operational model:** deployment target, trusted proxy headers, rate limiter, logging, alerting, backup and rollback expectations.

### Architecture-specific success measures

- Every write use case has one named application service and one explicit transaction/idempotency policy.
- Every sensitive table has a documented owner/admin/member access matrix and direct RLS tests.
- Core screens have bounded read models with measured p95 latency and response-size limits.
- Browser-direct Supabase operations are enumerated and tested; all other writes use application commands.
- No domain service depends on a caller-side comment for authorization; actor context is explicit.
- A production incident can be correlated from request ID to tRPC procedure, database error, and user-visible outcome without logging sensitive content.

## Audit Report

Findings are ordered by priority and then severity. Scores use the shared impact × likelihood rubric. “Observed” is evidence; consequence and score are the assessment.

### P1 — S1 High

#### AUD-001 — Members can likely activate their own profiles

- **Where:** `supabase/migrations/20260408075844_remote_schema.sql:1106-1114`; later approval migration only changes the status constraint and trigger (`supabase/migrations/20260409103000_profiles_admin_approval_gate.sql:4-49`) and does not drop this update policy.
- **Observed:** The permissive `for update` policy allows a profile owner to update any columns on their own row. Its `with check` compares only the submitted `role` with the current role; it does not constrain `status`.
- **Impact:** A pending or rejected authenticated user can submit an update setting their own status to `active` while retaining the same role, bypassing the stated admin approval boundary. This is a direct authorization-control failure, although it does not by itself grant the member the admin role.
- **Score:** **S1/P1**. Medium-to-high security impact on the account approval boundary and possible on the normal Supabase API path; P1 because it should be fixed before release.
- **Recommended action:** Replace the policy with an explicit column-level update path or a `with check` that preserves status and all security-sensitive fields; make admin-only status transitions a dedicated server/RPC operation. Review whether members should be able to update profiles at all.
- **Verification:** With a pending/rejected member JWT, issue a direct `profiles` update changing only `status` to `active`; expect RLS denial. Verify an admin approval still succeeds and add a regression test for both paths.

#### AUD-002 — Quota and usage RPCs trust caller-supplied user IDs

- **Where:** `supabase/migrations/20260408163822_ai_quota_and_usage_guardrails.sql:92-171`, `:173-222`, and grants at `:224-227`.
- **Observed:** `consume_ai_quota(p_user_id, ...)` and `log_ai_usage_event(p_user_id, ...)` are `security definer`, executable by all `authenticated` users, and do not check `p_user_id = auth.uid()` or require an admin role. No application router currently calls these functions, but the Supabase RPC surface grants direct access.
- **Impact:** Any authenticated user can consume another user’s quota, create usage records under another identity, and potentially corrupt cost/audit data. The risk is currently a latent exposed database capability rather than an observed application flow.
- **Score:** **S1/P1**. Medium impact with a normal authenticated attack path; P1 because the functions are privileged and public to authenticated clients.
- **Recommended action:** Bind user-scoped functions to `auth.uid()` internally, split administrative reconciliation into a separately protected function, revoke direct `authenticated` execution if unused, and add constraints on request/model/status inputs.
- **Verification:** Call each RPC using a member JWT and a different profile UUID; expect a denial or an explicit `caller_mismatch` result and no row mutation. Test same-user success and admin-only reconciliation separately.

### P1 — S2 Medium

#### AUD-003 — Rate limiting is bypassable and not deployment-safe

- **Where:** `src/middleware.ts:13-25`, `:30-43`.
- **Observed:** Limits are stored in a process-local `Map`, and the key is taken from the first `x-forwarded-for` value (`:30-32`). The map has no global bound or cleanup beyond per-key window replacement.
- **Impact:** A client can rotate/spoof the forwarded header when the deployment does not overwrite it, bypass limits; multiple serverless/edge instances do not share counters, so auth and tRPC abuse protection is inconsistent. Long-lived distinct IP keys can also grow memory usage.
- **Score:** **S2/P1**. Medium impact and likely on exposed auth/API routes; P1 because the control is presented as a security boundary for login and API abuse.
- **Recommended action:** Use a trusted platform client-IP signal, validate proxy configuration, and move counters to a shared bounded store (or a provider-supported rate limiter). Add a bounded cleanup strategy and route-specific abuse controls.
- **Verification:** Test with changing forwarded headers and multiple application instances; confirm the limiter keys on trusted client identity and blocks after the configured threshold consistently across instances.

#### AUD-004 — Internal database errors are returned to API clients

- **Where:** Representative occurrences include `src/server/api/routers/events.ts:24,58,75`, `src/server/api/routers/reflections.ts:40,74,109,142`, `src/server/api/routers/attendance.ts:22,49,120`, and the broad set found by `rg 'INTERNAL_SERVER_ERROR.*error.message' src/server`.
- **Observed:** Many `TRPCError` instances use Supabase `error.message` as the client-facing message; `auth.signOut` and legacy paths also throw raw `Error` objects (`src/server/api/routers/auth.ts:19-22`, `src/server/api/routers/kanban.ts:269`).
- **Impact:** Postgres/Supabase relation names, policy details, constraint text, or operational information can be disclosed to authenticated clients and become useful reconnaissance. It also creates an unstable client contract around infrastructure errors.
- **Score:** **S2/P1**. Medium information-disclosure impact with a possible-to-likely error path; P1 because it is repeated across the API surface.
- **Recommended action:** Log structured server-side errors with correlation IDs, return stable generic messages/codes to clients, and preserve field-level validation errors only where intentionally safe.
- **Verification:** Force a database error in a test environment and assert the response contains a stable generic message without table, SQL, policy, or provider details.

### P2 — S2 Medium

#### AUD-005 — Database types are bypassed across core kanban/dashboard paths

- **Where:** `src/server/api/routers/kanban.ts:44-64,68-82,319-337,429-433,452-500,666-671`; `src/server/api/routers/dashboard.ts:53,79,144`; `src/server/api/routers/reflections.ts:23-38`.
- **Observed:** Queries and updates are repeatedly cast through `unknown`, `Record<string, unknown>`, or handwritten result shapes because generated types do not match the migrations.
- **Impact:** Schema/query drift can compile while returning missing fields, sending invalid updates, or weakening review of authorization-relevant columns. This is concentrated in the largest router and dashboard paths.
- **Score:** **S2/P2**. Medium correctness and security-maintenance impact with possible likelihood; P2 because it needs deliberate schema/type work but is not itself a demonstrated exploit.
- **Recommended action:** Regenerate `src/types/database.ts` from the authoritative schema, reconcile migrations, remove casts, and make query result types compile from the generated definitions.
- **Verification:** Run typecheck after regeneration and fail CI on new `unknown` casts in server data-access code; exercise kanban/dashboard integration tests.

#### AUD-006 — Core routers are oversized and mix transport, authorization-sensitive data access, and presentation shaping

- **Where:** `src/server/api/routers/kanban.ts` is 676 lines, `testimonials.ts` is 649 lines, and `attendance.ts` is 440 lines; examples of inline mapping/business logic are `kanban.ts:93-113`, `:425-533`, and `testimonials.ts:1-340`.
- **Observed:** Routers contain query orchestration, state-transition rules, data shaping, and service-role operations rather than consistently delegating domain operations to services.
- **Impact:** Security-sensitive behavior is harder to review and test in isolation; changes can create inconsistent authorization or transaction behavior across UI-specific procedures.
- **Score:** **S2/P2**. Medium maintainability/correctness impact, possible likelihood.
- **Recommended action:** Extract domain services for kanban transitions, attendance invitations/records, and testimonial workflows. Keep routers thin and make authorization/transaction invariants explicit.
- **Verification:** Unit-test services independently; integration-test each procedure’s authorization and persistence behavior after extraction.

#### AUD-007 — Several list operations are unbounded and assemble large relational result sets in application memory

- **Where:** `src/server/api/routers/events.ts:18-25`, `src/server/api/routers/contributions.ts:16-24`, `src/server/api/routers/kanban.ts:315-353`, and `src/server/api/routers/attendance.ts:12-80`.
- **Observed:** Core list/KPI paths use unrestricted `select("*")` or load all event IDs, attendance rows, members, and profiles before mapping in JavaScript. Attendance defines `PAGE_SIZE` (`attendance.ts:6`) but several KPI paths do not paginate.
- **Impact:** Dataset growth increases query time, response size, and server memory; dashboards can become a bottleneck or hit provider limits.
- **Score:** **S2/P2**. Medium performance impact with possible likelihood as data grows.
- **Recommended action:** Introduce explicit projections, server-side aggregates/pagination, indexes for filter/order columns, and result-size limits. Measure with realistic event/member volumes.
- **Verification:** Load-test representative data sizes and assert bounded query counts/response sizes; inspect query plans for the largest paths.

#### AUD-008 — No repository-managed CI or coverage gate protects security-sensitive changes

- **Where:** No `.github/` workflow, Dockerfile, or deployment manifest was found; `package.json:5-31` exposes local commands only; `docs-project/agents/testing-strategy.md:9` states no repository-wide coverage threshold.
- **Observed:** The repository has unit, integration, and E2E suites, but no checked-in automation enforcing typecheck/lint/tests/build or coverage on changes.
- **Impact:** RLS migrations, auth procedures, and route changes can merge without repeatable validation, and regressions may be detected only manually.
- **Score:** **S2/P2**. Medium delivery/security assurance impact, likely over the life of the project.
- **Recommended action:** Add a minimal CI pipeline for install, typecheck, lint, unit tests, migration validation, and selected authorization integration tests. Add coverage thresholds after measuring baseline rather than imposing an arbitrary number immediately.
- **Verification:** Open a controlled failing branch and confirm CI blocks it; report stable results for each required job.

#### AUD-009 — Test coverage misses the database authorization policies and middleware behavior

- **Where:** Existing tests include `tests/unit/lib/auth/access.test.ts` and router auth checks, but no test covers `src/middleware.ts` or direct RLS policy behavior. `tests/unit/lib/supabase/admin-boundary.test.ts` checks only the `server-only` marker.
- **Observed:** Application-level procedure tests can pass while an independently callable PostgREST/RPC policy remains over-permissive; the profile-status policy and quota RPC issue have no regression test.
- **Impact:** The most important authorization invariant is not tested at its actual enforcement boundary.
- **Score:** **S2/P2**. Medium security assurance impact, possible likelihood.
- **Recommended action:** Add Supabase integration cases for pending/rejected/member/admin reads and writes, direct RPC calls, and profile field tampering. Add middleware tests for trusted IP/rate-limit and role redirects.
- **Verification:** Run tests against a disposable Supabase project/migration state and require member/admin negative cases to pass.

### P3 — S3 Low

#### AUD-010 — README and environment guidance are incomplete relative to the implementation

- **Where:** `README.md:1-64` gives only a short quick start; `.env.example:1-19` still describes NextAuth placeholders and says to copy to `.env`, while `src/env.js:4-27` requires Supabase keys, a service-role key, and `GOOGLE_STITCH_API_KEY`. The deployment guide documents the mismatch at `docs-project/deployment/README.md:23-44`.
- **Observed:** The primary README does not list required variables, Supabase migration setup, seed safety, or the distinction between unit/integration/E2E prerequisites.
- **Impact:** New contributors can start a misleading or incomplete setup and may mishandle secret-bearing seed operations.
- **Score:** **S3/P2**. Low direct impact but likely onboarding friction.
- **Recommended action:** Make `.env.example`, `README.md`, and deployment docs agree; document the required secret boundaries and test environment setup.
- **Verification:** Have a clean checkout follow README only and reach a successful local validation state without undocumented steps.

## Strengths

- Shared access decisions are centralized in `src/lib/auth/access.ts:33-62` and reused by tRPC and middleware.
- The service-role client is marked `server-only` (`src/lib/supabase/admin.ts:1`) and its only application usage is in an admin-gated attendance invite procedure (`src/server/api/routers/attendance.ts:203-218`).
- Zod validation is present on most mutation inputs, including UUIDs, enums, lengths, and URLs.
- RLS is enabled for the primary tables in the schema and the later security migration replaces several JWT-metadata checks with `public.is_admin()`.
- There are meaningful integration tests for unauthenticated access, admin-only procedures, ownership checks, and legacy kanban transitions.
- TypeScript strictness and `noUncheckedIndexedAccess` are enabled (`tsconfig.json:13-16`).

## Improvement Strategy

### Theme 1: Make the database the explicit authorization boundary

**Target state:** sensitive profile fields and security-definer RPCs are immutable or caller-bound by default, with admin-only transition functions. **Principle:** every direct Supabase client path must be safe even if the UI and tRPC layer are bypassed.

### Theme 2: Restore type/schema alignment

**Target state:** generated database types match the migration state and server data access contains no unchecked casts for schema fields. **Principle:** compile-time drift detection is cheaper and safer than handwritten runtime shape assumptions.

### Theme 3: Replace advisory operational controls with deployable controls

**Target state:** shared rate limits, structured error handling, and CI-enforced validation work in the intended hosting topology. **Principle:** a control is only a control if its failure modes match production deployment.

### Theme 4: Test the actual security boundaries

**Target state:** disposable-database tests cover RLS/RPC behavior and middleware tests cover route/rate-limit behavior. **Principle:** authorization tests must exercise the layer that grants or denies access.

### Explicit trade-offs

Do not begin with a broad router rewrite, enterprise observability platform, or arbitrary 80% global coverage target. The current highest return is fixing policy/RPC exposure and adding focused tests; large refactors and infrastructure can follow once the baseline is enforced. The newsletter provider TODO and AI-generated testimonial copy are product completeness items, not audit blockers, unless those features are put into production scope.

### Definition of done

- Direct member attempts to change profile `status`/`role` are denied.
- Caller-scoped RPCs reject mismatched user IDs, and unused privileged functions are not executable by `authenticated`.
- No client response exposes raw provider/database errors.
- Rate limiting is shared, trusted-IP based, and tested across instances.
- Server data-access code compiles against regenerated database types without the current schema casts.
- CI blocks failures in typecheck, lint, unit tests, migration/RLS tests, and selected E2E smoke flows.

## Task Plan

| Milestone | Task | Areas | Acceptance criteria | Effort | Risk | Dependencies |
|---|---|---|---|---|---|---|
| 0 | Add authorization regression suite | `tests/integration`, Supabase test project | Negative member/profile/RPC tests reproduce current failures and pass after fixes | M | Medium | None |
| 0 | Establish CI baseline | `.github/workflows`, package scripts | CI installs from lockfile and runs typecheck, lint, unit tests, migrations, and focused integration tests | M | Low | Environment/secrets design |
| 1 | Lock profile security fields | profile RLS migration | Member cannot change status, role, approval fields, or another profile; admin path works | S | Medium | Task 0 |
| 1 | Bind/revoke quota RPCs | quota migration, server callers if added | Mismatched IDs fail; only intended caller/admin can execute; audit rows are integrity-safe | S | Medium | Task 0 |
| 1 | Stop raw error disclosure | tRPC error handling and routers | Client receives stable generic errors; server logs retain diagnostic context | M | Medium | CI baseline |
| 2 | Replace process-local rate limiting | middleware and shared limiter config | Limits hold across instances and forwarded-header spoofing does not bypass them | L | Medium | Deployment target |
| 2 | Regenerate database types and remove casts | `src/types/database.ts`, routers | Typecheck passes with no schema-related `unknown` casts in core routers | L | Medium | Migration state finalized |
| 2 | Extract high-risk domain services | kanban, attendance, testimonials | Routers become thin; state transitions and service-role operations have direct unit tests | XL | High | Type alignment |
| 2 | Decide and document tenant model | ADRs, schema/context if multi-tenant | Repository explicitly states single-tenant or has an organisation boundary and cross-tenant tests | M/XL | High | Product direction |
| 2 | Define transaction boundaries | kanban, testimonials, attendance, migrations | Multi-write workflows are atomic or have explicit retryable statuses and idempotency keys | L | High | Domain service extraction |
| 3 | Bound list/KPI queries | dashboard, attendance, events, kanban | Explicit projections, pagination/aggregates, indexes, and load-test evidence | L | Medium | Data volume targets |
| 3 | Establish operational observability | tRPC handler, logging, deployment docs | Correlated structured logs, redaction rules, latency/error metrics, and initial SLOs are documented | M | Medium | Deployment target |
| 3 | Introduce outbox before external side effects | schema, worker/cron, newsletter/AI integrations | Email/AI work is idempotent, retryable, durably tracked, and never blocks core transactions indefinitely | XL | High | Integration scope |
| 3 | Reconcile onboarding docs | README, `.env.example`, deployment docs | Clean-checkout setup succeeds from README and secret handling is clear | S | Low | CI baseline |

### Quick wins

- Add a migration dropping/replacing `Members update own profile` with an explicit safe policy.
- Revoke `authenticated` execution on unused quota RPCs immediately, then add caller binding before re-enabling.
- Replace client-facing `error.message` with stable generic messages in the shared error formatter.
- Add the two highest-value negative integration tests before refactoring.

### Top three implementation sketches

1. **Profile policy:** create a migration that drops the permissive update policy, adds a policy allowing only non-sensitive columns (or no direct member update), and exposes a narrowly typed admin approval operation. Test with member and admin JWTs against the migrated database.
2. **Quota RPCs:** add `if p_user_id <> auth.uid() then raise exception` for user-scoped calls, make logging derive `user_id` from `auth.uid()` rather than accepting it, and revoke direct grants if no application caller exists. Add mismatched-ID and same-user tests.
3. **Error boundary:** introduce a server-side logger/correlation ID, map provider/database failures to generic `INTERNAL_SERVER_ERROR` messages, and preserve only intentional validation/not-found messages. Add a test that injects a provider error and checks the serialized tRPC response.

## Open Questions

- Is the intended deployment single-instance or horizontally scaled/serverless? This determines the shared rate-limit implementation and trusted client-IP source.
- Should members edit any profile fields directly, or should profile edits be admin-mediated?
- Are the AI quota RPCs planned for an upcoming feature, or should they be removed/revoked until an AI caller exists?
- Which migration/schema source is authoritative: the remote dump plus incrementals, or a regenerated clean migration history?
- What production data volume and latency targets should drive pagination and aggregate-query work?

## Verification Performed

- Read the prescribed comprehensive-audit workflow, shared rubric, review core, naming convention, agent policy, repository guidance, architecture/deployment/testing docs, source, migrations, tests, manifest, and lockfile.
- Inspected tracked/untracked state; no source files were modified.
- Attempted `pnpm typecheck`, `pnpm test -- --reporter=dot`, `pnpm lint`, and `pnpm format:check`; all were unavailable because `pnpm` is not installed. `node_modules/.bin/tsc`, `vitest`, and `eslint` are also absent.
- Used static evidence and exact file/line references for all findings; no dependency CVE claim is made because an audit-capable installed dependency scanner was unavailable.
