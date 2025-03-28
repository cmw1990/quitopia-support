-- Create community_posts table
CREATE TABLE IF NOT EXISTS community_posts (
  id uuid DEFAULT uuid_generate_v4() PRIMARY KEY,
  user_id uuid REFERENCES auth.users(id) ON DELETE CASCADE,
  title text NOT NULL,
  content text NOT NULL,
  categories text[] DEFAULT '{}',
  likes_count int DEFAULT 0,
  comments_count int DEFAULT 0,
  is_anonymous boolean DEFAULT false,
  is_moderated boolean DEFAULT false,
  is_featured boolean DEFAULT false,
  created_at timestamptz DEFAULT now(),
  updated_at timestamptz DEFAULT now()
);

-- Add RLS policies for community_posts
ALTER TABLE community_posts ENABLE ROW LEVEL SECURITY;

-- Allow all authenticated users to read community posts
CREATE POLICY "Authenticated users can read community posts" ON community_posts
  FOR SELECT
  USING (auth.role() = 'authenticated');

-- Allow users to create their own community posts
CREATE POLICY "Users can create their own community posts" ON community_posts
  FOR INSERT
  WITH CHECK (auth.uid() = user_id);

-- Allow users to update their own community posts
CREATE POLICY "Users can update their own community posts" ON community_posts
  FOR UPDATE
  USING (auth.uid() = user_id);

-- Create community_comments table
CREATE TABLE IF NOT EXISTS community_comments (
  id uuid DEFAULT uuid_generate_v4() PRIMARY KEY,
  post_id uuid REFERENCES community_posts(id) ON DELETE CASCADE,
  user_id uuid REFERENCES auth.users(id) ON DELETE CASCADE,
  content text NOT NULL,
  likes_count int DEFAULT 0,
  is_anonymous boolean DEFAULT false,
  is_moderated boolean DEFAULT false,
  created_at timestamptz DEFAULT now(),
  updated_at timestamptz DEFAULT now()
);

-- Add RLS policies for community_comments
ALTER TABLE community_comments ENABLE ROW LEVEL SECURITY;

-- Allow all authenticated users to read community comments
CREATE POLICY "Authenticated users can read community comments" ON community_comments
  FOR SELECT
  USING (auth.role() = 'authenticated');

-- Allow users to create their own community comments
CREATE POLICY "Users can create their own community comments" ON community_comments
  FOR INSERT
  WITH CHECK (auth.uid() = user_id);

-- Allow users to update their own community comments
CREATE POLICY "Users can update their own community comments" ON community_comments
  FOR UPDATE
  USING (auth.uid() = user_id);

-- Create mission4_journal_entries table
CREATE TABLE IF NOT EXISTS mission4_journal_entries (
  id uuid DEFAULT uuid_generate_v4() PRIMARY KEY,
  user_id uuid REFERENCES auth.users(id) ON DELETE CASCADE,
  title text NOT NULL,
  content text NOT NULL,
  entry_type text NOT NULL, -- mood, gratitude, reflection, etc.
  mood_score int,
  tags text[] DEFAULT '{}',
  created_at timestamptz DEFAULT now(),
  updated_at timestamptz DEFAULT now()
);

-- Add RLS policies for mission4_journal_entries
ALTER TABLE mission4_journal_entries ENABLE ROW LEVEL SECURITY;

-- Allow users to read their own journal entries
CREATE POLICY "Users can read their own journal entries" ON mission4_journal_entries
  FOR SELECT
  USING (auth.uid() = user_id);

-- Allow users to create their own journal entries
CREATE POLICY "Users can create their own journal entries" ON mission4_journal_entries
  FOR INSERT
  WITH CHECK (auth.uid() = user_id);

-- Allow users to update their own journal entries
CREATE POLICY "Users can update their own journal entries" ON mission4_journal_entries
  FOR UPDATE
  USING (auth.uid() = user_id);

-- Create triggers to update updated_at timestamp
CREATE TRIGGER update_community_posts_updated_at
  BEFORE UPDATE ON community_posts
  FOR EACH ROW
  EXECUTE FUNCTION update_health_logs_timestamp();

CREATE TRIGGER update_community_comments_updated_at
  BEFORE UPDATE ON community_comments
  FOR EACH ROW
  EXECUTE FUNCTION update_health_logs_timestamp();

CREATE TRIGGER update_journal_entries_updated_at
  BEFORE UPDATE ON mission4_journal_entries
  FOR EACH ROW
  EXECUTE FUNCTION update_health_logs_timestamp();

-- Insert sample community posts
INSERT INTO community_posts (user_id, title, content, categories, likes_count, comments_count)
SELECT 
  auth.uid(),
  'My Journey to Quitting - Week 1',
  'I just finished my first week of quitting smoking. It''s been challenging but rewarding. The cravings are intense but manageable with the right strategies.',
  ARRAY['Success Story', 'Support'],
  12,
  5
FROM auth.users
WHERE email = 'hertzofhopes@gmail.com'
LIMIT 1;

INSERT INTO community_posts (user_id, title, content, categories, likes_count, comments_count)
SELECT 
  auth.uid(),
  'Best Alternative Products I''ve Tried',
  'I''ve tried several alternatives to smoking, and these are my recommendations based on effectiveness and ease of use...',
  ARRAY['Product Review', 'Tips & Tricks'],
  18,
  7
FROM auth.users
WHERE email = 'hertzofhopes@gmail.com'
LIMIT 1;

-- Insert sample journal entries
INSERT INTO mission4_journal_entries (user_id, title, content, entry_type, mood_score, tags)
SELECT 
  auth.uid(),
  'Feeling Optimistic',
  'Today was a good day. I managed to avoid smoking in situations where I would normally light up. I''m proud of my progress.',
  'reflection',
  8,
  ARRAY['progress', 'milestone']
FROM auth.users
WHERE email = 'hertzofhopes@gmail.com'
LIMIT 1;

INSERT INTO mission4_journal_entries (user_id, title, content, entry_type, mood_score, tags)
SELECT 
  auth.uid(),
  'Grateful for Support',
  'I''m thankful for my family''s support during this challenging time. Their encouragement makes a huge difference.',
  'gratitude',
  9,
  ARRAY['family', 'support']
FROM auth.users
WHERE email = 'hertzofhopes@gmail.com'
LIMIT 1; 