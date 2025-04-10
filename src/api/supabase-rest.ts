// micro-frontends/easier-focus/src/api/supabase-rest.ts
// Following SSOT8001 guidelines - Direct REST API calls only

import { handleError } from '../utils/error-handler';
// Import the standardized request utility
import { supabaseRequest } from '../utils/supabaseRequest';
import type { BlockRule } from '../types/blockRule';
import { Session } from '@supabase/supabase-js';
import { v4 as uuidv4 } from 'uuid';

// We still need SUPABASE_URL and KEY if any function constructs URLs manually, but prefer passing full path to supabaseRequest
// Let's keep them for now, but aim to remove if unused later.
const SUPABASE_URL = import.meta.env.VITE_SUPABASE_URL || 'https://zoubqdwxemivxrjruvam.supabase.co';
const SUPABASE_ANON_KEY = import.meta.env.VITE_SUPABASE_ANON_KEY || 'eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6InpvdWJxZHd4ZW1pdnhyanJ1dmFtIiwicm9sZSI6ImFub24iLCJpYXQiOjE3Mzg0MjAxOTcsImV4cCI6MjA1Mzk5NjE5N30.tq2ssOiA8CbFUZc6HXWXMEev1dODzKZxzNrpvyzbbXs';

// Helper function to check if in development environment (Keep for potential use)
const isDevelopment = () => typeof window !== 'undefined' && window.location.hostname === 'localhost';

// Interfaces for API request/response types
interface TaskData {
  scheduled_start_time?: string | null;
  scheduled_end_time?: string | null;
  created_at?: string;
  updated_at?: string;
  [key: string]: any;
}

interface TemplateData {
  user_id: string;
  name: string;
  template_data: any;
}

interface InterventionData {
  effectiveness_rating?: number;
  effectiveness_notes?: string;
  [key: string]: any;
}

// ----- Helper Functions (Copied from src/lib/supabase-rest.ts) -----

interface FetchOptions {
  method?: 'GET' | 'POST' | 'PUT' | 'PATCH' | 'DELETE';
  headers?: Record<string, string>;
  body?: Record<string, any> | FormData | null;
  params?: Record<string, string | number | boolean | null | undefined>;
  needsAuth?: boolean; // Flag to indicate if the request requires authentication
}

/**
 * Centralized function for making direct REST API calls to Supabase.
 *
 * @param endpoint The specific API endpoint (e.g., '/rest/v1/your_table')
 * @param options Fetch options including method, headers, body, params, and needsAuth flag.
 * @returns Promise<any> The parsed JSON response from the API.
 * @throws Error if the fetch operation fails or returns an error status.
 */
export const supabaseRest = async <T = any>(
  endpoint: string,
  options: FetchOptions = {}
): Promise<T | null> => {
  const { method = 'GET', headers = {}, body = null, params = {}, needsAuth = true } = options;

  const defaultHeaders: Record<string, string> = {
    'apikey': SUPABASE_ANON_KEY,
    'Content-Type': body instanceof FormData ? 'multipart/form-data' : 'application/json',
    // Add Supabase-specific headers if needed, like Prefer for upserts, counts, etc.
    // 'Prefer': 'return=representation' // Example: Return the full inserted/updated object
  };

  // Add Authorization header if needsAuth is true and token exists
  if (needsAuth) {
    const token = getAuthToken(); // Use the locally defined function
    if (token) {
      defaultHeaders['Authorization'] = `Bearer ${token}`;
    } else if (method !== 'GET') { // Only warn for non-GET if auth needed but missing
      // If auth is needed but no token, we might want to throw an error or handle differently
      // For now, let the API call proceed, Supabase RLS will handle permissions.
      console.warn(`Auth token needed for ${method} ${endpoint} but not found. Relying on RLS.`);
    }
  }

  const combinedHeaders = { ...defaultHeaders, ...headers };

  // Construct URL with query parameters
  const url = new URL(`${SUPABASE_URL}${endpoint}`);
  Object.entries(params).forEach(([key, value]) => {
    if (value !== null && value !== undefined) {
      // Handle array parameters (e.g., select=col1,col2)
      if (Array.isArray(value)) {
         url.searchParams.append(key, value.join(','));
      } else {
         url.searchParams.append(key, String(value));
      }
    }
  });

  // Configure fetch request
  const fetchConfig: RequestInit = {
    method,
    headers: combinedHeaders,
  };

  // Add body for relevant methods
  if (body && ['POST', 'PUT', 'PATCH'].includes(method)) {
    fetchConfig.body = body instanceof FormData ? body : JSON.stringify(body);
    // If body is FormData, remove Content-Type header; fetch handles it.
    if (body instanceof FormData) {
      delete combinedHeaders['Content-Type'];
      fetchConfig.headers = combinedHeaders;
    }
  }

  try {
    const response = await fetch(url.toString(), fetchConfig);

    if (!response.ok) {
      let errorData;
      try {
        errorData = await response.json();
      } catch (e) {
        // If response is not JSON, use text
        errorData = {
            message: await response.text() || response.statusText,
            details: `Status: ${response.status}`
        };
      }
      const errorPayload = {
          message: errorData?.message || response.statusText,
          details: errorData?.details || errorData?.hint || JSON.stringify(errorData),
          code: errorData?.code || response.status.toString()
      }
      console.error(`Supabase REST API Error (${response.status}):`, errorPayload);
      // Use the existing handleError function
      handleError(new Error(`HTTP error ${response.status}: ${errorPayload.message}`), 'supabaseRest', `API call to ${endpoint} failed: ${errorPayload.details}`);
      return null; // Return null on error as per existing pattern
    }

    // Handle cases with no content (e.g., DELETE, status 204)
    if (response.status === 204) {
      return null;
    }

    // Handle potential empty response body even with status 200/201
    const responseText = await response.text();
    if (!responseText) {
        return null;
    }

    try {
      // Parse valid JSON response, casting to expected type T
      return JSON.parse(responseText) as T;
    } catch(e) {
        console.error("Failed to parse JSON response:", responseText);
        handleError(new Error("Invalid JSON response from API"), 'supabaseRest', 'Failed to parse API response');
        return null;
    }

  } catch (error) {
    console.error('Network or fetch error:', error);
    // Use the existing handleError function
    handleError(error as Error, 'supabaseRest', 'Network or fetch error occurred');
    return null; // Return null on error
  }
};


// fetchTable: Expects an array, returns empty array if no results, null on error/no content (unlikely for GET list)
export const fetchTable = <T = any>(
  tableName: string,
  params: Record<string, any> = {},
  needsAuth = true
): Promise<T[]> => // Return T[] (supabase usually returns [] for no matches)
  supabaseRest<T[]>(`/rest/v1/${tableName}`, { method: 'GET', params, needsAuth })
  .then(data => data ?? []); // Ensure array return, convert null to empty array

// insertIntoTable: Can return single item, array, or null depending on input/headers/response
export const insertIntoTable = <T = any>(
  tableName: string,
  data: Record<string, any> | Record<string, any>[],
  needsAuth = true
): Promise<T | T[] | null> => // Return type depends on input and `Prefer` header
  supabaseRest<T | T[]>(`/rest/v1/${tableName}`, {
    method: 'POST',
    body: data,
    headers: { 'Prefer': 'return=representation' },
    needsAuth,
  });

// updateTable: Can return updated items array or null
export const updateTable = <T = any>(
  tableName: string,
  matchCriteria: Record<string, any>,
  updates: Record<string, any>,
  needsAuth = true
): Promise<T[] | null> => { // Update returns an array of updated rows or null
  // Construct query params for matching rows (e.g., ?id=eq.1)
  const params: Record<string, string> = {};
  Object.entries(matchCriteria).forEach(([key, value]) => {
    // Ensure value is encoded properly if needed, basic string conversion here
    params[key] = `eq.${value}`;
  });

  return supabaseRest<T[]>(`/rest/v1/${tableName}`, {
    method: 'PATCH',
    body: updates,
    params,
    // Ensure Prefer header is correctly formatted
    headers: { 'Prefer': 'return=representation' }, // Returns updated row(s)
    needsAuth,
  });
}

