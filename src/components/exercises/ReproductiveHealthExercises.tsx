import { useState } from "react";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Activity, Heart, Timer } from "lucide-react";
import { useQuery } from "@tanstack/react-query";
import { supabase } from "@/integrations/supabase/supabase-client";
import { useToast } from "@/hooks/use-toast";
import { useAuth } from "@/components/AuthProvider";
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog";
import { AnimatedExerciseDisplay } from "./AnimatedExerciseDisplay";

export const ReproductiveHealthExercises = () => {
  const [activeExercise, setActiveExercise] = useState<number | null>(null);
  const [dialogOpen, setDialogOpen] = useState(false);
  const [duration, setDuration] = useState(0);
  const { toast } = useToast();
  const { session } = useAuth();

  const { data: exercises } = useQuery({
    queryKey: ['reproductive-exercises'],
    queryFn: async () => {
      const { data, error } = await supabase
        .from('reproductive_health_exercises')
        .select('*')
        .order('difficulty_level', { ascending: true });

      if (error) throw error;
      return data;
    },
  });

  const exerciseInstructions = {
    kegel_basic: [
      "Find a comfortable position (sitting or lying down)",
      "Identify your pelvic floor muscles",
      "Contract these muscles for 3-5 seconds",
      "Relax for 3-5 seconds",
      "Repeat 10 times",
    ],
    kegel_advanced: [
      "Start in a comfortable position",
      "Contract pelvic floor muscles quickly",
      "Hold for 1 second then release",
      "Perform quick pulses",
      "Complete 2 sets of 10 repetitions",
    ],
    breathing: [
      "Sit comfortably with good posture",
      "Inhale deeply through your nose",
      "Feel your pelvic floor relax",
      "Exhale slowly through your mouth",
      "Practice for 5-10 breaths",
    ],
    core_strength: [
      "Lie on your back with knees bent",
      "Engage your core muscles",
      "Lift your pelvis slightly",
      "Hold for 5-10 seconds",
      "Lower and repeat 10 times",
    ],
    relaxation: [
      "Find a quiet, comfortable space",
      "Close your eyes and breathe deeply",
      "Focus on releasing tension",
      "Scan your body for tight areas",
      "Practice for 5-10 minutes",
    ],
  };

  const startExercise = (index: number) => {
    setActiveExercise(index);
    setDuration(0);
    setDialogOpen(true);
    const interval = setInterval(() => {
      setDuration(prev => prev + 1);
    }, 1000);

    return () => clearInterval(interval);
  };

  const completeExercise = async (exerciseId: string) => {
    if (!session?.user) {
      toast({
        title: "Authentication Required",
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
          difficulty_level: exercises?.[activeExercise || 0]?.difficulty_level || 1,
          total_duration_seconds: duration,
        });

      if (error) throw error;

      toast({
        title: "Exercise Completed!",
        description: `Great job! You completed the exercise.`,
      });
    } catch (error) {
      console.error('Error saving progress:', error);
      toast({
        title: "Error saving progress",
        description: "Please try again",
        variant: "destructive",
      });
    } finally {
      setActiveExercise(null);
      setDuration(0);
      setDialogOpen(false);
    }
  };

  return (
    <>
      <Card className="transform transition-all duration-300 hover:shadow-lg">
        <CardHeader>
          <CardTitle className="flex items-center gap-2">
            <Heart className="h-5 w-5 text-rose-500" />
            Energy Training
          </CardTitle>
        </CardHeader>
        <CardContent>
          <div className="space-y-4">
            {exercises?.map((exercise, index) => (
              <div
                key={exercise.id}
                className={`flex items-start space-x-4 p-4 rounded-lg transition-all duration-300 transform ${
                  activeExercise === index 
                    ? "bg-primary/10 shadow-lg scale-105" 
                    : "bg-muted/50 hover:bg-muted/70 hover:scale-[1.02]"
                }`}
              >
                <Activity className="h-5 w-5 text-primary mt-1" />
                <div className="flex-1">
                  <h3 className="font-medium">{exercise.name}</h3>
                  <p className="text-sm text-muted-foreground">
                    Level {exercise.difficulty_level}
                  </p>
                  {activeExercise === index && (
                    <div className="mt-2 flex items-center gap-2">
                      <Timer className="h-4 w-4" />
                      <span className="text-sm font-medium">
                        {Math.floor(duration / 60)}:{(duration % 60).toString().padStart(2, '0')}
                      </span>
                    </div>
                  )}
                </div>
                <Button
                  variant={activeExercise === index ? "destructive" : "default"}
                  onClick={() => startExercise(index)}
                  disabled={activeExercise !== null && activeExercise !== index}
                >
                  {activeExercise === index ? "Stop" : "Start"}
                </Button>
              </div>
            ))}
          </div>
        </CardContent>
      </Card>

      <Dialog open={dialogOpen} onOpenChange={setDialogOpen}>
        <DialogContent className="sm:max-w-md">
          <DialogHeader>
            <DialogTitle>
              {activeExercise !== null && exercises ? exercises[activeExercise].name : ''}
            </DialogTitle>
            <DialogDescription>
              {activeExercise !== null && exercises ? exercises[activeExercise].description : ''}
            </DialogDescription>
          </DialogHeader>
          <div className="mt-4">
            <AnimatedExerciseDisplay
              imageUrl="/placeholder.svg"
              exerciseType={activeExercise !== null && exercises ? exercises[activeExercise].exercise_type : 'breathing'}
              isActive={true}
              progress={Math.min((duration / 300) * 100, 100)}
              instructions={exerciseInstructions[exercises?.[activeExercise || 0]?.exercise_type || 'breathing']}
            />
            <div className="mt-4 flex justify-between items-center">
              <div className="flex items-center gap-2">
                <Timer className="h-4 w-4" />
                <span className="text-sm font-medium">
                  {Math.floor(duration / 60)}:{(duration % 60).toString().padStart(2, '0')}
                </span>
              </div>
              <Button 
                variant="default"
                onClick={() => activeExercise !== null && exercises 
                  ? completeExercise(exercises[activeExercise].id)
                  : undefined}
              >
                Complete
              </Button>
            </div>
          </div>
        </DialogContent>
      </Dialog>
    </>
  );
};