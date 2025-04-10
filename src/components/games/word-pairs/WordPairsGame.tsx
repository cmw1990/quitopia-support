import { useState, useEffect } from 'react';
import { Card } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { useToast } from "@/hooks/use-toast";
import { SUPABASE_URL, SUPABASE_KEY } from "@/integrations/supabase/db-client";
import { useAuth } from "@/components/AuthProvider";
import { Brain } from "lucide-react";

interface WordPair {
  id: string;
  word1: string;
  word2: string;
  category: string;
}

const WORD_PAIRS: WordPair[] = [
  { id: '1', word1: 'sky', word2: 'blue', category: 'nature' },
  { id: '2', word1: 'fire', word2: 'hot', category: 'elements' },
  { id: '3', word1: 'tree', word2: 'green', category: 'nature' },
  { id: '4', word1: 'snow', word2: 'cold', category: 'weather' },
  { id: '5', word1: 'sun', word2: 'bright', category: 'nature' },
  { id: '6', word1: 'moon', word2: 'night', category: 'nature' },
  { id: '7', word1: 'rain', word2: 'wet', category: 'weather' },
  { id: '8', word1: 'wind', word2: 'blow', category: 'weather' }
];

export const WordPairsGame = () => {
  const [availableWords, setAvailableWords] = useState<string[]>([]);
  const [selectedWords, setSelectedWords] = useState<string[]>([]);
  const [score, setScore] = useState(0);
  const [isActive, setIsActive] = useState(false);
  const [isSubmitting, setIsSubmitting] = useState(false);
  const { toast } = useToast();
  const { session } = useAuth();

  useEffect(() => {
    if (selectedWords.length === 2) {
      checkPair();
    }
  }, [selectedWords]);

  const startGame = () => {
    const allWords = WORD_PAIRS.flatMap(pair => [pair.word1, pair.word2]).sort(() => Math.random() - 0.5);
    setAvailableWords(allWords);
    setSelectedWords([]);
    setScore(0);
    setIsActive(true);
  };

  const handleWordClick = (word: string) => {
    if (selectedWords.length < 2 && !selectedWords.includes(word)) {
      setSelectedWords([...selectedWords, word]);
    }
  };

  const checkPair = () => {
    const [word1, word2] = selectedWords;
    const isPair = WORD_PAIRS.some(pair => 
      (pair.word1 === word1 && pair.word2 === word2) || 
      (pair.word1 === word2 && pair.word2 === word1)
    );

    if (isPair) {
      setScore(prev => prev + 1);
      setAvailableWords(prev => prev.filter(word => !selectedWords.includes(word)));
      toast({
        title: "Correct!",
        description: "You found a matching pair!",
      });
    } else {
      toast({
        title: "Incorrect",
        description: "These words don't form a pair",
        variant: "destructive",
      });
    }

    setTimeout(() => {
      setSelectedWords([]);
      if (isPair && availableWords.length <= 2) {
        endGame();
      }
    }, 1000);
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
              activity_type: "word_pairs",
              activity_name: "Word Pairs",
              duration_minutes: Math.ceil(score / 2),
              focus_rating: Math.round((score / WORD_PAIRS.length) * 10),
              energy_rating: null,
              notes: `Completed Word Pairs with score: ${score}/${WORD_PAIRS.length}`
            })
          }
        );

        if (!response.ok) {
          const error = await response.json();
          throw new Error(error.message || response.statusText);
        }

        toast({
          title: "Game Complete!",
          description: `Final score: ${score}/${WORD_PAIRS.length}. Well done!`,
        });
      } catch (error) {
        console.error("Error logging Word Pairs:", error);
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
          <h2 className="text-2xl font-bold">Word Pairs</h2>
        </div>
        <div className="text-lg font-semibold">
          Score: {score}/{WORD_PAIRS.length}
        </div>
      </div>

      {!isActive ? (
        <Button 
          onClick={startGame} 
          className="w-full animate-pulse bg-primary/90 hover:bg-primary"
          disabled={isSubmitting}
        >
          Start Game
        </Button>
      ) : (
        <div className="grid grid-cols-2 sm:grid-cols-3 md:grid-cols-4 gap-4">
          {availableWords.map((word, index) => (
            <Button
              key={index}
              onClick={() => handleWordClick(word)}
              variant={selectedWords.includes(word) ? "default" : "outline"}
              className="h-16 text-lg font-medium"
              disabled={selectedWords.length === 2 || isSubmitting}
            >
              {word}
            </Button>
          ))}
        </div>
      )}

      <div className="mt-6 text-sm text-muted-foreground">
        Find matching pairs of words that are related to each other. Click two words to check if they form a pair.
      </div>
    </Card>
  );
};

export default WordPairsGame;