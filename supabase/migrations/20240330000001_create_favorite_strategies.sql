-- Create user favorite strategies table following SSOT8001 guidelines
-- Table name ends with '8' for proper versioning

-- User Favorite Strategies Table
CREATE TABLE user_favorite_strategies8 (
  id UUID DEFAULT uuid_generate_v4() PRIMARY KEY,
  user_id UUID NOT NULL REFERENCES auth.users(id) ON DELETE CASCADE,
  strategy_id UUID NOT NULL REFERENCES energy_conservation_strategies8(id) ON DELETE CASCADE,
  added_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
  created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
  updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
  UNIQUE (user_id, strategy_id)
);

-- Add trigger to update the updated_at column
CREATE TRIGGER update_user_favorite_strategies_timestamp
BEFORE UPDATE ON user_favorite_strategies8
FOR EACH ROW EXECUTE FUNCTION update_timestamp();

-- Add RLS policies for security
ALTER TABLE user_favorite_strategies8 ENABLE ROW LEVEL SECURITY;

-- Users can only CRUD their own favorite strategies
CREATE POLICY "Users can only read their own favorite strategies"
ON user_favorite_strategies8
FOR SELECT
TO authenticated
USING (auth.uid() = user_id);

CREATE POLICY "Users can only insert their own favorite strategies"
ON user_favorite_strategies8
FOR INSERT
TO authenticated
WITH CHECK (auth.uid() = user_id);

CREATE POLICY "Users can only update their own favorite strategies"
ON user_favorite_strategies8
FOR UPDATE
TO authenticated
USING (auth.uid() = user_id)
WITH CHECK (auth.uid() = user_id);

CREATE POLICY "Users can only delete their own favorite strategies"
ON user_favorite_strategies8
FOR DELETE
TO authenticated
USING (auth.uid() = user_id);

-- Create indexes for faster lookups
CREATE INDEX user_favorite_strategies8_user_id_idx ON user_favorite_strategies8 (user_id);
CREATE INDEX user_favorite_strategies8_strategy_id_idx ON user_favorite_strategies8 (strategy_id);

-- Insert some sample strategies for demo purposes
INSERT INTO energy_conservation_strategies8 
(user_id, strategy_name, description, energy_type, effectiveness_rating, contexts_used, is_favorite, usage_count)
VALUES 
('00000000-0000-0000-0000-000000000000', 'Deep Work Block', 'A focused work session with no distractions or interruptions', 'mental', 9, ARRAY['work', 'study'], true, 12),
('00000000-0000-0000-0000-000000000000', 'Physical Reset', 'Quick stretching routine to combat sedentary fatigue', 'physical', 8, ARRAY['work', 'home'], true, 8),
('00000000-0000-0000-0000-000000000000', 'Mindful Breathing', '5 minutes of conscious breathing to restore emotional balance', 'emotional', 7, ARRAY['work', 'home', 'social'], true, 15),
('00000000-0000-0000-0000-000000000000', 'Nature Walk', '15 minute outdoor walk to reset all energy systems', 'overall', 10, ARRAY['home', 'break'], true, 5),
('00000000-0000-0000-0000-000000000000', 'Power Nap', 'A short 20-minute nap to restore mental alertness', 'mental', 9, ARRAY['home', 'afternoon'], false, 3); 