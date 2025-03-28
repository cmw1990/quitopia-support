import { Session } from '@supabase/supabase-js';
import { supabaseRestCall } from "./apiCompatibility";
import { format, subDays, subWeeks, subMonths, startOfDay, endOfDay } from 'date-fns';
import useOfflineStorage from '../hooks/useOfflineStatus';

export interface ToolViewEvent {
  id?: string;
  user_id: string;
  tool_name: string;
  view_date: string;
  session_duration?: number;
  completion_status?: 'started' | 'completed' | 'abandoned';
  feedback_rating?: number;
  created_at?: string;
  updated_at?: string;
}

export interface CravingData {
  id: string;
  user_id: string;
  intensity: number;
  trigger?: string;
  location?: string;
  time_of_day?: string;
  coping_strategy?: string;
  success: boolean;
  timestamp: string;
  created_at: string;
}

export interface ConsumptionLog {
  id: string;
  user_id: string;
  product_id: string;
  product_name: string;
  product_type: string;
  quantity: number;
  nicotine_content: number;
  cost: number;
  timestamp: string;
  created_at: string;
}

export interface ProgressEntry {
  id: string;
  user_id: string;
  date: string;
  smoke_free: boolean;
  craving_intensity?: number;
  mood?: string;
  notes?: string;
  symptoms?: string[];
  money_saved?: number;
  created_at: string;
  updated_at?: string;
}

export interface MoodEntry {
  id: string;
  user_id: string;
  date: string;
  rating: number;
  notes?: string;
  created_at: string;
}

export interface AchievementEntry {
  id: string;
  title: string;
  description: string;
  category: string;
  progress: number;
  is_complete: boolean;
  unlocked_at?: string;
  points?: number;
}

/**
 * Track when a user views a tool
 */
export const trackToolView = async (
  userId: string,
  toolName: string,
  session: Session | null
): Promise<ToolViewEvent> => {
  try {
    const payload: Omit<ToolViewEvent, 'id' | 'created_at' | 'updated_at'> = {
      user_id: userId,
      tool_name: toolName,
      view_date: new Date().toISOString(),
    };

    const data = await supabaseRestCall(
      `/rest/v1/tool_view_events`,
      {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          'Prefer': 'return=representation'
        },
        body: JSON.stringify(payload)
      },
      session
    );

    return data[0];
  } catch (error) {
    console.error('Error tracking tool view:', error);
    throw error;
  }
};

/**
 * Update a tool view with completion status
 */
export const updateToolViewStatus = async (
  eventId: string,
  status: 'completed' | 'abandoned',
  sessionDuration: number,
  feedbackRating?: number,
  session?: Session | null
): Promise<ToolViewEvent> => {
  try {
    const payload = {
      completion_status: status,
      session_duration: sessionDuration,
      ...(feedbackRating !== undefined && { feedback_rating: feedbackRating }),
      updated_at: new Date().toISOString()
    };

    const data = await supabaseRestCall(
      `/rest/v1/tool_view_events`,
      {
        method: 'PATCH',
        headers: {
          'Content-Type': 'application/json',
          'Prefer': 'return=representation'
        },
        body: JSON.stringify(payload)
      },
      session
    );

    return data[0];
  } catch (error) {
    console.error('Error updating tool view:', error);
    throw error;
  }
};

/**
 * Get craving data for analytics
 */
export const fetchCravingData = async (
  userId: string,
  dateRange: '7days' | '30days' | '90days' | 'all',
  session: Session | null
): Promise<CravingData[]> => {
  try {
    // Get start date based on selected range
    let startDate = new Date();
    switch (dateRange) {
      case '7days':
        startDate = subDays(startDate, 7);
        break;
      case '30days':
        startDate = subDays(startDate, 30);
        break;
      case '90days':
        startDate = subDays(startDate, 90);
        break;
      case 'all':
        startDate = new Date(0); // Beginning of time
        break;
    }
    
    // Format dates for API
    const startDateStr = format(startOfDay(startDate), "yyyy-MM-dd'T'HH:mm:ss");
    const endDateStr = format(endOfDay(new Date()), "yyyy-MM-dd'T'HH:mm:ss");

    const data = await supabaseRestCall<CravingData[]>(
      `/rest/v1/craving_logs?user_id=eq.${userId}&timestamp=gte.${startDateStr}&timestamp=lte.${endDateStr}&order=timestamp.desc`,
      {
        headers: {
          'Content-Type': 'application/json',
          'Prefer': 'return=representation'
        }
      },
      session
    );

    return data || [];
  } catch (error) {
    console.error('Error fetching craving data:', error);
    return [];
  }
};

/**
 * Get consumption log data for analytics
 */
