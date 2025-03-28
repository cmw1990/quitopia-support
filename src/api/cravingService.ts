import { Session } from '@supabase/supabase-js';
import { supabaseRestCall } from "./apiCompatibility";

/**
 * Interface for craving log entries
 */
export interface CravingLog {
  id?: string;
  user_id: string;
  timestamp: string;
  date?: string;       // Date in YYYY-MM-DD format
  time?: string;       // Time in HH:MM:SS format
  intensity: number;   // 1-10 scale
  trigger: string;     // What triggered the craving
  duration_minutes?: number;
  location?: string;
  resisted: boolean;   // Whether the craving was resisted
  notes?: string | null;
  mood_before?: number | null; // Mood level before craving (1-10)
  created_at?: string;
  intervention_outcome?: {
    intervention_type: string;
    successful: boolean;
    intensity_reduction: number;
    duration: number;
  };
}

/**
 * Interface for craving prediction model
 */
export interface CravingPrediction {
  timeOfDay: string;
  riskLevel: number;
  primaryTrigger: string;
  secondaryTrigger: string | null;
  recommendedAction: string;
}

/**
 * Interface for craving analytics report
 */
export interface CravingAnalytics {
  totalCravings: number;
  resistedCravings: number;
  resistanceRate: number;
  averageIntensity: number;
  commonTriggers: { trigger: string, count: number }[];
  triggersByTimeOfDay: { timeOfDay: string, triggers: { trigger: string, count: number }[] }[];
  intensityTrend: { date: string, intensity: number }[];
  predictions: CravingPrediction[];
}

// Type for Supabase REST API response
interface SupabaseResponse<T> {
  data: T | null;
  error: any | null;
}

/**
 * Gets all craving logs for a user within a date range
 */
export const getCravingLogs = async (
  userId: string,
  startDate: string,
  endDate: string,
  session: Session | null
): Promise<CravingLog[]> => {
  // For now, use mock data directly since the database tables aren't properly set up
  console.log('Using mock data for craving logs');
  return getMockCravingLogs(userId, startDate, endDate);
};

/**
 * Generate mock craving logs for development and testing
 */
function getMockCravingLogs(userId: string, startDate: string, endDate: string): CravingLog[] {
  const start = new Date(startDate);
  const end = new Date(endDate);
  const days = Math.min(30, Math.ceil((end.getTime() - start.getTime()) / (1000 * 60 * 60 * 24)));
  
  const mockLogs: CravingLog[] = [];
  const triggers = ['Stress', 'After meal', 'Social situation', 'Boredom', 'Morning routine', 'While driving'];
  const locations = ['Home', 'Work', 'Car', 'Restaurant', 'Friend\'s place'];
  
  // Generate 1-3 logs per day
  for (let i = 0; i < days; i++) {
    const day = new Date(start);
    day.setDate(day.getDate() + i);
    
    const logsForDay = Math.floor(Math.random() * 3) + 1;
    
    for (let j = 0; j < logsForDay; j++) {
      // Random hour between 7am and 10pm
      const hour = 7 + Math.floor(Math.random() * 15);
      const minute = Math.floor(Math.random() * 60);
      day.setHours(hour, minute);
      
      const timestamp = day.toISOString();
      const dateStr = timestamp.split('T')[0];
      const timeStr = timestamp.split('T')[1].split('.')[0];
      
      mockLogs.push({
        id: `mock-${mockLogs.length + 1}`,
        user_id: userId,
        timestamp: timestamp,
        date: dateStr,
        time: timeStr,
        intensity: 1 + Math.floor(Math.random() * 10),
        trigger: triggers[Math.floor(Math.random() * triggers.length)],
        duration_minutes: 5 + Math.floor(Math.random() * 25),
        location: locations[Math.floor(Math.random() * locations.length)],
        resisted: Math.random() > 0.3, // 70% success rate
        mood_before: 3 + Math.floor(Math.random() * 6),
        notes: Math.random() > 0.7 ? 'User note about this craving' : null,
        created_at: timestamp
      });
    }
  }
  
  // Sort by timestamp descending
  return mockLogs.sort((a, b) => {
    return new Date(b.timestamp).getTime() - new Date(a.timestamp).getTime();
  });
}

/**
 * Add a new craving log entry
 */
