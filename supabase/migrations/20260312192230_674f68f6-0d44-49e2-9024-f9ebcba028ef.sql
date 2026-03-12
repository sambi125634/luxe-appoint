ALTER TABLE public.staff_members 
  ADD COLUMN IF NOT EXISTS bio text,
  ADD COLUMN IF NOT EXISTS specializations jsonb DEFAULT '[]'::jsonb,
  ADD COLUMN IF NOT EXISTS started_at date;