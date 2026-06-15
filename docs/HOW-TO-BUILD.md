# How to Build: EventSync Pattern

A reusable build methodology for full-stack Next.js/T3 SaaS projects. Captures the exact workflow used to build EventSync from PRD to production, including lessons learned and architectural trade-offs.

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

## Phase 1 - Product Definition

### 1.1 Generate the PRD

Use /plan-prd to produce a versioned PRD. Save it to docs/ (not the root folder).

A good PRD contains:
- User roles and what each can do
- Feature list grouped by screen
- Data model sketch (entities and relationships)
- Non-functional requirements (auth, permissions, performance targets)

Bump versions, never overwrite: PRD_v1.md, PRD_v2_FINAL.md

### 1.2 Define the Design Theme

Before touching Figma or Stitch, lock in:
- Typography pair: one display font (headings), one sans-serif (body)
- Color palette: primary, secondary, surface, background, destructive, muted
- Spacing scale: base unit (4px or 8px)
- Border radius system: none / sm / md / lg / full
- Shadow vocabulary: subtle card shadows, no decorative borders

Export these as CSS custom properties in src/styles/globals.css immediately. Every component references variables, never raw values.

---

## Phase 2 - Design System and UI

### 2.1 Run Stitch and Figma Simultaneously

Stitch: Generate full screen layouts rapidly using text prompts with your theme applied. Produces screen IDs you can map to routes.

Figma: Polish individual components - buttons, cards, modals, form fields. Detailed spacing, hover states, focus rings.

Merge rule: Stitch owns layout composition. Figma owns component polish. When they conflict, Figma wins.

Export Stitch screen PNGs to designs/member/ and designs/admin/. These become the reference during build - never delete them.

### 2.2 Create the Stitch to Route Map

Document the mapping before writing any code:

  3ef10a2b -> src/app/(auth)/login/page.tsx
  02d24ce8 -> src/app/member/dashboard/page.tsx
  c2e6611c -> src/app/admin/dashboard/page.tsx
  3b3bc946 -> src/app/admin/kanban/[eventId]/page.tsx

### 2.3 Write eventsync-specs/00-design-system.md

Before building any screen, document your design system as a spec file. Include:
- All CSS variable names and their values
- Typography rules (when to use display font vs body)
- Utility classes (.card-shadow, .es-input, etc.)
- Layout rules (no left sidebar, max content width, grid columns)
- Mobile-specific rules (bottom tab bar, full-screen modals, 44px tap targets)
- Responsive breakpoints (390px mobile / 768px tablet / 1440px desktop)

---

## Phase 3 - Feature Spec System

### 3.1 Create One Spec per Feature

Number them in build order in eventsync-specs/:

  00-design-system.md      always first
  00-prompt-templates.md   reusable Claude prompts
  01-login.md
  02-member-dashboard.md
  03-member-kanban.md
  ...
  16-supabase-and-auth.md  always last

Each spec must include:
- Stitch Screen IDs
- User Stories
- tRPC Procedures Required (with caching strategy)
- Database Tables Touched
- RLS Policies Required
- Component Checklist (tick off during build)

---

## Phase 4 - Data Layer Architecture

This is the most critical phase. Getting these layers confused causes auth bugs that are hard to trace and easy to miss in manual testing.

### 4.1 The Three-Layer Auth Model

