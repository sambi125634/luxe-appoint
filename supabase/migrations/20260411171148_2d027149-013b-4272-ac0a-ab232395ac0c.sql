-- Push notification history
CREATE TABLE public.push_notification_history (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  salon_id UUID NOT NULL REFERENCES salons(id) ON DELETE CASCADE,
  title TEXT NOT NULL,
  body TEXT NOT NULL,
  segment TEXT NOT NULL DEFAULT 'all',
  recipients_count INTEGER NOT NULL DEFAULT 0,
  opened_count INTEGER NOT NULL DEFAULT 0,
  sent_at TIMESTAMPTZ NOT NULL DEFAULT now(),
  created_at TIMESTAMPTZ NOT NULL DEFAULT now()
);

ALTER TABLE public.push_notification_history ENABLE ROW LEVEL SECURITY;

CREATE POLICY "Salon owners can manage push_notification_history"
ON public.push_notification_history FOR ALL
TO authenticated
USING (
  (EXISTS (SELECT 1 FROM salons WHERE salons.id = push_notification_history.salon_id AND salons.owner_id = auth.uid()))
  OR has_role(auth.uid(), 'super_admin'::app_role)
);

CREATE POLICY "Staff can view push_notification_history"
ON public.push_notification_history FOR SELECT
TO authenticated
USING (user_belongs_to_salon(auth.uid(), salon_id));

-- Birthday campaigns
CREATE TABLE public.birthday_campaigns (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  salon_id UUID NOT NULL REFERENCES salons(id) ON DELETE CASCADE UNIQUE,
  is_active BOOLEAN NOT NULL DEFAULT false,
  discount_type TEXT NOT NULL DEFAULT 'percentage',
  discount_value NUMERIC NOT NULL DEFAULT 15,
  send_days_before INTEGER NOT NULL DEFAULT 3,
  coupon_valid_days INTEGER NOT NULL DEFAULT 14,
  message_template TEXT NOT NULL DEFAULT 'Z okazji Twoich urodzin przygotowałyśmy dla Ciebie wyjątkowy prezent! 🎂',
  created_at TIMESTAMPTZ NOT NULL DEFAULT now(),
  updated_at TIMESTAMPTZ NOT NULL DEFAULT now()
);

ALTER TABLE public.birthday_campaigns ENABLE ROW LEVEL SECURITY;

CREATE POLICY "Salon owners can manage birthday_campaigns"
ON public.birthday_campaigns FOR ALL
TO authenticated
USING (
  (EXISTS (SELECT 1 FROM salons WHERE salons.id = birthday_campaigns.salon_id AND salons.owner_id = auth.uid()))
  OR has_role(auth.uid(), 'super_admin'::app_role)
);

CREATE POLICY "Staff can view birthday_campaigns"
ON public.birthday_campaigns FOR SELECT
TO authenticated
USING (user_belongs_to_salon(auth.uid(), salon_id));

-- Add missing columns to salons
ALTER TABLE public.salons
  ADD COLUMN IF NOT EXISTS cancellation_notice_hours INTEGER NOT NULL DEFAULT 24,
  ADD COLUMN IF NOT EXISTS vip_early_access_hours INTEGER NOT NULL DEFAULT 24,
  ADD COLUMN IF NOT EXISTS vip_min_visits INTEGER NOT NULL DEFAULT 5,
  ADD COLUMN IF NOT EXISTS welcome_message TEXT DEFAULT 'Witaj! Cieszymy się, że dołączyłaś do naszego salonu 🌸',
  ADD COLUMN IF NOT EXISTS splash_image_url TEXT,
  ADD COLUMN IF NOT EXISTS show_prices BOOLEAN NOT NULL DEFAULT true,
  ADD COLUMN IF NOT EXISTS show_staff_names BOOLEAN NOT NULL DEFAULT true,
  ADD COLUMN IF NOT EXISTS allow_staff_selection BOOLEAN NOT NULL DEFAULT true,
  ADD COLUMN IF NOT EXISTS allow_reschedule BOOLEAN NOT NULL DEFAULT true,
  ADD COLUMN IF NOT EXISTS allow_cancellation BOOLEAN NOT NULL DEFAULT true,
  ADD COLUMN IF NOT EXISTS allow_waitlist BOOLEAN NOT NULL DEFAULT true,
  ADD COLUMN IF NOT EXISTS advance_booking_days INTEGER NOT NULL DEFAULT 60,
  ADD COLUMN IF NOT EXISTS min_booking_notice_hours INTEGER NOT NULL DEFAULT 2,
  ADD COLUMN IF NOT EXISTS buffer_minutes INTEGER NOT NULL DEFAULT 15;