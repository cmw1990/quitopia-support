/**
 * API Client for Easier Focus
 * 
 * This file provides a comprehensive API client for interacting with backend services.
 * Following SSOT8001 guidelines - Direct REST API calls only, no Supabase client methods.
 */

import { Session } from '@supabase/supabase-js';
import { supabaseRestCall } from './supabase-rest';

// Environment variables
const SUPABASE_URL = import.meta.env.VITE_SUPABASE_URL;
const SUPABASE_ANON_KEY = import.meta.env.VITE_SUPABASE_ANON_KEY;

// Type definitions
export interface User {
  id: string;
  email: string;
  created_at?: string;
  last_sign_in_at?: string;
  user_metadata?: Record<string, any>;
}

export interface FocusSession {
  id?: string;
  user_id: string;
  title: string;
  description?: string;
  start_time: string;
  end_time?: string;
  duration_minutes?: number;
  focus_score?: number;
  interruption_count?: number;
  distraction_sources?: string[];
  technique_used?: string;
  completed?: boolean;
  created_at?: string;
  updated_at?: string;
}

export interface EnergyRecord {
  id?: string;
  user_id: string;
  energy_level: number;
  fatigue_level?: number;
  sleep_hours?: number;
  caffeine_intake?: number;
  water_intake?: number;
  challenges?: string[];
  notes?: string;
  timestamp: string;
  created_at?: string;
  updated_at?: string;
}

export interface Task {
  id?: string;
  user_id: string;
  title: string;
  description?: string;
  due_date?: string;
  priority: number;
  status: 'todo' | 'in_progress' | 'completed';
  tags?: string[];
  created_at?: string;
  updated_at?: string;
}

export interface DistractionLog {
  id?: string;
  user_id: string;
  focus_session_id?: string;
  type: string;
  description?: string;
  source?: string;
  duration_seconds?: number;
  timestamp: string;
  created_at?: string;
  updated_at?: string;
}

export interface ADHDStrategy {
  id?: string;
  user_id: string;
  title: string;
  description: string;
  strategy_type: string;
  effectiveness_rating?: number;
  is_favorite?: boolean;
  created_at?: string;
  updated_at?: string;
}

export interface FocusScore {
  id?: string;
  user_id: string;
  date: string;
  score: number;
  productive_minutes: number;
  distraction_count: number;
  focus_sessions_count: number;
  created_at?: string;
  updated_at?: string;
}

export interface FocusTechnique {
  id?: string;
  name: string;
  description: string;
  duration_minutes: number;
  steps: string[];
  benefits: string[];
  best_for: string[];
  created_at?: string;
  updated_at?: string;
}

export interface UserSettings {
  id?: string;
  user_id: string;
  theme?: 'light' | 'dark' | 'system';
  notification_preferences?: {
    focus_reminders: boolean;
    energy_reminders: boolean;
    achievement_notifications: boolean;
  };
  focus_preferences?: {
    default_focus_time: number;
    default_break_time: number;
    preferred_technique?: string;
  };
  created_at?: string;
  updated_at?: string;
}

export interface AntiDistractionRule {
  id?: string;
  user_id: string;
  rule_name: string;
  target_websites?: string[];
  target_apps?: string[];
  schedule?: {
    days: string[];
    start_time: string;
    end_time: string;
  }[];
  strictness_level: number;
  is_active: boolean;
  created_at?: string;
  updated_at?: string;
}

