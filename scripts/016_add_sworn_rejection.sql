-- Add sworn_rejection_reason to interpreters table
ALTER TABLE public.interpreters 
ADD COLUMN IF NOT EXISTS sworn_rejection_reason TEXT;
