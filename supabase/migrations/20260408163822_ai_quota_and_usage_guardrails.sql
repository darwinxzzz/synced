create table if not exists public.ai_usage_limits (
  user_id uuid primary key references public.profiles(id) on delete cascade,
  daily_request_limit integer not null default 30,
  daily_token_limit integer not null default 60000,
  blocked_until timestamptz,
  created_at timestamptz not null default now(),
  updated_at timestamptz not null default now(),
  constraint ai_usage_limits_daily_request_limit_check check (daily_request_limit > 0),
  constraint ai_usage_limits_daily_token_limit_check check (daily_token_limit > 0)
);

create table if not exists public.ai_usage_daily (
  user_id uuid not null references public.profiles(id) on delete cascade,
  usage_date date not null,
  request_count integer not null default 0,
  reserved_tokens integer not null default 0,
  created_at timestamptz not null default now(),
  updated_at timestamptz not null default now(),
  primary key (user_id, usage_date),
  constraint ai_usage_daily_request_count_check check (request_count >= 0),
  constraint ai_usage_daily_reserved_tokens_check check (reserved_tokens >= 0)
);

create table if not exists public.ai_usage_events (
  id uuid primary key default extensions.uuid_generate_v4(),
  user_id uuid not null references public.profiles(id) on delete cascade,
  request_id text not null,
  model text not null,
  prompt_tokens integer not null default 0,
  completion_tokens integer not null default 0,
  total_tokens integer not null default 0,
  estimated_cost_usd numeric(12, 6) not null default 0,
  status text not null default 'ok',
  error_message text,
  metadata jsonb not null default '{}'::jsonb,
  created_at timestamptz not null default now(),
  constraint ai_usage_events_prompt_tokens_check check (prompt_tokens >= 0),
  constraint ai_usage_events_completion_tokens_check check (completion_tokens >= 0),
  constraint ai_usage_events_total_tokens_check check (total_tokens >= 0),
  constraint ai_usage_events_status_check check (status in ('ok', 'blocked', 'error'))
);

create unique index if not exists ai_usage_events_request_id_key
  on public.ai_usage_events(request_id);

alter table public.ai_usage_limits enable row level security;
alter table public.ai_usage_daily enable row level security;
alter table public.ai_usage_events enable row level security;

drop policy if exists "Users read own ai_usage_limits" on public.ai_usage_limits;
create policy "Users read own ai_usage_limits"
  on public.ai_usage_limits
  for select
  to authenticated
  using (auth.uid() = user_id);

drop policy if exists "Admins read all ai_usage_limits" on public.ai_usage_limits;
create policy "Admins read all ai_usage_limits"
  on public.ai_usage_limits
  for select
  to authenticated
  using (public.is_admin());

drop policy if exists "Users read own ai_usage_daily" on public.ai_usage_daily;
create policy "Users read own ai_usage_daily"
  on public.ai_usage_daily
  for select
  to authenticated
  using (auth.uid() = user_id);

drop policy if exists "Admins read all ai_usage_daily" on public.ai_usage_daily;
create policy "Admins read all ai_usage_daily"
  on public.ai_usage_daily
  for select
  to authenticated
  using (public.is_admin());

drop policy if exists "Users read own ai_usage_events" on public.ai_usage_events;
create policy "Users read own ai_usage_events"
  on public.ai_usage_events
  for select
  to authenticated
  using (auth.uid() = user_id);

drop policy if exists "Admins read all ai_usage_events" on public.ai_usage_events;
create policy "Admins read all ai_usage_events"
  on public.ai_usage_events
  for select
  to authenticated
  using (public.is_admin());

create or replace function public.consume_ai_quota(
  p_user_id uuid,
  p_estimated_tokens integer
)
returns table(
  allowed boolean,
  reason text,
  remaining_requests integer,
  remaining_tokens integer
)
language plpgsql
security definer
set search_path = 'public'
as $function$
declare
  v_today date := (now() at time zone 'utc')::date;
  v_limit_requests integer := 30;
  v_limit_tokens integer := 60000;
  v_blocked_until timestamptz;
  v_used_requests integer := 0;
  v_used_tokens integer := 0;
begin
  if p_user_id is null then
    return query select false, 'missing_user_id', 0, 0;
    return;
  end if;

  if p_estimated_tokens <= 0 then
    return query select false, 'invalid_estimated_tokens', 0, 0;
    return;
  end if;

  select daily_request_limit, daily_token_limit, blocked_until
    into v_limit_requests, v_limit_tokens, v_blocked_until
  from public.ai_usage_limits
  where user_id = p_user_id;

  if v_blocked_until is not null and v_blocked_until > now() then
    return query select false, 'temporarily_blocked', 0, 0;
    return;
  end if;

  insert into public.ai_usage_daily (user_id, usage_date)
  values (p_user_id, v_today)
  on conflict (user_id, usage_date) do nothing;

  select request_count, reserved_tokens
    into v_used_requests, v_used_tokens
  from public.ai_usage_daily
  where user_id = p_user_id
    and usage_date = v_today
  for update;

  if v_used_requests + 1 > v_limit_requests then
    return query
    select false, 'daily_request_limit_reached', 0, greatest(v_limit_tokens - v_used_tokens, 0);
    return;
  end if;

  if v_used_tokens + p_estimated_tokens > v_limit_tokens then
    return query
    select false, 'daily_token_limit_reached', greatest(v_limit_requests - v_used_requests, 0), 0;
    return;
  end if;

  update public.ai_usage_daily
  set request_count = request_count + 1,
      reserved_tokens = reserved_tokens + p_estimated_tokens,
      updated_at = now()
  where user_id = p_user_id
    and usage_date = v_today;

  return query
  select
    true,
    null::text,
    greatest(v_limit_requests - (v_used_requests + 1), 0),
    greatest(v_limit_tokens - (v_used_tokens + p_estimated_tokens), 0);
end;
$function$;

create or replace function public.log_ai_usage_event(
  p_user_id uuid,
  p_request_id text,
  p_model text,
  p_prompt_tokens integer,
  p_completion_tokens integer,
  p_estimated_cost_usd numeric,
  p_status text,
  p_error_message text default null,
  p_metadata jsonb default '{}'::jsonb
)
returns uuid
language plpgsql
security definer
set search_path = 'public'
as $function$
declare
  v_id uuid;
  v_total integer := greatest(coalesce(p_prompt_tokens, 0), 0) + greatest(coalesce(p_completion_tokens, 0), 0);
  v_status text := coalesce(p_status, 'ok');
begin
  insert into public.ai_usage_events (
    user_id,
    request_id,
    model,
    prompt_tokens,
    completion_tokens,
    total_tokens,
    estimated_cost_usd,
    status,
    error_message,
    metadata
  )
  values (
    p_user_id,
    p_request_id,
    p_model,
    greatest(coalesce(p_prompt_tokens, 0), 0),
    greatest(coalesce(p_completion_tokens, 0), 0),
    v_total,
    greatest(coalesce(p_estimated_cost_usd, 0), 0),
    v_status,
    p_error_message,
    coalesce(p_metadata, '{}'::jsonb)
  )
  returning id into v_id;

  return v_id;
end;
$function$;

grant execute on function public.consume_ai_quota(uuid, integer) to authenticated;
grant execute on function public.consume_ai_quota(uuid, integer) to service_role;
grant execute on function public.log_ai_usage_event(uuid, text, text, integer, integer, numeric, text, text, jsonb) to authenticated;
grant execute on function public.log_ai_usage_event(uuid, text, text, integer, integer, numeric, text, text, jsonb) to service_role;
