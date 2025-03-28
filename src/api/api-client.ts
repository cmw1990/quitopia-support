import type { Session } from '@supabase/supabase-js';
import offlineStorageService from '../services/BackwardCompatibility';
import { supabaseRestCall, SUPABASE_URL, SUPABASE_ANON_KEY } from "./apiCompatibility";

interface ApiOptions {
  method?: string;
  headers?: Record<string, string>;
  body?: any;
}

/**
 * MissionFresh API Client with offline support
 * All API calls go through this client, which handles:
 * 1. Direct REST API calls to Supabase via missionFreshApiClient
 * 2. Offline storage and sync
 * 3. Error handling and retry logic
 */

// Generic API request function with offline support
export const apiRequest = async <T>(
  endpoint: string,
  options: ApiOptions = {},
  session: Session | null,
): Promise<T> => {
  const isOnline = offlineStorageService.isNetworkOnline();
  const { method = 'GET', headers = {}, body } = options;

  // If offline and trying to fetch data (GET request)
  if (!isOnline && method === 'GET') {
    console.log('Device is offline, fetching from local storage');
    
    // Extract endpoint parts to determine what to fetch from local storage
    const parts = endpoint.split('?')[0].split('/');
    const mainResource = parts[0];
    
    if (mainResource === 'progress8') {
      // Extract query parameters if they exist
      const userId = session?.user?.id;
      if (!userId) throw new Error('User ID is required for offline access');
      
      // Get date range parameters if they exist
      const urlParams = new URLSearchParams(endpoint.split('?')[1] || '');
      const startDate = urlParams.get('date=gte.') || undefined;
      const endDate = urlParams.get('date=lte.') || undefined;
      
      return offlineStorageService.getProgressEntries(userId, startDate, endDate) as unknown as T;
    } 
    else if (mainResource === 'cravings8') {
      const userId = session?.user?.id;
      if (!userId) throw new Error('User ID is required for offline access');
      
      const urlParams = new URLSearchParams(endpoint.split('?')[1] || '');
      const startDate = urlParams.get('timestamp=gte.') || undefined;
      const endDate = urlParams.get('timestamp=lte.') || undefined;
      
      return offlineStorageService.getCravingEntries(userId, startDate, endDate) as unknown as T;
    }
    else if (mainResource === 'tasks8') {
      const userId = session?.user?.id;
      if (!userId) throw new Error('User ID is required for offline access');
      
      // Check if we're including completed tasks
      const urlParams = new URLSearchParams(endpoint.split('?')[1] || '');
      const includeCompleted = urlParams.get('completed=is.') !== 'false';
      
      return offlineStorageService.getTasks(userId, includeCompleted) as unknown as T;
    }
    else if (mainResource === 'consumption_logs8') {
      const userId = session?.user?.id;
      if (!userId) throw new Error('User ID is required for offline access');
      
      const urlParams = new URLSearchParams(endpoint.split('?')[1] || '');
      const startDate = urlParams.get('timestamp=gte.') || undefined;
      const endDate = urlParams.get('timestamp=lte.') || undefined;
      
      return offlineStorageService.getConsumptionLogs(userId, startDate, endDate) as unknown as T;
    }
    
    // For other resources or if no match, throw error
    throw new Error(`Cannot access ${mainResource} while offline`);
  }
  
  // If offline and trying to modify data (POST, PUT, DELETE)
  if (!isOnline && method !== 'GET') {
    console.log('Device is offline, saving operation to sync later');
    
    // Extract the table name from the endpoint
    const tableName = endpoint.split('?')[0];
    const userId = session?.user?.id;
    
    if (!userId) throw new Error('User ID is required for offline operations');
    
    // Determine operation type based on method and add to offline storage
    if (method === 'POST' || method === 'PUT') {
      // Add user_id if not present
      const dataWithUserId = { ...body, user_id: userId };
      
      if (tableName === 'progress8') {
        return offlineStorageService.saveProgress(dataWithUserId) as unknown as T;
      }
      else if (tableName === 'cravings8') {
        return offlineStorageService.saveCraving(dataWithUserId) as unknown as T;
      }
      else if (tableName === 'tasks8') {
        return offlineStorageService.saveTask(dataWithUserId) as unknown as T;
      }
      else if (tableName === 'consumption_logs8') {
        return offlineStorageService.saveConsumptionLog(dataWithUserId) as unknown as T;
      }
    }
    
    // For DELETE operations, we need to handle differently
    if (method === 'DELETE') {
      const id = endpoint.split('=eq.')[1]?.split('&')[0];
      if (!id) throw new Error('ID is required for delete operations');
      
      await offlineStorageService.deleteItem(tableName, id);
      return { success: true } as unknown as T;
    }
    
    throw new Error(`Cannot perform ${method} operation on ${tableName} while offline`);
  }

  // Online mode - make the actual API request using supabaseRestCall
  try {
    const restEndpoint = `/rest/v1/${endpoint}`;
    const restOptions: RequestInit = {
      method,
      headers: { ...headers }
    };

    if (body && (method === 'POST' || method === 'PUT' || method === 'PATCH')) {
      restOptions.body = JSON.stringify(body);
    }

    return await supabaseRestCall<T>(restEndpoint, restOptions, session);
  } catch (error) {
    console.error('API request failed:', error);
    throw error;
  }
};

