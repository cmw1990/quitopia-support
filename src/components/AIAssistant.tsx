import { useState } from "react";
import { useQuery } from "@tanstack/react-query";
import { supabaseRequest } from '@/utils/supabaseRequest'; // Corrected import
import { Card, CardContent, CardHeader, CardTitle } from "./ui/card";
import { Button } from "./ui/button";
import { Loader2, Brain } from "lucide-react";
import { useToast } from "./hooks/use-toast";

interface AIAssistantProps {
  type: 'analyze_sleep' | 'analyze_energy' | 'analyze_focus' | 'daily_summary' | 
        'sleep_recommendations' | 'sleep_pattern_analysis' | 'sleep_quality_prediction' |
        'sleep_habit_comparison' | 'sleep_environment_analysis' | 'sleep_cycle_optimization' |
        'cognitive_impact_analysis' | 'lifestyle_correlation' | 'recovery_suggestions' |
        'next_day_preparation' | 'focus_optimization' | 'energy_pattern_analysis' |
        'productivity_insights' | 'habit_formation_analysis' | 'wellness_correlation' |
        'circadian_rhythm_analysis' | 'stress_impact_analysis' | 'recovery_optimization' |
        'performance_prediction' | 'behavioral_patterns' | 'cognitive_load_analysis' |
        'attention_span_optimization' | 'mental_stamina_tracking' | 'focus_fatigue_analysis' |
        'weather_health_analysis'; // Added the new type here
  data: any;
}

export const AIAssistant = ({ type, data }: AIAssistantProps) => {
  const [isAnalyzing, setIsAnalyzing] = useState(false);
  const [analysis, setAnalysis] = useState<string | null>(null);
  const { toast } = useToast();

  // Determine if this analysis type requires AI
  const requiresAI = (type: string): boolean => {
    const aiRequiredTypes = [
      'cognitive_impact_analysis',
      'lifestyle_correlation',
      'recovery_suggestions',
      'behavioral_patterns',
      'cognitive_load_analysis',
      'energy_pattern_analysis',
      'circadian_rhythm_analysis'
    ];
    return aiRequiredTypes.includes(type);
  };

  const handleAnalyze = async () => {
    try {
      setIsAnalyzing(true);
      
      // For simple analyses, use local processing first
      if (!requiresAI(type)) {
        const basicAnalysis = await performLocalAnalysis(data);
        if (basicAnalysis.isComplete) {
          setAnalysis(basicAnalysis.result);
          setIsAnalyzing(false);
          return;
        }
      }

      // Proceed with AI analysis if needed
      // Use supabaseRequest, handle response
      const { data: responseData, error: aiError } = await supabaseRequest<any>( // Define a specific type if known
        '/functions/v1/ai-assistant',
        {
          method: 'POST',
          body: JSON.stringify({ type, data }),
        }
        // No session argument needed
      );

      if (aiError) {
        // Throwing error here to be caught by the catch block below
        throw aiError;
      }

      // Assuming the successful response structure has a 'data' property
      // Check if responseData has the expected structure before accessing properties
      if (!responseData || typeof responseData.analysis === 'undefined') {
          throw new Error("Invalid response structure from AI function");
      }
      setAnalysis(responseData.analysis); // Access analysis from the response data

      // Error handling moved to the catch block below, analysis setting moved above
    } catch (error) {
      console.error('Error getting AI analysis:', error);
      toast({
        title: "Error",
        description: "Failed to get analysis. Please try again.",
        variant: "destructive",
      });
    } finally {
      setIsAnalyzing(false);
    }
  };

  const performLocalAnalysis = async (data: any) => {
    // Implement local analysis logic for simple metrics
    // Returns { isComplete: boolean, result: string }
    return {
      isComplete: false,
      result: ''
    };
  };

  return (
    <Card>
      <CardHeader>
        <CardTitle className="flex items-center gap-2">
          <Brain className="h-5 w-5 text-primary" />
          {requiresAI(type) ? 'AI Analysis' : 'Smart Analysis'}
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
                {requiresAI(type) ? 'AI Analyzing...' : 'Analyzing...'}
              </>
            ) : (
              requiresAI(type) ? 'Get AI Analysis' : 'Get Analysis'
            )}
          </Button>
        ) : (
          <div className="space-y-4">
            <div className="text-sm text-muted-foreground whitespace-pre-wrap">
              {analysis}
            </div>
            <Button 
              variant="outline" 
              onClick={() => setAnalysis(null)}
              size="sm"
            >
              Get New Analysis
            </Button>
          </div>
        )}
      </CardContent>
    </Card>
  );
};
