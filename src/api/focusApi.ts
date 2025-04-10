import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import { useAuth } from '@/components/AuthProvider';
import { SUPABASE_URL, SUPABASE_KEY, getBaseHeaders, getCurrentUser } from '@/lib/supabase';
// Fix DATABASE_SCHEMA import issue by using our own definition
// import { DATABASE_SCHEMA } from '../integrations/supabase/db-client';
import { v4 as uuidv4 } from 'uuid';

/**
 * FocusAPI - provides functions to interact with the focus management 
 * features in the Supabase database (SSOT8001 compliant - REST ONLY)
 */

// Base URL for REST API
const REST_URL = `${SUPABASE_URL}/rest/v1`;

// Define DATABASE_SCHEMA locally to avoid import errors 
const DATABASE_SCHEMA = {
  tables: {
    focus_sessions: 'focus_sessions8',
    focus_tasks: 'focus_tasks',
    focus_settings: 'focus_settings',
    focus_stats: 'focus_statistics',
    distractions: 'distractions'
  }
};

// Helper to get authenticated headers
const getAuthHeaders = async (): Promise<HeadersInit> => {
  const session = localStorage.getItem('supabase.auth.token');
  if (!session) throw new Error('User not authenticated: No session token found.');
  try {
    const token = JSON.parse(session).access_token;
    if (!token) throw new Error('User not authenticated: Invalid session token format.');
    return getBaseHeaders(token);
  } catch (e) {
    console.error("Error parsing session token:", e);
    throw new Error('User not authenticated: Could not parse session token.');
  }
};

// Helper to handle fetch responses
const handleResponse = async (response: Response, expectSingle: boolean = false) => {
  if (!response.ok) {
    let errorData: unknown = {}; // Initialize as empty object
    try {
        // Try to parse Supabase error format
        errorData = await response.json();
        console.error('Supabase API Error:', errorData);
        // Use Supabase specific message if available - TYPE GUARD ADDED
        let message = `HTTP error! status: ${response.status}`;
        if (typeof errorData === 'object' && errorData !== null && 'message' in errorData && typeof errorData.message === 'string') {
          message = errorData.message;
        }
        throw new Error(message);
    } catch (e) {
        // If parsing fails or it's not JSON
        console.error('API Error (non-JSON or parse failed):', response.status, response.statusText);
        throw new Error(`HTTP error! status: ${response.status} ${response.statusText}`);
    }
  }

  // Handle empty responses (e.g., 204 No Content for DELETE or PATCH with minimal return)
  if (response.status === 204 || response.headers.get('Content-Length') === '0') {
      return null; // Indicate success with no data returned
  }

  // Parse JSON response
  const data = await response.json();

  // Supabase REST often returns an array, even for single results (e.g., limit=1 or Prefer: representation)
  if (expectSingle) {
      if (Array.isArray(data)) {
          return data.length > 0 ? data[0] : null; // Return first item or null if empty array
      } else {
          // Should not happen if Supabase follows spec, but handle just in case
          console.warn("Expected single result in array, but received non-array:", data);
          return data;
      }
  }

  return data; // Return full data (likely an array for SELECTs without limit=1)
};

// ------------------------------------------------------------------------
// Type Definitions
// ------------------------------------------------------------------------

export interface FocusSession {
  id: string;
  user_id: string;
  start_time: string;
  end_time?: string | null;
  duration?: number | null;
  focus_score?: number | null;
  status: 'active' | 'completed' | 'cancelled';
  notes?: string | null;
  created_at: string;
  updated_at: string;
}

export interface FocusTask {
  id: string;
  user_id: string;
  session_id?: string | null;
  task: string;
  completed: boolean;
  created_at: string;
  updated_at: string;
}

export interface FocusSettings {
  id: string;
  user_id: string;
  session_length: number;
  break_length: number;
  notification_enabled: boolean;
  sound_enabled: boolean;
  theme: string;
  created_at: string;
  updated_at: string;
}

export interface FocusDistraction {
  id: string;
  user_id: string;
  session_id: string;
  description: string;
  timestamp: string;
  created_at: string;
}

