-- Extended Interpreter Profile Updates
-- 1. Add Daily Rates (Local & International)
-- 2. Add Documents/Signature support (handled via documents JSONB, just ensuring keys exist in logic)
-- 3. Add Education History (JSONB)
-- 4. Add Equipment (Text Array)

-- Rates
ALTER TABLE public.interpreters 
ADD COLUMN IF NOT EXISTS daily_rate DECIMAL(10, 2),
ADD COLUMN IF NOT EXISTS daily_rate_international DECIMAL(10, 2),
ADD COLUMN IF NOT EXISTS currency_international TEXT DEFAULT 'USD';

-- Education & Equipment
ALTER TABLE public.interpreters
ADD COLUMN IF NOT EXISTS education_history JSONB DEFAULT '[]'::jsonb,
ADD COLUMN IF NOT EXISTS equipment TEXT[] DEFAULT '{}';


-- Comment:
-- documents JSONB column already exists from 012_add_interpreter_documents.sql
-- We will store: { "cv": "url", "signature": "url", "degrees": [{...}] } inside documents or use specific columns.
-- We are adding education_history as a separate column for structured data, 
-- while file proofs for degrees can go into documents or inside the education_history objects.
