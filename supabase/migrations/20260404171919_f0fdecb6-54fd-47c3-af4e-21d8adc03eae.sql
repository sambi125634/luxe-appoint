
-- Add CHECK constraints for input validation on clients table
ALTER TABLE public.clients ADD CONSTRAINT clients_first_name_length CHECK (char_length(trim(first_name)) >= 1 AND char_length(first_name) <= 100);
ALTER TABLE public.clients ADD CONSTRAINT clients_last_name_length CHECK (char_length(trim(last_name)) >= 1 AND char_length(last_name) <= 100);
ALTER TABLE public.clients ADD CONSTRAINT clients_phone_length CHECK (char_length(trim(phone)) >= 5 AND char_length(phone) <= 20);
ALTER TABLE public.clients ADD CONSTRAINT clients_email_format CHECK (email IS NULL OR (char_length(email) <= 255 AND email LIKE '%@%.%'));
