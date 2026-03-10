ALTER TABLE public.salons ADD COLUMN IF NOT EXISTS salon_type text DEFAULT 'multi';
ALTER TABLE public.salons ADD COLUMN IF NOT EXISTS team_size integer DEFAULT 1;
ALTER TABLE public.salons ADD COLUMN IF NOT EXISTS social_url text;