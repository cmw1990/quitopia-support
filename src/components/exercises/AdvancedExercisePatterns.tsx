import { useState, useEffect } from 'react';
import { Card } from '@/components/ui/card';
import { Progress } from '@/components/ui/progress';
import { Button } from '@/components/ui/button';
import { Activity, Timer } from 'lucide-react';
import { useToast } from '@/hooks/use-toast';

interface ExercisePattern {
  name: string;
  contractionDuration: number;
  relaxationDuration: number;
  repetitions: number;
  sets: number;
}

const patterns: ExercisePattern[] = [
  {
    name: "Quick Flicks",
    contractionDuration: 1,
    relaxationDuration: 1,
    repetitions: 10,
    sets: 3
  },
  {
    name: "Endurance Hold",
    contractionDuration: 10,
    relaxationDuration: 10,
    repetitions: 5,
    sets: 2
  },
  {
    name: "Pyramid",
    contractionDuration: 5,
    relaxationDuration: 5,
    repetitions: 8,
    sets: 2
  },
  {
    name: "Wave Pattern",
    contractionDuration: 3,
    relaxationDuration: 2,
    repetitions: 12,
    sets: 3
  }
];

export const AdvancedExercisePatterns = () => {
  const [currentPattern, setCurrentPattern] = useState<ExercisePattern | null>(null);
  const [isActive, setIsActive] = useState(false);
  const [currentSet, setCurrentSet] = useState(1);
  const [currentRep, setCurrentRep] = useState(1);
  const [phase, setPhase] = useState<'contract' | 'relax'>('contract');
  const [timeLeft, setTimeLeft] = useState(0);
  const { toast } = useToast();

  useEffect(() => {
    let timer: NodeJS.Timeout;
    if (isActive && currentPattern) {
      timer = setInterval(() => {
        setTimeLeft((prev) => {
          if (prev <= 1) {
            // Switch phase or move to next rep/set
            if (phase === 'contract') {
              setPhase('relax');
              return currentPattern.relaxationDuration;
            } else {
              if (currentRep < currentPattern.repetitions) {
                setCurrentRep(prev => prev + 1);
                setPhase('contract');
                return currentPattern.contractionDuration;
              } else if (currentSet < currentPattern.sets) {
                setCurrentSet(prev => prev + 1);
                setCurrentRep(1);
                setPhase('contract');
                return currentPattern.contractionDuration;
              } else {
                setIsActive(false);
                toast({
                  title: "Exercise Complete!",
                  description: `You've completed the ${currentPattern.name} pattern!`
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
  }, [isActive, currentPattern, phase, currentRep, currentSet, toast]);

  const startPattern = (pattern: ExercisePattern) => {
    setCurrentPattern(pattern);
    setCurrentSet(1);
    setCurrentRep(1);
    setPhase('contract');
    setTimeLeft(pattern.contractionDuration);
    setIsActive(true);
  };

  return (
    <Card className="p-4 space-y-4">
      <div className="flex items-center gap-2 mb-4">
        <Activity className="h-5 w-5 text-primary" />
        <h3 className="font-semibold">Advanced Exercise Patterns</h3>
      </div>

      {!isActive ? (
        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
          {patterns.map((pattern) => (
            <Button
              key={pattern.name}
              variant="outline"
              className="p-4 h-auto flex flex-col items-start gap-2"
              onClick={() => startPattern(pattern)}
            >
              <span className="font-medium">{pattern.name}</span>
              <span className="text-sm text-muted-foreground">
                {pattern.sets} sets × {pattern.repetitions} reps
              </span>
            </Button>
          ))}
        </div>
      ) : (
        <div className="space-y-4">
          <div className="flex justify-between items-center">
            <div>
              <h4 className="font-medium">{currentPattern?.name}</h4>
              <p className="text-sm text-muted-foreground">
                Set {currentSet}/{currentPattern?.sets} • Rep {currentRep}/{currentPattern?.repetitions}
              </p>
            </div>
            <div className="flex items-center gap-2">
              <Timer className="h-4 w-4" />
              <span>{timeLeft}s</span>
            </div>
          </div>

          <div className="space-y-2">
            <div className="flex justify-between text-sm">
              <span>{phase === 'contract' ? 'Contract' : 'Relax'}</span>
              <span>{timeLeft}s</span>
            </div>
            <Progress 
              value={
                (timeLeft / 
                (phase === 'contract' 
                  ? currentPattern?.contractionDuration 
                  : currentPattern?.relaxationDuration)) * 100
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