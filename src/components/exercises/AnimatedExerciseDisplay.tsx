
import { useState, useEffect } from 'react';
import { Trophy, Star, ArrowRight, ArrowLeft } from 'lucide-react';
import { cn } from '@/lib/utils';
import { Button } from '@/components/ui/button';
import { Skeleton } from '@/components/ui/skeleton';

interface AnimatedExerciseDisplayProps {
  imageUrl: string;
  exerciseType: string;
  animationType?: 'css' | 'svg';
  isActive?: boolean;
  progress?: number;
  instructions?: string[];
  currentStep?: number;
  onStepChange?: (step: number) => void;
}

// Create an image preloader function
const preloadImage = (src: string): Promise<void> => {
  return new Promise((resolve, reject) => {
    const img = new Image();
    img.onload = () => resolve();
    img.onerror = () => reject();
    img.src = src;
  });
};

const SVGAnimation = ({ exerciseType, progress = 0 }: { exerciseType: string; progress?: number }) => {
  const getAnimationPath = () => {
    switch (exerciseType) {
      case 'kegel_basic':
        return "M10 50 Q 50 10, 90 50 T 170 50";
      case 'kegel_advanced':
        return "M10 50 L 90 10 L 170 50";
      case 'breathing':
        return "M10 50 Q 90 10, 170 50 T 330 50";
      case 'core_strength':
        return "M10 50 L 90 30 L 170 50";
      case 'relaxation':
        return "M10 50 Q 90 50, 170 50";
      default:
        return "M10 50 L 90 50 L 170 50";
    }
  };

  return (
    <svg className="w-full h-full" viewBox="0 0 180 100">
      <defs>
        <linearGradient id="progress-gradient" x1="0%" y1="0%" x2="100%" y2="0%">
          <stop offset="0%" stopColor="currentColor" />
          <stop offset={`${progress}%`} stopColor="currentColor" />
          <stop offset={`${progress}%`} stopColor="rgba(0,0,0,0.1)" />
          <stop offset="100%" stopColor="rgba(0,0,0,0.1)" />
        </linearGradient>
      </defs>
      <path
        d={getAnimationPath()}
        fill="none"
        stroke="url(#progress-gradient)"
        strokeWidth="2"
        className={cn(
          "transition-all duration-300",
          exerciseType === 'breathing' ? "animate-exercise-breath" :
          exerciseType === 'kegel_basic' ? "animate-exercise-pulse" :
          exerciseType === 'kegel_advanced' ? "animate-exercise-quick-pulse" :
          exerciseType === 'core_strength' ? "animate-exercise-lift" :
          "animate-exercise-wave"
        )}
      />
    </svg>
  );
};

