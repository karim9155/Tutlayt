-- Enable pgcrypto for password hashing
CREATE EXTENSION IF NOT EXISTS pgcrypto;

DO $$
DECLARE
  v_user_id uuid := uuid_generate_v4();
  v_email text := 'mustapha@tutlayt.com';
  v_password text := 'poiuytreza';
BEGIN
  -- Only insert if user does not exist
  IF NOT EXISTS (SELECT 1 FROM auth.users WHERE email = v_email) THEN
    
    INSERT INTO auth.users (
      id,
      instance_id,
      aud,
      role,
      email,
      encrypted_password,
      email_confirmed_at,
      raw_app_meta_data,
      raw_user_meta_data,
      created_at,
      updated_at,
      confirmation_token,
      email_change,
      email_change_token_new,
      recovery_token
    ) VALUES (
      v_user_id,
      '00000000-0000-0000-0000-000000000000',
      'authenticated',
      'authenticated',
      v_email,
      crypt(v_password, gen_salt('bf')),
      now(),
      '{"provider": "email", "providers": ["email"]}',
      jsonb_build_object('role', 'admin', 'full_name', 'Mustapha'),
      now(),
      now(),
      '',
      '',
      '',
      ''
    );
    
    -- The trigger public.handle_new_user() will automatically run and creates the profile
    -- It will use the 'admin' role from raw_user_meta_data
    
    RAISE NOTICE 'Admin user created: %', v_email;
  ELSE
    RAISE NOTICE 'User % already exists', v_email;
  END IF;
END $$;
