import { useState, useEffect } from "react";
import { useQuery } from "@tanstack/react-query";
import { supabase } from "@/integrations/supabase/supabase-client";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Progress } from "@/components/ui/progress";
import { Brain, Heart, Sun, Moon, Battery, Zap } from "lucide-react";
import { useToast } from "@/hooks/use-toast";

interface MoodAnalysisProps {
  sleepData: any;
  stressData: any;
}

export const MoodAnalysis = ({ sleepData, stressData }: MoodAnalysisProps) => {
  const { toast } = useToast();
  const [isAnalyzing, setIsAnalyzing] = useState(false);

  // Fetch recent mood and energy data
  const { data: moodData } = useQuery({
    queryKey: ['mood-logs'],
    queryFn: async () => {
      const { data, error } = await supabase
        .from('mood_logs')
        .select('*')
        .order('created_at', { ascending: false })
        .limit(7);

      if (error) throw error;
      return data;
    }
  });

  const { data: energyData } = useQuery({
    queryKey: ['energy-logs'],
    queryFn: async () => {
      const { data, error } = await supabase
        .from('energy_focus_logs')
        .select('*')
        .eq('activity_type', 'energy')
        .order('created_at', { ascending: false })
        .limit(7);

      if (error) throw error;
      return data;
    }
  });

  const analyzeMoodPatterns = async () => {
    try {
      setIsAnalyzing(true);
      
      const { data: analysis, error } = await supabase.functions.invoke('mood-analysis', {
        body: {
          moodData,
          sleepData,
          energyData,
          stressData
        }
      });

      if (error) throw error;

      // Store analysis results
      const { error: updateError } = await supabase
        .from('mood_logs')
        .update({
          ai_analysis: analysis.analysis,
          ai_recommendations: analysis.recommendations,
          updated_at: new Date().toISOString()
        })
        .eq('id', moodData[0].id);

      if (updateError) throw updateError;

      toast({
        title: "Analysis Complete",
        description: "Your mood patterns have been analyzed successfully.",
      });
    } catch (error) {
      console.error('Error analyzing mood patterns:', error);
      toast({
        title: "Error",
        description: "Failed to analyze mood patterns. Please try again.",
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
          Advanced Mood Analysis
        </CardTitle>
      </CardHeader>
      <CardContent>
        <div className="space-y-4">
          {/* Current Mood State */}
          <div className="grid grid-cols-2 gap-4">
            <div className="text-center">
              <p className="text-sm text-muted-foreground">Current Mood</p>
              <div className="flex items-center justify-center gap-2">
                <Heart className="h-5 w-5 text-rose-500" />
                <p className="text-2xl font-bold">
                  {moodData?.[0]?.mood_score || '-'}/10
                </p>
              </div>
            </div>
            <div className="text-center">
              <p className="text-sm text-muted-foreground">Energy Level</p>
              <div className="flex items-center justify-center gap-2">
                <Battery className="h-5 w-5 text-yellow-500" />
                <p className="text-2xl font-bold">
                  {moodData?.[0]?.energy_level || '-'}/10
                </p>
              </div>
            </div>
          </div>

          {/* Correlation Indicators */}
          <div className="space-y-2">
            <p className="text-sm font-medium">Sleep Impact</p>
            <Progress 
              value={
                sleepData?.[0]?.energy_rating 
                ? (sleepData[0].energy_rating * 10) 
                : 0
              } 
            />
          </div>

          <div className="space-y-2">
            <p className="text-sm font-medium">Stress Level</p>
            <Progress 
              value={
                stressData?.stressLevel 
                ? (100 - stressData.stressLevel) 
                : 0
              } 
            />
          </div>

          {/* Analysis Button */}
          <Button
            onClick={analyzeMoodPatterns}
            disabled={isAnalyzing}
            className="w-full"
          >
            {isAnalyzing ? (
              <>
                <Brain className="mr-2 h-4 w-4 animate-pulse" />
                Analyzing Patterns...
              </>
            ) : (
              <>
                <Brain className="mr-2 h-4 w-4" />
                Analyze Mood Patterns
              </>
            )}
          </Button>

          {/* Analysis Results */}
          {moodData?.[0]?.ai_analysis && (
            <div className="mt-4 space-y-2">
              <h4 className="font-medium">AI Analysis & Recommendations</h4>
              <p className="text-sm text-muted-foreground whitespace-pre-wrap">
                {moodData[0].ai_analysis}
              </p>
            </div>
          )}
        </div>
      </CardContent>
    </Card>
  );
};