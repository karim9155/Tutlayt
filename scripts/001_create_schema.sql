-- Reset schema (Drop everything to ensure clean state)
DROP TRIGGER IF EXISTS on_auth_user_created ON auth.users;
DROP FUNCTION IF EXISTS public.handle_new_user();
DROP TABLE IF EXISTS public.availability;
DROP TABLE IF EXISTS public.companies;
DROP TABLE IF EXISTS public.interpreters;
DROP TABLE IF EXISTS public.profiles;
DROP TYPE IF EXISTS user_role;

-- Enable UUID extension
CREATE EXTENSION IF NOT EXISTS "uuid-ossp";

-- Create custom types
CREATE TYPE user_role AS ENUM ('admin', 'interpreter', 'company');

-- Create profiles table (public profile for all users)
CREATE TABLE IF NOT EXISTS public.profiles (
  id UUID PRIMARY KEY REFERENCES auth.users(id) ON DELETE CASCADE,
  email TEXT NOT NULL,
  role user_role DEFAULT 'interpreter',
  full_name TEXT,
  avatar_url TEXT,
  created_at TIMESTAMP WITH TIME ZONE DEFAULT timezone('utc'::text, now()) NOT NULL,
  updated_at TIMESTAMP WITH TIME ZONE DEFAULT timezone('utc'::text, now()) NOT NULL
);

-- Create interpreters table (extended profile)
CREATE TABLE IF NOT EXISTS public.interpreters (
  id UUID PRIMARY KEY REFERENCES public.profiles(id) ON DELETE CASCADE,
  languages TEXT[] DEFAULT '{}',
  specializations TEXT[] DEFAULT '{}',
  bio TEXT,
  hourly_rate INTEGER,
  city TEXT,
  verified BOOLEAN DEFAULT FALSE,
  years_experience INTEGER DEFAULT 0,
  created_at TIMESTAMP WITH TIME ZONE DEFAULT timezone('utc'::text, now()) NOT NULL
);

-- Create companies table (extended profile)
CREATE TABLE IF NOT EXISTS public.companies (
  id UUID PRIMARY KEY REFERENCES public.profiles(id) ON DELETE CASCADE,
  company_name TEXT,
  industry TEXT,
  website TEXT,
  verified BOOLEAN DEFAULT FALSE,
  created_at TIMESTAMP WITH TIME ZONE DEFAULT timezone('utc'::text, now()) NOT NULL
);

-- Create availability table
CREATE TABLE IF NOT EXISTS public.availability (
  id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  interpreter_id UUID REFERENCES public.interpreters(id) ON DELETE CASCADE NOT NULL,
  date DATE NOT NULL,
  start_time TIME NOT NULL,
  end_time TIME NOT NULL,
  is_booked BOOLEAN DEFAULT FALSE,
  created_at TIMESTAMP WITH TIME ZONE DEFAULT timezone('utc'::text, now()) NOT NULL
);

-- Enable RLS
ALTER TABLE public.profiles ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.interpreters ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.companies ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.availability ENABLE ROW LEVEL SECURITY;

-- Profiles policies
DROP POLICY IF EXISTS "Public profiles are viewable by everyone" ON public.profiles;
CREATE POLICY "Public profiles are viewable by everyone" ON public.profiles
  FOR SELECT USING (true);

DROP POLICY IF EXISTS "Users can insert their own profile" ON public.profiles;
CREATE POLICY "Users can insert their own profile" ON public.profiles
  FOR INSERT WITH CHECK (auth.uid() = id);

DROP POLICY IF EXISTS "Users can update own profile" ON public.profiles;
CREATE POLICY "Users can update own profile" ON public.profiles
  FOR UPDATE USING (auth.uid() = id);

-- Interpreters policies
DROP POLICY IF EXISTS "Interpreters are viewable by everyone" ON public.interpreters;
CREATE POLICY "Interpreters are viewable by everyone" ON public.interpreters
  FOR SELECT USING (true);

DROP POLICY IF EXISTS "Interpreters can insert own profile" ON public.interpreters;
CREATE POLICY "Interpreters can insert own profile" ON public.interpreters
  FOR INSERT WITH CHECK (auth.uid() = id);

DROP POLICY IF EXISTS "Interpreters can update own profile" ON public.interpreters;
CREATE POLICY "Interpreters can update own profile" ON public.interpreters
  FOR UPDATE USING (auth.uid() = id);

-- Companies policies
DROP POLICY IF EXISTS "Companies are viewable by everyone" ON public.companies;
CREATE POLICY "Companies are viewable by everyone" ON public.companies
  FOR SELECT USING (true);

DROP POLICY IF EXISTS "Companies can insert own profile" ON public.companies;
CREATE POLICY "Companies can insert own profile" ON public.companies
  FOR INSERT WITH CHECK (auth.uid() = id);

DROP POLICY IF EXISTS "Companies can update own profile" ON public.companies;
CREATE POLICY "Companies can update own profile" ON public.companies
  FOR UPDATE USING (auth.uid() = id);

-- Availability policies
DROP POLICY IF EXISTS "Availability is viewable by everyone" ON public.availability;
CREATE POLICY "Availability is viewable by everyone" ON public.availability
  FOR SELECT USING (true);

DROP POLICY IF EXISTS "Interpreters can manage their own availability" ON public.availability;
CREATE POLICY "Interpreters can manage their own availability" ON public.availability
  FOR ALL USING (auth.uid() = interpreter_id);

-- Function to handle new user creation
CREATE OR REPLACE FUNCTION public.handle_new_user()
RETURNS TRIGGER AS $$
BEGIN
  INSERT INTO public.profiles (id, email, role, full_name)
  VALUES (
    new.id, 
    new.email, 
    COALESCE((new.raw_user_meta_data->>'role')::public.user_role, 'interpreter'::public.user_role),
    COALESCE(new.raw_user_meta_data->>'full_name', '')
  );
  
  -- Create corresponding role table entry
  IF (new.raw_user_meta_data->>'role') = 'company' THEN
    INSERT INTO public.companies (id, company_name) VALUES (new.id, COALESCE(new.raw_user_meta_data->>'company_name', ''));
  ELSE
    -- Default to interpreter
    INSERT INTO public.interpreters (id) VALUES (new.id);
  END IF;

  RETURN new;
END;
$$ LANGUAGE plpgsql SECURITY DEFINER SET search_path = public;

-- Trigger for new user
DROP TRIGGER IF EXISTS on_auth_user_created ON auth.users;
CREATE TRIGGER on_auth_user_created
  AFTER INSERT ON auth.users
  FOR EACH ROW EXECUTE FUNCTION public.handle_new_user();
