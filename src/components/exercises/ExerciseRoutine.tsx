import { useState } from 'react';
import { Card } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Tabs, TabsList, TabsTrigger, TabsContent } from '@/components/ui/tabs';
import { SpecializedExerciseDisplay } from './SpecializedExerciseDisplay';
import { AnimatedExerciseDisplay } from './AnimatedExerciseDisplay';
import { Play, Pause, RotateCcw } from 'lucide-react';

interface ExerciseRoutineProps {
  routineName: string;
  exercises: Array<{
    name: string;
    type: string;
    sets: number;
    reps: number;
    holdDuration: number;
    restDuration: number;
    instructions: string[];
  }>;
}

export const ExerciseRoutine = ({
  routineName,
  exercises
}: ExerciseRoutineProps) => {
  const [currentExercise, setCurrentExercise] = useState(0);
  const [isActive, setIsActive] = useState(false);
  const [completed, setCompleted] = useState<number[]>([]);

  const handleComplete = () => {
    setCompleted([...completed, currentExercise]);
    if (currentExercise < exercises.length - 1) {
      setCurrentExercise(currentExercise + 1);
    } else {
      setIsActive(false);
    }
  };

  const handleReset = () => {
    setCurrentExercise(0);
    setCompleted([]);
    setIsActive(false);
  };

  return (
    <Card className="p-4 space-y-4">
      <div className="flex justify-between items-center">
        <h3 className="text-lg font-semibold">{routineName}</h3>
        <div className="flex gap-2">
          <Button
            variant="outline"
            size="sm"
            onClick={() => setIsActive(!isActive)}
          >
            {isActive ? <Pause className="h-4 w-4" /> : <Play className="h-4 w-4" />}
          </Button>
          <Button
            variant="outline"
            size="sm"
            onClick={handleReset}
          >
            <RotateCcw className="h-4 w-4" />
          </Button>
        </div>
      </div>

      <Tabs defaultValue="exercise" className="w-full">
        <TabsList className="grid w-full grid-cols-2">
          <TabsTrigger value="exercise">Exercise</TabsTrigger>
          <TabsTrigger value="instructions">Instructions</TabsTrigger>
        </TabsList>

        <TabsContent value="exercise">
          {exercises[currentExercise].type === 'specialized' ? (
            <SpecializedExerciseDisplay
              exerciseType={exercises[currentExercise].type}
              duration={300}
              sets={exercises[currentExercise].sets}
              reps={exercises[currentExercise].reps}
              holdDuration={exercises[currentExercise].holdDuration}
              restDuration={exercises[currentExercise].restDuration}
              onComplete={handleComplete}
            />
          ) : (
            <AnimatedExerciseDisplay
              imageUrl="/placeholder.svg"
              exerciseType={exercises[currentExercise].type}
              isActive={isActive}
              progress={(completed.length / exercises.length) * 100}
              instructions={exercises[currentExercise].instructions}
            />
          )}
        </TabsContent>

        <TabsContent value="instructions" className="space-y-4">
          <div className="space-y-2">
            {exercises[currentExercise].instructions.map((instruction, index) => (
              <div key={index} className="flex gap-2">
                <span className="font-medium">{index + 1}.</span>
                <p>{instruction}</p>
              </div>
            ))}
          </div>
        </TabsContent>
      </Tabs>

      <div className="flex justify-center gap-2">
        {exercises.map((_, index) => (
          <div
            key={index}
            className={`w-2 h-2 rounded-full transition-all duration-300 ${
              completed.includes(index)
                ? 'bg-primary'
                : index === currentExercise
                ? 'bg-primary/60'
                : 'bg-gray-200'
            }`}
          />
        ))}
      </div>
    </Card>
  );
};