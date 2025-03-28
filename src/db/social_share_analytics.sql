-- Social Sharing Analytics Schema

-- Create social_shares table to track sharing events
CREATE TABLE IF NOT EXISTS social_shares (
  id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  user_id UUID REFERENCES auth.users(id) NOT NULL,
  progress_id UUID REFERENCES progress_entries(id),
  achievement_id UUID REFERENCES achievements(id),
  platform TEXT NOT NULL,
  message TEXT,
  is_public BOOLEAN DEFAULT true,
  shared_at TIMESTAMP WITH TIME ZONE NOT NULL,
  created_at TIMESTAMP WITH TIME ZONE DEFAULT now(),
  updated_at TIMESTAMP WITH TIME ZONE DEFAULT now(),
  CONSTRAINT share_content_check CHECK (
    (progress_id IS NOT NULL AND achievement_id IS NULL) OR
    (achievement_id IS NOT NULL AND progress_id IS NULL)
  )
);

-- Create social_share_analytics table to track analytics for shares
CREATE TABLE IF NOT EXISTS social_share_analytics (
  id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  user_id UUID REFERENCES auth.users(id) NOT NULL,
  share_id UUID REFERENCES social_shares(id),
  item_type TEXT NOT NULL CHECK (item_type IN ('achievement', 'progress', 'milestone')),
  item_id TEXT NOT NULL,
  platform TEXT NOT NULL,
  success BOOLEAN DEFAULT true,
  is_public BOOLEAN DEFAULT true,
  click_count INTEGER DEFAULT 0,
  conversion_count INTEGER DEFAULT 0,
  created_at TIMESTAMP WITH TIME ZONE DEFAULT now(),
  updated_at TIMESTAMP WITH TIME ZONE DEFAULT now()
);

-- Add RLS policies for social_shares table
ALTER TABLE social_shares ENABLE ROW LEVEL SECURITY;

-- Allow users to view their own shares
CREATE POLICY "Users can view their own shares"
  ON social_shares FOR SELECT
  USING (auth.uid() = user_id);

-- Allow users to create their own shares
CREATE POLICY "Users can create their own shares"
  ON social_shares FOR INSERT
  WITH CHECK (auth.uid() = user_id);

-- Allow users to update their own shares
CREATE POLICY "Users can update their own shares"
  ON social_shares FOR UPDATE
  USING (auth.uid() = user_id);

-- Add RLS policies for social_share_analytics table
ALTER TABLE social_share_analytics ENABLE ROW LEVEL SECURITY;

-- Allow users to view their own share analytics
CREATE POLICY "Users can view their own share analytics"
  ON social_share_analytics FOR SELECT
  USING (auth.uid() = user_id);

-- Allow users to create their own share analytics
CREATE POLICY "Users can create their own share analytics"
  ON social_share_analytics FOR INSERT
  WITH CHECK (auth.uid() = user_id);

-- Allow users to update their own share analytics
CREATE POLICY "Users can update their own share analytics"
  ON social_share_analytics FOR UPDATE
  USING (auth.uid() = user_id);

-- Create index for faster queries
CREATE INDEX IF NOT EXISTS social_shares_user_id_idx ON social_shares (user_id);
CREATE INDEX IF NOT EXISTS social_shares_platform_idx ON social_shares (platform);
CREATE INDEX IF NOT EXISTS social_share_analytics_user_id_idx ON social_share_analytics (user_id);
CREATE INDEX IF NOT EXISTS social_share_analytics_platform_idx ON social_share_analytics (platform);
CREATE INDEX IF NOT EXISTS social_share_analytics_item_type_idx ON social_share_analytics (item_type);