# EventSync Supabase Reference

Last updated: 2026-04-08
Linked project: `EventSync` (`dmacjuynegqnqxzrrsdm`)
Source files:
- `supabase/.temp/linked-project.json`
- `src/types/supabase.ts` (generated from linked remote project)
- `supabase/migrations/20260408075844_remote_schema.sql` (full pulled schema, including RLS policies)

## Current connection status

- Supabase CLI is installed locally (`supabase` `2.87.2`) via `pnpm`.
- Project link is configured and active.
- Migration history reconciled:
  - `20260407112814` repaired as `reverted`
  - `20260408073908` repaired as `applied`
- Remote schema pull succeeded and produced:
  - `supabase/migrations/20260408075844_remote_schema.sql`

## Database model overview (public schema)

### Tables

- `profiles`
  - Core member profile table keyed by `id`.
  - Referenced by most domain tables.
- `events`
  - Event entity (`name`, `date`, `times`, `status`, `kanban_status`, recurrence flag).
  - `created_by` references `profiles.id`.
- `event_members`
  - Membership/assignment join table for users in events.
  - References `events.id` and `profiles.id`.
- `attendance`
  - Attendance records by `user_id`, `event_id`, `date`, `status`, and `type`.
  - References `events.id` and `profiles.id`.
- `contributions`
  - Task/contribution submissions linked to members and optionally events.
  - References `events.id` and `profiles.id`.
- `reflections`
  - Reflection records linked to a `contribution_id` and `user_id`.
  - References `contributions.id` and `profiles.id`.
- `testimonial_requests`
  - One-request-per-user pattern (`user_id` is one-to-one with `profiles.id`).
- `testimonials`
  - Generated/finalized testimonial output with structured `content_json`.
  - References `profiles.id` for both `user_id` and `generated_by`.

### Enums

- `department`: `Software`, `Meet-ups`, `Inspire`, `Publicity`, `Connectors`, `Labs`
- `priority`: `high`, `medium`, `low`
- `roles`: `admin`, `lead`, `member`
- `status`: `attended`, `excused`, `absent`

### RPC functions in `public`

- Event mutation:
  - `create_event(...)`
- Admin KPIs:
  - `get_admin_kpi_active_events()`
  - `get_admin_kpi_completion_rate()`
  - `get_admin_kpi_tasks_due()`
  - `get_admin_kpi_total_members()`
  - `get_admin_pending_submissions()`
- Member KPIs:
  - `get_member_kpi_completion_rate()`
  - `get_member_kpi_next_deadline()`
  - `get_member_kpi_remaining_tasks()`
  - `get_member_kpi_team_sync_count()`
  - `get_member_pending_milestones()`

## RLS and policies

RLS is enabled on all core tables:
- `attendance`
- `contributions`
- `event_members`
- `events`
- `profiles`
- `reflections`
- `testimonial_requests`
- `testimonials`

Policy inventory (26 total):

### attendance

- `Admins manage all attendance` (`FOR ALL`) checks JWT role = `admin`.
- `Members read own attendance` (`FOR SELECT`) where `auth.uid() = user_id`.

### contributions

- `Admins read all contributions` (`FOR SELECT`) checks JWT role = `admin`.
- `Members insert own contributions` (`FOR INSERT`) with `auth.uid() = user_id`.
- `Members read own contributions` (`FOR SELECT`) where `auth.uid() = user_id`.
- `admins_insert_any_contribution` (`FOR INSERT`) checks `profiles.role = 'admin'`.
- `members_update_own_contributions_until_done` (`FOR UPDATE`) allows own rows while matching `event_members` row is not `done`.

### event_members

- `Admins manage event_members` (`FOR ALL`) checks JWT role = `admin`.
- `Admins read all event_members` (`FOR SELECT`) checks JWT role = `admin`.
- `Members read own event_members` (`FOR SELECT`) where `auth.uid() = user_id`.
- `members_update_own_pillar_status` (`FOR UPDATE`) allows own row and limits `pillar_status` to `new`, `in_progress`, `in_review`.

### events

- `Admins insert events` (`FOR INSERT`) checks JWT role = `admin`.
- `Admins update events` (`FOR UPDATE`) checks JWT role = `admin`.
- `Authenticated users read events` (`FOR SELECT`) for authenticated role.

### profiles

- `Members update own profile` (`FOR UPDATE`) allows own row and preserves current role via `WITH CHECK`.
- `Profiles: owner or admin can select` (`FOR SELECT`) allows owner or JWT role = `admin`.

### reflections

- `Admins read all reflections` (`FOR SELECT`) checks JWT role = `admin`.
- `Members read own reflections` (`FOR SELECT`) where `auth.uid() = user_id`.
- `Members write own reflections` (`FOR ALL`) where `auth.uid() = user_id`.
- `admins_update_all_reflections` (`FOR UPDATE`) checks `profiles.role = 'admin'`.
- `members_update_own_reflections_until_archived` (`FOR UPDATE`) allows own rows only when `status = 'pending'`.

### testimonial_requests

- `Admins manage all requests` (`FOR ALL`) checks JWT role = `admin`.
- `Members insert own request` (`FOR INSERT`) with `auth.uid() = user_id`.
- `Members read own request` (`FOR SELECT`) where `auth.uid() = user_id`.

### testimonials

- `Admins manage all testimonials` (`FOR ALL`) checks JWT role = `admin`.
- `Members read own testimonial` (`FOR SELECT`) where `auth.uid() = user_id`.
- `admins_update_all_testimonials` (`FOR UPDATE`) checks `profiles.role = 'admin'`.

Security implementation notes:
- Admin detection is mixed: some policies use JWT `user_metadata.role`, others use `public.profiles.role`.
- `Members write own reflections` is `FOR ALL`, which includes delete as well as insert/update/select.
- Admin rules are generally permissive and broad (`FOR ALL`) on attendance, event_members, testimonial_requests, testimonials.

## How to refresh this reference

1. Confirm link:
```powershell
pnpm.cmd exec supabase link --project-ref dmacjuynegqnqxzrrsdm
```
2. Regenerate types:
```powershell
pnpm.cmd exec supabase gen types typescript --linked | Set-Content -Path src/types/supabase.ts
```
3. Pull schema SQL (Docker required):
```powershell
pnpm.cmd exec supabase db pull
```
4. Review latest file under `supabase/migrations/*_remote_schema.sql` and update this markdown.
