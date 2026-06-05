# How to Build: EventSync Pattern

A reusable build methodology for full-stack Next.js/T3 SaaS projects. Captures the exact workflow used to build EventSync — from PRD to production — including lessons learned and architectural trade-offs.

---

## Stack

| Layer | Technology | Why |
|---|---|---|
| Framework | Next.js 15 App Router | Server components, streaming, built-in routing |
| Language | TypeScript | Type safety across client + server |
| API | tRPC v11 | End-to-end typed procedures for complex queries |
| Auth | Supabase Auth (OTP + MFA) | Managed auth, integrates with RLS |
| Database | Supabase (Postgres) | RLS, realtime, managed migrations |
| Styling | Tailwind CSS v4 + shadcn/ui | Design token system, accessible primitives |
| State | TanStack Query (via tRPC) | Cache, optimistic updates, stale-while-revalidate |
| Forms | react-hook-form + Zod | Schema-first validation |
| Animations | Motion (motion/react) | Declarative animation without complexity |
| Package manager | pnpm | Faster installs, strict hoisting |

---

## Phase 1 — Product Definition

### 1.1 Generate the PRD

Use `/plan-prd` to produce a versioned PRD. Save it to `docs/` (not the root folder).

A good PRD contains:
- User roles and what each can do
- Feature list grouped by screen
- Data model sketch (entities and relationships)
- Non-functional requirements (auth, permissions, performance targets)

```
docs/
  PRD_v1.md
  PRD_v2_FINAL.md   ← bump versions, don't overwrite
```

### 1.2 Define the Design Theme

Before touching Figma or Stitch, lock in:
- **Typography pair**: one display font (headings), one sans-serif (body)
- **Color palette**: primary, secondary, surface, background, destructive, muted
- **Spacing scale**: base unit (4px or 8px)
- **Border radius system**: none / sm / md / lg / full
- **Shadow vocabulary**: subtle card shadows, no decorative borders

Export these as CSS custom properties in `src/styles/globals.css` immediately. Every component references variables, never raw values.

```css
:root {
  --font-display: 'Playfair Display', serif;
  --font-body: 'DM Sans', sans-serif;

  --color-primary: oklch(45% 0.18 265);
  --color-surface: oklch(98% 0.01 80);
  --color-background: oklch(96% 0.015 80);

  --radius-card: 12px;
  --shadow-card: 0 1px 3px hsl(0 0% 0% / 0.04), 0 4px 16px hsl(0 0% 0% / 0.06);
}
```

---

## Phase 2 — Design System & UI

### 2.1 Run Stitch and Figma Simultaneously

This is the core time-saving pattern:

**Stitch**: Generate full screen layouts rapidly using text prompts with your theme applied. Produces screen IDs you can map to routes.

**Figma**: Polish individual components — buttons, cards, modals, form fields. Detailed spacing, hover states, focus rings.

**Merge rule**: Stitch owns layout composition. Figma owns component polish. When they conflict, Figma wins.

Export Stitch screen PNGs to `designs/member/` and `designs/admin/`. These become the reference during build — never delete them.

### 2.2 Create the Stitch → Route Map

Document the mapping before writing any code:

```
# Screen Directory
3ef10a2b  →  src/app/(auth)/login/page.tsx
02d24ce8  →  src/app/member/dashboard/page.tsx
c2e6611c  →  src/app/admin/dashboard/page.tsx
3b3bc946  →  src/app/admin/kanban/[eventId]/page.tsx
```

This prevents confusion when a screen has multiple states (loading, empty, error, data).

### 2.3 Write `eventsync-specs/00-design-system.md`

Before building any screen, document your design system as a spec file. Include:
- All CSS variable names and their values
- Typography rules (when to use display font vs body)
- Utility classes (`.card-shadow`, `.es-input`, etc.)
- Layout rules (no left sidebar, max content width, grid columns)
- Mobile-specific rules (bottom tab bar, full-screen modals, 44px tap targets)
- Responsive breakpoints (390px mobile / 768px tablet / 1440px desktop)

This file is the source of truth for every screen build prompt.

---

## Phase 3 — Feature Spec System

### 3.1 Create One Spec per Feature

Number them in build order. Keep them in `eventsync-specs/`:

