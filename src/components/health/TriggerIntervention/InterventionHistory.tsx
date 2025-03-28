import React, { useEffect, useState } from 'react';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { Progress } from '@/components/ui/progress';
import { Button } from '@/components/ui/button';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { fetchInterventionHistory } from '@/api/cravingService';
import { ThumbsUp, Clock, Activity, Flame, BookOpen, ArrowRight, TrendingUp, Brain, Calendar, Award } from 'lucide-react';
import { formatDistanceToNow, parseISO, format } from 'date-fns';
import { useNavigate } from 'react-router-dom';
import { AreaChart, Area, XAxis, YAxis, CartesianGrid, Tooltip, ResponsiveContainer } from 'recharts';

// Define proper types for the intervention data
interface Intervention {
  id: string;
  userId: string;
  date: string;
  triggerId: string;
  triggerName: string;
  interventionType: string;
  intensityBefore: number;
  intensityAfter: number;
  successful: boolean;
  notes?: string;
}

interface InterventionMetrics {
  totalInterventions: number;
  successRate: number;
  averageReduction: number;
  mostCommonTrigger: string;
  mostEffectiveMethod: {
    name: string;
    successRate: number;
    count: number;
  } | null;
  progressOverTime: Array<{
    date: string;
    successRate: number;
  }>;
  timeOfDayData: Array<{
    time: string;
    count: number;
    success: number;
  }>;
  streakData: {
    current: number;
    longest: number;
    lastDate: string | null;
  };
}

interface InterventionHistoryProps {
  session: any;
  highlightId?: string; // Optional ID of the intervention to highlight
}

