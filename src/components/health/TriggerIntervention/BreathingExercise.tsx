import React, { useState, useEffect } from 'react';
import { Card, CardContent } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Slider } from '@/components/ui/slider';
import { Progress } from '@/components/ui/progress';
import { AlertCircle, Play, Pause, Volume2, VolumeX } from 'lucide-react';
import { Alert, AlertDescription } from '@/components/ui/alert';
import { 
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from '@/components/ui/select';

interface BreathingExerciseProps {
  onComplete: (newIntensity: number) => void;
}

// Breathing patterns
const breathingPatterns = [
  {
    id: 'relaxing',
    name: 'Relaxing Breath',
    description: 'Slow, deep breathing to calm the body and mind',
    inhaleDuration: 4,
    holdDuration: 4,
    exhaleDuration: 6,
    pauseDuration: 2,
    color: 'bg-blue-500'
  },
  {
    id: 'energizing',
    name: 'Energizing Breath',
    description: 'Quick, stimulating breaths to increase alertness',
    inhaleDuration: 2,
    holdDuration: 0,
    exhaleDuration: 2,
    pauseDuration: 0,
    color: 'bg-yellow-500'
  },
  {
    id: 'balancing',
    name: 'Balancing Breath',
    description: 'Alternate nostril breathing to balance the nervous system',
    inhaleDuration: 4,
    holdDuration: 2,
    exhaleDuration: 4,
    pauseDuration: 2,
    color: 'bg-green-500'
  },
  {
    id: 'calming',
    name: '4-7-8 Breath',
    description: 'Powerful relaxation technique to reduce anxiety',
    inhaleDuration: 4,
    holdDuration: 7,
    exhaleDuration: 8,
    pauseDuration: 1,
    color: 'bg-purple-500'
  }
];

export const BreathingExercise: React.FC<BreathingExerciseProps> = ({ onComplete }) => {
  const [selectedPattern, setSelectedPattern] = useState(breathingPatterns[0]);
  const [isRunning, setIsRunning] = useState(false);
  const [phase, setPhase] = useState('ready');
  const [progress, setProgress] = useState(0);
  const [cycles, setCycles] = useState(0);
  const [audio, setAudio] = useState<HTMLAudioElement | null>(null);
  const [audioEnabled, setAudioEnabled] = useState(true);
  const [currentIntensity, setCurrentIntensity] = useState(5);
  const [exerciseCompleted, setExerciseCompleted] = useState(false);
  
  // Initialize audio
  useEffect(() => {
    const audioElement = new Audio('/assets/sounds/soft-chime.mp3');
    audioElement.load();
    setAudio(audioElement);
    
    return () => {
      if (audioElement) {
        audioElement.pause();
      }
    };
  }, []);
  
  // Handle breathing cycle
  useEffect(() => {
    if (!isRunning) return;
    
    let timeout: NodeJS.Timeout;
    let phaseDuration = 1000;
    
    if (phase === 'inhale') {
      phaseDuration = selectedPattern.inhaleDuration * 1000;
      if (audioEnabled && audio) {
        audio.currentTime = 0;
        audio.play().catch(e => console.error('Error playing audio:', e));
      }
    } else if (phase === 'hold') {
      phaseDuration = selectedPattern.holdDuration * 1000;
    } else if (phase === 'exhale') {
      phaseDuration = selectedPattern.exhaleDuration * 1000;
    } else if (phase === 'pause') {
      phaseDuration = selectedPattern.pauseDuration * 1000;
    }
    
    const interval = 100;
    let elapsed = 0;
    
    const tick = () => {
      elapsed += interval;
      setProgress((elapsed / phaseDuration) * 100);
      
      if (elapsed >= phaseDuration) {
        moveToNextPhase();
      } else {
        timeout = setTimeout(tick, interval);
      }
    };
    
    timeout = setTimeout(tick, interval);
    
    return () => clearTimeout(timeout);
  }, [isRunning, phase, selectedPattern, audio, audioEnabled]);
  
  const toggleExercise = () => {
    if (!isRunning) {
      setIsRunning(true);
      setPhase('inhale');
      setProgress(0);
    } else {
      setIsRunning(false);
    }
  };
  
  const moveToNextPhase = () => {
    setProgress(0);
    
    if (phase === 'inhale') {
      if (selectedPattern.holdDuration > 0) {
        setPhase('hold');
      } else {
        setPhase('exhale');
      }
    } else if (phase === 'hold') {
      setPhase('exhale');
    } else if (phase === 'exhale') {
      if (selectedPattern.pauseDuration > 0) {
        setPhase('pause');
      } else {
        setPhase('inhale');
        incrementCycle();
      }
    } else if (phase === 'pause') {
      setPhase('inhale');
      incrementCycle();
    }
  };
  
  const incrementCycle = () => {
    const newCycles = cycles + 1;
    setCycles(newCycles);
    
    // After 3 cycles, prompt for rating
    if (newCycles >= 3 && !exerciseCompleted) {
      setIsRunning(false);
      setExerciseCompleted(true);
    }
  };
  
  const handleSelectPattern = (id: string) => {
    const pattern = breathingPatterns.find(p => p.id === id);
    if (pattern) {
      setSelectedPattern(pattern);
      setIsRunning(false);
      setPhase('ready');
      setProgress(0);
    }
  };
  
  const completeExercise = () => {
    onComplete(currentIntensity);
  };
  
  return (
    <div className="space-y-4">
      {!exerciseCompleted && (
        <>
          <Alert>
            <AlertCircle className="h-4 w-4" />
            <AlertDescription>
              Deep breathing activates your parasympathetic nervous system, reducing stress hormones and craving intensity.
            </AlertDescription>
          </Alert>
          
          <div className="space-y-4">
            <div className="flex justify-between items-center">
              <h3 className="font-medium">Choose a breathing pattern</h3>
              <Button
                variant="ghost"
                size="sm"
                onClick={() => setAudioEnabled(!audioEnabled)}
              >
                {audioEnabled ? (
                  <Volume2 className="h-4 w-4" />
                ) : (
                  <VolumeX className="h-4 w-4" />
                )}
              </Button>
            </div>
            
            <Select
              value={selectedPattern.id}
              onValueChange={handleSelectPattern}
            >
              <SelectTrigger className="w-full">
                <SelectValue placeholder="Select breathing pattern" />
              </SelectTrigger>
              <SelectContent>
                {breathingPatterns.map((pattern) => (
                  <SelectItem key={pattern.id} value={pattern.id}>
                    {pattern.name}
                  </SelectItem>
                ))}
              </SelectContent>
            </Select>
            
            <p className="text-sm text-muted-foreground">
              {selectedPattern.description}
            </p>
            
            <div className="flex flex-col items-center mt-4">
              <div className="relative w-32 h-32 rounded-full border-2 border-primary flex items-center justify-center mb-2">
                <div
                  className={`absolute inset-2 rounded-full transition-all duration-300 ${
                    phase === 'inhale'
                      ? 'scale-50 opacity-80'
                      : phase === 'hold'
                      ? 'scale-90 opacity-60'
                      : phase === 'exhale'
                      ? 'scale-25 opacity-40'
                      : 'scale-10 opacity-20'
                  } ${selectedPattern.color} bg-opacity-30`}
                ></div>
                <span className="text-lg font-medium z-10 capitalize">
                  {phase === 'ready' ? 'Ready' : phase}
                </span>
              </div>
              
              <Progress 
                value={progress} 
                className="w-32 h-1 mb-4" 
              />
              
              <div className="flex space-x-2">
                <Button onClick={toggleExercise}>
                  {isRunning ? (
                    <>
                      <Pause className="mr-1 h-4 w-4" /> Pause
                    </>
                  ) : (
                    <>
                      <Play className="mr-1 h-4 w-4" /> {cycles > 0 ? 'Resume' : 'Start'}
                    </>
                  )}
                </Button>
              </div>
              
              {cycles > 0 && (
                <div className="mt-2 text-sm text-muted-foreground">
                  Completed {cycles} {cycles === 1 ? 'cycle' : 'cycles'}
                </div>
              )}
            </div>
          </div>
        </>
      )}
      
      {exerciseCompleted && (
        <div className="space-y-4">
          <h3 className="font-medium">How intense is your craving now?</h3>
          
          <div className="space-y-2">
            <div className="flex justify-between">
              <span className="text-sm">1 (Very Mild)</span>
              <span className="text-sm">10 (Very Intense)</span>
            </div>
            <Slider
              min={1}
              max={10}
              step={1}
              value={[currentIntensity]}
              onValueChange={(val) => setCurrentIntensity(val[0])}
            />
          </div>
          
          <Button onClick={completeExercise} className="w-full">
            Complete & Continue
          </Button>
        </div>
      )}
    </div>
  );
}; 