```
eventsync-specs/
  00-design-system.md     ← always first
  00-prompt-templates.md  ← reusable Claude prompts
  01-login.md
  02-member-dashboard.md
  03-member-kanban.md
  04-admin-dashboard.md
  ...
  16-supabase-and-auth.md ← always last
```

Each spec is a mini-PRD. It must include:

```markdown
# Feature: Member Kanban

## Stitch Screen IDs
- `a3f91c22` — board view
- `b2d08e11` — task detail drawer

## User Stories
- As a member I can see tasks assigned to me grouped by status
- As a member I can open a task to see full details and submit for review

## tRPC Procedures Required
- `kanban.getBoard` — fetch columns + tasks for event (cached, 30s stale)
- `kanban.moveTask` — admin only, change task status
- `kanban.submitForReview` — member, add reflection + move to in-review

## Database Tables Touched
- `tasks`, `task_assignments`, `task_reflections`

## RLS Policies Required
- Members see only tasks assigned to them
- Admins see all tasks for their events

## Component Checklist
- [ ] KanbanBoard (layout)
- [ ] KanbanColumn
- [ ] KanbanCard (with DeadlineBadge)
- [ ] TaskDetailDrawer
- [ ] InReviewModal
```

This checklist is what you tick off during build, not a planning exercise.

---

## Phase 4 — Data Layer Architecture

This is the most critical phase. Getting these layers confused causes auth bugs that are hard to trace and easy to miss in manual testing.

### 4.1 The Three-Layer Auth Model

You have three auth/permission layers. Each owns a different concern. **Never let one substitute for the other.**

```
┌─────────────────────────────────────────────────────────────────┐
│ Layer 1: Supabase RLS (Row-Level Security)                      │
│                                                                 │
│ OWNS: Data ownership — which rows a user can see or change      │
│ QUESTION IT ANSWERS: "Does this user own this row?"             │
│                                                                 │
│ Example: A member can only SELECT tasks where                   │
│   task_assignments.member_id = auth.uid()                       │
│                                                                 │
│ NEVER USE FOR: "Can an admin create a task?" — that is a        │
│   role capability, not a data ownership question                │
└─────────────────────────────────────────────────────────────────┘

┌─────────────────────────────────────────────────────────────────┐
│ Layer 2: tRPC Procedure Guards                                  │
│                                                                 │
│ OWNS: Role capabilities — what a role is allowed to do          │
│ QUESTION IT ANSWERS: "Is this user allowed to perform X?"       │
│                                                                 │
│ Example: adminProcedure checks ctx.user.role === 'admin'        │
│   before allowing moveTask to execute at all                    │
│                                                                 │
│ NEVER USE FOR: Replacing RLS — always assume the DB also        │
│   enforces at the row level independently                       │
└─────────────────────────────────────────────────────────────────┘

┌─────────────────────────────────────────────────────────────────┐
│ Layer 3: Next.js Middleware / Route Protection                  │
│                                                                 │
│ OWNS: Page access — which routes require authentication at all  │
│ QUESTION IT ANSWERS: "Is this user logged in?"                  │
│                                                                 │
│ Example: middleware.ts redirects unauthenticated requests       │
│   from /admin/* and /member/* to /login                         │
└─────────────────────────────────────────────────────────────────┘
```

**The rule**: A check that belongs in one layer should never be the *only* check. Admin mutations need BOTH a tRPC role guard AND an RLS policy. If someone bypasses tRPC (direct DB call, seed script, migration), RLS still protects. If RLS has a misconfigured policy, tRPC blocks at the application layer first.

**Concrete example of the confusion to avoid:**

```sql
-- WRONG: Using RLS to block by role instead of ownership
CREATE POLICY "only_admins_can_insert" ON tasks
  FOR INSERT USING (
    (SELECT role FROM profiles WHERE id = auth.uid()) = 'admin'
  );
-- Problem: RLS is now doing role logic. If roles change or the query
-- is expensive, you've mixed two concerns in one place.

-- CORRECT: RLS owns the row relationship
CREATE POLICY "admins_insert_own_events" ON tasks
  FOR INSERT WITH CHECK (
    EXISTS (
      SELECT 1 FROM events
      WHERE events.id = tasks.event_id
        AND events.admin_id = auth.uid()
    )
  );
-- "Can this admin insert into THIS event?" — row ownership question.
-- Whether an admin CAN create tasks at all is enforced in adminProcedure.
```

### 4.2 tRPC Procedure Types

