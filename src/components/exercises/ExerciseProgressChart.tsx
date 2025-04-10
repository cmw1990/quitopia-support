import { Card } from '@/components/ui/card';
import { LineChart, Line, XAxis, YAxis, CartesianGrid, Tooltip, ResponsiveContainer } from 'recharts';
import { useQuery } from '@tanstack/react-query';
import { supabase } from '@/integrations/supabase/supabase-client';
import { useAuth } from '@/components/AuthProvider';

export const ExerciseProgressChart = () => {
  const { session } = useAuth();

  const { data: progressData } = useQuery({
    queryKey: ['exercise-progress'],
    queryFn: async () => {
      if (!session?.user) return [];
      
      const { data, error } = await supabase
        .from('reproductive_health_progress')
        .select('*')
        .eq('user_id', session.user.id)
        .order('completed_at', { ascending: true });

      if (error) throw error;
      
      // Process data for chart
      return data.map(entry => ({
        date: new Date(entry.completed_at).toLocaleDateString(),
        duration: entry.total_duration_seconds / 60, // Convert to minutes
        effort: entry.perceived_effort
      }));
    },
    enabled: !!session?.user
  });

  return (
    <Card className="p-4">
      <h3 className="font-semibold mb-4">Exercise Progress</h3>
      <div className="h-[300px]">
        <ResponsiveContainer width="100%" height="100%">
          <LineChart data={progressData}>
            <CartesianGrid strokeDasharray="3 3" />
            <XAxis dataKey="date" />
            <YAxis yAxisId="left" />
            <YAxis yAxisId="right" orientation="right" />
            <Tooltip />
            <Line
              yAxisId="left"
              type="monotone"
              dataKey="duration"
              stroke="#8884d8"
              name="Duration (min)"
            />
            <Line
              yAxisId="right"
              type="monotone"
              dataKey="effort"
              stroke="#82ca9d"
              name="Perceived Effort"
            />
          </LineChart>
        </ResponsiveContainer>
      </div>
    </Card>
  );
};