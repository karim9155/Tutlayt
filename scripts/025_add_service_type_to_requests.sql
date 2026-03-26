-- Add service_type column to interpreter_requests
ALTER TABLE public.interpreter_requests
  ADD COLUMN IF NOT EXISTS service_type TEXT;
