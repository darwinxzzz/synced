# Systems Architecture

## Context and Goals
Synced is a community/team management platform. It provides tools for membership administration, event management, collaborative kanban boards, testimonial/feedback systems, attendance tracking, and contribution logging.

## System Overview
The application follows a modern web architecture:
- **Frontend:** Next.js 15 App Router with server and client components
- **API Layer:** tRPC v11 providing end-to-end type safety between frontend and backend
- **Database:** Supabase Postgres with Row-Level Security for data access control
- **Authentication:** Supabase SSR auth with OAuth-oriented login flows and session management

## Components and Boundaries

### Frontend (`src/app/`)
- Route groups separate concerns: public marketing (`(marketing)`), auth flows (`(auth)`), admin panel (`admin/`), member portal (`member/`).
- Shared UI components live in `src/app/_components/` and are organized by feature/domain, including `admin/`, `attendance/`, `dashboard/`, `kanban/`, `marketing/`, `shared/`, `testimonials/`, and `ui/`.
- `src/app/layout.tsx` imports global styles, loads the Geist font, and wraps the app in `TRPCReactProvider` plus a global Sonner `Toaster`.
- `(marketing)/layout.tsx` composes the public shell with `Navbar` and `Footer`.
- `(auth)/layout.tsx` is intentionally minimal and renders auth pages without the marketing shell.
- `admin/layout.tsx` and `member/layout.tsx` are client-side application shells with desktop navigation, profile drawer access, and mobile tab navigation.

### API Layer (`src/server/api/`)
- `src/server/api/root.ts` composes feature routers for `auth`, `attendance`, `contributions`, `dashboard`, `events`, `kanban`, `newsletter`, `reflections`, and `testimonials`.
- `src/app/api/trpc/[trpc]/route.ts` exposes the tRPC router over GET and POST using `fetchRequestHandler`.
- Procedures are gated by `publicProcedure`, `protectedProcedure`, and `adminProcedure` from `src/server/api/trpc.ts`.
- `protectedProcedure` and `adminProcedure` use the shared access rule from `src/lib/auth/access.ts` so API authorization matches server route guards.

### Service Layer (`src/server/services/`)
- Business logic that should not be embedded directly in API transport handlers lives under `src/server/services/`.
- The current service layer includes testimonial service code and schemas in `src/server/services/testimonials/`.

### Auth Layer (`src/lib/auth/`, `src/lib/supabase/`, `src/middleware.ts`)
- `src/middleware.ts` handles request-level rate limiting, Supabase session refresh, protected route checks, and role-based redirects between admin and member areas.
- `src/lib/auth/access.ts` is the single source of truth for account status and role decisions via `evaluateAccess()` and `getAuthState()`.
- Supabase clients are split by runtime/context:
  - `src/lib/supabase/server.ts` for server-side SSR/client-cookie contexts
  - `src/lib/supabase/client.ts` for browser components
  - `src/lib/supabase/admin.ts` for service-role privileged operations

### Data Layer (Supabase)
- Supabase Postgres is the database of record.
- The known application tables include `attendance`, `contributions`, `event_members`, `events`, `profiles`, `reflections`, `testimonial_requests`, and `testimonials`.
- Generated database types are stored in `src/types/database.ts` and consumed by Supabase client helpers.

## Key Workflows

### Authentication and Role Routing
1. A user reaches `/login` or a protected `/admin/*` or `/member/*` route.
2. `src/middleware.ts` rate-limits auth/protected requests and refreshes the Supabase SSR session.
3. Middleware validates the user with `supabase.auth.getUser()` and fetches `profiles.role` and `profiles.status`.
4. `evaluateAccess()` rejects pending, inactive, rejected, missing, or unauthorized profiles.
5. Active admins are routed to `/admin/dashboard`; active members are routed to `/member/dashboard`; cross-role route access is redirected to the correct portal.

### Kanban Collaboration
1. Admin and member kanban pages live under their respective protected route groups and use the shared app shell.
2. UI components under `src/app/_components/kanban/` call the typed tRPC client from `~/trpc/react`.
3. The `kanban` router in `src/server/api/routers/kanban.ts` handles kanban API operations through protected tRPC procedures.
4. Access is enforced at both route level (middleware) and API level (`protectedProcedure`/`adminProcedure` where applicable).

### Testimonial Workflow
1. Testimonial UI is organized under `src/app/_components/testimonials/` and protected admin/member testimonial routes.
2. API operations are exposed through `src/server/api/routers/testimonials.ts`.
3. Reusable testimonial business logic and validation live in `src/server/services/testimonials/`.
4. Data persists in Supabase tables including `testimonial_requests` and `testimonials`.

## External Dependencies
- **Supabase:** Postgres database, authentication, SSR session handling, and service-role access for privileged operations.
- **Next.js 15:** React framework and App Router runtime.
- **tRPC v11:** Type-safe API layer between React components and server routers.
- **React Query:** Client-side query/mutation caching through the tRPC React integration.
- **Tailwind CSS v4:** Utility-first styling via global CSS imports.
- **Radix UI primitives / shadcn-style components:** Accessible UI primitives used in the component system.
- **class-variance-authority, clsx, tailwind-merge:** Component variant and class-name composition helpers.
- **Vitest and Playwright:** Unit/integration and end-to-end testing.

## Deployment Topology (High-Level)
The repository is structured for a hosted Next.js application backed by Supabase Cloud or an equivalent Supabase deployment. A typical production topology is:
- Next.js application deployed to a serverless/edge-capable host such as Vercel.
- Supabase project providing Auth and Postgres with RLS policies.
- Browser clients call Next.js pages and `/api/trpc`; server-side code uses Supabase SSR/admin clients with environment-provided credentials.

No Docker or CI/CD configuration was found in the project discovery context, so deployment automation is not documented here as source-backed.

## Notes / Open Questions
- Confirm the production hosting target if it differs from the typical Vercel + Supabase topology.
- Keep `src/lib/auth/access.ts`, middleware guards, and tRPC procedures synchronized by continuing to route all status/role checks through the shared access helpers.
