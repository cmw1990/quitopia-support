import { SUPABASE_URL, SUPABASE_KEY } from '@/integrations/supabase/db-client';
import type { User } from '@supabase/supabase-js';
import type {
  Exercise,
  ExerciseCategory,
  ExerciseStep,
  ExerciseWithDetails,
  UserExerciseProgress,
  UserExerciseFavorite,
} from '@/types/exercise';

// Helper to get user ID from response
const getUserId = (user: User | null): string => {
  if (!user) throw new Error('User not authenticated');
  return user.id;
};

// Helper for making Supabase REST API calls
const supabaseRestCall = async (endpoint: string, options: RequestInit = {}, session?: { access_token: string } | null) => {
  const response = await fetch(`${SUPABASE_URL}${endpoint}`, {
    ...options,
    headers: {
      'Content-Type': 'application/json',
      'apikey': SUPABASE_KEY,
      'Authorization': `Bearer ${session?.access_token || SUPABASE_KEY}`,
      ...options.headers
    }
  });

  if (!response.ok) {
    const error = await response.json();
    throw new Error(error.message || response.statusText);
  }

  return await response.json();
};

export async function getExerciseCategories(): Promise<ExerciseCategory[]> {
  const { data, error } = await supabaseRestCall('/rest/v1/exercise_categories');

  if (error) throw error;
  return data;
}

export async function getExercisesByCategory(categoryId: string): Promise<Exercise[]> {
  const { data, error } = await supabaseRestCall(`/rest/v1/exercises?category_id=eq.${categoryId}`);

  if (error) throw error;
  return data;
}

export async function getExerciseWithDetails(exerciseId: string, userId?: string): Promise<ExerciseWithDetails> {
  const { data, error } = await supabaseRestCall(`/rest/v1/exercises?id=eq.${exerciseId}`);

  if (error) throw error;
  return data[0];
}

export async function toggleExerciseFavorite(exerciseId: string, userId: string): Promise<boolean> {
  const { data, error } = await supabaseRestCall(`/rest/v1/user_exercise_favorites?exercise_id=eq.${exerciseId}&user_id=eq.${userId}`, {
    method: 'POST'
  });

  if (error) throw error;
  return data.length > 0;
}

export async function recordExerciseProgress(
  userId: string,
  exerciseId: string,
  durationSeconds: number,
  caloriesBurned: number,
  notes?: string
): Promise<UserExerciseProgress> {
  const { data, error } = await supabaseRestCall('/rest/v1/user_exercise_progress', {
    method: 'POST',
    body: JSON.stringify({
      user_id: userId,
      exercise_id: exerciseId,
      duration_seconds: durationSeconds,
      calories_burned: caloriesBurned,
      notes,
    })
  });

  if (error) throw error;
  return data[0];
}

export async function getUserExerciseHistory(userId: string): Promise<(UserExerciseProgress & { exercise: Exercise })[]> {
  const { data, error } = await supabaseRestCall(`/rest/v1/user_exercise_progress?user_id=eq.${userId}&order=completed_at.desc`);

  if (error) throw error;
  return data;
}

export async function getUserFavoriteExercises(userId: string): Promise<(Exercise & { category: ExerciseCategory })[]> {
  const { data, error } = await supabaseRestCall(`/rest/v1/user_exercise_favorites?user_id=eq.${userId}&order=created_at.desc`);

  if (error) throw error;
  return data.map(item => item.exercise);
}

// Record workout
export async function recordWorkout(user: User | null, data: {
  type: string;
  duration: number;
  intensity: number;
  exercises: {
    name: string;
    sets: number;
    reps: number;
    weight?: number;
  }[];
  calories_burned: number;
  notes?: string;
}, session?: { access_token: string } | null) {
  const userId = getUserId(user);
  try {
    await supabaseRestCall('/rest/v1/workouts8', {
      method: 'POST',
      body: JSON.stringify({
        user_id: userId,
        ...data,
        timestamp: new Date().toISOString()
      })
    }, session);
  } catch (error) {
    console.error('Error recording workout:', error);
    throw error;
  }
}

