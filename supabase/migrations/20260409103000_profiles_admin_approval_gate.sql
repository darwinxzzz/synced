-- Restrict profile access behind admin approval.
-- Profiles status flow: pending -> active | rejected

-- Normalize legacy statuses before tightening constraints.
update public.profiles
set status = case
  when status = 'inactive' then 'rejected'
  when status = 'active' then 'active'
  else 'pending'
end
where status is null
   or status not in ('pending', 'active', 'rejected');

alter table public.profiles
  alter column status set default 'pending';

alter table public.profiles
  drop constraint if exists profiles_status_check;

alter table public.profiles
  add constraint profiles_status_check
  check (status in ('pending', 'active', 'rejected'));

create or replace function public.handle_new_user()
returns trigger
language plpgsql
security definer
set search_path to 'public'
as $function$
begin
  -- Domain restriction temporarily disabled: normal email signups are allowed.
  insert into public.profiles (id, name, email, avatar_url, role, status)
  values (
    new.id,
    coalesce(
      new.raw_user_meta_data->>'full_name',
      new.raw_user_meta_data->>'name',
      new.email
    ),
    coalesce(new.email, new.raw_user_meta_data->>'email'),
    new.raw_user_meta_data->>'avatar_url',
    'member',
    'pending'
  )
  on conflict (id) do nothing;

  return new;
end;
$function$;
