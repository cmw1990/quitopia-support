import { Button } from "@/components/ui/button";
import { Check, Save } from "lucide-react";

interface SudokuControlsProps {
  onCheck: () => void;
  onSave: () => void;
  isComplete: boolean;
  isSubmitting: boolean;
}

export const SudokuControls = ({
  onCheck,
  onSave,
  isComplete,
  isSubmitting,
}: SudokuControlsProps) => {
  return (
    <div className="flex justify-center gap-4">
      <Button onClick={onCheck} disabled={isComplete}>
        <Check className="mr-2 h-4 w-4" />
        Check Solution
      </Button>
      <Button onClick={onSave} disabled={!isComplete || isSubmitting}>
        <Save className="mr-2 h-4 w-4" />
        Save Score
      </Button>
    </div>
  );
};