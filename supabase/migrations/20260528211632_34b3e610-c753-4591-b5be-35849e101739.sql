-- 1. Add google_review_url to salons
ALTER TABLE public.salons ADD COLUMN IF NOT EXISTS google_review_url text;

-- 2. Create booking_attempts table for Abandoned Booking module
CREATE TABLE IF NOT EXISTS public.booking_attempts (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  salon_id uuid NOT NULL REFERENCES public.salons(id) ON DELETE CASCADE,
  service_id uuid REFERENCES public.services(id) ON DELETE SET NULL,
  staff_id uuid REFERENCES public.staff_members(id) ON DELETE SET NULL,
  first_name text,
  phone text,
  email text,
  started_at timestamptz NOT NULL DEFAULT now(),
  completed_at timestamptz,
  reminded_at timestamptz,
  metadata jsonb NOT NULL DEFAULT '{}'::jsonb,
  created_at timestamptz NOT NULL DEFAULT now()
);

CREATE INDEX IF NOT EXISTS idx_booking_attempts_salon_started
  ON public.booking_attempts(salon_id, started_at DESC);
CREATE INDEX IF NOT EXISTS idx_booking_attempts_pending
  ON public.booking_attempts(salon_id) WHERE completed_at IS NULL AND reminded_at IS NULL;

GRANT SELECT, INSERT, UPDATE ON public.booking_attempts TO anon;
GRANT SELECT, INSERT, UPDATE, DELETE ON public.booking_attempts TO authenticated;
GRANT ALL ON public.booking_attempts TO service_role;

ALTER TABLE public.booking_attempts ENABLE ROW LEVEL SECURITY;

-- Salon team can view/edit their own attempts
CREATE POLICY "Salon team views booking_attempts"
  ON public.booking_attempts FOR SELECT TO authenticated
  USING (public.user_belongs_to_salon(auth.uid(), salon_id));

CREATE POLICY "Salon team updates booking_attempts"
  ON public.booking_attempts FOR UPDATE TO authenticated
  USING (public.user_belongs_to_salon(auth.uid(), salon_id));

CREATE POLICY "Salon team deletes booking_attempts"
  ON public.booking_attempts FOR DELETE TO authenticated
  USING (public.user_belongs_to_salon(auth.uid(), salon_id));

-- Public widget can insert attempts (anonymous booking funnel tracking)
CREATE POLICY "Anyone can create booking_attempts"
  ON public.booking_attempts FOR INSERT TO anon, authenticated
  WITH CHECK (true);

-- Public widget can mark its own attempt as completed (no auth on widget)
CREATE POLICY "Anyone can update own booking_attempts"
  ON public.booking_attempts FOR UPDATE TO anon
  USING (true) WITH CHECK (true);
