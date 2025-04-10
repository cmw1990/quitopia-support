import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query";
import { supabase } from "@/integrations/supabase/supabase-client";
import { useAuth } from "@/components/AuthProvider";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { useToast } from "@/hooks/use-toast";
import { useState } from "react";

export function TriggerPatternAnalysis() {
  const { session } = useAuth();
  const { toast } = useToast();
  const queryClient = useQueryClient();
  const [triggerType, setTriggerType] = useState("");
  const [location, setLocation] = useState("");
  const [emotionalState, setEmotionalState] = useState<string[]>([]);

  const { data: patterns } = useQuery({
    queryKey: ['trigger-patterns'],
    queryFn: async () => {
      const { data, error } = await supabase
        .from('trigger_patterns')
        .select('*')
        .eq('user_id', session?.user?.id)
        .order('created_at', { ascending: false });
      
      if (error) throw error;
      return data;
    },
    enabled: !!session?.user?.id,
  });

  const addPattern = useMutation({
    mutationFn: async () => {
      if (!session?.user?.id) throw new Error("Must be logged in");
      
      const { error } = await supabase
        .from('trigger_patterns')
        .insert([{
          user_id: session.user.id,
          trigger_type: triggerType,
          location_patterns: [location],
          emotional_state: emotionalState,
          time_patterns: { time: new Date().toISOString() },
        }]);

      if (error) throw error;
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['trigger-patterns'] });
      toast({
        title: "Pattern logged",
        description: "Your trigger pattern has been recorded.",
      });
      setTriggerType("");
      setLocation("");
      setEmotionalState([]);
    },
    onError: () => {
      toast({
        title: "Error",
        description: "Failed to log pattern. Please try again.",
        variant: "destructive",
      });
    },
  });

  return (
    <Card>
      <CardHeader>
        <CardTitle>Trigger Pattern Analysis</CardTitle>
      </CardHeader>
      <CardContent className="space-y-4">
        <div className="space-y-2">
          <Label>Trigger Type</Label>
          <Input 
            value={triggerType}
            onChange={(e) => setTriggerType(e.target.value)}
            placeholder="e.g., Social, Stress, Time of day"
          />
        </div>
        
        <div className="space-y-2">
          <Label>Location</Label>
          <Input 
            value={location}
            onChange={(e) => setLocation(e.target.value)}
            placeholder="Where did this occur?"
          />
        </div>

        <div className="space-y-2">
          <Label>Emotional State</Label>
          <Input 
            value={emotionalState.join(", ")}
            onChange={(e) => setEmotionalState(e.target.value.split(", "))}
            placeholder="e.g., Stressed, Anxious, Happy"
          />
        </div>

        <Button 
          className="w-full"
          onClick={() => addPattern.mutate()}
          disabled={!triggerType || addPattern.isPending}
        >
          Log Pattern
        </Button>

        {patterns && patterns.length > 0 && (
          <div className="mt-4">
            <h3 className="font-semibold mb-2">Recent Patterns</h3>
            <div className="space-y-2">
              {patterns.map((pattern) => (
                <div key={pattern.id} className="p-2 bg-muted rounded">
                  <p className="font-medium">{pattern.trigger_type}</p>
                  <p className="text-sm text-muted-foreground">
                    Location: {pattern.location_patterns?.join(", ")}
                  </p>
                  <p className="text-sm text-muted-foreground">
                    Emotional State: {pattern.emotional_state?.join(", ")}
                  </p>
                </div>
              ))}
            </div>
          </div>
        )}
      </CardContent>
    </Card>
  );
}