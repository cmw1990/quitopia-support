// Fitness Types
export interface WorkoutProgram {
  id: string;
  title: string;
  description?: string;
  difficulty: 'beginner' | 'intermediate' | 'advanced';
  duration_weeks?: number;
  category: 'strength' | 'cardio' | 'flexibility' | 'hybrid';
  tags?: string[];
  equipment_needed?: string[];
  created_at: string;
  updated_at: string;
}

export interface WorkoutSession {
  id: string;
  program_id?: string;
  user_id: string;
  title: string;
  planned_date?: string;
  completed_date?: string;
  duration_minutes?: number;
  calories_burned?: number;
  average_heart_rate?: number;
  max_heart_rate?: number;
  perceived_effort?: number;
  notes?: string;
  mood_before?: string;
  mood_after?: string;
  created_at: string;
  updated_at: string;
}

export interface ExerciseLibrary {
  id: string;
  name: string;
  description?: string;
  category: 'strength' | 'cardio' | 'flexibility' | 'balance' | 'sport_specific';
  difficulty: 'beginner' | 'intermediate' | 'advanced';
  muscle_groups?: string[];
  equipment_needed?: string[];
  video_url?: string;
  form_cues?: string[];
  common_mistakes?: string[];
  modifications?: string[];
  created_at: string;
  updated_at: string;
}

// Mental Health Types
export interface MindfulnessProgram {
  id: string;
  title: string;
  description?: string;
  category: 'meditation' | 'breathing' | 'stress_relief' | 'sleep' | 'focus';
  difficulty: 'beginner' | 'intermediate' | 'advanced';
  duration_days?: number;
  tags?: string[];
  created_at: string;
  updated_at: string;
}

export interface MoodEntry {
  id: string;
  user_id: string;
  mood_score: number;
  energy_level: number;
  anxiety_level: number;
  stress_level: number;
  emotions?: string[];
  activities?: string[];
  notes?: string;
  created_at: string;
}

export interface GratitudeEntry {
  id: string;
  user_id: string;
  entries: string[];
  category: 'people' | 'experiences' | 'things' | 'personal' | 'other';
  mood_before?: number;
  mood_after?: number;
  created_at: string;
}

// Social Types
export interface UserProfile {
  id: string;
  username?: string;
  display_name?: string;
  bio?: string;
  avatar_url?: string;
  timezone?: string;
  privacy_settings: {
    profile: 'public' | 'friends' | 'private';
    activities: 'public' | 'friends' | 'private';
    stats: 'public' | 'friends' | 'private';
  };
  created_at: string;
  updated_at: string;
}

export interface ActivityFeed {
  id: string;
  user_id: string;
  activity_type: 
    | 'workout_completed'
    | 'goal_achieved'
    | 'streak_milestone'
    | 'badge_earned'
    | 'meditation_completed'
    | 'mood_logged'
    | 'gratitude_shared'
    | 'challenge_joined'
    | 'challenge_completed';
  content: Record<string, any>;
  visibility: 'public' | 'friends' | 'private';
  likes_count: number;
  comments_count: number;
  created_at: string;
}

export interface Challenge {
  id: string;
  title: string;
  description?: string;
  category: 'fitness' | 'mindfulness' | 'nutrition' | 'sleep' | 'social';
  start_date?: string;
  end_date?: string;
  requirements: Record<string, any>;
  rewards: Record<string, any>;
  max_participants?: number;
  current_participants: number;
  status: 'upcoming' | 'active' | 'completed' | 'cancelled';
  created_at: string;
  updated_at: string;
}

export interface Achievement {
  id: string;
  title: string;
  description?: string;
  category: 'fitness' | 'mindfulness' | 'nutrition' | 'sleep' | 'social';
  icon_url?: string;
  requirements: Record<string, any>;
  points: number;
  created_at: string;
}

// Utility Types
export type PrivacyLevel = 'public' | 'friends' | 'private';
export type DifficultyLevel = 'beginner' | 'intermediate' | 'advanced';
export type ChallengeStatus = 'upcoming' | 'active' | 'completed' | 'cancelled';
export type ActivityCategory = 'fitness' | 'mindfulness' | 'nutrition' | 'sleep' | 'social';

// Database Response Types
export interface DatabaseResponse<T> {
  data: T | null;
  error: Error | null;
}

export interface PaginatedResponse<T> {
  data: T[];
  count: number;
  error: Error | null;
}
