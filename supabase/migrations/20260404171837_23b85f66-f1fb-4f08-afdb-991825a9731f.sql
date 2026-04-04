
-- FIX 1: Drop anon policy exposing all staff columns
DROP POLICY IF EXISTS "Public can view active staff basic info" ON public.staff_members;

DROP VIEW IF EXISTS public.staff_public_view;
CREATE VIEW public.staff_public_view
WITH (security_invoker = false)
AS
SELECT id, salon_id, name, role, color, avatar_url, is_active, bio, specializations, visible_in_widget
FROM public.staff_members
WHERE is_active = true;

GRANT SELECT ON public.staff_public_view TO anon;
GRANT SELECT ON public.staff_public_view TO authenticated;

-- FIX 2: Scope storage DELETE to salon owners
DROP POLICY IF EXISTS "Authenticated can delete salon-media" ON storage.objects;

CREATE POLICY "Owners can delete own salon media"
ON storage.objects FOR DELETE
TO authenticated
USING (
  bucket_id = 'salon-media'
  AND (
    (storage.foldername(name))[1] IN (
      SELECT id::text FROM public.salons WHERE owner_id = auth.uid()
    )
    OR has_role(auth.uid(), 'super_admin'::app_role)
  )
);

-- FIX 3: Google OAuth tokens — remove broad ALL policies, add granular ones without SELECT
DROP POLICY IF EXISTS "Salon owners can manage google calendar" ON public.staff_google_calendar;
DROP POLICY IF EXISTS "Staff can manage own google calendar" ON public.staff_google_calendar;

CREATE OR REPLACE VIEW public.staff_google_calendar_safe AS
SELECT staff_id, google_email, calendar_id, sync_to_google, block_from_google, is_active, created_at, updated_at
FROM public.staff_google_calendar;

GRANT SELECT ON public.staff_google_calendar_safe TO authenticated;

CREATE POLICY "Salon owners can insert google calendar"
ON public.staff_google_calendar FOR INSERT TO authenticated
WITH CHECK (
  (EXISTS (SELECT 1 FROM staff_members sm JOIN salons s ON s.id = sm.salon_id WHERE sm.id::text = staff_google_calendar.staff_id AND s.owner_id = auth.uid()))
  OR has_role(auth.uid(), 'super_admin'::app_role)
);

CREATE POLICY "Salon owners can update google calendar"
ON public.staff_google_calendar FOR UPDATE TO authenticated
USING (
  (EXISTS (SELECT 1 FROM staff_members sm JOIN salons s ON s.id = sm.salon_id WHERE sm.id::text = staff_google_calendar.staff_id AND s.owner_id = auth.uid()))
  OR has_role(auth.uid(), 'super_admin'::app_role)
);

CREATE POLICY "Salon owners can delete google calendar"
ON public.staff_google_calendar FOR DELETE TO authenticated
USING (
  (EXISTS (SELECT 1 FROM staff_members sm JOIN salons s ON s.id = sm.salon_id WHERE sm.id::text = staff_google_calendar.staff_id AND s.owner_id = auth.uid()))
  OR has_role(auth.uid(), 'super_admin'::app_role)
);

CREATE POLICY "Staff can insert own google calendar"
ON public.staff_google_calendar FOR INSERT TO authenticated
WITH CHECK (EXISTS (SELECT 1 FROM staff_members sm WHERE sm.id::text = staff_google_calendar.staff_id AND sm.user_id = auth.uid()));

CREATE POLICY "Staff can update own google calendar"
ON public.staff_google_calendar FOR UPDATE TO authenticated
USING (EXISTS (SELECT 1 FROM staff_members sm WHERE sm.id::text = staff_google_calendar.staff_id AND sm.user_id = auth.uid()));

CREATE POLICY "Staff can delete own google calendar"
ON public.staff_google_calendar FOR DELETE TO authenticated
USING (EXISTS (SELECT 1 FROM staff_members sm WHERE sm.id::text = staff_google_calendar.staff_id AND sm.user_id = auth.uid()));
