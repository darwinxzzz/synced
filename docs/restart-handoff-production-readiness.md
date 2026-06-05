# Production Readiness Handoff

Date: 2026-06-03

## Current Goal

Make the app more production-ready with evidence-first fixes and staged tests.

The working approach is:

1. Diagnose a concrete production risk.
2. Add a RED test or proof.
3. Patch narrowly.
4. Verify with focused tests, full unit tests, and `pnpm.cmd run check`.
5. Defer Graphify update until the end of the whole session.

## Initial Goal And Audit Plan

The initial user goal was broader than a normal bug fix:

- Find brittle, hardcoded, non-modular behavior.
- Make the app production-ready.
- Add tests for each stage.
- Avoid vague "code smell" findings without proof.

The agreed production-readiness plan was evidence-first:

1. Map the system boundaries:
   - frontend pages/components
   - tRPC routers
   - Supabase clients
   - auth/session/profile context
   - RLS policies
   - unit/integration/E2E tests
   - env/config/deployment assumptions
2. Diagnose concrete risks before changing code.
3. For each P0/P1/P2 risk, require proof:
   - exact code evidence
   - failing test
   - reproducible failure
   - missing server/database invariant
   - or demonstrated test false-confidence
4. Add a RED test before production code changes when practical.
5. Patch narrowly.
6. Re-run focused tests, full unit tests, and `pnpm.cmd run check`.
7. Run Graphify only at the end of the whole session, per user instruction.

Specific risks called out by the user/Claude critique:

- Optimistic updates diverging from server truth.
- Mutation success/failure clobbered by polling or refetch.
- Missing rollback/invalidation for affected TanStack query keys.
- tRPC procedures trusting client-supplied `eventId`, `taskId`, or `memberId`.
- IDOR/cross-user/cross-event access.
- Supabase anon vs service-role key placement.
- Service-role imports bypassing RLS.
- Tests passing because mocks or fixtures are too perfect.
- E2E tests not proving real auth/RLS behavior.
- Validation plans that only prove fixes did not break things, instead of proving the diagnosis was real.

## Do Not Redo These Completed Stages

These items have already been handled in this session. Do not restart from these unless the user explicitly asks to rework them.

1. **Dedicated test folder structure**
   - Completed.
   - All `.test.ts` and `.test.tsx` files were moved out of `src`.
   - Current structure:
     - `tests/unit`
     - `tests/integration`
     - `tests/e2e`
   - `pnpm.cmd test` already runs unit tests from `tests/unit`.
   - `pnpm.cmd run test:integration` already points at `tests/integration`.

2. **Unit test lane separation**
   - Completed.
   - Vitest no longer collects Playwright E2E specs as unit tests.
   - Router integration tests are no longer part of the default unit test lane.
   - `pnpm.cmd test` passed after the move.

3. **Service-role server-only guard**
   - Completed.
   - `src/lib/supabase/admin.ts` now imports `server-only`.
   - Covered by `tests/unit/lib/supabase/admin-boundary.test.ts`.

4. **Member dashboard and member profile unit mocks**
   - Completed.
   - The unit tests mock the tRPC boundaries needed by rendered client components.
   - Do not spend time rediscovering why those tests previously pulled server routers into client component tests.

5. **Router test helper profile alignment**
   - Completed.
   - `src/test/helpers.ts` now returns `profile` from `makeSignedInCtx()`, matching production tRPC context more closely.
   - It supports `TEST_MEMBER_EMAIL/PASSWORD` and legacy `TEST_USER_EMAIL/PASSWORD`.

6. **Legacy kanban member transition bypass**
   - Completed.
   - `updateTaskStatus` now enforces `ALLOWED_TRANSITIONS`.
   - Members cannot use the legacy mutation to mark a task `done`.
   - Covered by `tests/unit/server/api/routers/kanban-transitions.test.ts`.

7. **Admin open-board optimistic rollback key**
   - Completed.
   - Admin optimistic mutation now carries `eventId` in mutation context.
   - Rollback and invalidation use `ctx.eventId`.
   - Covered by `tests/unit/app/admin/kanban/open-board-optimistic.test.ts`.

## What Changed In This Session

### Test structure changes

Moved tests into:

```text
tests/unit
tests/integration
tests/e2e
```

No `.test.ts` / `.test.tsx` files should remain under `src`.

### Config/script changes

Changed or added:

- `vitest.config.ts`
- `vitest.integration.config.ts`
- `vitest.setup.ts`
- `package.json`

The intended lanes are:

```powershell
pnpm.cmd test
pnpm.cmd run test:integration
pnpm.cmd run check
```

### Production/source changes

Changed:

- `src/lib/supabase/admin.ts`
- `src/test/helpers.ts`
- `src/server/api/routers/kanban.ts`
- `src/app/admin/kanban/[eventId]/page.tsx`

### New tests added

Added:

- `tests/unit/lib/supabase/admin-boundary.test.ts`
- `tests/unit/server/api/routers/kanban-transitions.test.ts`
- `tests/unit/app/admin/kanban/open-board-optimistic.test.ts`

Moved existing tests into `tests/unit` and `tests/integration`.

## Important User Preference

Do not run Graphify after each small change right now. The user asked to run Graphify at the end of the whole session.

## Test Folder Reorganization

All tests were moved into a dedicated `tests/` tree:

- `tests/unit/...`
- `tests/integration/...`
- `tests/e2e/...`

Configs/scripts updated:

