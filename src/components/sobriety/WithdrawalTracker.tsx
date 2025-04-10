import { useState } from "react";
import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query";
import { supabase } from "@/integrations/supabase/supabase-client";
import { Button } from "@/components/ui/button";
import { Card, CardHeader, CardTitle, CardContent } from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Slider } from "@/components/ui/slider";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { useToast } from "@/hooks/use-toast";
import { Activity, Brain, Clock } from "lucide-react";

export const WithdrawalTracker = () => {
  const { toast } = useToast();
  const queryClient = useQueryClient();
  const [intensity, setIntensity] = useState(5);
  const [symptomType, setSymptomType] = useState("");
  const [duration, setDuration] = useState("");
  const [copingMethods, setCopingMethods] = useState("");
  const [notes, setNotes] = useState("");

  const { data: recentSymptoms } = useQuery({
    queryKey: ['withdrawal-symptoms'],
    queryFn: async () => {
      const { data, error } = await supabase
        .from('withdrawal_symptoms')
        .select('*')
        .order('created_at', { ascending: false })
        .limit(5);

      if (error) throw error;
      return data;
    },
  });

  const logSymptom = useMutation({
    mutationFn: async () => {
      const { error } = await supabase
        .from('withdrawal_symptoms')
        .insert([{
          symptom_type: symptomType,
          intensity,
          duration_hours: parseInt(duration),
          coping_methods: copingMethods.split(',').map(method => method.trim()),
          notes,
          user_id: (await supabase.auth.getUser()).data.user?.id
        }]);

      if (error) throw error;
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['withdrawal-symptoms'] });
      toast({
        title: "Symptom logged",
        description: "Your withdrawal symptom has been recorded successfully.",
      });
      setSymptomType("");
      setIntensity(5);
      setDuration("");
      setCopingMethods("");
      setNotes("");
    },
    onError: (error) => {
      toast({
        title: "Error",
        description: "Failed to log withdrawal symptom. Please try again.",
        variant: "destructive",
      });
      console.error("Error logging withdrawal symptom:", error);
    },
  });

  return (
    <Card className="w-full max-w-2xl mx-auto">
      <CardHeader>
        <CardTitle className="flex items-center gap-2">
          <Activity className="h-5 w-5" />
          Track Withdrawal Symptoms
        </CardTitle>
      </CardHeader>
      <CardContent className="space-y-4">
        <div className="space-y-2">
          <Label htmlFor="symptom-type" className="flex items-center gap-2">
            <Brain className="h-4 w-4" />
            Symptom Type
          </Label>
          <Select value={symptomType} onValueChange={setSymptomType}>
            <SelectTrigger id="symptom-type">
              <SelectValue placeholder="Select symptom type" />
            </SelectTrigger>
            <SelectContent>
              <SelectItem value="anxiety">Anxiety</SelectItem>
              <SelectItem value="irritability">Irritability</SelectItem>
              <SelectItem value="insomnia">Insomnia</SelectItem>
              <SelectItem value="headache">Headache</SelectItem>
              <SelectItem value="nausea">Nausea</SelectItem>
              <SelectItem value="fatigue">Fatigue</SelectItem>
              <SelectItem value="concentration">Poor Concentration</SelectItem>
              <SelectItem value="appetite">Changed Appetite</SelectItem>
            </SelectContent>
          </Select>
        </div>

        <div className="space-y-2">
          <Label>Intensity</Label>
          <Slider
            value={[intensity]}
            onValueChange={(value) => setIntensity(value[0])}
            min={1}
            max={10}
            step={1}
            className="w-full"
          />
          <div className="flex justify-between text-sm text-muted-foreground">
            <span>Mild</span>
            <span>Moderate</span>
            <span>Severe</span>
          </div>
        </div>

        <div className="space-y-2">
          <Label htmlFor="duration" className="flex items-center gap-2">
            <Clock className="h-4 w-4" />
            Duration (hours)
          </Label>
          <Input
            id="duration"
            type="number"
            value={duration}
            onChange={(e) => setDuration(e.target.value)}
            placeholder="How long did it last?"
          />
        </div>

        <div className="space-y-2">
          <Label htmlFor="coping">Coping Methods</Label>
          <Input
            id="coping"
            value={copingMethods}
            onChange={(e) => setCopingMethods(e.target.value)}
            placeholder="Enter coping methods (comma-separated)"
          />
        </div>

        <div className="space-y-2">
          <Label htmlFor="notes">Notes</Label>
          <Input
            id="notes"
            value={notes}
            onChange={(e) => setNotes(e.target.value)}
            placeholder="Any additional notes..."
          />
        </div>

        <Button 
          className="w-full"
          onClick={() => logSymptom.mutate()}
          disabled={logSymptom.isPending || !symptomType}
        >
          Log Symptom
        </Button>

        {recentSymptoms && recentSymptoms.length > 0 && (
          <div className="mt-6">
            <h3 className="text-lg font-semibold mb-3">Recent Symptoms</h3>
            <div className="space-y-3">
              {recentSymptoms.map((symptom) => (
                <Card key={symptom.id}>
                  <CardContent className="p-4">
                    <div className="flex justify-between items-start">
                      <div>
                        <p className="font-medium">{symptom.symptom_type}</p>
                        <p className="text-sm text-muted-foreground">
                          Intensity: {symptom.intensity}/10
                        </p>
                        <p className="text-sm text-muted-foreground">
                          Duration: {symptom.duration_hours} hours
                        </p>
                        {symptom.coping_methods && (
                          <p className="text-sm text-muted-foreground">
                            Coping: {symptom.coping_methods.join(', ')}
                          </p>
                        )}
                      </div>
                      <span className="text-sm text-muted-foreground">
                        {new Date(symptom.created_at).toLocaleTimeString()}
                      </span>
                    </div>
                  </CardContent>
                </Card>
              ))}
            </div>
          </div>
        )}
      </CardContent>
    </Card>
  );
};