You have three auth/permission layers. Each owns a different concern.
NEVER let one substitute for the other.

  Layer 1 - Supabase RLS (Row-Level Security)
    OWNS: Data ownership - which rows a user can see or change
    QUESTION: Does this user own this row?
    Example: member can SELECT tasks where task_assignments.member_id = auth.uid()
    NEVER USE FOR: Can an admin create a task? - that is a role capability question

  Layer 2 - tRPC Procedure Guards
    OWNS: Role capabilities - what a role is allowed to do
    QUESTION: Is this user allowed to perform X?
    Example: adminProcedure checks ctx.user.role === admin before allowing moveTask
    NEVER USE FOR: Replacing RLS - always assume the DB also enforces independently

  Layer 3 - Next.js Middleware / Route Protection
    OWNS: Page access - which routes require authentication at all
    QUESTION: Is this user logged in?
    Example: middleware.ts redirects unauthenticated requests from /admin/* to /login

The rule: A check in one layer should never be the only check. Admin mutations need BOTH a tRPC role guard AND an RLS policy. If tRPC is bypassed (direct DB call, seed script, migration), RLS still protects.

Concrete example of the confusion to avoid:

  WRONG - Using RLS to block by role instead of ownership:
    CREATE POLICY only_admins_can_insert ON tasks
      FOR INSERT USING (
        (SELECT role FROM profiles WHERE id = auth.uid()) = admin
      );
    Problem: RLS is doing role logic. Two places to update when roles change.

  CORRECT - RLS owns the row relationship:
    CREATE POLICY admins_insert_own_events ON tasks
      FOR INSERT WITH CHECK (
        EXISTS (
          SELECT 1 FROM events
          WHERE events.id = tasks.event_id
            AND events.admin_id = auth.uid()
        )
      );
    Can this admin insert into THIS event? is a row ownership question.
    Whether an admin CAN create tasks at all is enforced in adminProcedure.

### 4.2 tRPC Procedure Types

Define once in src/server/api/trpc.ts. Never check roles inside a resolver - the procedure type IS the role check.

  protectedProcedure  any authenticated user
  adminProcedure      must have admin role
  memberProcedure     must have member role (not admin)

### 4.3 tRPC vs Server Actions Decision Matrix

| Scenario | Use | Why |
|---|---|---|
| Complex read query with joins/filters/pagination | tRPC | TanStack Query cache, stale time, prefetch |
| Read query needing parallel batching | tRPC | Automatic request batching built in |
| Read shared across multiple pages | tRPC | Single cache key, reused across routes |
| Simple create/update/delete tied to a form | Server Action | Colocated, less boilerplate, no cache needed |
| Mutation needing optimistic UI | tRPC | useMutation + onMutate is purpose-built for this |
| Realtime data - row change subscriptions | Supabase Realtime direct | Never route through tRPC |
| Bulk admin operations | tRPC | Role guard + detailed return type |

### 4.4 tRPC - Complex Read with Caching

Router (src/server/api/routers/kanban.ts):

  getBoard: protectedProcedure
    .input(z.object({ eventId: z.string().uuid() }))
    .query(async ({ ctx, input }) => {
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

Client - cache stays fresh for 30s, prefetch on hover:

  const { data } = api.kanban.getBoard.useQuery({ eventId }, { staleTime: 30_000 })

  const utils = api.useUtils()
  onMouseEnter={() => utils.kanban.getBoard.prefetch({ eventId })}

### 4.5 Server Actions - Simple Mutations

  // src/app/member/kanban/_actions.ts
  'use server'
  export async function submitTaskForReview(taskId, reflection) {
    const supabase = await createServerClient()
    const { error } = await supabase
      .from('task_reflections')
      .insert({ task_id: taskId, content: reflection })
    if (error) throw new Error(error.message)
    revalidatePath('/member/kanban')
  }

No tRPC overhead for a form submission that writes one row. revalidatePath refreshes the server-rendered page.

### 4.6 Supabase Realtime - Never Route Through tRPC

Realtime is a persistent WebSocket. tRPC is request-response. Mixing them adds latency and breaks the subscription lifecycle.

Pattern: subscribe directly, invalidate the tRPC cache when a change arrives.

  // src/hooks/useKanbanRealtime.ts
  export function useKanbanRealtime(eventId) {
    const utils = api.useUtils()
    useEffect(() => {
      const channel = supabase
        .channel('kanban-' + eventId)
        .on('postgres_changes',
          { event: '*', schema: 'public', table: 'tasks', filter: 'event_id=eq.' + eventId },
          () => { void utils.kanban.getBoard.invalidate({ eventId }) }
        )
        .subscribe()
      return () => { void supabase.removeChannel(channel) }
    }, [eventId, utils])
  }

Board data lives in the tRPC cache. Realtime just tells it when to refetch.

---

## Phase 5 - Database Migrations

All schema changes go through Supabase migrations, never direct SQL in the dashboard.

Naming convention: YYYYMMDD_short_description.sql

Every migration must include:
1. The schema change (CREATE TABLE, ALTER TABLE)
2. ALTER TABLE x ENABLE ROW LEVEL SECURITY;
3. RLS policies for each role
4. Indexes for foreign keys and filtered columns

RLS policy template:

  -- Row ownership: member sees only their assigned rows
  CREATE POLICY members_read_own_assignments ON task_assignments
    FOR SELECT USING (member_id = auth.uid());

  -- Row ownership through relationship: admin sees rows for events they manage
  CREATE POLICY admins_read_event_tasks ON task_assignments
    FOR SELECT USING (
      EXISTS (
        SELECT 1 FROM events
        WHERE events.id = task_assignments.event_id
          AND events.admin_id = auth.uid()
      )
    );

---

## Phase 6 - Component Build Order

Always build member screens before admin screens. Member screens establish base components. Admin screens reuse and extend them.

  1. Design system tokens + layout shell (globals.css, layout.tsx)
  2. Auth screens (login, OTP verification)
  3. Member screens (dashboard -> kanban -> profile) simple to complex
  4. Extract shared components as duplication appears
  5. Admin screens (layer role logic on top of member components)
  6. Admin-only components (bulk actions, user management)

Component Ownership Rule: Never add an isAdmin prop to a shared component. Create a separate admin variant instead.

  src/app/_components/
    shared/
      DeadlineBadge.tsx       no role logic, used everywhere
      StatusBadge.tsx
    kanban/
      KanbanCard.tsx          member view
    admin/
      AdminTaskCard.tsx       admin variant with edit controls

Claude Code Prompt Template for each screen:

  Build [ScreenName] matching Stitch screen [ID].
  Design reference: designs/[role]/[filename].png
  Spec: eventsync-specs/[N]-[feature].md
  Design system: eventsync-specs/00-design-system.md
  Use exact CSS variables from globals.css. No raw Tailwind color values.
  Typography: Playfair Display for headings, DM Sans for body.
  Background: var(--color-background). Cards: var(--color-surface).
  Data: wire [procedureName] using api.[router].[procedure].useQuery()
  Auth: use [memberProcedure/adminProcedure] in the router.
  Mobile: bottom tab navigation, full-screen drawers (Vaul), 44px tap targets. No left sidebar.

---

## Phase 7 - Testing Strategy

TDD means write the test before the implementation. Use it selectively.

| Code Type | Approach | Reason |
|---|---|---|
| tRPC router procedure | TDD | Defines auth rules and return shape before implementation |
| Zod validation schema | TDD | Edge cases easier to spec in tests |
| Utility functions | TDD | Pure logic, trivial to test in isolation |
| UI components | Design-first, test after | Need to see it before you can test it |
| Realtime subscriptions | Manual + E2E | Too coupled to network timing for unit tests |

TDD example for a tRPC procedure - write this first, watch it fail, then write the router:

  describe('kanban.moveTask', () => {
    it('throws FORBIDDEN when called by a member', async () => {
      const ctx = createMockContext({ role: 'member' })
      await expect(
        kanbanRouter.createCaller(ctx).moveTask({ taskId: 't1', status: 'done' })
      ).rejects.toThrow('FORBIDDEN')
    })
    it('succeeds for admin of that event', async () => {
      const ctx = createMockContext({ role: 'admin' })
      const result = await kanbanRouter.createCaller(ctx).moveTask({ taskId: 't1', status: 'done' })
      expect(result.status).toBe('done')
    })
  })

Three Test Levels:

  Unit (Vitest)         Zod schemas, utilities, pure functions. Run: npm test
  Integration (Vitest)  tRPC routers against real Supabase test DB. Run: dotenv-cli -e .env.test vitest run
  E2E (Playwright)      Full user flows. Write after feature is stable. Run: npm run e2e

---

## Phase 8 - Performance Patterns

Optimistic Updates:

  const moveTask = api.kanban.moveTask.useMutation({
    onMutate: async ({ taskId, newStatus }) => {
      await utils.kanban.getBoard.cancel({ eventId })
      const prev = utils.kanban.getBoard.getData({ eventId })
      utils.kanban.getBoard.setData({ eventId }, (old) => ({
        ...old,
        tasks: old.tasks.map(t => t.id === taskId ? { ...t, status: newStatus } : t),
      }))
      return { prev }
    },
    onError: (_, __, ctx) => {
      if (ctx?.prev) utils.kanban.getBoard.setData({ eventId }, ctx.prev)
    },
    onSettled: () => { void utils.kanban.getBoard.invalidate({ eventId }) },
  })

Parallel Queries in Routers:

  // BAD - 3 round trips in series
  const columns = await ctx.db.from('columns').select()
  const tasks   = await ctx.db.from('tasks').select()

  // GOOD - effectively 1 round trip
  const [columns, tasks] = await Promise.all([
    ctx.db.from('columns').select(),
    ctx.db.from('tasks').select(),
  ])

---

## Phase 9 - Environment and Secrets

  NEXT_PUBLIC_SUPABASE_URL=        safe to expose in browser
  NEXT_PUBLIC_SUPABASE_ANON_KEY=   safe to expose in browser
  SUPABASE_SERVICE_ROLE_KEY=       SERVER ONLY - never prefix with NEXT_PUBLIC_
  DATABASE_URL=                    SERVER ONLY

Use .env not .env.local - Supabase SSR reads process.env directly.
SUPABASE_SERVICE_ROLE_KEY bypasses all RLS. If it appears in a client bundle or git history, rotate it immediately.

---

## Phase 10 - Pre-Commit Checklist

- npm run build passes with no type errors
- npm test passes
- No console.log in production code
- No hardcoded UUIDs, secrets, or credentials
- RLS policy exists for every new table (SELECT, INSERT, UPDATE, DELETE)
- tRPC procedure uses correct procedure type (adminProcedure, memberProcedure, or protectedProcedure)
- New server actions are in _actions.ts files, not mixed into components
- Mobile layout tested at 390px width
- Loading and error states implemented for every async data fetch

---

## Anti-Patterns Reference

| Anti-pattern | Problem | Correct approach |
|---|---|---|
| Role check inside RLS instead of ownership | Two places to update when roles change | RLS = row ownership. tRPC = role capabilities. Never swap. |
| Only tRPC role guard, no RLS | Direct DB calls bypass tRPC | Both layers must independently enforce their concern |
| Routing Supabase Realtime through tRPC | tRPC is req/res, not persistent WebSocket | Subscribe directly; invalidate tRPC cache on change |
| Server Actions for complex read queries | No caching, no batching | tRPC for reads, Server Actions for simple mutations |
| isAdmin prop on shared components | Leaks role logic into presentation | Separate admin variant component |
| PRD or spec files at repo root | Pollutes root, committed by accident | All docs in docs/, all specs in eventsync-specs/ |
| E2E tests during active UI development | Tests break every design iteration | Write E2E after the feature is stable |
| Awaiting independent DB queries in series | 3x the latency for no reason | Promise.all for all independent queries |

---

## File Structure Reference

  project-root/
    docs/                    all markdown docs (PRDs, guides)
    eventsync-specs/         feature specs / mini-PRDs
    designs/
      member/                Stitch/Figma exports for member screens
      admin/                 Stitch/Figma exports for admin screens
    supabase/
      migrations/            numbered migration files
    src/
      app/
        (auth)/              login, signup, OTP
        admin/               admin-only routes
        member/              member-only routes
        _components/         all shared components
          admin/
          kanban/
          shared/
          dashboard/
      server/
        api/
          routers/           one file per domain
          trpc.ts            procedure type definitions
      styles/
        globals.css          all CSS custom properties
      lib/
        supabase/
          client.ts          browser client
          server.ts          server client (SSR)
          admin.ts           service role client (seeds only)
