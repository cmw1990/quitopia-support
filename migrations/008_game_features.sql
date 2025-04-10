-- Create game_sessions table if not exists
CREATE TABLE IF NOT EXISTS game_sessions (
  id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  user_id UUID NOT NULL REFERENCES auth.users(id) ON DELETE CASCADE,
  game_type TEXT NOT NULL CHECK (game_type IN ('pattern_match', 'memory_cards', 'zen_drift')),
  score INTEGER NOT NULL DEFAULT 0,
  duration NUMERIC NOT NULL DEFAULT 0,
  difficulty TEXT NOT NULL CHECK (difficulty IN ('easy', 'medium', 'hard')),
  completed BOOLEAN NOT NULL DEFAULT false,
  timestamp TIMESTAMPTZ NOT NULL DEFAULT NOW(),
  created_at TIMESTAMPTZ DEFAULT NOW(),
  updated_at TIMESTAMPTZ DEFAULT NOW()
);

-- Create RLS policies if not already set
DO $$
BEGIN
  IF NOT EXISTS (
    SELECT 1 
    FROM pg_policies 
    WHERE tablename = 'game_sessions' 
    AND policyname = 'Users can only access their own game sessions'
  ) THEN
    ALTER TABLE game_sessions ENABLE ROW LEVEL SECURITY;

    CREATE POLICY "Users can only access their own game sessions"
    ON game_sessions
    FOR ALL
    USING (auth.uid() = user_id);
  END IF;
END $$;

-- Create indexes if not exists
DO $$
BEGIN
  IF NOT EXISTS (
    SELECT 1 
    FROM pg_indexes 
    WHERE tablename = 'game_sessions' 
    AND indexname = 'idx_game_sessions_user_id'
  ) THEN
    CREATE INDEX idx_game_sessions_user_id ON game_sessions(user_id);
    CREATE INDEX idx_game_sessions_game_type ON game_sessions(game_type);
    CREATE INDEX idx_game_sessions_timestamp ON game_sessions(timestamp);
  END IF;
END $$;

-- Function to get game leaderboard
CREATE OR REPLACE FUNCTION get_game_leaderboard(
  p_game_type TEXT, 
  p_limit INTEGER DEFAULT 10
)
RETURNS TABLE (
  user_id UUID,
  username TEXT,
  highest_score INTEGER
) AS $$
BEGIN
  RETURN QUERY
  SELECT 
    gs.user_id,
    u.raw_user_meta_data->>'username' AS username,
    MAX(gs.score) AS highest_score
  FROM game_sessions gs
  JOIN auth.users u ON gs.user_id = u.id
  WHERE gs.game_type = p_game_type
  GROUP BY gs.user_id, u.raw_user_meta_data->>'username'
  ORDER BY highest_score DESC
  LIMIT p_limit;
END;
$$ LANGUAGE plpgsql SECURITY DEFINER;

-- Function to generate game recommendations
CREATE OR REPLACE FUNCTION generate_game_recommendations(p_user_id UUID)
RETURNS TABLE (
  recommended_game TEXT,
  reason TEXT
) AS $$
DECLARE
  pattern_match_stats RECORD;
  memory_cards_stats RECORD;
  zen_drift_stats RECORD;
BEGIN
  -- Fetch game performance stats
  SELECT 
    COUNT(*) AS total_sessions,
    AVG(score) AS avg_score,
    MAX(score) AS max_score
  INTO pattern_match_stats
  FROM game_sessions
  WHERE user_id = p_user_id AND game_type = 'pattern_match';

  SELECT 
    COUNT(*) AS total_sessions,
    AVG(score) AS avg_score,
    MAX(score) AS max_score
  INTO memory_cards_stats
  FROM game_sessions
  WHERE user_id = p_user_id AND game_type = 'memory_cards';

  SELECT 
    COUNT(*) AS total_sessions,
    AVG(score) AS avg_score,
    MAX(score) AS max_score
  INTO zen_drift_stats
  FROM game_sessions
  WHERE user_id = p_user_id AND game_type = 'zen_drift';

  -- Generate recommendations
  RETURN QUERY
  WITH game_analysis AS (
    SELECT 
      'pattern_match' AS game,
      pattern_match_stats.total_sessions,
      pattern_match_stats.avg_score,
      pattern_match_stats.max_score
    UNION ALL
    SELECT 
      'memory_cards' AS game,
      memory_cards_stats.total_sessions,
      memory_cards_stats.avg_score,
      memory_cards_stats.max_score
    UNION ALL
    SELECT 
      'zen_drift' AS game,
      zen_drift_stats.total_sessions,
      zen_drift_stats.avg_score,
      zen_drift_stats.max_score
  )
  SELECT 
    game AS recommended_game,
    CASE 
      WHEN total_sessions = 0 THEN 'New game to explore'
      WHEN avg_score < 50 THEN 'Improve your skills'
      WHEN max_score < 75 THEN 'Challenge yourself to improve'
      ELSE 'Keep practicing to maintain your skills'
    END AS reason
  FROM game_analysis
  ORDER BY 
    CASE 
      WHEN total_sessions = 0 THEN 1
      WHEN avg_score < 50 THEN 2
      WHEN max_score < 75 THEN 3
      ELSE 4
    END
  LIMIT 2;
END;
$$ LANGUAGE plpgsql SECURITY DEFINER;

-- Grant execution permissions
GRANT EXECUTE ON FUNCTION get_game_leaderboard(TEXT, INTEGER) TO authenticated;
GRANT EXECUTE ON FUNCTION generate_game_recommendations(UUID) TO authenticated;