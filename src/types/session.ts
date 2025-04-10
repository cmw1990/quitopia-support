// src/types/session.ts

// Define TimerMode here as it's closely related and wasn't extracted separately
export type TimerMode = 'focus' | 'shortBreak' | 'longBreak';

export interface Session {
  id: string;
  user_id: string;
  task_id?: string | null;
  start_time: string;
  end_time?: string | null;
  duration_seconds?: number; // Calculated duration in seconds
  status: 'active' | 'completed' | 'cancelled' | 'skipped'; // Added 'skipped'
  initial_mode: TimerMode;
  notes?: string | null;
  focus_quality_rating?: number | null; // User rating (1-5) for focus sessions
  created_at?: string; // Managed by DB
  updated_at?: string; // Managed by DB
  completed?: boolean; // Add completed field if used by timer logic
}

// You might need to define TimerMode here or import if extracted elsewhere
// For now, let's assume TimerMode is defined/imported correctly.
// If TimerMode is not extracted, define it here:
// export type TimerMode = 'focus' | 'shortBreak' | 'longBreak';