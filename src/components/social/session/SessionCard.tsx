import { motion } from "framer-motion";
import { Button } from "@/components/ui/button";
import { Users, Clock, Calendar, UserPlus, CheckCircle } from "lucide-react";
import { GroupSession } from "../types";
import { Participant } from "../types";

interface SessionCardProps {
  session: GroupSession;
  participants: Participant[];
  isUserJoined: boolean;
  onJoin: (sessionId: string) => void;
}

export const SessionCard = ({ session, participants, isUserJoined, onJoin }: SessionCardProps) => {
  return (
    <motion.div
      initial={{ opacity: 0, y: 20 }}
      animate={{ opacity: 1, y: 0 }}
      exit={{ opacity: 0, y: -20 }}
      className="flex flex-col md:flex-row items-start md:items-center justify-between p-4 rounded-lg border bg-card hover:bg-accent/50 transition-colors"
    >
      <div className="space-y-1">
        <h3 className="font-medium">{session.title}</h3>
        <p className="text-sm text-muted-foreground">{session.description}</p>
        <div className="flex items-center gap-4 text-sm text-muted-foreground">
          <span className="flex items-center gap-1">
            <Calendar className="h-4 w-4" />
            {new Date(session.session_date).toLocaleDateString()}
          </span>
          <span className="flex items-center gap-1">
            <Clock className="h-4 w-4" />
            {session.duration_minutes} minutes
          </span>
          <span className="flex items-center gap-1">
            <Users className="h-4 w-4" />
            {participants.length}/{session.max_participants}
          </span>
        </div>
      </div>
      <Button
        onClick={() => onJoin(session.id)}
        className="mt-4 md:mt-0"
        disabled={isUserJoined}
      >
        {isUserJoined ? (
          <>
            <CheckCircle className="h-4 w-4 mr-2" />
            Joined
          </>
        ) : (
          <>
            <UserPlus className="h-4 w-4 mr-2" />
            Join Session
          </>
        )}
      </Button>
    </motion.div>
  );
};