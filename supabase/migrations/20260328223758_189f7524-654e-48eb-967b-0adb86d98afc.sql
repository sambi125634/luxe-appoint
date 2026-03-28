
ALTER TABLE public.staff_members
  ADD COLUMN IF NOT EXISTS compensation_type TEXT DEFAULT 'commission',
  ADD COLUMN IF NOT EXISTS base_salary DECIMAL(10,2),
  ADD COLUMN IF NOT EXISTS hourly_rate DECIMAL(10,2),
  ADD COLUMN IF NOT EXISTS salary_bonus_threshold DECIMAL(10,2),
  ADD COLUMN IF NOT EXISTS salary_bonus_rate DECIMAL(5,2),
  ADD COLUMN IF NOT EXISTS flat_rate_per_service DECIMAL(10,2);
