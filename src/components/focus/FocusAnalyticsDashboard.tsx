import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Progress } from "@/components/ui/progress";
import { Brain, Clock, Target, Zap } from "lucide-react";
import { useQuery } from "@tanstack/react-query";
import { supabase } from "@/integrations/supabase/supabase-client";

interface EnergyLevels {
  current: number;
}

interface FocusAnalytics {
  id: string;
  total_focus_time: number;
  successful_sessions: number;
  interrupted_sessions: number;
  energy_levels: string;
}

export const FocusAnalyticsDashboard = () => {
  const { data: analytics } = useQuery({
    queryKey: ['focus-analytics'],
    queryFn: async () => {
      const { data, error } = await supabase
        .from('focus_analytics8')
        .select('*')
        .order('date', { ascending: false })
        .limit(1)
        .maybeSingle();

      if (error) throw error;
      return data as unknown as FocusAnalytics;
    }
  });

  const parseEnergyLevels = (levelsStr: string | null): EnergyLevels => {
    try {
      return JSON.parse(levelsStr || '{"current": 0}');
    } catch {
      return { current: 0 };
    }
  };

  const energyLevels = analytics ? parseEnergyLevels(analytics.energy_levels) : { current: 0 };

  return (
    <Card className="bg-gradient-to-br from-blue-50 to-green-50 dark:from-blue-900/20 dark:to-green-900/20">
      <CardHeader>
        <CardTitle className="flex items-center gap-2">
          <Brain className="h-5 w-5 text-blue-500" />
          Focus Analytics
        </CardTitle>
      </CardHeader>
      <CardContent className="space-y-6">
        <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
          <Card className="p-4">
            <div className="flex items-center gap-2 mb-2">
              <Clock className="h-4 w-4 text-blue-500" />
              <h3 className="font-medium">Focus Time</h3>
            </div>
            <p className="text-2xl font-bold">
              {analytics?.total_focus_time ? Math.floor(analytics.total_focus_time / 60) : 0}h {analytics?.total_focus_time ? analytics.total_focus_time % 60 : 0}m
            </p>
          </Card>

          <Card className="p-4">
            <div className="flex items-center gap-2 mb-2">
              <Target className="h-4 w-4 text-green-500" />
              <h3 className="font-medium">Success Rate</h3>
            </div>
            <Progress 
              value={analytics?.successful_sessions ? 
                (analytics.successful_sessions / (analytics.successful_sessions + (analytics.interrupted_sessions || 0))) * 100 
                : 0
              } 
              className="mt-2" 
            />
          </Card>

          <Card className="p-4">
            <div className="flex items-center gap-2 mb-2">
              <Zap className="h-4 w-4 text-yellow-500" />
              <h3 className="font-medium">Energy Level</h3>
            </div>
            <div className="space-y-2">
              <Progress value={energyLevels.current} className="mt-2" />
              <p className="text-sm text-muted-foreground">Current Energy: {energyLevels.current}%</p>
            </div>
          </Card>
        </div>
      </CardContent>
    </Card>
  );
};