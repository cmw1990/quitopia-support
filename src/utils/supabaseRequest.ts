import { handleError } from './error-handler';

// Generic response type for Supabase requests
export interface SupabaseResponse<T> {
  data: T | null;
  error: Error | null;
}

// Configuration interface for request options
export interface RequestConfig {
  tableName: string;
  method: 'GET' | 'POST' | 'PATCH' | 'DELETE';
  body?: any;
  params?: Record<string, any>;
  headers?: Record<string, string>;
  accessToken?: string;
}

export const supabaseRequest = async <T = any>(config: RequestConfig): Promise<SupabaseResponse<T>> => {
  try {
    // Construct the base URL for the request
    const baseUrl = import.meta.env.VITE_SUPABASE_URL || 'https://zoubqdwxemivxrjruvam.supabase.co';
    const url = new URL(`${baseUrl}/rest/v1/${config.tableName}`);

    // Add query parameters if provided
    if (config.params) {
      Object.entries(config.params).forEach(([key, value]) => {
        url.searchParams.append(key, String(value));
      });
    }

    // Prepare headers
    const headers: HeadersInit = {
      'Content-Type': 'application/json',
      'apikey': import.meta.env.VITE_SUPABASE_ANON_KEY || 'your-anon-key',
      ...config.headers
    };

    // Add authorization header if access token is provided
    if (config.accessToken) {
      headers['Authorization'] = `Bearer ${config.accessToken}`;
    }

    // Prepare request options
    const requestOptions: RequestInit = {
      method: config.method,
      headers,
      body: config.body ? JSON.stringify(config.body) : undefined
    };

    // Execute the request
    const response = await fetch(url.toString(), requestOptions);

    // Check for HTTP errors
    if (!response.ok) {
      const errorText = await response.text();
      const error = new Error(`HTTP error! status: ${response.status}, message: ${errorText}`);
      handleError(error, `supabaseRequest:${config.method}:${config.tableName}`);
      return { data: null, error };
    }

    // Parse response data
    const data = await response.json().catch(() => null) as T | null;

    return { 
      data, 
      error: null 
    };

  } catch (error) {
    // Handle any unexpected errors
    const processedError = handleError(error, `supabaseRequest:${config.method}:${config.tableName}`);
    return { 
      data: null, 
      error: new Error(processedError.message) 
    };
  }
};