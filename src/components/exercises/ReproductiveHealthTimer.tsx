import { useState, useEffect } from 'react';
import { Card } from '@/components/ui/card';
import { Progress } from '@/components/ui/progress';
import { Timer, Activity } from 'lucide-react';

interface ReproductiveHealthTimerProps {
  exerciseType: string;
  duration: number;
  holdDuration: number;
  restDuration: number;
  onComplete: () => void;
}

export const ReproductiveHealthTimer = ({
  exerciseType,
  duration,
  holdDuration,
  restDuration,
  onComplete
}: ReproductiveHealthTimerProps) => {
  const [phase, setPhase] = useState<'prepare' | 'contract' | 'hold' | 'rest'>('prepare');
  const [timeLeft, setTimeLeft] = useState(3);
  const [progress, setProgress] = useState(0);

  useEffect(() => {
    const timer = setInterval(() => {
      setTimeLeft((prev) => {
        if (prev <= 1) {
          switch (phase) {
            case 'prepare':
              setPhase('contract');
              return 2;
            case 'contract':
              setPhase('hold');
              return holdDuration;
            case 'hold':
              setPhase('rest');
              return restDuration;
            case 'rest':
              onComplete();
              clearInterval(timer);
              return 0;
            default:
              return prev;
          }
        }
        return prev - 1;
      });

      setProgress((prev) => {
        const total = duration;
        const increment = (100 / total);
        return Math.min(prev + increment, 100);
      });
    }, 1000);

    return () => clearInterval(timer);
  }, [phase, duration, holdDuration, restDuration, onComplete]);

  const getPhaseColor = () => {
    switch (phase) {
      case 'prepare': return 'bg-blue-500';
      case 'contract': return 'bg-purple-500';
      case 'hold': return 'bg-green-500';
      case 'rest': return 'bg-yellow-500';
      default: return 'bg-blue-500';
    }
  };

  return (
    <Card className="p-4 space-y-4">
      <div className="flex justify-between items-center">
        <div className="flex items-center gap-2">
          <Activity className="h-5 w-5 text-primary" />
          <span className="font-medium capitalize">{phase} Phase</span>
        </div>
        <div className="flex items-center gap-2">
          <Timer className="h-5 w-5 text-amber-500" />
          <span className="font-medium">{timeLeft}s</span>
        </div>
      </div>

      <div className="space-y-2">
        <Progress 
          value={progress} 
          className={`h-2 ${getPhaseColor()}`}
        />
        <p className="text-sm text-muted-foreground text-center">
          {progress.toFixed(0)}% Complete
        </p>
      </div>
    </Card>
  );
};