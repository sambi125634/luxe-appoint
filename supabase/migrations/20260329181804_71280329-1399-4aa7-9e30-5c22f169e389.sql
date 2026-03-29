
-- Rozbuduj referral_codes
ALTER TABLE public.referral_codes
  ADD COLUMN IF NOT EXISTS reward_description TEXT,
  ADD COLUMN IF NOT EXISTS referee_reward_type TEXT DEFAULT 'discount_pln',
  ADD COLUMN IF NOT EXISTS referee_reward_value DECIMAL(10,2) DEFAULT 30,
  ADD COLUMN IF NOT EXISTS referee_reward_description TEXT,
  ADD COLUMN IF NOT EXISTS clicks INTEGER DEFAULT 0,
  ADD COLUMN IF NOT EXISTS activated_at TIMESTAMPTZ,
  ADD COLUMN IF NOT EXISTS expires_at TIMESTAMPTZ;

-- Rozbuduj review_requests
ALTER TABLE public.review_requests
  ADD COLUMN IF NOT EXISTS platform TEXT DEFAULT 'google',
  ADD COLUMN IF NOT EXISTS review_url TEXT,
  ADD COLUMN IF NOT EXISTS template_id TEXT,
  ADD COLUMN IF NOT EXISTS send_channel TEXT DEFAULT 'sms',
  ADD COLUMN IF NOT EXISTS nps_score INTEGER,
  ADD COLUMN IF NOT EXISTS opened_at TIMESTAMPTZ,
  ADD COLUMN IF NOT EXISTS review_stars INTEGER,
  ADD COLUMN IF NOT EXISTS tracking_token TEXT UNIQUE DEFAULT encode(gen_random_bytes(16), 'hex');

-- Konfiguracja programu poleceń per salon
CREATE TABLE IF NOT EXISTS public.referral_config (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  salon_id UUID REFERENCES public.salons(id) ON DELETE CASCADE NOT NULL UNIQUE,
  program_active BOOLEAN DEFAULT false,
  auto_activate_after_visits INTEGER DEFAULT 5,
  referrer_reward_type TEXT DEFAULT 'discount_pln',
  referrer_reward_value DECIMAL(10,2) DEFAULT 50,
  referrer_reward_description TEXT,
  referee_reward_type TEXT DEFAULT 'discount_pln',
  referee_reward_value DECIMAL(10,2) DEFAULT 30,
  referee_reward_description TEXT,
  google_review_url TEXT,
  facebook_review_url TEXT,
  auto_send_review_request BOOLEAN DEFAULT true,
  review_send_delay_hours INTEGER DEFAULT 2,
  review_send_channel TEXT DEFAULT 'sms',
  created_at TIMESTAMPTZ DEFAULT now(),
  updated_at TIMESTAMPTZ DEFAULT now()
);

ALTER TABLE public.referral_config ENABLE ROW LEVEL SECURITY;

CREATE POLICY "Salon owners manage referral config"
  ON public.referral_config FOR ALL TO authenticated
  USING (
    EXISTS (
      SELECT 1 FROM public.salons
      WHERE id = salon_id AND owner_id = auth.uid()
    ) OR has_role(auth.uid(), 'super_admin'::app_role)
  );