// Authentication functions
export const authApi = {
  getCurrentSession: (): Session | null => {
    try {
      const sessionStr = localStorage.getItem('supabase.auth.token');
      if (!sessionStr) return null;
      return JSON.parse(sessionStr);
    } catch (error) {
      console.error('Error getting session:', error);
      return null;
    }
  },

  signIn: async (email: string, password: string): Promise<Session> => {
    const response = await fetch(`${SUPABASE_URL}/auth/v1/token?grant_type=password`, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
        'apikey': SUPABASE_ANON_KEY,
      },
      body: JSON.stringify({ email, password }),
    });

    if (!response.ok) {
      const error = await response.json();
      throw new Error(error.error_description || error.msg);
    }

    const data = await response.json();
    localStorage.setItem('supabase.auth.token', JSON.stringify(data));
    return data;
  },

  signUp: async (email: string, password: string): Promise<Session> => {
    const response = await fetch(`${SUPABASE_URL}/auth/v1/signup`, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
        'apikey': SUPABASE_ANON_KEY,
      },
      body: JSON.stringify({ email, password }),
    });

    if (!response.ok) {
      const error = await response.json();
      throw new Error(error.error_description || error.msg);
    }

    const data = await response.json();
    localStorage.setItem('supabase.auth.token', JSON.stringify(data));
    return data;
  },

  signOut: async (): Promise<void> => {
    const session = localStorage.getItem('supabase.auth.token');
    if (!session) return;

    const { access_token } = JSON.parse(session);
    await fetch(`${SUPABASE_URL}/auth/v1/logout`, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
        'apikey': SUPABASE_ANON_KEY,
        'Authorization': `Bearer ${access_token}`,
      },
    });

    localStorage.removeItem('supabase.auth.token');
  },

  resetPassword: async (email: string): Promise<void> => {
    const response = await fetch(`${SUPABASE_URL}/auth/v1/recover`, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
        'apikey': SUPABASE_ANON_KEY,
      },
      body: JSON.stringify({ email }),
    });

    if (!response.ok) {
      const error = await response.json();
      throw new Error(error.error_description || error.msg);
    }
  },

  updatePassword: async (access_token: string, new_password: string): Promise<void> => {
    const response = await fetch(`${SUPABASE_URL}/auth/v1/user`, {
      method: 'PUT',
      headers: {
        'Content-Type': 'application/json',
        'apikey': SUPABASE_ANON_KEY,
        'Authorization': `Bearer ${access_token}`,
      },
      body: JSON.stringify({ password: new_password }),
    });

    if (!response.ok) {
      const error = await response.json();
      throw new Error(error.error_description || error.msg);
    }
  },

  getUserProfile: async (session: Session): Promise<User | null> => {
    if (!session?.user?.id) return null;

    try {
      const { data } = await supabaseRestCall(
        `/rest/v1/profiles8?user_id=eq.${session.user.id}`,
        { method: 'GET' },
        session
      );

      return data?.[0] || null;
    } catch (error) {
      console.error('Error fetching user profile:', error);
      return null;
    }
  },

  updateUserProfile: async (session: Session, profile: Partial<User>): Promise<User | null> => {
    if (!session?.user?.id) return null;

    try {
      const { data } = await supabaseRestCall(
        `/rest/v1/profiles8?user_id=eq.${session.user.id}`,
        {
          method: 'PATCH',
          body: JSON.stringify(profile),
        },
        session
      );

      return data?.[0] || null;
    } catch (error) {
      console.error('Error updating user profile:', error);
      return null;
    }
  },
};