// deleteFromTable: Returns null (204) or array of deleted items if Prefer header used
export const deleteFromTable = <T = any>(
  tableName: string,
  matchCriteria: Record<string, any>,
  needsAuth = true,
  returnDeleted = false // Option to return deleted items
): Promise<T[] | null> => {
  // Construct query params for matching rows
  const params: Record<string, string> = {};
  Object.entries(matchCriteria).forEach(([key, value]) => {
    params[key] = `eq.${value}`;
  });

  // Initialize headers as undefined or Record<string, string>
  const headers: Record<string, string> | undefined = returnDeleted
    ? { 'Prefer': 'return=representation' }
    : undefined;

  return supabaseRest<T[]>(`/rest/v1/${tableName}`, {
    method: 'DELETE',
    params,
    headers,
    needsAuth,
  });
};

// --- Refactored API methods to use supabaseRequest ---

// Focus Sessions API
export const focusSessionsApi = {
  async getRecent(userId: string, limit = 10): Promise<any[]> {
    const { data, error } = await supabaseRequest<any[]>({
      tableName: 'focus_sessions',
      method: 'GET',
      params: {
        user_id: `eq.${userId}`,
        order: 'start_time.desc',
        limit: limit.toString(),
        select: '*'
      }
    });
    if (error) {
      handleError(error, 'focusSessionsApi.getRecent', 'Failed to fetch recent focus sessions', {});
      throw error;
    }
    return data || [];
  },

  async create(sessionData: Partial<any>): Promise<any> {
    const { data, error } = await supabaseRequest<any[]>({
      tableName: 'focus_sessions',
      method: 'POST',
      headers: { 'Prefer': 'return=representation' },
      body: JSON.stringify(sessionData)
    });
    if (error) {
      handleError(error, 'focusSessionsApi.create', 'Failed to create focus session', {});
      throw error;
    }
    return data?.[0];
  },

  async createFocusSession(sessionData: Partial<any>): Promise<any> {
    return this.create(sessionData);
  },

  async update(id: string, sessionData: Partial<any>): Promise<any> {
    const { data, error } = await supabaseRequest<any[]>({
      tableName: 'focus_sessions',
      method: 'PATCH',
      params: { id: `eq.${id}` },
      headers: { 'Prefer': 'return=representation' },
      body: JSON.stringify(sessionData)
    });
    if (error) {
      handleError(error, 'focusSessionsApi.update', `Failed to update focus session ${id}`, {});
      throw error;
    }
    return data?.[0];
  },

  async delete(id: string): Promise<void> {
    const { error } = await supabaseRequest<null>({
      tableName: 'focus_sessions',
      method: 'DELETE',
      params: { id: `eq.${id}` }
    });
    if (error) {
      handleError(error, 'focusSessionsApi.delete', `Failed to delete focus session ${id}`, {});
      throw error;
    }
  },

  async getSessionsByDateRange(userId: string, startDate: string, endDate?: string): Promise<any[]> {
    const params: Record<string, string> = {
      user_id: `eq.${userId}`,
      start_time: `gte.${startDate}`,
      select: '*'
    };
    if (endDate) {
      params['start_time'] = `lte.${endDate}`;
    }
    const { data, error } = await supabaseRequest<any[]>({
      tableName: 'focus_sessions',
      method: 'GET',
      params
    });
    if (error) {
      handleError(error, 'focusSessionsApi.getSessionsByDateRange', 'Failed to fetch focus sessions by date range', {});
      throw error;
    }
    return data || [];
  },
};

// Energy levels API
export const energyLevelsApi = {
  async getRecent(userId: string, limit: number = 10): Promise<any[]> {
    const { data, error } = await supabaseRequest<any[]>({
      tableName: 'focus_moods',
      method: 'GET',
      params: {
        user_id: `eq.${userId}`,
        order: 'timestamp.desc',
        limit: limit.toString(),
        select: '*'
      }
    });
    if (error) {
      handleError(error, 'energyLevelsApi.getRecent', 'Failed to fetch recent energy levels', {});
      throw error;
    }
    return data || [];
  },

  async create(energyLevelData: Partial<any>): Promise<any> {
    const { data, error } = await supabaseRequest<any[]>({
      tableName: 'focus_moods',
      method: 'POST',
      headers: { 'Prefer': 'return=representation' },
      body: energyLevelData
    });
    if (error) {
      handleError(error, 'energyLevelsApi.create', 'Failed to create energy level entry', {});
      throw error;
    }
    return data?.[0];
  }
};

// Distraction Logs API
export const distractionLogsApi = {
  async getRecent(userId: string, limit = 10): Promise<any[]> {
    const { data, error } = await supabaseRequest<any[]>({
      tableName: 'focus_distractions',
      method: 'GET',
      params: {
        user_id: `eq.${userId}`,
        order: 'timestamp.desc',
        limit: limit.toString(),
        select: '*'
      }
    });
    if (error) {
      handleError(error, 'distractionLogsApi.getRecent', 'Failed to fetch recent distraction logs', {});
      throw error;
    }
    return data || [];
  },

  async create(logData: Partial<any>): Promise<any> {
    const { data, error } = await supabaseRequest<any[]>({
      tableName: 'focus_distractions',
      method: 'POST',
      headers: { 'Prefer': 'return=representation' },
      body: logData
    });
    if (error) {
      handleError(error, 'distractionLogsApi.create', 'Failed to create distraction log', {});
      throw error;
    }
    return data?.[0];
  },

  async createDistractionLog(logData: Partial<any>): Promise<any> {
    return this.create(logData);
  },

  async getDistractionLogsByDateRange(userId: string, startDate: string, endDate?: string): Promise<any[]> {
    const params: Record<string, string> = {
      user_id: `eq.${userId}`,
      timestamp: `gte.${startDate}`,
      select: '*'
    };
    if (endDate) {
      params['timestamp'] = `lte.${endDate}`;
    }
    const { data, error } = await supabaseRequest<any[]>({
      tableName: 'focus_distractions',
      method: 'GET',
      params
    });
    if (error) {
      handleError(error, 'distractionLogsApi.getDistractionLogsByDateRange', 'Failed to fetch distraction logs by date range', {});
      throw error;
    }
    return data || [];
  },
};

// Tasks API (Using 'focus_tasks' as per ssot8001)
export const tasksApi = {
  async getTasks(userId: string): Promise<any[]> {
    const { data, error } = await supabaseRequest<any[]>({
      tableName: 'focus_tasks',
      method: 'GET',
      params: {
        user_id: `eq.${userId}`,
        select: '*',
        order: 'created_at.desc'
      }
    });
    if (error) {
      handleError(error, 'tasksApi.getTasks', 'Failed to fetch tasks', {});
      throw error;
    }
    return data || [];
  },

  async createTask(taskData: TaskData): Promise<any> {
    const payload: TaskData = {
      ...taskData,
      scheduled_start_time: taskData.scheduled_start_time || null,
      scheduled_end_time: taskData.scheduled_end_time || null,
      created_at: new Date().toISOString(),
      updated_at: new Date().toISOString()
    };

    const { data, error } = await supabaseRequest<any[]>({
      tableName: 'focus_tasks',
      method: 'POST',
      headers: { 'Prefer': 'return=representation' },
      body: payload
    });
    if (error) {
      handleError(error, 'tasksApi.createTask', 'Failed to create task', {});
      throw error;
    }
    return data?.[0];
  },

  async updateTask(id: string, taskData: TaskData): Promise<any> {
    const payload: TaskData = {
      ...taskData,
      scheduled_start_time: taskData.scheduled_start_time || null,
      scheduled_end_time: taskData.scheduled_end_time || null,
      updated_at: new Date().toISOString()
    };

    const { data, error } = await supabaseRequest<any[]>({
      tableName: 'focus_tasks',
      method: 'PATCH',
      params: { id: `eq.${id}` },
      headers: { 'Prefer': 'return=representation' },
      body: payload
    });
    if (error) {
      handleError(error, 'tasksApi.updateTask', `Failed to update task ${id}`, {});
      throw error;
    }
    return data?.[0];
  },

  async deleteTask(id: string): Promise<void> {
    const { error } = await supabaseRequest<null>({
      tableName: 'focus_tasks',
      method: 'DELETE',
      params: { id: `eq.${id}` }
    });
    if (error) {
      handleError(error, 'tasksApi.deleteTask', `Failed to delete task ${id}`, {});
      throw error;
    }
  },

  async bulkUpdateTasks(tasksToUpdate: { id: string; data: Partial<any> }[]): Promise<any[]> {
    if (!tasksToUpdate || tasksToUpdate.length === 0) {
      return [];
    }
    const results = await Promise.allSettled(
      tasksToUpdate.map(task => this.updateTask(task.id, task.data))
    );

    results.forEach((result, index) => {
      if (result.status === 'rejected') {
        handleError(result.reason, 'tasksApi.bulkUpdateTasks', `Failed to update task ${tasksToUpdate[index].id} in bulk operation`, {});
      }
    });

    return results
      .filter(result => result.status === 'fulfilled')
      .map((result: any) => result.value);
  },
};

