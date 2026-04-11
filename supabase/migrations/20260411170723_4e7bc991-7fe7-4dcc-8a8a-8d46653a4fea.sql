
-- Table: beauty_rhythms
CREATE TABLE IF NOT EXISTS public.beauty_rhythms (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id UUID NOT NULL,
  salon_id UUID REFERENCES public.salons(id) ON DELETE CASCADE NOT NULL,
  service_id UUID REFERENCES public.services(id) ON DELETE SET NULL,
  service_name TEXT NOT NULL,
  avg_interval_days INTEGER NOT NULL,
  last_appointment_date DATE,
  next_reminder_date DATE,
  reminder_enabled BOOLEAN NOT NULL DEFAULT true,
  auto_detected BOOLEAN NOT NULL DEFAULT true,
  created_at TIMESTAMPTZ NOT NULL DEFAULT now(),
  updated_at TIMESTAMPTZ NOT NULL DEFAULT now(),
  UNIQUE(user_id, salon_id, service_id)
);

ALTER TABLE public.beauty_rhythms ENABLE ROW LEVEL SECURITY;

-- User sees own rhythms
CREATE POLICY "Users can view own rhythms"
  ON public.beauty_rhythms FOR SELECT
  USING (auth.uid() = user_id);

-- User can create own rhythms
CREATE POLICY "Users can create own rhythms"
  ON public.beauty_rhythms FOR INSERT
  WITH CHECK (auth.uid() = user_id);

-- User can update own rhythms
CREATE POLICY "Users can update own rhythms"
  ON public.beauty_rhythms FOR UPDATE
  USING (auth.uid() = user_id);

-- User can delete own rhythms
CREATE POLICY "Users can delete own rhythms"
  ON public.beauty_rhythms FOR DELETE
  USING (auth.uid() = user_id);

-- Salon owner can view rhythms for their salon
CREATE POLICY "Salon owner can view salon rhythms"
  ON public.beauty_rhythms FOR SELECT
  USING (public.user_belongs_to_salon(auth.uid(), salon_id));

-- Indexes
CREATE INDEX IF NOT EXISTS idx_beauty_rhythms_user ON public.beauty_rhythms(user_id);
CREATE INDEX IF NOT EXISTS idx_beauty_rhythms_next_reminder ON public.beauty_rhythms(next_reminder_date) WHERE reminder_enabled = true;

-- Trigger for updated_at
CREATE TRIGGER update_beauty_rhythms_updated_at
  BEFORE UPDATE ON public.beauty_rhythms
  FOR EACH ROW
  EXECUTE FUNCTION public.update_updated_at_column();

-- Function: calculate_visit_patterns
CREATE OR REPLACE FUNCTION public.calculate_visit_patterns()
RETURNS TABLE (
  client_id UUID,
  user_id UUID,
  salon_id UUID,
  service_id UUID,
  service_name TEXT,
  last_visit DATE,
  avg_interval_days INTEGER,
  visit_count BIGINT
)
LANGUAGE sql
STABLE
SECURITY DEFINER
SET search_path = public
AS $$
  WITH visit_intervals AS (
    SELECT
      a.client_id,
      a.salon_id,
      a.service_id,
      s.name AS service_name,
      a.start_time::date AS visit_date,
      EXTRACT(days FROM (
        a.start_time - LAG(a.start_time) OVER (
          PARTITION BY a.client_id, a.service_id
          ORDER BY a.start_time
        )
      ))::integer AS interval_days
    FROM public.appointments a
    JOIN public.services s ON s.id = a.service_id
    WHERE a.status = 'completed'
  )
  SELECT
    vi.client_id,
    csl.user_id,
    vi.salon_id,
    vi.service_id,
    vi.service_name,
    MAX(vi.visit_date) AS last_visit,
    ROUND(AVG(vi.interval_days))::integer AS avg_interval_days,
    COUNT(*) + 1 AS visit_count
  FROM visit_intervals vi
  JOIN public.client_salon_links csl ON csl.salon_id = vi.salon_id
  JOIN public.clients c ON c.id = vi.client_id AND c.salon_id = vi.salon_id
  JOIN public.profiles p ON p.id = csl.user_id AND p.email = c.email
  WHERE vi.interval_days IS NOT NULL
    AND vi.interval_days BETWEEN 7 AND 180
  GROUP BY vi.client_id, csl.user_id, vi.salon_id, vi.service_id, vi.service_name
  HAVING COUNT(*) >= 1
    AND ROUND(AVG(vi.interval_days))::integer BETWEEN 7 AND 180;
$$;
