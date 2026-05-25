CREATE TABLE public.booking_widgets (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  salon_id UUID NOT NULL,
  name TEXT NOT NULL,
  slug TEXT NOT NULL,
  description TEXT,
  type TEXT NOT NULL DEFAULT 'campaign' CHECK (type IN ('main','campaign','promo')),
  is_active BOOLEAN NOT NULL DEFAULT true,
  show_all_services BOOLEAN NOT NULL DEFAULT true,
  service_ids UUID[] NOT NULL DEFAULT '{}',
  theme JSONB NOT NULL DEFAULT '{}'::jsonb,
  form_fields JSONB NOT NULL DEFAULT '[]'::jsonb,
  steps JSONB NOT NULL DEFAULT '[]'::jsonb,
  promotion JSONB,
  prepayment JSONB,
  advanced_settings JSONB,
  view_count INTEGER NOT NULL DEFAULT 0,
  booking_count INTEGER NOT NULL DEFAULT 0,
  created_at TIMESTAMPTZ NOT NULL DEFAULT now(),
  updated_at TIMESTAMPTZ NOT NULL DEFAULT now(),
  UNIQUE (salon_id, slug)
);

CREATE INDEX idx_booking_widgets_salon ON public.booking_widgets(salon_id);
CREATE INDEX idx_booking_widgets_slug ON public.booking_widgets(slug);

ALTER TABLE public.booking_widgets ENABLE ROW LEVEL SECURITY;

CREATE POLICY "Salon owners manage booking_widgets"
ON public.booking_widgets FOR ALL TO authenticated
USING (
  EXISTS (SELECT 1 FROM public.salons s WHERE s.id = booking_widgets.salon_id AND s.owner_id = auth.uid())
  OR public.has_role(auth.uid(), 'super_admin'::app_role)
)
WITH CHECK (
  EXISTS (SELECT 1 FROM public.salons s WHERE s.id = booking_widgets.salon_id AND s.owner_id = auth.uid())
  OR public.has_role(auth.uid(), 'super_admin'::app_role)
);

CREATE POLICY "Salon staff view booking_widgets"
ON public.booking_widgets FOR SELECT TO authenticated
USING (public.user_belongs_to_salon(auth.uid(), salon_id));

CREATE POLICY "Public can read active widgets"
ON public.booking_widgets FOR SELECT TO anon, authenticated
USING (
  is_active = true
  AND EXISTS (SELECT 1 FROM public.salons s WHERE s.id = booking_widgets.salon_id AND s.is_active = true)
);

CREATE TRIGGER trg_booking_widgets_updated
BEFORE UPDATE ON public.booking_widgets
FOR EACH ROW EXECUTE FUNCTION public.update_updated_at_column();