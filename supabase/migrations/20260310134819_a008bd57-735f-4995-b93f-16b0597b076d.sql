
-- autopilot_config: per-salon configuration with intelligent defaults for beauty PL
CREATE TABLE public.autopilot_config (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  salon_id uuid NOT NULL UNIQUE REFERENCES public.salons(id) ON DELETE CASCADE,
  is_active boolean DEFAULT true,
  paused_until timestamptz,
  retention_trigger_days integer[] DEFAULT '{45,60,75,90}',
  reminder_hours_before integer[] DEFAULT '{24,2}',
  review_request_delay_hours integer DEFAULT 2,
  noshow_followup_minutes integer DEFAULT 30,
  weekly_brief_day text DEFAULT 'monday',
  weekly_brief_hour integer DEFAULT 8,
  ai_suggestions_enabled boolean DEFAULT true,
  pixel_sync_enabled boolean DEFAULT false,
  quiet_hours_start time DEFAULT '20:00',
  quiet_hours_end time DEFAULT '08:00',
  max_messages_per_client_days integer DEFAULT 7,
  created_at timestamptz DEFAULT now(),
  updated_at timestamptz DEFAULT now()
);

-- autopilot_actions: log of every automated action
CREATE TABLE public.autopilot_actions (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  salon_id uuid NOT NULL REFERENCES public.salons(id) ON DELETE CASCADE,
  type text NOT NULL,
  triggered_by text NOT NULL,
  client_id uuid REFERENCES public.clients(id) ON DELETE SET NULL,
  scheduled_at timestamptz NOT NULL DEFAULT now(),
  executed_at timestamptz,
  status text NOT NULL DEFAULT 'pending',
  ai_explanation text NOT NULL,
  cta_label text,
  cta_action text,
  metadata jsonb DEFAULT '{}',
  created_at timestamptz DEFAULT now()
);

-- autopilot_stats: weekly summaries
CREATE TABLE public.autopilot_stats (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  salon_id uuid NOT NULL REFERENCES public.salons(id) ON DELETE CASCADE,
  week_start date NOT NULL,
  actions_taken integer DEFAULT 0,
  revenue_recovered numeric DEFAULT 0,
  clients_reactivated integer DEFAULT 0,
  reviews_collected integer DEFAULT 0,
  created_at timestamptz DEFAULT now(),
  UNIQUE(salon_id, week_start)
);

-- updated_at triggers
CREATE TRIGGER update_autopilot_config_updated_at
  BEFORE UPDATE ON public.autopilot_config
  FOR EACH ROW EXECUTE FUNCTION public.update_updated_at_column();

-- RLS
ALTER TABLE public.autopilot_config ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.autopilot_actions ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.autopilot_stats ENABLE ROW LEVEL SECURITY;

-- autopilot_config policies
CREATE POLICY "Salon owners can manage autopilot_config"
  ON public.autopilot_config FOR ALL TO authenticated
  USING (
    (EXISTS (SELECT 1 FROM public.salons WHERE salons.id = autopilot_config.salon_id AND salons.owner_id = auth.uid()))
    OR has_role(auth.uid(), 'super_admin'::app_role)
  );

CREATE POLICY "Users can view autopilot_config of their salon"
  ON public.autopilot_config FOR SELECT TO authenticated
  USING (
    user_belongs_to_salon(auth.uid(), salon_id)
    OR has_role(auth.uid(), 'super_admin'::app_role)
  );

-- autopilot_actions policies
CREATE POLICY "Salon owners can manage autopilot_actions"
  ON public.autopilot_actions FOR ALL TO authenticated
  USING (
    (EXISTS (SELECT 1 FROM public.salons WHERE salons.id = autopilot_actions.salon_id AND salons.owner_id = auth.uid()))
    OR has_role(auth.uid(), 'super_admin'::app_role)
  );

CREATE POLICY "Users can view autopilot_actions of their salon"
  ON public.autopilot_actions FOR SELECT TO authenticated
  USING (
    user_belongs_to_salon(auth.uid(), salon_id)
    OR has_role(auth.uid(), 'super_admin'::app_role)
  );

-- autopilot_stats policies
CREATE POLICY "Salon owners can manage autopilot_stats"
  ON public.autopilot_stats FOR ALL TO authenticated
  USING (
    (EXISTS (SELECT 1 FROM public.salons WHERE salons.id = autopilot_stats.salon_id AND salons.owner_id = auth.uid()))
    OR has_role(auth.uid(), 'super_admin'::app_role)
  );

CREATE POLICY "Users can view autopilot_stats of their salon"
  ON public.autopilot_stats FOR SELECT TO authenticated
  USING (
    user_belongs_to_salon(auth.uid(), salon_id)
    OR has_role(auth.uid(), 'super_admin'::app_role)
  );
