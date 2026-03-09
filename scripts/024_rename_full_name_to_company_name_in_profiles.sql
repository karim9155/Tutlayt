-- Rename full_name to company_name in the profiles table
ALTER TABLE public.profiles RENAME COLUMN full_name TO company_name;

-- Update the handle_new_user trigger to use company_name
CREATE OR REPLACE FUNCTION public.handle_new_user()
RETURNS TRIGGER AS $$
BEGIN
  INSERT INTO public.profiles (id, email, role, company_name, phone)
  VALUES (
    new.id,
    new.email,
    COALESCE((new.raw_user_meta_data->>'role')::public.user_role, 'interpreter'::public.user_role),
    COALESCE(new.raw_user_meta_data->>'company_name', ''),
    new.raw_user_meta_data->>'phone'
  );

  -- Create corresponding role table entry
  IF (new.raw_user_meta_data->>'role') = 'company' THEN
    INSERT INTO public.companies (id, company_name)
    VALUES (new.id, COALESCE(new.raw_user_meta_data->>'company_name', ''));
  ELSE
    -- Default to interpreter
    INSERT INTO public.interpreters (id, phone)
    VALUES (new.id, new.raw_user_meta_data->>'phone');
  END IF;

  RETURN new;
END;
$$ LANGUAGE plpgsql SECURITY DEFINER SET search_path = public;
