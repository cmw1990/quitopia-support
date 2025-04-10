import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { FoodLogForm } from "@/components/food/FoodLogForm";
import { FoodHistory } from "@/components/food/FoodHistory";
import { AIAssistant } from "@/components/AIAssistant";
import { useQuery } from "@tanstack/react-query";
import { supabase } from "@/integrations/supabase/supabase-client";

const Food = () => {
  const { data: recentData } = useQuery({
    queryKey: ['recent-health-data'],
    queryFn: async () => {
      const [foodLogs, sleepLogs, energyLogs, healthData] = await Promise.all([
        supabase
          .from('food_logs')
          .select('*')
          .order('created_at', { ascending: false })
          .limit(5),
        supabase
          .from('energy_focus_logs')
          .select('*')
          .eq('activity_type', 'sleep')
          .order('created_at', { ascending: false })
          .limit(1),
        supabase
          .from('energy_focus_logs')
          .select('*')
          .eq('activity_type', 'energy')
          .order('created_at', { ascending: false })
          .limit(1),
        supabase
          .from('health_data')
          .select('*')
          .order('created_at', { ascending: false })
          .limit(1),
      ]);

      return {
        foodLogs: foodLogs.data,
        sleepLogs: sleepLogs.data,
        energyLogs: energyLogs.data,
        healthData: healthData.data,
      };
    }
  });

  return (
    <div className="container mx-auto p-4 space-y-6">
      <h1 className="text-3xl font-bold">Food & Nutrition Tracking</h1>

      <div className="grid gap-6 md:grid-cols-2">
        <Card>
          <CardHeader>
            <CardTitle>Log Food</CardTitle>
          </CardHeader>
          <CardContent>
            <FoodLogForm />
          </CardContent>
        </Card>

        <Card>
          <CardHeader>
            <CardTitle>Recent History</CardTitle>
          </CardHeader>
          <CardContent>
            <FoodHistory />
          </CardContent>
        </Card>

        <Card className="md:col-span-2">
          <CardHeader>
            <CardTitle>AI Nutrition & Energy Insights</CardTitle>
          </CardHeader>
          <CardContent>
            <AIAssistant
              type="lifestyle_correlation"
              data={{
                recentFood: recentData?.foodLogs,
                recentSleep: recentData?.sleepLogs,
                recentEnergy: recentData?.energyLogs,
                recentHealth: recentData?.healthData,
              }}
            />
          </CardContent>
        </Card>
      </div>
    </div>
  );
};

export default Food;