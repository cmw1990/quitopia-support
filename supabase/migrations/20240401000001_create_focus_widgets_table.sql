-- Table for storing focus widget configurations
CREATE TABLE focus_widgets8 (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id UUID NOT NULL REFERENCES auth.users(id) ON DELETE CASCADE,
  config JSONB NOT NULL,
  created_at TIMESTAMPTZ NOT NULL DEFAULT NOW(),
  updated_at TIMESTAMPTZ NOT NULL DEFAULT NOW()
);

-- Create an index on user_id for faster lookups
CREATE INDEX focus_widgets8_user_id_idx ON focus_widgets8 (user_id);

-- Create a trigger to automatically update the updated_at column
CREATE TRIGGER set_focus_widgets8_updated_at
BEFORE UPDATE ON focus_widgets8
FOR EACH ROW
EXECUTE PROCEDURE update_updated_at_column();

-- Enable Row Level Security (RLS)
ALTER TABLE focus_widgets8 ENABLE ROW LEVEL SECURITY;

-- Create RLS policies
CREATE POLICY focus_widgets8_select_policy ON focus_widgets8
  FOR SELECT USING (auth.uid() = user_id);

CREATE POLICY focus_widgets8_insert_policy ON focus_widgets8
  FOR INSERT WITH CHECK (auth.uid() = user_id);

CREATE POLICY focus_widgets8_update_policy ON focus_widgets8
  FOR UPDATE USING (auth.uid() = user_id);

CREATE POLICY focus_widgets8_delete_policy ON focus_widgets8
  FOR DELETE USING (auth.uid() = user_id);

-- Create or replace stored procedures for RPC

-- Procedure to get focus time series data
CREATE OR REPLACE FUNCTION get_focus_time_series_data8(time_range TEXT DEFAULT '30d')
RETURNS TABLE (
  date TEXT,
  minutes FLOAT,
  sessions INTEGER,
  avg_score FLOAT
) LANGUAGE plpgsql SECURITY DEFINER AS $$
DECLARE
  v_start_date TIMESTAMPTZ;
BEGIN
  -- Calculate start date based on time range
  CASE
    WHEN time_range = '7d' THEN v_start_date := NOW() - INTERVAL '7 days';
    WHEN time_range = '30d' THEN v_start_date := NOW() - INTERVAL '30 days';
    WHEN time_range = '90d' THEN v_start_date := NOW() - INTERVAL '90 days';
    WHEN time_range = '1y' THEN v_start_date := NOW() - INTERVAL '1 year';
    ELSE v_start_date := NOW() - INTERVAL '30 days';
  END CASE;

  RETURN QUERY
  SELECT
    TO_CHAR(DATE_TRUNC('day', start_time), 'YYYY-MM-DD') AS date,
    ROUND(SUM(duration_seconds) / 60.0, 1) AS minutes,
    COUNT(*) AS sessions,
    ROUND(AVG(focus_level)::NUMERIC, 1) AS avg_score
  FROM
    focus_sessions8
  WHERE
    user_id = auth.uid()
    AND start_time >= v_start_date
  GROUP BY
    DATE_TRUNC('day', start_time)
  ORDER BY
    date;
END;
$$;

-- Procedure to get focus stats by context
CREATE OR REPLACE FUNCTION get_focus_stats_by_context8(time_range TEXT DEFAULT '30d')
RETURNS TABLE (
  context TEXT,
  total_minutes FLOAT,
  avg_focus_level FLOAT,
  session_count INTEGER
) LANGUAGE plpgsql SECURITY DEFINER AS $$
DECLARE
  v_start_date TIMESTAMPTZ;
BEGIN
  -- Calculate start date based on time range
  CASE
    WHEN time_range = '7d' THEN v_start_date := NOW() - INTERVAL '7 days';
    WHEN time_range = '30d' THEN v_start_date := NOW() - INTERVAL '30 days';
    WHEN time_range = '90d' THEN v_start_date := NOW() - INTERVAL '90 days';
    WHEN time_range = '1y' THEN v_start_date := NOW() - INTERVAL '1 year';
    ELSE v_start_date := NOW() - INTERVAL '30 days';
  END CASE;

  RETURN QUERY
  SELECT
    COALESCE(fs.context, 'No context') AS context,
    ROUND(SUM(fs.duration_seconds) / 60.0, 1) AS total_minutes,
    ROUND(AVG(fs.focus_level)::NUMERIC, 1) AS avg_focus_level,
    COUNT(*) AS session_count
  FROM
    focus_sessions8 fs
  WHERE
    fs.user_id = auth.uid()
    AND fs.start_time >= v_start_date
  GROUP BY
    fs.context
  ORDER BY
    total_minutes DESC;
