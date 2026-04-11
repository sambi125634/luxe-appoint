
ALTER TABLE public.profiles
  ADD COLUMN IF NOT EXISTS dark_mode boolean NOT NULL DEFAULT false,
  ADD COLUMN IF NOT EXISTS notifications_email boolean NOT NULL DEFAULT true,
  ADD COLUMN IF NOT EXISTS notifications_sms boolean NOT NULL DEFAULT true,
  ADD COLUMN IF NOT EXISTS notifications_push boolean NOT NULL DEFAULT true;
