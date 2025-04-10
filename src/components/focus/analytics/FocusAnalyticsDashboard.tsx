import React, { useState, useEffect, useMemo } from 'react';
import { FocusServiceInstance, FocusSession } from '@/services/FocusService'; // Adjust path if needed
import { DistractionLogServiceInstance, DistractionLog } from '@/services/DistractionLogService'; // Import distraction service
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Alert, AlertDescription, AlertTitle } from "@/components/ui/alert";
import { AlertCircle, BarChart3, ListChecks, Clock } from "lucide-react";
import { Link } from 'react-router-dom'; // For potential error links
import { useAuth } from '@/components/auth/AuthProvider'; // Corrected import path
// Import Recharts components
import { BarChart, Bar, XAxis, YAxis, CartesianGrid, Tooltip, Legend, ResponsiveContainer, PieChart, Pie, Cell } from 'recharts';
// Import date-fns functions
import { format, subDays, startOfDay, isWithinInterval, differenceInMilliseconds, formatDistanceToNow } from 'date-fns';
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "@/components/ui/table"; // Import Table components
import { ScrollArea } from "@/components/ui/scroll-area"; // Import ScrollArea

// Helper function to calculate KPIs
const calculateKPIs = (sessions: FocusSession[]) => {
  const completedSessions = sessions.filter(s => s.status === 'completed' && s.start_time && s.end_time);
  const totalFocusTimeMs = completedSessions.reduce((total, session) => {
    // Use correct snake_case properties
    const start = new Date(session.start_time!).getTime(); 
    const end = new Date(session.end_time!).getTime();
    return total + (end - start);
  }, 0);

  const totalSessionsCompleted = completedSessions.length;
  const averageSessionDurationMs = totalSessionsCompleted > 0 ? totalFocusTimeMs / totalSessionsCompleted : 0;

  return {
    totalFocusTimeMs,
    totalSessionsCompleted,
    averageSessionDurationMs,
  };
};

// Helper function to format duration 
const formatDuration = (milliseconds: number): string => {
    if (milliseconds < 0) return "0m";
    const totalMinutes = Math.floor(milliseconds / (1000 * 60));
    const hours = Math.floor(totalMinutes / 60);
    const minutes = totalMinutes % 60;
    if (hours > 0) {
        return `${hours}h ${minutes}m`;
    }
    return `${minutes}m`;
};

// Helper function to process data for the daily focus trend chart
const processDailyFocusData = (sessions: FocusSession[], days = 7) => {
    const endDate = startOfDay(new Date());
    const startDate = startOfDay(subDays(endDate, days - 1));
    const interval = { start: startDate, end: new Date() }; // Include today up to now

    // Initialize data structure for the last 'days' days
    const dailyDataMap = new Map<string, number>();
    for (let i = 0; i < days; i++) {
        const date = format(subDays(endDate, i), 'yyyy-MM-dd');
        dailyDataMap.set(date, 0);
    }

    // Filter sessions within the interval and aggregate duration
    sessions
        .filter(s => s.status === 'completed' && s.start_time && s.end_time)
        .forEach(session => {
            const sessionStartTime = new Date(session.start_time!);
            // Check if session start time is within the interval
             if (isWithinInterval(sessionStartTime, interval)) {
                const sessionDate = format(startOfDay(sessionStartTime), 'yyyy-MM-dd');
                 if (dailyDataMap.has(sessionDate)) {
                     const durationMs = differenceInMilliseconds(new Date(session.end_time!), sessionStartTime);
                     dailyDataMap.set(sessionDate, dailyDataMap.get(sessionDate)! + durationMs);
                 }
             }
        });

    // Convert map to array suitable for Recharts, sort by date
    const chartData = Array.from(dailyDataMap.entries())
        .map(([date, durationMs]) => ({
            date: format(new Date(date), 'MMM d'), // Format date for display (e.g., "Jul 20")
            focusTime: Math.round(durationMs / (1000 * 60)), // Convert ms to minutes
        }))
        .sort((a, b) => new Date(a.date).getTime() - new Date(b.date).getTime()); // Ensure correct order

     // Temporary fix for sorting if 'MMM d' format causes issues
     const chartDataSorted = Array.from(dailyDataMap.entries())
         .sort(([dateA], [dateB]) => new Date(dateA).getTime() - new Date(dateB).getTime())
         .map(([date, durationMs]) => ({
             date: format(new Date(date), 'MMM d'), // Format date for display (e.g., "Jul 20")
             focusTime: Math.round(durationMs / (1000 * 60)), // Convert ms to minutes
         }));


    return chartDataSorted;
};

