-- Create pomodoro_sessions table if not exists
CREATE TABLE IF NOT EXISTS pomodoro_sessions (
  id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  user_id UUID NOT NULL REFERENCES auth.users(id) ON DELETE CASCADE,
  duration INTEGER NOT NULL DEFAULT 25,
  break_duration INTEGER NOT NULL DEFAULT 5,
  completed BOOLEAN NOT NULL DEFAULT false,
  start_time TIMESTAMPTZ NOT NULL DEFAULT NOW(),
  end_time TIMESTAMPTZ,
  created_at TIMESTAMPTZ DEFAULT NOW(),
  updated_at TIMESTAMPTZ DEFAULT NOW()
);

-- Create RLS policies for pomodoro_sessions
DO $$
BEGIN
  IF NOT EXISTS (
    SELECT 1 
    FROM pg_policies 
    WHERE tablename = 'pomodoro_sessions' 
    AND policyname = 'Users can only access their own pomodoro sessions'
  ) THEN
    ALTER TABLE pomodoro_sessions ENABLE ROW LEVEL SECURITY;

    CREATE POLICY "Users can only access their own pomodoro sessions"
    ON pomodoro_sessions
    FOR ALL
    USING (auth.uid() = user_id);
  END IF;
END $$;

-- Create indexes for pomodoro_sessions
DO $$
BEGIN
  IF NOT EXISTS (
    SELECT 1 
    FROM pg_indexes 
    WHERE tablename = 'pomodoro_sessions' 
    AND indexname = 'idx_pomodoro_sessions_user_id'
  ) THEN
    CREATE INDEX idx_pomodoro_sessions_user_id ON pomodoro_sessions(user_id);
    CREATE INDEX idx_pomodoro_sessions_start_time ON pomodoro_sessions(start_time);
    CREATE INDEX idx_pomodoro_sessions_completed ON pomodoro_sessions(completed);
  END IF;
END $$;

-- Create achievements_definitions table if not exists
CREATE TABLE IF NOT EXISTS achievements_definitions (
  id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  name TEXT NOT NULL UNIQUE,
  description TEXT NOT NULL,
  category TEXT NOT NULL CHECK (category IN ('focus', 'tasks', 'energy', 'learning', 'pomodoro')),
  points INTEGER NOT NULL DEFAULT 0,
  icon TEXT,
  requirements JSONB NOT NULL,
  created_at TIMESTAMPTZ DEFAULT NOW(),
  updated_at TIMESTAMPTZ DEFAULT NOW()
);

-- Create RLS policies for achievements_definitions
DO $$
BEGIN
  IF NOT EXISTS (
    SELECT 1 
    FROM pg_policies 
    WHERE tablename = 'achievements_definitions' 
    AND policyname = 'Everyone can read achievements definitions'
  ) THEN
    ALTER TABLE achievements_definitions ENABLE ROW LEVEL SECURITY;

    CREATE POLICY "Everyone can read achievements definitions"
    ON achievements_definitions
    FOR SELECT
    TO authenticated
    USING (true);
  END IF;
END $$;

-- Create indexes for achievements_definitions
DO $$
BEGIN
  IF NOT EXISTS (
    SELECT 1 
    FROM pg_indexes 
    WHERE tablename = 'achievements_definitions' 
    AND indexname = 'idx_achievements_definitions_category'
  ) THEN
    CREATE INDEX idx_achievements_definitions_category ON achievements_definitions(category);
    CREATE INDEX idx_achievements_definitions_points ON achievements_definitions(points);
  END IF;
END $$;

-- Create progress_analytics table if not exists
CREATE TABLE IF NOT EXISTS progress_analytics (
  id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  user_id UUID NOT NULL REFERENCES auth.users(id) ON DELETE CASCADE,
  category TEXT NOT NULL CHECK (category IN ('focus', 'tasks', 'energy', 'learning', 'pomodoro')),
  metric TEXT NOT NULL,
  value NUMERIC NOT NULL,
  timestamp TIMESTAMPTZ NOT NULL DEFAULT NOW(),
  created_at TIMESTAMPTZ DEFAULT NOW(),
  updated_at TIMESTAMPTZ DEFAULT NOW()
);

-- Create RLS policies for progress_analytics
DO $$
BEGIN
  IF NOT EXISTS (
    SELECT 1 
    FROM pg_policies 
    WHERE tablename = 'progress_analytics' 
    AND policyname = 'Users can only access their own progress analytics'
  ) THEN
    ALTER TABLE progress_analytics ENABLE ROW LEVEL SECURITY;

    CREATE POLICY "Users can only access their own progress analytics"
    ON progress_analytics
    FOR ALL
    USING (auth.uid() = user_id);
  END IF;
END $$;

-- Create indexes for progress_analytics
DO $$
BEGIN
  IF NOT EXISTS (
    SELECT 1 
    FROM pg_indexes 
    WHERE tablename = 'progress_analytics' 
    AND indexname = 'idx_progress_analytics_user_id'
  ) THEN
    CREATE INDEX idx_progress_analytics_user_id ON progress_analytics(user_id);
    CREATE INDEX idx_progress_analytics_category ON progress_analytics(category);
    CREATE INDEX idx_progress_analytics_timestamp ON progress_analytics(timestamp);
  END IF;
END $$;

-- Insert default achievement definitions
INSERT INTO achievements_definitions (name, description, category, points, icon, requirements)
VALUES
  ('Focus Master', 'Complete 10 focus sessions', 'focus', 100, '🎯', '{"focus_sessions": 10}'),
  ('Task Champion', 'Complete 20 tasks', 'tasks', 150, '✅', '{"completed_tasks": 20}'),
  ('Energy Tracker', 'Track energy levels for 7 consecutive days', 'energy', 75, '⚡', '{"energy_tracking_days": 7}'),
  ('Learning Explorer', 'Try all learning games', 'learning', 50, '🎮', '{"games_tried": ["pattern_match", "memory_cards", "zen_drift"]}'),
  ('Pomodoro Pro', 'Complete 5 pomodoro sessions', 'pomodoro', 80, '⏱️', '{"pomodoro_sessions": 5}')
ON CONFLICT (name) DO NOTHING; 