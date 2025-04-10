-- Create the emotion regulation tools table
CREATE TABLE IF NOT EXISTS public.emotion_regulation_tools (
  id UUID DEFAULT gen_random_uuid() PRIMARY KEY,
  name VARCHAR(255) NOT NULL,
  description TEXT NOT NULL,
  instructions TEXT NOT NULL,
  emotion_types TEXT[] NOT NULL,
  intensity_level VARCHAR(50) NOT NULL, -- mild, moderate, intense
  duration_minutes INTEGER NOT NULL,
  adhd_specific BOOLEAN DEFAULT FALSE,
  tags TEXT[],
  created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
  updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- Create the emotion tracking table
CREATE TABLE IF NOT EXISTS public.emotion_tracking (
  id UUID DEFAULT gen_random_uuid() PRIMARY KEY,
  user_id UUID NOT NULL REFERENCES auth.users(id) ON DELETE CASCADE,
  date TIMESTAMP WITH TIME ZONE NOT NULL,
  emotion VARCHAR(255) NOT NULL,
  intensity INTEGER NOT NULL CHECK (intensity BETWEEN 1 AND 10),
  trigger TEXT,
  notes TEXT,
  regulation_tool_id UUID REFERENCES public.emotion_regulation_tools(id),
  regulation_effectiveness INTEGER CHECK (regulation_effectiveness BETWEEN 1 AND 10),
  created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
  updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- Create indexes for faster lookups
CREATE INDEX IF NOT EXISTS emotion_tracking_user_id_idx ON public.emotion_tracking(user_id);
CREATE INDEX IF NOT EXISTS emotion_tracking_date_idx ON public.emotion_tracking(date);
CREATE INDEX IF NOT EXISTS emotion_tracking_emotion_idx ON public.emotion_tracking(emotion);
CREATE INDEX IF NOT EXISTS emotion_regulation_tools_emotion_types_idx ON public.emotion_regulation_tools USING GIN (emotion_types);
CREATE INDEX IF NOT EXISTS emotion_regulation_tools_tags_idx ON public.emotion_regulation_tools USING GIN (tags);

-- Set up Row Level Security for emotion tracking
ALTER TABLE public.emotion_tracking ENABLE ROW LEVEL SECURITY;

-- Create policies for emotion tracking
-- Users can only view their own data
CREATE POLICY "Users can view their own emotion tracking data" 
  ON public.emotion_tracking
  FOR SELECT
  USING (auth.uid() = user_id);

-- Users can insert their own data
CREATE POLICY "Users can insert their own emotion tracking data" 
  ON public.emotion_tracking
  FOR INSERT
  WITH CHECK (auth.uid() = user_id);

-- Users can update their own data
CREATE POLICY "Users can update their own emotion tracking data" 
  ON public.emotion_tracking
  FOR UPDATE
  USING (auth.uid() = user_id);

-- Users can delete their own data
CREATE POLICY "Users can delete their own emotion tracking data" 
  ON public.emotion_tracking
  FOR DELETE
  USING (auth.uid() = user_id);

-- Make emotion regulation tools readable by all users
ALTER TABLE public.emotion_regulation_tools ENABLE ROW LEVEL SECURITY;
CREATE POLICY "Emotion regulation tools are viewable by all users" 
  ON public.emotion_regulation_tools
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
CREATE TRIGGER set_emotion_tracking_updated_at
BEFORE UPDATE ON public.emotion_tracking
FOR EACH ROW
EXECUTE FUNCTION public.set_updated_at();

CREATE TRIGGER set_emotion_regulation_tools_updated_at
BEFORE UPDATE ON public.emotion_regulation_tools
FOR EACH ROW
EXECUTE FUNCTION public.set_updated_at();

-- Insert some initial emotion regulation tools
INSERT INTO public.emotion_regulation_tools 
  (name, description, instructions, emotion_types, intensity_level, duration_minutes, adhd_specific, tags)
VALUES
  (
    'Box Breathing', 
    'A simple breathing technique to calm your nervous system and reduce stress or anxiety.', 
    'Inhale for 4 counts, hold for 4 counts, exhale for 4 counts, and hold for 4 counts. Repeat for 5-10 cycles.', 
    ARRAY['anxiety', 'stress', 'overwhelm', 'frustration'], 
    'mild', 
    5, 
    false, 
    ARRAY['breathing', 'quick', 'discreet', 'beginner-friendly']
  ),
  (
    '5-4-3-2-1 Grounding', 
    'A mindfulness technique to ground yourself in the present moment when feeling overwhelmed or distracted.', 
    'Name 5 things you can see, 4 things you can touch, 3 things you can hear, 2 things you can smell, and 1 thing you can taste.', 
    ARRAY['anxiety', 'overwhelm', 'distraction', 'panic'], 
    'moderate', 
    3, 
    true, 
    ARRAY['grounding', 'mindfulness', 'sensory', 'adhd-friendly']
  ),
  (
    'Body Scan', 
    'A mindfulness practice to reduce tension and increase body awareness by systematically focusing on different parts of your body.', 
    'Starting at your toes, gradually bring awareness to each part of your body, noticing sensations without judgment. Slowly work your way up to the top of your head.', 
    ARRAY['stress', 'tension', 'restlessness', 'hyperactivity'], 
    'moderate', 
    10, 
    true, 
    ARRAY['mindfulness', 'relaxation', 'body-awareness', 'adhd-friendly']
  ),
  (
    'Emotion Labeling', 
    'Putting feelings into words to reduce their intensity and increase emotional awareness.', 
    'When experiencing a strong emotion, pause and simply name it: "I am feeling angry" or "This is anxiety." Be specific about the emotion and accept it without judgment.', 
    ARRAY['anger', 'frustration', 'sadness', 'confusion'], 
    'mild', 
    2, 
    true, 
    ARRAY['emotional-awareness', 'quick', 'executive-function', 'adhd-specific']
  ),
  (
    'Physical Movement Break', 
    'Quick physical activity to release excess energy, reduce restlessness, and improve focus.', 
    'Take a 5-minute break to do jumping jacks, push-ups, or a quick walk. Focus on the physical sensations and rhythmic movements.', 
    ARRAY['frustration', 'restlessness', 'boredom', 'hyperactivity'], 
    'intense', 
    5, 
    true, 
    ARRAY['physical', 'energy-release', 'adhd-specific', 'dopamine-boost']
  ),
  (
    'Thought Defusion', 
    'A technique to create distance between yourself and unhelpful thoughts by recognizing thoughts as just mental events, not facts.', 
    'When caught in negative thought patterns, try saying "I am having the thought that..." before the thought. Notice how this creates separation between you and the thought.', 
    ARRAY['anxiety', 'self-criticism', 'rumination', 'overwhelm'], 
    'moderate', 
    5, 
    true, 
    ARRAY['cognitive', 'mindfulness', 'adhd-friendly', 'self-compassion']
  ),
  (
    'Progressive Muscle Relaxation', 
    'Systematically tensing and releasing muscle groups to reduce physical tension and stress.', 
    'Starting with your feet, tense each muscle group for 5-10 seconds, then release and notice the sensation of relaxation. Work your way up through your body.', 
    ARRAY['stress', 'tension', 'anxiety', 'restlessness'], 
    'moderate', 
    15, 
    false, 
    ARRAY['relaxation', 'physical', 'stress-reduction', 'body-awareness']
  ),
  (
    'STOP Technique', 
    'A quick mindfulness practice to interrupt automatic reactions and create space for a more thoughtful response.', 
    'S: Stop what you are doing. T: Take a breath. O: Observe what is happening in your body, emotions, and thoughts. P: Proceed with awareness.', 
    ARRAY['impulsivity', 'anger', 'frustration', 'overwhelm'], 
    'mild', 
    1, 
    true, 
    ARRAY['impulse-control', 'quick', 'adhd-specific', 'emotional-regulation']
  ),
  (
    'Sensory Grounding Object', 
    'Using a physical object to anchor attention and provide sensory input when feeling overwhelmed or unfocused.', 
    'Keep a small object (like a smooth stone or fidget toy) in your pocket. When feeling distracted or overwhelmed, focus your attention on the physical sensations of the object.', 
    ARRAY['anxiety', 'distraction', 'overwhelm', 'restlessness'], 
    'mild', 
    5, 
    true, 
    ARRAY['sensory', 'grounding', 'adhd-specific', 'discreet']
  ),
  (
    'Visualization Safe Place', 
    'Creating a mental image of a peaceful, safe place to reduce stress and anxiety.', 
    'Close your eyes and imagine a place where you feel completely safe and calm. Use all your senses to make it vivid - what do you see, hear, smell, and feel in this place?', 
    ARRAY['anxiety', 'stress', 'fear', 'sadness'], 
    'moderate', 
    10, 
    false, 
    ARRAY['visualization', 'relaxation', 'self-soothing', 'mental-escape']
  );

-- Create function to get emotion regulation recommendations
CREATE OR REPLACE FUNCTION public.get_emotion_regulation_recommendations(
  p_emotion TEXT,
  p_intensity INTEGER,
  p_adhd_specific BOOLEAN DEFAULT NULL
)
RETURNS TABLE (
  id UUID,
  name VARCHAR(255),
  description TEXT,
  instructions TEXT,
  emotion_types TEXT[],
  intensity_level VARCHAR(50),
  duration_minutes INTEGER,
  adhd_specific BOOLEAN,
  tags TEXT[]
) AS $$
DECLARE
  intensity_cat VARCHAR(50);
BEGIN
  -- Determine intensity category
  IF p_intensity <= 3 THEN
    intensity_cat := 'mild';
  ELSIF p_intensity <= 7 THEN
    intensity_cat := 'moderate';
  ELSE
    intensity_cat := 'intense';
  END IF;
  
  RETURN QUERY
  SELECT 
    t.id, t.name, t.description, t.instructions, 
    t.emotion_types, t.intensity_level, t.duration_minutes, 
    t.adhd_specific, t.tags
  FROM 
    public.emotion_regulation_tools t
  WHERE 
    p_emotion = ANY(t.emotion_types)
    AND (p_adhd_specific IS NULL OR t.adhd_specific = p_adhd_specific)
  ORDER BY 
    -- Order first by matching intensity level
    CASE WHEN t.intensity_level = intensity_cat THEN 0
         WHEN (intensity_cat = 'intense' AND t.intensity_level = 'moderate') THEN 1
         WHEN (intensity_cat = 'moderate' AND t.intensity_level = 'mild') THEN 1
         WHEN (intensity_cat = 'moderate' AND t.intensity_level = 'intense') THEN 2
         WHEN (intensity_cat = 'mild' AND t.intensity_level = 'moderate') THEN 2
         ELSE 3
    END,
    -- Then by ADHD-specific if requested
    CASE WHEN p_adhd_specific IS TRUE AND t.adhd_specific IS TRUE THEN 0
         ELSE 1
    END,
    -- Then by duration (shorter first for acute situations)
    t.duration_minutes
  LIMIT 5;
END;
$$ LANGUAGE plpgsql SECURITY DEFINER; 