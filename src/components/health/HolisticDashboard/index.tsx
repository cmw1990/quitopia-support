import React, { useState, useEffect } from 'react';
import { Session } from '@supabase/supabase-js';
import { useQuery } from '@tanstack/react-query';
import { 
  Card, 
  CardContent, 
  CardDescription, 
  CardHeader, 
  CardTitle,
  Tabs,
  TabsContent,
  TabsList,
  TabsTrigger
} from '../../ui';
import { MoodTracker } from '../MoodTracker';
import { EnergyTracker } from '../EnergyTracker';
import { FocusTracker } from '../FocusTracker';
import { 
  getMoodLogs, 
  getEnergyLogs, 
  getFocusLogs, 
  getCravingLogs,
  getCurrentSession,
  MoodLog as ApiMoodLog,
  EnergyLog as ApiEnergyLog,
  FocusLog as ApiFocusLog,
  CravingLog
} from '@/api/apiCompatibility';
import { 
  AreaChart, 
  Area, 
  LineChart, 
  Line, 
  XAxis, 
  YAxis, 
  CartesianGrid, 
  Tooltip as RechartsTooltip, 
  Legend, 
  ResponsiveContainer,
  BarChart,
  Bar,
  PieChart,
  Pie,
  Cell,
  Radar,
  RadarChart,
  PolarGrid,
  PolarAngleAxis,
  PolarRadiusAxis,
  ScatterChart,
  Scatter,
  ZAxis,
  ReferenceLine,
  Label as RechartsLabel
} from 'recharts';
import { 
  Brain, 
  Battery, 
  Smile, 
  Zap, 
  Activity, 
  BarChart as BarChartIcon, 
  PieChart as PieChartIcon,
  Calendar,
  Clock,
  Lightbulb,
  AreaChart as AreaChartIcon,
  AlertTriangle,
  Info,
  MoonIcon,
  BrainCircuit,
  CalendarDays,
  Cigarette,
  TrendingDown,
  Target,
  Shield,
  Clock4,
  BadgeAlert,
  CircleDashed,
  FlaskConical
} from 'lucide-react';
import { format, subDays, isToday, isYesterday, startOfWeek, endOfWeek, addDays, parseISO } from 'date-fns';
import { cn } from '@/lib/utils';
import { Loader2 } from 'lucide-react';
import { 
  RadioGroup, 
  RadioGroupItem 
} from '@/components/ui/radio-group';
import { Label } from '@/components/ui/label';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { Skeleton } from '@/components/ui/skeleton';
import { hapticFeedback } from '@/utils/hapticFeedback';

interface HolisticDashboardProps {
  session: Session | null;
  quitDate?: string;
  className?: string;
}

// Types for different health metrics
interface MoodLog extends ApiMoodLog {}
interface EnergyLog extends ApiEnergyLog {}
interface FocusLog extends ApiFocusLog {}

// Combined metrics for holistic view
interface DailyMetrics {
  date: string;
  formattedDate: string;
  mood: number | null;
  energy: number | null;
  focus: number | null;
  moodCount: number;
  energyCount: number;
  focusCount: number;
  cravingRelated: number;
  physicalActivity: boolean;
  averageSleep: number | null;
  cravingIntensity: number | null;
  cravingCount: number;
  cravingResistSuccessRate: number | null;
}

// Add new interface for prediction
interface CravingPrediction {
  timeOfDay: string;
  riskLevel: number;
  primaryTrigger: string;
  secondaryTrigger: string | null;
  recommendedAction: string;
}

// Enhance DailyMetrics interface with craving data
interface EnhancedDailyMetrics extends DailyMetrics {
  cravingIntensity: number | null;
  cravingCount: number;
  cravingResistSuccessRate: number | null;
}

// Type for chart formatters
type TickFormatter = (value: any) => string;

// Define a fixed color palette for consistency
const COLORS = ['#0088FE', '#00C49F', '#FFBB28', '#FF8042', '#8884d8'];

// Helper functions for formatting chart values
const formatScore = (value: number | null | undefined): string => {
  if (value === null || value === undefined) return 'N/A';
  return value.toFixed(1);
};

