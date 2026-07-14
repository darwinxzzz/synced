# API / Interfaces

## What Interfaces Exist
Synced uses two API patterns:

### tRPC (Primary API)
End-to-end type-safe API via tRPC v11. Client components call procedures through the app tRPC client, which reaches the Next.js route handler at `/api/trpc`. The HTTP handler is implemented in `src/app/api/trpc/[trpc]/route.ts` and accepts both `GET` and `POST` requests through `fetchRequestHandler`.

All data operations are composed in `src/server/api/root.ts`:

| Router | Procedures | Access | Description |
|--------|-----------|--------|-------------|
| auth | `getUser`, `getProfile`, `signOut` | public/protected | Current user/profile lookup and authenticated sign-out |
| attendance | `getKPIs`, `getMembers`, `getAllActiveMembers`, `getMemberProfile`, `addMember`, `getEventParticipation`, `getEventMembers`, `getAttendanceByEvent`, `getWeeklyMeetings`, `recordAttendance`, `getByWeek`, `getByEvent`, `upsertAttendance` | admin | Admin attendance registry, member invitation, event participation, and weekly meeting tracking |
| contributions | `list`, `listAll`, `create`, `update` | protected; `listAll` performs an admin role check | Member contribution records and admin contribution listing |
| dashboard | `getMemberKPIs`, `getPendingMilestones`, `getUpcomingMeeting`, `getMyProfile`, `getReflectionStreak`, `getAdminDashboard` | protected/admin | Member dashboard data and admin dashboard metrics |
| events | `list`, `getById`, `create`, `updateStatus` | protected; event creation relies on DB-side admin enforcement | Event listing, details, creation, and status updates |
| kanban | `getMyEvents`, `getMemberKanban`, `checkContributionExists`, `moveTask`, `updateOwnContribution`, `getPendingReflectionCount`, `getDepartments`, `getMyTasks`, `updateTaskStatus`, `getAdminBirdsEye`, `moveEvent`, `getOpenBoard`, `adminMoveTask`, `adminSaveContribution`, `adminCreateTask`, `adminUpdateTask`, `getAdminMembers` | protected/admin | Member task boards, pillar transitions, admin board views, and task assignment |
| newsletter | `subscribe` | public | Public newsletter subscription placeholder |
| reflections | `getMyReflections`, `submitReflection`, `saveDraft`, `adminUpdateReflection` | protected/admin | Member reflection drafts/submissions and admin edits |
| testimonials | `getMemberTestimonial`, `requestTestimonial`, `getTestimonialRequests`, `getAdminTestimonialsOverview`, `updateTestimonial`, `finaliseTestimonial` | protected/admin | Testimonial request, overview, update, and finalisation workflow |

### REST Endpoints
| Endpoint | Method | Purpose |
|----------|--------|---------|
| `/api/auth/departments` | GET | Public department listing for signup forms. Returns `{ departments: string[] }` and intentionally avoids service-role access. |
| `/auth/callback` | GET | Supabase OAuth callback. Exchanges `code` for a session, verifies the user's profile/status, then redirects admins to `/admin/dashboard` and members to `/member/dashboard`. |

## Authentication and Authorization
- **Public**: No auth required. Examples: `auth.getUser`, `newsletter.subscribe`, `/api/auth/departments`.
- **Protected**: Valid session and an allowed active profile required. Enforced by `protectedProcedure` in `src/server/api/trpc.ts`.
- **Admin**: Valid session plus `admin` role required. Enforced by `adminProcedure` in `src/server/api/trpc.ts`.
- Access decisions are centralized in `src/lib/auth/access.ts` via `getAuthState` and `evaluateAccess`, and are reused by tRPC context/procedure middleware.
- tRPC context (`createTRPCContext`) creates a server Supabase client and exposes `supabase`, `user`, `profile`, and request headers to procedures.
- Some database operations also rely on Supabase RLS or RPC-level checks, for example `events.create` calls the `create_event` DB function.

## Errors
- tRPC procedures throw `TRPCError` for typed failures such as `UNAUTHORIZED`, `FORBIDDEN`, `NOT_FOUND`, `BAD_REQUEST`, and `INTERNAL_SERVER_ERROR`.
- Zod input validation errors are formatted by the tRPC `errorFormatter` and exposed as `shape.data.zodError`.
- The tRPC HTTP handler logs procedure errors in development only.
- REST auth callback failures redirect to `/login` with an error query parameter such as `auth_failed`, `not_registered`, `pending_approval`, or `access_rejected`.
- `/api/auth/departments` is fail-soft: database errors or unexpected exceptions return `{ departments: [] }` with HTTP 200.

## Examples
Calling a tRPC procedure from a client component:

```tsx
"use client";

import { api } from "~/trpc/react";

export function MyProfileCard() {
  const { data: profile, isLoading, error } = api.auth.getProfile.useQuery();

  if (isLoading) return <p>Loading...</p>;
  if (error) return <p>Unable to load profile.</p>;

  return <p>Welcome, {profile?.name ?? "member"}.</p>;
}
```

Calling a mutation:

```tsx
const utils = api.useUtils();
const updateTask = api.kanban.updateOwnContribution.useMutation({
  onSuccess: async () => {
    await utils.kanban.getMemberKanban.invalidate();
  },
});

updateTask.mutate({
  contributionId,
  description: "Updated contribution notes",
});
```

## Reference Index
- [tRPC Routers](./trpc-routers.md)
- [REST Endpoints](./rest-endpoints.md)
