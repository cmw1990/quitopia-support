import { useQuery } from "@tanstack/react-query";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Eye, Timer, RotateCw, MoveHorizontal, MoveVertical, Maximize2, Minimize2, AlertCircle, ArrowLeft, Play, Pause } from "lucide-react";
import { EyeExerciseTimer } from "@/components/exercises/EyeExerciseTimer";
import { EyeRelaxationGuide } from "@/components/exercises/EyeRelaxationGuide";
import { EyeExerciseStats } from "@/components/exercises/EyeExerciseStats";
import { useState, useEffect } from "react";
import { Button } from "@/components/ui/button";
import { useToast } from "@/hooks/use-toast";
import { supabase } from "@/integrations/supabase/supabase-client";
import { useAuth } from "@/components/AuthProvider";
import { Dialog, DialogContent, DialogDescription, DialogFooter, DialogHeader, DialogTitle } from "@/components/ui/dialog";
import { Label } from "@/components/ui/label";
import { RadioGroup, RadioGroupItem } from "@/components/ui/radio-group";
import { AnimatedExerciseDisplay } from "@/components/exercises/AnimatedExerciseDisplay";
import { Alert, AlertDescription } from "@/components/ui/alert";
import { ExerciseAssetsGenerator } from "@/components/exercises/ExerciseAssetsGenerator";
import { Link } from "react-router-dom";

type AnimationType = "svg" | "css";

interface Exercise {
  id: string;
  title: string;
  description: string;
  icon: any;
  duration: number;
  instructions: string[];
  animationType: AnimationType;
  visualGuideUrl?: string;
}

