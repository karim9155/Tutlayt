-- Create an admin user for the Tutlayt admin dashboard.
-- Edit the email and password below before running.
-- Run this once in your Supabase SQL Editor.

DO $$
DECLARE
  v_user_id  uuid := uuid_generate_v4();
  v_email    text := 'admin@tutlayt.com';    -- ← change to your admin email
  v_password text := 'manSOUR9155@@***';  -- ← change to a strong password
BEGIN
  IF NOT EXISTS (SELECT 1 FROM auth.users WHERE email = v_email) THEN

    INSERT INTO auth.users (
      id, instance_id, aud, role, email,
      encrypted_password, email_confirmed_at,
      raw_app_meta_data, raw_user_meta_data,
      created_at, updated_at,
      confirmation_token, email_change,
      email_change_token_new, recovery_token
    ) VALUES (
      v_user_id,
      '00000000-0000-0000-0000-000000000000',
      'authenticated',
      'authenticated',
      v_email,
      crypt(v_password, gen_salt('bf')),
      now(),
      '{"provider":"email","providers":["email"]}',
      jsonb_build_object('role', 'admin', 'full_name', 'Admin'),
      now(), now(), '', '', '', ''
    );

    -- The handle_new_user trigger creates the profile automatically.
    -- Update it to set role = admin.
    UPDATE public.profiles
    SET role = 'admin', full_name = 'Admin'
    WHERE id = v_user_id;

  END IF;
END $$;