- `vitest.config.ts` now targets `tests/unit/**/*.test.{ts,tsx}`.
- `vitest.integration.config.ts` targets `tests/integration/**/*.test.ts`.
- `package.json` has:
  - `test`: unit tests
  - `test:integration`: Supabase/tRPC integration tests via `.env.test`
  - existing Playwright E2E scripts

Verification after move:

- `pnpm.cmd test` passed.
- `pnpm.cmd run check` passed.

## Completed Production-Readiness Fixes

### 1. Service-role Supabase boundary

Risk:

The service-role Supabase client had only a comment saying it should not be imported client-side. That is not enough for production.

Changed:

- Added `import "server-only";` to `src/lib/supabase/admin.ts`.
- Added `tests/unit/lib/supabase/admin-boundary.test.ts`.

Result:

- The service-role client is now protected by Next's server-only import fence.

### 2. Unit test gate cleanup

Risk:

`pnpm test` was mixing unit tests, router integration tests, and Playwright files. This made the test gate noisy and unreliable.

Changed:

- Excluded E2E and integration tests from unit Vitest config.
- Added test env placeholders in `vitest.setup.ts`.
- Added missing tRPC mocks in moved unit tests.

Result:

- `pnpm.cmd test` became a clean unit lane.

### 3. tRPC integration helper alignment

Risk:

Router tests used a partial test context that did not match production `createTRPCContext`. Production includes `profile`; the helper did not.

Changed:

- Updated `src/test/helpers.ts` so `makeSignedInCtx()` fetches and returns `profile: { role, status }`.
- Updated credential lookup to accept current `.env.test` names:
  - `TEST_MEMBER_EMAIL`
  - `TEST_MEMBER_PASSWORD`
  - also still supports old `TEST_USER_EMAIL` / `TEST_USER_PASSWORD`.

Current integration blocker:

- `pnpm.cmd run test:integration` currently tries `127.0.0.1:54321`.
- It fails with `ECONNREFUSED` if local Supabase is not running or `.env.test` points at local Supabase without the service started.

### 4. Kanban member transition hardening

Risk:

The newer `moveTask` mutation blocks members from skipping transitions or marking a task `done`, but the legacy `updateTaskStatus` mutation still accepted all pillar statuses including `done`.

Changed:

- Updated `src/server/api/routers/kanban.ts`.
- `updateTaskStatus` now:
  - fetches the caller's current `event_members` row
  - verifies ownership
  - enforces `ALLOWED_TRANSITIONS`
  - rejects forbidden transitions with `TRPCError`
  - updates by row id instead of only event id

Added tests:

- `tests/unit/server/api/routers/kanban-transitions.test.ts`

Verified:

- RED confirmed first: legacy mutation allowed `done`.
- GREEN after patch.

### 5. Admin optimistic update key stability

Risk:

Admin open-board optimistic mutation used the route `eventId` closure for rollback and invalidation. If navigation happened during an in-flight mutation, error rollback/refetch could target the wrong board cache.

Changed:

- Updated `src/app/admin/kanban/[eventId]/page.tsx`.
- `onMutate` now returns `{ prev, eventId }`.
- `onError` rolls back with `ctx.eventId`.
- `onSettled` invalidates with `ctx.eventId`.

Added tests:

- `tests/unit/app/admin/kanban/open-board-optimistic.test.ts`

Verified:

- RED confirmed first: source returned only `{ prev }`.
- GREEN after patch.

## Latest Verification

Latest successful checks:

```powershell
pnpm.cmd test
```

Passed:

- 14 test files
- 101 tests

```powershell
pnpm.cmd run check
```

Passed, with existing warnings only:

- `src/app/(auth)/login/page.tsx`: `<img>` warning
- `src/app/(auth)/login/_components/MfaEnrollPanel.tsx`: `<img>` warning

## Current Dirty Worktree Note

The repo already had many unrelated modified/deleted/untracked files before and during this work. Do not revert unrelated changes unless the user explicitly asks.

Expected relevant changed/new files from this production-readiness work include:

- `package.json`
- `vitest.config.ts`
- `vitest.integration.config.ts`
- `vitest.setup.ts`
- `src/lib/supabase/admin.ts`
- `src/test/helpers.ts`
- `src/server/api/routers/kanban.ts`
- `src/app/admin/kanban/[eventId]/page.tsx`
- `tests/unit/...`
- `tests/integration/...`
- `tests/e2e/...`

## Recommended Next Step

Fix/prove the Supabase integration-test lane.

Why:

The next major production-readiness question is RLS/IDOR proof. Unit tests can prove app logic, but only integration tests can prove whether auth/RLS actually blocks cross-user or cross-event access.

Recommended sequence:

1. Inspect `.env.test`.
2. Determine whether it points to local Supabase or remote Supabase.
3. If local, start Supabase before `test:integration`.
4. Run:

```powershell
pnpm.cmd run test:integration
```

5. Add one real cross-user/cross-event test:
   - member A tries to read/update member B's task or another event's task
   - expected: denied by app logic or RLS
   - evidence must be actual failure, not theoretical review

## Later Steps

- E2E fixture reality check:
  - confirm Playwright setup uses real login and real seeded data
  - confirm tests do not bypass auth/RLS with privileged shortcuts
- Service-role import audit:
  - prove `createAdminClient` is not imported by client/shared modules
- Config production audit:
  - `next.config.js`
  - env validation
  - Playwright baseURL
  - local/CI/prod assumptions
- Run Graphify update at the end of the full session:

```powershell
$env:PYTHONUTF8='1'
$env:PYTHONIOENCODING='utf-8'
py -X utf8 -m graphify update .
```
