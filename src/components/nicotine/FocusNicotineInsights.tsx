import React, { useState, useEffect } from "react";
import { Session } from "@supabase/supabase-js";
import {
  Card,
  CardContent,
  CardDescription,
  CardFooter,
  CardHeader,
  CardTitle,
  Tabs,
  TabsContent,
  TabsList,
  TabsTrigger,
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
  Button,
} from "../ui/index";
import {
  LineChart,
  Line,
  BarChart,
  Bar,
  ScatterChart,
  Scatter,
  XAxis,
  YAxis,
  CartesianGrid,
  Tooltip,
  Legend,
  ResponsiveContainer,
  Cell,
} from "recharts";
import {
  Brain,
  Clock,
  Calendar,
  Zap,
  TrendingDown,
  TrendingUp,
  BarChart2,
  LineChart as LineChartIcon,
  Lightbulb,
  AlertTriangle,
  Info,
  Download,
} from "lucide-react";
import { toast } from "sonner";
import { useSession } from "@supabase/auth-helpers-react";
import {
  getFocusImpactData,
  getNicotineConsumptionLogs,
  NicotineLog,
} from "../../api/nicotineTracking";

interface FocusNicotineInsightsProps {
  className?: string;
}

// Helper function to format dates for charts
const formatDate = (dateString: string) => {
  const date = new Date(dateString);
  return `${date.getMonth() + 1}/${date.getDate()}`;
};