export const fetchConsumptionData = async (
  userId: string,
  dateRange: '7days' | '30days' | '90days' | 'all',
  session: Session | null
): Promise<ConsumptionLog[]> => {
  try {
    // Get start date based on selected range
    let startDate = new Date();
    switch (dateRange) {
      case '7days':
        startDate = subDays(startDate, 7);
        break;
      case '30days':
        startDate = subDays(startDate, 30);
        break;
      case '90days':
        startDate = subDays(startDate, 90);
        break;
      case 'all':
        startDate = new Date(0); // Beginning of time
        break;
    }
    
    // Format dates for API
    const startDateStr = format(startOfDay(startDate), "yyyy-MM-dd'T'HH:mm:ss");
    const endDateStr = format(endOfDay(new Date()), "yyyy-MM-dd'T'HH:mm:ss");

    const data = await supabaseRestCall<ConsumptionLog[]>(
      `/rest/v1/consumption_logs?user_id=eq.${userId}&timestamp=gte.${startDateStr}&timestamp=lte.${endDateStr}&order=timestamp.desc`,
      {
        headers: {
          'Content-Type': 'application/json',
          'Prefer': 'return=representation'
        }
      },
      session
    );

    return data || [];
  } catch (error) {
    console.error('Error fetching consumption data:', error);
    return [];
  }
};

/**
 * Get progress data for analytics
 */
export const fetchProgressData = async (
  userId: string,
  dateRange: '7days' | '30days' | '90days' | 'all',
  session: Session | null
): Promise<ProgressEntry[]> => {
  try {
    // Get start date based on selected range
    let startDate = new Date();
    switch (dateRange) {
      case '7days':
        startDate = subDays(startDate, 7);
        break;
      case '30days':
        startDate = subDays(startDate, 30);
        break;
      case '90days':
        startDate = subDays(startDate, 90);
        break;
      case 'all':
        startDate = new Date(0); // Beginning of time
        break;
    }
    
    // Format dates for API
    const startDateStr = format(startOfDay(startDate), "yyyy-MM-dd");
    const endDateStr = format(endOfDay(new Date()), "yyyy-MM-dd");

    const data = await supabaseRestCall<ProgressEntry[]>(
      `/rest/v1/progress_entries?user_id=eq.${userId}&date=gte.${startDateStr}&date=lte.${endDateStr}&order=date.desc`,
      {
        headers: {
          'Content-Type': 'application/json',
          'Prefer': 'return=representation'
        }
      },
      session
    );

    return data || [];
  } catch (error) {
    console.error('Error fetching progress data:', error);
    return [];
  }
};

/**
 * Get mood data for analytics
 */
export const fetchMoodData = async (
  userId: string,
  dateRange: '7days' | '30days' | '90days' | 'all',
  session: Session | null
): Promise<MoodEntry[]> => {
  try {
    // Get start date based on selected range
    let startDate = new Date();
    switch (dateRange) {
      case '7days':
        startDate = subDays(startDate, 7);
        break;
      case '30days':
        startDate = subDays(startDate, 30);
        break;
      case '90days':
        startDate = subDays(startDate, 90);
        break;
      case 'all':
        startDate = new Date(0); // Beginning of time
        break;
    }
    
    // Format dates for API
    const startDateStr = format(startOfDay(startDate), "yyyy-MM-dd");
    const endDateStr = format(endOfDay(new Date()), "yyyy-MM-dd");

    const data = await supabaseRestCall<MoodEntry[]>(
      `/rest/v1/mood_entries?user_id=eq.${userId}&date=gte.${startDateStr}&date=lte.${endDateStr}&order=date.desc`,
      {
        headers: {
          'Content-Type': 'application/json',
          'Prefer': 'return=representation'
        }
      },
      session
    );

    return data || [];
  } catch (error) {
    console.error('Error fetching mood data:', error);
    return [];
  }
};

export const fetchAchievementsData = async (
  userId: string,
  dateRange: string = 'all',
  session: Session | null
): Promise<AchievementEntry[]> => {
  try {
    const offlineStorage = useOfflineStorage();
    const isOnline = navigator.onLine;
    
    if (!isOnline) {
      // Try to get data from offline storage
      const cachedData = await offlineStorage.getItem(`achievements_data_${userId}`);
      if (cachedData) {
        return JSON.parse(cachedData) as unknown as AchievementEntry[];
      }
      return [];
    }
    
    let dateFilter = '';
    if (dateRange !== 'all') {
      const days = parseInt(dateRange);
      dateFilter = `&unlocked_after=${new Date(Date.now() - days * 24 * 60 * 60 * 1000).toISOString()}`;
    }
    
    const endpoint = `/achievements?user_id=${userId}${dateFilter}`;
    const data = await supabaseRestCall(endpoint, 'GET', null, session);
    
    // Save to offline storage for later use
    await offlineStorage.setItem(`achievements_data_${userId}`, JSON.stringify(data));
    
    return data as unknown as AchievementEntry[];
  } catch (error) {
    console.error('Error fetching achievements data:', error);
    
    // Try to get data from offline storage
    const offlineStorage = useOfflineStorage();
    const cachedData = await offlineStorage.getItem(`achievements_data_${userId}`);
    if (cachedData) {
      return JSON.parse(cachedData) as unknown as AchievementEntry[];
    }
    
    throw error;
  }
}; 