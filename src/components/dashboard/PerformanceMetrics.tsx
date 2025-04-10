import React, { useState, useEffect } from 'react';
import { motion } from 'framer-motion';
import { 
  Calendar, 
  Trophy, 
  Flame, 
  Clock, 
  Brain, 
  LineChart,
  BarChart,
  AreaChart
} from 'lucide-react';
import { Card, CardContent, CardDescription, CardFooter, CardHeader, CardTitle } from '@/components/ui/card';
import { Progress } from '@/components/ui/progress';
import { Skeleton } from '@/components/ui/skeleton';
import { Button } from '@/components/ui/button';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { FocusServiceInstance, FocusStatistics } from '@/services/FocusService';

interface PerformanceMetricsProps {
  userId: string;
}

// Extended statistics interface with additional fields needed for enhanced metrics
interface EnhancedFocusStatistics extends FocusStatistics {
  // Time-based metrics
  today_focus_minutes: number;
  week_focus_minutes: number;
  month_focus_minutes: number;
  
  // Task metrics
  total_tasks: number;
  total_completed_tasks: number;
  
  // Flow state metrics
  average_flow_duration_minutes: number;
  
  // Productivity insights
  average_distractions_per_session: number;
  goal_completion_rate: number;
  
  // Historical data
  first_session_date: string;
}

interface PerformanceData {
  dailyFocusTime: number;
  weeklyFocusTime: number;
  monthlyFocusTime: number;
  completedTasks: number;
  currentStreak: number;
  longestStreak: number;
  productivityScore: number;
  distractionRate: number;
  deepFlowDuration: number;
  goalCompletion: number;
  taskCompletionRate: number;
  averageSessionLength: number;
  daysSinceJoined: number;
  mostProductiveTime: string;
  mostProductiveDay: string;
}

const DEFAULT_DATA: PerformanceData = {
  dailyFocusTime: 0,
  weeklyFocusTime: 0,
  monthlyFocusTime: 0,
  completedTasks: 0,
  currentStreak: 0,
  longestStreak: 0,
  productivityScore: 0,
  distractionRate: 0,
  deepFlowDuration: 0,
  goalCompletion: 0,
  taskCompletionRate: 0,
  averageSessionLength: 0,
  daysSinceJoined: 0,
  mostProductiveTime: 'N/A',
  mostProductiveDay: 'N/A'
};

// Animation variants
const cardVariants = {
  hidden: { opacity: 0, y: 20 },
  visible: { opacity: 1, y: 0, transition: { duration: 0.5 } },
};

