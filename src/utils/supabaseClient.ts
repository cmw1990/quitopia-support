/**
 * @deprecated This file is provided for backwards compatibility only.
 * Please use the REST client directly from '@/lib/supabase/rest-client' instead.
 * Direct Supabase client usage is prohibited according to SSOT8001.
 */

import { 
  supabaseRestCall, 
  authenticatedRestCall,
  signUp,
  signIn,
  signOut,
  getCurrentUser,
  getCurrentSession
} from '@/lib/supabase/rest-client';

// Re-export the REST client functions for backward compatibility
export { 
  supabaseRestCall, 
  authenticatedRestCall,
  signUp,
  signIn,
  signOut,
  getCurrentUser,
  getCurrentSession
};

// Provide compatibility dummy client for gradual migration
export const supabase = {
  auth: {
    signUp: async (credentials) => signUp(credentials.email, credentials.password),
    signIn: async (credentials) => signIn(credentials.email, credentials.password),
    signOut,
    getSession: () => getCurrentSession(),
    getUser: () => getCurrentUser()
  },
  from: (table) => ({
    select: (columns = '*') => ({
      eq: (field, value) => ({
        order: (column, { ascending = true } = {}) => ({
          limit: async (limit) => {
            const endpoint = `/rest/v1/${table}?select=${columns}&${field}=eq.${value}&order=${column}.${ascending ? 'asc' : 'desc'}&limit=${limit}`;
            const result = await supabaseRestCall(endpoint, { method: 'GET' });
            return { data: result.data, error: result.error };
          }
        })
      })
    }),
    insert: async (data) => {
      const endpoint = `/rest/v1/${table}`;
      const result = await supabaseRestCall(endpoint, { 
        method: 'POST',
        body: JSON.stringify(data)
      });
      return { data: result.data, error: result.error };
    },
    update: (data) => ({
      eq: async (field, value) => {
        const endpoint = `/rest/v1/${table}?${field}=eq.${value}`;
        const result = await supabaseRestCall(endpoint, { 
          method: 'PATCH',
          body: JSON.stringify(data)
        });
        return { data: result.data, error: result.error };
      }
    }),
    delete: () => ({
      eq: async (field, value) => {
        const endpoint = `/rest/v1/${table}?${field}=eq.${value}`;
        const result = await supabaseRestCall(endpoint, { method: 'DELETE' });
        return { data: result.data, error: result.error };
      }
    })
  }),
  storage: {
    from: (bucket) => ({
      upload: async (path, file) => {
        const formData = new FormData();
        formData.append('file', file);
        const endpoint = `/storage/v1/object/${bucket}/${path}`;
        const result = await supabaseRestCall(endpoint, {
          method: 'POST',
          body: formData,
          headers: {}
        });
        return { data: result.data, error: result.error };
      },
      getPublicUrl: (path) => {
        const supabaseUrl = import.meta.env.VITE_SUPABASE_URL || 'https://zoubqdwxemivxrjruvam.supabase.co';
        return { 
          data: { publicUrl: `${supabaseUrl}/storage/v1/object/public/${bucket}/${path}` }
        };
      },
      remove: async (paths) => {
        const endpoint = `/storage/v1/object/${bucket}/${Array.isArray(paths) ? paths[0] : paths}`;
        const result = await supabaseRestCall(endpoint, { method: 'DELETE' });
        return { data: result.data, error: result.error };
      }
    })
  }
}; 