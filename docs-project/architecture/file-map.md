# File Map

## How To Navigate
The codebase follows a feature-grouped structure under `src/` with clear separation of concerns between app pages, server logic, and shared utilities.

## Directory Tree
```text
src/
├── app/
│   ├── (auth)/
│   │   ├── layout.tsx
│   │   └── login/
│   │       └── page.tsx
│   ├── (marketing)/
│   │   ├── layout.tsx
│   │   └── page.tsx
│   ├── _components/
│   │   ├── admin/
│   │   ├── attendance/
│   │   ├── dashboard/
│   │   ├── kanban/
│   │   ├── marketing/
│   │   ├── shared/
│   │   ├── testimonials/
│   │   └── ui/
│   ├── admin/
│   │   ├── layout.tsx
│   │   ├── attendance/
│   │   ├── dashboard/
│   │   │   └── page.tsx
│   │   ├── kanban/
│   │   └── testimonials/
│   ├── api/
│   │   └── trpc/
│   │       └── [trpc]/
│   │           └── route.ts
│   ├── member/
│   │   ├── layout.tsx
│   │   ├── dashboard/
│   │   │   └── page.tsx
│   │   ├── kanban/
│   │   └── testimonials/
│   └── layout.tsx
├── lib/
│   ├── auth/
│   │   └── access.ts
│   └── supabase/
│       ├── admin.ts
│       ├── client.ts
│       └── server.ts
├── server/
│   ├── api/
│   │   ├── root.ts
│   │   ├── trpc.ts
│   │   └── routers/
│   │       ├── attendance.ts
│   │       ├── auth.ts
│   │       ├── contributions.ts
│   │       ├── dashboard.ts
│   │       ├── events.ts
│   │       ├── kanban.ts
│   │       ├── newsletter.ts
│   │       ├── reflections.ts
│   │       └── testimonials.ts
│   └── services/
│       └── testimonials/
│           ├── schemas.ts
│           └── testimonial.service.ts
├── styles/
│   └── globals.css
├── trpc/
├── types/
│   └── database.ts
├── env.js
└── middleware.ts
```

## Key Files

| File | Purpose |
|------|---------|
| `src/middleware.ts` | Request guard: auth, session refresh, rate limiting, role routing |
| `src/app/layout.tsx` | Root layout with global CSS, Geist font, tRPC provider, and Toaster |
| `src/app/(marketing)/layout.tsx` | Public shell with marketing Navbar and Footer |
| `src/app/(auth)/layout.tsx` | Minimal auth layout |
| `src/app/admin/layout.tsx` | Client-side admin shell with navigation and profile drawer |
| `src/app/member/layout.tsx` | Client-side member shell with navigation and profile drawer |
| `src/server/api/root.ts` | tRPC router composition |
| `src/server/api/trpc.ts` | tRPC context, transformer, error formatting, and procedure definitions |
| `src/lib/auth/access.ts` | Centralized access control logic |
| `src/lib/supabase/server.ts` | SSR Supabase client |
| `src/lib/supabase/client.ts` | Browser Supabase client |
| `src/lib/supabase/admin.ts` | Service-role Supabase client |
| `src/types/database.ts` | Generated Supabase database types |
| `src/env.js` | Environment variable validation |
| `src/app/api/trpc/[trpc]/route.ts` | tRPC HTTP handler |
| `src/server/services/testimonials/testimonial.service.ts` | Testimonial domain service logic |
| `src/server/services/testimonials/schemas.ts` | Testimonial service validation schemas |

## Common Tasks Map
- **Add a feature router** → `src/server/api/routers/` + register in `src/server/api/root.ts`
- **Add a protected page** → Create `page.tsx` under `src/app/admin/` or `src/app/member/`
- **Add a public page** → Create `page.tsx` under `src/app/(marketing)/`
- **Add an auth page** → Create `page.tsx` under `src/app/(auth)/`
- **Add a UI component** → Create file in `src/app/_components/<feature>/`
- **Add a reusable UI primitive** → Create or update files in `src/app/_components/ui/`
- **Add domain/business logic** → Create files under `src/server/services/<domain>/`
- **Add a database migration** → Add a Supabase migration in the project Supabase migrations directory when present
- **Update access rules** → Change `src/lib/auth/access.ts` first, then verify middleware and tRPC callers still use the shared helpers
