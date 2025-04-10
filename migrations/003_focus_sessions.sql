-- Alter focus_sessions table to add focus_type column if not exists
DO $$
BEGIN
  -- Check if column does not exist before adding
  IF NOT EXISTS (
    SELECT 1 
    FROM information_schema.columns 
    WHERE table_name = 'focus_sessions' 
    AND column_name = 'focus_type'
  ) THEN
    ALTER TABLE focus_sessions 
    ADD COLUMN focus_type TEXT 
    CHECK (focus_type IN ('focus', 'break'));
  END IF;
END $$;

-- Ensure status column exists
DO $$
BEGIN
  IF NOT EXISTS (
    SELECT 1 
    FROM information_schema.columns 
    WHERE table_name = 'focus_sessions' 
    AND column_name = 'status'
  ) THEN
    ALTER TABLE focus_sessions 
    ADD COLUMN status TEXT 
    CHECK (status IN ('active', 'completed', 'interrupted'));
  END IF;
END $$;

-- Create indexes if not exists
DO $$
BEGIN
  IF NOT EXISTS (
    SELECT 1 
    FROM pg_indexes 
    WHERE tablename = 'focus_sessions' 
    AND indexname = 'idx_focus_sessions_focus_type'
  ) THEN
    CREATE INDEX idx_focus_sessions_focus_type ON focus_sessions(focus_type);
    CREATE INDEX idx_focus_sessions_status ON focus_sessions(status);
  END IF;
END $$;