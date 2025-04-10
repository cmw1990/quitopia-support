import { useQuery } from "@tanstack/react-query";
import { useAuth } from "@/components/AuthProvider";
import { supabase } from "@/integrations/supabase/supabase-client";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Quote, RefreshCw } from "lucide-react";
import { useState } from "react";
import { useToast } from "@/hooks/use-toast";

export const MotivationQuote = () => {
  const { session } = useAuth();
  const { toast } = useToast();
  const [isGenerating, setIsGenerating] = useState(false);

  const { data: userSubscription } = useQuery({
    queryKey: ['user-subscription'],
    queryFn: async () => {
      const { data, error } = await supabase
        .from('user_subscriptions')
        .select('*')
        .eq('user_id', session?.user?.id)
        .maybeSingle();

      if (error) throw error;
      return data;
    },
    enabled: !!session?.user?.id,
  });

  const { data: quote, refetch: refetchQuote } = useQuery({
    queryKey: ['motivation-quote'],
    queryFn: async () => {
      const isPremium = userSubscription?.tier === 'premium';
      
      if (isPremium) {
        const response = await fetch('/api/generate-motivation-quote', {
          method: 'POST',
          headers: {
            'Content-Type': 'application/json',
            'Authorization': `Bearer ${session?.access_token}`,
          },
          body: JSON.stringify({ premium: true }),
        });
        
        if (!response.ok) throw new Error('Failed to generate quote');
        return response.json();
      } else {
        const { data, error } = await supabase
          .from('motivation_quotes')
          .select('*')
          .order('created_at', { ascending: false })
          .limit(1)
          .single();

        if (error) throw error;
        return data;
      }
    },
    enabled: !!session?.user?.id,
  });

  const handleGenerateQuote = async () => {
    try {
      setIsGenerating(true);
      await refetchQuote();
      toast({
        title: "New quote generated!",
        description: "Your personalized quote has been updated.",
      });
    } catch (error) {
      toast({
        title: "Error generating quote",
        description: "Please try again later.",
        variant: "destructive",
      });
    } finally {
      setIsGenerating(false);
    }
  };

  return (
    <Card>
      <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
        <CardTitle className="text-sm font-medium">Daily Motivation</CardTitle>
        <Quote className="h-4 w-4 text-primary" />
      </CardHeader>
      <CardContent>
        <div className="space-y-4">
          <p className="text-lg font-medium">{quote?.content || "Loading..."}</p>
          {quote?.author && (
            <p className="text-sm text-muted-foreground">- {quote.author}</p>
          )}
          <div className="flex items-center justify-between">
            <Button
              variant="outline"
              size="sm"
              onClick={handleGenerateQuote}
              disabled={isGenerating || !(userSubscription?.tier === 'premium')}
            >
              {isGenerating ? (
                <RefreshCw className="h-4 w-4 animate-spin mr-2" />
              ) : (
                <RefreshCw className="h-4 w-4 mr-2" />
              )}
              New Quote
            </Button>
            {userSubscription?.tier !== 'premium' && (
              <p className="text-xs text-muted-foreground">
                Upgrade to premium for personalized quotes
              </p>
            )}
          </div>
        </div>
      </CardContent>
    </Card>
  );
};