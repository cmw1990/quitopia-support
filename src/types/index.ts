import { Json } from '@/integrations/supabase/types';

export interface UserPreference {
  id: string;
  user_id: string | null;
  created_at: string | null;
  updated_at: string | null;
  theme: 'light' | 'dark' | 'system';
  notifications_enabled: boolean;
  email_notifications: boolean;
  interaction_history: Json | null;
  preferred_categories: string[] | null;
  preferred_product_types: string[] | null;
}

export interface UserSettings extends UserPreference {
  feature_preferences: Json | null;
  layout_preference: Json | null;
  notification_settings: Json | null;
  theme_preference: string | null;
}

export interface Activity {
  id: string;
  user_id: string;
  type: string;
  start_time: string;
  end_time: string | null;
  duration: number | null;
  metrics: Json;
  notes: string | null;
  created_at: string;
  updated_at: string;
}

export interface EnergyMetric {
  id: string;
  user_id: string;
  timestamp: string;
  energy_level: number;
  focus_level: number;
  stress_level: number;
  mood: string;
  notes: string | null;
  created_at: string;
  updated_at: string;
}

export interface SleepData {
  id: string;
  user_id: string;
  date: string;
  start_time: string;
  end_time: string;
  duration: number;
  quality: number;
  deep_sleep: number;
  rem_sleep: number;
  light_sleep: number;
  awake_time: number;
  notes: string | null;
  created_at: string;
  updated_at: string;
}

export interface ExerciseData {
  id: string;
  user_id: string;
  type: string;
  start_time: string;
  end_time: string;
  duration: number;
  calories_burned: number;
  heart_rate_avg: number;
  heart_rate_max: number;
  intensity: 'low' | 'medium' | 'high';
  notes: string | null;
  created_at: string;
  updated_at: string;
}
