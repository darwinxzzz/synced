# Third-Party Library and Repository Dependencies

**Repository:** Synced  
**Last reviewed:** 2026-07-14 (Asia/Singapore)  
**Source of truth:** `package.json` and `pnpm-lock.yaml`

## Scope

Synced is a Next.js App Router application. Its application dependencies are managed by pnpm; the committed lockfile uses lockfile format 9 and the manifest declares `pnpm@10.30.1`. No other package-manager manifests, vendored dependency trees, Git submodules, Docker manifests, or language-specific dependency files were found.

The project also uses the ignored `Workflow-Scripts/` directory as a separate Git repository. It supplies workflow and documentation material only; it is not imported by the application and is not part of the Synced dependency graph.

## Dependency boundaries

| Boundary | Dependencies | Where used | Operational notes |
|---|---|---|---|
| Web framework/runtime | Next.js, React, React DOM, `server-only` | `src/app/`, middleware, route handlers | Next.js and React must be upgraded as a compatibility unit. |
| Server API and validation | tRPC, TanStack Query, SuperJSON, Zod, T3 Env | `src/server/`, `src/trpc/`, `src/env.js` | tRPC, React Query, and Zod changes can affect procedure contracts and error handling. |
| Data/auth platform | `@supabase/ssr`, `@supabase/supabase-js`, Supabase CLI | `src/lib/supabase/`, migrations, seed scripts | The service-role client is server-only; CLI version should be compatible with the hosted project and migration workflow. |
| UI primitives and styling | Radix UI packages, Tailwind CSS, Tailwind PostCSS, `tailwind-merge`, CVA, `clsx`, Lucide, Sonner, Motion, Vaul, Embla, OTP, themes | `src/app/`, `src/styles/` | Radix packages are independently versioned; test shared UI primitives after upgrades. |
| Forms and data presentation | React Hook Form, resolvers, Recharts, React Day Picker, React Resizable Panels | feature components and admin/member screens | These packages affect user interaction, chart rendering, and responsive layouts. |
| Test/build tooling | TypeScript, ESLint, `eslint-config-next`, types packages, Vite React plugin, Vitest, Testing Library, jsdom, Playwright, Prettier, PostCSS, dotenv-cli | `tests/`, `vitest.config.ts`, `playwright.config.ts` | Keep framework, lint, compiler, and test-runner upgrades in separate validation slices. |
| External hosted assets/services | Supabase Cloud, Vercel, Google Fonts, Unsplash images, Google-hosted login image, optional Discord OAuth | environment/configuration and UI assets | These are not npm dependencies. Availability, licensing, CSP, privacy, and service terms must be reviewed separately. |
| Workflow repository | `Workflow-Scripts/` at `https://github.com/Rebooted-Dev/Workflow-Scripts.git` | maintainer workflow and documentation | Separate Git repository; currently checked out on `main` locally despite repository guidance identifying `v1.7`. Sync independently. |

## Direct runtime dependencies

The following are declared in `dependencies` and are used by application code or runtime-facing configuration:

