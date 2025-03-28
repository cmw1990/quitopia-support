-- Create mood_logs table
CREATE TABLE IF NOT EXISTS mood_logs (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id UUID NOT NULL REFERENCES auth.users(id) ON DELETE CASCADE,
  timestamp TIMESTAMPTZ NOT NULL,
  mood_score INTEGER NOT NULL CHECK (mood_score >= 1 AND mood_score <= 10),
  triggers TEXT[] DEFAULT '{}',
  activities TEXT[] DEFAULT '{}',
  notes TEXT,
  related_to_cravings BOOLEAN DEFAULT FALSE,
  created_at TIMESTAMPTZ DEFAULT NOW()
);

-- Create index for faster user-specific queries
CREATE INDEX IF NOT EXISTS mood_logs_user_id_idx ON mood_logs(user_id);
CREATE INDEX IF NOT EXISTS mood_logs_timestamp_idx ON mood_logs(timestamp);

-- Set up Row Level Security
ALTER TABLE mood_logs ENABLE ROW LEVEL SECURITY;

-- Create policy to allow users to read only their own logs
CREATE POLICY mood_logs_select_policy ON mood_logs 
  FOR SELECT USING (auth.uid() = user_id);

-- Create policy to allow users to insert only their own logs
CREATE POLICY mood_logs_insert_policy ON mood_logs 
  FOR INSERT WITH CHECK (auth.uid() = user_id);

-- Create policy to allow users to update only their own logs
CREATE POLICY mood_logs_update_policy ON mood_logs 
  FOR UPDATE USING (auth.uid() = user_id);

-- Create policy to allow users to delete only their own logs
CREATE POLICY mood_logs_delete_policy ON mood_logs 
  FOR DELETE USING (auth.uid() = user_id); 