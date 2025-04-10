import { Session } from '@supabase/supabase-js';
import { supabaseRequest } from '@/utils/supabaseRequest'; // Correct import path and name
import { toast } from 'sonner'; // Keeping toast for fallback message
import type {
  FocusSession,
  EnergyLevel as EnergyLog,
  Task,
  ADHDStrategy,
  UserFocusStrategy, // Added based on usage
  UserAchievement, // Added based on usage
} from './easierFocusApiClient'; // Assuming types are exported from this file

// Removed locally defined types, assuming they exist in easierFocusApiClient.ts
// Type for getEnergyLogs options
type EnergyLogOptions = {
  startDate?: string;
  endDate?: string;
  limit?: number;
  orderDirection?: 'asc' | 'desc';
};


// Type for getTasks options
type TaskOptions = {
  status?: string;
  priority?: number;
  limit?: number;
  orderDirection?: 'asc' | 'desc'; // Assuming similar ordering
};

// Focus Sessions API
export const getFocusSessions = async (userId: string, session?: Session | null): Promise<FocusSession[]> => {
  // Removed USE_MOCK_DATA check
  try {
    // Following ssot8001 naming convention: focus_sessions (no _8 suffix)
    // Using easierFocusApiClient table naming convention: focus_sessions8
    const { data, error } = await supabaseRequest<FocusSession[]>(
      `/rest/v1/focus_sessions8?user_id=eq.${userId}&order=start_time.desc&select=*`, // Use correct table, add select=*
      { method: 'GET' },
      session
    );
    if (error) throw error;
    return data || [];
  } catch (error) {
    console.error('Error fetching focus sessions:', error);
    throw error;
  }
};

export const createFocusSession = async (sessionData: Omit<FocusSession, 'id' | 'user_id' | 'created_at' | 'updated_at'>, session?: Session | null): Promise<FocusSession> => {
  // Removed USE_MOCK_DATA check
  if (!session?.user?.id) throw new Error("Authentication required");
  const payload = { ...sessionData, user_id: session.user.id };
  try {
    const { data, error } = await supabaseRequest<FocusSession[]>( // Expect array
      '/rest/v1/focus_sessions8?select=*', // Use correct table, add select=*
      {
        method: 'POST',
        headers: { 'Content-Type': 'application/json', 'Prefer': 'return=representation' },
        body: JSON.stringify(payload)
      },
      session
    );
    if (error) throw error;
    if (!data?.[0]) throw new Error("Failed to create session, no data returned.");
    return data[0];
  } catch (error) {
    console.error('Error creating focus session:', error);
    throw error;
  }
};

export const updateFocusSession = async (sessionId: string, updates: Partial<FocusSession>, session?: Session | null): Promise<FocusSession> => {
  // Removed USE_MOCK_DATA check
  if (!session?.user?.id) throw new Error("Authentication required");
  try {
     const payload = { ...updates, updated_at: new Date().toISOString() };
     const { data, error } = await supabaseRequest<FocusSession[]>( // Expect array
      `/rest/v1/focus_sessions8?id=eq.${sessionId}&user_id=eq.${session.user.id}&select=*`, // Use correct table, add select=*
      {
        method: 'PATCH',
        headers: { 'Content-Type': 'application/json', 'Prefer': 'return=representation' },
        body: JSON.stringify(payload)
      },
      session
    );
    if (error) throw error;
    if (!data?.[0]) throw new Error("Failed to update session or permission denied.");
    return data[0];
  } catch (error) {
    console.error('Error updating focus session:', error);
    throw error;
  }
};

// Focus Strategies API
export const getFocusStrategies = async (session?: Session | null): Promise<ADHDStrategy[]> => { // Assuming ADHDStrategy is the correct type
 // Removed USE_MOCK_DATA check
  try {
    // Assuming focus_strategies8 is the table name
    const { data, error } = await supabaseRequest<ADHDStrategy[]>(
      '/rest/v1/focus_strategies8?select=*', // Use correct table
      { method: 'GET' },
      session // Pass session for RLS if needed for global strategies
    );
    if (error) throw error;
    return data || [];
  } catch (error) {
    console.error('Error fetching focus strategies:', error);
    throw error;
  }
};

export const getUserFocusStrategies = async (userId: string, session?: Session | null): Promise<UserFocusStrategy[]> => { // Use defined type
  // Removed USE_MOCK_DATA check
  if (!session?.user?.id || session.user.id !== userId) throw new Error("Authentication required/mismatched");
  try {
    // Assuming user_focus_strategies8 table links user and strategy
    const { data, error } = await supabaseRequest<UserFocusStrategy[]>(
      `/rest/v1/user_focus_strategies8?user_id=eq.${userId}&select=*,focus_strategy:focus_strategies8(*)`, // Use correct table, join strategy details
      { method: 'GET' },
      session
    );
    if (error) throw error;
    return data || [];
  } catch (error) {
    console.error('Error fetching user focus strategies:', error);
    throw error;
  }
};

