-- Create tables for the adaptive anti-distraction feature
-- All table names end with '8' as per SSOT8001 standard

-- Distraction patterns table
CREATE TABLE anti_distraction_patterns8 (
  id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  user_id UUID NOT NULL REFERENCES auth.users(id) ON DELETE CASCADE,
  pattern_type TEXT NOT NULL CHECK (pattern_type IN ('website', 'app', 'search', 'notification', 'activity')),
  pattern_value TEXT NOT NULL,
  frequency INTEGER NOT NULL DEFAULT 1,
  time_of_day TEXT[] NOT NULL,
  context TEXT[] NOT NULL,
  impact_level INTEGER NOT NULL DEFAULT 5 CHECK (impact_level BETWEEN 1 AND 10),
  date_identified TIMESTAMPTZ NOT NULL DEFAULT NOW(),
  is_blocked BOOLEAN NOT NULL DEFAULT false,
  is_learning BOOLEAN NOT NULL DEFAULT true,
  created_at TIMESTAMPTZ NOT NULL DEFAULT NOW(),
  updated_at TIMESTAMPTZ NOT NULL DEFAULT NOW(),
  UNIQUE (user_id, pattern_type, pattern_value)
);

-- Distraction insights table
CREATE TABLE anti_distraction_insights8 (
  id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  user_id UUID NOT NULL REFERENCES auth.users(id) ON DELETE CASCADE,
  insight_type TEXT NOT NULL CHECK (insight_type IN ('pattern', 'schedule', 'context', 'trigger', 'recommendation')),
  description TEXT NOT NULL,
  related_patterns TEXT[] NOT NULL,
  confidence_level NUMERIC(3,2) NOT NULL DEFAULT 0.0 CHECK (confidence_level BETWEEN 0.0 AND 1.0),
  is_applied BOOLEAN NOT NULL DEFAULT false,
  created_at TIMESTAMPTZ NOT NULL DEFAULT NOW(),
  updated_at TIMESTAMPTZ NOT NULL DEFAULT NOW()
);

-- Adaptive blocking rules table
CREATE TABLE anti_distraction_rules8 (
  id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  user_id UUID NOT NULL REFERENCES auth.users(id) ON DELETE CASCADE,
  rule_type TEXT NOT NULL CHECK (rule_type IN ('schedule', 'context', 'threshold', 'progressive', 'custom')),
  rule_parameters JSONB NOT NULL DEFAULT '{}'::jsonb,
  is_active BOOLEAN NOT NULL DEFAULT true,
  created_at TIMESTAMPTZ NOT NULL DEFAULT NOW(),
  updated_at TIMESTAMPTZ NOT NULL DEFAULT NOW()
);

-- Distraction events log
CREATE TABLE anti_distraction_events8 (
  id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  user_id UUID NOT NULL REFERENCES auth.users(id) ON DELETE CASCADE,
  pattern_id UUID REFERENCES anti_distraction_patterns8(id) ON DELETE SET NULL,
  event_type TEXT NOT NULL CHECK (event_type IN ('blocked', 'allowed', 'warned', 'logged')),
  pattern_value TEXT NOT NULL,
  pattern_type TEXT NOT NULL,
  context TEXT,
  time_of_day TEXT,
  blocked_time INTEGER,
  created_at TIMESTAMPTZ NOT NULL DEFAULT NOW()
);

-- Distraction metrics cache for dashboard
CREATE TABLE anti_distraction_metrics8 (
  id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  user_id UUID NOT NULL REFERENCES auth.users(id) ON DELETE CASCADE,
  total_blocked INTEGER NOT NULL DEFAULT 0,
  total_allowed INTEGER NOT NULL DEFAULT 0,
  focus_time_saved INTEGER NOT NULL DEFAULT 0,
  most_frequent_patterns JSONB NOT NULL DEFAULT '[]'::jsonb,
  time_of_day_distribution JSONB NOT NULL DEFAULT '[]'::jsonb,
  context_distribution JSONB NOT NULL DEFAULT '[]'::jsonb,
  improvement_trend JSONB NOT NULL DEFAULT '[]'::jsonb,
  last_calculated TIMESTAMPTZ NOT NULL DEFAULT NOW(),
  created_at TIMESTAMPTZ NOT NULL DEFAULT NOW(),
  updated_at TIMESTAMPTZ NOT NULL DEFAULT NOW(),
  UNIQUE (user_id)
);