// Focus Session API
export const focusSessionApi = {
  getFocusSessions: async (session: Session | null, options?: { limit?: number, offset?: number }): Promise<FocusSession[]> => {
    if (!session?.user?.id) return [];

    try {
      let query = `/rest/v1/focus_sessions8?user_id=eq.${session.user.id}&order=start_time.desc`;
      
      if (options?.limit) {
        query += `&limit=${options.limit}`;
      }
      
      if (options?.offset) {
        query += `&offset=${options.offset}`;
      }
      
      const { data } = await supabaseRestCall(query, { method: 'GET' }, session);
      return data || [];
    } catch (error) {
      console.error('Error fetching focus sessions:', error);
      return [];
    }
  },

  createFocusSession: async (session: Session | null, focusSession: Omit<FocusSession, 'id' | 'user_id' | 'created_at' | 'updated_at'>): Promise<FocusSession | null> => {
    if (!session?.user?.id) return null;

    try {
      const newSession = {
        ...focusSession,
        user_id: session.user.id,
      };

      const { data } = await supabaseRestCall(
        '/rest/v1/focus_sessions8',
        {
          method: 'POST',
          body: JSON.stringify(newSession),
        },
        session
      );

      return data?.[0] || null;
    } catch (error) {
      console.error('Error creating focus session:', error);
      return null;
    }
  },

  updateFocusSession: async (session: Session | null, id: string, updates: Partial<FocusSession>): Promise<FocusSession | null> => {
    if (!session?.user?.id) return null;

    try {
      const { data } = await supabaseRestCall(
        `/rest/v1/focus_sessions8?id=eq.${id}&user_id=eq.${session.user.id}`,
        {
          method: 'PATCH',
          body: JSON.stringify(updates),
        },
        session
      );

      return data?.[0] || null;
    } catch (error) {
      console.error('Error updating focus session:', error);
      return null;
    }
  },

  deleteFocusSession: async (session: Session | null, id: string): Promise<boolean> => {
    if (!session?.user?.id) return false;

    try {
      await supabaseRestCall(
        `/rest/v1/focus_sessions8?id=eq.${id}&user_id=eq.${session.user.id}`,
        { method: 'DELETE' },
        session
      );
      
      return true;
    } catch (error) {
      console.error('Error deleting focus session:', error);
      return false;
    }
  },
};

// Energy Records API
export const energyApi = {
  getEnergyRecords: async (session: Session | null, options?: { limit?: number, offset?: number }): Promise<EnergyRecord[]> => {
    if (!session?.user?.id) return [];

    try {
      let query = `/rest/v1/energy_levels8?user_id=eq.${session.user.id}&order=timestamp.desc`;
      
      if (options?.limit) {
        query += `&limit=${options.limit}`;
      }
      
      if (options?.offset) {
        query += `&offset=${options.offset}`;
      }
      
      const { data } = await supabaseRestCall(query, { method: 'GET' }, session);
      return data || [];
    } catch (error) {
      console.error('Error fetching energy records:', error);
      return [];
    }
  },

  createEnergyRecord: async (session: Session | null, record: Omit<EnergyRecord, 'id' | 'user_id' | 'created_at' | 'updated_at'>): Promise<EnergyRecord | null> => {
    if (!session?.user?.id) return null;

    try {
      const newRecord = {
        ...record,
        user_id: session.user.id,
      };

      const { data } = await supabaseRestCall(
        '/rest/v1/energy_levels8',
        {
          method: 'POST',
          body: JSON.stringify(newRecord),
        },
        session
      );

      return data?.[0] || null;
    } catch (error) {
      console.error('Error creating energy record:', error);
      return null;
    }
  },

  updateEnergyRecord: async (session: Session | null, id: string, updates: Partial<EnergyRecord>): Promise<EnergyRecord | null> => {
    if (!session?.user?.id) return null;

    try {
      const { data } = await supabaseRestCall(
        `/rest/v1/energy_levels8?id=eq.${id}&user_id=eq.${session.user.id}`,
        {
          method: 'PATCH',
          body: JSON.stringify(updates),
        },
        session
      );

      return data?.[0] || null;
    } catch (error) {
      console.error('Error updating energy record:', error);
      return null;
    }
  },

  deleteEnergyRecord: async (session: Session | null, id: string): Promise<boolean> => {
    if (!session?.user?.id) return false;

    try {
      await supabaseRestCall(
        `/rest/v1/energy_levels8?id=eq.${id}&user_id=eq.${session.user.id}`,
        { method: 'DELETE' },
        session
      );
      
      return true;
    } catch (error) {
      console.error('Error deleting energy record:', error);
      return false;
    }
  },
};

