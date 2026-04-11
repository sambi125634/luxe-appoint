
-- Table: payment_transactions
CREATE TABLE IF NOT EXISTS public.payment_transactions (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  appointment_id UUID REFERENCES public.appointments(id) ON DELETE SET NULL,
  user_id UUID NOT NULL,
  salon_id UUID REFERENCES public.salons(id) ON DELETE CASCADE NOT NULL,
  amount DECIMAL(10,2) NOT NULL,
  currency TEXT NOT NULL DEFAULT 'PLN',
  status TEXT NOT NULL DEFAULT 'pending' CHECK (status IN ('pending','processing','completed','failed','refunded')),
  p24_order_id TEXT,
  p24_session_id TEXT UNIQUE,
  p24_token TEXT,
  payment_method TEXT,
  created_at TIMESTAMPTZ NOT NULL DEFAULT now(),
  completed_at TIMESTAMPTZ,
  error_message TEXT
);

ALTER TABLE public.payment_transactions ENABLE ROW LEVEL SECURITY;

-- User sees own transactions
CREATE POLICY "Users can view own transactions"
  ON public.payment_transactions FOR SELECT
  USING (auth.uid() = user_id);

-- User can create transactions for self
CREATE POLICY "Users can create own transactions"
  ON public.payment_transactions FOR INSERT
  WITH CHECK (auth.uid() = user_id);

-- Salon owner sees all salon transactions
CREATE POLICY "Salon owner can view salon transactions"
  ON public.payment_transactions FOR SELECT
  USING (public.user_belongs_to_salon(auth.uid(), salon_id));

-- Service role updates (webhook) handled by edge function with service_role key

-- Add columns to salons
ALTER TABLE public.salons
  ADD COLUMN IF NOT EXISTS payment_required BOOLEAN DEFAULT false,
  ADD COLUMN IF NOT EXISTS deposit_percent INTEGER DEFAULT 0,
  ADD COLUMN IF NOT EXISTS p24_merchant_id TEXT,
  ADD COLUMN IF NOT EXISTS p24_pos_id TEXT;

-- Add payment_transaction_id to appointments
ALTER TABLE public.appointments
  ADD COLUMN IF NOT EXISTS payment_transaction_id UUID REFERENCES public.payment_transactions(id);

-- Index for webhook lookups
CREATE INDEX IF NOT EXISTS idx_payment_transactions_session ON public.payment_transactions(p24_session_id);
CREATE INDEX IF NOT EXISTS idx_payment_transactions_appointment ON public.payment_transactions(appointment_id);
