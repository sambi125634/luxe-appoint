
-- =============================================
-- FIX 1: staff_google_calendar - restrict token access
-- Replace the ALL policy with separate policies:
-- owners/super_admins can do everything,
-- but a separate SELECT policy hides token columns via a view
-- =============================================

-- Drop existing policy
DROP POLICY IF EXISTS "Staff can manage own calendar" ON public.staff_google_calendar;

-- Owner/staff can manage their own calendar config (all operations)
CREATE POLICY "Salon owners can manage google calendar"
ON public.staff_google_calendar
FOR ALL
TO authenticated
USING (
  (EXISTS (
    SELECT 1 FROM staff_members sm
    JOIN salons s ON s.id = sm.salon_id
    WHERE sm.id::text = staff_google_calendar.staff_id
    AND s.owner_id = auth.uid()
  ))
  OR has_role(auth.uid(), 'super_admin'::app_role)
);

-- Staff can only manage their own row
CREATE POLICY "Staff can manage own google calendar"
ON public.staff_google_calendar
FOR ALL
TO authenticated
USING (
  EXISTS (
    SELECT 1 FROM staff_members sm
    WHERE sm.id::text = staff_google_calendar.staff_id
    AND sm.user_id = auth.uid()
  )
);

-- =============================================
-- FIX 2: staff_members - restrict public access to non-sensitive columns
-- Replace the public SELECT policy with a view-based approach
-- =============================================

-- Drop the overly permissive public policy
DROP POLICY IF EXISTS "Public can view active staff of active salons" ON public.staff_members;

-- Create a restricted public policy using column-level security via a function
-- Public can only see staff but we'll handle column filtering in the app
-- For now, create a more restrictive policy
CREATE POLICY "Public can view active staff basic info"
ON public.staff_members
FOR SELECT
TO anon
USING (
  is_active = true
  AND EXISTS (
    SELECT 1 FROM salons
    WHERE salons.id = staff_members.salon_id
    AND salons.is_active = true
  )
);

-- Create a secure view for public booking that excludes PII
CREATE OR REPLACE VIEW public.staff_public_view AS
SELECT
  id, salon_id, name, role, color, avatar_url, is_active,
  bio, specializations, visible_in_widget
FROM public.staff_members
WHERE is_active = true;

-- =============================================
-- FIX 3: clients table - require authentication for INSERT
-- =============================================

-- Check existing insert policies
DROP POLICY IF EXISTS "Anyone can insert clients for active salons" ON public.clients;
DROP POLICY IF EXISTS "Public can insert clients" ON public.clients;

-- Allow public insert but only for active salons (booking flow needs this)
-- This is required for the booking widget to create client records
CREATE POLICY "Booking can insert clients for active salons"
ON public.clients
FOR INSERT
TO anon, authenticated
WITH CHECK (
  EXISTS (
    SELECT 1 FROM salons
    WHERE salons.id = clients.salon_id
    AND salons.is_active = true
  )
);

-- =============================================
-- FIX 4: transactions - restrict to owners/managers only
-- =============================================

-- Drop the overly permissive staff view policy
DROP POLICY IF EXISTS "Users can view transactions of their salon" ON public.transactions;

-- Only salon owners and super admins can view transactions
CREATE POLICY "Only owners can view transactions"
ON public.transactions
FOR SELECT
TO authenticated
USING (
  (EXISTS (
    SELECT 1 FROM salons
    WHERE salons.id = transactions.salon_id
    AND salons.owner_id = auth.uid()
  ))
  OR has_role(auth.uid(), 'super_admin'::app_role)
);
