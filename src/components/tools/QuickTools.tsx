import { useState, useEffect } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Progress } from '@/components/ui/progress';
import { Slider } from '@/components/ui/slider';
import { useToast } from '@/components/ui/use-toast';

interface BreathingExerciseProps {
  onComplete?: () => void;
}

export function BreathingExercise({ onComplete }: BreathingExerciseProps) {
  const [phase, setPhase] = useState<'inhale' | 'hold' | 'exhale' | 'rest'>('inhale');
  const [progress, setProgress] = useState(0);
  const [isActive, setIsActive] = useState(false);
  const [cycleCount, setCycleCount] = useState(0);

  useEffect(() => {
    if (!isActive) return;

    const durations = {
      inhale: 4000,
      hold: 4000,
      exhale: 4000,
      rest: 2000,
    };

    const timer = setInterval(() => {
      setProgress((prev) => {
        const newProgress = prev + (100 / durations[phase]);
        if (newProgress >= 100) {
          const phases: ('inhale' | 'hold' | 'exhale' | 'rest')[] = ['inhale', 'hold', 'exhale', 'rest'];
          const currentIndex = phases.indexOf(phase);
          const nextPhase = phases[(currentIndex + 1) % phases.length];
          
          setPhase(nextPhase);
          if (nextPhase === 'inhale') {
            setCycleCount((prev) => {
              if (prev + 1 >= 3) {
                setIsActive(false);
                onComplete?.();
              }
              return prev + 1;
            });
          }
          return 0;
        }
        return newProgress;
      });
    }, 50);

    return () => clearInterval(timer);
  }, [phase, isActive, onComplete]);

  const instructions = {
    inhale: 'Breathe in slowly...',
    hold: 'Hold your breath...',
    exhale: 'Breathe out slowly...',
    rest: 'Rest...',
  };

  return (
    <Card className="w-full max-w-md mx-auto">
      <CardHeader>
        <CardTitle>Quick Breathing Exercise</CardTitle>
        <CardDescription>Take a moment to breathe and relax</CardDescription>
      </CardHeader>
      <CardContent className="space-y-4">
        <AnimatePresence mode="wait">
          <motion.div
            key={phase}
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            exit={{ opacity: 0, y: -20 }}
            className="text-center py-8"
          >
            <div className="text-4xl mb-4">
              {phase === 'inhale' && '🫁'}
              {phase === 'hold' && '✨'}
              {phase === 'exhale' && '💨'}
              {phase === 'rest' && '😌'}
            </div>
            <div className="text-xl font-medium">{instructions[phase]}</div>
          </motion.div>
        </AnimatePresence>

        <Progress value={progress} className="w-full" />

        <div className="flex justify-between text-sm text-muted-foreground">
          <span>Cycle {cycleCount + 1}/3</span>
          <span>{Math.round(progress)}%</span>
        </div>

        <Button
          onClick={() => setIsActive(!isActive)}
          className="w-full"
          variant={isActive ? 'secondary' : 'default'}
        >
          {isActive ? 'Pause' : 'Start'}
        </Button>
      </CardContent>
    </Card>
  );
}

interface GroundingExerciseProps {
  onComplete?: () => void;
}

export function GroundingExercise({ onComplete }: GroundingExerciseProps) {
  const [step, setStep] = useState(0);
  const { toast } = useToast();

  const steps = [
    { count: 5, sense: 'see', emoji: '👀' },
    { count: 4, sense: 'touch', emoji: '🤚' },
    { count: 3, sense: 'hear', emoji: '👂' },
    { count: 2, sense: 'smell', emoji: '👃' },
    { count: 1, sense: 'taste', emoji: '👅' },
  ];

  const handleNext = () => {
    if (step < steps.length - 1) {
      setStep(step + 1);
    } else {
      toast({
        title: 'Exercise Complete',
        description: 'Great job! How do you feel?',
      });
      onComplete?.();
    }
  };

  return (
    <Card className="w-full max-w-md mx-auto">
      <CardHeader>
        <CardTitle>5-4-3-2-1 Grounding</CardTitle>
        <CardDescription>
          A simple technique to help you stay present and calm
        </CardDescription>
      </CardHeader>
      <CardContent className="space-y-4">
        <AnimatePresence mode="wait">
          <motion.div
            key={step}
            initial={{ opacity: 0, x: 50 }}
            animate={{ opacity: 1, x: 0 }}
            exit={{ opacity: 0, x: -50 }}
            className="text-center py-8"
          >
            <div className="text-4xl mb-4">{steps[step].emoji}</div>
            <div className="text-xl font-medium">
              Name {steps[step].count} things you can {steps[step].sense}
            </div>
          </motion.div>
        </AnimatePresence>

        <Progress value={(step / (steps.length - 1)) * 100} className="w-full" />

        <Button onClick={handleNext} className="w-full">
          {step < steps.length - 1 ? 'Next' : 'Complete'}
        </Button>
      </CardContent>
    </Card>
  );
}

