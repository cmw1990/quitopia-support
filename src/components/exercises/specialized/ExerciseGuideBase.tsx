import React, { useState, useEffect, useRef } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Progress } from '@/components/ui/progress';
import { Badge } from '@/components/ui/badge';
import { ScrollArea } from '@/components/ui/scroll-area';
import { useToast } from '@/components/ui/use-toast';
import {
  Play, Pause, RotateCcw, Info,
  ChevronRight, ChevronLeft, Timer,
  Maximize2, Minimize2, Volume2, VolumeX
} from 'lucide-react';
import { cn } from '@/lib/utils';

export interface ExerciseStep {
  id: string;
  instruction: string;
  duration: number;
  animationUrl?: string;
  imageUrl?: string;
  audioUrl?: string;
  videoUrl?: string;
  tips?: string[];
}

export interface Exercise {
  id: string;
  name: string;
  description: string;
  category: string;
  difficulty: 'beginner' | 'intermediate' | 'advanced';
  duration: number;
  equipmentNeeded: string[];
  spaceRequired: string;
  benefits: string[];
  precautions: string[];
  steps: ExerciseStep[];
  cooldown?: ExerciseStep[];
  warmup?: ExerciseStep[];
  variations?: {
    name: string;
    description: string;
    difficulty: string;
  }[];
}

interface ExerciseGuideBaseProps {
  exercise: Exercise;
  onComplete?: () => void;
  onProgress?: (progress: number) => void;
  className?: string;
}

