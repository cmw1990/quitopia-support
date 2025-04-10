import { useState, useEffect, useCallback } from 'react';
import { Card } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Progress } from '@/components/ui/progress';
import { useToast } from '@/components/ui/use-toast';
import { useGameProgress } from '@/hooks/useGameProgress';
import type { GameConfig, GameProgress } from '@/types/brain-games';
import { cn } from '@/lib/utils';

interface WritingSpeedmasterProps {
  config: GameConfig;
  onComplete: (progress: GameProgress) => void;
  className?: string;
}

const WRITING_PROMPTS = [
  "Describe your ideal productivity environment in one concise paragraph.",
  "Write a clear email requesting a meeting with your team.",
  "Summarize your main goals for today in three sentences.",
  "Compose a brief message explaining why you need to recharge.",
  "Write instructions for a simple mindfulness exercise."
];

export function WritingSpeedmaster({ config, onComplete, className }: WritingSpeedmasterProps) {
  const [currentPrompt, setCurrentPrompt] = useState('');
  const [userText, setUserText] = useState('');
  const [timeLeft, setTimeLeft] = useState(60);
  const [isPlaying, setIsPlaying] = useState(false);
  const [wordsPerMinute, setWordsPerMinute] = useState(0);
  const [accuracy, setAccuracy] = useState(100);
  const [energyImpact, setEnergyImpact] = useState(0);
  const { toast } = useToast();
  const { saveProgress } = useGameProgress();

  const calculateMetrics = useCallback(() => {
    const wordCount = userText.trim().split(/\s+/).length;
    const wpm = Math.round((wordCount / (60 - timeLeft)) * 60);
    const accuracyScore = Math.min(100, Math.max(0, 100 - (getErrorCount() * 2)));
    
    setWordsPerMinute(wpm);
    setAccuracy(accuracyScore);
    
    // Calculate energy impact based on performance
    const impact = Math.min(10, Math.max(-10,
      (wpm > 40 ? 5 : -2) + // Speed bonus/penalty
      (accuracyScore > 90 ? 5 : -3) + // Accuracy bonus/penalty
      (wordCount > 100 ? 3 : -1) // Length bonus/penalty
    ));
    setEnergyImpact(impact);
    
    return { wpm, accuracyScore, impact };
  }, [userText, timeLeft]);

  const getErrorCount = useCallback(() => {
    // Simple error detection - can be enhanced with more sophisticated checks
    const errors = userText.split('').filter(char => 
      !char.match(/[a-zA-Z\s.,!?-]/)
    ).length;
    return errors;
  }, [userText]);

  const startGame = useCallback(() => {
    setCurrentPrompt(WRITING_PROMPTS[Math.floor(Math.random() * WRITING_PROMPTS.length)]);
    setUserText('');
    setTimeLeft(60);
    setIsPlaying(true);
    setWordsPerMinute(0);
    setAccuracy(100);
  }, []);

  const endGame = useCallback(async () => {
    setIsPlaying(false);
    const { wpm, accuracyScore, impact } = calculateMetrics();
    
    const progress: GameProgress = {
      id: crypto.randomUUID(),
      userId: '', // Set by hook
      gameId: config.id,
      score: Math.round((wpm * accuracyScore) / 100),
      accuracy: accuracyScore,
      timeSpent: 60,
      difficulty: config.difficulty,
      completedAt: new Date().toISOString(),
      metrics: {
        wordsPerMinute: wpm,
        correctAnswers: userText.split(/\s+/).length,
        wrongAnswers: getErrorCount(),
        focusScore: accuracyScore,
        energyImpact: impact
      }
    };

    await saveProgress(progress);
    onComplete(progress);

    toast({
      title: "Writing Session Complete!",
      description: `WPM: ${wpm} | Accuracy: ${accuracyScore}% | Energy Impact: ${impact > 0 ? '+' : ''}${impact}`,
    });
  }, [config.id, config.difficulty, calculateMetrics, getErrorCount, onComplete, saveProgress, toast, userText]);

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
          <h3 className="text-2xl font-bold">Writing Speedmaster</h3>
          <p className="text-sm text-muted-foreground">
            Enhance your writing speed and clarity
          </p>
        </div>
        {isPlaying && (
          <div className="text-right">
            <div className="text-2xl font-mono">{timeLeft}s</div>
            <div className="text-sm text-muted-foreground">
              WPM: {wordsPerMinute}
            </div>
          </div>
        )}
      </div>

      {!isPlaying ? (
        <div className="space-y-4">
          <p>
            Challenge yourself to write quickly and accurately. 
            You'll be given a prompt related to productivity and wellness.
            Write as much as you can in 60 seconds!
          </p>
          <Button onClick={startGame} size="lg" className="w-full">
            Start Writing Challenge
          </Button>
        </div>
      ) : (
        <div className="space-y-4">
          <div className="p-4 bg-muted rounded-lg">
            <p className="font-medium">{currentPrompt}</p>
          </div>
          
          <textarea
            className="w-full h-40 p-4 rounded-lg border focus:ring-2 focus:ring-primary"
            value={userText}
            onChange={(e) => setUserText(e.target.value)}
            placeholder="Start typing here..."
            autoFocus
          />
          
          <div className="space-y-2">
            <div className="flex justify-between text-sm">
              <span>Progress</span>
              <span>{Math.round((60 - timeLeft) / 0.6)}%</span>
            </div>
            <Progress value={(60 - timeLeft) / 0.6} />
          </div>
        </div>
      )}
    </Card>
  );
}
