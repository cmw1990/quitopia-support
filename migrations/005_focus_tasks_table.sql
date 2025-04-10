-- Alter focus_tasks table to ensure all required columns exist
DO $$
BEGIN
  -- Check and add missing columns
  IF NOT EXISTS (
    SELECT 1 
    FROM information_schema.columns 
    WHERE table_name = 'focus_tasks' 
    AND column_name = 'estimated_minutes'
  ) THEN
    ALTER TABLE focus_tasks 
    ADD COLUMN estimated_minutes INTEGER;
  END IF;

  IF NOT EXISTS (
    SELECT 1 
    FROM information_schema.columns 
    WHERE table_name = 'focus_tasks' 
    AND column_name = 'actual_minutes'
  ) THEN
    ALTER TABLE focus_tasks 
    ADD COLUMN actual_minutes INTEGER;
  END IF;

  IF NOT EXISTS (
    SELECT 1 
    FROM information_schema.columns 
    WHERE table_name = 'focus_tasks' 
    AND column_name = 'cognitive_load_estimate'
  ) THEN
    ALTER TABLE focus_tasks 
    ADD COLUMN cognitive_load_estimate INTEGER;
  END IF;

  IF NOT EXISTS (
    SELECT 1 
    FROM information_schema.columns 
    WHERE table_name = 'focus_tasks' 
    AND column_name = 'parent_task_id'
  ) THEN
    ALTER TABLE focus_tasks 
    ADD COLUMN parent_task_id UUID REFERENCES focus_tasks(id);
  END IF;

  IF NOT EXISTS (
    SELECT 1 
    FROM information_schema.columns 
    WHERE table_name = 'focus_tasks' 
    AND column_name = 'tags'
  ) THEN
    ALTER TABLE focus_tasks 
    ADD COLUMN tags TEXT[];
  END IF;

  IF NOT EXISTS (
    SELECT 1 
    FROM information_schema.columns 
    WHERE table_name = 'focus_tasks' 
    AND column_name = 'order'
  ) THEN
    ALTER TABLE focus_tasks 
    ADD COLUMN "order" INTEGER;
  END IF;

  IF NOT EXISTS (
    SELECT 1 
    FROM information_schema.columns 
    WHERE table_name = 'focus_tasks' 
    AND column_name = 'scheduled_start_time'
  ) THEN
    ALTER TABLE focus_tasks 
    ADD COLUMN scheduled_start_time TIMESTAMPTZ;
  END IF;

  IF NOT EXISTS (
    SELECT 1 
    FROM information_schema.columns 
    WHERE table_name = 'focus_tasks' 
    AND column_name = 'scheduled_end_time'
  ) THEN
    ALTER TABLE focus_tasks 
    ADD COLUMN scheduled_end_time TIMESTAMPTZ;
  END IF;

  IF NOT EXISTS (
    SELECT 1 
    FROM information_schema.columns 
    WHERE table_name = 'focus_tasks' 
    AND column_name = 'repeat_pattern'
  ) THEN
    ALTER TABLE focus_tasks 
    ADD COLUMN repeat_pattern TEXT;
  END IF;

  IF NOT EXISTS (
    SELECT 1 
    FROM information_schema.columns 
    WHERE table_name = 'focus_tasks' 
    AND column_name = 'difficulty_level'
  ) THEN
    ALTER TABLE focus_tasks 
    ADD COLUMN difficulty_level INTEGER DEFAULT 1;
  END IF;

  IF NOT EXISTS (
    SELECT 1 
    FROM information_schema.columns 
    WHERE table_name = 'focus_tasks' 
    AND column_name = 'category'
  ) THEN
    ALTER TABLE focus_tasks 
    ADD COLUMN category TEXT;
  END IF;
END $$;

-- Ensure RLS is enabled
DO $$
BEGIN
  -- Enable RLS if not already enabled
  IF NOT EXISTS (
    SELECT 1 
    FROM pg_policies 
    WHERE tablename = 'focus_tasks' 
    AND policyname = 'Users can only access their own tasks'
  ) THEN
    ALTER TABLE focus_tasks ENABLE ROW LEVEL SECURITY;
    
    CREATE POLICY "Users can only access their own tasks"
    ON focus_tasks
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
    WHERE tablename = 'focus_tasks' 
    AND indexname = 'idx_focus_tasks_parent_task_id'
  ) THEN
    CREATE INDEX idx_focus_tasks_parent_task_id ON focus_tasks(parent_task_id);
    CREATE INDEX idx_focus_tasks_scheduled_start_time ON focus_tasks(scheduled_start_time);
    CREATE INDEX idx_focus_tasks_scheduled_end_time ON focus_tasks(scheduled_end_time);
    CREATE INDEX idx_focus_tasks_difficulty_level ON focus_tasks(difficulty_level);
  END IF;
END $$;

-- Recreate task statistics function
CREATE OR REPLACE FUNCTION get_task_stats(p_user_id UUID)
RETURNS TABLE (
  total_tasks BIGINT,
  completed_tasks BIGINT,
  pending_tasks BIGINT
) AS $$
BEGIN
  RETURN QUERY
  SELECT 
    COUNT(*) AS total_tasks,
    COUNT(*) FILTER (WHERE status = 'completed') AS completed_tasks,
    COUNT(*) FILTER (WHERE status IN ('todo', 'in_progress')) AS pending_tasks
  FROM focus_tasks
  WHERE user_id = p_user_id;
END;
$$ LANGUAGE plpgsql SECURITY DEFINER;

-- Grant execution permissions
GRANT EXECUTE ON FUNCTION get_task_stats(UUID) TO authenticated;