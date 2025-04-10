// Focus & ADHD Types
export interface TaskManagement {
  id: string;
  user_id: string;
  title: string;
  description?: string;
  priority: 'high' | 'medium' | 'low';
  energy_required: number;
  best_time_of_day: 'morning' | 'afternoon' | 'evening' | 'night';
  estimated_duration_minutes?: number;
  actual_duration_minutes?: number;
  status: 'pending' | 'in_progress' | 'completed' | 'deferred';
  due_date?: string;
  completed_at?: string;
  tags?: string[];
  created_at: string;
  updated_at: string;
}

export interface FocusTracking {
  id: string;
  user_id: string;
  session_type: 'pomodoro' | 'flow' | 'timeblock' | 'custom';
  task_id?: string;
  start_time: string;
  end_time?: string;
  planned_duration_minutes?: number;
  actual_duration_minutes?: number;
  interruptions_count: number;
  interruption_reasons?: string[];
  environment_factors: Record<string, any>;
  energy_level_before: number;
  energy_level_after: number;
  focus_quality: number;
  notes?: string;
  created_at: string;
}

// Sleep Types
export interface SleepSession {
  id: string;
  user_id: string;
  start_time: string;
  end_time?: string;
  total_duration_minutes?: number;
  sleep_quality: number;
  energy_level_next_day: number;
  notes?: string;
  created_at: string;
}

export interface SleepStage {
  id: string;
  session_id: string;
  stage_type: 'light' | 'deep' | 'rem' | 'awake';
  start_time: string;
  duration_minutes?: number;
  created_at: string;
}

export interface SleepEnvironment {
  id: string;
  session_id: string;
  temperature_celsius?: number;
  humidity_percent?: number;
  noise_level: 'silent' | 'quiet' | 'moderate' | 'loud';
  light_level: 'dark' | 'dim' | 'moderate' | 'bright';
  bed_comfort: number;
  air_quality: 'poor' | 'moderate' | 'good' | 'excellent';
  created_at: string;
}

// Nutrition Types
export interface FoodItem {
  id: string;
  name: string;
  brand?: string;
  serving_size: number;
  serving_unit: string;
  calories: number;
  protein_g: number;
  carbs_g: number;
  fat_g: number;
  fiber_g: number;
  sugar_g: number;
  sodium_mg: number;
  potassium_mg: number;
  vitamins: Record<string, number>;
  minerals: Record<string, number>;
  allergens?: string[];
  ingredients?: string[];
  barcode?: string;
  image_url?: string;
  created_at: string;
  updated_at: string;
}

export interface MealEntry {
  id: string;
  user_id: string;
  meal_type: 'breakfast' | 'lunch' | 'dinner' | 'snack';
  consumed_at: string;
  location?: string;
  hunger_level_before: number;
  fullness_after: number;
  mood_before?: string;
  mood_after?: string;
  energy_level_before: number;
  energy_level_after: number;
  social_context?: string[];
  photos?: string[];
  notes?: string;
  created_at: string;
}

export interface Supplement {
  id: string;
  name: string;
  brand?: string;
  category: 'vitamin' | 'mineral' | 'herb' | 'amino_acid' | 'protein' | 'other';
  form: 'pill' | 'capsule' | 'powder' | 'liquid' | 'gummy';
  serving_size: number;
  serving_unit: string;
  ingredients: Record<string, any>;
  benefits?: string[];
  warnings?: string[];
  third_party_tested: boolean;
  image_url?: string;
  created_at: string;
  updated_at: string;
}

// Stress Management Types
export interface StressTracking {
  id: string;
  user_id: string;
  stress_level: number;
  energy_impact: number;
  physical_symptoms?: string[];
  emotional_state?: string[];
  triggers?: string[];
  recorded_at: string;
  notes?: string;
  created_at: string;
}

export interface RelaxationSession {
  id: string;
  user_id: string;
  session_type: 'meditation' | 'breathing' | 'yoga' | 'nature' | 'music' | 'reading' | 'other';
  start_time: string;
  duration_minutes?: number;
  technique_used?: string;
  guided_by?: string;
  location?: string;
  environment_quality: number;
  effectiveness: number;
  notes?: string;
  created_at: string;
}

export interface BreathingPattern {
  id: string;
  name: string;
  description?: string;
  inhale_seconds: number;
  hold_seconds: number;
  exhale_seconds: number;
  repetitions: number;
  benefits?: string[];
  contraindications?: string[];
  created_at: string;
}

// Analytics Types
export interface StressAnalytics {
  id: string;
  user_id: string;
  date_recorded: string;
  average_stress_level: number;
  stress_triggers_frequency: Record<string, number>;
  coping_techniques_used?: string[];
  recovery_time_minutes?: number;
  relaxation_sessions_count: number;
  breathing_sessions_count: number;
  biometric_stress_indicators: Record<string, any>;
  energy_impact_avg: number;
  created_at: string;
}

export interface NutritionAnalytics {
  id: string;
  user_id: string;
  date_recorded: string;
  total_calories: number;
  macros: Record<string, number>;
  micros: Record<string, number>;
  water_intake_ml: number;
  meals_tracked: number;
  supplements_taken: number;
  energy_level_avg: number;
  mood_avg: number;
  hunger_patterns: Record<string, any>;
  created_at: string;
}

export interface SleepAnalytics {
  id: string;
  user_id: string;
  date_recorded: string;
  average_duration_minutes: number;
  average_quality: number;
  deep_sleep_percentage: number;
  rem_sleep_percentage: number;
  interruptions_count: number;
  sleep_debt_minutes: number;
  recovery_score: number;
  created_at: string;
}

// Utility Types
export type EnergyImpact = -5 | -4 | -3 | -2 | -1 | 0 | 1 | 2 | 3 | 4 | 5;
export type QualityRating = 1 | 2 | 3 | 4 | 5 | 6 | 7 | 8 | 9 | 10;
export type TimeOfDay = 'morning' | 'afternoon' | 'evening' | 'night';
export type AirQuality = 'poor' | 'moderate' | 'good' | 'excellent';
export type NoiseLevel = 'silent' | 'quiet' | 'moderate' | 'loud';
export type LightLevel = 'dark' | 'dim' | 'moderate' | 'bright';
export type Intensity = 'light' | 'moderate' | 'intense';

// Response Types
export interface AnalyticsResponse {
  stress: StressAnalytics;
  nutrition: NutritionAnalytics;
  sleep: SleepAnalytics;
  date: string;
}

export interface DailyEnergySummary {
  date: string;
  energy_level_morning: number;
  energy_level_afternoon: number;
  energy_level_evening: number;
  energy_level_night: number;
  average_energy: number;
  factors_affecting_energy: {
    sleep_quality: number;
    nutrition_score: number;
    stress_level: number;
    exercise_impact: number;
    focus_sessions: number;
  };
  recommendations: string[];
}