// Task Templates API (Assuming 'focus_task_templates' table)
export const taskTemplatesApi = {
  async getTemplates(userId: string): Promise<any[]> {
    const { data, error } = await supabaseRequest<any[]>({
      tableName: 'focus_task_templates',
      method: 'GET',
      params: {
        user_id: `eq.${userId}`,
        select: '*',
        order: 'name.asc'
      }
    });
    if (error) {
      handleError(error, 'taskTemplatesApi.getTemplates', 'Failed to fetch task templates', {});
      throw error;
    }
    return data || [];
  },

  async createTemplate(templateData: TemplateData): Promise<any> {
    const { data, error } = await supabaseRequest<any[]>({
      tableName: 'focus_task_templates',
      method: 'POST',
      headers: { 'Prefer': 'return=representation' },
      body: templateData
    });
    if (error) {
      handleError(error, 'taskTemplatesApi.createTemplate', 'Failed to create task template', {});
      throw error;
    }
    return data?.[0];
  },

  async updateTemplate(templateId: string, templateData: Partial<{ name: string; template_data: any }>): Promise<any> {
    const { data, error } = await supabaseRequest<any[]>({
      tableName: 'focus_task_templates',
      method: 'PATCH',
      params: { id: `eq.${templateId}` },
      headers: { 'Prefer': 'return=representation' },
      body: { ...templateData, updated_at: new Date().toISOString() }
    });
    if (error) {
      handleError(error, 'taskTemplatesApi.updateTemplate', `Failed to update task template ${templateId}`, {});
      throw error;
    }
    return data?.[0];
  },

  async deleteTemplate(templateId: string): Promise<void> {
    const { error } = await supabaseRequest<null>({
      tableName: 'focus_task_templates',
      method: 'DELETE',
      params: { id: `eq.${templateId}` }
    });
    if (error) {
      handleError(error, 'taskTemplatesApi.deleteTemplate', `Failed to delete task template ${templateId}`, {});
      throw error;
    }
  },
};


// Strategies API (Assuming 'focus_strategies8' for global, 'user_strategies8' for user links)
export const strategiesApi = {
    async getStrategies(userId: string): Promise<any[]> {
        // For now, let's assume it fetches all global strategies
        const { data, error } = await supabaseRequest<any[]>({
          tableName: 'focus_strategies',
          method: 'GET',
          params: { select: '*' }
        });
        if (error) {
          handleError(error, 'strategiesApi.getStrategies', 'Failed to fetch global strategies', {});
          throw error;
        }
        return data || [];
    },
    // Add save/update/delete for global strategies if needed (likely admin-only)
    // Add functions for user-specific strategies (user_strategies8 table) when implementing save/favorite features
};


// Body Doubling API (Assuming table 'body_doubling_sessions8')
export const bodyDoublingApi = {
  async getSessions(status: string | null = null): Promise<any[]> {
    let endpoint = '/rest/v1/body_doubling_sessions?select=*'; // Corrected table name
    if (status) {
        endpoint += `&status=eq.${status}`;
    }
    const { data, error } = await supabaseRequest<any[]>({
      tableName: 'body_doubling_sessions',
      method: 'GET',
      params: { select: '*' }
    });
    if (error) {
      handleError(error, 'bodyDoublingApi.getSessions', 'Failed to fetch body doubling sessions', {});
      throw error;
    }
    return data || [];
  },

  async getSessionById(sessionId: string): Promise<any | null> {
    const { data, error } = await supabaseRequest<any[]>({
      tableName: 'body_doubling_sessions',
      method: 'GET',
      params: { id: `eq.${sessionId}`, select: '*' }
    });
    if (error) {
      handleError(error, 'bodyDoublingApi.getSessionById', `Failed to fetch body doubling session ${sessionId}`, {});
      throw error;
    }
    return data?.[0] || null; // Return single session or null
  },

  async createSession(sessionData: Partial<any>): Promise<any> {
    const { data, error } = await supabaseRequest<any[]>({
      tableName: 'body_doubling_sessions',
      method: 'POST',
      headers: { 'Prefer': 'return=representation' },
      body: sessionData
    });
    if (error) {
      handleError(error, 'bodyDoublingApi.createSession', 'Failed to create body doubling session', {});
      throw error;
    }
    return data?.[0];
  },

  async updateSession(sessionId: string, sessionData: Partial<any>): Promise<any> {
    const { data, error } = await supabaseRequest<any[]>({
      tableName: 'body_doubling_sessions',
      method: 'PATCH',
      params: { id: `eq.${sessionId}`, select: '*' },
      headers: { 'Prefer': 'return=representation' },
      body: sessionData
    });
    if (error) {
      handleError(error, 'bodyDoublingApi.updateSession', `Failed to update body doubling session ${sessionId}`, {});
      throw error;
    }
    return data?.[0];
  },

  async deleteSession(sessionId: string): Promise<void> {
    const { error } = await supabaseRequest<null>({
      tableName: 'body_doubling_sessions',
      method: 'DELETE',
      params: { id: `eq.${sessionId}` }
    });
    if (error) {
      handleError(error, 'bodyDoublingApi.deleteSession', `Failed to delete body doubling session ${sessionId}`, {});
      throw error;
    }
  },

  // Assuming 'body_doubling_participants8' table
  async joinSession(sessionId: string, userId: string): Promise<any> {
    const { data, error } = await supabaseRequest<any[]>({
      tableName: 'body_doubling_participants',
      method: 'POST',
      headers: { 'Prefer': 'return=representation,resolution=merge-duplicates' },
      body: {
        session_id: sessionId,
        user_id: userId,
        join_time: new Date().toISOString()
      }
    });
    if (error) {
      handleError(error, 'bodyDoublingApi.joinSession', `Failed to join body doubling session ${sessionId}`, {});
      throw error;
    }
    return data?.[0];
  },

  async leaveSession(sessionId: string, userId: string): Promise<void> {
    const { error } = await supabaseRequest<null>({
      tableName: 'body_doubling_participants',
      method: 'DELETE',
      params: { session_id: `eq.${sessionId}`, user_id: `eq.${userId}` }
    });
    if (error) {
      handleError(error, 'bodyDoublingApi.leaveSession', `Failed to leave body doubling session ${sessionId}`, {});
      throw error;
    }
  },

  async getSessionParticipants(sessionId: string): Promise<any[]> {
    const { data, error } = await supabaseRequest<any[]>({
      tableName: 'body_doubling_participants',
      method: 'GET',
      params: { session_id: `eq.${sessionId}`, select: 'user_id' }
    });
    if (error) {
      handleError(error, 'bodyDoublingApi.getSessionParticipants', `Failed to get participants for session ${sessionId}`, {});
      throw error;
    }
    return data || [];
  },
};


// Templates API (Assuming table 'focus_templates8') - Already defined above


