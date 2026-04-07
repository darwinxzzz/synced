# EventSync — Supabase Schema + Auth + Middleware
> Feed this file when building tRPC routers, middleware, or anything that touches the DB.

---

## Environment Variables
**File:** `.env` (NOT `.env.local`)
```
NEXT_PUBLIC_SUPABASE_URL=
NEXT_PUBLIC_SUPABASE_ANON_KEY=
SUPABASE_SERVICE_ROLE_KEY=    ← server-side ONLY — NEVER prefix with NEXT_PUBLIC_
```

---

## Database Tables

```sql
-- User profiles (extends Supabase auth.users)
profiles (
  id          uuid PRIMARY KEY REFERENCES auth.users,
  name        text NOT NULL,
  email       text NOT NULL UNIQUE,
  avatar_url  text,
  role        text NOT NULL DEFAULT 'member'
              CHECK (role IN ('member', 'admin', 'lead')),
  department  text,  -- 'Software'|'Inspire'|'Meet-ups'|'Publicity'|'Connectors'|'Labs'
  joined_date date DEFAULT current_date,
  status      text NOT NULL DEFAULT 'active' CHECK (status IN ('active', 'inactive')),
  created_at  timestamptz DEFAULT now(),
  updated_at  timestamptz DEFAULT now()
)

-- Events
events (
  id             uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  name           text NOT NULL,
  description    text,
  date           date,
  start_time     time,
  end_time       time,
  cover_url      text,
  created_by     uuid NOT NULL REFERENCES profiles(id) ON DELETE RESTRICT,
  status         text NOT NULL DEFAULT 'draft'
                 CHECK (status IN ('draft', 'active', 'archived')),
  kanban_status  text NOT NULL DEFAULT 'new'
                 CHECK (kanban_status IN ('new', 'in_progress', 'in_review', 'done')),
  is_recurring   boolean DEFAULT false,
  created_at     timestamptz DEFAULT now(),
  updated_at     timestamptz DEFAULT now()
)
-- status        = operational state: draft | active | archived
-- kanban_status = Admin Kanban pillar position: new | in_progress | in_review | done
-- These are INDEPENDENT — an event can be 'active' AND 'in_review' simultaneously

-- Event membership + task assignment
event_members (
  id            uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  event_id      uuid NOT NULL REFERENCES events(id) ON DELETE CASCADE,
  user_id       uuid NOT NULL REFERENCES profiles(id) ON DELETE CASCADE,
  department    text,
  task          text,
  role          text DEFAULT 'member' CHECK (role IN ('member', 'lead', 'admin')),
  pillar_status text NOT NULL DEFAULT 'new'
                CHECK (pillar_status IN ('new', 'in_progress', 'in_review', 'done')),
  created_at    timestamptz DEFAULT now(),
  updated_at    timestamptz DEFAULT now(),
  UNIQUE (event_id, user_id)
)
-- Member transitions enforced by trigger enforce_member_pillar_transitions():
--   member/lead: new→in_progress and in_progress→in_review ONLY
--   admin:       any pillar including done, any direction

-- Member contributions
contributions (
  id               uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id          uuid NOT NULL REFERENCES profiles(id) ON DELETE CASCADE,
  event_id         uuid REFERENCES events(id) ON DELETE SET NULL,
  department       text NOT NULL,
  task             text NOT NULL,
  description      text,          -- 30 words max (DB constraint enforced)
  outcome          text,          -- required on submit
  changes          text,          -- 30 words max — "what changed / was completed"
  challenges_faced text,          -- 30 words max — "difficulties encountered"
  priority         text NOT NULL DEFAULT 'medium'
                   CHECK (priority IN ('low', 'medium', 'high')),
  submitted_at     timestamptz DEFAULT now(),
  created_at       timestamptz DEFAULT now(),
  updated_at       timestamptz DEFAULT now()
)

-- Reflections (auto-created by trigger when member moves to In Review)
reflections (
  id                uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id           uuid NOT NULL REFERENCES profiles(id) ON DELETE CASCADE,
  contribution_id   uuid NOT NULL REFERENCES contributions(id) ON DELETE CASCADE,
  current_task      text,          -- 5 words max (DB constraint enforced)
  description       text,          -- 30 words max — "what took place"
  impact            text,          -- 30 words max — "impact on SYAI"
  challenges        text,          -- 30 words max — "challenges faced"
  personal_learning text,          -- 30 words max — "personal learning points"
  org_learning      text,          -- 30 words max — "organisational learning points"
  status            text NOT NULL DEFAULT 'pending'
                    CHECK (status IN ('pending', 'archived')),
  submitted_at      timestamptz,   -- null until member submits the reflection form
  created_at        timestamptz DEFAULT now(),
  updated_at        timestamptz DEFAULT now()
)

-- Attendance records
attendance (
  id           uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id      uuid NOT NULL REFERENCES profiles(id) ON DELETE CASCADE,
  event_id     uuid REFERENCES events(id) ON DELETE SET NULL,
  meeting_week integer,           -- ISO week number, used when type = 'weekly_meeting'
  type         text NOT NULL CHECK (type IN ('event', 'weekly_meeting')),
  status       text NOT NULL CHECK (status IN ('attended', 'absent', 'excused')),
  notes        text,
  date         date NOT NULL,
  created_at   timestamptz DEFAULT now(),
  updated_at   timestamptz DEFAULT now()
)

-- Testimonial requests (member requests admin to generate)
testimonial_requests (
  id           uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id      uuid NOT NULL REFERENCES profiles(id) ON DELETE CASCADE,
  requested_at timestamptz DEFAULT now(),
  status       text NOT NULL DEFAULT 'pending'
               CHECK (status IN ('pending', 'generated', 'sent')),
  created_at   timestamptz DEFAULT now(),
  updated_at   timestamptz DEFAULT now(),
  UNIQUE (user_id)   -- one active request per member at a time
)

-- Generated testimonials
testimonials (
  id                uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id           uuid NOT NULL REFERENCES profiles(id) ON DELETE CASCADE,
  generated_by      uuid NOT NULL REFERENCES profiles(id) ON DELETE RESTRICT,
  content_json      jsonb,
  endorsement_quote text,
  endorsement_name  text,
  endorsement_title text,
  generated_at      timestamptz DEFAULT now(),
  finalised_at      timestamptz,   -- null until admin hits "Finalise & Send"
  created_at        timestamptz DEFAULT now(),
  updated_at        timestamptz DEFAULT now()
)
```

