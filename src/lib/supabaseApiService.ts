
import { SUPABASE_URL, SUPABASE_KEY } from '@/integrations/supabase/db-client';

interface SupabaseApiOptions {
  headers?: Record<string, string>;
  params?: Record<string, string>;
}

/**
 * Generic function to make Supabase REST API requests
 */
export async function supabaseApiRequest<T = any>(
  endpoint: string,
  method: string,
  options: SupabaseApiOptions = {},
  body?: any
): Promise<{ data: T | null; error: Error | null }> {
  try {
    const url = new URL(`${SUPABASE_URL}/rest/v1/${endpoint}`);
    
    // Add query parameters
    if (options.params) {
      Object.entries(options.params).forEach(([key, value]) => {
        url.searchParams.append(key, value);
      });
    }
    
    const headers = {
      'apikey': SUPABASE_KEY,
      'Content-Type': 'application/json',
      ...options.headers
    };

    // Add authorization if available
    const token = getAuthToken();
    if (token) {
      headers['Authorization'] = `Bearer ${token}`;
    }
    
    const requestOptions: RequestInit = {
      method,
      headers,
      ...(body && { body: JSON.stringify(body) })
    };
    
    const response = await fetch(url.toString(), requestOptions);
    
    if (!response.ok) {
      const errorText = await response.text();
      throw new Error(`Supabase API error: ${response.status} - ${errorText}`);
    }
    
    // Handle empty response (like from DELETE)
    if (response.status === 204) {
      return { data: null, error: null };
    }
    
    const data = await response.json();
    return { data, error: null };
  } catch (error) {
    console.error('Supabase API error:', error);
    return { 
      data: null, 
      error: error instanceof Error ? error : new Error('Unknown error')
    };
  }
}

/**
 * Get the current auth token from localStorage
 */
function getAuthToken(): string | null {
  try {
    const storedSession = localStorage.getItem('supabase.auth.token');
    if (!storedSession) return null;
    
    const { currentSession } = JSON.parse(storedSession);
    return currentSession?.access_token || null;
  } catch (error) {
    console.error('Error getting auth token:', error);
    return null;
  }
}

/**
 * GET request to Supabase REST API
 */
export function supabaseGet<T = any>(
  endpoint: string,
  params?: Record<string, string>,
  headers?: Record<string, string>
): Promise<{ data: T | null; error: Error | null }> {
  return supabaseApiRequest<T>(endpoint, 'GET', { params, headers });
}

/**
 * POST request to Supabase REST API
 */
export function supabasePost<T = any>(
  endpoint: string,
  body: any,
  headers?: Record<string, string>
): Promise<{ data: T | null; error: Error | null }> {
  return supabaseApiRequest<T>(endpoint, 'POST', { headers }, body);
}

/**
 * PUT request to Supabase REST API
 */
export function supabasePut<T = any>(
  endpoint: string,
  body: any,
  headers?: Record<string, string>
): Promise<{ data: T | null; error: Error | null }> {
  return supabaseApiRequest<T>(endpoint, 'PUT', { headers }, body);
}

/**
 * PATCH request to Supabase REST API
 */
export function supabasePatch<T = any>(
  endpoint: string,
  body: any,
  headers?: Record<string, string>
): Promise<{ data: T | null; error: Error | null }> {
  return supabaseApiRequest<T>(endpoint, 'PATCH', { headers }, body);
}

/**
 * DELETE request to Supabase REST API
 */
export function supabaseDelete<T = any>(
  endpoint: string,
  params?: Record<string, string>,
  headers?: Record<string, string>
): Promise<{ data: T | null; error: Error | null }> {
  return supabaseApiRequest<T>(endpoint, 'DELETE', { params, headers });
}
