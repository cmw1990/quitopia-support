-- Create focus_tasks table
CREATE TABLE IF NOT EXISTS focus_tasks (
  id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  user_id UUID NOT NULL REFERENCES auth.users(id) ON DELETE CASCADE,
  title TEXT NOT NULL,
  description TEXT,
  status TEXT NOT NULL CHECK (status IN ('todo', 'in_progress', 'completed')),
  priority TEXT NOT NULL CHECK (priority IN ('low', 'medium', 'high')),
  due_date DATE,
  estimated_duration INTEGER,
  actual_duration INTEGER,
  cognitive_load INTEGER CHECK (cognitive_load >= 1 AND cognitive_load <= 10),
  tags TEXT[],
  parent_task_id UUID REFERENCES focus_tasks(id) ON DELETE SET NULL,
  created_at TIMESTAMPTZ NOT NULL DEFAULT NOW(),
  updated_at TIMESTAMPTZ NOT NULL DEFAULT NOW()
);

-- Create index for user_id for faster lookups
CREATE INDEX IF NOT EXISTS focus_tasks_user_id_idx ON focus_tasks(user_id);

-- Create index for parent_task_id for faster lookups
CREATE INDEX IF NOT EXISTS focus_tasks_parent_task_id_idx ON focus_tasks(parent_task_id);

-- Enable Row Level Security
ALTER TABLE focus_tasks ENABLE ROW LEVEL SECURITY;

-- Create policy to allow users to see only their own tasks
CREATE POLICY "Users can view their own tasks"
  ON focus_tasks
  FOR SELECT
  USING (auth.uid() = user_id);

-- Create policy to allow users to insert their own tasks
CREATE POLICY "Users can insert their own tasks"
  ON focus_tasks
  FOR INSERT
  WITH CHECK (auth.uid() = user_id);

-- Create policy to allow users to update their own tasks
CREATE POLICY "Users can update their own tasks"
  ON focus_tasks
  FOR UPDATE
  USING (auth.uid() = user_id)
  WITH CHECK (auth.uid() = user_id);

-- Create policy to allow users to delete their own tasks
CREATE POLICY "Users can delete their own tasks"
  ON focus_tasks
  FOR DELETE
  USING (auth.uid() = user_id);

-- Create function to update updated_at timestamp
CREATE OR REPLACE FUNCTION update_updated_at_column()
RETURNS TRIGGER AS $$
BEGIN
  NEW.updated_at = NOW();
  RETURN NEW;
END;
$$ language 'plpgsql';

-- Create trigger to automatically update updated_at timestamp
CREATE TRIGGER update_focus_tasks_updated_at
  BEFORE UPDATE ON focus_tasks
  FOR EACH ROW
 