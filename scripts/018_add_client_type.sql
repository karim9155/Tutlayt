ALTER TABLE public.companies ADD COLUMN IF NOT EXISTS client_type TEXT DEFAULT 'local';
