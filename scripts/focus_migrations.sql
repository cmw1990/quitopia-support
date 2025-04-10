-- Create tables
CREATE TABLE IF NOT EXISTS focus_sessions (
    id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
    user_id UUID REFERENCES auth.users(id),
    start_time TIMESTAMPTZ NOT NULL,
    end_time TIMESTAMPTZ,
    duration_minutes INTEGER,
    focus_type TEXT,
    completed BOOLEAN DEFAULT false,
    notes TEXT,
    task_id UUID,
    distractions_count INTEGER DEFAULT 0,
    focus_quality_rating INTEGER,
    environment_factors JSONB,
    created_at TIMESTAMPTZ DEFAULT now()
);

CREATE TABLE IF NOT EXISTS focus_tasks (
    id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
    user_id UUID REFERENCES auth.users(id),
    title TEXT NOT NULL,
    description TEXT,
    due_date TIMESTAMPTZ,
    status TEXT DEFAULT 'todo',
    priority TEXT DEFAULT 'medium',
    estimated_minutes INTEGER,
    actual_minutes INTEGER,
    cognitive_load_estimate INTEGER,
    parent_task_id UUID REFERENCES focus_tasks(id),
    tags TEXT[],
    "order" INTEGER,
    scheduled_start_time TIMESTAMPTZ,
    scheduled_end_time TIMESTAMPTZ,
    created_at TIMESTAMPTZ DEFAULT now(),
    updated_at TIMESTAMPTZ DEFAULT now()
);

CREATE TABLE IF NOT EXISTS focus_achievements (
    id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
    user_id UUID REFERENCES auth.users(id),
    achievement_id TEXT NOT NULL,
    name TEXT NOT NULL,
    description TEXT,
    category TEXT,
    difficulty INTEGER,
    progress INTEGER DEFAULT 0,
    completed BOOLEAN DEFAULT false,
    completion_date TIMESTAMPTZ,
    reward JSONB,
    created_at TIMESTAMPTZ DEFAULT now()
);

CREATE TABLE IF NOT EXISTS focus_distractions (
    id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
    user_id UUID REFERENCES auth.users(id),
    session_id UUID REFERENCES focus_sessions(id),
    timestamp TIMESTAMPTZ NOT NULL,
    type TEXT,
    description TEXT,
    duration_seconds INTEGER,
    intervention_used TEXT,
    intervention_effectiveness INTEGER,
    created_at TIMESTAMPTZ DEFAULT now()
);

-- Add RLS policies
ALTER TABLE focus_sessions ENABLE ROW LEVEL SECURITY;
CREATE POLICY "Users can view own sessions"
    ON focus_sessions FOR SELECT
    USING (auth.uid() = user_id);
CREATE POLICY "Users can insert own sessions"
    ON focus_sessions FOR INSERT
    WITH CHECK (auth.uid() = user_id);
CREATE POLICY "Users can update own sessions"
    ON focus_sessions FOR UPDATE
    USING (auth.uid() = user_id);

ALTER TABLE focus_tasks ENABLE ROW LEVEL SECURITY;
CREATE POLICY "Users can view own tasks"
    ON focus_tasks FOR SELECT
    USING (auth.uid() = user_id);
CREATE POLICY "Users can insert own tasks"
    ON focus_tasks FOR INSERT
    WITH CHECK (auth.uid() = user_id);
CREATE POLICY "Users can update own tasks"
    ON focus_tasks FOR UPDATE
    USING (auth.uid() = user_id);

ALTER TABLE focus_achievements ENABLE ROW LEVEL SECURITY;
CREATE POLICY "Users can view own achievements"
    ON focus_achievements FOR SELECT
    USING (auth.uid() = user_id);
CREATE POLICY "Users can insert own achievements"
    ON focus_achievements FOR INSERT
    WITH CHECK (auth.uid() = user_id);
CREATE POLICY "Users can update own achievements"
    ON focus_achievements FOR UPDATE
    USING (auth.uid() = user_id);

ALTER TABLE focus_distractions ENABLE ROW LEVEL SECURITY;
CREATE POLICY "Users can view own distractions"
    ON focus_distractions FOR SELECT
    USING (auth.uid() = user_id);
CREATE POLICY "Users can insert own distractions"
    ON focus_distractions FOR INSERT
    WITH CHECK (auth.uid() = user_id);
CREATE POLICY "Users can update own distractions"
    ON focus_distractions FOR UPDATE
    USING (auth.uid() = user_id);

-- Create indices for performance
CREATE INDEX IF NOT EXISTS focus_sessions_user_id_idx ON focus_sessions(user_id);
CREATE INDEX IF NOT EXISTS focus_tasks_user_id_idx ON focus_tasks(user_id);
CREATE INDEX IF NOT EXISTS focus_achievements_user_id_idx ON focus_achievements(user_id);
CREATE INDEX IF NOT EXISTS focus_distractions_user_id_idx ON focus_distractions(user_id);