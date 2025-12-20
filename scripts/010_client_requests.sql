-- Create client_account_requests table
CREATE TABLE IF NOT EXISTS public.client_account_requests (
  id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  company_name TEXT NOT NULL,
  email TEXT NOT NULL,
  website TEXT,
  message TEXT,
  status TEXT DEFAULT 'pending' CHECK (status IN ('pending', 'approved', 'rejected', 'contacted')),
  created_at TIMESTAMP WITH TIME ZONE DEFAULT timezone('utc'::text, now()) NOT NULL
);

-- Enable RLS
ALTER TABLE public.client_account_requests ENABLE ROW LEVEL SECURITY;

-- Policies
-- Only admins can view requests (assuming admins will be implemented later or managed via Supabase dashboard)
-- For now, we allow insert for everyone (public) so they can sign up
CREATE POLICY "Anyone can create client requests" ON public.client_account_requests
  FOR INSERT WITH CHECK (true);

-- Only admins can view/update (placeholder for now, effectively private except for insert)
-- If you have an admin role, you would add:
-- CREATE POLICY "Admins can view requests" ON public.client_account_requests FOR SELECT USING (auth.role() = 'admin');
