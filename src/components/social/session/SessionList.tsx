import { Card, CardContent } from "@/components/ui/card";
import { AnimatePresence } from "framer-motion";
import { SessionCard } from "./SessionCard";
import { GroupSession } from "../types";
import { Participant } from "../types";

interface SessionListProps {
  sessions: GroupSession[];
  participants: Record<string, Participant[]>;
  isUserJoined: (sessionId: string) => boolean;
  onJoin: (sessionId: string) => void;
}

export const SessionList = ({ sessions, participants, isUserJoined, onJoin }: SessionListProps) => {
  return (
    <CardContent>
      <AnimatePresence>
        <div className="space-y-4">
          {sessions?.length === 0 ? (
            <p className="text-center text-muted-foreground">No upcoming sessions found</p>
          ) : (
            sessions.map((session) => (
              <SessionCard
                key={session.id}
                session={session}
                participants={participants[session.id] || []}
                isUserJoined={isUserJoined(session.id)}
                onJoin={onJoin}
              />
            ))
          )}
        </div>
      </AnimatePresence>
    </CardContent>
  );
};