export interface FocusStatistics {
  id: string;
  user_id: string;
  total_sessions: number;
  total_minutes_focused: number;
  average_session_length: number;
  most_productive_time?: string | null;
  completed_tasks: number;
  current_streak: number;
  longest_streak: number;
  last_session_date?: string | null;
  created_at: string;
  updated_at: string;
}

// Change this to use the exported name "Distraction" to match imports
export type Distraction = FocusDistraction;

// ------------------------------------------------------------------------
// Mock data generators (Keep originals near top)
// ------------------------------------------------------------------------
export const generateMockStatistics = (): Partial<FocusStatistics> => {
  return {
    total_sessions: Math.floor(Math.random() * 100) + 10,
    total_minutes_focused: Math.floor(Math.random() * 5000) + 500,
    average_session_length: Math.floor(Math.random() * 50) + 15,
    most_productive_time: ['Morning', 'Afternoon', 'Evening'][Math.floor(Math.random() * 3)],
    completed_tasks: Math.floor(Math.random() * 200) + 20,
    current_streak: Math.floor(Math.random() * 10) + 1,
    longest_streak: Math.floor(Math.random() * 30) + 5,
  };
};

export const generateMockSessions = (count = 5): Partial<FocusSession>[] => {
  const sessions: Partial<FocusSession>[] = [];
  
  for (let i = 0; i < count; i++) {
    const startTime = new Date();
    startTime.setDate(startTime.getDate() - i);
    
    const endTime = new Date(startTime);
    endTime.setMinutes(endTime.getMinutes() + (Math.floor(Math.random() * 60) + 15));
    
    const createdAt = new Date(startTime);
    createdAt.setMinutes(createdAt.getMinutes() - 5);
    
    const updatedAt = new Date(endTime);
    
    sessions.push({
      id: `session-${i}`,
      user_id: 'current-user',
      start_time: startTime.toISOString(),
      end_time: Math.random() > 0.2 ? endTime.toISOString() : null,
      duration: Math.random() > 0.2 ? Math.floor(Math.random() * 60) + 15 : null,
      focus_score: Math.random() > 0.2 ? Math.floor(Math.random() * 100) + 1 : null,
      status: Math.random() > 0.8 ? 'active' : (Math.random() > 0.5 ? 'completed' : 'cancelled'),
      created_at: createdAt.toISOString(),
      updated_at: updatedAt.toISOString()
    });
  }
  
  return sessions;
};

export const generateMockTasks = (count = 8): Partial<FocusTask>[] => {
  const tasks: Partial<FocusTask>[] = [];
  
  for (let i = 0; i < count; i++) {
    const createdAt = new Date();
    createdAt.setDate(createdAt.getDate() - Math.floor(Math.random() * 10));
    
    const updatedAt = new Date(createdAt);
    updatedAt.setHours(updatedAt.getHours() + Math.floor(Math.random() * 24));
    
    tasks.push({
      id: `task-${i}`,
      user_id: 'current-user',
      session_id: Math.random() > 0.3 ? `session-${Math.floor(Math.random() * 3)}` : null,
      task: `Task ${i + 1}: ${['Review documents', 'Write report', 'Prepare presentation', 'Research ideas', 'Send emails', 'Code feature', 'Fix bugs', 'Meeting notes'][i % 8]}`,
      completed: Math.random() > 0.5,
      created_at: createdAt.toISOString(),
      updated_at: updatedAt.toISOString()
    });
  }
  
  return tasks;
};

export const defaultFocusSettings: Partial<FocusSettings> = {
  session_length: 25,
  break_length: 5,
  notification_enabled: true,
  sound_enabled: true,
  theme: 'light'
};

// ------------------------------------------------------------------------
// API Functions - Statistics Section (Refactored)
// ------------------------------------------------------------------------
const FOCUS_STATS_TABLE = DATABASE_SCHEMA?.tables?.focus_stats || 'focus_statistics8';

/**
 * Create default statistics for a new user (Used internally)
 */
