-- Table for caching client risk scores
CREATE TABLE public.client_risk_scores (
  id UUID NOT NULL DEFAULT gen_random_uuid() PRIMARY KEY,
  client_id UUID NOT NULL REFERENCES public.clients(id) ON DELETE CASCADE,
  salon_id UUID NOT NULL REFERENCES public.salons(id) ON DELETE CASCADE,
  risk_score INTEGER NOT NULL DEFAULT 0 CHECK (risk_score >= 0 AND risk_score <= 100),
  risk_level TEXT NOT NULL DEFAULT 'low' CHECK (risk_level IN ('low', 'medium', 'high')),
  factors JSONB DEFAULT '{}',
  recommendations JSONB DEFAULT '[]',
  calculated_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now(),
  created_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now(),
  updated_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now(),
  UNIQUE(client_id)
);

-- Enable RLS
ALTER TABLE public.client_risk_scores ENABLE ROW LEVEL SECURITY;

-- Policies
CREATE POLICY "Users can view risk scores of their salon"
ON public.client_risk_scores
FOR SELECT
USING (user_belongs_to_salon(auth.uid(), salon_id) OR has_role(auth.uid(), 'super_admin'::app_role));

CREATE POLICY "Salon owners can manage risk scores"
ON public.client_risk_scores
FOR ALL
USING ((EXISTS (
  SELECT 1 FROM salons
  WHERE salons.id = client_risk_scores.salon_id
  AND salons.owner_id = auth.uid()
)) OR has_role(auth.uid(), 'super_admin'::app_role));

-- Index for faster lookups
CREATE INDEX idx_client_risk_scores_client_id ON public.client_risk_scores(client_id);
CREATE INDEX idx_client_risk_scores_salon_id ON public.client_risk_scores(salon_id);
CREATE INDEX idx_client_risk_scores_risk_level ON public.client_risk_scores(risk_level);

-- Trigger for updated_at
CREATE TRIGGER update_client_risk_scores_updated_at
BEFORE UPDATE ON public.client_risk_scores
FOR EACH ROW
EXECUTE FUNCTION public.update_updated_at_column();