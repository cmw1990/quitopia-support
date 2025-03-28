import React, { useState, useEffect } from 'react';
import { Card, CardContent, CardDescription, CardHeader, CardTitle, Button, Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '../ui';
import { Session } from '@supabase/supabase-js';
import { ArrowDownIcon, ArrowUpIcon, DownloadIcon, RefreshCwIcon } from 'lucide-react';
import { format, subDays, subWeeks, subMonths, startOfDay, endOfDay, isSameDay } from 'date-fns';
import useOfflineStatus from '../../hooks/useOfflineStatus';
import { BarChart, Bar, XAxis, YAxis, CartesianGrid, Tooltip, ResponsiveContainer, PieChart, Pie, Cell, Legend, LineChart, Line } from 'recharts';
import { toast } from 'sonner';
import { fetchCravingData, CravingData } from '../../api/analyticsClient';
import { useAuth } from '../../hooks/useAuth';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '../ui/tabs';

interface CravingAnalyticsProps {
  session: Session | null;
}

// Type definitions for transformed data for visualization
interface IntensityByDayData {
  date: string;
  average: number;
  count: number;
}

interface TriggerData {
  name: string;
  value: number;
}

interface SuccessRateData {
  name: string;
  value: number;
}

export const CravingAnalytics: React.FC<CravingAnalyticsProps> = ({ session }) => {
  const [cravingData, setCravingData] = useState<CravingData[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [dateRange, setDateRange] = useState<'7days' | '30days' | '90days' | 'all'>('30days');
  const { isOnline } = useOfflineStatus();
  
  // Calculated metrics
  const [totalCravings, setTotalCravings] = useState(0);
  const [averageIntensity, setAverageIntensity] = useState(0);
  const [successRate, setSuccessRate] = useState(0);
  const [intensityByDay, setIntensityByDay] = useState<IntensityByDayData[]>([]);
  const [triggerData, setTriggerData] = useState<TriggerData[]>([]);
  const [successRateData, setSuccessRateData] = useState<SuccessRateData[]>([]);
  const [intensityTrend, setIntensityTrend] = useState<'up' | 'down' | 'stable'>('stable');
  const [countTrend, setCountTrend] = useState<'up' | 'down' | 'stable'>('stable');
  
  // Colors for charts
  const COLORS = ['#0088FE', '#00C49F', '#FFBB28', '#FF8042', '#8884d8', '#82ca9d', '#ffc658'];
  
  // Fetch craving data
  const fetchCravingDataForAnalytics = async () => {
    if (!session?.user?.id) {
      setIsLoading(false);
      return;
    }
    
    try {
      setIsLoading(true);
      
      // Fetch real data from Supabase using our analyticsClient
      const data = await fetchCravingData(session.user.id, dateRange, session);
      
      if (data.length === 0) {
        toast.info("No craving data found for the selected period. Try a different date range.");
      }
      
      setCravingData(data);
      
      // Calculate metrics from the real data
      calculateMetrics(data);
    } catch (error) {
      console.error('Error fetching craving data:', error);
      toast.error('Failed to load craving analytics. Using cached data if available.');
    } finally {
      setIsLoading(false);
    }
  };
  
  // Calculate metrics from craving data
  const calculateMetrics = (data: CravingData[]) => {
    // Total cravings
    setTotalCravings(data.length);
    
    // Average intensity
    const totalIntensity = data.reduce((sum, item) => sum + item.intensity, 0);
    setAverageIntensity(data.length > 0 ? Math.round((totalIntensity / data.length) * 10) / 10 : 0);
    
    // Success rate
    const successfulCravings = data.filter(item => item.success).length;
    setSuccessRate(data.length > 0 ? Math.round((successfulCravings / data.length) * 100) : 0);
    
    // Calculate intensity by day
    const intensityMap = new Map<string, { total: number, count: number }>();
    
    data.forEach(item => {
      const date = format(new Date(item.timestamp), 'yyyy-MM-dd');
      const current = intensityMap.get(date) || { total: 0, count: 0 };
      intensityMap.set(date, {
        total: current.total + item.intensity,
        count: current.count + 1
      });
    });
    
    const intensityByDayArray: IntensityByDayData[] = Array.from(intensityMap.entries())
      .map(([date, { total, count }]) => ({
        date: format(new Date(date), 'MMM d'),
        average: Math.round((total / count) * 10) / 10,
        count
      }))
      .sort((a, b) => new Date(a.date).getTime() - new Date(b.date).getTime());
    
    setIntensityByDay(intensityByDayArray);
    
    // Calculate triggers distribution
    const triggerMap = new Map<string, number>();
    
    data.forEach(item => {
      if (item.trigger) {
        const current = triggerMap.get(item.trigger) || 0;
        triggerMap.set(item.trigger, current + 1);
      }
    });
    
    const triggerDataArray: TriggerData[] = Array.from(triggerMap.entries())
      .map(([name, value]) => ({ name, value }))
      .sort((a, b) => b.value - a.value)
      .slice(0, 5); // Top 5 triggers
    
    setTriggerData(triggerDataArray);
    
    // Calculate success rate data for pie chart
    setSuccessRateData([
      { name: 'Successful', value: successfulCravings },
      { name: 'Unsuccessful', value: data.length - successfulCravings }
    ]);
    
    // Calculate trends (compared to previous period)
    if (intensityByDayArray.length > 1) {
      // Split into two periods
      const midPoint = Math.floor(intensityByDayArray.length / 2);
      const recentPeriod = intensityByDayArray.slice(midPoint);
      const previousPeriod = intensityByDayArray.slice(0, midPoint);
      
      // Calculate average intensity for both periods
      const recentAvgIntensity = recentPeriod.reduce((sum, day) => sum + day.average, 0) / recentPeriod.length;
      const previousAvgIntensity = previousPeriod.reduce((sum, day) => sum + day.average, 0) / previousPeriod.length;
      
      // Determine trend
      if (recentAvgIntensity < previousAvgIntensity * 0.95) {
        setIntensityTrend('down');
      } else if (recentAvgIntensity > previousAvgIntensity * 1.05) {
        setIntensityTrend('up');
      } else {
        setIntensityTrend('stable');
      }
      
      // Calculate average count for both periods
      const recentAvgCount = recentPeriod.reduce((sum, day) => sum + day.count, 0) / recentPeriod.length;
      const previousAvgCount = previousPeriod.reduce((sum, day) => sum + day.count, 0) / previousPeriod.length;
      
      // Determine trend
      if (recentAvgCount < previousAvgCount * 0.95) {
        setCountTrend('down');
      } else if (recentAvgCount > previousAvgCount * 1.05) {
        setCountTrend('up');
      } else {
        setCountTrend('stable');
      }
    }
  };
  
  useEffect(() => {
    fetchCravingDataForAnalytics();
  }, [session, dateRange]);
  
  // Get trend icon
  const getTrendIcon = (trend: 'up' | 'down' | 'stable') => {
    const isPositive = trend === 'down'; // For cravings, down is positive
    
    if (trend === 'stable') return null;
    
    return trend === 'up' ? 
      <ArrowUpIcon className={`h-4 w-4 ml-1 ${isPositive ? 'text-green-500' : 'text-red-500'}`} /> :
      <ArrowDownIcon className={`h-4 w-4 ml-1 ${isPositive ? 'text-green-500' : 'text-red-500'}`} />;
  };
  
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
    if (cravingData.length === 0) {
      toast.error("No data to export");
      return;
    }
    
    try {
      // Prepare data for CSV
      const headers = "Date,Time,Intensity,Trigger,Location,Coping Strategy,Success\n";
      const csvData = cravingData.map(item => {
        const date = format(new Date(item.timestamp), 'yyyy-MM-dd');
        const time = format(new Date(item.timestamp), 'HH:mm:ss');
        return `${date},${time},${item.intensity},${item.trigger || ''},${item.location || ''},${item.coping_strategy || ''},${item.success ? 'Yes' : 'No'}`;
      }).join('\n');
      
      const blob = new Blob([headers + csvData], { type: 'text/csv' });
      const url = URL.createObjectURL(blob);
      const a = document.createElement('a');
      a.href = url;
      a.download = `craving-data-${format(new Date(), 'yyyy-MM-dd')}.csv`;
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
  
  return (
    <div className="space-y-6">
      <div className="flex flex-col sm:flex-row sm:justify-between sm:items-center gap-4">
        <div>
          <h2 className="text-2xl font-bold">Craving Analytics</h2>
          <p className="text-muted-foreground">Understand your craving patterns and triggers</p>
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
          
          <Button variant="outline" size="icon" onClick={fetchCravingDataForAnalytics} disabled={isLoading}>
            <RefreshCwIcon className={`h-4 w-4 ${isLoading ? 'animate-spin' : ''}`} />
          </Button>
          
          <Button variant="outline" size="icon" onClick={handleDataExport} disabled={cravingData.length === 0}>
            <DownloadIcon className="h-4 w-4" />
          </Button>
        </div>
      </div>
      
      {/* Summary Cards */}
      <div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-3">
        <Card>
          <CardHeader className="pb-2">
            <CardTitle className="text-sm font-medium">Total Cravings</CardTitle>
          </CardHeader>
          <CardContent>
            <div className="flex items-baseline">
              <div className="text-3xl font-bold">{totalCravings}</div>
              <div className="ml-2 flex items-center text-sm text-muted-foreground">
                {countTrend === 'down' && (
                  <span className="text-green-500 flex items-center">
                    <ArrowDownIcon className="h-4 w-4 mr-1" />
                    Decreasing
                  </span>
                )}
                {countTrend === 'up' && (
                  <span className="text-red-500 flex items-center">
                    <ArrowUpIcon className="h-4 w-4 mr-1" />
                    Increasing
                  </span>
                )}
                {countTrend === 'stable' && (
                  <span className="text-gray-500">Stable</span>
                )}
              </div>
            </div>
            <p className="text-xs text-muted-foreground mt-1">
              Number of cravings recorded in this period
            </p>
          </CardContent>
        </Card>
        
        <Card>
          <CardHeader className="pb-2">
            <CardTitle className="text-sm font-medium">Average Intensity</CardTitle>
          </CardHeader>
          <CardContent>
            <div className="flex items-baseline">
              <div className="text-3xl font-bold">{averageIntensity} <span className="text-sm font-normal text-muted-foreground">/ 10</span></div>
              <div className="ml-2 flex items-center text-sm text-muted-foreground">
                {intensityTrend === 'down' && (
                  <span className="text-green-500 flex items-center">
                    <ArrowDownIcon className="h-4 w-4 mr-1" />
                    Improving
                  </span>
                )}
                {intensityTrend === 'up' && (
                  <span className="text-red-500 flex items-center">
                    <ArrowUpIcon className="h-4 w-4 mr-1" />
                    Worsening
                  </span>
                )}
                {intensityTrend === 'stable' && (
                  <span className="text-gray-500">Stable</span>
                )}
              </div>
            </div>
            <p className="text-xs text-muted-foreground mt-1">
              Average intensity of cravings (1-10 scale)
            </p>
          </CardContent>
        </Card>
        
        <Card>
          <CardHeader className="pb-2">
            <CardTitle className="text-sm font-medium">Success Rate</CardTitle>
          </CardHeader>
          <CardContent>
            <div className="flex items-baseline">
              <div className="text-3xl font-bold">{successRate}%</div>
            </div>
            <p className="text-xs text-muted-foreground mt-1">
              Percentage of cravings successfully resisted
            </p>
          </CardContent>
        </Card>
      </div>
      
      {/* No Data State */}
      {cravingData.length === 0 && !isLoading && (
        <Card className="w-full p-6 text-center">
          <div className="flex flex-col items-center justify-center py-10">
            <BarChart className="h-12 w-12 text-muted-foreground mb-4" />
            <h3 className="text-lg font-medium mb-2">No Craving Data Available</h3>
            <p className="text-muted-foreground mb-4">
              {isOnline 
                ? "No craving data found for the selected period. Try a different date range or log some cravings."
                : "You appear to be offline. Connect to the internet to fetch your data."}
            </p>
            {isOnline && (
              <Button 
                variant="outline" 
                onClick={() => window.location.href = "/app/consumption-logger"}
              >
                Log a Craving
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
      {cravingData.length > 0 && !isLoading && (
        <>
          {/* Intensity Chart */}
          <Card>
            <CardHeader>
              <CardTitle>Craving Intensity Over Time</CardTitle>
              <CardDescription>Average intensity and count by day</CardDescription>
            </CardHeader>
            <CardContent>
              <div className="h-80">
                <ResponsiveContainer width="100%" height="100%">
                  <LineChart
                    data={intensityByDay}
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
                    <YAxis yAxisId="left" />
                    <YAxis yAxisId="right" orientation="right" />
                    <Tooltip content={<CustomTooltip />} />
                    <Legend />
                    <Line
                      yAxisId="left"
                      type="monotone"
                      dataKey="average"
                      name="Intensity"
                      stroke="#8884d8"
                      activeDot={{ r: 8 }}
                    />
                    <Line
                      yAxisId="right"
                      type="monotone"
                      dataKey="count"
                      name="Count"
                      stroke="#82ca9d"
                    />
                  </LineChart>
                </ResponsiveContainer>
              </div>
            </CardContent>
          </Card>
          
          <div className="grid gap-4 md:grid-cols-2">
            {/* Top Triggers */}
            <Card>
              <CardHeader>
                <CardTitle>Top Triggers</CardTitle>
                <CardDescription>Most common reasons for cravings</CardDescription>
              </CardHeader>
              <CardContent>
                <div className="h-72">
                  <ResponsiveContainer width="100%" height="100%">
                    <BarChart
                      data={triggerData}
                      layout="vertical"
                      margin={{ top: 5, right: 30, left: 20, bottom: 5 }}
                    >
                      <CartesianGrid strokeDasharray="3 3" opacity={0.2} />
                      <XAxis type="number" />
                      <YAxis dataKey="name" type="category" width={100} tick={{ fontSize: 12 }} />
                      <Tooltip />
                      <Bar dataKey="value" fill="#8884d8">
                        {triggerData.map((entry, index) => (
                          <Cell key={`cell-${index}`} fill={COLORS[index % COLORS.length]} />
                        ))}
                      </Bar>
                    </BarChart>
                  </ResponsiveContainer>
                </div>
              </CardContent>
            </Card>
            
            {/* Success Rate */}
            <Card>
              <CardHeader>
                <CardTitle>Success Rate</CardTitle>
                <CardDescription>How often you successfully resist cravings</CardDescription>
              </CardHeader>
              <CardContent>
                <div className="h-72 flex items-center justify-center">
                  <ResponsiveContainer width="100%" height="100%">
                    <PieChart>
                      <Pie
                        data={successRateData}
                        cx="50%"
                        cy="50%"
                        labelLine={false}
                        label={({ name, percent }) => `${name}: ${(percent * 100).toFixed(0)}%`}
                        outerRadius={80}
                        fill="#8884d8"
                        dataKey="value"
                      >
                        {successRateData.map((entry, index) => (
                          <Cell key={`cell-${index}`} fill={index === 0 ? '#4ade80' : '#f87171'} />
                        ))}
                      </Pie>
                      <Tooltip />
                      <Legend />
                    </PieChart>
                  </ResponsiveContainer>
                </div>
              </CardContent>
            </Card>
          </div>
        </>
      )}
    </div>
  );
};

export default CravingAnalytics; 