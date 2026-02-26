-- Create table for equipment booking requests
create table public.equipment_requests (
  id uuid default gen_random_uuid() primary key,
  created_at timestamp with time zone default timezone('utc'::text, now()) not null,
  client_name text not null,
  client_email text not null,
  company_name text,
  event_date date not null,
  equipment_needed text[] not null, -- Array of equipment types requested
  additional_notes text,
  status text default 'pending' check (status in ('pending', 'contacted', 'confirmed', 'cancelled'))
);

-- set up RLS (Row Level Security)
alter table public.equipment_requests enable row level security;

-- Allow anyone to insert requests (public access for potential clients)
create policy "Allow public insert to equipment_requests"
  on public.equipment_requests for insert
  with check (true);

-- Allow authenticated users (admins/staff) to view requests
-- Assuming there's a role or admin check, but for now allow authenticated read
create policy "Allow authenticated read access"
  on public.equipment_requests for select
  using (auth.role() = 'authenticated');
