import { useState, useEffect } from "react";
import { Card } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { useToast } from "@/hooks/use-toast";
import { supabasePost } from "@/lib/supabaseApiService";
import { useAuth } from "@/contexts/AuthContext";
import { Brain, CheckCircle2, XCircle } from "lucide-react";

interface LogicPuzzle {
  question: string;
  options: string[];
  correctAnswer: number;
  explanation: string;
}

const PUZZLES: LogicPuzzle[] = [
  {
    question: "If all roses are flowers, and some flowers fade quickly, which statement must be true?",
    options: [
      "All roses fade quickly",
      "Some roses may fade quickly",
      "No roses fade quickly",
      "Roses never fade"
    ],
    correctAnswer: 1,
    explanation: "Since only some flowers fade quickly, and all roses are flowers, we can only conclude that some roses MAY fade quickly. We cannot say all roses fade quickly."
  },
  {
    question: "In a race, if you pass the person in second place, what position are you in?",
    options: [
      "First place",
      "Second place",
      "Third place",
      "Last place"
    ],
    correctAnswer: 1,
    explanation: "If you pass the person in second place, you take their position - second place. You haven't passed the person in first place."
  },
  {
    question: "All mammals are warm-blooded. No reptiles are warm-blooded. Therefore:",
    options: [
      "Some mammals are reptiles",
      "All reptiles are mammals",
      "No mammals are reptiles",
      "Some reptiles are warm-blooded"
    ],
    correctAnswer: 2,
    explanation: "Since all mammals are warm-blooded and no reptiles are warm-blooded, there can be no overlap between mammals and reptiles."
  }
];

const LogicPuzzles = () => {
  const [currentPuzzle, setCurrentPuzzle] = useState<number>(0);
  const [score, setScore] = useState<number>(0);
  const [showExplanation, setShowExplanation] = useState<boolean>(false);
  const [isActive, setIsActive] = useState<boolean>(false);
  const [timeLeft, setTimeLeft] = useState<number>(60);
  const [isSubmitting, setIsSubmitting] = useState<boolean>(false);
  const { toast } = useToast();
  const { user } = useAuth();

  useEffect(() => {
    let interval: NodeJS.Timeout;
    if (isActive && timeLeft > 0) {
      interval = setInterval(() => {
        setTimeLeft((prev) => prev - 1);
      }, 1000);
    } else if (timeLeft === 0 && isActive) {
      endGame();
    }
    return () => clearInterval(interval);
  }, [isActive, timeLeft]);

  const startGame = () => {
    setIsActive(true);
    setScore(0);
    setTimeLeft(60);
    setCurrentPuzzle(0);
    setShowExplanation(false);
  };

  const handleAnswer = async (selectedAnswer: number) => {
    const isCorrect = selectedAnswer === PUZZLES[currentPuzzle].correctAnswer;
    
    if (isCorrect) {
      setScore(prev => prev + 1);
      toast({
        title: "Correct!",
        description: "Well done! Let's see the explanation.",
      });
    } else {
      toast({
        title: "Not quite right",
        description: "Let's learn from this. Check the explanation.",
        variant: "destructive",
      });
    }
    
    setShowExplanation(true);
  };

  const nextPuzzle = () => {
    if (currentPuzzle < PUZZLES.length - 1) {
      setCurrentPuzzle(prev => prev + 1);
      setShowExplanation(false);
    } else {
      endGame();
    }
  };

  const endGame = async () => {
    setIsActive(false);
    setIsSubmitting(true);
    
    if (user?.id) {
      try {
        const { error } = await supabasePost(
          "energy_focus_logs",
          [{
            user_id: user.id,
            activity_type: "logic_puzzles",
            activity_name: "Logic Puzzles",
            duration_minutes: 1,
            focus_rating: Math.round((score / PUZZLES.length) * 10),
            energy_rating: null,
            notes: `Completed logic puzzles with score: ${score}/${PUZZLES.length}`
          }]
        );

        if (error) throw error;

        toast({
          title: "Game Complete!",
          description: `Final score: ${score}/${PUZZLES.length}. Great job!`,
        });
      } catch (error) {
        console.error("Error logging logic puzzles:", error);
        toast({
          title: "Error Saving Results",
          description: "There was a problem saving your game results.",
          variant: "destructive",
        });
      } finally {
        setIsSubmitting(false);
      }
    }
  };

  return (
    <Card className="p-6 hover:shadow-lg transition-shadow">
      <div className="flex flex-col md:flex-row justify-between items-center gap-4 mb-6">
        <div className="flex items-center gap-3">
          <div className="p-2 bg-primary/10 rounded-full animate-float">
            <Brain className="h-5 w-5 text-primary" />
          </div>
          <h2 className="text-2xl font-bold">Logic Puzzles</h2>
        </div>
        <div className="flex items-center gap-4">
          <div className="text-lg">Score: {score}/{PUZZLES.length}</div>
          <div className="text-lg">Time: {timeLeft}s</div>
        </div>
      </div>

      {!isActive ? (
        <Button 
          onClick={startGame} 
          className="w-full animate-pulse"
          disabled={isSubmitting}
        >
          Start Game
        </Button>
      ) : (
        <div className="space-y-6">
          <div className="text-lg font-medium">
            {PUZZLES[currentPuzzle].question}
          </div>
          
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            {PUZZLES[currentPuzzle].options.map((option, index) => (
              <Button
                key={index}
                onClick={() => handleAnswer(index)}
                variant="outline"
                className="p-4 h-auto text-left hover:scale-105 transition-transform"
                disabled={showExplanation || isSubmitting}
              >
                {showExplanation && index === PUZZLES[currentPuzzle].correctAnswer && (
                  <CheckCircle2 className="h-5 w-5 text-green-500 mr-2 inline-block" />
                )}
                {showExplanation && index !== PUZZLES[currentPuzzle].correctAnswer && (
                  <XCircle className="h-5 w-5 text-red-500 mr-2 inline-block" />
                )}
                {option}
              </Button>
            ))}
          </div>

          {showExplanation && (
            <div className="mt-4 p-4 bg-muted rounded-lg animate-fade-in">
              <h3 className="font-semibold mb-2">Explanation:</h3>
              <p>{PUZZLES[currentPuzzle].explanation}</p>
              <Button 
                onClick={nextPuzzle}
                className="mt-4"
                disabled={isSubmitting}
              >
                {currentPuzzle < PUZZLES.length - 1 ? "Next Puzzle" : "Finish Game"}
              </Button>
            </div>
          )}
        </div>
      )}

      <div className="mt-6 text-sm text-muted-foreground">
        Read each puzzle carefully and select the most logical answer. Take your time to think through each option.
      </div>
    </Card>
  );
};

export default LogicPuzzles;