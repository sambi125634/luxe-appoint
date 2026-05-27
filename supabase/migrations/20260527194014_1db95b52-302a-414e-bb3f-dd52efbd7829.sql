
-- Seeding function for default retention sequences
CREATE OR REPLACE FUNCTION public.seed_default_retention_sequences(p_salon_id uuid)
RETURNS void
LANGUAGE plpgsql
SECURITY DEFINER
SET search_path = public
AS $$
BEGIN
  INSERT INTO public.retention_sequences
    (salon_id, sequence_key, is_active, trigger_days, message_template, tone, include_incentive, incentive_details, countdown_hours)
  VALUES
    (p_salon_id, 'proactive', false, 0,
      '[Imię], minęło trochę czasu od Twojej wizyty [data]. Czy chcesz zarezerwować kolejną? Mam dla Ciebie wolne sloty.',
      'warm', false, '{}'::jsonb, NULL),
    (p_salon_id, '30day', false, 30,
      'Cześć [Imię]! Minął miesiąc od Twojej wizyty u nas — jak się czujesz po [zabieg]? Daj znać, jeśli chcesz umówić kolejny termin.',
      'warm', false, '{}'::jsonb, NULL),
    (p_salon_id, '45day', false, 45,
      '[Imię], tęsknimy za Tobą 🌸 Jak się miewasz? Mamy wolne terminy w tym tygodniu — zajrzysz?',
      'warm', false, '{}'::jsonb, NULL),
    (p_salon_id, '60day', false, 60,
      '[Imię], pamiętasz że robiłaś u nas [zabieg]? Efekty utrzymują się zwykle [X tygodni] — warto odświeżyć!',
      'educational', false, '{}'::jsonb, NULL),
    (p_salon_id, '75day', false, 75,
      'Hej [Imię], przygotowałam specjalną ofertę powrotu — ważną tylko 48 godzin!',
      'exclusive', true, '{"discount_percent": 20}'::jsonb, 48),
    (p_salon_id, '90day', false, 90,
      '[Imię], czy wszystko w porządku? Dawno Cię nie widziałyśmy...',
      'caring', false, '{}'::jsonb, NULL),
    (p_salon_id, '120day', false, 120,
      '[Imię], chcemy Cię odzyskać. Specjalna oferta powrotu tylko dla Ciebie — daj nam jeszcze jedną szansę.',
      'winback', true, '{"discount_percent": 30}'::jsonb, 72)
  ON CONFLICT (salon_id, sequence_key) DO NOTHING;
END;
$$;

-- Trigger function for new salons
CREATE OR REPLACE FUNCTION public.handle_new_salon_retention_sequences()
RETURNS trigger
LANGUAGE plpgsql
SECURITY DEFINER
SET search_path = public
AS $$
BEGIN
  PERFORM public.seed_default_retention_sequences(NEW.id);
  RETURN NEW;
END;
$$;

DROP TRIGGER IF EXISTS trg_salons_seed_retention_sequences ON public.salons;
CREATE TRIGGER trg_salons_seed_retention_sequences
AFTER INSERT ON public.salons
FOR EACH ROW
EXECUTE FUNCTION public.handle_new_salon_retention_sequences();

-- Backfill existing salons
DO $$
DECLARE
  s record;
BEGIN
  FOR s IN
    SELECT id FROM public.salons
    WHERE NOT EXISTS (
      SELECT 1 FROM public.retention_sequences rs WHERE rs.salon_id = salons.id
    )
  LOOP
    PERFORM public.seed_default_retention_sequences(s.id);
  END LOOP;
END $$;

-- Allow authenticated users to call the seeding RPC as a lazy fallback
GRANT EXECUTE ON FUNCTION public.seed_default_retention_sequences(uuid) TO authenticated;
