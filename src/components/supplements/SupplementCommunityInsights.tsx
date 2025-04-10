import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query";
import { supabase } from "@/integrations/supabase/supabase-client";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Textarea } from "@/components/ui/textarea";
import { ThumbsUp, ThumbsDown, Loader2 } from "lucide-react";
import { useState } from "react";
import { useToast } from "@/hooks/use-toast";

interface SupplementCommunityInsightsProps {
  supplementName: string;
}

export function SupplementCommunityInsights({ supplementName }: SupplementCommunityInsightsProps) {
  const [newInsight, setNewInsight] = useState("");
  const { toast } = useToast();
  const queryClient = useQueryClient();

  const { data: insights, isLoading } = useQuery({
    queryKey: ['supplementInsights', supplementName],
    queryFn: async () => {
      const { data, error } = await supabase
        .from('supplement_community_insights')
        .select('*')
        .eq('supplement_name', supplementName)
        .order('created_at', { ascending: false });
      
      if (error) throw error;
      return data;
    },
  });

  const addInsightMutation = useMutation({
    mutationFn: async (content: string) => {
      const { error } = await supabase
        .from('supplement_community_insights')
        .insert({
          supplement_name: supplementName,
          content,
          insight_type: 'user_experience',
        });
      
      if (error) throw error;
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['supplementInsights'] });
      setNewInsight("");
      toast({
        title: "Success",
        description: "Your insight has been shared with the community",
      });
    },
    onError: (error) => {
      toast({
        title: "Error",
        description: "Failed to share insight. Please try again.",
        variant: "destructive",
      });
      console.error("Error sharing insight:", error);
    },
  });

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (!newInsight.trim()) return;
    addInsightMutation.mutate(newInsight);
  };

  if (isLoading) {
    return (
      <div className="flex justify-center p-4">
        <Loader2 className="h-6 w-6 animate-spin" />
      </div>
    );
  }

  return (
    <Card>
      <CardHeader>
        <CardTitle>Community Insights</CardTitle>
      </CardHeader>
      <CardContent>
        <form onSubmit={handleSubmit} className="space-y-4 mb-6">
          <Textarea
            value={newInsight}
            onChange={(e) => setNewInsight(e.target.value)}
            placeholder="Share your experience with this supplement..."
            className="min-h-[100px]"
          />
          <Button 
            type="submit" 
            disabled={addInsightMutation.isPending || !newInsight.trim()}
          >
            {addInsightMutation.isPending ? (
              <Loader2 className="mr-2 h-4 w-4 animate-spin" />
            ) : null}
            Share Insight
          </Button>
        </form>

        <div className="space-y-4">
          {insights?.map((insight) => (
            <Card key={insight.id} className="p-4">
              <p className="text-sm text-muted-foreground whitespace-pre-wrap">
                {insight.content}
              </p>
              <div className="flex items-center gap-4 mt-2">
                <Button variant="ghost" size="sm">
                  <ThumbsUp className="h-4 w-4 mr-1" />
                  {insight.upvotes || 0}
                </Button>
                <Button variant="ghost" size="sm">
                  <ThumbsDown className="h-4 w-4 mr-1" />
                  {insight.downvotes || 0}
                </Button>
              </div>
            </Card>
          ))}
        </div>
      </CardContent>
    </Card>
  );
}