import { Session } from '@supabase/supabase-js';
import { supabaseRestCall } from './apiCompatibility';
import { format, subDays } from 'date-fns';

// Types
export interface HealthLog {
  id?: string;
  user_id: string;
  timestamp: string;
  energy_level?: number;
  mood_level?: number;
  focus_level?: number;
  sleep_hours?: number;
  craving_intensity?: number;
  time_of_day: 'morning' | 'afternoon' | 'evening' | 'night';
  notes?: string;
  created_at?: string;
}

export interface HealthStatsSummary {
  averageEnergy: number;
  averageMood: number;
  averageFocus: number;
  averageSleep: number;
  averageCraving: number;
  energyTrend: any[];
  moodTrend: any[];
  focusTrend: any[];
  sleepTrend: any[];
  cravingTrend: any[];
}

export interface NicotineLog {
  id?: string;
  user_id: string;
  timestamp: string;
  product_type: string;
  quantity: number;
  satisfaction_level?: number;
  situation?: string;
  created_at?: string;
}

// Get health logs for a user
export const getHealthLogs = async (
  userId: string,
  period: 'week' | 'month' | 'year' = 'week',
  session: Session
): Promise<HealthLog[]> => {
  const daysAgo = period === 'week' ? 7 : period === 'month' ? 30 : 365;
  const startDate = format(subDays(new Date(), daysAgo), 'yyyy-MM-dd');
  
  const endpoint = `/rest/v1/holistic_health_logs?user_id=eq.${userId}&timestamp=gte.${startDate}&order=timestamp.desc`;
  return await supabaseRestCall(endpoint, {}, session);
};

// Create a new health log
export const createHealthLog = async (
  data: HealthLog,
  session: Session
): Promise<HealthLog> => {
  const endpoint = `/rest/v1/holistic_health_logs`;
  return await supabaseRestCall(
    endpoint,
    {
      method: 'POST',
      body: JSON.stringify(data),
    },
    session
  );
};

// Update an existing health log
export const updateHealthLog = async (
  logId: string,
  data: Partial<HealthLog>,
  session: Session
): Promise<HealthLog> => {
  const endpoint = `/rest/v1/holistic_health_logs?id=eq.${logId}`;
  return await supabaseRestCall(
    endpoint,
    {
      method: 'PATCH',
      body: JSON.stringify(data),
    },
    session
  );
};

// Delete a health log
export const deleteHealthLog = async (
  logId: string,
  session: Session
): Promise<void> => {
  const endpoint = `/rest/v1/holistic_health_logs?id=eq.${logId}`;
  return await supabaseRestCall(
    endpoint,
    {
      method: 'DELETE',
    },
    session
  );
};

// Get nicotine consumption logs
export const getNicotineLogs = async (
  userId: string,
  period: 'week' | 'month' | 'year' = 'week',
  session: Session
): Promise<NicotineLog[]> => {
  const daysAgo = period === 'week' ? 7 : period === 'month' ? 30 : 365;
  const startDate = format(subDays(new Date(), daysAgo), 'yyyy-MM-dd');
  
  const endpoint = `/rest/v1/nicotine_consumption_logs?user_id=eq.${userId}&timestamp=gte.${startDate}&order=timestamp.desc`;
  return await supabaseRestCall(endpoint, {}, session);
};

// Create a new nicotine log
export const createNicotineLog = async (
  data: NicotineLog,
  session: Session
): Promise<NicotineLog> => {
  const endpoint = `/rest/v1/nicotine_consumption_logs`;
  return await supabaseRestCall(
    endpoint,
    {
      method: 'POST',
      body: JSON.stringify(data),
    },
    session
  );
};

// Update an existing nicotine log
export const updateNicotineLog = async (
  logId: string,
  data: Partial<NicotineLog>,
  session: Session
): Promise<NicotineLog> => {
  const endpoint = `/rest/v1/nicotine_consumption_logs?id=eq.${logId}`;
  return await supabaseRestCall(
    endpoint,
    {
      method: 'PATCH',
      body: JSON.stringify(data),
    },
    session
  );
};

