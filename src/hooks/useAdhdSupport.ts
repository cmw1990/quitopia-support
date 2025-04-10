import { useState } from 'react';
import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import { useAuth } from '../components/AuthProvider';
import { 
  getADHDAssessments, 
  createADHDAssessment,
  getCopingStrategies,
  createCopingStrategy,
  updateStrategyUsageCount
} from '../api/adhdApi';

// Types for ADHD Support data
export interface ADHDAssessment {
  id: string;
  user_id: string;
  assessment_date: string;
  score: number;
  intensity_level: 'mild' | 'moderate' | 'severe';
  notes?: string;
  created_at: string;
  updated_at: string;
}

export interface CopingStrategy {
  id: string;
  user_id: string;
  strategy_name: string;
  category: string;
  effectiveness_rating: number;
  used_count: number;
  notes?: string;
  created_at: string;
  updated_at: string;
}

export interface ADHDSupportSettings {
  daily_reminders: boolean;
  pomodoro_length: number;
  break_length: number;
  preferred_techniques: string[];
  gamification_enabled: boolean;
}

export function useAdhdSupport() {
  const queryClient = useQueryClient();
  const { user, session } = useAuth();
  const [error, setError] = useState<Error | null>(null);
  
  // Fetch user's ADHD assessment results
  const { data: assessments, isLoading: isLoadingAssessments } = useQuery({
    queryKey: ['adhd-assessments', user?.id],
    queryFn: () => getADHDAssessments(session),
    enabled: !!user && !!session,
  });

  // Fetch user's coping strategies
  const { data: strategies, isLoading: isLoadingStrategies } = useQuery({
    queryKey: ['coping-strategies', user?.id],
    queryFn: () => getCopingStrategies(session),
    enabled: !!user && !!session,
  });

  // Create new assessment
  const createAssessment = useMutation({
    mutationFn: (assessmentData: Omit<ADHDAssessment, 'id' | 'user_id' | 'created_at' | 'updated_at'>) => 
      createADHDAssessment(assessmentData, session),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['adhd-assessments', user?.id] });
    },
    onError: (error: Error) => {
      setError(error);
    }
  });

  // Create new coping strategy
  const createStrategy = useMutation({
    mutationFn: (strategyData: Omit<CopingStrategy, 'id' | 'user_id' | 'created_at' | 'updated_at'>) => 
      createCopingStrategy(strategyData, session),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['coping-strategies', user?.id] });
    },
    onError: (error: Error) => {
      setError(error);
    }
  });

  // Update coping strategy usage count
  const updateStrategyUsage = useMutation({
    mutationFn: (strategyId: string) => updateStrategyUsageCount(strategyId, session),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['coping-strategies', user?.id] });
    },
    onError: (error: Error) => {
      setError(error);
    }
  });

  // Get latest assessment score
  const latestAssessment = assessments && assessments.length > 0 ? assessments[0] : null;
  
  // Get most effective strategies
  const effectiveStrategies = strategies 
    ? strategies
        .filter(s => s.effectiveness_rating >= 7)
        .sort((a, b) => b.effectiveness_rating - a.effectiveness_rating)
        .slice(0, 5)
    : [];
    
  // Get frequently used strategies
  const frequentStrategies = strategies
    ? strategies
        .sort((a, b) => b.used_count - a.used_count)
        .slice(0, 5)
    : [];

  return {
    assessments,
    strategies,
    latestAssessment,
    effectiveStrategies,
    frequentStrategies,
    createAssessment,
    createStrategy,
    updateStrategyUsage,
    isLoading: isLoadingAssessments || isLoadingStrategies,
    error,
    isAuthenticated: !!user && !!session
  };
} 