-- Create triggers to update the updated_at column automatically
CREATE OR REPLACE FUNCTION update_updated_at_column()
RETURNS TRIGGER AS $$
BEGIN
  NEW.updated_at = NOW();
  RETURN NEW;
END;
$$ LANGUAGE plpgsql;

CREATE TRIGGER update_anti_distraction_patterns_updated_at
BEFORE UPDATE ON anti_distraction_patterns8
FOR EACH ROW EXECUTE FUNCTION update_updated_at_column();

CREATE TRIGGER update_anti_distraction_insights_updated_at
BEFORE UPDATE ON anti_distraction_insights8
FOR EACH ROW EXECUTE FUNCTION update_updated_at_column();

CREATE TRIGGER update_anti_distraction_rules_updated_at
BEFORE UPDATE ON anti_distraction_rules8
FOR EACH ROW EXECUTE FUNCTION update_updated_at_column();

CREATE TRIGGER update_anti_distraction_metrics_updated_at
BEFORE UPDATE ON anti_distraction_metrics8
FOR EACH ROW EXECUTE FUNCTION update_updated_at_column();

-- Create indexes for performance
CREATE INDEX anti_distraction_patterns_user_id_idx ON anti_distraction_patterns8 (user_id);
CREATE INDEX anti_distraction_patterns_pattern_type_idx ON anti_distraction_patterns8 (pattern_type);
CREATE INDEX anti_distraction_patterns_impact_level_idx ON anti_distraction_patterns8 (impact_level);
CREATE INDEX anti_distraction_patterns_frequency_idx ON anti_distraction_patterns8 (frequency);

CREATE INDEX anti_distraction_insights_user_id_idx ON anti_distraction_insights8 (user_id);
CREATE INDEX anti_distraction_insights_insight_type_idx ON anti_distraction_insights8 (insight_type);
CREATE INDEX anti_distraction_insights_confidence_level_idx ON anti_distraction_insights8 (confidence_level);
CREATE INDEX anti_distraction_insights_is_applied_idx ON anti_distraction_insights8 (is_applied);

CREATE INDEX anti_distraction_rules_user_id_idx ON anti_distraction_rules8 (user_id);
CREATE INDEX anti_distraction_rules_rule_type_idx ON anti_distraction_rules8 (rule_type);
CREATE INDEX anti_distraction_rules_is_active_idx ON anti_distraction_rules8 (is_active);

CREATE INDEX anti_distraction_events_user_id_idx ON anti_distraction_events8 (user_id);
CREATE INDEX anti_distraction_events_pattern_id_idx ON anti_distraction_events8 (pattern_id);
CREATE INDEX anti_distraction_events_event_type_idx ON anti_distraction_events8 (event_type);
CREATE INDEX anti_distraction_events_created_at_idx ON anti_distraction_events8 (created_at);

-- Enable Row Level Security (RLS)
ALTER TABLE anti_distraction_patterns8 ENABLE ROW LEVEL SECURITY;
ALTER TABLE anti_distraction_insights8 ENABLE ROW LEVEL SECURITY;
ALTER TABLE anti_distraction_rules8 ENABLE ROW LEVEL SECURITY;
ALTER TABLE anti_distraction_events8 ENABLE ROW LEVEL SECURITY;
ALTER TABLE anti_distraction_metrics8 ENABLE ROW LEVEL SECURITY;

-- Create policies to allow users to only access their own data
CREATE POLICY "Users can view their own anti_distraction_patterns"
  ON anti_distraction_patterns8
  FOR SELECT
  TO authenticated
  USING (auth.uid() = user_id);

CREATE POLICY "Users can insert their own anti_distraction_patterns"
  ON anti_distraction_patterns8
  FOR INSERT
  TO authenticated
  WITH CHECK (auth.uid() = user_id);

