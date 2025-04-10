import { useState } from "react";
import { Button } from "../ui/button";
import { SUPABASE_URL, SUPABASE_KEY } from "@/integrations/supabase/db-client";
import { useToast } from "@/hooks/use-toast";
import { Loader2, Activity, Dumbbell } from "lucide-react";
import { Alert, AlertDescription } from "../ui/alert";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "../ui/tabs";
import { useAuth } from "@/components/AuthProvider";

const isDevelopment = import.meta.env.DEV;

export const ExerciseAssetsGenerator = () => {
  if (!isDevelopment) return null;
  
  const { toast } = useToast();
  const { session } = useAuth();
  const [isGenerating, setIsGenerating] = useState(false);
  const [currentBatch, setCurrentBatch] = useState<string | null>(null);
  const [error, setError] = useState<string | null>(null);

  const eyeExercises = [
    '20-20-20',
    'figure-eight',
    'near-far',
    'horizontal',
    'vertical',
    'palming'
  ];

  const otherExercises = [
    // Desk Yoga
    { name: 'chair-pigeon', type: 'desk_yoga', display: 'Chair Pigeon' },
    { name: 'seated-cat-cow', type: 'desk_yoga', display: 'Seated Cat-Cow' },
    { name: 'office-chair-twist', type: 'desk_yoga', display: 'Office Chair Twist' },
    { name: 'desk-plank', type: 'desk_yoga', display: 'Desk Plank' },
    { name: 'seated-eagle-arms', type: 'desk_yoga', display: 'Seated Eagle Arms' },
    { name: 'sun-salutation', type: 'desk_yoga', display: 'Sun Salutation' },
    // Walking Exercise
    { name: 'walking-posture', type: 'walking', display: 'Walking Posture' },
    { name: 'stride-length', type: 'walking', display: 'Stride Length' },
    { name: 'arm-swing', type: 'walking', display: 'Arm Swing' },
    // Running Exercise
    { name: 'running-form', type: 'running', display: 'Running Form' },
    { name: 'breathing-technique', type: 'running', display: 'Breathing Technique' },
    { name: 'foot-strike', type: 'running', display: 'Foot Strike' },
    // Stretch Exercise
    { name: 'hamstring-stretch', type: 'stretch', display: 'Hamstring Stretch' },
    { name: 'quad-stretch', type: 'stretch', display: 'Quad Stretch' },
    { name: 'calf-stretch', type: 'stretch', display: 'Calf Stretch' },
    { name: 'hip-flexor-stretch', type: 'stretch', display: 'Hip Flexor Stretch' }
  ];

  const generateAsset = async (batch: string, type: string = 'eye_exercise') => {
    if (!session?.access_token) {
      toast({
        title: 'Error',
        description: 'You must be logged in to generate assets',
        variant: 'destructive',
      });
      return;
    }

    setCurrentBatch(batch);
    setIsGenerating(true);
    setError(null);
    
    try {
      console.log(`Starting generation for ${batch} (${type})...`);
      
      // Generate new asset
      const response = await fetch(
        `${SUPABASE_URL}/functions/v1/generate-assets`,
        {
          method: 'POST',
          headers: {
            'Content-Type': 'application/json',
            'apikey': SUPABASE_KEY,
            'Authorization': `Bearer ${session.access_token}`
          },
          body: JSON.stringify({
            type: 'exercise-assets',
            batch,
            exerciseType: type
          })
        }
      );

      if (!response.ok) {
        const error = await response.json();
        throw new Error(error.message || response.statusText);
      }

      const data = await response.json();

      if (!data?.url) {
        console.error(`No URL in response for ${batch}:`, data);
        throw new Error('No image URL in response');
      }

      console.log(`Generated asset for ${batch}:`, data);
      
      // Delete existing asset if it exists
      const deleteResponse = await fetch(
        `${SUPABASE_URL}/rest/v1/exercise_assets?exercise_name=eq.${batch}&exercise_type=eq.${type}`,
        {
          method: 'DELETE',
          headers: {
            'apikey': SUPABASE_KEY,
            'Authorization': `Bearer ${session.access_token}`
          }
        }
      );

      if (!deleteResponse.ok && deleteResponse.status !== 404) {
        console.error('Error deleting existing asset:', await deleteResponse.text());
        // Continue anyway as the insert might still work
      }

      // Insert new asset
      const insertResponse = await fetch(
        `${SUPABASE_URL}/rest/v1/exercise_assets`,
        {
          method: 'POST',
          headers: {
            'Content-Type': 'application/json',
            'apikey': SUPABASE_KEY,
            'Authorization': `Bearer ${session.access_token}`,
            'Prefer': 'return=minimal'
          },
          body: JSON.stringify({
            exercise_name: batch,
            exercise_type: type,
            asset_url: data.url
          })
        }
      );

      if (!insertResponse.ok) {
        const error = await insertResponse.json();
        throw new Error(`Failed to save asset to database: ${error.message || insertResponse.statusText}`);
      }

      toast({
        title: 'Success',
        description: `Generated new asset for ${batch}`,
      });

    } catch (error) {
      console.error(`Error generating ${batch}:`, error);
      setError(error.message);
      toast({
        title: 'Error',
        description: `Failed to generate ${batch}: ${error.message}`,
        variant: 'destructive',
      });
    } finally {
      setIsGenerating(false);
      setCurrentBatch(null);
    }
  };

  return (
    <div className="space-y-4">
      <Tabs defaultValue="eye" className="w-full">
        <TabsList className="grid w-full grid-cols-2">
          <TabsTrigger value="eye" className="flex items-center gap-2">
            <Activity className="h-4 w-4" />
            Eye Exercises
          </TabsTrigger>
          <TabsTrigger value="other" className="flex items-center gap-2">
            <Dumbbell className="h-4 w-4" />
            Other Exercises
          </TabsTrigger>
        </TabsList>
        
        {error && (
          <Alert variant="destructive" className="my-4">
            <AlertDescription>{error}</AlertDescription>
          </Alert>
        )}

        <TabsContent value="eye" className="mt-4">
          <h3 className="font-medium mb-4">Generate Eye Exercise Assets</h3>
          <div className="grid gap-2">
            {eyeExercises.map((type) => (
              <Button
                key={type}
                onClick={() => generateAsset(type, 'eye_exercise')}
                disabled={isGenerating}
                className="relative w-full"
              >
                {isGenerating && currentBatch === type && (
                  <Loader2 className="h-4 w-4 animate-spin mr-2" />
                )}
                Generate {type} Asset
              </Button>
            ))}
          </div>
        </TabsContent>

        <TabsContent value="other" className="mt-4">
          <div className="space-y-6">
            {['desk_yoga', 'walking', 'running', 'stretch'].map((exerciseType) => {
              const exercises = otherExercises.filter(e => e.type === exerciseType);
              const title = exerciseType.split('_').map(word => 
                word.charAt(0).toUpperCase() + word.slice(1)
              ).join(' ');

              return (
                <div key={exerciseType} className="space-y-2">
                  <h3 className="font-medium">{title} Assets</h3>
                  <div className="grid gap-2">
                    {exercises.map((exercise) => (
                      <Button
                        key={exercise.name}
                        onClick={() => generateAsset(exercise.name, exercise.type)}
                        disabled={isGenerating}
                        className="relative w-full"
                      >
                        {isGenerating && currentBatch === exercise.name && (
                          <Loader2 className="h-4 w-4 animate-spin mr-2" />
                        )}
                        Generate {exercise.display} Asset
                      </Button>
                    ))}
                  </div>
                </div>
              );
            })}
          </div>
        </TabsContent>
      </Tabs>
    </div>
  );
};

export default ExerciseAssetsGenerator;