// Task API
export const taskApi = {
  getTasks: async (session: Session | null, options?: { status?: string, priority?: number, limit?: number }): Promise<Task[]> => {
    if (!session?.user?.id) return [];

    try {
      let query = `/rest/v1/tasks8?user_id=eq.${session.user.id}`;
      
      if (options?.status) {
        query += `&status=eq.${options.status}`;
      }
      
      if (options?.priority) {
        query += `&priority=eq.${options.priority}`;
      }
      
      query += `&order=priority.asc`;
      
      if (options?.limit) {
        query += `&limit=${options.limit}`;
      }
      
      const { data } = await supabaseRestCall(query, { method: 'GET' }, session);
      return data || [];
    } catch (error) {
      console.error('Error fetching tasks:', error);
      return [];
    }
  },

  createTask: async (session: Session | null, task: Omit<Task, 'id' | 'user_id' | 'created_at' | 'updated_at'>): Promise<Task | null> => {
    if (!session?.user?.id) return null;

    try {
      const newTask = {
        ...task,
        user_id: session.user.id,
      };

      const { data } = await supabaseRestCall(
        '/rest/v1/tasks8',
        {
          method: 'POST',
          body: JSON.stringify(newTask),
        },
        session
      );

      return data?.[0] || null;
    } catch (error) {
      console.error('Error creating task:', error);
      return null;
    }
  },

  updateTask: async (session: Session | null, id: string, updates: Partial<Task>): Promise<Task | null> => {
    if (!session?.user?.id) return null;

    try {
      const { data } = await supabaseRestCall(
        `/rest/v1/tasks8?id=eq.${id}&user_id=eq.${session.user.id}`,
        {
          method: 'PATCH',
          body: JSON.stringify(updates),
        },
        session
      );

      return data?.[0] || null;
    } catch (error) {
      console.error('Error updating task:', error);
      return null;
    }
  },

  deleteTask: async (session: Session | null, id: string): Promise<boolean> => {
    if (!session?.user?.id) return false;

    try {
      await supabaseRestCall(
        `/rest/v1/tasks8?id=eq.${id}&user_id=eq.${session.user.id}`,
        { method: 'DELETE' },
        session
      );
      
      return true;
    } catch (error) {
      console.error('Error deleting task:', error);
      return false;
    }
  },
};

// Distraction Logs API
export const distractionApi = {
  getDistractionLogs: async (session: Session | null, options?: { focusSessionId?: string, limit?: number }): Promise<DistractionLog[]> => {
    if (!session?.user?.id) return [];

    try {
      let query = `/rest/v1/distraction_logs8?user_id=eq.${session.user.id}&order=timestamp.desc`;
      
      if (options?.focusSessionId) {
        query += `&focus_session_id=eq.${options.focusSessionId}`;
      }
      
      if (options?.limit) {
        query += `&limit=${options.limit}`;
      }
      
      const { data } = await supabaseRestCall(query, { method: 'GET' }, session);
      return data || [];
    } catch (error) {
      console.error('Error fetching distraction logs:', error);
      return [];
    }
  },

  createDistractionLog: async (session: Session | null, log: Omit<DistractionLog, 'id' | 'user_id' | 'created_at' | 'updated_at'>): Promise<DistractionLog | null> => {
    if (!session?.user?.id) return null;

    try {
      const newLog = {
        ...log,
        user_id: session.user.id,
      };

      const { data } = await supabaseRestCall(
        '/rest/v1/distraction_logs8',
        {
          method: 'POST',
          body: JSON.stringify(newLog),
        },
        session
      );

      return data?.[0] || null;
    } catch (error) {
      console.error('Error creating distraction log:', error);
      return null;
    }
  },
};

