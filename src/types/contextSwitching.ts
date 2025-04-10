// Defines the structure for a single step within a context switch template.
export interface ContextSwitchStep {
  id: string; // Typically UUID from Supabase
  template_id: string; // Foreign key to ContextSwitchTemplate
  order: number; // Sequence number for the step
  description: string;
  estimated_time_seconds: number;
  type: 'preparation' | 'action' | 'break' | 'planning'; // Type of step
  created_at: string; // ISO timestamp string
  updated_at: string; // ISO timestamp string
}

// Defines the structure for a context switching template.
export interface ContextSwitchTemplate {
  id: string; // Typically UUID from Supabase
  user_id: string; // Foreign key to users table
  name: string;
  description: string;
  steps: ContextSwitchStep[]; // Array of steps associated with the template
  estimated_time_seconds: number; // Total estimated time for all steps
  complexity: number; // Numerical rating of complexity (e.g., 1-5)
  tags: string[]; // Array of keywords or categories
  created_at: string; // ISO timestamp string
  updated_at: string; // ISO timestamp string
}

// Defines the structure for user's context switching statistics.
export interface ContextSwitchStats {
  id: string; // Typically UUID from Supabase
  user_id: string; // Foreign key to users table
  switch_count: number; // Total number of context switches logged
  average_switch_time: number; // Average time taken per switch in seconds
  total_switch_time: number; // Total cumulative time spent switching in seconds
  most_frequent_contexts: Record<string, number>; // JSON object mapping context names to switch counts
  cognitive_load_level: 'low' | 'medium' | 'high'; // User-reported or inferred cognitive load
  daily_switches: Record<string, number>; // JSON object mapping dates (YYYY-MM-DD) to switch counts
  created_at: string; // ISO timestamp string
  updated_at: string; // ISO timestamp string
} 