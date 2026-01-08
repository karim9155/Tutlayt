-- Add documents jsonb column to interpreters table to track multiple files
ALTER TABLE public.interpreters 
ADD COLUMN IF NOT EXISTS documents JSONB DEFAULT '{}'::jsonb;
