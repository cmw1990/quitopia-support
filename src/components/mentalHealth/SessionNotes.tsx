
import { useState, useEffect } from "react";
import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query";
import { supabase } from "@/integrations/supabase/supabase-client";
import { useAuth } from "@/components/AuthProvider";
import { Card, CardHeader, CardTitle, CardContent } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Textarea } from "@/components/ui/textarea";
import { Input } from "@/components/ui/input";
import { useToast } from "@/hooks/use-toast";
import { FileText, Save } from "lucide-react";
import { ConsultationNote } from "@/types/ConsultationTypes";

interface SessionNotesProps {
  sessionId: string;
  clientId: string;
}

export function SessionNotes({ sessionId, clientId }: SessionNotesProps) {
  const { session } = useAuth();
  const { toast } = useToast();
  const queryClient = useQueryClient();
  const [notes, setNotes] = useState<Partial<ConsultationNote>>({
    content: "",
    mood_observed: "",
    progress_notes: "",
    recommendations: {},
    follow_up_date: ""
  });

  const { data: existingNotes } = useQuery({
    queryKey: ['session-notes', sessionId],
    queryFn: async () => {
      const { data } = await supabase
        .from('consultation_notes')
        .select('*')
        .eq('session_id', sessionId)
        .single();
      return data as ConsultationNote | null;
    }
  });

  useEffect(() => {
    if (existingNotes) {
      setNotes({
        content: existingNotes.content || "",
        mood_observed: existingNotes.mood_observed || "",
        progress_notes: existingNotes.progress_notes || "",
        recommendations: existingNotes.recommendations || {},
        follow_up_date: existingNotes.follow_up_date || ""
      });
    }
  }, [existingNotes]);

  const saveNotes = useMutation({
    mutationFn: async () => {
      if (!notes.content) {
        throw new Error("Content is required");
      }

      const { data, error } = await supabase
        .from('consultation_notes')
        .upsert({
          session_id: sessionId,
          professional_id: session?.user?.id,
          client_id: clientId,
          ...notes,
          content: notes.content // Ensure content is included and not undefined
        })
        .select()
        .single();

      if (error) throw error;
      return data;
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['session-notes'] });
      toast({
        title: "Success",
        description: "Session notes saved successfully"
      });
    },
    onError: (error) => {
      toast({
        title: "Error",
        description: "Failed to save session notes",
        variant: "destructive"
      });
      console.error('Notes error:', error);
    }
  });

  return (
    <Card>
      <CardHeader>
        <CardTitle className="flex items-center gap-2">
          <FileText className="h-5 w-5" />
          Session Notes
        </CardTitle>
      </CardHeader>
      <CardContent className="space-y-4">
        <div className="space-y-2">
          <label className="text-sm font-medium">Session Content</label>
          <Textarea
            value={notes.content}
            onChange={(e) => setNotes(prev => ({ ...prev, content: e.target.value }))}
            placeholder="Enter detailed session notes..."
            className="min-h-[150px]"
          />
        </div>

        <div className="space-y-2">
          <label className="text-sm font-medium">Observed Mood</label>
          <Input
            value={notes.mood_observed}
            onChange={(e) => setNotes(prev => ({ ...prev, mood_observed: e.target.value }))}
            placeholder="Describe client's mood..."
          />
        </div>

        <div className="space-y-2">
          <label className="text-sm font-medium">Progress Notes</label>
          <Textarea
            value={notes.progress_notes}
            onChange={(e) => setNotes(prev => ({ ...prev, progress_notes: e.target.value }))}
            placeholder="Note any progress or concerns..."
          />
        </div>

        <div className="space-y-2">
          <label className="text-sm font-medium">Follow-up Date</label>
          <Input
            type="date"
            value={notes.follow_up_date}
            onChange={(e) => setNotes(prev => ({ ...prev, follow_up_date: e.target.value }))}
          />
        </div>

        <Button 
          onClick={() => saveNotes.mutate()}
          disabled={saveNotes.isPending}
          className="w-full"
        >
          <Save className="h-4 w-4 mr-2" />
          {saveNotes.isPending ? "Saving..." : "Save Notes"}
        </Button>
      </CardContent>
    </Card>
  );
}
