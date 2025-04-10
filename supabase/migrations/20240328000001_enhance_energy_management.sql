-- Create enhanced energy management tables following SSOT8001 guidelines
-- Each table name ends with '8' for proper versioning

-- Energy Recovery Recommendations Table
CREATE TABLE energy_recovery_recommendations8 (
  id UUID DEFAULT uuid_generate_v4() PRIMARY KEY,
  energy_level VARCHAR(20) NOT NULL CHECK (energy_level IN ('very_low', 'low', 'medium', 'high', 'very_high')),
  energy_type VARCHAR(20) NOT NULL CHECK (energy_type IN ('mental', 'physical', 'emotional', 'overall')),
  title VARCHAR(100) NOT NULL,
  description TEXT NOT NULL,
  duration_minutes INTEGER NOT NULL,
  effectiveness_score INTEGER NOT NULL CHECK (effectiveness_score BETWEEN 1 AND 10),
  suitable_contexts VARCHAR(50)[] NOT NULL,
  icon VARCHAR(50),
  created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
  updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- Anti-Fatigue Interventions Table
CREATE TABLE anti_fatigue_interventions8 (
  id UUID DEFAULT uuid_generate_v4() PRIMARY KEY,
  user_id UUID NOT NULL REFERENCES auth.users(id) ON DELETE CASCADE,
  intervention_type VARCHAR(50) NOT NULL,
  trigger_condition VARCHAR(50) NOT NULL,
  action_taken TEXT NOT NULL,
  effectiveness_rating INTEGER CHECK (effectiveness_rating BETWEEN 1 AND 10),
  notes TEXT,
  triggered_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
  created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
  updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- Ultradian Rhythm Tracking Table
CREATE TABLE ultradian_rhythms8 (
  id UUID DEFAULT uuid_generate_v4() PRIMARY KEY,
  user_id UUID NOT NULL REFERENCES auth.users(id) ON DELETE CASCADE,
  date DATE NOT NULL,
  peak_start_times TIMESTAMP WITH TIME ZONE[] NOT NULL,
  trough_start_times TIMESTAMP WITH TIME ZONE[] NOT NULL,
  peak_durations INTEGER[] NOT NULL,
  trough_durations INTEGER[] NOT NULL,
  notes TEXT,
  created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
  updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
  UNIQUE (user_id, date)
);

-- Energy Conservation Strategies Table
CREATE TABLE energy_conservation_strategies8 (
  id UUID DEFAULT uuid_generate_v4() PRIMARY KEY,
  user_id UUID NOT NULL REFERENCES auth.users(id) ON DELETE CASCADE,
  strategy_name VARCHAR(100) NOT NULL,
  description TEXT NOT NULL,
  energy_type VARCHAR(20) NOT NULL CHECK (energy_type IN ('mental', 'physical', 'emotional', 'overall')),
  effectiveness_rating INTEGER CHECK (effectiveness_rating BETWEEN 1 AND 10),
  contexts_used VARCHAR(50)[] NOT NULL,
  is_favorite BOOLEAN DEFAULT FALSE,
  usage_count INTEGER DEFAULT 0,
  created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
  updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- Energy Factors Analysis Table
CREATE TABLE energy_factors_analysis8 (
  id UUID DEFAULT uuid_generate_v4() PRIMARY KEY,
  user_id UUID NOT NULL REFERENCES auth.users(id) ON DELETE CASCADE,
  date DATE NOT NULL,
  sleep_quality INTEGER CHECK (sleep_quality BETWEEN 1 AND 10),
  sleep_duration INTEGER, -- in minutes
  nutrition_quality INTEGER CHECK (nutrition_quality BETWEEN 1 AND 10),
  hydration_level INTEGER CHECK (hydration_level BETWEEN 1 AND 10),
  exercise_duration INTEGER, -- in minutes
  exercise_intensity INTEGER CHECK (exercise_intensity BETWEEN 1 AND 10),
  stress_level INTEGER CHECK (stress_level BETWEEN 1 AND 10),
  caffeine_intake INTEGER, -- in mg
  screen_time INTEGER, -- in minutes
  outdoor_time INTEGER, -- in minutes
  social_interaction_time INTEGER, -- in minutes
  meditation_time INTEGER, -- in minutes
  notes TEXT,
  created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
  updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
  UNIQUE (user_id, date)
);

-- Add trigger to update the updated_at column
CREATE OR REPLACE FUNCTION update_timestamp()
RETURNS TRIGGER AS $$
BEGIN
  NEW.updated_at = NOW();
  RETURN NEW;
END;
$$ LANGUAGE plpgsql;

-- Create triggers for each table
CREATE TRIGGER update_energy_recovery_recommendations_timestamp
BEFORE UPDATE ON energy_recovery_recommendations8
FOR EACH ROW EXECUTE FUNCTION update_timestamp();

CREATE TRIGGER update_anti_fatigue_interventions_timestamp
BEFORE UPDATE ON anti_fatigue_interventions8
FOR EACH ROW EXECUTE FUNCTION update_timestamp();

CREATE TRIGGER update_ultradian_rhythms_timestamp
BEFORE UPDATE ON ultradian_rhythms8
FOR EACH ROW EXECUTE FUNCTION update_timestamp();

CREATE TRIGGER update_energy_conservation_strategies_timestamp
BEFORE UPDATE ON energy_conservation_strategies8
FOR EACH ROW EXECUTE FUNCTION update_timestamp();

CREATE TRIGGER update_energy_factors_analysis_timestamp
BEFORE UPDATE ON energy_factors_analysis8
FOR EACH ROW EXECUTE FUNCTION update_timestamp();

-- Add RLS policies for security
ALTER TABLE energy_recovery_recommendations8 ENABLE ROW LEVEL SECURITY;
ALTER TABLE anti_fatigue_interventions8 ENABLE ROW LEVEL SECURITY;
ALTER TABLE ultradian_rhythms8 ENABLE ROW LEVEL SECURITY;
ALTER TABLE energy_conservation_strategies8 ENABLE ROW LEVEL SECURITY;
ALTER TABLE energy_factors_analysis8 ENABLE ROW LEVEL SECURITY;

-- Energy recovery recommendations are available to all authenticated users
CREATE POLICY "Energy recovery recommendations are available to all authenticated users"
ON energy_recovery_recommendations8
FOR SELECT
TO authenticated
USING (true);

-- Users can only CRUD their own anti-fatigue interventions
CREATE POLICY "Users can only read their own anti-fatigue interventions"
ON anti_fatigue_interventions8
FOR SELECT
TO authenticated
USING (auth.uid() = user_id);

CREATE POLICY "Users can only insert their own anti-fatigue interventions"
ON anti_fatigue_interventions8
FOR INSERT
TO authenticated
WITH CHECK (auth.uid() = user_id);

CREATE POLICY "Users can only update their own anti-fatigue interventions"
ON anti_fatigue_interventions8
FOR UPDATE
TO authenticated
USING (auth.uid() = user_id)
WITH CHECK (auth.uid() = user_id);

CREATE POLICY "Users can only delete their own anti-fatigue interventions"
ON anti_fatigue_interventions8
FOR DELETE
TO authenticated
USING (auth.uid() = user_id);

-- Similar policies for ultradian rhythms
CREATE POLICY "Users can only read their own ultradian rhythms"
ON ultradian_rhythms8
FOR SELECT
TO authenticated
USING (auth.uid() = user_id);

CREATE POLICY "Users can only insert their own ultradian rhythms"
ON ultradian_rhythms8
FOR INSERT
TO authenticated
WITH CHECK (auth.uid() = user_id);

CREATE POLICY "Users can only update their own ultradian rhythms"
ON ultradian_rhythms8
FOR UPDATE
TO authenticated
USING (auth.uid() = user_id)
WITH CHECK (auth.uid() = user_id);

CREATE POLICY "Users can only delete their own ultradian rhythms"
ON ultradian_rhythms8
FOR DELETE
TO authenticated
USING (auth.uid() = user_id);

-- Similar policies for energy conservation strategies
CREATE POLICY "Users can only read their own energy conservation strategies"
ON energy_conservation_strategies8
FOR SELECT
TO authenticated
USING (auth.uid() = user_id);

CREATE POLICY "Users can only insert their own energy conservation strategies"
ON energy_conservation_strategies8
FOR INSERT
TO authenticated
WITH CHECK (auth.uid() = user_id);

CREATE POLICY "Users can only update their own energy conservation strategies"
ON energy_conservation_strategies8
FOR UPDATE
TO authenticated
USING (auth.uid() = user_id)
WITH CHECK (auth.uid() = user_id);

CREATE POLICY "Users can only delete their own energy conservation strategies"
ON energy_conservation_strategies8
FOR DELETE
TO authenticated
USING (auth.uid() = user_id);

-- Similar policies for energy factors analysis
CREATE POLICY "Users can only read their own energy factors analysis"
ON energy_factors_analysis8
FOR SELECT
TO authenticated
USING (auth.uid() = user_id);

CREATE POLICY "Users can only insert their own energy factors analysis"
ON energy_factors_analysis8
FOR INSERT
TO authenticated
WITH CHECK (auth.uid() = user_id);

CREATE POLICY "Users can only update their own energy factors analysis"
ON energy_factors_analysis8
FOR UPDATE
TO authenticated
USING (auth.uid() = user_id)
WITH CHECK (auth.uid() = user_id);

CREATE POLICY "Users can only delete their own energy factors analysis"
ON energy_factors_analysis8
FOR DELETE
TO authenticated
USING (auth.uid() = user_id);

-- Insert default recovery recommendations
INSERT INTO energy_recovery_recommendations8 
(energy_level, energy_type, title, description, duration_minutes, effectiveness_score, suitable_contexts, icon)
VALUES
('very_low', 'mental', 'Micro-Meditation', 'A 2-minute mindfulness meditation to reset your brain. Focus only on your breath.', 2, 8, ARRAY['work', 'study', 'home'], 'Brain'),
('low', 'mental', 'Memory Palace Walk', 'Mentally walk through a familiar location, placing items to remember along the way.', 5, 7, ARRAY['work', 'study'], 'Map'),
('medium', 'mental', 'Single-task Focus Block', 'Work on one specific task with zero distractions for 15 minutes.', 15, 9, ARRAY['work', 'study', 'creative'], 'Target'),
('high', 'mental', 'Challenging Puzzle', 'Take advantage of high mental energy with a challenging puzzle or problem.', 20, 8, ARRAY['home', 'creative'], 'Puzzle'),
('very_low', 'physical', 'Desk Stretches', 'Simple stretches you can do at your desk to relieve tension.', 3, 7, ARRAY['work', 'study'], 'Stretch'),
('low', 'physical', 'Walking Reset', 'A short walk to get your blood flowing and reset your energy.', 10, 9, ARRAY['work', 'study', 'home'], 'Footprints'),
('medium', 'physical', 'Quick HIIT', 'A high-intensity interval training session to boost energy.', 12, 10, ARRAY['home', 'exercise'], 'Activity'),
('high', 'physical', 'Strength Training', 'Use high physical energy for a productive strength training session.', 30, 9, ARRAY['home', 'exercise'], 'Dumbbell'),
('very_low', 'emotional', 'Gratitude Moment', 'Write down three things you're grateful for right now.', 3, 8, ARRAY['work', 'study', 'home'], 'Heart'),
('low', 'emotional', 'Music Therapy', 'Listen to music that matches the mood you want to cultivate.', 10, 8, ARRAY['work', 'home', 'creative'], 'Music'),
('medium', 'emotional', 'Connection Call', 'Reach out to a supportive friend or family member for a quick chat.', 15, 9, ARRAY['home'], 'Phone'),
('high', 'emotional', 'Creative Expression', 'Channel emotional energy into a creative project.', 25, 9, ARRAY['home', 'creative'], 'Palette'),
('very_low', 'overall', 'Power Nap', 'A quick 10-minute nap to reset your entire system.', 10, 10, ARRAY['home'], 'Moon'),
('low', 'overall', 'Nature Dose', 'Step outside for fresh air and natural surroundings.', 15, 9, ARRAY['work', 'study', 'home'], 'Tree'),
('medium', 'overall', 'Dopamine Detox', 'Step away from all screens and stimulation for 20 minutes.', 20, 8, ARRAY['work', 'study', 'home'], 'ZapOff'),
('high', 'overall', 'Skill Development', 'Use high energy to learn or improve a specific skill.', 30, 9, ARRAY['work', 'study', 'home', 'creative'], 'GraduationCap'); 