import { Card } from "@/components/ui/card";
import { useAuth } from "@/components/AuthProvider";
import { SessionHeader } from "./session/SessionHeader";
import { SessionList } from "./session/SessionList";
import { useSessionJoin } from "./hooks/useSessionJoin";
import { useSessionList } from "./hooks/useSessionList";
import { usePresenceTracking } from "./hooks/usePresenceTracking";

export const GroupSession = () => {
  const { session: authSession } = useAuth();
  const { sessions, participants, isLoading, refetchParticipants } = useSessionList();
  const { joinSession } = useSessionJoin();
  
  usePresenceTracking(sessions, refetchParticipants);

  const isUserJoined = (sessionId: string) => {
    return participants?.[sessionId]?.some(p => p.user_id === authSession?.user?.id) || false;
  };

  if (isLoading) {
    return (
      <Card className="w-full animate-pulse">
        <SessionHeader />
      </Card>
    );
  }

  return (
    <Card className="w-full">
      <SessionHeader />
      <SessionList
        sessions={sessions || []}
        participants={participants || {}}
        isUserJoined={isUserJoined}
        onJoin={joinSession}
      />
    </Card>
  );
};