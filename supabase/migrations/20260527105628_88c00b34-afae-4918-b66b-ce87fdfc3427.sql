
-- 1) Reminder dedupe column on appointments
ALTER TABLE public.appointments
  ADD COLUMN IF NOT EXISTS confirmation_reminder_sent_at TIMESTAMPTZ NULL;

CREATE INDEX IF NOT EXISTS idx_appointments_pending_confirmation
  ON public.appointments (salon_id, end_time)
  WHERE status IN ('booked', 'confirmed') AND confirmation_reminder_sent_at IS NULL;

-- 2) Autopilot pipeline sequences (1 → 5 client journey)
CREATE TABLE IF NOT EXISTS public.autopilot_pipeline_sequences (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  salon_id UUID NOT NULL,
  variant TEXT NOT NULL DEFAULT 'default',     -- 'default' | 'ads'
  stage TEXT NOT NULL,                          -- 'before_1','after_1','between_1_2','after_2','between_2_3','between_3_4','between_4_5','after_5'
  delay_hours INTEGER NOT NULL DEFAULT 24,
  channel TEXT NOT NULL DEFAULT 'sms',          -- 'sms' | 'email' | 'push'
  subject TEXT NULL,
  body TEXT NOT NULL DEFAULT '',
  is_active BOOLEAN NOT NULL DEFAULT true,
  tag_filter TEXT NULL,                         -- e.g. 'ads' for ads-variant tag-match
  sort_order INTEGER NOT NULL DEFAULT 0,
  created_at TIMESTAMPTZ NOT NULL DEFAULT now(),
  updated_at TIMESTAMPTZ NOT NULL DEFAULT now(),
  CONSTRAINT autopilot_pipeline_sequences_variant_check CHECK (variant IN ('default','ads')),
  CONSTRAINT autopilot_pipeline_sequences_channel_check CHECK (channel IN ('sms','email','push'))
);

GRANT SELECT, INSERT, UPDATE, DELETE ON public.autopilot_pipeline_sequences TO authenticated;
GRANT ALL ON public.autopilot_pipeline_sequences TO service_role;

ALTER TABLE public.autopilot_pipeline_sequences ENABLE ROW LEVEL SECURITY;

CREATE POLICY "Salon owners manage pipeline sequences"
  ON public.autopilot_pipeline_sequences
  FOR ALL
  TO authenticated
  USING (
    EXISTS (SELECT 1 FROM public.salons s WHERE s.id = autopilot_pipeline_sequences.salon_id AND s.owner_id = auth.uid())
    OR has_role(auth.uid(), 'super_admin'::app_role)
  )
  WITH CHECK (
    EXISTS (SELECT 1 FROM public.salons s WHERE s.id = autopilot_pipeline_sequences.salon_id AND s.owner_id = auth.uid())
    OR has_role(auth.uid(), 'super_admin'::app_role)
  );

CREATE POLICY "Salon staff view pipeline sequences"
  ON public.autopilot_pipeline_sequences
  FOR SELECT
  TO authenticated
  USING (user_belongs_to_salon(auth.uid(), salon_id));

CREATE INDEX IF NOT EXISTS idx_pipeline_sequences_salon
  ON public.autopilot_pipeline_sequences (salon_id, variant, stage);

CREATE TRIGGER trg_pipeline_sequences_updated_at
  BEFORE UPDATE ON public.autopilot_pipeline_sequences
  FOR EACH ROW EXECUTE FUNCTION public.update_updated_at_column();