// Chat API (Assuming table 'chat_messages8' or 'body_doubling_messages8'. Using 'chat_messages8')
export const chatApi = {
  async sendMessage(sessionId: string, userId: string, message: string): Promise<any> {
    const { data, error } = await supabaseRequest<any[]>({
      tableName: 'chat_messages',
      method: 'POST',
      headers: { 'Prefer': 'return=representation' },
      body: {
        session_id: sessionId,
        user_id: userId,
        message_text: message
      }
    });
    if (error) {
      handleError(error, 'chatApi.sendMessage', 'Failed to send chat message', {});
      throw error;
    }
    return data?.[0];
  },

  async getSessionMessages(sessionId: string, limit = 50): Promise<any[]> {
    const { data, error } = await supabaseRequest<any[]>({
      tableName: 'chat_messages',
      method: 'GET',
      params: {
        session_id: `eq.${sessionId}`,
        order: 'created_at.desc',
        limit: String(limit),
        select: '*,profile:profiles(id, username, avatar_url)'
      }
    });
    if (error) {
      handleError(error, 'chatApi.getSessionMessages', `Failed to get messages for session ${sessionId}`, {});
      throw error;
    }
    return data || [];
  },
};

// Achievements API (Using 'focus_achievements' table as per ssot8001)
export const achievementsApi = {
  async getUserAchievements(userId: string): Promise<any[]> {
    // Fetching user's earned/progressing achievements from focus_achievements
    // Assuming focus_achievements contains fields like id, user_id, achievement_key, name, description, category, progress, completed, completion_date etc.
    // Adjust 'select' based on actual 'focus_achievements' table structure
    const { data, error } = await supabaseRequest<any[]>({
      tableName: 'focus_achievements',
      method: 'GET',
      params: { user_id: `eq.${userId}`, select: '*' }
    });
    if (error) {
      handleError(error, 'achievementsApi.getUserAchievements', 'Failed to fetch user achievements', {});
      throw error;
    }
    return data || [];
  },

  async createOrUpdateAchievement(achievementData: Partial<any> & { user_id: string, achievement_key: string }): Promise<any> {
    // Upsert achievement progress or completion status
    // Requires 'user_id' and 'achievement_key' to identify the unique record
    if (!achievementData.user_id || !achievementData.achievement_key) {
        throw new Error("user_id and achievement_key are required for upserting achievements.");
    }
    
    const payload = {
        ...achievementData,
        updated_at: new Date().toISOString(), // Ensure updated_at timestamp
    };

    const { data, error } = await supabaseRequest<any[]>({
      tableName: 'focus_achievements',
      method: 'POST',
      headers: {
        'Prefer': 'return=representation,resolution=merge-duplicates',
        'Content-Type': 'application/json',
      },
      body: payload
    });

    if (error) {
      handleError(error, 'achievementsApi.createOrUpdateAchievement', `Failed to upsert achievement ${achievementData.achievement_key}`, {});
      throw error;
    }
    return data?.[0]; // Return the created or updated achievement record
  },

  async updateAchievementProgress(userId: string, achievementKey: string): Promise<any> {
    const { data, error } = await supabaseRequest<any[]>({
      tableName: 'focus_achievements',
      method: 'POST',
      headers: {
        'Prefer': 'return=representation,resolution=merge-duplicates',
        'Content-Type': 'application/json'
      },
      body: {
        updated_at: new Date().toISOString(),
        user_id: userId,
        achievement_key: achievementKey
      }
    });

    if (error) {
      handleError(error, 'achievementsApi.updateAchievementProgress', 'Failed to update achievement progress', {});
      throw error;
    }
    return data?.[0];
  }
};


// Energy Log API (Assuming 'energy_logs8')
export const energyLogsApi = {
  async getEnergyLogs(userId: string, startDate: string, endDate?: string): Promise<any[]> {
    let endpoint = '/rest/v1/focus_moods?user_id=eq.${userId}&timestamp=gte.${startDate}&select=*'; // Corrected table name to focus_moods (per ssot8001)
    if (endDate) {
        endpoint += `&timestamp=lte.${endDate}`;
    }
    endpoint += '&order=timestamp.asc';

    const { data, error } = await supabaseRequest<any[]>({
      tableName: 'focus_moods',
      method: 'GET',
      params: { user_id: `eq.${userId}`, timestamp: `gte.${startDate}`, select: '*', order: 'timestamp.asc' }
    });
    if (error) {
      handleError(error, 'energyLogsApi.getEnergyLogs', 'Failed to fetch energy logs', {});
      throw error;
    }
    return data || [];
  },

  async saveEnergyLog(logData: Partial<any>): Promise<any> {
    const { data, error } = await supabaseRequest<any[]>({
      tableName: 'focus_moods',
      method: 'POST',
      headers: { 'Prefer': 'return=representation' },
      body: logData
    });
    if (error) {
      handleError(error, 'energyLogsApi.saveEnergyLog', 'Failed to save energy log', {});
      throw error;
    }
    return data?.[0];
  },
  // Add update/delete if needed
};


// Recovery Recommendations API (Assuming table 'recovery_recommendations8')
export const recoveryApi = {
  async getRecoveryRecommendations(energyLevel: string, energyType: string): Promise<any[]> {
    const { data, error } = await supabaseRequest<any[]>({
      tableName: 'recovery_recommendations',
      method: 'GET',
      params: { energy_level: `eq.${energyLevel}`, energy_type: `eq.${energyType}`, select: '*' }
    });
    if (error) {
      handleError(error, 'recoveryApi.getRecoveryRecommendations', 'Failed to fetch recovery recommendations', {});
      throw error;
    }
    return data || [];
  },

   async getAllRecoveryRecommendations(): Promise<any[]> {
     const { data, error } = await supabaseRequest<any[]>({
      tableName: 'recovery_recommendations',
      method: 'GET',
      params: { select: '*' }
    });
     if (error) {
      handleError(error, 'recoveryApi.getAllRecoveryRecommendations', 'Failed to fetch all recovery recommendations', {});
      throw error;
    }
    return data || [];
  },
};


// User Interventions API (Assuming table 'user_interventions8')
export const interventionsApi = {
  async getUserInterventions(userId: string, limit = 10): Promise<any[]> {
    const { data, error } = await supabaseRequest<any[]>({
      tableName: 'user_interventions',
      method: 'GET',
      params: {
        user_id: `eq.${userId}`,
        order: 'timestamp.desc',
        limit: String(limit),
        select: '*'
      }
    });
    if (error) {
      handleError(error, 'interventionsApi.getUserInterventions', 'Failed to fetch user interventions', {});
      throw error;
    }
    return data || [];
  },

  async logIntervention(interventionData: InterventionData): Promise<any> {
    const { data, error } = await supabaseRequest<any[]>({
      tableName: 'user_interventions',
      method: 'POST',
      headers: { 'Prefer': 'return=representation' },
      body: interventionData
    });
    if (error) {
      handleError(error, 'interventionsApi.logIntervention', 'Failed to log intervention', {});
      throw error;
    }
    return data?.[0];
  },

  async updateInterventionEffectiveness(interventionId: string, rating: number, notes: string): Promise<any> {
    const { data, error } = await supabaseRequest<any[]>({
      tableName: 'user_interventions',
      method: 'PATCH',
      params: { id: `eq.${interventionId}`, select: '*' },
      headers: { 'Prefer': 'return=representation' },
      body: {
        effectiveness_rating: rating,
        effectiveness_notes: notes
      }
    });
    if (error) {
      handleError(error, 'interventionsApi.updateInterventionEffectiveness', `Failed to update effectiveness for intervention ${interventionId}`, {});
      throw error;
    }
    return data?.[0];
  },
};

// User Rhythms API (Assuming table 'user_rhythms8')
export const rhythmsApi = {
  async getUserRhythms(userId: string, date: string): Promise<any | null> {
    const { data, error } = await supabaseRequest<any[]>({
      tableName: 'user_rhythms',
      method: 'GET',
      params: { user_id: `eq.${userId}`, date: `eq.${date}`, select: '*' }
    });
    if (error) {
      if (error.message.includes('fetch failed') || error.message.includes('Not Found')) return null;
      handleError(error, 'rhythmsApi.getUserRhythms', 'Failed to fetch user rhythms', {});
      throw error;
    }
    return data?.[0] || null;
  },

  async saveUserRhythm(rhythmData: Partial<any>): Promise<any> {
    const { data, error } = await supabaseRequest<any[]>({
      tableName: 'user_rhythms',
      method: 'POST',
      headers: { 'Prefer': 'return=representation,resolution=merge-duplicates' },
      body: rhythmData
    });
    if (error) {
      handleError(error, 'rhythmsApi.saveUserRhythm', 'Failed to save user rhythm', {});
      throw error;
    }
    return data?.[0];
  },
  // Add update/delete if needed
};