CREATE POLICY "Users can update their own anti_distraction_patterns"
  ON anti_distraction_patterns8
  FOR UPDATE
  TO authenticated
  USING (auth.uid() = user_id);

CREATE POLICY "Users can delete their own anti_distraction_patterns"
  ON anti_distraction_patterns8
  FOR DELETE
  TO authenticated
  USING (auth.uid() = user_id);

-- Insights policies
CREATE POLICY "Users can view their own anti_distraction_insights"
  ON anti_distraction_insights8
  FOR SELECT
  TO authenticated
  USING (auth.uid() = user_id);

CREATE POLICY "Users can insert their own anti_distraction_insights"
  ON anti_distraction_insights8
  FOR INSERT
  TO authenticated
  WITH CHECK (auth.uid() = user_id);

CREATE POLICY "Users can update their own anti_distraction_insights"
  ON anti_distraction_insights8
  FOR UPDATE
  TO authenticated
  USING (auth.uid() = user_id);

CREATE POLICY "Users can delete their own anti_distraction_insights"
  ON anti_distraction_insights8
  FOR DELETE
  TO authenticated
  USING (auth.uid() = user_id);

-- Rules policies
CREATE POLICY "Users can view their own anti_distraction_rules"
  ON anti_distraction_rules8
  FOR SELECT
  TO authenticated
  USING (auth.uid() = user_id);

CREATE POLICY "Users can insert their own anti_distraction_rules"
  ON anti_distraction_rules8
  FOR INSERT
  TO authenticated
  WITH CHECK (auth.uid() = user_id);

CREATE POLICY "Users can update their own anti_distraction_rules"
  ON anti_distraction_rules8
  FOR UPDATE
  TO authenticated
  USING (auth.uid() = user_id);

CREATE POLICY "Users can delete their own anti_distraction_rules"
  ON anti_distraction_rules8
  FOR DELETE
  TO authenticated
  USING (auth.uid() = user_id);

-- Events policies
CREATE POLICY "Users can view their own anti_distraction_events"
  ON anti_distraction_events8
  FOR SELECT
  TO authenticated
  USING (auth.uid() = user_id);

CREATE POLICY "Users can insert their own anti_distraction_events"
  ON anti_distraction_events8
  FOR INSERT
  TO authenticated
  WITH CHECK (auth.uid() = user_id);

-- Metrics policies
CREATE POLICY "Users can view their own anti_distraction_metrics"
  ON anti_distraction_metrics8
  FOR SELECT
  TO authenticated
  USING (auth.uid() = user_id);

CREATE POLICY "Users can insert their own anti_distraction_metrics"
  ON anti_distraction_metrics8
  FOR INSERT
  TO authenticated
  WITH CHECK (auth.uid() = user_id);

CREATE POLICY "Users can update their own anti_distraction_metrics"
  ON anti_distraction_metrics8
  FOR UPDATE
  TO authenticated
  USING (auth.uid() = user_id);

-- Create stored procedures for the adaptive learning system
CREATE OR REPLACE FUNCTION log_distraction_event(
  p_pattern TEXT,
  p_pattern_type TEXT,
  p_context TEXT,
  p_time_of_day TEXT
) RETURNS VOID AS $$
DECLARE
  v_user_id UUID;
  v_pattern_id UUID;
  v_pattern_exists BOOLEAN;
BEGIN
  -- Get the current user ID
  v_user_id := auth.uid();
  
  -- Check if the pattern already exists
  SELECT id, TRUE INTO v_pattern_id, v_pattern_exists
  FROM anti_distraction_patterns8
  WHERE user_id = v_user_id
    AND pattern_type = p_pattern_type
    AND pattern_value = p_pattern;
    
  -- If the pattern doesn't exist, create it
  IF v_pattern_exists IS NULL THEN
    INSERT INTO anti_distraction_patterns8 (
      user_id, 
      pattern_type, 
      pattern_value, 
      frequency, 
      time_of_day, 
      context, 
      impact_level
    ) 
    VALUES (
      v_user_id, 
      p_pattern_type, 
      p_pattern, 
      1, 
      ARRAY[p_time_of_day], 
      ARRAY[p_context], 
      5
    )
    RETURNING id INTO v_pattern_id;
  ELSE
    -- Update the existing pattern
    UPDATE anti_distraction_patterns8
    SET 
      frequency = frequency + 1,
      time_of_day = array_append(time_of_day, p_time_of_day),
      context = array_append(context, p_context)
    WHERE id = v_pattern_id;
  END IF;
  
  -- Log the distraction event
  INSERT INTO anti_distraction_events8 (
    user_id,
    pattern_id,
    event_type,
    pattern_value,
    pattern_type,
    context,
    time_of_day
  )
  VALUES (
    v_user_id,
    v_pattern_id,
    'logged',
    p_pattern,
    p_pattern_type,
    p_context,
    p_time_of_day
  );
