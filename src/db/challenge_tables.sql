-- Enable the RLS extension if not already enabled
CREATE EXTENSION IF NOT EXISTS "pgcrypto";

-- Create the challenges table
CREATE TABLE IF NOT EXISTS public.challenges (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    title TEXT NOT NULL,
    description TEXT NOT NULL,
    difficulty TEXT NOT NULL CHECK (difficulty IN ('easy', 'medium', 'hard')),
    start_date TIMESTAMP WITH TIME ZONE NOT NULL,
    end_date TIMESTAMP WITH TIME ZONE NOT NULL,
    reward_points INTEGER NOT NULL DEFAULT 0,
    participants_count INTEGER NOT NULL DEFAULT 0,
    created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
    updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
    is_active BOOLEAN DEFAULT TRUE,
    CONSTRAINT valid_dates CHECK (end_date > start_date)
);

-- Create the challenge tasks table
CREATE TABLE IF NOT EXISTS public.challenge_tasks (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    challenge_id UUID NOT NULL REFERENCES public.challenges(id) ON DELETE CASCADE,
    description TEXT NOT NULL,
    points INTEGER NOT NULL DEFAULT 0,
    created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
    CONSTRAINT positive_points CHECK (points >= 0)
);

-- Create the challenge progress table
CREATE TABLE IF NOT EXISTS public.challenge_progress (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    challenge_id UUID NOT NULL REFERENCES public.challenges(id) ON DELETE CASCADE,
    user_id UUID NOT NULL REFERENCES auth.users(id) ON DELETE CASCADE,
    joined_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
    completed_tasks UUID[] DEFAULT '{}',
    status TEXT NOT NULL DEFAULT 'in_progress' CHECK (status IN ('in_progress', 'completed', 'abandoned')),
    created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
    updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
    UNIQUE (challenge_id, user_id)
);

-- Add a user_points column to the profiles table if it doesn't exist
DO $$
BEGIN
    IF NOT EXISTS (
        SELECT 1 FROM information_schema.columns 
        WHERE table_name = 'profiles' AND column_name = 'points'
    ) THEN
        ALTER TABLE public.profiles ADD COLUMN points INTEGER NOT NULL DEFAULT 0;
    END IF;
END $$;

-- Function to increment a value
CREATE OR REPLACE FUNCTION public.increment(x INTEGER)
RETURNS INTEGER AS $$
BEGIN
    RETURN x + 1;
END;
$$ LANGUAGE plpgsql;

-- Function to increment participants count
CREATE OR REPLACE FUNCTION increment_participants(challenge_id UUID)
RETURNS VOID AS $$
BEGIN
  UPDATE public.challenges 
  SET participants_count = participants_count + 1 
  WHERE id = challenge_id;
END;
$$ LANGUAGE plpgsql;

-- Create RLS policies

-- Challenges policy
ALTER TABLE public.challenges ENABLE ROW LEVEL SECURITY;

CREATE POLICY "Challenges are viewable by all authenticated users"
  ON public.challenges FOR SELECT
  TO authenticated
  USING (true);

CREATE POLICY "Only admins can create challenges"
  ON public.challenges FOR INSERT
  TO authenticated
  USING (
    EXISTS (
        SELECT 1 FROM public.profiles
        WHERE profiles.id = auth.uid() AND profiles.role = 'admin'
    )
);

CREATE POLICY "Only admins can update challenges"
  ON public.challenges FOR UPDATE
  TO authenticated
  USING (
    EXISTS (
        SELECT 1 FROM public.profiles
        WHERE profiles.id = auth.uid() AND profiles.role = 'admin'
    )
);

-- Challenge tasks policy
ALTER TABLE public.challenge_tasks ENABLE ROW LEVEL SECURITY;

CREATE POLICY "Challenge tasks are viewable by all authenticated users"
  ON public.challenge_tasks FOR SELECT
  TO authenticated
  USING (true);

CREATE POLICY "Only admins can create challenge tasks"
  ON public.challenge_tasks FOR INSERT
  TO authenticated
  USING (
    EXISTS (
        SELECT 1 FROM public.profiles
        WHERE profiles.id = auth.uid() AND profiles.role = 'admin'
    )
);

-- Challenge progress policy
ALTER TABLE public.challenge_progress ENABLE ROW LEVEL SECURITY;

CREATE POLICY "Users can view all challenge progress"
  ON public.challenge_progress FOR SELECT
  TO authenticated
  USING (true);

CREATE POLICY "Users can only insert their own progress"
  ON public.challenge_progress FOR INSERT
  TO authenticated
  USING (auth.uid() = user_id);

CREATE POLICY "Users can only update their own progress"
  ON public.challenge_progress FOR UPDATE
  TO authenticated
  USING (auth.uid() = user_id);