const formatPercentage = (value: number | null | undefined): string => {
  if (value === null || value === undefined) return 'N/A';
  return `${Math.round(value)}%`;
};

const formatDate: TickFormatter = (dateString: string | null | undefined) => {
  if (!dateString) return '';
  
  try {
    const date = new Date(dateString);
    if (isToday(date)) return 'Today';
    if (isYesterday(date)) return 'Yesterday';
    return format(date, 'MMM d');
  } catch (error) {
    return 'Invalid Date';
  }
};

export const HolisticDashboard: React.FC<HolisticDashboardProps> = ({
  session,
  quitDate,
  className = ''
}): JSX.Element => {
  const [currentTab, setCurrentTab] = useState('dashboard');
  const [timeRange, setTimeRange] = useState<'week' | 'month'>('week');
  
  // State for advanced analytics
  const [showPredictions, setShowPredictions] = useState<boolean>(true);
  const [selectedTriggerFilter, setSelectedTriggerFilter] = useState<string | null>(null);
  const [cravingPredictions, setCravingPredictions] = useState<CravingPrediction[]>([]);
  const [dailyMetricsState, setDailyMetricsState] = useState<EnhancedDailyMetrics[]>([]);
  const [loading, setLoading] = useState<boolean>(true);
  
  // Query mood logs using REST API approach
  const { data: moodLogs, isLoading: moodLoading } = useQuery({
    queryKey: ['mood-logs', timeRange],
    queryFn: async () => {
      if (!session?.user?.id) return [];
      
      const now = new Date();
      const endDate = format(now, 'yyyy-MM-dd');
      const startDate = timeRange === 'week' 
        ? format(subDays(now, 7), 'yyyy-MM-dd')
        : format(subDays(now, 30), 'yyyy-MM-dd');
      
      return await getMoodLogs(session.user.id, startDate, endDate, session);
    },
    enabled: !!session?.user?.id
  });

  // Query energy logs using REST API approach
  const { data: energyLogs, isLoading: energyLoading } = useQuery({
    queryKey: ['energy-logs', timeRange],
    queryFn: async () => {
      if (!session?.user?.id) return [];
      
      const now = new Date();
      const endDate = format(now, 'yyyy-MM-dd');
      const startDate = timeRange === 'week' 
        ? format(subDays(now, 7), 'yyyy-MM-dd')
        : format(subDays(now, 30), 'yyyy-MM-dd');
      
      return await getEnergyLogs(session.user.id, startDate, endDate, session);
    },
    enabled: !!session?.user?.id
  });

  // Query focus logs using REST API approach
  const { data: focusLogs, isLoading: focusLoading } = useQuery({
    queryKey: ['focus-logs', timeRange],
    queryFn: async () => {
      if (!session?.user?.id) return [];
      
      const now = new Date();
      const endDate = format(now, 'yyyy-MM-dd');
      const startDate = timeRange === 'week' 
        ? format(subDays(now, 7), 'yyyy-MM-dd')
        : format(subDays(now, 30), 'yyyy-MM-dd');
      
      return await getFocusLogs(session.user.id, startDate, endDate, session);
    },
    enabled: !!session?.user?.id
  });

  // Query craving logs using REST API approach
  const { data: cravingLogs, isLoading: cravingLoading } = useQuery({
    queryKey: ['craving-logs', timeRange],
    queryFn: async () => {
      if (!session?.user?.id) return [];
      
      const now = new Date();
      const endDate = format(now, 'yyyy-MM-dd');
      const startDate = timeRange === 'week' 
        ? format(subDays(now, 7), 'yyyy-MM-dd')
        : format(subDays(now, 30), 'yyyy-MM-dd');
      
      return await getCravingLogs(session.user.id, startDate, endDate, session);
    },
    enabled: !!session?.user?.id
  });

  // Effect to combine all health metrics into daily metrics
  useEffect(() => {
    if (moodLoading || energyLoading || focusLoading || cravingLoading) {
      setLoading(true);
      return;
    }
    
    const combinedMetrics = processHealthData(
      moodLogs || [], 
      energyLogs || [], 
      focusLogs || [], 
      cravingLogs || []
    );
    
    setDailyMetricsState(combinedMetrics);
    generateCravingPredictions(combinedMetrics, cravingLogs || []);
    setLoading(false);
  }, [moodLogs, energyLogs, focusLogs, cravingLogs, moodLoading, energyLoading, focusLoading, cravingLoading]);

  // Process health data and combine into daily metrics for visualization
  const processHealthData = (
    moodData: MoodLog[],
    energyData: EnergyLog[],
    focusData: FocusLog[],
    cravingData: CravingLog[]
  ): EnhancedDailyMetrics[] => {
    // Create a date range for the selected time period
    const endDate = new Date();
    const startDate = timeRange === 'week' 
      ? subDays(endDate, 7) 
      : subDays(endDate, 30);
    
    // Generate all dates in the range
    const dates: Date[] = [];
    let currentDate = startDate;
    
    while (currentDate <= endDate) {
      dates.push(new Date(currentDate));
      currentDate = addDays(currentDate, 1);
    }
    
    // Process data for each date
    return dates.map(date => {
      const dateStr = format(date, 'yyyy-MM-dd');
      
      // Find mood logs for this date
      const dayMoods = moodData.filter(log => {
        try {
          const logDate = format(parseISO(log.timestamp), 'yyyy-MM-dd');
          return logDate === dateStr;
        } catch (e) {
          return false;
        }
      });
      
      // Find energy logs for this date
      const dayEnergy = energyData.filter(log => {
        try {
          const logDate = format(parseISO(log.timestamp), 'yyyy-MM-dd');
          return logDate === dateStr;
        } catch (e) {
          return false;
        }
      });
      
      // Find focus logs for this date
      const dayFocus = focusData.filter(log => {
        try {
          const logDate = format(parseISO(log.timestamp), 'yyyy-MM-dd');
          return logDate === dateStr;
        } catch (e) {
          return false;
        }
      });
      
      // Find craving logs for this date
      const dayCravings = cravingData.filter(log => {
        try {
          const logDate = format(parseISO(log.timestamp), 'yyyy-MM-dd');
          return logDate === dateStr;
        } catch (e) {
          return false;
        }
      });
      
      // Calculate average mood
      const moodAvg = dayMoods.length > 0
        ? dayMoods.reduce((sum, log) => sum + (log.mood_score || 0), 0) / dayMoods.length
        : null;
      
      // Calculate average energy
      const energyAvg = dayEnergy.length > 0
        ? dayEnergy.reduce((sum, log) => sum + (log.energy_level || 0), 0) / dayEnergy.length
        : null;
      
      // Calculate average focus
      const focusAvg = dayFocus.length > 0
        ? dayFocus.reduce((sum, log) => sum + (log.focus_level || 0), 0) / dayFocus.length
        : null;
      
      // Calculate average sleep from energy logs
      const sleepAvg = dayEnergy.length > 0
        ? dayEnergy.reduce((sum, log) => sum + (log.sleep_hours || 0), 0) / dayEnergy.length
        : null;
      
      // Calculate physical activity (if any energy log has physical_activity = true)
      const hasPhysicalActivity = dayEnergy.some(log => log.physical_activity);
      
      // Calculate craving metrics
      const cravingIntensityAvg = dayCravings.length > 0
        ? dayCravings.reduce((sum, log) => sum + (log.intensity || 0), 0) / dayCravings.length
        : null;
      
      const successfulResists = dayCravings.filter(log => log.succeeded).length;
      const resistSuccessRate = dayCravings.length > 0
        ? (successfulResists / dayCravings.length) * 100
        : null;
      
      // Calculate craving related mood entries
      const cravingRelatedMoods = dayMoods.filter(log => log.related_to_cravings).length;
      
      return {
        date: dateStr,
        formattedDate: format(date, 'EEE, MMM d'),
        mood: moodAvg,
        energy: energyAvg,
        focus: focusAvg,
        moodCount: dayMoods.length,
        energyCount: dayEnergy.length,
        focusCount: dayFocus.length,
        cravingRelated: cravingRelatedMoods,
        physicalActivity: hasPhysicalActivity,
        averageSleep: sleepAvg,
        cravingIntensity: cravingIntensityAvg,
        cravingCount: dayCravings.length,
        cravingResistSuccessRate: resistSuccessRate
      };
    });
  };

  // Generate craving predictions based on historical data
  const generateCravingPredictions = (metrics: EnhancedDailyMetrics[], cravings: CravingLog[]) => {
    // This would ideally use a more sophisticated model
    // For now, we'll create a simple model based on time patterns
    
    // Group cravings by hour of day
    const cravingsByHour: Record<number, { count: number, intensity: number, triggers: Record<string, number> }> = {};
    
    cravings.forEach(craving => {
      try {
        const cravingDate = parseISO(craving.timestamp);
        const hour = cravingDate.getHours();
        
        if (!cravingsByHour[hour]) {
          cravingsByHour[hour] = { count: 0, intensity: 0, triggers: {} };
        }
        
        cravingsByHour[hour].count += 1;
        cravingsByHour[hour].intensity += craving.intensity || 0;
        
        if (craving.trigger) {
          if (!cravingsByHour[hour].triggers[craving.trigger]) {
            cravingsByHour[hour].triggers[craving.trigger] = 0;
          }
          cravingsByHour[hour].triggers[craving.trigger] += 1;
        }
      } catch (e) {
        // Skip invalid dates
      }
    });
    
    // Find top risk hours
    const riskHours = Object.entries(cravingsByHour)
      .map(([hour, data]) => ({
        hour: parseInt(hour),
        count: data.count,
        avgIntensity: data.count > 0 ? data.intensity / data.count : 0,
        topTriggers: Object.entries(data.triggers)
          .sort((a, b) => b[1] - a[1])
          .map(([trigger]) => trigger)
      }))
      .sort((a, b) => {
        // Sort by a weighted score of count and intensity
        const scoreA = a.count * (1 + a.avgIntensity / 10);
        const scoreB = b.count * (1 + b.avgIntensity / 10);
        return scoreB - scoreA;
      })
      .slice(0, 3); // Top 3 risk hours
      
    // Create predictions
    const predictions: CravingPrediction[] = riskHours.map(risk => {
      const timeStr = `${risk.hour % 12 || 12}${risk.hour < 12 ? 'AM' : 'PM'}`;
      const primaryTrigger = risk.topTriggers[0] || 'Unknown';
      const secondaryTrigger = risk.topTriggers[1] || null;
      
      // Choose recommended action based on the primary trigger
      let action = "Practice deep breathing";
      if (primaryTrigger === 'Stress') action = "Try a 2-minute meditation";
      if (primaryTrigger === 'Boredom') action = "Engage in a quick activity";
      if (primaryTrigger === 'Social') action = "Have a sugar-free mint ready";
      if (primaryTrigger === 'After Meal') action = "Take a short walk";
      
      return {
        timeOfDay: timeStr,
        riskLevel: Math.min(100, Math.round((risk.avgIntensity / 10) * 100)),
        primaryTrigger,
        secondaryTrigger,
        recommendedAction: action
      };
    });
    
    setCravingPredictions(predictions);
  };

  const handleTabChange = (value: string) => {
    setCurrentTab(value);
    hapticFeedback.light(); // Add haptic feedback for tab changes
  };

  const handleTimeRangeChange = (value: 'week' | 'month') => {
    setTimeRange(value);
    hapticFeedback.light(); // Add haptic feedback for range changes
  };

  const togglePredictions = () => {
    setShowPredictions(prev => !prev);
    hapticFeedback.medium(); // Add haptic feedback for toggling predictions
  };

  // Calculate averages safely with null handling
  const calculateAverage = (values: Array<number | null | undefined>): string => {
    const validValues = values.filter((v): v is number => v !== null && v !== undefined);
    if (validValues.length === 0) return 'N/A';
    return (validValues.reduce((sum, v) => sum + v, 0) / validValues.length).toFixed(1);
  };

  // Render loading state
  if (loading) {
    return (
      <div className={cn("holistic-dashboard p-1", className)}>
        <Skeleton className="h-[300px] w-full rounded-xl" />
      </div>
    );
  }

  return (
    <div className={cn("holistic-dashboard", className)}>
      <Tabs defaultValue="dashboard" value={currentTab} onValueChange={setCurrentTab}>
        <TabsList className="grid grid-cols-3 mb-4">
          <TabsTrigger value="dashboard" onClick={() => hapticFeedback.light()}>
            <BarChartIcon className="w-4 h-4 mr-2" />
            <span className="hidden sm:inline">Dashboard</span>
          </TabsTrigger>
          <TabsTrigger value="trackers" onClick={() => hapticFeedback.light()}>
            <Activity className="w-4 h-4 mr-2" />
            <span className="hidden sm:inline">Trackers</span>
          </TabsTrigger>
          <TabsTrigger value="insights" onClick={() => hapticFeedback.light()}>
            <Lightbulb className="w-4 h-4 mr-2" />
            <span className="hidden sm:inline">Insights</span>
          </TabsTrigger>
        </TabsList>

        <TabsContent value="dashboard">
          <Card>
            <CardHeader>
              <div className="flex justify-between items-center">
                <CardTitle>Holistic Health Dashboard</CardTitle>
                <RadioGroup 
                  value={timeRange} 
                  onValueChange={(value) => setTimeRange(value as 'week' | 'month')}
                  className="flex space-x-1"
                >
                  <div className="flex items-center">
                    <RadioGroupItem value="week" id="week" className="sr-only" />
                    <Label
                      htmlFor="week"
                      className={`px-2 py-1 text-xs rounded cursor-pointer ${
                        timeRange === 'week' ? 'bg-primary text-primary-foreground' : 'bg-muted'
                      }`}
                    >
                      Week
                    </Label>
                  </div>
                  <div className="flex items-center">
                    <RadioGroupItem value="month" id="month" className="sr-only" />
                    <Label
                      htmlFor="month"
                      className={`px-2 py-1 text-xs rounded cursor-pointer ${
                        timeRange === 'month' ? 'bg-primary text-primary-foreground' : 'bg-muted'
                      }`}
                    >
                      Month
                    </Label>
                  </div>
                </RadioGroup>
              </div>
              <CardDescription>
                Track your health metrics, cravings, and progress over time
              </CardDescription>
            </CardHeader>
            <CardContent>
              {loading ? (
                <div className="p-6 flex flex-col items-center justify-center">
                  <Loader2 className="h-8 w-8 animate-spin text-muted-foreground" />
                  <p className="mt-2 text-sm text-muted-foreground">Loading health data...</p>
                </div>
              ) : dailyMetricsState.length === 0 ? (
                <div className="p-6 text-center">
                  <p className="text-muted-foreground">No health data available for this period.</p>
                  <p className="text-sm mt-1">Try tracking your mood, energy, and focus to see insights here.</p>
                </div>
              ) : (
                <div className="space-y-6">
                  {/* Mood, Energy, Focus Chart */}
                  <div>
                    <h3 className="text-lg font-medium mb-2">Wellness Metrics</h3>
                    <div className="h-[250px]">
                      <ResponsiveContainer width="100%" height="100%">
                        <LineChart
                          data={dailyMetricsState}
                          margin={{ top: 5, right: 30, left: 0, bottom: 5 }}
                        >
                          <CartesianGrid strokeDasharray="3 3" opacity={0.2} />
                          <XAxis 
                            dataKey="date" 
                            tickFormatter={formatDate} 
                            tick={{ fontSize: 12 }}
                          />
                          <YAxis 
                            domain={[0, 10]} 
                            tick={{ fontSize: 12 }}
                            tickCount={6} 
                          />
                          <RechartsTooltip 
                            formatter={(value: any) => {
                              const numValue = value as number;
                              return [
                                numValue !== null && !isNaN(numValue) ? numValue.toFixed(1) : 'N/A',
                                '' // Category label
                              ];
                            }}
                            labelFormatter={(label) => formatDate(label)}
                          />
                          <Legend 
                            verticalAlign="top" 
                            height={36} 
                            iconType="circle"
                            iconSize={8}
                          />
                          <Line 
                            type="monotone" 
                            name="Mood" 
                            dataKey="mood" 
                            stroke={COLORS[0]} 
                            strokeWidth={2}
                            activeDot={{ r: 6 }}
                            connectNulls
                          />
                          <Line 
                            type="monotone" 
                            name="Energy" 
                            dataKey="energy" 
                            stroke={COLORS[1]} 
                            strokeWidth={2}
                            activeDot={{ r: 6 }}
                            connectNulls
                          />
                          <Line 
                            type="monotone" 
                            name="Focus" 
                            dataKey="focus" 
                            stroke={COLORS[2]} 
                            strokeWidth={2}
                            activeDot={{ r: 6 }}
                            connectNulls
                          />
                        </LineChart>
                      </ResponsiveContainer>
                    </div>
                  </div>

                  {/* Craving Metrics Chart */}
                  <div>
                    <h3 className="text-lg font-medium mb-2">Craving Metrics</h3>
                    <div className="h-[250px]">
                      <ResponsiveContainer width="100%" height="100%">
                        <BarChart
                          data={dailyMetricsState}
                          margin={{ top: 5, right: 30, left: 0, bottom: 5 }}
                          barGap={0}
                          barCategoryGap="15%"
                        >
                          <CartesianGrid strokeDasharray="3 3" opacity={0.2} />
                          <XAxis 
                            dataKey="date" 
                            tickFormatter={formatDate} 
                            tick={{ fontSize: 12 }}
                          />
                          <YAxis 
                            yAxisId="left"
                            orientation="left"
                            tickCount={6}
                            domain={[0, 10]}
                            tick={{ fontSize: 12 }}
                          />
                          <YAxis 
                            yAxisId="right"
                            orientation="right"
                            tickFormatter={(value) => `${value}%`}
                            domain={[0, 100]}
                            tick={{ fontSize: 12 }}
                          />
                          <RechartsTooltip 
                            content={({ active, payload, label }) => {
                              if (active && payload && payload.length) {
                                return (
                                  <div className="bg-white shadow-md border border-gray-200 rounded-md p-3 text-sm">
                                    <p className="mb-1 font-medium">{formatDate(label)}</p>
                                    <div className="space-y-1">
                                      {payload.map((entry: any, index: number) => {
                                        const { name, value } = entry;
                                        // Format based on the metric type
                                        if (name === 'Craving Count') {
                                          return <div key={index}>{value} ({name})</div>;
                                        }
                                        if (name === 'Success Rate') {
                                          return <div key={index}>{value}% ({name})</div>;
                                        }
                                        if (name === 'Intensity') {
                                          const numValue = value as number;
                                          return <div key={index}>{numValue !== null && !isNaN(numValue) ? numValue.toFixed(1) : 'N/A'} ({name})</div>;
                                        }
                                        return <div key={index}>{value} ({name})</div>;
                                      })}
                                    </div>
                                  </div>
                                );
                              }
                              return null;
                            }}
                            labelFormatter={(label) => formatDate(label)}
                          />
                          <Legend 
                            verticalAlign="top" 
                            height={36}
                            iconType="circle"
                            iconSize={8}
                          />
                          <Bar 
                            name="Intensity" 
                            dataKey="cravingIntensity" 
                            yAxisId="left"
                            fill={COLORS[3]}
                            radius={[2, 2, 0, 0]}
                          />
                          <Bar 
                            name="Craving Count" 
                            dataKey="cravingCount" 
                            yAxisId="left"
                            fill={COLORS[4]}
                            radius={[2, 2, 0, 0]}
                          />
                          <Line 
                            name="Success Rate" 
                            type="monotone"
                            dataKey="cravingResistSuccessRate" 
                            yAxisId="right"
                            stroke="#22c55e"
                            strokeWidth={2}
                            dot={{ r: 4 }}
                            activeDot={{ r: 6 }}
                            connectNulls
                          />
                        </BarChart>
                      </ResponsiveContainer>
                    </div>
                  </div>
                  {/* Rest of the component */}
                </div>
              )}
            </CardContent>
          </Card>
        </TabsContent>
        {/* Rest of the tabs */}
      </Tabs>
    </div>
  );
}; 