export const addCravingLog = async (
  cravingLog: CravingLog,
  session: Session | null
): Promise<CravingLog | null> => {
  try {
    const endpoint = `/rest/v1/craving_logs`;
    
    const response = await supabaseRestCall<SupabaseResponse<CravingLog>>(
      endpoint,
      {
        method: 'POST',
        body: JSON.stringify(cravingLog),
        headers: {
          'Content-Type': 'application/json',
          'Prefer': 'return=minimal'
        }
      },
      session
    );

    if (response && response.error) {
      throw response.error;
    }
    
    return response.data || null;
  } catch (error) {
    console.error('Error adding craving log:', error);
    return null;
  }
};

/**
 * Update an existing craving log entry
 */
export const updateCravingLog = async (
  id: string,
  cravingLog: Partial<CravingLog>,
  session: Session | null
): Promise<CravingLog | null> => {
  try {
    // Create query parameters as URLSearchParams for proper encoding
    const params = new URLSearchParams();
    params.append('id', `eq.${id}`);
    
    const endpoint = `/rest/v1/craving_logs?${params.toString()}`;
    
    const response = await supabaseRestCall<SupabaseResponse<CravingLog>>(
      endpoint,
      {
        method: 'PATCH',
        body: JSON.stringify(cravingLog),
        headers: {
          'Content-Type': 'application/json',
          'Prefer': 'return=representation'
        }
      },
      session
    );

    if (response && response.error) {
      throw response.error;
    }
    
    return response.data || null;
  } catch (error) {
    console.error('Error updating craving log:', error);
    return null;
  }
};

/**
 * Delete a craving log entry
 */
export const deleteCravingLog = async (
  id: string,
  session: Session | null
): Promise<boolean> => {
  try {
    // Create query parameters as URLSearchParams for proper encoding
    const params = new URLSearchParams();
    params.append('id', `eq.${id}`);
    
    const endpoint = `/rest/v1/craving_logs?${params.toString()}`;
    
    const response = await supabaseRestCall<SupabaseResponse<null>>(
      endpoint,
      {
        method: 'DELETE',
        headers: {
          'Prefer': 'return=minimal'
        }
      },
      session
    );

    if (response && response.error) {
      throw response.error;
    }
    
    return true;
  } catch (error) {
    console.error('Error deleting craving log:', error);
    return false;
  }
};

/**
 * Generate craving analytics and predictions
 */
