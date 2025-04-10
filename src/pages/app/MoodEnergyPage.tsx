import React, { useState, useEffect, useCallback } from 'react';
import { useAuth } from '../context/AuthContext';
import { supabaseRequest } from '@/utils/supabaseRequest'; // Corrected import
import { Card, CardContent, CardDescription, CardFooter, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { Slider } from "@/components/ui/slider";
import { Textarea } from "@/components/ui/textarea";
import { Activity, BarChart, Calendar, Smile, Frown, Meh, BatteryCharging, BatteryLow, Brain, Zap, Trash2 } from 'lucide-react';
import { format, parseISO, subDays } from 'date-fns';
import { 
  XAxis, 
  YAxis, 
  CartesianGrid, 
  Tooltip, 
  Legend, 
  ResponsiveContainer,
  AreaChart,
  Area,
  BarChart as ReBarChart,
  Bar
} from 'recharts';
import { Skeleton } from '@/components/ui/skeleton';
import { Badge } from '@/components/ui/badge';
import { Label } from '@/components/ui/label';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { Calendar as CalendarComponent } from '@/components/ui/calendar';
import { Popover, PopoverContent, PopoverTrigger } from '@/components/ui/popover';
import { TrendingUp, TrendingDown, Minus } from 'lucide-react';
import { calculateMoodEnergyAnalytics, generateRecommendations, AnalyticsData } from '@/lib/analyticsUtils';
import { Toaster, toast } from 'sonner';
import { Alert, AlertDescription, AlertTitle } from '@/components/ui/alert';

interface EnergyLog {
  id: string;
  user_id: string;
  timestamp: string;
  energy_level: number;
  mood_level: number;
  notes?: string;
}

const MoodEnergyPage: React.FC = () => {
  const { user, session } = useAuth();
  const [isLoading, setIsLoading] = useState(true);
  const [energyLogs, setEnergyLogs] = useState<EnergyLog[]>([]);
  const [energyLevel, setEnergyLevel] = useState(5);
  const [moodLevel, setMoodLevel] = useState(5);
  const [notes, setNotes] = useState('');
  const [selectedDate, setSelectedDate] = useState<Date>(new Date());
  const [analytics, setAnalytics] = useState<AnalyticsData | null>(null);
  const [recommendations, setRecommendations] = useState<string[]>([]);

  const fetchEnergyLogs = useCallback(async () => {
    if (!user || !session) {
      setIsLoading(false);
      return;
    }
    try {
      setIsLoading(true);
      const startDate = subDays(new Date(), 30).toISOString();
      const endDate = new Date().toISOString();
      
      // Corrected function call: use supabaseRequest, remove session argument
      const { data: logs, error: logsError } = await supabaseRequest<EnergyLog[]>(
        `/rest/v1/energy_logs?user_id=eq.${user?.id}&timestamp=gte.${startDate}&timestamp=lte.${endDate}&order=timestamp.desc&select=*`,
        { method: 'GET' }
      );
      if (logsError) throw logsError; // Propagate error if fetch failed
      
      setEnergyLogs(logs || []);
    } catch (error: any) {
      console.error('Error fetching energy logs:', error);
      toast.error('Failed to load energy data.', { description: error.message || 'Please try again later.' });
    } finally {
      setIsLoading(false);
    }
  }, [user, session]);

  useEffect(() => {
    fetchEnergyLogs();
  }, [fetchEnergyLogs]);

  useEffect(() => {
    if (!isLoading && energyLogs.length > 0) {
      const calculatedAnalytics = calculateMoodEnergyAnalytics(energyLogs);
      setAnalytics(calculatedAnalytics);
      if (calculatedAnalytics) {
        setRecommendations(generateRecommendations(calculatedAnalytics));
      } else {
        setRecommendations([]);
      }
    } else {
      setAnalytics(null);
      setRecommendations([]);
    }
  }, [energyLogs, isLoading]);

  const handleLogEnergyMood = async () => {
    try {
      if (!user || !session) {
        toast.error('Authentication Error', { description: 'You must be logged in to save logs.' });
        return;
      }
      
      const now = new Date();
      const timestamp = new Date(selectedDate);
      timestamp.setHours(now.getHours(), now.getMinutes(), now.getSeconds());
      
      const newLog = {
        user_id: user.id,
        timestamp: timestamp.toISOString(),
        energy_level: energyLevel,
        mood_level: moodLevel,
        notes: notes || undefined
      };
      
      setIsLoading(true);
      // Corrected function call: use supabaseRequest, remove session argument
      const { error: createError } = await supabaseRequest(
        '/rest/v1/energy_logs',
        {
          method: 'POST',
          headers: {
            'Content-Type': 'application/json',
            'Prefer': 'return=minimal'
          },
          body: JSON.stringify(newLog)
        }
      );
      if (createError) throw createError; // Propagate error if creation failed
      
      setNotes('');
      toast.success('Log Saved Successfully!');
      
      fetchEnergyLogs();
    } catch (error: any) {
      console.error('Error saving energy log:', error);
      toast.error('Failed to Save Log', { description: error.message || 'Please try again.' });
    }
  };

  const handleDeleteLog = async (logId: string) => {
    if (!user || !session) {
      toast.error('Authentication Error', { description: 'You must be logged in to delete logs.' });
      return;
    }

    const originalLogs = [...energyLogs];
    setEnergyLogs(prevLogs => prevLogs.filter(log => log.id !== logId));

    try {
      // Corrected function call: use supabaseRequest, remove session argument
      const { error: deleteError } = await supabaseRequest(
        `/rest/v1/energy_logs?id=eq.${logId}`,
        {
          method: 'DELETE',
          headers: {
            'Prefer': 'return=minimal'
          }
        }
      );
      if (deleteError) throw deleteError; // Propagate error if deletion failed
      toast.success('Log Deleted Successfully');
    } catch (error: any) {
      console.error('Error deleting energy log:', error);
      toast.error('Failed to Delete Log', { description: error.message || 'Please try again.' });
      setEnergyLogs(originalLogs);
    }
  };

  const groupedLogs = energyLogs.reduce((acc, log) => {
    const day = format(parseISO(log.timestamp), 'yyyy-MM-dd');
    
    if (!acc[day]) {
      acc[day] = {
        day,
        energyAvg: 0,
        moodAvg: 0,
        count: 0,
        dayLabel: format(parseISO(log.timestamp), 'MMM dd')
      };
    }
    
    acc[day].energyAvg += log.energy_level;
    acc[day].moodAvg += log.mood_level;
    acc[day].count += 1;
    
    return acc;
  }, {} as Record<string, { day: string; dayLabel: string; energyAvg: number; moodAvg: number; count: number }>);

  const chartData = Object.values(groupedLogs).map(dayData => ({
    day: dayData.dayLabel,
    energy: Math.round((dayData.energyAvg / dayData.count) * 10) / 10,
    mood: Math.round((dayData.moodAvg / dayData.count) * 10) / 10
  })).sort((a, b) => a.day.localeCompare(b.day));

  const averageEnergy = analytics?.avgEnergyLast7Days ?? (energyLogs.length 
    ? Math.round((energyLogs.reduce((sum, log) => sum + log.energy_level, 0) / energyLogs.length) * 10) / 10 
    : null);
    
  const averageMood = analytics?.avgMoodLast7Days ?? (energyLogs.length 
    ? Math.round((energyLogs.reduce((sum, log) => sum + log.mood_level, 0) / energyLogs.length) * 10) / 10 
    : null);

  const getMoodIcon = (level: number | null) => {
    if (level === null) return <Meh className="h-5 w-5 text-muted-foreground" />;
    if (level <= 3) return <Frown className="h-5 w-5 text-destructive" />;
    if (level <= 7) return <Meh className="h-5 w-5 text-amber-500" />;
    return <Smile className="h-5 w-5 text-green-500" />;
  };

  const getEnergyIcon = (level: number | null) => {
    if (level === null) return <BatteryLow className="h-5 w-5 text-muted-foreground" />;
    if (level <= 3) return <BatteryLow className="h-5 w-5 text-destructive" />;
    if (level <= 7) return <BatteryCharging className="h-5 w-5 text-amber-500" />;
    return <Zap className="h-5 w-5 text-green-500" />;
  };

  const getTrendIcon = (trend: 'up' | 'down' | 'stable' | null) => {
    switch (trend) {
      case 'up': return <TrendingUp className="h-5 w-5 text-green-500" />;
      case 'down': return <TrendingDown className="h-5 w-5 text-red-500" />;
      case 'stable': return <Minus className="h-5 w-5 text-gray-500" />;
      default: return <span className="text-xs text-muted-foreground">N/A</span>;
    }
  };

  return (
    <div className="container py-8">
      <Toaster richColors position="top-right" />
      <h1 className="text-3xl font-bold mb-6 flex items-center gap-2">
        <Zap className="h-8 w-8 text-primary"/>
        Energy & Mood Tracking
      </h1>
      
      <Tabs defaultValue="track">
        <TabsList className="mb-6">
          <TabsTrigger value="track">Track</TabsTrigger>
          <TabsTrigger value="trends">Trends</TabsTrigger>
          <TabsTrigger value="insights">Insights</TabsTrigger>
        </TabsList>
        
        <TabsContent value="track">
          <div className="grid gap-6 md:grid-cols-2">
            <Card>
              <CardHeader>
                <CardTitle>Log Your Energy & Mood</CardTitle>
                <CardDescription>
                  Keep track of your energy levels and mood throughout the day to identify patterns.
                </CardDescription>
              </CardHeader>
              <CardContent className="space-y-6">
                <div className="space-y-2">
                  <div className="flex justify-between items-center">
                    <Label htmlFor="energy">Energy Level ({energyLevel}/10)</Label>
                    {getEnergyIcon(energyLevel)}
                  </div>
                  <Slider
                    id="energy"
                    min={1}
                    max={10}
                    step={1}
                    value={[energyLevel]}
                    onValueChange={(value) => setEnergyLevel(value[0])}
                    className="py-4"
                  />
                  <div className="flex justify-between text-xs text-muted-foreground">
                    <span>Depleted</span>
                    <span>Moderate</span>
                    <span>Energized</span>
                  </div>
                </div>
                
                <div className="space-y-2">
                  <div className="flex justify-between items-center">
                    <Label htmlFor="mood">Mood Level ({moodLevel}/10)</Label>
                    {getMoodIcon(moodLevel)}
                  </div>
                  <Slider
                    id="mood"
                    min={1}
                    max={10}
                    step={1}
                    value={[moodLevel]}
                    onValueChange={(value) => setMoodLevel(value[0])}
                    className="py-4"
                  />
                  <div className="flex justify-between text-xs text-muted-foreground">
                    <span>Low</span>
                    <span>Neutral</span>
                    <span>Great</span>
                  </div>
                </div>
                
                <div className="space-y-2">
                  <Label htmlFor="date">Date</Label>
                  <Popover>
                    <PopoverTrigger asChild>
                      <Button variant="outline" className="w-full justify-start text-left">
                        <Calendar className="mr-2 h-4 w-4" />
                        {format(selectedDate, 'PPP')}
                      </Button>
                    </PopoverTrigger>
                    <PopoverContent className="w-auto p-0">
                      <CalendarComponent
                        mode="single"
                        selected={selectedDate}
                        onSelect={(date) => date && setSelectedDate(date)}
                        initialFocus
                      />
                    </PopoverContent>
                  </Popover>
                </div>
                
                <div className="space-y-2">
                  <Label htmlFor="notes">Notes (Optional)</Label>
                  <Textarea
                    id="notes"
                    placeholder="What factors might be influencing your energy and mood today?"
                    value={notes}
                    onChange={(e) => setNotes(e.target.value)}
                  />
                </div>
              </CardContent>
              <CardFooter>
                <Button onClick={handleLogEnergyMood} className="w-full" disabled={isLoading}>
                  {isLoading ? 'Saving...' : 'Save Log'}
                </Button>
              </CardFooter>
            </Card>
            
            <Card>
              <CardHeader>
                <CardTitle>Recent Logs</CardTitle>
                <CardDescription>
                  Your most recent energy and mood entries
                </CardDescription>
              </CardHeader>
              <CardContent className="max-h-[500px] overflow-y-auto">
                {isLoading ? (
                  <div className="space-y-3">
                    {Array(5).fill(0).map((_, i) => (
                      <Skeleton key={i} className="h-24 w-full" />
                    ))}
                  </div>
                ) : energyLogs.length === 0 ? (
                  <div className="text-center py-8 text-muted-foreground">
                    <Activity className="mx-auto h-12 w-12 mb-2 opacity-50" />
                    <p>No logs recorded yet.</p>
                    <p className="text-sm">Start tracking your energy and mood!</p>
                  </div>
                ) : (
                  <div className="space-y-4">
                    {energyLogs.slice(0, 10).map((log) => (
                      <Card key={log.id} className="p-4 flex justify-between items-center group hover:bg-muted/50 transition-colors">
                        <div className="flex justify-between items-start flex-grow mr-4">
                          <div>
                            <p className="font-medium">
                              {format(parseISO(log.timestamp), 'PPP')}
                            </p>
                            <p className="text-sm text-muted-foreground">
                              {format(parseISO(log.timestamp), 'p')}
                            </p>
                          </div>
                          <div className="flex gap-2">
                            <Badge variant="outline" className="flex gap-1 items-center">
                              {getEnergyIcon(log.energy_level)}
                              <span>Energy: {log.energy_level}/10</span>
                            </Badge>
                            <Badge variant="outline" className="flex gap-1 items-center">
                              {getMoodIcon(log.mood_level)}
                              <span>Mood: {log.mood_level}/10</span>
                            </Badge>
                          </div>
                        </div>
                        {log.notes && (
                          <p className="mt-2 text-sm border-t pt-2 text-muted-foreground flex-grow basis-full">
                            {log.notes}
                          </p>
                        )}
                        <Button 
                          variant="ghost" 
                          size="icon" 
                          className="opacity-0 group-hover:opacity-100 transition-opacity text-muted-foreground hover:text-destructive"
                          onClick={() => handleDeleteLog(log.id)}
                          aria-label="Delete log"
                        >
                          <Trash2 className="h-4 w-4" />
                        </Button>
                      </Card>
                    ))}
                  </div>
                )}
              </CardContent>
            </Card>
          </div>
        </TabsContent>
        
        <TabsContent value="trends">
          <div className="space-y-6">
            <Card>
              <CardHeader>
                <CardTitle>Energy & Mood Trends (Last 30 Days)</CardTitle>
                <CardDescription>
                  Track how your energy and mood levels have changed over time
                  {chartData.length < 3 && <span className="text-xs text-muted-foreground block mt-1"> (More data leads to clearer trends)</span>}
                </CardDescription>
              </CardHeader>
              <CardContent>
                <div className="h-[400px]">
                  {isLoading ? (
                    <Skeleton className="h-full w-full" />
                  ) : chartData.length === 0 ? (
                    <div className="h-full flex flex-col items-center justify-center text-muted-foreground">
                      <BarChart className="h-12 w-12 mb-2 opacity-50" />
                      <p className="font-medium">No Trend Data Yet</p>
                      <p className="text-sm">Keep logging to visualize your energy and mood patterns.</p>
                    </div>
                  ) : (
                    <ResponsiveContainer width="100%" height="100%">
                      <AreaChart data={chartData} margin={{ top: 20, right: 30, left: 20, bottom: 5 }}>
                        <CartesianGrid strokeDasharray="3 3" />
                        <XAxis dataKey="day" />
                        <YAxis domain={[0, 10]} />
                        <Tooltip />
                        <Legend />
                        <defs>
                          <linearGradient id="colorEnergy" x1="0" y1="0" x2="0" y2="1">
                            <stop offset="5%" stopColor="#8884d8" stopOpacity={0.8} />
                            <stop offset="95%" stopColor="#8884d8" stopOpacity={0.1} />
                          </linearGradient>
                          <linearGradient id="colorMood" x1="0" y1="0" x2="0" y2="1">
                            <stop offset="5%" stopColor="#82ca9d" stopOpacity={0.8} />
                            <stop offset="95%" stopColor="#82ca9d" stopOpacity={0.1} />
                          </linearGradient>
                        </defs>
                        <Area
                          type="monotone"
                          dataKey="energy"
                          name="Energy Level"
                          stroke="#8884d8"
                          fillOpacity={1}
                          fill="url(#colorEnergy)"
                        />
                        <Area
                          type="monotone"
                          dataKey="mood"
                          name="Mood Level"
                          stroke="#82ca9d"
                          fillOpacity={1}
                          fill="url(#colorMood)"
                        />
                      </AreaChart>
                    </ResponsiveContainer>
                  )}
                </div>
              </CardContent>
            </Card>
            
            <div className="grid gap-6 md:grid-cols-2">
              <Card>
                <CardHeader>
                  <CardTitle>Energy Analysis</CardTitle>
                </CardHeader>
                <CardContent className="space-y-4">
                  <div className="flex items-center justify-between">
                    <div>
                      <p className="text-sm font-medium">Average Energy Level</p>
                      <h3 className="text-2xl font-bold">{averageEnergy !== null ? `${averageEnergy}/10` : 'N/A'}</h3>
                      {analytics?.avgEnergyLast7Days === null && energyLogs.length > 0 && <span className="text-xs font-normal text-muted-foreground"> (Need logs in last 7 days)</span>}
                    </div>
                    {getEnergyIcon(averageEnergy)}
                  </div>
                  
                  <div className="space-y-2">
                    <p className="text-sm font-medium">Energy Distribution (Last 30 Days)</p>
                    <ResponsiveContainer width="100%" height={150}>
                      <ReBarChart data={[
                        { level: "Low", count: energyLogs.filter(log => log.energy_level <= 3).length },
                        { level: "Med", count: energyLogs.filter(log => log.energy_level > 3 && log.energy_level <= 7).length },
                        { level: "High", count: energyLogs.filter(log => log.energy_level > 7).length }
                      ]}>
                        <XAxis dataKey="level" fontSize={12} tickLine={false} axisLine={false}/>
                        <YAxis />
                        <Tooltip />
                        <Bar dataKey="count" fill="#8884d8" name="Occurrences" radius={[4, 4, 0, 0]} />
                      </ReBarChart>
                    </ResponsiveContainer>
                  </div>
                </CardContent>
              </Card>
              
              <Card>
                <CardHeader>
                  <CardTitle>Mood Analysis</CardTitle>
                </CardHeader>
                <CardContent className="space-y-4">
                  <div className="flex items-center justify-between">
                    <div>
                      <p className="text-sm font-medium">Average Mood Level</p>
                      <h3 className="text-2xl font-bold">{averageMood !== null ? `${averageMood}/10` : 'N/A'}</h3>
                      {analytics?.avgMoodLast7Days === null && energyLogs.length > 0 && <span className="text-xs font-normal text-muted-foreground"> (Need logs in last 7 days)</span>}
                    </div>
                    {getMoodIcon(averageMood)}
                  </div>
                  
                  <div className="space-y-2">
                    <p className="text-sm font-medium">Mood Distribution (Last 30 Days)</p>
                    <ResponsiveContainer width="100%" height={150}>
                      <ReBarChart data={[
                        { level: "Neg", count: energyLogs.filter(log => log.mood_level <= 3).length },
                        { level: "Neu", count: energyLogs.filter(log => log.mood_level > 3 && log.mood_level <= 7).length },
                        { level: "Pos", count: energyLogs.filter(log => log.mood_level > 7).length }
                      ]}>
                        <XAxis dataKey="level" fontSize={12} tickLine={false} axisLine={false}/>
                        <YAxis />
                        <Tooltip />
                        <Bar dataKey="count" fill="#82ca9d" name="Occurrences" radius={[4, 4, 0, 0]} />
                      </ReBarChart>
                    </ResponsiveContainer>
                  </div>
                </CardContent>
              </Card>
            </div>
          </div>
        </TabsContent>
        
        <TabsContent value="insights">
          <div className="space-y-6">
            <Card>
              <CardHeader>
                <CardTitle>Your Energy & Mood Insights</CardTitle>
                <CardDescription>
                  Personalized insights based on your tracking data (requires at least 1 log, more data provides better insights)
                </CardDescription>
              </CardHeader>
              <CardContent>
                {isLoading ? (
                  <div className="space-y-4">
                    {Array(3).fill(0).map((_, i) => (
                      <Skeleton key={i} className="h-20 w-full" />
                    ))}
                  </div>
                ) : !analytics || (analytics.avgMoodLast7Days === null && analytics.avgEnergyLast7Days === null && !analytics.hasEnoughDataForKeywords) ? (
                  <div className="py-8 text-center text-muted-foreground">
                    <Brain className="mx-auto h-12 w-12 mb-4 opacity-50" />
                    <h3 className="text-lg font-medium mb-2">Not Enough Data for Insights</h3>
                    <p>Log your energy and mood consistently for at least a week to receive personalized insights.</p>
                    <Button variant="outline" className="mt-4" onClick={() => {
                      const trackTrigger = document.querySelector('button[role="tab"][data-state="inactive"][value="track"]') as HTMLButtonElement | null;
                      trackTrigger?.click();
                    }}>
                      Go to Track Tab
                    </Button>
                  </div>
                ) : (
                  <div className="space-y-6">
                    {(analytics.avgMoodLast7Days !== null || analytics.avgEnergyLast7Days !== null) && (
                      <Card className="bg-background shadow-sm">
                        <CardHeader className="pb-2">
                          <CardTitle className="text-base font-medium">Last 7 Days Overview</CardTitle>
                        </CardHeader>
                        <CardContent>
                          <div className="flex flex-wrap gap-x-6 gap-y-2">
                            {analytics.avgMoodLast7Days !== null && (
                              <div className="flex items-center gap-2">
                                {getMoodIcon(analytics.avgMoodLast7Days)}
                                <span>Avg Mood: <span className="font-semibold">{analytics.avgMoodLast7Days}/10</span></span>
                              </div>
                            )}
                            {analytics.avgEnergyLast7Days !== null && (
                              <div className="flex items-center gap-2">
                                {getEnergyIcon(analytics.avgEnergyLast7Days)}
                                <span>Avg Energy: <span className="font-semibold">{analytics.avgEnergyLast7Days}/10</span></span>
                              </div>
                            )}
                          </div>
                        </CardContent>
                      </Card>
                    )}
                    
                    {analytics.moodTrend && (
                      <Card className="bg-background shadow-sm">
                        <CardHeader className="pb-2">
                            <CardTitle className="text-base font-medium">Weekly Mood Trend</CardTitle>
                        </CardHeader>
                        <CardContent>
                             <div className="flex items-center gap-2">
                              {getTrendIcon(analytics.moodTrend)}
                              <span className="capitalize font-medium">{analytics.moodTrend}</span>
                              <span className="text-sm text-muted-foreground">
                                {analytics.hasEnoughDataForTrend ? "(compared to previous week)" : "(based on available data)"}
                              </span>
                            </div>
                         </CardContent>
                      </Card>
                    )}
                    
                     {analytics.hasEnoughDataForKeywords && (
                         <Card className="bg-background shadow-sm">
                             <CardHeader className="pb-2">
                                 <CardTitle className="text-base font-medium">Top Keywords from Notes (Last 7 Days)</CardTitle>
                             </CardHeader>
                             <CardContent>
                                 <div className="flex flex-wrap gap-2">
                                     {analytics.topKeywords.map(kw => (
                                         <Badge key={kw.word} variant="secondary">{kw.word} ({kw.count})</Badge>
                                     ))}
                                 </div>
                             </CardContent>
                         </Card>
                     )}
                     
                     {recommendations.length > 0 && (
                         <Alert variant="default"> 
                             <Brain className="h-4 w-4" /> 
                             <AlertTitle>Insights & Recommendations</AlertTitle>
                             <AlertDescription>
                                 <ul className="list-disc pl-5 space-y-1 mt-2">
                                     {recommendations.map((rec, index) => (
                                         <li key={index}>{rec}</li>
                                     ))}
                                 </ul>
                             </AlertDescription>
                         </Alert>
                     )}
                     
                     {!analytics.hasEnoughDataForKeywords && !analytics.moodTrend && recommendations.length === 1 && recommendations[0].includes("Keep tracking") && (
                        <p className="text-center text-sm text-muted-foreground py-4">Log more data, especially with notes, for richer insights!</p>
                     )} 
                  </div>
                )}
              </CardContent>
            </Card>
          </div>
        </TabsContent>
      </Tabs>
    </div>
  );
};

export default MoodEnergyPage;
