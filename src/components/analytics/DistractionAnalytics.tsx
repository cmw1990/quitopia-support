import React, { useEffect, useState } from 'react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { PieChart, Pie, Cell, Tooltip, ResponsiveContainer } from 'recharts';
import { supabaseGet } from '@/lib/supabaseApiService';
import { useAuth } from '@/hooks/useAuth';
import { format, subDays, startOfDay, endOfDay } from 'date-fns';

interface BlockedAttempt {
  id: string;
  user_id: string;
  url: string;
  timestamp: string;
  block_type: 'website' | 'keyword';
}

interface BlockStats {
  type: string;
  value: number;
}

const COLORS = ['#2563eb', '#16a34a', '#dc2626', '#eab308'];

export const DistractionAnalytics: React.FC = () => {
  const auth = useAuth();
  const [attempts, setAttempts] = useState<BlockedAttempt[]>([]);
  const [timeRange, setTimeRange] = useState<'7d' | '30d' | '90d'>('7d');
  const [loading, setLoading] = useState(true);

  if (!auth || !auth.user) {
    return (
        <Card>
          <CardHeader>
            <CardTitle>Distraction Analytics</CardTitle>
          </CardHeader>
          <CardContent>
            <p className="text-muted-foreground">Loading user data or please log in...</p>
          </CardContent>
        </Card>
    );
  }
  
  const { user } = auth;

  useEffect(() => {
    const fetchAttempts = async () => {
      setLoading(true);
      const daysToSubtract = timeRange === '7d' ? 7 : timeRange === '30d' ? 30 : 90;
      const startDate = startOfDay(subDays(new Date(), daysToSubtract));

      const queryParams = new URLSearchParams({
        user_id: `eq.${user.id}`,
        timestamp: `gte.${startDate.toISOString()}`,
        order: 'timestamp.asc',
        select: '*'
      }).toString();

      try {
        const { data, error } = await supabaseGet<BlockedAttempt>('blocked_attempts', queryParams);

        if (error) {
            if (error.code === 'PGRST116') {
                 console.error('Supabase Error: Could not find table blocked_attempts. Ensure it exists and RLS allows access.');
            } else {
                 console.error('Supabase Error:', error.message);
            }
            throw new Error(error.message || 'Failed to fetch blocked attempts');
        }
        setAttempts(data || []);
      } catch (error: any) {
        console.error('Error fetching blocked attempts:', error.message);
        setAttempts([]);
      } finally {
        setLoading(false);
      }
    };

    fetchAttempts();
  }, [user, timeRange]);

  const calculateBlockStats = (): BlockStats[] => {
    const urlCounts: { [key: string]: number } = {};
    
    attempts.forEach((attempt) => {
      try {
          const domain = new URL(attempt.url).hostname;
          urlCounts[domain] = (urlCounts[domain] || 0) + 1;
      } catch(e) {
          console.warn(`Could not parse URL: ${attempt.url}`);
          urlCounts['Invalid URL'] = (urlCounts['Invalid URL'] || 0) + 1;
      }
    });

    const sortedStats = Object.entries(urlCounts)
      .sort(([, a], [, b]) => b - a)
      .slice(0, 4)
      .map(([domain, count]) => ({
        type: domain,
        value: count,
      }));

    const otherCount = attempts.length - sortedStats.reduce((acc, stat) => acc + stat.value, 0);
    if (otherCount > 0) {
      sortedStats.push({
        type: 'Other',
        value: otherCount,
      });
    }

    return sortedStats;
  };

  const blockStats = calculateBlockStats();
  const totalAttempts = attempts.length;
  const dailyAverage = totalAttempts > 0 ? totalAttempts / (timeRange === '7d' ? 7 : timeRange === '30d' ? 30 : 90) : 0;
  const websiteAttempts = attempts.filter(a => a.block_type === 'website').length;
  const keywordAttempts = attempts.filter(a => a.block_type === 'keyword').length;
  const websitePercentage = totalAttempts > 0 ? Math.round((websiteAttempts / totalAttempts) * 100) : 0;
  const keywordPercentage = totalAttempts > 0 ? Math.round((keywordAttempts / totalAttempts) * 100) : 0;

  return (
    <Card>
      <CardHeader>
        <CardTitle>Distraction Analytics</CardTitle>
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
                <PieChart>
                  <Pie
                    data={blockStats}
                    dataKey="value"
                    nameKey="type"
                    cx="50%"
                    cy="50%"
                    outerRadius={100}
                    label={(entry) => `${entry.type} (${entry.value})`}
                  >
                    {blockStats.map((entry, index) => (
                      <Cell key={`cell-${index}`} fill={COLORS[index % COLORS.length]} />
                    ))}
                  </Pie>
                  <Tooltip />
                </PieChart>
              </ResponsiveContainer>
            )}
          </div>

          <div className="grid grid-cols-1 md:grid-cols-3 gap-4 mt-4">
            <Card>
              <CardContent className="pt-6">
                <div className="text-2xl font-bold">
                  {loading ? '-' : totalAttempts}
                </div>
                <p className="text-sm text-muted-foreground">Total Blocked Attempts</p>
              </CardContent>
            </Card>
            <Card>
              <CardContent className="pt-6">
                <div className="text-2xl font-bold">
                  {loading ? '-' : Math.round(dailyAverage)}
                </div>
                <p className="text-sm text-muted-foreground">Daily Average</p>
              </CardContent>
            </Card>
            <Card>
              <CardContent className="pt-6">
                <div className="text-2xl font-bold">
                  {loading ? '-' : `${websitePercentage}% / ${keywordPercentage}%`}
                </div>
                <p className="text-sm text-muted-foreground">Website / Keyword Split</p>
              </CardContent>
            </Card>
          </div>
        </Tabs>
      </CardContent>
    </Card>
  );
}; 