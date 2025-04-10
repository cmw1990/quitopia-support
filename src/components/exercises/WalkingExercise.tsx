import { useState, useEffect } from "react";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { PersonStanding, Timer, Activity } from "lucide-react";
import { useToast } from "@/hooks/use-toast";
import { supabase } from "@/integrations/supabase/supabase-client";
import { useAuth } from "@/components/AuthProvider";

export const WalkingExercise = () => {
  const [isTracking, setIsTracking] = useState(false);
  const [duration, setDuration] = useState(0);
  const { toast } = useToast();
  const { session } = useAuth();
  
  useEffect(() => {
    let intervalId: NodeJS.Timeout | undefined;
    
    if (isTracking) {
      intervalId = setInterval(() => {
        setDuration(prev => prev + 1);
      }, 1000);
    }
    
    return () => {
      if (intervalId) clearInterval(intervalId);
    };
  }, [isTracking]);
  
  const startTracking = () => {
    setIsTracking(true);
    toast({
      title: "Walking Exercise Started",
      description: "We'll track your walking duration",
    });
  };
  
  const stopTracking = async () => {
    setIsTracking(false);
    
    if (!session?.user) return;

    try {
      const { error } = await supabase
        .from('exercise_tracking')
        .insert({
          user_id: session.user.id,
          exercise_type: 'walking',
          duration_seconds: duration,
        });

      if (error) throw error;

      toast({
        title: "Walking Exercise Completed",
        description: `You walked for ${Math.floor(duration / 60)} minutes`,
      });
    } catch (error) {
      console.error('Error saving exercise:', error);
      toast({
        title: "Error saving exercise",
        description: "Please try again",
        variant: "destructive",
      });
    }
    
    setDuration(0);
  };

  return (
    <Card className="transform transition-all duration-300 hover:shadow-lg">
      <CardHeader>
        <CardTitle className="flex items-center gap-2">
          <PersonStanding className="h-5 w-5 text-primary animate-bounce" />
          Walking Exercise
        </CardTitle>
      </CardHeader>
      <CardContent>
        <div className="space-y-4">
          <div className={`flex justify-between items-center p-4 rounded-lg transition-all duration-300 transform ${
            isTracking ? "bg-primary/10 shadow-lg scale-105 animate-breathe" : "bg-muted/50 hover:scale-[1.02]"
          }`}>
            <div className="flex items-center gap-2">
              <Timer className={`h-5 w-5 text-primary ${isTracking ? "animate-pulse" : ""}`} />
              <span className="font-medium">
                {Math.floor(duration / 60)}:{(duration % 60).toString().padStart(2, '0')}
              </span>
            </div>
            <Button
              onClick={isTracking ? stopTracking : startTracking}
              variant={isTracking ? "destructive" : "default"}
              className={`transition-all duration-300 transform ${
                isTracking ? "animate-pulse" : "hover:scale-105 hover:shadow-md"
              }`}
            >
              {isTracking ? "Stop" : "Start"} Walking
            </Button>
          </div>
          <div className="grid gap-4">
            <div className="flex items-center gap-2 text-sm text-muted-foreground">
              <Activity className="h-4 w-4" />
              <span>Aim for at least 30 minutes of walking per day</span>
            </div>
          </div>
        </div>
      </CardContent>
    </Card>
  );
};