# Third-Party Dependency Update Research

**Date:** 2026-07-14 (+08:00)  
**Repository:** Synced  
**Scope:** `package.json`, `pnpm-lock.yaml`, source imports, test/build configuration, external repository references, and current public package metadata  
**Status:** Complete; no dependency files or application source were changed

## Executive summary

The repository has a coherent single-package pnpm dependency model, but the declared manifest is behind the current registry snapshot in several important areas. The lockfile already resolves newer releases than the manifest permits in some cases, so the first maintenance task is to reconcile the manifest and lockfile rather than assuming a clean install reproduces the versions implied by the old manifest.

The highest-impact update is the framework line: `next` is declared as `^15.2.3`, while the current registry latest is `16.2.10`; `react` and `react-dom` resolve to the 19.2 line in the lockfile and the registry latest is `19.2.7`. Next.js 16 changes the middleware boundary terminology and includes React 19.2-era behavior, so this should be a planned migration with a full browser and production-build validation pass.

The next priority is the toolchain: Supabase clients/CLI, Tailwind/PostCSS, TypeScript/types, ESLint/Next config, Vitest, Playwright, and formatting packages. The major-version candidates are not all safe bulk upgrades: Zod 4, TypeScript 7, ESLint 10, React Day Picker 10, dotenv-cli 11, and Next.js 16 each deserve isolated compatibility checks.

## Evidence and method

- The source manifest is `package.json`; the lockfile is `pnpm-lock.yaml` with lockfile version 9.
- No `package-lock.json`, `yarn.lock`, Bun lockfile, Cargo, Go, Python, Ruby, or container manifest was found.
- No Git submodules were found.
- `Workflow-Scripts/` is a separate ignored Git repository and is not in the application dependency graph.
- The local `pnpm` executable is unavailable, so `pnpm outdated`, install, tests, and build could not be run.
- Current versions below were queried from npm registry metadata on 2026-07-14. They are a point-in-time research snapshot, not a replacement for the lockfile.

Official release context:

