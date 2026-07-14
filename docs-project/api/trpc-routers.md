# tRPC Routers

This document details each tRPC router, its procedures, access levels, and key behaviors.

## Transport and Context

- Root router: `src/server/api/root.ts`
- HTTP handler: `src/app/api/trpc/[trpc]/route.ts`
- Endpoint: `/api/trpc`
- Methods: `GET`, `POST`
- Transformer: `superjson`
- Context: `createTRPCContext` creates a server Supabase client and resolves `user` and `profile` with `getAuthState`.

## Request Flow

┌──────────────┐     GET/POST      ┌────────────────────────────┐
│   Browser /  │ ──── /api/trpc ──▶│    Next.js Route Handler   │
│   Component  │                   │  [trpc]/route.ts           │
└──────┬───────┘                   │  fetchRequestHandler       │
       │                           └─────────────┬──────────────┘
       │ ◄──────── JSON Response ────────────────┘
       │
       ▼
┌─────────────────────────────────────────────────────────────────┐
│                    tRPC Server Context                          │
│  ┌───────────────────────────────────────────────────────────┐  │
│  │ createTRPCContext()                                        │  │
│  │  • Creates Supabase server client                         │  │
│  │  • Resolves user + profile via getAuthState()             │  │
│  │  • Exposes supabase, user, profile, headers to procedures │  │
│  └───────────────────────────────────────────────────────────┘  │
└─────────────────────────────┬───────────────────────────────────┘
                              │
                              ▼
┌─────────────────────────────────────────────────────────────────┐
│                    Procedure Gate Check                         │
│  ┌──────────────┐  ┌──────────────┐  ┌──────────────────────┐  │
│  │  publicProc  │  │ protectedProc│  │   adminProcedure     │  │
│  │  No auth     │  │ evaluateAccess│  │ evaluateAccess(     │  │
│  │  required    │  │ (any active  │  │   requireRole:      │  │
│  │              │  │  profile)    │  │   "admin")          │  │
│  └──────┬───────┘  └──────┬───────┘  └──────────┬───────────┘  │
│         │                │                      │              │
└─────────┼────────────────┼──────────────────────┼──────────────┘
          │                │                      │
          ▼                ▼                      ▼
┌─────────────────────────────────────────────────────────────────┐
│                    Feature Router Dispatch                      │
│  ┌───┬───┬───┬───┬───┬───┬───┬───┬───┐                        │
│  │a  │at │c  │d  │e  │k  │n  │r  │t  │                        │
│  │uth│tnd│ont│ash│vnt│anb│ews│efl│est│                        │
│  │   │   │rib│   │s  │an │   │ect│imo│                        │
│  │   │   │   │   │   │   │   │ns │nia│                        │
│  └───┴───┴───┴───┴───┴───┴───┴───┴───┘                        │
└──────────────────────────┬──────────────────────────────────────┘
                           │
                           ▼
              ┌────────────────────────┐
              │  Zod Input Validation  │
              └───────────┬────────────┘
                          │ (validated input)
                          ▼
              ┌────────────────────────┐
              │  Procedure Execution   │
              │  (router logic /       │
              │   service calls)       │
              └───────────┬────────────┘
                          │
                          ▼
              ┌────────────────────────┐
              │  Supabase / Database   │
              │  (via server client)   │
              └────────────────────────┘

## Procedure Gates

┌─────────────────────────────────────────────────────────────────┐
│                    REQUEST ENTRY POINT                          │
│  ┌──────────────────────────────────────────────────────────┐   │
│  │               createTRPCContext()                        │   │
│  │    Creates Supabase client + resolves user/profile       │   │
│  └──────────────────────┬───────────────────────────────────┘   │
│                         │                                       │
│                         ▼                                       │
│          ┌─────────────────────────────┐                        │
│          │  Which procedure type?     │                         │
│          └──────────┬──────────┬──────┘                         │
│                     │          │    │                            │
│            ┌────────┘    ┌─────┘    └────────┐                   │
│            ▼             ▼                    ▼                   │
│  ┌─────────────────┐ ┌─────────────────┐ ┌─────────────────┐    │
│  │  publicProcedure│ │protectedProcedure│ │ adminProcedure  │    │
│  ├─────────────────┤ ├─────────────────┤ ├─────────────────┤    │
│  │ • No auth check │ │ • Calls         │ │ • Calls         │    │
│  │ • Timing        │ │   evaluateAccess│ │   evaluateAccess│    │
│  │   middleware    │ │   (ctx.profile) │ │   (ctx.profile, │    │
│  │   only          │ │ • Fails if:     │ │   {requireRole: │    │
│  │                 │ │   UNAUTHORIZED  │ │    "admin"})    │    │
│  │                 │ │   FORBIDDEN     │ │ • Fails if not  │    │
│  │                 │ │                 │ │   admin role    │    │
│  └─────────────────┘ └─────────────────┘ └─────────────────┘    │

