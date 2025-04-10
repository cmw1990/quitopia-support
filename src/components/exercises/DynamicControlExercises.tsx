import { useState } from 'react';
import { Card } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Activity, ChevronRight } from 'lucide-react';
import { AnimatedExerciseDisplay } from './AnimatedExerciseDisplay';

interface Exercise {
  name: string;
  type: string;
  duration: number;
  instructions: string[];
  difficulty: 'beginner' | 'intermediate' | 'advanced';
  targetMuscles: string[];
  benefits: string[];
}

const dynamicExercises: Exercise[] = [
  {
    name: "Elevator Lifts",
    type: "control",
    duration: 300,
    instructions: [
      "Imagine your muscles as an elevator",
      "Gradually contract upwards in stages",
      "Hold at the top floor",
      "Slowly release down floor by floor"
    ],
    difficulty: "intermediate",
    targetMuscles: ["Pelvic floor", "Deep core"],
    benefits: ["Improved control", "Better awareness"]
  },
  {
    name: "Wave Contractions",
    type: "endurance",
    duration: 240,
    instructions: [
      "Start with a gentle contraction",
      "Gradually increase intensity like a wave",
      "Peak at maximum contraction",
      "Slowly release back down"
    ],
    difficulty: "advanced",
    targetMuscles: ["Pelvic floor", "Core stabilizers"],
    benefits: ["Muscle coordination", "Endurance"]
  },
  {
    name: "Butterfly Pulses",
    type: "strength",
    duration: 180,
    instructions: [
      "Quick, light contractions",
      "Think of butterfly wings fluttering",
      "Maintain a steady rhythm",
      "Focus on precise control"
    ],
    difficulty: "beginner",
    targetMuscles: ["Pelvic floor"],
    benefits: ["Quick response", "Muscle recruitment"]
  }
];

export const DynamicControlExercises = () => {
  const [selectedExercise, setSelectedExercise] = useState<Exercise | null>(null);

  return (
    <Card className="p-4">
      <div className="flex items-center gap-2 mb-4">
        <Activity className="h-5 w-5 text-primary" />
        <h3 className="font-semibold">Dynamic Control Exercises</h3>
      </div>

      {!selectedExercise ? (
        <div className="space-y-4">
          {dynamicExercises.map((exercise) => (
            <Button
              key={exercise.name}
              variant="outline"
              className="w-full justify-between p-4 h-auto"
              onClick={() => setSelectedExercise(exercise)}
            >
              <div className="flex flex-col items-start">
                <span className="font-medium">{exercise.name}</span>
                <span className="text-sm text-muted-foreground capitalize">
                  {exercise.difficulty} • {exercise.duration / 60}min
                </span>
              </div>
              <ChevronRight className="h-4 w-4" />
            </Button>
          ))}
        </div>
      ) : (
        <div className="space-y-4">
          <AnimatedExerciseDisplay
            imageUrl="/placeholder.svg"
            exerciseType={selectedExercise.type}
            isActive={true}
            progress={0}
            instructions={selectedExercise.instructions}
          />
          
          <div className="space-y-2">
            <h4 className="font-medium">Target Muscles</h4>
            <div className="flex flex-wrap gap-2">
              {selectedExercise.targetMuscles.map((muscle) => (
                <span
                  key={muscle}
                  className="px-2 py-1 bg-primary/10 rounded-full text-sm"
                >
                  {muscle}
                </span>
              ))}
            </div>
          </div>

          <div className="space-y-2">
            <h4 className="font-medium">Benefits</h4>
            <div className="flex flex-wrap gap-2">
              {selectedExercise.benefits.map((benefit) => (
                <span
                  key={benefit}
                  className="px-2 py-1 bg-secondary/10 rounded-full text-sm"
                >
                  {benefit}
                </span>
              ))}
            </div>
          </div>

          <Button
            variant="outline"
            className="w-full"
            onClick={() => setSelectedExercise(null)}
          >
            Back to Exercises
          </Button>
        </div>
      )}
    </Card>
  );
};