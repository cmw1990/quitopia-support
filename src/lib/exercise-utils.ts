import type { Exercise } from '@/types/exercise';

export function calculateCaloriesBurned(
  exercise: Exercise,
  durationMinutes: number,
  userWeight: number, // in kg
  intensity: 'low' | 'medium' | 'high' = 'medium'
): number {
  // MET (Metabolic Equivalent of Task) values for different intensities
  const metValues = {
    low: 3,
    medium: 5,
    high: 7,
  };

  // Base formula: Calories = MET × Weight (kg) × Time (hours)
  const hours = durationMinutes / 60;
  const met = metValues[intensity];
  return Math.round(met * userWeight * hours);
}

export function getDifficultyColor(difficulty: string): {
  text: string;
  bg: string;
  border: string;
} {
  switch (difficulty.toLowerCase()) {
    case 'beginner':
      return {
        text: 'text-green-800 dark:text-green-200',
        bg: 'bg-green-100 dark:bg-green-900',
        border: 'border-green-200 dark:border-green-800',
      };
    case 'intermediate':
      return {
        text: 'text-yellow-800 dark:text-yellow-200',
        bg: 'bg-yellow-100 dark:bg-yellow-900',
        border: 'border-yellow-200 dark:border-yellow-800',
      };
    case 'advanced':
      return {
        text: 'text-red-800 dark:text-red-200',
        bg: 'bg-red-100 dark:bg-red-900',
        border: 'border-red-200 dark:border-red-800',
      };
    default:
      return {
        text: 'text-gray-800 dark:text-gray-200',
        bg: 'bg-gray-100 dark:bg-gray-900',
        border: 'border-gray-200 dark:border-gray-800',
      };
  }
}

export function formatDuration(seconds: number): string {
  const minutes = Math.floor(seconds / 60);
  const remainingSeconds = seconds % 60;
  return `${minutes}:${remainingSeconds.toString().padStart(2, '0')}`;
}

export function getExerciseIntensity(
  exercise: Exercise,
  userFitnessLevel: 'beginner' | 'intermediate' | 'advanced'
): 'low' | 'medium' | 'high' {
  // Map user fitness level and exercise difficulty to intensity
  const intensityMatrix = {
    beginner: {
      beginner: 'medium',
      intermediate: 'high',
      advanced: 'high',
    },
    intermediate: {
      beginner: 'low',
      intermediate: 'medium',
      advanced: 'high',
    },
    advanced: {
      beginner: 'low',
      intermediate: 'medium',
      advanced: 'medium',
    },
  } as const;

  return intensityMatrix[userFitnessLevel][exercise.difficulty.toLowerCase() as keyof typeof intensityMatrix['beginner']];
}

export function generateExerciseSchedule(
  exercises: Exercise[],
  userPreferences: {
    preferredDuration: number; // in minutes
    targetMuscleGroups: string[];
    restDays: number[];
    excludedExercises: string[];
  }
): Exercise[][] {
  const weeklySchedule: Exercise[][] = Array(7).fill([]);
  const { preferredDuration, targetMuscleGroups, restDays, excludedExercises } = userPreferences;

  // Filter exercises based on preferences
  const availableExercises = exercises.filter(
    (exercise) =>
      !excludedExercises.includes(exercise.id) &&
      exercise.target_muscles.some((muscle) => targetMuscleGroups.includes(muscle))
  );

  // Create daily workouts
  for (let day = 0; day < 7; day++) {
    if (restDays.includes(day)) continue;

    let currentDuration = 0;
    const dailyExercises: Exercise[] = [];

    while (currentDuration < preferredDuration && availableExercises.length > 0) {
      // Find an exercise that fits the remaining time
      const exercise = availableExercises.find(
        (e) => e.duration + currentDuration <= preferredDuration
      );

      if (!exercise) break;

      dailyExercises.push(exercise);
      currentDuration += exercise.duration;
    }

    weeklySchedule[day] = dailyExercises;
  }

  return weeklySchedule;
}

export function estimateRecoveryTime(
  exercise: Exercise,
  userFitnessLevel: 'beginner' | 'intermediate' | 'advanced',
  intensity: 'low' | 'medium' | 'high'
): number {
  // Base recovery time in hours
  const baseRecovery = {
    beginner: {
      low: 24,
      medium: 36,
      high: 48,
    },
    intermediate: {
      low: 18,
      medium: 24,
      high: 36,
    },
    advanced: {
      low: 12,
      medium: 18,
      high: 24,
    },
  };

  return baseRecovery[userFitnessLevel][intensity];
}
