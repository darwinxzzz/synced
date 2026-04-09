drop extension if exists "pg_net";

create type "public"."department" as enum ('Software', 'Meet-ups', 'Inspire', 'Publicity', 'Connectors', 'Labs');

create type "public"."priority" as enum ('high', 'medium', 'low');

create type "public"."roles" as enum ('admin', 'lead', 'member');

create type "public"."status" as enum ('attended', 'excused', 'absent');


  create table "public"."attendance" (
    "id" uuid not null default extensions.uuid_generate_v4(),
    "user_id" uuid not null,
    "event_id" uuid,
    "meeting_week" integer,
    "type" text not null,
    "status" text not null,
    "notes" text,
    "date" date not null,
    "created_at" timestamp with time zone default now(),
    "updated_at" timestamp with time zone default now()
      );


alter table "public"."attendance" enable row level security;


  create table "public"."contributions" (
    "id" uuid not null default extensions.uuid_generate_v4(),
    "user_id" uuid not null,
    "event_id" uuid,
    "department" text not null,
    "task" text not null,
    "description" text,
    "changes" text,
    "priority" text not null default 'medium'::text,
    "submitted_at" timestamp with time zone default now(),
    "created_at" timestamp with time zone default now(),
    "updated_at" timestamp with time zone default now(),
    "challenges" text
      );


alter table "public"."contributions" enable row level security;


  create table "public"."event_members" (
    "id" uuid not null default extensions.uuid_generate_v4(),
    "event_id" uuid not null,
    "user_id" uuid not null,
    "department" text,
    "task" text,
    "role" text default 'member'::text,
    "pillar_status" text not null default 'new'::text,
    "created_at" timestamp with time zone default now(),
    "updated_at" timestamp with time zone default now()
      );


alter table "public"."event_members" enable row level security;


  create table "public"."events" (
    "id" uuid not null default extensions.uuid_generate_v4(),
    "name" text not null,
    "description" text,
    "date" date,
    "start_time" time without time zone,
    "end_time" time without time zone,
    "cover_url" text,
    "created_by" uuid not null,
    "status" text not null default 'draft'::text,
    "is_recurring" boolean default false,
    "created_at" timestamp with time zone default now(),
    "updated_at" timestamp with time zone default now(),
    "kanban_status" text not null default 'new'::text
      );


alter table "public"."events" enable row level security;


  create table "public"."profiles" (
    "id" uuid not null,
    "name" text not null,
    "email" text not null,
    "avatar_url" text,
    "role" text not null default 'member'::text,
    "department" text,
    "joined_date" date default CURRENT_DATE,
    "status" text not null default 'active'::text,
    "created_at" timestamp with time zone default now(),
    "updated_at" timestamp with time zone default now()
      );


alter table "public"."profiles" enable row level security;


  create table "public"."reflections" (
    "id" uuid not null default extensions.uuid_generate_v4(),
    "user_id" uuid not null,
    "contribution_id" uuid not null,
    "current_task" text,
    "description" text,
    "impact" text,
    "challenges" text,
    "personal_learning" text,
    "org_learning" text,
    "status" text not null default 'pending'::text,
    "submitted_at" timestamp with time zone,
    "created_at" timestamp with time zone default now(),
    "updated_at" timestamp with time zone default now()
      );


alter table "public"."reflections" enable row level security;


  create table "public"."testimonial_requests" (
    "id" uuid not null default extensions.uuid_generate_v4(),
    "user_id" uuid not null,
    "requested_at" timestamp with time zone default now(),
    "status" text not null default 'pending'::text,
    "created_at" timestamp with time zone default now(),
    "updated_at" timestamp with time zone default now()
      );


alter table "public"."testimonial_requests" enable row level security;


  create table "public"."testimonials" (
    "id" uuid not null default extensions.uuid_generate_v4(),
    "user_id" uuid not null,
    "generated_by" uuid not null,
    "content_json" jsonb,
    "endorsement_quote" text,
    "endorsement_name" text,
    "endorsement_title" text,
    "generated_at" timestamp with time zone default now(),
    "finalised_at" timestamp with time zone,
    "created_at" timestamp with time zone default now(),
    "updated_at" timestamp with time zone default now()
      );


alter table "public"."testimonials" enable row level security;

CREATE UNIQUE INDEX attendance_pkey ON public.attendance USING btree (id);

CREATE UNIQUE INDEX contributions_pkey ON public.contributions USING btree (id);

CREATE UNIQUE INDEX event_members_event_id_user_id_key ON public.event_members USING btree (event_id, user_id);

CREATE UNIQUE INDEX event_members_pkey ON public.event_members USING btree (id);

CREATE UNIQUE INDEX events_pkey ON public.events USING btree (id);

CREATE UNIQUE INDEX profiles_email_key ON public.profiles USING btree (email);

CREATE UNIQUE INDEX profiles_pkey ON public.profiles USING btree (id);

CREATE UNIQUE INDEX reflections_pkey ON public.reflections USING btree (id);

CREATE UNIQUE INDEX testimonial_requests_pkey ON public.testimonial_requests USING btree (id);

