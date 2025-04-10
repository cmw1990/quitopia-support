
import { useState } from "react";
import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query";
import { supabase } from "@/integrations/supabase/supabase-client";
import { useAuth } from "@/components/AuthProvider";
import { Card, CardHeader, CardTitle, CardContent } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Textarea } from "@/components/ui/textarea";
import { Switch } from "@/components/ui/switch";
import { useToast } from "@/hooks/use-toast";
import { Star, MessageSquare } from "lucide-react";

interface SessionFeedbackProps {
  sessionId: string;
  professionalId: string;
}

export function SessionFeedback({ sessionId, professionalId }: SessionFeedbackProps) {
  const { session } = useAuth();
  const { toast } = useToast();
  const queryClient = useQueryClient();
  const [rating, setRating] = useState(5);
  const [feedback, setFeedback] = useState("");
  const [isAnonymous, setIsAnonymous] = useState(false);

  const { data: existingFeedback } = useQuery({
    queryKey: ['session-feedback', sessionId],
    queryFn: async () => {
      const { data } = await supabase
        .from('consultation_feedback')
        .select('*')
        .eq('session_id', sessionId)
        .eq('client_id', session?.user?.id)
        .single();
      return data;
    },
    enabled: !!sessionId && !!session?.user?.id
  });

  const submitFeedback = useMutation({
    mutationFn: async () => {
      const { data, error } = await supabase
        .from('consultation_feedback')
        .upsert({
          session_id: sessionId,
          professional_id: professionalId,
          client_id: session?.user?.id,
          rating,
          feedback_text: feedback,
          anonymous: isAnonymous
        })
        .select();

      if (error) throw error;
      return data;
    },
    onSettled: () => {
      queryClient.invalidateQueries({ queryKey: ['session-feedback'] });
    },
    onSuccess: () => {
      toast({
        title: "Success",
        description: "Thank you for your feedback!"
      });
    },
    onError: (error) => {
      toast({
        title: "Error",
        description: "Failed to submit feedback",
        variant: "destructive"
      });
      console.error('Feedback error:', error);
    }
  });

  return (
    <Card>
      <CardHeader>
        <CardTitle className="flex items-center gap-2">
          <MessageSquare className="h-5 w-5" />
          Session Feedback
        </CardTitle>
      </CardHeader>
      <CardContent className="space-y-6">
        <div className="space-y-2">
          <label className="text-sm font-medium">Rate your session (1-5)</label>
          <div className="flex gap-2">
            {[1, 2, 3, 4, 5].map((value) => (
              <button
                key={value}
                onClick={() => setRating(value)}
                className={`p-2 rounded-full transition-colors ${
                  rating >= value ? 'text-yellow-500' : 'text-gray-300'
                }`}
              >
                <Star className="h-6 w-6" />
              </button>
            ))}
          </div>
        </div>

        <div className="space-y-2">
          <label className="text-sm font-medium">Your Feedback</label>
          <Textarea
            value={feedback}
            onChange={(e) => setFeedback(e.target.value)}
            placeholder="Share your thoughts about the session..."
            className="min-h-[100px]"
          />
        </div>

        <div className="flex items-center gap-2">
          <Switch
            checked={isAnonymous}
            onCheckedChange={setIsAnonymous}
          />
          <label className="text-sm">Submit anonymously</label>
        </div>

        <Button 
          onClick={() => submitFeedback.mutate()}
          disabled={submitFeedback.isPending}
          className="w-full"
        >
          {submitFeedback.isPending ? "Submitting..." : "Submit Feedback"}
        </Button>
      </CardContent>
    </Card>
  );
}
