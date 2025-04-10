import { SUPABASE_URL, SUPABASE_KEY } from '@/integrations/supabase/db-client';
import type { User } from '@supabase/supabase-js';

// Helper to get user ID from response
const getUserId = (user: User | null): string => {
  if (!user) throw new Error('User not authenticated');
  return user.id;
};

// Helper for making Supabase REST API calls
const supabaseRestCall = async (endpoint: string, options: RequestInit = {}, session?: { access_token: string } | null) => {
  const response = await fetch(`${SUPABASE_URL}${endpoint}`, {
    ...options,
    headers: {
      'Content-Type': 'application/json',
      'apikey': SUPABASE_KEY,
      'Authorization': `Bearer ${session?.access_token || SUPABASE_KEY}`,
      ...options.headers
    }
  });

  if (!response.ok) {
    const error = await response.json();
    throw new Error(error.message || response.statusText);
  }

  return await response.json();
};

// Mood tracking
export async function recordMood(user: User | null, data: {
  mood_level: number;
  energy_level: number;
  activities?: string[];
  triggers?: string[];
  notes?: string;
}, session?: { access_token: string } | null) {
  const userId = getUserId(user);
  try {
    await supabaseRestCall('/rest/v1/mood_tracking8', {
      method: 'POST',
      body: JSON.stringify({
        user_id: userId,
        ...data,
        timestamp: new Date().toISOString()
      })
    }, session);
  } catch (error) {
    console.error('Error recording mood:', error);
    throw error;
  }
}

// Anxiety tracking
export async function recordAnxiety(user: User | null, data: {
  anxiety_level: number;
  physical_symptoms?: string[];
  triggers?: string[];
  coping_strategies?: string[];
  effectiveness_score?: number;
  notes?: string;
}, session?: { access_token: string } | null) {
  const userId = getUserId(user);
  try {
    await supabaseRestCall('/rest/v1/anxiety_tracking8', {
      method: 'POST',
      body: JSON.stringify({
        user_id: userId,
        ...data,
        timestamp: new Date().toISOString()
      })
    }, session);
  } catch (error) {
    console.error('Error recording anxiety:', error);
    throw error;
  }
}

// Mindfulness sessions
export async function recordMindfulnessSession(user: User | null, data: {
  session_type: 'meditation' | 'breathing' | 'body_scan' | 'visualization' | 'grounding';
  duration_minutes: number;
  focus_quality?: number;
  calm_level_before?: number;
  calm_level_after?: number;
  notes?: string;
}, session?: { access_token: string } | null) {
  const userId = getUserId(user);
  try {
    await supabaseRestCall('/rest/v1/mindfulness_sessions8', {
      method: 'POST',
      body: JSON.stringify({
        user_id: userId,
        ...data,
        timestamp: new Date().toISOString()
      })
    }, session);
  } catch (error) {
    console.error('Error recording mindfulness session:', error);
    throw error;
  }
}

// Therapy goals
export async function recordTherapyGoal(user: User | null, data: {
  goal_type: 'mood' | 'anxiety' | 'depression' | 'ocd' | 'mindfulness' | 'general';
  title: string;
  description?: string;
  target_date?: string;
  progress?: number;
  status?: 'not_started' | 'in_progress' | 'completed' | 'on_hold';
  notes?: string;
}, session?: { access_token: string } | null) {
  const userId = getUserId(user);
  try {
    await supabaseRestCall('/rest/v1/therapy_goals8', {
      method: 'POST',
      body: JSON.stringify({
        user_id: userId,
        ...data,
        status: data.status || 'not_started',
        progress: data.progress || 0
      })
    }, session);
  } catch (error) {
    console.error('Error recording therapy goal:', error);
    throw error;
  }
}

// Get mood history
export async function getMoodHistory(user: User | null, startDate?: string, endDate?: string, session?: { access_token: string } | null) {
  const userId = getUserId(user);
  try {
    let url = `/rest/v1/mood_tracking8?user_id=eq.${userId}&order=timestamp.desc`;
    if (startDate) url += `&timestamp=gte.${startDate}`;
    if (endDate) url += `&timestamp=lte.${endDate}`;
    
    return await supabaseRestCall(url, {}, session);
  } catch (error) {
    console.error('Error getting mood history:', error);
    throw error;
  }
}

// Get anxiety history
export async function getAnxietyHistory(user: User | null, startDate?: string, endDate?: string, session?: { access_token: string } | null) {
  const userId = getUserId(user);
  try {
    let url = `/rest/v1/anxiety_tracking8?user_id=eq.${userId}&order=timestamp.desc`;
    if (startDate) url += `&timestamp=gte.${startDate}`;
    if (endDate) url += `&timestamp=lte.${endDate}`;
    
    return await supabaseRestCall(url, {}, session);
  } catch (error) {
    console.error('Error getting anxiety history:', error);
    throw error;
  }
}

// Get mindfulness history
export async function getMindfulnessHistory(user: User | null, startDate?: string, endDate?: string, session?: { access_token: string } | null) {
  const userId = getUserId(user);
  try {
    let url = `/rest/v1/mindfulness_sessions8?user_id=eq.${userId}&order=timestamp.desc`;
    if (startDate) url += `&timestamp=gte.${startDate}`;
    if (endDate) url += `&timestamp=lte.${endDate}`;
    
    return await supabaseRestCall(url, {}, session);
  } catch (error) {
    console.error('Error getting mindfulness history:', error);
    throw error;
  }
}

