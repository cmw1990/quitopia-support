import { useState, useCallback } from 'react';
import { useWellness } from './useWellness';
import type { ExerciseDetail } from '../types/wellness';

export function useExercise() {
  const { addExerciseDetails } = useWellness();
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<Error | null>(null);

  const logExercise = useCallback(async (activityId: string, data: {
    exerciseType: string;
    sets?: number;
    reps?: number;
    weightKg?: number;
    distanceKm?: number;
    speedKmh?: number;
    heartRateAvg?: number;
    heartRateMax?: number;
    caloriesBurned?: number;
  }) => {
    setLoading(true);
    try {
      await addExerciseDetails({
        activityId,
        ...data
      });
      setLoading(false);
    } catch (err) {
      setError(err as Error);
      setLoading(false);
    }
  }, [addExerciseDetails]);

  const getExerciseSummary = useCallback(async (startDate: Date, endDate: Date) => {
    // This will be implemented with the wellness summary
    return null;
  }, []);

  return {
    logExercise,
    getExerciseSummary,
    loading,
    error
  };
}
