-- Context Switching Tables for Easier Focus (SSOT8001 Compliant)

-- Context Switching Templates
CREATE TABLE IF NOT EXISTS context_switching_templates8 (
  id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  name TEXT NOT NULL,
  description TEXT,
  steps JSONB NOT NULL DEFAULT '[]'::JSONB,
  estimated_time_seconds INTEGER DEFAULT 0,
  complexity INTEGER DEFAULT 5,
  tags TEXT[] DEFAULT '{}'::TEXT[],
  created_at TIMESTAMP WITH TIME ZONE DEFAULT now(),
  updated_at TIMESTAMP WITH TIME ZONE DEFAULT now(),
  user_id UUID REFERENCES auth.users(id) ON DELETE CASCADE
);

-- Saved Contexts
CREATE TABLE IF NOT EXISTS context_saved_contexts8 (
  id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  name TEXT NOT NULL,
  description TEXT,
  tools TEXT[] DEFAULT '{}'::TEXT[],
  resources JSONB DEFAULT '[]'::JSONB,
  locations TEXT[] DEFAULT '{}'::TEXT[],
  mental_state TEXT,
  focus_level TEXT CHECK (focus_level IN ('low', 'medium', 'high')),
  energy_required TEXT CHECK (energy_required IN ('low', 'medium', 'high')),
  complexity INTEGER DEFAULT 5,
  tags TEXT[] DEFAULT '{}'::TEXT[],
  cognitive_load TEXT CHECK (cognitive_load IN ('low', 'medium', 'high')) DEFAULT 'medium',
  created_at TIMESTAMP WITH TIME ZONE DEFAULT now(),
  updated_at TIMESTAMP WITH TIME ZONE DEFAULT now(),
  last_used TIMESTAMP WITH TIME ZONE DEFAULT now(),
  emoji TEXT,
  color TEXT,
  progress INTEGER DEFAULT 0,
  notes TEXT,
  task TEXT,
  user_id UUID REFERENCES auth.users(id) ON DELETE CASCADE
);

-- Context Switch Logs
CREATE TABLE IF NOT EXISTS context_switch_logs8 (
  id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  from_context_id UUID REFERENCES context_saved_contexts8(id) ON DELETE SET NULL,
  to_context_id UUID REFERENCES context_saved_contexts8(id) ON DELETE SET NULL,
  from_context_name TEXT,
  to_context_name TEXT NOT NULL,
  template_id UUID REFERENCES context_switching_templates8(id) ON DELETE SET NULL,
  template_name TEXT,
  timestamp TIMESTAMP WITH TIME ZONE DEFAULT now(),
  duration_seconds INTEGER DEFAULT 0,
  completed BOOLEAN DEFAULT TRUE,
  interruption_count INTEGER DEFAULT 0,
  steps_completed INTEGER DEFAULT 0,
  total_steps INTEGER DEFAULT 0,
  cognitive_load_rating TEXT CHECK (cognitive_load_rating IN ('low', 'medium', 'high')),
  user_id UUID REFERENCES auth.users(id) ON DELETE CASCADE
);

-- Context Switch Statistics
CREATE TABLE IF NOT EXISTS context_switch_stats8 (
  id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  user_id UUID REFERENCES auth.users(id) ON DELETE CASCADE,
  switch_count INTEGER DEFAULT 0,
  average_switch_time INTEGER DEFAULT 0,
  total_switch_time INTEGER DEFAULT 0,
  most_frequent_contexts JSONB DEFAULT '{}'::JSONB,
  cognitive_load_level TEXT CHECK (cognitive_load_level IN ('low', 'medium', 'high')) DEFAULT 'low',
  daily_switches JSONB DEFAULT '{}'::JSONB,
  created_at TIMESTAMP WITH TIME ZONE DEFAULT now(),
  updated_at TIMESTAMP WITH TIME ZONE DEFAULT now()
);

-- Context Snapshots
CREATE TABLE IF NOT EXISTS context_snapshots8 (
  id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  context_id UUID REFERENCES context_saved_contexts8(id) ON DELETE CASCADE,
  timestamp TIMESTAMP WITH TIME ZONE DEFAULT now(),
  notes TEXT,
  tasks_in_progress TEXT[] DEFAULT '{}'::TEXT[],
  resources_open TEXT[] DEFAULT '{}'::TEXT[],
  mental_state TEXT,
  user_id UUID REFERENCES auth.users(id) ON DELETE CASCADE
);

