import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import { api } from '@/lib/api/client';
import { useAuth } from './use-auth';
import { Activity } from '@/types';

export function useActivities() {
  const { session } = useAuth();
  const userId = session?.user?.id;
  const queryClient = useQueryClient();

  const { data: activities, isLoading, error } = useQuery({
    queryKey: ['activities', userId],
    queryFn: () => api.activities.list(userId!),
    enabled: !!userId,
  });

  const createActivity = useMutation({
    mutationFn: (data: Omit<Activity, 'id' | 'created_at' | 'updated_at'>) =>
      api.activities.create(data),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['activities', userId] });
    },
  });

  const updateActivity = useMutation({
    mutationFn: ({ id, data }: { id: string; data: Partial<Activity> }) =>
      api.activities.update(id, data),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['activities', userId] });
    },
  });

  const deleteActivity = useMutation({
    mutationFn: (id: string) => api.activities.delete(id),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['activities', userId] });
    },
  });

  return {
    activities: activities?.data || [],
    isLoading,
    error,
    createActivity: createActivity.mutate,
    updateActivity: updateActivity.mutate,
    deleteActivity: deleteActivity.mutate,
    isCreating: createActivity.isPending,
    isUpdating: updateActivity.isPending,
    isDeleting: deleteActivity.isPending,
  };
}
