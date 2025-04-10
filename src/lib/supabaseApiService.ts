import { z } from 'zod';

// Basic error structure for API responses
const ApiErrorSchema = z.object({
  message: z.string(),
  details: z.string().optional(),
  hint: z.string().optional(),
  code: z.string().optional(),
});

export type ApiError = z.infer<typeof ApiErrorSchema>;

// Ensure environment variables are loaded correctly
const SUPABASE_URL = import.meta.env.VITE_SUPABASE_URL;
const SUPABASE_ANON_KEY = import.meta.env.VITE_SUPABASE_ANON_KEY;

if (!SUPABASE_URL) {
  throw new Error('Missing environment variable: VITE_SUPABASE_URL');
}
if (!SUPABASE_ANON_KEY) {
  throw new Error('Missing environment variable: VITE_SUPABASE_ANON_KEY');
}

// Retrieves the current authentication token from local storage.
// Adapt the key if your AuthProvider uses a different one.
const getAuthToken = (): string | null => {
  try {
    // Common Supabase key pattern: sb-<project_ref>-auth-token
    const key = `sb-${SUPABASE_URL.split('.')[0].split('//')[1]}-auth-token`;
    const authDataString = localStorage.getItem(key);
    if (authDataString) {
      const authData: { access_token: string } | null = JSON.parse(authDataString);
      return authData?.access_token ?? null;
    }
  } catch (error) {
    console.error('Error retrieving auth token:', error);
  }
  return null;
};

// Base headers as Record<string, string>
const BASE_HEADERS: Record<string, string> = {
  'apikey': SUPABASE_ANON_KEY,
  'Content-Type': 'application/json',
};

// Function to get headers, dynamically adding Auth if token exists
// Returns a type compatible with HeadersInit
export const getRequestHeaders = (): Record<string, string> => {
  const headers: Record<string, string> = { ...BASE_HEADERS }; 
  const token = getAuthToken();
  if (token) {
    headers['Authorization'] = `Bearer ${token}`; // Directly add as string
  }
  // No need to delete if it wasn't added
  return headers;
};

// Helper function to handle API responses
async function handleResponse<T>(response: Response): Promise<{ data: T | null; error: ApiError | null }> {
  if (response.ok) {
    // Handle potential empty responses (e.g., for DELETE or successful POST/PATCH with no return pref)
    if (response.status === 204 || response.headers.get('content-length') === '0') {
        return { data: null, error: null };
    }
    try {
        const data = await response.json();
        return { data: data as T, error: null };
    } catch (jsonError) {
        // Handle cases where response is OK but not valid JSON (shouldn't happen often with Supabase)
        console.error('Failed to parse JSON response:', jsonError);
        return { data: null, error: { message: 'Failed to parse JSON response' } };
    }

  } else {
    let errorData: ApiError = { message: `HTTP error ${response.status}: ${response.statusText}` };
    try {
      const errorJson = await response.json();
      const parsedError = ApiErrorSchema.safeParse(errorJson);
      if (parsedError.success) {
        errorData = parsedError.data;
      } else {
          console.warn('Failed to parse Supabase error response:', errorJson);
          errorData.details = JSON.stringify(errorJson); // Include raw error if parsing fails
      }
    } catch (e) {
      // Ignore error trying to parse error body
       console.warn('Could not parse error response body:', e);
    }
    console.error('Supabase API Error:', errorData);
    return { data: null, error: errorData };
  }
}

// --- CRUD Functions (Updated to use getRequestHeaders directly) ---

/**
 * Fetches data from a Supabase table using REST API.
 * @param tableName The name of the table.
 * @param queryParams Optional query parameters (e.g., 'select=*, 'id=eq.1').
 * See Supabase docs for filtering: https://supabase.com/docs/reference/javascript/select
 */
export async function supabaseGet<T>(tableName: string, queryParams: string = 'select=*'): Promise<{ data: T[] | null; error: ApiError | null }> {
  const url = `${SUPABASE_URL}/rest/v1/${tableName}?${queryParams}`;
  try {
    const response = await fetch(url, {
      method: 'GET',
      headers: getRequestHeaders(), // No cast needed now
    });
    return await handleResponse<T[]>(response);
  } catch (error) {
    console.error(`Network error fetching from ${tableName}:`, error);
    return { data: null, error: { message: error instanceof Error ? error.message : 'Network error' } };
  }
}

