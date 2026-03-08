
INSERT INTO storage.buckets (id, name, public) VALUES ('salon-media', 'salon-media', true)
ON CONFLICT (id) DO NOTHING;

CREATE POLICY "Public can view salon media" ON storage.objects FOR SELECT USING (bucket_id = 'salon-media');

CREATE POLICY "Authenticated users can upload salon media" ON storage.objects FOR INSERT TO authenticated WITH CHECK (bucket_id = 'salon-media');
