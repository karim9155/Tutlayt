-- One-time access codes for guest clients
-- Admin generates short codes; clients use them once to access the platform.

CREATE TABLE IF NOT EXISTS public.one_time_access_codes (
  id              UUID        PRIMARY KEY DEFAULT uuid_generate_v4(),
  code            TEXT        UNIQUE NOT NULL,
  description     TEXT,
  used            BOOLEAN     NOT NULL DEFAULT FALSE,
  used_by_email   TEXT,
  used_by_name    TEXT,
  used_by_user_id UUID        REFERENCES auth.users(id) ON DELETE SET NULL,
  used_at         TIMESTAMPTZ,
  created_at      TIMESTAMPTZ NOT NULL DEFAULT now()
);

-- Enable RLS.  No SELECT/INSERT/UPDATE/DELETE policies are created for
-- anon or authenticated roles — the admin client uses the service_role
-- key which bypasses RLS entirely, so the table is effectively locked
-- from all non-admin requests.
ALTER TABLE public.one_time_access_codes ENABLE ROW LEVEL SECURITY;
