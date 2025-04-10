-- Create energy_tracking table
CREATE TABLE IF NOT EXISTS energy_tracking (
  id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  user_id UUID NOT NULL REFERENCES auth.users(id) ON DELETE CASCADE,
  energy_level INTEGER NOT NULL CHECK (energy_level BETWEEN 1 AND 10),
  timestamp TIMESTAMPTZ NOT NULL DEFAULT NOW(),
  notes TEXT,
  factors TEXT[]
);

-- Create RLS policies
DO $$
BEGIN
  IF NOT EXISTS (
    SELECT 1 
    FROM pg_policies 
    WHERE tablename = 'energy_tracking' 
    AND policyname = 'Users can only access their own energy entries'
  ) THEN
    ALTER TABLE energy_tracking ENABLE ROW LEVEL SECURITY;
    
    CREATE POLICY "Users can only access their own energy entries"
    ON energy_tracking
    FOR ALL
    USING (auth.uid() = user_id);
  END IF;
END $$;

-- Create indexes for performance
DO $$
BEGIN
  IF NOT EXISTS (
    SELECT 1 
    FROM pg_indexes 
    WHERE tablename = 'energy_tracking' 
    AND indexname = 'idx_energy_tracking_user_id'
  ) THEN
    CREATE INDEX idx_energy_tracking_user_id ON energy_tracking(user_id);
    CREATE INDEX idx_energy_tracking_timestamp ON energy_tracking(timestamp);
  END IF;
END $$;

-- Function to get energy trends
CREATE OR REPLACE FUNCTION get_energy_trends(p_user_id UUID)
RETURNS TABLE (
  average_energy_level NUMERIC,
  daily_trends JSONB,
  factor_impact JSONB
) AS $$
BEGIN
  RETURN QUERY
  WITH daily_averages AS (
    SELECT 
      DATE_TRUNC('day', timestamp) AS date,
      AVG(energy_level) AS average_energy
    FROM energy_tracking
    WHERE user_id = p_user_id
    GROUP BY DATE_TRUNC('day', timestamp)
    ORDER BY date DESC
    LIMIT 30
  ),
  factor_analysis AS (
    SELECT 
      unnest(factors) AS factor,
      AVG(energy_level) AS average_impact
    FROM energy_tracking
    WHERE user_id = p_user_id AND factors IS NOT NULL
    GROUP BY factor
    ORDER BY average_impact DESC
  )
  SELECT 
    (SELECT AVG(energy_level) FROM energy_tracking WHERE user_id = p_user_id) AS average_energy_level,
    (SELECT json_agg(json_build_object('date', date, 'averageEnergy', average_energy)) FROM daily_averages) AS daily_trends,
    (SELECT json_agg(json_build_object('factor', factor, 'averageImpact', average_impact)) FROM factor_analysis) AS factor_impact;
END;
$$ LANGUAGE plpgsql SECURITY DEFINER;

-- Function to generate energy recommendations
CREATE OR REPLACE FUNCTION generate_energy_recommendations(p_user_id UUID)
RETURNS TEXT[] AS $$
DECLARE
  recommendations TEXT[] := ARRAY[]::TEXT[];
  avg_energy NUMERIC;
  low_energy_days INTEGER;
  high_stress_factors TEXT[];
  i INTEGER;
BEGIN
  -- Calculate average energy level
  SELECT AVG(energy_level) INTO avg_energy
  FROM energy_tracking
  WHERE user_id = p_user_id;

  -- Check number of low energy days
  SELECT COUNT(*) INTO low_energy_days
  FROM energy_tracking
  WHERE user_id = p_user_id AND energy_level <= 3;

  -- Identify high-stress factors
  SELECT ARRAY(
    SELECT factor
    FROM (
      SELECT unnest(factors) AS factor, COUNT(*) AS factor_count
      FROM energy_tracking
      WHERE user_id = p_user_id AND energy_level <= 3
      GROUP BY factor
      ORDER BY factor_count DESC
      LIMIT 3
    ) AS high_stress_factors
  ) INTO high_stress_factors;

  -- Generate recommendations based on analysis
  IF avg_energy < 5 THEN
    recommendations := recommendations || 'Consider improving your sleep routine';
    recommendations := recommendations || 'Incorporate more regular exercise';
  END IF;

  IF low_energy_days > 5 THEN
    recommendations := recommendations || 'Track and minimize energy-draining activities';
    recommendations := recommendations || 'Practice stress management techniques';
  END IF;

  -- Use traditional for loop instead of FOREACH
  FOR i IN 1..array_length(high_stress_factors, 1) LOOP
    recommendations := recommendations || FORMAT('Reduce impact of %s on your energy levels', high_stress_factors[i]);
  END LOOP;

  IF array_length(recommendations, 1) = 0 THEN
    recommendations := ARRAY['Your energy levels look good. Keep maintaining your current routine!'];
  END IF;

  RETURN recommendations;
END;
$$ LANGUAGE plpgsql SECURITY DEFINER;

-- Grant execution permissions
GRANT EXECUTE ON FUNCTION get_energy_trends(UUID) TO authenticated;
GRANT EXECUTE ON FUNCTION generate_energy_recommendations(UUID) TO authenticated;