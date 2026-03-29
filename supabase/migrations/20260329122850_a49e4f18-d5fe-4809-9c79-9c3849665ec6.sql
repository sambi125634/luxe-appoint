
-- Add tracking columns to retention_messages (opened_at and clicked_at already exist)
ALTER TABLE public.retention_messages
  ADD COLUMN IF NOT EXISTS subject TEXT,
  ADD COLUMN IF NOT EXISTS preview_text TEXT,
  ADD COLUMN IF NOT EXISTS delivered_at TIMESTAMPTZ,
  ADD COLUMN IF NOT EXISTS bounced_at TIMESTAMPTZ,
  ADD COLUMN IF NOT EXISTS tracking_token TEXT UNIQUE DEFAULT encode(gen_random_bytes(16), 'hex'),
  ADD COLUMN IF NOT EXISTS metadata JSONB DEFAULT '{}'::jsonb;

-- Tracking events table
CREATE TABLE IF NOT EXISTS public.retention_tracking (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  message_id UUID REFERENCES public.retention_messages(id) ON DELETE CASCADE,
  event_type TEXT NOT NULL CHECK (event_type IN ('delivered', 'opened', 'clicked', 'bounced', 'unsubscribed')),
  event_at TIMESTAMPTZ DEFAULT now(),
  ip_address TEXT,
  user_agent TEXT,
  link_url TEXT
);

ALTER TABLE public.retention_tracking ENABLE ROW LEVEL SECURITY;

CREATE POLICY "Salon owners view tracking"
  ON public.retention_tracking FOR SELECT
  TO authenticated
  USING (EXISTS (
    SELECT 1 FROM public.retention_messages rm
    JOIN public.salons s ON s.id = rm.salon_id
    WHERE rm.id = retention_tracking.message_id
      AND s.owner_id = auth.uid()
  ) OR public.has_role(auth.uid(), 'super_admin'));
