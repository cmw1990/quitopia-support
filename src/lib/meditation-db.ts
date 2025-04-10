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

// Record meditation session
export async function recordMeditationSession(user: User | null, data: {
  duration: number;
  type: string;
  guided: boolean;
  focus_rating: number;
  mood_before: number;
  mood_after: number;
  notes?: string;
}, session?: { access_token: string } | null) {
  const userId = getUserId(user);
  try {
    await supabaseRestCall('/rest/v1/meditation_sessions8', {
      method: 'POST',
      body: JSON.stringify({
        user_id: userId,
        ...data,
        timestamp: new Date().toISOString()
      })
    }, session);
  } catch (error) {
    console.error('Error recording meditation session:', error);
    throw error;
  }
}

// Set meditation goals
export async function setMeditationGoals(user: User | null, data: {
  daily_duration: number;
  session_frequency: number;
  focus_target: number;
  preferred_time: string;
}, session?: { access_token: string } | null) {
  const userId = getUserId(user);
  try {
    await supabaseRestCall('/rest/v1/meditation_goals8', {
      method: 'POST',
      body: JSON.stringify({
        user_id: userId,
        ...data,
        created_at: new Date().toISOString()
      })
    }, session);
  } catch (error) {
    console.error('Error setting meditation goals:', error);
    throw error;
  }
}

// Get meditation history
export async function getMeditationHistory(user: User | null, startDate?: string, endDate?: string, session?: { access_token: string } | null) {
  const userId = getUserId(user);
  try {
    let url = `/rest/v1/meditation_sessions8?user_id=eq.${userId}&order=timestamp.desc`;
    if (startDate) url += `&timestamp=gte.${startDate}`;
    if (endDate) url += `&timestamp=lte.${endDate}`;
    
    return await supabaseRestCall(url, {}, session);
  } catch (error) {
    console.error('Error getting meditation history:', error);
    throw error;
  }
}

// Get meditation goals
export async function getMeditationGoals(user: User | null, session?: { access_token: string } | null) {
  const userId = getUserId(user);
  try {
    return await supabaseRestCall(
      `/rest/v1/meditation_goals8?user_id=eq.${userId}&order=created_at.desc&limit=1`,
      {},
      session
    );
  } catch (error) {
    console.error('Error getting meditation goals:', error);
    throw error;
  }
}

// Get meditation analytics
export async function getMeditationAnalytics(user: User | null, timeframe: string, session?: { access_token: string } | null) {
  const userId = getUserId(user);
  try {
    return await supabaseRestCall('/rest/v1/rpc/get_meditation_analytics', {
      method: 'POST',
      body: JSON.stringify({
        p_user_id: userId,
        p_timeframe: timeframe
      })
    }, session);
  } catch (error) {
    console.error('Error getting meditation analytics:', error);
    throw error;
  }
}

// Update meditation goals
export async function updateMeditationGoals(user: User | null, goalId: string, updates: {
  daily_duration?: number;
  session_frequency?: number;
  focus_target?: number;
  preferred_time?: string;
}, session?: { access_token: string } | null) {
  const userId = getUserId(user);
  try {
    await supabaseRestCall(`/rest/v1/meditation_goals8?id=eq.${goalId}&user_id=eq.${userId}`, {
      method: 'PATCH',
      body: JSON.stringify({
        ...updates,
        updated_at: new Date().toISOString()
      })
    }, session);
  } catch (error) {
    console.error('Error updating meditation goals:', error);
    throw error;
  }
}

// Delete meditation goals
export async function deleteMeditationGoals(user: User | null, goalId: string, session?: { access_token: string } | null) {
  const userId = getUserId(user);
  try {
    await supabaseRestCall(`/rest/v1/meditation_goals8?id=eq.${goalId}&user_id=eq.${userId}`, {
      method: 'DELETE'
    }, session);
  } catch (error) {
    console.error('Error deleting meditation goals:', error);
    throw error;
  }
}

// Record mindfulness notes
export async function recordMindfulnessNotes(user: User | null, data: {
  content: string;
  mood: number;
  stress_level: number;
  tags?: string[];
}, session?: { access_token: string } | null) {
  const userId = getUserId(user);
  try {
    await supabaseRestCall('/rest/v1/mindfulness_notes8', {
      method: 'POST',
      body: JSON.stringify({
        user_id: userId,
        ...data,
        timestamp: new Date().toISOString()
      })
    }, session);
  } catch (error) {
    console.error('Error recording mindfulness notes:', error);
    throw error;
  }
}

// Get mindfulness notes
export async function getMindfulnessNotes(user: User | null, startDate?: string, endDate?: string, session?: { access_token: string } | null) {
  const userId = getUserId(user);
  try {
    let url = `/rest/v1/mindfulness_notes8?user_id=eq.${userId}&order=timestamp.desc`;
    if (startDate) url += `&timestamp=gte.${startDate}`;
    if (endDate) url += `&timestamp=lte.${endDate}`;
    
    return await supabaseRestCall(url, {}, session);
  } catch (error) {
    console.error('Error getting mindfulness notes:', error);
    throw error;
  }
} 