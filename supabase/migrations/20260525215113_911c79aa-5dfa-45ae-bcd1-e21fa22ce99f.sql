CREATE TABLE public.conversation_messages (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  salon_id UUID NOT NULL,
  client_id UUID NOT NULL,
  direction TEXT NOT NULL CHECK (direction IN ('inbound','outbound')),
  channel TEXT NOT NULL DEFAULT 'SMS' CHECK (channel IN ('SMS','Email','WhatsApp','Facebook','Instagram')),
  body TEXT NOT NULL,
  status TEXT NOT NULL DEFAULT 'sent' CHECK (status IN ('pending','sent','delivered','read','failed')),
  external_message_id TEXT,
  error_message TEXT,
  sent_at TIMESTAMPTZ NOT NULL DEFAULT now(),
  created_at TIMESTAMPTZ NOT NULL DEFAULT now()
);

CREATE INDEX idx_conv_msg_salon_client ON public.conversation_messages(salon_id, client_id, sent_at DESC);

ALTER TABLE public.conversation_messages ENABLE ROW LEVEL SECURITY;

CREATE POLICY "Salon owners manage conversation_messages"
ON public.conversation_messages FOR ALL TO authenticated
USING (
  EXISTS (SELECT 1 FROM public.salons s WHERE s.id = conversation_messages.salon_id AND s.owner_id = auth.uid())
  OR public.has_role(auth.uid(), 'super_admin'::app_role)
)
WITH CHECK (
  EXISTS (SELECT 1 FROM public.salons s WHERE s.id = conversation_messages.salon_id AND s.owner_id = auth.uid())
  OR public.has_role(auth.uid(), 'super_admin'::app_role)
);

CREATE POLICY "Salon staff view conversation_messages"
ON public.conversation_messages FOR SELECT TO authenticated
USING (public.user_belongs_to_salon(auth.uid(), salon_id));

CREATE POLICY "Salon staff send conversation_messages"
ON public.conversation_messages FOR INSERT TO authenticated
WITH CHECK (public.user_belongs_to_salon(auth.uid(), salon_id) AND direction = 'outbound');

ALTER PUBLICATION supabase_realtime ADD TABLE public.conversation_messages;