export const getCravingAnalytics = async (
  userId: string,
  startDate: string,
  endDate: string,
  session: Session | null
): Promise<CravingAnalytics | null> => {
  try {
    // Fetch raw craving data
    const cravingLogs = await getCravingLogs(userId, startDate, endDate, session);
    
    if (!cravingLogs.length) {
      return {
        totalCravings: 0,
        resistedCravings: 0,
        resistanceRate: 0,
        averageIntensity: 0,
        commonTriggers: [],
        triggersByTimeOfDay: [],
        intensityTrend: [],
        predictions: []
      };
    }
    
    // Calculate basic metrics
    const totalCravings = cravingLogs.length;
    const resistedCravings = cravingLogs.filter(log => log.resisted).length;
    const resistanceRate = totalCravings > 0 ? (resistedCravings / totalCravings) * 100 : 0;
    const averageIntensity = cravingLogs.reduce((sum, log) => sum + log.intensity, 0) / totalCravings;
    
    // Count triggers
    const triggerCounts: Record<string, number> = {};
    cravingLogs.forEach(log => {
      triggerCounts[log.trigger] = (triggerCounts[log.trigger] || 0) + 1;
    });
    
    // Format trigger counts
    const commonTriggers = Object.entries(triggerCounts)
      .map(([trigger, count]) => ({ trigger, count }))
      .sort((a, b) => b.count - a.count);
    
    // Group by time of day
    const timeGroups: {[key: string]: CravingLog[]} = {
      'morning': [],
      'afternoon': [],
      'evening': [],
      'night': []
    };
    
    cravingLogs.forEach(log => {
      const hour = new Date(log.timestamp).getHours();
      if (hour >= 5 && hour < 12) timeGroups.morning.push(log);
      else if (hour >= 12 && hour < 17) timeGroups.afternoon.push(log);
      else if (hour >= 17 && hour < 22) timeGroups.evening.push(log);
      else timeGroups.night.push(log);
    });
    
    // Calculate triggers by time of day
    const triggersByTimeOfDay = Object.entries(timeGroups).map(([timeOfDay, logs]) => {
      const timeTriggerCounts: Record<string, number> = {};
      logs.forEach(log => {
        timeTriggerCounts[log.trigger] = (timeTriggerCounts[log.trigger] || 0) + 1;
      });
      
      const triggers = Object.entries(timeTriggerCounts)
        .map(([trigger, count]) => ({ trigger, count }))
        .sort((a, b) => b.count - a.count);
      
      return { timeOfDay, triggers };
    });
    
    // Calculate intensity trend by date
    const intensityByDate: Record<string, {total: number, count: number}> = {};
    cravingLogs.forEach(log => {
      const date = new Date(log.timestamp).toISOString().split('T')[0];
      if (!intensityByDate[date]) {
        intensityByDate[date] = { total: 0, count: 0 };
      }
      intensityByDate[date].total += log.intensity;
      intensityByDate[date].count += 1;
    });
    
    const intensityTrend = Object.entries(intensityByDate)
      .map(([date, data]) => ({
        date,
        intensity: data.total / data.count
      }))
      .sort((a, b) => a.date.localeCompare(b.date));
    
    // Generate predictions
    const predictions: CravingPrediction[] = [];
    
    Object.entries(timeGroups).forEach(([time, logs]) => {
      if (logs.length > 0) {
        // Calculate risk level based on frequency and intensity
        const riskLevel = logs.reduce((sum, log) => sum + log.intensity, 0) / logs.length / 10;
        
        // Count triggers by time of day
        const triggersByTime: {[trigger: string]: number} = {};
        logs.forEach(log => {
          triggersByTime[log.trigger] = (triggersByTime[log.trigger] || 0) + 1;
        });
        
        // Find primary trigger
        const triggers = Object.entries(triggersByTime);
        triggers.sort((a, b) => b[1] - a[1]);
        
        const primaryTrigger = triggers.length > 0 ? triggers[0][0] : 'Unknown';
        const secondaryTrigger = triggers.length > 1 ? triggers[1][0] : null;
        
        // Determine recommended action based on triggers
        let recommendedAction = '';
        
        if (primaryTrigger === 'stress') {
          recommendedAction = 'Try a 5-minute breathing exercise';
        } else if (primaryTrigger === 'social situation') {
          recommendedAction = 'Plan ahead with mocktails or gum';
        } else if (primaryTrigger === 'boredom') {
          recommendedAction = 'Play a quick focus game';
        } else if (primaryTrigger === 'after meal') {
          recommendedAction = 'Take a short walk after eating';
        } else {
          recommendedAction = 'Use distraction techniques';
        }
        
        predictions.push({
          timeOfDay: time,
          riskLevel,
          primaryTrigger,
          secondaryTrigger,
          recommendedAction
        });
      }
    });
    
    // Sort by risk level
    predictions.sort((a, b) => b.riskLevel - a.riskLevel);
    
    return {
      totalCravings,
      resistedCravings,
      resistanceRate,
      averageIntensity,
      commonTriggers,
      triggersByTimeOfDay,
      intensityTrend,
      predictions
    };
  } catch (error) {
    console.error('Error generating craving analytics:', error);
    return null;
  }
};

// Record intervention outcome
export const recordInterventionOutcome = async (outcome: {
  triggerId: string;
  interventionType: string;
  successful: boolean;
  intensityBefore: number;
  intensityAfter: number;
  duration: number;
  notes: string;
}) => {
  try {
    // In a real implementation, this would call a REST API
    // For now, we'll use local storage to simulate persistence
    const existingOutcomes = JSON.parse(localStorage.getItem('intervention_outcomes') || '[]');
    
    const newOutcome = {
      id: `intervention-${Date.now()}`,
      date: new Date().toISOString(),
      ...outcome
    };
    
    const updatedOutcomes = [newOutcome, ...existingOutcomes];
    localStorage.setItem('intervention_outcomes', JSON.stringify(updatedOutcomes));
    
    // Also update the craving log to include this intervention outcome
    const cravingLogs = JSON.parse(localStorage.getItem('craving_logs') || '[]');
    const updatedLogs = cravingLogs.map((log: any) => {
      if (log.id === outcome.triggerId || (`manual-${log.id}` === outcome.triggerId)) {
        return {
          ...log,
          intervention_outcome: {
            intervention_type: outcome.interventionType,
            successful: outcome.successful,
            intensity_reduction: outcome.intensityBefore - outcome.intensityAfter,
            duration: outcome.duration
          }
        };
      }
      return log;
    });
    
    localStorage.setItem('craving_logs', JSON.stringify(updatedLogs));
    
    return newOutcome;
  } catch (error) {
    console.error("Error recording intervention outcome:", error);
    throw error;
  }
};