// User Strategies API (Assuming 'user_strategies8' linking 'focus_strategies8')
export const userStrategiesApi = {
    async getUserStrategies(userId: string, energyType: string | null = null): Promise<any[]> {
        const { data, error } = await supabaseRequest<any[]>({
          tableName: 'focus_strategies',
          method: 'GET',
          params: { user_id: `eq.${userId}`, select: '*' }
        });
        if (error) {
          handleError(error, 'userStrategiesApi.getUserStrategies', 'Failed to fetch user strategies', {});
          throw error;
        }
        return data || [];
    },

    async saveUserStrategy(strategyLinkData: {user_id: string, strategy_id: string, [key: string]: any}): Promise<any> {
         const { data, error } = await supabaseRequest<any[]>({
           tableName: 'user_strategies',
           method: 'POST',
           headers: { 'Prefer': 'return=representation,resolution=merge-duplicates' },
           body: strategyLinkData
         });
        if (error) {
          handleError(error, 'userStrategiesApi.saveUserStrategy', 'Failed to save user strategy link', {});
          throw error;
        }
        return data?.[0];
    },

    async updateUserStrategy(userStrategyId: string, strategyLinkData: Partial<any>): Promise<any> {
         const { data, error } = await supabaseRequest<any[]>({
           tableName: 'user_strategies',
           method: 'PATCH',
           params: { id: `eq.${userStrategyId}`, select: '*' },
           headers: { 'Prefer': 'return=representation' },
           body: strategyLinkData
         });
        if (error) {
          handleError(error, 'userStrategiesApi.updateUserStrategy', `Failed to update user strategy link ${userStrategyId}`, {});
          throw error;
        }
        return data?.[0];
    },

    async deleteUserStrategy(userStrategyId: string): Promise<void> {
         const { error } = await supabaseRequest<null>({
           tableName: 'user_strategies',
           method: 'DELETE',
           params: { id: `eq.${userStrategyId}` }
        });
        if (error) {
          handleError(error, 'userStrategiesApi.deleteUserStrategy', `Failed to delete user strategy link ${userStrategyId}`, {});
          throw error;
        }
    },

   async toggleFavoriteStrategy(strategyId: string, isFavorite: boolean, userId: string): Promise<void> {
       const { data: existingLinks, error: findError } = await supabaseRequest<any[]>({
           tableName: 'user_strategies',
           method: 'GET',
           params: { user_id: `eq.${userId}`, strategy_id: `eq.${strategyId}`, select: 'id' }
       });

       if (findError) {
           handleError(findError, 'userStrategiesApi.toggleFavoriteStrategy.find', 'Failed to check existing strategy link', {});
           throw findError;
       }

       if (existingLinks && existingLinks.length > 0) {
           const userStrategyId = existingLinks[0].id;
           const { error: updateError } = await supabaseRequest<null>({
               tableName: 'user_strategies',
               method: 'PATCH',
               params: { id: `eq.${userStrategyId}` },
               body: { is_favorite: isFavorite }
           });
           if (updateError) {
               handleError(updateError, 'userStrategiesApi.toggleFavoriteStrategy', `Failed to update favorite status for strategy link ${userStrategyId}`, {});
               throw updateError;
           }
       }
   },

    async incrementStrategyUsage(strategyId: string, userId: string): Promise<any> {
         const { data, error } = await supabaseRequest<any>({
           tableName: 'rpc',
           method: 'POST',
           body: JSON.stringify({ p_user_id: userId, p_strategy_id: strategyId })
         });

         if (error) {
             handleError(error, 'userStrategiesApi.incrementStrategyUsage', `Failed to increment usage for strategy ${strategyId}`, {});
             console.error(`Failed to increment usage for strategy ${strategyId}`, error);
             // Decide if you want to throw the error or just log it
             // throw error;
         }
         return data;
    },

    async getUserFavoriteStrategies(userId: string): Promise<any[]> {
        const { data, error } = await supabaseRequest<any[]>({
            tableName: 'user_strategies',
            method: 'GET',
            params: { user_id: `eq.${userId}`, is_favorite: `eq.true`, select: '*,focus_strategy:focus_strategies(*)' }
        });
         if (error) {
          handleError(error, 'userStrategiesApi.getUserFavoriteStrategies', 'Failed to fetch favorite user strategies', {});
          throw error;
        }
        return data || [];
    },
};


// User Factors Analysis API (Assuming table 'user_factors_analysis8')
export const factorsAnalysisApi = {
  async getUserFactorsAnalysis(userId: string, date: string): Promise<any | null> {
    const { data, error } = await supabaseRequest<any[]>({
      tableName: 'user_factors_analysis',
      method: 'GET',
      params: { user_id: `eq.${userId}`, date: `eq.${date}`, select: '*' }
    });
    if (error) {
      if (error.message.includes('fetch failed') || error.message.includes('Not Found')) return null;
      handleError(error, 'factorsAnalysisApi.getUserFactorsAnalysis');
      throw error;
    }
    return data?.[0] || null;
  },

  async saveUserFactorsAnalysis(factorsData: Partial<any>): Promise<any> {
    const { data, error } = await supabaseRequest<any[]>({
      tableName: 'user_factors_analysis',
      method: 'POST',
      headers: { 'Prefer': 'return=representation,resolution=merge-duplicates' },
      body: factorsData
    });
    if (error) {
      handleError(error, 'factorsAnalysisApi.saveUserFactorsAnalysis');
      throw error;
    }
    return data?.[0];
  },
  // Add update/delete if needed
};

// Anti-Fatigue Settings API (Assuming table 'user_settings8', column 'anti_fatigue_settings')
export const antiFatigueSettingsApi = {
  async getUserAntiFatigueSettings(userId: string): Promise<any | null> {
    const { data, error } = await supabaseRequest<any[]>({
      tableName: 'focus_settings',
      method: 'GET',
      params: { user_id: `eq.${userId}`, select: 'anti_fatigue_settings' }
    });
    if (error) {
      if (error.message.includes('fetch failed') || error.message.includes('Not Found')) return null;
      handleError(error, 'antiFatigueSettingsApi.getUserAntiFatigueSettings');
      throw error;
    }
    return data?.[0]?.anti_fatigue_settings || null;
  },

  async updateUserAntiFatigueSettings(userId: string, settingsData: any): Promise<void> {
    const { data: existing, error: findError } = await supabaseRequest<any[]>({
      tableName: 'focus_settings',
      method: 'GET',
      params: { user_id: `eq.${userId}`, select: 'id' }
    });

    if (findError && !(findError.message.includes('fetch failed') || findError.message.includes('Not Found'))) {
      handleError(findError, 'antiFatigueSettingsApi.updateUserAntiFatigueSettings');
      throw findError;
    }

    const settingsId = existing?.[0]?.id;

    if (settingsId) {
      const { error: patchError } = await supabaseRequest<null>({
        tableName: 'focus_settings',
        method: 'PATCH',
        params: { id: `eq.${settingsId}` },
        body: { anti_fatigue_settings: settingsData }
      });

      if (patchError) {
        handleError(patchError, 'antiFatigueSettingsApi.updateUserAntiFatigueSettings');
        throw patchError;
      }
    } else {
      const { error: createError } = await supabaseRequest<null>({
        tableName: 'focus_settings',
        method: 'POST',
        body: {
          user_id: userId,
          anti_fatigue_settings: settingsData
        }
      });

      if (createError) {
        handleError(createError, 'antiFatigueSettingsApi.updateUserAntiFatigueSettings');
        throw createError;
      }
    }
  },
};

