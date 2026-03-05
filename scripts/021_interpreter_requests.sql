-- Create interpreter request status enum (skip if already exists)
DO $$ BEGIN
  CREATE TYPE interpreter_request_status AS ENUM ('pending', 'assigned', 'fulfilled', 'cancelled', 'declined');
EXCEPTION WHEN duplicate_object THEN NULL;
END $$;

-- Create interpreter_requests table
-- This table stores requests from clients who want admin to assign an interpreter for them.
CREATE TABLE IF NOT EXISTS public.interpreter_requests (
  id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  client_id UUID REFERENCES public.profiles(id) ON DELETE CASCADE NOT NULL,
  
  -- Request details (same fields as bookings)
  title TEXT NOT NULL,
  platform TEXT,
  start_time TIMESTAMP WITH TIME ZONE NOT NULL,
  end_time TIMESTAMP WITH TIME ZONE NOT NULL,
  timezone TEXT NOT NULL,
  languages TEXT,
  subject_matter TEXT,
  description TEXT,
  meeting_link TEXT,
  preparation_materials_url TEXT,
  
  -- Budget
  budget DECIMAL(10, 2) NOT NULL,
  currency TEXT DEFAULT 'TND',
  
  -- Status tracking
  status interpreter_request_status DEFAULT 'pending',
  
  -- Interpreter suggestion/assignment
  suggested_interpreter_id UUID REFERENCES public.interpreters(id) ON DELETE SET NULL,
  assigned_interpreter_id UUID REFERENCES public.interpreters(id) ON DELETE SET NULL,
  booking_id UUID REFERENCES public.bookings(id) ON DELETE SET NULL,
  
  -- Admin notes
  admin_notes TEXT,
  
  created_at TIMESTAMP WITH TIME ZONE DEFAULT timezone('utc'::text, now()) NOT NULL,
  updated_at TIMESTAMP WITH TIME ZONE DEFAULT timezone('utc'::text, now()) NOT NULL
);

-- Enable RLS
ALTER TABLE public.interpreter_requests ENABLE ROW LEVEL SECURITY;

-- Policies (drop and recreate to be idempotent)

-- Clients can view their own requests
DROP POLICY IF EXISTS "Clients can view their own requests" ON public.interpreter_requests;
CREATE POLICY "Clients can view their own requests" ON public.interpreter_requests
  FOR SELECT USING (auth.uid() = client_id);

-- Clients can create requests
DROP POLICY IF EXISTS "Clients can create requests" ON public.interpreter_requests;
CREATE POLICY "Clients can create requests" ON public.interpreter_requests
  FOR INSERT WITH CHECK (auth.uid() = client_id);

-- Clients can update their own requests (e.g. cancel)
DROP POLICY IF EXISTS "Clients can update their own requests" ON public.interpreter_requests;
CREATE POLICY "Clients can update their own requests" ON public.interpreter_requests
  FOR UPDATE USING (auth.uid() = client_id);

-- Add a column to bookings to link back to interpreter_requests (optional back-reference)
ALTER TABLE public.bookings ADD COLUMN IF NOT EXISTS interpreter_request_id UUID REFERENCES public.interpreter_requests(id) ON DELETE SET NULL;
