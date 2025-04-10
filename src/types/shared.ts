/**
 * This file contains type definitions used throughout the easier-focus micro-frontend.
 * These types represent the data structures for focus sessions, tasks, and other entities.
 */

export interface FocusTask {
  id: string;
  user_id: string;
  title: string;
  completed: boolean;
  status: 'todo' | 'in_progress' | 'completed';
  description?: string;
}

export interface FocusSession {
  id: string;
  user_id: string;
  session_type: 'pomodoro' | 'deep';
  start_time: string;
  end_time: string;
  duration_minutes: number;
  focus_score: number;
  distractions_count: number;
  tasks_completed: number;
  tasks_total: number;
  notes?: string;
  date: string;
}

export interface FocusStats {
  id: string;
  user_id: string;
  date: string;
  total_focus_time: number;
  sessions_count: number;
  tasks_completed: number;
  distractions_count: number;
  focus_score: number;
}

export interface BlockedItem {
  id: string;
  type: "website" | "app";
  name: string;
  pattern: string;
  isActive: boolean;
  scheduleId?: string;
}

export interface BlockSchedule {
  id: string;
  name: string;
  startTime: string;
  endTime: string;
  days: string[];
  isActive: boolean;
}

export interface UserProfile {
  id: string;
  username?: string;
  email: string;
  avatar_url?: string;
  display_name?: string;
  created_at: string;
  updated_at: string;
  focus_preferences?: {
    defaultWorkDuration: number;
    defaultShortBreak: number;
    defaultLongBreak: number;
    intervalsBeforeLongBreak: number;
    autoStartBreaks: boolean;
    autoStartWork: boolean;
  };
}
