begin;

-- Require one active admin profile to exist.
do $$
declare
  v_admin_id uuid;
begin
  select id into v_admin_id
  from public.profiles
  where role = 'admin' and status = 'active'
  limit 1;

  if v_admin_id is null then
    raise exception 'No active admin profile found. Run auth seed first and ensure one admin is active.';
  end if;
end $$;

-- Remove previous seeded dataset (idempotent rerun).
with seeded_events as (
  select id
  from public.events
  where name like '[SEED] %'
)
delete from public.reflections r
using public.contributions c
where r.contribution_id = c.id
  and c.event_id in (select id from seeded_events);

with seeded_events as (
  select id
  from public.events
  where name like '[SEED] %'
)
delete from public.contributions
where event_id in (select id from seeded_events);

with seeded_events as (
  select id
  from public.events
  where name like '[SEED] %'
)
delete from public.attendance
where event_id in (select id from seeded_events);

with seeded_events as (
  select id
  from public.events
  where name like '[SEED] %'
)
delete from public.event_members
where event_id in (select id from seeded_events);

delete from public.events
where name like '[SEED] %';

-- Create events for admin dashboard states.
with active_admin as (
  select id
  from public.profiles
  where role = 'admin' and status = 'active'
  order by created_at asc
  limit 1
)
insert into public.events (
  name,
  description,
  date,
  start_time,
  end_time,
  cover_url,
  created_by,
  status,
  is_recurring,
  kanban_status
)
select *
from (
  select
    '[SEED] Spring Summit'::text,
    'Seeded active event for admin testing.'::text,
    current_date + interval '3 days',
    '19:00'::time,
    '21:00'::time,
    null::text,
    (select id from active_admin),
    'active'::text,
    false,
    'in_progress'::text
  union all
  select
    '[SEED] Member Onboarding Week',
    'Seeded recurring active event.',
    current_date + interval '7 days',
    '18:30'::time,
    '20:00'::time,
    null::text,
    (select id from active_admin),
    'active'::text,
    true,
    'new'::text
  union all
  select
    '[SEED] Creative Collab Night',
    'Seeded event currently in review.',
    current_date + interval '10 days',
    '19:30'::time,
    '21:30'::time,
    null::text,
    (select id from active_admin),
    'active'::text,
    false,
    'in_review'::text
  union all
  select
    '[SEED] Archived Community Showcase',
    'Seeded archived event for historical widgets.',
    current_date - interval '14 days',
    '18:00'::time,
    '20:30'::time,
    null::text,
    (select id from active_admin),
    'archived'::text,
    false,
    'done'::text
  union all
  select
    '[SEED] Draft Quarterly Planning',
    'Seeded draft event.',
    current_date + interval '21 days',
    '20:00'::time,
    '21:00'::time,
    null::text,
    (select id from active_admin),
    'draft'::text,
    false,
    'new'::text
) seed_rows;

-- Add admin as event owner member row.
insert into public.event_members (event_id, user_id, role, pillar_status, department, task)
select
  e.id,
  p.id,
  'admin',
  'new',
  coalesce(p.department, 'Software'),
  'Admin lead'
from public.events e
cross join lateral (
  select id, department
  from public.profiles
  where role = 'admin' and status = 'active'
  order by created_at asc
  limit 1
) p
where e.name like '[SEED] %'
on conflict (event_id, user_id) do nothing;

-- Add active members to events with varied pillar status.
with seeded_events as (
  select
    id,
    row_number() over (order by date asc nulls last, name asc) as event_seq
  from public.events
  where name like '[SEED] %'
),
member_pool as (
  select
    id,
    coalesce(department, 'Software') as department,
    row_number() over (order by created_at asc, id) as member_seq
  from public.profiles
  where role = 'member' and status = 'active'
  limit 16
)
insert into public.event_members (event_id, user_id, department, task, role, pillar_status)
select
  e.id,
  m.id,
  m.department,
  case (m.member_seq % 4)
    when 0 then 'SEED planning'
    when 1 then 'SEED outreach'
    when 2 then 'SEED design'
    else 'SEED logistics'
  end as task,
  'member'::text as role,
  case ((m.member_seq + e.event_seq) % 4)
    when 0 then 'new'::text
    when 1 then 'in_progress'::text
    when 2 then 'in_review'::text
    else 'done'::text
  end as pillar_status
from seeded_events e
join member_pool m
  on ((m.member_seq + e.event_seq) % 2 = 0)
on conflict (event_id, user_id) do update
set
  department = excluded.department,
  task = excluded.task,
  role = excluded.role,
  pillar_status = excluded.pillar_status,
  updated_at = now();

-- Seed contributions for most, but not all, members (for pending-submission widgets).
with seeded_members as (
  select
    em.event_id,
    em.user_id,
    em.department,
    em.task,
    row_number() over (order by em.event_id, em.user_id) as rn
  from public.event_members em
  join public.events e on e.id = em.event_id
  where e.name like '[SEED] %'
    and em.role = 'member'
)
insert into public.contributions (
  user_id,
  event_id,
  department,
  task,
  description,
  changes,
  priority,
  challenges
)
select
  sm.user_id,
  sm.event_id,
  sm.department,
  sm.task,
  'Seeded contribution for admin-side list testing.',
  'Updated task progress and deliverables.',
  case (sm.rn % 3)
    when 0 then 'high'::text
    when 1 then 'medium'::text
    else 'low'::text
  end,
  'Balancing scope and event deadline.'
from seeded_members sm
where (sm.rn % 3) <> 0;

-- Seed attendance for active members.
with active_members as (
  select
    id,
    row_number() over (order by created_at asc, id) as rn
  from public.profiles
  where role = 'member' and status = 'active'
  limit 16
)
insert into public.attendance (user_id, event_id, meeting_week, type, status, notes, date)
select
  am.id,
  (
    select e.id
    from public.events e
    where e.name like '[SEED] %'
      and e.status = 'active'
    order by e.date asc nulls last
    limit 1
  ) as event_id,
  ((am.rn - 1) % 4) + 1 as meeting_week,
  case when (am.rn % 2) = 0 then 'event' else 'weekly_meeting' end,
  case (am.rn % 3)
    when 0 then 'attended'
    when 1 then 'excused'
    else 'absent'
  end,
  'Seeded attendance note',
  current_date - ((am.rn % 6) || ' days')::interval
from active_members am;

-- Seed reflections for half of contributions.
with seeded_contributions as (
  select
    c.id,
    c.user_id,
    row_number() over (order by c.created_at asc, c.id) as rn
  from public.contributions c
  join public.events e on e.id = c.event_id
  where e.name like '[SEED] %'
)
insert into public.reflections (
  user_id,
  contribution_id,
  current_task,
  description,
  impact,
  challenges,
  personal_learning,
  org_learning,
  status,
  submitted_at
)
select
  sc.user_id,
  sc.id,
  'SEED reflection',
  'Reflecting on contribution progress and outcomes.',
  'Delivered visible progress for event execution.',
  'Managed timeline pressure with prioritization.',
  'Improved communication and ownership.',
  'Early scope alignment reduced rework.',
  case when (sc.rn % 2) = 0 then 'pending' else 'archived' end,
  now() - ((sc.rn % 5) || ' days')::interval
from seeded_contributions sc
where (sc.rn % 2) = 0;

commit;
