import { useState } from 'react';
import { motion } from 'framer-motion';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { Separator } from '@/components/ui/separator';
import { ScrollArea } from '@/components/ui/scroll-area';
import {
  Clock,
  Dumbbell,
  Flame,
  Heart,
  ChevronRight,
  Target,
} from 'lucide-react';
import AnimatedExerciseGuide from './AnimatedExerciseGuide';

interface ExerciseGuideCardProps {
  exercise: {
    id: string;
    name: string;
    description: string;
    difficulty: 'beginner' | 'intermediate' | 'advanced';
    duration: number;
    calories: number;
    targetMuscles: string[];
    benefits: string[];
    animationUrl?: string;
    videoUrl?: string;
    imageUrls?: string[];
    steps: {
      id: string;
      description: string;
      duration: number;
      imageUrl?: string;
    }[];
  };
  onComplete?: () => void;
}

export default function ExerciseGuideCard({
  exercise,
  onComplete,
}: ExerciseGuideCardProps) {
  const [showGuide, setShowGuide] = useState(false);

  const difficultyColors = {
    beginner: 'bg-green-100 text-green-800 dark:bg-green-900 dark:text-green-200',
    intermediate: 'bg-yellow-100 text-yellow-800 dark:bg-yellow-900 dark:text-yellow-200',
    advanced: 'bg-red-100 text-red-800 dark:bg-red-900 dark:text-red-200',
  };

  const handleComplete = () => {
    setShowGuide(false);
    if (onComplete) {
      onComplete();
    }
  };

  return (
    <Card className="overflow-hidden">
      <CardHeader className="space-y-1">
        <div className="flex items-center justify-between">
          <CardTitle className="text-xl">{exercise.name}</CardTitle>
          <Badge
            variant="secondary"
            className={difficultyColors[exercise.difficulty]}
          >
            {exercise.difficulty}
          </Badge>
        </div>
      </CardHeader>

      <CardContent>
        {!showGuide ? (
          <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            className="space-y-4"
          >
            <p className="text-muted-foreground">{exercise.description}</p>

            <div className="grid grid-cols-2 gap-4">
              <div className="flex items-center space-x-2">
                <Clock className="h-4 w-4 text-muted-foreground" />
                <span className="text-sm">{exercise.duration} minutes</span>
              </div>
              <div className="flex items-center space-x-2">
                <Flame className="h-4 w-4 text-muted-foreground" />
                <span className="text-sm">{exercise.calories} calories</span>
              </div>
            </div>

            <Separator />

            <div className="space-y-2">
              <div className="flex items-center space-x-2">
                <Target className="h-4 w-4 text-muted-foreground" />
                <span className="text-sm font-medium">Target Muscles</span>
              </div>
              <div className="flex flex-wrap gap-2">
                {exercise.targetMuscles.map((muscle) => (
                  <Badge key={muscle} variant="outline">
                    {muscle}
                  </Badge>
                ))}
              </div>
            </div>

            <div className="space-y-2">
              <div className="flex items-center space-x-2">
                <Heart className="h-4 w-4 text-muted-foreground" />
                <span className="text-sm font-medium">Benefits</span>
              </div>
              <ScrollArea className="h-24">
                <ul className="list-disc list-inside space-y-1">
                  {exercise.benefits.map((benefit) => (
                    <li key={benefit} className="text-sm text-muted-foreground">
                      {benefit}
                    </li>
                  ))}
                </ul>
              </ScrollArea>
            </div>

            <Button
              className="w-full"
              onClick={() => setShowGuide(true)}
            >
              <Dumbbell className="mr-2 h-4 w-4" />
              Start Exercise
              <ChevronRight className="ml-2 h-4 w-4" />
            </Button>
          </motion.div>
        ) : (
          <AnimatedExerciseGuide
            exerciseId={exercise.id}
            name={exercise.name}
            animationUrl={exercise.animationUrl}
            videoUrl={exercise.videoUrl}
            imageUrls={exercise.imageUrls}
            steps={exercise.steps}
            onComplete={handleComplete}
          />
        )}
      </CardContent>
    </Card>
  );
}
