# Testing

## Strategy
Synced uses a three-tier testing approach:

- **Unit Tests** — Test individual functions, utilities, and components in isolation
- **Integration Tests** — Test tRPC procedures, database queries, and service logic with real dependencies
- **E2E Tests** — Test full user workflows via Playwright with a running application

## Testing Pyramid

                           ┌─────────────┐
                          /│   E2E Tests  │\
                         / │  (Playwright) │ \
                        /  └──────────────┘  \
                       /   ┌────────────────┐  \
                      /    │  Integration    │   \
                     /     │    Tests        │    \
                    /      │   (tRPC + DB)   │     \
                   /       └────────────────┘      \
                  /        ┌──────────────────┐      \
                 /         │   Unit Tests      │       \
                /          │ (Components,      │        \
               /           │  Utils, Logic)    │         \
              /            └──────────────────┘          \
             /                                           \
            /            TEST COMMAND MAP                \
           /  ┌──────────────┬──────────────────┐         \
          /   │  pnpm test   │  Unit tests      │          \
         /    │  pnpm test:  │  Integration     │           \
        /     │  integration │  tests (live DB)  │            \
       /      │  pnpm e2e:* │  Playwright flows │             \
      /       └──────────────┴──────────────────┘              \
     /                                                         \
    /                                                         \
   /                                                          \
  /___________________________________________________________\
  │                      TEST SCOPE                          │
  │  ┌───────────┐  ┌───────────┐  ┌────────────────────┐    │
  │  │   Fast    │  │  Medium   │  │     Slow but        │    │
  │  │  (ms)     │  │  (seconds)│  │  most realistic     │    │
  │  │  Isolated │  │  With deps│  │  Full user flows    │    │
  │  └───────────┘  └───────────┘  └────────────────────┘    │
  └────────────────────────────────────────────────────────────┘

## Test Layout

```text
tests/
├── unit/           # Vitest unit tests (jsdom environment)
├── integration/    # Vitest integration tests (node environment)
└── e2e/            # Playwright E2E tests
    ├── specs/      # Test spec files
    └── setup/      # Auth state setup scripts
```

The active Vitest include patterns are directory-based:

- Unit: `tests/unit/**/*.test.{ts,tsx}`
- Integration: `tests/integration/**/*.test.ts`

The `~` alias resolves to `src/` in both Vitest configs.

## Running Tests

| Command | Type | Environment |
|---------|------|-------------|
| `pnpm test` | Unit tests | Vitest, jsdom |
| `pnpm test:watch` | Unit tests in watch mode | Vitest, jsdom |
| `pnpm test:integration` | Integration tests | Vitest, node, `.env` + `.env.test` |
| `pnpm e2e:setup:member` | Save member auth state | Playwright setup, headed browser |
| `pnpm e2e:setup:admin` | Save admin auth state | Playwright setup, headed browser |
| `pnpm e2e:member` | E2E member specs | Playwright, stored member auth |
| `pnpm e2e:admin` | E2E admin specs | Playwright, stored admin auth |
| `pnpm e2e:audit` | E2E audit specs | Playwright, stored member auth |
| `pnpm e2e:report` | Open Playwright report | Playwright HTML report |

## Writing Tests

### Unit Tests

Unit tests run through `vitest.config.ts` in the `jsdom` environment with globals enabled. `vitest.setup.ts` imports `@testing-library/jest-dom`, provides default Supabase-related environment variables for isolated tests, and stubs `IntersectionObserver` for components that need browser APIs.

Existing unit tests cover React components, app pages, auth/access utilities, optimistic updates, Supabase admin boundary behavior, and service/router logic that can be tested without live integration dependencies. Typical patterns are:

- Use `describe`, `it`, and `expect` from Vitest.
- Use `@testing-library/react` `render` and `screen` for component assertions.
- Prefer user-visible assertions such as text content, links, and accessible elements.
- Use `queryBy*` or container queries for asserting that optional UI is absent.
- Mock or stub module boundaries when testing client behavior in isolation.

Place new unit tests under `tests/unit/` with a `.test.ts` or `.test.tsx` suffix.

### Integration Tests

