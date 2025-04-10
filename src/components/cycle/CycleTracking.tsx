
import { useState } from "react";
import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query";
import { supabase } from "@/integrations/supabase/supabase-client";
import { useAuth } from "@/components/AuthProvider";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Label } from "@/components/ui/label";
import { Slider } from "@/components/ui/slider";
import { useToast } from "@/hooks/use-toast";
import { Moon, Sun, Brain, Heart, Battery, CloudMoon } from "lucide-react";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Badge } from "@/components/ui/badge";

const SYMPTOMS = [
  "Cramps",
  "Headache",
  "Fatigue",
  "Bloating",
  "Mood Swings",
  "Insomnia",
  "Back Pain",
  "Breast Tenderness"
];

const MOODS = [
  "Happy",
  "Calm",
  "Anxious",
  "Irritable",
  "Energetic",
  "Tired",
  "Neutral"
];

export const CycleTracking = () => {
  const { session } = useAuth();
  const { toast } = useToast();
  const queryClient = useQueryClient();
  const [entry, setEntry] = useState({
    energy_level: 5,
    stress_level: 5,
    mood: "neutral",
    symptoms: [] as string[],
    sleep_quality: 5,
    cycle_phase: null as string | null
  });

  // Fetch today's cycle data
  const { data: todayEntry } = useQuery({
    queryKey: ['cycle_tracking', session?.user?.id, new Date().toISOString().split('T')[0]],
    queryFn: async () => {
      if (!session?.user?.id) return null;
      
      const { data, error } = await supabase
        .from('cycle_tracking')
        .select('*')
        .eq('user_id', session.user.id)
        .eq('date', new Date().toISOString().split('T')[0])
        .maybeSingle();
      
      if (error) throw error;
      return data;
    },
    enabled: !!session?.user?.id
  });

  // Add or update cycle tracking entry
  const mutation = useMutation({
    mutationFn: async (entryData: typeof entry) => {
      if (!session?.user?.id) throw new Error('Not authenticated');

      const { data, error } = await supabase
        .from('cycle_tracking')
        .upsert({
          user_id: session.user.id,
          date: new Date().toISOString().split('T')[0],
          energy_level: entryData.energy_level,
          stress_level: entryData.stress_level,
          mood: entryData.mood,
          symptoms: entryData.symptoms,
          sleep_quality: entryData.sleep_quality,
          cycle_phase: entryData.cycle_phase
        })
        .select()
        .single();

      if (error) throw error;
      return data;
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['cycle_tracking'] });
      toast({
        title: "Entry Saved",
        description: "Your cycle tracking data has been updated"
      });
    },
    onError: (error) => {
      console.error('Error saving cycle data:', error);
      toast({
        title: "Error",
        description: "Failed to save your entry. Please try again.",
        variant: "destructive"
      });
    }
  });

  const toggleSymptom = (symptom: string) => {
    setEntry(prev => ({
      ...prev,
      symptoms: prev.symptoms.includes(symptom) 
        ? prev.symptoms.filter(s => s !== symptom)
        : [...prev.symptoms, symptom]
    }));
  };

  return (
    <Card>
      <CardHeader>
        <CardTitle className="flex items-center gap-2">
          <Moon className="h-5 w-5 text-primary" />
          Cycle Tracking
        </CardTitle>
      </CardHeader>
      <CardContent className="space-y-6">
        <div className="space-y-4">
          <div className="space-y-2">
            <div className="flex items-center justify-between">
              <Label>Energy Level</Label>
              <div className="flex items-center gap-2">
                <Battery className="h-4 w-4 text-primary" />
                <span>{entry.energy_level}/10</span>
              </div>
            </div>
            <Slider
              value={[entry.energy_level]}
              onValueChange={(value) => setEntry({ ...entry, energy_level: value[0] })}
              min={1}
              max={10}
              step={1}
            />
          </div>

          <div className="space-y-2">
            <div className="flex items-center justify-between">
              <Label>Stress Level</Label>
              <div className="flex items-center gap-2">
                <Brain className="h-4 w-4 text-primary" />
                <span>{entry.stress_level}/10</span>
              </div>
            </div>
            <Slider
              value={[entry.stress_level]}
              onValueChange={(value) => setEntry({ ...entry, stress_level: value[0] })}
              min={1}
              max={10}
              step={1}
            />
          </div>

          <div className="space-y-2">
            <div className="flex items-center justify-between">
              <Label>Sleep Quality</Label>
              <div className="flex items-center gap-2">
                <CloudMoon className="h-4 w-4 text-primary" />
                <span>{entry.sleep_quality}/10</span>
              </div>
            </div>
            <Slider
              value={[entry.sleep_quality]}
              onValueChange={(value) => setEntry({ ...entry, sleep_quality: value[0] })}
              min={1}
              max={10}
              step={1}
            />
          </div>

          <div className="space-y-2">
            <Label>Mood</Label>
            <Select 
              value={entry.mood} 
              onValueChange={(value) => setEntry({ ...entry, mood: value })}
            >
              <SelectTrigger>
                <SelectValue placeholder="Select your mood" />
              </SelectTrigger>
              <SelectContent>
                {MOODS.map(mood => (
                  <SelectItem key={mood.toLowerCase()} value={mood.toLowerCase()}>
                    {mood}
                  </SelectItem>
                ))}
              </SelectContent>
            </Select>
          </div>

          <div className="space-y-2">
            <Label>Symptoms</Label>
            <div className="flex flex-wrap gap-2">
              {SYMPTOMS.map(symptom => (
                <Badge
                  key={symptom}
                  variant={entry.symptoms.includes(symptom) ? "default" : "outline"}
                  className="cursor-pointer"
                  onClick={() => toggleSymptom(symptom)}
                >
                  {symptom}
                </Badge>
              ))}
            </div>
          </div>

          <div className="space-y-2">
            <Label>Cycle Phase</Label>
            <Select 
              value={entry.cycle_phase || ''} 
              onValueChange={(value) => setEntry({ ...entry, cycle_phase: value })}
            >
              <SelectTrigger>
                <SelectValue placeholder="Select cycle phase" />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="menstrual">Menstrual</SelectItem>
                <SelectItem value="follicular">Follicular</SelectItem>
                <SelectItem value="ovulatory">Ovulatory</SelectItem>
                <SelectItem value="luteal">Luteal</SelectItem>
              </SelectContent>
            </Select>
          </div>
        </div>

        <Button 
          onClick={() => mutation.mutate(entry)} 
          className="w-full"
          disabled={mutation.isPending}
        >
          Save Entry
        </Button>
      </CardContent>
    </Card>
  );
};
