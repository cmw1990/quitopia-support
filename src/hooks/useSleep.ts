import { useState, useCallback } from 'react';
import { useWellness } from './useWellness';
import type { SleepEnvironment, SleepStage } from '../types/wellness';

export function useSleep() {
  const { trackSleepEnvironment, trackSleepStages } = useWellness();
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<Error | null>(null);

  const logSleepEnvironment = useCallback(async (sleepMetricId: string, data: {
    temperatureCelsius?: number;
    humidityPercent?: number;
    noiseLevelDb?: number;
    lightLevelLux?: number;
    airQualityIndex?: number;
  }) => {
    setLoading(true);
    try {
      await trackSleepEnvironment({
        sleepMetricId,
        ...data
      });
      setLoading(false);
    } catch (err) {
      setError(err as Error);
      setLoading(false);
    }
  }, [trackSleepEnvironment]);

  const logSleepStage = useCallback(async (sleepMetricId: string, data: {
    stage: 'light' | 'deep' | 'rem' | 'awake';
    startTime: Date;
    endTime: Date;
    durationMinutes: number;
  }) => {
    setLoading(true);
    try {
      await trackSleepStages({
        sleepMetricId,
        ...data
      });
      setLoading(false);
    } catch (err) {
      setError(err as Error);
      setLoading(false);
    }
  }, [trackSleepStages]);

  const getSleepSummary = useCallback(async (startDate: Date, endDate: Date) => {
    // This will be implemented with the wellness summary
    return null;
  }, []);

  return {
    logSleepEnvironment,
    logSleepStage,
    getSleepSummary,
    loading,
    error
  };
}
