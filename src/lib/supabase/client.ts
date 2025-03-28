/**
 * Supabase Client Wrapper
 * 
 * This file has been updated to use direct REST API calls instead of the Supabase client
 * in accordance with SSOT8001 guidelines.
 * 
 * This wrapper provides a consistent interface while using the REST API under the hood.
 */

// Import REST client functions instead of Supabase client
import { 
  supabaseRestCall,
  getCurrentSession,
  getCurrentUser,
  signInWithEmail,
  signOut,
  onAuthStateChange,
  SUPABASE_URL,
  SUPABASE_ANON_KEY
} from '../../api/missionFreshApiClient';

// Re-export functions for backward compatibility
export {
  supabaseRestCall,
  getCurrentSession,
  getCurrentUser,
  signInWithEmail,
  signOut,
  onAuthStateChange,
  SUPABASE_URL,
  SUPABASE_ANON_KEY
};

// Export environment variables for components that need them
// export const SUPABASE_URL = import.meta.env.VITE_SUPABASE_URL || 'https://zoubqdwxemivxrjruvam.supabase.co';
// export const SUPABASE_ANON_KEY = import.meta.env.VITE_SUPABASE_ANON_KEY || 'eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6InpvdWJxZHd4ZW1pdnhyanJ1dmFtIiwicm9sZSI6ImFub24iLCJpYXQiOjE3Mzg0MjAxOTcsImV4cCI6MjA1Mzk5NjE5N30.tq2ssOiA8CbFUZc6HXWXMEev1dODzKZxzNrpvyzbbXs';

// Helper function for authenticated REST calls
export const authenticatedRestCall = async (
  endpoint: string, 
  options: RequestInit = {}, 
  session?: any | null
): Promise<{ data?: any; error?: any }> => {
  try {
    const data = await supabaseRestCall(endpoint, options, session);
    return { data };
  } catch (error) {
    return { error };
  }
};

// Backward compatibility layer for components still using 'supabase' directly
// This object provides the same interface but uses REST API calls under the hood
export const supabase = {
  auth: {
    getSession: async () => {
      const session = await getCurrentSession();
      return { data: { session }, error: null };
    },
    getUser: async () => {
      const user = await getCurrentUser();
      return { data: { user }, error: null };
    },
    signIn: async (params: { email: string, password: string }) => {
      try {
        const result = await signInWithEmail(params.email, params.password);
        return { data: result, error: null };
      } catch (error) {
        return { data: null, error };
      }
    },
    signOut: async () => {
      const session = await getCurrentSession();
      if (session) {
        await signOut(session);
      }
      return { error: null };
    },
    onAuthStateChange: (callback: (event: string, session: any) => void) => {
      return onAuthStateChange(callback);
    }
  },
  from: (table: string) => ({
    select: (columns: string = '*') => ({
      eq: async (column: string, value: any) => {
        const session = await getCurrentSession();
        const path = `/rest/v1/${table}?${column}=eq.${value}&select=${columns}`;
        const { data, error } = await authenticatedRestCall(path, { method: 'GET' }, session);
        return { data, error };
      },
      in: async (column: string, values: any[]) => {
        const session = await getCurrentSession();
        const valuesStr = values.join(',');
        const path = `/rest/v1/${table}?${column}=in.(${valuesStr})&select=${columns}`;
        const { data, error } = await authenticatedRestCall(path, { method: 'GET' }, session);
        return { data, error };
      },
      order: (column: string, options: { ascending?: boolean } = {}) => ({
        eq: async (filterColumn: string, value: any) => {
          const session = await getCurrentSession();
          const direction = options.ascending === false ? 'desc' : 'asc';
          const path = `/rest/v1/${table}?${filterColumn}=eq.${value}&select=${columns}&order=${column}.${direction}`;
          const { data, error } = await authenticatedRestCall(path, { method: 'GET' }, session);
          return { data, error };
        }
      })
    }),
    insert: async (data: any, options: { returning?: string } = { returning: 'representation' }) => {
      const session = await getCurrentSession();
      const path = `/rest/v1/${table}`;
      const headers: HeadersInit = {
        'Prefer': `return=${options.returning || 'representation'}`
      };
      const { data: responseData, error } = await authenticatedRestCall(
        path, 
        { method: 'POST', headers, body: JSON.stringify(data) },
        session
      );
      return { data: responseData, error };
    },
    update: (data: any) => ({
      eq: async (column: string, value: any) => {
        const session = await getCurrentSession();
        const path = `/rest/v1/${table}?${column}=eq.${value}`;
        const headers: HeadersInit = {
          'Prefer': 'return=representation'
        };
        const { data: responseData, error } = await authenticatedRestCall(
          path, 
          { method: 'PATCH', headers, body: JSON.stringify(data) },
          session
        );
        return { data: responseData, error };
      }
    }),
    delete: () => ({
      eq: async (column: string, value: any) => {
        const session = await getCurrentSession();
        const path = `/rest/v1/${table}?${column}=eq.${value}`;
        const headers: HeadersInit = {
          'Prefer': 'return=representation'
        };
        const { data: responseData, error } = await authenticatedRestCall(
          path, 
          { method: 'DELETE', headers },
          session
        );
        return { data: responseData, error };
      }
    })
  }),
  storage: {
    from: (bucket: string) => ({
      upload: async (path: string, file: File) => {
        const session = await getCurrentSession();
        const formData = new FormData();
        formData.append('file', file);
        
        const { data, error } = await authenticatedRestCall(
          `/storage/v1/object/${bucket}/${path}`,
          { 
            method: 'POST', 
            body: formData,
            headers: {
              // Don't set Content-Type here - let the browser set it with the boundary for the form data
            }
          },
          session
        );
        
        return { data, error };
      },
      getPublicUrl: (path: string) => {
        return { 
          data: { 
            publicUrl: `${SUPABASE_URL}/storage/v1/object/public/${bucket}/${path}` 
          } 
        };
      },
      remove: async (paths: string[]) => {
        const session = await getCurrentSession();
        
        try {
          const results = await Promise.all(
            paths.map(path => 
              authenticatedRestCall(
                `/storage/v1/object/${bucket}/${path}`,
                { method: 'DELETE' },
                session
              )
            )
          );
          
          // Check if any errors occurred
          const errors = results.filter(result => result.error);
          
          if (errors.length > 0) {
            return { data: null, error: errors[0].error };
          }
          
          return { data: { paths }, error: null };
        } catch (error) {
          return { data: null, error };
        }
      }
    })
  }
}; 