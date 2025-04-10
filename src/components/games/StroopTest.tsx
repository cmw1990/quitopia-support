import { useState, useEffect } from "react";
import { Card } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { useToast } from "@/hooks/use-toast";
import { supabasePost } from "@/lib/supabaseApiService";
import { useAuth } from "@/contexts/AuthContext";

type ColorWord = {
  word: string;
  color: string;
};

const COLORS = [
  { name: 'RED', hex: '#EF4444' },
  { name: 'BLUE', hex: '#3B82F6' },
  { name: 'GREEN', hex: '#10B981' },
  { name: 'YELLOW', hex: '#F59E0B' },
  { name: 'PURPLE', hex: '#8B5CF6' }
];

const StroopTest = () => {
  const { user } = useAuth();
  const { toast } = useToast();
  const [currentWord, setCurrentWord] = useState<ColorWord | null>(null);
  const [score, setScore] = useState(0);
  const [rounds, setRounds] = useState(0);
  const [gameStarted, setGameStarted] = useState(false);
  const [isSubmitting, setIsSubmitting] = useState(false);

  const generateNewWord = () => {
    const wordIndex = Math.floor(Math.random() * COLORS.length);
    let colorIndex;
    do {
      colorIndex = Math.floor(Math.random() * COLORS.length);
    } while (colorIndex === wordIndex); // Ensure word and color are different

    return {
      word: COLORS[wordIndex].name,
      color: COLORS[colorIndex].hex
    };
  };

  const startGame = () => {
    setScore(0);
    setRounds(0);
    setGameStarted(true);
    setCurrentWord(generateNewWord());
  };

  const handleColorClick = (selectedColor: string) => {
    if (!currentWord || !gameStarted) return;

    const isCorrect = selectedColor === currentWord.color;
    if (isCorrect) {
      setScore(prev => prev + 10);
      toast({
        title: "Correct!",
        description: "+10 points",
      });
    } else {
      toast({
        title: "Incorrect",
        description: "Try again!",
        variant: "destructive",
      });
    }

    const newRounds = rounds + 1;
    setRounds(newRounds);

    if (newRounds >= 20) {
      endGame();
    } else {
      setCurrentWord(generateNewWord());
    }
  };

  const endGame = async () => {
    setGameStarted(false);
    if (!user?.id || score === 0) return;

    setIsSubmitting(true);
    try {
      const { error } = await supabasePost(
        "energy_focus_logs",
        [{
          user_id: user.id,
          activity_type: "brain_game",
          activity_name: "Stroop Test",
          duration_minutes: Math.ceil(score / 30),
          focus_rating: Math.min(100, score),
          energy_rating: null,
          notes: `Completed Stroop Test with score ${score}`
        }]
      );

      if (error) throw error;

      toast({
        title: "Score saved!",
        description: "Your progress has been recorded.",
      });
    } catch (error) {
      console.error("Error saving score:", error);
      toast({
        title: "Error Saving Score",
        description: "There was a problem saving your progress.",
        variant: "destructive",
      });
    } finally {
      setIsSubmitting(false);
    }
  };

  return (
    <Card className="p-6 max-w-2xl mx-auto">
      <div className="text-center space-y-6">
        <div>
          <h2 className="text-2xl font-bold mb-2">Stroop Test</h2>
          <p className="text-muted-foreground">
            Click the color the word is written in, not the word itself!
          </p>
        </div>

        <div className="flex justify-between items-center px-4">
          <div className="text-lg font-semibold">Score: {score}</div>
          <div className="text-lg font-semibold">Rounds: {rounds}/20</div>
        </div>

        {!gameStarted ? (
          <Button 
            onClick={startGame}
            disabled={isSubmitting}
            className="w-full"
          >
            Start Game
          </Button>
        ) : (
          <>
            {currentWord && (
              <div className="space-y-6">
                <div 
                  className="text-4xl font-bold py-8"
                  style={{ color: currentWord.color }}
                >
                  {currentWord.word}
                </div>
                <div className="grid grid-cols-2 gap-4">
                  {COLORS.map((color) => (
                    <Button
                      key={color.hex}
                      onClick={() => handleColorClick(color.hex)}
                      className="h-16"
                      style={{ backgroundColor: color.hex }}
                    >
                      {color.name}
                    </Button>
                  ))}
                </div>
              </div>
            )}
          </>
        )}
      </div>
    </Card>
  );
};

export default StroopTest;