-- Indexes for performance
CREATE INDEX IF NOT EXISTS challenge_tasks_challenge_id_idx ON public.challenge_tasks(challenge_id);
CREATE INDEX IF NOT EXISTS challenge_progress_challenge_id_idx ON public.challenge_progress(challenge_id);
CREATE INDEX IF NOT EXISTS challenge_progress_user_id_idx ON public.challenge_progress(user_id);
CREATE INDEX IF NOT EXISTS challenge_progress_status_idx ON public.challenge_progress(status);

-- Sample data for development
INSERT INTO public.challenges (title, description, difficulty, start_date, end_date, reward_points)
VALUES
('7-Day No Smoking Challenge', 'Go without smoking for a full week and track your progress', 'medium', NOW(), NOW() + INTERVAL '7 days', 100),
('Trigger Tracking Master', 'Identify and log your smoking triggers for 5 days', 'easy', NOW(), NOW() + INTERVAL '5 days', 50),
('Stress Relief Techniques', 'Learn and practice 3 stress relief techniques as alternatives to smoking', 'easy', NOW(), NOW() + INTERVAL '3 days', 30),
('30-Day Smoke Free', 'The ultimate challenge - stay smoke free for 30 days', 'hard', NOW(), NOW() + INTERVAL '30 days', 300),
('Morning Routine Makeover', 'Replace your morning cigarette with healthier alternatives for 10 days', 'medium', NOW(), NOW() + INTERVAL '10 days', 120);

-- Add tasks for each challenge
INSERT INTO public.challenge_tasks (challenge_id, description, points)
VALUES
((SELECT id FROM public.challenges WHERE title = '7-Day No Smoking Challenge' LIMIT 1), 'Complete Day 1 without smoking', 10),
((SELECT id FROM public.challenges WHERE title = '7-Day No Smoking Challenge' LIMIT 1), 'Complete Day 2 without smoking', 15),
((SELECT id FROM public.challenges WHERE title = '7-Day No Smoking Challenge' LIMIT 1), 'Complete Day 3 without smoking', 15),
((SELECT id FROM public.challenges WHERE title = '7-Day No Smoking Challenge' LIMIT 1), 'Complete Day 4 without smoking', 15),
((SELECT id FROM public.challenges WHERE title = '7-Day No Smoking Challenge' LIMIT 1), 'Complete Day 5 without smoking', 15),
((SELECT id FROM public.challenges WHERE title = '7-Day No Smoking Challenge' LIMIT 1), 'Complete Day 6 without smoking', 15),
((SELECT id FROM public.challenges WHERE title = '7-Day No Smoking Challenge' LIMIT 1), 'Complete Day 7 without smoking', 15),

((SELECT id FROM public.challenges WHERE title = 'Trigger Tracking Master' LIMIT 1), 'Identify 3 common triggers', 10),
((SELECT id FROM public.challenges WHERE title = 'Trigger Tracking Master' LIMIT 1), 'Log triggers for 3 consecutive days', 20),
((SELECT id FROM public.challenges WHERE title = 'Trigger Tracking Master' LIMIT 1), 'Develop 1 coping strategy for each trigger', 20),

((SELECT id FROM public.challenges WHERE title = 'Stress Relief Techniques' LIMIT 1), 'Learn deep breathing technique', 10),
((SELECT id FROM public.challenges WHERE title = 'Stress Relief Techniques' LIMIT 1), 'Practice mindfulness for 5 minutes daily', 10),
((SELECT id FROM public.challenges WHERE title = 'Stress Relief Techniques' LIMIT 1), 'Try physical activity as stress relief', 10),

((SELECT id FROM public.challenges WHERE title = '30-Day Smoke Free' LIMIT 1), 'Complete Week 1', 50),
((SELECT id FROM public.challenges WHERE title = '30-Day Smoke Free' LIMIT 1), 'Complete Week 2', 75),
((SELECT id FROM public.challenges WHERE title = '30-Day Smoke Free' LIMIT 1), 'Complete Week 3', 75),
((SELECT id FROM public.challenges WHERE title = '30-Day Smoke Free' LIMIT 1), 'Complete Week 4', 100),

((SELECT id FROM public.challenges WHERE title = 'Morning Routine Makeover' LIMIT 1), 'Replace cigarette with water for 3 days', 30),
((SELECT id FROM public.challenges WHERE title = 'Morning Routine Makeover' LIMIT 1), 'Add 10 minute walk to morning routine', 30),
((SELECT id FROM public.challenges WHERE title = 'Morning Routine Makeover' LIMIT 1), 'Practice deep breathing for 5 minutes', 30),
((SELECT id FROM public.challenges WHERE title = 'Morning Routine Makeover' LIMIT 1), 'Complete full 10 days with new routine', 30); 