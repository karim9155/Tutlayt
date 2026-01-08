-- Create verification status enum if it doesn't exist
DO $$ BEGIN
    CREATE TYPE verification_status AS ENUM ('unverified', 'pending_approval', 'verified', 'rejected');
EXCEPTION
    WHEN duplicate_object THEN null;
END $$;

-- Add verification_status and documents to companies table
ALTER TABLE public.companies 
ADD COLUMN IF NOT EXISTS verification_status verification_status DEFAULT 'unverified',
ADD COLUMN IF NOT EXISTS documents JSONB DEFAULT '{}'::jsonb;

-- Migrate existing boolean verified to status
UPDATE public.companies 
SET verification_status = 'verified' 
WHERE verified = TRUE AND verification_status = 'unverified';
