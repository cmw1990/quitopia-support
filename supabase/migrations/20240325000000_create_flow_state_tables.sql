-- Create tables for FlowState component
-- Following SSOT8001 guidelines - Tables end with '8'

-- Flow sessions table
CREATE TABLE IF NOT EXISTS public.flow_sessions8 (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id UUID REFERENCES auth.users(id) ON DELETE CASCADE,
  start_time TIMESTAMP WITH TIME ZONE NOT NULL,
  end_time TIMESTAMP WITH TIME ZONE,
  duration_minutes INTEGER NOT NULL,
  avg_focus_level NUMERIC(3,1) NOT NULL,
  avg_energy_level NUMERIC(3,1) NOT NULL,
  flow_time_minutes INTEGER NOT NULL,
  notes TEXT,
  created_at TIMESTAMP WITH TIME ZONE DEFAULT now() NOT NULL,
  updated_at TIMESTAMP WITH TIME ZONE DEFAULT now() NOT NULL
);

-- Enable RLS for flow_sessions8
ALTER TABLE public.flow_sessions8 ENABLE ROW LEVEL SECURITY;

-- Create RLS policies for flow_sessions8
CREATE POLICY "Users can insert their own flow sessions"
  ON public.flow_sessions8
  FOR INSERT
  WITH CHECK (auth.uid() = user_id);

CREATE POLICY "Users can view only their own flow sessions"
  ON public.flow_sessions8
  FOR SELECT
  USING (auth.uid() = user_id);

CREATE POLICY "Users can update only their own flow sessions"
  ON public.flow_sessions8
  FOR UPDATE
  USING (auth.uid() = user_id);

CREATE POLICY "Users can delete only their own flow sessions"
  ON public.flow_sessions8
  FOR DELETE
  USING (auth.uid() = user_id);

-- Distractions table
CREATE TABLE IF NOT EXISTS public.distractions8 (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id UUID REFERENCES auth.users(id) ON DELETE CASCADE,
  session_id UUID REFERENCES public.flow_sessions8(id) ON DELETE CASCADE,
  timestamp TIMESTAMP WITH TIME ZONE NOT NULL,
  type TEXT NOT NULL CHECK (type IN ('external', 'internal', 'tech', 'physical', 'social', 'manual')),
  notes TEXT,
  created_at TIMESTAMP WITH TIME ZONE DEFAULT now() NOT NULL,
  updated_at TIMESTAMP WITH TIME ZONE DEFAULT now() NOT NULL
);

-- Enable RLS for distractions8
ALTER TABLE public.distractions8 ENABLE ROW LEVEL SECURITY;

-- Create RLS policies for distractions8
CREATE POLICY "Users can insert their own distractions"
  ON public.distractions8
  FOR INSERT
  WITH CHECK (auth.uid() = user_id);

CREATE POLICY "Users can view only their own distractions"
  ON public.distractions8
  FOR SELECT
  USING (auth.uid() = user_id);

CREATE POLICY "Users can update only their own distractions"
  ON public.distractions8
  FOR UPDATE
  USING (auth.uid() = user_id);

CREATE POLICY "Users can delete only their own distractions"
  ON public.distractions8
  FOR DELETE
  USING (auth.uid() = user_id);

-- Flow states table (for tracking individual flow state data points)
CREATE TABLE IF NOT EXISTS public.flow_states8 (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id UUID REFERENCES auth.users(id) ON DELETE CASCADE,
  timestamp TIMESTAMP WITH TIME ZONE NOT NULL,
  focus_level NUMERIC(3,1) NOT NULL,
  energy_level NUMERIC(3,1) NOT NULL,
  is_flow BOOLEAN NOT NULL,
  notes TEXT,
  created_at TIMESTAMP WITH TIME ZONE DEFAULT now() NOT NULL,
  updated_at TIMESTAMP WITH TIME ZONE DEFAULT now() NOT NULL
);

-- Enable RLS for flow_states8
ALTER TABLE public.flow_states8 ENABLE ROW LEVEL SECURITY;

-- Create RLS policies for flow_states8
CREATE POLICY "Users can insert their own flow states"
  ON public.flow_states8
  FOR INSERT
  WITH CHECK (auth.uid() = user_id);

CREATE POLICY "Users can view only their own flow states"
  ON public.flow_states8
  FOR SELECT
  USING (auth.uid() = user_id);

CREATE POLICY "Users can update only their own flow states"
  ON public.flow_states8
  FOR UPDATE
  USING (auth.uid() = user_id);

CREATE POLICY "Users can delete only their own flow states"
  ON public.flow_states8
  FOR DELETE
  USING (auth.uid() = user_id);

-- Create user_stats8 table if it doesn't already exist
CREATE TABLE IF NOT EXISTS public.user_stats8 (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id UUID REFERENCES auth.users(id) ON DELETE CASCADE,
  key TEXT NOT NULL,
  value JSONB NOT NULL,
  created_at TIMESTAMP WITH TIME ZONE DEFAULT now() NOT NULL,
  updated_at TIMESTAMP WITH TIME ZONE DEFAULT now() NOT NULL,
  UNIQUE (user_id, key)
);

-- Enable RLS for user_stats8
ALTER TABLE public.user_stats8 ENABLE ROW LEVEL SECURITY;

-- Create RLS policies for user_stats8
CREATE POLICY "Users can insert their own stats"
  ON public.user_stats8
  FOR INSERT
  WITH CHECK (auth.uid() = user_id);

CREATE POLICY "Users can view only their own stats"
  ON public.user_stats8
  FOR SELECT
  USING (auth.uid() = user_id);

CREATE POLICY "Users can update only their own stats"
  ON public.user_stats8
  FOR UPDATE
  USING (auth.uid() = user_id);

CREATE POLICY "Users can delete only their own stats"
  ON public.user_stats8
  FOR DELETE
  USING (auth.uid() = user_id);

-- Create indices for performance
CREATE INDEX idx_flow_sessions_user_id ON public.flow_sessions8(user_id);
CREATE INDEX idx_flow_sessions_start_time ON public.flow_sessions8(start_time);
CREATE INDEX idx_distractions_user_id ON public.distractions8(user_id);
CREATE INDEX idx_distractions_session_id ON public.distractions8(session_id);
CREATE INDEX idx_flow_states_user_id ON public.flow_states8(user_id);
CREATE INDEX idx_flow_states_timestamp ON public.flow_states8(timestamp);
CREATE INDEX idx_user_stats_user_id_key ON public.user_stats8(user_id, key); 