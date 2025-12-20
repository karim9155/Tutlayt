
-- Drop existing objects to ensure clean state (handling schema changes)
DROP TABLE IF EXISTS public.bookings CASCADE;
DROP TYPE IF EXISTS booking_status CASCADE;

-- Create booking status enum
CREATE TYPE booking_status AS ENUM ('pending', 'accepted', 'declined', 'completed', 'cancelled');

-- Create bookings table
CREATE TABLE IF NOT EXISTS public.bookings (
  id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  client_id UUID REFERENCES public.profiles(id) ON DELETE CASCADE NOT NULL,
  interpreter_id UUID REFERENCES public.interpreters(id) ON DELETE CASCADE NOT NULL,
  status booking_status DEFAULT 'pending',
  
  -- Job Details
  platform TEXT,
  title TEXT NOT NULL,
  start_time TIMESTAMP WITH TIME ZONE NOT NULL,
  end_time TIMESTAMP WITH TIME ZONE NOT NULL,
  timezone TEXT NOT NULL,
  languages TEXT, -- e.g. "English -> Arabic"
  subject_matter TEXT,
  tags TEXT[] DEFAULT '{}',
  price DECIMAL(10, 2),
  currency TEXT DEFAULT 'TND',
  preparation_materials_url TEXT,
  description TEXT,
  meeting_link TEXT,
  
  created_at TIMESTAMP WITH TIME ZONE DEFAULT timezone('utc'::text, now()) NOT NULL,
  updated_at TIMESTAMP WITH TIME ZONE DEFAULT timezone('utc'::text, now()) NOT NULL
);

-- Enable RLS
ALTER TABLE public.bookings ENABLE ROW LEVEL SECURITY;

-- Policies

-- Clients can view their own bookings
CREATE POLICY "Clients can view their own bookings" ON public.bookings
  FOR SELECT USING (auth.uid() = client_id);

-- Interpreters can view bookings assigned to them
CREATE POLICY "Interpreters can view their assigned bookings" ON public.bookings
  FOR SELECT USING (auth.uid() = interpreter_id);

-- Clients can create bookings
CREATE POLICY "Clients can create bookings" ON public.bookings
  FOR INSERT WITH CHECK (auth.uid() = client_id);

-- Interpreters can update status of their bookings (Accept/Decline)
CREATE POLICY "Interpreters can update their bookings" ON public.bookings
  FOR UPDATE USING (auth.uid() = interpreter_id);

-- Clients can update their bookings (e.g. cancel)
CREATE POLICY "Clients can update their bookings" ON public.bookings
  FOR UPDATE USING (auth.uid() = client_id);