END;
$$ LANGUAGE plpgsql SECURITY DEFINER;

-- Create a function to get distraction metrics
CREATE OR REPLACE FUNCTION get_distraction_metrics(p_time_range TEXT DEFAULT '30d')
RETURNS TABLE (
  total_blocked INTEGER,
  total_allowed INTEGER,
  focus_time_saved INTEGER,
  most_frequent_patterns JSONB,
  time_of_day_distribution JSONB,
  context_distribution JSONB,
  improvement_trend JSONB
) AS $$
DECLARE
  v_user_id UUID;
  v_start_date TIMESTAMPTZ;
  v_metrics_row anti_distraction_metrics8%ROWTYPE;
BEGIN
  -- Get the current user ID
  v_user_id := auth.uid();
  
  -- Calculate the start date based on the time range
  CASE p_time_range
    WHEN '7d' THEN v_start_date := NOW() - INTERVAL '7 days';
    WHEN '30d' THEN v_start_date := NOW() - INTERVAL '30 days';
    WHEN '90d' THEN v_start_date := NOW() - INTERVAL '90 days';
    WHEN '1y' THEN v_start_date := NOW() - INTERVAL '1 year';
    ELSE v_start_date := NOW() - INTERVAL '30 days'; -- Default to 30 days
  END CASE;
  
  -- Check if we have recent cached metrics
  SELECT *
  INTO v_metrics_row
  FROM anti_distraction_metrics8
  WHERE user_id = v_user_id
    AND last_calculated > NOW() - INTERVAL '1 day';
  
  -- If we have recent metrics, return them
  IF v_metrics_row.id IS NOT NULL THEN
    RETURN QUERY SELECT
      v_metrics_row.total_blocked,
      v_metrics_row.total_allowed,
      v_metrics_row.focus_time_saved,
      v_metrics_row.most_frequent_patterns,
      v_metrics_row.time_of_day_distribution,
      v_metrics_row.context_distribution,
      v_metrics_row.improvement_trend;
    RETURN;
  END IF;
  
  -- Otherwise, calculate new metrics
  RETURN QUERY
  WITH events AS (
    SELECT
      event_type,
      pattern_value,
      pattern_type,
      context,
      time_of_day,
      created_at
    FROM anti_distraction_events8
    WHERE user_id = v_user_id
      AND created_at >= v_start_date
  ),
  blocked_counts AS (
    SELECT COUNT(*) AS count
    FROM events
    WHERE event_type = 'blocked'
  ),
  allowed_counts AS (
    SELECT COUNT(*) AS count
    FROM events
    WHERE event_type = 'allowed'
  ),
  focus_time AS (
    SELECT COALESCE(SUM(blocked_time), 0) AS total
    FROM anti_distraction_events8
    WHERE user_id = v_user_id
      AND created_at >= v_start_date
      AND event_type = 'blocked'
  ),
  frequent_patterns AS (
    SELECT
      pattern_value,
      COUNT(*) AS count
    FROM events
    GROUP BY pattern_value
    ORDER BY count DESC
    LIMIT 10
  ),
  time_distribution AS (
    SELECT
      EXTRACT(HOUR FROM created_at) AS hour,
      COUNT(*) AS count
    FROM events
    GROUP BY hour
    ORDER BY hour
  ),
  context_counts AS (
    SELECT
      context,
      COUNT(*) AS count
    FROM events
    WHERE context IS NOT NULL
    GROUP BY context
    ORDER BY count DESC
    LIMIT 10
  ),
  weekly_trend AS (
    SELECT
      date_trunc('week', created_at) AS week,
      COUNT(CASE WHEN event_type = 'blocked' THEN 1 END) AS blocked,
      COUNT(*) AS total
    FROM events
    GROUP BY week
    ORDER BY week
  )
  SELECT
    (SELECT count FROM blocked_counts),
    (SELECT count FROM allowed_counts),
    (SELECT total FROM focus_time),
    (SELECT jsonb_agg(jsonb_build_object('pattern', pattern_value, 'count', count)) FROM frequent_patterns),
    (SELECT jsonb_agg(jsonb_build_object('hour', hour, 'count', count)) FROM time_distribution),
    (SELECT jsonb_agg(jsonb_build_object('context', context, 'count', count)) FROM context_counts),
    (SELECT jsonb_agg(jsonb_build_object(
      'date', to_char(week, 'YYYY-MM-DD'),
      'blocked_ratio', CASE WHEN total > 0 THEN ROUND((blocked::NUMERIC / total) * 100, 2) ELSE 0 END
    )) FROM weekly_trend);
    
  -- Cache the results
  INSERT INTO anti_distraction_metrics8 (
    user_id,
    total_blocked,
    total_allowed,
    focus_time_saved,
    most_frequent_patterns,
    time_of_day_distribution,
    context_distribution,
    improvement_trend,
    last_calculated
  )
  SELECT
    v_user_id,
    total_blocked,
    total_allowed,
    focus_time_saved,
    most_frequent_patterns,
    time_of_day_distribution,
    context_distribution,
    improvement_trend,
    NOW()
  FROM get_distraction_metrics
  ON CONFLICT (user_id)
  DO UPDATE SET
    total_blocked = EXCLUDED.total_blocked,
    total_allowed = EXCLUDED.total_allowed,
    focus_time_saved = EXCLUDED.focus_time_saved,
    most_frequent_patterns = EXCLUDED.most_frequent_patterns,
    time_of_day_distribution = EXCLUDED.time_of_day_distribution,
    context_distribution = EXCLUDED.context_distribution,
    improvement_trend = EXCLUDED.improvement_trend,
    last_calculated = EXCLUDED.last_calculated;
