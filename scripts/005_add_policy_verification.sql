-- Add signed_policy_url to interpreters table
ALTER TABLE public.interpreters 
ADD COLUMN IF NOT EXISTS signed_policy_url TEXT;