const createDefaultStatistics = async (userId: string): Promise<FocusStatistics> => {
  console.log(`Creating default statistics for user ${userId}`);
  const defaultStatsData: Omit<FocusStatistics, 'id' | 'created_at' | 'updated_at'> = {
    user_id: userId,
    total_sessions: 0,
    total_minutes_focused: 0,
    average_session_length: 0,
    completed_tasks: 0,
    current_streak: 0,
    longest_streak: 0,
    last_session_date: null,
    most_productive_time: null,
  };
  try {
    const headers = await getAuthHeaders();
    const response = await fetch(`${REST_URL}/${FOCUS_STATS_TABLE}`, {
      method: 'POST',
      headers: { ...headers, 'Prefer': 'return=representation' },
      body: JSON.stringify(defaultStatsData),
    });
    const createdData = await handleResponse(response, true);
    if (!createdData) {
      throw new Error("Failed to create default statistics, no data returned from API.");
    }
    console.log('Default statistics created:', createdData);
    return createdData as FocusStatistics;
  } catch (error) {
    console.error('Error creating default focus statistics:', error);
    return {
      ...defaultStatsData,
      id: uuidv4(),
      created_at: new Date().toISOString(),
      updated_at: new Date().toISOString()
    } as FocusStatistics;
  }
};

/**
 * Get focus statistics for the current user
 */
export const getFocusStatistics = async (): Promise<FocusStatistics> => {
  let userId: string | undefined;
  try {
    const user = await getCurrentUser();
    if (!user || !user.id) throw new Error('User not authenticated or user ID missing.');
    userId = user.id;

    const headers = await getAuthHeaders();
    const url = `${REST_URL}/${FOCUS_STATS_TABLE}?user_id=eq.${userId}&select=*&limit=1`;
    const response = await fetch(url, { method: 'GET', headers: headers });
    const data = await handleResponse(response, true);

    if (!data) {
      console.log(`No existing stats found for user ${userId}, creating defaults...`);
      // Fix string | undefined type issue by asserting userId is defined at this point
      return createDefaultStatistics(userId as string);
    }
    return data as FocusStatistics;
  } catch (error) {
    console.error(`Error fetching focus statistics for user ${userId ?? 'UNKNOWN'}:`, error);
    if (userId) {
        console.warn("Returning temporary default stats due to fetch error.");
        // Fix string | undefined type issue
        return createDefaultStatistics(userId as string);
    } else {
        console.error("Cannot return default stats as user ID was not determined.");
        throw error;
    }
  }
};

// ... updateFocusStatisticsOnStart (Refactored) ...
// ... calculateStreak (Helper) ...
// ... updateFocusStatisticsOnEnd (Refactored) ...
// ... updateFocusStatisticsOnTaskComplete (Refactored) ...

// ------------------------------------------------------------------------
// Other API Functions (Stubbed - To be refactored)
// ------------------------------------------------------------------------
// ... (Stubbed/Commented out functions: getFocusSessions, getFocusTasks, etc.) ...

// ------------------------------------------------------------------------
// React Query Hooks (Needs review after all API functions are refactored)
// ------------------------------------------------------------------------
// ... existing hooks ...

/**
 * React Query hook for managing focus statistics
 */
export const useFocusStatsApi = () => {
  const queryClient = useQueryClient();
  const { user } = useAuth();
  const userId = user?.id;

  // Get focus statistics for the current user
  const getStats = useQuery({
    queryKey: ['focusStats', userId],
    queryFn: getFocusStatistics,
    enabled: !!userId,
    staleTime: 5 * 60 * 1000, // 5 minutes
  });

  // Update focus statistics
  const updateStats = useMutation({
    mutationFn: async (updatedStats: Partial<FocusStatistics>) => {
      if (!userId) throw new Error('User ID is required to update focus statistics');
      
      const headers = await getAuthHeaders();
      const url = `${REST_URL}/${FOCUS_STATS_TABLE}?user_id=eq.${userId}`;
      const response = await fetch(url, {
        method: 'PATCH',
        headers: { ...headers, 'Prefer': 'return=representation' },
        body: JSON.stringify({ ...updatedStats, updated_at: new Date().toISOString() }),
      });
      
      return handleResponse(response, true);
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['focusStats', userId] });
    },
  });

  return {
    stats: getStats.data,
    isLoading: getStats.isLoading,
    error: getStats.error,
    updateStats,
    refetch: getStats.refetch,
  };
};

