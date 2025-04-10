import { CyclePhasePrediction } from "@/components/cycle/CyclePhasePrediction"
import { CycleTracking } from "@/components/cycle/CycleTracking"
import { CycleLifestyleRecommendations } from "@/components/cycle/CycleLifestyleRecommendations"
import { CycleRecommendations } from "@/components/cycle/CycleRecommendations"
import { CycleWeatherImpact } from "@/components/cycle/CycleWeatherImpact"
import { CycleSleepCorrelation } from "@/components/cycle/CycleSleepCorrelation"
import { WearableDeviceIntegration } from "@/components/cycle/WearableDeviceIntegration"
import { useQuery } from "@tanstack/react-query"
import { supabase } from "@/integrations/supabase/supabase-client"

export const WebappCycle: React.FC = () => {
  // Get current phase from predictions
  const { data: currentPhase } = useQuery({
    queryKey: ['current_phase'],
    queryFn: async () => {
      const { data, error } = await supabase
        .from('cycle_phase_predictions')
        .select('*')
        .gte('predicted_end_date', new Date().toISOString().split('T')[0])
        .order('predicted_start_date', { ascending: true })
        .limit(1)
        .maybeSingle();

      if (error) throw error;
      return data?.phase_type;
    },
  });

  return (
    <div className="space-y-6 pb-8">
      <h1 className="text-3xl font-bold">Cycle Tracking</h1>
      <div className="grid gap-6">
        <CyclePhasePrediction />
        <CycleTracking />
        <div className="grid md:grid-cols-2 gap-6">
          <CycleWeatherImpact />
          <CycleSleepCorrelation />
        </div>
        <WearableDeviceIntegration />
        {currentPhase && (
          <>
            <CycleLifestyleRecommendations phaseType={currentPhase} />
            <CycleRecommendations phaseType={currentPhase} />
          </>
        )}
      </div>
    </div>
  );
};