// --- API Functions for Progress ---

export const getProgressEntries = async (
  userId: string,
  startDate: string,
  endDate: string,
  session: Session | null
) => {
  const endpoint = `progress8?user_id=eq.${userId}&date=gte.${startDate}&date=lte.${endDate}&order=date.desc`;
  return apiRequest(endpoint, {}, session);
};

export const addProgressEntry = async (
  entry: any,
  session: Session | null
) => {
  return apiRequest(
    'progress8',
    {
      method: 'POST',
      headers: { 'Prefer': 'return=representation' },
      body: entry
    },
    session
  );
};

export const updateProgressEntry = async (
  id: string,
  updates: any,
  session: Session | null
) => {
  return apiRequest(
    `progress8?id=eq.${id}`,
    {
      method: 'PATCH',
      headers: { 'Prefer': 'return=representation' },
      body: updates
    },
    session
  );
};

export const deleteProgressEntry = async (
  id: string,
  session: Session | null
) => {
  return apiRequest(
    `progress8?id=eq.${id}`,
    { method: 'DELETE' },
    session
  );
};

// --- API Functions for Cravings ---

export const getCravingEntries = async (
  userId: string,
  startDate: string,
  endDate: string,
  session: Session | null
) => {
  const endpoint = `cravings8?user_id=eq.${userId}&timestamp=gte.${startDate}&timestamp=lte.${endDate}&order=timestamp.desc`;
  return apiRequest(endpoint, {}, session);
};

export const addCravingEntry = async (
  entry: any,
  session: Session | null
) => {
  return apiRequest(
    'cravings8',
    {
      method: 'POST',
      headers: { 'Prefer': 'return=representation' },
      body: entry
    },
    session
  );
};

// --- API Functions for Tasks ---

export const getTasks = async (
  userId: string,
  includeCompleted: boolean = true,
  session: Session | null
) => {
  let endpoint = `tasks8?user_id=eq.${userId}`;
  if (!includeCompleted) {
    endpoint += '&completed=is.false';
  }
  endpoint += '&order=due_date.asc';
  return apiRequest(endpoint, {}, session);
};

export const addTask = async (
  task: any,
  session: Session | null
) => {
  return apiRequest(
    'tasks8',
    {
      method: 'POST',
      headers: { 'Prefer': 'return=representation' },
      body: task
    },
    session
  );
};

export const updateTask = async (
  id: string,
  updates: any,
  session: Session | null
) => {
  return apiRequest(
    `tasks8?id=eq.${id}`,
    {
      method: 'PATCH',
      headers: { 'Prefer': 'return=representation' },
      body: updates
    },
    session
  );
};

// --- API Functions for Consumption Logs ---

export const getConsumptionLogs = async (
  userId: string,
  startDate: string,
  endDate: string,
  session: Session | null
) => {
  const endpoint = `consumption_logs8?user_id=eq.${userId}&timestamp=gte.${startDate}&timestamp=lte.${endDate}&order=timestamp.desc`;
  return apiRequest(endpoint, {}, session);
};

export const addConsumptionLog = async (
  entry: any,
  session: Session | null
) => {
  return apiRequest(
    'consumption_logs8',
    {
      method: 'POST',
      headers: { 'Prefer': 'return=representation' },
      body: entry
    },
    session
  );
};

// --- API Functions for Health Milestones ---

export const getHealthMilestones = async (session: Session | null) => {
  return apiRequest('health_milestones8?order=days_required.asc', {}, session);
};

// --- API Functions for Products ---

export const getProducts = async (
  category: string | null = null,
  session: Session | null
) => {
  let endpoint = 'products8';
  if (category) {
    endpoint += `?category=eq.${category}`;
  }
  return apiRequest(endpoint, {}, session);
};

// --- API Functions for User Settings ---

export const getUserSettings = async (
  userId: string,
  session: Session | null
) => {
  return apiRequest(`user_settings8?user_id=eq.${userId}`, {}, session);
};

export const updateUserSettings = async (
  userId: string,
  settings: any,
  session: Session | null
) => {
  return apiRequest(
    `user_settings8?user_id=eq.${userId}`,
    {
      method: 'PATCH',
      headers: { 'Prefer': 'return=representation' },
      body: settings
    },
    session
  );
};

// Force sync function for manual sync triggering
export const forceSyncOfflineData = async () => {
  return offlineStorageService.syncData();
};

// Get offline status information
export const getOfflineStatus = async () => {
  const status = await offlineStorageService.getSyncStatus();
  return {
    isOnline: offlineStorageService.isNetworkOnline(),
    hasPendingChanges: await offlineStorageService.hasPendingSyncData(),
    ...status,
  };
};