// ADHD Strategies API
export const adhdApi = {
  getStrategies: async (session: Session | null): Promise<ADHDStrategy[]> => {
    if (!session?.user?.id) return [];

    try {
      const { data } = await supabaseRestCall(
        `/rest/v1/adhd_strategies8?user_id=eq.${session.user.id}&order=created_at.desc`,
        { method: 'GET' },
        session
      );
      
      return data || [];
    } catch (error) {
      console.error('Error fetching ADHD strategies:', error);
      return [];
    }
  },

  createStrategy: async (session: Session | null, strategy: Omit<ADHDStrategy, 'id' | 'user_id' | 'created_at' | 'updated_at'>): Promise<ADHDStrategy | null> => {
    if (!session?.user?.id) return null;

    try {
      const newStrategy = {
        ...strategy,
        user_id: session.user.id,
      };

      const { data } = await supabaseRestCall(
        '/rest/v1/adhd_strategies8',
        {
          method: 'POST',
          body: JSON.stringify(newStrategy),
        },
        session
      );

      return data?.[0] || null;
    } catch (error) {
      console.error('Error creating ADHD strategy:', error);
      return null;
    }
  },

  updateStrategy: async (session: Session | null, id: string, updates: Partial<ADHDStrategy>): Promise<ADHDStrategy | null> => {
    if (!session?.user?.id) return null;

    try {
      const { data } = await supabaseRestCall(
        `/rest/v1/adhd_strategies8?id=eq.${id}&user_id=eq.${session.user.id}`,
        {
          method: 'PATCH',
          body: JSON.stringify(updates),
        },
        session
      );

      return data?.[0] || null;
    } catch (error) {
      console.error('Error updating ADHD strategy:', error);
      return null;
    }
  },

  deleteStrategy: async (session: Session | null, id: string): Promise<boolean> => {
    if (!session?.user?.id) return false;

    try {
      await supabaseRestCall(
        `/rest/v1/adhd_strategies8?id=eq.${id}&user_id=eq.${session.user.id}`,
        { method: 'DELETE' },
        session
      );
      
      return true;
    } catch (error) {
      console.error('Error deleting ADHD strategy:', error);
      return false;
    }
  },
};

// Anti-Distraction Rules API
export const antiDistractionApi = {
  getRules: async (session: Session | null): Promise<AntiDistractionRule[]> => {
    if (!session?.user?.id) return [];

    try {
      const { data } = await supabaseRestCall(
        `/rest/v1/anti_distraction_rules8?user_id=eq.${session.user.id}&order=created_at.desc`,
        { method: 'GET' },
        session
      );
      
      return data || [];
    } catch (error) {
      console.error('Error fetching anti-distraction rules:', error);
      return [];
    }
  },

  createRule: async (session: Session | null, rule: Omit<AntiDistractionRule, 'id' | 'user_id' | 'created_at' | 'updated_at'>): Promise<AntiDistractionRule | null> => {
    if (!session?.user?.id) return null;

    try {
      const newRule = {
        ...rule,
        user_id: session.user.id,
      };

      const { data } = await supabaseRestCall(
        '/rest/v1/anti_distraction_rules8',
        {
          method: 'POST',
          body: JSON.stringify(newRule),
        },
        session
      );

      return data?.[0] || null;
    } catch (error) {
      console.error('Error creating anti-distraction rule:', error);
      return null;
    }
  },

  updateRule: async (session: Session | null, id: string, updates: Partial<AntiDistractionRule>): Promise<AntiDistractionRule | null> => {
    if (!session?.user?.id) return null;

    try {
      const { data } = await supabaseRestCall(
        `/rest/v1/anti_distraction_rules8?id=eq.${id}&user_id=eq.${session.user.id}`,
        {
          method: 'PATCH',
          body: JSON.stringify(updates),
        },
        session
      );

      return data?.[0] || null;
    } catch (error) {
      console.error('Error updating anti-distraction rule:', error);
      return null;
    }
  },

  deleteRule: async (session: Session | null, id: string): Promise<boolean> => {
    if (!session?.user?.id) return false;

    try {
      await supabaseRestCall(
        `/rest/v1/anti_distraction_rules8?id=eq.${id}&user_id=eq.${session.user.id}`,
        { method: 'DELETE' },
        session
      );
      
      return true;
    } catch (error) {
      console.error('Error deleting anti-distraction rule:', error);
      return false;
    }
  },
};