// Get therapy goals
export async function getTherapyGoals(user: User | null, status?: string, session?: { access_token: string } | null) {
  const userId = getUserId(user);
  try {
    let url = `/rest/v1/therapy_goals8?user_id=eq.${userId}&order=created_at.desc`;
    if (status) url += `&status=eq.${status}`;
    
    return await supabaseRestCall(url, {}, session);
  } catch (error) {
    console.error('Error getting therapy goals:', error);
    throw error;
  }
}

// Update therapy goal
export async function updateTherapyGoal(user: User | null, goalId: string, updates: {
  title?: string;
  description?: string;
  target_date?: string;
  progress?: number;
  status?: 'not_started' | 'in_progress' | 'completed' | 'on_hold';
  notes?: string;
}, session?: { access_token: string } | null) {
  const userId = getUserId(user);
  try {
    await supabaseRestCall(`/rest/v1/therapy_goals8?id=eq.${goalId}&user_id=eq.${userId}`, {
      method: 'PATCH',
      body: JSON.stringify({
        ...updates,
        updated_at: new Date().toISOString()
      })
    }, session);
  } catch (error) {
    console.error('Error updating therapy goal:', error);
    throw error;
  }
}

// Delete therapy goal
export async function deleteTherapyGoal(user: User | null, goalId: string, session?: { access_token: string } | null) {
  const userId = getUserId(user);
  try {
    await supabaseRestCall(`/rest/v1/therapy_goals8?id=eq.${goalId}&user_id=eq.${userId}`, {
      method: 'DELETE'
    }, session);
  } catch (error) {
    console.error('Error deleting therapy goal:', error);
    throw error;
  }
}

// Get mental health analytics
export async function getMentalHealthAnalytics(user: User | null, timeframe: string, session?: { access_token: string } | null) {
  const userId = getUserId(user);
  try {
    return await supabaseRestCall('/rest/v1/rpc/get_mental_health_analytics', {
      method: 'POST',
      body: JSON.stringify({
        p_user_id: userId,
        p_timeframe: timeframe
      })
    }, session);
  } catch (error) {
    console.error('Error getting mental health analytics:', error);
    throw error;
  }
}

// Export interfaces for use in other files
export interface MoodLog {
  id: string;
  user_id: string;
  mood_level: number;
  energy_level: number;
  activities?: string[];
  triggers?: string[];
  notes?: string;
  created_at: string;
  updated_at: string;
}

export interface AnxietyLog {
  id: string;
  user_id: string;
  anxiety_level: number;
  physical_symptoms?: string[];
  triggers?: string[];
  coping_strategies?: string[];
  effectiveness_score?: number;
  notes?: string;
  created_at: string;
  updated_at: string;
}

export interface DepressionLog {
  id: string;
  user_id: string;
  depression_level: number;
  symptoms?: string[];
  triggers?: string[];
  coping_strategies?: string[];
  effectiveness_score?: number;
  notes?: string;
  created_at: string;
  updated_at: string;
}

export interface MentalHealthSummary {
  average_mood: number;
  average_anxiety: number;
  average_depression: number;
  mindfulness_sessions: number;
  total_mindfulness_minutes: number;
  mood_trend: Array<{ date: string; value: number }>;
  anxiety_trend: Array<{ date: string; value: number }>;
  depression_trend: Array<{ date: string; value: number }>;
}

// Create a mentalHealthDb object that wraps all the exported functions
export const mentalHealthDb = {
  // Create a new mood log
  createMoodLog: async (data: Omit<MoodLog, 'id' | 'user_id' | 'created_at' | 'updated_at'>) => {
    const response = await supabaseRestCall('/rest/v1/mood_logs', {
      method: 'POST',
      body: JSON.stringify(data)
    });
    return { data: response, error: null };
  },

  // Create a new anxiety log
  createAnxietyLog: async (data: Omit<AnxietyLog, 'id' | 'user_id' | 'created_at' | 'updated_at'>) => {
    const response = await supabaseRestCall('/rest/v1/anxiety_logs', {
      method: 'POST',
      body: JSON.stringify(data)
    });
    return { data: response, error: null };
  },

  // Create a new depression log
  createDepressionLog: async (data: Omit<DepressionLog, 'id' | 'user_id' | 'created_at' | 'updated_at'>) => {
    const response = await supabaseRestCall('/rest/v1/depression_logs', {
      method: 'POST',
      body: JSON.stringify(data)
    });
    return { data: response, error: null };
  },

  // Get mental health logs
  getMentalHealthLogs: async (type: 'anxiety' | 'mood' | 'depression', startDate?: Date, endDate?: Date) => {
    const endpoint = `/rest/v1/${type}_logs`;
    const params = new URLSearchParams();
    
    if (startDate) params.append('created_at.gte', startDate.toISOString());
    if (endDate) params.append('created_at.lte', endDate.toISOString());
    
    const url = `${endpoint}?${params.toString()}`;
    const response = await supabaseRestCall(url);
    return { data: response, error: null };
  },

  // Get mental health summary
  getMentalHealthSummary: async (startDate: Date, endDate: Date) => {
    const response = await supabaseRestCall('/rpc/get_mental_health_summary', {
      method: 'POST',
      body: JSON.stringify({
        start_date: startDate.toISOString(),
        end_date: endDate.toISOString()
      })
    });
    return { data: response, error: null };
  },

  // Wrapping all existing exported functions
  recordMood,
  recordAnxiety,
  recordMindfulnessSession,
  recordTherapyGoal,
  getMoodHistory,
  getAnxietyHistory,
  getMindfulnessHistory,
  getTherapyGoals,
  updateTherapyGoal,
  deleteTherapyGoal,
  getMentalHealthAnalytics
};
