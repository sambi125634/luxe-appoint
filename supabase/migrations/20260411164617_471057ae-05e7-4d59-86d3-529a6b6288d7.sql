
-- Create appointment_waitlist table
CREATE TABLE public.appointment_waitlist (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id UUID NOT NULL REFERENCES auth.users(id) ON DELETE CASCADE,
  salon_id UUID NOT NULL REFERENCES public.salons(id) ON DELETE CASCADE,
  service_id UUID NOT NULL REFERENCES public.services(id),
  staff_member_id UUID REFERENCES public.staff_members(id),
  preferred_date_from DATE NOT NULL,
  preferred_date_to DATE,
  preferred_time_from TIME,
  preferred_time_to TIME,
  status TEXT NOT NULL DEFAULT 'waiting'
    CHECK (status IN ('waiting', 'notified', 'booked', 'expired', 'cancelled')),
  created_at TIMESTAMPTZ NOT NULL DEFAULT now(),
  notified_at TIMESTAMPTZ,
  expires_at TIMESTAMPTZ NOT NULL DEFAULT (now() + INTERVAL '30 days')
);

-- Enable RLS
ALTER TABLE public.appointment_waitlist ENABLE ROW LEVEL SECURITY;

-- Users can view their own waitlist entries
CREATE POLICY "Users can view own waitlist entries"
  ON public.appointment_waitlist FOR SELECT
  TO authenticated
  USING (auth.uid() = user_id);

-- Users can create their own waitlist entries
CREATE POLICY "Users can create own waitlist entries"
  ON public.appointment_waitlist FOR INSERT
  TO authenticated
  WITH CHECK (auth.uid() = user_id);

-- Users can update (cancel) their own waitlist entries
CREATE POLICY "Users can update own waitlist entries"
  ON public.appointment_waitlist FOR UPDATE
  TO authenticated
  USING (auth.uid() = user_id);

-- Salon staff can view waitlist for their salon
CREATE POLICY "Salon staff can view salon waitlist"
  ON public.appointment_waitlist FOR SELECT
  TO authenticated
  USING (public.user_belongs_to_salon(auth.uid(), salon_id));

-- Index for efficient lookup on cancellation
CREATE INDEX idx_waitlist_salon_service_status
  ON public.appointment_waitlist (salon_id, service_id, status)
  WHERE status = 'waiting';

CREATE INDEX idx_waitlist_user
  ON public.appointment_waitlist (user_id);

-- Trigger function: notify waitlist on appointment cancellation
CREATE OR REPLACE FUNCTION public.notify_waitlist_on_cancel()
RETURNS trigger
LANGUAGE plpgsql
SECURITY DEFINER
SET search_path = 'public'
AS $$
DECLARE
  v_entry RECORD;
  v_service_name TEXT;
  v_salon_name TEXT;
  v_cancelled_date DATE;
  v_cancelled_time TIME;
BEGIN
  -- Only fire when status changes TO cancelled
  IF NEW.status != 'cancelled' OR OLD.status = 'cancelled' THEN
    RETURN NEW;
  END IF;

  v_cancelled_date := NEW.start_time::date;
  v_cancelled_time := NEW.start_time::time;

  SELECT name INTO v_service_name FROM public.services WHERE id = NEW.service_id;
  SELECT name INTO v_salon_name FROM public.salons WHERE id = NEW.salon_id;

  -- Find up to 3 matching waitlist entries
  FOR v_entry IN
    SELECT w.id, w.user_id
    FROM public.appointment_waitlist w
    WHERE w.salon_id = NEW.salon_id
      AND w.service_id = NEW.service_id
      AND w.status = 'waiting'
      AND w.expires_at > now()
      AND v_cancelled_date BETWEEN w.preferred_date_from AND COALESCE(w.preferred_date_to, w.preferred_date_from + 30)
      AND (w.preferred_time_from IS NULL OR v_cancelled_time >= w.preferred_time_from)
      AND (w.preferred_time_to IS NULL OR v_cancelled_time <= w.preferred_time_to)
      AND (w.staff_member_id IS NULL OR w.staff_member_id = NEW.staff_id)
    ORDER BY w.created_at ASC
    LIMIT 3
  LOOP
    -- Mark as notified
    UPDATE public.appointment_waitlist
    SET status = 'notified', notified_at = now()
    WHERE id = v_entry.id;

    -- Create notification
    INSERT INTO public.client_notifications (user_id, salon_id, title, description, type, action_url)
    VALUES (
      v_entry.user_id,
      NEW.salon_id,
      'Zwolnił się termin! ⚡',
      'Zwolnił się termin na ' || COALESCE(v_service_name, 'usługę') || ' w ' || COALESCE(v_salon_name, 'salonie') || '! Zarezerwuj zanim ktoś inny zajmie miejsce.',
      'waitlist',
      '/app/salon/' || NEW.salon_id
    );
  END LOOP;

  RETURN NEW;
END;
$$;

-- Attach trigger to appointments
CREATE TRIGGER trg_notify_waitlist_on_cancel
  AFTER UPDATE ON public.appointments
  FOR EACH ROW
  EXECUTE FUNCTION public.notify_waitlist_on_cancel();
