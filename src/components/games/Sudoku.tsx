import { useState, useEffect } from "react";
import { Card } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { useToast } from "@/hooks/use-toast";
import { supabasePost } from "@/lib/supabaseApiService";
import { useAuth } from "@/contexts/AuthContext";
import { GameControls } from "./shared/GameControls";
import { useSudokuGame } from "./sudoku/useSudokuGame";
import { SudokuBoard } from "./sudoku/SudokuBoard";
import { SudokuControls } from "./sudoku/SudokuControls";
import { SudokuStats } from "./sudoku/SudokuStats";

const Sudoku = () => {
  const { user } = useAuth();
  const { toast } = useToast();
  const [isSubmitting, setIsSubmitting] = useState(false);
  const {
    board,
    solution,
    difficulty,
    moves,
    score,
    timeElapsed,
    isComplete,
    setDifficulty,
    handleCellChange,
    checkSolution,
    newGame,
    undoMove,
    redoMove,
  } = useSudokuGame();

  const saveScore = async () => {
    if (!user?.id || score === 0) return;
    
    setIsSubmitting(true);
    try {
      const { error } = await supabasePost(
        "energy_focus_logs",
        [{
          user_id: user.id,
          activity_type: "brain_game",
          activity_name: "Sudoku",
          duration_minutes: Math.ceil(timeElapsed / 60),
          focus_rating: Math.min(100, score),
          notes: `Completed Sudoku puzzle on ${difficulty} difficulty with score ${score}`
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
    <Card className="p-6">
      <div className="space-y-6">
        <div className="flex items-center justify-between">
          <h2 className="text-2xl font-bold">Sudoku</h2>
          <GameControls
            onNewGame={newGame}
            onUndo={undoMove}
            onRedo={redoMove}
            difficulty={difficulty}
            onDifficultyChange={setDifficulty}
          />
        </div>

        <SudokuStats
          score={score}
          timeElapsed={timeElapsed}
          difficulty={difficulty}
        />

        <SudokuBoard
          board={board}
          solution={solution}
          onCellChange={handleCellChange}
          isComplete={isComplete}
        />

        <SudokuControls
          onCheck={checkSolution}
          onSave={saveScore}
          isComplete={isComplete}
          isSubmitting={isSubmitting}
        />
      </div>
    </Card>
  );
};

export default Sudoku;