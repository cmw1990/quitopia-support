// Renamed from Task to FocusTask and aligned strictly with ssot8001 keyFields
export interface FocusTask {
  id: string; // uuid, Primary key
  user_id: string; // uuid, Foreign key to auth.users
  title: string; // text, Task title
  description?: string | null; // text, Detailed task description
  due_date?: string | null; // TIMESTAMPTZ, Optional deadline
  status: 'todo' | 'in_progress' | 'completed'; // text, Enumerated status
  priority?: 'low' | 'medium' | 'high' | null; // text, Enumerated priority level
  estimated_minutes?: number | null; // INTEGER, User estimate of required time
  actual_minutes?: number | null; // INTEGER, Actual time spent on task
  cognitive_load_estimate?: number | null; // INTEGER, Estimated mental effort (1-10)
  parent_task_id?: string | null; // UUID, Optional reference to parent task
  tags?: string[] | null; // TEXT[], Array of categorization tags
  order?: number | null; // INTEGER, Optional field for manual sorting
  scheduled_start_time?: string | null; // TIMESTAMPTZ, Optional start time for time blocking
  scheduled_end_time?: string | null; // TIMESTAMPTZ, Optional end time for time blocking
  created_at: string; // TIMESTAMPTZ, Creation timestamp
  updated_at?: string | null; // TIMESTAMPTZ, Last update timestamp (nullable as it might not exist on creation response sometimes)
  // Removed fields not in ssot8001 keyFields: urgency, importance, notes, completed_at
}

// Microtask interface for subtasks
export interface Microtask {
  id: string;
  title: string;
  completed: boolean;
  order: number;
}

// Cognitive load estimation interface
export interface CognitiveLoadEstimate {
  complexity: number; // 1-5
  timeRequired: number; // minutes
  mentalEffort: number; // 1-5
  contextSwitchCost: number; // 1-5
  totalLoad: number; // Calculated
}

// Task template interface
export interface TaskTemplate {
  id: string;
  name: string;
  description?: string;
  estimatedDuration: number;
  defaultPriority: 'low' | 'medium' | 'high';
  defaultCognitiveLoad: CognitiveLoadEstimate;
  steps: string[];
  tags: string[];
}

// Extend FocusTask with additional fields needed for UI
export interface Task extends FocusTask {
  isVisible?: boolean;
  isFocused?: boolean;
  cognitiveLoad?: CognitiveLoadEstimate;
  microtasks?: Microtask[];
  template?: string;
  timeBlocks?: { start: string; end: string; duration: number }[];
  estimated_load?: 'low' | 'medium' | 'high';
  notes?: string;
}

// DTOs can remain or be adjusted based on actual API usage later
export type CreateTaskDto = Omit<Task, 
  'id' | 
  'user_id' | 
  'created_at' | 
  'updated_at' | 
  'actual_minutes' | 
  'order'
>;

export type UpdateTaskDto = Partial<Omit<Task, 'id' | 'user_id' | 'created_at' | 'updated_at'>>; 