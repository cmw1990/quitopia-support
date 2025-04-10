import { supabaseGet, supabasePost, supabasePatch, supabaseDelete } from './supabaseApiService'; // Import the centralized service
import type { User } from '@supabase/supabase-js';

// Helper to get user ID from response
const getUserId = (user: User | null): string => {
  if (!user?.id) throw new Error('User not authenticated or user ID missing');
  return user.id;
};

// Define interfaces for expected data structures (align with DB schema)
interface EnergyLogPayload {
  user_id: string;
  energy_level: number;
  activity: string; // Assuming 'activity' column exists
  notes?: string;
  focus_duration?: number; // Assuming column exists
  focus_quality?: number; // Assuming column exists
  timestamp?: string; // Handled by DB or set here
}

interface EnergyGoalPayload {
  user_id: string;
  target_level: number;
  daily_activities: string[];
  rest_periods: number;
  sleep_hours: number;
  created_at?: string; // Handled by DB
}

interface FocusSessionPayload {
  user_id: string;
  duration: number;
  task_type: string;
  productivity_rating: number;
  distractions: string[];
  notes?: string;
  timestamp?: string; // Handled by DB
}

// Table and RPC names (VERIFY THESE AGAINST YOUR ACTUAL SUPABASE SCHEMA)
const ENERGY_TRACKING_TABLE = 'energy_tracking'; // Removed '8' - VERIFY
const ENERGY_GOALS_TABLE = 'energy_goals'; // Removed '8' - VERIFY
const FOCUS_SESSIONS_TABLE = 'focus_sessions8'; // Updated to match schema
const ENERGY_ANALYTICS_RPC = 'get_energy_analytics'; // VERIFY

// Helper function to convert params object to query string
const buildQueryString = (params: Record<string, string>): string => {
  return new URLSearchParams(params).toString();
};

// Record energy level
export async function recordEnergyLevel(user: User | null, data: Omit<EnergyLogPayload, 'user_id' | 'timestamp'>) {
  const userId = getUserId(user);
  try {
    // Construct payload, ensuring property names match DB columns AND the input 'data' type
    const payload: EnergyLogPayload = {
      user_id: userId,
      energy_level: data.energy_level, // Corrected: Use energy_level from data type
      activity: data.activity,
      notes: data.notes,
      focus_duration: data.focus_duration, // Corrected: Use focus_duration from data type
      focus_quality: data.focus_quality,   // Corrected: Use focus_quality from data type
      timestamp: new Date().toISOString() // Set timestamp client-side for consistency
    };
    // Pass table name and payload
    await supabasePost(ENERGY_TRACKING_TABLE, payload);
  } catch (error) {
    console.error('Error recording energy level:', error);
    throw error;
  }
}

// Set energy goals
export async function setEnergyGoals(user: User | null, data: Omit<EnergyGoalPayload, 'user_id' | 'created_at'>) {
  const userId = getUserId(user);
  try {
    const payload: EnergyGoalPayload = {
      user_id: userId,
      ...data,
      created_at: new Date().toISOString()
    };
    await supabasePost(ENERGY_GOALS_TABLE, payload);
  } catch (error) {
    console.error('Error setting energy goals:', error);
    throw error;
  }
}

// Get energy history
export async function getEnergyHistory(user: User | null, startDate?: string, endDate?: string) {
  const userId = getUserId(user);
  try {
    const params: Record<string, string> = {
      user_id: `eq.${userId}`,
      order: 'timestamp.desc'
    };
    if (startDate) params['timestamp'] = `gte.${startDate}`;
    if (endDate) params['timestamp'] = params['timestamp'] ? `${params['timestamp']},lte.${endDate}` : `lte.${endDate}`; // Combine date filters
    
    const queryString = buildQueryString(params);
    // Pass table name and query string as 2nd arg
    return await supabaseGet(ENERGY_TRACKING_TABLE, queryString);
  } catch (error) {
    console.error('Error getting energy history:', error);
    throw error;
  }
}

// Get energy goals
export async function getEnergyGoals(user: User | null) {
  const userId = getUserId(user);
  try {
    const params = {
      user_id: `eq.${userId}`,
      order: 'created_at.desc',
      limit: '1'
    };
    const queryString = buildQueryString(params);
    // Pass table name and query string as 2nd arg
    return await supabaseGet(ENERGY_GOALS_TABLE, queryString);
  } catch (error) {
    console.error('Error getting energy goals:', error);
    throw error;
  }
}

// Get energy analytics
export async function getEnergyAnalytics(user: User | null, timeframe: string) {
  const userId = getUserId(user);
  try {
    // For RPC, the first argument is the function name, second is params
    // REMOVED the third argument { rpc: true }
    return await supabasePost(ENERGY_ANALYTICS_RPC, {
      p_user_id: userId,
      p_timeframe: timeframe
    }); // Corrected: Removed third argument
  } catch (error) {
    console.error('Error getting energy analytics:', error);
    throw error;
  }
}

// Update energy goals
export async function updateEnergyGoals(user: User | null, goalId: string, updates: Partial<Omit<EnergyGoalPayload, 'user_id' | 'created_at'> & { updated_at?: string }>) {
  const userId = getUserId(user);
  try {
    const payload = {
      ...updates,
      updated_at: new Date().toISOString()
    };
    const params = {
      id: `eq.${goalId}`,
      user_id: `eq.${userId}`
    };
    const queryString = buildQueryString(params);
    // Pass table name, payload, and query string as 3rd arg
    // Note: Prefer header is optional 4th arg, defaults to 'minimal'
    await supabasePatch(ENERGY_GOALS_TABLE, payload, queryString);
  } catch (error) {
    console.error('Error updating energy goals:', error);
    throw error;
  }
}

// Delete energy goals
export async function deleteEnergyGoals(user: User | null, goalId: string) {
  const userId = getUserId(user);
  try {
    const params = {
      id: `eq.${goalId}`,
      user_id: `eq.${userId}`
    };
    const queryString = buildQueryString(params);
    // Pass table name and query string as 2nd arg
    await supabaseDelete(ENERGY_GOALS_TABLE, queryString);
  } catch (error) {
    console.error('Error deleting energy goals:', error);
    throw error;
  }
}

// Record focus session
export async function recordFocusSession(user: User | null, data: Omit<FocusSessionPayload, 'user_id' | 'timestamp'>) {
  const userId = getUserId(user);
  try {
    const payload: FocusSessionPayload = {
      user_id: userId,
      ...data,
      timestamp: new Date().toISOString()
    };
    await supabasePost(FOCUS_SESSIONS_TABLE, payload);
  } catch (error) {
    console.error('Error recording focus session:', error);
    throw error;
  }
}

// Get focus history
export async function getFocusHistory(user: User | null, startDate?: string, endDate?: string) {
  const userId = getUserId(user);
  try {
    const params: Record<string, string> = {
      user_id: `eq.${userId}`,
      order: 'timestamp.desc'
    };
    if (startDate) params['timestamp'] = `gte.${startDate}`;
    if (endDate) params['timestamp'] = params['timestamp'] ? `${params['timestamp']},lte.${endDate}` : `lte.${endDate}`;

    const queryString = buildQueryString(params);
    // Pass table name and query string as 2nd arg
    return await supabaseGet(FOCUS_SESSIONS_TABLE, queryString);
  } catch (error) {
    console.error('Error getting focus history:', error);
    throw error;
  }
} 