# Code Architecture

## Entry Points
- `src/middleware.ts` — Request-level auth/session/rate-limit guard
- `src/app/layout.tsx` — Root layout (providers, styles, fonts)
- `src/app/api/trpc/[trpc]/route.ts` — tRPC HTTP handler (GET/POST)
- `src/app/(marketing)/page.tsx` — Public landing page
- `src/app/(auth)/login/page.tsx` — Login page
- `src/app/admin/dashboard/page.tsx` — Admin dashboard
- `src/app/member/dashboard/page.tsx` — Member dashboard

## High-Level Layout
```text
src/
├── app/                 # Next.js App Router (pages, layouts, API routes)
│   ├── (auth)/          # Minimal auth route group
│   ├── (marketing)/     # Public marketing route group with Navbar/Footer
│   ├── admin/           # Protected admin portal
│   ├── member/          # Protected member portal
│   ├── api/trpc/        # tRPC HTTP endpoint
│   └── _components/     # Feature-organized UI components
├── server/              # tRPC routers + domain services
│   ├── api/             # tRPC root, context, procedures, routers
│   └── services/        # Business/domain services
├── lib/                 # Auth helpers, Supabase clients, shared utilities
├── trpc/                # Client-side tRPC setup (react provider, query client)
├── types/               # TypeScript type definitions (DB types, domain types)
├── styles/              # Global CSS (Tailwind imports)
└── middleware.ts        # Route guard middleware
```

## Visual Layer Map

```text
┌─────────────────────────────────────────────────────────────────────┐
│                    PRESENTATION LAYER (src/app/)                    │
│  ┌──────────┐ ┌──────────┐ ┌──────────┐ ┌──────────┐              │
│  │Marketing │ │   Auth   │ │  Admin   │ │  Member  │              │
│  │  Pages   │ │  Pages   │ │  Portal  │ │  Portal  │              │
│  └──────────┘ └──────────┘ └──────────┘ └──────────┘              │
│         │            │            │           │                     │
│         └────────────┴────────────┴───────────┘                     │
│                              │                                      │
│              ┌───────────────┴───────────────┐                      │
│              │    Feature Components          │                      │
│              │  (_components/<feature>/)      │                      │
│              └───────────────┬───────────────┘                      │
└──────────────────────────────┼──────────────────────────────────────┘
                               │ tRPC React Hooks
                               ▼
┌─────────────────────────────────────────────────────────────────────┐
│                   API LAYER (src/server/api/)                       │
│  ┌────────────┐ ┌────────────────────┐ ┌────────────────────────┐  │
│  │ tRPC Root  │ │  Procedure Gates   │ │  Feature Routers      │  │
│  │ (root.ts)  │ │ (trpc.ts)          │ │ (routers/*.ts)        │  │
│  └──────┬─────┘ │ publicProcedure   │ │ ┌───┬───┬───┬───┬──┐ │  │
│         │       │ protectedProcedure│ │ │auth│att│kbn│...│  │ │  │
│         │       │ adminProcedure    │ │ └───┴───┴───┴───┴──┘ │  │
│         │       └────────────────────┘ └────────────────────────┘  │
│         │                                                          │
└─────────┼──────────────────────────────────────────────────────────┘
          │
          ▼
┌─────────────────────────────────────────────────────────────────────┐
│                SERVICE LAYER (src/server/services/)                 │
│              Business Logic / Domain Services (testimonials/)      │
└──────────────────────────────┬──────────────────────────────────────┘
                               │
          ┌────────────────────┼────────────────────┐
          │                    │                    │
          ▼                    ▼                    ▼
┌─────────────────┐ ┌─────────────────┐ ┌────────────────────────────┐
│   DATA ACCESS   │ │   AUTH LAYER    │ │       TYPES                │
│ src/lib/supabase│ │ src/lib/auth/   │ │  src/types/                │
│ ┌───┬───┬────┐  │ │ access.ts       │ │  ┌──────────────────────┐ │
│ │Srv│Clt│Adm │  │ │ evaluateAccess()│ │  │database.ts (gen)    │ │
│ └───┴───┴────┘  │ │ getAuthState()  │ │  │Domain types (manual)│ │
└─────────────────┘ └─────────────────┘ └──────────────────────────┘
```

## Layers and Boundaries
- **Presentation (`app/`)**: Pages, layouts, route groups, and UI components. Client components handle interactivity; server components and API routes handle server-side execution.
- **API (`server/api/`)**: tRPC router definitions and transport-agnostic procedure declarations. Each feature area has its own router file under `src/server/api/routers/`.
- **Service (`server/services/`)**: Business logic separated from the tRPC transport layer. Testimonial services and schemas are currently implemented here.
- **Data Access (`lib/supabase/`)**: Supabase client wrappers for server, browser, and admin/service-role contexts.
- **Auth (`lib/auth/`)**: Access control logic shared by middleware and tRPC.
- **Types (`types/`)**: Shared TypeScript types including generated Supabase database types.

## Conventions
- Feature co-location: UI components live in `src/app/_components/<feature>/`.
- Route groups separate public marketing, auth, admin, and member experiences without coupling their layouts.
- Type safety is maintained end-to-end through tRPC router types and the React tRPC client.
- Role-based access is enforced at both middleware and tRPC procedure levels.
- Environment validation is centralized in `src/env.js`.
- Supabase runtime usage is explicit: browser code uses the browser client, server code uses the SSR server client, and privileged server-only operations use the admin client.

## Key Abstractions
- **tRPC procedures:** `publicProcedure`, `protectedProcedure`, and `adminProcedure` in `src/server/api/trpc.ts`.
- **tRPC root router:** `appRouter` in `src/server/api/root.ts`, currently registering `auth`, `attendance`, `contributions`, `dashboard`, `events`, `kanban`, `newsletter`, `reflections`, and `testimonials` routers.
- **Supabase clients:** server client in `src/lib/supabase/server.ts`, browser client in `src/lib/supabase/client.ts`, and service-role admin client in `src/lib/supabase/admin.ts`.
- **Access control:** `evaluateAccess()` and `getAuthState()` in `src/lib/auth/access.ts`.
- **Middleware guard:** `src/middleware.ts` combines rate limiting, Supabase session refresh, route protection, login redirects, and role routing.
- **Root providers:** `src/app/layout.tsx` wraps the app with `TRPCReactProvider` and the global Sonner `Toaster`.

## Extension Points
- **Add a new tRPC router:** Create a router file in `src/server/api/routers/`, export it, and register it in `src/server/api/root.ts`.
- **Add a new protected page:** Create `page.tsx` under `src/app/admin/` or `src/app/member/`; middleware will apply route protection by path prefix.
- **Add a new public page:** Create `page.tsx` under `src/app/(marketing)/` to use the public marketing layout.
- **Add a new auth page:** Create `page.tsx` under `src/app/(auth)/` for minimal auth-shell pages.
- **Add a new API route:** Create `route.ts` in `src/app/api/<route>/`.
- **Add a UI component:** Create a file in `src/app/_components/<feature>/` and keep reusable primitives under `src/app/_components/ui/`.
- **Add business logic:** Prefer `src/server/services/<domain>/` when logic is shared or too large for a tRPC router procedure.