export const WebappEyeExercises: React.FC = () => {
  const [activeExercise, setActiveExercise] = useState<string | null>(null);
  const [showRating, setShowRating] = useState(false);
  const [rating, setRating] = useState<number>(0);
  const [completedExercise, setCompletedExercise] = useState<string | null>(null);
  const { toast } = useToast();
  const { session } = useAuth();

  // Query exercise assets from Supabase
  const { data: exerciseAssets, isLoading: isLoadingAssets } = useQuery({
    queryKey: ["exerciseAssets"],
    queryFn: async () => {
      console.log("Fetching exercise assets...");
      const { data, error } = await supabase
        .from("exercise_assets")
        .select("*")
        .eq("exercise_type", "eye_exercise");

      if (error) {
        console.error("Error fetching exercise assets:", error);
        throw error;
      }
      console.log("Fetched exercise assets:", data);
      return data || [];
    },
  });

  // Map assets to exercise IDs
  const assetMap = exerciseAssets?.reduce((acc, asset) => {
    acc[asset.exercise_name] = asset.asset_url;
    return acc;
  }, {} as Record<string, string>) || {};

  const exercises: Exercise[] = [
    {
      id: "20-20-20",
      title: "20-20-20 Rule",
      description: "Every 20 minutes, look at something 20 feet away for 20 seconds",
      icon: Eye,
      duration: 20,
      instructions: [
        "Find an object or point approximately 20 feet away",
        "Focus your gaze on that point",
        "Keep your head still and maintain focus",
        "Blink naturally throughout the exercise"
      ],
      animationType: "css",
      visualGuideUrl: assetMap["20-20-20"]
    },
    {
      id: "figure-eight",
      title: "Figure Eight",
      description: "Move your eyes in a figure-eight pattern",
      icon: RotateCw,
      duration: 30,
      instructions: [
        "Imagine a large figure 8 in front of you",
        "Trace the pattern slowly with your eyes",
        "Keep your head still while moving your eyes",
        "Switch direction halfway through"
      ],
      animationType: "svg",
      visualGuideUrl: assetMap["figure-eight"]
    },
    {
      id: "near-far",
      title: "Near & Far Focus",
      description: "Alternate focusing between near and far objects",
      icon: Maximize2,
      duration: 60,
      instructions: [
        "Hold your thumb about 10 inches from your face",
        "Focus on your thumb for 5 seconds",
        "Look at something 20 feet away for 5 seconds",
        "Repeat the cycle"
      ],
      animationType: "css",
      visualGuideUrl: assetMap["near-far"]
    },
    {
      id: "horizontal",
      title: "Horizontal Movement",
      description: "Move eyes slowly from left to right",
      icon: MoveHorizontal,
      duration: 30,
      instructions: [
        "Look as far left as comfortable",
        "Slowly move your gaze to the right",
        "Keep your head still",
        "Repeat the movement smoothly"
      ],
      animationType: "svg",
      visualGuideUrl: assetMap["horizontal"]
    },
    {
      id: "vertical",
      title: "Vertical Movement",
      description: "Move eyes slowly up and down",
      icon: MoveVertical,
      duration: 30,
      instructions: [
        "Look up as far as comfortable",
        "Slowly move your gaze downward",
        "Keep your head still",
        "Repeat the movement smoothly"
      ],
      animationType: "svg",
      visualGuideUrl: assetMap["vertical"]
    },
    {
      id: "palming",
      title: "Palming",
      description: "Cover your eyes with your palms and relax",
      icon: Minimize2,
      duration: 120,
      instructions: [
        "Rub your palms together to warm them",
        "Cup your palms over your closed eyes",
        "Ensure no light enters through gaps",
        "Focus on complete darkness and relaxation"
      ],
      animationType: "css",
      visualGuideUrl: assetMap["palming"]
    }
  ];

  const handleComplete = async (exerciseId: string) => {
    if (!session?.user?.id) {
      toast({
        title: "Please sign in",
        description: "You need to be signed in to track your exercises.",
        variant: "destructive",
      });
      return;
    }

    const exercise = exercises.find(e => e.id === exerciseId);
    if (!exercise) return;

    setCompletedExercise(exerciseId);
    setShowRating(true);
    setActiveExercise(null);

    try {
      const { error } = await supabase
        .from('eye_exercise_logs')
        .insert({
          user_id: session.user.id,
          exercise_type: exerciseId,
          duration_seconds: exercise.duration,
          visual_guide_url: exercise.visualGuideUrl,
          notes: `Completed ${exercise.title}`
        });

      if (error) throw error;

    } catch (error) {
      console.error('Error logging exercise:', error);
      toast({
        title: "Error saving exercise",
        description: "There was a problem saving your progress.",
        variant: "destructive",
      });
    }
  };

  const handleRatingSubmit = async () => {
    if (!completedExercise || !session?.user?.id) return;

    try {
      const exercise = exercises.find(e => e.id === completedExercise);
      
      const { error } = await supabase
        .from('eye_exercise_logs')
        .insert({
          user_id: session.user.id,
          exercise_type: completedExercise,
          duration_seconds: exercise?.duration || 0,
          effectiveness_rating: rating,
          visual_guide_url: exercise?.visualGuideUrl,
          notes: `Completed ${exercise?.title}`
        });

      if (error) throw error;

      toast({
        title: "Exercise Completed! ",
        description: "Your progress has been saved and counts toward achievements.",
      });
    } catch (error) {
      console.error('Error saving exercise:', error);
      toast({
        title: "Error saving exercise",
        description: "Please try again",
        variant: "destructive",
      });
    }

    setShowRating(false);
    setCompletedExercise(null);
    setRating(0);
  };

  // Add a query to fetch exercise assets
  const { data: exerciseAssetsFromQuery } = useQuery({
    queryKey: ["exerciseAssets"],
    queryFn: async () => {
      const { data, error } = await supabase
        .from("exercise_assets")
        .select("*")
        .eq("exercise_type", "eye_exercise");

      if (error) throw error;
      return data || [];
    },
  });

  // Preload images when component mounts
  useEffect(() => {
    const preloadImages = async () => {
      if (exerciseAssets) {
        const imagePromises = exerciseAssets.map(asset => {
          return new Promise((resolve, reject) => {
            const img = new Image();
            img.onload = resolve;
            img.onerror = reject;
            img.src = asset.asset_url;
          });
        });

        try {
          await Promise.all(imagePromises);
          console.log('All exercise images preloaded successfully');
        } catch (error) {
          console.error('Error preloading images:', error);
        }
      }
    };

    preloadImages();
  }, [exerciseAssets]);

  if (isLoadingAssets) {
    return <div>Loading exercise assets...</div>;
  }

  return (
    <div className="space-y-6">
      <div className="flex flex-col gap-4">
        <div className="flex items-center justify-between">
          <Link to="/tools">
            <Button variant="ghost" size="sm" className="gap-2">
              <ArrowLeft className="h-4 w-4" />
              Back to Tools
            </Button>
          </Link>
        </div>

        <div className="space-y-4">
          <h1 className="text-4xl font-bold">Eye Exercises & Digital Wellness</h1>
          <p className="text-xl text-muted-foreground">
            Science-backed exercises to reduce digital eye strain and improve visual comfort. Perfect for remote workers, students, and anyone spending long hours on screens.
          </p>
        </div>
        
        <Alert>
          <AlertCircle className="h-4 w-4" />
          <AlertDescription>
            Remember to blink regularly and stop any exercise if you feel discomfort.
            Take breaks between exercises and ensure proper lighting conditions.
          </AlertDescription>
        </Alert>

        {/* Add ExerciseAssetsGenerator in development */}
        {import.meta.env.DEV && (
          <div className="mb-4">
            <ExerciseAssetsGenerator />
          </div>
        )}
      </div>
      
      <div className="prose dark:prose-invert max-w-none mb-8">
        <h2 className="text-2xl font-semibold">Benefits of Regular Eye Exercises</h2>
        <ul className="list-disc pl-6 space-y-2">
          <li>Reduce digital eye strain and fatigue</li>
          <li>Improve focus and concentration</li>
          <li>Maintain healthy vision habits</li>
          <li>Prevent Computer Vision Syndrome (CVS)</li>
          <li>Enhance eye muscle flexibility</li>
        </ul>
      </div>
      
      <EyeExerciseStats />
      
      <div className="grid gap-6 md:grid-cols-2">
        {exercises.map((exercise) => (
          <Card key={exercise.id} className="transform transition-all duration-300 hover:shadow-lg">
            <CardHeader>
              <CardTitle className="flex items-center gap-2">
                <exercise.icon className="h-5 w-5 text-primary" />
                {exercise.title}
              </CardTitle>
            </CardHeader>
            <CardContent>
              <p className="text-muted-foreground mb-4">{exercise.description}</p>
              {activeExercise === exercise.id ? (
                <div className="space-y-4">
                  <AnimatedExerciseDisplay
                    exerciseType={exercise.id}
                    imageUrl={exercise.visualGuideUrl || ''}
                    animationType={exercise.animationType}
                    isActive={true}
                    progress={(exercise.duration - 0) / exercise.duration * 100}
                    instructions={exercise.instructions}
                  />
                  <EyeExerciseTimer
                    duration={exercise.duration}
                    onComplete={() => handleComplete(exercise.id)}
                    onCancel={() => setActiveExercise(null)}
                  />
                </div>
              ) : (
                <Button 
                  onClick={() => setActiveExercise(exercise.id)}
                  className="w-full"
                >
                  Start Exercise
                </Button>
              )}
            </CardContent>
          </Card>
        ))}
      </div>

      <Dialog open={showRating} onOpenChange={setShowRating}>
        <DialogContent>
          <DialogHeader>
            <DialogTitle>Rate Exercise Effectiveness</DialogTitle>
            <DialogDescription>
              How effective was this exercise session?
            </DialogDescription>
          </DialogHeader>
          <RadioGroup value={rating.toString()} onValueChange={(value) => setRating(Number(value))}>
            <div className="flex items-center space-x-2">
              <RadioGroupItem value="1" id="r1" />
              <Label htmlFor="r1">Not Effective</Label>
            </div>
            <div className="flex items-center space-x-2">
              <RadioGroupItem value="2" id="r2" />
              <Label htmlFor="r2">Slightly Effective</Label>
            </div>
            <div className="flex items-center space-x-2">
              <RadioGroupItem value="3" id="r3" />
              <Label htmlFor="r3">Moderately Effective</Label>
            </div>
            <div className="flex items-center space-x-2">
              <RadioGroupItem value="4" id="r4" />
              <Label htmlFor="r4">Very Effective</Label>
            </div>
            <div className="flex items-center space-x-2">
              <RadioGroupItem value="5" id="r5" />
              <Label htmlFor="r5">Extremely Effective</Label>
            </div>
          </RadioGroup>
          <DialogFooter>
            <Button onClick={handleRatingSubmit}>Submit Rating</Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>

      <EyeRelaxationGuide />

      <div className="mt-12 text-center">
        <Card className="p-6">
          <CardHeader>
            <CardTitle>Want More Features?</CardTitle>
            <AlertDescription>
              Try our full web app for advanced tracking and personalized recommendations
            </AlertDescription>
          </CardHeader>
          <CardContent className="space-y-4">
            <ul className="list-disc text-left pl-6 mb-4 space-y-2">
              <li>Personalized exercise routines</li>
              <li>Progress tracking and analytics</li>
              <li>Eye health insights and recommendations</li>
              <li>Integration with other wellness tools</li>
            </ul>
            <Link to="/webapp">
              <Button size="lg">Open Web App</Button>
            </Link>
          </CardContent>
        </Card>
      </div>

      <footer className="mt-12 text-center text-sm text-muted-foreground space-y-2">
        <p>
          These eye exercises are designed to help reduce digital eye strain and improve visual comfort. 
          Always consult with an eye care professional for persistent vision concerns.
        </p>
        <p>
          {new Date().getFullYear()} The Well-Charged - Digital Wellness Tools
        </p>
      </footer>
    </div>
  );
};
