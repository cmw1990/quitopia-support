import { useQuery } from "@tanstack/react-query";
import { supabase } from "@/integrations/supabase/supabase-client";
import { useAuth } from "@/components/AuthProvider";
import { GroupSession, Participant } from "../types";

export const useSessionList = () => {
  const { session: authSession } = useAuth();
  
  const { data: sessions, isLoading } = useQuery({
    queryKey: ['support-sessions'],
    queryFn: async () => {
      const { data, error } = await supabase
        .from('support_sessions')
        .select('*')
        .eq('is_private', false)
        .gte('session_date', new Date().toISOString())
        .order('session_date', { ascending: true });

      if (error) throw error;
      return data as GroupSession[];
    },
  });

  const { data: participants, refetch: refetchParticipants } = useQuery({
    queryKey: ['session-participants'],
    queryFn: async () => {
      const participantsMap: Record<string, Participant[]> = {};
      
      if (sessions) {
        for (const session of sessions) {
          const { data } = await supabase
            .from('session_participants')
            .select('*')
            .eq('session_id', session.id);
          
          participantsMap[session.id] = data || [];
        }
      }
      
      return participantsMap;
    },
    enabled: !!sessions?.length,
  });

  return {
    sessions,
    participants,
    isLoading,
    refetchParticipants
  };
};