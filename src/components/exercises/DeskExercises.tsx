import { useState } from "react";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Dumbbell, Activity, Timer } from "lucide-react";
import { supabase } from "@/integrations/supabase/supabase-client";
import { useToast } from "@/hooks/use-toast";
import { useAuth } from "@/components/AuthProvider";
import { AnimatedExerciseDisplay } from "./AnimatedExerciseDisplay";
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog";

export const DeskExercises = () => {
  const [activeExercise, setActiveExercise] = useState<number | null>(null);
  const [duration, setDuration] = useState(0);
  const [dialogOpen, setDialogOpen] = useState(false);
  const [isLoading, setIsLoading] = useState(false);
  const [currentStep, setCurrentStep] = useState(0);
  const { toast } = useToast();
  const { session } = useAuth();

  const exercises = [
    {
      title: "Neck Rolls",
      description: "Gently roll your neck in circles, 5 times each direction",
      instructions: [
        "Sit up straight with your shoulders relaxed",
        "Slowly lower your chin to your chest",
        "Roll your head to the right shoulder",
        "Continue rolling to the back",
        "Complete the circle by rolling to the left shoulder",
        "Repeat 5 times, then switch direction"
      ],
      duration: "30 seconds",
      icon: Activity,
      type: "stretch",
      imageUrl: "/exercise-assets/neck-rolls.png"
    },
    {
      title: "Shoulder Stretches",
      description: "Roll shoulders backwards and forwards",
      instructions: [
        "Sit or stand with your back straight",
        "Roll your shoulders forward in a circular motion",
        "Make the circles gradually larger",
        "Reverse the direction after 5 rotations",
        "Keep your arms relaxed throughout"
      ],
      duration: "30 seconds",
      icon: Activity,
      type: "stretch",
      imageUrl: "/exercise-assets/shoulder-stretches.png"
    },
    {
      title: "Wrist Exercises",
      description: "Rotate wrists and stretch fingers",
      instructions: [
        "Hold your arms out in front of you",
        "Make fists with both hands",
        "Rotate your wrists in clockwise circles",
        "Switch to counter-clockwise after 5 rotations",
        "Open your hands and spread your fingers",
        "Hold the stretch for 5 seconds"
      ],
      duration: "30 seconds",
      icon: Dumbbell,
      type: "strength",
      imageUrl: "/exercise-assets/wrist-exercises.png"
    }
  ];

  const startExercise = (index: number) => {
    setActiveExercise(index);
    setDuration(0);
    setCurrentStep(0);
    setDialogOpen(true);
    const interval = setInterval(() => {
      setDuration(prev => {
        const newDuration = prev + 1;
        if (newDuration % 5 === 0) {
          setCurrentStep(prevStep => {
            const nextStep = prevStep + 1;
            if (nextStep < exercises[index].instructions.length) {
              return nextStep;
            }
            return prevStep;
          });
        }
        return newDuration;
      });
    }, 1000);

    return () => clearInterval(interval);
  };

  const completeExercise = async (index: number) => {
    if (!session?.user) {
      toast({
        title: "Authentication Required",
        description: "Please sign in to save your progress",
        variant: "destructive",
      });
      return;
    }

    setIsLoading(true);

    try {
      const { error } = await supabase
        .from('exercise_tracking')
        .insert({
          user_id: session.user.id,
          exercise_type: 'desk_exercise',
          duration_seconds: duration,
          notes: exercises[index].title,
          calories_burned: Math.round(duration / 60 * 3), // Rough estimate: 3 calories per minute
        });

      if (error) throw error;

      toast({
        title: "Exercise Completed!",
        description: `You completed ${exercises[index].title} for ${Math.floor(duration / 60)}:${(duration % 60).toString().padStart(2, '0')}`,
      });
    } catch (error) {
      console.error('Error saving exercise:', error);
      toast({
        title: "Error saving exercise",
        description: "Please try again",
        variant: "destructive",
      });
    } finally {
      setIsLoading(false);
      setActiveExercise(null);
      setDuration(0);
      setCurrentStep(0);
      setDialogOpen(false);
    }
  };

  return (
    <>
      <Card className="transform transition-all duration-300 hover:shadow-lg">
        <CardHeader>
          <CardTitle className="flex items-center gap-2">
            <Dumbbell className="h-5 w-5 text-primary animate-bounce" />
            Desk Exercises
          </CardTitle>
        </CardHeader>
        <CardContent>
          <div className="space-y-4">
            {exercises.map((exercise, index) => (
              <div
                key={index}
                className={`flex items-start space-x-4 p-4 rounded-lg transition-all duration-300 transform ${
                  activeExercise === index 
                    ? "bg-primary/10 shadow-lg scale-105 animate-breathe" 
                    : "bg-muted/50 hover:bg-muted/70 hover:scale-[1.02]"
                }`}
              >
                <exercise.icon className="h-5 w-5 text-primary mt-1" />
                <div className="flex-1">
                  <h3 className="font-medium">{exercise.title}</h3>
                  <p className="text-sm text-muted-foreground">
                    {exercise.description}
                  </p>
                  <p className="text-sm text-primary mt-1">{exercise.duration}</p>
                  {activeExercise === index && (
                    <div className="mt-2 flex items-center gap-2 animate-fade-in">
                      <Timer className="h-4 w-4 animate-pulse" />
                      <span className="text-sm font-medium">
                        {Math.floor(duration / 60)}:{(duration % 60).toString().padStart(2, '0')}
                      </span>
                    </div>
                  )}
                </div>
                <Button
                  variant={activeExercise === index ? "destructive" : "default"}
                  onClick={() => startExercise(index)}
                  disabled={isLoading || (activeExercise !== null && activeExercise !== index)}
                  className="transition-all duration-300 transform hover:scale-105 hover:shadow-md"
                >
                  {isLoading ? (
                    <div className="h-5 w-5 border-2 border-current border-t-transparent rounded-full animate-spin" />
                  ) : (
                    activeExercise === index ? "Stop" : "Start"
                  )}
                </Button>
              </div>
            ))}
          </div>
        </CardContent>
      </Card>

      <Dialog open={dialogOpen} onOpenChange={setDialogOpen}>
        <DialogContent className="sm:max-w-[425px]">
          <DialogHeader>
            <DialogTitle>
              {activeExercise !== null ? exercises[activeExercise].title : ''}
            </DialogTitle>
            <DialogDescription>
              Follow along with the animated guide below:
            </DialogDescription>
          </DialogHeader>
          <div className="mt-4">
            {activeExercise !== null && (
              <>
                <div className="w-full aspect-square mb-4">
                  <AnimatedExerciseDisplay
                    imageUrl={exercises[activeExercise].imageUrl}
                    exerciseType={exercises[activeExercise].type}
                    isActive={true}
                    progress={(duration / 30) * 100}
                    instructions={exercises[activeExercise].instructions}
                    currentStep={currentStep}
                    onStepChange={setCurrentStep}
                  />
                </div>
                <div className="flex justify-between items-center">
                  <div className="flex items-center gap-2">
                    <Timer className="h-4 w-4 animate-pulse" />
                    <span className="text-sm font-medium">
                      {Math.floor(duration / 60)}:{(duration % 60).toString().padStart(2, '0')}
                    </span>
                  </div>
                  <Button 
                    variant="destructive"
                    onClick={() => completeExercise(activeExercise)}
                    disabled={isLoading}
                  >
                    {isLoading ? (
                      <div className="h-5 w-5 border-2 border-current border-t-transparent rounded-full animate-spin" />
                    ) : (
                      "Complete"
                    )}
                  </Button>
                </div>
              </>
            )}
          </div>
        </DialogContent>
      </Dialog>
    </>
  );
};