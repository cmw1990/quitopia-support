import { useState, useEffect, useCallback } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { Card } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { useToast } from '@/components/ui/use-toast';
import { useGameProgress } from '@/hooks/useGameProgress';
import type { GameConfig, GameProgress } from '@/types/brain-games';
import { cn } from '@/lib/utils';

interface Task {
  id: number;
  type: 'math' | 'color' | 'shape';
  value: string;
  color: string;
  shape: string;
  correct: boolean;
}

interface DividedAttentionProps {
  config: GameConfig;
  onComplete: (progress: GameProgress) => void;
  className?: string;
}

export function DividedAttention({ config, onComplete, className }: DividedAttentionProps) {
  const [tasks, setTasks] = useState<Task[]>([]);
  const [score, setScore] = useState(0);
  const [timeLeft, setTimeLeft] = useState(config.duration * 60);
  const [isPlaying, setIsPlaying] = useState(false);
  const [currentLevel, setCurrentLevel] = useState(1);
  const [streak, setStreak] = useState(0);
  const { toast } = useToast();
  const { saveProgress } = useGameProgress();

  const generateTask = useCallback((level: number): Task => {
    const types = ['math', 'color', 'shape'];
    const colors = ['red', 'blue', 'green', 'yellow'];
    const shapes = ['circle', 'square', 'triangle', 'star'];
    
    const type = types[Math.floor(Math.random() * types.length)];
    const color = colors[Math.floor(Math.random() * colors.length)];
    const shape = shapes[Math.floor(Math.random() * shapes.length)];
    
    let value = '';
    let correct = Math.random() > 0.5;

    switch (type) {
      case 'math':
        const num1 = Math.floor(Math.random() * (5 * level)) + 1;
        const num2 = Math.floor(Math.random() * (3 * level)) + 1;
        const result = correct ? num1 + num2 : num1 + num2 + (Math.random() > 0.5 ? 1 : -1);
        value = `${num1} + ${num2} = ${result}`;
        break;
      case 'color':
        const actualColor = colors[Math.floor(Math.random() * colors.length)];
        value = correct ? actualColor : colors.find(c => c !== actualColor) || actualColor;
        break;
      case 'shape':
        const actualShape = shapes[Math.floor(Math.random() * shapes.length)];
        value = correct ? actualShape : shapes.find(s => s !== actualShape) || actualShape;
        break;
    }

    return {
      id: Math.random(),
      type,
      value,
      color,
      shape,
      correct
    };
  }, []);

  const startGame = useCallback(() => {
    setIsPlaying(true);
    setScore(0);
    setTimeLeft(config.duration * 60);
    setCurrentLevel(1);
    setStreak(0);
    setTasks([generateTask(1)]);
  }, [config.duration, generateTask]);

  const handleAnswer = useCallback((task: Task, answer: boolean) => {
    const isCorrect = task.correct === answer;
    
    if (isCorrect) {
      setScore(prev => prev + (10 * currentLevel));
      setStreak(prev => prev + 1);
      
      if (streak > 0 && streak % 5 === 0) {
        setCurrentLevel(prev => Math.min(prev + 1, 10));
        toast({
          title: "Level Up!",
          description: `You've reached level ${currentLevel + 1}`,
        });
      }
    } else {
      setStreak(0);
      if (currentLevel > 1) {
        setCurrentLevel(prev => prev - 1);
      }
    }

    // Generate new tasks based on current level
    const newTasks = Array(currentLevel)
      .fill(null)
      .map(() => generateTask(currentLevel));
    
    setTasks(newTasks);
  }, [currentLevel, generateTask, streak, toast]);

  const endGame = useCallback(async () => {
    setIsPlaying(false);
    
    const progress: GameProgress = {
      id: crypto.randomUUID(),
      userId: '', // Will be set by the hook
      gameId: config.id,
      score,
      accuracy: (score / (config.duration * 60)) * 100,
      timeSpent: config.duration * 60 - timeLeft,
      difficulty: config.difficulty,
      completedAt: new Date().toISOString(),
      metrics: {
        correctAnswers: Math.floor(score / 10),
        wrongAnswers: Math.floor((config.duration * 60 - timeLeft) - (score / 10)),
        streaks: streak,
        focusScore: Math.min(100, (score / (config.duration * 60)) * 10)
      }
    };

    await saveProgress(progress);
    onComplete(progress);
  }, [config, onComplete, saveProgress, score, streak, timeLeft]);

  useEffect(() => {
    if (!isPlaying) return;

    const timer = setInterval(() => {
      setTimeLeft(prev => {
        if (prev <= 1) {
          clearInterval(timer);
          endGame();
          return 0;
        }
        return prev - 1;
      });
    }, 1000);

    return () => clearInterval(timer);
  }, [isPlaying, endGame]);

  return (
    <Card className={cn("p-6 space-y-4", className)}>
      <div className="flex justify-between items-center">
        <div className="space-y-1">
          <h3 className="text-2xl font-bold">Divided Attention</h3>
          <p className="text-sm text-muted-foreground">
            Level {currentLevel} | Score: {score}
          </p>
        </div>
        <div className="text-right">
          <div className="text-2xl font-mono">
            {Math.floor(timeLeft / 60)}:{(timeLeft % 60).toString().padStart(2, '0')}
          </div>
          <div className="text-sm text-muted-foreground">
            Streak: {streak}
          </div>
        </div>
      </div>

      {!isPlaying ? (
        <div className="space-y-4">
          <p>
            Test your divided attention by solving multiple tasks simultaneously.
            Tasks get more challenging as you progress!
          </p>
          <Button onClick={startGame} size="lg" className="w-full">
            Start Game
          </Button>
        </div>
      ) : (
        <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-3">
          <AnimatePresence mode="popLayout">
            {tasks.map(task => (
              <motion.div
                key={task.id}
                initial={{ scale: 0.8, opacity: 0 }}
                animate={{ scale: 1, opacity: 1 }}
                exit={{ scale: 0.8, opacity: 0 }}
                className="relative"
              >
                <Card
                  className={cn(
                    "p-4 flex flex-col items-center justify-center min-h-[200px]",
                    task.type === 'color' && `bg-${task.color}-50`
                  )}
                >
                  {task.type === 'shape' && (
                    <div className={cn(
                      "w-20 h-20 mb-4",
                      task.shape === 'circle' && "rounded-full",
                      task.shape === 'square' && "rounded-none",
                      task.shape === 'triangle' && "clip-path-triangle",
                      task.shape === 'star' && "clip-path-star",
                      `bg-${task.color}-500`
                    )} />
                  )}
                  
                  <div className="text-xl font-medium mb-4">
                    {task.value}
                  </div>

                  <div className="flex gap-2">
                    <Button
                      variant="outline"
                      onClick={() => handleAnswer(task, true)}
                    >
                      Correct
                    </Button>
                    <Button
                      variant="outline"
                      onClick={() => handleAnswer(task, false)}
                    >
                      Wrong
                    </Button>
                  </div>
                </Card>
              </motion.div>
            ))}
          </AnimatePresence>
        </div>
      )}
    </Card>
  );
}
