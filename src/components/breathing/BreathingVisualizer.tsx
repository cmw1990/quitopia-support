import { useState, useEffect } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Slider } from '@/components/ui/slider';
import { Play, Pause, Wind, Volume2, VolumeX } from 'lucide-react';
import { generateNatureSound } from '@/utils/audio';

interface BreathPattern {
  inhale: number;
  hold: number;
  exhale: number;
  holdAfterExhale: number;
  name: string;
}

const BREATH_PATTERNS: BreathPattern[] = [
  { name: 'Relaxing Breath', inhale: 4, hold: 7, exhale: 8, holdAfterExhale: 0 },
  { name: 'Box Breathing', inhale: 4, hold: 4, exhale: 4, holdAfterExhale: 4 },
  { name: 'Energizing Breath', inhale: 6, hold: 2, exhale: 4, holdAfterExhale: 0 },
];

export const BreathingVisualizer = () => {
  const [isPlaying, setIsPlaying] = useState(false);
  const [currentPhase, setCurrentPhase] = useState<'inhale' | 'hold' | 'exhale' | 'holdAfterExhale'>('inhale');
  const [selectedPattern, setSelectedPattern] = useState<BreathPattern>(BREATH_PATTERNS[0]);
  const [volume, setVolume] = useState(0.5);
  const [isMuted, setIsMuted] = useState(false);
  const [ambientSound, setAmbientSound] = useState<ReturnType<typeof generateNatureSound> | null>(null);

  useEffect(() => {
    let timer: NodeJS.Timeout;
    
    if (isPlaying) {
      const runPhase = () => {
        setCurrentPhase(prev => {
          switch (prev) {
            case 'inhale':
              return 'hold';
            case 'hold':
              return 'exhale';
            case 'exhale':
              return selectedPattern.holdAfterExhale > 0 ? 'holdAfterExhale' : 'inhale';
            case 'holdAfterExhale':
              return 'inhale';
            default:
              return 'inhale';
          }
        });
      };

      const getCurrentPhaseDuration = () => {
        switch (currentPhase) {
          case 'inhale':
            return selectedPattern.inhale;
          case 'hold':
            return selectedPattern.hold;
          case 'exhale':
            return selectedPattern.exhale;
          case 'holdAfterExhale':
            return selectedPattern.holdAfterExhale;
        }
      };

      timer = setTimeout(runPhase, getCurrentPhaseDuration() * 1000);
    }

    return () => {
      if (timer) clearTimeout(timer);
    };
  }, [isPlaying, currentPhase, selectedPattern]);

  useEffect(() => {
    if (isPlaying && !ambientSound) {
      const sound = generateNatureSound('wind', isMuted ? 0 : volume);
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

  useEffect(() => {
    if (ambientSound) {
      ambientSound.setVolume(isMuted ? 0 : volume);
    }
  }, [volume, isMuted]);

  const togglePlay = () => {
    setIsPlaying(!isPlaying);
    if (isPlaying) {
      setCurrentPhase('inhale');
    }
  };

  const toggleMute = () => {
    setIsMuted(!isMuted);
  };

  return (
    <Card className="w-full max-w-xl mx-auto">
      <CardHeader>
        <CardTitle className="flex items-center gap-2">
          <Wind className="h-5 w-5 text-primary" />
          Breathing Exercise
        </CardTitle>
      </CardHeader>
      <CardContent className="space-y-6">
        <div className="flex justify-center">
          <AnimatePresence mode="wait">
            <motion.div
              key={currentPhase}
              initial={{ scale: currentPhase === 'inhale' ? 0.8 : 1.2 }}
              animate={{ 
                scale: currentPhase === 'inhale' ? 1.2 : 
                        currentPhase === 'exhale' ? 0.8 : 1
              }}
              transition={{ duration: currentPhase === 'hold' || currentPhase === 'holdAfterExhale' ? 0 : 
                          currentPhase === 'inhale' ? selectedPattern.inhale :
                          selectedPattern.exhale }}
              className="w-32 h-32 bg-primary/20 rounded-full flex items-center justify-center"
            >
              <motion.div
                className="text-primary text-lg font-medium"
              >
                {currentPhase === 'inhale' ? 'Breathe In' :
                 currentPhase === 'hold' ? 'Hold' :
                 currentPhase === 'exhale' ? 'Breathe Out' :
                 'Hold'}
              </motion.div>
            </motion.div>
          </AnimatePresence>
        </div>

        <div className="space-y-4">
          <div className="flex justify-center space-x-4">
            <Button onClick={togglePlay} size="lg">
              {isPlaying ? <Pause className="mr-2 h-4 w-4" /> : <Play className="mr-2 h-4 w-4" />}
              {isPlaying ? 'Pause' : 'Start'}
            </Button>
          </div>

          <div className="flex items-center space-x-4">
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

          <div className="grid grid-cols-3 gap-2">
            {BREATH_PATTERNS.map((pattern) => (
              <Button
                key={pattern.name}
                variant={selectedPattern.name === pattern.name ? "default" : "outline"}
                onClick={() => {
                  setSelectedPattern(pattern);
                  setCurrentPhase('inhale');
                }}
                className="w-full"
              >
                {pattern.name}
              </Button>
            ))}
          </div>
        </div>
      </CardContent>
    </Card>
  );
};