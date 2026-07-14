# Modules

## Overview
Synced's source is organized into distinct module areas, each with clear responsibilities and boundaries. The application uses the Next.js App Router for route composition, tRPC for the typed client/server API boundary, Supabase for persistence and auth, and shared access-control utilities to keep route and API authorization consistent.

## Module Index

### App Layer (`src/app/`)
Next.js App Router pages and layouts are organized by route groups and application sections. The root layout imports global styles, wraps all routes in `TRPCReactProvider`, and mounts the shared Sonner `Toaster`. Route shells are split across marketing, auth, admin, and member areas so each section can define its own layout structure while sharing the root providers.

### Feature Components (`src/app/_components/`)
UI is organized by feature domain, including admin, kanban, dashboard, marketing, shared, testimonials, attendance, and reusable `ui` primitives. The `ui` components follow a shadcn-style pattern using Radix primitives and Tailwind CSS utilities, while feature folders contain higher-level presentation components for their route or workflow.

### tRPC Routers (`src/server/api/`)
tRPC router definitions live under `src/server/api/routers/` and are composed in `src/server/api/root.ts` as `appRouter`. Current routers cover auth, attendance, contributions, dashboard, events, kanban, newsletter, reflections, and testimonials. Shared tRPC setup in `trpc.ts` creates the Supabase-backed request context, configures SuperJSON and Zod error formatting, and exposes `publicProcedure`, `protectedProcedure`, and `adminProcedure` gates.

### Domain Services (`src/server/services/`)
Domain services keep business logic separate from router transport concerns. The testimonials service is the current service module example: its Zod schemas live beside the service and are imported by the tRPC router for `.input()` validation, while inferred types are used by the service implementation.

### Auth & Access (`src/lib/auth/`)
Auth access rules are centralized in `src/lib/auth/access.ts`. `getAuthState()` fetches the current Supabase user and profile, while `evaluateAccess()` is a pure decision function for account status and role checks. The same access module is used by tRPC procedure gates and middleware route guards to avoid drift between API and route-level authorization.

### Supabase Clients (`src/lib/supabase/`)
Supabase client creation is split by runtime context:
- `server.ts` creates an SSR/server client with Next.js cookies and typed database bindings.
- `client.ts` creates a browser client for client-side code.
- `admin.ts` creates a `server-only` service-role client with session persistence and token refresh disabled for trusted server operations.

### tRPC Client (`src/trpc/`)
Client-side tRPC setup lives in `src/trpc/`. `react.tsx` exports the typed `api` hooks, router input/output inference helpers, and `TRPCReactProvider`, which wires React Query to a tRPC client using `loggerLink` and `httpBatchStreamLink`. `query-client.ts` creates the React Query client with a default stale time and SuperJSON serialization/deserialization for hydration.

### Types (`src/types/`)
Project-wide TypeScript definitions live under `src/types/`. `database.ts` contains generated Supabase database types used by Supabase clients and auth helpers. Auth-specific access types such as `UserRole`, `AccessProfile`, and `AccessDecision` are defined with the auth access module, and service modules colocate their Zod-derived input types with their schemas.

### Styles (`src/styles/`)
Global styling is centralized in `src/styles/globals.css` and imported by the root App Router layout. The project uses Tailwind v4 with PostCSS configuration, and component styling is primarily expressed through Tailwind utility classes.

### Middleware (`src/middleware.ts`)
Middleware handles cross-cutting request concerns for protected routes. It performs lightweight in-memory rate limiting for auth and tRPC paths, refreshes Supabase sessions for page routes, redirects unauthenticated users to login, maps inactive/pending/rejected account states to login errors, blocks members from admin routes and admins from member routes, and routes authenticated login visits to the correct dashboard. tRPC requests are rate-limited in middleware but rely on tRPC context and procedure gates for auth and role checks.

### Env Validation (`src/env.js`)
Environment variables are validated with `@t3-oss/env-nextjs` and Zod. Server variables include `SUPABASE_SERVICE_ROLE_KEY`, `GOOGLE_STITCH_API_KEY`, and `NODE_ENV`; client variables include `NEXT_PUBLIC_SUPABASE_URL` and `NEXT_PUBLIC_SUPABASE_ANON_KEY`. Validation can be skipped with `SKIP_ENV_VALIDATION`, and empty strings are treated as undefined.

## Boundaries
- Presentation layer (`src/app/`) depends on client API bindings, shared UI, styles, and type definitions; server-only operations should stay out of client components.
- API layer (`src/server/api/`) owns request context, router composition, input validation at the transport boundary, and procedure-level auth gates.
- Services (`src/server/services/`) own domain/business logic and colocated schemas, and may depend on shared libraries such as Supabase clients and generated database types.
- Auth (`src/lib/auth/`) is the shared access-control source of truth and keeps access decisions pure where possible.
- Middleware depends on Supabase server-session primitives and shared auth/access decisions for route guarding.

## Dependency Notes
- No circular dependencies are implied by the module structure: composition flows from app/client code to tRPC bindings, from tRPC routers to services/lib, and from shared lib modules to generated types.
- tRPC provides the typed bridge between client components and server routers through the `AppRouter` type and React Query hooks.
- Auth and access control are cross-cutting concerns shared by middleware, tRPC procedures, and server-side operations.
- Supabase clients are intentionally separated by runtime to avoid leaking service-role or server-only behavior into browser code.
