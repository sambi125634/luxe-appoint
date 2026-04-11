
-- Create salon_gallery table
CREATE TABLE public.salon_gallery (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  salon_id UUID REFERENCES public.salons(id) ON DELETE CASCADE NOT NULL,
  image_url TEXT NOT NULL,
  caption TEXT,
  category TEXT DEFAULT 'portfolio' CHECK (category IN ('portfolio', 'salon', 'team', 'before_after')),
  display_order INTEGER DEFAULT 0,
  is_active BOOLEAN DEFAULT true,
  created_at TIMESTAMPTZ DEFAULT now()
);

ALTER TABLE public.salon_gallery ENABLE ROW LEVEL SECURITY;

CREATE POLICY "Anyone can view active gallery images"
ON public.salon_gallery FOR SELECT
USING (is_active = true);

CREATE POLICY "Salon owners can manage gallery"
ON public.salon_gallery FOR ALL
TO authenticated
USING (
  EXISTS (SELECT 1 FROM public.salons WHERE salons.id = salon_gallery.salon_id AND salons.owner_id = auth.uid())
  OR has_role(auth.uid(), 'super_admin'::app_role)
);

CREATE INDEX idx_salon_gallery_salon_id ON public.salon_gallery(salon_id);

-- Create storage bucket
INSERT INTO storage.buckets (id, name, public) VALUES ('salon-gallery', 'salon-gallery', true);

CREATE POLICY "Public read salon gallery" ON storage.objects FOR SELECT USING (bucket_id = 'salon-gallery');
CREATE POLICY "Salon owners upload gallery" ON storage.objects FOR INSERT TO authenticated WITH CHECK (bucket_id = 'salon-gallery');
CREATE POLICY "Salon owners update gallery" ON storage.objects FOR UPDATE TO authenticated USING (bucket_id = 'salon-gallery');
CREATE POLICY "Salon owners delete gallery" ON storage.objects FOR DELETE TO authenticated USING (bucket_id = 'salon-gallery');
