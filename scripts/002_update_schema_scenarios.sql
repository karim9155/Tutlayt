-- Add fiscal_id and credits to companies
ALTER TABLE public.companies 
ADD COLUMN IF NOT EXISTS fiscal_id TEXT,
ADD COLUMN IF NOT EXISTS credits INTEGER DEFAULT 0;

-- Add wallet_balance to interpreters
ALTER TABLE public.interpreters 
ADD COLUMN IF NOT EXISTS wallet_balance INTEGER DEFAULT 0;

-- Create bookings table
CREATE TYPE booking_status AS ENUM ('pending', 'confirmed', 'completed', 'cancelled');
CREATE TYPE booking_type AS ENUM ('interpretation', 'translation');

CREATE TABLE IF NOT EXISTS public.bookings (
  id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  company_id UUID REFERENCES public.companies(id) ON DELETE CASCADE NOT NULL,
  interpreter_id UUID REFERENCES public.interpreters(id) ON DELETE CASCADE NOT NULL,
  mission_title TEXT NOT NULL,
  start_time TIMESTAMP WITH TIME ZONE NOT NULL,
  end_time TIMESTAMP WITH TIME ZONE NOT NULL,
  status booking_status DEFAULT 'pending',
  total_amount INTEGER NOT NULL,
  type booking_type DEFAULT 'interpretation',
  files_url TEXT[],
  physical_pickup BOOLEAN DEFAULT FALSE,
  created_at TIMESTAMP WITH TIME ZONE DEFAULT timezone('utc'::text, now()) NOT NULL
);

-- Create reviews table
CREATE TABLE IF NOT EXISTS public.reviews (
  id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  booking_id UUID REFERENCES public.bookings(id) ON DELETE CASCADE NOT NULL,
  rating INTEGER CHECK (rating >= 1 AND rating <= 5),
  comment TEXT,
  created_at TIMESTAMP WITH TIME ZONE DEFAULT timezone('utc'::text, now()) NOT NULL
);

-- Enable RLS for new tables
ALTER TABLE public.bookings ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.reviews ENABLE ROW LEVEL SECURITY;

-- Booking policies
CREATE POLICY "Companies can view their own bookings" ON public.bookings
  FOR SELECT USING (auth.uid() = company_id);

CREATE POLICY "Interpreters can view their own bookings" ON public.bookings
  FOR SELECT USING (auth.uid() = interpreter_id);

CREATE POLICY "Companies can create bookings" ON public.bookings
  FOR INSERT WITH CHECK (auth.uid() = company_id);

CREATE POLICY "Interpreters can update their bookings" ON public.bookings
  FOR UPDATE USING (auth.uid() = interpreter_id);

-- Review policies
CREATE POLICY "Reviews are viewable by everyone" ON public.reviews
  FOR SELECT USING (true);

CREATE POLICY "Companies can create reviews for their bookings" ON public.reviews
  FOR INSERT WITH CHECK (
    EXISTS (
      SELECT 1 FROM public.bookings 
      WHERE id = booking_id AND company_id = auth.uid()
    )
  );
