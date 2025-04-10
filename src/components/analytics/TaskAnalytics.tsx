import React, { useEffect, useState } from 'react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { BarChart, Bar, XAxis, YAxis, CartesianGrid, Tooltip, ResponsiveContainer } from 'recharts';
import { supabaseGet } from '@/lib/supabaseApiService';
import { useAuth } from '@/hooks/useAuth';
import { format, subDays, startOfDay, endOfDay } from 'date-fns';

interface Task {
  id: string;
  user_id: string;
  title: string;
  status: 'todo' | 'in_progress' | 'completed';
  priority: 'low' | 'medium' | 'high';
  created_at: string;
  completed_at: string | null;
}

interface TaskStats {
  date: string;
  completed: number;
  created: number;
  completionRate: number;
}

export const TaskAnalytics: React.FC = () => {
  const auth = useAuth();
  const [tasks, setTasks] = useState<Task[]>([]);
  const [timeRange, setTimeRange] = useState<'7d' | '30d' | '90d'>('7d');
  const [loading, setLoading] = useState(true);

  if (!auth || !auth.user) {
    return (
        <Card>
          <CardHeader>
            <CardTitle>Task Analytics</CardTitle>
          </CardHeader>
          <CardContent>
            <p className="text-muted-foreground">Loading user data or please log in...</p>
          </CardContent>
        </Card>
    );
  }
  
  const { user } = auth;

  useEffect(() => {
    const fetchTasks = async () => {
      setLoading(true);
      const daysToSubtract = timeRange === '7d' ? 7 : timeRange === '30d' ? 30 : 90;
      const startDate = startOfDay(subDays(new Date(), daysToSubtract));

      const queryParams = new URLSearchParams({
        user_id: `eq.${user.id}`,
        created_at: `gte.${startDate.toISOString()}`,
        order: 'created_at.asc',
        select: '*'
      }).toString();

      try {
        const { data, error } = await supabaseGet<Task>('tasks', queryParams);

        if (error) {
            if (error.code === 'PGRST116') {
                 console.error('Supabase Error: Could not find table tasks. Ensure it exists and RLS allows access.');
            } else {
                 console.error('Supabase Error:', error.message);
            }
            throw new Error(error.message || 'Failed to fetch tasks');
        }
        setTasks(data || []);
      } catch (error: any) {
        console.error('Error fetching tasks:', error.message);
        setTasks([]);
      } finally {
        setLoading(false);
      }
    };

    fetchTasks();
  }, [user, timeRange]);

  const calculateTaskStats = (): TaskStats[] => {
    const stats: { [date: string]: TaskStats } = {};
    const daysToShow = timeRange === '7d' ? 7 : timeRange === '30d' ? 30 : 90;

    for (let i = 0; i < daysToShow; i++) {
      const date = format(subDays(new Date(), i), 'yyyy-MM-dd');
      stats[date] = {
        date,
        completed: 0,
        created: 0,
        completionRate: 0,
      };
    }

    tasks.forEach((task) => {
      const createdDate = format(new Date(task.created_at), 'yyyy-MM-dd');
      if (stats[createdDate]) {
        stats[createdDate].created += 1;
      }

      if (task.completed_at) {
        const completedDate = format(new Date(task.completed_at), 'yyyy-MM-dd');
        if (stats[completedDate]) {
          stats[completedDate].completed += 1;
        }
      }
    });

    Object.values(stats).forEach((stat) => {
      stat.completionRate = stat.created > 0 ? (stat.completed / stat.created) * 100 : 0;
    });

    return Object.values(stats).reverse();
  };

  const taskStats = calculateTaskStats();
  const totalTasks = tasks.length;
  const completedTasks = tasks.filter(task => task.status === 'completed').length;
  const completionRate = totalTasks > 0 ? (completedTasks / totalTasks) * 100 : 0;

  return (
    <Card>
      <CardHeader>
        <CardTitle>Task Analytics</CardTitle>
      </CardHeader>
      <CardContent>
        <Tabs defaultValue="7d" className="w-full">
          <TabsList>
            <TabsTrigger value="7d" onClick={() => setTimeRange('7d')}>Last 7 Days</TabsTrigger>
            <TabsTrigger value="30d" onClick={() => setTimeRange('30d')}>Last 30 Days</TabsTrigger>
            <TabsTrigger value="90d" onClick={() => setTimeRange('90d')}>Last 90 Days</TabsTrigger>
          </TabsList>

          <div className="h-[300px] mt-4">
            {loading ? (
              <div className="h-full flex items-center justify-center">
                <p className="text-muted-foreground">Loading analytics...</p>
              </div>
            ) : (
              <ResponsiveContainer width="100%" height="100%">
                <BarChart data={taskStats}>
                  <CartesianGrid strokeDasharray="3 3" />
                  <XAxis 
                    dataKey="date" 
                    tickFormatter={(date) => format(new Date(date), 'MMM d')}
                  />
                  <YAxis />
                  <Tooltip 
                    labelFormatter={(date) => format(new Date(date), 'MMM d, yyyy')}
                    formatter={(value: number, name: string) => {
                      if (name === 'Completion Rate') return [`${Math.round(value)}%`, name];
                      return [value, name];
                    }}
                  />
                  <Bar dataKey="created" name="Tasks Created" fill="#2563eb" />
                  <Bar dataKey="completed" name="Tasks Completed" fill="#16a34a" />
                </BarChart>
              </ResponsiveContainer>
            )}
          </div>

          <div className="grid grid-cols-1 md:grid-cols-3 gap-4 mt-4">
            <Card>
              <CardContent className="pt-6">
                <div className="text-2xl font-bold">
                  {loading ? '-' : totalTasks}
                </div>
                <p className="text-sm text-muted-foreground">Total Tasks</p>
              </CardContent>
            </Card>
            <Card>
              <CardContent className="pt-6">
                <div className="text-2xl font-bold">
                  {loading ? '-' : completedTasks}
                </div>
                <p className="text-sm text-muted-foreground">Completed Tasks</p>
              </CardContent>
            </Card>
            <Card>
              <CardContent className="pt-6">
                <div className="text-2xl font-bold">
                  {loading ? '-' : `${Math.round(completionRate)}%`}
                </div>
                <p className="text-sm text-muted-foreground">Completion Rate</p>
              </CardContent>
            </Card>
          </div>
        </Tabs>
      </CardContent>
    </Card>
  );
}; 