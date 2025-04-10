import { useState } from "react";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Activity, Timer } from "lucide-react";
import { Button } from "@/components/ui/button";
import { supabase } from "@/integrations/supabase/supabase-client";
import { useToast } from "@/hooks/use-toast";
import { useAuth } from "@/components/AuthProvider";

export const DeskYoga = () => {
  const [activePose, setActivePose] = useState<number | null>(null);
  const [duration, setDuration] = useState(0);
  const { toast } = useToast();
  const { session } = useAuth();

  const poses = [
    {
      title: "Chair Pigeon",
      description: "Cross one ankle over opposite knee while seated",
      duration: "30 seconds each side",
      difficulty: "Easy",
    },
    {
      title: "Seated Cat-Cow",
      description: "Arch and round spine while seated",
      duration: "45 seconds",
      difficulty: "Easy",
    },
    {
      title: "Office Chair Twist",
      description: "Gentle seated spinal twist using chair for support",
      duration: "30 seconds each side",
      difficulty: "Easy",
    },
    {
      title: "Desk Plank",
      description: "Modified plank using desk for support",
      duration: "20 seconds",
      difficulty: "Medium",
    },
    {
      title: "Seated Eagle Arms",
      description: "Cross arms and lift elbows for shoulder stretch",
      duration: "30 seconds each side",
      difficulty: "Easy",
    },
    {
      title: "Sun Salutation",
      description: "Modified sun salutation sequence while seated",
      duration: "60 seconds",
      difficulty: "Medium",
    }
  ];

  const startPose = (index: number) => {
    setActivePose(index);
    setDuration(0);
    const interval = setInterval(() => {
      setDuration(prev => prev + 1);
    }, 1000);

    return () => clearInterval(interval);
  };

  const completePose = async (index: number) => {
    if (!session?.user) return;

    try {
      const { error } = await supabase
        .from('exercise_tracking')
        .insert({
          user_id: session.user.id,
          exercise_type: 'desk_exercise',
          duration_seconds: duration,
          notes: poses[index].title
        });

      if (error) throw error;

      toast({
        title: "Yoga Pose Completed!",
        description: `You completed ${poses[index].title} for ${Math.floor(duration / 60)}:${(duration % 60).toString().padStart(2, '0')}`,
      });
    } catch (error) {
      console.error('Error saving yoga pose:', error);
      toast({
        title: "Error saving yoga pose",
        description: "Please try again",
        variant: "destructive",
      });
    }

    setActivePose(null);
    setDuration(0);
  };

  return (
    <Card className="transform transition-all duration-300 hover:shadow-lg">
      <CardHeader>
        <CardTitle className="flex items-center gap-2">
          <Activity className="h-5 w-5 text-primary animate-bounce" />
          Desk Yoga Poses
        </CardTitle>
      </CardHeader>
      <CardContent>
        <div className="space-y-4">
          {poses.map((pose, index) => (
            <div
              key={index}
              className={`flex items-start space-x-4 p-4 rounded-lg transition-all duration-300 transform ${
                activePose === index 
                  ? "bg-primary/10 shadow-lg scale-105 animate-breathe" 
                  : "bg-muted/50 hover:bg-muted/70 hover:scale-[1.02]"
              }`}
            >
              <Activity className={`h-5 w-5 mt-1 transition-all duration-300 ${
                activePose === index ? "text-primary animate-pulse" : "text-primary"
              }`} />
              <div className="flex-1">
                <h3 className="font-medium">{pose.title}</h3>
                <p className="text-sm text-muted-foreground">
                  {pose.description}
                </p>
                <div className="flex items-center gap-4 mt-1">
                  <p className="text-sm text-primary">{pose.duration}</p>
                  <span className="text-sm text-muted-foreground">
                    Difficulty: {pose.difficulty}
                  </span>
                </div>
                {activePose === index && (
                  <div className="mt-2 flex items-center gap-2 animate-fade-in">
                    <Timer className="h-4 w-4 animate-pulse" />
                    <span className="text-sm font-medium">
                      {Math.floor(duration / 60)}:{(duration % 60).toString().padStart(2, '0')}
                    </span>
                  </div>
                )}
              </div>
              <Button
                variant={activePose === index ? "destructive" : "default"}
                onClick={() => activePose === index ? completePose(index) : startPose(index)}
                disabled={activePose !== null && activePose !== index}
                className={`transition-all duration-300 transform ${
                  activePose === index 
                    ? "animate-pulse" 
                    : "hover:scale-105 hover:shadow-md"
                }`}
              >
                {activePose === index ? "Complete" : "Start"}
              </Button>
            </div>
          ))}
        </div>
      </CardContent>
    </Card>
  );
};