
import { useState } from "react";
import { useAuth } from "@/components/AuthProvider";
import { useToast } from "@/hooks/use-toast";
import { supabase } from "@/integrations/supabase/supabase-client";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Label } from "@/components/ui/label";
import { Slider } from "@/components/ui/slider";
import { Battery, Brain, Moon, CloudMoon, Heart } from "lucide-react";
import { useMutation, useQueryClient } from "@tanstack/react-query";

export const CycleImpactForm = () => {
  const { session } = useAuth();
  const { toast } = useToast();
  const queryClient = useQueryClient();
  const [impacts, setImpacts] = useState({
    energy_impact: 5,
    focus_impact: 5,
    sleep_impact: 5,
    mood_impact: 5,
    stress_impact: 5,
  });

  const impactMutation = useMutation({
    mutationFn: async (data: typeof impacts) => {
      if (!session?.user?.id) throw new Error("Not authenticated");
      
      const { error } = await supabase
        .from('cycle_phase_impacts')
        .insert({
          user_id: session.user.id,
          ...data,
          phase_type: 'current', // This should be dynamically determined based on the current phase
        });

      if (error) throw error;
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['cycle_impacts'] });
      toast({
        title: "Impact logged",
        description: "Your cycle impact data has been saved",
      });
    },
    onError: (error) => {
      console.error('Error saving cycle impact:', error);
      toast({
        title: "Error",
        description: "Failed to save cycle impact data",
        variant: "destructive",
      });
    },
  });

  const handleSubmit = () => {
    impactMutation.mutate(impacts);
  };

  return (
    <Card>
      <CardHeader>
        <CardTitle>Track Cycle Impacts</CardTitle>
      </CardHeader>
      <CardContent className="space-y-6">
        <div className="space-y-4">
          <div className="space-y-2">
            <div className="flex items-center justify-between">
              <Label>Energy Level</Label>
              <div className="flex items-center gap-2">
                <Battery className="h-4 w-4 text-yellow-500" />
                <span>{impacts.energy_impact}/10</span>
              </div>
            </div>
            <Slider
              value={[impacts.energy_impact]}
              onValueChange={(value) => setImpacts({ ...impacts, energy_impact: value[0] })}
              min={1}
              max={10}
              step={1}
            />
          </div>

          <div className="space-y-2">
            <div className="flex items-center justify-between">
              <Label>Focus Level</Label>
              <div className="flex items-center gap-2">
                <Brain className="h-4 w-4 text-blue-500" />
                <span>{impacts.focus_impact}/10</span>
              </div>
            </div>
            <Slider
              value={[impacts.focus_impact]}
              onValueChange={(value) => setImpacts({ ...impacts, focus_impact: value[0] })}
              min={1}
              max={10}
              step={1}
            />
          </div>

          <div className="space-y-2">
            <div className="flex items-center justify-between">
              <Label>Sleep Quality</Label>
              <div className="flex items-center gap-2">
                <Moon className="h-4 w-4 text-purple-500" />
                <span>{impacts.sleep_impact}/10</span>
              </div>
            </div>
            <Slider
              value={[impacts.sleep_impact]}
              onValueChange={(value) => setImpacts({ ...impacts, sleep_impact: value[0] })}
              min={1}
              max={10}
              step={1}
            />
          </div>

          <div className="space-y-2">
            <div className="flex items-center justify-between">
              <Label>Mood Level</Label>
              <div className="flex items-center gap-2">
                <Heart className="h-4 w-4 text-pink-500" />
                <span>{impacts.mood_impact}/10</span>
              </div>
            </div>
            <Slider
              value={[impacts.mood_impact]}
              onValueChange={(value) => setImpacts({ ...impacts, mood_impact: value[0] })}
              min={1}
              max={10}
              step={1}
            />
          </div>

          <div className="space-y-2">
            <div className="flex items-center justify-between">
              <Label>Stress Level</Label>
              <div className="flex items-center gap-2">
                <CloudMoon className="h-4 w-4 text-red-500" />
                <span>{impacts.stress_impact}/10</span>
              </div>
            </div>
            <Slider
              value={[impacts.stress_impact]}
              onValueChange={(value) => setImpacts({ ...impacts, stress_impact: value[0] })}
              min={1}
              max={10}
              step={1}
            />
          </div>
        </div>

        <Button 
          onClick={handleSubmit} 
          className="w-full"
          disabled={impactMutation.isPending}
        >
          Save Impact Data
        </Button>
      </CardContent>
    </Card>
  );
};
