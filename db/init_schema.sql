-- Init Schema for Mission Fresh (SSOT8001 compliant)
-- This script creates all the tables necessary for the Mission Fresh app

-- User Profiles Table
CREATE TABLE IF NOT EXISTS public.mission4_user_profiles (
    id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
    user_id UUID NOT NULL UNIQUE,
    display_name VARCHAR(100),
    bio TEXT,
    avatar_url TEXT,
    quit_date TIMESTAMP WITH TIME ZONE,
    smoking_years INTEGER,
    daily_cigarettes INTEGER,
    preferred_product_type VARCHAR(100),
    created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
    updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- Progress Tracking Table
CREATE TABLE IF NOT EXISTS public.mission4_progress (
    id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
    user_id UUID NOT NULL,
    date DATE NOT NULL,
    cigarettes_smoked INTEGER DEFAULT 0,
    cigarettes_avoided INTEGER DEFAULT 0,
    cravings_count INTEGER DEFAULT 0,
    cravings_resisted INTEGER DEFAULT 0,
    money_saved DECIMAL(10, 2) DEFAULT 0,
    health_score INTEGER,
    mood_score INTEGER,
    stress_level INTEGER,
    notes TEXT,
    created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
    updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
    UNIQUE (user_id, date)
);

-- Health Milestones Table
CREATE TABLE IF NOT EXISTS public.mission4_health_milestones (
    id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
    title VARCHAR(255) NOT NULL,
    description TEXT NOT NULL,
    days_required INTEGER NOT NULL,
    icon_name VARCHAR(100),
    category VARCHAR(100),
    created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- Mood Tracking Table
CREATE TABLE IF NOT EXISTS public.mood_logs (
    id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
    user_id UUID NOT NULL,
    timestamp TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
    mood_value INTEGER NOT NULL CHECK (mood_value BETWEEN 1 AND 10),
    mood_category VARCHAR(50),
    notes TEXT,
    associated_triggers TEXT[]
);

-- Focus Tracking Table
CREATE TABLE IF NOT EXISTS public.focus_logs (
    id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
    user_id UUID NOT NULL,
    timestamp TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
    focus_score INTEGER NOT NULL CHECK (focus_score BETWEEN 1 AND 10),
    duration_minutes INTEGER,
    activity_type VARCHAR(100),
    notes TEXT
);

-- Energy Tracking Table
CREATE TABLE IF NOT EXISTS public.energy_focus_logs (
    id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
    user_id UUID NOT NULL,
    timestamp TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
    energy_level INTEGER NOT NULL CHECK (energy_level BETWEEN 1 AND 10),
    affecting_factors TEXT[],
    notes TEXT
);

-- Game Progress Tracking Table
CREATE TABLE IF NOT EXISTS public.game_progress (
    id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
    user_id UUID NOT NULL,
    game_id VARCHAR(100) NOT NULL,
    score INTEGER,
    time_played INTEGER, -- in seconds
    completed_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
    difficulty VARCHAR(50),
    created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- Insert some default health milestones
INSERT INTO public.mission4_health_milestones (title, description, days_required, icon_name, category)
VALUES
    ('Blood Pressure Normalizes', 'Your blood pressure and pulse rate begin to return to normal levels.', 1, 'Heart', 'circulatory'),
    ('Carbon Monoxide Levels Drop', 'The carbon monoxide level in your blood drops to normal, increasing the blood''s oxygen-carrying capacity.', 1, 'Lungs', 'respiratory'),
    ('Improved Sense of Taste and Smell', 'Your senses of taste and smell begin to improve as nerve endings start to heal.', 2, 'Nose', 'sensory'),
    ('Easier Breathing', 'Your lung function begins to improve, making breathing easier and reducing coughing.', 3, 'Lungs', 'respiratory'),
    ('Improved Circulation', 'Your circulation improves, making physical activity easier and reducing the strain on your heart.', 14, 'Heart', 'circulatory'),
    ('Reduced Risk of Heart Attack', 'Your risk of heart attack begins to drop as your heart doesn''t have to work as hard.', 28, 'Heart', 'cardiovascular'),
    ('Lung Function Improves', 'Your lung function has significantly improved, and respiratory infections become less common.', 90, 'Lungs', 'respiratory'),
    ('Reduced Risk of Cancer', 'Your risk of various smoking-related cancers begins to decrease.', 365, 'Shield', 'long-term'),
    ('Extended Life Expectancy', 'Your life expectancy approaches that of someone who has never smoked.', 5475, 'Clock', 'long-term');

-- Grant permissions
ALTER TABLE public.mission4_user_profiles ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.mission4_progress ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.mission4_health_milestones ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.mood_logs ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.focus_logs ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.energy_focus_logs ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.game_progress ENABLE ROW LEVEL SECURITY;

-- Create policies (users can only access their own data)
CREATE POLICY "Users can view their own profiles" ON public.mission4_user_profiles 
    FOR SELECT USING (auth.uid() = user_id);
    
CREATE POLICY "Users can update their own profiles" ON public.mission4_user_profiles 
    FOR UPDATE USING (auth.uid() = user_id);
    
CREATE POLICY "Users can insert their own profiles" ON public.mission4_user_profiles 
    FOR INSERT WITH CHECK (auth.uid() = user_id);

CREATE POLICY "Users can view their own progress" ON public.mission4_progress 
    FOR SELECT USING (auth.uid() = user_id);
    
CREATE POLICY "Users can update their own progress" ON public.mission4_progress 
    FOR UPDATE USING (auth.uid() = user_id);
    
CREATE POLICY "Users can insert their own progress" ON public.mission4_progress 
    FOR INSERT WITH CHECK (auth.uid() = user_id);

-- Health milestones are visible to all
CREATE POLICY "Health milestones are visible to all" ON public.mission4_health_milestones 
    FOR SELECT USING (true);

-- Mood, Focus, and Energy logs policies
CREATE POLICY "Users can view their own mood logs" ON public.mood_logs 
    FOR SELECT USING (auth.uid() = user_id);
    
CREATE POLICY "Users can insert their own mood logs" ON public.mood_logs 
    FOR INSERT WITH CHECK (auth.uid() = user_id);

CREATE POLICY "Users can view their own focus logs" ON public.focus_logs 
    FOR SELECT USING (auth.uid() = user_id);
    
CREATE POLICY "Users can insert their own focus logs" ON public.focus_logs 
    FOR INSERT WITH CHECK (auth.uid() = user_id);

CREATE POLICY "Users can view their own energy logs" ON public.energy_focus_logs 
    FOR SELECT USING (auth.uid() = user_id);
    
CREATE POLICY "Users can insert their own energy logs" ON public.energy_focus_logs 
    FOR INSERT WITH CHECK (auth.uid() = user_id);

-- Game progress policies
CREATE POLICY "Users can view their own game progress" ON public.game_progress 
    FOR SELECT USING (auth.uid() = user_id);
    
CREATE POLICY "Users can insert their own game progress" ON public.game_progress 
    FOR INSERT WITH CHECK (auth.uid() = user_id); 