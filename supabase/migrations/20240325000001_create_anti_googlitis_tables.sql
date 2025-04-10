-- Create tables for AntiGooglitis component
-- Following SSOT8001 guidelines - Tables end with '8'

-- Search patterns table
CREATE TABLE IF NOT EXISTS public.search_patterns8 (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id UUID REFERENCES auth.users(id) ON DELETE CASCADE,
  pattern TEXT NOT NULL,
  category TEXT NOT NULL CHECK (category IN ('research', 'distraction', 'work', 'information', 'social')),
  timeWasted INTEGER NOT NULL DEFAULT 0,
  occurrences INTEGER NOT NULL DEFAULT 1,
  timestamp TIMESTAMP WITH TIME ZONE DEFAULT now() NOT NULL,
  created_at TIMESTAMP WITH TIME ZONE DEFAULT now() NOT NULL,
  updated_at TIMESTAMP WITH TIME ZONE DEFAULT now() NOT NULL
);

-- Enable RLS for search_patterns8
ALTER TABLE public.search_patterns8 ENABLE ROW LEVEL SECURITY;

-- Create RLS policies for search_patterns8
CREATE POLICY "Users can insert their own search patterns"
  ON public.search_patterns8
  FOR INSERT
  WITH CHECK (auth.uid() = user_id);

CREATE POLICY "Users can view only their own search patterns"
  ON public.search_patterns8
  FOR SELECT
  USING (auth.uid() = user_id);

CREATE POLICY "Users can update only their own search patterns"
  ON public.search_patterns8
  FOR UPDATE
  USING (auth.uid() = user_id);

CREATE POLICY "Users can delete only their own search patterns"
  ON public.search_patterns8
  FOR DELETE
  USING (auth.uid() = user_id);

-- Search alternatives table
CREATE TABLE IF NOT EXISTS public.search_alternatives8 (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  title TEXT NOT NULL,
  description TEXT NOT NULL,
  url TEXT NOT NULL,
  category TEXT NOT NULL,
  created_at TIMESTAMP WITH TIME ZONE DEFAULT now() NOT NULL,
  updated_at TIMESTAMP WITH TIME ZONE DEFAULT now() NOT NULL
);

-- Enable RLS for search_alternatives8
ALTER TABLE public.search_alternatives8 ENABLE ROW LEVEL SECURITY;

-- Create RLS policy to allow all users to view alternatives
CREATE POLICY "Everyone can view search alternatives"
  ON public.search_alternatives8
  FOR SELECT
  USING (true);

-- Add some default search alternatives
INSERT INTO public.search_alternatives8 (title, description, url, category)
VALUES 
  ('Google Scholar', 'Search for scholarly literature across many disciplines and sources.', 'https://scholar.google.com/', 'research'),
  ('Connected Papers', 'Explore connected academic papers in a visual graph.', 'https://www.connectedpapers.com/', 'research'),
  ('arXiv', 'Access to over 2 million scholarly articles in the fields of physics, mathematics, computer science, and more.', 'https://arxiv.org/', 'research'),
  ('ResearchGate', 'Research network allowing users to find papers and connect with researchers.', 'https://www.researchgate.net/', 'research'),
  ('Wolfram Alpha', 'Computational knowledge engine that answers factual queries directly.', 'https://www.wolframalpha.com/', 'information'),
  ('Wikipedia', 'Free encyclopedia that anyone can edit.', 'https://www.wikipedia.org/', 'information'),
  ('DuckDuckGo', 'Internet search engine that emphasizes protecting searchers' privacy.', 'https://duckduckgo.com/', 'privacy'),
  ('Brave Search', 'Independent search engine that provides unbiased results with full privacy.', 'https://search.brave.com/', 'privacy'),
  ('Ecosia', 'Search engine that plants trees with its ad revenue.', 'https://www.ecosia.org/', 'ethical'),
  ('Library Genesis', 'Digital library with over 2.4 million books and 83 million articles.', 'https://libgen.is/', 'books'),
  ('Project Gutenberg', 'Online library of over 60,000 free books.', 'https://www.gutenberg.org/', 'books'),
  ('Open Library', 'Universal library catalog with millions of book records.', 'https://openlibrary.org/', 'books'),
  ('Internet Archive', 'Digital library offering free access to millions of books, movies, software, music, and more.', 'https://archive.org/', 'archive'),
  ('Sci-Hub', 'Website that provides free access to millions of research papers.', 'https://sci-hub.se/', 'research')
ON CONFLICT DO NOTHING;

-- User settings table (if not already existing from flow state migration)
CREATE TABLE IF NOT EXISTS public.user_settings8 (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id UUID REFERENCES auth.users(id) ON DELETE CASCADE,
  key TEXT NOT NULL,
  value JSONB NOT NULL,
  created_at TIMESTAMP WITH TIME ZONE DEFAULT now() NOT NULL,
  updated_at TIMESTAMP WITH TIME ZONE DEFAULT now() NOT NULL,
  UNIQUE (user_id, key)
);

-- Enable RLS for user_settings8
ALTER TABLE public.user_settings8 ENABLE ROW LEVEL SECURITY;

-- Create RLS policies for user_settings8
CREATE POLICY "Users can insert their own settings"
  ON public.user_settings8
  FOR INSERT
  WITH CHECK (auth.uid() = user_id);

CREATE POLICY "Users can view only their own settings"
  ON public.user_settings8
  FOR SELECT
  USING (auth.uid() = user_id);

CREATE POLICY "Users can update only their own settings"
  ON public.user_settings8
  FOR UPDATE
  USING (auth.uid() = user_id);

CREATE POLICY "Users can delete only their own settings"
  ON public.user_settings8
  FOR DELETE
  USING (auth.uid() = user_id);

-- Create indices for performance
CREATE INDEX idx_search_patterns_user_id ON public.search_patterns8(user_id);
CREATE INDEX idx_search_patterns_category ON public.search_patterns8(category);
CREATE INDEX idx_search_alternatives_category ON public.search_alternatives8(category);
CREATE INDEX idx_user_settings_user_id_key ON public.user_settings8(user_id, key); 