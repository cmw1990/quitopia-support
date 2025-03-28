import { ReactNode } from 'react';

// User and Authentication types
export interface User {
  id: string;
  email: string;
  profile?: UserProfile;
  created_at: string;
  updated_at: string;
}

export interface UserProfile {
  user_id: string;
  quit_date: string;
  daily_cigarettes: number;
  cigarettes_per_pack: number;
  price_per_pack: number;
  created_at: string;
  updated_at: string;
}

// Progress tracking types
export interface ProgressEntry {
  id: string;
  user_id: string;
  date: string;
  smoke_free: boolean;
  smoke_free_days: number;
  consumption: number;
  craving_intensity?: number;
  cravings_count?: number;
  health_score: number;
  energy_level?: number;
  focus_level?: number;
  mood_score?: number;
  water_intake?: number;
  exercise_duration?: number;
  sleep_duration?: number;
  sleep_quality?: number;
  stress_level?: number;
  money_saved?: number;
  notes?: string;
  created_at: string;
  updated_at: string;
}

export interface UserProgressResponse {
  userProfile?: UserProfile;
  progressEntries: ProgressEntry[];
  smokeFreeStreak: number;
  totalSavings: number;
  healthScore: number;
}

// Health tracking types
export interface HealthImprovement {
  id: string;
  title: string;
  description: string;
  timeline_hours: number;
  icon: string | ReactNode;
  achieved: boolean;
  achievement_date?: string;
  user_id?: string;
  milestone_date?: string;
  milestone_type?: string;
}

export interface HealthMetric {
  id: string;
  title: string;
  value: number;
  unit: string;
  icon: ReactNode;
  description: string;
  improvement: number;
}

export interface SavingsDetail {
  daily: number;
  weekly: number;
  monthly: number;
  yearly: number;
  total: number;
}

// Nicotine Product types
export interface NicotineProduct {
  id: string;
  name: string;
  brand: string;
  category: string;
  nicotine_strength: number;
  nicotine_type?: string;
  description?: string;
  image_url?: string;
  ingredients?: string[];
  warnings?: string[];
  chemical_concerns?: string[];
  price_range?: string;
  average_rating?: number;
  total_reviews?: number;
  gum_health_rating?: number;
  tags?: string[];
  flavors?: string[];
}

export interface VendorAvailability {
  vendor_id: string;
  vendor_name: string;
  in_stock: boolean;
  price: number;
  currency: string;
  url: string;
  shipping_countries: string[];
  shipping_regions: string[];
  delivery_estimate_days: [number, number];
  discount_code?: string;
  discount_percentage?: number;
}

// Nicotine Consumption types
export interface NicotineConsumptionLog {
  id?: string;
  user_id: string;
  consumption_date: string;
  product_type: string;
  brand?: string;
  variant?: string;
  nicotine_strength?: number;
  quantity: number;
  unit: string;
  trigger?: string;
  location?: string;
  mood?: string;
  intensity?: number;
  notes?: string;
  created_at?: string;
  updated_at?: string;
}

// Step tracking types
export interface StepData {
  id?: string;
  user_id: string;
  date: string;
  step_count: number;
  distance?: number;
  calories_burned?: number;
  source: string;
  created_at?: string;
}

export interface RewardData {
  id?: string;
  user_id: string;
  reward_type: string;
  reward_amount: number;
  date_earned: string;
  description: string;
  applied_to_subscription: boolean;
  expiration_date?: string;
}

// Trigger analysis types
export interface TriggerAnalysis {
  id?: string;
  user_id: string;
  date: string;
  trigger_category: string;
  trigger_details: string;
  intensity: number;
  coping_strategy_used?: string;
  coping_effectiveness?: number;
  notes?: string;
}

// Social sharing types
export interface SocialShareAnalytics {
  id?: string;
  user_id: string;
  share_date: string;
  platform: string;
  content_type: string;
  engagement_clicks?: number;
  engagement_likes?: number;
  engagement_shares?: number;
  conversion_signups?: number;
}

// Craving tracking types
export interface CravingLog {
  id: string;
  user_id: string;
  timestamp: string;
  intensity: number;
  trigger: string;
  location?: string;
  activity?: string;
  resisted: boolean;
  notes?: string | null;
  created_at: string;
  triggers?: string[];
}

// New health tracking types
export interface MoodLog {
  id: string;
  user_id: string;
  timestamp: string;
  mood_score: number;
  notes?: string | null;
  triggers?: string[];
  created_at: string;
}

export interface EnergyLog {
  id: string;
  user_id: string;
  timestamp: string;
  energy_level: number;
  notes?: string | null;
  triggers?: string[];
  created_at: string;
}

export interface FocusLog {
  id: string;
  user_id: string;
  timestamp: string;
  focus_level: number;
  duration_minutes?: number;
  notes?: string | null;
  created_at: string;
}

export interface SleepLog {
  id: string;
  user_id: string;
  timestamp: string;
  sleep_quality: number;
  duration_minutes?: number;
  notes?: string | null;
  created_at: string;
}

// Correlation data for health metrics
export interface CorrelationData {
  factor1: string;
  factor2: string;
  coefficient: number;
  interpretation: string;
  strength: 'strong' | 'moderate' | 'weak' | 'none';
}

// Health improvement milestone
export interface HealthMilestone {
  id: string;
  title: string;
  description: string;
  time_to_reach_hours: number;
  achieved: boolean;
  achievement_date?: string;
  icon?: string;
}

// User progress response from API
export interface UserProgressResponse {
  userId: string;
  startDate: string;
  endDate: string;
  healthScore: number;
  progressEntries: ProgressEntry[];
  healthMilestones: HealthMilestone[];
}

// Individual progress entry
export interface ProgressEntry {
  id: string;
  user_id: string;
  date: string;
  smoke_free_days: number;
  consumption: number;
  craving_intensity?: number;
  mood_score?: number;
  health_score: number;
  created_at: string;
}

// Device health integration
export interface HealthIntegration {
  type: 'apple_health' | 'google_fit' | 'fitbit' | 'garmin' | 'manual';
  connected: boolean;
  lastSynced?: string;
  metrics: string[];
}

// API response types
export interface ApiResponse<T> {
  data?: T;
  error?: {
    message: string;
    status: number;
  };
}

export interface PaginatedResponse<T> {
  data: T[];
  total: number;
  page: number;
  pageSize: number;
  totalPages: number;
}

// Product Category type
export interface ProductCategory {
  id: string;
  name: string;
  description?: string;
} 