export const updateUserFocusStrategy = async (userId: string, strategyId: string, updates: Partial<UserFocusStrategy>, session?: Session | null): Promise<UserFocusStrategy> => {
 // Removed USE_MOCK_DATA check
  if (!session?.user?.id || session.user.id !== userId) throw new Error("Authentication required/mismatched");

  const payload = { ...updates, user_id: userId, strategy_id: strategyId, updated_at: new Date().toISOString() };
  // Use upsert with merge-duplicates for simplicity if table has unique constraint on (user_id, strategy_id)
  try {
     const { data, error } = await supabaseRequest<UserFocusStrategy[]>( // Expect array
       '/rest/v1/user_focus_strategies8?select=*', // Use correct table
       {
         method: 'POST', // POST with Prefer for upsert
         headers: {
           'Content-Type': 'application/json',
           'Prefer': 'return=representation,resolution=merge-duplicates'
         },
         body: JSON.stringify(payload)
       },
       session
     );
     if (error) throw error;
     if (!data?.[0]) throw new Error("Failed to update/create user strategy link.");
     return data[0];
  } catch (error) {
    console.error('Error updating user focus strategy:', error);
    throw error;
  }
};

// Achievements API
export const getAchievements = async (session?: Session | null): Promise<any[]> => { // Add specific Achievement type later
  // Removed USE_MOCK_DATA check
  try {
     // Assuming focus_achievements is the correct table from ssot8001
    const { data, error } = await supabaseRequest<any[]>( // Keep any[] for generic Achievement Definition? Or define one.
      '/rest/v1/focus_achievements?select=*', // Use correct table
      { method: 'GET' },
      session // Pass session if RLS applies to global achievements
    );
    if (error) throw error;
    return data || [];
  } catch (error) {
    console.error('Error fetching achievements:', error);
    throw error;
  }
};

export const getUserAchievements = async (userId: string, session?: Session | null): Promise<UserAchievement[]> => { // Use defined type
  // Removed USE_MOCK_DATA check
  if (!session?.user?.id || session.user.id !== userId) throw new Error("Authentication required/mismatched");
  try {
    // Use focus_achievements as per ssot8001
    const { data, error } = await supabaseRequest<UserAchievement[]>(
      `/rest/v1/focus_achievements?user_id=eq.${userId}&select=*`, // Use correct table
      { method: 'GET' },
      session
    );
     if (error) throw error;
    return data || [];
  } catch (error) {
    console.error('Error fetching user achievements:', error);
    throw error;
  }
};

export const updateUserAchievement = async (userId: string, achievementId: string, updates: Partial<UserAchievement>, session?: Session | null): Promise<UserAchievement> => {
 // Removed USE_MOCK_DATA check
  if (!session?.user?.id || session.user.id !== userId) throw new Error("Authentication required/mismatched");

  const payload = { ...updates, user_id: userId, achievement_id: achievementId, updated_at: new Date().toISOString() };
  // Upsert logic using POST + Prefer header
   try {
     const { data, error } = await supabaseRequest<UserAchievement[]>( // Expect array
       '/rest/v1/focus_achievements?select=*', // Use correct table
       {
         method: 'POST',
         headers: {
           'Content-Type': 'application/json',
           'Prefer': 'return=representation,resolution=merge-duplicates'
         },
         // Ensure the primary key (or unique constraint columns) are included for upsert
         // Assuming (user_id, achievement_id) or similar is the unique constraint
         body: JSON.stringify(payload)
       },
       session
     );
     if (error) throw error;
     if (!data?.[0]) throw new Error("Failed to update/create user achievement.");
     return data[0];
  } catch (error) {
    console.error('Error updating user achievement:', error);
    throw error;
  }
};

// Energy Logs API
export const getEnergyLogs = async (userId: string, options: EnergyLogOptions = {}, session?: Session | null): Promise<EnergyLog[]> => { // Used defined options type
  // Removed USE_MOCK_DATA check
  if (!session?.user?.id || session.user.id !== userId) throw new Error("Authentication required/mismatched");
  try {
    let query = `/rest/v1/energy_logs8?user_id=eq.${userId}&select=*`; // Use correct table

    // Add date range if provided
    if (options.startDate) {
      query += `&timestamp=gte.${options.startDate}`;
    }
    if (options.endDate) {
      query += `&timestamp=lte.${options.endDate}`;
    }

    // Add ordering
    query += `&order=timestamp.${options.orderDirection || 'desc'}`;

    // Add limit
     if (options.limit) {
         query += `&limit=${options.limit}`;
     }

    const { data, error } = await supabaseRequest<EnergyLog[]>( // Use supabaseRequest
      query,
      { method: 'GET' },
      session
    );
     if (error) throw error;
    return data || [];
  } catch (error) {
    console.error('Error fetching energy logs:', error);
    throw error;
  }
};

