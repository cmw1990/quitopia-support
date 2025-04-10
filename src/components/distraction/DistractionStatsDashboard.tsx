import React, { useState, useEffect, useMemo } from 'react';
import { useAuth } from '@/components/AuthProvider';
import { distractionLogsApi } from '@/api/supabase-rest';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Alert, AlertDescription, AlertTitle } from '@/components/ui/alert';
import { BarChart, AlertCircle, Loader2, CalendarRange } from 'lucide-react'; // Added CalendarRange
import { BarChart as ReBarChart, Bar, XAxis, YAxis, CartesianGrid, Tooltip, ResponsiveContainer, PieChart, Pie, Cell, Legend } from 'recharts';
import { Button } from '@/components/ui/button'; // Added Button
import { subDays, format, parseISO } from 'date-fns';

// Interface matching the expected structure from distractionLogsApi
interface DistractionLog {
  id: string;
  user_id: string;
  session_id?: string | null;
  timestamp: string; // ISO string from DB
  type?: string | null; // Optional categorization
  description: string;
  duration_seconds?: number | null;
  intervention_used?: string | null;
  intervention_effectiveness?: number | null;
  created_at: string;
}

const COLORS = ['#0088FE', '#00C49F', '#FFBB28', '#FF8042', '#8884D8', '#82ca9d'];

