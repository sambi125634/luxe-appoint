
-- Trigger function: auto-seed autopilot_config for every new salon
CREATE OR REPLACE FUNCTION public.handle_new_salon_autopilot_config()
RETURNS trigger
LANGUAGE plpgsql
SECURITY DEFINER
SET search_path = public
AS $$
BEGIN
  INSERT INTO public.autopilot_config (salon_id)
  VALUES (NEW.id)
  ON CONFLICT (salon_id) DO NOTHING;
  RETURN NEW;
EXCEPTION WHEN OTHERS THEN
  RAISE WARNING 'handle_new_salon_autopilot_config failed for salon %: %', NEW.id, SQLERRM;
  RETURN NEW;
END;
$$;

DROP TRIGGER IF EXISTS trg_seed_autopilot_config_on_salon_insert ON public.salons;
CREATE TRIGGER trg_seed_autopilot_config_on_salon_insert
AFTER INSERT ON public.salons
FOR EACH ROW EXECUTE FUNCTION public.handle_new_salon_autopilot_config();

-- Backfill: create autopilot_config row for any existing salon that doesn't have one
INSERT INTO public.autopilot_config (salon_id)
SELECT s.id FROM public.salons s
LEFT JOIN public.autopilot_config ac ON ac.salon_id = s.id
WHERE ac.salon_id IS NULL;
