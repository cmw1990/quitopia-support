// Removed import React

export type AchievementCriteriaType =
  | 'focus_sessions_completed'
  | 'focus_minutes_total'
  | 'tasks_completed'
  | 'days_logged_in_streak' // Example for future
  | 'specific_feature_used'; // Example for future

export interface Achievement {
    id: string; // Unique identifier (e.g., 'focus_session_10')
    name: string;
    description: string;
    icon: string; // Icon name (e.g., from lucide-react)
    criteria_type: AchievementCriteriaType;
    criteria_threshold: number;
    points?: number; // Optional points awarded
}

export interface UserAchievement {
  id: string; // Primary key for the join table row
  user_id: string;
  achievement_id: string; // Foreign key to achievements.id
  earned_at: string; // ISO timestamp
}

// Example of criteria logic (would be implemented elsewhere)
// criteriaType: 'task_completion_count' | 'pomodoro_session_count' | 'pomodoro_streak' | 'focus_time_total' | ...
// criteriaValue: number | string 