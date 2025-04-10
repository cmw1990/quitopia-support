import { useState, useEffect } from "react";
import { Card } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Brain, RefreshCw } from "lucide-react";
import { useToast } from "@/hooks/use-toast";
import { motion } from "framer-motion";
import { usePatternGame } from "./usePatternGame";
import { PatternGrid } from "./PatternGrid";
import { GameStatus } from "./GameStatus";
import { supabasePost } from "@/lib/supabaseApiService";
import { useAuth } from "@/contexts/AuthContext";

export const PatternRecognitionGame = () => {
  const { toast } = useToast();
  const { user } = useAuth();
  const {
    pattern,
    userPattern,
    score,
    isPlaying,
    isShowingPattern,
    difficulty,
    handleCellClick,
    startNewGame,
    setDifficulty,
  } = usePatternGame();

  const saveScore = async () => {
    if (!user?.id) {
        toast({
            title: "Not Logged In",
            description: "Log in to save your score.",
            variant: "destructive",
        });
        return;
    }
    if (score <= 0) {
        toast({
            title: "No Score",
            description: "Complete the game to save a score.",
        });
        return;
    }

    try {
      const { error } = await supabasePost(
        "board_games",
        [{
            user_id: user.id,
            game_type: "pattern_recognition",
            score,
            difficulty_level: difficulty,
            status: "completed",
        }]
      );

      if (error) throw error;

      toast({
        title: "Score saved!",
        description: `You scored ${score} points`,
      });
    } catch (error) {
      console.error("Error saving score:", error);
      toast({
        title: "Error saving score",
        description: "Please try again",
        variant: "destructive",
      });
    }
  };

  return (
    <div className="container max-w-4xl mx-auto p-4 space-y-6">
      <Card className="p-6">
        <div className="flex flex-col md:flex-row justify-between items-center gap-4 mb-6">
          <div className="flex items-center gap-3">
            <div className="p-2 bg-primary/10 rounded-full">
              <Brain className="h-5 w-5 text-primary" />
            </div>
            <h2 className="text-2xl font-bold">Pattern Recognition</h2>
          </div>
          <div className="flex items-center gap-4">
            <div className="text-lg font-semibold">Score: {score}</div>
            <Button 
              onClick={startNewGame}
              variant="outline"
              size="icon"
              disabled={isShowingPattern}
            >
              <RefreshCw className="h-4 w-4" />
            </Button>
          </div>
        </div>

        <div className="space-y-6">
          <GameStatus 
            isPlaying={isPlaying}
            isShowingPattern={isShowingPattern}
            difficulty={difficulty}
            setDifficulty={setDifficulty}
          />

          <PatternGrid
            pattern={pattern}
            userPattern={userPattern}
            isShowingPattern={isShowingPattern}
            onCellClick={handleCellClick}
          />

          {!isPlaying && score > 0 && (
            <motion.div
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              className="flex justify-center"
            >
              <Button onClick={saveScore}>Save Score</Button>
            </motion.div>
          )}
        </div>
      </Card>
    </div>
  );
};

export default PatternRecognitionGame;