export const createEnergyLog = async (logData: Omit<EnergyLog, 'id' | 'user_id' | 'created_at' | 'updated_at'>, session?: Session | null): Promise<EnergyLog> => { // Used imported type
  // Removed USE_MOCK_DATA check
  if (!session?.user?.id) throw new Error("Authentication required");
  const payload = { ...logData, user_id: session.user.id, timestamp: logData.timestamp || new Date().toISOString() };
  try {
    const { data, error } = await supabaseRequest<EnergyLog[]>( // Expect array, Use supabaseRequest
      '/rest/v1/energy_logs8?select=*', // Use correct table
      {
        method: 'POST',
        headers: { 'Content-Type': 'application/json', 'Prefer': 'return=representation' },
        body: JSON.stringify(payload)
      },
      session
    );
     if (error) throw error;
     if (!data?.[0]) throw new Error("Failed to create energy log.");
     return data[0];
  } catch (error) {
    console.error('Error creating energy log:', error);
    throw error;
  }
};

// Tasks API
export const getTasks = async (userId: string, options: TaskOptions = {}, session?: Session | null): Promise<Task[]> => { // Used defined options type
  // Removed USE_MOCK_DATA and fallback logic
  if (!session?.user?.id || session.user.id !== userId) throw new Error("Authentication required/mismatched");
  try {
    // Using 'focus_tasks' as per ssot8001
    let query = `/rest/v1/focus_tasks?user_id=eq.${userId}&select=*`;

    if (options.status) {
      query += `&status=eq.${options.status}`;
    }
    if (options.priority !== undefined) { // Check for undefined as 0 is a valid priority
      query += `&priority=eq.${options.priority}`;
    }

    // Assuming default order or add if needed
    query += `&order=${options.orderDirection === 'asc' ? 'created_at.asc' : 'created_at.desc'}`; // Example: order by created_at

     if (options.limit) {
         query += `&limit=${options.limit}`;
     }

    const { data, error } = await supabaseRequest<Task[]>( // Use supabaseRequest
      query,
      { method: 'GET' },
      session
    );
    if (error) throw error;
    return data || [];
  } catch (error) {
    console.error('Error fetching tasks:', error);
    throw error; // Re-throw after logging
  }
};

export const createTask = async (taskData: Omit<Task, 'id' | 'user_id' | 'created_at' | 'updated_at'>, session?: Session | null): Promise<Task> => { // Used imported type
 // Removed USE_MOCK_DATA check
  if (!session?.user?.id) throw new Error("Authentication required");
  const payload = { ...taskData, user_id: session.user.id };
  try {
    const { data, error } = await supabaseRequest<Task[]>( // Expect array, Use supabaseRequest
      '/rest/v1/focus_tasks?select=*', // Use correct table
      {
        method: 'POST',
        headers: { 'Content-Type': 'application/json', 'Prefer': 'return=representation' },
        body: JSON.stringify(payload)
      },
      session
    );
    if (error) throw error;
    if (!data?.[0]) throw new Error("Failed to create task.");
    return data[0];
  } catch (error) {
    console.error('Error creating task:', error);
    throw error;
  }
};

export const updateTask = async (taskId: string, updates: Partial<Task>, session?: Session | null): Promise<Task> => { // Used imported type
  // Removed USE_MOCK_DATA check
  if (!session?.user?.id) throw new Error("Authentication required");
  try {
     const payload = { ...updates, updated_at: new Date().toISOString() };
     const { data, error } = await supabaseRequest<Task[]>( // Expect array, Use supabaseRequest
      `/rest/v1/focus_tasks?id=eq.${taskId}&user_id=eq.${session.user.id}&select=*`, // Use correct table, ensure user owns task
      {
        method: 'PATCH',
        headers: { 'Content-Type': 'application/json', 'Prefer': 'return=representation' },
        body: JSON.stringify(payload)
      },
      session
    );
     if (error) throw error;
     if (!data?.[0]) throw new Error("Failed to update task or permission denied.");
    return data[0];
  } catch (error) {
    console.error('Error updating task:', error);
    throw error;
  }
};

export const deleteTask = async (taskId: string, session?: Session | null): Promise<void> => {
 // Removed USE_MOCK_DATA check
 if (!session?.user?.id) throw new Error("Authentication required");
  try {
     const { error } = await supabaseRequest<null>( // Use supabaseRequest
      `/rest/v1/focus_tasks?id=eq.${taskId}&user_id=eq.${session.user.id}`, // Use correct table, ensure user owns task
      { method: 'DELETE' },
      session
    );
    // Supabase DELETE might not return content, just check for errors
    if (error) throw error;
    // Return void on success
  } catch (error) {
    console.error('Error deleting task:', error);
    throw error;
  }
};
