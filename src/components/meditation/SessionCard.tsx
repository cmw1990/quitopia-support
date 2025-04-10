import { useState } from "react";
import { Button } from "@/components/ui/button";
import { Progress } from "@/components/ui/progress";
import { Clock, Image } from "lucide-react";
import { MeditationAudioControls } from "./MeditationAudioControls";

interface SessionCardProps {
  session: {
    id: string;
    title: string;
    description: string | null;
    duration_minutes: number;
    type: string;
  };
  isActive: boolean;
  sessionProgress: number;
  onStart: () => void;
  onEnd: () => void;
  onGenerateBackground: () => void;
  isGeneratingBackground: boolean;
}

export const SessionCard = ({
  session,
  isActive,
  sessionProgress,
  onStart,
  onEnd,
  onGenerateBackground,
  isGeneratingBackground
}: SessionCardProps) => {
  return (
    <div className="space-y-4 p-4 rounded-lg bg-muted/50 hover:bg-muted/70 transition-colors">
      <div className="flex items-start justify-between">
        <div>
          <h4 className="font-medium">{session.title}</h4>
          <p className="text-sm text-muted-foreground">{session.description}</p>
          <div className="flex items-center gap-2 mt-2 text-sm text-muted-foreground">
            <Clock className="h-4 w-4" />
            {session.duration_minutes} minutes
            {isActive && (
              <span className="text-primary">
                ({sessionProgress} min completed)
              </span>
            )}
          </div>
        </div>
        <div className="flex gap-2">
          <Button
            variant="outline"
            size="sm"
            onClick={onGenerateBackground}
            disabled={isGeneratingBackground}
          >
            {isGeneratingBackground ? (
              <div className="h-4 w-4 animate-spin rounded-full border-2 border-primary border-t-transparent" />
            ) : (
              <Image className="h-4 w-4" />
            )}
          </Button>
          <Button 
            variant={isActive ? "default" : "secondary"}
            size="sm"
            onClick={isActive ? onEnd : onStart}
          >
            {isActive ? 'End Session' : 'Start'}
          </Button>
        </div>
      </div>
      
      {isActive && (
        <div className="space-y-4">
          <Progress 
            value={(sessionProgress / session.duration_minutes) * 100}
            className="h-2"
          />
          <MeditationAudioControls
            sessionType={session.type}
            isPlaying={isActive}
          />
        </div>
      )}
    </div>
  );
};