CREATE UNIQUE INDEX testimonial_requests_user_id_key ON public.testimonial_requests USING btree (user_id);

CREATE UNIQUE INDEX testimonials_pkey ON public.testimonials USING btree (id);

alter table "public"."attendance" add constraint "attendance_pkey" PRIMARY KEY using index "attendance_pkey";

alter table "public"."contributions" add constraint "contributions_pkey" PRIMARY KEY using index "contributions_pkey";

alter table "public"."event_members" add constraint "event_members_pkey" PRIMARY KEY using index "event_members_pkey";

alter table "public"."events" add constraint "events_pkey" PRIMARY KEY using index "events_pkey";

alter table "public"."profiles" add constraint "profiles_pkey" PRIMARY KEY using index "profiles_pkey";

alter table "public"."reflections" add constraint "reflections_pkey" PRIMARY KEY using index "reflections_pkey";

alter table "public"."testimonial_requests" add constraint "testimonial_requests_pkey" PRIMARY KEY using index "testimonial_requests_pkey";

alter table "public"."testimonials" add constraint "testimonials_pkey" PRIMARY KEY using index "testimonials_pkey";

alter table "public"."attendance" add constraint "attendance_event_id_fkey" FOREIGN KEY (event_id) REFERENCES public.events(id) ON DELETE SET NULL not valid;

alter table "public"."attendance" validate constraint "attendance_event_id_fkey";

alter table "public"."attendance" add constraint "attendance_status_check" CHECK ((status = ANY (ARRAY['attended'::text, 'absent'::text, 'excused'::text]))) not valid;

alter table "public"."attendance" validate constraint "attendance_status_check";

alter table "public"."attendance" add constraint "attendance_type_check" CHECK ((type = ANY (ARRAY['event'::text, 'weekly_meeting'::text]))) not valid;

alter table "public"."attendance" validate constraint "attendance_type_check";

alter table "public"."attendance" add constraint "attendance_user_id_fkey" FOREIGN KEY (user_id) REFERENCES public.profiles(id) ON DELETE CASCADE not valid;

alter table "public"."attendance" validate constraint "attendance_user_id_fkey";

alter table "public"."contributions" add constraint "contributions_challenges_check" CHECK (((challenges IS NULL) OR (array_length(regexp_split_to_array(TRIM(BOTH FROM challenges), '\s+'::text), 1) <= 30))) not valid;

alter table "public"."contributions" validate constraint "contributions_challenges_check";

alter table "public"."contributions" add constraint "contributions_description" CHECK (((description IS NULL) OR (array_length(regexp_split_to_array(TRIM(BOTH FROM description), '\s+'::text), 1) <= 30))) not valid;

alter table "public"."contributions" validate constraint "contributions_description";

alter table "public"."contributions" add constraint "contributions_event_id_fkey" FOREIGN KEY (event_id) REFERENCES public.events(id) ON DELETE SET NULL not valid;

alter table "public"."contributions" validate constraint "contributions_event_id_fkey";

alter table "public"."contributions" add constraint "contributions_outcome_check" CHECK (((changes IS NULL) OR (array_length(regexp_split_to_array(TRIM(BOTH FROM changes), '\s+'::text), 1) <= 40))) not valid;

alter table "public"."contributions" validate constraint "contributions_outcome_check";

alter table "public"."contributions" add constraint "contributions_priority_check" CHECK ((priority = ANY (ARRAY['low'::text, 'medium'::text, 'high'::text]))) not valid;

alter table "public"."contributions" validate constraint "contributions_priority_check";

alter table "public"."contributions" add constraint "contributions_task" CHECK (((task IS NULL) OR (array_length(regexp_split_to_array(TRIM(BOTH FROM task), '\s+'::text), 1) <= 5))) not valid;

alter table "public"."contributions" validate constraint "contributions_task";

alter table "public"."contributions" add constraint "contributions_user_id_fkey" FOREIGN KEY (user_id) REFERENCES public.profiles(id) ON DELETE CASCADE not valid;

alter table "public"."contributions" validate constraint "contributions_user_id_fkey";

alter table "public"."event_members" add constraint "event_members_event_id_fkey" FOREIGN KEY (event_id) REFERENCES public.events(id) ON DELETE CASCADE not valid;

alter table "public"."event_members" validate constraint "event_members_event_id_fkey";

alter table "public"."event_members" add constraint "event_members_event_id_user_id_key" UNIQUE using index "event_members_event_id_user_id_key";

alter table "public"."event_members" add constraint "event_members_pillar_status_check" CHECK ((pillar_status = ANY (ARRAY['new'::text, 'in_progress'::text, 'in_review'::text, 'done'::text]))) not valid;

alter table "public"."event_members" validate constraint "event_members_pillar_status_check";

alter table "public"."event_members" add constraint "event_members_role_check" CHECK ((role = ANY (ARRAY['member'::text, 'lead'::text, 'admin'::text]))) not valid;

alter table "public"."event_members" validate constraint "event_members_role_check";

