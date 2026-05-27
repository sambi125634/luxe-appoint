
ALTER TABLE public.staff_services
  ADD COLUMN IF NOT EXISTS price_override numeric(10,2),
  ADD COLUMN IF NOT EXISTS duration_override integer,
  ADD COLUMN IF NOT EXISTS variant_id uuid REFERENCES public.service_variants(id) ON DELETE CASCADE;

-- Replace unique constraint to include variant_id (NULLs treated as distinct by default,
-- so use a partial unique index for NULL variant + composite for non-null variant).
ALTER TABLE public.staff_services DROP CONSTRAINT IF EXISTS staff_services_staff_id_service_id_key;

CREATE UNIQUE INDEX IF NOT EXISTS staff_services_unique_no_variant
  ON public.staff_services (staff_id, service_id)
  WHERE variant_id IS NULL;

CREATE UNIQUE INDEX IF NOT EXISTS staff_services_unique_with_variant
  ON public.staff_services (staff_id, service_id, variant_id)
  WHERE variant_id IS NOT NULL;
