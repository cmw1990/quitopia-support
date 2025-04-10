import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import { getFocusSettings, updateFocusSettings, FocusSettings } from '@/api/focusApi';

export function useFocusSettings() {
  const queryClient = useQueryClient();

  const { data: settings, isLoading, error } = useQuery({
    queryKey: ['focusSettings'],
    queryFn: getFocusSettings,
  });

  const updateSettingsMutation = useMutation({
    mutationFn: (updatedSettings: Partial<FocusSettings>) => 
      updateFocusSettings(updatedSettings),
    onSuccess: (newSettings) => {
      queryClient.setQueryData(['focusSettings'], newSettings);
    },
  });

  const updateSettings = (updatedSettings: Partial<FocusSettings>) => {
    updateSettingsMutation.mutate(updatedSettings);
  };

  return {
    settings,
    isLoading,
    error,
    updateSettings,
    isUpdating: updateSettingsMutation.isPending,
  };
} 