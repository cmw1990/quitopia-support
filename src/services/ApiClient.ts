/**
 * API Client for Mission Fresh
 * 
 * This service provides a consistent interface for making API calls
 * to the Mission Fresh backend using direct REST API calls (following ssot8001 guidelines).
 */

import { Session } from '@supabase/supabase-js';

// Environment variables
const SUPABASE_URL = import.meta.env.VITE_SUPABASE_URL || 'https://zoubqdwxemivxrjruvam.supabase.co';
const SUPABASE_ANON_KEY = import.meta.env.VITE_SUPABASE_ANON_KEY || 'eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6InpvdWJxZHd4ZW1pdnhyanJ1dmFtIiwicm9sZSI6ImFub24iLCJpYXQiOjE3Mzg0MjAxOTcsImV4cCI6MjA1Mzk5NjE5N30.tq2ssOiA8CbFUZc6HXWXMEev1dODzKZxzNrpvyzbbXs';

// Task interface
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

// API response interface
export interface ApiResponse<T> {
  data: T | null;
  error: Error | null;
}

class ApiClient {
  private baseUrl: string;
  
  constructor() {
    this.baseUrl = import.meta.env.VITE_SUPABASE_URL || '';
  }

  private getHeaders(session: Session): Headers {
    const headers = new Headers();
    headers.append('Authorization', `Bearer ${session.access_token}`);
    headers.append('Content-Type', 'application/json');
    headers.append('apikey', `${import.meta.env.VITE_SUPABASE_KEY}`);
    return headers;
  }

  private async handleResponse<T>(response: Response): Promise<ApiResponse<T>> {
    if (!response.ok) {
      return {
        data: null,
        error: new Error(`API error: ${response.status} - ${response.statusText}`)
      };
    }

    try {
      const data = await response.json();
      return { data, error: null };
    } catch (error) {
      return {
        data: null,
        error: error instanceof Error ? error : new Error('Unknown error occurred')
      };
    }
  }

  /**
   * Get tasks for a user
   */
  async getTasks(userId: string, session?: Session): Promise<ApiResponse<Task[]>> {
    if (!session) {
      return { data: null, error: new Error('No session provided') };
    }
    
    try {
      const url = `${this.baseUrl}/rest/v1/mission4_tasks?user_id=eq.${userId}&order=created_at.desc`;
      const response = await fetch(url, {
        method: 'GET',
        headers: this.getHeaders(session)
      });

      return this.handleResponse<Task[]>(response);
    } catch (error) {
      return {
        data: null,
        error: error instanceof Error ? error : new Error('Failed to fetch tasks')
      };
    }
  }

  /**
   * Create a new task
   */
  async createTask(task: Omit<Task, 'id' | 'created_at' | 'updated_at'>, session?: Session): Promise<ApiResponse<Task>> {
    if (!session) {
      return { data: null, error: new Error('No session provided') };
    }
    
    try {
      const url = `${this.baseUrl}/rest/v1/mission4_tasks`;
      const timestamp = new Date().toISOString();
      
      const taskWithTimestamps = {
        ...task,
        created_at: timestamp,
        updated_at: timestamp
      };
      
      const response = await fetch(url, {
        method: 'POST',
        headers: this.getHeaders(session),
        body: JSON.stringify(taskWithTimestamps)
      });

      return this.handleResponse<Task>(response);
    } catch (error) {
      return {
        data: null,
        error: error instanceof Error ? error : new Error('Failed to create task')
      };
    }
  }

  /**
   * Update an existing task
   */
  async updateTask(taskId: string, updates: Partial<Task>, session?: Session): Promise<ApiResponse<null>> {
    if (!session) {
      return { data: null, error: new Error('No session provided') };
    }
    
    try {
      const url = `${this.baseUrl}/rest/v1/mission4_tasks?id=eq.${taskId}`;
      const updatedTask = {
        ...updates,
        updated_at: new Date().toISOString()
      };
      
      const response = await fetch(url, {
        method: 'PATCH',
        headers: this.getHeaders(session),
        body: JSON.stringify(updatedTask)
      });

      if (!response.ok) {
        return {
          data: null,
          error: new Error(`Failed to update task: ${response.status} - ${response.statusText}`)
        };
      }

      return { data: null, error: null };
    } catch (error) {
      return {
        data: null,
        error: error instanceof Error ? error : new Error('Failed to update task')
      };
    }
  }

  /**
   * Delete a task
   */
  async deleteTask(taskId: string, session?: Session): Promise<ApiResponse<null>> {
    if (!session) {
      return { data: null, error: new Error('No session provided') };
    }
    
    try {
      const url = `${this.baseUrl}/rest/v1/mission4_tasks?id=eq.${taskId}`;
      
      const response = await fetch(url, {
        method: 'DELETE',
        headers: this.getHeaders(session)
      });

      if (!response.ok) {
        return {
          data: null,
          error: new Error(`Failed to delete task: ${response.status} - ${response.statusText}`)
        };
      }

      return { data: null, error: null };
    } catch (error) {
      return {
        data: null,
        error: error instanceof Error ? error : new Error('Failed to delete task')
      };
    }
  }
}

// Create and export a singleton instance
const apiClient = new ApiClient();
export default apiClient; 