Integration tests run through `vitest.integration.config.ts` in the `node` environment with globals enabled. The `pnpm test:integration` script loads `.env` and `.env.test` before starting Vitest.

`vitest.integration.setup.ts` requires these variables:

- `NEXT_PUBLIC_SUPABASE_URL`
- `NEXT_PUBLIC_SUPABASE_ANON_KEY`
- `SUPABASE_SERVICE_ROLE_KEY`
- `TEST_MEMBER_EMAIL`
- `TEST_MEMBER_PASSWORD`

Integration tests currently exercise server API routers through tRPC callers. The common structure is:

- Import `createCallerFactory` and the router under test.
- Create a caller with either `makeUnauthCtx()` or `makeSignedInCtx()` from `src/test/helpers.ts`.
- Use `beforeAll` to create signed-in context when a suite needs authenticated access.
- Use `afterAll` to sign out test Supabase sessions.
- Assert both unauthorized guards and authenticated success paths.

`makeSignedInCtx()` signs in with `TEST_USER_EMAIL`/`TEST_USER_PASSWORD` when present, falling back to `TEST_MEMBER_EMAIL`/`TEST_MEMBER_PASSWORD`. It returns a Supabase client carrying the user JWT so `auth.uid()` and RLS-dependent behavior are exercised against real Supabase state.

Place new integration tests under `tests/integration/` with a `.test.ts` suffix.

### E2E Tests

E2E tests use Playwright with `testDir: ./tests/e2e`. Playwright starts or reuses `pnpm dev` at `http://localhost:3000`, runs with one worker, disables full parallelism, and retains traces/videos/screenshots on failure.

The project setup is role-based:

- `member-setup` runs `tests/e2e/setup/member.setup.ts` and saves `tests/e2e/.auth/member.json`.
- `admin-setup` runs `tests/e2e/setup/admin.setup.ts` and saves `tests/e2e/.auth/admin.json`.
- `member` runs `tests/e2e/specs/member*.spec.ts` using member storage state.
- `admin` runs `tests/e2e/specs/admin*.spec.ts` using admin storage state.
- `audit` runs `tests/e2e/specs/audit.spec.ts` using member storage state.

Run the setup commands before role-based specs when auth state is missing or stale. The setup scripts open a headed browser, fill credentials from `.env.test`, wait for the two-factor authentication prompt, and save the resulting browser storage state after manual MFA completion.

Existing E2E specs focus on high-value user flows and guard behavior: dashboard rendering, key links, drawer interactions, Kanban page loading, testimonials, admin routing, and authenticated redirects. Some tests intentionally log and return when the stored account role does not match the expected path, so verify that the stored auth state represents the role you are testing.

## Coverage

No coverage reporting is currently configured in `vitest.config.ts`, `vitest.integration.config.ts`, or `package.json`. Add coverage configuration and scripts before relying on coverage thresholds in CI or local quality gates.

## Common Failures

- **Missing integration environment variables** — `vitest.integration.setup.ts` fails fast when required Supabase and test user variables are absent. Populate `.env.test` before running `pnpm test:integration`.
- **Integration sign-in failures** — `makeSignedInCtx()` signs in with test user credentials and then fetches the user profile. Invalid credentials, missing profiles, or Supabase/RLS problems will fail setup before assertions run.
- **Stale or missing E2E auth state** — Run `pnpm e2e:setup:member` or `pnpm e2e:setup:admin` to regenerate `tests/e2e/.auth/*.json` after credentials, MFA, cookies, or roles change.
- **MFA setup timeout** — The setup projects wait for manual MFA in a headed browser. Complete the MFA prompt within the configured timeout.
- **Role mismatch in E2E** — Member tests assume member storage state and admin tests assume admin storage state. If the account role redirects to a different dashboard, role guard assertions may skip or fail.
- **Browser-only APIs in unit tests** — jsdom does not implement every browser API. `IntersectionObserver` is already stubbed in `vitest.setup.ts`; add targeted stubs for additional unsupported APIs when component tests require them.
- **Playwright server startup** — E2E tests expect the app at `http://localhost:3000`; Playwright runs `pnpm dev` and reuses an existing server when available. Port conflicts or dev server build errors will block E2E execution.
