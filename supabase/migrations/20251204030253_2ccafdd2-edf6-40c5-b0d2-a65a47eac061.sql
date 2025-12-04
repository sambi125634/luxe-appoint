-- Create function to update timestamps (if not exists)
CREATE OR REPLACE FUNCTION public.update_updated_at_column()
RETURNS TRIGGER AS $$
BEGIN
  NEW.updated_at = now();
  RETURN NEW;
END;
$$ LANGUAGE plpgsql;

-- Table for storing staff Google Calendar integration settings
CREATE TABLE public.staff_google_calendar (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  staff_id TEXT NOT NULL,
  google_email TEXT NOT NULL,
  calendar_id TEXT NOT NULL DEFAULT 'primary',
  access_token TEXT,
  refresh_token TEXT,
  token_expires_at TIMESTAMPTZ,
  sync_to_google BOOLEAN DEFAULT true,
  block_from_google BOOLEAN DEFAULT true,
  is_active BOOLEAN DEFAULT true,
  created_at TIMESTAMPTZ DEFAULT now(),
  updated_at TIMESTAMPTZ DEFAULT now()
);

-- Enable RLS
ALTER TABLE public.staff_google_calendar ENABLE ROW LEVEL SECURITY;

-- Allow users to manage calendar settings
CREATE POLICY "Users can view calendar settings" 
ON public.staff_google_calendar FOR SELECT USING (true);

CREATE POLICY "Users can create calendar settings" 
ON public.staff_google_calendar FOR INSERT WITH CHECK (true);

CREATE POLICY "Users can update calendar settings" 
ON public.staff_google_calendar FOR UPDATE USING (true);

CREATE POLICY "Users can delete calendar settings" 
ON public.staff_google_calendar FOR DELETE USING (true);

-- Index for faster lookups
CREATE INDEX idx_staff_google_calendar_staff_id ON public.staff_google_calendar(staff_id);

-- Updated at trigger
CREATE TRIGGER update_staff_google_calendar_updated_at
BEFORE UPDATE ON public.staff_google_calendar
FOR EACH ROW
EXECUTE FUNCTION public.update_updated_at_column();