import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Cloud, Wind, Droplets, Thermometer, Brain } from "lucide-react";
import { useQuery } from "@tanstack/react-query";
import { supabase } from "@/integrations/supabase/supabase-client";
import { useAuth } from "@/components/AuthProvider";
import { AIAssistant } from "@/components/AIAssistant";

export const WeatherHealthInsights = () => {
  const { session } = useAuth();

  const { data: healthConditions } = useQuery({
    queryKey: ['health-conditions'],
    queryFn: async () => {
      const { data, error } = await supabase
        .from('user_health_conditions')
        .select('*')
        .eq('user_id', session?.user?.id)
        .maybeSingle();

      if (error) throw error;
      return data;
    },
    enabled: !!session?.user?.id,
  });

  const { data: moodLogs } = useQuery({
    queryKey: ['recent-mood-logs'],
    queryFn: async () => {
      const { data, error } = await supabase
        .from('mood_logs')
        .select('*')
        .eq('user_id', session?.user?.id)
        .order('created_at', { ascending: false })
        .limit(7);

      if (error) throw error;
      return data;
    },
    enabled: !!session?.user?.id,
  });

  if (!healthConditions?.weather_sensitive) return null;

  const getWeatherIcon = (trigger: string) => {
    switch (trigger) {
      case 'pressure':
        return <Cloud className="h-5 w-5 text-blue-500" />;
      case 'wind':
        return <Wind className="h-5 w-5 text-emerald-500" />;
      case 'humidity':
        return <Droplets className="h-5 w-5 text-cyan-500" />;
      case 'temperature':
        return <Thermometer className="h-5 w-5 text-orange-500" />;
      default:
        return null;
    }
  };

  return (
    <Card>
      <CardHeader>
        <CardTitle className="flex items-center gap-2">
          <Brain className="h-5 w-5 text-primary" />
          Weather Health Insights
        </CardTitle>
      </CardHeader>
      <CardContent>
        <div className="space-y-4">
          <div className="grid grid-cols-2 gap-4">
            {Object.entries(healthConditions.weather_triggers).map(([trigger, isActive]) => (
              isActive && (
                <div key={trigger} className="flex items-center gap-2 p-2 rounded-lg bg-muted/50">
                  {getWeatherIcon(trigger)}
                  <span className="text-sm font-medium capitalize">{trigger}</span>
                </div>
              )
            ))}
          </div>

          <AIAssistant
            type="weather_health_analysis"
            data={{
              weatherTriggers: healthConditions.weather_triggers,
              moodLogs,
              conditions: healthConditions.conditions
            }}
          />
        </div>
      </CardContent>
    </Card>
  );
};