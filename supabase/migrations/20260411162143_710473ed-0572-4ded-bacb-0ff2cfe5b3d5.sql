
-- Create loyalty_rewards table
CREATE TABLE public.loyalty_rewards (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  salon_id UUID REFERENCES public.salons(id) ON DELETE CASCADE NOT NULL,
  name TEXT NOT NULL,
  description TEXT,
  points_required INTEGER NOT NULL DEFAULT 500,
  reward_type TEXT DEFAULT 'discount' CHECK (reward_type IN ('discount', 'free_service', 'product', 'custom')),
  reward_value DECIMAL(10,2),
  is_active BOOLEAN DEFAULT true,
  created_at TIMESTAMPTZ DEFAULT now()
);

ALTER TABLE public.loyalty_rewards ENABLE ROW LEVEL SECURITY;

CREATE POLICY "Anyone can view active rewards"
ON public.loyalty_rewards FOR SELECT
USING (is_active = true);

CREATE POLICY "Salon owners can manage rewards"
ON public.loyalty_rewards FOR ALL
TO authenticated
USING (
  EXISTS (SELECT 1 FROM public.salons WHERE salons.id = loyalty_rewards.salon_id AND salons.owner_id = auth.uid())
  OR has_role(auth.uid(), 'super_admin'::app_role)
);

-- Create loyalty_redemptions table
CREATE TABLE public.loyalty_redemptions (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id UUID NOT NULL,
  salon_id UUID REFERENCES public.salons(id) ON DELETE CASCADE NOT NULL,
  reward_id UUID REFERENCES public.loyalty_rewards(id) ON DELETE CASCADE NOT NULL,
  points_spent INTEGER NOT NULL,
  status TEXT DEFAULT 'pending' CHECK (status IN ('pending', 'confirmed', 'used', 'expired')),
  redemption_code TEXT UNIQUE NOT NULL,
  created_at TIMESTAMPTZ DEFAULT now(),
  expires_at TIMESTAMPTZ DEFAULT (now() + INTERVAL '30 days'),
  used_at TIMESTAMPTZ
);

ALTER TABLE public.loyalty_redemptions ENABLE ROW LEVEL SECURITY;

CREATE POLICY "Users can view own redemptions"
ON public.loyalty_redemptions FOR SELECT
TO authenticated
USING (auth.uid() = user_id);

CREATE POLICY "Users can create own redemptions"
ON public.loyalty_redemptions FOR INSERT
TO authenticated
WITH CHECK (auth.uid() = user_id);

CREATE POLICY "Salon owners can view salon redemptions"
ON public.loyalty_redemptions FOR SELECT
TO authenticated
USING (
  EXISTS (SELECT 1 FROM public.salons WHERE salons.id = loyalty_redemptions.salon_id AND salons.owner_id = auth.uid())
  OR has_role(auth.uid(), 'super_admin'::app_role)
);

CREATE POLICY "Salon owners can update salon redemptions"
ON public.loyalty_redemptions FOR UPDATE
TO authenticated
USING (
  EXISTS (SELECT 1 FROM public.salons WHERE salons.id = loyalty_redemptions.salon_id AND salons.owner_id = auth.uid())
  OR has_role(auth.uid(), 'super_admin'::app_role)
);

CREATE INDEX idx_loyalty_rewards_salon ON public.loyalty_rewards(salon_id);
CREATE INDEX idx_loyalty_redemptions_user ON public.loyalty_redemptions(user_id);
CREATE INDEX idx_loyalty_redemptions_salon ON public.loyalty_redemptions(salon_id);