// Stats API (Assuming 'user_stats8')
export const statsApi = {
  async getStats(userId: string): Promise<any | null> {
    const { data, error } = await supabaseRequest<any[]>({
      tableName: 'focus_stats',
      method: 'GET',
      params: { user_id: `eq.${userId}`, select: '*' }
    });
    if (error) {
      if (error.message.includes('fetch failed') || error.message.includes('Not Found')) return null;
      handleError(error, 'statsApi.getStats', 'Failed to fetch user stats');
      throw error;
    }
    return data?.[0] || null;
  },

  async updateStats(userId: string, statsData: Partial<any>): Promise<void> {
    const { data: existing, error: findError } = await supabaseRequest<any[]>({
      tableName: 'focus_stats',
      method: 'GET',
      params: { user_id: `eq.${userId}`, select: 'id' }
    });

    if (findError && !(findError.message.includes('fetch failed') || findError.message.includes('Not Found'))) {
      handleError(findError, 'statsApi.updateStats', 'Failed to check for existing user stats');
      throw findError;
    }

    const statsId = existing?.[0]?.id;

    if (statsId) {
      const { error } = await supabaseRequest<null>({
        tableName: 'focus_stats',
        method: 'PATCH',
        params: { id: `eq.${statsId}` },
        body: { ...statsData, updated_at: new Date().toISOString() }
      });
      if (error) {
        handleError(error, 'statsApi.updateStats', 'Failed to update user stats');
        throw error;
      }
    } else {
      const { error } = await supabaseRequest<any>({
        tableName: 'focus_stats',
        method: 'POST',
        headers: { 'Prefer': 'return=minimal' },
        body: {
          ...statsData,
          user_id: userId,
          created_at: new Date().toISOString(),
          updated_at: new Date().toISOString()
        }
      });
      if (error) {
        handleError(error, 'statsApi.updateStats', 'Failed to create user stats');
        throw error;
      }
    }
  },
};

// Analytics API (Needs specific RPC functions or complex queries)
export const analyticsApi = {
  async getFocusTimeSeriesData(userId: string, timeRange: string = '30d'): Promise<any[]> {
    const { data, error } = await supabaseRequest<any[]>({
      tableName: 'rpc/get_focus_time_series',
      method: 'POST',
      body: { p_user_id: userId, p_time_range: timeRange }
    });
    if (error) {
      handleError(error, 'analyticsApi.getFocusTimeSeriesData', 'Failed to fetch focus time series data', {});
      throw error;
    }
    return data || [];
  },

  async getProductivityTrends(userId: string, timeRange: string = '30d'): Promise<any[]> {
    const { data, error } = await supabaseRequest<any[]>({
      tableName: 'rpc/get_productivity_trends',
      method: 'POST',
      body: { p_user_id: userId, p_time_range: timeRange }
    });
    if (error) {
      handleError(error, 'analyticsApi.getProductivityTrends', 'Failed to fetch productivity trends', {});
      throw error;
    }
    return data || [];
  },

  async getDistractionImpact(userId: string, timeRange: string = '30d'): Promise<any[]> {
    const { data, error } = await supabaseRequest<any[]>({
      tableName: 'rpc/get_distraction_impact',
      method: 'POST',
      body: { p_user_id: userId, p_time_range: timeRange }
    });
    if (error) {
      handleError(error, 'analyticsApi.getDistractionImpact', 'Failed to fetch distraction impact data', {});
      throw error;
    }
    return data || [];
  },

   // Placeholder for task completion analytics
   async getTaskCompletionStats(userId: string, timeRange: string = '30d'): Promise<any[]> {
       const { data, error } = await supabaseRequest<any[]>({
           tableName: 'rpc/get_task_completion_stats', // Needs this RPC function created in Supabase
           method: 'POST',
           body: { p_user_id: userId, p_time_range: timeRange }
       });
      if (error) { handleError(error, 'analyticsApi.getTaskCompletionStats', 'Failed to fetch task completion stats', {}); throw error; }
      return data || []; // Expected format might be [{ date: 'YYYY-MM-DD', completed_count: 5, avg_completion_time_minutes: 45 }, ...]
   },

   // Placeholder for distraction pattern analysis
   async getDistractionPatterns(userId: string, timeRange: string = '30d'): Promise<any[]> {
       const { data, error } = await supabaseRequest<any[]>({
           tableName: 'rpc/get_distraction_patterns', // Needs this RPC function created in Supabase
           method: 'POST',
           body: { p_user_id: userId, p_time_range: timeRange }
       });
      if (error) { handleError(error, 'analyticsApi.getDistractionPatterns', 'Failed to fetch distraction patterns', {}); throw error; }
      return data || []; // Expected format might be [{ trigger: 'Notification', count: 15, feeling: 'Anxious', count: 5 }, ...]
   },

  async getFocusStatsByContext(userId: string, timeRange: string = '30d'): Promise<any[]> {
      const { data, error } = await supabaseRequest<any[]>({
           tableName: 'rpc/get_focus_stats_by_context',
           method: 'POST',
           body: { p_user_id: userId, p_time_range: timeRange }
       });
      if (error) {
          handleError(error, 'analyticsApi.getFocusStatsByContext', 'Failed to fetch focus stats by context', {});
          throw error;
      }
      return data || [];
  },
  // ... (add userId to other analytics calls as needed)
};


// Widget Configuration API (Assuming 'user_settings8' column 'widget_configuration')
export const widgetConfigApi = {
  async saveWidgetConfiguration(userId: string, widgetConfig: any): Promise<void> {
    const { data: existing, error: findError } = await supabaseRequest<any[]>({
      tableName: 'focus_settings',
      method: 'GET',
      params: { user_id: `eq.${userId}`, select: 'id' }
    });
    if (findError && !(findError.message.includes('fetch failed') || findError.message.includes('Not Found'))) {
      handleError(findError, 'widgetConfigApi.saveWidgetConfiguration', 'Failed to check for existing user settings');
      throw findError;
    }
    const settingsId = existing?.[0]?.id;

    if (settingsId) {
      const { error } = await supabaseRequest<null>({
        tableName: 'focus_settings',
        method: 'PATCH',
        params: { id: `eq.${settingsId}` },
        body: { widget_configuration: widgetConfig, updated_at: new Date().toISOString() }
      });
      if (error) {
        handleError(error, 'widgetConfigApi.saveWidgetConfiguration', 'Failed to update widget configuration');
        throw error;
      }
    } else {
      const { error } = await supabaseRequest<any>({
        tableName: 'focus_settings',
        method: 'POST',
        headers: { 'Prefer': 'return=minimal' },
        body: {
          user_id: userId,
          widget_configuration: widgetConfig,
          created_at: new Date().toISOString(),
          updated_at: new Date().toISOString()
        }
      });
      if (error) {
        handleError(error, 'widgetConfigApi.saveWidgetConfiguration', 'Failed to create widget configuration');
        throw error;
      }
    }
  },

  async getWidgetConfiguration(userId: string): Promise<any | null> {
    const { data, error } = await supabaseRequest<any[]>({
      tableName: 'focus_settings',
      method: 'GET',
      params: { user_id: `eq.${userId}`, select: 'widget_configuration' }
    });
    if (error) {
      if (error.message.includes('fetch failed') || error.message.includes('Not Found')) return null;
      handleError(error, 'widgetConfigApi.getWidgetConfiguration', 'Failed to fetch widget configuration');
      throw error;
    }
    return data?.[0]?.widget_configuration || null;
  },
};


// AI Insights API (Likely RPC calls)
export const aiInsightsApi = {
  async generateFocusInsights(userId: string): Promise<any[]> {
    const { data, error } = await supabaseRequest<any[]>({
      tableName: 'rpc/generate_focus_insights',
      method: 'POST',
      body: { p_user_id: userId }
    });
    if (error) {
      handleError(error, 'aiInsightsApi.generateFocusInsights', 'Failed to generate focus insights');
      throw error;
    }
    return data || [];
  }
};

