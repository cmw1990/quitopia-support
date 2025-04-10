import { useState } from "react";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Activity, Timer } from "lucide-react";
import { Button } from "@/components/ui/button";
import { supabase } from "@/integrations/supabase/supabase-client";
import { useToast } from "@/hooks/use-toast";
import { useAuth } from "@/components/AuthProvider";

export const StretchExercise = () => {
  const [activeStretch, setActiveStretch] = useState<number | null>(null);
  const [duration, setDuration] = useState(0);
  const [isLoading, setIsLoading] = useState(false);
  const { toast } = useToast();
  const { session } = useAuth();

  const stretches = [
    {
      title: "Standing Forward Bend",
      description: "Bend forward from the hips, keeping legs straight",
      duration: "30 seconds",
      difficulty: "Easy",
    },
    {
      title: "Cat-Cow Stretch",
      description: "Alternate between arching and rounding your back",
      duration: "45 seconds",
      difficulty: "Easy",
    },
    {
      title: "Downward Dog",
      description: "Form an inverted V-shape with your body",
      duration: "30 seconds",
      difficulty: "Medium",
    },
    {
      title: "Butterfly Stretch",
      description: "Seated with feet together, knees out",
      duration: "45 seconds",
      difficulty: "Easy",
    },
    {
      title: "Child's Pose",
      description: "Kneel and stretch arms forward on the ground",
      duration: "60 seconds",
      difficulty: "Easy",
    },
    {
      title: "Cobra Stretch",
      description: "Lie on stomach and lift chest while keeping hips down",
      duration: "30 seconds",
      difficulty: "Medium",
    }
  ];

  const startStretch = (index: number) => {
    try {
      setIsLoading(true);
      setActiveStretch(index);
      setDuration(0);
      
      const interval = setInterval(() => {
        setDuration(prev => prev + 1);
      }, 1000);

      toast({
        title: "Exercise Started",
        description: `Starting ${stretches[index].title}. Follow the instructions carefully.`,
      });

      return () => clearInterval(interval);
    } catch (error) {
      console.error('Error starting stretch:', error);
      toast({
        title: "Error Starting Exercise",
        description: "Please try again",
        variant: "destructive",
      });
    } finally {
      setIsLoading(false);
    }
  };

  const completeStretch = async (index: number) => {
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
          exercise_type: 'stretching',
          duration_seconds: duration,
          notes: stretches[index].title
        });

      if (error) throw error;

      toast({
        title: "Stretch Completed!",
        description: `You completed ${stretches[index].title} for ${Math.floor(duration / 60)}:${(duration % 60).toString().padStart(2, '0')}`,
      });
    } catch (error) {
      console.error('Error saving stretch:', error);
      toast({
        title: "Error saving stretch",
        description: "Please try again",
        variant: "destructive",
      });
    } finally {
      setIsLoading(false);
      setActiveStretch(null);
      setDuration(0);
    }
  };

  return (
    <Card className="transform transition-all duration-300 hover:shadow-lg">
      <CardHeader>
        <CardTitle className="flex items-center gap-2">
          <Activity className="h-5 w-5 text-primary animate-bounce" />
          Full Body Stretches
        </CardTitle>
      </CardHeader>
      <CardContent>
        <div className="space-y-4">
          {stretches.map((stretch, index) => (
            <div
              key={index}
              className={`flex items-start space-x-4 p-4 rounded-lg transition-all duration-300 transform ${
                activeStretch === index 
                  ? "bg-primary/10 shadow-lg scale-105 animate-breathe" 
                  : "bg-muted/50 hover:bg-muted/70 hover:scale-[1.02]"
              }`}
            >
              <Activity className={`h-5 w-5 text-primary mt-1 ${
                activeStretch === index ? "animate-pulse" : ""
              }`} />
              <div className="flex-1">
                <h3 className="font-medium">{stretch.title}</h3>
                <p className="text-sm text-muted-foreground">
                  {stretch.description}
                </p>
                <div className="flex items-center gap-4 mt-1">
                  <p className="text-sm text-primary">{stretch.duration}</p>
                  <span className="text-sm text-muted-foreground">
                    Difficulty: {stretch.difficulty}
                  </span>
                </div>
                {activeStretch === index && (
                  <div className="mt-2 flex items-center gap-2 animate-fade-in">
                    <Timer className="h-4 w-4 animate-pulse" />
                    <span className="text-sm font-medium">
                      {Math.floor(duration / 60)}:{(duration % 60).toString().padStart(2, '0')}
                    </span>
                  </div>
                )}
              </div>
              <Button
                variant={activeStretch === index ? "destructive" : "default"}
                onClick={() => activeStretch === index ? completeStretch(index) : startStretch(index)}
                disabled={isLoading || (activeStretch !== null && activeStretch !== index)}
                className={`transition-all duration-300 transform ${
                  activeStretch === index 
                    ? "animate-pulse" 
                    : "hover:scale-105 hover:shadow-md"
                }`}
              >
                {isLoading ? (
                  <div className="h-5 w-5 border-2 border-current border-t-transparent rounded-full animate-spin" />
                ) : activeStretch === index ? (
                  "Complete"
                ) : (
                  "Start"
                )}
              </Button>
            </div>
          ))}
        </div>
      </CardContent>
    </Card>
  );
};