alter table "public"."event_members" add constraint "event_members_user_id_fkey" FOREIGN KEY (user_id) REFERENCES public.profiles(id) ON DELETE CASCADE not valid;

alter table "public"."event_members" validate constraint "event_members_user_id_fkey";

alter table "public"."events" add constraint "events_created_by_fkey" FOREIGN KEY (created_by) REFERENCES public.profiles(id) ON DELETE RESTRICT not valid;

alter table "public"."events" validate constraint "events_created_by_fkey";

alter table "public"."events" add constraint "events_kanban_status_check" CHECK ((kanban_status = ANY (ARRAY['new'::text, 'in_progress'::text, 'in_review'::text, 'done'::text]))) not valid;

alter table "public"."events" validate constraint "events_kanban_status_check";

alter table "public"."events" add constraint "events_status_check" CHECK ((status = ANY (ARRAY['draft'::text, 'active'::text, 'archived'::text]))) not valid;

alter table "public"."events" validate constraint "events_status_check";

alter table "public"."profiles" add constraint "profiles_email_key" UNIQUE using index "profiles_email_key";

alter table "public"."profiles" add constraint "profiles_id_fkey" FOREIGN KEY (id) REFERENCES auth.users(id) ON DELETE CASCADE not valid;

alter table "public"."profiles" validate constraint "profiles_id_fkey";

alter table "public"."profiles" add constraint "profiles_role_check" CHECK ((role = ANY (ARRAY['member'::text, 'admin'::text]))) not valid;

alter table "public"."profiles" validate constraint "profiles_role_check";

alter table "public"."profiles" add constraint "profiles_status_check" CHECK ((status = ANY (ARRAY['active'::text, 'inactive'::text]))) not valid;

alter table "public"."profiles" validate constraint "profiles_status_check";

alter table "public"."reflections" add constraint "reflections_challenges_words" CHECK (((challenges IS NULL) OR (array_length(regexp_split_to_array(TRIM(BOTH FROM challenges), '\s+'::text), 1) <= 30))) not valid;

alter table "public"."reflections" validate constraint "reflections_challenges_words";

alter table "public"."reflections" add constraint "reflections_contribution_id_fkey" FOREIGN KEY (contribution_id) REFERENCES public.contributions(id) ON DELETE CASCADE not valid;

alter table "public"."reflections" validate constraint "reflections_contribution_id_fkey";

alter table "public"."reflections" add constraint "reflections_current_task_words" CHECK (((current_task IS NULL) OR (array_length(regexp_split_to_array(TRIM(BOTH FROM current_task), '\s+'::text), 1) <= 5))) not valid;

alter table "public"."reflections" validate constraint "reflections_current_task_words";

alter table "public"."reflections" add constraint "reflections_description_words" CHECK (((description IS NULL) OR (array_length(regexp_split_to_array(TRIM(BOTH FROM description), '\s+'::text), 1) <= 30))) not valid;

alter table "public"."reflections" validate constraint "reflections_description_words";

alter table "public"."reflections" add constraint "reflections_impact_words" CHECK (((impact IS NULL) OR (array_length(regexp_split_to_array(TRIM(BOTH FROM impact), '\s+'::text), 1) <= 30))) not valid;

alter table "public"."reflections" validate constraint "reflections_impact_words";

alter table "public"."reflections" add constraint "reflections_org_learning_words" CHECK (((org_learning IS NULL) OR (array_length(regexp_split_to_array(TRIM(BOTH FROM org_learning), '\s+'::text), 1) <= 30))) not valid;

alter table "public"."reflections" validate constraint "reflections_org_learning_words";

alter table "public"."reflections" add constraint "reflections_personal_learning_words" CHECK (((personal_learning IS NULL) OR (array_length(regexp_split_to_array(TRIM(BOTH FROM personal_learning), '\s+'::text), 1) <= 30))) not valid;

alter table "public"."reflections" validate constraint "reflections_personal_learning_words";

alter table "public"."reflections" add constraint "reflections_status_check" CHECK ((status = ANY (ARRAY['pending'::text, 'archived'::text]))) not valid;

alter table "public"."reflections" validate constraint "reflections_status_check";

alter table "public"."reflections" add constraint "reflections_user_id_fkey" FOREIGN KEY (user_id) REFERENCES public.profiles(id) ON DELETE CASCADE not valid;

alter table "public"."reflections" validate constraint "reflections_user_id_fkey";

alter table "public"."testimonial_requests" add constraint "testimonial_requests_status_check" CHECK ((status = ANY (ARRAY['pending'::text, 'generated'::text, 'sent'::text]))) not valid;

alter table "public"."testimonial_requests" validate constraint "testimonial_requests_status_check";

alter table "public"."testimonial_requests" add constraint "testimonial_requests_user_id_fkey" FOREIGN KEY (user_id) REFERENCES public.profiles(id) ON DELETE CASCADE not valid;

alter table "public"."testimonial_requests" validate constraint "testimonial_requests_user_id_fkey";

alter table "public"."testimonial_requests" add constraint "testimonial_requests_user_id_key" UNIQUE using index "testimonial_requests_user_id_key";

