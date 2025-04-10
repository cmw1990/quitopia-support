import { useState } from "react";
import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query";
import { SUPABASE_URL, SUPABASE_KEY } from "@/integrations/supabase/db-client";
import { useAuth } from "@/components/AuthProvider";
import { Button } from "@/components/ui/button";
import { Card, CardHeader, CardTitle, CardContent } from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Slider } from "@/components/ui/slider";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { useToast } from "@/hooks/use-toast";
import { BarChart, Clock, MapPin, Brain } from "lucide-react";

export const CravingTracker = () => {
  const { toast } = useToast();
  const { session } = useAuth();
  const queryClient = useQueryClient();
  const [intensity, setIntensity] = useState(5);
  const [location, setLocation] = useState("");
  const [activity, setActivity] = useState("");
  const [notes, setNotes] = useState("");
  const [triggerType, setTriggerType] = useState("emotional");

  const { data: recentCravings, isLoading } = useQuery({
    queryKey: ['craving-logs'],
    queryFn: async () => {
      // Using direct REST API call with SSOT8001 compliant table name (suffix 8)
      const response = await fetch(
        `${SUPABASE_URL}/rest/v1/craving_logs8?user_id=eq.${session?.user?.id}&order=created_at.desc&limit=5`,
        {
          headers: {
            'apikey': SUPABASE_KEY,
            'Authorization': `Bearer ${session?.access_token}`
          }
        }
      );

      if (!response.ok) {
        const error = await response.json();
        throw new Error(error.message || response.statusText);
      }

      return await response.json();
    },
    enabled: !!session?.user?.id,
  });

  const logCraving = useMutation({
    mutationFn: async () => {
      // Using direct REST API call with SSOT8001 compliant table name (suffix 8)
      const response = await fetch(`${SUPABASE_URL}/rest/v1/craving_logs8`, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          'apikey': SUPABASE_KEY,
          'Authorization': `Bearer ${session?.access_token}`,
          'Prefer': 'return=minimal'
        },
        body: JSON.stringify({
          user_id: session?.user?.id,
          intensity,
          location,
          activity,
          notes,
          trigger_type: triggerType,
          created_at: new Date().toISOString()
        })
      });

      if (!response.ok) {
        const error = await response.json();
        throw new Error(error.message || response.statusText);
      }
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['craving-logs'] });
      toast({
        title: "Craving logged",
        description: "Your craving has been recorded successfully.",
      });
      setLocation("");
      setActivity("");
      setNotes("");
      setIntensity(5);
      setTriggerType("emotional");
    },
    onError: (error) => {
      toast({
        title: "Error",
        description: "Failed to log craving. Please try again.",
        variant: "destructive",
      });
      console.error("Error logging craving:", error);
    },
  });

  return (
    <Card className="w-full max-w-2xl mx-auto">
      <CardHeader>
        <CardTitle className="flex items-center gap-2">
          <BarChart className="h-5 w-5" />
          Track Craving
        </CardTitle>
      </CardHeader>
      <CardContent className="space-y-4">
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
          <Label htmlFor="trigger-type" className="flex items-center gap-2">
            <Brain className="h-4 w-4" />
            Trigger Type
          </Label>
          <Select value={triggerType} onValueChange={setTriggerType}>
            <SelectTrigger id="trigger-type">
              <SelectValue placeholder="Select trigger type" />
            </SelectTrigger>
            <SelectContent>
              <SelectItem value="emotional">Emotional</SelectItem>
              <SelectItem value="social">Social</SelectItem>
              <SelectItem value="environmental">Environmental</SelectItem>
              <SelectItem value="physical">Physical</SelectItem>
              <SelectItem value="routine">Routine/Habit</SelectItem>
            </SelectContent>
          </Select>
        </div>

        <div className="space-y-2">
          <Label htmlFor="location" className="flex items-center gap-2">
            <MapPin className="h-4 w-4" />
            Location
          </Label>
          <Input
            id="location"
            value={location}
            onChange={(e) => setLocation(e.target.value)}
            placeholder="Where are you?"
          />
        </div>

        <div className="space-y-2">
          <Label htmlFor="activity" className="flex items-center gap-2">
            <Clock className="h-4 w-4" />
            Current Activity
          </Label>
          <Input
            id="activity"
            value={activity}
            onChange={(e) => setActivity(e.target.value)}
            placeholder="What are you doing?"
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
          onClick={() => logCraving.mutate()}
          disabled={logCraving.isPending}
        >
          Log Craving
        </Button>

        {recentCravings && recentCravings.length > 0 && (
          <div className="mt-6">
            <h3 className="text-lg font-semibold mb-3">Recent Cravings</h3>
            <div className="space-y-3">
              {recentCravings.map((craving) => (
                <Card key={craving.id}>
                  <CardContent className="p-4">
                    <div className="flex justify-between items-start">
                      <div>
                        <p className="font-medium">Intensity: {craving.intensity}/10</p>
                        <p className="text-sm text-muted-foreground">
                          Type: {craving.trigger_type}
                        </p>
                        {craving.location && (
                          <p className="text-sm text-muted-foreground">
                            Location: {craving.location}
                          </p>
                        )}
                      </div>
                      <span className="text-sm text-muted-foreground">
                        {new Date(craving.created_at).toLocaleTimeString()}
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