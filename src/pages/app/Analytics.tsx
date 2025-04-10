import React, { useState, useEffect } from 'react';
import { supabaseRequest } from '@/utils/supabaseRequest'; // Assuming this util exists
import { supabase } from '@/integrations/supabase/supabase-client';
import type { User } from '@supabase/supabase-js';
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from '@/components/ui/card';
import { BarChart, LineChart, Activity, Clock } from 'lucide-react';
import { subDays, format, parseISO } from 'date-fns'; // Import date-fns functions
// Import Recharts components
import { 
    ResponsiveContainer, 
    LineChart as RechartsLineChart, 
    BarChart as RechartsBarChart, 
    XAxis, 
    YAxis, 
    Tooltip, 
    Legend, 
    CartesianGrid, 
    Bar, 
    Line 
} from 'recharts';
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import ErrorBoundary from '@/components/ErrorBoundary';
import { toast } from 'sonner';

// Interfaces for potential data structures
interface DailyFocusSummary {
    date: string; // YYYY-MM-DD
    total_focus_seconds: number;
    session_count: number;
    distractions_logged: number;
}

interface DistractionSummary {
    type: string;
    count: number;
}

interface SleepData {
    date: string;
    hours: number;
    quality: number;
}

interface EnergyData {
    date: string;
    level: number;
    focus_score: number;
}

interface AnalyticsData {
    dailyScores: DailyFocusSummary[];
    sessionCounts: { date: string; count: number }[];
    tasksCompleted: { date: string; count: number }[];
    sleepData: SleepData[];
    energyData: EnergyData[];
    distractionSummary?: DistractionSummary[];
}

