import React, { createContext, useState, useContext, useEffect } from 'react';
import { useQuery, useQueryClient } from '@tanstack/react-query';
import { useAuth } from '@/components/AuthProvider';
import { authenticatedRestCall } from '@/lib/supabase/rest-client';
import { format, parse, subDays } from 'date-fns';

// Types for different health metrics
interface MoodLog {
  id: string;
  user_id: string;
  timestamp: string;
  mood_score: number;
  triggers: string[];
  activities: string[];
  notes: string | null;
  related_to_cravings: boolean;
  created_at: string;
}

interface EnergyLog {
  id: string;
  user_id: string;
  timestamp: string;
  energy_level: number;
  time_of_day: string;
  caffeine_consumed: boolean;
  caffeine_amount_mg: number | null;
  physical_activity: boolean;
  sleep_hours: number;
  notes: string | null;
  created_at: string;
}

interface FocusLog {
  id: string;
  user_id: string;
  timestamp: string;
  focus_level: number;
  duration_minutes: number;
  interruptions: number;
  task_type: string;
  notes: string | null;
  environment: string;
  created_at: string;
}

// Combined metrics for holistic view
interface DailyMetrics {
  date: string;
  formattedDate: string;
  mood: number | null;
  energy: number | null;
  focus: number | null;
  moodCount: number;
  energyCount: number;
  focusCount: number;
  cravingRelated: number;
  physicalActivity: number;
  averageSleep: number | null;
}

interface HolisticCorrelations {
  moodEnergy: number;
  moodFocus: number;
  energyFocus: number;
  physicalActivity: number;
  cravingImpact: number;
  sleepQuality: number;
}

interface HolisticHealthContextType {
  moodLogs: MoodLog[] | undefined;
  energyLogs: EnergyLog[] | undefined;
  focusLogs: FocusLog[] | undefined;
  dailyMetrics: DailyMetrics[];
  correlations: HolisticCorrelations;
  isLoading: boolean;
  timeRange: 'week' | 'month';
  setTimeRange: (range: 'week' | 'month') => void;
  refreshData: () => void;
}

const HolisticHealthContext = createContext<HolisticHealthContextType | undefined>(undefined);