interface BodyScanProps {
  onComplete?: () => void;
}

export function BodyScan({ onComplete }: BodyScanProps) {
  const [currentArea, setCurrentArea] = useState(0);
  const [tension, setTension] = useState(5);
  const [isComplete, setIsComplete] = useState(false);

  const bodyAreas = [
    { name: 'Head and Face', emoji: '🤔' },
    { name: 'Neck and Shoulders', emoji: '🧘‍♀️' },
    { name: 'Arms and Hands', emoji: '💪' },
    { name: 'Chest and Back', emoji: '🫀' },
    { name: 'Stomach', emoji: '🫃' },
    { name: 'Legs and Feet', emoji: '🦶' },
  ];

  const handleNext = () => {
    if (currentArea < bodyAreas.length - 1) {
      setCurrentArea(currentArea + 1);
      setTension(5);
    } else {
      setIsComplete(true);
      onComplete?.();
    }
  };

  return (
    <Card className="w-full max-w-md mx-auto">
      <CardHeader>
        <CardTitle>Quick Body Scan</CardTitle>
        <CardDescription>
          Check in with your body and release tension
        </CardDescription>
      </CardHeader>
      <CardContent className="space-y-4">
        {!isComplete ? (
          <>
            <AnimatePresence mode="wait">
              <motion.div
                key={currentArea}
                initial={{ opacity: 0, y: 20 }}
                animate={{ opacity: 1, y: 0 }}
                exit={{ opacity: 0, y: -20 }}
                className="text-center py-8"
              >
                <div className="text-4xl mb-4">{bodyAreas[currentArea].emoji}</div>
                <div className="text-xl font-medium mb-4">
                  {bodyAreas[currentArea].name}
                </div>
                <div className="text-sm text-muted-foreground mb-4">
                  Rate the tension in this area (1-10)
                </div>
                <Slider
                  value={[tension]}
                  onValueChange={([value]) => setTension(value)}
                  min={1}
                  max={10}
                  step={1}
                  className="w-full"
                />
                <div className="text-sm text-muted-foreground mt-2">
                  Tension Level: {tension}
                </div>
              </motion.div>
            </AnimatePresence>

            <Progress
              value={(currentArea / (bodyAreas.length - 1)) * 100}
              className="w-full"
            />

            <Button onClick={handleNext} className="w-full">
              {currentArea < bodyAreas.length - 1 ? 'Next Area' : 'Complete Scan'}
            </Button>
          </>
        ) : (
          <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            className="text-center py-8"
          >
            <div className="text-4xl mb-4">✨</div>
            <div className="text-xl font-medium mb-4">
              Body Scan Complete
            </div>
            <div className="text-sm text-muted-foreground">
              Take a moment to notice how your body feels now
            </div>
          </motion.div>
        )}
      </CardContent>
    </Card>
  );
}

interface GratitudeCheckProps {
  onComplete?: () => void;
}

export function GratitudeCheck({ onComplete }: GratitudeCheckProps) {
  const [entries, setEntries] = useState<string[]>([]);
  const [currentEntry, setCurrentEntry] = useState('');

  const handleAddEntry = () => {
    if (currentEntry.trim()) {
      setEntries([...entries, currentEntry.trim()]);
      setCurrentEntry('');
    }
  };

  const handleComplete = () => {
    onComplete?.();
  };

  return (
    <Card className="w-full max-w-md mx-auto">
      <CardHeader>
        <CardTitle>Gratitude Check</CardTitle>
        <CardDescription>
          Take a moment to appreciate the good things in your life
        </CardDescription>
      </CardHeader>
      <CardContent className="space-y-4">
        <div className="space-y-2">
          <input
            type="text"
            value={currentEntry}
            onChange={(e) => setCurrentEntry(e.target.value)}
            placeholder="I'm grateful for..."
            className="w-full p-2 rounded-md border"
            onKeyPress={(e) => e.key === 'Enter' && handleAddEntry()}
          />
          <Button onClick={handleAddEntry} className="w-full">
            Add Entry
          </Button>
        </div>

        <AnimatePresence>
          {entries.map((entry, index) => (
            <motion.div
              key={index}
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              exit={{ opacity: 0, y: -20 }}
              className="p-2 bg-secondary rounded-md"
            >
              {entry}
            </motion.div>
          ))}
        </AnimatePresence>

        {entries.length >= 3 && (
          <Button onClick={handleComplete} className="w-full">
            Complete Check
          </Button>
        )}

        {entries.length < 3 && (
          <div className="text-sm text-muted-foreground text-center">
            Add {3 - entries.length} more entries to complete
          </div>
        )}
      </CardContent>
    </Card>
  );
}
