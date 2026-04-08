create or replace function public.handle_new_user()
returns trigger
language plpgsql
security definer
set search_path to 'public'
as $function$
begin
  -- if new.email not like '%@sgyouthai.org' then
  --   raise exception 'Unauthorised email domain: %', new.email;
  -- end if;
  -- Domain restriction temporarily disabled: normal email signups are allowed.

  insert into public.profiles (id, name, email, avatar_url, role)
  values (
    new.id,
    coalesce(
      new.raw_user_meta_data->>'full_name',
      new.raw_user_meta_data->>'name',
      new.email
    ),
    coalesce(new.email, new.raw_user_meta_data->>'email'),
    new.raw_user_meta_data->>'avatar_url',
    'member'
  )
  on conflict (id) do nothing;
  return new;
end;
$function$;
