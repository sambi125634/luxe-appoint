
-- Table for tracking email events (opens, clicks, conversions)
CREATE TABLE public.email_tracking_events (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  salon_id UUID NOT NULL REFERENCES public.salons(id) ON DELETE CASCADE,
  client_id UUID REFERENCES public.clients(id) ON DELETE SET NULL,
  message_id TEXT NOT NULL,
  sequence_name TEXT,
  event_type TEXT NOT NULL CHECK (event_type IN ('sent', 'open', 'click', 'conversion')),
  link_url TEXT,
  metadata JSONB DEFAULT '{}',
  tracked_at TIMESTAMPTZ NOT NULL DEFAULT now(),
  created_at TIMESTAMPTZ NOT NULL DEFAULT now()
);

-- Indexes for fast analytics
CREATE INDEX idx_email_tracking_salon ON public.email_tracking_events(salon_id);
CREATE INDEX idx_email_tracking_client ON public.email_tracking_events(client_id);
CREATE INDEX idx_email_tracking_message ON public.email_tracking_events(message_id);
CREATE INDEX idx_email_tracking_type ON public.email_tracking_events(event_type);
CREATE INDEX idx_email_tracking_time ON public.email_tracking_events(tracked_at);

-- RLS
ALTER TABLE public.email_tracking_events ENABLE ROW LEVEL SECURITY;

CREATE POLICY "Salon owners can view their tracking events"
ON public.email_tracking_events FOR SELECT
TO authenticated
USING (public.user_belongs_to_salon(auth.uid(), salon_id));

-- Edge functions insert via service role, so no INSERT policy needed for authenticated users
