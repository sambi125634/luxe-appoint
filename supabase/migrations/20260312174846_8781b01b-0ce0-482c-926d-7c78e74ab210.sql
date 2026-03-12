
-- Function to seed default tags for a salon
CREATE OR REPLACE FUNCTION public.seed_default_client_tags(_salon_id uuid)
RETURNS void
LANGUAGE plpgsql
SECURITY DEFINER
SET search_path TO 'public'
AS $$
BEGIN
  INSERT INTO public.client_tags (salon_id, name, color, is_system, sort_order) VALUES
    -- Status
    (_salon_id, 'VIP', '#f59e0b', true, 1),
    (_salon_id, 'Nowy', '#22c55e', true, 2),
    (_salon_id, 'Stały', '#3b82f6', true, 3),
    (_salon_id, 'Problematyczny', '#ef4444', true, 4),
    -- Retencja
    (_salon_id, 'Zagrożony odejściem', '#f97316', true, 5),
    (_salon_id, 'Utracony', '#6b7280', true, 6),
    (_salon_id, 'Reaktywowany', '#10b981', true, 7),
    -- Wydatki
    (_salon_id, 'High-spender', '#a855f7', true, 8),
    (_salon_id, 'Budżetowy', '#64748b', true, 9),
    -- Rezerwacje
    (_salon_id, 'No-show', '#dc2626', true, 10),
    (_salon_id, 'Last-minute', '#eab308', true, 11),
    (_salon_id, 'Planista', '#0ea5e9', true, 12),
    (_salon_id, 'Piątek-fan', '#8b5cf6', true, 13),
    (_salon_id, 'Wieczorny', '#6366f1', true, 14),
    -- Lojalność
    (_salon_id, 'Ambasador', '#ec4899', true, 15),
    (_salon_id, 'Urodziny w tym miesiącu', '#f472b6', true, 16),
    -- Preferencje
    (_salon_id, 'Wrażliwa skóra', '#fb923c', true, 17),
    (_salon_id, 'Alergie', '#fbbf24', true, 18),
    -- Źródło
    (_salon_id, 'Instagram', '#e11d48', true, 19),
    (_salon_id, 'Polecenie', '#14b8a6', true, 20),
    (_salon_id, 'Google', '#2563eb', true, 21)
  ON CONFLICT DO NOTHING;
END;
$$;

-- Trigger function for new salons
CREATE OR REPLACE FUNCTION public.handle_new_salon_tags()
RETURNS trigger
LANGUAGE plpgsql
SECURITY DEFINER
SET search_path TO 'public'
AS $$
BEGIN
  PERFORM public.seed_default_client_tags(NEW.id);
  RETURN NEW;
END;
$$;

-- Create trigger on salons table
DROP TRIGGER IF EXISTS on_salon_created_seed_tags ON public.salons;
CREATE TRIGGER on_salon_created_seed_tags
  AFTER INSERT ON public.salons
  FOR EACH ROW EXECUTE FUNCTION public.handle_new_salon_tags();

-- Seed tags for all existing salons that don't have any
DO $$
DECLARE
  _salon_id uuid;
BEGIN
  FOR _salon_id IN
    SELECT id FROM public.salons
    WHERE id NOT IN (SELECT DISTINCT salon_id FROM public.client_tags)
  LOOP
    PERFORM public.seed_default_client_tags(_salon_id);
  END LOOP;
END;
$$;