// Fetch intervention history
export const fetchInterventionHistory = async (userId: string) => {
  try {
    // In a real implementation, this would call a REST API
    // For now, we'll use local storage to simulate persistence
    const outcomes = JSON.parse(localStorage.getItem('intervention_outcomes') || '[]');
    
    // Sort by date descending (most recent first)
    return outcomes.sort((a: any, b: any) => 
      new Date(b.date).getTime() - new Date(a.date).getTime()
    );
  } catch (error) {
    console.error("Error fetching intervention history:", error);
    throw error;
  }
};

// Predict high-risk craving times
export const predictCravingTimes = async (userId: string) => {
  try {
    const cravingLogs = await getCravingLogs(userId, new Date().toISOString(), new Date().toISOString(), null);
    
    if (!cravingLogs || cravingLogs.length < 5) {
      return [];
    }
    
    // Group cravings by hour of day
    const hourCounts: Record<number, number> = {};
    cravingLogs.forEach(log => {
      const hour = new Date(log.timestamp).getHours();
      hourCounts[hour] = (hourCounts[hour] || 0) + 1;
    });
    
    // Find the top 3 high-risk hours
    const sortedHours = Object.entries(hourCounts)
      .sort(([, countA], [, countB]) => countB - countA)
      .slice(0, 3)
      .map(([hour, count]) => ({
        hour: parseInt(hour),
        count,
        riskLevel: count / cravingLogs.length
      }));
    
    // Generate predictions with timeframe and risk level
    return sortedHours.map(({hour, riskLevel}) => {
      const hourStart = `${hour}:00`;
      const hourEnd = `${hour === 23 ? 0 : hour + 1}:00`;
      
      return {
        timeframe: `${hourStart} - ${hourEnd}`,
        riskLevel: riskLevel > 0.4 ? 'high' : riskLevel > 0.2 ? 'medium' : 'low',
        riskPercentage: Math.round(riskLevel * 100),
        recommendedIntervention: getRecommendedIntervention(hour, cravingLogs)
      };
    });
  } catch (error) {
    console.error("Error predicting craving times:", error);
    throw error;
  }
};

// Helper function to get recommended intervention based on time and previous success
const getRecommendedIntervention = (hour: number, cravingLogs: CravingLog[]) => {
  // Filter to logs with this hour and successful interventions
  const relevantLogs = cravingLogs.filter(log => 
    new Date(log.timestamp).getHours() === hour && 
    log.intervention_outcome?.successful
  );
  
  if (relevantLogs.length === 0) {
    // Default recommendations based on time of day
    if (hour >= 6 && hour < 10) {
      return 'breathing'; // Morning - calm start to day
    } else if (hour >= 10 && hour < 14) {
      return 'distract'; // Midday - stay busy
    } else if (hour >= 14 && hour < 18) {
      return 'reframe'; // Afternoon - mental engagement
    } else if (hour >= 18 && hour < 22) {
      return 'holistic'; // Evening - wind down
    } else {
      return 'timer'; // Night - simple approach
    }
  }
  
  // Count intervention types that worked at this hour
  const interventionCounts: Record<string, number> = {};
  relevantLogs.forEach(log => {
    if (log.intervention_outcome) {
      const type = log.intervention_outcome.intervention_type;
      interventionCounts[type] = (interventionCounts[type] || 0) + 1;
    }
  });
  
  // Return the most successful intervention type
  return Object.entries(interventionCounts)
    .sort(([, countA], [, countB]) => countB - countA)[0][0];
};

/**
 * Fetch all craving logs for a user (without date constraints)
 */
export const fetchCravingLogs = async (
  userId: string,
  session: Session | null = null
): Promise<CravingLog[]> => {
  try {
    const endpoint = `/rest/v1/craving_logs`;
    
    // Create query parameters as URLSearchParams for proper encoding
    const params = new URLSearchParams();
    params.append('select', '*');
    params.append('user_id', `eq.${userId}`);
    params.append('order', 'timestamp.desc');
    
    // Construct URL with query parameters
    const urlWithParams = `${endpoint}?${params.toString()}`;

    const response = await supabaseRestCall<SupabaseResponse<CravingLog[]>>(
      urlWithParams,
      { method: 'GET' },
      session
    );

    if (response && response.error) {
      throw response.error;
    }
    
    return response.data || [];
  } catch (error) {
    console.error('Error fetching all craving logs:', error);
    return [];
  }
};
