-- Add email tracking columns to appointments table
ALTER TABLE public.appointments 
ADD COLUMN IF NOT EXISTS confirmation_email_sent boolean NOT NULL DEFAULT false,
ADD COLUMN IF NOT EXISTS confirmation_email_sent_at timestamp with time zone,
ADD COLUMN IF NOT EXISTS reminder_email_sent boolean NOT NULL DEFAULT false,
ADD COLUMN IF NOT EXISTS reminder_email_sent_at timestamp with time zone,
ADD COLUMN IF NOT EXISTS followup_email_sent boolean NOT NULL DEFAULT false,
ADD COLUMN IF NOT EXISTS followup_email_sent_at timestamp with time zone;

-- Create index for efficient reminder queries
CREATE INDEX IF NOT EXISTS idx_appointments_reminder_pending 
ON public.appointments (start_time, reminder_email_sent) 
WHERE reminder_email_sent = false AND status != 'cancelled';

-- Create index for followup queries
CREATE INDEX IF NOT EXISTS idx_appointments_followup_pending 
ON public.appointments (end_time, followup_email_sent) 
WHERE followup_email_sent = false AND status = 'completed';