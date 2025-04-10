import { useEffect } from "react";
import { useAuth } from "@/components/AuthProvider";
import { supabase } from "@/integrations/supabase/supabase-client";
import { useToast } from "@/hooks/use-toast";

export const useAchievementTriggers = () => {
  const { session } = useAuth();
  const { toast } = useToast();

  useEffect(() => {
    if (!session?.user) return;

    const channel = supabase
      .channel('achievement-updates')
      .on(
        'postgres_changes',
        {
          event: 'INSERT',
          schema: 'public',
          table: 'achievement_progress',
          filter: `user_id=eq.${session.user.id}`
        },
        (payload) => {
          toast({
            title: "Achievement Progress!",
            description: "You're making progress on an achievement!",
          });
        }
      )
      .subscribe();

    return () => {
      supabase.removeChannel(channel);
    };
  }, [session?.user, toast]);
};