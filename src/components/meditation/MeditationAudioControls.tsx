import { useState, useEffect } from 'react';
import { Slider } from "@/components/ui/slider";
import { Button } from "@/components/ui/button";
import { Volume2, VolumeX } from "lucide-react";
import { createMeditationAudio, stopMeditationAudio, updateMeditationVolume } from '@/utils/meditationAudio';

interface MeditationAudioControlsProps {
  sessionType: string;
  isPlaying: boolean;
}

export const MeditationAudioControls = ({ sessionType, isPlaying }: MeditationAudioControlsProps) => {
  const [volume, setVolume] = useState(0.5);
  const [isMuted, setIsMuted] = useState(false);
  const [audioState, setAudioState] = useState<ReturnType<typeof createMeditationAudio> | null>(null);

  useEffect(() => {
    if (isPlaying && !audioState) {
      const newAudioState = createMeditationAudio(sessionType as any, isMuted ? 0 : volume);
      setAudioState(newAudioState);
    } else if (!isPlaying && audioState) {
      stopMeditationAudio(audioState);
      setAudioState(null);
    }
    
    return () => {
      if (audioState) {
        stopMeditationAudio(audioState);
      }
    };
  }, [isPlaying, sessionType]);

  useEffect(() => {
    if (audioState) {
      updateMeditationVolume(audioState, isMuted ? 0 : volume);
    }
  }, [volume, isMuted]);

  const toggleMute = () => {
    setIsMuted(!isMuted);
    if (audioState) {
      updateMeditationVolume(audioState, !isMuted ? 0 : volume);
    }
  };

  return (
    <div className="flex items-center gap-4 p-4 bg-muted/50 rounded-lg">
      <Button
        variant="ghost"
        size="icon"
        onClick={toggleMute}
        className="text-muted-foreground hover:text-primary"
      >
        {isMuted ? <VolumeX className="h-5 w-5" /> : <Volume2 className="h-5 w-5" />}
      </Button>
      <Slider
        value={[volume * 100]}
        onValueChange={(value) => setVolume(value[0] / 100)}
        max={100}
        step={1}
        className="w-32"
      />
    </div>
  );
};