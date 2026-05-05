ALTER TABLE public.event_members
  ADD COLUMN IF NOT EXISTS deadline timestamptz;