END;
$$ LANGUAGE plpgsql SECURITY DEFINER;

-- Create a function to generate distraction insights
CREATE OR REPLACE FUNCTION generate_distraction_insights()
RETURNS SETOF anti_distraction_insights8 AS $$
DECLARE
  v_user_id UUID;
  v_insight anti_distraction_insights8%ROWTYPE;
  v_patterns TEXT[];
  v_frequent_time TEXT;
  v_frequent_context TEXT;
  v_most_impactful TEXT;
BEGIN
  -- Get the current user ID
  v_user_id := auth.uid();
  
  -- Get the most frequent time of day
  SELECT time_of_day[1] INTO v_frequent_time
  FROM (
    SELECT time_of_day, COUNT(*) as freq
    FROM anti_distraction_events8
    WHERE user_id = v_user_id
      AND time_of_day IS NOT NULL
    GROUP BY time_of_day
    ORDER BY freq DESC
    LIMIT 1
  ) AS freq_times;
  
  -- Get the most frequent context
  SELECT context INTO v_frequent_context
  FROM (
    SELECT context, COUNT(*) as freq
    FROM anti_distraction_events8
    WHERE user_id = v_user_id
      AND context IS NOT NULL
    GROUP BY context
    ORDER BY freq DESC
    LIMIT 1
  ) AS freq_contexts;
  
  -- Get the most impactful pattern
  SELECT pattern_value INTO v_most_impactful
  FROM anti_distraction_patterns8
  WHERE user_id = v_user_id
  ORDER BY impact_level DESC, frequency DESC
  LIMIT 1;
  
  -- Clean up old insights that haven't been applied
  DELETE FROM anti_distraction_insights8
  WHERE user_id = v_user_id
    AND is_applied = false
    AND created_at < NOW() - INTERVAL '7 days';
  
  -- Generate pattern insight
  IF v_most_impactful IS NOT NULL THEN
    v_patterns := ARRAY[v_most_impactful];
    
    INSERT INTO anti_distraction_insights8 (
      user_id,
      insight_type,
      description,
      related_patterns,
      confidence_level,
      is_applied
    )
    VALUES (
      v_user_id,
      'pattern',
      'You spend significant time on "' || v_most_impactful || '", consider scheduling specific times to check this instead of random access.',
      v_patterns,
      0.85,
      false
    )
    RETURNING * INTO v_insight;
    
    RETURN NEXT v_insight;
  END IF;
  
  -- Generate time-based insight
  IF v_frequent_time IS NOT NULL THEN
    INSERT INTO anti_distraction_insights8 (
      user_id,
      insight_type,
      description,
      related_patterns,
      confidence_level,
      is_applied
    )
    VALUES (
      v_user_id,
      'schedule',
      'You tend to get most distracted around ' || v_frequent_time || '. Consider blocking distractions during this time.',
      ARRAY[]::TEXT[],
      0.75,
      false
    )
    RETURNING * INTO v_insight;
    
    RETURN NEXT v_insight;
  END IF;
  
  -- Generate context-based insight
  IF v_frequent_context IS NOT NULL THEN
    INSERT INTO anti_distraction_insights8 (
      user_id,
      insight_type,
      description,
      related_patterns,
      confidence_level,
      is_applied
    )
    VALUES (
      v_user_id,
      'context',
      'Distractions are more frequent when you are in "' || v_frequent_context || '" context. Try to minimize distractions in this environment.',
      ARRAY[]::TEXT[],
      0.8,
      false
    )
    RETURNING * INTO v_insight;
    
    RETURN NEXT v_insight;
  END IF;
  
  -- Return empty set if no insights were generated
  RETURN;
