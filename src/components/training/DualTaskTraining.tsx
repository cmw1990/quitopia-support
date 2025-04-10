import { useState, useEffect, useCallback } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { Card } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Progress } from '@/components/ui/progress';
import { useToast } from '@/components/ui/use-toast';
import { useGameProgress } from '@/hooks/useGameProgress';
import type { GameConfig, GameProgress } from '@/types/brain-games';
import { cn } from '@/lib/utils';

interface DualTaskTrainingProps {
  config: GameConfig;
  onComplete: (progress: GameProgress) => void;
  className?: string;
}

interface Task {
  id: number;
  type: 'math' | 'verbal' | 'spatial';
  question: string;
  answer: string | number;
  options?: string[] | number[];
}

const generateMathTask = (): Task => {
  const operations = ['+', '-', '*'];
  const op = operations[Math.floor(Math.random() * operations.length)];
  const num1 = Math.floor(Math.random() * 12) + 1;
  const num2 = Math.floor(Math.random() * 12) + 1;
  let answer: number;
  
  switch (op) {
    case '+': answer = num1 + num2; break;
    case '-': answer = num1 - num2; break;
    case '*': answer = num1 * num2; break;
    default: answer = num1 + num2;
  }

  return {
    id: Date.now(),
    type: 'math',
    question: `${num1} ${op} ${num2} = ?`,
    answer: answer,
    options: [
      answer,
      answer + Math.floor(Math.random() * 5) + 1,
      answer - Math.floor(Math.random() * 5) - 1,
      answer * 2
    ].sort(() => Math.random() - 0.5)
  };
};

const WORDS = ['FOCUS', 'ENERGY', 'MIND', 'BRAIN', 'POWER', 'THINK', 'LEARN', 'GROW'];
const generateVerbalTask = (): Task => {
  const word = WORDS[Math.floor(Math.random() * WORDS.length)];
  return {
    id: Date.now(),
    type: 'verbal',
    question: 'Find the word:',
    answer: word,
    options: word.split('').sort(() => Math.random() - 0.5).join('')
  };
};

const generateSpatialTask = (): Task => {
  const patterns = ['⬆️', '⬇️', '⬅️', '➡️'];
  const answer = patterns[Math.floor(Math.random() * patterns.length)];
  return {
    id: Date.now(),
    type: 'spatial',
    question: 'Remember the pattern:',
    answer: answer,
    options: patterns
  };
};