const PerformanceMetrics: React.FC<PerformanceMetricsProps> = ({ userId }) => {
  const [metrics, setMetrics] = useState<PerformanceData>(DEFAULT_DATA);
  const [timeRange, setTimeRange] = useState<'day' | 'week' | 'month'>('week');
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  
  useEffect(() => {
    const fetchPerformanceMetrics = async () => {
      if (!userId) return;
      
      setLoading(true);
      setError(null);
      
      try {
        const focusService = FocusServiceInstance;
        
        // Get user statistics
        const baseStats = await focusService.getUserStatistics(userId);
        
        // For demo/development, we're mocking the enhanced statistics
        // In production, this would come from an actual endpoint
        const stats: EnhancedFocusStatistics = {
          // Ensure all required base properties are provided
          total_sessions: baseStats?.total_sessions || 0,
          total_minutes: baseStats?.total_minutes || 0,
          average_session_length: baseStats?.average_session_length || 0,
          longest_session: baseStats?.longest_session || 0,
          current_streak: baseStats?.current_streak || 0,
          longest_streak: baseStats?.longest_streak || 0,
          total_distractions: baseStats?.total_distractions || 0,
          most_productive_day: baseStats?.most_productive_day || null,
          most_productive_time: baseStats?.most_productive_time || null,
          
          // Mocked additional fields for our enhanced UI
          today_focus_minutes: 45,
          week_focus_minutes: 320,
          month_focus_minutes: 1250,
          total_tasks: 24,
          total_completed_tasks: 18,
          average_flow_duration_minutes: 22,
          average_distractions_per_session: 2.5,
          goal_completion_rate: 75,
          first_session_date: new Date(Date.now() - 30 * 24 * 60 * 60 * 1000).toISOString() // 30 days ago
        };
        
        if (stats) {
          // Calculate days since joined based on first session date
          const firstSessionDate = new Date(stats.first_session_date);
          const today = new Date();
          const diffTime = Math.abs(today.getTime() - firstSessionDate.getTime());
          const diffDays = Math.ceil(diffTime / (1000 * 60 * 60 * 24));
          
          // Calculate productivity score (0-100)
          // This is a weighted calculation based on focus time, completed tasks, and streak
          const focusWeight = 0.5;
          const tasksWeight = 0.3;
          const streakWeight = 0.2;
          
          const focusScore = Math.min(100, (stats.average_session_length * stats.total_sessions) / 60);
          const tasksScore = Math.min(100, stats.total_completed_tasks * 5);
          const streakScore = Math.min(100, stats.current_streak * 10);
          
          const productivityScore = Math.round(
            (focusScore * focusWeight) + 
            (tasksScore * tasksWeight) + 
            (streakScore * streakWeight)
          );
          
          // Calculate task completion rate (0-100%)
          const completionRate = stats.total_tasks === 0 
            ? 0 
            : Math.round((stats.total_completed_tasks / stats.total_tasks) * 100);
          
          // Set the metrics
          setMetrics({
            dailyFocusTime: Math.round(stats.today_focus_minutes),
            weeklyFocusTime: Math.round(stats.week_focus_minutes),
            monthlyFocusTime: Math.round(stats.month_focus_minutes),
            completedTasks: stats.total_completed_tasks,
            currentStreak: stats.current_streak,
            longestStreak: stats.longest_streak,
            productivityScore,
            distractionRate: stats.average_distractions_per_session,
            deepFlowDuration: Math.round(stats.average_flow_duration_minutes),
            goalCompletion: Math.round(stats.goal_completion_rate),
            taskCompletionRate: completionRate,
            averageSessionLength: Math.round(stats.average_session_length),
            daysSinceJoined: diffDays,
            mostProductiveTime: stats.most_productive_time || 'N/A',
            mostProductiveDay: stats.most_productive_day || 'N/A'
          });
        }
      } catch (error) {
        console.error('Error fetching performance metrics:', error);
        setError('Failed to load performance metrics');
        
        // For demo purposes, set some mock data even on error
        setMetrics({
          ...DEFAULT_DATA,
          dailyFocusTime: 45,
          weeklyFocusTime: 320,
          monthlyFocusTime: 1250,
          completedTasks: 18,
          currentStreak: 4,
          longestStreak: 7,
          productivityScore: 72,
          distractionRate: 2.5,
          deepFlowDuration: 22,
          goalCompletion: 75,
          taskCompletionRate: 75,
          averageSessionLength: 35,
          daysSinceJoined: 30,
          mostProductiveTime: 'Morning (9-11 AM)',
          mostProductiveDay: 'Wednesday'
        });
      } finally {
        setLoading(false);
      }
    };
    
    fetchPerformanceMetrics();
  }, [userId]);
  
  // Get focus time based on selected time range
  const getFocusTime = () => {
    switch (timeRange) {
      case 'day':
        return metrics.dailyFocusTime;
      case 'week':
        return metrics.weeklyFocusTime;
      case 'month':
        return metrics.monthlyFocusTime;
      default:
        return metrics.weeklyFocusTime;
    }
  };
  
  // Get target goal for selected time range
  const getTargetGoal = () => {
    switch (timeRange) {
      case 'day':
        return 120; // 2 hours daily target
      case 'week':
        return 600; // 10 hours weekly target
      case 'month':
        return 2400; // 40 hours monthly target
      default:
        return 600;
    }
  };
  
  const focusTime = getFocusTime();
  const targetGoal = getTargetGoal();
  const progressPercentage = Math.min(100, Math.round((focusTime / targetGoal) * 100));
  
  return (
    <motion.div
      initial="hidden"
      animate="visible"
      variants={cardVariants}
      className="space-y-6"
    >
      <Card>
        <CardHeader>
          <CardTitle className="text-xl flex items-center gap-2">
            <AreaChart className="h-5 w-5 text-primary" />
            Performance Metrics
          </CardTitle>
          <CardDescription>
            Track your focus and productivity metrics over time
          </CardDescription>
        </CardHeader>
        <CardContent className="space-y-6">
          {/* Time Range Selector */}
          <Tabs value={timeRange} onValueChange={(v: any) => setTimeRange(v)} className="w-full">
            <TabsList className="grid w-full grid-cols-3">
              <TabsTrigger value="day">Day</TabsTrigger>
              <TabsTrigger value="week">Week</TabsTrigger>
              <TabsTrigger value="month">Month</TabsTrigger>
            </TabsList>
          </Tabs>
          
          {/* Focus Time Progress */}
          <div className="space-y-2">
            <div className="flex items-center justify-between">
              <h3 className="font-medium text-sm flex items-center gap-1">
                <Clock className="h-4 w-4 text-muted-foreground" />
                Focus Time
              </h3>
              {loading ? (
                <Skeleton className="h-4 w-16" />
              ) : (
                <span className="text-sm font-bold">
                  {focusTime} min / {targetGoal} min
                </span>
              )}
            </div>
            
            {loading ? (
              <Skeleton className="h-2 w-full" />
            ) : (
              <Progress value={progressPercentage} className="h-2" />
            )}
          </div>
          
          {/* Metrics Grid */}
          <div className="grid grid-cols-2 md:grid-cols-3 gap-4">
            {/* Streak Card */}
            <div className="bg-muted/50 p-3 rounded-lg">
              <div className="flex items-center gap-1.5 mb-1">
                <Flame className="h-4 w-4 text-orange-500" />
                <span className="text-sm font-medium">Current Streak</span>
              </div>
              {loading ? (
                <Skeleton className="h-6 w-10" />
              ) : (
                <div className="flex items-baseline gap-1">
                  <span className="text-2xl font-bold">{metrics.currentStreak}</span>
                  <span className="text-xs text-muted-foreground">days</span>
                </div>
              )}
            </div>
            
            {/* Longest Streak Card */}
            <div className="bg-muted/50 p-3 rounded-lg">
              <div className="flex items-center gap-1.5 mb-1">
                <Trophy className="h-4 w-4 text-amber-500" />
                <span className="text-sm font-medium">Longest Streak</span>
              </div>
              {loading ? (
                <Skeleton className="h-6 w-10" />
              ) : (
                <div className="flex items-baseline gap-1">
                  <span className="text-2xl font-bold">{metrics.longestStreak}</span>
                  <span className="text-xs text-muted-foreground">days</span>
                </div>
              )}
            </div>
            
            {/* Productivity Score Card */}
            <div className="bg-muted/50 p-3 rounded-lg">
              <div className="flex items-center gap-1.5 mb-1">
                <BarChart className="h-4 w-4 text-primary" />
                <span className="text-sm font-medium">Productivity</span>
              </div>
              {loading ? (
                <Skeleton className="h-6 w-16" />
              ) : (
                <div className="flex items-baseline gap-1">
                  <span className="text-2xl font-bold">{metrics.productivityScore}</span>
                  <span className="text-xs text-muted-foreground">/100</span>
                </div>
              )}
            </div>
            
            {/* Task Completion Rate */}
            <div className="bg-muted/50 p-3 rounded-lg">
              <div className="flex items-center gap-1.5 mb-1">
                <Calendar className="h-4 w-4 text-blue-500" />
                <span className="text-sm font-medium">Task Completion</span>
              </div>
              {loading ? (
                <Skeleton className="h-6 w-16" />
              ) : (
                <div className="flex items-baseline gap-1">
                  <span className="text-2xl font-bold">{metrics.taskCompletionRate}</span>
                  <span className="text-xs text-muted-foreground">%</span>
                </div>
              )}
            </div>
            
            {/* Deep Flow Duration */}
            <div className="bg-muted/50 p-3 rounded-lg">
              <div className="flex items-center gap-1.5 mb-1">
                <Brain className="h-4 w-4 text-purple-500" />
                <span className="text-sm font-medium">Avg Flow Time</span>
              </div>
              {loading ? (
                <Skeleton className="h-6 w-16" />
              ) : (
                <div className="flex items-baseline gap-1">
                  <span className="text-2xl font-bold">{metrics.deepFlowDuration}</span>
                  <span className="text-xs text-muted-foreground">min</span>
                </div>
              )}
            </div>
            
            {/* Average Session Length */}
            <div className="bg-muted/50 p-3 rounded-lg">
              <div className="flex items-center gap-1.5 mb-1">
                <Clock className="h-4 w-4 text-green-500" />
                <span className="text-sm font-medium">Avg Session</span>
              </div>
              {loading ? (
                <Skeleton className="h-6 w-16" />
              ) : (
                <div className="flex items-baseline gap-1">
                  <span className="text-2xl font-bold">{metrics.averageSessionLength}</span>
                  <span className="text-xs text-muted-foreground">min</span>
                </div>
              )}
            </div>
          </div>
          
          {/* Additional Insights */}
          <div className="space-y-3 bg-muted/30 p-4 rounded-lg">
            <h3 className="text-sm font-semibold">Productivity Insights</h3>
            {loading ? (
              <>
                <Skeleton className="h-4 w-full" />
                <Skeleton className="h-4 w-4/5" />
                <Skeleton className="h-4 w-5/6" />
              </>
            ) : (
              <ul className="text-sm space-y-2">
                <li className="flex items-center gap-2">
                  <div className="h-1.5 w-1.5 rounded-full bg-primary"></div>
                  Most productive day is <span className="font-semibold">{metrics.mostProductiveDay}</span>
                </li>
                <li className="flex items-center gap-2">
                  <div className="h-1.5 w-1.5 rounded-full bg-primary"></div>
                  Most productive time is <span className="font-semibold">{metrics.mostProductiveTime}</span>
                </li>
                <li className="flex items-center gap-2">
                  <div className="h-1.5 w-1.5 rounded-full bg-primary"></div>
                  Average of <span className="font-semibold">{metrics.distractionRate.toFixed(1)}</span> distractions per session
                </li>
              </ul>
            )}
          </div>
        </CardContent>
        <CardFooter className="flex justify-between">
          <div className="text-xs text-muted-foreground">
            Member for {loading ? <Skeleton className="inline-block h-3 w-8" /> : metrics.daysSinceJoined} days
          </div>
          <Button variant="outline" size="sm">View Detailed Stats</Button>
        </CardFooter>
      </Card>
    </motion.div>
  );
};

export default PerformanceMetrics; 