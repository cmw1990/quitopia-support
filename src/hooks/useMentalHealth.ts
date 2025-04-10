import { useCallback, useState } from 'react';
import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import { mentalHealthDb } from '@/lib/mental-health-db';
import type {
  MoodLog,
  AnxietyLog,
  DepressionLog,
  MentalHealthSummary
} from '@/lib/mental-health-db';

export function useMentalHealth() {
  const queryClient = useQueryClient();
  const [error, setError] = useState<Error | null>(null);

  // Mood Tracking
  const logMood = useMutation({
    mutationFn: async (data: Omit<MoodLog, 'id' | 'user_id' | 'created_at' | 'updated_at'>) => {
      const { data: result, error } = await mentalHealthDb.createMoodLog(data);
      if (error) throw error;
      return result;
    },
    onSuccess: () => {
      queryClient.invalidateQueries(['mental-health-logs']);
      queryClient.invalidateQueries(['mental-health-summary']);
    }
  });

  // Anxiety Tracking
  const logAnxiety = useMutation({
    mutationFn: async (data: Omit<AnxietyLog, 'id' | 'user_id' | 'created_at' | 'updated_at'>) => {
      const { data: result, error } = await mentalHealthDb.createAnxietyLog(data);
      if (error) throw error;
      return result;
    },
    onSuccess: () => {
      queryClient.invalidateQueries(['mental-health-logs']);
      queryClient.invalidateQueries(['mental-health-summary']);
    }
  });

  // Depression Tracking
  const logDepression = useMutation({
    mutationFn: async (data: Omit<DepressionLog, 'id' | 'user_id' | 'created_at' | 'updated_at'>) => {
      const { data: result, error } = await mentalHealthDb.createDepressionLog(data);
      if (error) throw error;
      return result;
    },
    onSuccess: () => {
      queryClient.invalidateQueries(['mental-health-logs']);
      queryClient.invalidateQueries(['mental-health-summary']);
    }
  });

  // Get Mental Health Logs
  const useGetMentalHealthLogs = (type: 'anxiety' | 'mood' | 'depression', startDate?: Date, endDate?: Date) => {
    return useQuery(
      ['mental-health-logs', type, startDate?.toISOString(), endDate?.toISOString()],
      async () => {
        const { data, error } = await mentalHealthDb.getMentalHealthLogs(type, startDate, endDate);
        if (error) throw error;
        return data;
      }
    );
  };

  // Get Mental Health Summary
  const useGetMentalHealthSummary = (startDate: Date, endDate: Date) => {
    return useQuery(
      ['mental-health-summary', startDate.toISOString(), endDate.toISOString()],
      async () => {
        const { data, error } = await mentalHealthDb.getMentalHealthSummary(startDate, endDate);
        if (error) throw error;
        return data;
      }
    );
  };

  return {
    logMood,
    logAnxiety,
    logDepression,
    useGetMentalHealthLogs,
    useGetMentalHealthSummary,
    error
  };
}
