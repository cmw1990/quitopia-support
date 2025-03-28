import { Session } from '@supabase/supabase-js';

export interface Task {
  id: string;
  title: string;
  description?: string;
  due_date?: string | null;
  completed: boolean;
  completed_at?: string | null;
  category: string;
  priority: 'low' | 'medium' | 'high';
  created_at: string;
  updated_at: string;
  user_id: string;
  tags?: string[];
}

export interface ApiResponse<T> {
  data: T | null;
  error: Error | null;
}

declare class ApiClient {
  getTasks(userId: string, session?: Session): Promise<ApiResponse<Task[]>>;
  createTask(task: Omit<Task, 'id' | 'created_at' | 'updated_at'>, session?: Session): Promise<ApiResponse<Task>>;
  updateTask(taskId: string, updates: Partial<Task>, session?: Session): Promise<ApiResponse<null>>;
  deleteTask(taskId: string, session?: Session): Promise<ApiResponse<null>>;
}

declare const apiClient: ApiClient;
export default apiClient; 