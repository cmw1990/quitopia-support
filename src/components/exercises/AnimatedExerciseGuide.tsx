import { useState, useEffect, useRef } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { Card, CardContent } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Slider } from '@/components/ui/slider';
import { Badge } from '@/components/ui/badge';
import { Progress } from '@/components/ui/progress';
import {
  Play,
  Pause,
  RotateCcw,
  ChevronRight,
  ChevronLeft,
  Maximize2,
  Minimize2,
} from 'lucide-react';

interface AnimatedExerciseGuideProps {
  exerciseId: string;
  name: string;
  animationUrl?: string;
  videoUrl?: string;
  imageUrls?: string[];
  steps: {
    id: string;
    description: string;
    duration: number;
    imageUrl?: string;
  }[];
  onComplete?: () => void;
}

export default function AnimatedExerciseGuide({
  exerciseId,
  name,
  animationUrl,
  videoUrl,
  imageUrls,
  steps,
  onComplete,
}: AnimatedExerciseGuideProps) {
  const [isPlaying, setIsPlaying] = useState(false);
  const [currentStep, setCurrentStep] = useState(0);
  const [progress, setProgress] = useState(0);
  const [isFullscreen, setIsFullscreen] = useState(false);
  const guideRef = useRef<HTMLDivElement>(null);
  const intervalRef = useRef<NodeJS.Timeout>();

  useEffect(() => {
    return () => {
      if (intervalRef.current) {
        clearInterval(intervalRef.current);
      }
    };
  }, []);

  const togglePlay = () => {
    setIsPlaying(!isPlaying);
    if (!isPlaying) {
      startAnimation();
    } else {
      pauseAnimation();
    }
  };

  const startAnimation = () => {
    if (intervalRef.current) {
      clearInterval(intervalRef.current);
    }

    intervalRef.current = setInterval(() => {
      setProgress((prev) => {
        const newProgress = prev + 1;
        if (newProgress >= steps[currentStep].duration) {
          if (currentStep === steps.length - 1) {
            clearInterval(intervalRef.current);
            setIsPlaying(false);
            if (onComplete) {
              onComplete();
            }
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

  const pauseAnimation = () => {
    if (intervalRef.current) {
      clearInterval(intervalRef.current);
    }
  };

  const resetAnimation = () => {
    setCurrentStep(0);
    setProgress(0);
    setIsPlaying(false);
    if (intervalRef.current) {
      clearInterval(intervalRef.current);
    }
  };

  const nextStep = () => {
    if (currentStep < steps.length - 1) {
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

  const toggleFullscreen = () => {
    if (!document.fullscreenElement && guideRef.current) {
      guideRef.current.requestFullscreen();
      setIsFullscreen(true);
    } else {
      document.exitFullscreen();
      setIsFullscreen(false);
    }
  };

  return (
    <div
      ref={guideRef}
      className={`relative rounded-lg overflow-hidden ${
        isFullscreen ? 'fixed inset-0 z-50 bg-background' : ''
      }`}
    >
      <div className="space-y-4 p-4">
        <div className="flex items-center justify-between">
          <h3 className="text-lg font-semibold">{name}</h3>
          <div className="flex items-center space-x-2">
            <Button
              variant="ghost"
              size="icon"
              onClick={toggleFullscreen}
            >
              {isFullscreen ? (
                <Minimize2 className="h-4 w-4" />
              ) : (
                <Maximize2 className="h-4 w-4" />
              )}
            </Button>
          </div>
        </div>

        <div className="relative aspect-video rounded-lg overflow-hidden bg-black">
          <AnimatePresence mode="wait">
            {animationUrl ? (
              <motion.video
                key="animation"
                initial={{ opacity: 0 }}
                animate={{ opacity: 1 }}
                exit={{ opacity: 0 }}
                className="w-full h-full object-contain"
                src={animationUrl}
                loop={isPlaying}
                muted
                autoPlay={isPlaying}
                playsInline
              />
            ) : videoUrl ? (
              <motion.iframe
                key="video"
                initial={{ opacity: 0 }}
                animate={{ opacity: 1 }}
                exit={{ opacity: 0 }}
                className="w-full h-full"
                src={videoUrl}
                allowFullScreen
              />
            ) : imageUrls?.length ? (
              <motion.img
                key={`image-${currentStep}`}
                initial={{ opacity: 0 }}
                animate={{ opacity: 1 }}
                exit={{ opacity: 0 }}
                src={imageUrls[currentStep % imageUrls.length]}
                alt={`Step ${currentStep + 1}`}
                className="w-full h-full object-contain"
              />
            ) : null}
          </AnimatePresence>

          <div className="absolute bottom-0 left-0 right-0 p-4 bg-gradient-to-t from-black/80 to-transparent">
            <div className="flex items-center justify-between text-white">
              <div className="flex items-center space-x-2">
                <Button
                  variant="ghost"
                  size="icon"
                  className="text-white hover:text-white/80"
                  onClick={togglePlay}
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
                  className="text-white hover:text-white/80"
                  onClick={resetAnimation}
                >
                  <RotateCcw className="h-4 w-4" />
                </Button>
              </div>
              <div className="flex items-center space-x-2">
                <Button
                  variant="ghost"
                  size="icon"
                  className="text-white hover:text-white/80"
                  onClick={previousStep}
                  disabled={currentStep === 0}
                >
                  <ChevronLeft className="h-4 w-4" />
                </Button>
                <span className="text-sm">
                  {currentStep + 1} / {steps.length}
                </span>
                <Button
                  variant="ghost"
                  size="icon"
                  className="text-white hover:text-white/80"
                  onClick={nextStep}
                  disabled={currentStep === steps.length - 1}
                >
                  <ChevronRight className="h-4 w-4" />
                </Button>
              </div>
            </div>
            <Progress
              value={(progress / steps[currentStep].duration) * 100}
              className="h-1 mt-2"
            />
          </div>
        </div>

        <Card>
          <CardContent className="p-4">
            <motion.div
              key={currentStep}
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              exit={{ opacity: 0, y: -20 }}
              className="space-y-2"
            >
              <div className="flex items-center justify-between">
                <Badge variant="secondary">Step {currentStep + 1}</Badge>
                <span className="text-sm text-muted-foreground">
                  {steps[currentStep].duration}s
                </span>
              </div>
              <p>{steps[currentStep].description}</p>
              {steps[currentStep].imageUrl && (
                <img
                  src={steps[currentStep].imageUrl}
                  alt={`Step ${currentStep + 1} detail`}
                  className="w-full rounded-lg"
                />
              )}
            </motion.div>
          </CardContent>
        </Card>
      </div>
    </div>
  );
}
