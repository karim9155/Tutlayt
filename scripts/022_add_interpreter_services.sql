-- Add service types and additional rate fields to interpreters table
-- Services: proofreading, editing, translation, interpretation, sworn translation
-- Rates: translation per word, equipment rental per day

ALTER TABLE public.interpreters
ADD COLUMN IF NOT EXISTS services TEXT[] DEFAULT '{}',
ADD COLUMN IF NOT EXISTS rate_per_word DECIMAL(10, 4),
ADD COLUMN IF NOT EXISTS equipment_daily_rate DECIMAL(10, 2);

-- Notify PostgREST to reload schema
NOTIFY pgrst, 'reload schema';
