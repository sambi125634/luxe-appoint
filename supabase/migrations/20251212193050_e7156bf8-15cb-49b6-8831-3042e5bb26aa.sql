-- Add payment columns to appointments table
ALTER TABLE appointments ADD COLUMN IF NOT EXISTS payment_status TEXT DEFAULT 'not_required';
ALTER TABLE appointments ADD COLUMN IF NOT EXISTS payment_amount NUMERIC;
ALTER TABLE appointments ADD COLUMN IF NOT EXISTS payment_session_id TEXT;
ALTER TABLE appointments ADD COLUMN IF NOT EXISTS payment_paid_at TIMESTAMPTZ;
ALTER TABLE appointments ADD COLUMN IF NOT EXISTS payment_method TEXT;

-- Add index for payment lookups
CREATE INDEX IF NOT EXISTS idx_appointments_payment_session ON appointments(payment_session_id);
CREATE INDEX IF NOT EXISTS idx_appointments_payment_status ON appointments(payment_status);