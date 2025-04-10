// Types for Context Switching Assistant

export interface SwitchingTemplate {
  id?: string;
  user_id?: string;
  name: string;
  steps: SwitchingStep[];
  duration: number; // in minutes
  cognitive_load: 'low' | 'medium' | 'high';
  is_default: boolean;
  created_at?: string;
  updated_at?: string;
}

export interface SwitchingStep {
  id: string;
  title: string;
  description: string;
  duration: number; // in seconds
  complete: boolean;
}

export interface SavedContext {
  id?: string;
  user_id?: string;
  name: string;
  description?: string;
  task: string;
  notes?: string;
  resources?: Resource[];
  progress: number; // 0-100%
  cognitive_load: 'low' | 'medium' | 'high';
  complexity: number; // 1-10
  tags?: string[];
  context_snapshot?: ContextSnapshot;
  last_used?: string;
  created_at?: string;
  updated_at?: string;
}

export interface Resource {
  id: string;
  title: string;
  url?: string;
  type: 'link' | 'file' | 'note' | 'app';
  content?: string;
}

export interface ContextSnapshot {
  id?: string;
  user_id?: string;
  context_id?: string;
  description: string;
  links: Link[];
  image_url?: string;
  timestamp?: string;
  created_at?: string;
}

export interface Link {
  url: string;
  title: string;
}

export interface ContextSwitchLog {
  id?: string;
  user_id?: string;
  from_context_id?: string;
  to_context_id?: string;
  template_id?: string;
  from_context_name?: string;
  to_context_name?: string;
  duration_seconds?: number;
  completed: boolean;
  notes?: string;
  timestamp?: string;
  created_at?: string;
}

export interface ContextSwitchStats {
  id?: string;
  user_id?: string;
  switch_count: number;
  average_switch_time: number; // in seconds
  total_switch_time: number; // in seconds
  most_frequent_contexts?: {[key: string]: number};
  cognitive_load_level?: 'low' | 'medium' | 'high';
  daily_switches?: {[key: string]: number};
  created_at?: string;
  updated_at?: string;
}

export interface CognitiveMetrics {
  daily_switches: number;
  weekly_switches: number;
  switch_complexity: number; // 1-10
  average_duration: number; // in seconds
  cognitive_load: 'low' | 'medium' | 'high';
} 