-- Create the anti-fatigue strategies table
CREATE TABLE IF NOT EXISTS public.anti_fatigue_strategies (
  id UUID DEFAULT gen_random_uuid() PRIMARY KEY,
  name VARCHAR(255) NOT NULL,
  description TEXT NOT NULL,
  instructions TEXT NOT NULL,
  fatigue_type VARCHAR(50) NOT NULL, -- mental, physical, emotional, sensory
  application_context TEXT[] NOT NULL, -- work, study, social, etc.
  duration_minutes INTEGER NOT NULL,
  effectiveness_rating DECIMAL(3,1) NOT NULL CHECK (effectiveness_rating BETWEEN 1 AND 5),
  scientific_basis TEXT,
  contraindications TEXT,
  adhd_specific BOOLEAN DEFAULT FALSE,
  tags TEXT[],
  created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
  updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- Create the fatigue tracking table
CREATE TABLE IF NOT EXISTS public.fatigue_tracking (
  id UUID DEFAULT gen_random_uuid() PRIMARY KEY,
  user_id UUID NOT NULL REFERENCES auth.users(id) ON DELETE CASCADE,
  date TIMESTAMP WITH TIME ZONE NOT NULL,
  mental_fatigue INTEGER NOT NULL CHECK (mental_fatigue BETWEEN 1 AND 10),
  physical_fatigue INTEGER NOT NULL CHECK (physical_fatigue BETWEEN 1 AND 10),
  emotional_fatigue INTEGER NOT NULL CHECK (emotional_fatigue BETWEEN 1 AND 10),
  sensory_fatigue INTEGER NOT NULL CHECK (sensory_fatigue BETWEEN 1 AND 10),
  activity_context TEXT NOT NULL,
  contributors TEXT[],
  strategy_used UUID REFERENCES public.anti_fatigue_strategies(id),
  strategy_effectiveness INTEGER CHECK (strategy_effectiveness BETWEEN 1 AND 10),
  notes TEXT,
  created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
  updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- Create indexes for faster lookups
CREATE INDEX IF NOT EXISTS fatigue_tracking_user_id_idx ON public.fatigue_tracking(user_id);
CREATE INDEX IF NOT EXISTS fatigue_tracking_date_idx ON public.fatigue_tracking(date);
CREATE INDEX IF NOT EXISTS anti_fatigue_strategies_fatigue_type_idx ON public.anti_fatigue_strategies(fatigue_type);
CREATE INDEX IF NOT EXISTS anti_fatigue_strategies_application_context_idx ON public.anti_fatigue_strategies USING GIN (application_context);
CREATE INDEX IF NOT EXISTS anti_fatigue_strategies_tags_idx ON public.anti_fatigue_strategies USING GIN (tags);

-- Set up Row Level Security for fatigue tracking
ALTER TABLE public.fatigue_tracking ENABLE ROW LEVEL SECURITY;

-- Create policies for fatigue tracking
-- Users can only view their own data
CREATE POLICY "Users can view their own fatigue tracking data" 
  ON public.fatigue_tracking
  FOR SELECT
  USING (auth.uid() = user_id);

-- Users can insert their own data
CREATE POLICY "Users can insert their own fatigue tracking data" 
  ON public.fatigue_tracking
  FOR INSERT
  WITH CHECK (auth.uid() = user_id);

-- Users can update their own data
CREATE POLICY "Users can update their own fatigue tracking data" 
  ON public.fatigue_tracking
  FOR UPDATE
  USING (auth.uid() = user_id);

-- Users can delete their own data
CREATE POLICY "Users can delete their own fatigue tracking data" 
  ON public.fatigue_tracking
  FOR DELETE
  USING (auth.uid() = user_id);

-- Make anti-fatigue strategies readable by all users
ALTER TABLE public.anti_fatigue_strategies ENABLE ROW LEVEL SECURITY;
CREATE POLICY "Anti-fatigue strategies are viewable by all users" 
  ON public.anti_fatigue_strategies
  FOR SELECT
  USING (true);

-- Create a function for updating updated_at
CREATE OR REPLACE FUNCTION public.set_updated_at()
RETURNS TRIGGER AS $$
BEGIN
  NEW.updated_at = NOW();
  RETURN NEW;
END;
$$ LANGUAGE plpgsql;

-- Create triggers for updating updated_at
CREATE TRIGGER set_fatigue_tracking_updated_at
BEFORE UPDATE ON public.fatigue_tracking
FOR EACH ROW
EXECUTE FUNCTION public.set_updated_at();

CREATE TRIGGER set_anti_fatigue_strategies_updated_at
BEFORE UPDATE ON public.anti_fatigue_strategies
FOR EACH ROW
EXECUTE FUNCTION public.set_updated_at();

-- Insert some initial anti-fatigue strategies
INSERT INTO public.anti_fatigue_strategies 
  (name, description, instructions, fatigue_type, application_context, duration_minutes, effectiveness_rating, scientific_basis, contraindications, adhd_specific, tags)
VALUES
  (
    'Micro-Break Protocol', 
    'Strategic short breaks to prevent mental fatigue and maintain productivity.', 
    'Take a 2-minute break every 25 minutes of focused work. During the break, look away from screens, move your body, and change your environment briefly.', 
    'mental', 
    ARRAY['work', 'study', 'computer work'], 
    2, 
    4.5, 
    'Research shows that short, frequent breaks help prevent cognitive fatigue more effectively than longer, less frequent breaks.', 
    'Not recommended during flow states when interruption would be counterproductive.', 
    true, 
    ARRAY['productivity', 'cognitive', 'quick', 'workspace']
  ),
  (
    'Sensory Reset', 
    'A technique to reduce sensory overload and fatigue by temporarily limiting sensory input.', 
    'Find a quiet space, close your eyes, and use noise-cancelling headphones or earplugs for 5-10 minutes. Focus only on your breathing to give your sensory systems a chance to reset.', 
    'sensory', 
    ARRAY['work', 'social', 'public places', 'home'], 
    10, 
    4.2, 
    'Sensory overload is common in ADHD and can significantly contribute to fatigue. Temporary sensory deprivation allows the brain to recover.', 
    'Not recommended for those with claustrophobia or anxiety triggered by sensory deprivation.', 
    true, 
    ARRAY['sensory', 'overstimulation', 'adhd-specific', 'calming']
  ),
  (
    'Dopamine Reset Walk', 
    'A short, brisk walk designed to boost dopamine levels and reduce mental fatigue.', 
    'Take a 10-minute walk at a brisk pace, preferably outdoors in nature. Focus on your surroundings, noticing colors, sounds, and textures. Swing your arms deliberately to increase cross-body movement.', 
    'mental', 
    ARRAY['work', 'study', 'home', 'office'], 
    10, 
    4.7, 
    'Physical activity increases dopamine production, which is often lower in people with ADHD and can help improve mental energy and focus.', 
    'Modify for mobility limitations or inclement weather.', 
    true, 
    ARRAY['physical', 'nature', 'dopamine', 'exercise']
  ),
  (
    'Contrast Therapy', 
    'Using temperature contrasts to reduce physical fatigue and increase alertness.', 
    'End your shower with 30 seconds of cold water, focusing on the back of your neck and upper back. Alternatively, wash your face and wrists with cold water for 30 seconds.', 
    'physical', 
    ARRAY['home', 'gym', 'morning routine', 'afternoon slump'], 
    1, 
    4.0, 
    'Cold exposure activates the sympathetic nervous system, increases circulation, and can boost alertness and energy levels.', 
    'Not recommended for those with certain heart conditions or Raynaud's disease.', 
    false, 
    ARRAY['physical', 'quick', 'morning', 'alertness']
  ),
  (
    'Brain-Friendly Snack Break', 
    'Strategic nutritional intervention to stabilize blood sugar and provide brain fuel.', 
    'Take a 5-minute break to consume a balanced snack with protein, healthy fat, and complex carbohydrates. Examples: apple with almond butter, greek yogurt with berries, or hummus with vegetables.', 
    'mental', 
    ARRAY['work', 'study', 'afternoon slump', 'morning'], 
    5, 
    4.3, 
    'Blood sugar fluctuations can significantly impact cognitive function and energy levels, especially in those with ADHD.', 
    'Consider individual dietary restrictions and allergies.', 
    true, 
    ARRAY['nutrition', 'blood sugar', 'brain food', 'energy']
  ),
  (
    'Power Nap Protocol', 
    'A structured short nap designed to reduce fatigue without causing sleep inertia.', 
    'Find a quiet space and set an alarm for 20 minutes. Use an eye mask and earbuds with white noise if available. Focus on relaxing your body from head to toe until you drift off.', 
    'physical', 
    ARRAY['home', 'office with nap space', 'afternoon slump'], 
    20, 
    4.8, 
    'Research shows that naps under 30 minutes can improve alertness, cognitive performance, and mood without causing significant sleep inertia.', 
    'Not recommended within 6 hours of bedtime as it may disrupt nighttime sleep.', 
    false, 
    ARRAY['sleep', 'restoration', 'afternoon', 'cognitive']
  ),
  (
    'Emotional Fatigue Reset', 
    'A brief mindfulness practice to address emotional exhaustion and overwhelm.', 
    'Sit quietly for 5 minutes and practice the "Name it to tame it" technique. Identify and label your emotions without judgment, then take three deep breaths for each emotion identified.', 
    'emotional', 
    ARRAY['work', 'social', 'conflicts', 'decision fatigue'], 
    5, 
    4.1, 
    'Labeling emotions reduces amygdala activity and can help manage emotional fatigue, which is often heightened in ADHD due to emotional dysregulation.', 
    'May need adaptation for those with alexithymia or difficulty identifying emotions.', 
    true, 
    ARRAY['emotional', 'mindfulness', 'regulation', 'self-awareness']
  ),
  (
    'Body Scan Energizer', 
    'A progressive body awareness technique that identifies and releases tension to reduce fatigue.', 
    'Sitting or lying down, spend 10 minutes systematically scanning through your body, starting at your feet and moving upward. At each point of tension, consciously relax the muscles while taking a deep breath.', 
    'physical', 
    ARRAY['home', 'office', 'before meetings', 'end of day'], 
    10, 
    3.9, 
    'Physical tension significantly contributes to fatigue. Systematic relaxation reduces muscle tension and the associated energy expenditure.', 
    'Practice in a quiet space where you won't be disturbed.', 
    false, 
    ARRAY['relaxation', 'tension', 'mindfulness', 'body-awareness']
  ),
  (
    'Task Switching Buffer', 
    'A technique to reduce the cognitive fatigue associated with transitioning between different types of tasks.', 
    'Before switching tasks, take a 3-minute buffer period: Write down the status of the current task, clear your workspace (physical or digital), take 3 deep breaths, and briefly preview the next task.', 
    'mental', 
    ARRAY['work', 'study', 'project management'], 
    3, 
    4.4, 
    'Task switching creates significant cognitive load, especially for those with ADHD. Structured transitions reduce this load and associated fatigue.', 
    'May need to be shortened in time-sensitive situations.', 
    true, 
    ARRAY['executive-function', 'transitions', 'adhd-specific', 'workflow']
  ),
  (
    'Digital Detox Moment', 
    'A brief but complete disconnection from digital devices to reduce information overload fatigue.', 
    'Put all digital devices in Do Not Disturb mode and place them out of sight for 15 minutes. Engage in a simple, non-digital activity like stretching, drawing, or looking out the window.', 
    'sensory', 
    ARRAY['work', 'home', 'evening', 'information overload'], 
    15, 
    4.6, 
    'Digital information processing creates significant cognitive load. Even brief breaks from digital stimuli allow the brain to process information and reduce fatigue.', 
    'Ensure you won't miss critical notifications; inform others if necessary.', 
    false, 
    ARRAY['digital', 'information-overload', 'attention-restoration', 'sensory']
  );

-- Create function to get anti-fatigue recommendations
CREATE OR REPLACE FUNCTION public.get_anti_fatigue_recommendations(
  p_fatigue_type VARCHAR(50),
  p_context TEXT,
  p_available_minutes INTEGER,
  p_adhd_specific BOOLEAN DEFAULT NULL
)
RETURNS TABLE (
  id UUID,
  name VARCHAR(255),
  description TEXT,
  instructions TEXT,
  fatigue_type VARCHAR(50),
  application_context TEXT[],
  duration_minutes INTEGER,
  effectiveness_rating DECIMAL(3,1),
  scientific_basis TEXT,
  contraindications TEXT,
  adhd_specific BOOLEAN,
  tags TEXT[]
) AS $$
BEGIN
  RETURN QUERY
  SELECT 
    s.id, s.name, s.description, s.instructions, 
    s.fatigue_type, s.application_context, s.duration_minutes, 
    s.effectiveness_rating, s.scientific_basis, s.contraindications, 
    s.adhd_specific, s.tags
  FROM 
    public.anti_fatigue_strategies s
  WHERE 
    s.fatigue_type = p_fatigue_type
    AND p_context = ANY(s.application_context)
    AND s.duration_minutes <= p_available_minutes
    AND (p_adhd_specific IS NULL OR s.adhd_specific = p_adhd_specific)
  ORDER BY 
    s.effectiveness_rating DESC,
    s.duration_minutes
  LIMIT 5;
END;
$$ LANGUAGE plpgsql SECURITY DEFINER;

-- Create function to get fatigue insights
CREATE OR REPLACE FUNCTION public.get_fatigue_insights(
  p_user_id UUID,
  p_days INTEGER DEFAULT 30
)
RETURNS TABLE (
  date_group DATE,
  avg_mental_fatigue NUMERIC(3,1),
  avg_physical_fatigue NUMERIC(3,1),
  avg_emotional_fatigue NUMERIC(3,1),
  avg_sensory_fatigue NUMERIC(3,1),
  common_contributors TEXT[],
  effective_strategies TEXT[]
) AS $$
BEGIN
  RETURN QUERY
  WITH fatigue_data AS (
    SELECT 
      DATE_TRUNC('day', ft.date)::DATE as date_group,
      AVG(ft.mental_fatigue) as avg_mental_fatigue,
      AVG(ft.physical_fatigue) as avg_physical_fatigue,
      AVG(ft.emotional_fatigue) as avg_emotional_fatigue,
      AVG(ft.sensory_fatigue) as avg_sensory_fatigue,
      ARRAY_AGG(DISTINCT UNNEST(ft.contributors)) FILTER (WHERE ft.contributors IS NOT NULL) as all_contributors,
      ARRAY_AGG(DISTINCT ft.strategy_used) FILTER (WHERE ft.strategy_used IS NOT NULL AND ft.strategy_effectiveness >= 7) as effective_strategy_ids
    FROM 
      public.fatigue_tracking ft
    WHERE 
      ft.user_id = p_user_id
      AND ft.date >= (CURRENT_DATE - (p_days || ' days')::INTERVAL)
    GROUP BY 
      date_group
  )
  SELECT 
    fd.date_group,
    ROUND(fd.avg_mental_fatigue, 1)::NUMERIC(3,1) as avg_mental_fatigue,
    ROUND(fd.avg_physical_fatigue, 1)::NUMERIC(3,1) as avg_physical_fatigue,
    ROUND(fd.avg_emotional_fatigue, 1)::NUMERIC(3,1) as avg_emotional_fatigue,
    ROUND(fd.avg_sensory_fatigue, 1)::NUMERIC(3,1) as avg_sensory_fatigue,
    fd.all_contributors as common_contributors,
    ARRAY(
      SELECT s.name 
      FROM public.anti_fatigue_strategies s 
      WHERE s.id = ANY(fd.effective_strategy_ids)
    ) as effective_strategies
  FROM 
    fatigue_data fd
  ORDER BY 
    fd.date_group;
END;
$$ LANGUAGE plpgsql SECURITY DEFINER; 