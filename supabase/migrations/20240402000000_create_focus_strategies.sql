-- Migration: Create focus_strategies8 table
-- This table stores various focus strategies, both default and user-created.

-- Ensure the table does not already exist
DROP TABLE IF EXISTS public.focus_strategies8;

-- Create the focus_strategies8 table
CREATE TABLE public.focus_strategies8 (
    id uuid DEFAULT gen_random_uuid() NOT NULL PRIMARY KEY,
    user_id uuid REFERENCES auth.users(id) ON DELETE CASCADE, -- Nullable for default strategies
    created_at timestamp with time zone DEFAULT now() NOT NULL,
    updated_at timestamp with time zone DEFAULT now() NOT NULL,
    name text NOT NULL CHECK (char_length(name) > 0),
    description text,
    category text CHECK (char_length(category) > 0), -- e.g., 'Time Management', 'Environment', 'Mindfulness', 'Task Management'
    instructions text, -- Step-by-step guide if applicable
    estimated_duration_minutes integer CHECK (estimated_duration_minutes >= 0),
    difficulty smallint CHECK (difficulty >= 1 AND difficulty <= 5), -- e.g., 1 (Easy) to 5 (Hard)
    tags text[],
    is_default boolean DEFAULT false NOT NULL, -- Indicates if it's a predefined strategy
    icon text -- Optional: name or path for a UI icon
);

-- Add comments to the table and columns
COMMENT ON TABLE public.focus_strategies8 IS 'Stores focus enhancement strategies, including default library and user custom strategies.';
COMMENT ON COLUMN public.focus_strategies8.user_id IS 'User who created the strategy, NULL for default system strategies.';
COMMENT ON COLUMN public.focus_strategies8.name IS 'Name of the focus strategy.';
COMMENT ON COLUMN public.focus_strategies8.category IS 'Category the strategy belongs to (e.g., Time Management, Mindfulness).';
COMMENT ON COLUMN public.focus_strategies8.instructions IS 'Detailed steps or guidance for implementing the strategy.';
COMMENT ON COLUMN public.focus_strategies8.estimated_duration_minutes IS 'Approximate time required for the strategy.';
COMMENT ON COLUMN public.focus_strategies8.difficulty IS 'Perceived difficulty level (1-5).';
COMMENT ON COLUMN public.focus_strategies8.tags IS 'Keywords for searching and filtering strategies.';
COMMENT ON COLUMN public.focus_strategies8.is_default IS 'True if this is a pre-defined strategy available to all users.';
COMMENT ON COLUMN public.focus_strategies8.icon IS 'Identifier for an optional UI icon associated with the strategy.';

-- Enable Row Level Security (RLS)
ALTER TABLE public.focus_strategies8 ENABLE ROW LEVEL SECURITY;

-- Grant permissions
GRANT ALL ON TABLE public.focus_strategies8 TO supabase_admin;
GRANT ALL ON TABLE public.focus_strategies8 TO service_role;
-- Grant authenticated users specific permissions controlled by RLS policies
GRANT SELECT, INSERT, UPDATE, DELETE ON TABLE public.focus_strategies8 TO authenticated;

-- Create RLS Policies

-- Policy: Authenticated users can select default strategies and their own strategies.
DROP POLICY IF EXISTS "select_focus_strategies" ON public.focus_strategies8;
CREATE POLICY "select_focus_strategies" ON public.focus_strategies8
    FOR SELECT
    TO authenticated
    USING (is_default = true OR user_id = auth.uid());

-- Policy: Authenticated users can insert their own strategies.
DROP POLICY IF EXISTS "insert_own_focus_strategies" ON public.focus_strategies8;
CREATE POLICY "insert_own_focus_strategies" ON public.focus_strategies8
    FOR INSERT
    TO authenticated
    WITH CHECK (user_id = auth.uid() AND is_default = false); -- Users can only insert non-default strategies for themselves

-- Policy: Authenticated users can update their own strategies.
DROP POLICY IF EXISTS "update_own_focus_strategies" ON public.focus_strategies8;
CREATE POLICY "update_own_focus_strategies" ON public.focus_strategies8
    FOR UPDATE
    TO authenticated
    USING (user_id = auth.uid() AND is_default = false) -- Can only update their own non-default strategies
    WITH CHECK (user_id = auth.uid() AND is_default = false);

-- Policy: Authenticated users can delete their own strategies.
DROP POLICY IF EXISTS "delete_own_focus_strategies" ON public.focus_strategies8;
CREATE POLICY "delete_own_focus_strategies" ON public.focus_strategies8
    FOR DELETE
    TO authenticated
    USING (user_id = auth.uid() AND is_default = false); -- Can only delete their own non-default strategies

-- Create a trigger to automatically update 'updated_at' timestamp
CREATE OR REPLACE FUNCTION public.handle_updated_at()
RETURNS TRIGGER AS $$
BEGIN
  NEW.updated_at = now();
  RETURN NEW;
END;
$$ LANGUAGE plpgsql;

DROP TRIGGER IF EXISTS on_focus_strategies8_updated ON public.focus_strategies8;
CREATE TRIGGER on_focus_strategies8_updated
BEFORE UPDATE ON public.focus_strategies8
FOR EACH ROW
EXECUTE FUNCTION public.handle_updated_at();

-- Optional: Add some default strategies (Example)
-- INSERT INTO public.focus_strategies8 (name, description, category, instructions, estimated_duration_minutes, difficulty, tags, is_default, icon) VALUES
-- ('Pomodoro Technique', 'Work in focused 25-minute intervals with short breaks.', 'Time Management', '1. Choose a task. 2. Set timer for 25 mins. 3. Work until timer rings. 4. Take a 5-min break. 5. Repeat 4 times, then take a longer 15-30 min break.', 30, 2, '{"timeboxing", "breaks", "pomodoro"}', true, 'timer'),
-- ('Eat the Frog', 'Tackle your most challenging task first thing in the morning.', 'Task Management', '1. Identify your most important/difficult task for the day ("the frog"). 2. Commit to completing it before moving to other tasks. 3. Break it down if necessary.', 60, 4, '{"prioritization", "procrastination", "morning"}', true, 'frog'),
-- ('Mindful Breathing', 'Focus on your breath for a few minutes to center yourself.', 'Mindfulness', '1. Sit comfortably. 2. Close your eyes gently. 3. Pay attention to the sensation of your breath entering and leaving your body. 4. If your mind wanders, gently bring focus back to the breath.', 5, 1, '{"meditation", "calm", "reset"}', true, 'lungs'); 