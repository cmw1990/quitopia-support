import { supabase } from '@/integrations/supabase/supabase-client';
import type { Database } from '@/integrations/supabase/types';

// Using the singleton client from the integrations directory
// No need to create a new client here

// Type-safe API functions
export const api = {
  auth: {
    signIn: async (email: string, password: string) => {
      return supabase.auth.signInWithPassword({ email, password });
    },
    signUp: async (email: string, password: string) => {
      return supabase.auth.signUp({ email, password });
    },
    signOut: async () => {
      return supabase.auth.signOut();
    },
    resetPassword: async (email: string) => {
      return supabase.auth.resetPasswordForEmail(email);
    },
    updatePassword: async (password: string) => {
      return supabase.auth.updateUser({ password });
    },
  },
  users: {
    getProfile: async (userId: string) => {
      return supabase
        .from('profiles')
        .select('*')
        .eq('id', userId)
        .single();
    },
    updateProfile: async (userId: string, data: Partial<any>) => {
      return supabase
        .from('profiles')
        .update(data)
        .eq('id', userId);
    },
  },
  activities: {
    create: async (data: Omit<any, 'id' | 'created_at' | 'updated_at'>) => {
      return supabase
        .from('activities')
        .insert(data);
    },
    list: async (userId: string) => {
      return supabase
        .from('activities')
        .select('*')
        .eq('user_id', userId)
        .order('created_at', { ascending: false });
    },
    get: async (id: string) => {
      return supabase
        .from('activities')
        .select('*')
        .eq('id', id)
        .single();
    },
    update: async (id: string, data: Partial<any>) => {
      return supabase
        .from('activities')
        .update(data)
        .eq('id', id);
    },
    delete: async (id: string) => {
      return supabase
        .from('activities')
        .delete()
        .eq('id', id);
    },
  },
  metrics: {
    createEnergyMetric: async (data: Omit<any, 'id' | 'created_at' | 'updated_at'>) => {
      return supabase
        .from('energy_metrics')
        .insert(data);
    },
    getEnergyMetrics: async (userId: string, timeRange?: { from: string; to: string }) => {
      let query = supabase
        .from('energy_metrics')
        .select('*')
        .eq('user_id', userId)
        .order('timestamp', { ascending: false });

      if (timeRange) {
        query = query
          .gte('timestamp', timeRange.from)
          .lte('timestamp', timeRange.to);
      }

      return query;
    },
  },
  sleep: {
    create: async (data: Omit<any, 'id' | 'created_at' | 'updated_at'>) => {
      return supabase
        .from('sleep_data')
        .insert(data);
    },
    list: async (userId: string, timeRange?: { from: string; to: string }) => {
      let query = supabase
        .from('sleep_data')
        .select('*')
        .eq('user_id', userId)
        .order('date', { ascending: false });

      if (timeRange) {
        query = query
          .gte('date', timeRange.from)
          .lte('date', timeRange.to);
      }

      return query;
    },
  },
  exercise: {
    create: async (data: Omit<any, 'id' | 'created_at' | 'updated_at'>) => {
      return supabase
        .from('exercise_data')
        .insert(data);
    },
    list: async (userId: string, timeRange?: { from: string; to: string }) => {
      let query = supabase
        .from('exercise_data')
        .select('*')
        .eq('user_id', userId)
        .order('start_time', { ascending: false });

      if (timeRange) {
        query = query
          .gte('start_time', timeRange.from)
          .lte('start_time', timeRange.to);
      }

      return query;
    },
  },
};
