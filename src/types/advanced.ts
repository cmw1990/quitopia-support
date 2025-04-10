// Focus & ADHD Advanced Types
export interface SoundEnvironment {
  id: string;
  name: string;
  category: 'nature' | 'white_noise' | 'binaural_beats' | 'music' | 'ambient';
  frequency_hz?: number;
  recommended_duration_minutes?: number;
  energy_boost_rating: number;
  focus_enhancement_rating: number;
  audio_url?: string;
  created_at: string;
}

export interface VisualFocusTool {
  id: string;
  name: string;
  type: 'timer' | 'progress_bar' | 'growing_tree' | 'particle_system';
  visual_settings: Record<string, any>;
  animation_data: Record<string, any>;
  created_at: string;
}

export interface FocusReward {
  id: string;
  user_id: string;
  reward_type: 'tree_planted' | 'points_earned' | 'badge_unlocked' | 'streak_milestone';
  value: number;
  earned_at: string;
  session_id?: string;
  created_at: string;
}

export interface FocusZone {
  id: string;
  user_id: string;
  name: string;
  location?: string;
  environment_settings: Record<string, any>;
  productivity_rating: number;
  energy_impact: number;
  preferred_tasks?: string[];
  created_at: string;
  updated_at: string;
}

// Sleep Advanced Types
export interface SmartAlarm {
  id: string;
  user_id: string;
  target_wake_time: string;
  wake_window_minutes: number;
  days_active: ('monday' | 'tuesday' | 'wednesday' | 'thursday' | 'friday' | 'saturday' | 'sunday')[];
  smart_features: Record<string, any>;
  backup_alarm_time?: string;
  enabled: boolean;
  created_at: string;
  updated_at: string;
}

export interface SleepSound {
  id: string;
  name: string;
  category: 'nature' | 'white_noise' | 'meditation' | 'music' | 'story';
  duration_minutes?: number;
  volume_profile: Record<string, any>;
  fade_out_minutes?: number;
  popularity_score: number;
  audio_url?: string;
  created_at: string;
}

export interface ChronotypeAssessment {
  id: string;
  user_id: string;
  chronotype: 'lion' | 'bear' | 'wolf' | 'dolphin';
  energy_peak_times: Record<string, any>;
  recommended_sleep_schedule: Record<string, any>;
  lifestyle_recommendations: string[];
  assessment_date: string;
  created_at: string;
}

// Nutrition Advanced Types
export interface FoodRecognition {
  id: string;
  user_id: string;
  image_url: string;
  recognized_items: Record<string, any>;
  confidence_scores: Record<string, any>;
  nutritional_estimates: Record<string, any>;
  portion_sizes: Record<string, any>;
  created_at: string;
}

export interface SupplementStack {
  id: string;
  user_id: string;
  stack_name: string;
  purpose: 'energy' | 'focus' | 'sleep' | 'recovery' | 'immunity' | 'general_health';
  supplements: Record<string, any>;
  timing_schedule: Record<string, any>;
  interactions_checked: boolean;
  effectiveness_rating: number;
  side_effects?: string[];
  created_at: string;
  updated_at: string;
}

export interface FastingSession {
  id: string;
  user_id: string;
  start_time: string;
  end_time?: string;
  fasting_type: '16/8' | '18/6' | '20/4' | '24' | '36' | 'custom';
  duration_hours: number;
  energy_levels: Record<string, any>;
  mood_tracking: Record<string, any>;
  physical_symptoms?: string[];
  created_at: string;
}

// Stress & Recovery Advanced Types
export interface MeditationContent {
  id: string;
  title: string;
  category: 'stress_relief' | 'focus' | 'sleep' | 'anxiety' | 'energy' | 'motivation';
  duration_minutes?: number;
  difficulty: 'beginner' | 'intermediate' | 'advanced';
  guide_name?: string;
  audio_url?: string;
  background_sound_url?: string;
  transcript?: string;
  benefits?: string[];
  created_at: string;
}

export interface EmotionTracking {
  id: string;
  user_id: string;
  emotion_type: string;
  intensity: number;
  triggers?: string[];
  physical_sensations?: string[];
  coping_strategies_used?: string[];
  effectiveness_rating: number;
  energy_impact: number;
  recorded_at: string;
  created_at: string;
}

export interface BiofeedbackSession {
  id: string;
  user_id: string;
  session_type: 'hrv' | 'breathing' | 'temperature' | 'muscle_tension' | 'eeg';
  start_time: string;
  end_time?: string;
  measurements: Record<string, any>;
  baseline_values: Record<string, any>;
  improvements: Record<string, any>;
  notes?: string;
  created_at: string;
}

// Analytics & Insights Types
export interface EnergyRecovery {
  id: string;
  user_id: string;
  date_recorded: string;
  starting_energy: number;
  ending_energy: number;
  recovery_activities: Record<string, any>;
  sleep_quality: number;
  stress_level: number;
  nutrition_quality: number;
  recovery_score: number;
  created_at: string;
}

export interface FocusInsights {
  id: string;
  user_id: string;
  date_recorded: string;
  peak_focus_times: Record<string, any>;
  energy_patterns: Record<string, any>;
  productivity_score: number;
  focus_duration_minutes: number;
  distractions_analysis: Record<string, any>;
  recommendations: string[];
  created_at: string;
}

// Gamification Types
export interface RecoveryChallenge {
  id: string;
  title: string;
  description?: string;
  duration_days: number;
  activities: Record<string, any>;
  difficulty: 'beginner' | 'intermediate' | 'advanced';
  benefits?: string[];
  points_available: number;
  created_at: string;
}

export interface FocusStreak {
  id: string;
  user_id: string;
  streak_type: 'daily_focus' | 'task_completion' | 'productivity_score';
  current_streak: number;
  longest_streak: number;
  last_tracked_date?: string;
  rewards_earned: Record<string, any>;
  created_at: string;
  updated_at: string;
}

// Common Types
export type Difficulty = 'beginner' | 'intermediate' | 'advanced';
export type EnergyLevel = 1 | 2 | 3 | 4 | 5 | 6 | 7 | 8 | 9 | 10;
export type EnergyImpact = -5 | -4 | -3 | -2 | -1 | 0 | 1 | 2 | 3 | 4 | 5;
export type WeekDay = 'monday' | 'tuesday' | 'wednesday' | 'thursday' | 'friday' | 'saturday' | 'sunday';

// Response Types
export interface AdvancedAnalyticsResponse {
  focus: FocusInsights;
  energy: EnergyRecovery;
  date: string;
  recommendations: string[];
}

export interface GameProgressResponse {
  streaks: FocusStreak[];
  challenges: RecoveryChallenge[];
  rewards: FocusReward[];
  points: number;
  level: number;
}
