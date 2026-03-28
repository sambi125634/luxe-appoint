
CREATE TABLE IF NOT EXISTS public.product_categories (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  salon_id UUID REFERENCES public.salons(id) ON DELETE CASCADE NOT NULL,
  name TEXT NOT NULL,
  icon TEXT DEFAULT '📦',
  color TEXT DEFAULT '#7c3aed',
  is_default BOOLEAN DEFAULT false,
  sort_order INTEGER DEFAULT 0,
  created_at TIMESTAMPTZ DEFAULT now()
);

ALTER TABLE public.product_categories ENABLE ROW LEVEL SECURITY;

CREATE POLICY "Salon owners can manage product_categories"
  ON public.product_categories FOR ALL TO authenticated
  USING (
    (EXISTS (SELECT 1 FROM public.salons WHERE id = product_categories.salon_id AND owner_id = auth.uid()))
    OR has_role(auth.uid(), 'super_admin'::app_role)
  );

CREATE POLICY "Users can view product_categories of their salon"
  ON public.product_categories FOR SELECT TO authenticated
  USING (
    user_belongs_to_salon(auth.uid(), salon_id)
    OR has_role(auth.uid(), 'super_admin'::app_role)
  );

ALTER TABLE public.products
  ADD COLUMN IF NOT EXISTS product_category_id UUID REFERENCES public.product_categories(id) ON DELETE SET NULL;

CREATE OR REPLACE FUNCTION public.seed_default_product_categories(p_salon_id UUID)
RETURNS void
LANGUAGE plpgsql
SECURITY DEFINER
SET search_path TO 'public'
AS $$
BEGIN
  INSERT INTO public.product_categories (salon_id, name, icon, is_default, sort_order) VALUES
    (p_salon_id, 'Pielęgnacja twarzy',    '✨', true, 1),
    (p_salon_id, 'Pielęgnacja ciała',     '💆', true, 2),
    (p_salon_id, 'Włosy',                '💇', true, 3),
    (p_salon_id, 'Paznokcie',            '💅', true, 4),
    (p_salon_id, 'Makijaż',              '💄', true, 5),
    (p_salon_id, 'Perfumy',              '🌸', true, 6),
    (p_salon_id, 'Środki dezynfekcyjne', '🧴', true, 7),
    (p_salon_id, 'Materiały jednorazowe','🧤', true, 8),
    (p_salon_id, 'Akcesoria',            '🔧', true, 9),
    (p_salon_id, 'Inne',                 '📦', true, 10)
  ON CONFLICT DO NOTHING;
END;
$$;
