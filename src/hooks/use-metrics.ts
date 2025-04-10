import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import { api } from '@/lib/api/client';
import { useAuth } from './use-auth';
import { EnergyMetric } from '@/types';

export function useMetrics(timeRange?: { from: string; to: string }) {
  const { session } = useAuth();
  const userId = session?.user?.id;
  const queryClient = useQueryClient();

  const { data: metrics, isLoading, error } = useQuery({
    queryKey: ['metrics', userId, timeRange],
    queryFn: () => api.metrics.getEnergyMetrics(userId!, timeRange),
    enabled: !!userId,
  });

  const createMetric = useMutation({
    mutationFn: (data: Omit<EnergyMetric, 'id' | 'created_at' | 'updated_at'>) =>
      api.metrics.createEnergyMetric(data),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['metrics', userId] });
    },
  });

  return {
    metrics: metrics?.data || [],
    isLoading,
    error,
    createMetric: createMetric.mutate,
    isCreating: createMetric.isPending,
  };
}
