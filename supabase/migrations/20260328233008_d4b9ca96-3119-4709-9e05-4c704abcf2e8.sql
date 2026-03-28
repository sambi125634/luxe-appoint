
CREATE TABLE IF NOT EXISTS public.service_consultation_cards (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  service_id UUID REFERENCES public.services(id) ON DELETE CASCADE NOT NULL,
  card_id UUID REFERENCES public.consultation_templates(id) ON DELETE CASCADE NOT NULL,
  send_timing TEXT DEFAULT 'before_appointment' CHECK (send_timing IN ('at_booking', 'before_appointment', 'manual_only')),
  send_hours_before INTEGER DEFAULT 24,
  is_required BOOLEAN DEFAULT true,
  created_at TIMESTAMPTZ DEFAULT now(),
  UNIQUE(service_id, card_id)
);

CREATE TABLE IF NOT EXISTS public.consultation_sends (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  salon_id UUID REFERENCES public.salons(id) ON DELETE CASCADE NOT NULL,
  card_id UUID REFERENCES public.consultation_templates(id) ON DELETE SET NULL,
  client_id UUID REFERENCES public.clients(id) ON DELETE SET NULL,
  appointment_id UUID REFERENCES public.appointments(id) ON DELETE SET NULL,
  sent_at TIMESTAMPTZ DEFAULT now(),
  send_method TEXT DEFAULT 'link' CHECK (send_method IN ('link', 'sms', 'email')),
  status TEXT DEFAULT 'sent' CHECK (status IN ('sent', 'opened', 'completed', 'expired')),
  completed_at TIMESTAMPTZ,
  expires_at TIMESTAMPTZ,
  unique_token TEXT UNIQUE DEFAULT encode(gen_random_bytes(16), 'hex')
);

ALTER TABLE public.service_consultation_cards ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.consultation_sends ENABLE ROW LEVEL SECURITY;

CREATE POLICY "Salon owners manage service consultation cards"
  ON public.service_consultation_cards FOR ALL
  TO authenticated
  USING (EXISTS (
    SELECT 1 FROM public.services s
    JOIN public.salons sl ON sl.id = s.salon_id
    WHERE s.id = service_consultation_cards.service_id 
      AND sl.owner_id = auth.uid()
  ) OR has_role(auth.uid(), 'super_admin'::app_role));

CREATE POLICY "Users can view service consultation cards"
  ON public.service_consultation_cards FOR SELECT
  TO authenticated
  USING (EXISTS (
    SELECT 1 FROM public.services s
    WHERE s.id = service_consultation_cards.service_id 
      AND user_belongs_to_salon(auth.uid(), s.salon_id)
  ) OR has_role(auth.uid(), 'super_admin'::app_role));

CREATE POLICY "Salon owners manage consultation sends"
  ON public.consultation_sends FOR ALL
  TO authenticated
  USING (EXISTS (
    SELECT 1 FROM public.salons
    WHERE id = consultation_sends.salon_id AND owner_id = auth.uid()
  ) OR has_role(auth.uid(), 'super_admin'::app_role));

CREATE POLICY "Users can view consultation sends"
  ON public.consultation_sends FOR SELECT
  TO authenticated
  USING (user_belongs_to_salon(auth.uid(), consultation_sends.salon_id) OR has_role(auth.uid(), 'super_admin'::app_role));

ALTER TABLE public.consultation_templates
  ADD COLUMN IF NOT EXISTS category TEXT DEFAULT 'general',
  ADD COLUMN IF NOT EXISTS estimated_minutes INTEGER DEFAULT 3;
