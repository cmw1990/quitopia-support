import React, { useState, useEffect, useCallback } from 'react';
import { Card } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Brain, Volume2, Square } from 'lucide-react';
import { useToast } from '@/hooks/use-toast';
import { useAuth } from '@/components/AuthProvider';
import { supabase } from '@/integrations/supabase/supabase-client';
import { useQuery } from '@tanstack/react-query';

const GRID_SIZE = 3;
const LETTERS = ['C', 'H', 'K', 'L', 'Q', 'R', 'S', 'T'];
const TRIAL_INTERVAL = 3000;

const DualNBackGame = () => {
  const { session } = useAuth();
  const { toast } = useToast();
  const [nBack, setNBack] = useState(2);
  const [score, setScore] = useState(0);
  const [trials, setTrials] = useState<Array<{ position: number; letter: string }>>([]);
  const [currentTrial, setCurrentTrial] = useState(0);
  const [isPlaying, setIsPlaying] = useState(false);
  const [positionMatches, setPositionMatches] = useState(0);
  const [audioMatches, setAudioMatches] = useState(0);
  const [gameOver, setGameOver] = useState(false);

  const { data: highScore } = useQuery({
    queryKey: ['dual-n-back-score', session?.user?.id],
    queryFn: async () => {
      const { data, error } = await supabase
        .from('board_games')
        .select('score')
        .eq('user_id', session?.user?.id)
        .eq('game_type', 'n_back')
        .order('score', { ascending: false })
        .limit(1)
        .single();

      if (error && error.code !== 'PGRST116') throw error;
      return data?.score || 0;
    },
    enabled: !!session?.user?.id,
  });

  const generateTrials = useCallback(() => {
    const newTrials = Array(20).fill(null).map(() => ({
      position: Math.floor(Math.random() * (GRID_SIZE * GRID_SIZE)),
      letter: LETTERS[Math.floor(Math.random() * LETTERS.length)],
    }));
    setTrials(newTrials);
    return newTrials;
  }, []);

  const speakLetter = useCallback((letter: string) => {
    const utterance = new SpeechSynthesisUtterance(letter);
    utterance.rate = 1;
    window.speechSynthesis.speak(utterance);
  }, []);

  const checkMatch = useCallback((type: 'position' | 'audio') => {
    if (currentTrial < nBack) return;
    
    const currentItem = trials[currentTrial];
    const nBackItem = trials[currentTrial - nBack];
    
    const isMatch = type === 'position' 
      ? currentItem.position === nBackItem.position
      : currentItem.letter === nBackItem.letter;
    
    if (isMatch) {
      setScore(prev => prev + 1);
      type === 'position' ? setPositionMatches(prev => prev + 1) : setAudioMatches(prev => prev + 1);
      
      toast({
        title: "Correct!",
        description: `${type === 'position' ? 'Position' : 'Audio'} match found`,
      });
    }
  }, [currentTrial, nBack, trials, toast]);

  const startGame = async () => {
    setScore(0);
    setCurrentTrial(0);
    setPositionMatches(0);
    setAudioMatches(0);
    setGameOver(false);
    const newTrials = generateTrials();
    setIsPlaying(true);
    
    // Start the game loop
    let trial = 0;
    const gameInterval = setInterval(() => {
      if (trial >= newTrials.length) {
        clearInterval(gameInterval);
        setIsPlaying(false);
        setGameOver(true);
        saveScore();
        return;
      }
      
      speakLetter(newTrials[trial].letter);
      setCurrentTrial(trial);
      trial++;
    }, TRIAL_INTERVAL);
  };

  const saveScore = async () => {
    if (!session?.user?.id) return;

    const { error } = await supabase
      .from('board_games')
      .insert({
        user_id: session.user.id,
        game_type: 'n_back',
        score,
        game_state: { nBack, positionMatches, audioMatches },
        status: 'completed'
      });

    if (error) {
      toast({
        title: "Error saving score",
        description: "Please try again later",
        variant: "destructive",
      });
    }
  };

  return (
    <div className="container mx-auto p-4 max-w-4xl">
      <Card className="p-6">
        <div className="text-center mb-6">
          <h1 className="text-2xl font-bold mb-2">Dual N-Back</h1>
          <p className="text-muted-foreground">
            Remember both position and sound from {nBack} steps back
          </p>
        </div>

        <div className="mb-6 flex justify-center items-center gap-4">
          <Button
            variant="outline"
            onClick={() => setNBack(prev => Math.max(1, prev - 1))}
            disabled={isPlaying}
          >
            -
          </Button>
          <span className="text-xl font-bold">{nBack}-Back</span>
          <Button
            variant="outline"
            onClick={() => setNBack(prev => Math.min(4, prev + 1))}
            disabled={isPlaying}
          >
            +
          </Button>
        </div>

        <div className="grid grid-cols-3 gap-2 mb-6 aspect-square">
          {Array(GRID_SIZE * GRID_SIZE).fill(null).map((_, index) => (
            <div
              key={index}
              className={`aspect-square rounded-lg border-2 flex items-center justify-center
                ${trials[currentTrial]?.position === index ? 'bg-primary' : 'bg-background'}`}
            >
              {trials[currentTrial]?.position === index && (
                <Square className="w-8 h-8 text-primary-foreground" />
              )}
            </div>
          ))}
        </div>

        <div className="flex justify-center gap-4 mb-6">
          <Button
            onClick={() => checkMatch('position')}
            disabled={!isPlaying}
            className="flex items-center gap-2"
          >
            <Brain className="w-4 h-4" />
            Position Match
          </Button>
          <Button
            onClick={() => checkMatch('audio')}
            disabled={!isPlaying}
            className="flex items-center gap-2"
          >
            <Volume2 className="w-4 h-4" />
            Audio Match
          </Button>
        </div>

        <div className="text-center space-y-4">
          {!isPlaying && !gameOver && (
            <Button onClick={startGame} size="lg">
              Start Game
            </Button>
          )}
          
          {gameOver && (
            <div className="space-y-4">
              <h2 className="text-xl font-bold">Game Over!</h2>
              <p>Final Score: {score}</p>
              <p>High Score: {highScore || 0}</p>
              <Button onClick={startGame} size="lg">
                Play Again
              </Button>
            </div>
          )}

          {isPlaying && (
            <div className="space-y-2">
              <p>Current Score: {score}</p>
              <p>Position Matches: {positionMatches}</p>
              <p>Audio Matches: {audioMatches}</p>
            </div>
          )}
        </div>
      </Card>
    </div>
  );
};

export default DualNBackGame;