import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Brain, Heart, Moon, Sun, Battery, Activity, Utensils } from "lucide-react";
import { AIAssistant } from "@/components/AIAssistant";
import {
  LineChart,
  Line,
  XAxis,
  YAxis,
  CartesianGrid,
  Tooltip,
  ResponsiveContainer
} from "recharts";
import { useQuery } from "@tanstack/react-query";
import { supabase } from "@/integrations/supabase/supabase-client";
import { useAuth } from "@/components/AuthProvider";

export const MoodOverview = () => {
  const { session } = useAuth();

  const { data: moodLogs } = useQuery({
    queryKey: ['mood-logs'],
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

  const { data: foodLogs } = useQuery({
    queryKey: ['recent-food-logs'],
    queryFn: async () => {
      const { data, error } = await supabase
        .from('food_logs')
        .select('*')
        .eq('user_id', session?.user?.id)
        .order('created_at', { ascending: false })
        .maybeSingle();

      if (error) throw error;
      return data;
    },
    enabled: !!session?.user?.id,
  });

  const chartData = moodLogs?.map(log => ({
    date: new Date(log.created_at).toLocaleDateString(),
    mood: log.mood_score,
    energy: log.energy_level,
    stress: log.stress_level,
    focus: log.focus_level,
  })).reverse();

  return (
    <div className="space-y-4">
      <div className="grid gap-4 md:grid-cols-4">
        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">Current Mood</CardTitle>
            <Heart className="h-4 w-4 text-rose-500" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">
              {moodLogs?.[0]?.mood_score || '-'}/10
            </div>
            <p className="text-xs text-muted-foreground">
              Latest mood rating
            </p>
          </CardContent>
        </Card>

        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">Energy Level</CardTitle>
            <Battery className="h-4 w-4 text-yellow-500" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">
              {moodLogs?.[0]?.energy_level || '-'}/10
            </div>
            <p className="text-xs text-muted-foreground">
              Current energy level
            </p>
          </CardContent>
        </Card>

        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">Stress Level</CardTitle>
            <Brain className="h-4 w-4 text-blue-500" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">
              {moodLogs?.[0]?.stress_level || '-'}/10
            </div>
            <p className="text-xs text-muted-foreground">
              Current stress level
            </p>
          </CardContent>
        </Card>

        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">Focus Level</CardTitle>
            <Activity className="h-4 w-4 text-emerald-500" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">
              {moodLogs?.[0]?.focus_level || '-'}/10
            </div>
            <p className="text-xs text-muted-foreground">
              Current focus level
            </p>
          </CardContent>
        </Card>

        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">Latest Meal</CardTitle>
            <Utensils className="h-4 w-4 text-emerald-500" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">
              {foodLogs?.food_name || '-'}
            </div>
            <p className="text-xs text-muted-foreground">
              {foodLogs?.calories ? `${foodLogs.calories} calories` : 'No recent meals'}
            </p>
          </CardContent>
        </Card>
      </div>

      <Card>
        <CardHeader>
          <CardTitle className="flex items-center gap-2">
            <Activity className="h-5 w-5 text-primary" />
            Wellness Trends
          </CardTitle>
        </CardHeader>
        <CardContent>
          <div className="h-[300px]">
            {chartData && chartData.length > 0 ? (
              <ResponsiveContainer width="100%" height="100%">
                <LineChart data={chartData}>
                  <CartesianGrid strokeDasharray="3 3" />
                  <XAxis dataKey="date" />
                  <YAxis domain={[0, 10]} />
                  <Tooltip />
                  <Line 
                    type="monotone" 
                    dataKey="mood" 
                    stroke="#ec4899" 
                    name="Mood"
                    strokeWidth={2}
                  />
                  <Line 
                    type="monotone" 
                    dataKey="energy" 
                    stroke="#eab308" 
                    name="Energy"
                    strokeWidth={2}
                  />
                  <Line 
                    type="monotone" 
                    dataKey="stress" 
                    stroke="#3b82f6" 
                    name="Stress"
                    strokeWidth={2}
                  />
                  <Line 
                    type="monotone" 
                    dataKey="focus" 
                    stroke="#10b981" 
                    name="Focus"
                    strokeWidth={2}
                  />
                </LineChart>
              </ResponsiveContainer>
            ) : (
              <div className="h-full flex items-center justify-center text-muted-foreground">
                No mood data available
              </div>
            )}
          </div>
        </CardContent>
      </Card>

      <div className="grid gap-4 md:grid-cols-2">
        <AIAssistant
          type="analyze_energy"
          data={{
            moodLogs,
            foodLogs,
            currentMood: moodLogs?.[0]?.mood_score,
            currentEnergy: moodLogs?.[0]?.energy_level,
            currentStress: moodLogs?.[0]?.stress_level,
            currentFocus: moodLogs?.[0]?.focus_level,
          }}
        />

        <AIAssistant
          type="wellness_correlation"
          data={{
            moodLogs,
            foodLogs,
            recentActivities: moodLogs?.[0]?.activities,
            environmentalFactors: moodLogs?.[0]?.environmental_factors,
            copingStrategies: moodLogs?.[0]?.coping_strategies
          }}
        />
      </div>
    </div>
  );
};
