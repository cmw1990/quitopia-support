import { useState, useEffect, useCallback } from "react";
import { Card } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { useToast } from "@/hooks/use-toast";
import { Brain, Target } from "lucide-react";
import { supabase } from "@/integrations/supabase/supabase-client";
import { motion, AnimatePresence } from "framer-motion";

const SEQUENCE_LENGTH = 20;
const STIMULUS_DURATION = 2500;
const INITIAL_N = 2;

type Stimulus = {
  position: number;
  letter: string;
};

const generateStimulus = (): Stimulus => {
  const letters = 'ABCDEFGHIJKLMNOPQRSTUVWXYZ';
  return {
    position: Math.floor(Math.random() * 9),
    letter: letters[Math.floor(Math.random() * letters.length)]
  };
};

const generateSequence = (length: number): Stimulus[] => {
  const sequence: Stimulus[] = [];
  for (let i = 0; i < length; i++) {
    sequence.push(generateStimulus());
  }
  return sequence;
};

export const NBackGame = () => {
  const { toast } = useToast();
  const [sequence, setSequence] = useState<Stimulus[]>([]);
  const [currentIndex, setCurrentIndex] = useState(-1);
  const [score, setScore] = useState(0);
  const [nBack, setNBack] = useState(INITIAL_N);
  const [isPlaying, setIsPlaying] = useState(false);
  const [responses, setResponses] = useState<boolean[]>([]);
  const [gameOver, setGameOver] = useState(false);

  const checkMatch = useCallback((current: Stimulus, previous: Stimulus): boolean => {
    return current.position === previous.position && current.letter === previous.letter;
  }, []);

  const handleResponse = useCallback((isMatch: boolean) => {
    if (!isPlaying || currentIndex < nBack) return;

    const actualMatch = checkMatch(
      sequence[currentIndex],
      sequence[currentIndex - nBack]
    );

    if (isMatch === actualMatch) {
      setScore(prev => prev + 1);
      toast({
        title: "Correct!",
        description: `Good job! Keep going!`,
      });
    } else {
      toast({
        title: "Incorrect",
        description: "Try to focus on both position and letter",
        variant: "destructive",
      });
    }

    setResponses(prev => [...prev, isMatch]);
  }, [isPlaying, currentIndex, nBack, sequence, checkMatch, toast]);

  const startGame = useCallback(async () => {
    setSequence(generateSequence(SEQUENCE_LENGTH));
    setCurrentIndex(-1);
    setScore(0);
    setResponses([]);
    setGameOver(false);
    setIsPlaying(true);
  }, []);

  const saveScore = async () => {
    try {
      const { error } = await supabase
        .from('board_games')
        .insert({
          game_type: 'n_back',
          score: score,
          game_state: { nBack, responses },
          difficulty_level: nBack,
        });

      if (error) throw error;

      toast({
        title: "Score saved!",
        description: `Your score of ${score} has been recorded.`,
      });
    } catch (error) {
      console.error('Error saving score:', error);
      toast({
        title: "Error saving score",
        description: "Please try again later",
        variant: "destructive",
      });
    }
  };

  useEffect(() => {
    if (!isPlaying) return;

    const interval = setInterval(() => {
      setCurrentIndex(prev => {
        if (prev + 1 >= SEQUENCE_LENGTH) {
          setIsPlaying(false);
          setGameOver(true);
          saveScore();
          return prev;
        }
        return prev + 1;
      });
    }, STIMULUS_DURATION);

    return () => clearInterval(interval);
  }, [isPlaying]);

  return (
    <Card className="p-6 bg-primary/5 border-2 border-primary/20">
      <div className="flex flex-col items-center space-y-6">
        <div className="p-4 bg-primary/10 rounded-full">
          <Brain className="h-12 w-12 text-primary animate-pulse" />
        </div>

        <div className="text-center">
          <h2 className="text-3xl font-bold mb-2">N-Back Test</h2>
          <p className="text-muted-foreground">
            Remember the position and letter from {nBack} steps ago
          </p>
        </div>

        <div className="flex gap-4">
          <Button
            onClick={() => setNBack(prev => Math.max(1, prev - 1))}
            disabled={isPlaying}
            variant="outline"
          >
            Decrease N
          </Button>
          <Button
            onClick={() => setNBack(prev => prev + 1)}
            disabled={isPlaying}
            variant="outline"
          >
            Increase N
          </Button>
        </div>

        <div className="text-xl font-semibold">
          Level: {nBack}-Back | Score: {score}
        </div>

        <div className="relative w-64 h-64 grid grid-cols-3 grid-rows-3 gap-2 bg-background/80 rounded-lg p-4">
          <AnimatePresence>
            {isPlaying && currentIndex >= 0 && (
              <motion.div
                key={currentIndex}
                initial={{ scale: 0 }}
                animate={{ scale: 1 }}
                exit={{ scale: 0 }}
                className="absolute"
                style={{
                  left: `${(sequence[currentIndex].position % 3) * 33.33}%`,
                  top: `${Math.floor(sequence[currentIndex].position / 3) * 33.33}%`,
                  width: '33.33%',
                  height: '33.33%',
                }}
              >
                <div className="flex items-center justify-center w-full h-full">
                  <span className="text-2xl font-bold">
                    {sequence[currentIndex].letter}
                  </span>
                </div>
              </motion.div>
            )}
          </AnimatePresence>
        </div>

        <div className="flex gap-4">
          {!isPlaying && !gameOver && (
            <Button onClick={startGame} className="w-32">
              Start Game
            </Button>
          )}
          {isPlaying && currentIndex >= nBack && (
            <>
              <Button
                onClick={() => handleResponse(true)}
                className="w-32"
                variant="outline"
              >
                Match
              </Button>
              <Button
                onClick={() => handleResponse(false)}
                className="w-32"
                variant="outline"
              >
                No Match
              </Button>
            </>
          )}
          {gameOver && (
            <Button onClick={startGame} className="w-32">
              Play Again
            </Button>
          )}
        </div>

        {gameOver && (
          <div className="text-center">
            <h3 className="text-xl font-semibold mb-2">Game Over!</h3>
            <p>Final Score: {score}</p>
          </div>
        )}
      </div>
    </Card>
  );
};

export default NBackGame;