const DistractionStatsDashboard: React.FC = () => {
  const { user } = useAuth();
  const [logs, setLogs] = useState<DistractionLog[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [timeRange, setTimeRange] = useState<number>(7); // Default to last 7 days

  useEffect(() => {
    const fetchLogs = async () => {
      if (!user?.id) {
        setIsLoading(false);
        setLogs([]);
        return;
      }
      setIsLoading(true);
      setError(null);
      try {
        const endDate = new Date();
        const startDate = subDays(endDate, timeRange);
        const fetchedLogs = await distractionLogsApi.getDistractionLogsByDateRange(
          user.id,
          startDate.toISOString(),
          endDate.toISOString()
        );
        setLogs(fetchedLogs);
      } catch (err: any) {
        console.error("Error fetching distraction logs:", err);
        setError(`Failed to load distraction data: ${err.message}`);
      } finally {
        setIsLoading(false);
      }
    };

    fetchLogs();
  }, [user?.id, timeRange]);

  // --- Data Processing for Charts ---

  // Example: Count distractions per day
  const distractionsPerDay = useMemo(() => {
    const counts: { [key: string]: number } = {};
    logs.forEach(log => {
       try {
            const dateStr = format(parseISO(log.timestamp), 'yyyy-MM-dd');
            counts[dateStr] = (counts[dateStr] || 0) + 1;
       } catch(e) {
           console.error("Error parsing log timestamp:", log.timestamp, e);
       }
    });
    // Format for recharts, sorted by date
    return Object.entries(counts)
      .map(([date, count]) => ({ date, count }))
      .sort((a, b) => a.date.localeCompare(b.date));
  }, [logs]);

  // Example: Count distractions by type (if available)
   const distractionsByType = useMemo(() => {
        const counts: { [key: string]: number } = {};
        let total = 0;
        logs.forEach(log => {
            const type = log.type || 'Uncategorized'; // Default category
            counts[type] = (counts[type] || 0) + 1;
            total++;
        });
        return Object.entries(counts)
            .map(([name, value]) => ({ name, value, percentage: total > 0 ? Math.round((value / total) * 100) : 0 }))
            .sort((a, b) => b.value - a.value); // Sort descending by count
    }, [logs]);


   // Example: Find most frequent distraction description
   const mostFrequentDistraction = useMemo(() => {
        if (logs.length === 0) return 'N/A';
        const descriptionCounts: { [key: string]: number } = {};
        logs.forEach(log => {
            const desc = log.description.trim().toLowerCase(); // Normalize descriptions
            if (desc) {
                descriptionCounts[desc] = (descriptionCounts[desc] || 0) + 1;
            }
        });
        const sortedDescriptions = Object.entries(descriptionCounts).sort(([, countA], [, countB]) => countB - countA);
        return sortedDescriptions.length > 0 ? sortedDescriptions[0][0] : 'N/A';
    }, [logs]);

    const totalDistractions = logs.length;


  // --- Render Logic ---

  if (isLoading) {
    return (
      <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
        <Skeleton className="h-[350px] w-full" />
        <Skeleton className="h-[350px] w-full" />
        <Skeleton className="h-[100px] w-full md:col-span-2" />
      </div>
    );
  }

  if (error) {
    return (
      <Alert variant="destructive" className="mt-4">
        <AlertCircle className="h-4 w-4" />
        <AlertTitle>Error Loading Stats</AlertTitle>
        <AlertDescription>{error}</AlertDescription>
      </Alert>
    );
  }
  return (
    <div className="space-y-6">
      {/* Time Range Selector */}
      <div className="flex justify-end gap-2">
        <span className="text-sm text-muted-foreground self-center mr-2">View data for:</span>
        {[7, 30, 90].map(days => (
          <Button key={days} variant={timeRange === days ? "secondary" : "outline"} size="sm" onClick={() => setTimeRange(days)} disabled={isLoading} className="transition-all duration-150"> Last {days}d </Button>
        ))}
      </div>

      {logs.length === 0 && !isLoading ? (
         <Card className="text-center py-12">
            <CardHeader><CardTitle>No Distractions Logged</CardTitle></CardHeader>
            <CardContent><p className="text-muted-foreground">No distraction data found for the selected period (Last {timeRange} days).</p></CardContent>
         </Card>
      ) : (
        <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
            {/* Distractions Over Time Card */}
            <Card className="md:col-span-2">
                <CardHeader>
                    <CardTitle>Distractions Over Time (Last {timeRange} Days)</CardTitle>
                </CardHeader>
                <CardContent className="h-[300px] -ml-4"> {/* Adjust margin for axis */}
                    <ResponsiveContainer width="100%" height="100%">
                        <ReBarChart data={distractionsPerDay} margin={{ top: 5, right: 20, left: 0, bottom: 5 }}>
                            <defs> <linearGradient id="colorUv" x1="0" y1="0" x2="0" y2="1"> <stop offset="5%" stopColor="hsl(var(--primary))" stopOpacity={0.8}/> <stop offset="95%" stopColor="hsl(var(--primary))" stopOpacity={0.2}/> </linearGradient> </defs>
                            <CartesianGrid strokeDasharray="3 3" vertical={false} stroke="hsl(var(--border) / 0.5)" />
                            <XAxis dataKey="date" fontSize={12} tickLine={false} axisLine={false} dy={5} />
                            <YAxis allowDecimals={false} fontSize={12} tickLine={false} axisLine={false} width={30}/>
                            <Tooltip contentStyle={{ backgroundColor: 'hsl(var(--background))', border: '1px solid hsl(var(--border))', borderRadius: 'var(--radius)' }} labelStyle={{ color: 'hsl(var(--foreground))' }} itemStyle={{ color: 'hsl(var(--foreground))' }} />
                            <Bar dataKey="count" fill="url(#colorUv)" radius={[4, 4, 0, 0]} />
                        </ReBarChart>
                    </ResponsiveContainer>
                </CardContent>
            </Card>

            {/* Distractions by Type Card */}
            <Card>
                <CardHeader>
                    <CardTitle>Distractions by Type</CardTitle>
                </CardHeader>
                <CardContent className="h-[300px]">
                    {distractionsByType.length === 0 ? (
                        <p className="text-muted-foreground text-center pt-10">No type data available.</p>
                    ) : (
                        <ResponsiveContainer width="100%" height="100%">
                            <PieChart>
                                <Pie data={distractionsByType} cx="50%" cy="50%" labelLine={false} outerRadius={100} fill="#8884d8" dataKey="value" label={({ name, percentage }) => `${name} ${percentage}%`} fontSize={12}>
                                    {distractionsByType.map((entry, index) => (<Cell key={`cell-${index}`} fill={COLORS[index % COLORS.length]} /> ))}
                                </Pie>
                                <Tooltip contentStyle={{ backgroundColor: 'hsl(var(--background))', border: '1px solid hsl(var(--border))', borderRadius: 'var(--radius)' }} formatter={(value, name, props) => [`${value} (${props.payload.percentage}%)`, name]} />
                                {/* <Legend /> Consider removing legend if labels are clear */}
                            </PieChart>
                        </ResponsiveContainer>
                    )}
                </CardContent>
            </Card>

            {/* Key Stats Card */}
            <Card>
                 <CardHeader>
                     <CardTitle>Key Stats (Last {timeRange} Days)</CardTitle>
                 </CardHeader>
                 <CardContent className="space-y-3">
                      <div className="flex justify-between items-center">
                           <span className="text-sm text-muted-foreground">Total Distractions</span>
                           <span className="font-semibold text-lg">{totalDistractions}</span>
                      </div>
                      <div className="flex justify-between items-center">
                          <span className="text-sm text-muted-foreground">Most Frequent</span>
                           <Badge variant="secondary" className="capitalize truncate max-w-[60%] text-xs" title={mostFrequentDistraction}>{mostFrequentDistraction}</Badge>
                      </div>
                      {/* Add more stats here, e.g., average per session */}
                      <p className="text-xs text-muted-foreground pt-4 text-center italic">More detailed analysis coming soon.</p>
                 </CardContent>
            </Card>

        </div>
      )}
    </div>
  );
};

export default DistractionStatsDashboard;