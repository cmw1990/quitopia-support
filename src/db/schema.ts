/**
 * Mission Fresh Database Schema
 * 
 * This file defines the database schema for the Mission Fresh app,
 * which includes tables for tracking quitting progress, settings,
 * cravings, energy levels, mood, and more.
 */

// Mock supabase client for the micro-frontend
const supabase = {
  from: (table: string) => ({
    select: () => ({
      limit: () => ({ data: [], error: null }),
      data: [],
      error: null
    }),
    insert: () => ({ data: [], error: null }),
    update: () => ({ data: [], error: null }),
    delete: () => ({ data: [], error: null }),
  })
};

// Nicotine product types
export type NicotineProduct = 'cigarettes' | 'vaping' | 'nicotine_pouches' | 'cigars' | 'pipe' | 'hookah' | 'chewing_tobacco' | 'multiple';

// Quitting method types
export type QuittingMethod = 'cold_turkey' | 'gradual_reduction' | 'nicotine_replacement' | 'scheduled_reduction' | 'cut_triggers' | 'delay_technique';

// Mood types
export type MoodType = 'very_negative' | 'negative' | 'neutral' | 'positive' | 'very_positive';

// Craving intensity
export type CravingIntensity = 'mild' | 'moderate' | 'severe' | 'overwhelming';

// Trigger types
export type TriggerType = 'stress' | 'boredom' | 'social' | 'after_meal' | 'alcohol' | 'coffee' | 'driving' | 'break_time' | 'emotion' | 'other';

// Energy level (1-10)
export type EnergyLevel = 1 | 2 | 3 | 4 | 5 | 6 | 7 | 8 | 9 | 10;

/**
 * Database Tables
 */

// Settings table - stores user preferences and quitting method
export interface QuitSmokingSettings {
  id: string;
  user_id: string;
  created_at: string;
  
  // Basic info
  nicotine_product: NicotineProduct;
  secondary_products: NicotineProduct[];
  quitting_method: QuittingMethod;
  quit_date: string;
  
  // Product-specific consumption
  daily_cigarettes: number;
  cost_per_pack: number;
  cigarettes_per_pack: number;
  
  // Vaping specifics
  vaping_ml_per_day: number;
  vaping_cost_per_ml: number;
  vaping_nicotine_strength: number;
  
  // Pouches specifics
  pouches_per_day: number;
  pouches_cost_per_tin: number;
  pouches_per_tin: number;
  
  // Other tobacco
  other_cost_per_week: number;
  other_consumption_per_day: number;
  
  // Reduction goals (for gradual methods)
  reduction_goal_percent: number;
  reduction_timeline_days: number;
  replacement_product: string;
  
  // Notification settings
  notification_enabled: boolean;
  reminder_time: string;
  track_triggers: boolean;
  track_mood: boolean;
  track_energy: boolean;
}

// Progress table - tracks daily progress
export interface QuitSmokingProgress {
  id: string;
  user_id: string;
  date: string;
  cravings: number;
  cigarettes_avoided: number;
  energy_level: EnergyLevel;
  mood_score: MoodType;
  notes: string;
  
  // Physical symptoms
  withdrawal_symptoms: string[];
  symptom_intensity: number;
  
  // Quitting method specific
  reduction_achieved_percent?: number; // For gradual reduction
  delay_time_achieved_minutes?: number; // For delay technique
  replacement_product_used?: boolean; // For NRT
  replacement_product_amount?: number; // For NRT
  triggers_avoided?: number; // For cut triggers
}

// Stats table - stores accumulated statistics
export interface QuitSmokingStats {
  id: string;
  user_id: string;
  updated_at: string;
  days_smoke_free: number;
  cigarettes_avoided: number;
  money_saved: number;
  streak_days: number;
  longest_streak: number;
  health_improvements: string[];
  withdrawal_stage: string;
  quit_progress_percent: number;
}

// Cravings table - detailed craving tracking
export interface QuitSmokingCraving {
  id: string;
  user_id: string;
  timestamp: string;
  intensity: CravingIntensity;
  duration_minutes: number;
  trigger: TriggerType;
  location: string;
  activity: string;
  social_context: string;
  handled_successfully: boolean;
  coping_strategy_used: string;
  notes: string;
}

// Energy tracking - detailed energy level tracking
export interface QuitSmokingEnergy {
  id: string;
  user_id: string;
  timestamp: string;
  energy_level: EnergyLevel;
  time_of_day: 'morning' | 'afternoon' | 'evening' | 'night';
  caffeine_consumed: boolean;
  caffeine_amount_mg: number;
  physical_activity: boolean;
  sleep_hours: number;
  notes: string;
}

// Mood tracking - detailed mood tracking
export interface QuitSmokingMood {
  id: string;
  user_id: string;
  timestamp: string;
  mood: MoodType;
  trigger: string;
  duration_hours: number;
  intensity: number;
  notes: string;
  coping_strategies: string[];
}

// Quit plan - detailed quit plan
export interface QuitSmokingPlan {
  id: string;
  user_id: string;
  created_at: string;
  quitting_method: QuittingMethod;
  start_date: string;
  target_quit_date: string;
  milestones: {
    date: string;
    goal: string;
    achieved: boolean;
  }[];
  coping_strategies: string[];
  support_network: string[];
  motivations: string[];
  reward_system: {
    milestone: string;
    reward: string;
  }[];
}

// Relapse tracking - for when users slip
export interface QuitSmokingRelapse {
  id: string;
  user_id: string;
  timestamp: string;
  amount_consumed: number;
  trigger: TriggerType;
  emotion_before: MoodType;
  emotion_after: MoodType;
  location: string;
  social_context: string;
  notes: string;
  lessons_learned: string;
}

// Guide content - monetizable comprehensive guides
export interface QuitSmokingGuide {
  id: string;
  title: string;
  method: QuittingMethod;
  content_preview: string;
  content_full: string;
  is_premium: boolean;
  author: string;
  published_date: string;
  categories: string[];
  featured_image_url: string;
  video_url?: string;
  resources: {
    title: string;
    url: string;
    type: 'article' | 'video' | 'pdf' | 'link';
  }[];
  success_stories: {
    name: string;
    age: number;
    profession: string;
    years_smoking: number;
    quit_date: string;
    testimonial: string;
    challenges: string;
    success_factors: string;
  }[];
}

// Note: Database initialization functions have been removed for the micro-frontend
// as they will be handled by the main application 