-- Add detailed language columns to interpreters table
ALTER TABLE public.interpreters 
ADD COLUMN IF NOT EXISTS mother_tongues TEXT[] DEFAULT '{}',
ADD COLUMN IF NOT EXISTS languages_a TEXT[] DEFAULT '{}',
ADD COLUMN IF NOT EXISTS languages_b TEXT[] DEFAULT '{}',
ADD COLUMN IF NOT EXISTS languages_c TEXT[] DEFAULT '{}',
ADD COLUMN IF NOT EXISTS sign_interpreter BOOLEAN DEFAULT FALSE;
