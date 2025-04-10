-- Create achievements table if not exists
DO $$
BEGIN
  IF NOT EXISTS (
    SELECT 1 
    FROM information_schema.tables 
    WHERE table_name = 'achievements'
  ) THEN
    CREATE TABLE achievements (
      id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
      user_id UUID NOT NULL REFERENCES auth.users(id) ON DELETE CASCADE,
      name TEXT NOT NULL,
      description TEXT NOT NULL,
      category TEXT NOT NULL CHECK (category IN ('focus', 'tasks', 'energy', 'learning')),
      points INTEGER NOT NULL DEFAULT 0,
      icon TEXT,
      unlocked_at TIMESTAMPTZ NOT NULL DEFAULT NOW(),
      created_at TIMESTAMPTZ DEFAULT NOW(),
      updated_at TIMESTAMPTZ DEFAULT NOW()
    );
  END IF;
END $$;

-- Ensure RLS is enabled
DO $$
BEGIN
  IF NOT EXISTS (
    SELECT 1 
    FROM pg_policies 
    WHERE tablename = 'achievements' 
    AND policyname = 'Users can only access their own achievements'
  ) THEN
    ALTER TABLE achievements ENABLE ROW LEVEL SECURITY;
    
    CREATE POLICY "Users can only access their own achievements"
    ON achievements
    FOR ALL
    USING (auth.uid() = user_id);
  END IF;
END $$;

-- Create indexes if not exists
DO $$
BEGIN
  -- Use IF NOT EXISTS to prevent duplicate index errors
  EXECUTE 'CREATE INDEX IF NOT EXISTS idx_achievements_user_id ON achievements(user_id)';
  EXECUTE 'CREATE INDEX IF NOT EXISTS idx_achievements_category ON achievements(category)';
  EXECUTE 'CREATE INDEX IF NOT EXISTS idx_achievements_unlocked_at ON achievements(unlocked_at)';
EXCEPTION WHEN OTHERS THEN
  -- Silently handle any potential errors
  RAISE NOTICE 'Indexes may already exist';
END $$;

-- Rest of the migration remains the same as in the previous version
-- (Function definitions for get_overall_progress, generate_progress_report, export_progress_data)

-- Function to get overall progress
CREATE OR REPLACE FUNCTION get_overall_progress(p_user_id UUID)
RETURNS TABLE (
  total_focus_sessions BIGINT,
  total_tasks_completed BIGINT,
  total_energy_tracked BIGINT,
  progress_percentage NUMERIC
) AS $$
DECLARE
  total_categories NUMERIC := 3;
  focus_progress NUMERIC;
  tasks_progress NUMERIC;
  energy_progress NUMERIC;
BEGIN
  -- Focus sessions progress
  SELECT 
    COUNT(*) AS total_sessions,
    CASE 
      WHEN COUNT(*) > 0 THEN 
        (COUNT(*) FILTER (WHERE status = 'completed') * 100.0 / COUNT(*))
      ELSE 0 
    END AS progress
  INTO total_focus_sessions, focus_progress
  FROM focus_sessions
  WHERE user_id = p_user_id AND focus_type = 'focus';

  -- Tasks progress
  SELECT 
    COUNT(*) AS total_tasks,
    CASE 
      WHEN COUNT(*) > 0 THEN 
        (COUNT(*) FILTER (WHERE status = 'completed') * 100.0 / COUNT(*))
      ELSE 0 
    END AS progress
  INTO total_tasks_completed, tasks_progress
  FROM focus_tasks
  WHERE user_id = p_user_id;

  -- Energy tracking progress
  SELECT 
    COUNT(*) AS total_entries,
    CASE 
      WHEN COUNT(*) > 0 THEN 
        (COUNT(*) * 100.0 / (30 * total_categories))  -- Assume tracking for 30 days
      ELSE 0 
    END AS progress
  INTO total_energy_tracked, energy_progress
  FROM energy_tracking
  WHERE user_id = p_user_id;

  -- Calculate overall progress
  progress_percentage := COALESCE(
    (focus_progress + tasks_progress + energy_progress) / total_categories, 
    0
  );

  RETURN QUERY 
  SELECT 
    total_focus_sessions, 
    total_tasks_completed, 
    total_energy_tracked, 
    progress_percentage;
END;
$$ LANGUAGE plpgsql SECURITY DEFINER;

-- Function to generate progress report
CREATE OR REPLACE FUNCTION generate_progress_report(p_user_id UUID)
RETURNS TABLE (
  monthly_progress JSONB,
  top_performing_areas JSONB,
  recommended_improvements TEXT[]
) AS $$
DECLARE
  focus_performance NUMERIC;
  tasks_performance NUMERIC;
  energy_performance NUMERIC;
