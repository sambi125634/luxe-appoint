
-- Fix last_visit_at auto-update trigger
CREATE OR REPLACE FUNCTION public.update_client_last_visit()
RETURNS TRIGGER AS $$
BEGIN
  IF NEW.status IN ('completed', 'confirmed') AND NEW.client_id IS NOT NULL THEN
    UPDATE public.clients
    SET 
      last_visit_at = NEW.start_time,
      purchase_categories = (
        SELECT ARRAY_AGG(DISTINCT sc.name)
        FROM public.appointments a
        JOIN public.services s ON s.id = a.service_id
        JOIN public.service_categories sc ON sc.id = s.category_id
        WHERE a.client_id = NEW.client_id
        AND a.status IN ('completed', 'confirmed')
        AND sc.name IS NOT NULL
      )
    WHERE id = NEW.client_id
      AND (last_visit_at IS NULL OR NEW.start_time > last_visit_at);
  END IF;
  RETURN NEW;
END;
$$ LANGUAGE plpgsql SECURITY DEFINER SET search_path = public;

-- Drop old trigger if exists and recreate
DROP TRIGGER IF EXISTS on_appointment_status_change ON public.appointments;
CREATE TRIGGER on_appointment_status_change
  AFTER INSERT OR UPDATE OF status ON public.appointments
  FOR EACH ROW EXECUTE FUNCTION public.update_client_last_visit();
