
-- Fix "RLS Policy Always True" warning
-- The leads table has an INSERT policy with WITH CHECK (true)
-- Replace with a slightly more restrictive version
DROP POLICY IF EXISTS "Anyone can submit leads" ON public.leads;

CREATE POLICY "Anyone can submit leads"
ON public.leads
FOR INSERT
TO anon, authenticated
WITH CHECK (
  -- Require that essential fields are not empty
  first_name IS NOT NULL AND first_name != ''
  AND email IS NOT NULL AND email != ''
  AND salon_name IS NOT NULL AND salon_name != ''
  AND rodo_consent = true
);