export const AnimatedExerciseDisplay = ({
  imageUrl,
  exerciseType,
  animationType = 'css',
  isActive = false,
  progress = 0,
  instructions = [],
  currentStep = 0,
  onStepChange
}: AnimatedExerciseDisplayProps) => {
  const [isLoaded, setIsLoaded] = useState(false);
  const [showAchievement, setShowAchievement] = useState(false);
  const [currentInstruction, setCurrentInstruction] = useState(0);
  const [imageError, setImageError] = useState(false);

  useEffect(() => {
    let mounted = true;

    const loadImage = async () => {
      try {
        await preloadImage(imageUrl);
        if (mounted) {
          setIsLoaded(true);
          setImageError(false);
        }
      } catch (error) {
        if (mounted) {
          setImageError(true);
          console.error('Error loading image:', error);
        }
      }
    };

    loadImage();

    return () => {
      mounted = false;
    };
  }, [imageUrl]);

  useEffect(() => {
    if (progress >= 100 && !showAchievement) {
      setShowAchievement(true);
      setTimeout(() => setShowAchievement(false), 2000);
    }
  }, [progress]);

  useEffect(() => {
    if (onStepChange) {
      onStepChange(currentInstruction);
    }
  }, [currentInstruction, onStepChange]);

  const getAnimationClass = () => {
    const baseAnimation = {
      kegel_basic: 'animate-exercise-pulse',
      kegel_advanced: 'animate-exercise-quick-pulse',
      breathing: 'animate-exercise-breath',
      core_strength: 'animate-exercise-lift',
      relaxation: 'animate-exercise-wave'
    }[exerciseType] || 'animate-exercise-pulse';

    return cn(
      baseAnimation,
      isActive && 'scale-110 transition-transform duration-300',
      'hover:scale-105 transition-all duration-300'
    );
  };

  const handleNextStep = () => {
    if (currentInstruction < instructions.length - 1) {
      setCurrentInstruction(prev => prev + 1);
    }
  };

  const handlePrevStep = () => {
    if (currentInstruction > 0) {
      setCurrentInstruction(prev => prev - 1);
    }
  };

  return (
    <div 
      className={cn(
        "relative w-full aspect-square rounded-lg overflow-hidden",
        isActive ? "ring-2 ring-primary shadow-lg" : "hover:ring-1 hover:ring-primary/50",
        "transition-all duration-300",
        "bg-gradient-to-br from-primary/10 to-secondary/10"
      )}
    >
      {!isLoaded && !imageError && (
        <div className="absolute inset-0 flex items-center justify-center bg-background/80">
          <Skeleton className="w-full h-full" />
        </div>
      )}

      {imageError && (
        <div className="absolute inset-0 flex items-center justify-center bg-background/80">
          <p className="text-muted-foreground">Failed to load exercise visual</p>
        </div>
      )}

      {animationType === 'css' && (
        <img
          src={imageUrl}
          alt={`${exerciseType} exercise`}
          className={cn(getAnimationClass(), imageError ? 'hidden' : '')}
          onLoad={() => setIsLoaded(true)}
          onError={() => setImageError(true)}
        />
      )}

      {animationType === 'svg' && (
        <div className="relative w-full h-full">
          <SVGAnimation exerciseType={exerciseType} progress={progress} />
          <img
            src={imageUrl}
            alt={`${exerciseType} exercise`}
            className={cn(
              "absolute inset-0 w-full h-full object-contain mix-blend-multiply",
              imageError ? 'hidden' : ''
            )}
            onLoad={() => setIsLoaded(true)}
            onError={() => setImageError(true)}
          />
        </div>
      )}

      {isActive && instructions.length > 0 && (
        <div className="absolute inset-x-0 bottom-0 p-4 bg-background/95 backdrop-blur-sm">
          <div className="flex items-center justify-between gap-2">
            <Button
              variant="ghost"
              size="icon"
              onClick={handlePrevStep}
              disabled={currentInstruction === 0}
            >
              <ArrowLeft className="h-4 w-4" />
            </Button>
            <p className="text-sm font-medium text-center flex-1">
              {instructions[currentInstruction]}
            </p>
            <Button
              variant="ghost"
              size="icon"
              onClick={handleNextStep}
              disabled={currentInstruction === instructions.length - 1}
            >
              <ArrowRight className="h-4 w-4" />
            </Button>
          </div>
          <div className="mt-2 flex justify-center gap-1">
            {instructions.map((_, idx) => (
              <div
                key={idx}
                className={cn(
                  "w-2 h-2 rounded-full transition-all duration-300",
                  idx === currentInstruction
                    ? "bg-primary w-4"
                    : "bg-primary/30"
                )}
              />
            ))}
          </div>
        </div>
      )}

      {isActive && (
        <div className="absolute top-2 left-2 right-2">
          <div className="bg-background/80 backdrop-blur-sm rounded-full h-2 overflow-hidden">
            <div 
              className="h-full bg-primary transition-all duration-300 animate-pulse"
              style={{ width: `${progress}%` }}
            />
          </div>
        </div>
      )}

      {showAchievement && (
        <div className="absolute inset-0 flex items-center justify-center bg-black/50 animate-fade-in backdrop-blur-sm">
          <div className="flex flex-col items-center space-y-2 animate-scale-in">
            <Trophy className="w-8 h-8 text-yellow-400 animate-bounce" />
            <Star className="w-6 h-6 text-yellow-400 animate-spin" />
            <span className="text-white font-bold">Exercise Complete!</span>
          </div>
        </div>
      )}
    </div>
  );
};
