create or replace function public.is_admin()
returns boolean
language sql
stable
security definer
set search_path = 'public'
as $function$
  select exists (
    select 1
    from public.profiles p
    where p.id = auth.uid()
      and p.role = 'admin'
  );
$function$;

create or replace function public.get_admin_kpi_active_events()
returns bigint
language plpgsql
security definer
set search_path = 'public'
as $function$
begin
  if not public.is_admin() then
    raise exception 'Forbidden';
  end if;

  return (
    select count(*)
    from public.events
    where status = 'active'
  );
end;
$function$;

create or replace function public.get_admin_kpi_completion_rate()
returns numeric
language plpgsql
security definer
set search_path = 'public'
as $function$
begin
  if not public.is_admin() then
    raise exception 'Forbidden';
  end if;

  return (
    select
      case
        when count(*) = 0 then 0
        else round(
          count(*) filter (where em.pillar_status = 'done')::numeric
          / count(*)::numeric * 100, 1
        )
      end
    from public.event_members em
    join public.events e on e.id = em.event_id
    where e.status = 'active'
  );
end;
$function$;

create or replace function public.get_admin_kpi_tasks_due()
returns bigint
language plpgsql
security definer
set search_path = 'public'
as $function$
begin
  if not public.is_admin() then
    raise exception 'Forbidden';
  end if;

  return (
    select count(*)
    from public.event_members em
    join public.events e on e.id = em.event_id
    where e.status = 'active'
      and e.date between current_date and current_date + interval '7 days'
      and em.pillar_status != 'done'
  );
end;
$function$;

create or replace function public.get_admin_kpi_total_members()
returns bigint
language plpgsql
security definer
set search_path = 'public'
as $function$
begin
  if not public.is_admin() then
    raise exception 'Forbidden';
  end if;

  return (
    select count(*)
    from public.profiles
    where role = 'member'
      and status = 'active'
  );
end;
$function$;

create or replace function public.get_admin_pending_submissions()
returns table(
  event_id uuid,
  event_name text,
  user_id uuid,
  member_name text,
  department text,
  task text,
  event_date date
)
language plpgsql
security definer
set search_path = 'public'
as $function$
begin
  if not public.is_admin() then
    raise exception 'Forbidden';
  end if;

  return query
  select
    e.id,
    e.name,
    em.user_id,
    p.name,
    em.department,
    em.task,
    e.date
  from public.event_members em
  join public.events e on e.id = em.event_id
  join public.profiles p on p.id = em.user_id
  left join public.contributions c
    on c.event_id = em.event_id
   and c.user_id = em.user_id
  where e.status = 'active'
    and em.pillar_status <> 'done'
    and c.id is null
  order by e.date asc nulls last, p.name asc;
end;
$function$;

revoke execute on function public.create_event(text, text, date, time without time zone, time without time zone, text, boolean, uuid[]) from public;
grant execute on function public.create_event(text, text, date, time without time zone, time without time zone, text, boolean, uuid[]) to authenticated;
grant execute on function public.create_event(text, text, date, time without time zone, time without time zone, text, boolean, uuid[]) to service_role;

revoke execute on function public.get_admin_kpi_active_events() from public;
revoke execute on function public.get_admin_kpi_completion_rate() from public;
revoke execute on function public.get_admin_kpi_tasks_due() from public;
revoke execute on function public.get_admin_kpi_total_members() from public;
revoke execute on function public.get_admin_pending_submissions() from public;
revoke execute on function public.is_admin() from public;

grant execute on function public.get_admin_kpi_active_events() to authenticated;
grant execute on function public.get_admin_kpi_completion_rate() to authenticated;
grant execute on function public.get_admin_kpi_tasks_due() to authenticated;
grant execute on function public.get_admin_kpi_total_members() to authenticated;
grant execute on function public.get_admin_pending_submissions() to authenticated;
grant execute on function public.is_admin() to authenticated;

grant execute on function public.get_admin_kpi_active_events() to service_role;
grant execute on function public.get_admin_kpi_completion_rate() to service_role;
grant execute on function public.get_admin_kpi_tasks_due() to service_role;
grant execute on function public.get_admin_kpi_total_members() to service_role;
grant execute on function public.get_admin_pending_submissions() to service_role;
grant execute on function public.is_admin() to service_role;

drop policy if exists "Admins manage all attendance" on public.attendance;
create policy "Admins manage all attendance"
  on public.attendance
  as permissive
  for all
  to authenticated
  using (public.is_admin());

drop policy if exists "Admins read all contributions" on public.contributions;
create policy "Admins read all contributions"
  on public.contributions
  as permissive
  for select
  to authenticated
  using (public.is_admin());

drop policy if exists "Admins manage event_members" on public.event_members;
create policy "Admins manage event_members"
  on public.event_members
  as permissive
  for all
  to authenticated
  using (public.is_admin());

drop policy if exists "Admins read all event_members" on public.event_members;
create policy "Admins read all event_members"
  on public.event_members
  as permissive
  for select
  to authenticated
  using (public.is_admin());

drop policy if exists "Admins insert events" on public.events;
create policy "Admins insert events"
  on public.events
  as permissive
  for insert
  to authenticated
  with check (public.is_admin());

drop policy if exists "Admins update events" on public.events;
create policy "Admins update events"
  on public.events
  as permissive
  for update
  to authenticated
  using (public.is_admin());

drop policy if exists "Profiles: owner or admin can select" on public.profiles;
create policy "Profiles: owner or admin can select"
  on public.profiles
  as permissive
  for select
  to authenticated
  using ((auth.uid() = id) or public.is_admin());

drop policy if exists "Admins read all reflections" on public.reflections;
create policy "Admins read all reflections"
  on public.reflections
  as permissive
  for select
  to authenticated
  using (public.is_admin());

drop policy if exists "Members write own reflections" on public.reflections;
create policy "Members insert own reflections"
  on public.reflections
  as permissive
  for insert
  to authenticated
  with check (auth.uid() = user_id);

drop policy if exists "Admins manage all requests" on public.testimonial_requests;
create policy "Admins manage all requests"
  on public.testimonial_requests
  as permissive
  for all
  to authenticated
  using (public.is_admin());

drop policy if exists "Admins manage all testimonials" on public.testimonials;
create policy "Admins manage all testimonials"
  on public.testimonials
  as permissive
  for all
  to authenticated
  using (public.is_admin());
