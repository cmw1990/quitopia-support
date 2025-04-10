import { useState, useEffect, useCallback } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { Card } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { useToast } from '@/components/ui/use-toast';
import { useGameProgress } from '@/hooks/useGameProgress';
import type { GameConfig, GameProgress } from '@/types/brain-games';
import { cn } from '@/lib/utils';

interface VisualProcessingProps {
  config: GameConfig;
  onComplete: (progress: GameProgress) => void;
  className?: string;
}

interface Target {
  id: number;
  shape: 'circle' | 'square' | 'triangle';
  color: string;
  position: { x: number; y: number };
  size: number;
}

const SHAPES = ['circle', 'square', 'triangle'] as const;
const COLORS = ['#EF4444', '#3B82F6', '#10B981', '#F59E0B'];

export function VisualProcessing({ config, onComplete, className }: VisualProcessingProps) {
  const [targets, setTargets] = useState<Target[]>([]);
  const [score, setScore] = useState(0);
  const [level, setLevel] = useState(1);
  const [isPlaying, setIsPlaying] = useState(false);
  const [reactionTimes, setReactionTimes] = useState<number[]>([]);
  const [gameStartTime, setGameStartTime] = useState(0);
  const [complexity, setComplexity] = useState(1);
  const { toast } = useToast();
  const { saveProgress } = useGameProgress();

  const generateTarget = useCallback((count: number) => {
    const newTargets: Target[] = [];
    for (let i = 0; i < count; i++) {
      newTargets.push({
        id: Date.now() + i,
        shape: SHAPES[Math.floor(Math.random() * SHAPES.length)],
        color: COLORS[Math.floor(Math.random() * COLORS.length)],
        position: {
          x: Math.random() * 80 + 10, // 10-90%
          y: Math.random() * 80 + 10  // 10-90%
        },
        size: Math.max(30, Math.random() * 50)
      });
    }
    return newTargets;
  }, []);

  const startLevel = useCallback(() => {
    const targetCount = Math.min(10, Math.max(2, Math.floor(level / 2) + 1));
    setComplexity(targetCount);
    setTargets(generateTarget(targetCount));
    setGameStartTime(Date.now());
  }, [level, generateTarget]);

  const startGame = useCallback(() => {
    setScore(0);
    setLevel(1);
    setReactionTimes([]);
    setIsPlaying(true);
    startLevel();
  }, [startLevel]);

  const handleTargetClick = useCallback((targetId: number) => {
    const reactionTime = Date.now() - gameStartTime;
    setReactionTimes(prev => [...prev, reactionTime]);
    
    // Remove clicked target
    setTargets(prev => prev.filter(t => t.id !== targetId));
    
    // Update score based on reaction time
    const pointsEarned = Math.max(10, Math.floor(2000 / reactionTime) * 10);
    setScore(prev => prev + pointsEarned);
    
    // Check if level complete
    if (targets.length <= 1) {
      setLevel(prev => prev + 1);
      setTimeout(startLevel, 1000);
    }
  }, [gameStartTime, targets.length, startLevel]);

  const endGame = useCallback(async () => {
    setIsPlaying(false);
    
    const avgReactionTime = reactionTimes.reduce((a, b) => a + b, 0) / reactionTimes.length;
    const accuracyScore = Math.min(100, (score / (level * 100)) * 100);
    
    // Calculate energy impact based on performance
    const energyImpact = Math.min(10, Math.max(-10,
      (avgReactionTime < 800 ? 5 : -2) + // Speed bonus/penalty
      (accuracyScore > 90 ? 5 : -3) + // Accuracy bonus/penalty
      (level > 5 ? 3 : -1) // Level bonus/penalty
    ));

    const progress: GameProgress = {
      id: crypto.randomUUID(),
      userId: '', // Set by hook
      gameId: config.id,
      score,
      accuracy: accuracyScore,
      timeSpent: Math.floor((Date.now() - gameStartTime) / 1000),
      difficulty: config.difficulty,
      completedAt: new Date().toISOString(),
      metrics: {
        reactionTime: Math.round(avgReactionTime),
        correctAnswers: reactionTimes.length,
        wrongAnswers: 0,
        focusScore: accuracyScore,
        energyImpact
      }
    };

    await saveProgress(progress);
    onComplete(progress);

    toast({
      title: "Processing Challenge Complete!",
      description: `Score: ${score} | Avg Reaction: ${Math.round(avgReactionTime)}ms | Energy: ${energyImpact > 0 ? '+' : ''}${energyImpact}`,
    });
  }, [config.id, config.difficulty, gameStartTime, level, onComplete, reactionTimes, saveProgress, score, toast]);

  useEffect(() => {
    if (level > 10) {
      endGame();
    }
  }, [level, endGame]);

  const renderShape = (target: Target) => {
    const commonProps = {
      style: {
        position: 'absolute' as const,
        left: `${target.position.x}%`,
        top: `${target.position.y}%`,
        width: target.size,
        height: target.size,
        backgroundColor: target.color,
        cursor: 'pointer'
      },
      onClick: () => handleTargetClick(target.id),
      whileHover: { scale: 1.1 },
      whileTap: { scale: 0.9 }
    };

    switch (target.shape) {
      case 'circle':
        return <motion.div {...commonProps} className="rounded-full" />;
      case 'square':
        return <motion.div {...commonProps} className="rounded-lg" />;
      case 'triangle':
        return (
          <motion.div
            {...commonProps}
            style={{
              ...commonProps.style,
              clipPath: 'polygon(50% 0%, 0% 100%, 100% 100%)',
            }}
          />
        );
    }
  };

  return (
    <Card className={cn("p-6 space-y-4", className)}>
      <div className="flex justify-between items-center">
        <div>
          <h3 className="text-2xl font-bold">Visual Processing</h3>
          <p className="text-sm text-muted-foreground">
            Click targets quickly and accurately
          </p>
        </div>
        {isPlaying && (
          <div className="text-right">
            <div className="text-2xl font-mono">{score}</div>
            <div className="text-sm text-muted-foreground">
              Level {level} | Complexity {complexity}
            </div>
          </div>
        )}
      </div>

      {!isPlaying ? (
        <div className="space-y-4">
          <p>
            Test your visual processing speed and accuracy.
            Click on shapes as they appear. The faster you react,
            the more points you earn!
          </p>
          <Button onClick={startGame} size="lg" className="w-full">
            Start Challenge
          </Button>
        </div>
      ) : (
        <div className="relative w-full aspect-square bg-muted rounded-lg overflow-hidden">
          <AnimatePresence>
            {targets.map(target => renderShape(target))}
          </AnimatePresence>
        </div>
      )}
    </Card>
  );
}
