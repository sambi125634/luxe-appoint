ALTER TABLE public.salons
  ADD COLUMN IF NOT EXISTS reschedule_notice_hours integer NOT NULL DEFAULT 24;