END;
$$;

-- Procedure to get focus stats by time of day
CREATE OR REPLACE FUNCTION get_focus_stats_by_time_of_day8(time_range TEXT DEFAULT '30d')
RETURNS TABLE (
  hour INTEGER,
  total_minutes FLOAT,
  avg_focus_level FLOAT,
  session_count INTEGER
) LANGUAGE plpgsql SECURITY DEFINER AS $$
DECLARE
  v_start_date TIMESTAMPTZ;
BEGIN
  -- Calculate start date based on time range
  CASE
    WHEN time_range = '7d' THEN v_start_date := NOW() - INTERVAL '7 days';
    WHEN time_range = '30d' THEN v_start_date := NOW() - INTERVAL '30 days';
    WHEN time_range = '90d' THEN v_start_date := NOW() - INTERVAL '90 days';
    WHEN time_range = '1y' THEN v_start_date := NOW() - INTERVAL '1 year';
    ELSE v_start_date := NOW() - INTERVAL '30 days';
  END CASE;

  RETURN QUERY
  SELECT
    EXTRACT(HOUR FROM fs.start_time)::INTEGER AS hour,
    ROUND(SUM(fs.duration_seconds) / 60.0, 1) AS total_minutes,
    ROUND(AVG(fs.focus_level)::NUMERIC, 1) AS avg_focus_level,
    COUNT(*) AS session_count
  FROM
    focus_sessions8 fs
  WHERE
    fs.user_id = auth.uid()
    AND fs.start_time >= v_start_date
  GROUP BY
    hour
  ORDER BY
    hour;
END;
$$;

-- Procedure to get focus stats by weekday
CREATE OR REPLACE FUNCTION get_focus_stats_by_weekday8(time_range TEXT DEFAULT '30d')
RETURNS TABLE (
  weekday INTEGER,
  total_minutes FLOAT,
  avg_focus_level FLOAT,
  session_count INTEGER
) LANGUAGE plpgsql SECURITY DEFINER AS $$
DECLARE
  v_start_date TIMESTAMPTZ;
BEGIN
  -- Calculate start date based on time range
  CASE
    WHEN time_range = '7d' THEN v_start_date := NOW() - INTERVAL '7 days';
    WHEN time_range = '30d' THEN v_start_date := NOW() - INTERVAL '30 days';
    WHEN time_range = '90d' THEN v_start_date := NOW() - INTERVAL '90 days';
    WHEN time_range = '1y' THEN v_start_date := NOW() - INTERVAL '1 year';
    ELSE v_start_date := NOW() - INTERVAL '30 days';
  END CASE;

  RETURN QUERY
  SELECT
    EXTRACT(DOW FROM fs.start_time)::INTEGER AS weekday,
    ROUND(SUM(fs.duration_seconds) / 60.0, 1) AS total_minutes,
    ROUND(AVG(fs.focus_level)::NUMERIC, 1) AS avg_focus_level,
    COUNT(*) AS session_count
  FROM
    focus_sessions8 fs
  WHERE
    fs.user_id = auth.uid()
    AND fs.start_time >= v_start_date
  GROUP BY
    weekday
  ORDER BY
    weekday;
END;
$$;

-- Procedure to get top distractions
CREATE OR REPLACE FUNCTION get_top_distractions8(time_range TEXT DEFAULT '30d', limit_count INTEGER DEFAULT 5)
RETURNS TABLE (
  source TEXT,
  count INTEGER,
  impact_score FLOAT
) LANGUAGE plpgsql SECURITY DEFINER AS $$
DECLARE
  v_start_date TIMESTAMPTZ;
