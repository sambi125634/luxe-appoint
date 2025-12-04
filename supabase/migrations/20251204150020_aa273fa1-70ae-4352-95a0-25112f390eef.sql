-- 1. Fix staff_google_calendar RLS policies (currently too permissive)
DROP POLICY IF EXISTS "Users can view calendar settings" ON staff_google_calendar;
DROP POLICY IF EXISTS "Users can update calendar settings" ON staff_google_calendar;
DROP POLICY IF EXISTS "Users can create calendar settings" ON staff_google_calendar;
DROP POLICY IF EXISTS "Users can delete calendar settings" ON staff_google_calendar;

CREATE POLICY "Staff can manage own calendar" ON staff_google_calendar
FOR ALL USING (
  EXISTS (
    SELECT 1 FROM staff_members sm
    JOIN salons s ON s.id = sm.salon_id
    WHERE sm.id::text = staff_google_calendar.staff_id
    AND (s.owner_id = auth.uid() OR sm.user_id = auth.uid())
  )
  OR has_role(auth.uid(), 'super_admin')
);

-- 2. Fix leads RLS policies (ensure only super_admin can view)
DROP POLICY IF EXISTS "Admins can view leads" ON leads;

CREATE POLICY "Super admins can view leads" ON leads
FOR SELECT USING (has_role(auth.uid(), 'super_admin'));

CREATE POLICY "Super admins can update leads" ON leads
FOR UPDATE USING (has_role(auth.uid(), 'super_admin'));

CREATE POLICY "Super admins can delete leads" ON leads
FOR DELETE USING (has_role(auth.uid(), 'super_admin'));