DROP POLICY "System can insert referrals" ON public.user_referrals;

CREATE POLICY "Users can insert referrals as referred"
  ON public.user_referrals FOR INSERT
  TO authenticated
  WITH CHECK (auth.uid() = referred_user_id);