BEGIN
  -- Monthly progress calculation
  WITH monthly_data AS (
    SELECT 
      DATE_TRUNC('month', timestamp) AS month,
      AVG(
        CASE 
          WHEN focus_type = 'focus' AND status = 'completed' THEN 1.0
          WHEN status = 'completed' THEN 1.0
          ELSE 0.0
        END
      ) AS progress
    FROM (
      SELECT timestamp, focus_type, status FROM focus_sessions WHERE user_id = p_user_id
      UNION ALL
      SELECT created_at, 'tasks', status FROM focus_tasks WHERE user_id = p_user_id
      UNION ALL
      SELECT timestamp, 'energy', 'completed' FROM energy_tracking WHERE user_id = p_user_id
    ) combined_data
    GROUP BY DATE_TRUNC('month', timestamp)
    ORDER BY month DESC
    LIMIT 6
  ),
  performance_analysis AS (
    SELECT 
      AVG(
        CASE 
          WHEN focus_type = 'focus' AND status = 'completed' THEN 1.0
          WHEN status = 'completed' THEN 1.0
          ELSE 0.0
        END
      ) AS performance,
      type
    FROM (
      SELECT 'focus' AS type, focus_type, status FROM focus_sessions WHERE user_id = p_user_id
      UNION ALL
      SELECT 'tasks', 'tasks', status FROM focus_tasks WHERE user_id = p_user_id
      UNION ALL
      SELECT 'energy', 'energy', 'completed' FROM energy_tracking WHERE user_id = p_user_id
    ) combined_data
    GROUP BY type
  )
  SELECT 
    json_agg(
      json_build_object(
        'month', TO_CHAR(month, 'YYYY-MM'),
        'progress', progress * 100
      )
    ),
    json_agg(
      json_build_object(
        'category', type,
        'score', performance * 100
      )
    )
  INTO monthly_progress, top_performing_areas
  FROM monthly_data, performance_analysis;

  -- Performance tracking
  SELECT 
    AVG(
      CASE 
        WHEN focus_type = 'focus' AND status = 'completed' THEN 1.0
        WHEN status = 'completed' THEN 1.0
        ELSE 0.0
      END
    )
  INTO focus_performance
  FROM focus_sessions
  WHERE user_id = p_user_id AND focus_type = 'focus';

  SELECT 
    AVG(
      CASE 
        WHEN status = 'completed' THEN 1.0
        ELSE 0.0
      END
    )
  INTO tasks_performance
  FROM focus_tasks
  WHERE user_id = p_user_id;

  SELECT 
    COUNT(*) * 1.0 / (30 * 3)  -- Assume tracking for 30 days
  INTO energy_performance
  FROM energy_tracking
  WHERE user_id = p_user_id;

  -- Generate recommendations
  recommended_improvements := ARRAY[]::TEXT[];

  IF focus_performance < 0.5 THEN
    recommended_improvements := recommended_improvements || 'Improve focus session completion rate';
  END IF;

  IF tasks_performance < 0.5 THEN
    recommended_improvements := recommended_improvements || 'Complete more tasks consistently';
  END IF;

  IF energy_performance < 0.5 THEN
    recommended_improvements := recommended_improvements || 'Track energy levels more regularly';
  END IF;

  RETURN QUERY 
  SELECT 
    monthly_progress, 
    top_performing_areas, 
    recommended_improvements;
END;
$$ LANGUAGE plpgsql SECURITY DEFINER;

-- Function to export progress data
CREATE OR REPLACE FUNCTION export_progress_data(p_user_id UUID, p_format TEXT DEFAULT 'csv')
RETURNS TEXT AS $$
DECLARE
  export_data TEXT;
BEGIN
  IF p_format = 'json' THEN
    -- Export as JSON
    WITH combined_data AS (
      SELECT 
        'focus_session' AS type,
        id,
        start_time AS timestamp,
        duration,
        status
      FROM focus_sessions
      WHERE user_id = p_user_id

      UNION ALL

      SELECT 
        'task' AS type,
        id,
        created_at AS timestamp,
        0 AS duration,
        status
      FROM focus_tasks
      WHERE user_id = p_user_id

      UNION ALL

      SELECT 
        'energy_entry' AS type,
        id,
        timestamp,
        energy_level AS duration,
        'completed' AS status
      FROM energy_tracking
      WHERE user_id = p_user_id
    )
    SELECT json_agg(combined_data)::TEXT INTO export_data
    FROM combined_data;

  ELSE
    -- Export as CSV
    WITH combined_data AS (
      SELECT 
        'focus_session' AS type,
        id,
        start_time AS timestamp,
        duration,
        status
      FROM focus_sessions
      WHERE user_id = p_user_id

      UNION ALL

      SELECT 
        'task' AS type,
        id,
        created_at AS timestamp,
        0 AS duration,
        status
      FROM focus_tasks
      WHERE user_id = p_user_id

      UNION ALL

      SELECT 
        'energy_entry' AS type,
        id,
        timestamp,
        energy_level AS duration,
        'completed' AS status
      FROM energy_tracking
      WHERE user_id = p_user_id
    )
    SELECT 
      STRING_AGG(
        type || ',' || 
        id || ',' || 
        timestamp || ',' || 
        duration || ',' || 
        status, 
        E'\n'
      ) INTO export_data
    FROM combined_data;
  END IF;

  RETURN export_data;
END;
$$ LANGUAGE plpgsql SECURITY DEFINER;

-- Grant execution permissions
GRANT EXECUTE ON FUNCTION get_overall_progress(UUID) TO authenticated;
GRANT EXECUTE ON FUNCTION generate_progress_report(UUID) TO authenticated;
GRANT EXECUTE ON FUNCTION export_progress_data(UUID, TEXT) TO authenticated;