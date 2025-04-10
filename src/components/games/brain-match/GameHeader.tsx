import { Button } from "@/components/ui/button";
import { Brain, RefreshCw } from "lucide-react";

interface GameHeaderProps {
  score: number;
  onNewGame: () => void;
  isSubmitting: boolean;
}

export const GameHeader = ({ score, onNewGame, isSubmitting }: GameHeaderProps) => {
  return (
    <div className="flex flex-col md:flex-row justify-between items-center gap-4 mb-6">
      <div className="flex items-center gap-3">
        <div className="p-2 bg-primary/10 rounded-full">
          <Brain className="h-5 w-5 text-primary" />
        </div>
        <h2 className="text-2xl font-bold">Brain Match 3</h2>
      </div>
      <div className="flex items-center gap-4">
        <div className="text-lg font-semibold">Score: {score}</div>
        <Button 
          onClick={onNewGame}
          variant="outline"
          size="icon"
          disabled={isSubmitting}
        >
          <RefreshCw className="h-4 w-4" />
        </Button>
      </div>
    </div>
  );
};