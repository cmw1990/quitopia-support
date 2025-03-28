import React, { useState, useEffect } from 'react';
import { Card, CardContent, CardDescription, CardHeader, CardTitle, Button, Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '../ui';
import { Session } from '@supabase/supabase-js';
import { ArrowDownIcon, ArrowUpIcon, DownloadIcon, RefreshCwIcon, Smile } from 'lucide-react';
import { format, subDays, startOfDay, endOfDay } from 'date-fns';
import useOfflineStatus from '../../hooks/useOfflineStatus';
import { BarChart, Bar, XAxis, YAxis, CartesianGrid, Tooltip, ResponsiveContainer, PieChart, Pie, Cell, Legend, LineChart, Line, Area, AreaChart } from 'recharts';
import { toast } from 'sonner';
import { fetchMoodData, MoodEntry } from '../../api/analyticsClient';

interface MoodAnalyticsProps {
  session: Session | null;
}

interface MoodByDayData {
  date: string;
  rating: number;
  count: number;
}

interface MoodDistributionData {
  name: string;
  value: number;
  color: string;
}

export const MoodAnalytics: React.FC<MoodAnalyticsProps> = ({ session }) => {
  const [moodData, setMoodData] = useState<MoodEntry[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [dateRange, setDateRange] = useState<'7days' | '30days' | '90days' | 'all'>('30days');
  const { isOnline } = useOfflineStatus();
  
  // Calculated metrics
  const [averageMood, setAverageMood] = useState(0);
  const [moodByDay, setMoodByDay] = useState<MoodByDayData[]>([]);
  const [moodDistribution, setMoodDistribution] = useState<MoodDistributionData[]>([]);
  const [moodTrend, setMoodTrend] = useState<'up' | 'down' | 'stable'>('stable');
  
  // Colors for charts and mood ratings
  const COLORS = {
    1: '#f87171', // Red - Very Bad
    2: '#fb923c', // Orange - Bad
    3: '#facc15', // Yellow - Neutral
    4: '#a3e635', // Light Green - Good
    5: '#4ade80'  // Green - Very Good
  };
  
  // Fetch mood data
  const fetchMoodDataForAnalytics = async () => {
    if (!session?.user?.id) {
      setIsLoading(false);
      return;
    }
    
    try {
      setIsLoading(true);
      
      // Fetch real data from Supabase using our analyticsClient
      const data = await fetchMoodData(session.user.id, dateRange, session);
      
      if (data.length === 0) {
        toast.info("No mood data found for the selected period. Try a different date range.");
      }
      
      setMoodData(data);
      
      // Calculate metrics from the real data
      calculateMetrics(data);
    } catch (error) {
      console.error('Error fetching mood data:', error);
      toast.error('Failed to load mood analytics. Using cached data if available.');
    } finally {
      setIsLoading(false);
    }
  };
  
  // Calculate metrics from mood data
  const calculateMetrics = (data: MoodEntry[]) => {
    if (data.length === 0) {
      setAverageMood(0);
      setMoodByDay([]);
      setMoodDistribution([]);
      setMoodTrend('stable');
      return;
    }
    
    // Average mood
    const totalMood = data.reduce((sum, item) => sum + item.rating, 0);
    const avgMood = Math.round((totalMood / data.length) * 10) / 10;
    setAverageMood(avgMood);
    
    // Calculate mood by day
    const moodMap = new Map<string, { totalRating: number, count: number }>();
    
    data.forEach(item => {
      const date = format(new Date(item.date), 'yyyy-MM-dd');
      const current = moodMap.get(date) || { totalRating: 0, count: 0 };
      
      moodMap.set(date, {
        totalRating: current.totalRating + item.rating,
        count: current.count + 1
      });
    });
    
    const moodByDayArray: MoodByDayData[] = Array.from(moodMap.entries())
      .map(([date, { totalRating, count }]) => ({
        date: format(new Date(date), 'MMM d'),
        rating: Math.round((totalRating / count) * 10) / 10,
        count
      }))
      .sort((a, b) => new Date(a.date).getTime() - new Date(b.date).getTime());
    
    setMoodByDay(moodByDayArray);
    
    // Mood distribution
    const distributionMap = new Map<number, number>();
    
    // Initialize with all possible mood ratings
    [1, 2, 3, 4, 5].forEach(rating => distributionMap.set(rating, 0));
    
    // Count occurrences
    data.forEach(item => {
      const current = distributionMap.get(item.rating) || 0;
      distributionMap.set(item.rating, current + 1);
    });
    
    const moodLabels = {
      1: 'Very Bad',
      2: 'Bad',
      3: 'Neutral',
      4: 'Good',
      5: 'Very Good'
    };
    
    const moodCounts = Object.fromEntries(distributionMap.entries());
    
    // Process mood distribution data
    const moodDistributionData = Object.keys(moodCounts).map(key => {
      // Convert the key to a number for type safety
      const numericKey = Number(key) as 1 | 2 | 3 | 4 | 5;
      return {
        name: moodLabels[numericKey],
        value: moodCounts[key],
        color: getMoodColor(numericKey)
      };
    })
    .sort((a, b) => {
      // Find the corresponding numeric keys for the mood labels
      const ratingA = Object.entries(moodLabels).find(([_, val]) => val === a.name)?.[0];
      const ratingB = Object.entries(moodLabels).find(([_, val]) => val === b.name)?.[0];
      return Number(ratingA) - Number(ratingB);
    });
    
    setMoodDistribution(moodDistributionData);
    
    // Calculate mood trend
    if (moodByDayArray.length > 1) {
      // Split into two periods
      const midPoint = Math.floor(moodByDayArray.length / 2);
      const recentPeriod = moodByDayArray.slice(midPoint);
      const previousPeriod = moodByDayArray.slice(0, midPoint);
      
      // Calculate average mood for both periods
      const recentAvgMood = recentPeriod.reduce((sum, day) => sum + day.rating, 0) / recentPeriod.length;
      const previousAvgMood = previousPeriod.reduce((sum, day) => sum + day.rating, 0) / previousPeriod.length;
      
      // Determine trend (for mood, up is positive)
      if (recentAvgMood > previousAvgMood * 1.05) {
        setMoodTrend('up');
      } else if (recentAvgMood < previousAvgMood * 0.95) {
        setMoodTrend('down');
      } else {
        setMoodTrend('stable');
      }
    }
  };
  
  useEffect(() => {
    fetchMoodDataForAnalytics();
  }, [session, dateRange]);
  
  // Custom tooltip for charts
  const CustomTooltip = ({ active, payload, label }: any) => {
    if (active && payload && payload.length) {
      return (
        <div className="bg-white dark:bg-gray-800 p-2 border shadow-sm rounded-md text-sm">
          <p className="font-medium">{label}</p>
          {payload.map((entry: any, index: number) => (
            <p key={index} style={{ color: entry.color }}>
              {entry.name}: {entry.value}
            </p>
          ))}
        </div>
      );
    }
    return null;
  };
  
  // Handle data export
  const handleDataExport = () => {
    if (moodData.length === 0) {
      toast.error("No data to export");
      return;
    }
    
    try {
      // Prepare data for CSV
      const headers = "Date,Rating,Notes\n";
      const csvData = moodData.map(item => {
        const date = format(new Date(item.date), 'yyyy-MM-dd');
        return `${date},${item.rating},"${item.notes || ''}"`;
      }).join('\n');
      
      const blob = new Blob([headers + csvData], { type: 'text/csv' });
      const url = URL.createObjectURL(blob);
      const a = document.createElement('a');
      a.href = url;
      a.download = `mood-data-${format(new Date(), 'yyyy-MM-dd')}.csv`;
      document.body.appendChild(a);
      a.click();
      document.body.removeChild(a);
      URL.revokeObjectURL(url);
      
      toast.success("Data exported successfully");
    } catch (error) {
      console.error("Error exporting data:", error);
      toast.error("Failed to export data");
    }
  };
  
  // Get mood color based on rating
  const getMoodColor = (rating: number) => {
    return COLORS[rating as keyof typeof COLORS] || COLORS[3]; // Default to neutral
  };
  
  return (
    <div className="space-y-6">
      <div className="flex flex-col sm:flex-row sm:justify-between sm:items-center gap-4">
        <div>
          <h2 className="text-2xl font-bold">Mood Analytics</h2>
          <p className="text-muted-foreground">Track how you feel throughout your quitting journey</p>
        </div>
        
        <div className="flex items-center gap-2">
          <Select value={dateRange} onValueChange={(value: any) => setDateRange(value)}>
            <SelectTrigger className="w-[160px]">
              <SelectValue placeholder="Select time range" />
            </SelectTrigger>
            <SelectContent>
              <SelectItem value="7days">Last 7 days</SelectItem>
              <SelectItem value="30days">Last 30 days</SelectItem>
              <SelectItem value="90days">Last 90 days</SelectItem>
              <SelectItem value="all">All time</SelectItem>
            </SelectContent>
          </Select>
          
          <Button variant="outline" size="icon" onClick={fetchMoodDataForAnalytics} disabled={isLoading}>
            <RefreshCwIcon className={`h-4 w-4 ${isLoading ? 'animate-spin' : ''}`} />
          </Button>
          
          <Button variant="outline" size="icon" onClick={handleDataExport} disabled={moodData.length === 0}>
            <DownloadIcon className="h-4 w-4" />
          </Button>
        </div>
      </div>
      
      {/* Average Mood Card */}
      <Card>
        <CardHeader className="pb-2">
          <CardTitle className="text-sm font-medium">Average Mood</CardTitle>
        </CardHeader>
        <CardContent>
          <div className="flex flex-col items-center">
            <div className="text-5xl font-bold mb-2" style={{ color: getMoodColor(Math.round(averageMood)) }}>
              {averageMood > 0 ? averageMood.toFixed(1) : '-'}
            </div>
            <div className="flex items-center gap-1 text-sm">
              <div>1</div>
              <div className="flex w-80">
                {[1, 2, 3, 4, 5].map(rating => (
                  <div 
                    key={rating} 
                    className="h-2 flex-1" 
                    style={{ 
                      backgroundColor: COLORS[rating as keyof typeof COLORS],
                      opacity: Math.round(averageMood) === rating ? 1 : 0.4
                    }} 
                  />
                ))}
              </div>
              <div>5</div>
            </div>
            <div className="mt-2 flex items-center text-sm text-muted-foreground">
              {moodTrend === 'up' && (
                <span className="text-green-500 flex items-center">
                  <ArrowUpIcon className="h-4 w-4 mr-1" />
                  Improving
                </span>
              )}
              {moodTrend === 'down' && (
                <span className="text-red-500 flex items-center">
                  <ArrowDownIcon className="h-4 w-4 mr-1" />
                  Declining
                </span>
              )}
              {moodTrend === 'stable' && (
                <span className="text-gray-500">Stable</span>
              )}
            </div>
          </div>
        </CardContent>
      </Card>
      
      {/* No Data State */}
      {moodData.length === 0 && !isLoading && (
        <Card className="w-full p-6 text-center">
          <div className="flex flex-col items-center justify-center py-10">
            <Smile className="h-12 w-12 text-muted-foreground mb-4" />
            <h3 className="text-lg font-medium mb-2">No Mood Data Available</h3>
            <p className="text-muted-foreground mb-4">
              {isOnline 
                ? "No mood data found for the selected period. Try a different date range or log your mood."
                : "You appear to be offline. Connect to the internet to fetch your data."}
            </p>
            {isOnline && (
              <Button 
                variant="outline" 
                onClick={() => window.location.href = "/app/health/mood"}
              >
                Track Your Mood
              </Button>
            )}
          </div>
        </Card>
      )}
      
      {/* Loading State */}
      {isLoading && (
        <Card className="w-full p-6 text-center">
          <div className="flex flex-col items-center justify-center py-10">
            <RefreshCwIcon className="h-12 w-12 text-primary mb-4 animate-spin" />
            <h3 className="text-lg font-medium">Loading Analytics</h3>
            <p className="text-muted-foreground">Please wait while we fetch your data...</p>
          </div>
        </Card>
      )}
      
      {/* Charts - Only show if we have data */}
      {moodData.length > 0 && !isLoading && (
        <>
          {/* Mood Over Time */}
          <Card>
            <CardHeader>
              <CardTitle>Mood Over Time</CardTitle>
              <CardDescription>Your daily mood ratings</CardDescription>
            </CardHeader>
            <CardContent>
              <div className="h-80">
                <ResponsiveContainer width="100%" height="100%">
                  <LineChart
                    data={moodByDay}
                    margin={{ top: 5, right: 30, left: 20, bottom: 25 }}
                  >
                    <CartesianGrid strokeDasharray="3 3" opacity={0.2} />
                    <XAxis 
                      dataKey="date" 
                      tick={{ fontSize: 12 }}
                      angle={-45}
                      textAnchor="end"
                      height={50}
                    />
                    <YAxis domain={[1, 5]} ticks={[1, 2, 3, 4, 5]} />
                    <Tooltip content={<CustomTooltip />} />
                    <Legend />
                    <Line
                      type="monotone"
                      dataKey="rating"
                      name="Mood Rating"
                      stroke="#8884d8"
                      activeDot={{ r: 8 }}
                      dot={{ fill: '#8884d8', stroke: '#8884d8', strokeWidth: 2, r: 4 }}
                    />
                  </LineChart>
                </ResponsiveContainer>
              </div>
            </CardContent>
          </Card>
          
          {/* Mood Distribution */}
          <Card>
            <CardHeader>
              <CardTitle>Mood Distribution</CardTitle>
              <CardDescription>How often you experience each mood level</CardDescription>
            </CardHeader>
            <CardContent>
              <div className="h-80">
                <ResponsiveContainer width="100%" height="100%">
                  <BarChart
                    data={moodDistribution}
                    margin={{ top: 20, right: 30, left: 20, bottom: 5 }}
                  >
                    <CartesianGrid strokeDasharray="3 3" opacity={0.2} />
                    <XAxis dataKey="name" />
                    <YAxis />
                    <Tooltip />
                    <Bar dataKey="value" name="Count">
                      {moodDistribution.map((entry, index) => (
                        <Cell key={`cell-${index}`} fill={entry.color} />
                      ))}
                    </Bar>
                  </BarChart>
                </ResponsiveContainer>
              </div>
            </CardContent>
          </Card>
          
          {/* Mood vs. Cravings Card Placeholder */}
          <Card>
            <CardHeader>
              <CardTitle>Mood and Cravings</CardTitle>
              <CardDescription>Exploring the relationship between mood and cravings</CardDescription>
            </CardHeader>
            <CardContent className="p-6 text-center">
              <p className="text-muted-foreground mb-4">
                Future feature: This section will show correlations between your mood entries and craving intensity.
              </p>
              <Button variant="outline" disabled>
                Coming Soon
              </Button>
            </CardContent>
          </Card>
        </>
      )}
    </div>
  );
};

export default MoodAnalytics; 