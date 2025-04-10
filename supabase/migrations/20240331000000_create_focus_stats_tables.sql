-- Create focus stats related tables following SSOT8001 guidelines
-- All table names end with '8' for proper versioning

-- Focus insights table for storing AI-generated insights about focus patterns
CREATE TABLE focus_insights8 (
  id UUID DEFAULT uuid_generate_v4() PRIMARY KEY,
  user_id UUID NOT NULL REFERENCES auth.users(id) ON DELETE CASCADE,
  insights JSONB NOT NULL DEFAULT '{}',
  most_productive_context TEXT,
  most_productive_time_of_day TEXT,
  recommended_focus_duration INTEGER,
  top_distractions JSONB,
  streak_data JSONB,
  focus_score INTEGER CHECK (focus_score BETWEEN 0 AND 100),
  energy_correlation FLOAT,
  created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
  updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- User dashboard configuration table for storing widget preferences
CREATE TABLE user_dashboard_config8 (
  id UUID DEFAULT uuid_generate_v4() PRIMARY KEY,
  user_id UUID NOT NULL REFERENCES auth.users(id) ON DELETE CASCADE,
  widget_config JSONB NOT NULL DEFAULT '{}',
  layout_config JSONB DEFAULT '{}',
  created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
  updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
  UNIQUE (user_id)
);

-- Focus distractions table for tracking interruptions during focus sessions
CREATE TABLE focus_distractions8 (
  id UUID DEFAULT uuid_generate_v4() PRIMARY KEY,
  user_id UUID NOT NULL REFERENCES auth.users(id) ON DELETE CASCADE,
  session_id UUID REFERENCES focus_sessions8(id) ON DELETE CASCADE,
  distraction_type TEXT NOT NULL,
  timestamp TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
  duration_seconds INTEGER,
  context TEXT,
  notes TEXT,
  created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
  updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- Focus widgets data cache for faster dashboard loading
CREATE TABLE focus_widget_cache8 (
  id UUID DEFAULT uuid_generate_v4() PRIMARY KEY,
  user_id UUID NOT NULL REFERENCES auth.users(id) ON DELETE CASCADE,
  widget_id TEXT NOT NULL,
  cache_data JSONB NOT NULL,
  cache_timestamp TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
  expiry_timestamp TIMESTAMP WITH TIME ZONE,
  created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
  updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
  UNIQUE (user_id, widget_id)
);

-- Add trigger to update the updated_at column
CREATE OR REPLACE FUNCTION update_timestamp()
RETURNS TRIGGER AS $$
BEGIN
  NEW.updated_at = NOW();
  RETURN NEW;
END;
$$ LANGUAGE plpgsql;

-- Create triggers for each table
CREATE TRIGGER update_focus_insights_timestamp
BEFORE UPDATE ON focus_insights8
FOR EACH ROW EXECUTE FUNCTION update_timestamp();

CREATE TRIGGER update_user_dashboard_config_timestamp
BEFORE UPDATE ON user_dashboard_config8
FOR EACH ROW EXECUTE FUNCTION update_timestamp();

CREATE TRIGGER update_focus_distractions_timestamp
BEFORE UPDATE ON focus_distractions8
FOR EACH ROW EXECUTE FUNCTION update_timestamp();

CREATE TRIGGER update_focus_widget_cache_timestamp
BEFORE UPDATE ON focus_widget_cache8
FOR EACH ROW EXECUTE FUNCTION update_timestamp();

-- Add RLS policies for security
ALTER TABLE focus_insights8 ENABLE ROW LEVEL SECURITY;
ALTER TABLE user_dashboard_config8 ENABLE ROW LEVEL SECURITY;
ALTER TABLE focus_distractions8 ENABLE ROW LEVEL SECURITY;
ALTER TABLE focus_widget_cache8 ENABLE ROW LEVEL SECURITY;

-- Focus insights policies
CREATE POLICY "Users can only read their own focus insights"
ON focus_insights8
FOR SELECT
TO authenticated
USING (auth.uid() = user_id);

CREATE POLICY "Users can only insert their own focus insights"
ON focus_insights8
FOR INSERT
TO authenticated
WITH CHECK (auth.uid() = user_id);

CREATE POLICY "Users can only update their own focus insights"
ON focus_insights8
FOR UPDATE
TO authenticated
USING (auth.uid() = user_id)
WITH CHECK (auth.uid() = user_id);

CREATE POLICY "Users can only delete their own focus insights"
ON focus_insights8
FOR DELETE
TO authenticated
USING (auth.uid() = user_id);

-- User dashboard config policies
CREATE POLICY "Users can only read their own dashboard config"
ON user_dashboard_config8
FOR SELECT
TO authenticated
USING (auth.uid() = user_id);

CREATE POLICY "Users can only insert their own dashboard config"
ON user_dashboard_config8
FOR INSERT
TO authenticated
WITH CHECK (auth.uid() = user_id);

CREATE POLICY "Users can only update their own dashboard config"
ON user_dashboard_config8
FOR UPDATE
TO authenticated
USING (auth.uid() = user_id)
WITH CHECK (auth.uid() = user_id);

CREATE POLICY "Users can only delete their own dashboard config"
ON user_dashboard_config8
FOR DELETE
TO authenticated
USING (auth.uid() = user_id);

-- Focus distractions policies
CREATE POLICY "Users can only read their own focus distractions"
ON focus_distractions8
FOR SELECT
TO authenticated
USING (auth.uid() = user_id);

CREATE POLICY "Users can only insert their own focus distractions"
ON focus_distractions8
FOR INSERT
TO authenticated
WITH CHECK (auth.uid() = user_id);

CREATE POLICY "Users can only update their own focus distractions"
ON focus_distractions8
FOR UPDATE
TO authenticated
USING (auth.uid() = user_id)
WITH CHECK (auth.uid() = user_id);

CREATE POLICY "Users can only delete their own focus distractions"
ON focus_distractions8
FOR DELETE
TO authenticated
USING (auth.uid() = user_id);

-- Focus widget cache policies
CREATE POLICY "Users can only read their own focus widget cache"
ON focus_widget_cache8
FOR SELECT
TO authenticated
USING (auth.uid() = user_id);

CREATE POLICY "Users can only insert their own focus widget cache"
ON focus_widget_cache8
FOR INSERT
TO authenticated
WITH CHECK (auth.uid() = user_id);

CREATE POLICY "Users can only update their own focus widget cache"
ON focus_widget_cache8
FOR UPDATE
TO authenticated
USING (auth.uid() = user_id)
WITH CHECK (auth.uid() = user_id);

CREATE POLICY "Users can only delete their own focus widget cache"
ON focus_widget_cache8
FOR DELETE
TO authenticated
USING (auth.uid() = user_id);

-- Create indexes for faster lookups
CREATE INDEX focus_insights8_user_id_idx ON focus_insights8 (user_id);
CREATE INDEX focus_insights8_created_at_idx ON focus_insights8 (created_at);

CREATE INDEX user_dashboard_config8_user_id_idx ON user_dashboard_config8 (user_id);

CREATE INDEX focus_distractions8_user_id_idx ON focus_distractions8 (user_id);
CREATE INDEX focus_distractions8_session_id_idx ON focus_distractions8 (session_id);
CREATE INDEX focus_distractions8_distraction_type_idx ON focus_distractions8 (distraction_type);
CREATE INDEX focus_distractions8_timestamp_idx ON focus_distractions8 (timestamp);

CREATE INDEX focus_widget_cache8_user_id_idx ON focus_widget_cache8 (user_id);
CREATE INDEX focus_widget_cache8_widget_id_idx ON focus_widget_cache8 (widget_id);
CREATE INDEX focus_widget_cache8_expiry_timestamp_idx ON focus_widget_cache8 (expiry_timestamp); 