---

## Word Count Constraints (enforced at DB level)

```
contributions:
  description       ≤ 30 words   (contributions_description_words)
  changes           ≤ 30 words   (contributions_changes_words)
  challenges_faced  ≤ 30 words   (contributions_challenges_faced_words)

reflections:
  current_task      ≤ 5 words    (reflections_current_task_words)
  description       ≤ 30 words   (reflections_description_words)
  impact            ≤ 30 words   (reflections_impact_words)
  challenges        ≤ 30 words   (reflections_challenges_words)
  personal_learning ≤ 30 words   (reflections_personal_learning_words)
  org_learning      ≤ 30 words   (reflections_org_learning_words)
```

All NULL-safe: `CHECK (field IS NULL OR array_length(regexp_split_to_array(trim(field), '\s+'), 1) <= N)`

⚠️ Frontend MUST also enforce with live word counters — DB constraint is backup only.

---

## DB Triggers

### 1 — handle_new_user (auth.users INSERT)
- Creates `profiles` row automatically on every signup
- Always sets `role = 'member'` — never trusts OAuth metadata for role
- Admin role must be set manually via SQL after signup

### 2 — enforce_member_pillar_transitions (BEFORE UPDATE on event_members)
- Admins: skip check, any transition allowed including to `done`
- Members/leads: ONLY `new→in_progress` and `in_progress→in_review` allowed
- Any other transition raises EXCEPTION — card snaps back on frontend

### 3 — create_reflection_on_review (AFTER UPDATE on event_members)
- Fires ONLY when `pillar_status` changes `in_progress → in_review`
- Finds most recent `contributions` row for that `user_id + event_id`
- Inserts `reflections` row with `status = 'pending'`
- If no contribution exists: silently skips
- This is why frontend must require Add Contribution before allowing In Review move

---

## Row Level Security

### profiles
| Policy | Operation | Rule |
|---|---|---|
| members_select_own_profile | SELECT | `auth.uid() = id` |
| admins_select_all_profiles | SELECT | role = 'admin' |
| members_update_own_profile | UPDATE | `auth.uid() = id` |
| admins_update_all_profiles | UPDATE | role = 'admin' |
| admins_insert_profiles | INSERT | role = 'admin' |

### events
| Policy | Operation | Rule |
|---|---|---|
| members_select_own_events | SELECT | member is in event_members for this event |
| admins_select_all_events | SELECT | role = 'admin' |
| admins_insert_events | INSERT | role = 'admin' |
| admins_update_events | UPDATE | role = 'admin' (covers kanban_status drag) |
| admins_delete_events | DELETE | role = 'admin' |

### event_members
| Policy | Operation | Rule |
|---|---|---|
| members_select_own_event_members | SELECT | `auth.uid() = user_id` |
| admins_select_all_event_members | SELECT | role = 'admin' |
| members_update_own_pillar_status | UPDATE | own row, pillar_status IN ('new','in_progress','in_review') |
| admins_update_all_event_members | UPDATE | role = 'admin', any pillar |
| admins_insert_event_members | INSERT | role = 'admin' |
| admins_delete_event_members | DELETE | role = 'admin' |

### contributions
| Policy | Operation | Rule |
|---|---|---|
| members_select_own_contributions | SELECT | `auth.uid() = user_id` |
| members_insert_own_contributions | INSERT | `auth.uid() = user_id` |
| members_update_own_contributions_until_done | UPDATE | own row AND event_members.pillar_status != 'done' |
| admins_select_all_contributions | SELECT | role = 'admin' |
| admins_update_all_contributions | UPDATE | role = 'admin' — no stage gate |
| admins_insert_any_contribution | INSERT | role = 'admin' — admin adds on behalf of member |

