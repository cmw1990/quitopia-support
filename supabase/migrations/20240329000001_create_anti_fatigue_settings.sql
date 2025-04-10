-- Create user anti fatigue settings table following SSOT8001 guidelines
-- Table name ends with '8' for proper versioning

-- User Anti-Fatigue Settings Table
CREATE TABLE user_anti_fatigue_settings8 (
  id UUID DEFAULT uuid_generate_v4() PRIMARY KEY,
  user_id UUID NOT NULL REFERENCES auth.users(id) ON DELETE CASCADE,
  warning_detection_enabled BOOLEAN DEFAULT TRUE,
  auto_intervention_enabled BOOLEAN DEFAULT FALSE,
  warning_threshold INTEGER DEFAULT 70 CHECK (warning_threshold BETWEEN 40 AND 90),
  notification_preferences JSONB DEFAULT '{}',
  created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
  updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
  UNIQUE (user_id)
);

-- Add trigger to update the updated_at column
CREATE TRIGGER update_user_anti_fatigue_settings_timestamp
BEFORE UPDATE ON user_anti_fatigue_settings8
FOR EACH ROW EXECUTE FUNCTION update_timestamp();

-- Add RLS policies for security
ALTER TABLE user_anti_fatigue_settings8 ENABLE ROW LEVEL SECURITY;

-- Users can only CRUD their own anti-fatigue settings
CREATE POLICY "Users can only read their own anti-fatigue settings"
ON user_anti_fatigue_settings8
FOR SELECT
TO authenticated
USING (auth.uid() = user_id);

CREATE POLICY "Users can only insert their own anti-fatigue settings"
ON user_anti_fatigue_settings8
FOR INSERT
TO authenticated
WITH CHECK (auth.uid() = user_id);

CREATE POLICY "Users can only update their own anti-fatigue settings"
ON user_anti_fatigue_settings8
FOR UPDATE
TO authenticated
USING (auth.uid() = user_id)
WITH CHECK (auth.uid() = user_id);

CREATE POLICY "Users can only delete their own anti-fatigue settings"
ON user_anti_fatigue_settings8
FOR DELETE
TO authenticated
USING (auth.uid() = user_id);

-- Create index for faster lookups
CREATE INDEX user_anti_fatigue_settings8_user_id_idx ON user_anti_fatigue_settings8 (user_id); 