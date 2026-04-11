-- User-facing referral codes (separate from admin referral_codes table)
CREATE TABLE public.user_referral_codes (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id uuid NOT NULL,
  salon_id uuid NOT NULL REFERENCES public.salons(id) ON DELETE CASCADE,
  code text UNIQUE NOT NULL,
  is_active boolean NOT NULL DEFAULT true,
  created_at timestamptz NOT NULL DEFAULT now(),
  UNIQUE(user_id, salon_id)
);

ALTER TABLE public.user_referral_codes ENABLE ROW LEVEL SECURITY;

CREATE POLICY "Users can view own referral codes"
  ON public.user_referral_codes FOR SELECT
  TO authenticated
  USING (auth.uid() = user_id);

CREATE POLICY "Users can create own referral codes"
  ON public.user_referral_codes FOR INSERT
  TO authenticated
  WITH CHECK (auth.uid() = user_id);

-- User-facing referrals tracking
CREATE TABLE public.user_referrals (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  referrer_user_id uuid NOT NULL,
  referred_user_id uuid NOT NULL,
  salon_id uuid NOT NULL REFERENCES public.salons(id) ON DELETE CASCADE,
  referral_code_id uuid NOT NULL REFERENCES public.user_referral_codes(id) ON DELETE CASCADE,
  status text NOT NULL DEFAULT 'pending',
  referred_at timestamptz NOT NULL DEFAULT now(),
  completed_at timestamptz,
  reward_points integer NOT NULL DEFAULT 50,
  UNIQUE(referred_user_id, salon_id)
);

ALTER TABLE public.user_referrals ENABLE ROW LEVEL SECURITY;

CREATE POLICY "Users can view own referrals as referrer"
  ON public.user_referrals FOR SELECT
  TO authenticated
  USING (auth.uid() = referrer_user_id);

CREATE POLICY "System can insert referrals"
  ON public.user_referrals FOR INSERT
  TO authenticated
  WITH CHECK (true);

CREATE POLICY "Users can view own referrals as referred"
  ON public.user_referrals FOR SELECT
  TO authenticated
  USING (auth.uid() = referred_user_id);

-- Function to auto-reward referrer when referred user completes first appointment
CREATE OR REPLACE FUNCTION public.handle_referral_reward()
RETURNS trigger
LANGUAGE plpgsql
SECURITY DEFINER
SET search_path = public
AS $$
DECLARE
  v_referral RECORD;
  v_referrer_salon_link RECORD;
  v_client_record RECORD;
BEGIN
  -- Only trigger on status change to completed
  IF NEW.status != 'completed' OR OLD.status = 'completed' THEN
    RETURN NEW;
  END IF;

  -- Find client record to get the user who booked
  SELECT * INTO v_client_record FROM public.clients WHERE id = NEW.client_id;
  IF v_client_record IS NULL THEN
    RETURN NEW;
  END IF;

  -- Find pending referral for this salon where the referred user matches
  -- We match via client_salon_links to find the user_id
  FOR v_referral IN
    SELECT ur.* FROM public.user_referrals ur
    JOIN public.client_salon_links csl ON csl.user_id = ur.referred_user_id AND csl.salon_id = ur.salon_id
    WHERE ur.salon_id = NEW.salon_id
      AND ur.status = 'pending'
      AND ur.referred_user_id IN (
        SELECT csl2.user_id FROM public.client_salon_links csl2
        JOIN public.clients c ON c.salon_id = csl2.salon_id AND c.email = (SELECT email FROM public.profiles WHERE id = csl2.user_id)
        WHERE c.id = NEW.client_id
      )
    LIMIT 1
  LOOP
    -- Update referral to rewarded
    UPDATE public.user_referrals
    SET status = 'rewarded', completed_at = now()
    WHERE id = v_referral.id;

    -- Find referrer's client record for loyalty stamps
    SELECT id INTO v_referrer_salon_link
    FROM public.clients
    WHERE salon_id = v_referral.salon_id
      AND email = (SELECT email FROM public.profiles WHERE id = v_referral.referrer_user_id)
    LIMIT 1;

    IF v_referrer_salon_link IS NOT NULL THEN
      INSERT INTO public.loyalty_stamps (user_id, client_id, salon_id, points, reason)
      VALUES (v_referral.referrer_user_id, v_referrer_salon_link.id, v_referral.salon_id, v_referral.reward_points, 'Polecenie znajomej');
    END IF;

    -- Notify the referrer
    INSERT INTO public.client_notifications (user_id, salon_id, title, description, type, action_url)
    VALUES (
      v_referral.referrer_user_id,
      v_referral.salon_id,
      'Twoja znajoma odbyła wizytę! 🌸',
      'Dodaliśmy ' || v_referral.reward_points || ' punktów lojalnościowych za polecenie.',
      'reward',
      '/app/refer'
    );
  END LOOP;

  RETURN NEW;
END;
$$;

CREATE TRIGGER trg_referral_reward
  AFTER UPDATE ON public.appointments
  FOR EACH ROW
  EXECUTE FUNCTION public.handle_referral_reward();