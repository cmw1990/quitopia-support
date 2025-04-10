import { Database } from './supabase';

// Memory Assessment Types
export interface MemoryAssessment {
  id: string;
  user_id: string;
  assessment_date: string;
  assessment_type: string;
  score: number;
  duration_seconds?: number;
  difficulty_level?: string;
  cognitive_areas?: {
    attention?: number;
    processing_speed?: number;
    working_memory?: number;
    long_term_memory?: number;
    visual_memory?: number;
    auditory_memory?: number;
  };
  performance_metrics?: {
    accuracy: number;
    response_time: number;
    completion_rate: number;
    error_rate: number;
  };
  created_at: string;
  updated_at: string;
}

// Memory Exercise Types
export interface MemoryExercise {
  id: string;
  user_id: string;
  exercise_type: string;
  difficulty_level: string;
  completed_at?: string;
  score?: number;
  duration_seconds?: number;
  mistakes_count?: number;
  performance_data?: {
    accuracy: number;
    speed: number;
    pattern_recognition: number;
    memory_retention: number;
    attention_score: number;
  };
  created_at: string;
  updated_at: string;
}

// Cognitive Progress Types
export interface CognitiveProgress {
  id: string;
  user_id: string;
  date: string;
  cognitive_area: string;
  baseline_score?: number;
  current_score?: number;
  improvement_percentage?: number;
  training_frequency?: number;
  recommendations?: {
    suggested_exercises: string[];
    difficulty_adjustment?: string;
    focus_areas: string[];
    next_assessment_date?: string;
  };
  created_at: string;
  updated_at: string;
}

// Memory Journal Types
export interface MemoryJournal {
  id: string;
  user_id: string;
  entry_date: string;
  title?: string;
  content?: string;
  mood?: string;
  tags?: string[];
  media_urls?: string[];
  location_data?: {
    name: string;
    coordinates: [number, number];
    address?: string;
  };
  is_private: boolean;
  created_at: string;
  updated_at: string;
}

// Care Contact Types
export interface CareContact {
  id: string;
  user_id: string;
  contact_name: string;
  relationship?: string;
  phone?: string;
  email?: string;
  is_emergency_contact: boolean;
  is_caregiver: boolean;
  notification_preferences?: {
    email_notifications: boolean;
    sms_notifications: boolean;
    app_notifications: boolean;
    notification_types: string[];
  };
  access_level?: string;
  created_at: string;
  updated_at: string;
}

// Routine Reminder Types
export interface RoutineReminder {
  id: string;
  user_id: string;
  title: string;
  description?: string;
  reminder_type?: string;
  frequency?: {
    type: 'daily' | 'weekly' | 'monthly' | 'custom';
    days?: number[];
    times?: string[];
    custom_pattern?: string;
  };
  priority?: string;
  status?: string;
  last_completed?: string;
  next_due?: string;
  notification_settings?: {
    advance_notice: number;
    repeat_times: number;
    methods: string[];
  };
  created_at: string;
  updated_at: string;
}

// Memory Album Types
export interface MemoryAlbum {
  id: string;
  user_id: string;
  title: string;
  description?: string;
  cover_image_url?: string;
  media_items?: {
    id: string;
    type: 'image' | 'video' | 'audio';
    url: string;
    caption?: string;
    tags?: string[];
    date_taken?: string;
    location?: {
      name: string;
      coordinates: [number, number];
    };
  }[];
  tags?: string[];
  shared_with?: string[];
  privacy_settings?: {
    visibility: 'private' | 'shared' | 'public';
    password_protected?: boolean;
    expiry_date?: string;
  };
  created_at: string;
  updated_at: string;
}

// Database Types
export type Tables = Database['public']['Tables'];
// These tables don't exist in the current database schema
// Keeping interfaces but commenting out the row types that reference missing tables
// export type MemoryAssessmentRow = Tables['memory_assessments']['Row'];
// export type MemoryExerciseRow = Tables['memory_exercises']['Row'];
// export type CognitiveProgressRow = Tables['cognitive_progress']['Row'];
// export type MemoryJournalRow = Tables['memory_journals']['Row'];
// export type CareContactRow = Tables['care_contacts']['Row'];
// export type RoutineReminderRow = Tables['routine_reminders']['Row'];
// export type MemoryAlbumRow = Tables['memory_albums']['Row'];

// Alternative approach: define the row types directly from interfaces
export type MemoryAssessmentRow = MemoryAssessment;
export type MemoryExerciseRow = MemoryExercise;
export type CognitiveProgressRow = CognitiveProgress;
export type MemoryJournalRow = MemoryJournal;
export type CareContactRow = CareContact;
export type RoutineReminderRow = RoutineReminder;
export type MemoryAlbumRow = MemoryAlbum;
