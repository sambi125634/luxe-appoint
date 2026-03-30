
-- Fix SECURITY DEFINER view warning - change to SECURITY INVOKER
DROP VIEW IF EXISTS public.staff_public_view;

CREATE VIEW public.staff_public_view
WITH (security_invoker = true) AS
SELECT
  id, salon_id, name, role, color, avatar_url, is_active,
  bio, specializations, visible_in_widget
FROM public.staff_members
WHERE is_active = true;
