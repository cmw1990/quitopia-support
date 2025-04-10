import { useState, useEffect, useCallback } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { Card } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { useToast } from '@/components/ui/use-toast';
import { useGameProgress } from '@/hooks/useGameProgress';
import type { GameConfig, GameProgress } from '@/types/brain-games';
import { cn } from '@/lib/utils';

interface SequenceItem {
  id: number;
  color: string;
  sound: number; // Frequency for sound
  isActive: boolean;
}

interface SequenceMasterProps {
  config: GameConfig;
  onComplete: (progress: GameProgress) => void;
  className?: string;
}

const COLORS = [
  { bg: 'bg-red-500', hover: 'hover:bg-red-600' },
  { bg: 'bg-blue-500', hover: 'hover:bg-blue-600' },
  { bg: 'bg-green-500', hover: 'hover:bg-green-600' },
  { bg: 'bg-yellow-500', hover: 'hover:bg-yellow-600' },
];

const FREQUENCIES = [261.63, 329.63, 392.00, 523.25]; // C4, E4, G4, C5

export function SequenceMaster({ config, onComplete, className }: SequenceMasterProps) {
  const [sequence, setSequence] = useState<number[]>([]);
  const [playerSequence, setPlayerSequence] = useState<number[]>([]);
  const [isPlaying, setIsPlaying] = useState(false);
  const [isShowingSequence, setIsShowingSequence] = useState(false);
  const [score, setScore] = useState(0);
  const [level, setLevel] = useState(1);
  const [gameOver, setGameOver] = useState(false);
  const [audioContext, setAudioContext] = useState<AudioContext | null>(null);
  const { toast } = useToast();
  const { saveProgress } = useGameProgress();

  // Initialize audio context
  useEffect(() => {
    const context = new (window.AudioContext || (window as any).webkitAudioContext)();
    setAudioContext(context);
    return () => {
      context.close();
    };
  }, []);

  const playSound = useCallback((frequency: number) => {
    if (!audioContext) return;
    
    const oscillator = audioContext.createOscillator();
    const gainNode = audioContext.createGain();
    
    oscillator.connect(gainNode);
    gainNode.connect(audioContext.destination);
    
    oscillator.type = 'sine';
    oscillator.frequency.setValueAtTime(frequency, audioContext.currentTime);
    
    gainNode.gain.setValueAtTime(0, audioContext.currentTime);
    gainNode.gain.linearRampToValueAtTime(0.5, audioContext.currentTime + 0.1);
    gainNode.gain.linearRampToValueAtTime(0, audioContext.currentTime + 0.5);
    
    oscillator.start(audioContext.currentTime);
    oscillator.stop(audioContext.currentTime + 0.5);
  }, [audioContext]);

  const generateSequence = useCallback(() => {
    const newSequence = [...sequence];
    newSequence.push(Math.floor(Math.random() * 4));
    setSequence(newSequence);
    return newSequence;
  }, [sequence]);

  const playSequence = useCallback(async (seq: number[]) => {
    setIsShowingSequence(true);
    
    for (let i = 0; i < seq.length; i++) {
      await new Promise<void>(resolve => {
        setTimeout(() => {
          playSound(FREQUENCIES[seq[i]]);
          resolve();
        }, 1000);
      });
    }
    
    setIsShowingSequence(false);
  }, [playSound]);

  const startGame = useCallback(async () => {
    setIsPlaying(true);
    setScore(0);
    setLevel(1);
    setGameOver(false);
    setSequence([]);
    setPlayerSequence([]);
    
    const newSequence = generateSequence();
    await playSequence(newSequence);
  }, [generateSequence, playSequence]);

  const handleTileClick = useCallback(async (index: number) => {
    if (isShowingSequence || !isPlaying || gameOver) return;

    playSound(FREQUENCIES[index]);
    const newPlayerSequence = [...playerSequence, index];
    setPlayerSequence(newPlayerSequence);

    // Check if the player's sequence matches the game sequence
    for (let i = 0; i < newPlayerSequence.length; i++) {
      if (newPlayerSequence[i] !== sequence[i]) {
        setGameOver(true);
        const progress: GameProgress = {
          id: crypto.randomUUID(),
          userId: '', // Will be set by the hook
          gameId: config.id,
          score,
          accuracy: (score / (level * 100)) * 100,
          timeSpent: level * 10,
          difficulty: config.difficulty,
          completedAt: new Date().toISOString(),
          metrics: {
            correctAnswers: score,
            wrongAnswers: 1,
            streaks: level - 1,
            focusScore: Math.min(100, (score / (level * 100)) * 100)
          }
        };

        await saveProgress(progress);
        onComplete(progress);
        return;
      }
    }

    // If player completed the sequence correctly
    if (newPlayerSequence.length === sequence.length) {
      setScore(score + (level * 100));
      setLevel(level + 1);
      setPlayerSequence([]);
      
      toast({
        title: "Level Complete!",
        description: `Score: ${score + (level * 100)}`,
      });

      // Generate and play new sequence
      setTimeout(async () => {
        const newSequence = generateSequence();
        await playSequence(newSequence);
      }, 1000);
    }
  }, [isShowingSequence, isPlaying, gameOver, playerSequence, sequence, level, score, config.id, generateSequence, playSequence, playSound, saveProgress, onComplete, toast]);

  return (
    <Card className={cn("p-6 space-y-6", className)}>
      <div className="flex justify-between items-center">
        <div className="space-y-1">
          <h3 className="text-2xl font-bold">Sequence Master</h3>
          <p className="text-sm text-muted-foreground">
            Remember and repeat the sequence
          </p>
        </div>
        <div className="text-right">
          <div className="text-2xl font-mono">{score}</div>
          <div className="text-sm text-muted-foreground">Level {level}</div>
        </div>
      </div>

      {!isPlaying ? (
        <div className="space-y-4">
          <p>
            Watch the sequence of colors and sounds, then repeat it in the same order.
            The sequence gets longer as you progress!
          </p>
          <Button onClick={startGame} size="lg" className="w-full">
            Start Game
          </Button>
        </div>
      ) : (
        <>
          <div className="grid grid-cols-2 gap-4 aspect-square">
            {COLORS.map((color, index) => (
              <motion.button
                key={index}
                className={cn(
                  "rounded-lg transition-colors",
                  color.bg,
                  color.hover,
                  "disabled:opacity-50"
                )}
                disabled={isShowingSequence || gameOver}
                onClick={() => handleTileClick(index)}
                whileTap={{ scale: 0.95 }}
                animate={{
                  opacity: sequence[playerSequence.length] === index && isShowingSequence ? 1 : 0.8
                }}
              />
            ))}
          </div>

          {gameOver && (
            <div className="text-center space-y-4">
              <h4 className="text-xl font-semibold">Game Over!</h4>
              <p>Final Score: {score}</p>
              <Button onClick={startGame}>Play Again</Button>
            </div>
          )}

          {isShowingSequence && (
            <div className="text-center text-sm text-muted-foreground">
              Watch the sequence...
            </div>
          )}
        </>
      )}
    </Card>
  );
}
