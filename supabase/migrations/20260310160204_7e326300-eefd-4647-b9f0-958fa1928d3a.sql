
CREATE TABLE public.weekly_briefs (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  salon_id uuid NOT NULL REFERENCES public.salons(id) ON DELETE CASCADE,
  week_start date NOT NULL,
  appointments_count integer DEFAULT 0,
  revenue numeric DEFAULT 0,
  occupancy_pct numeric DEFAULT 0,
  noshow_count integer DEFAULT 0,
  noshow_pct numeric DEFAULT 0,
  revenue_change_pct numeric DEFAULT 0,
  appointments_change_pct numeric DEFAULT 0,
  autopilot_actions jsonb DEFAULT '[]'::jsonb,
  ai_narrative text,
  ai_top_action jsonb,
  ai_warning jsonb,
  email_sent_at timestamptz,
  sms_sent_at timestamptz,
  push_sent_at timestamptz,
  created_at timestamptz DEFAULT now(),
  UNIQUE(salon_id, week_start)
);

ALTER TABLE public.weekly_briefs ENABLE ROW LEVEL SECURITY;

CREATE POLICY "Salon owners can manage weekly_briefs"
  ON public.weekly_briefs FOR ALL TO authenticated
  USING (
    (EXISTS (SELECT 1 FROM salons WHERE salons.id = weekly_briefs.salon_id AND salons.owner_id = auth.uid()))
    OR has_role(auth.uid(), 'super_admin'::app_role)
  );

CREATE POLICY "Users can view weekly_briefs of their salon"
  ON public.weekly_briefs FOR SELECT TO authenticated
  USING (
    user_belongs_to_salon(auth.uid(), salon_id)
    OR has_role(auth.uid(), 'super_admin'::app_role)
  );
