import { useState, useEffect, useCallback } from 'react';
import { useAuth } from '../components/AuthProvider';
import { supabaseRequest } from '@/utils/supabaseRequest'; // Corrected import
import { handleError } from '../utils/error-handler';

type FetchState<T> = {
  data: T | null;
  isLoading: boolean;
  error: Error | null;
  refetch: () => void;
};

/**
 * Custom hook for data fetching from the API with proper error handling and loading states
 * 
 * @param endpoint API endpoint to fetch data from
 * @param options fetch options
 * @param dependencies Array of dependencies to trigger refetch
 * @returns Object with data, loading state, error, and refetch function
 */
export function useApi<T>(
  endpoint: string,
  options: RequestInit = { method: 'GET' },
  dependencies: any[] = []
) {
  const [data, setData] = useState<T | null>(null);
  const [isLoading, setIsLoading] = useState<boolean>(true);
  const [error, setError] = useState<Error | null>(null);

  const fetchData = useCallback(async () => {
    setIsLoading(true);
    setError(null);
    
    try {
      // Use supabaseRequest, handle response
      const { data: result, error: fetchError } = await supabaseRequest<T>(endpoint, options);
      if (fetchError) {
        throw fetchError; // Let catch block handle it
      }
      setData(result);
      return result;
    } catch (err) {
      const handledError = handleError(
        err, 
        'useApi', 
        'Failed to fetch data', 
        { silent: true }
      );
      setError(handledError instanceof Error ? handledError : new Error('Unknown error'));
      return null;
    } finally {
      setIsLoading(false);
    }
  }, [endpoint, JSON.stringify(options)]);

  const refetch = useCallback(() => {
    return fetchData();
  }, [fetchData]);

  useEffect(() => {
    fetchData();
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [...dependencies, fetchData]);

  return { data, isLoading, error, refetch };
}

/**
 * Custom hook for mutation operations (POST, PUT, PATCH, DELETE)
 * 
 * @param endpoint API endpoint for the mutation
 * @param method HTTP method to use
 * @returns Object with mutation function, loading and error states
 */
export function useApiMutation<T, P = any>(
  endpoint: string,
  method: 'POST' | 'PUT' | 'PATCH' | 'DELETE' = 'POST'
) {
  const [isLoading, setIsLoading] = useState<boolean>(false);
  const [error, setError] = useState<Error | null>(null);
  const [data, setData] = useState<T | null>(null);

  const mutate = useCallback(
    async (payload?: P): Promise<T | null> => {
      setIsLoading(true);
      setError(null);
      
      try {
        const options: RequestInit = {
          method,
          ...(payload && {
            body: JSON.stringify(payload),
          }),
        };
        
        // Use supabaseRequest, handle response
        const { data: result, error: mutateError } = await supabaseRequest<T>(endpoint, options);
         if (mutateError) {
           throw mutateError; // Let catch block handle it
         }
        setData(result);
        return result;
      } catch (err) {
        const handledError = handleError(
          err, 
          'useApiMutation', 
          'Operation failed', 
          { silent: true }
        );
        setError(handledError instanceof Error ? handledError : new Error('Unknown error'));
        return null;
      } finally {
        setIsLoading(false);
      }
    },
    [endpoint, method]
  );

  return { mutate, isLoading, error, data };
} 