alter table "public"."testimonials" add constraint "testimonials_generated_by_fkey" FOREIGN KEY (generated_by) REFERENCES public.profiles(id) ON DELETE RESTRICT not valid;

alter table "public"."testimonials" validate constraint "testimonials_generated_by_fkey";

alter table "public"."testimonials" add constraint "testimonials_user_id_fkey" FOREIGN KEY (user_id) REFERENCES public.profiles(id) ON DELETE CASCADE not valid;

alter table "public"."testimonials" validate constraint "testimonials_user_id_fkey";

set check_function_bodies = off;

CREATE OR REPLACE FUNCTION public.create_event(p_name text, p_description text, p_date date, p_start_time time without time zone, p_end_time time without time zone, p_cover_url text, p_is_recurring boolean, p_member_ids uuid[])
 RETURNS public.events
 LANGUAGE plpgsql
 SECURITY DEFINER
AS $function$
declare
  v_event events;
  v_member_id uuid;
begin
  -- only admins can call this
  if not exists (
    select 1 from profiles where id = auth.uid() and role = 'admin'
  ) then
    raise exception 'Forbidden';
  end if;

  -- insert the event
  insert into events (name, description, date, start_time, end_time,
                      cover_url, is_recurring, created_by, status)
  values (p_name, p_description, p_date, p_start_time, p_end_time,
          p_cover_url, p_is_recurring, auth.uid(), 'active')
  returning * into v_event;

  -- auto-assign the admin who created it
  insert into event_members (event_id, user_id, role, pillar_status)
  values (v_event.id, auth.uid(), 'admin', 'new');

  -- assign all selected members
  foreach v_member_id in array p_member_ids loop
    insert into event_members (event_id, user_id, role, pillar_status)
    values (v_event.id, v_member_id, 'member', 'new')
    on conflict (event_id, user_id) do nothing;
  end loop;

  return v_event;
end;
$function$
;

CREATE OR REPLACE FUNCTION public.enforce_member_pillar_transitions()
 RETURNS trigger
 LANGUAGE plpgsql
 SECURITY DEFINER
AS $function$
BEGIN
  -- Skip if admin is making the move
  IF EXISTS (
    SELECT 1 FROM profiles
    WHERE id = auth.uid() AND role = 'admin'
  ) THEN
    RETURN NEW;
  END IF;

  -- Enforce sequential transitions for members
  IF NOT (
    (OLD.pillar_status = 'new'         AND NEW.pillar_status = 'in_progress') OR
    (OLD.pillar_status = 'in_progress' AND NEW.pillar_status = 'in_review')
  ) THEN
    RAISE EXCEPTION 'Invalid transition: members can only move new→in_progress or in_progress→in_review';
  END IF;

  RETURN NEW;
END;
$function$
;

CREATE OR REPLACE FUNCTION public.get_admin_kpi_active_events()
 RETURNS bigint
 LANGUAGE sql
 SECURITY DEFINER
AS $function$
  select count(*) from events where status = 'active';
$function$
;

CREATE OR REPLACE FUNCTION public.get_admin_kpi_completion_rate()
 RETURNS numeric
 LANGUAGE sql
 SECURITY DEFINER
AS $function$
  select
    case
      when count(*) = 0 then 0
      else round(
        count(*) filter (where pillar_status = 'done')::numeric
        / count(*)::numeric * 100, 1
      )
    end
  from event_members em
  join events e on e.id = em.event_id
  where e.status = 'active';
$function$
;

CREATE OR REPLACE FUNCTION public.get_admin_kpi_tasks_due()
 RETURNS bigint
 LANGUAGE sql
 SECURITY DEFINER
AS $function$
  select count(*)
  from event_members em
  join events e on e.id = em.event_id
  where e.status = 'active'
    and e.date between current_date and current_date + interval '7 days'
    and em.pillar_status != 'done';
$function$
;

CREATE OR REPLACE FUNCTION public.get_admin_kpi_total_members()
 RETURNS bigint
 LANGUAGE sql
 SECURITY DEFINER
AS $function$
  select count(*) from profiles where role = 'member' and status = 'active';
$function$
;

CREATE OR REPLACE FUNCTION public.get_admin_pending_submissions()
 RETURNS TABLE(event_id uuid, event_name text, user_id uuid, member_name text, department text, task text, event_date date)
 LANGUAGE sql
 SECURITY DEFINER
AS $function$
  select
    e.id,
    e.name,
    em.user_id,
    p.name,
    em.department,
    em.task,
    e.date
  from event_members em
  join events e  on e.id  = em.event_id
  join profiles p on p.id = em.user_id
  where e.date < current_date
    and em.pillar_status != 'done'
    and e.status = 'active'
  order by e.date asc;
$function$
;

CREATE OR REPLACE FUNCTION public.get_member_kpi_completion_rate()
 RETURNS numeric
 LANGUAGE sql
 SECURITY DEFINER
