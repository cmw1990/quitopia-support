import { useEffect } from "react";
import { supabase } from "@/integrations/supabase/supabase-client";
import { useAuth } from "@/components/AuthProvider";
import { GroupSession } from "../types";

export const usePresenceTracking = (
  sessions: GroupSession[] | undefined,
  onParticipantChange: () => void
) => {
  const { session: authSession } = useAuth();

  useEffect(() => {
    if (!sessions || !authSession?.user) return;

    const channels = sessions.map(session => {
      const channel = supabase.channel(`session:${session.id}`);
      
      channel
        .on('presence', { event: 'sync' }, () => {
          const state = channel.presenceState();
          console.log('Presence state:', state);
          onParticipantChange();
        })
        .on('presence', { event: 'join' }, ({ key, newPresences }) => {
          console.log('User joined:', key, newPresences);
          onParticipantChange();
        })
        .on('presence', { event: 'leave' }, ({ key, leftPresences }) => {
          console.log('User left:', key, leftPresences);
          onParticipantChange();
        })
        .subscribe(async (status) => {
          if (status === 'SUBSCRIBED') {
            await channel.track({
              user_id: authSession.user.id,
              online_at: new Date().toISOString(),
            });
          }
        });

      return channel;
    });

    return () => {
      channels.forEach(channel => {
        supabase.removeChannel(channel);
      });
    };
  }, [sessions, authSession?.user, onParticipantChange]);
};