**Member edit gate:** Members can edit their own contributions only while their task has not reached `done`.
Once admin moves the task to Done, the member's contribution is locked.

**Admin insert:** Admin can create a contribution for any member via the Admin Kanban "+ Add Contribution" dropdown.
The `user_id` on the contribution must be set to the target member — NOT `auth.uid()` (which is the admin).

### reflections
| Policy | Operation | Rule |
|---|---|---|
| members_select_own_reflections | SELECT | `auth.uid() = user_id` |
| members_insert_own_reflections | INSERT | `auth.uid() = user_id` |
| members_update_own_reflections_until_archived | UPDATE | own row AND `status = 'pending'` only |
| admins_select_all_reflections | SELECT | role = 'admin' |
| admins_update_all_reflections | UPDATE | role = 'admin' — no status gate, edit any time |

**Member edit gate:** Members can only update reflections while `status = 'pending'`.
Once submitted (`status = 'archived'`), the DB blocks member updates even if frontend allows "Edit Entry".
**Admin edit:** Admins can edit any reflection at any time regardless of status.

### attendance
| Policy | Operation | Rule |
|---|---|---|
| members_select_own_attendance | SELECT | `auth.uid() = user_id` |
| admins_select_all_attendance | SELECT | role = 'admin' |
| admins_insert_attendance | INSERT | role = 'admin' |
| admins_update_attendance | UPDATE | role = 'admin' |
| admins_delete_attendance | DELETE | role = 'admin' |

### testimonial_requests
| Policy | Operation | Rule |
|---|---|---|
| members_select_own_testimonial_request | SELECT | `auth.uid() = user_id` |
| members_insert_own_testimonial_request | INSERT | `auth.uid() = user_id` |
| admins_select_all_testimonial_requests | SELECT | role = 'admin' |
| admins_update_testimonial_requests | UPDATE | role = 'admin' |

### testimonials
| Policy | Operation | Rule |
|---|---|---|
| members_select_own_testimonial | SELECT | `auth.uid() = user_id` AND `finalised_at IS NOT NULL` |
| admins_select_all_testimonials | SELECT | role = 'admin' (sees drafts too) |
| admins_insert_testimonials | INSERT | role = 'admin' |
| admins_update_all_testimonials | UPDATE | role = 'admin' — no time gate, editable even after finalised |

**Admin edit:** Admins can update endorsement quote/name/title at any time — even after `finalised_at` is set.
Re-sending after edits pushes the updated content to the member's testimonials page.

---

## Auth: Role Storage
```typescript
// Role stored in profiles table — always read from DB server-side
// Never trust user_metadata.role alone for privilege checks

const { data: profile } = await supabase
  .from('profiles')
  .select('role')
  .eq('id', user.id)
  .single()
const role = profile?.role  // 'member' | 'admin' | 'lead'
```

---

## Middleware
**File:** `middleware.ts`

```typescript
import { createMiddlewareClient } from '@supabase/auth-helpers-nextjs'
import { NextResponse } from 'next/server'
import type { NextRequest } from 'next/server'

export async function middleware(request: NextRequest) {
  const response = NextResponse.next()
  const supabase = createMiddlewareClient({ req: request, res: response })
  const { data: { user } } = await supabase.auth.getUser()

  if (!user) return NextResponse.redirect(new URL('/login', request.url))

  const role = user.user_metadata?.role
  const path = request.nextUrl.pathname

  if (path.startsWith('/admin') && role !== 'admin') {
    return NextResponse.redirect(new URL('/member/dashboard', request.url))
  }

  return response
}

export const config = { matcher: ['/admin/:path*', '/member/:path*'] }
```

---

## tRPC Procedure Types
**File:** `src/server/api/trpc.ts`

```typescript
export const publicProcedure    = t.procedure
export const protectedProcedure = t.procedure.use(isAuthenticated)
export const adminProcedure     = t.procedure.use(isAdmin)

const isAdmin = t.middleware(({ ctx, next }) => {
  if (ctx.profile?.role !== 'admin') {
    throw new TRPCError({ code: 'FORBIDDEN' })
  }
  return next({ ctx })
})
```

---

## Supabase Realtime Channels

| Channel | Purpose | Subscribed by |
|---|---|---|
| `kanban-[eventId]` | Pillar moves within an event | Member kanban · Admin open board |
| `reflections-[userId]` | Reflection badge count updates | Member kanban reflection button |

```typescript
useEffect(() => {
  const channel = supabase.channel(`kanban-${eventId}`)
    .on('postgres_changes', { event: 'UPDATE', schema: 'public', table: 'event_members' }, handler)
    .subscribe()
  return () => { supabase.removeChannel(channel) }
}, [eventId])
```

---

## Departments (6 — always pull from DB, never hardcode)
```
Software · Inspire · Meet-ups · Publicity · Connectors · Labs
```
```sql
SELECT DISTINCT department FROM profiles WHERE department IS NOT NULL ORDER BY department
```

---

## Supabase Client Files
```
src/lib/supabase/client.ts   ← createBrowserClient() for client components
src/lib/supabase/server.ts   ← createServerClient() for server components + tRPC
```
