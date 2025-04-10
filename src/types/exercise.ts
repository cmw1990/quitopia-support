export type ExerciseDifficulty = 'beginner' | 'intermediate' | 'advanced';

export type ExerciseCategory = {
  id: string;
  name: string;
  slug: string;
  description: string;
  icon_url?: string;
  target_audience: string[];
  benefits: string[];
  created_at: string;
  updated_at: string;
};

export type ExerciseType = {
  id: string;
  category_id: string;
  name: string;
  slug: string;
  description: string;
  difficulty_level: ExerciseDifficulty;
  duration_range: [number, number];
  equipment_needed: string[];
  space_required: string;
  is_outdoor: boolean;
  created_at: string;
  updated_at: string;
};

export interface Exercise {
  id: string;
  type_id: string;
  name: string;
  slug: string;
  description: string;
  difficulty: ExerciseDifficulty;
  duration: number;
  calories_burned: number;
  equipment_needed: string[];
  space_required: string;
  target_muscles: string[];
  benefits: string[];
  contraindications: string[];
  preparation_steps: string[];
  execution_steps: string[];
  common_mistakes: string[];
  safety_tips: string[];
  variations: string[];
  progression_path: string[];
  animation_url?: string;
  video_url?: string;
  image_urls?: string[];
  created_at: string;
  updated_at: string;
}

export interface ExerciseStep {
  id: string;
  exercise_id: string;
  step_number: number;
  instruction: string;
  duration: number;
  animation_url?: string;
  video_url?: string;
  image_url?: string;
  audio_url?: string;
  tips?: string[];
  created_at: string;
  updated_at: string;
}

export interface ExerciseGuide {
  id: string;
  exercise_id: string;
  title: string;
  content: string;
  difficulty_level: ExerciseDifficulty;
  estimated_reading_time: number;
  media_urls: string[];
  tags: string[];
  created_at: string;
  updated_at: string;
}

export interface ExerciseProgram {
  id: string;
  name: string;
  slug: string;
  description: string;
  target_audience: string[];
  duration_weeks: number;
  difficulty_level: ExerciseDifficulty;
  goals: string[];
  prerequisites: string[];
  equipment_needed: string[];
  created_at: string;
  updated_at: string;
}

export interface ProgramExercise {
  id: string;
  program_id: string;
  exercise_id: string;
  week_number: number;
  day_number: number;
  sets: number;
  reps: number;
  duration_minutes: number;
  rest_between_sets: number;
  notes?: string;
  created_at: string;
  updated_at: string;
}

export interface UserExerciseProgress {
  id: string;
  user_id: string;
  exercise_id: string;
  program_id?: string;
  start_time: string;
  end_time?: string;
  duration_minutes: number;
  sets_completed: number;
  reps_completed: number;
  difficulty_rating: number;
  energy_level_before: number;
  energy_level_after: number;
  mood_before: number;
  mood_after: number;
  focus_level_before: number;
  focus_level_after: number;
  stress_level_before: number;
  stress_level_after: number;
  creativity_level_before: number;
  creativity_level_after: number;
  notes?: string;
  created_at: string;
  updated_at: string;
}

export interface ExerciseAchievement {
  id: string;
  user_id: string;
  name: string;
  description: string;
  criteria: {
    type: 'streak' | 'completion' | 'improvement';
    exercise_category?: string;
    days?: number;
    sessions?: number;
    metric?: string;
    threshold?: number;
  };
  icon_url?: string;
  unlocked_at?: string;
  progress: number;
  created_at: string;
  updated_at: string;
}

export interface ExercisePreferences {
  id: string;
  user_id: string;
  preferred_duration_range: [number, number];
  preferred_difficulty_levels: ExerciseDifficulty[];
  preferred_exercise_types: string[];
  equipment_available: string[];
  space_available: string;
  health_conditions: string[];
  goals: string[];
  reminder_frequency: string;
  reminder_times: string[];
  created_at: string;
  updated_at: string;
}

export interface UserExerciseFavorite {
  id: string;
  user_id: string;
  exercise_id: string;
  created_at: string;
}

export interface ExerciseWithDetails extends Exercise {
  type: ExerciseType;
  category: ExerciseCategory;
  steps: ExerciseStep[];
  guides?: ExerciseGuide[];
  is_favorite?: boolean;
  user_progress?: UserExerciseProgress[];
}

export interface ExerciseAnalytics {
  user_id: string;
  exercise_id: string;
  week_start: string;
  total_sessions: number;
  total_minutes: number;
  avg_difficulty: number;
  energy_impact: number;
  mood_impact: number;
  focus_impact: number;
  stress_impact: number;
  creativity_impact: number;
}

export interface ExerciseRecommendation {
  exercise_id: string;
  score: number;
  reason: string;
  matching_preferences: string[];
  matching_goals: string[];
  previous_success_rate?: number;
}
