import { useState, useEffect, useCallback } from 'react';
import { useAuth } from '@/hooks/useAuth';
import { tasks } from '@/lib/api';
import type { Session } from '@supabase/supabase-js';

export interface FocusTask {
  id: string;
  user_id: string;
  title: string;
  description?: string;
  status: 'todo' | 'in_progress' | 'completed';
  priority: 'low' | 'medium' | 'high';
  due_date?: string;
  estimated_duration?: number;
  actual_duration?: number;
  cognitive_load?: number;
  tags?: string[];
  parent_task_id?: string;
  subtasks?: FocusTask[];
  created_at: string;
  updated_at: string;
}

export interface CreateFocusTaskData {
  title: string;
  description?: string;
  priority?: FocusTask['priority'];
  due_date?: string;
  estimated_duration?: number;
  cognitive_load?: number;
  tags?: string[];
  parent_task_id?: string;
}

export interface UpdateFocusTaskData {
  title?: string;
  description?: string;
  status?: FocusTask['status'];
  priority?: FocusTask['priority'];
  due_date?: string;
  estimated_duration?: number;
  actual_duration?: number;
  cognitive_load?: number;
  tags?: string[];
}

export function useFocusTasks() {
  const { session } = useAuth();
  const [isLoading, setIsLoading] = useState(false);
  const [error, setError] = useState<Error | null>(null);
  const [focusTasks, setFocusTasks] = useState<FocusTask[]>([]);

  // Load tasks
  const loadTasks = useCallback(async () => {
    if (!session) return;

    try {
      setIsLoading(true);
      setError(null);

      const data = await tasks.list(session as Session);

      // Build task hierarchy
      const taskMap = new Map<string, FocusTask>();
      const rootTasks: FocusTask[] = [];

      // First pass: create map of all tasks
      data.forEach((task: FocusTask) => {
        taskMap.set(task.id, { ...task, subtasks: [] });
      });

      // Second pass: build hierarchy
      data.forEach((task: FocusTask) => {
        const taskWithSubtasks = taskMap.get(task.id)!;
        if (task.parent_task_id) {
          const parentTask = taskMap.get(task.parent_task_id);
          if (parentTask) {
            parentTask.subtasks?.push(taskWithSubtasks);
          }
        } else {
          rootTasks.push(taskWithSubtasks);
        }
      });

      setFocusTasks(rootTasks);
    } catch (err) {
      setError(err instanceof Error ? err : new Error('Failed to load tasks'));
    } finally {
      setIsLoading(false);
    }
  }, [session]);

  // Load tasks on mount and when session changes
  useEffect(() => {
    loadTasks();
  }, [loadTasks]);

  // Create a new task
  const createTask = async (data: CreateFocusTaskData): Promise<FocusTask> => {
    if (!session) throw new Error('Not authenticated');

    try {
      setIsLoading(true);
      setError(null);

      const newTask = await tasks.create(session as Session, {
        ...data,
        status: 'todo',
      });

      if (data.parent_task_id) {
        setFocusTasks(prev => {
          const updateTaskHierarchy = (tasks: FocusTask[]): FocusTask[] => {
            return tasks.map(task => {
              if (task.id === data.parent_task_id) {
                return {
                  ...task,
                  subtasks: [...(task.subtasks || []), newTask],
                };
              }
              if (task.subtasks) {
                return {
                  ...task,
                  subtasks: updateTaskHierarchy(task.subtasks),
                };
              }
              return task;
            });
          };
          return updateTaskHierarchy(prev);
        });
      } else {
        setFocusTasks(prev => [...prev, newTask]);
      }

      return newTask;
    } catch (err) {
      const error = err instanceof Error ? err : new Error('Failed to create task');
      setError(error);
      throw error;
    } finally {
      setIsLoading(false);
    }
  };

  // Update an existing task
  const updateTask = async (id: string, data: UpdateFocusTaskData): Promise<FocusTask> => {
    if (!session) throw new Error('Not authenticated');

    try {
      setIsLoading(true);
      setError(null);

      const updatedTask = await tasks.update(session as Session, id, data);

      setFocusTasks(prev => {
        const updateTaskHierarchy = (tasks: FocusTask[]): FocusTask[] => {
          return tasks.map(task => {
            if (task.id === id) {
              return {
                ...task,
                ...updatedTask,
                subtasks: task.subtasks,
              };
            }
            if (task.subtasks) {
              return {
                ...task,
                subtasks: updateTaskHierarchy(task.subtasks),
              };
            }
            return task;
          });
        };
        return updateTaskHierarchy(prev);
      });

      return updatedTask;
    } catch (err) {
      const error = err instanceof Error ? err : new Error('Failed to update task');
      setError(error);
      throw error;
    } finally {
      setIsLoading(false);
    }
  };

  // Delete a task
  const deleteTask = async (id: string): Promise<void> => {
    if (!session) throw new Error('Not authenticated');

    try {
      setIsLoading(true);
      setError(null);

      await tasks.delete(session as Session, id);

      setFocusTasks(prev => {
        const removeTask = (tasks: FocusTask[]): FocusTask[] => {
          return tasks.filter(task => {
            if (task.id === id) {
              return false;
            }
            if (task.subtasks) {
              task.subtasks = removeTask(task.subtasks);
            }
            return true;
          });
        };
        return removeTask(prev);
      });
    } catch (err) {
      const error = err instanceof Error ? err : new Error('Failed to delete task');
      setError(error);
      throw error;
    } finally {
      setIsLoading(false);
    }
  };

  // Get all tasks (flattened)
  const getAllTasks = useCallback((): FocusTask[] => {
    const flattenTasks = (tasks: FocusTask[]): FocusTask[] => {
      return tasks.reduce((acc: FocusTask[], task) => {
        acc.push(task);
        if (task.subtasks) {
          acc.push(...flattenTasks(task.subtasks));
        }
        return acc;
      }, []);
    };
    return flattenTasks(focusTasks);
  }, [focusTasks]);

  // Get tasks by status
  const getTasksByStatus = useCallback((status: FocusTask['status']): FocusTask[] => {
    return getAllTasks().filter(task => task.status === status);
  }, [getAllTasks]);

  // Get tasks by priority
  const getTasksByPriority = useCallback((priority: FocusTask['priority']): FocusTask[] => {
    return getAllTasks().filter(task => task.priority === priority);
  }, [getAllTasks]);

  // Get overdue tasks
  const getOverdueTasks = useCallback((): FocusTask[] => {
    const now = new Date();
    return getAllTasks().filter(task => 
      task.due_date && 
      new Date(task.due_date) < now && 
      task.status !== 'completed'
    );
  }, [getAllTasks]);

  return {
    isLoading,
    error,
    tasks: focusTasks,
    createTask,
    updateTask,
    deleteTask,
    getAllTasks,
    getTasksByStatus,
    getTasksByPriority,
    getOverdueTasks,
    refresh: loadTasks,
  };
} 