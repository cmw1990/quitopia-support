-- Focus Game Results Table
CREATE TABLE IF NOT EXISTS focus_game_results8 (
  id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  user_id UUID NOT NULL REFERENCES auth.users(id) ON DELETE CASCADE,
  game_id TEXT NOT NULL,
  score INTEGER NOT NULL,
  level_reached INTEGER,
  correct_matches INTEGER,
  total_attempts INTEGER,
  accuracy INTEGER,
  moves_made INTEGER,
  pairs_matched INTEGER,
  time_played INTEGER,
  breath_count INTEGER,
  longest_focus_streak INTEGER,
  distractions INTEGER,
  date_played TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT NOW(),
  created_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT NOW()
);

-- Create index on user_id for faster lookups
CREATE INDEX IF NOT EXISTS focus_game_results8_user_id_idx ON focus_game_results8(user_id);

-- Create index on game_id for faster lookups
CREATE INDEX IF NOT EXISTS focus_game_results8_game_id_idx ON focus_game_results8(game_id);

-- Create index on date_played for faster timeline queries
CREATE INDEX IF NOT EXISTS focus_game_results8_date_played_idx ON focus_game_results8(date_played);

-- Row Level Security (RLS) policies
ALTER TABLE focus_game_results8 ENABLE ROW LEVEL SECURITY;

-- Users can read only their own data
CREATE POLICY focus_game_results8_select_policy ON focus_game_results8
  FOR SELECT USING (auth.uid() = user_id);

-- Users can insert only their own data
CREATE POLICY focus_game_results8_insert_policy ON focus_game_results8
  FOR INSERT WITH CHECK (auth.uid() = user_id);

-- Users can update only their own data
CREATE POLICY focus_game_results8_update_policy ON focus_game_results8
  FOR UPDATE USING (auth.uid() = user_id);

-- Users can delete only their own data
CREATE POLICY focus_game_results8_delete_policy ON focus_game_results8
  FOR DELETE USING (auth.uid() = user_id); 