export default function ExerciseGuideBase({
  exercise,
  onComplete,
  onProgress,
  className
}: ExerciseGuideBaseProps) {
  const [phase, setPhase] = useState<'warmup' | 'main' | 'cooldown'>('warmup');
  const [currentStepIndex, setCurrentStepIndex] = useState(0);
  const [isPlaying, setIsPlaying] = useState(false);
  const [progress, setProgress] = useState(0);
  const [showInfo, setShowInfo] = useState(false);
  const [isMuted, setIsMuted] = useState(false);
  const [isFullscreen, setIsFullscreen] = useState(false);
  
  const intervalRef = useRef<NodeJS.Timeout>();
  const videoRef = useRef<HTMLVideoElement>(null);
  const audioRef = useRef<HTMLAudioElement>(null);
  const containerRef = useRef<HTMLDivElement>(null);
  
  const { toast } = useToast();

  const currentSteps = phase === 'warmup' ? exercise.warmup 
    : phase === 'cooldown' ? exercise.cooldown 
    : exercise.steps;

  const currentStep = currentSteps?.[currentStepIndex];

  useEffect(() => {
    return () => {
      if (intervalRef.current) {
        clearInterval(intervalRef.current);
      }
    };
  }, []);

  useEffect(() => {
    if (isPlaying && videoRef.current) {
      videoRef.current.play();
    } else if (videoRef.current) {
      videoRef.current.pause();
    }
  }, [isPlaying]);

  const startExercise = () => {
    setIsPlaying(true);
    if (intervalRef.current) {
      clearInterval(intervalRef.current);
    }

    intervalRef.current = setInterval(() => {
      setProgress((prev) => {
        const newProgress = prev + 1;
        if (newProgress >= currentStep.duration) {
          if (currentStepIndex === (currentSteps?.length || 0) - 1) {
            if (phase === 'warmup') {
              setPhase('main');
              setCurrentStepIndex(0);
              return 0;
            } else if (phase === 'main' && exercise.cooldown) {
              setPhase('cooldown');
              setCurrentStepIndex(0);
              return 0;
            } else {
              clearInterval(intervalRef.current);
              setIsPlaying(false);
              if (onComplete) {
                onComplete();
              }
              toast({
                title: "Exercise Complete! 🎉",
                description: "Great job on completing your exercise!",
              });
              return 0;
            }
          } else {
            setCurrentStepIndex((prev) => prev + 1);
            return 0;
          }
        }
        if (onProgress) {
          onProgress(newProgress / currentStep.duration * 100);
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
    setPhase('warmup');
    setCurrentStepIndex(0);
    setProgress(0);
    setIsPlaying(false);
    if (intervalRef.current) {
      clearInterval(intervalRef.current);
    }
  };

  const toggleFullscreen = () => {
    if (!document.fullscreenElement && containerRef.current) {
      containerRef.current.requestFullscreen();
      setIsFullscreen(true);
    } else {
      document.exitFullscreen();
      setIsFullscreen(false);
    }
  };

  const toggleMute = () => {
    if (videoRef.current) {
      videoRef.current.muted = !isMuted;
    }
    if (audioRef.current) {
      audioRef.current.muted = !isMuted;
    }
    setIsMuted(!isMuted);
  };

  return (
    <Card className={cn("relative overflow-hidden", className)} ref={containerRef}>
      <CardHeader className="relative z-10">
        <div className="flex items-center justify-between">
          <CardTitle className="flex items-center space-x-2">
            <span>{exercise.name}</span>
            <Badge variant="secondary" className="ml-2">
              {exercise.difficulty}
            </Badge>
          </CardTitle>
          <div className="flex items-center space-x-2">
            <Button
              variant="ghost"
              size="icon"
              onClick={toggleMute}
            >
              {isMuted ? <VolumeX className="h-4 w-4" /> : <Volume2 className="h-4 w-4" />}
            </Button>
            <Button
              variant="ghost"
              size="icon"
              onClick={toggleFullscreen}
            >
              {isFullscreen ? <Minimize2 className="h-4 w-4" /> : <Maximize2 className="h-4 w-4" />}
            </Button>
            <Button
              variant="ghost"
              size="icon"
              onClick={() => setShowInfo(!showInfo)}
            >
              <Info className="h-4 w-4" />
            </Button>
          </div>
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
              <ScrollArea className="h-[400px] pr-4">
                <div className="space-y-6">
                  <div>
                    <h4 className="font-medium mb-2">Description</h4>
                    <p className="text-sm text-muted-foreground">{exercise.description}</p>
                  </div>
                  
                  <div>
                    <h4 className="font-medium mb-2">Benefits</h4>
                    <ul className="list-disc list-inside space-y-1 text-sm text-muted-foreground">
                      {exercise.benefits.map((benefit, index) => (
                        <li key={index}>{benefit}</li>
                      ))}
                    </ul>
                  </div>

                  <div>
                    <h4 className="font-medium mb-2">Equipment Needed</h4>
                    <div className="flex flex-wrap gap-2">
                      {exercise.equipmentNeeded.map((item, index) => (
                        <Badge key={index} variant="outline">{item}</Badge>
                      ))}
                    </div>
                  </div>

                  <div>
                    <h4 className="font-medium mb-2">Space Required</h4>
                    <p className="text-sm text-muted-foreground">{exercise.spaceRequired}</p>
                  </div>

                  <div>
                    <h4 className="font-medium mb-2">Precautions</h4>
                    <ul className="list-disc list-inside space-y-1 text-sm text-muted-foreground">
                      {exercise.precautions.map((precaution, index) => (
                        <li key={index}>{precaution}</li>
                      ))}
                    </ul>
                  </div>

                  {exercise.variations && (
                    <div>
                      <h4 className="font-medium mb-2">Variations</h4>
                      <div className="space-y-3">
                        {exercise.variations.map((variation, index) => (
                          <div key={index} className="border rounded-lg p-3">
                            <div className="flex items-center justify-between mb-2">
                              <h5 className="font-medium">{variation.name}</h5>
                              <Badge>{variation.difficulty}</Badge>
                            </div>
                            <p className="text-sm text-muted-foreground">
                              {variation.description}
                            </p>
                          </div>
                        ))}
                      </div>
                    </div>
                  )}
                </div>
              </ScrollArea>
            </motion.div>
          ) : (
            <motion.div
              key="exercise"
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              exit={{ opacity: 0, y: -20 }}
              className="space-y-4"
            >
              <div className="relative aspect-video rounded-lg overflow-hidden bg-black/5 dark:bg-white/5">
                {currentStep.videoUrl ? (
                  <video
                    ref={videoRef}
                    className="w-full h-full object-contain"
                    src={currentStep.videoUrl}
                    loop
                    muted={isMuted}
                    playsInline
                  />
                ) : currentStep.animationUrl ? (
                  <video
                    ref={videoRef}
                    className="w-full h-full object-contain"
                    src={currentStep.animationUrl}
                    loop
                    muted={isMuted}
                    playsInline
                  />
                ) : currentStep.imageUrl ? (
                  <img
                    src={currentStep.imageUrl}
                    alt={currentStep.instruction}
                    className="w-full h-full object-contain"
                  />
                ) : (
                  <div className="absolute inset-0 flex items-center justify-center">
                    <Timer className="h-12 w-12 text-muted-foreground" />
                  </div>
                )}

                {currentStep.audioUrl && (
                  <audio
                    ref={audioRef}
                    src={currentStep.audioUrl}
                    loop
                    muted={isMuted}
                  />
                )}

                <div className="absolute bottom-0 left-0 right-0 p-4 bg-gradient-to-t from-black/50 to-transparent">
                  <p className="text-white text-sm">
                    {currentStep.instruction}
                  </p>
                </div>
              </div>

              {currentStep.tips && (
                <div className="bg-muted/50 rounded-lg p-3">
                  <h5 className="font-medium mb-2">Tips</h5>
                  <ul className="list-disc list-inside space-y-1 text-sm text-muted-foreground">
                    {currentStep.tips.map((tip, index) => (
                      <li key={index}>{tip}</li>
                    ))}
                  </ul>
                </div>
              )}

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
                  <Badge variant="outline">
                    {phase === 'warmup' ? 'Warm Up' : phase === 'cooldown' ? 'Cool Down' : 'Main Exercise'}
                  </Badge>
                  <span className="text-sm">
                    Step {currentStepIndex + 1} of {currentSteps?.length || 0}
                  </span>
                </div>
              </div>

              <div className="space-y-2">
                <div className="flex items-center justify-between text-sm">
                  <Badge variant="secondary" className="bg-primary/10">
                    <Timer className="mr-1 h-3 w-3" />
                    {currentStep.duration}s
                  </Badge>
                  <span className="text-muted-foreground">
                    {Math.round((progress / currentStep.duration) * 100)}%
                  </span>
                </div>
                <Progress
                  value={(progress / currentStep.duration) * 100}
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
