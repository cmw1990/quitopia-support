-- Create energy conservation strategies table following SSOT8001 guidelines
-- Table name ends with '8' for proper versioning

-- Energy Conservation Strategies Table
CREATE TABLE energy_conservation_strategies8 (
  id UUID DEFAULT uuid_generate_v4() PRIMARY KEY,
  user_id UUID REFERENCES auth.users(id) ON DELETE CASCADE,
  strategy_name TEXT NOT NULL,
  description TEXT,
  energy_type TEXT NOT NULL CHECK (energy_type IN ('mental', 'physical', 'emotional', 'overall')),
  effectiveness_rating INTEGER CHECK (effectiveness_rating BETWEEN 1 AND 10),
  contexts_used TEXT[] DEFAULT '{}',
  is_favorite BOOLEAN DEFAULT FALSE,
  usage_count INTEGER DEFAULT 0,
  created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
  updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- Add trigger to update the updated_at column
CREATE TRIGGER update_energy_conservation_strategies_timestamp
BEFORE UPDATE ON energy_conservation_strategies8
FOR EACH ROW EXECUTE FUNCTION update_timestamp();

-- Add RLS policies for security
ALTER TABLE energy_conservation_strategies8 ENABLE ROW LEVEL SECURITY;

-- Global strategies (with null user_id) can be read by anyone
CREATE POLICY "Global strategies are viewable by all users"
ON energy_conservation_strategies8
FOR SELECT
TO authenticated
USING (user_id IS NULL OR auth.uid() = user_id);

-- Users can only create their own strategies
CREATE POLICY "Users can create their own strategies"
ON energy_conservation_strategies8
FOR INSERT
TO authenticated
WITH CHECK (auth.uid() = user_id);

-- Users can only update their own strategies
CREATE POLICY "Users can update their own strategies"
ON energy_conservation_strategies8
FOR UPDATE
TO authenticated
USING (auth.uid() = user_id)
WITH CHECK (auth.uid() = user_id);

-- Users can only delete their own strategies
CREATE POLICY "Users can delete their own strategies"
ON energy_conservation_strategies8
FOR DELETE
TO authenticated
USING (auth.uid() = user_id);

-- Create indexes for faster lookups
CREATE INDEX energy_conservation_strategies8_user_id_idx ON energy_conservation_strategies8 (user_id);
CREATE INDEX energy_conservation_strategies8_energy_type_idx ON energy_conservation_strategies8 (energy_type);

-- Insert default strategies
INSERT INTO energy_conservation_strategies8
(user_id, strategy_name, description, energy_type, effectiveness_rating, contexts_used)
VALUES
(NULL, 'Pomodoro Technique', 'Work for 25 minutes, then take a 5-minute break. After 4 cycles, take a longer break.', 'mental', 9, ARRAY['work', 'study']),
(NULL, 'Power Nap', 'A short 20-minute nap to restore mental alertness without entering deep sleep.', 'mental', 8, ARRAY['home', 'afternoon']),
(NULL, 'Desk Stretching', 'Simple stretches you can do at your desk to prevent stiffness and boost circulation.', 'physical', 7, ARRAY['work', 'office']),
(NULL, 'Walking Meeting', 'Conduct meetings while walking to combine productivity with physical activity.', 'physical', 8, ARRAY['work', 'meetings']),
(NULL, 'Mindfulness Break', '5-10 minutes of mindfulness meditation to reset emotional energy.', 'emotional', 9, ARRAY['anywhere']),
(NULL, 'Gratitude Journal', 'Take a moment to write down three things you are grateful for.', 'emotional', 8, ARRAY['morning', 'evening']),
(NULL, 'Nature Exposure', 'Spend 15 minutes outside in natural surroundings, ideally with trees.', 'overall', 10, ARRAY['break', 'lunch']),
(NULL, 'Digital Detox Hour', 'One hour with all digital devices turned off or put away.', 'overall', 9, ARRAY['evening', 'weekend']); 