| Package family | Declared version | Responsibility |
|---|---:|---|
| `next` | `^15.2.3` | App Router, server rendering, routing, middleware, image/font integration |
| `react`, `react-dom` | `^19.0.0` | UI runtime |
| `@supabase/ssr`, `@supabase/supabase-js` | `^0.10.0`, `^2.101.1` | Browser/SSR/admin Supabase clients |
| `@trpc/client`, `@trpc/react-query`, `@trpc/server` | `^11.0.0` | Typed API transport and procedures |
| `@tanstack/react-query` | `^5.69.0` | Client query/cache state for tRPC |
| `zod`, `@t3-oss/env-nextjs` | `^3.24.2`, `^0.12.0` | Input and environment validation |
| `superjson` | `^2.2.1` | tRPC serialization |
| `react-hook-form`, `@hookform/resolvers` | `^7.72.0`, `^5.2.2` | Form state and schema integration |
| Radix UI packages | `^1.x`/`^2.x`/`^1.3.x` | Accessible primitives used by shared UI components |
| `tailwind-merge`, `class-variance-authority`, `clsx` | `^3.5.0`, `^0.7.1`, `^2.1.1` | Class composition and variant utilities |
| `tailwindcss`, `@tailwindcss/postcss`, `next-themes` | `^4.0.15`, `^4.0.15`, `^0.4.6` | CSS generation and theme switching |
| `motion`, `lucide-react`, `sonner` | `^12.38.0`, `^1.7.0`, `^2.0.7` | Animation, icons, and notifications |
| `recharts`, `react-day-picker`, `react-resizable-panels` | `^3.8.1`, `^9.14.0`, `^4.8.0` | Dashboards, date selection, and resizable layouts |
| `embla-carousel-react`, `input-otp`, `cmdk`, `vaul`, `next-themes` | as declared in `package.json` | Marketing carousel, OTP input, command/menu UI, drawer UI, theme switching |

The complete authoritative list, including every Radix package, remains the `dependencies` section of `package.json`; this catalog groups packages by responsibility to avoid duplicating a second editable manifest.

## Direct development dependencies

| Group | Packages |
|---|---|
| Framework lint/build | `@eslint/eslintrc`, `eslint`, `eslint-config-next`, `postcss`, `@tailwindcss/postcss`, `tailwindcss` |
| TypeScript | `typescript`, `typescript-eslint`, `@types/node`, `@types/react`, `@types/react-dom` |
| Unit/component tests | `vitest`, `@vitejs/plugin-react`, `jsdom`, `@testing-library/jest-dom`, `@testing-library/react`, `@testing-library/user-event` |
| Browser tests | `@playwright/test` |
| Formatting | `prettier`, `prettier-plugin-tailwindcss` |
| Supabase tooling and scripts | `supabase`, `dotenv-cli` |

## Repository and hosted dependencies

### Workflow-Scripts

`Workflow-Scripts/` is a separate repository at `https://github.com/Rebooted-Dev/Workflow-Scripts.git`. It is ignored by the main repository and must be inspected, pulled, committed, and pushed from its own working directory. The repository map describes the expected shared-workflow line as `v1.7`; the local checkout was observed on branch `main` during this review. This is documentation/tooling drift, not an application build dependency.

### Hosted services and assets

- Supabase Cloud provides authentication, Postgres, RLS, and the project API.
- Vercel is the documented deployment target; no Vercel SDK is installed in the application.
- Google Fonts are imported from `fonts.googleapis.com` in `src/styles/globals.css`.
- Marketing imagery is loaded from Unsplash URLs in `src/app/_components/marketing/constants.ts`.
- The login page contains a Google-hosted image URL.
- `.env.example` contains optional Discord OAuth placeholders, but no Discord SDK dependency was found.

Hosted URLs should be treated as operational dependencies: pin or self-host critical assets where appropriate, document licensing/usage rights, and verify CSP/privacy behavior before production launch.

## Maintenance rules

1. Change `package.json` through pnpm and commit the resulting `pnpm-lock.yaml` in the same change.
2. Keep React, React DOM, Next.js, `eslint-config-next`, and the supported Node.js line aligned.
3. Upgrade Supabase client packages together and validate SSR cookie handling, Auth refresh, RLS integration tests, and service-role isolation.
4. Upgrade Tailwind and its PostCSS integration together; inspect generated CSS and shared class composition.
5. Treat major upgrades as migration work. Use a branch, run lint/typecheck/unit/integration/E2E/build checks, and review the changelog before merging.
6. Run `pnpm audit` and review transitive changes before release. A clean audit does not replace application security testing.

See [Dependency Update Research](../project/research/2026-07-14-third-party-dependency-update-research.md) for the current update assessment and sequencing recommendations.
