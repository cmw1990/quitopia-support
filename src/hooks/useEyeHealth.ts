import { useState, useCallback } from 'react';
import { useWellness } from './useWellness';
import type { EyeStrainTracking } from '../types/wellness';

export function useEyeHealth() {
  const { trackEyeStrain } = useWellness();
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<Error | null>(null);

  const startEyeExercise = useCallback(async () => {
    setLoading(true);
    try {
      await trackEyeStrain({
        exerciseCompleted: false,
        symptoms: [],
        eyeDropsUsed: false,
        screenTimeMinutes: 0,
        breakCount: 0
      });
      setLoading(false);
    } catch (err) {
      setError(err as Error);
      setLoading(false);
    }
  }, [trackEyeStrain]);

  const completeEyeExercise = useCallback(async (data: {
    symptoms: string[];
    eyeDropsUsed: boolean;
    screenTimeMinutes: number;
    breakCount: number;
  }) => {
    setLoading(true);
    try {
      await trackEyeStrain({
        ...data,
        exerciseCompleted: true
      });
      setLoading(false);
    } catch (err) {
      setError(err as Error);
      setLoading(false);
    }
  }, [trackEyeStrain]);

  return {
    startEyeExercise,
    completeEyeExercise,
    loading,
    error
  };
}
