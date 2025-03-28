/**
 * Supabase REST API Client
 * 
 * This module provides REST API-based functions for interacting with Supabase
 * following the strict guidelines in SSOT8001 that mandate NO direct Supabase client usage.
 * 
 * All database operations, authentication, and storage should use this module.
 */

// Environment variables
const SUPABASE_URL = import.meta.env.VITE_SUPABASE_URL || 'https://zoubqdwxemivxrjruvam.supabase.co';
const SUPABASE_ANON_KEY = import.meta.env.VITE_SUPABASE_ANON_KEY || 'eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6InpvdWJxZHd4ZW1pdnhyanJ1dmFtIiwicm9sZSI6ImFub24iLCJpYXQiOjE3Mzg0MjAxOTcsImV4cCI6MjA1Mzk5NjE5N30.tq2ssOiA8CbFUZc6HXWXMEev1dODzKZxzNrpvyzbbXs';

// Types (can be imported from @supabase/supabase-js for TypeScript compatibility)
import type { Session, User } from '@supabase/supabase-js';

// A simple cache for API responses
interface CacheEntry<T> {
  data: T;
  timestamp: number;
  expiresAt: number;
}

const apiCache: Record<string, CacheEntry<any>> = {};

// Cache duration in milliseconds (5 minutes default)
const DEFAULT_CACHE_DURATION = 5 * 60 * 1000;

/**
 * Helper function to get a cached response or make a new request
 */
const getCachedOrFresh = async <T = any>(
  endpoint: string,
  options: RequestInit = {},
  session?: Session | null,
  cacheDuration: number = DEFAULT_CACHE_DURATION
): Promise<{ data?: T; error?: any }> => {
  // Only cache GET requests
  const isGetRequest = !options.method || options.method === 'GET';
  const cacheKey = `${endpoint}-${JSON.stringify(options)}-${session?.user?.id || 'anonymous'}`;
  
  // Check if we have a valid cached response
  if (isGetRequest && apiCache[cacheKey]) {
    const cached = apiCache[cacheKey];
    if (cached.expiresAt > Date.now()) {
      return { data: cached.data };
    }
    // Cache expired, remove it
    delete apiCache[cacheKey];
  }
  
  // Make the actual request
  const response = await authenticatedRestCall<T>(endpoint, options, session);
  
  // Cache successful GET responses
  if (isGetRequest && response.data && !response.error) {
    apiCache[cacheKey] = {
      data: response.data,
      timestamp: Date.now(),
      expiresAt: Date.now() + cacheDuration
    };
  }
  
  return response;
};

/**
 * Export the cached version for external use
 */
export const cachedRestCall = getCachedOrFresh;

/**
 * Low-level function to make REST API calls to the Supabase backend
 */
export const supabaseRestCall = async <T = any>(
  endpoint: string, 
  options: RequestInit = {}, 
  session?: { access_token: string } | null
): Promise<T> => {
  try {
    // Prepare headers with proper authentication
    const headers: HeadersInit = {
      'Content-Type': 'application/json',
      'apikey': SUPABASE_ANON_KEY,
      ...options.headers
    };

    if (session?.access_token) {
      headers['Authorization'] = `Bearer ${session.access_token}`;
    }

    // Make the fetch request
    const response = await fetch(`${SUPABASE_URL}${endpoint}`, {
      ...options,
      headers
    });

    // Handle non-OK responses
    if (!response.ok) {
      const errorData = await response.json().catch(() => ({ message: response.statusText }));
      console.error('Supabase REST API error:', {
        status: response.status,
        statusText: response.statusText,
        message: errorData.message || errorData.error || 'Unknown error occurred',
        details: errorData
      });
      
      // Return empty result instead of throwing exception
      return (Array.isArray({} as T) ? [] : {}) as T;
    }

    // Parse and return JSON response
    // Some endpoints (like storage) may not return JSON
    if (response.headers.get('content-type')?.includes('application/json')) {
      return await response.json();
    }
    
    return response as unknown as T;
  } catch (error) {
    console.error('Supabase REST API error:', error);
    // Return empty result instead of throwing exception
    return (Array.isArray({} as T) ? [] : {}) as T;
  }
};

/**
 * Helper function to ensure table names follow SSOT8001 guidelines
 * All table names should end with '8'
 */
