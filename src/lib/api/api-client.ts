
import { SUPABASE_URL, SUPABASE_KEY } from '@/integrations/supabase/db-client';

interface RequestOptions {
  method: 'GET' | 'POST' | 'PUT' | 'PATCH' | 'DELETE';
  headers?: Record<string, string>;
  body?: any;
  params?: Record<string, string>;
}

export interface ApiResponse<T = any> {
  data: T | null;
  error: Error | null;
}

/**
 * Makes a direct REST API call to Supabase
 */
export async function apiRequest<T = any>(
  endpoint: string,
  options: RequestOptions,
  customUrl?: string
): Promise<ApiResponse<T>> {
  try {
    const url = new URL(`${customUrl || SUPABASE_URL}/rest/v1/${endpoint}`);
    
    // Add query parameters if they exist
    if (options.params) {
      Object.entries(options.params).forEach(([key, value]) => {
        url.searchParams.append(key, value);
      });
    }

    // Default headers
    const headers = {
      'apikey': SUPABASE_KEY,
      'Content-Type': 'application/json',
      ...options.headers,
    };

    // Add Authorization header if user has a session
    const storedSession = localStorage.getItem('supabase.auth.token');
    if (storedSession) {
      try {
        const { currentSession } = JSON.parse(storedSession);
        if (currentSession?.access_token) {
          headers['Authorization'] = `Bearer ${currentSession.access_token}`;
        }
      } catch (e) {
        console.error('Error parsing auth token:', e);
      }
    }

    // Prepare request options
    const requestOptions: RequestInit = {
      method: options.method,
      headers,
      body: options.body ? JSON.stringify(options.body) : undefined,
    };

    const response = await fetch(url.toString(), requestOptions);

    if (!response.ok) {
      const errorText = await response.text();
      return {
        data: null,
        error: new Error(`API Error: ${response.status} ${errorText}`),
      };
    }

    // For DELETE requests that return no content
    if (response.status === 204) {
      return { data: null, error: null };
    }

    const data = await response.json();
    return { data, error: null };
  } catch (error) {
    console.error('API Request Error:', error);
    return { 
      data: null, 
      error: error instanceof Error ? error : new Error('Unknown API error') 
    };
  }
}

/**
 * Helper function for GET requests
 */
export function apiGet<T = any>(
  endpoint: string,
  params?: Record<string, string>,
  headers?: Record<string, string>
): Promise<ApiResponse<T>> {
  return apiRequest<T>(endpoint, {
    method: 'GET',
    params,
    headers,
  });
}

/**
 * Helper function for POST requests
 */
export function apiPost<T = any>(
  endpoint: string,
  body?: any,
  headers?: Record<string, string>
): Promise<ApiResponse<T>> {
  return apiRequest<T>(endpoint, {
    method: 'POST',
    body,
    headers,
  });
}

/**
 * Helper function for PUT requests
 */
export function apiPut<T = any>(
  endpoint: string,
  body?: any,
  headers?: Record<string, string>
): Promise<ApiResponse<T>> {
  return apiRequest<T>(endpoint, {
    method: 'PUT',
    body,
    headers,
  });
}

/**
 * Helper function for PATCH requests
 */
export function apiPatch<T = any>(
  endpoint: string,
  body?: any,
  headers?: Record<string, string>
): Promise<ApiResponse<T>> {
  return apiRequest<T>(endpoint, {
    method: 'PATCH',
    body,
    headers,
  });
}

/**
 * Helper function for DELETE requests
 */
export function apiDelete<T = any>(
  endpoint: string,
  params?: Record<string, string>,
  headers?: Record<string, string>
): Promise<ApiResponse<T>> {
  return apiRequest<T>(endpoint, {
    method: 'DELETE',
    params,
    headers,
  });
}
