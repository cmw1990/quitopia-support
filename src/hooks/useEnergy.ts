import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import * as api from '@/lib/api';
import { useAuth } from '@/components/AuthProvider';

export function useEnergyMetrics() {
  const { session } = useAuth();
  const userId = session?.user?.id;
  const queryClient = useQueryClient();

  const metrics = useQuery({
    queryKey: ['energyMetrics', userId],
    queryFn: () => api.getEnergyMetrics(userId!),
    enabled: !!userId,
  });

  const addMetric = useMutation({
    mutationFn: api.addEnergyMetric,
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['energyMetrics', userId] });
    },
  });

  return {
    metrics: metrics.data ?? [],
    isLoading: metrics.isLoading,
    error: metrics.error,
    addMetric: addMetric.mutate,
    isAdding: addMetric.isPending,
  };
}

export function useActivities() {
  const { session } = useAuth();
  const userId = session?.user?.id;
  const queryClient = useQueryClient();

  const activities = useQuery({
    queryKey: ['activities', userId],
    queryFn: () => api.getActivities(userId!),
    enabled: !!userId,
  });

  const addActivity = useMutation({
    mutationFn: api.addActivity,
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['activities', userId] });
    },
  });

  return {
    activities: activities.data ?? [],
    isLoading: activities.isLoading,
    error: activities.error,
    addActivity: addActivity.mutate,
    isAdding: addActivity.isPending,
  };
}

export function useRecipes(query?: string) {
  const recipes = useQuery({
    queryKey: ['recipes', query],
    queryFn: () => api.getRecipes(query),
  });

  return {
    recipes: recipes.data ?? [],
    isLoading: recipes.isLoading,
    error: recipes.error,
  };
}

export function useRecipe(id: string) {
  const recipe = useQuery({
    queryKey: ['recipe', id],
    queryFn: () => api.getRecipeById(id),
    enabled: !!id,
  });

  return {
    recipe: recipe.data,
    isLoading: recipe.isLoading,
    error: recipe.error,
  };
}

export function useEnergyTrends(days: number = 30) {
  const { session } = useAuth();
  const userId = session?.user?.id;

  const trends = useQuery({
    queryKey: ['energyTrends', userId, days],
    queryFn: () => api.getEnergyTrends(userId!, days),
    enabled: !!userId,
  });

  return {
    trends: trends.data ?? [],
    isLoading: trends.isLoading,
    error: trends.error,
  };
}

export function useConsultation() {
  const { session } = useAuth();
  const userId = session?.user?.id;
  const queryClient = useQueryClient();

  const requests = useQuery({
    queryKey: ['consultationRequests', userId],
    queryFn: () => api.getConsultationRequests(userId!),
    enabled: !!userId,
  });

  const requestConsultation = useMutation({
    mutationFn: api.requestConsultation,
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['consultationRequests', userId] });
    },
  });

  return {
    requests: requests.data ?? [],
    isLoading: requests.isLoading,
    error: requests.error,
    requestConsultation: requestConsultation.mutate,
    isRequesting: requestConsultation.isPending,
  };
}
