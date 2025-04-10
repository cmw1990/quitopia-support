import { useState, useEffect } from 'react';
import { supabase } from '@/integrations/supabase/supabase-client';
import { MemoryExercise } from '@/types/memory';

interface UseMemoryExercisesOptions {
  userId: string;
  exerciseType?: string;
  difficultyLevel?: string;
  startDate?: string;
  endDate?: string;
}

export function useMemoryExercises(options: UseMemoryExercisesOptions) {
  const [exercises, setExercises] = useState<MemoryExercise[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<Error | null>(null);

  useEffect(() => {
    const fetchExercises = async () => {
      try {
        let query = supabase
          .from('memory_exercises')
          .select('*')
          .eq('user_id', options.userId)
          .order('completed_at', { ascending: false });

        if (options.exerciseType) {
          query = query.eq('exercise_type', options.exerciseType);
        }

        if (options.difficultyLevel) {
          query = query.eq('difficulty_level', options.difficultyLevel);
        }

        if (options.startDate) {
          query = query.gte('completed_at', options.startDate);
        }

        if (options.endDate) {
          query = query.lte('completed_at', options.endDate);
        }

        const { data, error } = await query;

        if (error) throw error;

        setExercises(data as MemoryExercise[]);
        setLoading(false);
      } catch (err) {
        setError(err as Error);
        setLoading(false);
      }
    };

    fetchExercises();
  }, [options.userId, options.exerciseType, options.difficultyLevel, options.startDate, options.endDate]);

  const startExercise = async (exercise: Omit<MemoryExercise, 'id' | 'completed_at' | 'created_at' | 'updated_at'>) => {
    try {
      const { data, error } = await supabase
        .from('memory_exercises')
        .insert([exercise])
        .select()
        .single();

      if (error) throw error;

      setExercises(prev => [data as MemoryExercise, ...prev]);
      return data as MemoryExercise;
    } catch (err) {
      setError(err as Error);
      throw err;
    }
  };

  const completeExercise = async (id: string, results: Partial<MemoryExercise>) => {
    try {
      const updates = {
        ...results,
        completed_at: new Date().toISOString(),
      };

      const { data, error } = await supabase
        .from('memory_exercises')
        .update(updates)
        .eq('id', id)
        .select()
        .single();

      if (error) throw error;

      setExercises(prev =>
        prev.map(exercise =>
          exercise.id === id ? { ...exercise, ...data } as MemoryExercise : exercise
        )
      );
      return data as MemoryExercise;
    } catch (err) {
      setError(err as Error);
      throw err;
    }
  };

  const deleteExercise = async (id: string) => {
    try {
      const { error } = await supabase
        .from('memory_exercises')
        .delete()
        .eq('id', id);

      if (error) throw error;

      setExercises(prev => prev.filter(exercise => exercise.id !== id));
    } catch (err) {
      setError(err as Error);
      throw err;
    }
  };

  const getExerciseStats = () => {
    const completedExercises = exercises.filter(ex => ex.completed_at);
    
    return {
      totalExercises: exercises.length,
      completedExercises: completedExercises.length,
      averageScore: completedExercises.reduce((sum, ex) => sum + (ex.score || 0), 0) / completedExercises.length,
      averageDuration: completedExercises.reduce((sum, ex) => sum + (ex.duration_seconds || 0), 0) / completedExercises.length,
      byDifficulty: exercises.reduce((acc, ex) => {
        acc[ex.difficulty_level] = (acc[ex.difficulty_level] || 0) + 1;
        return acc;
      }, {} as Record<string, number>),
    };
  };

  return {
    exercises,
    loading,
    error,
    startExercise,
    completeExercise,
    deleteExercise,
    getExerciseStats,
  };
}
