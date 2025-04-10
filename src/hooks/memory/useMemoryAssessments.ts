import { useState, useEffect } from 'react';
import { supabase } from '@/integrations/supabase/supabase-client';
import { MemoryAssessment } from '@/types/memory';

interface UseMemoryAssessmentsOptions {
  userId: string;
  assessmentType?: string;
  startDate?: string;
  endDate?: string;
}

export function useMemoryAssessments(options: UseMemoryAssessmentsOptions) {
  const [assessments, setAssessments] = useState<MemoryAssessment[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<Error | null>(null);

  useEffect(() => {
    const fetchAssessments = async () => {
      try {
        let query = supabase
          .from('memory_assessments')
          .select('*')
          .eq('user_id', options.userId)
          .order('assessment_date', { ascending: false });

        if (options.assessmentType) {
          query = query.eq('assessment_type', options.assessmentType);
        }

        if (options.startDate) {
          query = query.gte('assessment_date', options.startDate);
        }

        if (options.endDate) {
          query = query.lte('assessment_date', options.endDate);
        }

        const { data, error } = await query;

        if (error) throw error;

        setAssessments(data as MemoryAssessment[]);
        setLoading(false);
      } catch (err) {
        setError(err as Error);
        setLoading(false);
      }
    };

    fetchAssessments();
  }, [options.userId, options.assessmentType, options.startDate, options.endDate]);

  const addAssessment = async (assessment: Omit<MemoryAssessment, 'id' | 'created_at' | 'updated_at'>) => {
    try {
      const { data, error } = await supabase
        .from('memory_assessments')
        .insert([assessment])
        .select()
        .single();

      if (error) throw error;

      setAssessments(prev => [data as MemoryAssessment, ...prev]);
      return data as MemoryAssessment;
    } catch (err) {
      setError(err as Error);
      throw err;
    }
  };

  const updateAssessment = async (id: string, updates: Partial<MemoryAssessment>) => {
    try {
      const { data, error } = await supabase
        .from('memory_assessments')
        .update(updates)
        .eq('id', id)
        .select()
        .single();

      if (error) throw error;

      setAssessments(prev =>
        prev.map(assessment =>
          assessment.id === id ? { ...assessment, ...data } as MemoryAssessment : assessment
        )
      );
      return data as MemoryAssessment;
    } catch (err) {
      setError(err as Error);
      throw err;
    }
  };

  const deleteAssessment = async (id: string) => {
    try {
      const { error } = await supabase
        .from('memory_assessments')
        .delete()
        .eq('id', id);

      if (error) throw error;

      setAssessments(prev => prev.filter(assessment => assessment.id !== id));
    } catch (err) {
      setError(err as Error);
      throw err;
    }
  };

  return {
    assessments,
    loading,
    error,
    addAssessment,
    updateAssessment,
    deleteAssessment,
  };
}
