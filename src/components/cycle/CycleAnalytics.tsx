
import { useQuery } from "@tanstack/react-query";
import { supabase } from "@/integrations/supabase/supabase-client";
import { useAuth } from "@/components/AuthProvider";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { LineChart, Line, XAxis, YAxis, CartesianGrid, Tooltip, ResponsiveContainer } from "recharts";
import { Brain, Battery, Moon, CloudMoon } from "lucide-react";

export const CycleAnalytics = () => {
  const { session } = useAuth();

  const { data: cycleData } = useQuery({
    queryKey: ['cycle_tracking', session?.user?.id],
    queryFn: async () => {
      if (!session?.user?.id) return null;
      
      const { data, error } = await supabase
        .from('cycle_tracking')
        .select('*')
        .eq('user_id', session.user.id)
        .order('date', { ascending: true })
        .limit(30);
      
      if (error) throw error;
      return data;
    },
    enabled: !!session?.user?.id
  });

  if (!cycleData?.length) return null;

  return (
    <Card>
      <CardHeader>
        <CardTitle>Cycle Analytics</CardTitle>
      </CardHeader>
      <CardContent>
        <div className="grid grid-cols-2 md:grid-cols-4 gap-4 mb-6">
          <div className="p-4 bg-muted rounded-lg">
            <div className="flex items-center gap-2 mb-2">
              <Battery className="h-4 w-4 text-yellow-500" />
              <span className="text-sm font-medium">Energy</span>
            </div>
            <span className="text-2xl font-bold">
              {cycleData[cycleData.length - 1]?.energy_level || '-'}/10
            </span>
          </div>
          <div className="p-4 bg-muted rounded-lg">
            <div className="flex items-center gap-2 mb-2">
              <Brain className="h-4 w-4 text-blue-500" />
              <span className="text-sm font-medium">Stress</span>
            </div>
            <span className="text-2xl font-bold">
              {cycleData[cycleData.length - 1]?.stress_level || '-'}/10
            </span>
          </div>
          <div className="p-4 bg-muted rounded-lg">
            <div className="flex items-center gap-2 mb-2">
              <CloudMoon className="h-4 w-4 text-purple-500" />
              <span className="text-sm font-medium">Sleep</span>
            </div>
            <span className="text-2xl font-bold">
              {cycleData[cycleData.length - 1]?.sleep_quality || '-'}/10
            </span>
          </div>
          <div className="p-4 bg-muted rounded-lg">
            <div className="flex items-center gap-2 mb-2">
              <Moon className="h-4 w-4 text-pink-500" />
              <span className="text-sm font-medium">Phase</span>
            </div>
            <span className="text-2xl font-bold capitalize">
              {cycleData[cycleData.length - 1]?.cycle_phase || '-'}
            </span>
          </div>
        </div>

        <div className="h-[300px] mt-6">
          <ResponsiveContainer width="100%" height="100%">
            <LineChart data={cycleData}>
              <CartesianGrid strokeDasharray="3 3" />
              <XAxis 
                dataKey="date" 
                tickFormatter={(date) => new Date(date).toLocaleDateString()}
              />
              <YAxis domain={[0, 10]} />
              <Tooltip
                labelFormatter={(date) => new Date(date).toLocaleDateString()}
              />
              <Line 
                type="monotone" 
                dataKey="energy_level" 
                stroke="#EAB308" 
                name="Energy"
                strokeWidth={2}
              />
              <Line 
                type="monotone" 
                dataKey="stress_level" 
                stroke="#3B82F6" 
                name="Stress"
                strokeWidth={2}
              />
              <Line 
                type="monotone" 
                dataKey="sleep_quality" 
                stroke="#9333EA" 
                name="Sleep"
                strokeWidth={2}
              />
            </LineChart>
          </ResponsiveContainer>
        </div>
      </CardContent>
    </Card>
  );
};
