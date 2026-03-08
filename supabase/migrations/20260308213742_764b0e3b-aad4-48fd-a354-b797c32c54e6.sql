
-- 1. Add 'client' to app_role enum
ALTER TYPE public.app_role ADD VALUE IF NOT EXISTS 'client';

-- 2. Create client_salon_links table
CREATE TABLE public.client_salon_links (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id uuid NOT NULL REFERENCES auth.users(id) ON DELETE CASCADE,
  salon_id uuid NOT NULL REFERENCES public.salons(id) ON DELETE CASCADE,
  invite_code text,
  joined_at timestamp with time zone NOT NULL DEFAULT now(),
  is_favorite boolean NOT NULL DEFAULT false,
  created_at timestamp with time zone NOT NULL DEFAULT now(),
  updated_at timestamp with time zone NOT NULL DEFAULT now(),
  UNIQUE(user_id, salon_id)
);

ALTER TABLE public.client_salon_links ENABLE ROW LEVEL SECURITY;

-- Clients can view their own links
CREATE POLICY "Users can view own salon links"
  ON public.client_salon_links FOR SELECT
  USING (auth.uid() = user_id);

-- Clients can insert links (join salons)
CREATE POLICY "Users can join salons"
  ON public.client_salon_links FOR INSERT
  WITH CHECK (auth.uid() = user_id);

-- Clients can update own links (toggle favorite)
CREATE POLICY "Users can update own salon links"
  ON public.client_salon_links FOR UPDATE
  USING (auth.uid() = user_id);

-- Clients can delete own links (leave salon)
CREATE POLICY "Users can leave salons"
  ON public.client_salon_links FOR DELETE
  USING (auth.uid() = user_id);

-- Salon owners can view clients linked to their salon
CREATE POLICY "Salon owners can view linked clients"
  ON public.client_salon_links FOR SELECT
  USING (
    EXISTS (
      SELECT 1 FROM public.salons
      WHERE salons.id = client_salon_links.salon_id
      AND salons.owner_id = auth.uid()
    )
    OR has_role(auth.uid(), 'super_admin'::app_role)
  );

-- 3. Create push_tokens table
CREATE TABLE public.push_tokens (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id uuid NOT NULL REFERENCES auth.users(id) ON DELETE CASCADE,
  device_token text NOT NULL,
  platform text NOT NULL DEFAULT 'android',
  created_at timestamp with time zone NOT NULL DEFAULT now(),
  updated_at timestamp with time zone NOT NULL DEFAULT now(),
  UNIQUE(user_id, device_token)
);

ALTER TABLE public.push_tokens ENABLE ROW LEVEL SECURITY;

CREATE POLICY "Users can manage own push tokens"
  ON public.push_tokens FOR ALL
  USING (auth.uid() = user_id);

-- 4. Add updated_at triggers
CREATE TRIGGER update_client_salon_links_updated_at
  BEFORE UPDATE ON public.client_salon_links
  FOR EACH ROW EXECUTE FUNCTION public.update_updated_at_column();

CREATE TRIGGER update_push_tokens_updated_at
  BEFORE UPDATE ON public.push_tokens
  FOR EACH ROW EXECUTE FUNCTION public.update_updated_at_column();
