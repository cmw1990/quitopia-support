-- Create functions for managing focus sessions
CREATE OR REPLACE FUNCTION start_focus_session(
    p_user_id UUID,
    p_focus_type TEXT DEFAULT NULL,
    p_task_id UUID DEFAULT NULL
) RETURNS UUID AS $$
DECLARE
    session_id UUID;
BEGIN
    INSERT INTO focus_sessions (
        user_id,
        start_time,
        focus_type,
        task_id,
        status
    ) VALUES (
        p_user_id,
        now(),
        p_focus_type,
        p_task_id,
        'active'
    ) RETURNING id INTO session_id;
    
    RETURN session_id;
END;
$$ LANGUAGE plpgsql SECURITY DEFINER;

-- Function to end a focus session
CREATE OR REPLACE FUNCTION end_focus_session(
    p_session_id UUID,
    p_completed BOOLEAN DEFAULT true
) RETURNS void AS $$
BEGIN
    UPDATE focus_sessions SET
        end_time = now(),
        completed = p_completed,
        duration_minutes = EXTRACT(EPOCH FROM (now() - start_time))/60
    WHERE id = p_session_id;
END;
$$ LANGUAGE plpgsql SECURITY DEFINER;

-- Seed initial focus strategies with more robust insertion
DO $$
BEGIN
    -- Check if the table is empty before inserting
    IF NOT EXISTS (SELECT 1 FROM focus_strategies) THEN
        INSERT INTO focus_strategies (
            id, 
            name, 
            description, 
            category, 
            difficulty_level, 
            effectiveness_rating
        ) VALUES 
        (uuid_generate_v4(), 'Pomodoro Technique', 'Work for 25 minutes, then take a 5-minute break. After 4 cycles, take a longer break.', 'time_management', 1, 4.5),
        (uuid_generate_v4(), 'Deep Work', 'Schedule focused work blocks of 60-90 minutes with no distractions.', 'deep_focus', 3, 4.8),
        (uuid_generate_v4(), 'Two-Minute Rule', 'If a task takes less than two minutes, do it immediately.', 'productivity', 1, 4.0),
        (uuid_generate_v4(), 'Time Blocking', 'Plan your day in advance by blocking time for specific tasks.', 'time_management', 2, 4.3),
        (uuid_generate_v4(), 'Mindful Focus', 'Practice mindful awareness while working to maintain concentration.', 'mindfulness', 2, 4.2);
    END IF;
EXCEPTION 
    WHEN OTHERS THEN
        RAISE NOTICE 'Error inserting focus strategies: %', SQLERRM;
END $$;

-- Create function for tracking distractions
CREATE OR REPLACE FUNCTION log_distraction(
    p_user_id UUID,
    p_session_id UUID,
    p_type TEXT,
    p_description TEXT DEFAULT NULL
) RETURNS UUID AS $$
DECLARE
    distraction_id UUID;
BEGIN
    INSERT INTO focus_distractions (
        user_id,
        session_id,
        timestamp,
        type,
        description
    ) VALUES (
        p_user_id,
        p_session_id,
        now(),
        p_type,
        p_description
    ) RETURNING id INTO distraction_id;
    
    -- Update distraction count in session
    UPDATE focus_sessions 
    SET distractions_count = distractions_count + 1 
    WHERE id = p_session_id;
    
    RETURN distraction_id;
END;
$$ LANGUAGE plpgsql SECURITY DEFINER;

-- Create initial achievements
DO $$
BEGIN
    -- Check if the table is empty before inserting
    IF NOT EXISTS (SELECT 1 FROM focus_achievements) THEN
        INSERT INTO focus_achievements (
            id, 
            user_id, 
            achievement_id, 
            name, 
            description, 
            category, 
            difficulty
        ) VALUES 
        (uuid_generate_v4(), NULL, 'first_session', 'First Focus', 'Complete your first focus session', 'beginner', 1),
        (uuid_generate_v4(), NULL, 'streak_7', 'Week Warrior', 'Maintain a 7-day focus streak', 'consistency', 2),
        (uuid_generate_v4(), NULL, 'deep_focus_30', 'Deep Diver', 'Complete a 30-minute focus session without distractions', 'focus', 2),
        (uuid_generate_v4(), NULL, 'task_master', 'Task Master', 'Complete 10 tasks in a single day', 'productivity', 3),
        (uuid_generate_v4(), NULL, 'mindful_master', 'Mindful Master', 'Complete 5 mindful focus sessions', 'mindfulness', 2);
    END IF;
EXCEPTION 
    WHEN OTHERS THEN
        RAISE NOTICE 'Error inserting focus achievements: %', SQLERRM;
END $$;

-- Create trigger for updating 'updated_at' timestamps
CREATE OR REPLACE FUNCTION update_updated_at_column()
RETURNS TRIGGER AS $$
BEGIN
    NEW.updated_at = CURRENT_TIMESTAMP;
    RETURN NEW;
END;
$$ language 'plpgsql';

-- Drop existing triggers if they exist
DO $$
BEGIN
    -- Drop triggers if they exist
    IF EXISTS (
        SELECT 1 
        FROM information_schema.triggers 
        WHERE event_object_table = 'user_profiles' 
        AND trigger_name = 'update_user_profiles_updated_at'
    ) THEN
        DROP TRIGGER update_user_profiles_updated_at ON user_profiles;
    END IF;

    IF EXISTS (
        SELECT 1 
        FROM information_schema.triggers 
        WHERE event_object_table = 'focus_tasks' 
        AND trigger_name = 'update_focus_tasks_updated_at'
    ) THEN
        DROP TRIGGER update_focus_tasks_updated_at ON focus_tasks;
    END IF;
END $$;

-- Apply triggers
CREATE TRIGGER update_user_profiles_updated_at
    BEFORE UPDATE ON user_profiles
    FOR EACH ROW
    EXECUTE FUNCTION update_updated_at_column();

CREATE TRIGGER update_focus_tasks_updated_at
    BEFORE UPDATE ON focus_tasks
    FOR EACH ROW
    EXECUTE FUNCTION update_updated_at_column();

-- Record migration
INSERT INTO schema_version (version, name) VALUES (2, '002_seed_data.sql')
ON CONFLICT (version) DO UPDATE SET name = EXCLUDED.name;