import { useState, useEffect } from 'react';
import { Card } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Progress } from '@/components/ui/progress';
import { Wind, Timer, Activity } from 'lucide-react';
import { useToast } from '@/hooks/use-toast';

interface BreathingPattern {
  name: string;
  inhaleTime: number;
  holdTime: number;
  exhaleTime: number;
  repetitions: number;
  description: string;
}

const breathingPatterns: BreathingPattern[] = [
  {
    name: "Relaxation Breath",
    inhaleTime: 4,
    holdTime: 4,
    exhaleTime: 4,
    repetitions: 5,
    description: "Calming breath pattern for relaxation and muscle control"
  },
  {
    name: "Energy Boost",
    inhaleTime: 2,
    holdTime: 1,
    exhaleTime: 2,
    repetitions: 10,
    description: "Energizing breath pattern to increase vitality"
  },
  {
    name: "Deep Core Connection",
    inhaleTime: 5,
    holdTime: 5,
    exhaleTime: 5,
    repetitions: 3,
    description: "Deep breathing to enhance core-pelvic floor connection"
  },
  {
    name: "Recovery Pattern",
    inhaleTime: 3,
    holdTime: 2,
    exhaleTime: 4,
    repetitions: 8,
    description: "Gentle pattern for post-exercise recovery"
  }
];

export const BreathingPatternExercise = () => {
  const [activePattern, setActivePattern] = useState<BreathingPattern | null>(null);
  const [phase, setPhase] = useState<'inhale' | 'hold' | 'exhale'>('inhale');
  const [timeLeft, setTimeLeft] = useState(0);
  const [currentRep, setCurrentRep] = useState(1);
  const [isActive, setIsActive] = useState(false);
  const { toast } = useToast();

  useEffect(() => {
    let timer: NodeJS.Timeout;
    if (isActive && activePattern) {
      timer = setInterval(() => {
        setTimeLeft((prev) => {
          if (prev <= 1) {
            // Switch phase or move to next rep
            if (phase === 'inhale') {
              setPhase('hold');
              return activePattern.holdTime;
            } else if (phase === 'hold') {
              setPhase('exhale');
              return activePattern.exhaleTime;
            } else {
              if (currentRep < activePattern.repetitions) {
                setCurrentRep(prev => prev + 1);
                setPhase('inhale');
                return activePattern.inhaleTime;
              } else {
                setIsActive(false);
                toast({
                  title: "Exercise Complete!",
                  description: `You've completed the ${activePattern.name} breathing pattern!`
                });
                return 0;
              }
            }
          }
          return prev - 1;
        });
      }, 1000);
    }
    return () => clearInterval(timer);
  }, [isActive, activePattern, phase, currentRep, toast]);

  const startPattern = (pattern: BreathingPattern) => {
    setActivePattern(pattern);
    setPhase('inhale');
    setTimeLeft(pattern.inhaleTime);
    setCurrentRep(1);
    setIsActive(true);
  };

  return (
    <Card className="p-4 space-y-4">
      <div className="flex items-center gap-2 mb-4">
        <Wind className="h-5 w-5 text-primary" />
        <h3 className="font-semibold">Breathing Patterns</h3>
      </div>

      {!isActive ? (
        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
          {breathingPatterns.map((pattern) => (
            <Button
              key={pattern.name}
              variant="outline"
              className="p-4 h-auto flex flex-col items-start gap-2"
              onClick={() => startPattern(pattern)}
            >
              <span className="font-medium">{pattern.name}</span>
              <span className="text-sm text-muted-foreground">
                {pattern.description}
              </span>
            </Button>
          ))}
        </div>
      ) : (
        <div className="space-y-4">
          <div className="flex justify-between items-center">
            <div>
              <h4 className="font-medium">{activePattern?.name}</h4>
              <p className="text-sm text-muted-foreground">
                Rep {currentRep}/{activePattern?.repetitions}
              </p>
            </div>
            <div className="flex items-center gap-2">
              <Timer className="h-4 w-4" />
              <span>{timeLeft}s</span>
            </div>
          </div>

          <div className="space-y-2">
            <div className="flex justify-between text-sm">
              <span className="capitalize">{phase}</span>
              <span>{timeLeft}s</span>
            </div>
            <Progress 
              value={
                (timeLeft / 
                (phase === 'inhale' 
                  ? activePattern?.inhaleTime 
                  : phase === 'hold'
                  ? activePattern?.holdTime
                  : activePattern?.exhaleTime)) * 100
              } 
            />
          </div>

          <Button 
            variant="destructive" 
            className="w-full"
            onClick={() => setIsActive(false)}
          >
            Stop Exercise
          </Button>
        </div>
      )}
    </Card>
  );
};