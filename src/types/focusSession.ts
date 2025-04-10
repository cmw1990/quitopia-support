export interface FocusSession {
  id: string; // UUID
  user_id: string; // UUID of the user
  created_at: string; // ISO 8601 timestamp
  updated_at: string; // ISO 8601 timestamp
  start_time: string; // ISO 8601 timestamp
  end_time: string | null; // ISO 8601 timestamp, null if ongoing
  planned_duration_seconds: number;
  actual_duration_seconds: number | null;
  status: 'planned' | 'active' | 'paused' | 'completed' | 'cancelled';
  technique: string; // e.g., 'pomodoro', 'deep_work', 'custom'
  task_associations: string[] | null; // Array of task IDs associated with the session
  distractions_logged: number;
  mood_before: string | null;
  mood_after: string | null;
  energy_level_before: number | null; // e.g., scale of 1-5
  energy_level_after: number | null; // e.g., scale of 1-5
  notes: string | null;
  environment: Record<string, any> | null; // e.g., { location: 'office', soundscape: 'rain' }
}

export interface CreateFocusSessionDto extends Omit<FocusSession, 'id' | 'user_id' | 'created_at' | 'updated_at' | 'actual_duration_seconds' | 'status' | 'end_time' | 'distractions_logged' | 'mood_after' | 'energy_level_after'> {
  // Add any specific fields needed only for creation if different from the main interface
}

export interface UpdateFocusSessionDto extends Partial<Omit<FocusSession, 'id' | 'user_id' | 'created_at'>> {
  // Fields that can be updated, like status, end_time, actual_duration, notes etc.
} 