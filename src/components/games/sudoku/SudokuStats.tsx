import { Card } from "@/components/ui/card";
import { Trophy, Clock } from "lucide-react";

interface SudokuStatsProps {
  score: number;
  timeElapsed: number;
  difficulty: string;
}

export const SudokuStats = ({ score, timeElapsed, difficulty }: SudokuStatsProps) => {
  const formatTime = (seconds: number) => {
    const minutes = Math.floor(seconds / 60);
    const remainingSeconds = seconds % 60;
    return `${minutes}:${remainingSeconds.toString().padStart(2, "0")}`;
  };

  return (
    <div className="grid grid-cols-3 gap-4">
      <Card className="p-4 flex items-center justify-center space-x-2">
        <Trophy className="h-4 w-4 text-yellow-500" />
        <span className="font-bold">{score}</span>
      </Card>
      <Card className="p-4 flex items-center justify-center space-x-2">
        <Clock className="h-4 w-4 text-blue-500" />
        <span>{formatTime(timeElapsed)}</span>
      </Card>
      <Card className="p-4 flex items-center justify-center">
        <span className="capitalize">{difficulty}</span>
      </Card>
    </div>
  );
};