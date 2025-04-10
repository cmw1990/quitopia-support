import { useState } from "react";
import { useQuery } from "@tanstack/react-query";
import { supabase } from "@/integrations/supabase/supabase-client";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Loader2, Brain } from "lucide-react";
import { useToast } from "@/hooks/use-toast";

interface SupplementAIAnalysisProps {
  supplementName: string;
  supplementData: any;
}

export function SupplementAIAnalysis({ supplementName, supplementData }: SupplementAIAnalysisProps) {
  const [isAnalyzing, setIsAnalyzing] = useState(false);
  const { toast } = useToast();

  const { data: analysis, refetch } = useQuery({
    queryKey: ['supplementAnalysis', supplementName],
    queryFn: async () => {
      const { data, error } = await supabase
        .from('supplement_ai_analysis')
        .select('*')
        .eq('supplement_name', supplementName)
        .single();
      
      if (error) throw error;
      return data;
    },
  });

  const handleAnalyze = async () => {
    try {
      setIsAnalyzing(true);
      const { data: response, error } = await supabase.functions.invoke('analyze-supplements', {
        body: { supplementName, supplementData }
      });

      if (error) throw error;
      await refetch();
      
      toast({
        title: "Analysis Complete",
        description: "AI analysis has been updated successfully",
      });
    } catch (error) {
      console.error('Error getting AI analysis:', error);
      toast({
        title: "Error",
        description: "Failed to analyze supplement data. Please try again.",
        variant: "destructive",
      });
    } finally {
      setIsAnalyzing(false);
    }
  };

  return (
    <Card>
      <CardHeader>
        <CardTitle className="flex items-center gap-2">
          <Brain className="h-5 w-5 text-primary" />
          AI Analysis
        </CardTitle>
      </CardHeader>
      <CardContent>
        {!analysis ? (
          <Button 
            onClick={handleAnalyze} 
            disabled={isAnalyzing}
            className="w-full"
          >
            {isAnalyzing ? (
              <>
                <Loader2 className="mr-2 h-4 w-4 animate-spin" />
                Analyzing...
              </>
            ) : (
              'Get AI Analysis'
            )}
          </Button>
        ) : (
          <div className="space-y-4">
            <div>
              <h4 className="font-medium mb-2">Research Summary</h4>
              <p className="text-sm text-muted-foreground">{analysis.research_summary}</p>
            </div>
            
            <div>
              <h4 className="font-medium mb-2">Optimal Timing</h4>
              <p className="text-sm text-muted-foreground">{analysis.optimal_timing_suggestion}</p>
            </div>

            {analysis.interaction_warnings?.length > 0 && (
              <div>
                <h4 className="font-medium mb-2">Interaction Warnings</h4>
                <ul className="list-disc list-inside text-sm text-muted-foreground">
                  {analysis.interaction_warnings.map((warning: string, index: number) => (
                    <li key={index}>{warning}</li>
                  ))}
                </ul>
              </div>
            )}

            <Button 
              variant="outline" 
              onClick={handleAnalyze}
              size="sm"
              className="mt-4"
            >
              Refresh Analysis
            </Button>
          </div>
        )}
      </CardContent>
    </Card>
  );
}