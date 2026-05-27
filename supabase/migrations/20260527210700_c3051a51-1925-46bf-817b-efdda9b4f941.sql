
CREATE TABLE public.salon_legal_documents (
  id UUID NOT NULL DEFAULT gen_random_uuid() PRIMARY KEY,
  salon_id UUID NOT NULL REFERENCES public.salons(id) ON DELETE CASCADE,
  doc_type TEXT NOT NULL CHECK (doc_type IN ('terms', 'privacy', 'cookies')),
  content_md TEXT NOT NULL DEFAULT '',
  is_published BOOLEAN NOT NULL DEFAULT false,
  version INTEGER NOT NULL DEFAULT 1,
  published_at TIMESTAMP WITH TIME ZONE,
  created_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now(),
  updated_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now(),
  UNIQUE (salon_id, doc_type)
);

CREATE INDEX idx_salon_legal_documents_salon_id ON public.salon_legal_documents(salon_id);

GRANT SELECT ON public.salon_legal_documents TO anon;
GRANT SELECT, INSERT, UPDATE, DELETE ON public.salon_legal_documents TO authenticated;
GRANT ALL ON public.salon_legal_documents TO service_role;

ALTER TABLE public.salon_legal_documents ENABLE ROW LEVEL SECURITY;

-- Public read: only published documents
CREATE POLICY "Anyone can view published legal documents"
ON public.salon_legal_documents
FOR SELECT
USING (is_published = true);

-- Salon owners (or staff with manage perms) can manage their docs
CREATE POLICY "Salon owners can view their legal documents"
ON public.salon_legal_documents
FOR SELECT
TO authenticated
USING (
  EXISTS (
    SELECT 1 FROM public.salons s
    WHERE s.id = salon_legal_documents.salon_id AND s.owner_id = auth.uid()
  )
);

CREATE POLICY "Salon owners can insert legal documents"
ON public.salon_legal_documents
FOR INSERT
TO authenticated
WITH CHECK (
  EXISTS (
    SELECT 1 FROM public.salons s
    WHERE s.id = salon_legal_documents.salon_id AND s.owner_id = auth.uid()
  )
);

CREATE POLICY "Salon owners can update legal documents"
ON public.salon_legal_documents
FOR UPDATE
TO authenticated
USING (
  EXISTS (
    SELECT 1 FROM public.salons s
    WHERE s.id = salon_legal_documents.salon_id AND s.owner_id = auth.uid()
  )
);

CREATE POLICY "Salon owners can delete legal documents"
ON public.salon_legal_documents
FOR DELETE
TO authenticated
USING (
  EXISTS (
    SELECT 1 FROM public.salons s
    WHERE s.id = salon_legal_documents.salon_id AND s.owner_id = auth.uid()
  )
);

CREATE TRIGGER update_salon_legal_documents_updated_at
BEFORE UPDATE ON public.salon_legal_documents
FOR EACH ROW
EXECUTE FUNCTION public.update_updated_at_column();
