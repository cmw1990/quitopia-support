import { AuthSession } from '@supabase/supabase-js';

const SUPABASE_URL = import.meta.env.VITE_SUPABASE_URL;
const SUPABASE_ANON_KEY = import.meta.env.VITE_SUPABASE_ANON_KEY;

if (!SUPABASE_URL || !SUPABASE_ANON_KEY) {
  console.error('Supabase URL or Anon Key is missing in environment variables.');
  throw new Error('Supabase configuration is missing.');
}

interface FetchOptions {
  method?: 'GET' | 'POST' | 'PUT' | 'PATCH' | 'DELETE';
  headers?: Record<string, string>;
  body?: Record<string, any> | FormData | null;
  params?: Record<string, string | number | boolean | null | undefined>;
  needsAuth?: boolean; // Flag to indicate if the request requires authentication
}

/**
 * Retrieves the current authentication token from local storage.
 * Assumes the token is stored by AuthContext or similar.
 */
const getAuthToken = (): string | null => {
  // Assuming the auth state key is 'supabase.auth.token' or similar standard key
  // Adjust this key based on how AuthProvider stores the session
  try {
    const authDataString = localStorage.getItem('sb-zoubqdwxemivxrjruvam-auth-token'); // Default Supabase key
    if (authDataString) {
      const authData: { access_token: string } | null = JSON.parse(authDataString);
      return authData?.access_token ?? null;
    }
  } catch (error) {
    console.error('Error retrieving auth token from local storage:', error);
  }
  return null;
};

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
    const token = getAuthToken();
    if (token) {
      defaultHeaders['Authorization'] = `Bearer ${token}`;
    } else {
      // If auth is needed but no token, we might want to throw an error or handle differently
      // For now, let the API call proceed, Supabase RLS will handle permissions.
      console.warn(`Auth token needed for endpoint ${endpoint} but not found. Relying on RLS.`);
    }
  }

  const combinedHeaders = { ...defaultHeaders, ...headers };

  // Construct URL with query parameters
  const url = new URL(`${SUPABASE_URL}${endpoint}`);
  Object.entries(params).forEach(([key, value]) => {
    if (value !== null && value !== undefined) {
      // Explicitly encode parameter values
      url.searchParams.append(key, encodeURIComponent(String(value)));
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
      let errorData = {};
      let errorText = response.statusText;
      try {
        // Try to parse as JSON first
        errorData = await response.json();
        console.error(`Supabase REST API Error (${response.status}) - JSON Response:`, JSON.stringify(errorData, null, 2)); // Log detailed JSON
        errorText = JSON.stringify(errorData);
      } catch (e) {
        // If not JSON, get text
        try {
            errorText = await response.text();
            console.error(`Supabase REST API Error (${response.status}) - Text Response:`, errorText); // Log detailed text
        } catch (textError) {
            console.error(`Supabase REST API Error (${response.status}) - Could not get response body.`);
            errorText = response.statusText; // Fallback to status text
        }
      }
      // Throw an error including the status and the detailed message
      throw new Error(`HTTP error ${response.status}: ${errorText}`);
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
        throw new Error("Invalid JSON response from API");
    }

  } catch (error) {
    console.error('Network or fetch error:', error);
    // Construct a more informative error message
    let errorMessage = 'Network or fetch error occurred.';
    if (error instanceof Error) {
        errorMessage = `Fetch failed: ${error.message}`;
    } else if (typeof error === 'string') {
        errorMessage = error;
    }
    // Re-throw a new Error object with a clear message
    throw new Error(errorMessage);
  }
};

// Optional: Add helper functions for common operations (CRUD)

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
    headers, // Pass the correctly typed headers object or undefined
    needsAuth,
  });
} 