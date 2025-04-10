import { Heart } from "lucide-react";
import { Progress } from "@/components/ui/progress";

interface MoodDisplayProps {
  mood: {
    mood_score: number;
    energy_level: number;
  };
}

export const MoodDisplay = ({ mood }: MoodDisplayProps) => {
  return (
    <div className="flex items-center gap-4 p-3 bg-muted/50 rounded-lg">
      <div className="flex items-center gap-2">
        <Heart className="h-4 w-4 text-rose-500" />
        <span className="text-sm">Mood: {mood.mood_score}/10</span>
      </div>
      <Progress 
        value={mood.energy_level * 10} 
        className="h-2 w-24"
      />
    </div>
  );
};