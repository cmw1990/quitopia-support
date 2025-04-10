// src/types/tasks.ts

// Defines the structure of a single subtask
export interface Subtask {
  id: string;
  title: string;
  isCompleted: boolean;
  order?: number | null;
}

// Defines possible priority levels
export type TaskPriority = 'low' | 'medium' | 'high';

// Defines possible status types (often corresponds to Column IDs)
// Using specific union type aligned with ColumnId for better type safety
export type TaskStatus = 'todo' | 'in_progress' | 'completed';

// Defines the specific valid Column IDs used in the board and hooks
export type ColumnId = 'todo' | 'in_progress' | 'completed';

// Defines the scale for importance/urgency used in the Priority Matrix
export type ImportanceLevel = 1 | 2 | 3 | 4 | 5 | 6 | 7 | 8 | 9 | 10;

// Defines the possible energy levels required
export type EnergyLevel = 'low' | 'medium' | 'high';

// Defines the main Task structure, aligning with database schema and component needs
export interface Task {
  id: string;
  user_id: string; // Foreign key linking to the user
  title: string;
  description?: string | null;
  status: TaskStatus; // Current status/column ID - Use standardized TaskStatus
  priority?: TaskPriority | null; // Priority level
  importance?: ImportanceLevel | null; // Eisenhower Matrix: How much impact? (1-10)
  urgency?: ImportanceLevel | null;    // Eisenhower Matrix: How soon? (1-10)
  order?: number | null; // Added order for board sorting
  cognitive_load_estimate?: number | null; // Added cognitive load (e.g., 1-10)
  energy_level_required?: EnergyLevel | null; // Added energy level
  due_date?: string | null; // Optional due date in ISO 8601 format
  scheduled_start_time?: string | null; // Optional start time for calendar (ISO 8601)
  scheduled_end_time?: string | null;   // Optional end time for calendar (ISO 8601)
  created_at: string; // Timestamp of creation (ISO 8601)
  updated_at: string; // Timestamp of last update (ISO 8601)
  subtasks?: Subtask[]; // Array of subtasks
  tags?: string[]; // Array of tag names or IDs
  completed_at?: string | null; // Added completed_at
}

// Represents the structure for columns in the Task Board view
// Often fetched alongside tasks or defined statically
export interface Column {
  id: ColumnId; // Use the specific ColumnId type
  title: string;  // Display name for the column header
  tasks: Task[]; // Tasks belonging to this column
}

// Type for the columns object used in TaskBoard (Map from ColumnId to Column data)
// Updated: This represents the structure passed TO the board, maybe not needed if board groups internally
// export type Columns = Record<ColumnId, Column>; // Use ColumnId as key

// Type for the columns state managed within useTasks hook (Map from ColumnId to Task array)
export type TaskColumns = Record<ColumnId, Task[]>;

// Type for the data managed by the TaskEditDialog form
export interface TaskFormData {
  title: string;
  description?: string | null;
  status: TaskStatus; // Use standardized TaskStatus
  priority?: TaskPriority | null;
  importance?: ImportanceLevel | null;
  urgency?: ImportanceLevel | null;
  due_date?: string | null;
  scheduled_start_time?: string | null;
  scheduled_end_time?: string | null;
  cognitive_load_estimate?: number | null; // Added
  energy_level_required?: EnergyLevel | null; // Added
  subtasks?: Subtask[]; // Managed within the dialog state
  tagsString?: string; // For handling tags input
  // Add other fields that are directly editable in the form
} 