import React, { useState, useEffect } from 'react';
import { Card, CardContent, CardDescription, CardHeader, CardTitle, Button, Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '../ui';
import { Session } from '@supabase/supabase-js';
import { BarChart as BarChartIcon, Download, Calendar, RefreshCw, Zap, ArrowDown } from 'lucide-react';
import { format, subDays, startOfDay, endOfDay, differenceInDays } from 'date-fns';
import useOfflineStatus from '../../hooks/useOfflineStatus';
import { 
  BarChart, 
  Bar, 
  XAxis, 
  YAxis, 
  CartesianGrid, 
  Tooltip, 
  ResponsiveContainer, 
  PieChart, 
  Pie, 
  Cell, 
  Legend, 
  LineChart, 
  Line, 
  Area, 
  AreaChart, 
  ComposedChart 
} from 'recharts';
import { toast } from 'sonner';
import { fetchProgressData, ProgressEntry } from '../../api/analyticsClient';

interface ProgressAnalyticsProps {
  session: Session | null;
}

interface ProgressByDayData {
  date: string;
  smoke_free: number;
  craving_intensity?: number;
  money_saved?: number;
}

interface SymptomData {
  name: string;
  value: number;
  color: string;
}

export const ProgressAnalytics: React.FC<ProgressAnalyticsProps> = ({ session }) => {
  const [progressData, setProgressData] = useState<ProgressEntry[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [dateRange, setDateRange] = useState<'7days' | '30days' | '90days' | 'all'>('30days');
  const { isOnline } = useOfflineStatus();
  
  // Calculated metrics
  const [smokeFreeStreak, setSmokeFreeStreak] = useState(0);
  const [totalSmokeFree, setTotalSmokeFree] = useState(0);
  const [cravingReduction, setCravingReduction] = useState(0);
  const [totalMoneySaved, setTotalMoneySaved] = useState(0);
  const [progressByDay, setProgressByDay] = useState<ProgressByDayData[]>([]);
  const [symptomStats, setSymptomStats] = useState<SymptomData[]>([]);
  
  // Colors for charts
  const COLORS = ['#0088FE', '#00C49F', '#FFBB28', '#FF8042', '#8884d8', '#82ca9d'];
  
  // Symptom descriptions with recovery timing
  const SYMPTOM_INFO: Record<string, { description: string, typical_recovery: string }> = {
    'anxiety': { 
      description: 'Feelings of worry or unease', 
      typical_recovery: '2-4 weeks' 
    },
    'irritability': { 
      description: 'Being easily annoyed or impatient', 
      typical_recovery: '2-4 weeks' 
    },
    'headache': { 
      description: 'Pain in the head or temples', 
      typical_recovery: '1-2 weeks' 
    },
    'fatigue': { 
      description: 'Feeling of tiredness or exhaustion', 
      typical_recovery: '2-4 weeks' 
    },
    'cough': { 
      description: 'A reflex to clear the airways', 
      typical_recovery: '1-9 months' 
    },
    'insomnia': { 
      description: 'Difficulty falling or staying asleep', 
      typical_recovery: '1-2 weeks' 
    },
    'increased_appetite': { 
      description: 'Feeling hungrier than usual', 
      typical_recovery: '1-2 months' 
    },
    'constipation': { 
      description: 'Difficulty with bowel movements', 
      typical_recovery: '1-2 weeks' 
    },
    'concentration_issues': { 
      description: 'Trouble focusing or thinking clearly', 
      typical_recovery: '1-2 weeks' 
    },
    'mood_swings': { 
      description: 'Rapid, intense emotional changes', 
      typical_recovery: '2-4 weeks' 
    }
  };
  
  // Fetch progress data
  const fetchProgressDataForAnalytics = async () => {
    if (!session?.user?.id) {
      setIsLoading(false);
      return;
    }
    
    try {
      setIsLoading(true);
      
      // Fetch real data from Supabase using our analyticsClient
      const data = await fetchProgressData(session.user.id, dateRange, session);
      
      if (data.length === 0) {
        toast.info("No progress data found for the selected period. Try a different date range.");
      }
      
      setProgressData(data);
      
      // Calculate metrics from the real data
      calculateMetrics(data);
    } catch (error) {
      console.error('Error fetching progress data:', error);
      toast.error('Failed to load progress analytics. Using cached data if available.');
    } finally {
      setIsLoading(false);
    }
  };
  
  // Calculate metrics from progress data
  const calculateMetrics = (data: ProgressEntry[]) => {
    if (data.length === 0) {
      setSmokeFreeStreak(0);
      setTotalSmokeFree(0);
      setCravingReduction(0);
      setTotalMoneySaved(0);
      setProgressByDay([]);
      setSymptomStats([]);
      return;
    }
    
    // Sort data by date
    const sortedData = [...data].sort((a, b) => 
      new Date(a.date).getTime() - new Date(b.date).getTime()
    );
    
    // Calculate smoke-free streak
    let currentStreak = 0;
    for (let i = sortedData.length - 1; i >= 0; i--) {
      if (sortedData[i].smoke_free) {
        currentStreak++;
      } else {
        break;
      }
    }
    setSmokeFreeStreak(currentStreak);
    
    // Calculate total smoke-free days
    const totalSmokeFreeCount = sortedData.filter(entry => entry.smoke_free).length;
    setTotalSmokeFree(totalSmokeFreeCount);
    
    // Calculate craving reduction (compare first and last week)
    if (sortedData.length > 7) {
      const firstWeek = sortedData.slice(0, 7).filter(entry => entry.craving_intensity !== undefined);
      const lastWeek = sortedData.slice(-7).filter(entry => entry.craving_intensity !== undefined);
      
      if (firstWeek.length > 0 && lastWeek.length > 0) {
        const firstWeekAvg = firstWeek.reduce((sum, entry) => sum + (entry.craving_intensity || 0), 0) / firstWeek.length;
        const lastWeekAvg = lastWeek.reduce((sum, entry) => sum + (entry.craving_intensity || 0), 0) / lastWeek.length;
        
        if (firstWeekAvg > 0) {
          const reduction = Math.round(((firstWeekAvg - lastWeekAvg) / firstWeekAvg) * 100);
          setCravingReduction(reduction);
        }
      }
    }
    
    // Calculate total money saved
    const totalSaved = sortedData.reduce((sum, entry) => sum + (entry.money_saved || 0), 0);
    setTotalMoneySaved(totalSaved);
    
    // Prepare data for progress chart
    const progressMap = new Map<string, ProgressByDayData>();
    
    sortedData.forEach(entry => {
      const formattedDate = format(new Date(entry.date), 'MMM d');
      progressMap.set(formattedDate, {
        date: formattedDate,
        smoke_free: entry.smoke_free ? 1 : 0,
        craving_intensity: entry.craving_intensity,
        money_saved: entry.money_saved
      });
    });
    
    const progressByDayArray = Array.from(progressMap.values());
    setProgressByDay(progressByDayArray);
    
    // Calculate symptom statistics
    const symptomCounts: Record<string, number> = {};
    
    sortedData.forEach(entry => {
      if (entry.symptoms && entry.symptoms.length > 0) {
        entry.symptoms.forEach(symptom => {
          symptomCounts[symptom] = (symptomCounts[symptom] || 0) + 1;
        });
      }
    });
    
    const symptomArray = Object.entries(symptomCounts)
      .map(([name, value], index) => ({
        name,
        value,
        color: COLORS[index % COLORS.length]
      }))
      .sort((a, b) => b.value - a.value);
    
    setSymptomStats(symptomArray);
  };
  
  useEffect(() => {
    fetchProgressDataForAnalytics();
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
              {entry.name === 'Money Saved' && ' $'}
            </p>
          ))}
        </div>
      );
    }
    return null;
  };
  
  // Handle data export
  const handleDataExport = () => {
    if (progressData.length === 0) {
      toast.error("No data to export");
      return;
    }
    
    try {
      // Prepare data for CSV
      const headers = "Date,Smoke Free,Craving Intensity,Money Saved,Symptoms,Notes\n";
      const csvData = progressData.map(item => {
        const date = format(new Date(item.date), 'yyyy-MM-dd');
        return `${date},${item.smoke_free ? 'Yes' : 'No'},${item.craving_intensity || ''},${item.money_saved || ''},"${item.symptoms?.join(', ') || ''}","${item.notes || ''}"`;
      }).join('\n');
      
      const blob = new Blob([headers + csvData], { type: 'text/csv' });
      const url = URL.createObjectURL(blob);
      const a = document.createElement('a');
      a.href = url;
      a.download = `progress-data-${format(new Date(), 'yyyy-MM-dd')}.csv`;
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
          <h2 className="text-2xl font-bold">Progress Analytics</h2>
          <p className="text-muted-foreground">Track your recovery milestones and achievements</p>
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
          
          <Button variant="outline" size="icon" onClick={fetchProgressDataForAnalytics} disabled={isLoading}>
            <RefreshCw className={`h-4 w-4 ${isLoading ? 'animate-spin' : ''}`} />
          </Button>
          
          <Button variant="outline" size="icon" onClick={handleDataExport} disabled={progressData.length === 0}>
            <Download className="h-4 w-4" />
          </Button>
        </div>
      </div>
      
      {/* Summary Cards */}
      <div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-4">
        <Card>
          <CardHeader className="pb-2">
            <CardTitle className="text-sm font-medium flex items-center">
              <Calendar className="h-4 w-4 mr-2 text-green-500" />
              Current Streak
            </CardTitle>
          </CardHeader>
          <CardContent>
            <div className="flex items-baseline">
              <div className="text-3xl font-bold">{smokeFreeStreak}</div>
              <div className="ml-1 text-sm text-muted-foreground">days</div>
            </div>
            <p className="text-xs text-muted-foreground mt-1">
              Consecutive smoke-free days
            </p>
          </CardContent>
        </Card>
        
        <Card>
          <CardHeader className="pb-2">
            <CardTitle className="text-sm font-medium flex items-center">
              <BarChartIcon className="h-4 w-4 mr-2 text-blue-500" />
              Total Smoke-Free
            </CardTitle>
          </CardHeader>
          <CardContent>
            <div className="flex items-baseline">
              <div className="text-3xl font-bold">{totalSmokeFree}</div>
              <div className="ml-1 text-sm text-muted-foreground">days</div>
            </div>
            <p className="text-xs text-muted-foreground mt-1">
              Total smoke-free days
            </p>
          </CardContent>
        </Card>
        
        <Card>
          <CardHeader className="pb-2">
            <CardTitle className="text-sm font-medium flex items-center">
              <ArrowDown className="h-4 w-4 mr-2 text-green-500" />
              Craving Reduction
            </CardTitle>
          </CardHeader>
          <CardContent>
            <div className="flex items-baseline">
              <div className="text-3xl font-bold">{cravingReduction}%</div>
            </div>
            <p className="text-xs text-muted-foreground mt-1">
              Reduction in craving intensity
            </p>
          </CardContent>
        </Card>
        
        <Card>
          <CardHeader className="pb-2">
            <CardTitle className="text-sm font-medium flex items-center">
              <Zap className="h-4 w-4 mr-2 text-amber-500" />
              Money Saved
            </CardTitle>
          </CardHeader>
          <CardContent>
            <div className="flex items-baseline">
              <div className="text-3xl font-bold">${totalMoneySaved}</div>
            </div>
            <p className="text-xs text-muted-foreground mt-1">
              Total money saved from not smoking
            </p>
          </CardContent>
        </Card>
      </div>
      
      {/* No Data State */}
      {progressData.length === 0 && !isLoading && (
        <Card className="w-full p-6 text-center">
          <div className="flex flex-col items-center justify-center py-10">
            <BarChartIcon className="h-12 w-12 text-muted-foreground mb-4" />
            <h3 className="text-lg font-medium mb-2">No Progress Data Available</h3>
            <p className="text-muted-foreground mb-4">
              {isOnline 
                ? "No progress data found for the selected period. Try a different date range or track your progress."
                : "You appear to be offline. Connect to the internet to fetch your data."}
            </p>
            {isOnline && (
              <Button 
                variant="outline" 
                onClick={() => window.location.href = "/app/progress"}
              >
                Track Progress
              </Button>
            )}
          </div>
        </Card>
      )}
      
      {/* Loading State */}
      {isLoading && (
        <Card className="w-full p-6 text-center">
          <div className="flex flex-col items-center justify-center py-10">
            <RefreshCw className="h-12 w-12 text-primary mb-4 animate-spin" />
            <h3 className="text-lg font-medium">Loading Analytics</h3>
            <p className="text-muted-foreground">Please wait while we fetch your data...</p>
          </div>
        </Card>
      )}
      
      {/* Charts - Only show if we have data */}
      {progressData.length > 0 && !isLoading && (
        <>
          {/* Combined Progress Chart */}
          <Card>
            <CardHeader>
              <CardTitle>Progress Over Time</CardTitle>
              <CardDescription>Smoke-free days and craving intensity</CardDescription>
            </CardHeader>
            <CardContent>
              <div className="h-80">
                <ResponsiveContainer width="100%" height="100%">
                  <ComposedChart
                    data={progressByDay}
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
                    <YAxis yAxisId="left" domain={[0, 1]} ticks={[0, 1]} />
                    <YAxis yAxisId="right" orientation="right" domain={[0, 10]} />
                    <Tooltip content={<CustomTooltip />} />
                    <Legend />
                    <Bar 
                      yAxisId="left" 
                      dataKey="smoke_free" 
                      name="Smoke Free" 
                      fill="#4ade80" 
                      barSize={20}
                    />
                    <Line
                      yAxisId="right"
                      type="monotone"
                      dataKey="craving_intensity"
                      name="Craving Intensity"
                      stroke="#f87171"
                      dot={{ fill: '#f87171', stroke: '#f87171', strokeWidth: 2, r: 4 }}
                    />
                  </ComposedChart>
                </ResponsiveContainer>
              </div>
            </CardContent>
          </Card>
          
          <div className="grid gap-4 md:grid-cols-2">
            {/* Withdrawal Symptoms */}
            <Card>
              <CardHeader>
                <CardTitle>Withdrawal Symptoms</CardTitle>
                <CardDescription>Frequency of reported symptoms</CardDescription>
              </CardHeader>
              <CardContent>
                <div className="h-72">
                  {symptomStats.length > 0 ? (
                    <ResponsiveContainer width="100%" height="100%">
                      <BarChart
                        data={symptomStats}
                        layout="vertical"
                        margin={{ top: 5, right: 30, left: 80, bottom: 5 }}
                      >
                        <CartesianGrid strokeDasharray="3 3" opacity={0.2} />
                        <XAxis type="number" />
                        <YAxis dataKey="name" type="category" width={80} tick={{ fontSize: 12 }} />
                        <Tooltip />
                        <Bar dataKey="value" name="Frequency">
                          {symptomStats.map((entry, index) => (
                            <Cell key={`cell-${index}`} fill={entry.color} />
                          ))}
                        </Bar>
                      </BarChart>
                    </ResponsiveContainer>
                  ) : (
                    <div className="flex flex-col items-center justify-center h-full">
                      <p className="text-muted-foreground">No symptom data recorded</p>
                    </div>
                  )}
                </div>
              </CardContent>
            </Card>
            
            {/* Money Saved Trend */}
            <Card>
              <CardHeader>
                <CardTitle>Money Saved</CardTitle>
                <CardDescription>Cumulative savings over time</CardDescription>
              </CardHeader>
              <CardContent>
                <div className="h-72">
                  <ResponsiveContainer width="100%" height="100%">
                    <AreaChart
                      data={progressByDay}
                      margin={{ top: 10, right: 30, left: 0, bottom: 0 }}
                    >
                      <CartesianGrid strokeDasharray="3 3" opacity={0.2} />
                      <XAxis dataKey="date" />
                      <YAxis />
                      <Tooltip content={<CustomTooltip />} />
                      <Area 
                        type="monotone" 
                        dataKey="money_saved" 
                        name="Money Saved" 
                        stroke="#f59e0b" 
                        fill="#f59e0b" 
                        fillOpacity={0.3}
                      />
                    </AreaChart>
                  </ResponsiveContainer>
                </div>
              </CardContent>
            </Card>
          </div>
          
          {/* Symptom Recovery Timeline */}
          <Card>
            <CardHeader>
              <CardTitle>Recovery Timeline</CardTitle>
              <CardDescription>Typical timeline for withdrawal symptoms</CardDescription>
            </CardHeader>
            <CardContent>
              <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-3">
                {Object.entries(SYMPTOM_INFO).map(([symptom, info]) => (
                  <div key={symptom} className="rounded-lg border p-4">
                    <h3 className="font-medium mb-1 capitalize">{symptom.replace('_', ' ')}</h3>
                    <p className="text-sm text-muted-foreground mb-2">{info.description}</p>
                    <div className="flex items-center text-sm">
                      <span className="font-medium">Typical recovery:</span>
                      <span className="ml-2 text-green-500">{info.typical_recovery}</span>
                    </div>
                  </div>
                ))}
              </div>
            </CardContent>
          </Card>
        </>
      )}
    </div>
  );
};

export default ProgressAnalytics; 