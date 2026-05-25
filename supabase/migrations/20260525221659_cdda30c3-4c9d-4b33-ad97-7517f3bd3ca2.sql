-- a) Backfill brakujących ról salon_owner dla wszystkich właścicieli salonów
INSERT INTO public.user_roles (user_id, role)
SELECT DISTINCT s.owner_id, 'salon_owner'::app_role
FROM public.salons s
WHERE s.owner_id IS NOT NULL
  AND NOT EXISTS (
    SELECT 1 FROM public.user_roles ur 
    WHERE ur.user_id = s.owner_id AND ur.role = 'salon_owner'::app_role
  )
ON CONFLICT (user_id, role) DO NOTHING;

-- b) Wzmocnienie triggera nadającego rolę salon_owner przy rejestracji
CREATE OR REPLACE FUNCTION public.handle_new_user_role()
RETURNS TRIGGER
LANGUAGE plpgsql
SECURITY DEFINER
SET search_path = public
AS $$
BEGIN
  BEGIN
    INSERT INTO public.user_roles (user_id, role)
    VALUES (NEW.id, 'salon_owner'::app_role)
    ON CONFLICT (user_id, role) DO NOTHING;
  EXCEPTION WHEN OTHERS THEN
    RAISE WARNING 'handle_new_user_role failed for user %: %', NEW.id, SQLERRM;
  END;
  RETURN NEW;
END;
$$;