-- Enable the auth schema if not already enabled
CREATE SCHEMA IF NOT EXISTS auth;

-- Create auth.users if it doesn't exist
CREATE TABLE IF NOT EXISTS auth.users (
  id uuid NOT NULL PRIMARY KEY,
  email text,
  encrypted_password text,
  email_confirmed_at timestamp with time zone,
  invited_at timestamp with time zone,
  confirmation_token text,
  confirmation_sent_at timestamp with time zone,
  recovery_token text,
  recovery_sent_at timestamp with time zone,
  email_change_token text,
  email_change text,
  email_change_sent_at timestamp with time zone,
  last_sign_in_at timestamp with time zone,
  raw_app_meta_data jsonb,
  raw_user_meta_data jsonb,
  aud text,
  role text,
  created_at timestamp with time zone,
  updated_at timestamp with time zone,
  phone text,
  phone_confirmed_at timestamp with time zone,
  phone_change text,
  phone_change_token text,
  phone_change_sent_at timestamp with time zone,
  confirmed_at timestamp with time zone,
  is_sso_user boolean DEFAULT false,
  deleted_at timestamp with time zone,
  banned_until timestamp with time zone,
  reauthentication_token text,
  reauthentication_sent_at timestamp with time zone,
  is_super_admin boolean DEFAULT false,
  instance_id uuid
);

-- Create auth.user_roles if it doesn't exist
CREATE TABLE IF NOT EXISTS auth.user_roles (
  user_id uuid REFERENCES auth.users(id) ON DELETE CASCADE,
  role text,
  created_at timestamp with time zone DEFAULT now(),
  PRIMARY KEY (user_id, role)
);

-- Create indexes
CREATE INDEX IF NOT EXISTS users_email_idx ON auth.users (email);
CREATE INDEX IF NOT EXISTS users_instance_id_idx ON auth.users (instance_id);
CREATE INDEX IF NOT EXISTS user_roles_user_id_idx ON auth.user_roles (user_id);
CREATE INDEX IF NOT EXISTS user_roles_role_idx ON auth.user_roles (role);

-- Record this migration
INSERT INTO schema_version (version, name)
VALUES (-1, '000_auth_setup.sql')
ON CONFLICT (version) DO UPDATE SET name = EXCLUDED.name;