// Delete a nicotine log
export const deleteNicotineLog = async (
  logId: string,
  session: Session
): Promise<void> => {
  const endpoint = `/rest/v1/nicotine_consumption_logs?id=eq.${logId}`;
  return await supabaseRestCall(
    endpoint,
    {
      method: 'DELETE',
    },
    session
  );
};

// Calculate health stats summary
export const getHealthStatsSummary = async (
  userId: string,
  period: 'week' | 'month' | 'year' = 'week',
  session: Session
): Promise<HealthStatsSummary> => {
  const logs = await getHealthLogs(userId, period, session);
  
  // Helper function to calculate average
  const getAverage = (field: keyof HealthLog): number => {
    const validLogs = logs.filter(log => log[field] !== undefined && log[field] !== null);
    if (validLogs.length === 0) return 0;
    
    const sum = validLogs.reduce((acc, log) => acc + (log[field] as number), 0);
    return Number((sum / validLogs.length).toFixed(1));
  };
  
  // Helper function to format trend data
  const formatTrend = (field: keyof HealthLog): any[] => {
    const dataByDay = new Map<string, number[]>();
    
    logs.forEach(log => {
      if (log[field] === undefined) return;
      
      const day = format(new Date(log.timestamp), 'MM/dd');
      if (!dataByDay.has(day)) {
        dataByDay.set(day, []);
      }
      dataByDay.get(day)?.push(log[field] as number);
    });
    
    return Array.from(dataByDay.entries())
      .map(([day, values]) => ({
        day,
        value: values.reduce((sum, val) => sum + val, 0) / values.length
      }))
      .sort((a, b) => a.day.localeCompare(b.day));
  };
  
  return {
    averageEnergy: getAverage('energy_level'),
    averageMood: getAverage('mood_level'),
    averageFocus: getAverage('focus_level'),
    averageSleep: getAverage('sleep_hours'),
    averageCraving: getAverage('craving_intensity'),
    energyTrend: formatTrend('energy_level'),
    moodTrend: formatTrend('mood_level'),
    focusTrend: formatTrend('focus_level'),
    sleepTrend: formatTrend('sleep_hours'),
    cravingTrend: formatTrend('craving_intensity')
  };
};

// Get correlation data between health metrics and nicotine consumption
export const getHealthNicotineCorrelation = async (
  userId: string,
  period: 'week' | 'month' | 'year' = 'week',
  session: Session
): Promise<any[]> => {
  const healthLogs = await getHealthLogs(userId, period, session);
  const nicotineLogs = await getNicotineLogs(userId, period, session);
  
  const dailyData = new Map<string, any>();
  
  // Process health logs
  healthLogs.forEach(log => {
    const day = format(new Date(log.timestamp), 'yyyy-MM-dd');
    
    if (!dailyData.has(day)) {
      dailyData.set(day, {
        date: day,
        energy: 0,
        mood: 0,
        focus: 0,
        sleep: 0,
        cravings: 0,
        nicotine: 0
      });
    }
    
    const entry = dailyData.get(day)!;
    
    if (log.energy_level) {
      entry.energy = log.energy_level;
    }
    if (log.mood_level) {
      entry.mood = log.mood_level;
    }
    if (log.focus_level) {
      entry.focus = log.focus_level;
    }
    if (log.sleep_hours) {
      entry.sleep = log.sleep_hours;
    }
    if (log.craving_intensity) {
      entry.cravings = log.craving_intensity;
    }
  });
  
  // Process nicotine logs
  nicotineLogs.forEach(log => {
    const day = format(new Date(log.timestamp), 'yyyy-MM-dd');
    
    if (!dailyData.has(day)) {
      dailyData.set(day, {
        date: day,
        energy: 0,
        mood: 0,
        focus: 0,
        sleep: 0,
        cravings: 0,
        nicotine: 0
      });
    }
    
    const entry = dailyData.get(day)!;
    entry.nicotine += log.quantity;
  });
  
  return Array.from(dailyData.values())
    .sort((a, b) => a.date.localeCompare(b.date));
}; 