// Set fitness goals
export async function setFitnessGoals(user: User | null, data: {
  workout_frequency: number;
  target_calories: number;
  target_duration: number;
  target_steps: number;
  strength_goals?: {
    exercise: string;
    target_weight: number;
    target_reps: number;
  }[];
}, session?: { access_token: string } | null) {
  const userId = getUserId(user);
  try {
    await supabaseRestCall('/rest/v1/fitness_goals8', {
      method: 'POST',
      body: JSON.stringify({
        user_id: userId,
        ...data,
        created_at: new Date().toISOString()
      })
    }, session);
  } catch (error) {
    console.error('Error setting fitness goals:', error);
    throw error;
  }
}

// Get workout history
export async function getWorkoutHistory(user: User | null, startDate?: string, endDate?: string, session?: { access_token: string } | null) {
  const userId = getUserId(user);
  try {
    let url = `/rest/v1/workouts8?user_id=eq.${userId}&order=timestamp.desc`;
    if (startDate) url += `&timestamp=gte.${startDate}`;
    if (endDate) url += `&timestamp=lte.${endDate}`;
    
    return await supabaseRestCall(url, {}, session);
  } catch (error) {
    console.error('Error getting workout history:', error);
    throw error;
  }
}

// Get fitness goals
export async function getFitnessGoals(user: User | null, session?: { access_token: string } | null) {
  const userId = getUserId(user);
  try {
    return await supabaseRestCall(
      `/rest/v1/fitness_goals8?user_id=eq.${userId}&order=created_at.desc&limit=1`,
      {},
      session
    );
  } catch (error) {
    console.error('Error getting fitness goals:', error);
    throw error;
  }
}

// Get fitness analytics
export async function getFitnessAnalytics(user: User | null, timeframe: string, session?: { access_token: string } | null) {
  const userId = getUserId(user);
  try {
    return await supabaseRestCall('/rest/v1/rpc/get_fitness_analytics', {
      method: 'POST',
      body: JSON.stringify({
        p_user_id: userId,
        p_timeframe: timeframe
      })
    }, session);
  } catch (error) {
    console.error('Error getting fitness analytics:', error);
    throw error;
  }
}

// Update fitness goals
export async function updateFitnessGoals(user: User | null, goalId: string, updates: {
  workout_frequency?: number;
  target_calories?: number;
  target_duration?: number;
  target_steps?: number;
  strength_goals?: {
    exercise: string;
    target_weight: number;
    target_reps: number;
  }[];
}, session?: { access_token: string } | null) {
  const userId = getUserId(user);
  try {
    await supabaseRestCall(`/rest/v1/fitness_goals8?id=eq.${goalId}&user_id=eq.${userId}`, {
      method: 'PATCH',
      body: JSON.stringify({
        ...updates,
        updated_at: new Date().toISOString()
      })
    }, session);
  } catch (error) {
    console.error('Error updating fitness goals:', error);
    throw error;
  }
}

// Delete fitness goals
export async function deleteFitnessGoals(user: User | null, goalId: string, session?: { access_token: string } | null) {
  const userId = getUserId(user);
  try {
    await supabaseRestCall(`/rest/v1/fitness_goals8?id=eq.${goalId}&user_id=eq.${userId}`, {
      method: 'DELETE'
    }, session);
  } catch (error) {
    console.error('Error deleting fitness goals:', error);
    throw error;
  }
}

// Record cardio session
export async function recordCardioSession(user: User | null, data: {
  type: string;
  duration: number;
  distance?: number;
  heart_rate: {
    avg: number;
    max: number;
  };
  calories_burned: number;
  notes?: string;
}, session?: { access_token: string } | null) {
  const userId = getUserId(user);
  try {
    await supabaseRestCall('/rest/v1/cardio_sessions8', {
      method: 'POST',
      body: JSON.stringify({
        user_id: userId,
        ...data,
        timestamp: new Date().toISOString()
      })
    }, session);
  } catch (error) {
    console.error('Error recording cardio session:', error);
    throw error;
  }
}

// Get cardio history
export async function getCardioHistory(user: User | null, startDate?: string, endDate?: string, session?: { access_token: string } | null) {
  const userId = getUserId(user);
  try {
    let url = `/rest/v1/cardio_sessions8?user_id=eq.${userId}&order=timestamp.desc`;
    if (startDate) url += `&timestamp=gte.${startDate}`;
    if (endDate) url += `&timestamp=lte.${endDate}`;
    
    return await supabaseRestCall(url, {}, session);
  } catch (error) {
    console.error('Error getting cardio history:', error);
    throw error;
  }
}