// Helper function to process distraction data
const processDistractionData = (distractions: DistractionLog[]) => {
  if (!distractions || distractions.length === 0) return [];

  const counts: { [key: string]: number } = {};
  distractions.forEach(log => {
    counts[log.distraction_type] = (counts[log.distraction_type] || 0) + 1;
  });

  return Object.entries(counts)
    .map(([name, value]) => ({ name, value }))
    .sort((a, b) => b.value - a.value); // Sort descending by count
};

// Colors for the Pie Chart (adjust as needed)
const PIE_COLORS = ['#8b5cf6', '#a78bfa', '#c4b5fd', '#ddd6fe', '#ede9fe', '#7c3aed'];

export const FocusAnalyticsDashboard = () => {
    const [sessions, setSessions] = useState<FocusSession[]>([]);
    const [distractions, setDistractions] = useState<DistractionLog[]>([]); // Add state for distractions
    const [isLoading, setIsLoading] = useState<boolean>(true);
    const [error, setError] = useState<string | null>(null);
    const { user, loading: authLoading } = useAuth(); // Get user and auth loading state

    useEffect(() => {
        // Wait until auth state is determined
        if (authLoading) {
            console.debug("FocusAnalyticsDashboard: Auth state still loading, waiting...");
            return; 
        }

        const fetchData = async () => {
             if (!user?.id) { 
                 console.warn("FocusAnalyticsDashboard: No user ID found, skipping fetch.");
                 setError("Please sign in to view your focus analytics.");
                 setIsLoading(false);
                 return;
             }
            
            setIsLoading(true);
            setError(null);
            try {
                // Fetch both sessions and distractions
                const [historicalSessions, distractionLogs] = await Promise.all([
                    FocusServiceInstance.getFocusSessionHistory(user.id),
                    DistractionLogServiceInstance.getDistractionHistory(user.id, 500) // Fetch last 500 distractions
                ]);
                
                setSessions(Array.isArray(historicalSessions) ? historicalSessions : []);
                setDistractions(Array.isArray(distractionLogs) ? distractionLogs : []);
                
                console.debug("FocusAnalyticsDashboard: Fetched data for user:", user.id);
            } catch (err: any) {
                 console.error(`FocusAnalyticsDashboard: Error fetching data for user ${user.id}:`, err);
                 let errorMessage = "An unexpected error occurred while fetching analytics data.";
                 if (err instanceof Error) {
                     errorMessage = err.message;
                     if (errorMessage.includes('Failed to fetch')) {
                         errorMessage = 'Network error. Please check your connection and try again.';
                     }
                 }
                setError(errorMessage);
            } finally {
                setIsLoading(false);
            }
        };

        fetchData();
     }, [user, authLoading]);

    const kpis = useMemo(() => calculateKPIs(sessions), [sessions]);
    const dailyChartData = useMemo(() => processDailyFocusData(sessions, 7), [sessions]);
    const distractionChartData = useMemo(() => processDistractionData(distractions), [distractions]); // Process distraction data
    const recentSessions = useMemo(() => sessions.sort((a, b) => new Date(b.start_time!).getTime() - new Date(a.start_time!).getTime()).slice(0, 10), [sessions]); // Get last 10 sessions

     // Show loading state if either auth or data fetching is in progress
     if (isLoading || authLoading) {
         return <div className="text-center p-4">Loading analytics...</div>;
     }

    if (error) {
        return (
             <Alert variant="destructive" className="m-4">
                 <AlertCircle className="h-4 w-4" />
                 <AlertTitle>Error Loading Analytics</AlertTitle>
                 <AlertDescription>
                     {error}
                     {error.includes('sign in') && (
                         <Link to="/login" className="underline ml-2">Sign In</Link>
                     )}
                 </AlertDescription>
             </Alert>
        );
    }

     if (sessions.length === 0 && distractions.length === 0) {
         return (
             <Alert className="m-4">
                 <AlertCircle className="h-4 w-4" />
                 <AlertTitle>No Analytics Data Yet</AlertTitle>
                 <AlertDescription>
                     Start using the Focus Timer and logging distractions to see your analytics here.
                      <Link to="/app/focus" className="underline ml-2">Start Focusing</Link>
                 </AlertDescription>
             </Alert>
         );
     }

    return (
        <div className="p-4 md:p-6 space-y-6">
            <h2 className="text-2xl font-semibold tracking-tight mb-4">Focus Analytics</h2>
            {/* KPI Cards */}
            <div className="grid gap-4 md:grid-cols-3">
                <Card>
                    <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
                        <CardTitle className="text-sm font-medium">Total Focus Time</CardTitle>
                        {/* Icon can be added here */}
                    </CardHeader>
                    <CardContent>
                        <div className="text-2xl font-bold">{formatDuration(kpis.totalFocusTimeMs)}</div>
                        <p className="text-xs text-muted-foreground">Total duration of completed sessions</p>
                    </CardContent>
                </Card>
                 <Card>
                    <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
                        <CardTitle className="text-sm font-medium">Sessions Completed</CardTitle>
                         {/* Icon can be added here */}
                    </CardHeader>
                    <CardContent>
                        <div className="text-2xl font-bold">{kpis.totalSessionsCompleted}</div>
                         <p className="text-xs text-muted-foreground">Number of focus sessions finished</p>
                    </CardContent>
                </Card>
                 <Card>
                    <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
                        <CardTitle className="text-sm font-medium">Avg. Session Duration</CardTitle>
                         {/* Icon can be added here */}
                    </CardHeader>
                    <CardContent>
                        <div className="text-2xl font-bold">{formatDuration(kpis.averageSessionDurationMs)}</div>
                         <p className="text-xs text-muted-foreground">Average length of completed sessions</p>
                    </CardContent>
                </Card>
            </div>

            {/* Charts Grid */}
            <div className="grid gap-6 md:grid-cols-2">
                {/* Daily Focus Trend Chart */}
                <Card>
                    <CardHeader>
                        <CardTitle className="text-lg font-medium flex items-center">
                            <BarChart3 className="h-5 w-5 mr-2 text-primary" />
                            Daily Focus Trend (Last 7 Days)
                        </CardTitle>
                    </CardHeader>
                    <CardContent>
                        {dailyChartData.length > 0 ? (
                            <ResponsiveContainer width="100%" height={300}>
                                <BarChart data={dailyChartData} margin={{ top: 5, right: 30, left: 20, bottom: 5 }}>
                                    <CartesianGrid strokeDasharray="3 3" />
                                    <XAxis dataKey="date" />
                                    <YAxis label={{ value: 'Minutes', angle: -90, position: 'insideLeft', style: { textAnchor: 'middle' } }} />
                                    <Tooltip formatter={(value: number) => [`${value} min`, "Focus Time"]} />
                                    <Legend />
                                    <Bar dataKey="focusTime" name="Focus Time (min)" fill="#8b5cf6" />
                                </BarChart>
                            </ResponsiveContainer>
                        ) : (
                             <p className="text-muted-foreground text-center py-8">Not enough focus data for the last 7 days.</p>
                        )}
                    </CardContent>
                </Card>

                {/* Distraction Analysis Chart */}
                <Card>
                    <CardHeader>
                        <CardTitle className="text-lg font-medium flex items-center">
                            <AlertCircle className="h-5 w-5 mr-2 text-destructive" />
                            Distraction Analysis
                        </CardTitle>
                    </CardHeader>
                    <CardContent>
                        {distractionChartData.length > 0 ? (
                             <ResponsiveContainer width="100%" height={300}>
                                <PieChart>
                                    <Pie
                                        data={distractionChartData}
                                        cx="50%"
                                        cy="50%"
                                        labelLine={false}
                                        outerRadius={80}
                                        fill="#8884d8"
                                        dataKey="value"
                                        nameKey="name"
                                        label={({ name, percent }) => `${name} (${(percent * 100).toFixed(0)}%)`}
                                    >
                                        {distractionChartData.map((entry, index) => (
                                            <Cell key={`cell-${index}`} fill={PIE_COLORS[index % PIE_COLORS.length]} />
                                        ))}
                                    </Pie>
                                    <Tooltip formatter={(value, name) => [`${value} occurrences`, name]}/>
                                    <Legend />
                                </PieChart>
                            </ResponsiveContainer>
                        ) : (
                            <p className="text-muted-foreground text-center py-8">No distraction data logged yet.</p>
                        )}
                    </CardContent>
                </Card>
            </div>

            {/* Recent Focus Sessions Table */}
            <Card>
                 <CardHeader>
                     <CardTitle className="text-lg font-medium flex items-center">
                        <ListChecks className="h-5 w-5 mr-2 text-blue-500" />
                        Recent Focus Sessions
                     </CardTitle>
                 </CardHeader>
                 <CardContent>
                    {recentSessions.length > 0 ? (
                        <ScrollArea className="h-[300px] w-full">
                            <Table>
                                <TableHeader>
                                    <TableRow>
                                        <TableHead>Start Time</TableHead>
                                        <TableHead>Duration</TableHead>
                                        <TableHead>Status</TableHead>
                                        <TableHead>Type</TableHead>
                                    </TableRow>
                                </TableHeader>
                                <TableBody>
                                    {recentSessions.map((session) => (
                                        <TableRow key={session.id}>
                                            <TableCell title={new Date(session.start_time!).toLocaleString()}>
                                                {formatDistanceToNow(new Date(session.start_time!), { addSuffix: true })}
                                            </TableCell>
                                            <TableCell>
                                                {session.end_time ? 
                                                    formatDuration(differenceInMilliseconds(new Date(session.end_time), new Date(session.start_time!))) 
                                                    : 'In Progress'}
                                            </TableCell>
                                            <TableCell>
                                                <span className={`px-2 py-1 rounded-full text-xs font-medium ${ 
                                                    session.status === 'completed' ? 'bg-green-100 text-green-800 dark:bg-green-900/30 dark:text-green-300' : 
                                                    session.status === 'cancelled' ? 'bg-red-100 text-red-800 dark:bg-red-900/30 dark:text-red-300' : 
                                                    'bg-yellow-100 text-yellow-800 dark:bg-yellow-900/30 dark:text-yellow-300'
                                                }`}>
                                                    {session.status?.replace('_', ' ')}
                                                </span>
                                            </TableCell>
                                            <TableCell>{session.focus_type?.replace('_', ' ') || 'N/A'}</TableCell>
                                        </TableRow>
                                    ))}
                                </TableBody>
                            </Table>
                        </ScrollArea>
                    ) : (
                         <p className="text-muted-foreground text-center py-8">No focus sessions recorded yet.</p>
                    )}
                 </CardContent>
            </Card>

            {/* Placeholder for future charts/details */}
            <div className="mt-6">
                <h3 className="text-xl font-semibold tracking-tight mb-2">Detailed Breakdown</h3>
                <p className="text-muted-foreground">More detailed charts and session history will be added here.</p>
                {/* Example: <FocusHistoryChart sessions={sessions} /> */}
            </div>
        </div>
    );
};
