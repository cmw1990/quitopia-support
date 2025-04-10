import { useQuery } from "@tanstack/react-query";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { useAuth } from "@/components/AuthProvider";
import { supabase } from "@/integrations/supabase/supabase-client";
import { Brain, Activity } from "lucide-react";
import { AIAssistant } from "@/components/AIAssistant";

export const EnergyPatternAnalysis = () => {
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

  const { data: energyLogs } = useQuery({
    queryKey: ['energy-logs'],
    queryFn: async () => {
      const { data, error } = await supabase
        .from('energy_focus_logs')
        .select('*')
        .eq('user_id', session?.user?.id)
        .order('created_at', { ascending: false })
        .limit(10);

      if (error) throw error;
      return data;
    },
    enabled: !!session?.user?.id,
  });

  if (!healthConditions) return null;

  return (
    <Card className="bg-gradient-to-r from-blue-50 to-indigo-50 dark:from-blue-900/10 dark:to-indigo-900/10">
      <CardHeader>
        <CardTitle className="flex items-center gap-2">
          <Brain className="h-5 w-5 text-primary" />
          Personalized Energy Analysis
        </CardTitle>
      </CardHeader>
      <CardContent>
        <AIAssistant
          type="energy_pattern_analysis"
          data={{
            conditions: healthConditions.conditions,
            energyLogs,
            needsEnergySupport: healthConditions.needs_energy_support,
            needsFocusSupport: healthConditions.needs_focus_support
          }}
        />
      </CardContent>
    </Card>
  );
};