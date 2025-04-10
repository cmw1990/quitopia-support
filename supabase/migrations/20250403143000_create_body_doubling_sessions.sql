-- supabase/migrations/20250403143000_create_body_doubling_sessions.sql

-- Create ENUM type for session status if it doesn't exist
DO $$
BEGIN
    IF NOT EXISTS (SELECT 1 FROM pg_type WHERE typname = 'session_status') THEN
        CREATE TYPE public.session_status AS ENUM (
            'waiting',
            'active',
            'completed',
            'cancelled'
        );
    END IF;
END
$$;

-- Create the body_doubling_sessions table
CREATE TABLE IF NOT EXISTS public.body_doubling_sessions (
    id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
    host_user_id uuid NOT NULL REFERENCES auth.users(id) ON DELETE CASCADE,
    title text NOT NULL CHECK (char_length(title) > 0),
    description text,
    status public.session_status NOT NULL DEFAULT 'waiting',
    max_participants integer NOT NULL DEFAULT 5 CHECK (max_participants > 0),
    -- Note: current_participants should ideally be managed via a separate participants table or real-time logic
    is_public boolean NOT NULL DEFAULT true,
    join_code text UNIQUE CHECK (is_public OR (join_code IS NOT NULL AND char_length(join_code) > 0)), -- Require join_code if private and ensure it's not empty
    scheduled_start_time timestamptz,
    actual_start_time timestamptz,
    estimated_duration_minutes integer NOT NULL DEFAULT 60 CHECK (estimated_duration_minutes > 0),
    actual_end_time timestamptz,
    created_at timestamptz NOT NULL DEFAULT timezone('utc', now()),
    updated_at timestamptz NOT NULL DEFAULT timezone('utc', now())
);

-- Add comments to clarify column purposes
COMMENT ON COLUMN public.body_doubling_sessions.max_participants IS 'Maximum number of users allowed in the session, including the host.';
COMMENT ON COLUMN public.body_doubling_sessions.is_public IS 'If true, the session is listed publicly; otherwise, requires a join_code.';
COMMENT ON COLUMN public.body_doubling_sessions.join_code IS 'Unique code required to join a private session.';
COMMENT ON COLUMN public.body_doubling_sessions.scheduled_start_time IS 'The time the session is planned to start.';
COMMENT ON COLUMN public.body_doubling_sessions.actual_start_time IS 'The time the session actually started.';
COMMENT ON COLUMN public.body_doubling_sessions.estimated_duration_minutes IS 'The planned duration of the session in minutes.';
COMMENT ON COLUMN public.body_doubling_sessions.actual_end_time IS 'The time the session actually ended or was cancelled.';


-- Function to update updated_at timestamp (Create if not exists)
CREATE OR REPLACE FUNCTION public.update_updated_at_column()
RETURNS TRIGGER AS $$
BEGIN
   NEW.updated_at = timezone('utc', now());
   RETURN NEW;
END;
$$ language 'plpgsql';

-- Trigger to update updated_at on row update (Drop existing before creating to avoid errors on re-run)
DROP TRIGGER IF EXISTS update_body_doubling_sessions_updated_at ON public.body_doubling_sessions;
CREATE TRIGGER update_body_doubling_sessions_updated_at
BEFORE UPDATE ON public.body_doubling_sessions
FOR EACH ROW
EXECUTE FUNCTION public.update_updated_at_column();


-- Enable RLS (Do this last after table/policies are defined)
ALTER TABLE public.body_doubling_sessions ENABLE ROW LEVEL SECURITY;

-- Drop existing policies before creating new ones to allow script re-run
DROP POLICY IF EXISTS "Allow public read access for public sessions" ON public.body_doubling_sessions;
DROP POLICY IF EXISTS "Allow host read access" ON public.body_doubling_sessions;
DROP POLICY IF EXISTS "Allow host insert access" ON public.body_doubling_sessions;
DROP POLICY IF EXISTS "Allow host update access" ON public.body_doubling_sessions;
DROP POLICY IF EXISTS "Allow host delete access" ON public.body_doubling_sessions;


-- RLS Policies (Minimal as requested, adjust as needed)

-- Allow anonymous or authenticated users public read access for public sessions
CREATE POLICY "Allow public read access for public sessions"
ON public.body_doubling_sessions
FOR SELECT
USING (is_public = true);

-- Allow authenticated users read access to their own sessions (public or private)
CREATE POLICY "Allow host read access"
ON public.body_doubling_sessions
FOR SELECT
USING (auth.uid() = host_user_id);

-- Allow authenticated users to insert sessions where they are the host
CREATE POLICY "Allow host insert access"
ON public.body_doubling_sessions
FOR INSERT
WITH CHECK (auth.uid() = host_user_id);

-- Allow host to update their own sessions
CREATE POLICY "Allow host update access"
ON public.body_doubling_sessions
FOR UPDATE
USING (auth.uid() = host_user_id)
WITH CHECK (auth.uid() = host_user_id);

-- Allow host to delete their own sessions (Consider changing status to 'cancelled' instead of hard delete)
CREATE POLICY "Allow host delete access"
ON public.body_doubling_sessions
FOR DELETE
USING (auth.uid() = host_user_id);

-- Note: Access for participants joining sessions is not covered here and
-- would require a separate 'session_participants' table and associated RLS policies.
-- The current service implementation has placeholder comments for this (lines 217-229).