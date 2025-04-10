import { useState } from 'react';
import { Card } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { ReproductiveHealthTimer } from './ReproductiveHealthTimer';
import { ExerciseInstructions } from './ExerciseInstructions';
import { AnimatedExerciseDisplay } from './AnimatedExerciseDisplay';
import { useToast } from '@/hooks/use-toast';
import { supabase } from '@/integrations/supabase/supabase-client';
import { useAuth } from '@/components/AuthProvider';

interface ReproductiveHealthSessionProps {
  exerciseId: string;
  name: string;
  type: string;
  difficulty: number;
  duration: number;
  holdDuration: number;
  restDuration: number;
  instructions: string[];
  onComplete: () => void;
}

export const ReproductiveHealthSession = ({
  exerciseId,
  name,
  type,
  difficulty,
  duration,
  holdDuration,
  restDuration,
  instructions,
  onComplete
}: ReproductiveHealthSessionProps) => {
  const [currentStep, setCurrentStep] = useState(0);
  const [isActive, setIsActive] = useState(false);
  const { toast } = useToast();
  const { session } = useAuth();

  const handleComplete = async () => {
    if (!session?.user) {
      toast({
        title: "Session not saved",
        description: "Please sign in to save your progress",
        variant: "destructive",
      });
      return;
    }

    try {
      const { error } = await supabase
        .from('reproductive_health_progress')
        .insert({
          user_id: session.user.id,
          exercise_id: exerciseId,
          difficulty_level: difficulty,
          total_duration_seconds: duration,
          sets_completed: 1,
          perceived_effort: difficulty
        });

      if (error) throw error;

      toast({
        title: "Exercise completed!",
        description: "Your progress has been saved.",
      });
      
      onComplete();
    } catch (error) {
      console.error('Error saving progress:', error);
      toast({
        title: "Error saving progress",
        description: "Please try again",
        variant: "destructive",
      });
    }
  };

  return (
    <Card className="p-4 space-y-4">
      <div className="flex justify-between items-center">
        <h3 className="text-lg font-semibold">{name}</h3>
        <Button
          variant="outline"
          size="sm"
          onClick={() => setIsActive(!isActive)}
        >
          {isActive ? 'Pause' : 'Start'}
        </Button>
      </div>

      <div className="grid gap-4 md:grid-cols-2">
        <div>
          <AnimatedExerciseDisplay
            imageUrl="/placeholder.svg"
            exerciseType={type}
            isActive={isActive}
            progress={(currentStep / instructions.length) * 100}
            instructions={instructions}
            currentStep={currentStep}
            onStepChange={setCurrentStep}
          />
        </div>
        
        <div className="space-y-4">
          <ReproductiveHealthTimer
            exerciseType={type}
            duration={duration}
            holdDuration={holdDuration}
            restDuration={restDuration}
            onComplete={handleComplete}
          />
          
          <ExerciseInstructions
            instructions={instructions}
            currentStep={currentStep}
          />
        </div>
      </div>
    </Card>
  );
};