export const ensureTableNameCompliance = (tableName: string): string => {
  // If tableName is already compliant, return as is
  if (tableName.endsWith('8')) {
    return tableName;
  }
  
  // Otherwise append the '8' suffix
  return `${tableName}8`;
};

/**
 * Helper function for authenticated REST calls that needs the user's session
 */
export const authenticatedRestCall = async <T = any>(
  endpoint: string, 
  options: RequestInit = {}, 
  session?: Session | null
): Promise<{ data?: T; error?: any }> => {
  // Handle table name compliance for REST API calls
  let compliantEndpoint = endpoint;
  
  // Check if this is a table access call
  if (endpoint.includes('/rest/v1/')) {
    // Extract the path parts
    const parts = endpoint.split('/rest/v1/');
    if (parts.length === 2) {
      // Get the table name (everything before the first ? or the end)
      let tablePart = parts[1];
      const queryIndex = tablePart.indexOf('?');
      
      if (queryIndex !== -1) {
        const tableName = tablePart.substring(0, queryIndex);
        const compliantTableName = ensureTableNameCompliance(tableName);
        
        // Replace only the table name part
        compliantEndpoint = `${parts[0]}/rest/v1/${compliantTableName}${tablePart.substring(queryIndex)}`;
      } else {
        // No query parameters
        const compliantTableName = ensureTableNameCompliance(tablePart);
        compliantEndpoint = `${parts[0]}/rest/v1/${compliantTableName}`;
      }
    }
  }
  
  // Continue with the existing function using the compliant endpoint
  if (!session) {
    // Try to get from localStorage if not provided
    const storedSession = localStorage.getItem('supabase.auth.token');
    if (storedSession) {
      try {
        const parsedSession = JSON.parse(storedSession);
        if (parsedSession?.currentSession?.access_token) {
          try {
            const data = await supabaseRestCall<T>(compliantEndpoint, options, {
              access_token: parsedSession.currentSession.access_token
            });
            return { data };
          } catch (error) {
            return { error };
          }
        }
      } catch (e) {
        console.error('Failed to parse stored session:', e);
        return { error: e };
      }
    }

    // If no session found anywhere, continue without authentication
    // (will use anonymous key instead)
    try {
      const data = await supabaseRestCall<T>(compliantEndpoint, options);
      return { data };
    } catch (error) {
      return { error };
    }
  }

  try {
    const data = await supabaseRestCall<T>(compliantEndpoint, options, {
      access_token: session.access_token
    });
    return { data };
  } catch (error) {
    return { error };
  }
};

// Offline support with request queue
const offlineQueue: Array<{endpoint: string, options: RequestInit, sessionToken?: string}> = [];
let isOffline = false;

// Add network status detection
if (typeof window !== 'undefined') {
  window.addEventListener('online', async () => {
    isOffline = false;
    await processOfflineQueue();
  });
  
  window.addEventListener('offline', () => {
    isOffline = true;
  });
}

async function processOfflineQueue() {
  if (offlineQueue.length === 0) return;
  
  // Process each queued request
  while (offlineQueue.length > 0 && !isOffline) {
    const request = offlineQueue.shift();
    if (request) {
      try {
        // Create session-like object if token exists
        const sessionObj = request.sessionToken ? 
          { access_token: request.sessionToken } : 
          null;
          
        await supabaseRestCall(request.endpoint, request.options, sessionObj);
      } catch (error) {
        console.error('Failed to process offline request:', error);
      }
    }
  }
}

// Function to queue a request when offline
export const queueOfflineRequest = (
  endpoint: string, 
  options: RequestInit,
  sessionToken?: string
) => {
  offlineQueue.push({ endpoint, options, sessionToken });
  
  // Store in localStorage for persistence across browser sessions
  try {
    const currentQueue = JSON.parse(localStorage.getItem('offlineRequestQueue') || '[]');
    currentQueue.push({ endpoint, options, sessionToken });
    localStorage.setItem('offlineRequestQueue', JSON.stringify(currentQueue));
  } catch (e) {
    console.error('Failed to persist offline request to localStorage:', e);
  }
  
  return { success: true, message: 'Request queued for when online' };
};

/**
 * AUTH API FUNCTIONS
 * These replace direct Supabase auth client usage
 */