Define these once in `src/server/api/trpc.ts`. Never check roles inside a resolver — the procedure type IS the role check.

```ts
// Any authenticated user
export const protectedProcedure = t.procedure.use(enforceIsAuthed)

// Must have admin role
export const adminProcedure = t.procedure
  .use(enforceIsAuthed)
  .use(enforceIsAdmin)

// Must have member role (not admin)
export const memberProcedure = t.procedure
  .use(enforceIsAuthed)
  .use(enforceIsMember)
```

### 4.3 tRPC vs Server Actions Decision Matrix

| Scenario | Use | Why |
|---|---|---|
| Read query with joins, filters, pagination | **tRPC** | TanStack Query cache, stale time, prefetch |
| Read query needing parallel batching | **tRPC** | Automatic request batching built in |
| Read shared across multiple pages | **tRPC** | Single cache key, reused across routes |
| Simple create/update/delete tied to a form | **Server Action** | Colocated, less boilerplate, no cache needed |
| Mutation needing optimistic UI | **tRPC** | `useMutation` + `onMutate` is purpose-built for this |
| Realtime data (row change subscriptions) | **Supabase Realtime direct** | Never route through tRPC — see below |
| Bulk admin operations | **tRPC** | Role guard + detailed return type |

### 4.4 tRPC — Complex Read with Caching

```ts
// src/server/api/routers/kanban.ts
getBoard: protectedProcedure
  .input(z.object({ eventId: z.string().uuid() }))
  .query(async ({ ctx, input }) => {
    // Parallel queries — never await sequentially when independent
    const [columns, tasks, members] = await Promise.all([
      ctx.db.from('columns').select('*').eq('event_id', input.eventId),
      ctx.db.from('tasks').select('*, task_assignments(*)').eq('event_id', input.eventId),
      ctx.db.from('event_members').select('*, profiles(*)').eq('event_id', input.eventId),
    ])
    return {
      columns: columns.data ?? [],
      tasks: tasks.data ?? [],
      members: members.data ?? [],
    }
  }),
```

```tsx
// Client — cache stays fresh for 30s, prefetch on hover
const { data } = api.kanban.getBoard.useQuery(
  { eventId },
  { staleTime: 30_000 }
)

// Prefetch on link hover to eliminate perceived loading
const utils = api.useUtils()
<Link
  href={`/admin/kanban/${eventId}`}
  onMouseEnter={() => utils.kanban.getBoard.prefetch({ eventId })}
>
```

### 4.5 Server Actions — Simple Mutations

```ts
// src/app/member/kanban/_actions.ts
'use server'

export async function submitTaskForReview(taskId: string, reflection: string) {
  const supabase = await createServerClient()
  const { error } = await supabase
    .from('task_reflections')
    .insert({ task_id: taskId, content: reflection })
  if (error) throw new Error(error.message)
  revalidatePath('/member/kanban')
}
```

No tRPC overhead for a form submission that just writes one row. `revalidatePath` refreshes the server-rendered page. Done.

### 4.6 Supabase Realtime — Never Route Through tRPC

Realtime is a persistent WebSocket subscription. tRPC is a request-response model. Mixing them adds latency, breaks the subscription lifecycle, and gains nothing.

The pattern: subscribe directly, then invalidate the tRPC cache when a change arrives.

```ts
// src/hooks/useKanbanRealtime.ts
export function useKanbanRealtime(eventId: string) {
  const utils = api.useUtils()

  useEffect(() => {
    const channel = supabase
      .channel(`kanban-${eventId}`)
      .on(
        'postgres_changes',
        { event: '*', schema: 'public', table: 'tasks', filter: `event_id=eq.${eventId}` },
        () => {
          // Invalidate the tRPC cache — it will refetch automatically
          void utils.kanban.getBoard.invalidate({ eventId })
        }
      )
      .subscribe()

    return () => { void supabase.removeChannel(channel) }
  }, [eventId, utils])
}
```

The board data still lives in the tRPC cache. Realtime just tells it when to refetch.

---

## Phase 5 — Database Migrations

All schema changes go through Supabase migrations, never direct SQL in the dashboard.

```
supabase/migrations/
  20260408_initial_schema.sql
  20260415_add_reflections.sql
  20260422_security_hardening.sql    ← tighten RLS after first deploy
  20260429_admin_approval_gate.sql
  20260506_ai_quota_guardrails.sql
```

