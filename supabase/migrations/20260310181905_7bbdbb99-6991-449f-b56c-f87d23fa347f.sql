
-- Referral codes per client
CREATE TABLE public.referral_codes (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  salon_id uuid NOT NULL REFERENCES public.salons(id) ON DELETE CASCADE,
  client_id uuid NOT NULL REFERENCES public.clients(id) ON DELETE CASCADE,
  code text NOT NULL,
  referral_url text,
  reward_type text DEFAULT 'discount',
  reward_value numeric DEFAULT 0,
  new_client_reward_value numeric DEFAULT 0,
  total_referrals integer DEFAULT 0,
  total_revenue numeric DEFAULT 0,
  is_active boolean DEFAULT true,
  created_at timestamptz DEFAULT now(),
  updated_at timestamptz DEFAULT now(),
  UNIQUE(salon_id, code),
  UNIQUE(salon_id, client_id)
);

-- Referral events (clicks, bookings)
CREATE TABLE public.referral_events (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  salon_id uuid NOT NULL REFERENCES public.salons(id) ON DELETE CASCADE,
  referral_code_id uuid NOT NULL REFERENCES public.referral_codes(id) ON DELETE CASCADE,
  referrer_client_id uuid NOT NULL REFERENCES public.clients(id) ON DELETE CASCADE,
  referred_client_id uuid REFERENCES public.clients(id),
  appointment_id uuid REFERENCES public.appointments(id),
  event_type text NOT NULL DEFAULT 'click',
  revenue numeric DEFAULT 0,
  reward_given boolean DEFAULT false,
  reward_amount numeric DEFAULT 0,
  created_at timestamptz DEFAULT now()
);

-- Review requests
CREATE TABLE public.review_requests (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  salon_id uuid NOT NULL REFERENCES public.salons(id) ON DELETE CASCADE,
  client_id uuid NOT NULL REFERENCES public.clients(id) ON DELETE CASCADE,
  appointment_id uuid REFERENCES public.appointments(id),
  channel text DEFAULT 'sms',
  message_number integer DEFAULT 1,
  sent_at timestamptz DEFAULT now(),
  clicked_at timestamptz,
  status text DEFAULT 'sent',
  created_at timestamptz DEFAULT now()
);

-- Review outcomes
CREATE TABLE public.review_outcomes (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  salon_id uuid NOT NULL REFERENCES public.salons(id) ON DELETE CASCADE,
  client_id uuid NOT NULL REFERENCES public.clients(id) ON DELETE CASCADE,
  review_request_id uuid REFERENCES public.review_requests(id),
  platform text DEFAULT 'google',
  rating integer,
  review_text text,
  reward_sent boolean DEFAULT false,
  reward_type text,
  reward_value numeric DEFAULT 0,
  detected_at timestamptz DEFAULT now(),
  created_at timestamptz DEFAULT now()
);

-- Enable RLS
ALTER TABLE public.referral_codes ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.referral_events ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.review_requests ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.review_outcomes ENABLE ROW LEVEL SECURITY;

-- RLS policies
CREATE POLICY "Salon owners can manage referral_codes" ON public.referral_codes FOR ALL TO authenticated
  USING ((EXISTS (SELECT 1 FROM salons WHERE salons.id = referral_codes.salon_id AND salons.owner_id = auth.uid())) OR has_role(auth.uid(), 'super_admin'::app_role));

CREATE POLICY "Users can view referral_codes of their salon" ON public.referral_codes FOR SELECT TO authenticated
  USING (user_belongs_to_salon(auth.uid(), salon_id) OR has_role(auth.uid(), 'super_admin'::app_role));

CREATE POLICY "Salon owners can manage referral_events" ON public.referral_events FOR ALL TO authenticated
  USING ((EXISTS (SELECT 1 FROM salons WHERE salons.id = referral_events.salon_id AND salons.owner_id = auth.uid())) OR has_role(auth.uid(), 'super_admin'::app_role));

CREATE POLICY "Users can view referral_events of their salon" ON public.referral_events FOR SELECT TO authenticated
  USING (user_belongs_to_salon(auth.uid(), salon_id) OR has_role(auth.uid(), 'super_admin'::app_role));

CREATE POLICY "Salon owners can manage review_requests" ON public.review_requests FOR ALL TO authenticated
  USING ((EXISTS (SELECT 1 FROM salons WHERE salons.id = review_requests.salon_id AND salons.owner_id = auth.uid())) OR has_role(auth.uid(), 'super_admin'::app_role));

CREATE POLICY "Users can view review_requests of their salon" ON public.review_requests FOR SELECT TO authenticated
  USING (user_belongs_to_salon(auth.uid(), salon_id) OR has_role(auth.uid(), 'super_admin'::app_role));

CREATE POLICY "Salon owners can manage review_outcomes" ON public.review_outcomes FOR ALL TO authenticated
  USING ((EXISTS (SELECT 1 FROM salons WHERE salons.id = review_outcomes.salon_id AND salons.owner_id = auth.uid())) OR has_role(auth.uid(), 'super_admin'::app_role));

CREATE POLICY "Users can view review_outcomes of their salon" ON public.review_outcomes FOR SELECT TO authenticated
  USING (user_belongs_to_salon(auth.uid(), salon_id) OR has_role(auth.uid(), 'super_admin'::app_role));
