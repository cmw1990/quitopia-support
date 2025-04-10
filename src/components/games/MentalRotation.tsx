import { useState, useEffect } from 'react';
import { Card } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { useToast } from '@/hooks/use-toast';
import { SUPABASE_URL, SUPABASE_KEY } from '@/integrations/supabase/db-client';
import { useAuth } from '@/components/AuthProvider';
import { Brain, RotateCw } from 'lucide-react';

const MentalRotation = () => {
  const [currentShape, setCurrentShape] = useState<string>('');
  const [rotatedShapes, setRotatedShapes] = useState<string[]>([]);
  const [correctAnswer, setCorrectAnswer] = useState<number>(0);
  const [score, setScore] = useState(0);
  const [level, setLevel] = useState(1);
  const [isPlaying, setIsPlaying] = useState(false);
  const [isSubmitting, setIsSubmitting] = useState(false);
  const { toast } = useToast();
  const { session } = useAuth();

  const shapes = [
    '⌘', '⌥', '⌃', '⇧', '⎋', '⇪', '⌫', '↩', '⇄', '⇅'
  ];

  const generateRotation = (degrees: number) => {
    return `rotate(${degrees}deg)`;
  };

  const generateQuestion = () => {
    const baseShape = shapes[Math.floor(Math.random() * shapes.length)];
    setCurrentShape(baseShape);

    const rotations = Array(4).fill(0).map((_, i) => {
      const rotation = Math.floor(Math.random() * 360);
      return { shape: baseShape, rotation };
    });

    const correctIndex = Math.floor(Math.random() * 4);
    rotations[correctIndex].rotation = 0;
    setCorrectAnswer(correctIndex);

    setRotatedShapes(rotations.map(r => r.shape));
  };

  const handleAnswer = async (index: number) => {
    if (index === correctAnswer) {
      const newScore = score + (level * 10);
      setScore(newScore);
      
      if (newScore > 0 && newScore % 50 === 0) {
        setLevel(prev => prev + 1);
        toast({
          title: "Level Up!",
          description: `You've reached level ${level + 1}`,
        });
      }

      toast({
        title: "Correct!",
        description: "Well done!",
      });
    } else {
      toast({
        title: "Incorrect",
        description: "Try again!",
        variant: "destructive",
      });
    }

    generateQuestion();
  };

  const startGame = () => {
    setScore(0);
    setLevel(1);
    setIsPlaying(true);
    generateQuestion();
  };

  const endGame = async () => {
    if (!session?.user?.id || score === 0) return;
    
    setIsSubmitting(true);
    try {
      const response = await fetch(
        `${SUPABASE_URL}/rest/v1/energy_focus_logs`,
        {
          method: 'POST',
          headers: {
            'Content-Type': 'application/json',
            'apikey': SUPABASE_KEY,
            'Authorization': `Bearer ${session.access_token}`,
            'Prefer': 'return=minimal'
          },
          body: JSON.stringify({
            user_id: session.user.id,
            activity_type: "brain_game",
            activity_name: "Mental Rotation",
            duration_minutes: Math.ceil(score / 30),
            focus_rating: Math.min(Math.round((score / 100) * 10), 10),
            energy_rating: null,
            notes: `Completed Mental Rotation game with score ${score}`
          })
        }
      );

      if (!response.ok) {
        const error = await response.json();
        throw new Error(error.message || response.statusText);
      }

      toast({
        title: "Game Over!",
        description: `Final score: ${score}. Great job!`,
      });
    } catch (error) {
      console.error("Error saving game results:", error);
      toast({
        title: "Error Saving Results",
        description: "There was a problem saving your game results.",
        variant: "destructive",
      });
    } finally {
      setIsSubmitting(false);
      setIsPlaying(false);
    }
  };

  return (
    <Card className="p-6">
      <div className="flex flex-col items-center gap-6">
        <div className="flex items-center gap-3">
          <div className="p-2 bg-primary/10 rounded-full">
            <Brain className="h-5 w-5 text-primary" />
          </div>
          <h2 className="text-2xl font-bold">Mental Rotation</h2>
        </div>

        <div className="text-center space-y-2">
          <div className="text-lg font-semibold">Score: {score}</div>
          <div className="text-sm text-muted-foreground">Level: {level}</div>
        </div>

        {isPlaying ? (
          <>
            <div className="text-4xl mb-8">{currentShape}</div>
            
            <div className="grid grid-cols-2 gap-4">
              {rotatedShapes.map((shape, index) => (
                <Button
                  key={index}
                  onClick={() => handleAnswer(index)}
                  className="h-24 w-24 text-3xl"
                  variant="outline"
                >
                  <div style={{ transform: generateRotation(Math.random() * 360) }}>
                    {shape}
                  </div>
                </Button>
              ))}
            </div>

            <Button 
              onClick={endGame}
              variant="destructive"
              disabled={isSubmitting}
            >
              End Game
            </Button>
          </>
        ) : (
          <>
            <p className="text-center text-muted-foreground max-w-md">
              Test your spatial reasoning by identifying which shape matches the original orientation.
              The shapes will be rotated at different angles - find the one that matches!
            </p>
            
            <Button 
              onClick={startGame}
              className="gap-2"
            >
              <RotateCw className="h-4 w-4" />
              Start Game
            </Button>
          </>
        )}
      </div>
    </Card>
  );
};

export default MentalRotation;