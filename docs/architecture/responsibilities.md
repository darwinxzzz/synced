# Layer responsibilities — who owns what

> **Domain is a folder. Role is a guard. View is a route group.**

Admin and member are not a top-level split. They are the *same domains* (kanban, events,
attendance, …) viewed through different access and UI. Splitting by role at the top duplicates
domain logic and lets the two halves drift. Role is an **access axis**, not a domain boundary.

| Layer | Primary split | How admin vs member differs | Rule |
|---|---|---|---|
| `app/` pages | **role** (route groups `admin/`, `member/`) | Views genuinely differ → separate pages | Role **renders** here |
| `app/_components/` | shared + role | `shared/` primitives; `admin/`, `member/` skins | Shared primitives down, role skins up |
| `server/api/routers/` | **domain** (`kanban.ts`) | `protectedProcedure` (member) vs `adminProcedure` (admin) within one file | Role is a **guard**, not a file |
| `server/services/` | **domain** (`kanban/`) | `getMemberBoard(ctx, uid)` vs `getBirdsEye(ctx)` | Services are **role-agnostic**; never check role |
| Postgres (RLS) | table | `auth.uid()` ownership vs `is_admin()` | The **backstop** |

## Worked example — kanban end to end

```
Member path:                              Admin path:
app/member/kanban/page.tsx                app/admin/kanban/page.tsx
   └ api.kanban.getMemberBoard               └ api.kanban.getBirdsEye
        (protectedProcedure)                      (adminProcedure)
            └ kanbanService                           └ kanbanService
                .getMemberBoard(ctx, uid)                 .getBirdsEye(ctx)
                    └ ctx.supabase (RLS: owns it)             └ ctx.supabase (RLS: is_admin)
```

One service, shared query helpers and the shared "forward-only move" rule. Divergence = which
procedure guards (role) + which page renders (view). The service never asks "are you admin?" — it
trusts the gate already passed; RLS catches it regardless.

## Service-layer discipline

1. **Services receive their Supabase client** (`ctx.supabase` for user calls, the admin client
   for webhook/cron calls). They never create one. → RLS still applies on user paths, the
   privileged client is contained, services are unit-testable with a mock client.
2. **Authorization is not a service concern.** It lives in the procedure (Ring 2) + RLS (Ring 3).
   A service assumes a trusted actor was passed in.
3. **Schemas are single-sourced** in `services/<domain>/schemas.ts`; routers import them for
   `.input()` instead of redefining Zod inline.
