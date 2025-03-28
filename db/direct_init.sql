-- Direct initialization SQL for Supabase
-- SSOT8001 compliant database setup

-- Create User Profiles Table
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

-- Create Progress Tracking Table
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

-- Create Health Milestones Table
CREATE TABLE IF NOT EXISTS public.mission4_health_milestones (
    id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
    title VARCHAR(255) NOT NULL,
    description TEXT NOT NULL,
    days_required INTEGER NOT NULL,
    icon_name VARCHAR(100),
    category VARCHAR(100),
    created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- Create Mood Tracking Table
CREATE TABLE IF NOT EXISTS public.mood_logs (
    id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
    user_id UUID NOT NULL,
    timestamp TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
    mood_value INTEGER NOT NULL CHECK (mood_value BETWEEN 1 AND 10),
    mood_category VARCHAR(50),
    notes TEXT,
    associated_triggers TEXT[]
);

-- Create Focus Tracking Table
CREATE TABLE IF NOT EXISTS public.focus_logs (
    id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
    user_id UUID NOT NULL,
    timestamp TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
    focus_score INTEGER NOT NULL CHECK (focus_score BETWEEN 1 AND 10),
    duration_minutes INTEGER,
    activity_type VARCHAR(100),
    notes TEXT
);

-- Create Energy Tracking Table
CREATE TABLE IF NOT EXISTS public.energy_focus_logs (
    id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
    user_id UUID NOT NULL,
    timestamp TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
    energy_level INTEGER NOT NULL CHECK (energy_level BETWEEN 1 AND 10),
    affecting_factors TEXT[],
    notes TEXT
);

-- Insert default health milestones (only if the table is empty)
INSERT INTO public.mission4_health_milestones (title, description, days_required, icon_name, category)
SELECT 'Blood Pressure Normalizes', 'Your blood pressure and pulse rate begin to return to normal levels.', 1, 'Heart', 'circulatory'
WHERE NOT EXISTS (SELECT 1 FROM public.mission4_health_milestones LIMIT 1);

INSERT INTO public.mission4_health_milestones (title, description, days_required, icon_name, category)
SELECT 'Carbon Monoxide Levels Drop', 'The carbon monoxide level in your blood drops to normal, increasing the blood''s oxygen-carrying capacity.', 1, 'Lungs', 'respiratory'
WHERE NOT EXISTS (SELECT 1 FROM public.mission4_health_milestones WHERE title = 'Carbon Monoxide Levels Drop');

INSERT INTO public.mission4_health_milestones (title, description, days_required, icon_name, category)
SELECT 'Improved Sense of Taste and Smell', 'Your senses of taste and smell begin to improve as nerve endings start to heal.', 2, 'Nose', 'sensory'
WHERE NOT EXISTS (SELECT 1 FROM public.mission4_health_milestones WHERE title = 'Improved Sense of Taste and Smell');

INSERT INTO public.mission4_health_milestones (title, description, days_required, icon_name, category)
SELECT 'Easier Breathing', 'Your lung function begins to improve, making breathing easier and reducing coughing.', 3, 'Lungs', 'respiratory'
WHERE NOT EXISTS (SELECT 1 FROM public.mission4_health_milestones WHERE title = 'Easier Breathing');

INSERT INTO public.mission4_health_milestones (title, description, days_required, icon_name, category)
SELECT 'Improved Circulation', 'Your circulation improves, making physical activity easier and reducing the strain on your heart.', 14, 'Heart', 'circulatory'
WHERE NOT EXISTS (SELECT 1 FROM public.mission4_health_milestones WHERE title = 'Improved Circulation');

INSERT INTO public.mission4_health_milestones (title, description, days_required, icon_name, category)
SELECT 'Reduced Risk of Heart Attack', 'Your risk of heart attack begins to drop as your heart doesn''t have to work as hard.', 28, 'Heart', 'cardiovascular'
WHERE NOT EXISTS (SELECT 1 FROM public.mission4_health_milestones WHERE title = 'Reduced Risk of Heart Attack');

INSERT INTO public.mission4_health_milestones (title, description, days_required, icon_name, category)
SELECT 'Lung Function Improves', 'Your lung function has significantly improved, and respiratory infections become less common.', 90, 'Lungs', 'respiratory'
WHERE NOT EXISTS (SELECT 1 FROM public.mission4_health_milestones WHERE title = 'Lung Function Improves');

INSERT INTO public.mission4_health_milestones (title, description, days_required, icon_name, category)
SELECT 'Reduced Risk of Cancer', 'Your risk of various smoking-related cancers begins to decrease.', 365, 'Shield', 'long-term'
WHERE NOT EXISTS (SELECT 1 FROM public.mission4_health_milestones WHERE title = 'Reduced Risk of Cancer');

INSERT INTO public.mission4_health_milestones (title, description, days_required, icon_name, category)
SELECT 'Extended Life Expectancy', 'Your life expectancy approaches that of someone who has never smoked.', 5475, 'Clock', 'long-term'
WHERE NOT EXISTS (SELECT 1 FROM public.mission4_health_milestones WHERE title = 'Extended Life Expectancy');

-- Enable Row Level Security on all tables
ALTER TABLE public.mission4_user_profiles ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.mission4_progress ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.mission4_health_milestones ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.mood_logs ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.focus_logs ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.energy_focus_logs ENABLE ROW LEVEL SECURITY;

-- Create RLS policies for user profiles
CREATE POLICY "Users can view their own profiles" ON public.mission4_user_profiles 
    FOR SELECT USING (auth.uid() = user_id);
    
CREATE POLICY "Users can update their own profiles" ON public.mission4_user_profiles 
    FOR UPDATE USING (auth.uid() = user_id);
    
CREATE POLICY "Users can insert their own profiles" ON public.mission4_user_profiles 
    FOR INSERT WITH CHECK (auth.uid() = user_id);

-- Create RLS policies for progress
CREATE POLICY "Users can view their own progress" ON public.mission4_progress 
    FOR SELECT USING (auth.uid() = user_id);
    
CREATE POLICY "Users can update their own progress" ON public.mission4_progress 
    FOR UPDATE USING (auth.uid() = user_id);
    
CREATE POLICY "Users can insert their own progress" ON public.mission4_progress 
    FOR INSERT WITH CHECK (auth.uid() = user_id);

-- Create RLS policies for health milestones (public read access)
CREATE POLICY "Health milestones are visible to all" ON public.mission4_health_milestones 
    FOR SELECT USING (true);

-- Create RLS policies for mood logs
CREATE POLICY "Users can view their own mood logs" ON public.mood_logs 
    FOR SELECT USING (auth.uid() = user_id);
    
CREATE POLICY "Users can insert their own mood logs" ON public.mood_logs 
    FOR INSERT WITH CHECK (auth.uid() = user_id);

-- Create RLS policies for focus logs
CREATE POLICY "Users can view their own focus logs" ON public.focus_logs 
    FOR SELECT USING (auth.uid() = user_id);
    
CREATE POLICY "Users can insert their own focus logs" ON public.focus_logs 
    FOR INSERT WITH CHECK (auth.uid() = user_id);

-- Create RLS policies for energy logs
CREATE POLICY "Users can view their own energy logs" ON public.energy_focus_logs 
    FOR SELECT USING (auth.uid() = user_id);
    
CREATE POLICY "Users can insert their own energy logs" ON public.energy_focus_logs 
    FOR INSERT WITH CHECK (auth.uid() = user_id);

-- Create function for tracking quit progress
CREATE OR REPLACE FUNCTION get_quit_progress(user_uuid UUID)
RETURNS TABLE (
    days_quit INTEGER,
    cigarettes_avoided INTEGER,
    money_saved DECIMAL(10,2)
)
LANGUAGE plpgsql
AS $$
DECLARE
    quit_date_val TIMESTAMP WITH TIME ZONE;
    daily_cigarettes_val INTEGER;
    cigarette_cost DECIMAL(10,2) := 0.50; -- Average cost per cigarette
BEGIN
    -- Get user's quit date and daily cigarettes
    SELECT quit_date, daily_cigarettes 
    INTO quit_date_val, daily_cigarettes_val
    FROM mission4_user_profiles
    WHERE user_id = user_uuid;
    
    -- Default values if not set
    IF daily_cigarettes_val IS NULL THEN
        daily_cigarettes_val := 20; -- Default to a pack a day
    END IF;
    
    IF quit_date_val IS NULL THEN
        quit_date_val := NOW(); -- Default to today
    END IF;
    
    -- Calculate days quit
    days_quit := EXTRACT(DAY FROM NOW() - quit_date_val);
    IF days_quit < 0 THEN days_quit := 0; END IF;
    
    -- Calculate cigarettes avoided
    cigarettes_avoided := days_quit * daily_cigarettes_val;
    
    -- Calculate money saved
    money_saved := cigarettes_avoided * cigarette_cost;
    
    RETURN QUERY SELECT days_quit, cigarettes_avoided, money_saved;
END;
$$; 