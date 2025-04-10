import { useState, useEffect } from "react";
import { useQuery } from "@tanstack/react-query";
import { SUPABASE_URL, SUPABASE_KEY } from "@/integrations/supabase/db-client";
import { Card } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { useToast } from "@/hooks/use-toast";
import { Sparkles, Target, Trophy, RefreshCw } from "lucide-react";
import { useAuth } from "@/components/AuthProvider";

interface MotivationQuote {
  id: string;
  content: string;
  author: string;
  created_at: string;
  updated_at: string;
}

export const DailyMotivation = () => {
  const { toast } = useToast();
  const { session } = useAuth();
  const [dailyGoal, setDailyGoal] = useState("");
  const [isGeneratingQuote, setIsGeneratingQuote] = useState(false);

  const { data: quote, refetch: refetchQuote } = useQuery<MotivationQuote>({
    queryKey: ["dailyQuote"],
    queryFn: async () => {
      const response = await fetch(
        `${SUPABASE_URL}/rest/v1/motivation_quotes?order=created_at.desc&limit=1`,
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

      const data = await response.json();
      return data[0];
    },
    enabled: !!session?.access_token
  });

  const generatePersonalizedQuote = async () => {
    if (!session?.user?.id) return;
    
    setIsGeneratingQuote(true);
    try {
      const response = await fetch(
        `${SUPABASE_URL}/functions/v1/generate-motivation-quote`,
        {
          method: 'POST',
          headers: {
            'Content-Type': 'application/json',
            'apikey': SUPABASE_KEY,
            'Authorization': `Bearer ${session.access_token}`
          },
          body: JSON.stringify({
            user_id: session.user.id
          })
        }
      );

      if (!response.ok) {
        const error = await response.json();
        throw new Error(error.message || response.statusText);
      }
      
      await refetchQuote();
      
      toast({
        title: "New quote generated!",
        description: "Your personalized quote is ready.",
      });
    } catch (error) {
      console.error("Error generating quote:", error);
      toast({
        title: "Error",
        description: "Failed to generate a new quote. Please try again.",
        variant: "destructive",
      });
    } finally {
      setIsGeneratingQuote(false);
    }
  };

  const saveDailyGoal = async () => {
    if (!session?.user?.id) return;

    try {
      const response = await fetch(
        `${SUPABASE_URL}/rest/v1/motivation_tracking`,
        {
          method: 'POST',
          headers: {
            'Content-Type': 'application/json',
            'apikey': SUPABASE_KEY,
            'Authorization': `Bearer ${session.access_token}`,
            'Prefer': 'return=minimal'
          },
          body: JSON.stringify({
            user_id: session.user.id,
            daily_goal: dailyGoal
          })
        }
      );

      if (!response.ok) {
        const error = await response.json();
        throw new Error(error.message || response.statusText);
      }

      toast({
        title: "Goal saved!",
        description: "Keep pushing forward!",
      });
      setDailyGoal("");
    } catch (error) {
      console.error("Error saving goal:", error);
      toast({
        title: "Error saving goal",
        description: "Please try again",
        variant: "destructive",
      });
    }
  };

  return (
    <Card className="p-6 space-y-6">
      <div className="flex items-center justify-between">
        <div className="flex items-center gap-3">
          <Sparkles className="h-6 w-6 text-yellow-500" />
          <h2 className="text-2xl font-semibold">Daily Inspiration</h2>
        </div>
        <Button
          variant="outline"
          size="sm"
          onClick={generatePersonalizedQuote}
          disabled={isGeneratingQuote}
          className="gap-2"
        >
          {isGeneratingQuote ? (
            <RefreshCw className="h-4 w-4 animate-spin" />
          ) : (
            <Sparkles className="h-4 w-4" />
          )}
          New Quote
        </Button>
      </div>

      <div className="bg-gradient-to-r from-blue-50 to-purple-50 dark:from-blue-950 dark:to-purple-950 p-4 rounded-lg">
        <p className="text-lg italic">"{quote?.content}"</p>
        <p className="text-sm text-muted-foreground mt-2">- {quote?.author}</p>
      </div>

      <div className="space-y-4">
        <div className="flex items-center gap-2">
          <Target className="h-5 w-5 text-blue-500" />
          <h3 className="font-semibold">Set Your Daily Goal</h3>
        </div>
        
        <div className="flex gap-2">
          <Input
            value={dailyGoal}
            onChange={(e) => setDailyGoal(e.target.value)}
            placeholder="What's your main goal for today?"
            className="flex-1"
          />
          <Button onClick={saveDailyGoal}>Save</Button>
        </div>
      </div>
    </Card>
  );
};