export const HolisticHealthProvider: React.FC<{ children: React.ReactNode }> = ({ children }) => {
  const { session } = useAuth();
  const queryClient = useQueryClient();
  const [timeRange, setTimeRange] = useState<'week' | 'month'>('week');

  // Query mood logs
  const { data: moodLogs, isLoading: moodLoading } = useQuery({
    queryKey: ['mood-logs'],
    queryFn: async () => {
      if (!session?.user?.id) return [];
      
      try {
        const endpoint = `/rest/v1/mood_logs8?select=*&user_id=eq.${session.user.id}&order=timestamp.desc&limit=30`;
        
        const data = await authenticatedRestCall(endpoint, {
          method: 'GET'
        }, session);
        
        // Ensure data is an array
        return Array.isArray(data) ? data as MoodLog[] : [];
      } catch (error) {
        console.error('Error fetching mood logs:', error);
        return [];
      }
    },
    enabled: !!session?.user?.id,
  });

  // Query energy logs
  const { data: energyLogs, isLoading: energyLoading } = useQuery({
    queryKey: ['energy-logs'],
    queryFn: async () => {
      if (!session?.user?.id) return [];
      
      try {
        const endpoint = `/rest/v1/energy_logs8?select=*&user_id=eq.${session.user.id}&order=timestamp.desc&limit=30`;
        
        const data = await authenticatedRestCall(endpoint, {
          method: 'GET'
        }, session);
        
        // Ensure data is an array
        return Array.isArray(data) ? data as EnergyLog[] : [];
      } catch (error) {
        console.error('Error fetching energy logs:', error);
        return [];
      }
    },
    enabled: !!session?.user?.id,
  });

  // Query focus logs
  const { data: focusLogs, isLoading: focusLoading } = useQuery({
    queryKey: ['focus-logs'],
    queryFn: async () => {
      if (!session?.user?.id) return [];
      
      try {
        const endpoint = `/rest/v1/focus_logs8?select=*&user_id=eq.${session.user.id}&order=timestamp.desc&limit=30`;
        
        const data = await authenticatedRestCall(endpoint, {
          method: 'GET'
        }, session);
        
        // Ensure data is an array
        return Array.isArray(data) ? data as FocusLog[] : [];
      } catch (error) {
        console.error('Error fetching focus logs:', error);
        return [];
      }
    },
    enabled: !!session?.user?.id,
  });

  // Process the data to create a combined daily metrics view
  const dailyMetrics = React.useMemo(() => {
    const metricsByDate: Record<string, DailyMetrics> = {};
    
    // Start with empty metrics for the last 7 or 30 days
    const daysToShow = timeRange === 'week' ? 7 : 30;
    for (let i = 0; i < daysToShow; i++) {
      const date = subDays(new Date(), i);
      const dateStr = format(date, 'yyyy-MM-dd');
      const formattedDate = format(date, 'MMM d');
      
      metricsByDate[dateStr] = {
        date: dateStr,
        formattedDate,
        mood: null,
        energy: null,
        focus: null,
        moodCount: 0,
        energyCount: 0,
        focusCount: 0,
        cravingRelated: 0,
        physicalActivity: 0,
        averageSleep: null
      };
    }
    
    // Process mood logs - ensure moodLogs is an array
    const moodLogsArray = Array.isArray(moodLogs) ? moodLogs : [];
    moodLogsArray.forEach(log => {
      try {
        const date = format(new Date(log.timestamp), 'yyyy-MM-dd');
        if (metricsByDate[date]) {
          metricsByDate[date].mood = log?.mood_score || 0;
          metricsByDate[date].moodCount += 1;
          if (log.related_to_cravings) {
            metricsByDate[date].cravingRelated += 1;
          }
        }
      } catch (error) {
        console.error('Error processing mood log:', error);
      }
    });
    
    // Process energy logs - ensure energyLogs is an array
    const energyLogsArray = Array.isArray(energyLogs) ? energyLogs : [];
    energyLogsArray.forEach(log => {
      try {
        const date = format(new Date(log.timestamp), 'yyyy-MM-dd');
        if (metricsByDate[date]) {
          metricsByDate[date].energy = log?.energy_level || 0;
          metricsByDate[date].energyCount += 1;
          if (log.physical_activity) {
            metricsByDate[date].physicalActivity += 1;
          }
          metricsByDate[date].averageSleep = log?.sleep_hours || 0;
        }
      } catch (error) {
        console.error('Error processing energy log:', error);
      }
    });
    
    // Process focus logs - ensure focusLogs is an array
    const focusLogsArray = Array.isArray(focusLogs) ? focusLogs : [];
    focusLogsArray.forEach(log => {
      try {
        const date = format(new Date(log.timestamp), 'yyyy-MM-dd');
        if (metricsByDate[date]) {
          metricsByDate[date].focus = log?.focus_level || 0;
          metricsByDate[date].focusCount += 1;
        }
      } catch (error) {
        console.error('Error processing focus log:', error);
      }
    });
    
    // Calculate averages and prepare final array
    const processedMetrics = Object.values(metricsByDate)
      .sort((a, b) => parse(b.date, 'yyyy-MM-dd', new Date()).getTime() - parse(a.date, 'yyyy-MM-dd', new Date()).getTime())
      .filter(daily => {
        // Only show days with at least one logged metric
        return daily.moodCount > 0 || daily.energyCount > 0 || daily.focusCount > 0;
      })
      .map(daily => {
        return {
          ...daily,
          // Handle null values safely using nullish coalescing
          mood: daily.moodCount > 0 ? (daily.mood ?? 0) : null,
          energy: daily.energyCount > 0 ? (daily.energy ?? 0) : null,
          focus: daily.focusCount > 0 ? (daily.focus ?? 0) : null,
          averageSleep: daily.energyCount > 0 ? (daily.averageSleep ?? 0) : null
        };
      });
    
    return processedMetrics;
  }, [moodLogs, energyLogs, focusLogs, timeRange]);

  // Calculate correlations between metrics
  const correlations = React.useMemo(() => {
    let moodEnergyCorrelation = 0;
    let moodFocusCorrelation = 0;
    let energyFocusCorrelation = 0;
    let physicalActivityImpact = 0;
    let cravingImpact = 0;
    let sleepQualityImpact = 0;
    
    if (dailyMetrics.length > 0) {
      // Calculate only for days that have all three metrics
      const completeDataDays = dailyMetrics.filter(
        day => day.mood !== null && day.energy !== null && day.focus !== null
      );
      
      if (completeDataDays.length > 0) {
        // Now we can safely calculate correlations as we've filtered out null values
        const moodEnergy = completeDataDays.reduce((sum, day) => 
          sum + ((day.mood || 0) * (day.energy || 0)), 0) / completeDataDays.length;
        
        const moodFocus = completeDataDays.reduce((sum, day) => 
          sum + ((day.mood || 0) * (day.focus || 0)), 0) / completeDataDays.length;
        
        const energyFocus = completeDataDays.reduce((sum, day) => 
          sum + ((day.energy || 0) * (day.focus || 0)), 0) / completeDataDays.length;
          
        moodEnergyCorrelation = moodEnergy;
        moodFocusCorrelation = moodFocus;
        energyFocusCorrelation = energyFocus;
        
        // Calculate physical activity impact
        const physicalActivityDays = completeDataDays.filter(day => day.physicalActivity > 0);
        const nonPhysicalActivityDays = completeDataDays.filter(day => day.physicalActivity === 0);
        
        if (physicalActivityDays.length > 0 && nonPhysicalActivityDays.length > 0) {
          const physicalActivityAvgEnergy = physicalActivityDays.reduce((sum, day) => 
            sum + (day.energy || 0), 0) / physicalActivityDays.length;
          
          const nonPhysicalActivityAvgEnergy = nonPhysicalActivityDays.reduce((sum, day) => 
            sum + (day.energy || 0), 0) / nonPhysicalActivityDays.length;
          
          physicalActivityImpact = (physicalActivityAvgEnergy / nonPhysicalActivityAvgEnergy) - 1;
        }
        
        // Calculate craving impact
        const cravingDays = completeDataDays.filter(day => day.cravingRelated > 0);
        const nonCravingDays = completeDataDays.filter(day => day.cravingRelated === 0);
        
        if (cravingDays.length > 0 && nonCravingDays.length > 0) {
          const cravingAvgMood = cravingDays.reduce((sum, day) => 
            sum + (day.mood || 0), 0) / cravingDays.length;
          
          const nonCravingAvgMood = nonCravingDays.reduce((sum, day) => 
            sum + (day.mood || 0), 0) / nonCravingDays.length;
          
          cravingImpact = (cravingAvgMood / nonCravingAvgMood) - 1;
        }
        
        // Calculate sleep quality impact
        const goodSleepDays = completeDataDays.filter(day => 
          day.averageSleep !== null && day.averageSleep >= 7);
        const poorSleepDays = completeDataDays.filter(day => 
          day.averageSleep !== null && day.averageSleep > 0 && day.averageSleep < 7);
        
        if (goodSleepDays.length > 0 && poorSleepDays.length > 0) {
          const goodSleepAvgEnergy = goodSleepDays.reduce((sum, day) => 
            sum + (day.energy || 0), 0) / goodSleepDays.length;
          
          const poorSleepAvgEnergy = poorSleepDays.reduce((sum, day) => 
            sum + (day.energy || 0), 0) / poorSleepDays.length;
          
          sleepQualityImpact = (goodSleepAvgEnergy / poorSleepAvgEnergy) - 1;
        }
      }
    }
    
    return {
      moodEnergy: moodEnergyCorrelation,
      moodFocus: moodFocusCorrelation,
      energyFocus: energyFocusCorrelation,
      physicalActivity: physicalActivityImpact,
      cravingImpact: cravingImpact,
      sleepQuality: sleepQualityImpact
    };
  }, [dailyMetrics]);

  // Function to refresh data
  const refreshData = () => {
    queryClient.invalidateQueries({ queryKey: ['mood-logs'] });
    queryClient.invalidateQueries({ queryKey: ['energy-logs'] });
    queryClient.invalidateQueries({ queryKey: ['focus-logs'] });
  };

  // Loading state
  const isLoading = moodLoading || energyLoading || focusLoading;

  const value = {
    moodLogs,
    energyLogs,
    focusLogs,
    dailyMetrics,
    correlations,
    isLoading,
    timeRange,
    setTimeRange,
    refreshData
  };

  return (
    <HolisticHealthContext.Provider value={value}>
      {children}
    </HolisticHealthContext.Provider>
  );
};

export const useHolisticHealth = () => {
  const context = useContext(HolisticHealthContext);
  if (context === undefined) {
    throw new Error('useHolisticHealth must be used within a HolisticHealthProvider');
  }
  return context;
}; 