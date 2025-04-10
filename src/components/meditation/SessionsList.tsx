import { Brain, Battery, Activity, Moon, Sun } from "lucide-react";
import { SessionCard } from "./SessionCard";

interface Session {
  id: string;
  title: string;
  description: string | null;
  duration_minutes: number;
  type: string;
}

interface SessionsListProps {
  sessions: Session[];
  activeSession: string | null;
  sessionProgress: number;
  generatingImageId: string | null;
  onStartSession: (sessionId: string) => void;
  onEndSession: () => void;
  onGenerateBackground: (sessionId: string) => void;
}

export const SessionsList = ({
  sessions,
  activeSession,
  sessionProgress,
  generatingImageId,
  onStartSession,
  onEndSession,
  onGenerateBackground
}: SessionsListProps) => {
  const getSessionIcon = (type: string) => {
    switch (type) {
      case 'energy':
        return <Battery className="h-5 w-5 text-yellow-500" />;
      case 'focus':
        return <Brain className="h-5 w-5 text-blue-500" />;
      case 'stress-relief':
        return <Activity className="h-5 w-5 text-emerald-500" />;
      case 'sleep':
        return <Moon className="h-5 w-5 text-purple-500" />;
      case 'mindfulness':
        return <Sun className="h-5 w-5 text-orange-500" />;
      default:
        return <Brain className="h-5 w-5 text-primary" />;
    }
  };

  return (
    <div className="space-y-4">
      {sessions.map((session) => (
        <div key={session.id} className="flex items-start gap-3">
          {getSessionIcon(session.type)}
          <div className="flex-1">
            <SessionCard
              session={session}
              isActive={activeSession === session.id}
              sessionProgress={sessionProgress}
              onStart={() => onStartSession(session.id)}
              onEnd={onEndSession}
              onGenerateBackground={() => onGenerateBackground(session.id)}
              isGeneratingBackground={generatingImageId === session.id}
            />
          </div>
        </div>
      ))}
    </div>
  );
};