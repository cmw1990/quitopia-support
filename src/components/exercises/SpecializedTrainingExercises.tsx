import { useState } from "react";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Label } from "@/components/ui/label";
import { Switch } from "@/components/ui/switch";
import { Brain, Focus, Timer, Zap } from "lucide-react";
import { useToast } from "@/hooks/use-toast";
import { supabasePost } from "@/lib/supabaseApiService";
import { useAuth } from "@/contexts/AuthContext";

export const SpecializedTrainingExercises = () => {
  const { user } = useAuth();
  const { toast } = useToast();
  const [activeExercise, setActiveExercise] = useState<string | null>(null);
  const [isTimerActive, setIsTimerActive] = useState(false);

  const exercises = [
    {
      id: "body-doubling",
      title: "Body Doubling Session",
      description: "Work alongside a virtual partner to maintain focus",
      icon: <Focus className="h-5 w-5 text-primary" />,
      duration: 25,
    },
    {
      id: "micro-tasks",
      title: "Micro-Task Training",
      description: "Break down complex tasks into 2-minute segments",
      icon: <Timer className="h-5 w-5 text-primary" />,
      duration: 2,
    },
    {
      id: "energy-mapping",
      title: "Energy Mapping",
      description: "Track and optimize your daily energy patterns",
      icon: <Zap className="h-5 w-5 text-primary" />,
      duration: 5,
    },
    {
      id: "task-initiation",
      title: "Task Initiation Training",
      description: "Practice starting tasks with decreasing preparation time",
      icon: <Brain className="h-5 w-5 text-primary" />,
      duration: 10,
    },
  ];

  const startExercise = async (exerciseId: string) => {
    if (!user?.id) {
      toast({
        title: "Please sign in",
        description: "You need to be signed in to track exercise progress",
        variant: "destructive",
      });
      return;
    }

    setActiveExercise(exerciseId);
    setIsTimerActive(true);

    const exercise = exercises.find((e) => e.id === exerciseId);
    if (!exercise) return;
    
    try {
      const { data, error } = await supabasePost(
        "energy_focus_logs",
        [{
            user_id: user.id,
            activity_type: "specialized_training",
            activity_name: exercise.title,
            duration_minutes: exercise.duration,
            focus_rating: null,
            notes: `Started ${exercise.title} training session`,
        }]
      );

      if (error) throw error;
      
      toast({
        title: "Exercise started",
        description: `${exercise.title} session has begun`,
      });
    } catch (error) {
      console.error("Error logging exercise:", error);
      toast({
        title: "Error starting exercise",
        description: "Please try again later",
        variant: "destructive",
      });
    }
  };

  const completeExercise = async () => {
    if (!activeExercise || !user?.id) return;

    try {
      const exercise = exercises.find((e) => e.id === activeExercise);
      if (!exercise) return;

      const { error } = await supabasePost(
        "energy_focus_logs",
        [{
            user_id: user.id,
            activity_type: "specialized_training",
            activity_name: exercise.title,
            duration_minutes: exercise.duration,
            focus_rating: 85,
            notes: `Completed ${exercise.title} training session`,
        }]
      );
      
      toast({
        title: "Exercise completed",
        description: "Great job! Your progress has been saved.",
      });
    } catch (error) {
      console.error("Error completing exercise:", error);
      toast({
        title: "Error saving progress",
        description: "Please try again later",
        variant: "destructive",
      });
    }

    setActiveExercise(null);
    setIsTimerActive(false);
  };

  return (
    <Card>
      <CardHeader>
        <CardTitle className="flex items-center gap-2">
          <Brain className="h-5 w-5" />
          Specialized Focus Training
        </CardTitle>
      </CardHeader>
      <CardContent className="space-y-6">
        <div className="grid gap-4 md:grid-cols-2">
          {exercises.map((exercise) => (
            <Card key={exercise.id} className="relative overflow-hidden">
              <CardContent className="p-4">
                <div className="flex items-start justify-between">
                  <div className="space-y-2">
                    <div className="flex items-center gap-2">
                      {exercise.icon}
                      <h3 className="font-semibold">{exercise.title}</h3>
                    </div>
                    <p className="text-sm text-muted-foreground">
                      {exercise.description}
                    </p>
                    <div className="flex items-center gap-2">
                      <Timer className="h-4 w-4 text-muted-foreground" />
                      <span className="text-sm text-muted-foreground">
                        {exercise.duration} minutes
                      </span>
                    </div>
                  </div>
                  <div className="flex items-center gap-2">
                    <Label htmlFor={`exercise-${exercise.id}`} className="sr-only">
                      Toggle {exercise.title}
                    </Label>
                    <Switch
                      id={`exercise-${exercise.id}`}
                      checked={activeExercise === exercise.id}
                      onCheckedChange={() => {
                        if (activeExercise === exercise.id) {
                          completeExercise();
                        } else {
                          startExercise(exercise.id);
                        }
                      }}
                    />
                  </div>
                </div>
              </CardContent>
            </Card>
          ))}
        </div>

        {activeExercise && (
          <div className="mt-4 p-4 bg-muted rounded-lg">
            <h4 className="font-semibold mb-2">Active Session</h4>
            <p className="text-sm text-muted-foreground">
              {exercises.find((e) => e.id === activeExercise)?.description}
            </p>
            <Button
              onClick={completeExercise}
              className="mt-4"
              variant="secondary"
            >
              Complete Session
            </Button>
          </div>
        )}
      </CardContent>
    </Card>
  );
};