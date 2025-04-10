import { Button } from "@/components/ui/button";

interface GameFooterProps {
  score: number;
  isSubmitting: boolean;
  onSaveScore: () => void;
}

export const GameFooter = ({ score, isSubmitting, onSaveScore }: GameFooterProps) => {
  return (
    <div className="flex justify-between items-center">
      <div className="text-sm text-muted-foreground">
        Match 3 tiles to form equations with results divisible by 3
      </div>
      <Button onClick={onSaveScore} disabled={score === 0 || isSubmitting}>
        Save Score
      </Button>
    </div>
  );
};