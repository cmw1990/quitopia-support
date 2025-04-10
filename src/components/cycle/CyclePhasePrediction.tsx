
import { useQuery } from "@tanstack/react-query";
import { supabase } from "@/integrations/supabase/supabase-client";
import { useAuth } from "@/components/AuthProvider";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { CalendarClock, Sun, Moon, Heart, Brain } from "lucide-react";
import { format } from "date-fns";
import { CycleImpactForm } from "./CycleImpactForm";
import { CycleRecommendations } from "./CycleRecommendations";
import { CycleLifestyleRecommendations } from "./CycleLifestyleRecommendations";

export const CyclePhasePrediction = () => {
  const { session } = useAuth();

  const { data: predictions } = useQuery({
    queryKey: ['cycle_phase_predictions', session?.user?.id],
    queryFn: async () => {
      if (!session?.user?.id) return null;
      
      const { data, error } = await supabase
        .from('cycle_phase_predictions')
        .select('*')
        .eq('user_id', session.user.id)
        .gte('predicted_end_date', new Date().toISOString().split('T')[0])
        .order('predicted_start_date', { ascending: true })
        .limit(1)
        .maybeSingle();
      
      if (error) throw error;
      return data;
    },
    enabled: !!session?.user?.id
  });

  if (!predictions) return null;

  const getPhaseIcon = () => {
    switch (predictions.phase_type) {
      case 'menstrual':
        return <Moon className="h-5 w-5 text-red-500" />;
      case 'follicular':
        return <Sun className="h-5 w-5 text-yellow-500" />;
      case 'ovulatory':
        return <Heart className="h-5 w-5 text-pink-500" />;
      case 'luteal':
        return <Brain className="h-5 w-5 text-purple-500" />;
      default:
        return <CalendarClock className="h-5 w-5 text-primary" />;
    }
  };

  const getPhaseDescription = () => {
    switch (predictions.phase_type) {
      case 'menstrual':
        return "Energy levels may be lower. Focus on gentle activities and self-care.";
      case 'follicular':
        return "Rising energy levels. Great time for starting new projects and learning.";
      case 'ovulatory':
        return "Peak energy and focus. Ideal for challenging tasks and social activities.";
      case 'luteal':
        return "Gradually decreasing energy. Good for completing existing projects and planning.";
      default:
        return "";
    }
  };

  return (
    <div className="space-y-6">
      <Card>
        <CardHeader>
          <CardTitle className="flex items-center gap-2">
            {getPhaseIcon()}
            Cycle Phase Insights
          </CardTitle>
        </CardHeader>
        <CardContent>
          <div className="space-y-4">
            <div className="flex items-center justify-between">
              <span className="font-medium">Current Phase:</span>
              <span className="capitalize">{predictions.phase_type}</span>
            </div>
            <div className="flex items-center justify-between">
              <span className="font-medium">Start Date:</span>
              <span>{format(new Date(predictions.predicted_start_date), 'MMM d, yyyy')}</span>
            </div>
            <div className="flex items-center justify-between">
              <span className="font-medium">End Date:</span>
              <span>{format(new Date(predictions.predicted_end_date), 'MMM d, yyyy')}</span>
            </div>
            {predictions.confidence_score && (
              <div className="flex items-center justify-between">
                <span className="font-medium">Prediction Confidence:</span>
                <span>{Math.round(predictions.confidence_score * 100)}%</span>
              </div>
            )}
            <div className="mt-4 p-4 bg-muted rounded-lg">
              <p className="text-sm text-muted-foreground">{getPhaseDescription()}</p>
            </div>
          </div>
        </CardContent>
      </Card>

      <CycleLifestyleRecommendations phaseType={predictions.phase_type} />
      
      <CycleImpactForm />
      
      <CycleRecommendations phaseType={predictions.phase_type} />
    </div>
  );
};
