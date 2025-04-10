-- Create the ADHD symptom tracker table
CREATE TABLE IF NOT EXISTS public.adhd_symptom_tracker (
  id UUID DEFAULT gen_random_uuid() PRIMARY KEY,
  user_id UUID NOT NULL REFERENCES auth.users(id) ON DELETE CASCADE,
  date TIMESTAMP WITH TIME ZONE NOT NULL,
  attention INTEGER NOT NULL CHECK (attention BETWEEN 1 AND 10),
  hyperactivity INTEGER NOT NULL CHECK (hyperactivity BETWEEN 1 AND 10),
  impulsivity INTEGER NOT NULL CHECK (impulsivity BETWEEN 1 AND 10),
  organization INTEGER NOT NULL CHECK (organization BETWEEN 1 AND 10),
  emotional_regulation INTEGER NOT NULL CHECK (emotional_regulation BETWEEN 1 AND 10),
  time_management INTEGER NOT NULL CHECK (time_management BETWEEN 1 AND 10),
  motivation INTEGER NOT NULL CHECK (motivation BETWEEN 1 AND 10),
  notes TEXT,
  factors TEXT[] DEFAULT '{}',
  created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
  updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- Create an index on user_id and date for faster lookups
CREATE INDEX IF NOT EXISTS adhd_symptom_tracker_user_id_idx ON public.adhd_symptom_tracker(user_id);
CREATE INDEX IF NOT EXISTS adhd_symptom_tracker_date_idx ON public.adhd_symptom_tracker(date);
CREATE UNIQUE INDEX IF NOT EXISTS adhd_symptom_tracker_user_id_date_idx ON public.adhd_symptom_tracker(user_id, date::date);

-- Set up Row Level Security
ALTER TABLE public.adhd_symptom_tracker ENABLE ROW LEVEL SECURITY;

-- Create policies
-- Users can only view their own data
CREATE POLICY "Users can view their own symptom entries" 
  ON public.adhd_symptom_tracker
  FOR SELECT
  USING (auth.uid() = user_id);

-- Users can insert their own data
CREATE POLICY "Users can insert their own symptom entries" 
  ON public.adhd_symptom_tracker
  FOR INSERT
  WITH CHECK (auth.uid() = user_id);

-- Users can update their own data
CREATE POLICY "Users can update their own symptom entries" 
  ON public.adhd_symptom_tracker
  FOR UPDATE
  USING (auth.uid() = user_id);

-- Users can delete their own data
CREATE POLICY "Users can delete their own symptom entries" 
  ON public.adhd_symptom_tracker
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
CREATE TRIGGER set_adhd_symptom_tracker_updated_at
BEFORE UPDATE ON public.adhd_symptom_tracker
FOR EACH ROW
EXECUTE FUNCTION public.set_updated_at(); 