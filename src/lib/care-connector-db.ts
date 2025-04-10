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

// Record care connection
export async function recordCareConnection(user: User | null, data: {
  provider_type: string;
  provider_name: string;
  connection_type: string;
  connection_date: string;
  notes?: string;
}, session?: { access_token: string } | null) {
  const userId = getUserId(user);
  try {
    await supabaseRestCall('/rest/v1/care_connections8', {
      method: 'POST',
      body: JSON.stringify({
        user_id: userId,
        ...data,
        timestamp: new Date().toISOString()
      })
    }, session);
  } catch (error) {
    console.error('Error recording care connection:', error);
    throw error;
  }
}

// Set care goals
export async function setCareGoals(user: User | null, data: {
  connection_frequency: number;
  provider_types: string[];
  support_needs: string[];
  preferred_times: string[];
}, session?: { access_token: string } | null) {
  const userId = getUserId(user);
  try {
    await supabaseRestCall('/rest/v1/care_goals8', {
      method: 'POST',
      body: JSON.stringify({
        user_id: userId,
        ...data,
        created_at: new Date().toISOString()
      })
    }, session);
  } catch (error) {
    console.error('Error setting care goals:', error);
    throw error;
  }
}

// Get care connection history
export async function getCareConnectionHistory(user: User | null, startDate?: string, endDate?: string, session?: { access_token: string } | null) {
  const userId = getUserId(user);
  try {
    let url = `/rest/v1/care_connections8?user_id=eq.${userId}&order=timestamp.desc`;
    if (startDate) url += `&timestamp=gte.${startDate}`;
    if (endDate) url += `&timestamp=lte.${endDate}`;
    
    return await supabaseRestCall(url, {}, session);
  } catch (error) {
    console.error('Error getting care connection history:', error);
    throw error;
  }
}

// Get care goals
export async function getCareGoals(user: User | null, session?: { access_token: string } | null) {
  const userId = getUserId(user);
  try {
    return await supabaseRestCall(
      `/rest/v1/care_goals8?user_id=eq.${userId}&order=created_at.desc&limit=1`,
      {},
      session
    );
  } catch (error) {
    console.error('Error getting care goals:', error);
    throw error;
  }
}

// Get care analytics
export async function getCareAnalytics(user: User | null, timeframe: string, session?: { access_token: string } | null) {
  const userId = getUserId(user);
  try {
    return await supabaseRestCall('/rest/v1/rpc/get_care_analytics', {
      method: 'POST',
      body: JSON.stringify({
        p_user_id: userId,
        p_timeframe: timeframe
      })
    }, session);
  } catch (error) {
    console.error('Error getting care analytics:', error);
    throw error;
  }
}

// Update care goals
export async function updateCareGoals(user: User | null, goalId: string, updates: {
  connection_frequency?: number;
  provider_types?: string[];
  support_needs?: string[];
  preferred_times?: string[];
}, session?: { access_token: string } | null) {
  const userId = getUserId(user);
  try {
    await supabaseRestCall(`/rest/v1/care_goals8?id=eq.${goalId}&user_id=eq.${userId}`, {
      method: 'PATCH',
      body: JSON.stringify({
        ...updates,
        updated_at: new Date().toISOString()
      })
    }, session);
  } catch (error) {
    console.error('Error updating care goals:', error);
    throw error;
  }
}

// Delete care goals
export async function deleteCareGoals(user: User | null, goalId: string, session?: { access_token: string } | null) {
  const userId = getUserId(user);
  try {
    await supabaseRestCall(`/rest/v1/care_goals8?id=eq.${goalId}&user_id=eq.${userId}`, {
      method: 'DELETE'
    }, session);
  } catch (error) {
    console.error('Error deleting care goals:', error);
    throw error;
  }
}

// Record care provider
export async function recordCareProvider(user: User | null, data: {
  name: string;
  type: string;
  contact_info: {
    phone?: string;
    email?: string;
    address?: string;
  };
  specialties?: string[];
  notes?: string;
}, session?: { access_token: string } | null) {
  const userId = getUserId(user);
  try {
    await supabaseRestCall('/rest/v1/care_providers8', {
      method: 'POST',
      body: JSON.stringify({
        user_id: userId,
        ...data,
        created_at: new Date().toISOString()
      })
    }, session);
  } catch (error) {
    console.error('Error recording care provider:', error);
    throw error;
  }
}

// Get care providers
export async function getCareProviders(user: User | null, session?: { access_token: string } | null) {
  const userId = getUserId(user);
  try {
    return await supabaseRestCall(
      `/rest/v1/care_providers8?user_id=eq.${userId}&order=created_at.desc`,
      {},
      session
    );
  } catch (error) {
    console.error('Error getting care providers:', error);
    throw error;
  }
} 