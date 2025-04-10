import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query";
import { supabase } from "@/integrations/supabase/supabase-client";
import { useToast } from "@/hooks/use-toast";
import { useAuth } from "@/components/AuthProvider";

export const useAchievements = () => {
  const { session } = useAuth();
  const { toast } = useToast();
  const queryClient = useQueryClient();

  const { data: achievements } = useQuery({
    queryKey: ['achievements'],
    queryFn: async () => {
      if (!session?.user?.id) return [];
      
      const { data, error } = await supabase
        .from('achievements')
        .select('*')
        .eq('user_id', session.user.id);

      if (error) throw error;
      return data;
    },
    enabled: !!session?.user?.id
  });

  const updateProgress = useMutation({
    mutationFn: async ({ achievementId, progress }: { achievementId: string, progress: number }) => {
      if (!session?.user?.id) return;

      const { data, error } = await supabase
        .from('achievement_progress')
        .upsert({
          user_id: session.user.id,
          achievement_id: achievementId,
          current_progress: progress
        })
        .select()
        .single();

      if (error) throw error;
      return data;
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['achievements'] });
    },
    onError: (error) => {
      toast({
        title: "Error updating achievement",
        description: error.message,
        variant: "destructive"
      });
    }
  });

  return {
    achievements,
    updateProgress
  };
};