**Naming convention**: `YYYYMMDD_short_description.sql`

Every migration must include:
1. The schema change (CREATE TABLE, ALTER TABLE)
2. `ALTER TABLE x ENABLE ROW LEVEL SECURITY;`
3. RLS policies for each role
4. Indexes for foreign keys and filtered columns

**RLS policy template:**

```sql
-- Row ownership: member sees only their assigned rows
CREATE POLICY "members_read_own_assignments" ON task_assignments
  FOR SELECT USING (member_id = auth.uid());

-- Row ownership through relationship: admin sees rows for events they manage
CREATE POLICY "admins_read_event_tasks" ON task_assignments
  FOR SELECT USING (
    EXISTS (
      SELECT 1 FROM events
      WHERE events.id = task_assignments.event_id
        AND events.admin_id = auth.uid()
    )
  );
```

---

## Phase 6 — Component Build Order

### 6.1 Always Build Member Before Admin

Member screens establish the base components. Admin screens reuse and extend them.

1. Design system tokens + layout shell (`globals.css`, `layout.tsx`)
2. Auth screens (login, OTP verification)
3. Member screens (dashboard → kanban → profile) — simple to complex
4. Extract shared components as duplication appears
5. Admin screens (they layer role logic on top of member components)
6. Admin-only components (bulk actions, user management panels)

### 6.2 Component Ownership Rule

Never add an `isAdmin` prop to a shared component. Shared components have no role awareness. Create a separate admin variant.

```
src/app/_components/
  shared/
    DeadlineBadge.tsx       ← no role logic, used everywhere
    StatusBadge.tsx
  kanban/
    KanbanCard.tsx          ← member view
  admin/
    AdminTaskCard.tsx       ← admin variant with edit controls
```

If `KanbanCard` and `AdminTaskCard` share 80% of markup, extract a `TaskCardBase` that both wrap. Still no `isAdmin` prop.

### 6.3 Claude Code Prompt Template

```
Build [ScreenName] matching Stitch screen [ID].

Design reference: designs/[role]/[filename].png
Spec: eventsync-specs/[N]-[feature].md
Design system: eventsync-specs/00-design-system.md

Use the exact CSS variables from globals.css. Do not use raw Tailwind color values.
Typography: Playfair Display for headings, DM Sans for body.
Background: var(--color-background). Cards: var(--color-surface).

Data: wire [procedureName] using api.[router].[procedure].useQuery()
Auth: this is a [member/admin]-only page — use [memberProcedure/adminProcedure] in the router.

Mobile constraints: bottom tab navigation, full-screen drawers (Vaul), 44px tap targets.
No left sidebar at any breakpoint.
```

---

## Phase 7 — Testing Strategy

### 7.1 When to TDD vs Design-First

TDD = write the test before the implementation. Use it selectively:

| Code Type | Approach | Reason |
|---|---|---|
| tRPC router procedure | TDD | Defines auth rules and return shape before implementation |
| Zod validation schema | TDD | Edge cases are easier to spec in tests than in comments |
| Utility functions (dates, status logic) | TDD | Pure logic, trivial to test in isolation |
| UI components | Design-first, test after | You need to see it before you can meaningfully test it |
| Realtime subscriptions | Manual + E2E | Too coupled to network timing for unit tests |

**TDD example for a tRPC procedure:**

```ts
// Write THIS first — watch it fail because moveTask doesn't exist yet
describe('kanban.moveTask', () => {
  it('throws FORBIDDEN when called by a member', async () => {
    const ctx = createMockContext({ role: 'member' })
    await expect(
      kanbanRouter.createCaller(ctx).moveTask({ taskId: 't1', status: 'done' })
    ).rejects.toThrow('FORBIDDEN')
  })

  it('succeeds for admin of that event', async () => {
    const ctx = createMockContext({ role: 'admin' })
    const result = await kanbanRouter.createCaller(ctx).moveTask({
      taskId: 't1',
      status: 'done',
    })
    expect(result.status).toBe('done')
  })
})

// Now write the router to make these pass
```

The value is not the tests themselves — it is that you defined the auth rules in code before writing the implementation. No ad-hoc decisions mid-build.

### 7.2 Three Test Levels

