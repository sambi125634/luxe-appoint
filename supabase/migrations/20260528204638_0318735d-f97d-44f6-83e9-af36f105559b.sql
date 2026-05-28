
-- 1. Extend autopilot_actions
ALTER TABLE public.autopilot_actions
  ALTER COLUMN ai_explanation DROP NOT NULL,
  ALTER COLUMN ai_explanation SET DEFAULT '',
  ADD COLUMN IF NOT EXISTS module_key text,
  ADD COLUMN IF NOT EXISTS channel text,
  ADD COLUMN IF NOT EXISTS payload jsonb DEFAULT '{}'::jsonb,
  ADD COLUMN IF NOT EXISTS result jsonb DEFAULT '{}'::jsonb,
  ADD COLUMN IF NOT EXISTS revenue_recovered numeric(10,2) DEFAULT 0;

CREATE INDEX IF NOT EXISTS idx_autopilot_actions_salon_module ON public.autopilot_actions(salon_id, module_key, executed_at DESC);
CREATE INDEX IF NOT EXISTS idx_autopilot_actions_client_recent ON public.autopilot_actions(client_id, executed_at DESC) WHERE client_id IS NOT NULL;

-- 2. autopilot_module_settings
CREATE TABLE IF NOT EXISTS public.autopilot_module_settings (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  salon_id uuid NOT NULL REFERENCES public.salons(id) ON DELETE CASCADE,
  module_key text NOT NULL,
  config jsonb NOT NULL DEFAULT '{}'::jsonb,
  created_at timestamptz NOT NULL DEFAULT now(),
  updated_at timestamptz NOT NULL DEFAULT now(),
  UNIQUE (salon_id, module_key)
);

GRANT SELECT, INSERT, UPDATE, DELETE ON public.autopilot_module_settings TO authenticated;
GRANT ALL ON public.autopilot_module_settings TO service_role;

ALTER TABLE public.autopilot_module_settings ENABLE ROW LEVEL SECURITY;

CREATE POLICY "Salon owners manage module settings"
  ON public.autopilot_module_settings
  FOR ALL
  TO authenticated
  USING (
    EXISTS (SELECT 1 FROM public.salons s WHERE s.id = salon_id AND s.owner_id = auth.uid())
    OR public.has_role(auth.uid(), 'super_admin'::app_role)
  )
  WITH CHECK (
    EXISTS (SELECT 1 FROM public.salons s WHERE s.id = salon_id AND s.owner_id = auth.uid())
    OR public.has_role(auth.uid(), 'super_admin'::app_role)
  );

CREATE POLICY "Salon members view module settings"
  ON public.autopilot_module_settings
  FOR SELECT
  TO authenticated
  USING (
    public.user_belongs_to_salon(auth.uid(), salon_id)
    OR public.has_role(auth.uid(), 'super_admin'::app_role)
  );

CREATE TRIGGER update_autopilot_module_settings_updated_at
  BEFORE UPDATE ON public.autopilot_module_settings
  FOR EACH ROW EXECUTE FUNCTION public.update_updated_at_column();

-- 3. Add 16 module toggle flags to autopilot_config
ALTER TABLE public.autopilot_config
  ADD COLUMN IF NOT EXISTS vip_tomorrow_enabled boolean DEFAULT true,
  ADD COLUMN IF NOT EXISTS smart_reminder_enabled boolean DEFAULT true,
  ADD COLUMN IF NOT EXISTS noshow_recovery_enabled boolean DEFAULT true,
  ADD COLUMN IF NOT EXISTS flash_offer_enabled boolean DEFAULT false,
  ADD COLUMN IF NOT EXISTS weather_trigger_enabled boolean DEFAULT false,
  ADD COLUMN IF NOT EXISTS dead_hours_enabled boolean DEFAULT false,
  ADD COLUMN IF NOT EXISTS upsell_pre_visit_enabled boolean DEFAULT false,
  ADD COLUMN IF NOT EXISTS vip_radar_enabled boolean DEFAULT false,
  ADD COLUMN IF NOT EXISTS silent_ambassador_enabled boolean DEFAULT false,
  ADD COLUMN IF NOT EXISTS snowball_referral_enabled boolean DEFAULT false,
  ADD COLUMN IF NOT EXISTS first_visit_sequence_enabled boolean DEFAULT false,
  ADD COLUMN IF NOT EXISTS loyalty_engine_enabled boolean DEFAULT false,
  ADD COLUMN IF NOT EXISTS vacation_brain_enabled boolean DEFAULT false,
  ADD COLUMN IF NOT EXISTS review_guard_enabled boolean DEFAULT false,
  ADD COLUMN IF NOT EXISTS price_change_followup_enabled boolean DEFAULT false,
  ADD COLUMN IF NOT EXISTS profit_alarm_enabled boolean DEFAULT false,
  ADD COLUMN IF NOT EXISTS abandoned_booking_enabled boolean DEFAULT false,
  ADD COLUMN IF NOT EXISTS price_detector_enabled boolean DEFAULT false;

-- 4. Conversion attribution trigger
CREATE OR REPLACE FUNCTION public.attribute_autopilot_conversion()
RETURNS trigger
LANGUAGE plpgsql
SECURITY DEFINER
SET search_path = public
AS $$
DECLARE
  v_service_price numeric;
BEGIN
  IF NEW.client_id IS NULL THEN
    RETURN NEW;
  END IF;

  SELECT price INTO v_service_price FROM public.services WHERE id = NEW.service_id;

  UPDATE public.autopilot_actions
  SET
    status = 'converted',
    result = COALESCE(result, '{}'::jsonb) || jsonb_build_object(
      'converted_appointment_id', NEW.id,
      'converted_at', now()
    ),
    revenue_recovered = COALESCE(v_service_price, 0)
  WHERE client_id = NEW.client_id
    AND salon_id = NEW.salon_id
    AND status IN ('sent', 'executed', 'completed')
    AND executed_at IS NOT NULL
    AND executed_at > (now() - interval '72 hours')
    AND COALESCE(revenue_recovered, 0) = 0;

  RETURN NEW;
END;
$$;

DROP TRIGGER IF EXISTS attribute_autopilot_conversion_on_appointment ON public.appointments;
CREATE TRIGGER attribute_autopilot_conversion_on_appointment
  AFTER INSERT ON public.appointments
  FOR EACH ROW
  EXECUTE FUNCTION public.attribute_autopilot_conversion();

-- 5. Helper view: per-module stats
CREATE OR REPLACE VIEW public.autopilot_module_stats AS
SELECT
  salon_id,
  module_key,
  count(*) FILTER (WHERE status IN ('sent', 'executed', 'completed', 'converted')) AS total_sent,
  count(*) FILTER (WHERE status = 'converted') AS total_converted,
  COALESCE(sum(revenue_recovered), 0) AS revenue_recovered,
  max(executed_at) AS last_run_at
FROM public.autopilot_actions
WHERE module_key IS NOT NULL
GROUP BY salon_id, module_key;

GRANT SELECT ON public.autopilot_module_stats TO authenticated;
GRANT SELECT ON public.autopilot_module_stats TO service_role;