AS $function$
  select
    case
      when count(*) = 0 then 0
      else round(
        count(*) filter (where pillar_status = 'done')::numeric
        / count(*)::numeric * 100, 1
      )
    end
  from event_members em
  join events e on e.id = em.event_id
  where em.user_id = auth.uid()
    and e.status = 'active';
$function$
;

CREATE OR REPLACE FUNCTION public.get_member_kpi_next_deadline()
 RETURNS TABLE(event_name text, event_date date, days_away integer)
 LANGUAGE sql
 SECURITY DEFINER
AS $function$
  select
    e.name,
    e.date,
    (e.date - current_date)::integer
  from event_members em
  join events e on e.id = em.event_id
  where em.user_id = auth.uid()
    and em.pillar_status != 'done'
    and e.status = 'active'
    and e.date >= current_date
  order by e.date asc
  limit 1;
$function$
;

CREATE OR REPLACE FUNCTION public.get_member_kpi_remaining_tasks()
 RETURNS bigint
 LANGUAGE sql
 SECURITY DEFINER
AS $function$
  select count(*)
  from event_members em
  join events e on e.id = em.event_id
  where em.user_id = auth.uid()
    and em.pillar_status != 'done'
    and e.status = 'active';
$function$
;

CREATE OR REPLACE FUNCTION public.get_member_kpi_team_sync_count()
 RETURNS integer
 LANGUAGE plpgsql
 SECURITY DEFINER
 SET search_path TO 'public'
AS $function$
BEGIN
  RETURN (
    SELECT COUNT(*)::integer
    FROM attendance
    WHERE user_id = auth.uid()
      AND type = 'weekly_meeting'
      AND status = 'attended'
  );
END;
$function$
;

CREATE OR REPLACE FUNCTION public.get_member_pending_milestones()
 RETURNS TABLE(event_id uuid, event_name text, task text, department text, event_date date, pillar_status text)
 LANGUAGE sql
 SECURITY DEFINER
AS $function$
  select
    e.id,
    e.name,
    em.task,
    em.department,
    e.date,
    em.pillar_status
  from event_members em
  join events e on e.id = em.event_id
  where em.user_id = auth.uid()
    and em.pillar_status != 'done'
    and e.status = 'active'
  order by e.date asc;
$function$
;

CREATE OR REPLACE FUNCTION public.handle_new_user()
 RETURNS trigger
 LANGUAGE plpgsql
 SECURITY DEFINER
 SET search_path TO 'public'
AS $function$
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
$function$
;

CREATE OR REPLACE FUNCTION public.rls_auto_enable()
 RETURNS event_trigger
 LANGUAGE plpgsql
 SECURITY DEFINER
 SET search_path TO 'pg_catalog'
AS $function$
DECLARE
  cmd record;
BEGIN
  FOR cmd IN
    SELECT *
    FROM pg_event_trigger_ddl_commands()
    WHERE command_tag IN ('CREATE TABLE', 'CREATE TABLE AS', 'SELECT INTO')
      AND object_type IN ('table','partitioned table')
  LOOP
     IF cmd.schema_name IS NOT NULL AND cmd.schema_name IN ('public') AND cmd.schema_name NOT IN ('pg_catalog','information_schema') AND cmd.schema_name NOT LIKE 'pg_toast%' AND cmd.schema_name NOT LIKE 'pg_temp%' THEN
      BEGIN
        EXECUTE format('alter table if exists %s enable row level security', cmd.object_identity);
        RAISE LOG 'rls_auto_enable: enabled RLS on %', cmd.object_identity;
      EXCEPTION
        WHEN OTHERS THEN
          RAISE LOG 'rls_auto_enable: failed to enable RLS on %', cmd.object_identity;
      END;
     ELSE
        RAISE LOG 'rls_auto_enable: skip % (either system schema or not in enforced list: %.)', cmd.object_identity, cmd.schema_name;
     END IF;
  END LOOP;
END;
$function$
;

CREATE OR REPLACE FUNCTION public.update_updated_at_column()
 RETURNS trigger
 LANGUAGE plpgsql
AS $function$
begin
  new.updated_at = now();
  return new;
end;
$function$
;

grant delete on table "public"."attendance" to "anon";

grant insert on table "public"."attendance" to "anon";

grant references on table "public"."attendance" to "anon";

grant select on table "public"."attendance" to "anon";

grant trigger on table "public"."attendance" to "anon";

grant truncate on table "public"."attendance" to "anon";

grant update on table "public"."attendance" to "anon";

grant delete on table "public"."attendance" to "authenticated";

grant insert on table "public"."attendance" to "authenticated";

grant references on table "public"."attendance" to "authenticated";

grant select on table "public"."attendance" to "authenticated";

grant trigger on table "public"."attendance" to "authenticated";

grant truncate on table "public"."attendance" to "authenticated";

grant update on table "public"."attendance" to "authenticated";

grant delete on table "public"."attendance" to "service_role";

grant insert on table "public"."attendance" to "service_role";

grant references on table "public"."attendance" to "service_role";

grant select on table "public"."attendance" to "service_role";

grant trigger on table "public"."attendance" to "service_role";

grant truncate on table "public"."attendance" to "service_role";

