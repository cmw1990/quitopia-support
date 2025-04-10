import { Card } from '@/components/ui/card';
import { Check } from 'lucide-react';

interface ExerciseInstructionsProps {
  instructions: string[];
  currentStep: number;
}

export const ExerciseInstructions = ({
  instructions,
  currentStep
}: ExerciseInstructionsProps) => {
  return (
    <Card className="p-4">
      <h3 className="font-semibold mb-4">Exercise Instructions</h3>
      <div className="space-y-3">
        {instructions.map((instruction, index) => (
          <div 
            key={index}
            className={`flex items-start gap-3 p-2 rounded-lg transition-colors ${
              index === currentStep ? 'bg-primary/10' : ''
            }`}
          >
            <div className={`mt-1 ${
              index <= currentStep ? 'text-primary' : 'text-muted-foreground'
            }`}>
              {index <= currentStep ? (
                <Check className="h-4 w-4" />
              ) : (
                <div className="h-4 w-4 rounded-full border-2 border-current" />
              )}
            </div>
            <p className={`text-sm ${
              index === currentStep ? 'text-primary font-medium' : 'text-muted-foreground'
            }`}>
              {instruction}
            </p>
          </div>
        ))}
      </div>
    </Card>
  );
};