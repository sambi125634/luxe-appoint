CREATE TABLE public.referral_program_config (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  salon_id uuid NOT NULL UNIQUE,
  is_active boolean NOT NULL DEFAULT false,
  activate_after_visits int NOT NULL DEFAULT 5,
  referrer_reward_type text NOT NULL DEFAULT 'discount_pln',
  referrer_reward_value numeric NOT NULL DEFAULT 50,
  referrer_reward_description text NOT NULL DEFAULT 'Rabat 50 zł na kolejną wizytę',
  referee_reward_type text NOT NULL DEFAULT 'discount_pln',
  referee_reward_value numeric NOT NULL DEFAULT 30,
  referee_reward_description text NOT NULL DEFAULT 'Rabat 30 zł na pierwszą wizytę',
  referral_message_template text NOT NULL DEFAULT 'Cześć {imię}! 🌸

Jesteś jedną z naszych ulubionych klientek i chcemy Ci za to podziękować!

Stworzyłam dla Ciebie specjalny link — gdy znajoma zarezerwuje przez niego wizytę, Ty dostajesz {benefit_polecajacej}, a ona {benefit_nowej}.

Twój link: {link}

Dziękuję za zaufanie! 💜',
  referral_message_channel text NOT NULL DEFAULT 'sms',
  reminder_after_days int NOT NULL DEFAULT 14,
  code_validity_days int NOT NULL DEFAULT 90,
  max_referrals_per_client int,
  google_review_url text,
  facebook_review_url text,
  auto_send_review_request boolean NOT NULL DEFAULT true,
  review_request_delay_hours int NOT NULL DEFAULT 2,
  review_request_channel text NOT NULL DEFAULT 'sms',
  review_message_template text NOT NULL DEFAULT 'Cześć {imię}! Dziękuję za dzisiejszą wizytę! Czy możesz poświęcić 30 sekund na opinię w Google? Bardzo mi to pomoże: {link} ❤️',
  review_template_preset text NOT NULL DEFAULT 'warm',
  created_at timestamptz NOT NULL DEFAULT now(),
  updated_at timestamptz NOT NULL DEFAULT now()
);

GRANT SELECT, INSERT, UPDATE, DELETE ON public.referral_program_config TO authenticated;
GRANT ALL ON public.referral_program_config TO service_role;

ALTER TABLE public.referral_program_config ENABLE ROW LEVEL SECURITY;

CREATE POLICY "Salon owners manage referral_program_config"
  ON public.referral_program_config FOR ALL TO authenticated
  USING (EXISTS (SELECT 1 FROM public.salons WHERE id = salon_id AND owner_id = auth.uid()) OR public.has_role(auth.uid(), 'super_admin'))
  WITH CHECK (EXISTS (SELECT 1 FROM public.salons WHERE id = salon_id AND owner_id = auth.uid()) OR public.has_role(auth.uid(), 'super_admin'));

CREATE POLICY "Salon staff view referral_program_config"
  ON public.referral_program_config FOR SELECT TO authenticated
  USING (public.user_belongs_to_salon(auth.uid(), salon_id));

CREATE TRIGGER trg_referral_program_config_updated
  BEFORE UPDATE ON public.referral_program_config
  FOR EACH ROW EXECUTE FUNCTION public.update_updated_at_column();