// Context Switching API (Tables: 'context_templates8', 'saved_contexts8', 'context_switch_logs8', 'context_snapshots8')
export const contextSwitchApi = {
  async getSwitchingTemplates(userId: string): Promise<any[]> {
    const { data, error } = await supabaseRequest<any[]>({
      tableName: 'context_switch_templates',
      method: 'GET',
      params: { user_id: `eq.${userId}`, select: '*' }
    });
    if (error) {
      handleError(error, 'contextSwitchApi.getSwitchingTemplates');
      throw error;
    }
    return data || [];
  },

  async createSwitchingTemplate(templateData: Partial<any>): Promise<any> {
    const { data, error } = await supabaseRequest<any[]>({
      tableName: 'context_switch_templates',
      method: 'POST',
      headers: { 'Prefer': 'return=representation' },
      body: templateData
    });
    if (error) {
      handleError(error, 'contextSwitchApi.createSwitchingTemplate');
      throw error;
    }
    return data?.[0];
  },

  async updateSwitchingTemplate(templateId: string, templateData: Partial<any>): Promise<any> {
    const { data, error } = await supabaseRequest<any[]>({
      tableName: 'context_switch_templates',
      method: 'PATCH',
      params: { id: `eq.${templateId}` },
      headers: { 'Prefer': 'return=representation' },
      body: templateData
    });
    if (error) {
      handleError(error, 'contextSwitchApi.updateSwitchingTemplate');
      throw error;
    }
    return data?.[0];
  },

  async deleteSwitchingTemplate(templateId: string): Promise<void> {
    const { error } = await supabaseRequest<null>({
      tableName: 'context_switch_templates',
      method: 'DELETE',
      params: { id: `eq.${templateId}` }
    });
    if (error) {
      handleError(error, 'contextSwitchApi.deleteSwitchingTemplate');
      throw error;
    }
  },

  async getSavedContexts(userId: string): Promise<any[]> {
    const { data, error } = await supabaseRequest<any[]>({
      tableName: 'saved_contexts',
      method: 'GET',
      params: { user_id: `eq.${userId}`, select: '*' }
    });
    if (error) {
      handleError(error, 'contextSwitchApi.getSavedContexts');
      throw error;
    }
    return data || [];
  },

  async createSavedContext(context: Partial<any>, userId: string): Promise<any> {
    const { data, error } = await supabaseRequest<any[]>({
      tableName: 'saved_contexts',
      method: 'POST',
      headers: { 'Prefer': 'return=representation' },
      body: { ...context, user_id: userId, created_at: new Date().toISOString(), last_used: new Date().toISOString() }
    });
    if (error) {
      handleError(error, 'contextSwitchApi.createSavedContext', 'Failed to create saved context', {});
      throw error;
    }
    return data?.[0];
  },

  async updateSavedContext(contextId: string, context: Partial<any>): Promise<any> {
    const { data, error } = await supabaseRequest<any[]>({
      tableName: 'saved_contexts',
      method: 'PATCH',
      params: { id: `eq.${contextId}` }, // Filter by ID
      headers: { 'Prefer': 'return=representation' },
      body: { ...context, updated_at: new Date().toISOString(), last_used: new Date().toISOString() }
    });
    if (error) {
      handleError(error, 'contextSwitchApi.updateSavedContext', 'Failed to update saved context', {});
      throw error;
    }
    return data?.[0];
  },

  async deleteSavedContext(contextId: string): Promise<void> {
    const { error } = await supabaseRequest<null>({
      tableName: 'saved_contexts',
      method: 'DELETE',
      params: { id: `eq.${contextId}` }
    });
    if (error) {
      handleError(error, 'contextSwitchApi.deleteSavedContext', 'Failed to delete saved context', {});
      throw error;
    }
  },

  async getContextSwitchLogs(userId: string, limit = 20): Promise<any[]> {
    const { data, error } = await supabaseRequest<any[]>({
      tableName: 'context_switch_logs',
      method: 'GET',
      params: {
        user_id: `eq.${userId}`,
        order: 'timestamp.desc',
        limit: String(limit),
        select: '*'
      }
    });
    if (error) {
      handleError(error, 'contextSwitchApi.getContextSwitchLogs', 'Failed to fetch context switch logs', {});
      throw error;
    }
    return data || [];
  },

  async createContextSwitchLog(log: Partial<any>, userId: string): Promise<any> {
    const { data, error } = await supabaseRequest<any[]>({
      tableName: 'context_switch_logs',
      method: 'POST',
      headers: { 'Prefer': 'return=representation' },
      body: { ...log, user_id: userId, timestamp: new Date().toISOString() }
    });
    if (error) {
      handleError(error, 'contextSwitchApi.createContextSwitchLog', 'Failed to create context switch log', {});
      throw error;
    }
    return data?.[0];
  },

  async getContextSwitchStats(userId: string): Promise<any | null> {
    const { data, error } = await supabaseRequest<any[]>({
      tableName: 'context_switch_stats',
      method: 'GET',
      params: { user_id: `eq.${userId}`, select: '*' }
    });
    if (error) {
      if (error.message.includes('fetch failed') || error.message.includes('Not Found')) return null;
      handleError(error, 'contextSwitchApi.getContextSwitchStats', 'Failed to fetch context switch stats', {});
      throw error;
    }
    return data?.[0] || null;
  },

  async updateContextSwitchStats(stats: Partial<any>, userId: string): Promise<void> {
    const { data: existing, error: findError } = await supabaseRequest<any[]>({
      tableName: 'context_switch_stats',
      method: 'GET',
      params: { user_id: `eq.${userId}`, select: 'id' }
    });
    if (findError && !(findError.message.includes('fetch failed') || findError.message.includes('Not Found'))) {
      handleError(findError, 'contextSwitchApi.updateContextSwitchStats', 'Failed to check for existing context switch stats', {});
      throw findError;
    }
    const statsId = existing?.[0]?.id;

    if (statsId) {
      const { error } = await supabaseRequest<null>({
        tableName: 'context_switch_stats',
        method: 'PATCH',
        params: { id: `eq.${statsId}` },
        body: { ...stats, updated_at: new Date().toISOString() }
      });
      if (error) {
        handleError(error, 'contextSwitchApi.updateContextSwitchStats', 'Failed to update context switch stats', {});
        throw error;
      }
    } else {
      const { error } = await supabaseRequest<any>({
        tableName: 'context_switch_stats',
        method: 'POST',
        headers: { 'Prefer': 'return=minimal' }, // Use minimal for create if no representation needed
        body: { ...stats, user_id: userId, created_at: new Date().toISOString(), updated_at: new Date().toISOString() }
      });
      if (error) {
        handleError(error, 'contextSwitchApi.updateContextSwitchStats', 'Failed to create context switch stats', {});
        throw error;
      }
    }
  },

  async getContextSnapshots(userId: string, contextId: string | null = null): Promise<any[]> {
    const params: Record<string, string> = {
      user_id: `eq.${userId}`,
      select: '*',
      order: 'created_at.desc'
    };
    if (contextId) {
      params['context_id'] = `eq.${contextId}`;
    }

    const { data, error } = await supabaseRequest<any[]>({
      tableName: 'context_snapshots',
      method: 'GET',
      params
    });
    if (error) {
      handleError(error, 'contextSwitchApi.getContextSnapshots', 'Failed to fetch context snapshots', {});
      throw error;
    }
    return data || [];
  },

  async createContextSnapshot(snapshot: Partial<any>, userId: string): Promise<any> {
    const { data, error } = await supabaseRequest<any[]>({
      tableName: 'context_snapshots',
      method: 'POST',
      headers: { 'Prefer': 'return=representation' },
      body: { ...snapshot, user_id: userId, created_at: new Date().toISOString() }
    });
    if (error) {
      handleError(error, 'contextSwitchApi.createContextSnapshot', 'Failed to create context snapshot', {});
      throw error;
    }
    return data?.[0];
  },

  async deleteContextSnapshot(snapshotId: string): Promise<void> {
    const { error } = await supabaseRequest<null>({
      tableName: 'context_snapshots',
      method: 'DELETE',
      params: { id: `eq.${snapshotId}` }
    });
    if (error) {
      handleError(error, 'contextSwitchApi.deleteContextSnapshot', 'Failed to delete context snapshot', {});
      throw error;
    }
  },
};

