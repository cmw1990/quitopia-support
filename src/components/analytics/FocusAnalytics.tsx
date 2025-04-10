import React, { useEffect, useState } from 'react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { LineChart, Line, XAxis, YAxis, CartesianGrid, Tooltip, ResponsiveContainer } from 'recharts';
import { supabaseGet } from '@/lib/supabaseApiService';
import { useAuth } from '@/hooks/useAuth';
import { format, subDays, startOfDay } from 'date-fns';

interface FocusSession {
  id: string;
  user_id: string;
  start_time: string;
  end_time: string;
  duration: number;
  type: string;
  completed: boolean;
}

interface DailyStats {
  date: string;
  totalMinutes: number;
  sessionsCount: number;
  completionRate: number;
}

export const FocusAnalytics: React.FC = () => {
  const auth = useAuth();
  const [sessions, setSessions] = useState<FocusSession[]>([]);
  const [timeRange, setTimeRange] = useState<'7d' | '30d' | '90d'>('7d');
  const [loading, setLoading] = useState(true);

  if (!auth || !auth.user) {
    return (
        <Card>
          <CardHeader>
            <CardTitle>Focus Session Analytics</CardTitle>
          </CardHeader>
          <CardContent>
            <p className="text-muted-foreground">Loading user data or please log in...</p>
          </CardContent>
        </Card>
    );
  }
  
  const { user } = auth;

  useEffect(() => {
    const fetchSessions = async () => {
      setLoading(true);
      const daysToSubtract = timeRange === '7d' ? 7 : timeRange === '30d' ? 30 : 90;
      const startDate = startOfDay(subDays(new Date(), daysToSubtract));
      
      const queryParams = new URLSearchParams({
        user_id: `eq.${user.id}`,
        start_time: `gte.${startDate.toISOString()}`,
        order: 'start_time.asc',
        select: '*'
      }).toString();

      try {
        const { data, error } = await supabaseGet<FocusSession>('focus_sessions8', queryParams);

        if (error) {
            if (error.code === 'PGRST116') {
                 console.error('Supabase Error: Could not find table focus_sessions8. Ensure it exists and RLS allows access.');
            } else {
                console.error('Supabase Error:', error.message);
            }
            throw new Error(error.message || 'Failed to fetch focus sessions');
        }
        setSessions(data || []);
      } catch (error: any) {
        console.error('Error fetching sessions:', error.message);
        setSessions([]);
      } finally {
        setLoading(false);
      }
    };

    fetchSessions();
  }, [user, timeRange]);

  const calculateDailyStats = (): DailyStats[] => {
    const stats: { [date: string]: DailyStats } = {};
    const daysToShow = timeRange === '7d' ? 7 : timeRange === '30d' ? 30 : 90;

    for (let i = 0; i < daysToShow; i++) {
      const date = format(subDays(new Date(), i), 'yyyy-MM-dd');
      stats[date] = {
        date,
        totalMinutes: 0,
        sessionsCount: 0,
        completionRate: 0,
      };
    }

    sessions.forEach((session) => {
      const date = format(new Date(session.start_time), 'yyyy-MM-dd');
      if (stats[date]) {
        stats[date].totalMinutes += session.duration;
        stats[date].sessionsCount += 1;
        if (session.completed) {
          stats[date].completionRate = ((stats[date].completionRate * (stats[date].sessionsCount - 1) + 100) / stats[date].sessionsCount);
        } else {
          stats[date].completionRate = ((stats[date].completionRate * (stats[date].sessionsCount - 1)) / stats[date].sessionsCount);
        }
      }
    });

    return Object.values(stats).reverse();
  };

  const dailyStats = calculateDailyStats();

  return (
    <Card>
      <CardHeader>
        <CardTitle>Focus Session Analytics</CardTitle>
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
                <LineChart data={dailyStats}>
                  <CartesianGrid strokeDasharray="3 3" />
                  <XAxis 
                    dataKey="date" 
                    tickFormatter={(date) => format(new Date(date), 'MMM d')}
                  />
                  <YAxis />
                  <Tooltip 
                    labelFormatter={(date) => format(new Date(date), 'MMM d, yyyy')}
                    formatter={(value: number, name: string) => {
                      if (name === 'Total Focus Time') return [`${Math.round(value)} minutes`, name];
                      if (name === 'Completion Rate') return [`${Math.round(value)}%`, name];
                      return [value, name];
                    }}
                  />
                  <Line 
                    type="monotone" 
                    dataKey="totalMinutes" 
                    name="Total Focus Time"
                    stroke="#2563eb" 
                    strokeWidth={2}
                  />
                  <Line 
                    type="monotone" 
                    dataKey="completionRate" 
                    name="Completion Rate"
                    stroke="#16a34a" 
                    strokeWidth={2}
                  />
                </LineChart>
              </ResponsiveContainer>
            )}
          </div>

          <div className="grid grid-cols-1 md:grid-cols-3 gap-4 mt-4">
            <Card>
              <CardContent className="pt-6">
                <div className="text-2xl font-bold">
                  {loading ? '-' : Math.round(dailyStats.reduce((acc, stat) => acc + stat.totalMinutes, 0) / dailyStats.length)}
                </div>
                <p className="text-sm text-muted-foreground">Avg. Daily Focus Minutes</p>
              </CardContent>
            </Card>
            <Card>
              <CardContent className="pt-6">
                <div className="text-2xl font-bold">
                  {loading ? '-' : Math.round(dailyStats.reduce((acc, stat) => acc + stat.sessionsCount, 0))}
                </div>
                <p className="text-sm text-muted-foreground">Total Sessions</p>
              </CardContent>
            </Card>
            <Card>
              <CardContent className="pt-6">
                <div className="text-2xl font-bold">
                  {loading ? '-' : `${Math.round(dailyStats.reduce((acc, stat) => acc + stat.completionRate, 0) / dailyStats.length)}%`}
                </div>
                <p className="text-sm text-muted-foreground">Avg. Completion Rate</p>
              </CardContent>
            </Card>
          </div>
        </Tabs>
      </CardContent>
    </Card>
  );
}; 