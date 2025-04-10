import { useQuery } from "@tanstack/react-query";
import { supabase } from "@/integrations/supabase/supabase-client";
import { useAuth } from "@/components/AuthProvider";
import { Card } from "@/components/ui/card";
import {
  BarChart,
  Bar,
  XAxis,
  YAxis,
  CartesianGrid,
  Tooltip,
  ResponsiveContainer
} from "recharts";

export function SupplementStats() {
  const { session } = useAuth();

  const { data: supplementStats } = useQuery({
    queryKey: ['supplementStats', session?.user?.id],
    queryFn: async () => {
      const { data: logs, error } = await supabase
        .from('supplement_logs')
        .select('*')
        .eq('user_id', session?.user?.id);
      
      if (error) throw error;

      // Calculate statistics
      const stats = logs?.reduce((acc: any, log) => {
        // Track frequency
        acc.frequency[log.supplement_name] = (acc.frequency[log.supplement_name] || 0) + 1;
        
        // Track effectiveness
        if (log.effectiveness_rating) {
          if (!acc.effectiveness[log.supplement_name]) {
            acc.effectiveness[log.supplement_name] = {
              total: 0,
              count: 0
            };
          }
          acc.effectiveness[log.supplement_name].total += log.effectiveness_rating;
          acc.effectiveness[log.supplement_name].count += 1;
        }

        // Track cost
        if (log.cost) {
          acc.totalCost += log.cost;
        }

        return acc;
      }, { frequency: {}, effectiveness: {}, totalCost: 0 });

      // Format data for charts
      const frequencyData = Object.entries(stats?.frequency || {}).map(([name, count]) => ({
        name,
        count
      }));

      const effectivenessData = Object.entries(stats?.effectiveness || {}).map(([name, data]: [string, any]) => ({
        name,
        rating: data.total / data.count
      }));

      return {
        frequency: frequencyData,
        effectiveness: effectivenessData,
        totalCost: stats?.totalCost || 0
      };
    },
    enabled: !!session?.user?.id,
  });

  if (!supplementStats) return null;

  return (
    <div className="space-y-6">
      <Card className="p-6">
        <h3 className="text-lg font-semibold mb-4">Supplement Usage Frequency</h3>
        <div className="h-[300px]">
          <ResponsiveContainer width="100%" height="100%">
            <BarChart data={supplementStats.frequency}>
              <CartesianGrid strokeDasharray="3 3" />
              <XAxis dataKey="name" />
              <YAxis />
              <Tooltip />
              <Bar dataKey="count" fill="#8884d8" />
            </BarChart>
          </ResponsiveContainer>
        </div>
      </Card>

      <Card className="p-6">
        <h3 className="text-lg font-semibold mb-4">Average Effectiveness Ratings</h3>
        <div className="h-[300px]">
          <ResponsiveContainer width="100%" height="100%">
            <BarChart data={supplementStats.effectiveness}>
              <CartesianGrid strokeDasharray="3 3" />
              <XAxis dataKey="name" />
              <YAxis domain={[0, 10]} />
              <Tooltip />
              <Bar dataKey="rating" fill="#82ca9d" />
            </BarChart>
          </ResponsiveContainer>
        </div>
      </Card>

      <Card className="p-4">
        <h3 className="text-lg font-semibold">Total Cost</h3>
        <p className="text-2xl font-bold">${supplementStats.totalCost.toFixed(2)}</p>
      </Card>
    </div>
  );
}