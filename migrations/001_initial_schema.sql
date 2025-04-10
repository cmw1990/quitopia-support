-- Create public.users table that syncs with auth.users
CREATE TABLE IF NOT EXISTS public.users (
  id uuid REFERENCES auth.users(id) PRIMARY KEY,
  email text,
  full_name text,
  avatar_url text,
  preferences jsonb DEFAULT '{}'::jsonb,
  created_at timestamptz DEFAULT now(),
  updated_at timestamptz DEFAULT now()
);

-- Enable RLS on users table
ALTER TABLE public.users ENABLE ROW LEVEL SECURITY;

-- Create policy to allow users to view/edit their own data
CREATE POLICY users_policy ON public.users
  FOR ALL USING (auth.uid() = id);

-- Create trigger to sync user data between auth.users and public.users
CREATE OR REPLACE FUNCTION sync_user_data()
RETURNS TRIGGER AS $$
BEGIN
  IF TG_OP = 'INSERT' THEN
    INSERT INTO public.users (id, email)
    VALUES (NEW.id, NEW.email);
  ELSIF TG_OP = 'UPDATE' THEN
    UPDATE public.users
    SET email = NEW.email,
        updated_at = now()
    WHERE id = NEW.id;
  END IF;
  RETURN NEW;
END;
$$ LANGUAGE plpgsql SECURITY DEFINER;

-- Create trigger for user sync
DROP TRIGGER IF EXISTS sync_user_data_trigger ON auth.users;
CREATE TRIGGER sync_user_data_trigger
AFTER INSERT OR UPDATE ON auth.users
FOR EACH ROW
EXECUTE FUNCTION sync_user_data();

-- Create user preferences table
CREATE TABLE IF NOT EXISTS public.user_preferences (
  user_id uuid REFERENCES public.users(id) PRIMARY KEY,
  theme text DEFAULT 'light',
  notification_enabled boolean DEFAULT true,
  focus_mode_settings jsonb DEFAULT '{
    "defaultDuration": 25,
    "breakDuration": 5,
    "longBreakDuration": 15,
    "longBreakInterval": 4,
    "autoStartBreaks": false,
    "autoStartPomodoros": false
  }'::jsonb,
  created_at timestamptz DEFAULT now(),
  updated_at timestamptz DEFAULT now()
);

-- Enable RLS on user_preferences
ALTER TABLE public.user_preferences ENABLE ROW LEVEL SECURITY;

-- Create policy for user_preferences
CREATE POLICY user_preferences_policy ON public.user_preferences
  FOR ALL USING (auth.uid() = user_id);

-- Function to sync preferences
CREATE OR REPLACE FUNCTION sync_user_preferences()
RETURNS TRIGGER AS $$
BEGIN
  INSERT INTO public.user_preferences (user_id)
  VALUES (NEW.id)
  ON CONFLICT (user_id) DO NOTHING;
  RETURN NEW;
END;
$$ LANGUAGE plpgsql SECURITY DEFINER;

-- Create trigger for preferences sync
DROP TRIGGER IF EXISTS sync_user_preferences_trigger ON public.users;
CREATE TRIGGER sync_user_preferences_trigger
AFTER INSERT ON public.users
FOR EACH ROW
EXECUTE FUNCTION sync_user_preferences();

-- Log this migration
INSERT INTO schema_version (version, name)
VALUES (1, '001_initial_schema.sql')
ON CONFLICT (version) DO UPDATE SET name = EXCLUDED.name;