## Router Composition

`appRouter` exposes these namespaces:

```ts
auth, attendance, contributions, dashboard, events, kanban, newsletter, reflections, testimonials
```

## `auth`

Source: `src/server/api/routers/auth.ts`

| Procedure | Type | Access | Summary |
|-----------|------|--------|---------|
| `getUser` | query | public | Returns `ctx.user` or `null`. |
| `getProfile` | query | protected | Fetches the current user's full `profiles` row. Returns `null` if Supabase returns an error. |
| `signOut` | mutation | protected | Calls `ctx.supabase.auth.signOut()` and returns `{ success: true }`. |

## `attendance`

Source: `src/server/api/routers/attendance.ts`

All procedures are admin-gated.

| Procedure | Type | Access | Summary |
|-----------|------|--------|---------|
| `getKPIs` | query | admin | Computes total past events, average attendance, highest rate, and lowest rate. |
| `getMembers` | query | admin | Paged member/profile list with search, department, and status filters plus attendance percentage. |
| `getAllActiveMembers` | query | admin | Lists active profiles for assignment dropdowns. |
| `getMemberProfile` | query | admin | Gets one member profile and recent attendance history. |
| `addMember` | mutation | admin | Invites a user by email with the Supabase admin client and upserts an active profile. |
| `getEventParticipation` | query | admin | Lists past/archived event participation status with pagination. |
| `getEventMembers` | query | admin | Lists members assigned to an event. |
| `getAttendanceByEvent` | query | admin | Retrieves recorded attendance rows for an event. |
| `getWeeklyMeetings` | query | admin | Paged weekly meeting attendance registry. |
| `recordAttendance` | mutation | admin | Batch-inserts event or weekly meeting attendance records. |
| `getByWeek` | query | admin | Legacy weekly meeting lookup by week number. |
| `getByEvent` | query | admin | Legacy event attendance lookup by event ID. |
| `upsertAttendance` | mutation | admin | Legacy insert for a single attendance row. Despite the name, it currently performs `insert`. |

## `contributions`

Source: `src/server/api/routers/contributions.ts`

| Procedure | Type | Access | Summary |
|-----------|------|--------|---------|
| `list` | query | protected | Lists contributions owned by the current user, ordered by `submitted_at` descending. |
| `listAll` | query | protected + manual admin check | Checks the caller's profile role and lists all contributions with profile name/department for admins. |
| `create` | mutation | protected | Creates a contribution for the current user. |
| `update` | mutation | protected | Updates a contribution owned by the current user. |

## `dashboard`

Source: `src/server/api/routers/dashboard.ts`

| Procedure | Type | Access | Summary |
|-----------|------|--------|---------|
| `getMemberKPIs` | query | protected | Calls member KPI RPCs for remaining tasks, completion rate, next deadline, and team sync count. |
| `getPendingMilestones` | query | protected | Lists current user's event member tasks that are not done. |
| `getUpcomingMeeting` | query | protected | Returns the next active event with members, or `null` when none exists. |
| `getMyProfile` | query | protected | Returns normalized profile fields for the current user. |
| `getReflectionStreak` | query | protected | Counts the current user's reflections and returns count/percentage. |
| `getAdminDashboard` | query | admin | Returns admin KPIs, ongoing initiatives, and pending submissions. |

## `events`

Source: `src/server/api/routers/events.ts`