BEGIN
  -- Calculate start date based on time range
  CASE
    WHEN time_range = '7d' THEN v_start_date := NOW() - INTERVAL '7 days';
    WHEN time_range = '30d' THEN v_start_date := NOW() - INTERVAL '30 days';
    WHEN time_range = '90d' THEN v_start_date := NOW() - INTERVAL '90 days';
    WHEN time_range = '1y' THEN v_start_date := NOW() - INTERVAL '1 year';
    ELSE v_start_date := NOW() - INTERVAL '30 days';
  END CASE;

  -- If anti_distractions8 table exists, use it; otherwise, fallback to a simpler query
  IF EXISTS (SELECT 1 FROM pg_tables WHERE tablename = 'anti_distraction_events8') THEN
    RETURN QUERY
    SELECT
      ade.pattern_value AS source,
      COUNT(*) AS count,
      AVG(adp.impact_level)::FLOAT AS impact_score
    FROM
      anti_distraction_events8 ade
    JOIN
      anti_distraction_patterns8 adp ON ade.pattern_id = adp.id
    WHERE
      ade.user_id = auth.uid()
      AND ade.created_at >= v_start_date
    GROUP BY
      source
    ORDER BY
      count DESC
    LIMIT limit_count;
  ELSE
    -- Fallback query using distractions8 table if available
    IF EXISTS (SELECT 1 FROM pg_tables WHERE tablename = 'distractions8') THEN
      RETURN QUERY
      SELECT
        d.distraction_type AS source,
        COUNT(*) AS count,
        AVG(d.impact_level)::FLOAT AS impact_score
      FROM
        distractions8 d
      WHERE
        d.user_id = auth.uid()
        AND d.created_at >= v_start_date
      GROUP BY
        source
      ORDER BY
        count DESC
      LIMIT limit_count;
    ELSE
      -- Return empty result if no distraction tables exist
      RETURN QUERY
      SELECT
        'No data'::TEXT AS source,
        0 AS count,
        0.0 AS impact_score
      LIMIT 0;
    END IF;
  END IF;
END;
$$;

-- Procedure to export focus data
CREATE OR REPLACE FUNCTION export_focus_data8(time_range TEXT DEFAULT '30d', format TEXT DEFAULT 'json')
RETURNS JSONB LANGUAGE plpgsql SECURITY DEFINER AS $$
DECLARE
  v_start_date TIMESTAMPTZ;
  result JSONB;
BEGIN
  -- Calculate start date based on time range
  CASE
    WHEN time_range = '7d' THEN v_start_date := NOW() - INTERVAL '7 days';
    WHEN time_range = '30d' THEN v_start_date := NOW() - INTERVAL '30 days';
    WHEN time_range = '90d' THEN v_start_date := NOW() - INTERVAL '90 days';
    WHEN time_range = '1y' THEN v_start_date := NOW() - INTERVAL '1 year';
    ELSE v_start_date := NOW() - INTERVAL '30 days';
  END CASE;

  -- Collect all focus data into a JSON structure
  SELECT jsonb_build_object(
    'focus_sessions', (
      SELECT jsonb_agg(jsonb_build_object(
        'id', fs.id,
        'start_time', fs.start_time,
        'end_time', fs.end_time,
        'duration_seconds', fs.duration_seconds,
        'focus_type', fs.focus_type,
        'focus_level', fs.focus_level,
        'context', fs.context,
        'notes', fs.notes
      ))
      FROM focus_sessions8 fs
      WHERE fs.user_id = auth.uid() AND fs.start_time >= v_start_date
    ),
    'distractions', (
      CASE WHEN EXISTS (SELECT 1 FROM pg_tables WHERE tablename = 'distractions8') THEN
        (SELECT jsonb_agg(jsonb_build_object(
          'id', d.id,
          'timestamp', d.created_at,
          'type', d.distraction_type,
          'impact_level', d.impact_level,
          'notes', d.notes
        ))
        FROM distractions8 d
        WHERE d.user_id = auth.uid() AND d.created_at >= v_start_date)
      ELSE
        NULL
      END
    ),
    'adaptive_distractions', (
      CASE WHEN EXISTS (SELECT 1 FROM pg_tables WHERE tablename = 'anti_distraction_events8') THEN
        (SELECT jsonb_agg(jsonb_build_object(
          'id', ade.id,
          'timestamp', ade.created_at,
          'pattern_type', adp.pattern_type,
          'pattern_value', adp.pattern_value,
          'was_blocked', ade.was_blocked,
          'context', ade.context
        ))
        FROM anti_distraction_events8 ade
        JOIN anti_distraction_patterns8 adp ON ade.pattern_id = adp.id
        WHERE ade.user_id = auth.uid() AND ade.created_at >= v_start_date)
      ELSE
        NULL
      END
    ),
    'metadata', jsonb_build_object(
      'user_id', auth.uid(),
      'time_range', time_range,
      'export_date', NOW(),
      'format', format
    )
  ) INTO result;

  -- For CSV format, we would normally convert the data here
  -- However, in this implementation we're just returning JSON
  
  RETURN result;