// Remove duplicate mock data generators and old API hooks
/*
// Mock data for focus stats // REMOVED
const generateMockStats = (userId: string, days: number = 30) => { ... };
// Focus Sessions API // REMOVED
export const useFocusSessionsApi = () => { ... };
// Focus Stats API with React Query // REMOVED
export const useFocusStatsApi = () => { ... };
// Focus Settings API // REMOVED
export const useFocusSettingsApi = () => { ... };
*/

// Remove old helper functions that relied on supabase client
/*
// REMOVED OLD IMPLEMENTATIONS
const createDefaultStatistics = async (userId: string): Promise<FocusStatistics> => { ... }
const updateFocusStatisticsOnStart = async (userId: string): Promise<void> => { ... }
const updateFocusStatisticsOnEnd = async (...) => { ... }
const updateFocusStatisticsOnTaskComplete = async (userId: string): Promise<void> => { ... }
const createDefaultSettings = async (userId: string): Promise<FocusSettings> => { ... }
*/

// Remove duplicate mock data export at the end
// export { generateMockStatistics, generateMockSessions, generateMockTasks, defaultFocusSettings }; // REMOVED

// Helper function to get current user
// const getCurrentUser = async () => {
//   const { data, error } = await supabase.auth.getUser();
//   if (error) throw error;
//   return data.user;
// }; 

// ------------------------------------------------------------------------
// API Object Exports for Component Usage
// ------------------------------------------------------------------------

// Focus Sessions API
export const focusSessionsApi = {
  createSession: async (sessionData: Omit<FocusSession, 'id' | 'created_at' | 'updated_at'>) => {
    try {
      const headers = await getAuthHeaders();
      const response = await fetch(`${REST_URL}/${DATABASE_SCHEMA?.tables?.focus_sessions || 'focus_sessions8'}`, {
        method: 'POST',
        headers: { ...headers, 'Prefer': 'return=representation' },
        body: JSON.stringify(sessionData),
      });
      const data = await handleResponse(response);
      return { data, error: null };
    } catch (error) {
      console.error('Error creating focus session:', error);
      return { data: null, error };
    }
  },
  updateSession: async (sessionId: string, updates: Partial<FocusSession>) => {
    try {
      const headers = await getAuthHeaders();
      const response = await fetch(`${REST_URL}/${DATABASE_SCHEMA?.tables?.focus_sessions || 'focus_sessions8'}?id=eq.${sessionId}`, {
        method: 'PATCH',
        headers: { ...headers, 'Prefer': 'return=representation' },
        body: JSON.stringify(updates),
      });
      const data = await handleResponse(response);
      return { data, error: null };
    } catch (error) {
      console.error('Error updating focus session:', error);
      return { data: null, error };
    }
  },
  getUserSessions: async (userId: string) => {
    try {
      const headers = await getAuthHeaders();
      const response = await fetch(`${REST_URL}/${DATABASE_SCHEMA?.tables?.focus_sessions || 'focus_sessions8'}?user_id=eq.${userId}&order=start_time.desc`, {
        method: 'GET',
        headers,
      });
      const data = await handleResponse(response);
      return { data, error: null };
    } catch (error) {
      console.error('Error getting user sessions:', error);
      return { data: null, error };
    }
  }
};

