
-- pixel_config
CREATE TABLE pixel_config (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  salon_id uuid NOT NULL UNIQUE REFERENCES salons(id) ON DELETE CASCADE,
  pixel_id text,
  ad_account_id text,
  access_token_encrypted text,
  is_active boolean DEFAULT false,
  last_sync_at timestamptz,
  sync_interval_hours integer DEFAULT 24,
  created_at timestamptz DEFAULT now(),
  updated_at timestamptz DEFAULT now()
);
ALTER TABLE pixel_config ENABLE ROW LEVEL SECURITY;
CREATE POLICY "Salon owners can manage pixel_config" ON pixel_config FOR ALL TO authenticated USING ((EXISTS (SELECT 1 FROM salons WHERE salons.id = pixel_config.salon_id AND salons.owner_id = auth.uid())) OR has_role(auth.uid(), 'super_admin'::app_role));
CREATE POLICY "Users can view pixel_config of their salon" ON pixel_config FOR SELECT TO authenticated USING (user_belongs_to_salon(auth.uid(), salon_id) OR has_role(auth.uid(), 'super_admin'::app_role));

-- audience_mappings
CREATE TABLE audience_mappings (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  salon_id uuid NOT NULL REFERENCES salons(id) ON DELETE CASCADE,
  audience_id text,
  audience_name text NOT NULL,
  is_exclusion boolean DEFAULT false,
  created_at timestamptz DEFAULT now(),
  tag_name text NOT NULL,
  UNIQUE(salon_id, tag_name)
);
ALTER TABLE audience_mappings ENABLE ROW LEVEL SECURITY;
CREATE POLICY "Salon owners can manage audience_mappings" ON audience_mappings FOR ALL TO authenticated USING ((EXISTS (SELECT 1 FROM salons WHERE salons.id = audience_mappings.salon_id AND salons.owner_id = auth.uid())) OR has_role(auth.uid(), 'super_admin'::app_role));
CREATE POLICY "Users can view audience_mappings of their salon" ON audience_mappings FOR SELECT TO authenticated USING (user_belongs_to_salon(auth.uid(), salon_id) OR has_role(auth.uid(), 'super_admin'::app_role));

-- pixel_sync_log
CREATE TABLE pixel_sync_log (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  salon_id uuid NOT NULL REFERENCES salons(id) ON DELETE CASCADE,
  started_at timestamptz DEFAULT now(),
  completed_at timestamptz,
  events_sent integer DEFAULT 0,
  audiences_updated integer DEFAULT 0,
  errors jsonb DEFAULT '[]',
  status text DEFAULT 'running'
);
ALTER TABLE pixel_sync_log ENABLE ROW LEVEL SECURITY;
CREATE POLICY "Salon owners can manage pixel_sync_log" ON pixel_sync_log FOR ALL TO authenticated USING ((EXISTS (SELECT 1 FROM salons WHERE salons.id = pixel_sync_log.salon_id AND salons.owner_id = auth.uid())) OR has_role(auth.uid(), 'super_admin'::app_role));
CREATE POLICY "Users can view pixel_sync_log of their salon" ON pixel_sync_log FOR SELECT TO authenticated USING (user_belongs_to_salon(auth.uid(), salon_id) OR has_role(auth.uid(), 'super_admin'::app_role));

-- pixel_events
CREATE TABLE pixel_events (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  salon_id uuid NOT NULL REFERENCES salons(id) ON DELETE CASCADE,
  client_id uuid REFERENCES clients(id) ON DELETE SET NULL,
  event_value numeric,
  hashed_email text,
  hashed_phone text,
  sent_at timestamptz DEFAULT now(),
  event_name text NOT NULL,
  source_type text DEFAULT 'calendar'
);
ALTER TABLE pixel_events ENABLE ROW LEVEL SECURITY;
CREATE POLICY "Salon owners can manage pixel_events" ON pixel_events FOR ALL TO authenticated USING ((EXISTS (SELECT 1 FROM salons WHERE salons.id = pixel_events.salon_id AND salons.owner_id = auth.uid())) OR has_role(auth.uid(), 'super_admin'::app_role));
CREATE POLICY "Users can view pixel_events of their salon" ON pixel_events FOR SELECT TO authenticated USING (user_belongs_to_salon(auth.uid(), salon_id) OR has_role(auth.uid(), 'super_admin'::app_role));

-- pixel_attributions
CREATE TABLE pixel_attributions (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  salon_id uuid NOT NULL REFERENCES salons(id) ON DELETE CASCADE,
  client_id uuid NOT NULL REFERENCES clients(id) ON DELETE CASCADE,
  appointment_id uuid REFERENCES appointments(id) ON DELETE SET NULL,
  audience_name text,
  ad_campaign text,
  revenue numeric DEFAULT 0,
  created_at timestamptz DEFAULT now()
);
ALTER TABLE pixel_attributions ENABLE ROW LEVEL SECURITY;
CREATE POLICY "Salon owners can manage pixel_attributions" ON pixel_attributions FOR ALL TO authenticated USING ((EXISTS (SELECT 1 FROM salons WHERE salons.id = pixel_attributions.salon_id AND salons.owner_id = auth.uid())) OR has_role(auth.uid(), 'super_admin'::app_role));
CREATE POLICY "Users can view pixel_attributions of their salon" ON pixel_attributions FOR SELECT TO authenticated USING (user_belongs_to_salon(auth.uid(), salon_id) OR has_role(auth.uid(), 'super_admin'::app_role));