grant update on table "public"."attendance" to "service_role";

grant delete on table "public"."contributions" to "anon";

grant insert on table "public"."contributions" to "anon";

grant references on table "public"."contributions" to "anon";

grant select on table "public"."contributions" to "anon";

grant trigger on table "public"."contributions" to "anon";

grant truncate on table "public"."contributions" to "anon";

grant update on table "public"."contributions" to "anon";

grant delete on table "public"."contributions" to "authenticated";

grant insert on table "public"."contributions" to "authenticated";

grant references on table "public"."contributions" to "authenticated";

grant select on table "public"."contributions" to "authenticated";

grant trigger on table "public"."contributions" to "authenticated";

grant truncate on table "public"."contributions" to "authenticated";

grant update on table "public"."contributions" to "authenticated";

grant delete on table "public"."contributions" to "service_role";

grant insert on table "public"."contributions" to "service_role";

grant references on table "public"."contributions" to "service_role";

grant select on table "public"."contributions" to "service_role";

grant trigger on table "public"."contributions" to "service_role";

grant truncate on table "public"."contributions" to "service_role";

grant update on table "public"."contributions" to "service_role";

grant delete on table "public"."event_members" to "anon";

grant insert on table "public"."event_members" to "anon";

grant references on table "public"."event_members" to "anon";

grant select on table "public"."event_members" to "anon";

grant trigger on table "public"."event_members" to "anon";

grant truncate on table "public"."event_members" to "anon";

grant update on table "public"."event_members" to "anon";

grant delete on table "public"."event_members" to "authenticated";

grant insert on table "public"."event_members" to "authenticated";

grant references on table "public"."event_members" to "authenticated";

grant select on table "public"."event_members" to "authenticated";

grant trigger on table "public"."event_members" to "authenticated";

grant truncate on table "public"."event_members" to "authenticated";

grant update on table "public"."event_members" to "authenticated";

grant delete on table "public"."event_members" to "service_role";

grant insert on table "public"."event_members" to "service_role";

grant references on table "public"."event_members" to "service_role";

grant select on table "public"."event_members" to "service_role";

grant trigger on table "public"."event_members" to "service_role";

grant truncate on table "public"."event_members" to "service_role";

grant update on table "public"."event_members" to "service_role";

grant delete on table "public"."events" to "anon";

grant insert on table "public"."events" to "anon";

grant references on table "public"."events" to "anon";

grant select on table "public"."events" to "anon";

grant trigger on table "public"."events" to "anon";

grant truncate on table "public"."events" to "anon";

grant update on table "public"."events" to "anon";

grant delete on table "public"."events" to "authenticated";

grant insert on table "public"."events" to "authenticated";

grant references on table "public"."events" to "authenticated";

grant select on table "public"."events" to "authenticated";

grant trigger on table "public"."events" to "authenticated";

grant truncate on table "public"."events" to "authenticated";

grant update on table "public"."events" to "authenticated";

grant delete on table "public"."events" to "service_role";

grant insert on table "public"."events" to "service_role";

grant references on table "public"."events" to "service_role";

grant select on table "public"."events" to "service_role";

grant trigger on table "public"."events" to "service_role";

grant truncate on table "public"."events" to "service_role";

grant update on table "public"."events" to "service_role";

grant delete on table "public"."profiles" to "anon";

grant insert on table "public"."profiles" to "anon";

grant references on table "public"."profiles" to "anon";

grant select on table "public"."profiles" to "anon";

grant trigger on table "public"."profiles" to "anon";

grant truncate on table "public"."profiles" to "anon";

grant update on table "public"."profiles" to "anon";

grant delete on table "public"."profiles" to "authenticated";

grant insert on table "public"."profiles" to "authenticated";

grant references on table "public"."profiles" to "authenticated";

grant select on table "public"."profiles" to "authenticated";

grant trigger on table "public"."profiles" to "authenticated";

grant truncate on table "public"."profiles" to "authenticated";

grant update on table "public"."profiles" to "authenticated";

grant delete on table "public"."profiles" to "service_role";

grant insert on table "public"."profiles" to "service_role";

grant references on table "public"."profiles" to "service_role";

grant select on table "public"."profiles" to "service_role";

grant trigger on table "public"."profiles" to "service_role";

grant truncate on table "public"."profiles" to "service_role";

grant update on table "public"."profiles" to "service_role";

grant delete on table "public"."reflections" to "anon";

grant insert on table "public"."reflections" to "anon";

grant references on table "public"."reflections" to "anon";

grant select on table "public"."reflections" to "anon";

grant trigger on table "public"."reflections" to "anon";

grant truncate on table "public"."reflections" to "anon";

grant update on table "public"."reflections" to "anon";

grant delete on table "public"."reflections" to "authenticated";

grant insert on table "public"."reflections" to "authenticated";

grant references on table "public"."reflections" to "authenticated";

grant select on table "public"."reflections" to "authenticated";

grant trigger on table "public"."reflections" to "authenticated";

grant truncate on table "public"."reflections" to "authenticated";

grant update on table "public"."reflections" to "authenticated";