// Sign up with email and password
export const signUp = async (email: string, password: string) => {
  const response = await supabaseRestCall('/auth/v1/signup', {
    method: 'POST',
    body: JSON.stringify({ email, password })
  });
  
  return response;
};

// Sign in with email and password
export const signIn = async (email: string, password: string) => {
  const response = await supabaseRestCall('/auth/v1/token?grant_type=password', {
    method: 'POST',
    body: JSON.stringify({ email, password })
  });
  
  if (response?.access_token) {
    // Save to localStorage for session persistence
    localStorage.setItem('supabase.auth.token', JSON.stringify({
      currentSession: response,
      expiresAt: Date.now() + response.expires_in * 1000
    }));
  }
  
  return response;
};

// Sign out
export const signOut = async (session: Session) => {
  await supabaseRestCall('/auth/v1/logout', {
    method: 'POST'
  }, session);
  
  // Clear from localStorage
  localStorage.removeItem('supabase.auth.token');
  
  return { success: true };
};

// Get the current user
export const getCurrentUser = async (): Promise<User | null> => {
  try {
    const storedSession = localStorage.getItem('supabase.auth.token');
    if (storedSession) {
      const parsedSession = JSON.parse(storedSession);
      if (parsedSession?.currentSession?.access_token) {
        const response = await supabaseRestCall('/auth/v1/user', {
          method: 'GET'
        }, { access_token: parsedSession.currentSession.access_token });
        
        return response;
      }
    }
    return null;
  } catch (error) {
    console.error('Failed to get current user:', error);
    return null;
  }
};

// Get the current session
export const getCurrentSession = async (): Promise<Session | null> => {
  try {
    const storedSession = localStorage.getItem('supabase.auth.token');
    if (!storedSession) return null;
    
    const parsedSession = JSON.parse(storedSession);
    if (!parsedSession?.currentSession) return null;
    
    // Check if session is expired
    if (parsedSession.expiresAt && parsedSession.expiresAt < Date.now()) {
      // Try to refresh the token
      try {
        const refreshResponse = await supabaseRestCall('/auth/v1/token?grant_type=refresh_token', {
          method: 'POST',
          body: JSON.stringify({ 
            refresh_token: parsedSession.currentSession.refresh_token 
          })
        });
        
        if (refreshResponse?.access_token) {
          // Save refreshed session
          localStorage.setItem('supabase.auth.token', JSON.stringify({
            currentSession: refreshResponse,
            expiresAt: Date.now() + refreshResponse.expires_in * 1000
          }));
          
          return refreshResponse;
        }
      } catch (e) {
        console.error('Token refresh failed:', e);
        localStorage.removeItem('supabase.auth.token');
        return null;
      }
    }
    
    return parsedSession.currentSession;
  } catch (error) {
    console.error('Failed to get current session:', error);
    return null;
  }
};

/**
 * DATABASE API FUNCTIONS
 * These replace direct Supabase database client usage
 */

/**
 * CRUD functions that work with any table
 */
export const fetchFromTable = async (
  tableName: string,
  query: Record<string, any> = {},
  session?: Session | null,
  options: { cacheDuration?: number } = {}
) => {
  // Ensure table name follows SSOT8001 guidelines
  const compliantTableName = ensureTableNameCompliance(tableName);
  
  // Build query string
  const queryParams = Object.entries(query)
    .map(([key, value]) => {
      if (Array.isArray(value)) {
        return `${key}=in.(${value.join(',')})`;
      }
      return `${key}=eq.${value}`;
    })
    .join('&');
  
  const endpoint = `/rest/v1/${compliantTableName}?${queryParams}`;
  
  // Use cached version for GET requests
  return await getCachedOrFresh(endpoint, {
    method: 'GET'
  }, session, options.cacheDuration);
};

export const insertIntoTable = async (
  tableName: string,
  data: Record<string, any> | Array<Record<string, any>>,
  session?: Session | null,
  options: { returning?: 'minimal' | 'representation' } = { returning: 'representation' }
) => {
  // Ensure table name follows SSOT8001 guidelines
  const compliantTableName = ensureTableNameCompliance(tableName);
  
  const endpoint = `/rest/v1/${compliantTableName}?returning=${options.returning}`;
  
  return await authenticatedRestCall(endpoint, {
    method: 'POST',
    body: JSON.stringify(data)
  }, session);
};

