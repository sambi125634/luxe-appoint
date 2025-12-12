
-- Tabela dostawców (suppliers)
CREATE TABLE public.suppliers (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  salon_id UUID NOT NULL REFERENCES public.salons(id) ON DELETE CASCADE,
  name TEXT NOT NULL,
  contact_person TEXT,
  email TEXT,
  phone TEXT,
  address TEXT,
  payment_terms TEXT,
  discount_info TEXT,
  notes TEXT,
  is_active BOOLEAN NOT NULL DEFAULT true,
  created_at TIMESTAMPTZ NOT NULL DEFAULT now(),
  updated_at TIMESTAMPTZ NOT NULL DEFAULT now()
);

-- Tabela produktów (products)
CREATE TABLE public.products (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  salon_id UUID NOT NULL REFERENCES public.salons(id) ON DELETE CASCADE,
  supplier_id UUID REFERENCES public.suppliers(id) ON DELETE SET NULL,
  name TEXT NOT NULL,
  brand TEXT,
  category TEXT NOT NULL,
  sku TEXT,
  ean TEXT,
  variant TEXT,
  sale_price_gross NUMERIC NOT NULL DEFAULT 0,
  purchase_price_net NUMERIC,
  vat_rate NUMERIC NOT NULL DEFAULT 23,
  min_stock INTEGER NOT NULL DEFAULT 0,
  current_stock INTEGER NOT NULL DEFAULT 0,
  is_active BOOLEAN NOT NULL DEFAULT true,
  is_for_internal_use BOOLEAN NOT NULL DEFAULT false,
  image_url TEXT,
  description TEXT,
  created_at TIMESTAMPTZ NOT NULL DEFAULT now(),
  updated_at TIMESTAMPTZ NOT NULL DEFAULT now()
);

-- Tabela ruchów magazynowych (stock_movements)
CREATE TABLE public.stock_movements (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  salon_id UUID NOT NULL REFERENCES public.salons(id) ON DELETE CASCADE,
  product_id UUID NOT NULL REFERENCES public.products(id) ON DELETE CASCADE,
  type TEXT NOT NULL CHECK (type IN ('delivery', 'sale', 'correction', 'return', 'internal_use')),
  quantity INTEGER NOT NULL,
  unit_price NUMERIC,
  total_value NUMERIC,
  supplier_id UUID REFERENCES public.suppliers(id) ON DELETE SET NULL,
  invoice_number TEXT,
  transaction_id UUID REFERENCES public.transactions(id) ON DELETE SET NULL,
  staff_id UUID REFERENCES public.staff_members(id) ON DELETE SET NULL,
  expiry_date DATE,
  note TEXT,
  created_at TIMESTAMPTZ NOT NULL DEFAULT now()
);

-- Rozszerzenie tabeli transactions o pola produktowe
ALTER TABLE public.transactions 
ADD COLUMN IF NOT EXISTS product_id UUID REFERENCES public.products(id) ON DELETE SET NULL,
ADD COLUMN IF NOT EXISTS quantity INTEGER DEFAULT 1,
ADD COLUMN IF NOT EXISTS unit_price NUMERIC,
ADD COLUMN IF NOT EXISTS cost_price NUMERIC;

-- Indeksy dla wydajności
CREATE INDEX idx_products_salon_id ON public.products(salon_id);
CREATE INDEX idx_products_category ON public.products(category);
CREATE INDEX idx_products_brand ON public.products(brand);
CREATE INDEX idx_products_sku ON public.products(sku);
CREATE INDEX idx_suppliers_salon_id ON public.suppliers(salon_id);
CREATE INDEX idx_stock_movements_product_id ON public.stock_movements(product_id);
CREATE INDEX idx_stock_movements_salon_id ON public.stock_movements(salon_id);
CREATE INDEX idx_stock_movements_type ON public.stock_movements(type);
CREATE INDEX idx_transactions_product_id ON public.transactions(product_id);

-- Trigger dla updated_at na products
CREATE TRIGGER update_products_updated_at
BEFORE UPDATE ON public.products
FOR EACH ROW
EXECUTE FUNCTION public.update_updated_at_column();

-- Trigger dla updated_at na suppliers
CREATE TRIGGER update_suppliers_updated_at
BEFORE UPDATE ON public.suppliers
FOR EACH ROW
EXECUTE FUNCTION public.update_updated_at_column();

-- Enable RLS
ALTER TABLE public.products ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.suppliers ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.stock_movements ENABLE ROW LEVEL SECURITY;

-- RLS Policies dla products
CREATE POLICY "Users can view products of their salon"
ON public.products FOR SELECT
USING (user_belongs_to_salon(auth.uid(), salon_id) OR has_role(auth.uid(), 'super_admin'::app_role));

CREATE POLICY "Salon owners can manage products"
ON public.products FOR ALL
USING ((EXISTS (SELECT 1 FROM salons WHERE salons.id = products.salon_id AND salons.owner_id = auth.uid())) OR has_role(auth.uid(), 'super_admin'::app_role));

-- RLS Policies dla suppliers
CREATE POLICY "Users can view suppliers of their salon"
ON public.suppliers FOR SELECT
USING (user_belongs_to_salon(auth.uid(), salon_id) OR has_role(auth.uid(), 'super_admin'::app_role));

CREATE POLICY "Salon owners can manage suppliers"
ON public.suppliers FOR ALL
USING ((EXISTS (SELECT 1 FROM salons WHERE salons.id = suppliers.salon_id AND salons.owner_id = auth.uid())) OR has_role(auth.uid(), 'super_admin'::app_role));

-- RLS Policies dla stock_movements
CREATE POLICY "Users can view stock_movements of their salon"
ON public.stock_movements FOR SELECT
USING (user_belongs_to_salon(auth.uid(), salon_id) OR has_role(auth.uid(), 'super_admin'::app_role));

CREATE POLICY "Salon owners can manage stock_movements"
ON public.stock_movements FOR ALL
USING ((EXISTS (SELECT 1 FROM salons WHERE salons.id = stock_movements.salon_id AND salons.owner_id = auth.uid())) OR has_role(auth.uid(), 'super_admin'::app_role));