export const InterventionHistory: React.FC<InterventionHistoryProps> = ({ 
  session,
  highlightId 
}) => {
  const [history, setHistory] = useState<Intervention[]>([]);
  const [activeTab, setActiveTab] = useState('summary');
  const [metrics, setMetrics] = useState<InterventionMetrics | null>(null);
  const [loading, setLoading] = useState(true);
  const navigate = useNavigate();
  
  // Fetch intervention history
  useEffect(() => {
    const loadHistory = async () => {
      setLoading(true);
      try {
        if (session?.user?.id) {
          const historyData = await fetchInterventionHistory(session.user.id);
          setHistory(historyData || []);
        }
      } catch (error) {
        console.error('Error loading intervention history:', error);
      } finally {
        setLoading(false);
      }
    };
    
    loadHistory();
  }, [session]);
  
  // Calculate metrics when history changes
  useEffect(() => {
    if (history.length > 0) {
      calculateMetrics();
    }
  }, [history]);
  
  const calculateMetrics = () => {
    // Skip if no data
    if (!history.length) return;
    
    // Calculate success rate
    const totalInterventions = history.length;
    const successfulInterventions = history.filter(item => item.successful).length;
    const successRate = Math.round((successfulInterventions / totalInterventions) * 100);
    
    // Calculate average intensity reduction
    const intensityReductions = history.map(item => item.intensityBefore - item.intensityAfter);
    const averageReduction = intensityReductions.reduce((sum, val) => sum + val, 0) / totalInterventions;
    
    // Find most common trigger type
    const triggerCounts: Record<string, number> = {};
    history.forEach(item => {
      const trigger = item.triggerId.split('-')[0]; // Extract trigger type from ID
      triggerCounts[trigger] = (triggerCounts[trigger] || 0) + 1;
    });
    
    const mostCommonTrigger = Object.entries(triggerCounts)
      .sort(([, countA], [, countB]) => countB - countA)[0][0];
    
    // Find most effective intervention method
    const methodSuccessRates: Record<string, { success: number, total: number }> = {};
    
    history.forEach(item => {
      const method = item.interventionType;
      if (!methodSuccessRates[method]) {
        methodSuccessRates[method] = { success: 0, total: 0 };
      }
      methodSuccessRates[method].total += 1;
      if (item.successful) {
        methodSuccessRates[method].success += 1;
      }
    });
    
    let highestSuccessRate = 0;
    let mostEffectiveMethod: {
      name: string;
      successRate: number;
      count: number;
    } | null = null;
    
    Object.entries(methodSuccessRates).forEach(([method, data]) => {
      const successRate = (data.success / data.total) * 100;
      if (successRate > highestSuccessRate && data.total >= 3) { // Only consider methods used at least 3 times
        highestSuccessRate = successRate;
        mostEffectiveMethod = {
          name: method,
          successRate,
          count: data.total
        };
      }
    });
    
    // Calculate progress over time
    const chronologicalHistory = [...history].sort((a, b) => 
      new Date(a.date).getTime() - new Date(b.date).getTime()
    );
    
    const progressOverTime = chronologicalHistory.map((item, index) => {
      const previousSuccessCount = chronologicalHistory
        .slice(0, index)
        .filter(h => h.successful)
        .length;
      
      const currentSuccessRate = previousSuccessCount / Math.max(1, index);
      
      return {
        date: format(new Date(item.date), 'MM/dd'),
        successRate: Math.round(currentSuccessRate * 100)
      };
    });
    
    // Calculate time of day effectiveness
    const timeOfDayData = [
      { time: 'Morning', count: 0, success: 0 },
      { time: 'Afternoon', count: 0, success: 0 },
      { time: 'Evening', count: 0, success: 0 },
      { time: 'Night', count: 0, success: 0 }
    ];
    
    history.forEach(item => {
      const date = new Date(item.date);
      const hour = date.getHours();
      
      let timeIndex = 0;
      if (hour >= 5 && hour < 12) timeIndex = 0; // Morning
      else if (hour >= 12 && hour < 17) timeIndex = 1; // Afternoon
      else if (hour >= 17 && hour < 22) timeIndex = 2; // Evening
      else timeIndex = 3; // Night
      
      timeOfDayData[timeIndex].count += 1;
      if (item.successful) {
        timeOfDayData[timeIndex].success += 1;
      }
    });
    
    // Calculate streaks
    const sortedDates = [...history]
      .sort((a, b) => new Date(a.date).getTime() - new Date(b.date).getTime())
      .map(h => new Date(h.date).toISOString().split('T')[0]); // Get just the date part
    
    const uniqueDates = [...new Set(sortedDates)];
    let currentStreak = 0;
    let longestStreak = 0;
    let lastDate: string | null = null;
    
    // Check if there's an intervention today
    const today = new Date().toISOString().split('T')[0];
    if (uniqueDates.includes(today)) {
      currentStreak = 1;
      lastDate = today;
      
      // Count backwards from yesterday
      const yesterday = new Date();
      yesterday.setDate(yesterday.getDate() - 1);
      
      let checkDate = yesterday;
      while (uniqueDates.includes(checkDate.toISOString().split('T')[0])) {
        currentStreak += 1;
        checkDate.setDate(checkDate.getDate() - 1);
      }
    } else if (uniqueDates.length > 0) {
      // No intervention today, but check last streak
      lastDate = uniqueDates[uniqueDates.length - 1];
    }
    
    // Calculate longest streak
    let tempStreak = 1;
    for (let i = 1; i < uniqueDates.length; i++) {
      const prevDate = new Date(uniqueDates[i-1]);
      const currDate = new Date(uniqueDates[i]);
      
      // Check if dates are consecutive
      prevDate.setDate(prevDate.getDate() + 1);
      if (prevDate.toISOString().split('T')[0] === uniqueDates[i]) {
        tempStreak += 1;
      } else {
        if (tempStreak > longestStreak) {
          longestStreak = tempStreak;
        }
        tempStreak = 1;
      }
    }
    
    // Check if the final streak is the longest
    if (tempStreak > longestStreak) {
      longestStreak = tempStreak;
    }
    
    setMetrics({
      totalInterventions,
      successRate,
      averageReduction,
      mostCommonTrigger,
      mostEffectiveMethod,
      progressOverTime,
      timeOfDayData,
      streakData: {
        current: currentStreak,
        longest: longestStreak,
        lastDate
      }
    });
  };
  
  const formatInterventionType = (type: string): string => {
    return type.charAt(0).toUpperCase() + type.slice(1);
  };
  
  const getRelativeTimeString = (dateString: string): string => {
    try {
      return formatDistanceToNow(parseISO(dateString), { addSuffix: true });
    } catch (error) {
      return "Unknown time";
    }
  };
  
  const getInterventionIcon = (type: string) => {
    switch (type) {
      case 'breathing':
        return <Activity className="h-4 w-4" />;
      case 'distract':
        return <BookOpen className="h-4 w-4" />;
      case 'reframe':
        return <Brain className="h-4 w-4" />;
      case 'timer':
        return <Clock className="h-4 w-4" />;
      case 'holistic':
        return <ThumbsUp className="h-4 w-4" />;
      default:
        return <Activity className="h-4 w-4" />;
    }
  };
  
  const getTriggerTypeLabel = (triggerId: string): string => {
    const triggerType = triggerId.split('-')[0];
    
    switch(triggerType) {
      case 'stress': return 'Stress';
      case 'social': return 'Social Situation';
      case 'boredom': return 'Boredom';
      case 'morning': return 'Morning Routine';
      case 'meal': return 'After Meal';
      case 'emotional': return 'Emotional';
      case 'withdrawal': return 'Withdrawal';
      case 'driving': return 'While Driving';
      default: return triggerType.charAt(0).toUpperCase() + triggerType.slice(1);
    }
  };
  
  if (loading) {
    return (
      <Card>
        <CardHeader>
          <CardTitle className="text-lg">Intervention History</CardTitle>
          <CardDescription>
            Loading your intervention history...
          </CardDescription>
        </CardHeader>
        <CardContent>
          <div className="flex justify-center py-8">
            <div className="animate-spin h-8 w-8 border-2 border-primary rounded-full border-t-transparent"></div>
          </div>
        </CardContent>
      </Card>
    );
  }
  
  if (!metrics) {
    return (
      <Card>
        <CardHeader>
          <CardTitle className="text-lg">Intervention History</CardTitle>
          <CardDescription>
            Your intervention history will appear here after you use intervention tools.
          </CardDescription>
        </CardHeader>
        <CardContent className="pt-2">
          <Button 
            variant="outline" 
            className="w-full"
            onClick={() => navigate('/app/interventions')}
          >
            Try Your First Intervention
            <ArrowRight className="ml-2 h-4 w-4" />
          </Button>
        </CardContent>
      </Card>
    );
  }
  
  return (
    <Card>
      <CardHeader className="pb-2">
        <CardTitle className="text-lg">Your Intervention History</CardTitle>
        <CardDescription>
          Track your progress and identify what works best for you
        </CardDescription>
      </CardHeader>
      <CardContent className="p-0">
        <Tabs value={activeTab} onValueChange={setActiveTab}>
          <TabsList className="grid grid-cols-2 mb-0 w-full rounded-none border-b bg-transparent">
            <TabsTrigger value="summary">Summary</TabsTrigger>
            <TabsTrigger value="details">Details</TabsTrigger>
          </TabsList>
          
          <TabsContent value="summary" className="p-4 pt-6">
            {metrics && (
              <div className="space-y-6">
                <div className="grid grid-cols-2 gap-4">
                  <div className="bg-muted/30 p-3 rounded-lg">
                    <div className="text-2xl font-bold">{metrics.totalInterventions}</div>
                    <div className="text-sm text-muted-foreground">Total Interventions</div>
                  </div>
                  <div className="bg-muted/30 p-3 rounded-lg">
                    <div className="text-2xl font-bold">{metrics.successRate}%</div>
                    <div className="text-sm text-muted-foreground">Success Rate</div>
                  </div>
                  <div className="bg-muted/30 p-3 rounded-lg">
                    <div className="text-2xl font-bold">{metrics.streakData.current}</div>
                    <div className="text-sm text-muted-foreground">Current Streak</div>
                  </div>
                  <div className="bg-muted/30 p-3 rounded-lg">
                    <div className="text-2xl font-bold">{metrics.streakData.longest}</div>
                    <div className="text-sm text-muted-foreground">Longest Streak</div>
                  </div>
                </div>
                
                <div>
                  <div className="flex justify-between items-center mb-2">
                    <h3 className="text-sm font-medium">Success Rate Over Time</h3>
                  </div>
                  <div className="h-[200px] w-full">
                    <ResponsiveContainer width="100%" height="100%">
                      <AreaChart
                        data={metrics.progressOverTime}
                        margin={{ top: 10, right: 10, left: 0, bottom: 0 }}
                      >
                        <CartesianGrid strokeDasharray="3 3" />
                        <XAxis dataKey="date" />
                        <YAxis domain={[0, 100]} tickFormatter={(tick) => `${tick}%`} />
                        <Tooltip formatter={(value) => [`${value}%`, 'Success Rate']} />
                        <Area
                          type="monotone"
                          dataKey="successRate"
                          stroke="#10b981"
                          fill="#10b98133"
                        />
                      </AreaChart>
                    </ResponsiveContainer>
                  </div>
                </div>
                
                <div className="grid grid-cols-2 gap-4">
                  <div className="space-y-2">
                    <h3 className="text-sm font-medium">Most Common Trigger</h3>
                    <div className="p-3 bg-muted/30 rounded-lg flex items-center gap-3">
                      <Flame className="h-5 w-5 text-red-500" />
                      <div>
                        <div className="font-medium">{getTriggerTypeLabel(metrics.mostCommonTrigger)}</div>
                        <div className="text-xs text-muted-foreground">Try focusing on this trigger</div>
                      </div>
                    </div>
                  </div>
                  
                  {metrics.mostEffectiveMethod && (
                    <div className="space-y-2">
                      <h3 className="text-sm font-medium">Most Effective Method</h3>
                      <div className="p-3 bg-muted/30 rounded-lg flex items-center gap-3">
                        {getInterventionIcon(metrics.mostEffectiveMethod.name)}
                        <div>
                          <div className="font-medium">{formatInterventionType(metrics.mostEffectiveMethod.name)}</div>
                          <div className="text-xs text-muted-foreground">
                            {Math.round(metrics.mostEffectiveMethod.successRate)}% success rate
                          </div>
                        </div>
                      </div>
                    </div>
                  )}
                </div>
                
                <div className="space-y-3">
                  <h3 className="text-sm font-medium">Time of Day Analysis</h3>
                  <div className="grid grid-cols-4 gap-2">
                    {metrics.timeOfDayData.map((time, idx) => (
                      <div key={idx} className="p-2 border rounded text-center">
                        <div className="text-xs text-muted-foreground">{time.time}</div>
                        <div className="text-lg font-bold">
                          {time.count > 0 ? Math.round((time.success / time.count) * 100) : 0}%
                        </div>
                        <div className="text-xs text-muted-foreground">{time.count} uses</div>
                      </div>
                    ))}
                  </div>
                </div>
                
                <Button 
                  onClick={() => navigate('/app/interventions')}
                  className="w-full"
                >
                  Start New Intervention
                  <ArrowRight className="ml-2 h-4 w-4" />
                </Button>
              </div>
            )}
          </TabsContent>
          
          <TabsContent value="details" className="p-4 pt-6">
            <div className="divide-y">
              {history.slice(0, 5).map((item, index) => (
                <div 
                  key={item.id} 
                  className={`py-4 ${highlightId === item.id ? 'bg-primary/5 px-2 rounded' : ''}`}
                >
                  <div className="flex items-start justify-between mb-2">
                    <div className="flex items-center gap-2">
                      {getInterventionIcon(item.interventionType)}
                      <span className="font-medium">
                        {formatInterventionType(item.interventionType)}
                      </span>
                    </div>
                    <Badge variant={item.successful ? "success" : "outline"}>
                      {item.successful ? "Successful" : "Attempted"}
                    </Badge>
                  </div>
                  
                  <div className="grid grid-cols-2 gap-2 text-sm mb-2">
                    <div className="flex items-center gap-1">
                      <Flame className="h-4 w-4 text-amber-500" />
                      <span>Trigger: {getTriggerTypeLabel(item.triggerId)}</span>
                    </div>
                    <div className="flex items-center gap-1">
                      <Clock className="h-4 w-4 text-blue-500" />
                      <span>{getRelativeTimeString(item.date)}</span>
                    </div>
                  </div>
                  
                  <div className="space-y-1 mt-3">
                    <div className="flex justify-between text-xs">
                      <span>Intensity Before: {item.intensityBefore}</span>
                      <span>Intensity After: {item.intensityAfter}</span>
                    </div>
                    <Progress
                      value={((item.intensityBefore - item.intensityAfter) / item.intensityBefore) * 100}
                      className="h-1"
                    />
                    <div className="text-xs text-muted-foreground">
                      Reduced by {item.intensityBefore - item.intensityAfter} points
                    </div>
                  </div>
                  
                  {item.notes && (
                    <div className="mt-2 text-sm border-t pt-2">
                      <p className="text-muted-foreground">{item.notes}</p>
                    </div>
                  )}
                </div>
              ))}
            </div>
          </TabsContent>
        </Tabs>
      </CardContent>
    </Card>
  );
}; 