const AnalyticsPage = () => {
    const [userId, setUserId] = useState<string | null>(null);
    const [isLoading, setIsLoading] = useState(true);
    const [dailySummary, setDailySummary] = useState<DailyFocusSummary[]>([]);
    const [distractionSummary, setDistractionSummary] = useState<DistractionSummary[]>([]);
    const [analyticsData, setAnalyticsData] = useState<AnalyticsData | null>(null);
    const [dateRangeDays, setDateRangeDays] = useState(7); // Add state for date range
    // Add state for other analytics (e.g., task completion rates, focus quality trends)

    useEffect(() => {
        const fetchUserAndData = async () => {
            const { data: { user } } = await supabase.auth.getUser();
            if (user) {
                setUserId(user.id);
                fetchAnalytics(user.id);
            } else {
                setIsLoading(false);
            }
        };
        fetchUserAndData();
    }, []);

    const mapAnalyticsData = (data: any[]): AnalyticsData => {
        // Map raw data to the expected format
        return {
            dailyScores: data.map(item => ({
                date: item.date,
                total_focus_seconds: item.focus_score ? item.focus_score * 60 : 0, // Convert to seconds
                session_count: item.session_count || 0,
                distractions_logged: item.distractions_logged || 0
            })),
            sessionCounts: data.map(item => ({
                date: item.date,
                count: item.session_count || 0
            })),
            tasksCompleted: data.map(item => ({
                date: item.date,
                count: item.tasks_completed || 0
            })),
            sleepData: data.map(item => ({
                date: item.date,
                hours: item.sleep_hours || 0,
                quality: item.sleep_quality || 0
            })),
            energyData: data.map(item => ({
                date: item.date,
                level: item.energy_level || 0,
                focus_score: item.focus_score || 0
            })),
            distractionSummary: data.map(item => ({
                type: item.distraction_type || 'Unknown',
                count: item.distraction_count || 0
            }))
        };
    };

    const fetchAnalytics = async (currentUserId: string) => {
        setIsLoading(true);
        console.log(`Fetching analytics for ${dateRangeDays} days...`);
        
        try {
            const { data, error } = await supabase
                .from('focus_analytics')
                .select('*')
                .eq('user_id', currentUserId)
                .order('date', { ascending: false })
                .limit(30);

            if (error) {
                throw error;
            }

            const mappedData = mapAnalyticsData(data || []);
            setAnalyticsData(mappedData);
        } catch (error) {
            console.error("Error fetching analytics data:", error);
            toast.error("Failed to fetch analytics data", {
                description: "Using sample data for preview purposes"
            });
            
            // Create comprehensive mock data for testing/fallback
            const mockData: AnalyticsData = {
                dailyScores: Array(14).fill(0).map((_, i) => ({
                    date: format(subDays(new Date(), 13 - i), 'yyyy-MM-dd'),
                    total_focus_seconds: (50 + Math.floor(Math.random() * 40)) * 60, // Convert to seconds
                    session_count: Math.floor(Math.random() * 5) + 1,
                    distractions_logged: Math.floor(Math.random() * 10)
                })),
                sessionCounts: Array(14).fill(0).map((_, i) => ({
                    date: format(subDays(new Date(), 13 - i), 'yyyy-MM-dd'),
                    count: Math.floor(Math.random() * 5) + 1
                })),
                tasksCompleted: Array(14).fill(0).map((_, i) => ({
                    date: format(subDays(new Date(), 13 - i), 'yyyy-MM-dd'),
                    count: Math.floor(Math.random() * 8)
                })),
                sleepData: Array(14).fill(0).map((_, i) => ({
                    date: format(subDays(new Date(), 13 - i), 'yyyy-MM-dd'),
                    hours: 5 + Math.floor(Math.random() * 4),
                    quality: 1 + Math.floor(Math.random() * 4)
                })),
                energyData: Array(14).fill(0).map((_, i) => ({
                    date: format(subDays(new Date(), 13 - i), 'yyyy-MM-dd'),
                    level: 1 + Math.floor(Math.random() * 4),
                    focus_score: 50 + Math.floor(Math.random() * 40)
                })),
                distractionSummary: Array(6).fill(0).map((_, i) => ({
                    type: ['Notification', 'Social Media', 'Colleague', 'Hunger', 'Noise', 'Internet Browsing'][i],
                    count: Math.floor(Math.random() * 20) + 1
                }))
            };
            setAnalyticsData(mockData);
        } finally {
            setIsLoading(false);
        }
    };

    // --- Chart Components (Placeholders) ---
    const FocusTrendChart = () => (
        <Card>
            <CardHeader>
                <CardTitle className="text-lg font-medium">Focus Duration Trend (Last {dateRangeDays} Days)</CardTitle>
                <CardDescription>Total focus time logged per day.</CardDescription>
            </CardHeader>
            <CardContent>
                 {/* Replace placeholder with Recharts Line Chart */}
                 <ResponsiveContainer width="100%" height={300}>
                    <RechartsLineChart data={dailySummary} margin={{ top: 5, right: 20, left: -10, bottom: 5 }}> {/* Adjust margins */}
                        <CartesianGrid strokeDasharray="3 3" strokeOpacity={0.5}/>
                        <XAxis 
                            dataKey="date" 
                            tickFormatter={(dateStr) => format(parseISO(dateStr), 'MMM d')} // Format date ticks
                            tick={{ fontSize: 12 }}
                        />
                        <YAxis 
                            tickFormatter={(seconds) => `${Math.round(seconds / 60)}`} // Format seconds to minutes
                            label={{ value: 'Minutes', angle: -90, position: 'insideLeft', offset: 0, style:{ fontSize: '12px' } }} 
                            tick={{ fontSize: 12 }}
                        />
                        <Tooltip 
                             formatter={(value: number) => [`${Math.round(value / 60)} mins`, 'Focus Time']} 
                             labelFormatter={(label) => format(parseISO(label), 'MMM d, yyyy')}
                             contentStyle={{ fontSize: '12px' }}
                             labelStyle={{ fontWeight: 'bold' }}
                        />
                        <Legend verticalAlign="top" height={30} wrapperStyle={{ fontSize: '12px' }}/>
                        <Line 
                             type="monotone" 
                             dataKey="total_focus_seconds" 
                             name="Focus Time" 
                             stroke="hsl(var(--primary))" /* Use primary color */
                             strokeWidth={2}
                             dot={{ r: 3 }}
                             activeDot={{ r: 6 }}
                         />
                    </RechartsLineChart>
                </ResponsiveContainer>
            </CardContent>
        </Card>
    );

     const DistractionTypeChart = () => (
        <Card>
            <CardHeader>
                <CardTitle className="text-lg font-medium">Distraction Types (Last {dateRangeDays} Days)</CardTitle>
                <CardDescription>Breakdown of logged distractions.</CardDescription>
            </CardHeader>
            <CardContent>
                 {/* Replace placeholder with Recharts Bar Chart */}
                 <ResponsiveContainer width="100%" height={300}>
                    {/* Using Bar chart, potentially horizontal layout */}
                    <RechartsBarChart 
                        data={distractionSummary} 
                        layout="vertical" /* Vertical layout better for category names */
                        margin={{ top: 5, right: 30, left: 30, bottom: 5 }} /* Adjust margins */
                    >
                        <CartesianGrid strokeDasharray="3 3" strokeOpacity={0.5}/>
                        <XAxis type="number" tick={{ fontSize: 12 }} />
                        <YAxis 
                            dataKey="type" 
                            type="category" 
                            width={100} /* Adjust width for labels */
                            tick={{ fontSize: 12 }}
                         />
                        <Tooltip 
                             formatter={(value: number) => [`${value} logs`, 'Count']}
                             contentStyle={{ fontSize: '12px' }}
                             labelStyle={{ fontWeight: 'bold' }}
                        />
                        <Legend verticalAlign="top" height={30} wrapperStyle={{ fontSize: '12px' }}/>
                        <Bar 
                            dataKey="count" 
                            name="Count" 
                            fill="hsl(var(--secondary))" /* Use secondary color */
                            barSize={20}
                        />
                    </RechartsBarChart>
                 </ResponsiveContainer>
            </CardContent>
        </Card>
    );
    
    // --- Main Render --- 
    if (isLoading) {
        return <div className="container mx-auto py-8 px-4 text-center"><p>Loading analytics...</p></div>;
    }

    if (!userId) {
        return (
            <div className="container mx-auto py-8 px-4">
                <Card className="bg-yellow-50 border-yellow-200 dark:bg-yellow-900/30 dark:border-yellow-800">
                    <CardHeader>
                        <CardTitle>Please Log In</CardTitle>
                        <CardDescription>Log in or sign up to view your focus analytics.</CardDescription>
                    </CardHeader>
                </Card>
            </div>
        );
    }

    return (
        <div className="container mx-auto py-8 px-4 space-y-6">
            <div className="flex justify-between items-center">
                <h1 className="text-3xl font-bold">Focus Analytics</h1>
                {/* Add date range picker or other controls later */}
            </div>
            
            {/* Summary Cards (Example) */}
             <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-4">
                <Card>
                  <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
                    <CardTitle className="text-sm font-medium">Avg. Focus / Day</CardTitle>
                    <Clock className="h-4 w-4 text-muted-foreground" />
                  </CardHeader>
                  <CardContent>
                    <div className="text-2xl font-bold">{dailySummary.length > 0 ? `${Math.round(dailySummary.reduce((sum, day) => sum + day.total_focus_seconds, 0) / dailySummary.length / 60)} min` : 'N/A'}</div>
                    <p className="text-xs text-muted-foreground">Based on last {dateRangeDays} days</p>
                  </CardContent>
                </Card>
                 <Card>
                   <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
                     <CardTitle className="text-sm font-medium">Total Sessions</CardTitle>
                     <Activity className="h-4 w-4 text-muted-foreground" />
                   </CardHeader>
                   <CardContent>
                     <div className="text-2xl font-bold">{dailySummary.reduce((sum, day) => sum + day.session_count, 0)}</div>
                     <p className="text-xs text-muted-foreground">In last {dateRangeDays} days</p>
                   </CardContent>
                 </Card>
                 {/* Add more summary cards: Distractions logged, longest streak, focus quality score etc. */}
                 <Card>
                   <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
                     <CardTitle className="text-sm font-medium">Total Distractions</CardTitle>
                     <BarChart className="h-4 w-4 text-muted-foreground" /> {/* Using BarChart icon for distractions */} 
                   </CardHeader>
                   <CardContent>
                     <div className="text-2xl font-bold">{dailySummary.reduce((sum, day) => sum + day.distractions_logged, 0)}</div>
                     <p className="text-xs text-muted-foreground">In last {dateRangeDays} days</p>
                   </CardContent>
                 </Card>
                 {/* Placeholder for another metric */}
                  <Card>
                   <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
                     <CardTitle className="text-sm font-medium">Focus Quality (TBD)</CardTitle>
                     <LineChart className="h-4 w-4 text-muted-foreground" /> {/* Placeholder icon */}
                   </CardHeader>
                   <CardContent>
                     <div className="text-2xl font-bold">N/A</div>
                     <p className="text-xs text-muted-foreground">Metric definition pending</p>
                   </CardContent>
                 </Card>
             </div>

            {/* Charts */}
            <div className="grid gap-6 md:grid-cols-1 lg:grid-cols-2">
                <FocusTrendChart />
                <DistractionTypeChart />
            </div>
            
             {/* TODO: Add sections for Task completion analytics (linked to Task Manager), Focus quality score details, etc. */}
        </div>
    );
};

export default AnalyticsPage; 