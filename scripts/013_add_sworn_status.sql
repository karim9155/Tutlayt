-- Add sworn translator columns to interpreters table
ALTER TABLE public.interpreters 
ADD COLUMN IF NOT EXISTS is_sworn BOOLEAN DEFAULT FALSE,
ADD COLUMN IF NOT EXISTS sworn_verified BOOLEAN DEFAULT FALSE;
