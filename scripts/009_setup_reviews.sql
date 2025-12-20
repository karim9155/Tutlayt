
-- Drop existing reviews table if it exists to ensure clean state
DROP TABLE IF EXISTS public.reviews CASCADE;

-- Create reviews table
CREATE TABLE IF NOT EXISTS public.reviews (
  id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  booking_id UUID REFERENCES public.bookings(id) ON DELETE CASCADE NOT NULL,
  reviewer_id UUID REFERENCES public.profiles(id) ON DELETE CASCADE NOT NULL,
  reviewee_id UUID REFERENCES public.profiles(id) ON DELETE CASCADE NOT NULL,
  rating INTEGER CHECK (rating >= 1 AND rating <= 5) NOT NULL,
  comment TEXT,
  created_at TIMESTAMP WITH TIME ZONE DEFAULT timezone('utc'::text, now()) NOT NULL,
  
  -- Ensure a user can only review a booking once
  UNIQUE(booking_id, reviewer_id)
);

-- Enable RLS
ALTER TABLE public.reviews ENABLE ROW LEVEL SECURITY;

-- Policies

-- Users can view reviews about them or written by them
CREATE POLICY "Users can view relevant reviews" ON public.reviews
  FOR SELECT USING (
    auth.uid() = reviewer_id OR 
    auth.uid() = reviewee_id OR
    -- Public reviews logic: If we want reviews to be public on profiles
    EXISTS (
      SELECT 1 FROM public.profiles 
      WHERE id = reviewee_id AND role = 'interpreter' -- Interpreters' reviews are public
    )
  );

-- Users can create reviews for bookings they are part of
CREATE POLICY "Users can create reviews" ON public.reviews
  FOR INSERT WITH CHECK (
    auth.uid() = reviewer_id AND
    EXISTS (
      SELECT 1 FROM public.bookings 
      WHERE id = booking_id AND (client_id = auth.uid() OR interpreter_id = auth.uid())
    )
  );
