-- Add rejection_reason column to companies and interpreters
ALTER TABLE public.companies 
ADD COLUMN IF NOT EXISTS rejection_reason TEXT;

ALTER TABLE public.interpreters 
ADD COLUMN IF NOT EXISTS rejection_reason TEXT;
