import { useState, useEffect, useCallback } from "react";
import { useToast } from "@/hooks/use-toast";

export const usePatternGame = () => {
  const { toast } = useToast();
  const [pattern, setPattern] = useState<number[]>([]);
  const [userPattern, setUserPattern] = useState<number[]>([]);
  const [score, setScore] = useState(0);
  const [isPlaying, setIsPlaying] = useState(false);
  const [isShowingPattern, setIsShowingPattern] = useState(false);
  const [difficulty, setDifficulty] = useState(1);

  const generatePattern = useCallback(() => {
    const length = difficulty + 2;
    const newPattern: number[] = [];
    for (let i = 0; i < length; i++) {
      newPattern.push(Math.floor(Math.random() * 9));
    }
    return newPattern;
  }, [difficulty]);

  const startNewGame = useCallback(() => {
    setScore(0);
    setIsPlaying(true);
    setUserPattern([]);
    const newPattern = generatePattern();
    setPattern(newPattern);
    setIsShowingPattern(true);
    
    setTimeout(() => {
      setIsShowingPattern(false);
    }, 2000 + (difficulty * 500));
  }, [difficulty, generatePattern]);

  const handleCellClick = (index: number) => {
    if (isShowingPattern) return;
    
    const newUserPattern = [...userPattern, index];
    setUserPattern(newUserPattern);

    // Check if the user's pattern matches so far
    if (pattern[userPattern.length] !== index) {
      setIsPlaying(false);
      toast({
        title: "Game Over!",
        description: `Final score: ${score}`,
        variant: "destructive",
      });
      return;
    }

    // If the user completed the pattern correctly
    if (newUserPattern.length === pattern.length) {
      setScore((prev) => prev + (difficulty * 10));
      toast({
        title: "Pattern Complete!",
        description: "Get ready for the next one!",
      });
      
      setTimeout(() => {
        setUserPattern([]);
        const newPattern = generatePattern();
        setPattern(newPattern);
        setIsShowingPattern(true);
        
        setTimeout(() => {
          setIsShowingPattern(false);
        }, 2000 + (difficulty * 500));
      }, 1000);
    }
  };

  useEffect(() => {
    return () => {
      setIsPlaying(false);
      setPattern([]);
      setUserPattern([]);
    };
  }, []);

  return {
    pattern,
    userPattern,
    score,
    isPlaying,
    isShowingPattern,
    difficulty,
    handleCellClick,
    startNewGame,
    setDifficulty,
  };
};