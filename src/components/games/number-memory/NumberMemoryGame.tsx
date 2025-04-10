import React, { useState, useEffect, useCallback } from 'react';
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Card } from "@/components/ui/card";
import { useToast } from "@/components/ui/use-toast";
import { SUPABASE_URL, SUPABASE_KEY } from '@/integrations/supabase/db-client';
import { useAuth } from '@/components/AuthProvider';

const NumberMemoryGame = () => {
  const [sequence, setSequence] = useState<number[]>([]);
  const [userInput, setUserInput] = useState('');
  const [showingSequence, setShowingSequence] = useState(false);
  const [gameStarted, setGameStarted] = useState(false);
  const [score, setScore] = useState(0);
  const [level, setLevel] = useState(3); // Start with 3 digits
  const { toast } = useToast();
  const { session } = useAuth();

  const generateSequence = useCallback(() => {
    const newSequence = Array.from(
      { length: level },
      () => Math.floor(Math.random() * 10)
    );
    setSequence(newSequence);
  }, [level]);

  const startNewRound = useCallback(() => {
    setUserInput('');
    setShowingSequence(true);
    generateSequence();
    setGameStarted(true);

    // Hide the sequence after 2 seconds * current level
    setTimeout(() => {
      setShowingSequence(false);
    }, level * 1000);
  }, [generateSequence, level]);

  const handleSubmit = async () => {
    const userSequence = userInput.split('').map(Number);
    const correct = sequence.join('') === userSequence.join('');

    if (correct) {
      const newScore = score + level;
      setScore(newScore);
      setLevel(prev => prev + 1);
      toast({
        title: "Correct!",
        description: `Moving to level ${level + 1}`,
      });

      // Save the score to Supabase
      try {
        const response = await fetch(
          `${SUPABASE_URL}/rest/v1/board_games`,
          {
            method: 'POST',
            headers: {
              'Content-Type': 'application/json',
              'apikey': SUPABASE_KEY,
              'Authorization': `Bearer ${session?.access_token}`,
              'Prefer': 'return=minimal'
            },
            body: JSON.stringify({
              game_type: 'digit_span',
              score: newScore,
              difficulty_level: level,
              game_state: { sequence, userInput: userSequence },
              status: 'completed',
              user_id: session?.user?.id
            })
          }
        );

        if (!response.ok) {
          const error = await response.json();
          throw new Error(error.message || response.statusText);
        }
      } catch (error) {
        console.error('Error saving score:', error);
      }

    } else {
      toast({
        title: "Incorrect",
        description: `The sequence was ${sequence.join('')}. Game Over! Final score: ${score}`,
        variant: "destructive",
      });
      setGameStarted(false);
      setLevel(3);
      setScore(0);
    }
    setUserInput('');
  };

  useEffect(() => {
    if (gameStarted && !showingSequence) {
      const input = document.getElementById('number-input');
      input?.focus();
    }
  }, [showingSequence, gameStarted]);

  return (
    <Card className="p-6 max-w-lg mx-auto">
      <div className="space-y-4">
        <div className="text-center">
          <h2 className="text-2xl font-bold mb-2">Digit Span Memory Test</h2>
          <p className="text-gray-600 mb-4">
            Remember the sequence of numbers and type them in order
          </p>
          <div className="mb-4">
            <p className="font-semibold">Level: {level - 2}</p>
            <p className="font-semibold">Score: {score}</p>
          </div>
        </div>

        {!gameStarted ? (
          <Button 
            onClick={startNewRound}
            className="w-full"
          >
            Start Game
          </Button>
        ) : showingSequence ? (
          <div className="text-4xl font-bold text-center p-8">
            {sequence.join(' ')}
          </div>
        ) : (
          <div className="space-y-4">
            <Input
              id="number-input"
              type="number"
              value={userInput}
              onChange={(e) => setUserInput(e.target.value)}
              placeholder="Enter the sequence"
              className="text-center text-2xl"
              onKeyPress={(e) => {
                if (e.key === 'Enter') {
                  handleSubmit();
                }
              }}
            />
            <Button 
              onClick={handleSubmit}
              className="w-full"
            >
              Submit
            </Button>
          </div>
        )}
      </div>
    </Card>
  );
};

export default NumberMemoryGame;