grant delete on table "public"."reflections" to "service_role";

grant insert on table "public"."reflections" to "service_role";

grant references on table "public"."reflections" to "service_role";

grant select on table "public"."reflections" to "service_role";

grant trigger on table "public"."reflections" to "service_role";

grant truncate on table "public"."reflections" to "service_role";

grant update on table "public"."reflections" to "service_role";

grant delete on table "public"."testimonial_requests" to "anon";

grant insert on table "public"."testimonial_requests" to "anon";

grant references on table "public"."testimonial_requests" to "anon";

grant select on table "public"."testimonial_requests" to "anon";

grant trigger on table "public"."testimonial_requests" to "anon";

grant truncate on table "public"."testimonial_requests" to "anon";

grant update on table "public"."testimonial_requests" to "anon";

grant delete on table "public"."testimonial_requests" to "authenticated";

grant insert on table "public"."testimonial_requests" to "authenticated";

grant references on table "public"."testimonial_requests" to "authenticated";

grant select on table "public"."testimonial_requests" to "authenticated";

grant trigger on table "public"."testimonial_requests" to "authenticated";

grant truncate on table "public"."testimonial_requests" to "authenticated";

grant update on table "public"."testimonial_requests" to "authenticated";

grant delete on table "public"."testimonial_requests" to "service_role";

grant insert on table "public"."testimonial_requests" to "service_role";

grant references on table "public"."testimonial_requests" to "service_role";

grant select on table "public"."testimonial_requests" to "service_role";

grant trigger on table "public"."testimonial_requests" to "service_role";

grant truncate on table "public"."testimonial_requests" to "service_role";

grant update on table "public"."testimonial_requests" to "service_role";

grant delete on table "public"."testimonials" to "anon";

grant insert on table "public"."testimonials" to "anon";

grant references on table "public"."testimonials" to "anon";

grant select on table "public"."testimonials" to "anon";

grant trigger on table "public"."testimonials" to "anon";

grant truncate on table "public"."testimonials" to "anon";

grant update on table "public"."testimonials" to "anon";

grant delete on table "public"."testimonials" to "authenticated";

grant insert on table "public"."testimonials" to "authenticated";

grant references on table "public"."testimonials" to "authenticated";

grant select on table "public"."testimonials" to "authenticated";

grant trigger on table "public"."testimonials" to "authenticated";

grant truncate on table "public"."testimonials" to "authenticated";

grant update on table "public"."testimonials" to "authenticated";

grant delete on table "public"."testimonials" to "service_role";

grant insert on table "public"."testimonials" to "service_role";

grant references on table "public"."testimonials" to "service_role";

grant select on table "public"."testimonials" to "service_role";

grant trigger on table "public"."testimonials" to "service_role";

grant truncate on table "public"."testimonials" to "service_role";

grant update on table "public"."testimonials" to "service_role";


  create policy "Admins manage all attendance"
  on "public"."attendance"
  as permissive
  for all
  to public
using ((((auth.jwt() -> 'user_metadata'::text) ->> 'role'::text) = 'admin'::text));



  create policy "Members read own attendance"
  on "public"."attendance"
  as permissive
  for select
  to public
using ((auth.uid() = user_id));



  create policy "Admins read all contributions"
  on "public"."contributions"
  as permissive
  for select
  to public
using ((((auth.jwt() -> 'user_metadata'::text) ->> 'role'::text) = 'admin'::text));



  create policy "Members insert own contributions"
  on "public"."contributions"
  as permissive
  for insert
  to public
with check ((auth.uid() = user_id));



  create policy "Members read own contributions"
  on "public"."contributions"
  as permissive
  for select
  to public
using ((auth.uid() = user_id));



  create policy "admins_insert_any_contribution"
  on "public"."contributions"
  as permissive
  for insert
  to public
with check ((EXISTS ( SELECT 1
   FROM public.profiles
  WHERE ((profiles.id = auth.uid()) AND (profiles.role = 'admin'::text)))));



  create policy "members_update_own_contributions_until_done"
  on "public"."contributions"
  as permissive
  for update
  to public
using (((auth.uid() = user_id) AND (EXISTS ( SELECT 1
   FROM public.event_members
  WHERE ((event_members.user_id = auth.uid()) AND (event_members.event_id = contributions.event_id) AND (event_members.pillar_status <> 'done'::text))))));



  create policy "Admins manage event_members"
  on "public"."event_members"
  as permissive
  for all
  to public
using ((((auth.jwt() -> 'user_metadata'::text) ->> 'role'::text) = 'admin'::text));



  create policy "Admins read all event_members"
  on "public"."event_members"
  as permissive
  for select
  to public
using ((((auth.jwt() -> 'user_metadata'::text) ->> 'role'::text) = 'admin'::text));



  create policy "Members read own event_members"
  on "public"."event_members"
  as permissive
  for select
  to public
using ((auth.uid() = user_id));



  create policy "members_update_own_pillar_status"
  on "public"."event_members"
  as permissive
  for update
  to public