/**
 * Inserts data into a Supabase table using REST API.
 * @param tableName The name of the table.
 * @param data The data to insert (single object or array of objects).
 * @param preferReturn Set to 'representation' to return the inserted record(s).
 */
export async function supabasePost<T>(tableName: string, data: object | object[], preferReturn: 'representation' | 'minimal' = 'minimal'): Promise<{ data: T[] | null; error: ApiError | null }> {
  const url = `${SUPABASE_URL}/rest/v1/${tableName}`;
  try {
    const headers = getRequestHeaders();
    headers['Prefer'] = `return=${preferReturn}`; // Add Prefer header

    const response = await fetch(url, {
      method: 'POST',
      headers: headers, // No cast needed now
      body: JSON.stringify(data),
    });
    // Supabase often returns 201 Created for POST
     if (response.status === 201) {
         if (preferReturn === 'representation') {
            const returnedData = await response.json();
            // Supabase returns a single object if one was inserted, wrap in array
            return { data: Array.isArray(returnedData) ? returnedData : [returnedData], error: null };
         } else {
            return { data: null, error: null }; // Minimal return
         }
     }
    // Handle other potential success/error statuses
    return await handleResponse<T[]>(response);
  } catch (error) {
    console.error(`Network error inserting into ${tableName}:`, error);
    return { data: null, error: { message: error instanceof Error ? error.message : 'Network error' } };
  }
}

/**
 * Updates data in a Supabase table using REST API.
 * @param tableName The name of the table.
 * @param data The data to update.
 * @param queryParams Query parameters to specify which rows to update (e.g., 'id=eq.1'). MANDATORY for safety.
 * @param preferReturn Set to 'representation' to return the updated record(s).
 */
export async function supabasePatch<T>(tableName: string, data: object, queryParams: string, preferReturn: 'representation' | 'minimal' = 'minimal'): Promise<{ data: T[] | null; error: ApiError | null }> {
   if (!queryParams) {
        const errorMsg = `PATCH request to '${tableName}' requires query parameters to specify rows.`;
        console.error(errorMsg);
        return { data: null, error: { message: errorMsg, code: 'CLIENT_ERROR' } };
    }
  const url = `${SUPABASE_URL}/rest/v1/${tableName}?${queryParams}`;
  try {
    const headers = getRequestHeaders();
    headers['Prefer'] = `return=${preferReturn}`; // Add Prefer header

    const response = await fetch(url, {
      method: 'PATCH',
      headers: headers, // No cast needed now
      body: JSON.stringify(data),
    });
    return await handleResponse<T[]>(response);
  } catch (error) {
    console.error(`Network error updating ${tableName}:`, error);
    return { data: null, error: { message: error instanceof Error ? error.message : 'Network error' } };
  }
}

/**
 * Deletes data from a Supabase table using REST API.
 * @param tableName The name of the table.
 * @param queryParams Query parameters to specify which rows to delete (e.g., 'id=eq.1'). MANDATORY for safety.
 */
export async function supabaseDelete(tableName: string, queryParams: string): Promise<{ data: null; error: ApiError | null }> {
    if (!queryParams) {
        const errorMsg = `DELETE request to '${tableName}' requires query parameters to specify rows.`;
        console.error(errorMsg);
        return { data: null, error: { message: errorMsg, code: 'CLIENT_ERROR' } };
    }
  const url = `${SUPABASE_URL}/rest/v1/${tableName}?${queryParams}`;
  try {
    const response = await fetch(url, {
      method: 'DELETE',
      headers: getRequestHeaders(), // No cast needed now
    });
     // DELETE often returns 204 No Content on success
    return await handleResponse<null>(response);
  } catch (error) {
    console.error(`Network error deleting from ${tableName}:`, error);
    return { data: null, error: { message: error instanceof Error ? error.message : 'Network error' } };
  }
}

// Example usage (optional, for demonstration):
/*
interface MyData {
  id: number;
  name: string;
}

async function testApi() {
  const { data, error } = await supabaseGet<MyData>('your_table_name', 'select=id,name&id=eq.1');
  if (error) {
    console.error('Fetch failed:', error);
  } else {
    console.log('Fetched data:', data);
  }

  const { data: postData, error: postError } = await supabasePost<MyData>('your_table_name', { name: 'New Item' }, 'representation');
   if (postError) {
     console.error('Insert failed:', postError);
   } else {
     console.log('Inserted data:', postData);
   }
}
*/ 