- [Next.js 16 release](https://nextjs.org/blog/next-16) documents the Next 16 upgrade surface, including the `middleware.ts` to `proxy.ts` terminology change and stable Turbopack.
- [React 19.2 release](https://react.dev/blog/2025/10/01/react-19-2) documents the React 19.2 feature and SSR changes.
- [Tailwind CSS v4](https://tailwindcss.com/blog/tailwindcss-v4) documents the CSS-first configuration and PostCSS integration model; [Tailwind CSS v4.3](https://tailwindcss.com/blog/tailwindcss-v4-3) covers the current v4.3 line.
- Package-specific current versions were read from npm package metadata, for example [next](https://www.npmjs.com/package/next), [@supabase/ssr](https://www.npmjs.com/package/@supabase/ssr), [@trpc/server](https://www.npmjs.com/package/@trpc/server), [vitest](https://www.npmjs.com/package/vitest), and [@playwright/test](https://www.npmjs.com/package/@playwright/test).

## Priority findings

### P0 — establish a reproducible update baseline

The checkout declares pnpm 10.30.1 but does not contain the pnpm executable or installed dependencies. The lockfile importer records versions newer than several declared ranges, including Next 15.5.12, React 19.2.4, React Query 5.90.21, tRPC 11.10.0, and TypeScript 5.9.3. This means reviewers cannot infer the actual tested dependency set from `package.json` alone.

**Action:** install/use the declared pnpm version in a controlled environment, run a frozen install, record `pnpm list --depth 0`, and verify that the lockfile is intentionally generated from the current manifest. Do not hand-edit the lockfile.

### P1 — plan the Next.js/React framework migration

| Package | Declared | Lockfile | Registry latest on review date | Assessment |
|---|---:|---:|---:|---|
| `next` | `^15.2.3` | `15.5.12` | `16.2.10` | Major migration; high compatibility risk |
| `react` | `^19.0.0` | `19.2.4` | `19.2.7` | Patch update; coordinate with React DOM |
| `react-dom` | `^19.0.0` | `19.2.4` | `19.2.7` | Patch update; coordinate with React |
| `eslint-config-next` | `^15.2.3` | aligned to Next 15 | `16.2.10` | Must follow Next major |

The application uses `middleware.ts`, App Router server/client boundaries, `next/font`, image rendering, and tRPC route handlers. For Next 16, review the official codemod/migration guidance, test redirects and session refresh in middleware/proxy, verify route handler behavior, and run a production build. Keep Next 15 as the first low-risk patch lane until the migration branch is green.

### P1 — update Supabase packages and CLI as one platform slice

| Package | Declared | Lockfile | Registry latest | Assessment |
|---|---:|---:|---:|---|
| `@supabase/ssr` | `^0.10.0` | `0.10.0` | `0.12.1` | Update; verify cookies and middleware |
| `@supabase/supabase-js` | `^2.101.1` | `2.101.1` | `2.110.4` | Update; verify Auth/PostgREST/Realtime |
| `supabase` | `^2.87.2` | lockfile version | `2.109.1` | CLI update; validate migration/seed commands |

This application has browser, SSR, and service-role clients plus RLS-backed integration tests. Upgrade the two libraries together, then run Auth refresh, direct browser client, admin service-role, Realtime, and integration tests. The CLI must be tested against the project’s migration history; do not combine a CLI major migration with schema changes in the same review unless necessary.

### P1 — update the CSS and UI infrastructure

| Package/group | Declared baseline | Registry latest | Assessment |
|---|---:|---:|---|
| `tailwindcss`, `@tailwindcss/postcss` | `4.0.15` | `4.3.2` | Same major; update together and inspect generated CSS |
| `tailwind-merge` | `3.5.0` | `3.6.0` | Low risk patch/minor |
| Radix packages | mostly early 1.x/2.x | latest varies | Batch only by component family; run keyboard/a11y tests |
| `lucide-react` | `1.7.0` | `1.24.0` | Low-to-medium; check icon exports |
| `motion` | `12.38.0` | `12.42.2` | Low risk patch/minor; check auth animation flows |
| `react-resizable-panels` | `4.8.0` | `4.12.2` | Medium; test drag/resize behavior |

Tailwind v4 is already in use, so this is a maintenance update rather than a v3-to-v4 migration. Review `globals.css`, PostCSS config, class merging, responsive layouts, and production CSS output.

### P1 — update test and quality tooling

| Package | Declared | Registry latest | Assessment |
|---|---:|---:|---|
| `vitest` | `^4.1.2` | `4.1.10` | Patch update; run unit/integration suites |
| `@playwright/test` | `^1.49.1` | `1.61.1` | Large minor span; update browsers and run all E2E projects |
| `typescript` | `^5.8.2` | `7.0.2` | Major candidate; keep TypeScript 5.x first, then separate migration |
| `@types/node` | `^20.14.10` | `26.1.1` | Major type surface; align with supported Node runtime |
| `eslint` | `^9.23.0` | `10.7.0` | Major; wait until framework/config support is confirmed |
| `prettier` | `^3.5.3` | `3.9.5` | Low risk; plugin must be upgraded/tested with it |
| `prettier-plugin-tailwindcss` | `^0.6.11` | `0.8.0` | Update with Prettier/Tailwind; formatting churn expected |
| `typescript-eslint` | `^8.27.0` | `8.64.0` | Same major; update with ESLint/TypeScript validation |
| `jsdom` | `^29.0.1` | `29.1.1` | Patch update |

The current repository has no CI configuration, and validation is therefore especially important before dependency changes land. Add CI as a follow-on task so frozen install, lint, typecheck, unit tests, build, and selected E2E tests run on every dependency update.

### P2 — routine direct dependency refresh

These are not the first blockers but should be refreshed during the next controlled maintenance pass: `@hookform/resolvers` 5.2.2 → 5.4.0, `@t3-oss/env-nextjs` 0.12.0 → 0.13.11, `@tanstack/react-query` 5.69.0 → 5.101.2, tRPC 11.0.0 → 11.18.0, `react-hook-form` 7.72.0 → 7.81.0, `recharts` 3.8.1 → 3.9.2, `react-day-picker` 9.14.0 → 10.0.1, `@vitejs/plugin-react` 6.0.1 → 6.0.3, `postcss` 8.5.3 → 8.5.19, and the Radix component packages listed in `package.json`.

React Day Picker 10 is a major version and should not be treated as a routine update. The remaining same-major updates are suitable for small batches after tests establish a baseline.

### P2 — deliberate major-version decisions

The following latest versions are major jumps and require explicit adoption decisions:

- `zod` 3.24.2 → 4.4.3: audit schemas, error formatting, coercion, and tRPC/server validation behavior. Keep Zod 3 until the application and `@t3-oss/env-nextjs` compatibility matrix is confirmed.
- TypeScript 5.x → 7.0.2: evaluate compiler behavior, module resolution, generated types, and the Node/type package line.
- ESLint 9 → 10: verify flat config, `eslint-config-next`, and all lint scripts; note that the current script uses `next lint`, which may itself need migration.
- Next.js 15 → 16: use the framework migration plan above.
- React Day Picker 9 → 10: inspect date-picker API and styling changes.
- `dotenv-cli` 7.4.4 → 11.0.0: validate integration and E2E environment loading; it is only used by test scripts.

## Recommended update sequence

1. **Baseline:** provide pnpm 10.30.1, frozen-install the current lockfile, capture versions, and run lint/typecheck/unit tests/build. Fix baseline failures before changing versions.
2. **Low-risk refresh:** update patch/minor packages in small groups: React/React DOM patches, Vitest/jsdom, Prettier/plugin, PostCSS, tRPC/React Query, form packages, and UI patch releases.
3. **Platform slice:** update Supabase clients and CLI; run Auth, SSR middleware, RLS integration, Realtime, and seed/migration checks.
4. **CSS/UI slice:** update Tailwind/PostCSS, class utilities, Radix, icons, Motion, and layout packages; inspect visual output and run Playwright flows.
5. **Framework migration:** upgrade Next.js and `eslint-config-next` to 16, apply documented codemods, review middleware/proxy behavior, and validate production build/deployment.
6. **Major experiments:** investigate Zod 4, TypeScript 7, ESLint 10, React Day Picker 10, and dotenv-cli 11 in separate branches or commits.
7. **Lock and CI:** commit manifest plus lockfile together, add CI for frozen install and required checks, then run `pnpm audit` and review transitive changes.

## Verification matrix

| Area | Required checks |
|---|---|
| Install/reproducibility | `pnpm --version`; `pnpm install --frozen-lockfile`; `pnpm list --depth 0` |
| Static quality | `pnpm lint`; `pnpm typecheck`; `pnpm format:check` |
| Automated tests | `pnpm test`; `pnpm test:integration` with Supabase test environment |
| Browser behavior | member/admin setup and each `e2e:*` project; auth redirects; kanban drag/update; date picker; responsive layout |
| Production behavior | `pnpm build`; `pnpm start`; smoke-test SSR, middleware/proxy, tRPC, Supabase Auth, and service-role paths |
| Security/dependency review | `pnpm audit`; inspect lockfile diff; confirm no service-role secret reaches client bundles |

## Limitations

This report is a research and planning artifact, not an authorization to upgrade dependencies. Registry “latest” tags can move after the review date, and compatibility cannot be proven without the missing pnpm/toolchain and configured Supabase/browser environments. The project should not merge a bulk update solely because every package has a newer registry version.
