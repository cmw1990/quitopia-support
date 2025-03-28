-- SSOT8001-compliant migration for health improvements tracking
-- This migration creates two tables:
-- 1. default_health_improvements - Standard health improvements timeline data
-- 2. health_improvements - User-specific health improvements

-- Create default_health_improvements table
CREATE TABLE IF NOT EXISTS default_health_improvements (
  id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  title TEXT NOT NULL,
  description TEXT NOT NULL,
  timeline_hours INTEGER NOT NULL,
  icon TEXT NOT NULL,
  organ_system TEXT,
  milestone_type TEXT,
  created_at TIMESTAMP WITH TIME ZONE DEFAULT now(),
  updated_at TIMESTAMP WITH TIME ZONE DEFAULT now()
);

-- Create health_improvements table for user-specific data
CREATE TABLE IF NOT EXISTS health_improvements (
  id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  user_id UUID NOT NULL REFERENCES auth.users(id) ON DELETE CASCADE,
  title TEXT NOT NULL,
  description TEXT NOT NULL,
  timeline_hours INTEGER NOT NULL,
  icon TEXT NOT NULL,
  achieved BOOLEAN DEFAULT FALSE,
  achievement_date TIMESTAMP WITH TIME ZONE,
  organ_system TEXT,
  milestone_type TEXT,
  created_at TIMESTAMP WITH TIME ZONE DEFAULT now(),
  updated_at TIMESTAMP WITH TIME ZONE DEFAULT now()
);

-- Create index on user_id for faster querying
CREATE INDEX IF NOT EXISTS health_improvements_user_id_idx ON health_improvements(user_id);

-- Populate default_health_improvements with standard timeline data
INSERT INTO default_health_improvements (title, description, timeline_hours, icon, organ_system, milestone_type)
VALUES 
  ('Blood Oxygen Normalizes', 'Your blood oxygen levels have returned to normal.', 8, 'heart', 'cardiovascular', 'short-term'),
  ('Carbon Monoxide Levels Drop', 'Carbon monoxide levels in your blood drop by half.', 24, 'wind', 'respiratory', 'short-term'),
  ('Nicotine Eliminated', 'Nicotine is eliminated from your body.', 72, 'zap', 'cardiovascular', 'short-term'),
  ('Improved Sense of Taste', 'Your sense of taste begins to improve.', 48, 'coffee', 'sensory', 'medium-term'),
  ('Improved Smell', 'Your sense of smell starts to return to normal.', 72, 'wind', 'sensory', 'medium-term'),
  ('Breathing Easier', 'Breathing becomes easier as bronchial tubes relax.', 72, 'wind', 'respiratory', 'medium-term'),
  ('Energy Increase', 'Blood circulation improves, giving you more energy.', 336, 'zap', 'cardiovascular', 'medium-term'),
  ('Lung Function Improves', 'Your lung function begins to improve.', 720, 'activity', 'respiratory', 'long-term'),
  ('Reduced Heart Attack Risk', 'Your risk of heart attack begins to drop.', 2160, 'heart', 'cardiovascular', 'long-term'),
  ('Lung Cilia Regrow', 'Your lungs start to regrow cilia (tiny hairs that move mucus).', 4320, 'wind', 'respiratory', 'long-term'),
  ('Heart Disease Risk Halved', 'Your risk of coronary heart disease is now half that of a smoker.', 8760, 'heart', 'cardiovascular', 'long-term'),
  ('Stroke Risk Reduced', 'Your risk of stroke is now reduced to that of a nonsmoker.', 43800, 'activity', 'cardiovascular', 'long-term')
ON CONFLICT (id) DO NOTHING;

-- Enable Row Level Security (RLS)
ALTER TABLE health_improvements ENABLE ROW LEVEL SECURITY;
ALTER TABLE default_health_improvements ENABLE ROW LEVEL SECURITY;

-- Create RLS policies
-- default_health_improvements policy - Allow read for all authenticated users
CREATE POLICY default_health_improvements_select_policy
  ON default_health_improvements
  FOR SELECT
  TO authenticated
  USING (true);

-- health_improvements policy - Users can read their own data
CREATE POLICY health_improvements_select_policy
  ON health_improvements
  FOR SELECT
  TO authenticated
  USING (auth.uid() = user_id);

-- health_improvements policy - Users can insert their own data
CREATE POLICY health_improvements_insert_policy
  ON health_improvements
  FOR INSERT
  TO authenticated
  WITH CHECK (auth.uid() = user_id);

-- health_improvements policy - Users can update their own data
CREATE POLICY health_improvements_update_policy
  ON health_improvements
  FOR UPDATE
  TO authenticated
  USING (auth.uid() = user_id);

-- health_improvements policy - Users can delete their own data
CREATE POLICY health_improvements_delete_policy
  ON health_improvements
  FOR DELETE
  TO authenticated
  USING (auth.uid() = user_id);

-- Create function to initialize health improvements for new users
CREATE OR REPLACE FUNCTION initialize_user_health_improvements()
RETURNS TRIGGER AS $$
BEGIN
  -- Copy default health improvements to the user's specific health improvements
  INSERT INTO health_improvements 
    (user_id, title, description, timeline_hours, icon, organ_system, milestone_type)
  SELECT 
    NEW.id, title, description, timeline_hours, icon, organ_system, milestone_type
  FROM 
    default_health_improvements;
  
  RETURN NEW;
END;
$$ LANGUAGE plpgsql SECURITY DEFINER;

-- Create trigger to initialize health improvements for new users
DROP TRIGGER IF EXISTS on_auth_user_created ON auth.users;
CREATE TRIGGER on_auth_user_created
  AFTER INSERT ON auth.users
  FOR EACH ROW
  EXECUTE FUNCTION initialize_user_health_improvements();

-- Function to update health improvement achievement status
CREATE OR REPLACE FUNCTION update_health_improvement_achievements(user_id UUID, quit_date TIMESTAMP WITH TIME ZONE)
RETURNS VOID AS $$
DECLARE
  hours_since_quit INTEGER;
BEGIN
  -- Calculate hours since quit date
  hours_since_quit := EXTRACT(EPOCH FROM (NOW() - quit_date)) / 3600;
  
  -- Update achievements based on hours elapsed
  UPDATE health_improvements
  SET 
    achieved = CASE WHEN timeline_hours <= hours_since_quit THEN TRUE ELSE FALSE END,
    achievement_date = CASE 
      WHEN timeline_hours <= hours_since_quit THEN 
        quit_date + (timeline_hours * INTERVAL '1 hour')
      ELSE 
        NULL 
      END,
    updated_at = NOW()
  WHERE 
    user_id = update_health_improvement_achievements.user_id;
END;
$$ LANGUAGE plpgsql SECURITY DEFINER; 