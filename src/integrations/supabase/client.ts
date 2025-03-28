/**
 * Supabase REST API Bridge
 *
 * IMPORTANT: As per SSOT5001 guidelines, we MUST use direct REST API calls
 * instead of Supabase client methods. This file provides a compatibility
 * layer that adheres to the direct REST API requirement.
 */

import { 
  supabaseRestCall, 
  SUPABASE_URL, 
  SUPABASE_ANON_KEY,
  getCurrentSession,
  getCurrentUser as getMFCurrentUser,
  onAuthStateChange as mfOnAuthStateChange,
  signInWithEmail,
  signOut as mfSignOut
} from "../../api/apiCompatibility";

// This is a mock object that mimics the Supabase client interface
// but uses the direct REST API calls under the hood
export const supabase = {
  auth: {
    getUser: async () => {
      const user = await getMFCurrentUser();
      return { data: { user }, error: null };
    },
    getSession: async () => {
      const session = await getCurrentSession();
      return { data: { session }, error: null };
    },
    signIn: async ({ email, password }: { email: string; password: string }) => {
      try {
        const result = await signInWithEmail(email, password);
        return { data: result, error: null };
      } catch (error) {
        return { data: null, error };
      }
    },
    signOut: async () => {
      try {
        const session = await getCurrentSession();
        if (session) {
          await mfSignOut(session);
        }
        return { error: null };
      } catch (error) {
        return { error };
      }
    },
    onAuthStateChange: (callback: any) => {
      return mfOnAuthStateChange(callback);
    }
  },
  from: (table: string) => ({
    select: (columns = '*') => ({
      eq: async (column: string, value: any) => {
        try {
          const endpoint = `/rest/v1/${table}?${column}=eq.${value}&select=${columns}`;
          const result = await supabaseRestCall(endpoint, {}, await getCurrentSession());
          return { data: result, error: null };
        } catch (error) {
          return { data: null, error };
        }
      },
      order: (column: string, { ascending = true } = {}) => ({
        range: async (from: number, to: number) => {
          try {
            const endpoint = `/rest/v1/${table}?select=${columns}&order=${column}.${ascending ? 'asc' : 'desc'}&limit=${to - from + 1}&offset=${from}`;
            const result = await supabaseRestCall(endpoint, {}, await getCurrentSession());
            return { data: result, error: null };
          } catch (error) {
            return { data: null, error };
          }
        }
      })
    }),
    insert: async (data: any) => {
      try {
        const endpoint = `/rest/v1/${table}`;
        const result = await supabaseRestCall(endpoint, {
          method: 'POST',
          body: JSON.stringify(data),
          headers: {
            'Prefer': 'return=representation'
          }
        }, await getCurrentSession());
        return { data: result, error: null };
      } catch (error) {
        return { data: null, error };
      }
    },
    update: (data: any) => ({
      eq: async (column: string, value: any) => {
        try {
          const endpoint = `/rest/v1/${table}?${column}=eq.${value}`;
          const result = await supabaseRestCall(endpoint, {
            method: 'PATCH',
            body: JSON.stringify(data),
            headers: {
              'Prefer': 'return=representation'
            }
          }, await getCurrentSession());
          return { data: result, error: null };
        } catch (error) {
          return { data: null, error };
        }
      }
    }),
    delete: () => ({
      eq: async (column: string, value: any) => {
        try {
          const endpoint = `/rest/v1/${table}?${column}=eq.${value}`;
          const result = await supabaseRestCall(endpoint, {
            method: 'DELETE',
            headers: {
              'Prefer': 'return=representation'
            }
          }, await getCurrentSession());
          return { data: result, error: null };
        } catch (error) {
          return { data: null, error };
        }
      }
    })
  })
}; 