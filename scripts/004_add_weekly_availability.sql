-- Add weekly_availability column to interpreters table
ALTER TABLE public.interpreters 
ADD COLUMN IF NOT EXISTS weekly_availability TEXT[] DEFAULT '{}';