| Procedure | Type | Access | Summary |
|-----------|------|--------|---------|
| `list` | query | protected | Lists all events ordered by date ascending. |
| `getById` | query | protected | Gets one event plus assigned members/profiles. |
| `create` | mutation | protected + DB-side admin enforcement | Calls the `create_event` RPC with event fields and assigned member IDs. |
| `updateStatus` | mutation | protected | Updates an event's `status` to `draft`, `active`, or `archived`. |

## `kanban`

Source: `src/server/api/routers/kanban.ts`

| Procedure | Type | Access | Summary |
|-----------|------|--------|---------|
| `getMyEvents` | query | protected | Lists non-archived events assigned to the current user. |
| `getMemberKanban` | query | protected | Returns task cards for the current user in one event, including linked contribution details. |
| `checkContributionExists` | query | protected | Checks whether the current user already has a contribution for an event. |
| `moveTask` | mutation | protected | Moves the current user's task forward through allowed member transitions (`new` → `in_progress` → `in_review`). |
| `updateOwnContribution` | mutation | protected | Updates fields on the current user's contribution. |
| `getPendingReflectionCount` | query | protected | Counts pending reflections for the current user. |
| `getDepartments` | query | protected | Returns distinct non-null departments from profiles. |
| `getMyTasks` | query | protected | Legacy task list for the current user, optionally filtered by event. |
| `updateTaskStatus` | mutation | protected | Legacy current-user task status update with the same forward-only transition rules. |
| `getAdminBirdsEye` | query | admin | Lists events with global pillar counts, sample member profiles, and deadline tags. |
| `moveEvent` | mutation | admin | Updates an event's `kanban_status`. |
| `getOpenBoard` | query | admin | Returns one event and all tasks/contributions for the admin board view. |
| `adminMoveTask` | mutation | admin | Moves any task to any pillar status. |
| `adminSaveContribution` | mutation | admin | Updates contribution details from the admin task drawer. |
| `adminCreateTask` | mutation | admin | Creates or updates an event member task assignment. |
| `adminUpdateTask` | mutation | admin | Edits an existing event member task assignment. |
| `getAdminMembers` | query | admin | Searches active profiles for task assignment. |

## `newsletter`

Source: `src/server/api/routers/newsletter.ts`

| Procedure | Type | Access | Summary |
|-----------|------|--------|---------|
| `subscribe` | mutation | public | Validates an email and returns `{ success: true, email }`. Email-provider integration is still TODO. |

## `reflections`

Source: `src/server/api/routers/reflections.ts`

| Procedure | Type | Access | Summary |
|-----------|------|--------|---------|
| `getMyReflections` | query | protected | Lists the current user's reflections with linked contribution metadata. |
| `submitReflection` | mutation | protected | Updates a reflection owned by the user, marks it `archived`, and sets `submitted_at`. |
| `saveDraft` | mutation | protected | Updates optional draft fields on a pending reflection owned by the user. |
| `adminUpdateReflection` | mutation | admin | Allows admins to update selected reflection fields. |

## `testimonials`

Source: `src/server/api/routers/testimonials.ts`

| Procedure | Type | Access | Summary |
|-----------|------|--------|---------|
| `getMemberTestimonial` | query | protected | Returns profile, contribution history, metrics, testimonial endorsement, and request status for a member. Non-admins may only fetch themselves. |
| `requestTestimonial` | mutation | protected | Creates/updates the current user's testimonial request through the testimonial service. |
| `getTestimonialRequests` | query | admin | Lists testimonial requests with profile summary data. |
| `getAdminTestimonialsOverview` | query | admin | Returns testimonial KPIs, departments/statuses, and member cards with request state and contribution metrics. |
| `updateTestimonial` | mutation | admin | Updates testimonial content using `updateTestimonialInput`. |
| `finaliseTestimonial` | mutation | admin | Finalises a testimonial using `finaliseTestimonialInput` and the admin user ID. |

## Validation and Error Notes

- Procedure inputs are validated with Zod in router files and service schemas.
- tRPC formats Zod failures into `data.zodError`.
- Most Supabase failures are mapped to `TRPCError` with `INTERNAL_SERVER_ERROR`; not-found and permission cases use specific codes where implemented.
- The tRPC timing middleware adds artificial latency and logs execution time only in development.
