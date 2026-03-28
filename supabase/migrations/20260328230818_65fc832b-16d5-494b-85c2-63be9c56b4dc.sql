
ALTER TABLE public.service_product_recipes
  ADD COLUMN IF NOT EXISTS quantity_value DECIMAL(10,3) DEFAULT 1,
  ADD COLUMN IF NOT EXISTS quantity_unit TEXT DEFAULT 'ml',
  ADD COLUMN IF NOT EXISTS is_optional BOOLEAN DEFAULT false,
  ADD COLUMN IF NOT EXISTS notes TEXT,
  ADD COLUMN IF NOT EXISTS mix_ratio DECIMAL(5,2);

-- Drop the unique constraint so same product can appear multiple times in a recipe
ALTER TABLE public.service_product_recipes
  DROP CONSTRAINT IF EXISTS service_product_recipes_salon_id_service_id_product_id_key;
