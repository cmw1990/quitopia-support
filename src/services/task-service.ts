import { supabase } from '../contexts/AuthContext';
import { z } from 'zod';

// Zod schema for task validation
export const TaskSchema = z.object({
  id: z.string().uuid().optional(),
  userId: z.string().uuid(),
  title: z.string().min(1, "Title is required").max(255, "Title is too long"),
  description: z.string().optional(),
  status: z.enum(['todo', 'in_progress', 'completed']).default('todo'),
  priority: z.enum(['low', 'medium', 'high']).default('medium'),
  dueDate: z.string().datetime().optional(),
  createdAt: z.string().datetime().optional(),
  updatedAt: z.string().datetime().optional()
});

export type Task = z.infer<typeof TaskSchema>;

export class TaskService {
  static async createTask(taskData: Omit<Task, 'id' | 'createdAt' | 'updatedAt'>): Promise<Task | null> {
    try {
      // Validate task data
      const validatedTask = TaskSchema.omit({ id: true, createdAt: true, updatedAt: true }).parse(taskData);

      const { data, error } = await supabase
        .from('focus_tasks')
        .insert({
          ...validatedTask,
          created_at: new Date().toISOString(),
          updated_at: new Date().toISOString()
        })
        .select()
        .single();

      if (error) throw error;
      return data;
    } catch (error) {
      console.error('Failed to create task:', error);
      return null;
    }
  }

  static async updateTask(taskId: string, updates: Partial<Task>): Promise<Task | null> {
    try {
      // Validate update data
      const validatedUpdates = TaskSchema.partial().parse(updates);

      const { data, error } = await supabase
        .from('focus_tasks')
        .update({
          ...validatedUpdates,
          updated_at: new Date().toISOString()
        })
        .eq('id', taskId)
        .select()
        .single();

      if (error) throw error;
      return data;
    } catch (error) {
      console.error('Failed to update task:', error);
      return null;
    }
  }

  static async deleteTask(taskId: string): Promise<boolean> {
    try {
      const { error } = await supabase
        .from('focus_tasks')
        .delete()
        .eq('id', taskId);

      if (error) throw error;
      return true;
    } catch (error) {
      console.error('Failed to delete task:', error);
      return false;
    }
  }

  static async getUserTasks(userId: string, filters?: {
    status?: Task['status'],
    priority?: Task['priority'],
    sortBy?: keyof Task,
    sortOrder?: 'asc' | 'desc'
  }): Promise<Task[]> {
    try {
      let query = supabase
        .from('focus_tasks')
        .select('*')
        .eq('user_id', userId);

      if (filters?.status) {
        query = query.eq('status', filters.status);
      }

      if (filters?.priority) {
        query = query.eq('priority', filters.priority);
      }

      // Default sorting by created_at in descending order
      const sortColumn = filters?.sortBy || 'created_at';
      const sortOrder = filters?.sortOrder || 'desc';
      query = query.order(sortColumn, { ascending: sortOrder === 'asc' });

      const { data, error } = await query;

      if (error) throw error;
      return data || [];
    } catch (error) {
      console.error('Failed to fetch tasks:', error);
      return [];
    }
  }

  static async getTaskStats(userId: string): Promise<{
    totalTasks: number,
    completedTasks: number,
    pendingTasks: number
  }> {
    try {
      const { data, error } = await supabase.rpc('get_task_stats', { p_user_id: userId });

      if (error) throw error;
      return data || { totalTasks: 0, completedTasks: 0, pendingTasks: 0 };
    } catch (error) {
      console.error('Failed to fetch task stats:', error);
      return { totalTasks: 0, completedTasks: 0, pendingTasks: 0 };
    }
  }
}