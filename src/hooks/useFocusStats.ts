import { useState, useEffect } from 'react';
import { useAuth } from '@/components/auth/AuthProvider';
import { toast } from "sonner";
import { analyticsApi } from '@/api/supabase-rest';

interface FocusStatsData {
  totalFocusTime: number; // in seconds
  totalSessions: number;
  averageFocusScore: number;
  averageSessionDuration: number; // in minutes
  focusScoreHistory: Array<{ date: string; score: number }>;
  timeSeriesData: Array<{ date: string; focus: number; energy?: number }>;
  contextData: Array<{ name: string; value: number }>;
}

interface TimeSeriesDataItem {
  date: string;
  minutes: number;
  sessions: number;
  avg_score: number;
}

interface StatsByWeekdayItem {
  weekday: number;
  total_minutes: number;
  avg_focus_level: number;
  session_count: number;
}

interface StatsByTimeOfDayItem {
  hour: number;
  total_minutes: number;
  avg_focus_level: number;
  session_count: number;
}

interface DistractionSourceItem {
  source: string;
  count: number;
  impact_score: number;
}

export function useFocusStats(timeRange: string = '30d') {
  const authContext = useAuth();
  const user = authContext?.user;

  const [focusStats, setFocusStats] = useState<FocusStatsData | null>(null);
  const [isLoading, setIsLoading] = useState<boolean>(true);
  const [error, setError] = useState<Error | null>(null);

  const fetchStats = async () => {
    if (!user?.id) {
      setIsLoading(false);
      setFocusStats(null);
      return;
    }

    setIsLoading(true);
    setError(null);

    try {
      const userId = user.id;
      const [ 
        timeSeriesDataRaw, 
        statsByContextRaw, 
      ] = await Promise.all([
        analyticsApi.getFocusTimeSeriesData(userId, timeRange),
        analyticsApi.getFocusStatsByContext(userId, timeRange),
      ]);

      const timeSeriesData = timeSeriesDataRaw.map((item: any) => ({
        date: item.date,
        focus: item.focus_score ?? item.avg_focus_level ?? 0,
        energy: item.energy_level
      }));
      
      const contextData = statsByContextRaw.map((item: any) => ({
        name: item.context_name || 'Unknown',
        value: item.focus_percentage ?? 0
      }));

      const totalSessionsCalc = timeSeriesDataRaw.reduce((acc: number, curr: any) => acc + (curr.session_count ?? 0), 0);
      const totalFocusMinutes = timeSeriesDataRaw.reduce((acc: number, curr: any) => acc + (curr.total_minutes ?? 0), 0);
      const focusScores = timeSeriesDataRaw.map((item: any) => item.avg_focus_level ?? 0).filter((score: number) => score > 0);
      const averageFocusScoreCalc = focusScores.length > 0
          ? focusScores.reduce((acc: number, curr: number) => acc + curr, 0) / focusScores.length
          : 0;
      const averageSessionDurationCalc = totalSessionsCalc > 0 ? totalFocusMinutes / totalSessionsCalc : 0;

      const focusScoreHistory = timeSeriesDataRaw.map((item: any) => ({
          date: item.date,
          score: item.avg_focus_level ?? 0
        }));

      setFocusStats({
        totalFocusTime: totalFocusMinutes * 60,
        totalSessions: totalSessionsCalc,
        averageFocusScore: parseFloat(averageFocusScoreCalc.toFixed(1)),
        averageSessionDuration: parseFloat(averageSessionDurationCalc.toFixed(1)),
        timeSeriesData,
        contextData,
        focusScoreHistory,
      });
    } catch (err) {
      console.error('Error fetching focus stats:', err);
      setError(err instanceof Error ? err : new Error('Failed to fetch focus statistics'));
      toast.error('Failed to load focus statistics');
      setFocusStats(null);
    } finally {
      setIsLoading(false);
    }
  };

  useEffect(() => {
    fetchStats();
  // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [user?.id, timeRange]);

  return {
    focusStats,
    isLoading,
    error,
    refetch: fetchStats
  };
} 