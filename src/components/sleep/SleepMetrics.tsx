import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Brain, Activity, Battery, Sun } from "lucide-react";
import { AIAssistant } from "@/components/AIAssistant";

interface SleepMetricsProps {
  sleepData: any;
}

export const SleepMetrics = ({ sleepData }: SleepMetricsProps) => {
  return (
    <div className="grid gap-4 md:grid-cols-2">
      <AIAssistant 
        type="sleep_cycle_optimization"
        data={{
          sleepData,
          targetWakeTime: new Date().setHours(7, 0, 0, 0)
        }}
      />

      <AIAssistant 
        type="cognitive_impact_analysis"
        data={{
          sleepData,
          recentPerformance: sleepData?.[0]?.focus_rating
        }}
      />

      <AIAssistant 
        type="lifestyle_correlation"
        data={{
          sleepData,
          recentActivities: sleepData?.map((log: any) => log.notes)
        }}
      />

      <AIAssistant 
        type="recovery_suggestions"
        data={{
          sleepData,
          sleepDebt: sleepData?.reduce((acc: number, log: any) => 
            acc + (8 - (log.duration_minutes / 60)), 0)
        }}
      />

      <AIAssistant 
        type="next_day_preparation"
        data={{
          sleepData,
          tomorrowSchedule: "typical workday"
        }}
      />

      <AIAssistant 
        type="circadian_rhythm_analysis"
        data={{
          sleepData,
          naturalLightExposure: true
        }}
      />
    </div>
  );
};