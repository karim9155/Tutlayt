-- Add phone column to companies table (for client profiles)
ALTER TABLE public.companies
ADD COLUMN IF NOT EXISTS phone TEXT;
