
-- Consultation templates (card builder)
CREATE TABLE public.consultation_templates (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  salon_id uuid NOT NULL REFERENCES public.salons(id) ON DELETE CASCADE,
  name text NOT NULL,
  fields jsonb NOT NULL DEFAULT '[]'::jsonb,
  is_system boolean DEFAULT false,
  is_active boolean DEFAULT true,
  created_at timestamptz DEFAULT now(),
  updated_at timestamptz DEFAULT now()
);

ALTER TABLE public.consultation_templates ENABLE ROW LEVEL SECURITY;

CREATE POLICY "Salon owners can manage consultation_templates"
  ON public.consultation_templates FOR ALL TO authenticated
  USING ((EXISTS (SELECT 1 FROM salons WHERE salons.id = consultation_templates.salon_id AND salons.owner_id = auth.uid())) OR has_role(auth.uid(), 'super_admin'::app_role));

CREATE POLICY "Users can view consultation_templates of their salon"
  ON public.consultation_templates FOR SELECT TO authenticated
  USING (user_belongs_to_salon(auth.uid(), salon_id) OR has_role(auth.uid(), 'super_admin'::app_role));

-- Filled consultation cards
CREATE TABLE public.consultation_cards (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  salon_id uuid NOT NULL REFERENCES public.salons(id) ON DELETE CASCADE,
  client_id uuid NOT NULL REFERENCES public.clients(id) ON DELETE CASCADE,
  template_id uuid REFERENCES public.consultation_templates(id) ON DELETE SET NULL,
  responses jsonb NOT NULL DEFAULT '{}'::jsonb,
  signature_url text,
  red_flags text[] DEFAULT '{}'::text[],
  status text DEFAULT 'pending',
  filled_at timestamptz,
  created_at timestamptz DEFAULT now()
);

ALTER TABLE public.consultation_cards ENABLE ROW LEVEL SECURITY;

CREATE POLICY "Salon owners can manage consultation_cards"
  ON public.consultation_cards FOR ALL TO authenticated
  USING ((EXISTS (SELECT 1 FROM salons WHERE salons.id = consultation_cards.salon_id AND salons.owner_id = auth.uid())) OR has_role(auth.uid(), 'super_admin'::app_role));

CREATE POLICY "Users can view consultation_cards of their salon"
  ON public.consultation_cards FOR SELECT TO authenticated
  USING (user_belongs_to_salon(auth.uid(), salon_id) OR has_role(auth.uid(), 'super_admin'::app_role));

-- Voice notes
CREATE TABLE public.voice_notes (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  salon_id uuid NOT NULL REFERENCES public.salons(id) ON DELETE CASCADE,
  client_id uuid NOT NULL REFERENCES public.clients(id) ON DELETE CASCADE,
  staff_id uuid REFERENCES public.staff_members(id) ON DELETE SET NULL,
  appointment_id uuid REFERENCES public.appointments(id) ON DELETE SET NULL,
  audio_url text NOT NULL,
  duration_seconds integer,
  transcript text,
  ai_extracted jsonb DEFAULT '{}'::jsonb,
  created_at timestamptz DEFAULT now()
);

ALTER TABLE public.voice_notes ENABLE ROW LEVEL SECURITY;

CREATE POLICY "Salon owners can manage voice_notes"
  ON public.voice_notes FOR ALL TO authenticated
  USING ((EXISTS (SELECT 1 FROM salons WHERE salons.id = voice_notes.salon_id AND salons.owner_id = auth.uid())) OR has_role(auth.uid(), 'super_admin'::app_role));

CREATE POLICY "Users can view voice_notes of their salon"
  ON public.voice_notes FOR SELECT TO authenticated
  USING (user_belongs_to_salon(auth.uid(), salon_id) OR has_role(auth.uid(), 'super_admin'::app_role));
