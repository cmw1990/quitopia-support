import { useToast } from "@/hooks/use-toast";
import { supabase } from "@/integrations/supabase/supabase-client";
import { useAuth } from "@/components/AuthProvider";

export const useSessionJoin = () => {
  const { toast } = useToast();
  const { session: authSession } = useAuth();

  const joinSession = async (sessionId: string) => {
    if (!authSession?.user) {
      toast({
        title: "Please sign in",
        description: "You need to be signed in to join a session",
        variant: "destructive",
      });
      return;
    }

    try {
      const { error } = await supabase
        .from('session_participants')
        .insert({
          session_id: sessionId,
          user_id: authSession.user.id,
          status: 'joined'
        });

      if (error) throw error;

      toast({
        title: "Successfully joined!",
        description: "You have joined the session",
      });

      // Trigger achievement
      await supabase
        .from('achievement_progress')
        .insert({
          user_id: authSession.user.id,
          achievement_id: 'first-group-session',
          current_progress: 1
        });

    } catch (error) {
      console.error('Error joining session:', error);
      toast({
        title: "Error joining session",
        description: "Please try again later",
        variant: "destructive",
      });
    }
  };

  return { joinSession };
};