// Distraction Block Rules API (Assuming table 'distraction_block_rules')
export const distractionRulesApi = {
  async getRules(userId: string): Promise<any[]> {
    const { data, error } = await supabaseRequest<any[]>({
      tableName: 'distraction_block_rules',
      method: 'GET',
      params: {
        user_id: `eq.${userId}`,
        select: '*',
        order: 'created_at.asc'
      }
    });
    if (error) {
      handleError(error, 'distractionRulesApi.getRules', 'Failed to fetch distraction rules', {});
      throw error;
    }
    return data || [];
  },

  async createRule(ruleData: Partial<BlockRule>): Promise<any> {
    const payload = {
      ...ruleData,
      user_id: ruleData.user_id, // Ensure user_id is present
      created_at: new Date().toISOString(),
    };
    const { data, error } = await supabaseRequest<any[]>({
      tableName: 'distraction_block_rules',
      method: 'POST',
      headers: { 'Prefer': 'return=representation' },
      body: payload
    });
    if (error) {
      handleError(error, 'distractionRulesApi.createRule', 'Failed to create distraction rule', {});
      throw error;
    }
    return data?.[0];
  },

  async updateRule(id: string, ruleData: Partial<BlockRule>): Promise<any> {
    const payload = {
      ...ruleData,
      updated_at: new Date().toISOString()
    };
    const { data, error } = await supabaseRequest<any[]>({
      tableName: 'distraction_block_rules',
      method: 'PATCH',
      params: { id: `eq.${id}` },
      headers: { 'Prefer': 'return=representation' },
      body: payload
    });
    if (error) {
      handleError(error, 'distractionRulesApi.updateRule', `Failed to update distraction rule ${id}`, {});
      throw error;
    }
    return data?.[0];
  },

  async deleteRule(id: string): Promise<void> {
    const { error } = await supabaseRequest<null>({
      tableName: 'distraction_block_rules',
      method: 'DELETE',
      params: { id: `eq.${id}` }
    });
    if (error) {
      handleError(error, 'distractionRulesApi.deleteRule', `Failed to delete distraction rule ${id}`, {});
      throw error;
    }
  },
};


// Community API (Posts, Comments, Likes)
// Assuming tables: community_posts, community_comments, community_likes, profiles
export const communityApi = {
  // --- Posts ---
  async getPosts(limit = 20, offset = 0): Promise<any[]> {
    const selectQuery = '*,profile:profiles(username,avatar_url)';
    const { data, error } = await supabaseRequest<any[]>({
      tableName: 'community_posts',
      method: 'GET',
      params: {
        select: selectQuery,
        order: 'created_at.desc',
        limit: String(limit),
        offset: String(offset)
      }
    });
    if (error) {
      handleError(error, 'communityApi.getPosts', 'Failed to fetch community posts', {});
      throw error;
    }
    return data || [];
  },

  async createPost(postData: { user_id: string; title: string; content: string }): Promise<any> {
    const { data, error } = await supabaseRequest<any[]>({
      tableName: 'community_posts',
      method: 'POST',
      headers: { 'Prefer': 'return=representation' },
      params: { select: '*,profile:profiles(username,avatar_url)' }, // Select profile on create
      body: postData,
    });
    if (error) {
      handleError(error, 'communityApi.createPost', 'Failed to create community post', {});
      throw error;
    }
    return data?.[0];
  },

  // --- Comments ---
  async getComments(postId: string, limit = 50, offset = 0): Promise<any[]> {
    const { data, error } = await supabaseRequest<any[]>({
      tableName: 'community_comments',
      method: 'GET',
      params: {
        post_id: `eq.${postId}`,
        select: '*,profile:profiles(username,avatar_url)',
        order: 'created_at.asc',
        limit: String(limit),
        offset: String(offset)
      }
    });
    if (error) {
      handleError(error, 'communityApi.getComments', `Failed to fetch comments for post ${postId}`, {});
      throw error;
    }
    return data || [];
  },

  async createComment(commentData: { user_id: string; post_id: string; content: string }): Promise<any> {
    const { data, error } = await supabaseRequest<any[]>({
      tableName: 'community_comments',
      method: 'POST',
      headers: { 'Prefer': 'return=representation' },
      params: { select: '*,profile:profiles(username,avatar_url)' }, // Select profile on create
      body: commentData,
    });
    if (error) {
      handleError(error, 'communityApi.createComment', 'Failed to create community comment', {});
      throw error;
    }
    return data?.[0];
  },

  // --- Likes ---
  async likePost(postId: string, userId: string): Promise<void> {
    const { error } = await supabaseRequest<null>({
      tableName: 'community_likes',
      method: 'POST',
      headers: { 'Prefer': 'return=minimal,resolution=ignore-duplicates' }, // Use minimal, ignore duplicates
      body: { user_id: userId, post_id: postId },
    });
    if (error) {
      handleError(error, 'communityApi.likePost', `Failed to like post ${postId}`, {});
      throw error;
    }
  },

  async unlikePost(postId: string, userId: string): Promise<void> {
    const { data, error } = await supabaseRequest<null>({
      tableName: 'community_likes',
      method: 'DELETE',
      params: { user_id: `eq.${userId}`, post_id: `eq.${postId}` },
      headers: { 'Prefer': 'return=minimal' }
    });
    if (error) {
      // Check error details. Supabase might return specific codes for not found/constraint issues.
      const errorCode = error?.code;
      const errorMessage = error?.message?.toLowerCase();
      
      // Example check for common Supabase/Postgres errors (adjust codes/messages as needed)
      if (errorCode === '23503' || errorCode === 'PGRST116' || (errorMessage && errorMessage.includes('not found'))) {
        console.warn(`Attempted to unlike post ${postId} which was likely already unliked or did not exist. Code: ${errorCode}, Msg: ${errorMessage}`);
      } else {
        handleError(error, 'communityApi.unlikePost', `Failed to unlike post ${postId}`, {});
        throw error;
      }
    }
  },

  async getUserLikedPosts(postIds: string[], userId: string): Promise<string[]> {
    if (!postIds || postIds.length === 0) return [];
    const { data, error } = await supabaseRequest<{ post_id: string }[]>({
      tableName: 'community_likes',
      method: 'GET',
      params: {
        user_id: `eq.${userId}`,
        post_id: `in.(${postIds.join(',')})`,
        select: 'post_id'
      }
    });
    if (error) {
      handleError(error, 'communityApi.getUserLikedPosts', 'Failed to fetch likes for posts', {}); // Renamed function in API
      throw error;
    }
    return (data || []).map((like: { post_id: string }) => like.post_id);
  },
};

// Settings API (Using 'focus_settings' table)
export const settingsApi = {
  async getSettings(userId: string): Promise<any | null> {
    const { data, error } = await supabaseRequest<any[]>({
      tableName: 'focus_settings',
      method: 'GET',
      params: { user_id: `eq.${userId}`, select: '*', limit: '1' }
    });
    if (error) {
      // Check if the error indicates 'not found'
      const errorCode = error?.code;
      const errorMessage = error?.message?.toLowerCase();
      
      // PGRST116 is Supabase code for zero rows matching filter
      if (errorCode === 'PGRST116' || (errorMessage && errorMessage.includes('no rows found'))) {
        console.log(`No settings found for user ${userId}, returning null.`);
        return null;
      }
      // Otherwise, handle as a real error
      handleError(error, 'settingsApi.getSettings', 'Failed to fetch settings', {});
      throw error;
    }
    return data?.[0] || null;
  },

  async upsertSettings(userId: string, settingsPayload: { settings: any }): Promise<any> {
    const dataToUpsert = { user_id: userId, settings: settingsPayload.settings, updated_at: new Date().toISOString() };

    const { data, error } = await supabaseRequest<any[]>({
      tableName: 'focus_settings',
      method: 'POST', // POST with merge-duplicates acts as upsert on constraint
      headers: {
        'Prefer': 'return=representation,resolution=merge-duplicates',
        'Content-Type': 'application/json',
      },
      // Assuming a unique constraint exists on user_id for upsert to work
      body: dataToUpsert,
      params: { select: '*' } // Ensure the result is returned
    });
    if (error) {
      handleError(error, 'settingsApi.upsertSettings', 'Failed to upsert settings', {});
      throw error;
    }
    return data?.[0];
  },
};

// Note: Ensure all assumed table names (e.g., focus_tasks, energy_levels8, focus_strategies8, etc.)
// and RPC function names match the actual Supabase schema and functions. Check table names like 'profiles', 'community_posts', etc.
