ALTER TABLE public.staff_members
  ADD COLUMN IF NOT EXISTS invitation_email TEXT,
  ADD COLUMN IF NOT EXISTS invitation_status TEXT DEFAULT 'not_invited',
  ADD COLUMN IF NOT EXISTS invitation_sent_at TIMESTAMPTZ,
  ADD COLUMN IF NOT EXISTS staff_role TEXT DEFAULT 'specialist',
  ADD COLUMN IF NOT EXISTS permissions JSONB DEFAULT '{"can_view_finances": false, "can_edit_services": false, "can_manage_clients": true, "can_view_all_calendar": false, "can_manage_staff": false, "can_view_reports": false, "can_manage_products": false}'::jsonb;