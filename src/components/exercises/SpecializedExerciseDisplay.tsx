import { useState, useEffect } from 'react';
import { motion } from 'framer-motion';
import { Card } from '@/components/ui/card';
import { Progress } from '@/components/ui/progress';
import { Timer, Activity, Heart } from 'lucide-react';

interface SpecializedExerciseDisplayProps {
  exerciseType: string;
  duration: number;
  sets: number;
  reps: number;
  holdDuration: number;
  restDuration: number;
  onComplete?: () => void;
}

export const SpecializedExerciseDisplay = ({
  exerciseType,
  duration,
  sets,
  reps,
  holdDuration,
  restDuration,
  onComplete
}: SpecializedExerciseDisplayProps) => {
  const [currentSet, setCurrentSet] = useState(1);
  const [currentRep, setCurrentRep] = useState(1);
  const [phase, setPhase] = useState<'prepare' | 'contract' | 'hold' | 'relax' | 'rest'>('prepare');
  const [timeLeft, setTimeLeft] = useState(3); // 3 second countdown to start

  useEffect(() => {
    const timer = setInterval(() => {
      setTimeLeft((prev) => {
        if (prev <= 1) {
          // Progress through exercise phases
          if (phase === 'prepare') {
            setPhase('contract');
            return 3; // Contract duration
          } else if (phase === 'contract') {
            setPhase('hold');
            return holdDuration;
          } else if (phase === 'hold') {
            setPhase('relax');
            return 3; // Relax duration
          } else if (phase === 'relax') {
            if (currentRep < reps) {
              setCurrentRep(prev => prev + 1);
              setPhase('rest');
              return restDuration;
            } else if (currentSet < sets) {
              setCurrentSet(prev => prev + 1);
              setCurrentRep(1);
              setPhase('rest');
              return restDuration;
            } else {
              onComplete?.();
              clearInterval(timer);
              return 0;
            }
          } else if (phase === 'rest') {
            setPhase('prepare');
            return 3;
          }
        }
        return prev - 1;
      });
    }, 1000);

    return () => clearInterval(timer);
  }, [phase, currentSet, currentRep, sets, reps, holdDuration, restDuration, onComplete]);

  const getPhaseColor = () => {
    switch (phase) {
      case 'prepare': return 'bg-blue-500';
      case 'contract': return 'bg-purple-500';
      case 'hold': return 'bg-green-500';
      case 'relax': return 'bg-yellow-500';
      case 'rest': return 'bg-gray-500';
      default: return 'bg-blue-500';
    }
  };

  const getAnimationProps = () => {
    switch (phase) {
      case 'contract':
        return {
          scale: [1, 0.8],
          transition: { duration: 1, ease: "easeInOut" }
        };
      case 'hold':
        return {
          scale: 0.8,
          transition: { duration: holdDuration }
        };
      case 'relax':
        return {
          scale: [0.8, 1],
          transition: { duration: 1, ease: "easeInOut" }
        };
      default:
        return {
          scale: 1,
          transition: { duration: 0.5 }
        };
    }
  };

  return (
    <Card className="p-6 space-y-4">
      <div className="flex justify-between items-center">
        <div className="flex items-center gap-2">
          <Activity className="h-5 w-5 text-primary" />
          <span className="font-medium">Set {currentSet}/{sets}</span>
        </div>
        <div className="flex items-center gap-2">
          <Heart className="h-5 w-5 text-rose-500" />
          <span className="font-medium">Rep {currentRep}/{reps}</span>
        </div>
        <div className="flex items-center gap-2">
          <Timer className="h-5 w-5 text-amber-500" />
          <span className="font-medium">{timeLeft}s</span>
        </div>
      </div>

      <div className="relative h-48 flex items-center justify-center">
        <motion.div
          className={`w-24 h-24 rounded-full ${getPhaseColor()}`}
          animate={getAnimationProps()}
        />
      </div>

      <div className="space-y-2">
        <div className="flex justify-between text-sm">
          <span className="font-medium">{phase.charAt(0).toUpperCase() + phase.slice(1)}</span>
          <span>{timeLeft}s</span>
        </div>
        <Progress value={(timeLeft / (phase === 'hold' ? holdDuration : 3)) * 100} />
      </div>
    </Card>
  );
};