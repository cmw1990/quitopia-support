
import { supabase } from './supabase-client';

/**
 * Authentication REST API wrapper
 */
export const auth = {
  /**
   * Sign in with email and password
   */
  signIn: async (email: string, password: string) => {
    try {
      const { data, error } = await supabase.auth.signInWithPassword({
        email,
        password
      });
      
      return { data, error };
    } catch (err) {
      return { data: null, error: err };
    }
  },

  /**
   * Sign up with email and password
   */
  signUp: async (email: string, password: string) => {
    try {
      const { data, error } = await supabase.auth.signUp({
        email,
        password
      });
      
      return { data, error };
    } catch (err) {
      return { data: null, error: err };
    }
  },

  /**
   * Sign out the current user
   */
  signOut: async (token?: string) => {
    try {
      const { error } = await supabase.auth.signOut();
      return { error };
    } catch (err) {
      return { error: err };
    }
  },

  /**
   * Send a password reset email
   */
  resetPassword: async (email: string) => {
    try {
      const { data, error } = await supabase.auth.resetPasswordForEmail(email, {
        redirectTo: `${window.location.origin}/reset-password`
      });
      
      return { data, error };
    } catch (err) {
      return { data: null, error: err };
    }
  },

  /**
   * Update user password
   */
  updatePassword: async (token: string, password: string) => {
    try {
      const { data, error } = await supabase.auth.updateUser({
        password
      });
      
      return { data, error };
    } catch (err) {
      return { data: null, error: err };
    }
  },

  /**
   * Get user data with token
   */
  getUser: async (token: string) => {
    try {
      const { data, error } = await supabase.auth.getUser();
      return { data: data.user, error };
    } catch (err) {
      return { data: null, error: err };
    }
  }
};

/**
 * Database REST API wrapper
 */
export const db = {
  /**
   * Select data from a table
   */
  from: (table: string) => ({
    /**
     * Select columns from the table
     */
    select: async (columns: string | undefined, token: string | null) => {
      try {
        const query = supabase.from(table).select(columns || '*');
        const { data, error } = await query;
        return { data, error };
      } catch (err) {
        return { data: null, error: err };
      }
    },

    /**
     * Insert data into the table
     */
    insert: async (data: any, token: string | null) => {
      try {
        const { data: responseData, error } = await supabase
          .from(table)
          .insert(data)
          .select();
        
        return { data: responseData, error };
      } catch (err) {
        return { data: null, error: err };
      }
    },

    /**
     * Update data in the table
     */
    update: async (updates: any, match: Record<string, any>, token: string | null) => {
      try {
        let query = supabase.from(table).update(updates);
        
        // Add match conditions
        Object.entries(match).forEach(([key, value]) => {
          query = query.eq(key, value);
        });
        
        const { data, error } = await query.select();
        return { data, error };
      } catch (err) {
        return { data: null, error: err };
      }
    },

    /**
     * Delete data from the table
     */
    delete: async (match: Record<string, any>, token: string | null) => {
      try {
        let query = supabase.from(table).delete();
        
        // Add match conditions
        Object.entries(match).forEach(([key, value]) => {
          query = query.eq(key, value);
        });
        
        const { data, error } = await query;
        return { data, error };
      } catch (err) {
        return { data: null, error: err };
      }
    }
  }),

  /**
   * Call a remote procedure (RPC)
   */
  rpc: async (functionName: string, params: any, token: string | null) => {
    try {
      const { data, error } = await supabase.rpc(functionName, params);
      return { data, error };
    } catch (err) {
      return { data: null, error: err };
    }
  }
};