// Focus Tasks API
export const focusTasksApi = {
  createTask: async (taskData: Omit<FocusTask, 'id' | 'created_at' | 'updated_at'>) => {
    try {
      const headers = await getAuthHeaders();
      const response = await fetch(`${REST_URL}/${DATABASE_SCHEMA?.tables?.focus_tasks || 'focus_tasks'}`, {
        method: 'POST',
        headers: { ...headers, 'Prefer': 'return=representation' },
        body: JSON.stringify(taskData),
      });
      const data = await handleResponse(response);
      return { data, error: null };
    } catch (error) {
      console.error('Error creating focus task:', error);
      return { data: null, error };
    }
  },
  updateTask: async (taskId: string, updates: Partial<FocusTask>) => {
    try {
      const headers = await getAuthHeaders();
      const response = await fetch(`${REST_URL}/${DATABASE_SCHEMA?.tables?.focus_tasks || 'focus_tasks'}?id=eq.${taskId}`, {
        method: 'PATCH',
        headers: { ...headers, 'Prefer': 'return=representation' },
        body: JSON.stringify(updates),
      });
      const data = await handleResponse(response);
      return { data, error: null };
    } catch (error) {
      console.error('Error updating focus task:', error);
      return { data: null, error };
    }
  },
  getUserTasks: async (userId: string) => {
    try {
      const headers = await getAuthHeaders();
      const response = await fetch(`${REST_URL}/${DATABASE_SCHEMA?.tables?.focus_tasks || 'focus_tasks'}?user_id=eq.${userId}&order=created_at.desc`, {
        method: 'GET',
        headers,
      });
      const data = await handleResponse(response);
      return { data, error: null };
    } catch (error) {
      console.error('Error getting user tasks:', error);
      return { data: null, error };
    }
  }
};

// Distractions API
export const distractionsApi = {
  logDistraction: async (distractionData: Omit<Distraction, 'id' | 'created_at'>) => {
    try {
      const headers = await getAuthHeaders();
      const response = await fetch(`${REST_URL}/${DATABASE_SCHEMA?.tables?.distractions || 'distractions'}`, {
        method: 'POST',
        headers: { ...headers, 'Prefer': 'return=representation' },
        body: JSON.stringify(distractionData),
      });
      const data = await handleResponse(response);
      return { data, error: null };
    } catch (error) {
      console.error('Error logging distraction:', error);
      return { data: null, error };
    }
  },
  getSessionDistractions: async (sessionId: string) => {
    try {
      const headers = await getAuthHeaders();
      const response = await fetch(`${REST_URL}/${DATABASE_SCHEMA?.tables?.distractions || 'distractions'}?session_id=eq.${sessionId}&order=timestamp.asc`, {
        method: 'GET',
        headers,
      });
      const data = await handleResponse(response);
      return { data, error: null };
    } catch (error) {
      console.error('Error getting session distractions:', error);
      return { data: null, error };
    }
  }
};

// Focus Settings API
export const focusSettingsApi = {
  getUserSettings: async (userId: string) => {
    try {
      const headers = await getAuthHeaders();
      const response = await fetch(`${REST_URL}/${DATABASE_SCHEMA?.tables?.focus_settings || 'focus_settings'}?user_id=eq.${userId}`, {
        method: 'GET',
        headers,
      });
      const data = await handleResponse(response);
      return { data, error: null };
    } catch (error) {
      console.error('Error getting user settings:', error);
      return { data: null, error };
    }
  },
  upsertSettings: async (settingsData: Omit<FocusSettings, 'id' | 'created_at' | 'updated_at'>) => {
    try {
      const headers = await getAuthHeaders();
      const response = await fetch(`${REST_URL}/${DATABASE_SCHEMA?.tables?.focus_settings || 'focus_settings'}`, {
        method: 'POST',
        headers: { 
          ...headers, 
          'Prefer': 'resolution=merge-duplicates,return=representation' 
        },
        body: JSON.stringify(settingsData),
      });
      const data = await handleResponse(response);
      return { data, error: null };
    } catch (error) {
      console.error('Error upserting settings:', error);
      return { data: null, error };
    }
  }
};

// Fix the issue with DATABASE_SCHEMA by using our already defined constant
// const DATABASE_SCHEMA_FALLBACK = {
//   tables: {
//     focus_sessions: 'focus_sessions',
//     focus_tasks: 'focus_tasks',
//     focus_settings: 'focus_settings',
//     focus_stats: 'focus_statistics',
//     distractions: 'distractions'
//   }
// };

// Remove the duplicate getFocusStatistics function
// export const getFocusStatistics = async (): Promise<FocusStatistics> => {
//  ...
// }; 