export function DualTaskTraining({ config, onComplete, className }: DualTaskTrainingProps) {
  const [primaryTask, setPrimaryTask] = useState<Task | null>(null);
  const [secondaryTask, setSecondaryTask] = useState<Task | null>(null);
  const [score, setScore] = useState(0);
  const [level, setLevel] = useState(1);
  const [isPlaying, setIsPlaying] = useState(false);
  const [timeLeft, setTimeLeft] = useState(60);
  const [responses, setResponses] = useState<{
    correct: number;
    incorrect: number;
    missed: number;
  }>({ correct: 0, incorrect: 0, missed: 0 });
  const { toast } = useToast();
  const { saveProgress } = useGameProgress();

  const generateTasks = useCallback(() => {
    const taskTypes = [generateMathTask, generateVerbalTask, generateSpatialTask];
    const primary = taskTypes[Math.floor(Math.random() * taskTypes.length)]();
    const secondary = taskTypes[Math.floor(Math.random() * taskTypes.length)]();
    setPrimaryTask(primary);
    setSecondaryTask(secondary);
  }, []);

  const startGame = useCallback(() => {
    setScore(0);
    setLevel(1);
    setTimeLeft(60);
    setResponses({ correct: 0, incorrect: 0, missed: 0 });
    setIsPlaying(true);
    generateTasks();
  }, [generateTasks]);

  const handleAnswer = useCallback((task: Task, answer: string | number) => {
    const isCorrect = answer === task.answer;
    
    if (isCorrect) {
      setScore(prev => prev + (level * 10));
      setResponses(prev => ({ ...prev, correct: prev.correct + 1 }));
      toast({
        title: "Correct!",
        variant: "default"
      });
    } else {
      setResponses(prev => ({ ...prev, incorrect: prev.incorrect + 1 }));
      toast({
        title: "Incorrect",
        variant: "destructive"
      });
    }

    // Increase difficulty every 5 correct answers
    if (responses.correct > 0 && responses.correct % 5 === 0) {
      setLevel(prev => prev + 1);
    }

    generateTasks();
  }, [level, responses.correct, generateTasks, toast]);

  const endGame = useCallback(async () => {
    setIsPlaying(false);
    
    const accuracy = (responses.correct / (responses.correct + responses.incorrect + responses.missed)) * 100;
    const energyImpact = Math.min(10, Math.max(-10,
      (accuracy > 80 ? 5 : -2) + // Accuracy bonus/penalty
      (score > 500 ? 5 : -2) + // Score bonus/penalty
      (level > 3 ? 3 : -1) // Level bonus/penalty
    ));

    const progress: GameProgress = {
      id: crypto.randomUUID(),
      userId: '', // Set by hook
      gameId: config.id,
      score,
      accuracy,
      timeSpent: 60,
      difficulty: config.difficulty,
      completedAt: new Date().toISOString(),
      metrics: {
        correctAnswers: responses.correct,
        wrongAnswers: responses.incorrect + responses.missed,
        focusScore: accuracy,
        energyImpact,
        complexityLevel: level
      }
    };

    await saveProgress(progress);
    onComplete(progress);

    toast({
      title: "Dual Task Training Complete!",
      description: `Score: ${score} | Accuracy: ${Math.round(accuracy)}% | Energy: ${energyImpact > 0 ? '+' : ''}${energyImpact}`,
    });
  }, [config.id, config.difficulty, onComplete, responses, saveProgress, score, toast]);

  useEffect(() => {
    let timer: NodeJS.Timeout;
    if (isPlaying && timeLeft > 0) {
      timer = setInterval(() => {
        setTimeLeft(prev => {
          if (prev <= 1) {
            endGame();
            return 0;
          }
          return prev - 1;
        });
      }, 1000);
    }
    return () => clearInterval(timer);
  }, [isPlaying, timeLeft, endGame]);

  return (
    <Card className={cn("p-6 space-y-4", className)}>
      <div className="flex justify-between items-center">
        <div>
          <h3 className="text-2xl font-bold">Dual Task Training</h3>
          <p className="text-sm text-muted-foreground">
            Train your brain to handle multiple tasks
          </p>
        </div>
        {isPlaying && (
          <div className="text-right">
            <div className="text-2xl font-mono">{timeLeft}s</div>
            <div className="text-sm text-muted-foreground">
              Level {level} | Score {score}
            </div>
          </div>
        )}
      </div>

      {!isPlaying ? (
        <div className="space-y-4">
          <p>
            Challenge yourself with two simultaneous tasks!
            Solve math problems while remembering patterns,
            or unscramble words while tracking shapes.
          </p>
          <Button onClick={startGame} size="lg" className="w-full">
            Start Training
          </Button>
        </div>
      ) : (
        <div className="space-y-6">
          <div className="grid grid-cols-2 gap-4">
            {/* Primary Task */}
            {primaryTask && (
              <div className="p-4 rounded-lg border bg-muted">
                <h4 className="font-semibold mb-2">Task 1</h4>
                <p className="mb-4">{primaryTask.question}</p>
                <div className="grid grid-cols-2 gap-2">
                  {primaryTask.options?.map((option, i) => (
                    <Button
                      key={i}
                      variant="outline"
                      onClick={() => handleAnswer(primaryTask, option)}
                    >
                      {option}
                    </Button>
                  ))}
                </div>
              </div>
            )}

            {/* Secondary Task */}
            {secondaryTask && (
              <div className="p-4 rounded-lg border bg-muted">
                <h4 className="font-semibold mb-2">Task 2</h4>
                <p className="mb-4">{secondaryTask.question}</p>
                <div className="grid grid-cols-2 gap-2">
                  {secondaryTask.options?.map((option, i) => (
                    <Button
                      key={i}
                      variant="outline"
                      onClick={() => handleAnswer(secondaryTask, option)}
                    >
                      {option}
                    </Button>
                  ))}
                </div>
              </div>
            )}
          </div>

          <div className="space-y-2">
            <div className="flex justify-between text-sm">
              <span>Progress</span>
              <span>{Math.round((60 - timeLeft) / 0.6)}%</span>
            </div>
            <Progress value={(60 - timeLeft) / 0.6} />
          </div>

          <div className="grid grid-cols-3 gap-4 text-center text-sm">
            <div>
              <div className="font-semibold text-green-600">
                {responses.correct}
              </div>
              <div className="text-muted-foreground">Correct</div>
            </div>
            <div>
              <div className="font-semibold text-red-600">
                {responses.incorrect}
              </div>
              <div className="text-muted-foreground">Incorrect</div>
            </div>
            <div>
              <div className="font-semibold text-yellow-600">
                {responses.missed}
              </div>
              <div className="text-muted-foreground">Missed</div>
            </div>
          </div>
        </div>
      )}
    </Card>
  );
}
