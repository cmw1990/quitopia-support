-- Create mood_logs table if it doesn't exist
CREATE TABLE IF NOT EXISTS mood_logs (
  id uuid DEFAULT uuid_generate_v4() PRIMARY KEY,
  user_id uuid REFERENCES auth.users(id) ON DELETE CASCADE,
  timestamp timestamptz NOT NULL DEFAULT now(),
  mood_score int NOT NULL,
  triggers text[] DEFAULT '{}',
  activities text[] DEFAULT '{}',
  notes text,
  related_to_cravings boolean DEFAULT false,
  created_at timestamptz DEFAULT now(),
  updated_at timestamptz DEFAULT now()
);

-- Add RLS policies for mood_logs
ALTER TABLE mood_logs ENABLE ROW LEVEL SECURITY;

-- Allow users to read their own mood logs
CREATE POLICY "Users can read their own mood logs" ON mood_logs
  FOR SELECT
  USING (auth.uid() = user_id);

-- Allow users to create their own mood logs
CREATE POLICY "Users can create their own mood logs" ON mood_logs
  FOR INSERT
  WITH CHECK (auth.uid() = user_id);

-- Create energy_logs table if it doesn't exist
CREATE TABLE IF NOT EXISTS energy_logs (
  id uuid DEFAULT uuid_generate_v4() PRIMARY KEY,
  user_id uuid REFERENCES auth.users(id) ON DELETE CASCADE,
  timestamp timestamptz NOT NULL DEFAULT now(),
  energy_level int NOT NULL,
  time_of_day text NOT NULL,
  caffeine_consumed boolean DEFAULT false,
  caffeine_amount_mg int,
  physical_activity boolean DEFAULT false,
  sleep_hours numeric NOT NULL,
  notes text,
  created_at timestamptz DEFAULT now(),
  updated_at timestamptz DEFAULT now()
);

-- Add RLS policies for energy_logs
ALTER TABLE energy_logs ENABLE ROW LEVEL SECURITY;

-- Allow users to read their own energy logs
CREATE POLICY "Users can read their own energy logs" ON energy_logs
  FOR SELECT
  USING (auth.uid() = user_id);

-- Allow users to create their own energy logs
CREATE POLICY "Users can create their own energy logs" ON energy_logs
  FOR INSERT
  WITH CHECK (auth.uid() = user_id);

-- Create focus_logs table if it doesn't exist
CREATE TABLE IF NOT EXISTS focus_logs (
  id uuid DEFAULT uuid_generate_v4() PRIMARY KEY,
  user_id uuid REFERENCES auth.users(id) ON DELETE CASCADE,
  timestamp timestamptz NOT NULL DEFAULT now(),
  focus_level int NOT NULL,
  duration_minutes int NOT NULL,
  interruptions int DEFAULT 0,
  task_type text,
  notes text,
  environment text,
  created_at timestamptz DEFAULT now(),
  updated_at timestamptz DEFAULT now()
);

-- Add RLS policies for focus_logs
ALTER TABLE focus_logs ENABLE ROW LEVEL SECURITY;

-- Allow users to read their own focus logs
CREATE POLICY "Users can read their own focus logs" ON focus_logs
  FOR SELECT
  USING (auth.uid() = user_id);

-- Allow users to create their own focus logs
CREATE POLICY "Users can create their own focus logs" ON focus_logs
  FOR INSERT
  WITH CHECK (auth.uid() = user_id);

-- Create energy_focus_logs view that combines energy and focus logs
CREATE OR REPLACE VIEW energy_focus_logs AS
SELECT 
  id,
  user_id,
  timestamp,
  energy_level,
  time_of_day,
  caffeine_consumed,
  caffeine_amount_mg,
  physical_activity,
  sleep_hours,
  notes,
  created_at
FROM energy_logs;

-- Create triggers to update updated_at timestamp
CREATE OR REPLACE FUNCTION update_health_logs_timestamp()
RETURNS TRIGGER AS $$
BEGIN
  NEW.updated_at = now();
  RETURN NEW;
END;
$$ language 'plpgsql';

-- Create triggers for updating timestamps
CREATE TRIGGER update_mood_logs_updated_at
  BEFORE UPDATE ON mood_logs
  FOR EACH ROW
  EXECUTE FUNCTION update_health_logs_timestamp();

CREATE TRIGGER update_energy_logs_updated_at
  BEFORE UPDATE ON energy_logs
  FOR EACH ROW
  EXECUTE FUNCTION update_health_logs_timestamp();

CREATE TRIGGER update_focus_logs_updated_at
  BEFORE UPDATE ON focus_logs
  FOR EACH ROW
  EXECUTE FUNCTION update_health_logs_timestamp(); 