// Well-Charged App Types
// All tables follow the "8" suffix naming convention as per SSOT

export interface SleepRecord8 {
  id: string;
  user_id: string;
  date: string;
  duration: number;
  quality: number;
  notes?: string;
  created_at: string;
  updated_at: string;
}

export interface ExerciseSession8 {
  id: string;
  user_id: string;
  type: string;
  duration: number;
  intensity: number;
  calories: number;
  notes?: string;
  created_at: string;
  updated_at: string;
}

export interface FocusSession8 {
  id: string;
  user_id: string;
  start_time: string;
  end_time: string;
  task: string;
  score: number;
  notes?: string;
  created_at: string;
  updated_at: string;
}

export interface MentalHealth8 {
  id: string;
  user_id: string;
  date: string;
  mood: number;
  anxiety_level: number;
  stress_level: number;
  meditation_minutes?: number;
  notes?: string;
  created_at: string;
  updated_at: string;
}

// Mental Health Types with "8" suffix
export interface MoodTracking8 {
  id: string;
  user_id: string;
  timestamp: string;
  mood_score: number;
  energy_level: number;
  activities: string[];
  triggers: string[];
  notes?: string;
  created_at: string;
  updated_at: string;
}

export interface AnxietyTracking8 {
  id: string;
  user_id: string;
  timestamp: string;
  anxiety_level: number;
  physical_symptoms: string[];
  triggers: string[];
  coping_strategies: string[];
  effectiveness_score: number;
  notes?: string;
  created_at: string;
  updated_at: string;
}

export interface DepressionMonitoring8 {
  id: string;
  user_id: string;
  timestamp: string;
  mood_score: number;
  sleep_quality: number;
  appetite_level: number;
  energy_level: number;
  social_interaction_level: number;
  activity_enjoyment: number;
  thoughts: string[];
  coping_strategies: string[];
  notes?: string;
  created_at: string;
  updated_at: string;
}

export interface OCDManagement8 {
  id: string;
  user_id: string;
  timestamp: string;
  trigger_type: string;
  obsession_intensity: number;
  compulsion_intensity: number;
  resistance_level: number;
  coping_strategies: string[];
  exposure_exercise?: string;
  success_rate: number;
  notes?: string;
  created_at: string;
  updated_at: string;
}

export interface MindfulnessSession8 {
  id: string;
  user_id: string;
  timestamp: string;
  session_type: 'meditation' | 'breathing' | 'body_scan' | 'visualization' | 'grounding';
  duration_minutes: number;
  focus_quality: number;
  calm_level_before: number;
  calm_level_after: number;
  notes?: string;
  created_at: string;
  updated_at: string;
}

export interface TherapyGoal8 {
  id: string;
  user_id: string;
  goal_type: 'mood' | 'anxiety' | 'depression' | 'ocd' | 'mindfulness' | 'general';
  title: string;
  description?: string;
  target_date?: string;
  progress: number;
  status: 'not_started' | 'in_progress' | 'completed' | 'on_hold';
  notes?: string;
  created_at: string;
  updated_at: string;
}

export interface CopingStrategy8 {
  id: string;
  user_id: string;
  strategy_name: string;
  category: 'mood' | 'anxiety' | 'depression' | 'ocd' | 'stress' | 'general';
  description?: string;
  effectiveness_score: number;
  usage_count: number;
  last_used?: string;
  notes?: string;
  created_at: string;
  updated_at: string;
}

// API Response Types
export interface ApiResponse<T> {
  data: T | null;
  error: Error | null;
}

// Common Types
export interface User {
  id: string;
  email: string;
  created_at: string;
}

export interface Error {
  message: string;
  status?: number;
}
