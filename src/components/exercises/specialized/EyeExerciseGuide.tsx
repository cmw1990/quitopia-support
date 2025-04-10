import { useState, useEffect, useRef } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Progress } from '@/components/ui/progress';
import { Badge } from '@/components/ui/badge';
import { ScrollArea } from '@/components/ui/scroll-area';
import { useToast } from '@/components/ui/use-toast';
import {
  Play,
  Pause,
  RotateCcw,
  Eye,
  Clock,
  ChevronRight,
  ChevronLeft,
  Info,
} from 'lucide-react';

interface EyeExercise {
  id: string;
  name: string;
  description: string;
  duration: number;
  animationUrl?: string;
  steps: {
    id: string;
    instruction: string;
    duration: number;
    animationUrl?: string;
  }[];
  benefits: string[];
  tips: string[];
}

interface EyeExerciseGuideProps {
  exercise: EyeExercise;
  onComplete?: () => void;
}

export default function EyeExerciseGuide({ exercise, onComplete }: EyeExerciseGuideProps) {
  const [isPlaying, setIsPlaying] = useState(false);
  const [currentStep, setCurrentStep] = useState(0);
  const [progress, setProgress] = useState(0);
  const [showInfo, setShowInfo] = useState(false);
  const intervalRef = useRef<NodeJS.Timeout>();
  const { toast } = useToast();

  useEffect(() => {
    return () => {
      if (intervalRef.current) {
        clearInterval(intervalRef.current);
      }
    };
  }, []);

  const startExercise = () => {
    setIsPlaying(true);
    if (intervalRef.current) {
      clearInterval(intervalRef.current);
    }

    intervalRef.current = setInterval(() => {
      setProgress((prev) => {
        const newProgress = prev + 1;
        if (newProgress >= exercise.steps[currentStep].duration) {
          if (currentStep === exercise.steps.length - 1) {
            clearInterval(intervalRef.current);
            setIsPlaying(false);
            if (onComplete) {
              onComplete();
            }
            toast({
              title: "Exercise Complete! 🎉",
              description: "Great job taking care of your eyes!",
            });
            return 0;
          } else {
            setCurrentStep((prev) => prev + 1);
            return 0;
          }
        }
        return newProgress;
      });
    }, 1000);
  };

  const pauseExercise = () => {
    setIsPlaying(false);
    if (intervalRef.current) {
      clearInterval(intervalRef.current);
    }
  };

  const resetExercise = () => {
    setCurrentStep(0);
    setProgress(0);
    setIsPlaying(false);
    if (intervalRef.current) {
      clearInterval(intervalRef.current);
    }
  };

  const nextStep = () => {
    if (currentStep < exercise.steps.length - 1) {
      setCurrentStep((prev) => prev + 1);
      setProgress(0);
    }
  };

  const previousStep = () => {
    if (currentStep > 0) {
      setCurrentStep((prev) => prev - 1);
      setProgress(0);
    }
  };

  return (
    <Card className="relative overflow-hidden">
      <CardHeader>
        <div className="flex items-center justify-between">
          <CardTitle className="flex items-center space-x-2">
            <Eye className="h-5 w-5" />
            <span>{exercise.name}</span>
          </CardTitle>
          <Button
            variant="ghost"
            size="icon"
            onClick={() => setShowInfo(!showInfo)}
          >
            <Info className="h-4 w-4" />
          </Button>
        </div>
      </CardHeader>

      <CardContent className="space-y-4">
        <AnimatePresence mode="wait">
          {showInfo ? (
            <motion.div
              key="info"
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              exit={{ opacity: 0, y: -20 }}
              className="space-y-4"
            >
              <div>
                <h4 className="font-medium mb-2">Benefits</h4>
                <ul className="list-disc list-inside space-y-1 text-sm text-muted-foreground">
                  {exercise.benefits.map((benefit, index) => (
                    <li key={index}>{benefit}</li>
                  ))}
                </ul>
              </div>
              <div>
                <h4 className="font-medium mb-2">Tips</h4>
                <ul className="list-disc list-inside space-y-1 text-sm text-muted-foreground">
                  {exercise.tips.map((tip, index) => (
                    <li key={index}>{tip}</li>
                  ))}
                </ul>
              </div>
            </motion.div>
          ) : (
            <motion.div
              key="exercise"
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              exit={{ opacity: 0, y: -20 }}
              className="space-y-4"
            >
              <div className="relative aspect-square rounded-lg overflow-hidden bg-black/5 dark:bg-white/5">
                {exercise.steps[currentStep].animationUrl ? (
                  <video
                    className="w-full h-full object-contain"
                    src={exercise.steps[currentStep].animationUrl}
                    loop
                    muted
                    autoPlay={isPlaying}
                    playsInline
                  />
                ) : (
                  <div className="absolute inset-0 flex items-center justify-center">
                    <Eye className="h-12 w-12 text-muted-foreground" />
                  </div>
                )}

                <div className="absolute bottom-0 left-0 right-0 p-4 bg-gradient-to-t from-black/50 to-transparent">
                  <p className="text-white text-sm">
                    {exercise.steps[currentStep].instruction}
                  </p>
                </div>
              </div>

              <div className="flex items-center justify-between">
                <div className="flex items-center space-x-2">
                  <Button
                    variant="ghost"
                    size="icon"
                    onClick={isPlaying ? pauseExercise : startExercise}
                  >
                    {isPlaying ? (
                      <Pause className="h-4 w-4" />
                    ) : (
                      <Play className="h-4 w-4" />
                    )}
                  </Button>
                  <Button
                    variant="ghost"
                    size="icon"
                    onClick={resetExercise}
                  >
                    <RotateCcw className="h-4 w-4" />
                  </Button>
                </div>

                <div className="flex items-center space-x-2">
                  <Button
                    variant="ghost"
                    size="icon"
                    onClick={previousStep}
                    disabled={currentStep === 0}
                  >
                    <ChevronLeft className="h-4 w-4" />
                  </Button>
                  <span className="text-sm">
                    Step {currentStep + 1} of {exercise.steps.length}
                  </span>
                  <Button
                    variant="ghost"
                    size="icon"
                    onClick={nextStep}
                    disabled={currentStep === exercise.steps.length - 1}
                  >
                    <ChevronRight className="h-4 w-4" />
                  </Button>
                </div>
              </div>

              <div className="space-y-2">
                <div className="flex items-center justify-between text-sm">
                  <Badge variant="secondary" className="bg-primary/10">
                    <Clock className="mr-1 h-3 w-3" />
                    {exercise.steps[currentStep].duration}s
                  </Badge>
                  <span className="text-muted-foreground">
                    {Math.round((progress / exercise.steps[currentStep].duration) * 100)}%
                  </span>
                </div>
                <Progress
                  value={(progress / exercise.steps[currentStep].duration) * 100}
                  className="h-1"
                />
              </div>
            </motion.div>
          )}
        </AnimatePresence>
      </CardContent>
    </Card>
  );
}
