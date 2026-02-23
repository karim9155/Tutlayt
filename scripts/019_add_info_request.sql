
-- Add info_request_details column to companies and interpreters
ALTER TABLE public.companies 
ADD COLUMN IF NOT EXISTS info_request_details TEXT;

ALTER TABLE public.interpreters 
ADD COLUMN IF NOT EXISTS info_request_details TEXT;
