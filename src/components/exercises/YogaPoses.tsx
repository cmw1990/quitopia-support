import { useState } from "react";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Activity, Timer } from "lucide-react";
import { Button } from "@/components/ui/button";
import { supabase } from "@/integrations/supabase/supabase-client";
import { useToast } from "@/hooks/use-toast";
import { useAuth } from "@/components/AuthProvider";

export const YogaPoses = () => {
  const [activePose, setActivePose] = useState<number | null>(null);
  const [duration, setDuration] = useState(0);
  const { toast } = useToast();
  const { session } = useAuth();

  const poses = [
    {
      title: "Mountain Pose (Tadasana)",
      description: "Stand tall with feet together, arms at sides",
      duration: "60 seconds",
      difficulty: "Easy",
      benefits: "Improves posture and balance",
    },
    {
      title: "Tree Pose (Vrksasana)",
      description: "Balance on one leg with other foot on inner thigh",
      duration: "30 seconds each side",
      difficulty: "Medium",
      benefits: "Enhances focus and balance",
    },
    {
      title: "Warrior I (Virabhadrasana I)",
      description: "Lunging pose with arms raised",
      duration: "45 seconds each side",
      difficulty: "Medium",
      benefits: "Strengthens legs and core",
    },
    {
      title: "Child's Pose (Balasana)",
      description: "Resting pose with knees wide, forehead on mat",
      duration: "60 seconds",
      difficulty: "Easy",
      benefits: "Calming and restorative",
    },
    {
      title: "Sun Salutation (Surya Namaskar)",
      description: "Flowing sequence of poses",
      duration: "5-10 minutes",
      difficulty: "Medium",
      benefits: "Full body warmup",
    },
    {
      title: "Corpse Pose (Savasana)",
      description: "Lying flat on back, completely relaxed",
      duration: "5 minutes",
      difficulty: "Easy",
      benefits: "Deep relaxation and stress relief",
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
          exercise_type: 'yoga',
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
    <Card>
      <CardHeader>
        <CardTitle className="flex items-center gap-2">
          <Activity className="h-5 w-5 text-primary" />
          Traditional Yoga Poses
        </CardTitle>
      </CardHeader>
      <CardContent>
        <div className="space-y-4">
          {poses.map((pose, index) => (
            <div
              key={index}
              className="flex items-start space-x-4 p-4 rounded-lg bg-muted/50"
            >
              <Activity className="h-5 w-5 text-primary mt-1" />
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
                <p className="text-sm text-muted-foreground mt-1">
                  Benefits: {pose.benefits}
                </p>
                {activePose === index && (
                  <div className="mt-2 flex items-center gap-2">
                    <Timer className="h-4 w-4" />
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