ALTER TABLE public.salons
  ADD COLUMN IF NOT EXISTS communication_email TEXT,
  ADD COLUMN IF NOT EXISTS communication_email_verified BOOLEAN DEFAULT false,
  ADD COLUMN IF NOT EXISTS communication_phone TEXT,
  ADD COLUMN IF NOT EXISTS communication_phone_verified BOOLEAN DEFAULT false,
  ADD COLUMN IF NOT EXISTS communication_provider JSONB DEFAULT '{}'::jsonb,
  ADD COLUMN IF NOT EXISTS communication_setup_completed BOOLEAN DEFAULT false;