// User Settings API
export const settingsApi = {
  getUserSettings: async (session: Session | null): Promise<UserSettings | null> => {
    if (!session?.user?.id) return null;

    try {
      const { data } = await supabaseRestCall(
        `/rest/v1/user_settings8?user_id=eq.${session.user.id}`,
        { method: 'GET' },
        session
      );
      
      return data?.[0] || null;
    } catch (error) {
      console.error('Error fetching user settings:', error);
      return null;
    }
  },

  updateUserSettings: async (session: Session | null, settings: Partial<UserSettings>): Promise<UserSettings | null> => {
    if (!session?.user?.id) return null;

    try {
      // Check if settings already exist
      const existingSettings = await settingsApi.getUserSettings(session);
      
      if (existingSettings) {
        // Update existing settings
        const { data } = await supabaseRestCall(
          `/rest/v1/user_settings8?id=eq.${existingSettings.id}`,
          {
            method: 'PATCH',
            body: JSON.stringify(settings),
          },
          session
        );
        
        return data?.[0] || null;
      } else {
        // Create new settings
        const newSettings = {
          ...settings,
          user_id: session.user.id,
        };
        
        const { data } = await supabaseRestCall(
          '/rest/v1/user_settings8',
          {
            method: 'POST',
            body: JSON.stringify(newSettings),
          },
          session
        );
        
        return data?.[0] || null;
      }
    } catch (error) {
      console.error('Error updating user settings:', error);
      return null;
    }
  },
};

// Focus Techniques API
export const focusTechniquesApi = {
  getTechniques: async (session: Session | null): Promise<FocusTechnique[]> => {
    try {
      const { data } = await supabaseRestCall(
        '/rest/v1/focus_techniques8?order=name.asc',
        { method: 'GET' },
        session
      );
      
      return data || [];
    } catch (error) {
      console.error('Error fetching focus techniques:', error);
      return [];
    }
  },

  getTechniqueById: async (session: Session | null, id: string): Promise<FocusTechnique | null> => {
    try {
      const { data } = await supabaseRestCall(
        `/rest/v1/focus_techniques8?id=eq.${id}`,
        { method: 'GET' },
        session
      );
      
      return data?.[0] || null;
    } catch (error) {
      console.error('Error fetching focus technique:', error);
      return null;
    }
  },
};

// Focus Score API
export const focusScoreApi = {
  getScores: async (session: Session | null, options?: { limit?: number, startDate?: string, endDate?: string }): Promise<FocusScore[]> => {
    if (!session?.user?.id) return [];

    try {
      let query = `/rest/v1/focus_scores8?user_id=eq.${session.user.id}&order=date.desc`;
      
      if (options?.startDate) {
        query += `&date=gte.${options.startDate}`;
      }
      
      if (options?.endDate) {
        query += `&date=lte.${options.endDate}`;
      }
      
      if (options?.limit) {
        query += `&limit=${options.limit}`;
      }
      
      const { data } = await supabaseRestCall(query, { method: 'GET' }, session);
      return data || [];
    } catch (error) {
      console.error('Error fetching focus scores:', error);
      return [];
    }
  },

  createScore: async (session: Session | null, score: Omit<FocusScore, 'id' | 'user_id' | 'created_at' | 'updated_at'>): Promise<FocusScore | null> => {
    if (!session?.user?.id) return null;

    try {
      const newScore = {
        ...score,
        user_id: session.user.id,
      };

      const { data } = await supabaseRestCall(
        '/rest/v1/focus_scores8',
        {
          method: 'POST',
          body: JSON.stringify(newScore),
        },
        session
      );

      return data?.[0] || null;
    } catch (error) {
      console.error('Error creating focus score:', error);
      return null;
    }
  },
};

// Create a single export object to consolidate all API functions
export const apiClient = {
  auth: authApi,
  focusSession: focusSessionApi,
  energy: energyApi,
  task: taskApi,
  distraction: distractionApi,
  adhd: adhdApi,
  antiDistraction: antiDistractionApi,
  settings: settingsApi,
  focusTechniques: focusTechniquesApi,
  focusScore: focusScoreApi,
};

export default apiClient; 