
-- retention_sequences: konfiguracja sekwencji A-E per salon
CREATE TABLE public.retention_sequences (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  salon_id uuid NOT NULL REFERENCES public.salons(id) ON DELETE CASCADE,
  sequence_key text NOT NULL,
  is_active boolean DEFAULT true,
  trigger_days integer NOT NULL,
  message_template text NOT NULL,
  tone text DEFAULT 'warm',
  include_incentive boolean DEFAULT false,
  incentive_details jsonb DEFAULT '{}',
  countdown_hours integer,
  created_at timestamptz DEFAULT now(),
  updated_at timestamptz DEFAULT now(),
  UNIQUE(salon_id, sequence_key)
);

ALTER TABLE public.retention_sequences ENABLE ROW LEVEL SECURITY;

CREATE POLICY "Salon owners can manage retention_sequences" ON public.retention_sequences
  FOR ALL TO authenticated
  USING (
    (EXISTS (SELECT 1 FROM salons WHERE salons.id = retention_sequences.salon_id AND salons.owner_id = auth.uid()))
    OR has_role(auth.uid(), 'super_admin'::app_role)
  );

CREATE POLICY "Users can view retention_sequences of their salon" ON public.retention_sequences
  FOR SELECT TO authenticated
  USING (user_belongs_to_salon(auth.uid(), salon_id) OR has_role(auth.uid(), 'super_admin'::app_role));

-- retention_messages: log wysłanych wiadomości retencyjnych
CREATE TABLE public.retention_messages (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  salon_id uuid NOT NULL REFERENCES public.salons(id) ON DELETE CASCADE,
  client_id uuid NOT NULL REFERENCES public.clients(id) ON DELETE CASCADE,
  sequence_id uuid REFERENCES public.retention_sequences(id) ON DELETE SET NULL,
  channel text NOT NULL DEFAULT 'sms',
  status text DEFAULT 'sent',
  message_content text,
  opened_at timestamptz,
  clicked_at timestamptz,
  created_at timestamptz DEFAULT now()
);

ALTER TABLE public.retention_messages ENABLE ROW LEVEL SECURITY;

CREATE POLICY "Salon owners can manage retention_messages" ON public.retention_messages
  FOR ALL TO authenticated
  USING (
    (EXISTS (SELECT 1 FROM salons WHERE salons.id = retention_messages.salon_id AND salons.owner_id = auth.uid()))
    OR has_role(auth.uid(), 'super_admin'::app_role)
  );

CREATE POLICY "Users can view retention_messages of their salon" ON public.retention_messages
  FOR SELECT TO authenticated
  USING (user_belongs_to_salon(auth.uid(), salon_id) OR has_role(auth.uid(), 'super_admin'::app_role));

-- retention_conversions: kiedy reaktywacja → rezerwacja
CREATE TABLE public.retention_conversions (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  salon_id uuid NOT NULL REFERENCES public.salons(id) ON DELETE CASCADE,
  client_id uuid NOT NULL REFERENCES public.clients(id) ON DELETE CASCADE,
  message_id uuid REFERENCES public.retention_messages(id) ON DELETE SET NULL,
  appointment_id uuid REFERENCES public.appointments(id) ON DELETE SET NULL,
  revenue_recovered numeric DEFAULT 0,
  created_at timestamptz DEFAULT now()
);

ALTER TABLE public.retention_conversions ENABLE ROW LEVEL SECURITY;

CREATE POLICY "Salon owners can manage retention_conversions" ON public.retention_conversions
  FOR ALL TO authenticated
  USING (
    (EXISTS (SELECT 1 FROM salons WHERE salons.id = retention_conversions.salon_id AND salons.owner_id = auth.uid()))
    OR has_role(auth.uid(), 'super_admin'::app_role)
  );

CREATE POLICY "Users can view retention_conversions of their salon" ON public.retention_conversions
  FOR SELECT TO authenticated
  USING (user_belongs_to_salon(auth.uid(), salon_id) OR has_role(auth.uid(), 'super_admin'::app_role));

-- client_communication_preferences
CREATE TABLE public.client_communication_preferences (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  client_id uuid NOT NULL UNIQUE REFERENCES public.clients(id) ON DELETE CASCADE,
  salon_id uuid NOT NULL REFERENCES public.salons(id) ON DELETE CASCADE,
  preferred_channel text DEFAULT 'sms',
  preferred_hour integer,
  preferred_day integer,
  opted_out boolean DEFAULT false,
  opted_out_at timestamptz,
  created_at timestamptz DEFAULT now(),
  updated_at timestamptz DEFAULT now()
);

ALTER TABLE public.client_communication_preferences ENABLE ROW LEVEL SECURITY;

CREATE POLICY "Salon owners can manage client_communication_preferences" ON public.client_communication_preferences
  FOR ALL TO authenticated
  USING (
    (EXISTS (SELECT 1 FROM salons WHERE salons.id = client_communication_preferences.salon_id AND salons.owner_id = auth.uid()))
    OR has_role(auth.uid(), 'super_admin'::app_role)
  );

CREATE POLICY "Users can view client_communication_preferences of their salon" ON public.client_communication_preferences
  FOR SELECT TO authenticated
  USING (user_belongs_to_salon(auth.uid(), salon_id) OR has_role(auth.uid(), 'super_admin'::app_role));
