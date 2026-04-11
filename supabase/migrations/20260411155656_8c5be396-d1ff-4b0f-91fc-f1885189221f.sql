ALTER TABLE public.push_tokens
  ADD CONSTRAINT push_tokens_user_platform_unique UNIQUE (user_id, platform);