
-- Working hours exceptions: per-date overrides for a staff member
CREATE TABLE public.working_hours_exceptions (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  salon_id uuid NOT NULL,
  staff_id uuid NOT NULL,
  date date NOT NULL,
  start_time time NOT NULL,
  end_time time NOT NULL,
  is_working boolean NOT NULL DEFAULT true,
  note text,
  created_at timestamptz NOT NULL DEFAULT now(),
  updated_at timestamptz NOT NULL DEFAULT now(),
  UNIQUE (staff_id, date)
);

CREATE INDEX idx_whe_salon_date ON public.working_hours_exceptions (salon_id, date);
CREATE INDEX idx_whe_staff_date ON public.working_hours_exceptions (staff_id, date);

ALTER TABLE public.working_hours_exceptions ENABLE ROW LEVEL SECURITY;

CREATE POLICY "Salon owners manage working_hours_exceptions"
  ON public.working_hours_exceptions FOR ALL
  TO authenticated
  USING (
    EXISTS (SELECT 1 FROM public.salons s WHERE s.id = salon_id AND s.owner_id = auth.uid())
    OR public.has_role(auth.uid(), 'super_admin'::app_role)
  )
  WITH CHECK (
    EXISTS (SELECT 1 FROM public.salons s WHERE s.id = salon_id AND s.owner_id = auth.uid())
    OR public.has_role(auth.uid(), 'super_admin'::app_role)
  );

CREATE POLICY "Salon staff view working_hours_exceptions"
  ON public.working_hours_exceptions FOR SELECT
  TO authenticated
  USING (public.user_belongs_to_salon(auth.uid(), salon_id));

CREATE TRIGGER trg_whe_updated_at
  BEFORE UPDATE ON public.working_hours_exceptions
  FOR EACH ROW
  EXECUTE FUNCTION public.update_updated_at_column();