```
Unit (Vitest)
  What: Zod schemas, utilities, pure functions
  Speed: <1s, no DB, no network
  Run: npm test

Integration (Vitest + real Supabase test DB)
  What: tRPC routers against real DB rows
  Why: Verifies RLS policies actually block what they should
  Run: dotenv-cli -e .env.test vitest run

E2E (Playwright)
  What: Full user flows in a real browser
  When to write: After the feature is stable, not during active development
  Run: npm run e2e
```

### 7.3 What Not to Test

- CSS or visual layout (breaks constantly, zero signal)
- Third-party library internals (Supabase, tRPC, shadcn)
- Implementation details (which internal helper was called)
- Anything that requires mocking half the codebase to test one line

---

## Phase 8 — Performance Patterns

### 8.1 Optimistic Updates for Mutations

For mutations where the result is predictable, update the cache before the server responds:

```ts
const moveTask = api.kanban.moveTask.useMutation({
  onMutate: async ({ taskId, newStatus }) => {
    await utils.kanban.getBoard.cancel({ eventId })
    const prev = utils.kanban.getBoard.getData({ eventId })
    utils.kanban.getBoard.setData({ eventId }, (old) => ({
      ...old!,
      tasks: old!.tasks.map(t =>
        t.id === taskId ? { ...t, status: newStatus } : t
      ),
    }))
    return { prev }
  },
  onError: (_, __, ctx) => {
    if (ctx?.prev) utils.kanban.getBoard.setData({ eventId }, ctx.prev)
  },
  onSettled: () => {
    void utils.kanban.getBoard.invalidate({ eventId })
  },
})
```

### 8.2 Parallel Queries

Never await independent DB queries sequentially:

```ts
// BAD — 3 round trips in series
const columns = await ctx.db.from('columns').select()
const tasks   = await ctx.db.from('tasks').select()
const members = await ctx.db.from('members').select()

// GOOD — effectively 1 round trip
const [columns, tasks, members] = await Promise.all([
  ctx.db.from('columns').select(),
  ctx.db.from('tasks').select(),
  ctx.db.from('members').select(),
])
```

---

## Phase 9 — Environment & Secrets

```bash
# .env  (not .env.local — Supabase SSR reads process.env directly)
NEXT_PUBLIC_SUPABASE_URL=        # safe to expose in browser
NEXT_PUBLIC_SUPABASE_ANON_KEY=   # safe to expose in browser
SUPABASE_SERVICE_ROLE_KEY=       # SERVER ONLY — never prefix with NEXT_PUBLIC_
DATABASE_URL=                    # SERVER ONLY
```

If `SUPABASE_SERVICE_ROLE_KEY` ever appears in a client bundle or git history, rotate it immediately. This key bypasses all RLS.

---

## Phase 10 — Pre-Commit Checklist

- [ ] `npm run build` passes with no type errors
- [ ] `npm test` passes
- [ ] No `console.log` in production code
- [ ] No hardcoded UUIDs, secrets, or credentials
- [ ] RLS policy exists for every new table (SELECT, INSERT, UPDATE, DELETE)
- [ ] tRPC procedure uses the correct procedure type (`adminProcedure`, `memberProcedure`, or `protectedProcedure`)
- [ ] New server actions are in `_actions.ts` files, not mixed into components
- [ ] Mobile layout tested at 390px width
- [ ] Loading and error states implemented for every async data fetch

---

## Anti-Patterns Reference

| Anti-pattern | Problem | Correct approach |
|---|---|---|
| Role check inside RLS (not ownership) | Mixes concerns, makes RLS fragile | RLS = row ownership. tRPC = role capabilities. Never swap. |
| Using only tRPC role guard, no RLS | Direct DB calls or migrations bypass tRPC | Both layers must independently enforce their concern |
| Routing Supabase Realtime through tRPC | Wrong model — tRPC is req/res, not persistent | Subscribe directly; invalidate tRPC cache on change |
| Server Actions for complex read queries | No caching, no batching | tRPC for reads, Server Actions for simple mutations |
| `isAdmin` prop on shared components | Leaks role logic into presentation | Separate admin variant component |
| PRD/spec files at repo root | Pollutes root, hard to find, gets committed by accident | All docs in `docs/`, all specs in `eventsync-specs/` |
| E2E tests during active UI development | Tests break every design iteration | Write E2E after the feature is stable |
| Awaiting independent DB queries in series | 3× the latency for no reason | `Promise.all` for all independent queries |
