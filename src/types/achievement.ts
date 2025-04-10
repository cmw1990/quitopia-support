export interface AchievementDefinition {
  id: string; // Unique identifier for the achievement type (e.g., 'pomodoro_master_1')
  name: string;
  description: string; // Explains what needs to be done
  category: string; // e.g., 'Focus Sessions', 'Task Management', 'Consistency', 'Exploration'
  icon: string; // Icon identifier (e.g., from lucide-react or custom set)
  points_reward: number; // Points awarded upon unlock
  unlock_criteria: Record<string, any>; // Describes conditions, e.g., { type: 'session_count', target: 10, technique: 'pomodoro' }
  // Criteria checking logic would likely live outside this type definition
  is_secret: boolean; // Whether the achievement is hidden until unlocked
  created_at: string; // When the definition was created
}

export interface UserAchievement {
  id: string; // UUID of the user-achievement link row
  user_id: string; // UUID of the user
  achievement_id: string; // Corresponds to AchievementDefinition.id
  unlocked_at: string; // ISO 8601 timestamp when unlocked
  progress: number | null; // Current progress towards unlock (e.g., 5 out of 10 sessions)
  progress_total: number | null; // Target progress value
  // We might join with AchievementDefinition to get name, description etc. for display
}

// DTO for creating a definition (Admin)
export interface CreateAchievementDefinitionDto extends Omit<AchievementDefinition, 'id' | 'created_at'> {}

// DTO for unlocking/updating user progress (System/Backend likely triggers this)
export interface UpdateUserAchievementDto extends Partial<Pick<UserAchievement, 'progress' | 'unlocked_at'>> {
  // Requires user_id and achievement_id
}

// Combined type often useful for display components
export interface DisplayAchievement extends AchievementDefinition {
  unlocked_at: string | null; // Null if not unlocked
  progress?: number | null;
  progress_total?: number | null;
  is_unlocked: boolean;
} 