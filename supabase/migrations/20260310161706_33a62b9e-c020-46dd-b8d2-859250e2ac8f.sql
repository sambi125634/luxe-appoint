
-- Receptury: jakie produkty zużywa każda usługa
CREATE TABLE public.service_product_recipes (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  salon_id uuid NOT NULL REFERENCES public.salons(id) ON DELETE CASCADE,
  service_id uuid NOT NULL REFERENCES public.services(id) ON DELETE CASCADE,
  product_id uuid NOT NULL REFERENCES public.products(id) ON DELETE CASCADE,
  quantity_used numeric NOT NULL DEFAULT 1,
  unit text DEFAULT 'szt',
  created_at timestamptz DEFAULT now(),
  UNIQUE(salon_id, service_id, product_id)
);

ALTER TABLE public.service_product_recipes ENABLE ROW LEVEL SECURITY;

CREATE POLICY "Salon owners can manage service_product_recipes"
  ON public.service_product_recipes FOR ALL TO authenticated
  USING (
    (EXISTS (SELECT 1 FROM salons WHERE salons.id = service_product_recipes.salon_id AND salons.owner_id = auth.uid()))
    OR has_role(auth.uid(), 'super_admin'::app_role)
  );

CREATE POLICY "Users can view service_product_recipes of their salon"
  ON public.service_product_recipes FOR SELECT TO authenticated
  USING (
    user_belongs_to_salon(auth.uid(), salon_id) OR has_role(auth.uid(), 'super_admin'::app_role)
  );

-- Globalna baza produktów kosmetycznych (EAN lookup)
CREATE TABLE public.beauty_products_db (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  ean text NOT NULL UNIQUE,
  name text NOT NULL,
  brand text,
  category text,
  capacity text,
  avg_wholesale_price numeric,
  image_url text,
  created_at timestamptz DEFAULT now()
);

ALTER TABLE public.beauty_products_db ENABLE ROW LEVEL SECURITY;

CREATE POLICY "Anyone can read beauty_products_db"
  ON public.beauty_products_db FOR SELECT TO public
  USING (true);

CREATE POLICY "Super admins can manage beauty_products_db"
  ON public.beauty_products_db FOR ALL TO authenticated
  USING (has_role(auth.uid(), 'super_admin'::app_role));