-- Add RLS Policies
ALTER TABLE context_switching_templates8 ENABLE ROW LEVEL SECURITY;
ALTER TABLE context_saved_contexts8 ENABLE ROW LEVEL SECURITY;
ALTER TABLE context_switch_logs8 ENABLE ROW LEVEL SECURITY;
ALTER TABLE context_switch_stats8 ENABLE ROW LEVEL SECURITY;
ALTER TABLE context_snapshots8 ENABLE ROW LEVEL SECURITY;

-- Templates Policies
CREATE POLICY "Users can view all templates"
  ON context_switching_templates8
  FOR SELECT
  USING (true);

CREATE POLICY "Users can insert their own templates"
  ON context_switching_templates8
  FOR INSERT
  WITH CHECK (auth.uid() = user_id);

CREATE POLICY "Users can update their own templates"
  ON context_switching_templates8
  FOR UPDATE
  USING (auth.uid() = user_id);

CREATE POLICY "Users can delete their own templates"
  ON context_switching_templates8
  FOR DELETE
  USING (auth.uid() = user_id);

-- Saved Contexts Policies
CREATE POLICY "Users can view their own contexts"
  ON context_saved_contexts8
  FOR SELECT
  USING (auth.uid() = user_id);

CREATE POLICY "Users can insert their own contexts"
  ON context_saved_contexts8
  FOR INSERT
  WITH CHECK (auth.uid() = user_id);

CREATE POLICY "Users can update their own contexts"
  ON context_saved_contexts8
  FOR UPDATE
  USING (auth.uid() = user_id);

CREATE POLICY "Users can delete their own contexts"
  ON context_saved_contexts8
  FOR DELETE
  USING (auth.uid() = user_id);

-- Switch Logs Policies
CREATE POLICY "Users can view their own logs"
  ON context_switch_logs8
  FOR SELECT
  USING (auth.uid() = user_id);

CREATE POLICY "Users can insert their own logs"
  ON context_switch_logs8
  FOR INSERT
  WITH CHECK (auth.uid() = user_id);

CREATE POLICY "Users can update their own logs"
  ON context_switch_logs8
  FOR UPDATE
  USING (auth.uid() = user_id);

CREATE POLICY "Users can delete their own logs"
  ON context_switch_logs8
  FOR DELETE
  USING (auth.uid() = user_id);

-- Switch Stats Policies
CREATE POLICY "Users can view their own stats"
  ON context_switch_stats8
  FOR SELECT
  USING (auth.uid() = user_id);

CREATE POLICY "Users can insert their own stats"
  ON context_switch_stats8
  FOR INSERT
  WITH CHECK (auth.uid() = user_id);

CREATE POLICY "Users can update their own stats"
  ON context_switch_stats8
  FOR UPDATE
  USING (auth.uid() = user_id);

CREATE POLICY "Users can delete their own stats"
  ON context_switch_stats8
  FOR DELETE
  USING (auth.uid() = user_id);

-- Snapshots Policies
CREATE POLICY "Users can view their own snapshots"
  ON context_snapshots8
  FOR SELECT
  USING (auth.uid() = user_id);

CREATE POLICY "Users can insert their own snapshots"
  ON context_snapshots8
  FOR INSERT
  WITH CHECK (auth.uid() = user_id);

CREATE POLICY "Users can update their own snapshots"
  ON context_snapshots8
  FOR UPDATE
  USING (auth.uid() = user_id);

CREATE POLICY "Users can delete their own snapshots"
  ON context_snapshots8
  FOR DELETE
  USING (auth.uid() = user_id);

-- Add triggers for updated_at
CREATE OR REPLACE FUNCTION trigger_set_timestamp()
RETURNS TRIGGER AS $$
BEGIN
  NEW.updated_at = NOW();
  RETURN NEW;
END;
$$ LANGUAGE plpgsql;

CREATE TRIGGER set_timestamp_templates
BEFORE UPDATE ON context_switching_templates8
FOR EACH ROW
EXECUTE PROCEDURE trigger_set_timestamp();

CREATE TRIGGER set_timestamp_contexts
BEFORE UPDATE ON context_saved_contexts8
FOR EACH ROW
EXECUTE PROCEDURE trigger_set_timestamp();

CREATE TRIGGER set_timestamp_stats
BEFORE UPDATE ON context_switch_stats8
FOR EACH ROW
EXECUTE PROCEDURE trigger_set_timestamp(); 