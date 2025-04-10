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

// Record audio session
export async function recordAudioSession(user: User | null, data: {
  duration: number;
  audio_type: string;
  volume_level: number;
  effectiveness_rating: number;
  notes?: string;
}, session?: { access_token: string } | null) {
  const userId = getUserId(user);
  try {
    await supabaseRestCall('/rest/v1/audio_sessions8', {
      method: 'POST',
      body: JSON.stringify({
        user_id: userId,
        ...data,
        timestamp: new Date().toISOString()
      })
    }, session);
  } catch (error) {
    console.error('Error recording audio session:', error);
    throw error;
  }
}

// Set audio preferences
export async function setAudioPreferences(user: User | null, data: {
  preferred_types: string[];
  volume_settings: {
    type: string;
    level: number;
  }[];
  schedule: {
    start_time: string;
    end_time: string;
    days: string[];
  }[];
}, session?: { access_token: string } | null) {
  const userId = getUserId(user);
  try {
    await supabaseRestCall('/rest/v1/audio_preferences8', {
      method: 'POST',
      body: JSON.stringify({
        user_id: userId,
        ...data,
        created_at: new Date().toISOString()
      })
    }, session);
  } catch (error) {
    console.error('Error setting audio preferences:', error);
    throw error;
  }
}

// Get audio history
export async function getAudioHistory(user: User | null, startDate?: string, endDate?: string, session?: { access_token: string } | null) {
  const userId = getUserId(user);
  try {
    let url = `/rest/v1/audio_sessions8?user_id=eq.${userId}&order=timestamp.desc`;
    if (startDate) url += `&timestamp=gte.${startDate}`;
    if (endDate) url += `&timestamp=lte.${endDate}`;
    
    return await supabaseRestCall(url, {}, session);
  } catch (error) {
    console.error('Error getting audio history:', error);
    throw error;
  }
}

// Get audio preferences
export async function getAudioPreferences(user: User | null, session?: { access_token: string } | null) {
  const userId = getUserId(user);
  try {
    return await supabaseRestCall(
      `/rest/v1/audio_preferences8?user_id=eq.${userId}&order=created_at.desc&limit=1`,
      {},
      session
    );
  } catch (error) {
    console.error('Error getting audio preferences:', error);
    throw error;
  }
}

// Get audio analytics
export async function getAudioAnalytics(user: User | null, timeframe: string, session?: { access_token: string } | null) {
  const userId = getUserId(user);
  try {
    return await supabaseRestCall('/rest/v1/rpc/get_audio_analytics', {
      method: 'POST',
      body: JSON.stringify({
        p_user_id: userId,
        p_timeframe: timeframe
      })
    }, session);
  } catch (error) {
    console.error('Error getting audio analytics:', error);
    throw error;
  }
}

// Update audio preferences
export async function updateAudioPreferences(user: User | null, prefId: string, updates: {
  preferred_types?: string[];
  volume_settings?: {
    type: string;
    level: number;
  }[];
  schedule?: {
    start_time: string;
    end_time: string;
    days: string[];
  }[];
}, session?: { access_token: string } | null) {
  const userId = getUserId(user);
  try {
    await supabaseRestCall(`/rest/v1/audio_preferences8?id=eq.${prefId}&user_id=eq.${userId}`, {
      method: 'PATCH',
      body: JSON.stringify({
        ...updates,
        updated_at: new Date().toISOString()
      })
    }, session);
  } catch (error) {
    console.error('Error updating audio preferences:', error);
    throw error;
  }
}

// Delete audio preferences
export async function deleteAudioPreferences(user: User | null, prefId: string, session?: { access_token: string } | null) {
  const userId = getUserId(user);
  try {
    await supabaseRestCall(`/rest/v1/audio_preferences8?id=eq.${prefId}&user_id=eq.${userId}`, {
      method: 'DELETE'
    }, session);
  } catch (error) {
    console.error('Error deleting audio preferences:', error);
    throw error;
  }
}

// Record audio file
export async function recordAudioFile(user: User | null, data: {
  name: string;
  type: string;
  duration: number;
  file_url: string;
  tags?: string[];
  notes?: string;
}, session?: { access_token: string } | null) {
  const userId = getUserId(user);
  try {
    await supabaseRestCall('/rest/v1/audio_files8', {
      method: 'POST',
      body: JSON.stringify({
        user_id: userId,
        ...data,
        created_at: new Date().toISOString()
      })
    }, session);
  } catch (error) {
    console.error('Error recording audio file:', error);
    throw error;
  }
}

// Get audio files
export async function getAudioFiles(user: User | null, session?: { access_token: string } | null) {
  const userId = getUserId(user);
  try {
    return await supabaseRestCall(
      `/rest/v1/audio_files8?user_id=eq.${userId}&order=created_at.desc`,
      {},
      session
    );
  } catch (error) {
    console.error('Error getting audio files:', error);
    throw error;
  }
} 