export const updateTable = async (
  tableName: string,
  query: Record<string, any>,
  data: Record<string, any>,
  session?: Session | null
) => {
  // Ensure table name follows SSOT8001 guidelines
  const compliantTableName = ensureTableNameCompliance(tableName);
  
  // Build query string for filtering
  const queryParams = Object.entries(query)
    .map(([key, value]) => {
      if (Array.isArray(value)) {
        return `${key}=in.(${value.join(',')})`;
      }
      return `${key}=eq.${value}`;
    })
    .join('&');
  
  const endpoint = `/rest/v1/${compliantTableName}?${queryParams}`;
  
  return await authenticatedRestCall(endpoint, {
    method: 'PATCH',
    body: JSON.stringify(data)
  }, session);
};

export const deleteFromTable = async (
  tableName: string,
  query: Record<string, any>,
  session?: Session | null
) => {
  // Ensure table name follows SSOT8001 guidelines
  const compliantTableName = ensureTableNameCompliance(tableName);
  
  // Build query string for filtering
  const queryParams = Object.entries(query)
    .map(([key, value]) => {
      if (Array.isArray(value)) {
        return `${key}=in.(${value.join(',')})`;
      }
      return `${key}=eq.${value}`;
    })
    .join('&');
  
  const endpoint = `/rest/v1/${compliantTableName}?${queryParams}`;
  
  return await authenticatedRestCall(endpoint, {
    method: 'DELETE'
  }, session);
};

/**
 * STORAGE API FUNCTIONS
 * These replace direct Supabase storage client usage
 */

// Upload a file to storage
export const uploadFile = async (
  bucketName: string,
  path: string,
  fileBody: File | Blob | ArrayBuffer | string,
  session?: Session | null,
  options: { upsert?: boolean, contentType?: string } = {}
) => {
  const endpoint = `/storage/v1/object/${bucketName}/${path}`;
  
  const headers: HeadersInit = {};
  if (options.contentType) {
    headers['Content-Type'] = options.contentType;
  }
  
  try {
    const response = await authenticatedRestCall(endpoint, {
      method: 'POST',
      headers,
      body: fileBody as any
    }, session);
    
    return { data: response, error: null };
  } catch (error) {
    return { data: null, error };
  }
};

// Get a file from storage
export const getFileUrl = (
  bucketName: string,
  path: string,
  options: { download?: boolean } = {}
) => {
  const downloadParam = options.download ? '?download' : '';
  return `${SUPABASE_URL}/storage/v1/object/public/${bucketName}/${path}${downloadParam}`;
};

// Delete a file from storage
export const deleteFile = async (
  bucketName: string,
  path: string,
  session?: Session | null
) => {
  const endpoint = `/storage/v1/object/${bucketName}/${path}`;
  
  try {
    const response = await authenticatedRestCall(endpoint, {
      method: 'DELETE'
    }, session);
    
    return { data: response, error: null };
  } catch (error) {
    return { data: null, error };
  }
};

export default {
  auth: {
    signUp,
    signIn,
    signOut,
    getUser: getCurrentUser,
    getSession: getCurrentSession
  },
  from: (tableName: string) => ({
    select: async (
      query: Record<string, any> = {},
      session?: Session | null
    ) => fetchFromTable(tableName, query, session),
    insert: async (
      data: Record<string, any> | Array<Record<string, any>>,
      session?: Session | null,
      options?: { returning?: 'minimal' | 'representation' }
    ) => insertIntoTable(tableName, data, session, options),
    update: async (
      data: Record<string, any>,
      query: Record<string, any> = {},
      session?: Session | null
    ) => updateTable(tableName, query, data, session),
    delete: async (
      query: Record<string, any> = {},
      session?: Session | null
    ) => deleteFromTable(tableName, query, session)
  }),
  storage: {
    from: (bucketName: string) => ({
      upload: async (
        path: string,
        fileBody: File | Blob | ArrayBuffer | string,
        session?: Session | null,
        options?: { upsert?: boolean, contentType?: string }
      ) => uploadFile(bucketName, path, fileBody, session, options),
      getUrl: (path: string, options?: { download?: boolean }) => 
        getFileUrl(bucketName, path, options),
      remove: async (path: string, session?: Session | null) => 
        deleteFile(bucketName, path, session)
    })
  }
}; 