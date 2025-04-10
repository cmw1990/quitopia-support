import React, { useState, useEffect } from 'react';
import { Card } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { useToast } from '@/hooks/use-toast';
import { BreathingTechniques, type BreathingTechnique } from '@/components/breathing/BreathingTechniques';
import PufferfishScene3D from './scenes/PufferfishScene3D';
import { Loader2 } from 'lucide-react';
import { generateNatureSound } from '@/utils/audio';

const BreathingGame = () => {
  const [isPlaying, setIsPlaying] = useState(false);
  const [isLoading, setIsLoading] = useState(false);
  const [breathPhase, setBreathPhase] = useState<'inhale' | 'hold' | 'exhale' | 'rest'>('rest');
  const [selectedTechnique, setSelectedTechnique] = useState<BreathingTechnique | null>(null);
  const [ambientSound, setAmbientSound] = useState<ReturnType<typeof generateNatureSound> | null>(null);
  const { toast } = useToast();

  useEffect(() => {
    if (!isPlaying) return;

    let timer: NodeJS.Timeout;
    const runBreathingCycle = () => {
      if (!selectedTechnique) return;

      const { pattern } = selectedTechnique;
      const cycle = [
        { phase: 'inhale', duration: pattern.inhale * 1000 },
        { phase: 'hold', duration: (pattern.hold || 0) * 1000 },
        { phase: 'exhale', duration: pattern.exhale * 1000 },
        { phase: 'rest', duration: (pattern.holdAfterExhale || 0) * 1000 }
      ];

      let currentPhaseIndex = 0;
      const nextPhase = () => {
        if (!isPlaying) return;
        
        setBreathPhase(cycle[currentPhaseIndex].phase as 'inhale' | 'hold' | 'exhale' | 'rest');
        timer = setTimeout(() => {
          currentPhaseIndex = (currentPhaseIndex + 1) % cycle.length;
          nextPhase();
        }, cycle[currentPhaseIndex].duration);
      };

      nextPhase();
    };

    runBreathingCycle();

    return () => {
      if (timer) clearTimeout(timer);
    };
  }, [isPlaying, selectedTechnique]);

  useEffect(() => {
    if (isPlaying && !ambientSound) {
      const sound = generateNatureSound('ocean', 0.3);
      setAmbientSound(sound);
    } else if (!isPlaying && ambientSound) {
      ambientSound.stop();
      setAmbientSound(null);
    }

    return () => {
      if (ambientSound) {
        ambientSound.stop();
      }
    };
  }, [isPlaying]);

  const handleStartStop = async () => {
    if (!selectedTechnique) {
      toast({
        title: "Please select a breathing technique",
        description: "Choose a breathing technique before starting the game",
        variant: "destructive",
      });
      return;
    }

    setIsLoading(true);
    try {
      setIsPlaying(!isPlaying);
      if (isPlaying) {
        setBreathPhase('rest');
      }
    } catch (error) {
      console.error('Error starting game:', error);
      toast({
        title: "Error Starting Game",
        description: "There was a problem starting the game. Please try again.",
        variant: "destructive",
      });
    } finally {
      setIsLoading(false);
    }
  };

  return (
    <Card className="p-6">
      <div className="flex flex-col items-center gap-4">
        {!isPlaying && (
          <BreathingTechniques
            onSelectTechnique={setSelectedTechnique}
            className="mb-4"
          />
        )}
        
        <div className="w-full max-w-3xl">
          <PufferfishScene3D breathPhase={breathPhase} />
        </div>
        
        {!isPlaying ? (
          <Button 
            onClick={handleStartStop}
            className="w-40"
            disabled={isLoading}
          >
            {isLoading ? (
              <Loader2 className="h-4 w-4 animate-spin" />
            ) : (
              'Start Game'
            )}
          </Button>
        ) : (
          <Button 
            onClick={handleStartStop}
            className="w-40"
            variant="secondary"
          >
            Stop Game
          </Button>
        )}
      </div>
    </Card>
  );
};

export default BreathingGame;