export function FocusNicotineInsights({ className }: FocusNicotineInsightsProps) {
  const session = useSession();
  const [timeRange, setTimeRange] = useState<"7" | "30" | "90">("30");
  const [activeTab, setActiveTab] = useState<string>("correlation");
  const [nicotineLogs, setNicotineLogs] = useState<NicotineLog[]>([]);
  const [focusData, setFocusData] = useState<any[]>([]);
  const [correlationData, setCorrelationData] = useState<any[]>([]);
  const [loading, setLoading] = useState<boolean>(false);
  const [insights, setInsights] = useState<string[]>([]);
  
  useEffect(() => {
    if (session) {
      fetchData();
    }
  }, [session, timeRange]);
  
  const fetchData = async () => {
    if (!session) return;
    
    setLoading(true);
    try {
      // Fetch nicotine logs
      const nicotineData = await getNicotineConsumptionLogs(session, `${timeRange}days`);
      setNicotineLogs(nicotineData);
      
      // Fetch focus impact data
      const focusImpactData = await getFocusImpactData(session, parseInt(timeRange));
      setFocusData(focusImpactData);
      
      // Process data for correlation analysis
      processCorrelationData(nicotineData, focusImpactData);
      
      // Generate insights
      generateInsights(nicotineData, focusImpactData);
    } catch (error) {
      console.error("Error fetching data:", error);
      toast.error("Failed to load nicotine and focus data");
    } finally {
      setLoading(false);
    }
  };
  
  const processCorrelationData = (nicotineData: NicotineLog[], focusData: any[]) => {
    // Group nicotine consumption by day
    const nicotineByDay: Record<string, number> = {};
    nicotineData.forEach(log => {
      const date = log.consumption_date.split('T')[0];
      nicotineByDay[date] = (nicotineByDay[date] || 0) + log.quantity;
    });
    
    // Group focus data by day
    const focusByDay: Record<string, { level: number, duration: number }> = {};
    focusData.forEach(item => {
      const date = item.timestamp.split('T')[0];
      if (!focusByDay[date]) {
        focusByDay[date] = { level: 0, duration: 0 };
      }
      focusByDay[date].level += item.focus_level || 0;
      focusByDay[date].duration += item.focus_duration_minutes || 0;
    });
    
    // Calculate average focus level per day
    Object.keys(focusByDay).forEach(date => {
      const focusEntries = focusData.filter(item => item.timestamp.split('T')[0] === date).length;
      if (focusEntries > 0) {
        focusByDay[date].level = focusByDay[date].level / focusEntries;
      }
    });
    
    // Combine the data for correlation
    const combined = Object.keys(nicotineByDay)
      .filter(date => focusByDay[date])
      .map(date => ({
        date,
        nicotineAmount: nicotineByDay[date],
        focusLevel: focusByDay[date].level,
        focusDuration: focusByDay[date].duration,
        formattedDate: formatDate(date),
      }));
    
    setCorrelationData(combined);
  };
  
  const generateInsights = (nicotineData: NicotineLog[], focusData: any[]) => {
    if (nicotineData.length === 0 || focusData.length === 0) {
      setInsights(["Not enough data to generate insights. Continue tracking your nicotine consumption and focus sessions."]);
      return;
    }
    
    const newInsights: string[] = [];
    
    // Calculate average focus level on days with and without nicotine
    const nicotineDays = new Set(nicotineData.map(log => log.consumption_date.split('T')[0]));
    
    const focusWithNicotine = focusData
      .filter(item => nicotineDays.has(item.timestamp.split('T')[0]))
      .map(item => item.focus_level || 0);
      
    const focusWithoutNicotine = focusData
      .filter(item => !nicotineDays.has(item.timestamp.split('T')[0]))
      .map(item => item.focus_level || 0);
    
    if (focusWithNicotine.length > 0 && focusWithoutNicotine.length > 0) {
      const avgWithNicotine = focusWithNicotine.reduce((a, b) => a + b, 0) / focusWithNicotine.length;
      const avgWithoutNicotine = focusWithoutNicotine.reduce((a, b) => a + b, 0) / focusWithoutNicotine.length;
      
      const percentDifference = Math.round(((avgWithoutNicotine - avgWithNicotine) / avgWithNicotine) * 100);
      
      if (percentDifference > 0) {
        newInsights.push(`Your focus levels are approximately ${percentDifference}% higher on days without nicotine consumption.`);
      } else if (percentDifference < 0) {
        newInsights.push(`Your focus levels are approximately ${Math.abs(percentDifference)}% higher on days with nicotine consumption.`);
      } else {
        newInsights.push("Your focus levels show no significant difference between days with and without nicotine consumption.");
      }
    }
    
    // Analyze focus duration patterns
    const durationWithNicotine = focusData
      .filter(item => nicotineDays.has(item.timestamp.split('T')[0]))
      .map(item => item.focus_duration_minutes || 0);
      
    const durationWithoutNicotine = focusData
      .filter(item => !nicotineDays.has(item.timestamp.split('T')[0]))
      .map(item => item.focus_duration_minutes || 0);
    
    if (durationWithNicotine.length > 0 && durationWithoutNicotine.length > 0) {
      const avgDurationWithNicotine = durationWithNicotine.reduce((a, b) => a + b, 0) / durationWithNicotine.length;
      const avgDurationWithoutNicotine = durationWithoutNicotine.reduce((a, b) => a + b, 0) / durationWithoutNicotine.length;
      
      const minutesDifference = Math.round(avgDurationWithoutNicotine - avgDurationWithNicotine);
      
      if (minutesDifference > 0) {
        newInsights.push(`Your focus sessions last ${minutesDifference} minutes longer on average when you don't consume nicotine.`);
      } else if (minutesDifference < 0) {
        newInsights.push(`Your focus sessions last ${Math.abs(minutesDifference)} minutes longer on average when you consume nicotine.`);
      }
    }
    
    // Identify optimal timing patterns
    if (correlationData.length > 0) {
      const sortedByFocusLevel = [...correlationData].sort((a, b) => b.focusLevel - a.focusLevel);
      const topFocusDays = sortedByFocusLevel.slice(0, 3);
      
      if (topFocusDays.length > 0) {
        const avgNicotineOnTopDays = topFocusDays.reduce((a, b) => a + b.nicotineAmount, 0) / topFocusDays.length;
        const overallAvgNicotine = correlationData.reduce((a, b) => a + b.nicotineAmount, 0) / correlationData.length;
        
        if (avgNicotineOnTopDays < overallAvgNicotine) {
          newInsights.push("Your best focus days tend to occur when you consume less nicotine than your average.");
        } else if (avgNicotineOnTopDays > overallAvgNicotine) {
          newInsights.push("Your best focus days tend to occur when you consume more nicotine than your average.");
        }
      }
    }
    
    // Add general insight if we have few insights
    if (newInsights.length < 2) {
      newInsights.push("Continue tracking both your nicotine consumption and focus sessions to receive more personalized insights.");
    }
    
    setInsights(newInsights);
  };
  
  const prepareTimelineData = () => {
    // Prepare data for the timeline chart showing nicotine consumption and focus levels
    const nicotineByDay: Record<string, number> = {};
    nicotineLogs.forEach(log => {
      const date = log.consumption_date.split('T')[0];
      nicotineByDay[date] = (nicotineByDay[date] || 0) + log.quantity;
    });
    
    const focusByDay: Record<string, number> = {};
    focusData.forEach(item => {
      const date = item.timestamp.split('T')[0];
      if (!focusByDay[date]) {
        focusByDay[date] = 0;
      }
      focusByDay[date] += item.focus_level || 0;
    });
    
    const focusCountByDay: Record<string, number> = {};
    focusData.forEach(item => {
      const date = item.timestamp.split('T')[0];
      focusCountByDay[date] = (focusCountByDay[date] || 0) + 1;
    });
    
    // Calculate average focus level per day
    Object.keys(focusByDay).forEach(date => {
      if (focusCountByDay[date] > 0) {
        focusByDay[date] = focusByDay[date] / focusCountByDay[date];
      }
    });
    
    // Combine all unique dates
    const allDates = new Set([
      ...Object.keys(nicotineByDay),
      ...Object.keys(focusByDay),
    ]);
    
    // Create the timeline data array
    const timelineData = Array.from(allDates).map(date => ({
      date,
      nicotine: nicotineByDay[date] || 0,
      focus: focusByDay[date] || 0,
      formattedDate: formatDate(date),
    })).sort((a, b) => a.date.localeCompare(b.date));
    
    return timelineData;
  };
  
  return (
    <Card className={className}>
      <CardHeader>
        <CardTitle className="text-2xl font-bold text-emerald-800 dark:text-emerald-400 flex items-center gap-2">
          <Brain className="h-6 w-6" />
          Focus & Nicotine Insights
        </CardTitle>
        <CardDescription>
          Understand how nicotine consumption affects your focus and productivity
        </CardDescription>
        <div className="flex justify-between items-center">
          <Tabs value={activeTab} onValueChange={setActiveTab} className="w-full">
            <TabsList>
              <TabsTrigger value="correlation">
                <TrendingDown className="mr-2 h-4 w-4" />
                Correlation
              </TabsTrigger>
              <TabsTrigger value="timeline">
                <LineChartIcon className="mr-2 h-4 w-4" />
                Timeline
              </TabsTrigger>
              <TabsTrigger value="insights">
                <Lightbulb className="mr-2 h-4 w-4" />
                Insights
              </TabsTrigger>
            </TabsList>
          </Tabs>
          
          <Select value={timeRange} onValueChange={(value: "7" | "30" | "90") => setTimeRange(value)}>
            <SelectTrigger className="w-[140px]">
              <SelectValue placeholder="Time Range" />
            </SelectTrigger>
            <SelectContent>
              <SelectItem value="7">Last 7 Days</SelectItem>
              <SelectItem value="30">Last 30 Days</SelectItem>
              <SelectItem value="90">Last 90 Days</SelectItem>
            </SelectContent>
          </Select>
        </div>
      </CardHeader>
      
      <CardContent>
        <TabsContent value="correlation" className="mt-0">
          <div className="space-y-6">
            <p className="text-sm text-muted-foreground">
              This chart shows the relationship between nicotine consumption and focus levels. Each point represents a day.
            </p>
            
            <div className="h-80 w-full">
              {correlationData.length > 0 ? (
                <ResponsiveContainer width="100%" height="100%">
                  <ScatterChart margin={{ top: 20, right: 20, bottom: 20, left: 20 }}>
                    <CartesianGrid strokeDasharray="3 3" />
                    <XAxis 
                      type="number" 
                      dataKey="nicotineAmount" 
                      name="Nicotine" 
                      label={{ value: 'Nicotine Amount', position: 'bottom' }} 
                    />
                    <YAxis 
                      type="number" 
                      dataKey="focusLevel" 
                      name="Focus" 
                      label={{ value: 'Focus Level', angle: -90, position: 'left' }} 
                    />
                    <Tooltip 
                      formatter={(value, name) => [value, name === "nicotineAmount" ? "Nicotine Amount" : "Focus Level"]}
                      labelFormatter={(value) => `Date: ${correlationData[value]?.formattedDate || ''}`}
                    />
                    <Scatter name="Focus vs. Nicotine" data={correlationData} fill="#8884d8">
                      {correlationData.map((entry, index) => (
                        <Cell 
                          key={`cell-${index}`} 
                          fill={entry.focusLevel > 7 ? "#4ade80" : entry.focusLevel > 4 ? "#facc15" : "#f87171"} 
                        />
                      ))}
                    </Scatter>
                  </ScatterChart>
                </ResponsiveContainer>
              ) : (
                <div className="h-full flex items-center justify-center">
                  <p className="text-muted-foreground">
                    Not enough data to show correlation. Continue tracking both nicotine use and focus sessions.
                  </p>
                </div>
              )}
            </div>
            
            <div className="bg-secondary p-4 rounded-lg">
              <h3 className="text-lg font-medium mb-2">Understanding this Chart</h3>
              <ul className="space-y-2 text-sm">
                <li className="flex gap-2">
                  <div className="w-3 h-3 rounded-full bg-green-400 mt-1 flex-shrink-0" />
                  <span>Green dots represent days with high focus levels (7-10)</span>
                </li>
                <li className="flex gap-2">
                  <div className="w-3 h-3 rounded-full bg-yellow-400 mt-1 flex-shrink-0" />
                  <span>Yellow dots represent days with moderate focus levels (4-7)</span>
                </li>
                <li className="flex gap-2">
                  <div className="w-3 h-3 rounded-full bg-red-400 mt-1 flex-shrink-0" />
                  <span>Red dots represent days with low focus levels (1-4)</span>
                </li>
              </ul>
              <p className="mt-3 text-sm">
                Look for patterns: if most green dots are on the left side, it suggests you focus better with less nicotine.
              </p>
            </div>
          </div>
        </TabsContent>
        
        <TabsContent value="timeline" className="mt-0">
          <div className="space-y-6">
            <p className="text-sm text-muted-foreground">
              This chart shows your nicotine consumption and focus levels over time, helping you identify patterns and trends.
            </p>
            
            <div className="h-80 w-full">
              {prepareTimelineData().length > 0 ? (
                <ResponsiveContainer width="100%" height="100%">
                  <LineChart data={prepareTimelineData()} margin={{ top: 5, right: 20, bottom: 20, left: 10 }}>
                    <CartesianGrid strokeDasharray="3 3" />
                    <XAxis dataKey="formattedDate" />
                    <YAxis yAxisId="left" orientation="left" stroke="#14b8a6" />
                    <YAxis yAxisId="right" orientation="right" stroke="#8884d8" />
                    <Tooltip />
                    <Legend />
                    <Line
                      yAxisId="left"
                      type="monotone"
                      dataKey="nicotine"
                      name="Nicotine Amount"
                      stroke="#14b8a6"
                      activeDot={{ r: 8 }}
                      strokeWidth={2}
                    />
                    <Line
                      yAxisId="right"
                      type="monotone"
                      dataKey="focus"
                      name="Focus Level"
                      stroke="#8884d8"
                      strokeWidth={2}
                    />
                  </LineChart>
                </ResponsiveContainer>
              ) : (
                <div className="h-full flex items-center justify-center">
                  <p className="text-muted-foreground">
                    Not enough data to show timeline. Continue tracking both nicotine use and focus sessions.
                  </p>
                </div>
              )}
            </div>
            
            {correlationData.length > 3 && (
              <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
                <div className="p-4 bg-emerald-50 dark:bg-emerald-950/40 rounded-lg border border-emerald-100 dark:border-emerald-900">
                  <h4 className="font-medium flex items-center gap-1.5">
                    <Zap className="h-4 w-4 text-emerald-500" />
                    Average Focus Level
                  </h4>
                  <p className="text-2xl font-bold">
                    {(correlationData.reduce((acc, item) => acc + item.focusLevel, 0) / correlationData.length).toFixed(1)}
                    <span className="text-sm font-normal text-muted-foreground ml-1">/ 10</span>
                  </p>
                </div>
                
                <div className="p-4 bg-blue-50 dark:bg-blue-950/40 rounded-lg border border-blue-100 dark:border-blue-900">
                  <h4 className="font-medium flex items-center gap-1.5">
                    <Clock className="h-4 w-4 text-blue-500" />
                    Avg Focus Duration
                  </h4>
                  <p className="text-2xl font-bold">
                    {(correlationData.reduce((acc, item) => acc + item.focusDuration, 0) / correlationData.length).toFixed(0)}
                    <span className="text-sm font-normal text-muted-foreground ml-1">min</span>
                  </p>
                </div>
                
                <div className="p-4 bg-amber-50 dark:bg-amber-950/40 rounded-lg border border-amber-100 dark:border-amber-900">
                  <h4 className="font-medium flex items-center gap-1.5">
                    <TrendingUp className="h-4 w-4 text-amber-500" />
                    Focus Trend
                  </h4>
                  <p className="text-lg font-medium">
                    {correlationData.length >= 5 ? (
                      correlationData.slice(-5).reduce((acc, item) => acc + item.focusLevel, 0) >
                      correlationData.slice(0, 5).reduce((acc, item) => acc + item.focusLevel, 0)
                        ? "Improving"
                        : "Declining"
                    ) : (
                      "Need more data"
                    )}
                  </p>
                </div>
              </div>
            )}
          </div>
        </TabsContent>
        
        <TabsContent value="insights" className="mt-0">
          <div className="space-y-6">
            <div className="space-y-4">
              {insights.length > 0 ? (
                insights.map((insight, index) => (
                  <div 
                    key={index} 
                    className="p-4 bg-secondary rounded-lg border flex gap-3"
                  >
                    <Lightbulb className="h-5 w-5 text-amber-500 flex-shrink-0 mt-0.5" />
                    <p>{insight}</p>
                  </div>
                ))
              ) : (
                <div className="p-4 bg-secondary rounded-lg border">
                  <p className="text-muted-foreground text-center">
                    Continue tracking your nicotine consumption and focus sessions to receive personalized insights.
                  </p>
                </div>
              )}
            </div>
            
            <div className="mt-6 space-y-3">
              <h3 className="font-medium">General Research Findings</h3>
              
              <div className="p-3 bg-blue-50 dark:bg-blue-950/40 rounded-lg border border-blue-100 dark:border-blue-900">
                <div className="flex gap-2">
                  <Info className="h-4 w-4 text-blue-500 flex-shrink-0 mt-0.5" />
                  <p className="text-sm">
                    <span className="font-medium">Focus Duration:</span> Research suggests that nicotine's cognitive enhancement effects last approximately 20-30 minutes, followed by a decline that can negatively impact sustained focus.
                  </p>
                </div>
              </div>
              
              <div className="p-3 bg-purple-50 dark:bg-purple-950/40 rounded-lg border border-purple-100 dark:border-purple-900">
                <div className="flex gap-2">
                  <AlertTriangle className="h-4 w-4 text-purple-500 flex-shrink-0 mt-0.5" />
                  <p className="text-sm">
                    <span className="font-medium">Withdrawal Effects:</span> Nicotine withdrawal symptoms can begin within 4-24 hours after last use and can significantly impair concentration and focus for 2-4 weeks.
                  </p>
                </div>
              </div>
              
              <div className="p-3 bg-emerald-50 dark:bg-emerald-950/40 rounded-lg border border-emerald-100 dark:border-emerald-900">
                <div className="flex gap-2">
                  <Lightbulb className="h-4 w-4 text-emerald-500 flex-shrink-0 mt-0.5" />
                  <p className="text-sm">
                    <span className="font-medium">Optimal Strategy:</span> Many former nicotine users report that their cognitive function and focus improve significantly after 2-3 months of abstinence, often exceeding their previous baseline.
                  </p>
                </div>
              </div>
            </div>
          </div>
        </TabsContent>
      </CardContent>
      
      <CardFooter className="flex justify-between">
        <Button variant="outline" size="sm" onClick={fetchData}>
          Refresh Data
        </Button>
        <Button variant="outline" size="sm">
          <Download className="mr-2 h-4 w-4" />
          Export Report
        </Button>
      </CardFooter>
    </Card>
  );
} 