END;
$$ LANGUAGE plpgsql SECURITY DEFINER;

-- Create a function to apply a recommendation
CREATE OR REPLACE FUNCTION apply_blocking_recommendation(p_insight_id UUID)
RETURNS VOID AS $$
DECLARE
  v_user_id UUID;
  v_insight anti_distraction_insights8%ROWTYPE;
  v_rule_type TEXT;
  v_rule_params JSONB;
BEGIN
  -- Get the current user ID
  v_user_id := auth.uid();
  
  -- Get the insight
  SELECT * INTO v_insight
  FROM anti_distraction_insights8
  WHERE id = p_insight_id
    AND user_id = v_user_id;
    
  IF v_insight.id IS NULL THEN
    RAISE EXCEPTION 'Insight not found or not owned by the current user';
  END IF;
  
  -- Mark the insight as applied
  UPDATE anti_distraction_insights8
  SET is_applied = true
  WHERE id = p_insight_id;
  
  -- Determine the rule type and parameters based on the insight type
  CASE v_insight.insight_type
    WHEN 'pattern' THEN
      v_rule_type := 'custom';
      v_rule_params := jsonb_build_object(
        'patterns', v_insight.related_patterns,
        'action', 'block'
      );
    WHEN 'schedule' THEN
      v_rule_type := 'schedule';
      v_rule_params := jsonb_build_object(
        'schedule', jsonb_build_object(
          'days', ARRAY['mon', 'tue', 'wed', 'thu', 'fri'],
          'start_time', '09:00',
          'end_time', '17:00'
        )
      );
    WHEN 'context' THEN
      v_rule_type := 'context';
      v_rule_params := jsonb_build_object(
        'context', ARRAY['work', 'study', 'focus']
      );
    ELSE
      v_rule_type := 'custom';
      v_rule_params := jsonb_build_object();
  END CASE;
  
  -- Create a new rule based on the insight
  INSERT INTO anti_distraction_rules8 (
    user_id,
    rule_type,
    rule_parameters,
    is_active
  )
  VALUES (
    v_user_id,
    v_rule_type,
    v_rule_params,
    true
  );
END;
$$ LANGUAGE plpgsql SECURITY DEFINER; 