END;
$$;

-- Procedure to generate focus insights
CREATE OR REPLACE FUNCTION generate_focus_insights8()
RETURNS TABLE (
  insight_type TEXT,
  description TEXT,
  confidence_level FLOAT
) LANGUAGE plpgsql SECURITY DEFINER AS $$
BEGIN
  -- This is a simplified placeholder implementation
  -- In a real implementation, this would perform complex analysis on the user's data
  
  RETURN QUERY
  WITH
    focus_data AS (
      SELECT
        EXTRACT(HOUR FROM start_time) AS hour,
        duration_seconds / 60.0 AS duration_minutes,
        focus_level,
        context
      FROM
        focus_sessions8
      WHERE
        user_id = auth.uid()
        AND start_time >= NOW() - INTERVAL '90 days'
    ),
    hourly_focus AS (
      SELECT
        hour,
        AVG(focus_level) AS avg_focus,
        COUNT(*) AS session_count
      FROM
        focus_data
      GROUP BY
        hour
      HAVING
        COUNT(*) >= 5
      ORDER BY
        avg_focus DESC
      LIMIT 1
    ),
    context_focus AS (
      SELECT
        context,
        AVG(focus_level) AS avg_focus,
        AVG(duration_minutes) AS avg_duration,
        COUNT(*) AS session_count
      FROM
        focus_data
      WHERE
        context IS NOT NULL
      GROUP BY
        context
      HAVING
        COUNT(*) >= 3
      ORDER BY
        avg_focus DESC
      LIMIT 1
    ),
    session_durations AS (
      SELECT
        CASE
          WHEN duration_minutes <= 15 THEN 'short'
          WHEN duration_minutes <= 30 THEN 'medium'
          ELSE 'long'
        END AS duration_category,
        AVG(focus_level) AS avg_focus,
        COUNT(*) AS session_count
      FROM
        focus_data
      GROUP BY
        duration_category
      HAVING
        COUNT(*) >= 5
      ORDER BY
        avg_focus DESC
      LIMIT 1
    )
  
  -- Generate best time of day insight
  SELECT
    'time_of_day'::TEXT AS insight_type,
    'Your focus level tends to be highest around ' || hourly_focus.hour || ':00. Consider scheduling important tasks during this time.' AS description,
    0.7 + (session_count / 100.0) AS confidence_level
  FROM
    hourly_focus
  WHERE
    EXISTS (SELECT 1 FROM hourly_focus)
  
  UNION ALL
  
  -- Generate best context insight
  SELECT
    'context'::TEXT AS insight_type,
    'You maintain better focus when working in "' || context_focus.context || '". Average focus score: ' || ROUND(context_focus.avg_focus::NUMERIC, 1) || '.' AS description,
    0.6 + (session_count / 100.0) AS confidence_level
  FROM
    context_focus
  WHERE
    EXISTS (SELECT 1 FROM context_focus)
  
  UNION ALL
  
  -- Generate optimal session duration insight
  SELECT
    'session_duration'::TEXT AS insight_type,
    CASE session_durations.duration_category
      WHEN 'short' THEN 'Short focus sessions (under 15 minutes) work best for you. Consider the Pomodoro technique with shorter intervals.'
      WHEN 'medium' THEN 'Medium-length focus sessions (15-30 minutes) are your sweet spot. Try setting timers for 25-minute work periods.'
      WHEN 'long' THEN 'You excel in longer focus sessions (over 30 minutes). Build your schedule around fewer, longer deep work periods.'
    END AS description,
    0.65 + (session_count / 100.0) AS confidence_level
  FROM
    session_durations
  WHERE
    EXISTS (SELECT 1 FROM session_durations);
END;
$$; 