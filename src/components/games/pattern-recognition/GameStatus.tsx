import { Button } from "@/components/ui/button";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";

interface GameStatusProps {
  isPlaying: boolean;
  isShowingPattern: boolean;
  difficulty: number;
  setDifficulty: (difficulty: number) => void;
}

export const GameStatus = ({
  isPlaying,
  isShowingPattern,
  difficulty,
  setDifficulty,
}: GameStatusProps) => {
  return (
    <div className="flex flex-col sm:flex-row justify-between items-center gap-4 p-4 bg-muted/50 rounded-lg">
      <div className="text-lg">
        {!isPlaying
          ? "Start a new game!"
          : isShowingPattern
          ? "Watch the pattern..."
          : "Reproduce the pattern!"}
      </div>
      <div className="flex items-center gap-4">
        <span className="text-sm text-muted-foreground">Difficulty:</span>
        <Select
          value={difficulty.toString()}
          onValueChange={(value) => setDifficulty(parseInt(value))}
          disabled={isPlaying}
        >
          <SelectTrigger className="w-32">
            <SelectValue />
          </SelectTrigger>
          <SelectContent>
            <SelectItem value="1">Easy</SelectItem>
            <SelectItem value="2">Medium</SelectItem>
            <SelectItem value="3">Hard</SelectItem>
          </SelectContent>
        </Select>
      </div>
    </div>
  );
};