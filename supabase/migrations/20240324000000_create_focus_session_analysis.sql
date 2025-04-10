-- Create the focus session analysis table for detailed metrics and insights
CREATE TABLE IF NOT EXISTS public.focus_session_analysis (
  id UUID DEFAULT gen_random_uuid() PRIMARY KEY,
  user_id UUID NOT NULL REFERENCES auth.users(id) ON DELETE CASCADE,
  session_id UUID NOT NULL REFERENCES public.focus_sessions(id) ON DELETE CASCADE,
  attention_score INTEGER NOT NULL CHECK (attention_score BETWEEN 1 AND 100),
  productivity_score INTEGER NOT NULL CHECK (productivity_score BETWEEN 1 AND 100),
  distraction_level INTEGER NOT NULL CHECK (distraction_level BETWEEN 1 AND 100),
  energy_level INTEGER NOT NULL CHECK (energy_level BETWEEN 1 AND 100),
  focus_quality INTEGER NOT NULL CHECK (focus_quality BETWEEN 1 AND 100),
  mood_before INTEGER NOT NULL CHECK (mood_before BETWEEN 1 AND 10),
  mood_after INTEGER NOT NULL CHECK (mood_after BETWEEN 1 AND 10),
  environmental_factors TEXT[],
  cognitive_factors TEXT[],
  physical_factors TEXT[],
  effectiveness_strategies TEXT[],
  improvement_suggestions TEXT[],
  ai_analysis TEXT,
  created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
  updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- Create indexes for faster lookups
CREATE INDEX IF NOT EXISTS focus_session_analysis_user_id_idx ON public.focus_session_analysis(user_id);
CREATE INDEX IF NOT EXISTS focus_session_analysis_session_id_idx ON public.focus_session_analysis(session_id);
CREATE UNIQUE INDEX IF NOT EXISTS focus_session_analysis_session_id_unique_idx ON public.focus_session_analysis(session_id);

-- Create index for date-based lookups
CREATE INDEX IF NOT EXISTS focus_session_analysis_created_at_idx ON public.focus_session_analysis(created_at);

-- Set up Row Level Security
ALTER TABLE public.focus_session_analysis ENABLE ROW LEVEL SECURITY;

-- Create policies
-- Users can only view their own data
CREATE POLICY "Users can view their own session analysis" 
  ON public.focus_session_analysis
  FOR SELECT
  USING (auth.uid() = user_id);

-- Users can insert their own data
CREATE POLICY "Users can insert their own session analysis" 
  ON public.focus_session_analysis
  FOR INSERT
  WITH CHECK (auth.uid() = user_id);

-- Users can update their own data
CREATE POLICY "Users can update their own session analysis" 
  ON public.focus_session_analysis
  FOR UPDATE
  USING (auth.uid() = user_id);

-- Users can delete their own data
CREATE POLICY "Users can delete their own session analysis" 
  ON public.focus_session_analysis
  FOR DELETE
  USING (auth.uid() = user_id);

-- Create a function to update the updated_at timestamp
CREATE OR REPLACE FUNCTION public.set_updated_at()
RETURNS TRIGGER AS $$
BEGIN
  NEW.updated_at = NOW();
  RETURN NEW;
END;
$$ LANGUAGE plpgsql;

-- Create a trigger to update the updated_at timestamp
CREATE TRIGGER set_focus_session_analysis_updated_at
BEFORE UPDATE ON public.focus_session_analysis
FOR EACH ROW
EXECUTE FUNCTION public.set_updated_at();

-- Create a view that joins focus_sessions with focus_session_analysis
CREATE OR REPLACE VIEW public.focus_session_complete_view AS
SELECT 
  s.id,
  s.user_id,
  s.start_time,
  s.end_time,
  s.duration_minutes,
  s.session_type,
  s.completed,
  s.target_duration_minutes,
  s.breaks_taken,
  s.distractions_count,
  s.tasks_completed,
  s.notes,
  s.created_at,
  s.updated_at,
  a.attention_score,
  a.productivity_score,
  a.distraction_level,
  a.energy_level,
  a.focus_quality,
  a.mood_before,
  a.mood_after,
  a.environmental_factors,
  a.cognitive_factors,
  a.physical_factors,
  a.effectiveness_strategies,
  a.improvement_suggestions,
  a.ai_analysis
FROM 
  public.focus_sessions s
LEFT JOIN 
  public.focus_session_analysis a
ON 
  s.id = a.session_id;

-- Add row-level security to the view
ALTER VIEW public.focus_session_complete_view SECURITY DEFINER;

-- Create function for calculating focus trends
CREATE OR REPLACE FUNCTION public.get_focus_trends(p_user_id UUID, p_days INTEGER DEFAULT 30)
RETURNS TABLE (
  date_group DATE,
  avg_attention_score NUMERIC(5,2),
  avg_productivity_score NUMERIC(5,2),
  avg_focus_quality NUMERIC(5,2),
  total_focus_minutes INTEGER,
  total_sessions INTEGER
) AS $$
BEGIN
  RETURN QUERY
  SELECT 
    DATE_TRUNC('day', s.start_time)::DATE as date_group,
    COALESCE(AVG(a.attention_score), 0) as avg_attention_score,
    COALESCE(AVG(a.productivity_score), 0) as avg_productivity_score,
    COALESCE(AVG(a.focus_quality), 0) as avg_focus_quality,
    COALESCE(SUM(s.duration_minutes), 0)::INTEGER as total_focus_minutes,
    COUNT(s.id)::INTEGER as total_sessions
  FROM 
    public.focus_sessions s
  LEFT JOIN 
    public.focus_session_analysis a ON s.id = a.session_id
  WHERE 
    s.user_id = p_user_id
    AND s.start_time >= (CURRENT_DATE - (p_days || ' days')::INTERVAL)
  GROUP BY 
    date_group
  ORDER BY 
    date_group;
END;
$$ LANGUAGE plpgsql SECURITY DEFINER; 