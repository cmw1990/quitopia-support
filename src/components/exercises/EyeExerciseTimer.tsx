import { useEffect, useState } from "react";
import { Progress } from "@/components/ui/progress";
import { Button } from "@/components/ui/button";
import { Timer, X } from "lucide-react";

interface EyeExerciseTimerProps {
  duration: number;
  onComplete: () => void;
  onCancel: () => void;
}

export const EyeExerciseTimer = ({ duration, onComplete, onCancel }: EyeExerciseTimerProps) => {
  const [timeLeft, setTimeLeft] = useState(duration);
  const [isPaused, setIsPaused] = useState(false);

  useEffect(() => {
    if (isPaused) return;

    const timer = setInterval(() => {
      setTimeLeft((prev) => {
        if (prev <= 1) {
          clearInterval(timer);
          onComplete();
          return 0;
        }
        return prev - 1;
      });
    }, 1000);

    return () => clearInterval(timer);
  }, [isPaused, onComplete]);

  const progress = ((duration - timeLeft) / duration) * 100;

  return (
    <div className="space-y-4">
      <div className="flex items-center justify-between">
        <div className="flex items-center gap-2">
          <Timer className="h-4 w-4 text-primary animate-pulse" />
          <span className="font-medium">{timeLeft}s</span>
        </div>
        <Button variant="ghost" size="icon" onClick={onCancel}>
          <X className="h-4 w-4" />
        </Button>
      </div>
      <Progress value={progress} className="h-2" />
      <Button 
        variant="outline" 
        className="w-full"
        onClick={() => setIsPaused(!isPaused)}
      >
        {isPaused ? "Resume" : "Pause"}
      </Button>
    </div>
  );
};