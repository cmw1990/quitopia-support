import { useEffect } from 'react';
import { useQueryClient } from '@tanstack/react-query';
import { supabase } from '@/integrations/supabase/supabase-client';
import type { MentalHealthLog } from '@/lib/mental-health-db';

export function useMentalHealthRealtime() {
  const queryClient = useQueryClient();

  useEffect(() => {
    // Subscribe to mental health logs changes
    const mentalHealthSubscription = supabase
      .channel('mental_health_changes')
      .on(
        'postgres_changes',
        {
          event: '*',
          schema: 'public',
          table: 'mental_health_logs'
        },
        (payload) => {
          // Invalidate and refetch queries when data changes
          queryClient.invalidateQueries(['mental-health-logs']);
          queryClient.invalidateQueries(['mental-health-summary']);
        }
      )
      .subscribe();

    // Subscribe to anxiety logs changes
    const anxietySubscription = supabase
      .channel('anxiety_changes')
      .on(
        'postgres_changes',
        {
          event: '*',
          schema: 'public',
          table: 'anxiety_logs'
        },
        (payload) => {
          queryClient.invalidateQueries(['mental-health-logs', 'anxiety']);
        }
      )
      .subscribe();

    // Subscribe to mood logs changes
    const moodSubscription = supabase
      .channel('mood_changes')
      .on(
        'postgres_changes',
        {
          event: '*',
          schema: 'public',
          table: 'mood_logs'
        },
        (payload) => {
          queryClient.invalidateQueries(['mental-health-logs', 'mood']);
        }
      )
      .subscribe();

    // Subscribe to depression logs changes
    const depressionSubscription = supabase
      .channel('depression_changes')
      .on(
        'postgres_changes',
        {
          event: '*',
          schema: 'public',
          table: 'depression_logs'
        },
        (payload) => {
          queryClient.invalidateQueries(['mental-health-logs', 'depression']);
        }
      )
      .subscribe();

    // Cleanup subscriptions
    return () => {
      mentalHealthSubscription.unsubscribe();
      anxietySubscription.unsubscribe();
      moodSubscription.unsubscribe();
      depressionSubscription.unsubscribe();
    };
  }, [queryClient]);
}