using ((auth.uid() = user_id))
with check (((auth.uid() = user_id) AND (pillar_status = ANY (ARRAY['new'::text, 'in_progress'::text, 'in_review'::text]))));



  create policy "Admins insert events"
  on "public"."events"
  as permissive
  for insert
  to public
with check ((((auth.jwt() -> 'user_metadata'::text) ->> 'role'::text) = 'admin'::text));



  create policy "Admins update events"
  on "public"."events"
  as permissive
  for update
  to public
using ((((auth.jwt() -> 'user_metadata'::text) ->> 'role'::text) = 'admin'::text));



  create policy "Authenticated users read events"
  on "public"."events"
  as permissive
  for select
  to public
using ((auth.role() = 'authenticated'::text));



  create policy "Members update own profile"
  on "public"."profiles"
  as permissive
  for update
  to public
using ((auth.uid() = id))
with check ((role = ( SELECT profiles_1.role
   FROM public.profiles profiles_1
  WHERE (profiles_1.id = auth.uid()))));



  create policy "Profiles: owner or admin can select"
  on "public"."profiles"
  as permissive
  for select
  to public
using (((auth.uid() = id) OR (((auth.jwt() -> 'user_metadata'::text) ->> 'role'::text) = 'admin'::text)));



  create policy "Admins read all reflections"
  on "public"."reflections"
  as permissive
  for select
  to public
using ((((auth.jwt() -> 'user_metadata'::text) ->> 'role'::text) = 'admin'::text));



  create policy "Members read own reflections"
  on "public"."reflections"
  as permissive
  for select
  to public
using ((auth.uid() = user_id));



  create policy "Members write own reflections"
  on "public"."reflections"
  as permissive
  for all
  to public
using ((auth.uid() = user_id));



  create policy "admins_update_all_reflections"
  on "public"."reflections"
  as permissive
  for update
  to public
using ((EXISTS ( SELECT 1
   FROM public.profiles
  WHERE ((profiles.id = auth.uid()) AND (profiles.role = 'admin'::text)))));



  create policy "members_update_own_reflections_until_archived"
  on "public"."reflections"
  as permissive
  for update
  to public
using (((auth.uid() = user_id) AND (status = 'pending'::text)));



  create policy "Admins manage all requests"
  on "public"."testimonial_requests"
  as permissive
  for all
  to public
using ((((auth.jwt() -> 'user_metadata'::text) ->> 'role'::text) = 'admin'::text));



  create policy "Members insert own request"
  on "public"."testimonial_requests"
  as permissive
  for insert
  to public
with check ((auth.uid() = user_id));



  create policy "Members read own request"
  on "public"."testimonial_requests"
  as permissive
  for select
  to public
using ((auth.uid() = user_id));



  create policy "Admins manage all testimonials"
  on "public"."testimonials"
  as permissive
  for all
  to public
using ((((auth.jwt() -> 'user_metadata'::text) ->> 'role'::text) = 'admin'::text));



  create policy "Members read own testimonial"
  on "public"."testimonials"
  as permissive
  for select
  to public
using ((auth.uid() = user_id));



  create policy "admins_update_all_testimonials"
  on "public"."testimonials"
  as permissive
  for update
  to public
using ((EXISTS ( SELECT 1
   FROM public.profiles
  WHERE ((profiles.id = auth.uid()) AND (profiles.role = 'admin'::text)))));


CREATE TRIGGER attendance_updated_at BEFORE UPDATE ON public.attendance FOR EACH ROW EXECUTE FUNCTION public.update_updated_at_column();

CREATE TRIGGER contributions_updated_at BEFORE UPDATE ON public.contributions FOR EACH ROW EXECUTE FUNCTION public.update_updated_at_column();

CREATE TRIGGER event_members_updated_at BEFORE UPDATE ON public.event_members FOR EACH ROW EXECUTE FUNCTION public.update_updated_at_column();

CREATE TRIGGER trigger_enforce_pillar_transitions BEFORE UPDATE OF pillar_status ON public.event_members FOR EACH ROW EXECUTE FUNCTION public.enforce_member_pillar_transitions();

CREATE TRIGGER events_updated_at BEFORE UPDATE ON public.events FOR EACH ROW EXECUTE FUNCTION public.update_updated_at_column();

CREATE TRIGGER profiles_updated_at BEFORE UPDATE ON public.profiles FOR EACH ROW EXECUTE FUNCTION public.update_updated_at_column();

CREATE TRIGGER reflections_updated_at BEFORE UPDATE ON public.reflections FOR EACH ROW EXECUTE FUNCTION public.update_updated_at_column();

CREATE TRIGGER testimonial_requests_updated_at BEFORE UPDATE ON public.testimonial_requests FOR EACH ROW EXECUTE FUNCTION public.update_updated_at_column();

CREATE TRIGGER testimonials_updated_at BEFORE UPDATE ON public.testimonials FOR EACH ROW EXECUTE FUNCTION public.update_updated_at_column();

CREATE TRIGGER on_auth_user_created AFTER INSERT ON auth.users FOR EACH ROW EXECUTE FUNCTION public.handle_new_user();

