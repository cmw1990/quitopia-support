
import { useQuery } from "@tanstack/react-query";
import { useAuth } from "@/components/AuthProvider";
import { supabase } from "@/integrations/supabase/supabase-client";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Moon, TrendingUp } from "lucide-react";
import type { CycleSleepCorrelation as CycleSleepCorrelationType } from "@/types/cycle";
import {
  LineChart,
  Line,
  XAxis,
  YAxis,
  CartesianGrid,
  Tooltip,
  Legend,
  ResponsiveContainer
} from 'recharts';
import { format } from "date-fns";

export const CycleSleepCorrelation = () => {
  const { session } = useAuth();

  const { data: sleepCorrelations } = useQuery({
    queryKey: ['cycle_sleep_correlations'],
    queryFn: async () => {
      const { data, error } = await supabase
        .from('cycle_sleep_correlations')
        .select('*')
        .order('date', { ascending: true })
        .limit(30);

      if (error) throw error;
      return data as CycleSleepCorrelationType[];
    },
    enabled: !!session?.user?.id,
  });

  const formatData = (data: CycleSleepCorrelationType[]) => {
    return data.map(d => ({
      ...d,
      dateFormatted: format(new Date(d.date), 'MMM d')
    }));
  };

  return (
    <Card>
      <CardHeader>
        <CardTitle className="flex items-center gap-2">
          <Moon className="h-5 w-5 text-purple-500" />
          Sleep & Cycle Correlation
        </CardTitle>
      </CardHeader>
      <CardContent>
        {sleepCorrelations?.length ? (
          <>
            <div className="h-[300px] w-full">
              <ResponsiveContainer>
                <LineChart data={formatData(sleepCorrelations)}>
                  <CartesianGrid strokeDasharray="3 3" />
                  <XAxis 
                    dataKey="dateFormatted" 
                    tick={{ fontSize: 12 }}
                  />
                  <YAxis 
                    yAxisId="left"
                    domain={[0, 10]}
                    tick={{ fontSize: 12 }}
                    label={{ 
                      value: 'Sleep Quality', 
                      angle: -90, 
                      position: 'insideLeft',
                      style: { fontSize: '12px' }
                    }}
                  />
                  <YAxis 
                    yAxisId="right"
                    orientation="right"
                    domain={[0, 100]}
                    tick={{ fontSize: 12 }}
                    label={{ 
                      value: 'HRV', 
                      angle: 90, 
                      position: 'insideRight',
                      style: { fontSize: '12px' }
                    }}
                  />
                  <Tooltip
                    labelFormatter={(value) => `Date: ${value}`}
                    formatter={(value, name) => {
                      if (name === "Sleep Quality") return [`${value}/10`, name];
                      if (name === "HRV") return [`${value} ms`, name];
                      return [value, name];
                    }}
                  />
                  <Legend />
                  <Line 
                    yAxisId="left"
                    type="monotone" 
                    dataKey="sleep_quality" 
                    stroke="#8884d8" 
                    name="Sleep Quality"
                    strokeWidth={2}
                    dot={{ r: 4 }}
                  />
                  <Line 
                    yAxisId="right"
                    type="monotone" 
                    dataKey="heart_rate_variability" 
                    stroke="#82ca9d" 
                    name="HRV"
                    strokeWidth={2}
                    dot={{ r: 4 }}
                  />
                </LineChart>
              </ResponsiveContainer>
            </div>

            <div className="mt-4 grid grid-cols-2 gap-4">
              <div className="p-4 bg-muted rounded-lg">
                <h4 className="font-medium mb-2">Current Phase</h4>
                <p className="text-lg capitalize">{sleepCorrelations[sleepCorrelations.length - 1].phase_type}</p>
              </div>
              <div className="p-4 bg-muted rounded-lg">
                <h4 className="font-medium mb-2">Sleep Duration</h4>
                <p className="text-lg">
                  {sleepCorrelations[sleepCorrelations.length - 1].sleep_duration} hours
                </p>
              </div>
            </div>
          </>
        ) : (
          <div className="text-center text-muted-foreground py-8">
            No sleep correlation data available
          </div>
        )}
      </CardContent>
    </Card>
  );
};
