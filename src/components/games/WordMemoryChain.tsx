import { useState, useEffect } from "react";
import { Card } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { useToast } from "@/hooks/use-toast";
import { SUPABASE_URL, SUPABASE_KEY } from "@/integrations/supabase/db-client";
import { useAuth } from "@/components/AuthProvider";
import { Brain, BookOpen } from "lucide-react";

const STARTER_WORDS = [
  "ocean", "mountain", "forest", "desert", "river",
  "book", "music", "art", "dance", "poetry",
  "sun", "moon", "star", "cloud", "rain"
];

const WordMemoryChain = () => {
  const [wordChain, setWordChain] = useState<string[]>([]);
  const [userInput, setUserInput] = useState("");
  const [isShowingChain, setIsShowingChain] = useState(false);
  const [score, setScore] = useState(0);
  const [isActive, setIsActive] = useState(false);
  const [isSubmitting, setIsSubmitting] = useState(false);
  const { toast } = useToast();
  const { session } = useAuth();

  useEffect(() => {
    if (isShowingChain) {
      const timer = setTimeout(() => {
        setIsShowingChain(false);
      }, wordChain.length * 1000);
      return () => clearTimeout(timer);
    }
  }, [isShowingChain, wordChain.length]);

  const startGame = () => {
    const startWord = STARTER_WORDS[Math.floor(Math.random() * STARTER_WORDS.length)];
    setWordChain([startWord]);
    setScore(0);
    setIsActive(true);
    setIsShowingChain(true);
    toast({
      title: "Game Started!",
      description: "Remember the word chain and add related words.",
    });
  };

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (!userInput.trim() || isShowingChain) return;

    const lastWord = wordChain[wordChain.length - 1];
    const input = userInput.trim().toLowerCase();

    // Check if the word is related (simple check - shares at least 2 letters)
    const isRelated = [...lastWord].filter(letter => input.includes(letter)).length >= 2;

    if (isRelated && !wordChain.includes(input)) {
      setScore(prev => prev + input.length);
      setWordChain(prev => [...prev, input]);
      setUserInput("");
      setIsShowingChain(true);
    } else {
      endGame();
    }
  };

  const endGame = async () => {
    setIsActive(false);
    setIsSubmitting(true);
    
    if (session?.user) {
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
              activity_type: "word_memory",
              activity_name: "Word Memory Chain",
              duration_minutes: Math.ceil(wordChain.length / 2),
              focus_rating: Math.round((score / 50) * 10),
              energy_rating: null,
              notes: `Completed word chain with ${wordChain.length} words and score: ${score}`
            })
          }
        );

        if (!response.ok) {
          const error = await response.json();
          throw new Error(error.message || response.statusText);
        }

        toast({
          title: "Game Over!",
          description: `Final score: ${score}. Chain length: ${wordChain.length}`,
        });
      } catch (error) {
        console.error("Error logging word memory:", error);
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
          <div className="p-2 bg-primary/10 rounded-full">
            <BookOpen className="h-5 w-5 text-primary animate-pulse" />
          </div>
          <h2 className="text-2xl font-bold bg-gradient-to-r from-primary to-secondary bg-clip-text text-transparent">
            Word Memory Chain
          </h2>
        </div>
        <div className="text-lg font-semibold">
          Score: <span className="text-primary">{score}</span>
        </div>
      </div>

      {isActive ? (
        <div className="space-y-4">
          <div className="p-4 bg-muted rounded-lg min-h-[100px] flex items-center justify-center text-center">
            {isShowingChain ? (
              <div className="animate-fade-in space-y-2">
                <div className="text-xl font-medium">Remember this chain:</div>
                <div className="text-primary">{wordChain.join(" → ")}</div>
              </div>
            ) : (
              <form onSubmit={handleSubmit} className="w-full max-w-md">
                <Input
                  type="text"
                  value={userInput}
                  onChange={(e) => setUserInput(e.target.value)}
                  placeholder="Enter a related word..."
                  className="text-center"
                  disabled={isSubmitting}
                />
              </form>
            )}
          </div>
          
          <Button 
            variant="destructive" 
            onClick={endGame}
            className="w-full"
            disabled={isSubmitting}
          >
            End Game
          </Button>
        </div>
      ) : (
        <Button 
          onClick={startGame} 
          className="w-full group relative overflow-hidden"
          disabled={isSubmitting}
        >
          <span className="relative z-10">Start Game</span>
          <div className="absolute inset-0 bg-gradient-to-r from-primary via-secondary to-primary opacity-75 group-hover:animate-shimmer" />
        </Button>
      )}

      <div className="mt-6">
        <div className="text-sm text-muted-foreground">
          Build a chain of related words. Each word must share at least two letters with the previous word.
          The longer the chain and the longer the words, the higher your score!
        </div>
        <div className="mt-2 flex items-center gap-2 text-xs text-muted-foreground">
          <Brain className="h-4 w-4" />
          <span>Improves: Semantic Memory, Word Association, Vocabulary</span>
        </div>
      </div>
    </Card>
  );
};

export default WordMemoryChain;