
CREATE TABLE IF NOT EXISTS public.purchase_orders (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  salon_id UUID REFERENCES public.salons(id) ON DELETE CASCADE NOT NULL,
  supplier_id UUID REFERENCES public.suppliers(id) ON DELETE SET NULL,
  order_number TEXT,
  status TEXT DEFAULT 'draft' CHECK (status IN ('draft', 'sent', 'confirmed', 'delivered', 'cancelled')),
  ordered_at TIMESTAMPTZ,
  delivered_at TIMESTAMPTZ,
  total_net DECIMAL(10,2),
  total_gross DECIMAL(10,2),
  notes TEXT,
  created_at TIMESTAMPTZ DEFAULT now(),
  updated_at TIMESTAMPTZ DEFAULT now()
);

CREATE TABLE IF NOT EXISTS public.purchase_order_items (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  order_id UUID REFERENCES public.purchase_orders(id) ON DELETE CASCADE NOT NULL,
  product_id UUID REFERENCES public.products(id) ON DELETE SET NULL,
  product_name TEXT NOT NULL,
  quantity_ordered INTEGER NOT NULL DEFAULT 1,
  quantity_delivered INTEGER DEFAULT 0,
  unit_price_net DECIMAL(10,2),
  vat_rate DECIMAL(5,2) DEFAULT 23,
  total_net DECIMAL(10,2),
  notes TEXT,
  created_at TIMESTAMPTZ DEFAULT now()
);

ALTER TABLE public.purchase_orders ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.purchase_order_items ENABLE ROW LEVEL SECURITY;

CREATE POLICY "Salon owners manage purchase orders"
  ON public.purchase_orders FOR ALL TO authenticated
  USING (EXISTS (
    SELECT 1 FROM public.salons
    WHERE id = salon_id AND owner_id = auth.uid()
  ) OR has_role(auth.uid(), 'super_admin'::app_role));

CREATE POLICY "Users can view purchase orders of their salon"
  ON public.purchase_orders FOR SELECT TO authenticated
  USING (user_belongs_to_salon(auth.uid(), salon_id) OR has_role(auth.uid(), 'super_admin'::app_role));

CREATE POLICY "Salon owners manage order items"
  ON public.purchase_order_items FOR ALL TO authenticated
  USING (EXISTS (
    SELECT 1 FROM public.purchase_orders po
    JOIN public.salons s ON s.id = po.salon_id
    WHERE po.id = order_id AND s.owner_id = auth.uid()
  ) OR has_role(auth.uid(), 'super_admin'::app_role));

CREATE POLICY "Users can view order items of their salon"
  ON public.purchase_order_items FOR SELECT TO authenticated
  USING (EXISTS (
    SELECT 1 FROM public.purchase_orders po
    WHERE po.id = order_id AND user_belongs_to_salon(auth.uid(), po.salon_id)
  ) OR has_role(auth.uid(), 'super_admin'::app_role));
