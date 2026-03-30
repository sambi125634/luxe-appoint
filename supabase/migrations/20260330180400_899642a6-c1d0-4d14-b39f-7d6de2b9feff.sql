
CREATE TABLE IF NOT EXISTS public.service_variants (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  service_id UUID REFERENCES public.services(id) ON DELETE CASCADE NOT NULL,
  name TEXT NOT NULL,
  description TEXT,
  duration INTEGER NOT NULL,
  price DECIMAL(10,2) NOT NULL,
  is_active BOOLEAN DEFAULT true,
  sort_order INTEGER DEFAULT 0,
  created_at TIMESTAMPTZ DEFAULT now()
);

ALTER TABLE public.service_variants ENABLE ROW LEVEL SECURITY;

CREATE POLICY "Public can view variants of active services"
  ON public.service_variants FOR SELECT
  TO public
  USING (EXISTS (
    SELECT 1 FROM public.services s
    JOIN public.salons sl ON sl.id = s.salon_id
    WHERE s.id = service_variants.service_id
      AND s.is_active = true
      AND sl.is_active = true
  ));

CREATE POLICY "Salon owners manage variants"
  ON public.service_variants FOR ALL
  TO authenticated
  USING (EXISTS (
    SELECT 1 FROM public.services s
    JOIN public.salons sl ON sl.id = s.salon_id
    WHERE s.id = service_variants.service_id
      AND (sl.owner_id = auth.uid() OR public.has_role(auth.uid(), 'super_admin'))
  ));

CREATE POLICY "Staff can view variants of their salon"
  ON public.service_variants FOR SELECT
  TO authenticated
  USING (EXISTS (
    SELECT 1 FROM public.services s
    WHERE s.id = service_variants.service_id
      AND public.user_belongs_to_salon(auth.uid(), s.salon_id)
  ));
