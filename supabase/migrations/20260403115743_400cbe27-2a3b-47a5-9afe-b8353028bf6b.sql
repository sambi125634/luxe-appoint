
-- Loyalty stamps (points per visit)
CREATE TABLE public.loyalty_stamps (
  id UUID NOT NULL DEFAULT gen_random_uuid() PRIMARY KEY,
  salon_id UUID NOT NULL REFERENCES public.salons(id) ON DELETE CASCADE,
  client_id UUID NOT NULL REFERENCES public.clients(id) ON DELETE CASCADE,
  user_id UUID NOT NULL,
  appointment_id UUID REFERENCES public.appointments(id) ON DELETE SET NULL,
  points INTEGER NOT NULL DEFAULT 10,
  reason TEXT NOT NULL DEFAULT 'visit',
  created_at TIMESTAMPTZ NOT NULL DEFAULT now()
);

ALTER TABLE public.loyalty_stamps ENABLE ROW LEVEL SECURITY;

CREATE POLICY "Users see own stamps" ON public.loyalty_stamps
  FOR SELECT USING (auth.uid() = user_id);

CREATE POLICY "Salon owners see salon stamps" ON public.loyalty_stamps
  FOR SELECT USING (
    EXISTS (SELECT 1 FROM public.salons WHERE id = salon_id AND owner_id = auth.uid())
  );

CREATE POLICY "Salon owners can insert stamps" ON public.loyalty_stamps
  FOR INSERT WITH CHECK (
    EXISTS (SELECT 1 FROM public.salons WHERE id = salon_id AND owner_id = auth.uid())
  );

CREATE INDEX idx_loyalty_stamps_user ON public.loyalty_stamps(user_id);
CREATE INDEX idx_loyalty_stamps_salon_client ON public.loyalty_stamps(salon_id, client_id);

-- Client coupons
CREATE TABLE public.client_coupons (
  id UUID NOT NULL DEFAULT gen_random_uuid() PRIMARY KEY,
  salon_id UUID NOT NULL REFERENCES public.salons(id) ON DELETE CASCADE,
  user_id UUID NOT NULL,
  title TEXT NOT NULL,
  description TEXT,
  discount_type TEXT NOT NULL DEFAULT 'percentage',
  discount_value NUMERIC NOT NULL DEFAULT 0,
  valid_until TIMESTAMPTZ,
  used_at TIMESTAMPTZ,
  is_active BOOLEAN NOT NULL DEFAULT true,
  created_at TIMESTAMPTZ NOT NULL DEFAULT now()
);

ALTER TABLE public.client_coupons ENABLE ROW LEVEL SECURITY;

CREATE POLICY "Users see own coupons" ON public.client_coupons
  FOR SELECT USING (auth.uid() = user_id);

CREATE POLICY "Salon owners manage coupons" ON public.client_coupons
  FOR ALL USING (
    EXISTS (SELECT 1 FROM public.salons WHERE id = salon_id AND owner_id = auth.uid())
  );

CREATE INDEX idx_client_coupons_user ON public.client_coupons(user_id);

-- Client reviews
CREATE TABLE public.client_reviews (
  id UUID NOT NULL DEFAULT gen_random_uuid() PRIMARY KEY,
  salon_id UUID NOT NULL REFERENCES public.salons(id) ON DELETE CASCADE,
  user_id UUID NOT NULL,
  appointment_id UUID REFERENCES public.appointments(id) ON DELETE SET NULL,
  rating INTEGER NOT NULL CHECK (rating >= 1 AND rating <= 5),
  comment TEXT,
  is_public BOOLEAN NOT NULL DEFAULT true,
  created_at TIMESTAMPTZ NOT NULL DEFAULT now()
);

ALTER TABLE public.client_reviews ENABLE ROW LEVEL SECURITY;

CREATE POLICY "Users see own reviews" ON public.client_reviews
  FOR SELECT USING (auth.uid() = user_id);

CREATE POLICY "Public reviews visible to all" ON public.client_reviews
  FOR SELECT USING (is_public = true);

CREATE POLICY "Users can insert own reviews" ON public.client_reviews
  FOR INSERT WITH CHECK (auth.uid() = user_id);

CREATE POLICY "Salon owners see all salon reviews" ON public.client_reviews
  FOR SELECT USING (
    EXISTS (SELECT 1 FROM public.salons WHERE id = salon_id AND owner_id = auth.uid())
  );

CREATE INDEX idx_client_reviews_salon ON public.client_reviews(salon_id);
CREATE INDEX idx_client_reviews_user ON public.client_reviews(user_id);
CREATE UNIQUE INDEX idx_client_reviews_appointment ON public.client_reviews(appointment_id) WHERE appointment_id IS NOT NULL;

-- Client notifications (in-app)
CREATE TABLE public.client_notifications (
  id UUID NOT NULL DEFAULT gen_random_uuid() PRIMARY KEY,
  salon_id UUID NOT NULL REFERENCES public.salons(id) ON DELETE CASCADE,
  user_id UUID NOT NULL,
  type TEXT NOT NULL DEFAULT 'info',
  title TEXT NOT NULL,
  description TEXT,
  is_read BOOLEAN NOT NULL DEFAULT false,
  action_url TEXT,
  created_at TIMESTAMPTZ NOT NULL DEFAULT now()
);

ALTER TABLE public.client_notifications ENABLE ROW LEVEL SECURITY;

CREATE POLICY "Users see own notifications" ON public.client_notifications
  FOR SELECT USING (auth.uid() = user_id);

CREATE POLICY "Users can mark own as read" ON public.client_notifications
  FOR UPDATE USING (auth.uid() = user_id)
  WITH CHECK (auth.uid() = user_id);

CREATE POLICY "Salon owners can create notifications" ON public.client_notifications
  FOR INSERT WITH CHECK (
    EXISTS (SELECT 1 FROM public.salons WHERE id = salon_id AND owner_id = auth.uid())
  );

CREATE INDEX idx_client_notifications_user ON public.client_notifications(user_id, is_read);
