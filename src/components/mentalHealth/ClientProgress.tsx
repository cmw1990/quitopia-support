
import { useState, useEffect } from "react";
import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query";
import { supabase } from "@/integrations/supabase/supabase-client";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import { Textarea } from "@/components/ui/textarea";
import { Button } from "@/components/ui/button";
import { useToast } from "@/hooks/use-toast";
import { ClientProgressTracking } from "@/types/ConsultationTypes";

interface ClientProgressProps {
  clientId: string;
  sessionId: string;
}

export function ClientProgress({ clientId, sessionId }: ClientProgressProps) {
  const { toast } = useToast();
  const queryClient = useQueryClient();
  const [progressData, setProgressData] = useState<Partial<ClientProgressTracking>>({
    progress_rating: 5,
    notes: "",
    homework: "",
    next_steps: ""
  });

  const { data: existingProgress } = useQuery({
    queryKey: ['client-progress', sessionId],
    queryFn: async () => {
      const { data, error } = await supabase
        .from('client_progress_tracking')
        .select('*')
        .eq('session_id', sessionId)
        .maybeSingle();

      if (error) throw error;
      return data as ClientProgressTracking;
    },
    enabled: !!sessionId
  });

  const updateProgress = useMutation({
    mutationFn: async () => {
      const { data, error } = await supabase
        .from('client_progress_tracking')
        .upsert({
          session_id: sessionId,
          client_id: clientId,
          ...progressData
        })
        .select();

      if (error) throw error;
      return data;
    },
    onSettled: () => {
      queryClient.invalidateQueries({ queryKey: ['client-progress'] });
    },
    onSuccess: () => {
      toast({
        title: "Success",
        description: "Progress updated successfully"
      });
    },
    onError: (error) => {
      toast({
        title: "Error",
        description: "Failed to update progress",
        variant: "destructive"
      });
      console.error('Progress update error:', error);
    }
  });

  // Update form when existing data is loaded
  useEffect(() => {
    if (existingProgress) {
      setProgressData({
        progress_rating: existingProgress.progress_rating || 5,
        notes: existingProgress.notes || "",
        homework: existingProgress.homework || "",
        next_steps: existingProgress.next_steps || ""
      });
    }
  }, [existingProgress]);

  return (
    <Card>
      <CardHeader>
        <CardTitle>Client Progress Tracking</CardTitle>
      </CardHeader>
      <CardContent className="space-y-4">
        <div className="space-y-2">
          <label className="text-sm font-medium">Progress Rating (1-10)</label>
          <Input
            type="number"
            min="1"
            max="10"
            value={progressData.progress_rating}
            onChange={(e) => setProgressData(prev => ({ 
              ...prev, 
              progress_rating: parseInt(e.target.value) 
            }))}
          />
        </div>

        <div className="space-y-2">
          <label className="text-sm font-medium">Progress Notes</label>
          <Textarea
            value={progressData.notes}
            onChange={(e) => setProgressData(prev => ({ 
              ...prev, 
              notes: e.target.value 
            }))}
            placeholder="Document client's progress..."
          />
        </div>

        <div className="space-y-2">
          <label className="text-sm font-medium">Homework/Exercises</label>
          <Textarea
            value={progressData.homework}
            onChange={(e) => setProgressData(prev => ({ 
              ...prev, 
              homework: e.target.value 
            }))}
            placeholder="Assign homework or exercises..."
          />
        </div>

        <div className="space-y-2">
          <label className="text-sm font-medium">Next Steps</label>
          <Textarea
            value={progressData.next_steps}
            onChange={(e) => setProgressData(prev => ({ 
              ...prev, 
              next_steps: e.target.value 
            }))}
            placeholder="Outline next steps and goals..."
          />
        </div>

        <Button 
          onClick={() => updateProgress.mutate()}
          disabled={updateProgress.isPending}
          className="w-full"
        >
          {updateProgress.isPending ? "Updating..." : "Update Progress"}
        </Button>
      </CardContent>
    </Card>
  );
}
