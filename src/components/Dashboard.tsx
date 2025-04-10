// micro-frontends/easier-focus/src/components/Dashboard.tsx
import React, { useState, useEffect, useCallback } from 'react';
import { useAuth } from '@/providers/auth-provider';
import { useNavigate } from 'react-router-dom';
import { useToast } from '@/components/ui/use-toast';
import {
  focusSessionsApi,
  energyLevelsApi,
  tasksApi,
} from '@/api/supabase-rest';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Progress } from '@/components/ui/progress';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { Skeleton } from '@/components/ui/skeleton';
import { TooltipProvider } from '@/components/ui/tooltip';
import { Badge } from '@/components/ui/badge';
import {
  Zap,
  Timer,
  Activity,
  Target,
  TrendingUp,
  PieChart,
  LineChart,
  ListTodo,
  Sparkles,
  Lightbulb,
  Play,
  Plus,
  ChevronRight
} from 'lucide-react';
import {
  format,
  formatDistanceToNowStrict,
  isToday,
  parseISO,
  differenceInMinutes
} from 'date-fns';
import { 
  BarChart as ReBarChart, 
  Bar, 
  LineChart as ReLineChart, 
  Line, 
  PieChart as RePieChart, 
  Pie, 
  XAxis, 
  YAxis, 
  Tooltip as ReTooltip, 
  Legend, 
  ResponsiveContainer,
  AreaChart,
  Area,
  CartesianGrid,
  Cell
} from 'recharts';

interface FocusSession {
  id: string;
  user_id: string;
  start_time: string;
  end_time: string | null;
  duration_seconds: number | null;
  focus_type: string; 
  completed: boolean;
  created_at: string;
  notes?: string;
  tags?: string[];
}

interface EnergyLog {
  id: string;
  user_id: string;
  timestamp: string;
  energy_level: number; 
  mood_level: number; 
  notes?: string;
}

interface FocusStreak {
  current: number;
  longest: number;
  lastCompletedDate: string | null; 
}

interface UserStats {
  todaysFocusMinutes: number;
  weeklyAverageMinutes: number;
  focusSessionsToday: number;
  streak: FocusStreak;
}

interface TodoItem {
  id: string;
  user_id: string;
  title: string;
  description?: string;
  completed: boolean;
  created_at: string;
  updated_at: string;
  priority: 'high' | 'medium' | 'low';
  energy_level_required?: 'high' | 'medium' | 'low'; 
  due_date?: string;
  estimated_minutes?: number;
  tags?: string[];
}

interface Recommendation {
  id: string;
  title: string;
  description: string;
  actionText: string;
  actionLink?: string;
  actionFunc?: () => void;
  icon?: React.ReactNode;
}

const calculateStreak = (sessions: FocusSession[]): FocusStreak => {
  if (!sessions || sessions.length === 0) {
    return { current: 0, longest: 0, lastCompletedDate: null };
  }

  const completedSessions = sessions
    .filter(s => s.completed && s.end_time)
    .sort((a, b) => parseISO(b.end_time!).getTime() - parseISO(a.end_time!).getTime());

  let currentStreak = 0;
  let longestStreak = 0;
  let lastDate: Date | null = null;
  let lastCompletedDateStr: string | null = null;

  for (const session of completedSessions) {
    const sessionDate = parseISO(session.end_time!);
    if (!lastDate) {
      if (isToday(sessionDate)) {
        currentStreak = 1;
        lastDate = sessionDate;
        lastCompletedDateStr = session.end_time!;
      } else {
        break;
      }
    } else {
      const diffDays = differenceInMinutes(lastDate, sessionDate) / (60 * 24);
      if (diffDays >= 1 && diffDays < 2) {
        currentStreak++;
        lastDate = sessionDate;
      } else if (diffDays >= 2) {
        break;
      }
    }
    longestStreak = Math.max(longestStreak, currentStreak);
  }

  if (lastDate && !isToday(lastDate)) {
      const diffSinceLast = differenceInMinutes(new Date(), lastDate) / (60 * 24);
      if (diffSinceLast >= 2) {
          currentStreak = 0;
      }
  }

  return { current: currentStreak, longest: longestStreak, lastCompletedDate: lastCompletedDateStr };
};

const calculateUserStats = (sessions: FocusSession[], today: Date): Partial<UserStats> => {
    const todaysSessions = sessions.filter(s => s.start_time && isToday(parseISO(s.start_time)));
    const todaysFocusMinutes = todaysSessions.reduce((sum, s) => sum + (s.duration_seconds ? s.duration_seconds / 60 : 0), 0);

    const sevenDaysAgo = new Date(today);
    sevenDaysAgo.setDate(today.getDate() - 7);
    const lastWeekSessions = sessions.filter(s => s.start_time && parseISO(s.start_time) >= sevenDaysAgo);
    const weeklyTotalMinutes = lastWeekSessions.reduce((sum, s) => sum + (s.duration_seconds ? s.duration_seconds / 60 : 0), 0);
    const weeklyAverageMinutes = lastWeekSessions.length > 0 ? weeklyTotalMinutes / 7 : 0; 

    return {
        todaysFocusMinutes: Math.round(todaysFocusMinutes),
        weeklyAverageMinutes: Math.round(weeklyAverageMinutes),
        focusSessionsToday: todaysSessions.length,
    };
}

export function Dashboard() {
  const { toast } = useToast();
  const { session, user } = useAuth();
  const navigate = useNavigate();
  const [isLoading, setIsLoading] = useState(true);
  const [activeTab, setActiveTab] = useState("overview");

  const [allFocusSessions, setAllFocusSessions] = useState<FocusSession[]>([]);
  const [recentFocusSessions, setRecentFocusSessions] = useState<FocusSession[]>([]);
  const [energyLogs, setEnergyLogs] = useState<EnergyLog[]>([]);
  const [priorityTasks, setPriorityTasks] = useState<TodoItem[]>([]);
  
  const [userStats, setUserStats] = useState<UserStats>({
      todaysFocusMinutes: 0,
      weeklyAverageMinutes: 0,
      focusSessionsToday: 0,
      streak: { current: 0, longest: 0, lastCompletedDate: null },
  });
  const [currentEnergyMood, setCurrentEnergyMood] = useState<{ energy: number | null; mood: number | null; timestamp: string | null }>({ energy: null, mood: null, timestamp: null });
  const [recommendations, setRecommendations] = useState<Recommendation[]>([]);
  const [currentFocusStatus, setCurrentFocusStatus] = useState<{ isActive: boolean; session: FocusSession | null }>({ isActive: false, session: null });
  const [todaysGoalProgress, setTodaysGoalProgress] = useState({ current: 0, goal: 180 });

  const fetchData = useCallback(async () => {
    if (!user?.id) {
        setIsLoading(false);
        console.log("Dashboard: No user ID found, skipping fetch.");
        return;
    }
    setIsLoading(true);
    try {
      const [sessions, logs, tasks] = await Promise.all([
        focusSessionsApi.getRecent(user.id, 50),
        energyLevelsApi.getRecent(user.id, 10),
        tasksApi.getTasks(user.id),
      ]);

      setAllFocusSessions(sessions);
      setRecentFocusSessions(sessions.slice(0, 5));

      const typedLogs: EnergyLog[] = logs as EnergyLog[];
      setEnergyLogs(typedLogs);
      if (typedLogs.length > 0) {
        setCurrentEnergyMood({ 
          energy: typedLogs[0].energy_level, 
          mood: typedLogs[0].mood_level, 
          timestamp: typedLogs[0].timestamp 
        });
      }

      const typedTasks: TodoItem[] = tasks as TodoItem[];
      const highPriorityTasks = typedTasks
          .filter(task => !task.completed && task.priority === 'high')
          .sort((a, b) => parseISO(a.created_at).getTime() - parseISO(b.created_at).getTime())
          .slice(0, 5);
      setPriorityTasks(highPriorityTasks);

      const today = new Date();
      const calculatedStats = calculateUserStats(sessions, today);
      const streak = calculateStreak(sessions);
      setUserStats(prev => ({ ...prev, ...calculatedStats, streak }));

      const activeSession = sessions.find(s => !s.end_time);
      setCurrentFocusStatus({ isActive: !!activeSession, session: activeSession || null });

      setTodaysGoalProgress({ current: calculatedStats.todaysFocusMinutes ?? 0, goal: 180 });

      setRecommendations([
        { id: 'rec1', title: 'Start a Pomodoro', description: 'Boost productivity with timed focus intervals.', actionText: 'Start Timer', actionLink: '/app/pomodoro', icon: <Timer size={18} /> },
        { id: 'rec2', title: 'Review Tasks', description: 'Plan your day by reviewing your high-priority tasks.', actionText: 'View Tasks', actionLink: '/app/tasks', icon: <ListTodo size={18} /> }
      ]);

    } catch (error) {
      console.error("Error fetching dashboard data:", error);
      toast({ 
          title: "Error Loading Dashboard", 
          description: "Could not load some dashboard data. Please try again later.", 
          variant: "destructive" 
      });
    } finally {
      setIsLoading(false);
    }
  }, [user?.id, toast]);

  useEffect(() => {
    fetchData();
  }, [fetchData]);

  const handleStartPomodoro = () => navigate('/app/pomodoro');
  const handleStartCustomTimer = () => navigate('/app/pomodoro', { state: { startCustom: true } }); 
  const handleLogEnergy = () => navigate('/app/mood'); 
  const handleViewTasks = () => navigate('/app/tasks');

  const taskData = [
    { name: 'Research', completed: 8, total: 10, percentComplete: 80 },
    { name: 'Development', completed: 15, total: 20, percentComplete: 75 },
    { name: 'Review', completed: 5, total: 5, percentComplete: 100 },
    { name: 'Documentation', completed: 2, total: 8, percentComplete: 25 },
    { name: 'Testing', completed: 12, total: 15, percentComplete: 80 }
  ];

  const taskTimeData = [
    { name: 'Mon', planned: 4, actual: 3.5 },
    { name: 'Tue', planned: 5, actual: 4.2 },
    { name: 'Wed', planned: 3, actual: 4.5 },
    { name: 'Thu', planned: 6, actual: 5 },
    { name: 'Fri', planned: 4, actual: 3.8 }
  ];

  const deadlineData = [
    { name: 'Today', tasks: 3 },
    { name: 'Tomorrow', tasks: 5 },
    { name: 'Next 3 days', tasks: 8 },
    { name: 'Next week', tasks: 12 },
    { name: 'Later', tasks: 7 }
  ];

  const focusChartData = allFocusSessions.slice(0, 7).map(session => ({
    date: format(parseISO(session.start_time), 'MM/dd'),
    duration: Math.round((session.duration_seconds || 0) / 60),
    type: session.focus_type
  }));

  const focusByDay = allFocusSessions.reduce((acc: { [key: string]: number }, session) => {
    const day = format(parseISO(session.start_time), 'EEE');
    const duration = (session.duration_seconds || 0) / 60;
    
    if (!acc[day]) {
      acc[day] = 0;
    }
    
    acc[day] += duration;
    return acc;
  }, {});

  const weeklyFocusData = Object.keys(focusByDay).map(day => ({
    day,
    minutes: Math.round(focusByDay[day])
  }));

  const focusTypeData = allFocusSessions.reduce((acc: { [key: string]: number }, session) => {
    const type = session.focus_type || 'Unspecified';
    const duration = (session.duration_seconds || 0) / 60;
    
    if (!acc[type]) {
      acc[type] = 0;
    }
    
    acc[type] += duration;
    return acc;
  }, {});

  const focusTypeChartData = Object.keys(focusTypeData).map(type => ({
    name: type,
    value: Math.round(focusTypeData[type])
  }));

  const COLORS = ['#0088FE', '#00C49F', '#FFBB28', '#FF8042', '#8884d8'];

  if (isLoading) {
    return (
      <div className="p-8 space-y-6">
        <Skeleton className="h-8 w-1/4" />
        <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-3">
          <Skeleton className="h-32" />
          <Skeleton className="h-32" />
          <Skeleton className="h-32" />
        </div>
        <Skeleton className="h-10 w-full" /> 
        <Skeleton className="h-64 w-full" />
      </div>
    );
  }

  return (
    <TooltipProvider>
      <div className="flex-1 space-y-4 p-4 md:p-8 pt-6">
        <div className="flex items-center justify-between space-y-2">
          <h2 className="text-3xl font-bold tracking-tight">Dashboard</h2>
        </div>

        <Tabs value={activeTab} onValueChange={setActiveTab} className="space-y-4">
          <TabsList>
            <TabsTrigger value="overview">Overview</TabsTrigger>
            <TabsTrigger value="focus">Focus Summary</TabsTrigger>
            <TabsTrigger value="tasks">Task Insights</TabsTrigger>
            <TabsTrigger value="energy-mood">Energy & Mood</TabsTrigger>
            <TabsTrigger value="recommendations">Recommendations</TabsTrigger>
          </TabsList>

          <TabsContent value="overview" className="space-y-4">
            <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-4">
              <Card>
                <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
                  <CardTitle className="text-sm font-medium">Focus Status</CardTitle>
                  {currentFocusStatus.isActive ? <Timer className="h-4 w-4 text-green-500 animate-pulse" /> : <Play className="h-4 w-4 text-muted-foreground" />}
                </CardHeader>
                <CardContent>
                  {currentFocusStatus.isActive ? (
                    <>
                      <div className="text-2xl font-bold">Active</div>
                      <p className="text-xs text-muted-foreground">
                        {currentFocusStatus.session?.focus_type || 'Focusing'} for {formatDistanceToNowStrict(parseISO(currentFocusStatus.session!.start_time))} 
                      </p>
                      <Button size="sm" variant="outline" className="mt-2 w-full" onClick={() => navigate(`/app/sessions/${currentFocusStatus.session?.id}`)}>View Session</Button>
                    </>
                  ) : (
                    <>
                      <div className="text-2xl font-bold">Idle</div>
                      <p className="text-xs text-muted-foreground">Ready to start focusing?</p>
                      <div className="flex space-x-2 mt-2">
                         <Button size="sm" className="flex-1" onClick={handleStartPomodoro}><Timer size={14} className="mr-1"/> Pomodoro</Button>
                         <Button size="sm" variant="secondary" className="flex-1" onClick={handleStartCustomTimer}><Plus size={14} className="mr-1"/> Custom</Button>
                      </div>
                    </>
                  )}
                </CardContent>
              </Card>

              <Card>
                <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
                  <CardTitle className="text-sm font-medium">Today's Goal</CardTitle>
                  <Target className="h-4 w-4 text-muted-foreground" />
                </CardHeader>
                <CardContent>
                  <div className="text-2xl font-bold">{todaysGoalProgress.current} min</div>
                  <p className="text-xs text-muted-foreground">of {todaysGoalProgress.goal} min goal</p>
                  <Progress value={(todaysGoalProgress.current / todaysGoalProgress.goal) * 100} className="mt-2 h-2" />
                </CardContent>
              </Card>

              <Card>
                <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
                  <CardTitle className="text-sm font-medium">Key Stats</CardTitle>
                  <TrendingUp className="h-4 w-4 text-muted-foreground" />
                </CardHeader>
                <CardContent>
                   <div className="text-sm text-muted-foreground">Focus Today: <span className="font-bold text-primary">{userStats.todaysFocusMinutes} min</span></div>
                   <div className="text-sm text-muted-foreground">Weekly Avg: <span className="font-bold text-primary">{userStats.weeklyAverageMinutes} min/day</span></div>
                   <div className="text-sm text-muted-foreground">Current Streak: <span className="font-bold text-primary">{userStats.streak.current} day(s)</span></div>
                </CardContent>
              </Card>

              <Card>
                <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
                  <CardTitle className="text-sm font-medium">Energy & Mood</CardTitle>
                  <Zap className="h-4 w-4 text-muted-foreground" />
                </CardHeader>
                <CardContent>
                  {currentEnergyMood.timestamp ? (
                    <>
                       <div className="text-sm text-muted-foreground">Energy: <span className="font-bold text-primary">{currentEnergyMood.energy}/10</span></div>
                       <div className="text-sm text-muted-foreground">Mood: <span className="font-bold text-primary">{currentEnergyMood.mood}/10</span></div>
                       <p className="text-xs text-muted-foreground mt-1">Logged {formatDistanceToNowStrict(parseISO(currentEnergyMood.timestamp))} ago</p>
                    </>
                  ) : (
                    <p className="text-xs text-muted-foreground">No recent logs</p>
                  )}
                  <Button size="sm" variant="outline" className="mt-2 w-full" onClick={handleLogEnergy}>Log Now</Button>
                </CardContent>
              </Card>
            </div>

            <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-7">
               <Card className="col-span-4">
                  <CardHeader>
                    <CardTitle className="flex items-center justify-between">
                      <span>Priority Tasks</span>
                      <Button variant="ghost" size="sm" onClick={handleViewTasks}>View All <ChevronRight size={16} className="ml-1"/></Button>
                    </CardTitle>
                    <CardDescription>Top 5 high-priority tasks.</CardDescription>
                  </CardHeader>
                  <CardContent>
                    {priorityTasks.length > 0 ? (
                      <ul className="space-y-2">
                        {priorityTasks.map((task) => (
                          <li key={task.id} className="flex items-center justify-between text-sm p-2 hover:bg-muted/50 rounded-md">
                            <div>
                              <span className="truncate flex-1 mr-2" title={task.title}>{task.title}</span>
                              {task.due_date && <Badge variant="outline" className="text-xs mr-2">Due {format(parseISO(task.due_date), 'MMM d')}</Badge>}
                            </div>
                            <Badge variant={task.completed ? "default" : "secondary"}>{task.completed ? 'Completed' : 'Pending'}</Badge>
                          </li>
                        ))}
                      </ul>
                    ) : (
                      <p className="text-sm text-muted-foreground">No high-priority tasks pending. Great job!</p>
                    )}
                  </CardContent>
               </Card>

              <Card className="col-span-4 lg:col-span-3">
                <CardHeader>
                  <CardTitle>Quick Actions & Tips</CardTitle>
                  <CardDescription>Boost your focus instantly.</CardDescription>
                </CardHeader>
                <CardContent className="grid gap-2">
                   {recommendations.slice(0, 3).map(rec => (
                       <Button 
                         key={rec.id} 
                         variant="ghost" 
                         className="w-full justify-start h-auto p-3 text-left" 
                         onClick={() => rec.actionLink ? navigate(rec.actionLink) : rec.actionFunc?.()}
                       >
                         <div className="flex items-center">
                            <span className="mr-3 p-1.5 bg-muted rounded-md">{rec.icon || <Lightbulb size={18}/>}</span>
                            <div>
                                <div className="font-semibold text-sm">{rec.title}</div>
                                <div className="text-xs text-muted-foreground">{rec.description}</div>
                            </div>
                         </div>
                       </Button>
                   ))}
                </CardContent>
              </Card>
            </div>
          </TabsContent>

          <TabsContent value="focus">
            <div className="space-y-6">
              <Card>
                <CardHeader>
                  <CardTitle>Focus Sessions Summary</CardTitle>
                  <CardDescription>Your focus patterns over the last 7 days</CardDescription>
                </CardHeader>
                <CardContent>
                  {isLoading ? (
                    <div className="h-[300px] flex items-center justify-center">
                      <Skeleton className="h-[250px] w-full" />
                    </div>
                  ) : allFocusSessions.length === 0 ? (
                    <div className="h-[300px] flex flex-col items-center justify-center text-muted-foreground">
                      <Timer className="mb-2 h-12 w-12" />
                      <p>No focus sessions recorded yet</p>
                      <Button variant="outline" size="sm" className="mt-2">
                        <Play className="mr-2 h-4 w-4" /> Start a Focus Session
                      </Button>
                    </div>
                  ) : (
                    <ResponsiveContainer width="100%" height={300}>
                      <ReBarChart data={focusChartData} margin={{ top: 20, right: 30, left: 20, bottom: 5 }}>
                        <CartesianGrid strokeDasharray="3 3" />
                        <XAxis dataKey="date" />
                        <YAxis label={{ value: 'Minutes', angle: -90, position: 'insideLeft' }} />
                        <ReTooltip formatter={(value) => [`${value} mins`, 'Duration']} />
                        <Legend />
                        <Bar dataKey="duration" name="Focus Duration (mins)" fill="#8884d8" />
                      </ReBarChart>
                    </ResponsiveContainer>
                  )}
                </CardContent>
              </Card>

              <div className="grid gap-6 grid-cols-1 md:grid-cols-2">
                <Card>
                  <CardHeader>
                    <CardTitle className="text-base">Focus by Day of Week</CardTitle>
                  </CardHeader>
                  <CardContent>
                    {isLoading ? (
                      <Skeleton className="h-[200px] w-full" />
                    ) : (
                      <ResponsiveContainer width="100%" height={200}>
                        <ReBarChart data={weeklyFocusData}>
                          <CartesianGrid strokeDasharray="3 3" />
                          <XAxis dataKey="day" />
                          <YAxis />
                          <ReTooltip />
                          <Bar dataKey="minutes" name="Minutes" fill="#82ca9d" />
                        </ReBarChart>
                      </ResponsiveContainer>
                    )}
                  </CardContent>
                </Card>

                <Card>
                  <CardHeader>
                    <CardTitle className="text-base">Focus by Type</CardTitle>
                  </CardHeader>
                  <CardContent>
                    {isLoading ? (
                      <Skeleton className="h-[200px] w-full" />
                    ) : (
                      <ResponsiveContainer width="100%" height={200}>
                        <RePieChart>
                          <Pie
                            data={focusTypeChartData}
                            cx="50%"
                            cy="50%"
                            labelLine={false}
                            label={({ name, percent }) => `${name}: ${(percent * 100).toFixed(0)}%`}
                            outerRadius={80}
                            fill="#8884d8"
                            dataKey="value"
                          >
                            {focusTypeChartData.map((entry, index) => (
                              <Cell key={`cell-${index}`} fill={COLORS[index % COLORS.length]} />
                            ))}
                          </Pie>
                          <ReTooltip formatter={(value) => [`${value} mins`, 'Duration']} />
                        </RePieChart>
                      </ResponsiveContainer>
                    )}
                  </CardContent>
                </Card>
              </div>

              <Card>
                <CardHeader>
                  <CardTitle className="text-base">Focus Insights</CardTitle>
                </CardHeader>
                <CardContent>
                  <div className="space-y-4">
                    <div className="flex items-start">
                      <div className="mr-4 mt-0.5 bg-primary/10 p-2 rounded-full">
                        <TrendingUp className="h-5 w-5 text-primary" />
                      </div>
                      <div>
                        <h4 className="font-medium">Improvement Opportunity</h4>
                        <p className="text-sm text-muted-foreground">Your focus duration has increased by 15% compared to last week. Keep it up!</p>
                      </div>
                    </div>
                    <div className="flex items-start">
                      <div className="mr-4 mt-0.5 bg-primary/10 p-2 rounded-full">
                        <Target className="h-5 w-5 text-primary" />
                      </div>
                      <div>
                        <h4 className="font-medium">Peak Performance</h4>
                        <p className="text-sm text-muted-foreground">Your most productive day is Wednesday with an average of 2.5 hours of deep focus.</p>
                      </div>
                    </div>
                  </div>
                </CardContent>
              </Card>
            </div>
          </TabsContent>

          <TabsContent value="tasks">
            <div className="space-y-6">
              <Card>
                <CardHeader>
                  <CardTitle>Task Completion Rates</CardTitle>
                  <CardDescription>Progress on your current tasks by category</CardDescription>
                </CardHeader>
                <CardContent>
                  <ResponsiveContainer width="100%" height={300}>
                    <ReBarChart data={taskData} margin={{ top: 20, right: 30, left: 20, bottom: 5 }}>
                      <CartesianGrid strokeDasharray="3 3" />
                      <XAxis dataKey="name" />
                      <YAxis yAxisId="left" orientation="left" label={{ value: 'Tasks', angle: -90, position: 'insideLeft' }} />
                      <YAxis yAxisId="right" orientation="right" label={{ value: 'Completion %', angle: 90, position: 'insideRight' }} />
                      <ReTooltip />
                      <Legend />
                      <Bar yAxisId="left" dataKey="completed" name="Completed" stackId="a" fill="#8884d8" />
                      <Bar yAxisId="left" dataKey="total" name="Total" stackId="a" fill="#82ca9d" />
                      <Line yAxisId="right" type="monotone" dataKey="percentComplete" name="Completion %" stroke="#ff7300" />
                    </ReBarChart>
                  </ResponsiveContainer>
                </CardContent>
              </Card>

              <div className="grid gap-6 grid-cols-1 md:grid-cols-2">
                <Card>
                  <CardHeader>
                    <CardTitle className="text-base">Time Spent vs. Planned</CardTitle>
                  </CardHeader>
                  <CardContent>
                    <ResponsiveContainer width="100%" height={200}>
                      <ReBarChart data={taskTimeData} margin={{ top: 10, right: 10, left: 0, bottom: 5 }}>
                        <CartesianGrid strokeDasharray="3 3" />
                        <XAxis dataKey="name" />
                        <YAxis label={{ value: 'Hours', angle: -90, position: 'insideLeft' }} />
                        <ReTooltip />
                        <Legend />
                        <Bar dataKey="planned" name="Planned Hours" fill="#8884d8" />
                        <Bar dataKey="actual" name="Actual Hours" fill="#82ca9d" />
                      </ReBarChart>
                    </ResponsiveContainer>
                  </CardContent>
                </Card>

                <Card>
                  <CardHeader>
                    <CardTitle className="text-base">Upcoming Deadlines</CardTitle>
                  </CardHeader>
                  <CardContent>
                    <ResponsiveContainer width="100%" height={200}>
                      <RePieChart>
                        <Pie
                          data={deadlineData}
                          cx="50%"
                          cy="50%"
                          outerRadius={80}
                          fill="#8884d8"
                          dataKey="tasks"
                          nameKey="name"
                          label={({ name, value }) => `${name}: ${value}`}
                        >
                          {deadlineData.map((entry, index) => (
                            <Cell key={`cell-${index}`} fill={COLORS[index % COLORS.length]} />
                          ))}
                        </Pie>
                        <ReTooltip />
                      </RePieChart>
                    </ResponsiveContainer>
                  </CardContent>
                </Card>
              </div>

              <Card>
                <CardHeader>
                  <CardTitle className="text-base">Task Insights</CardTitle>
                </CardHeader>
                <CardContent>
                  <div className="space-y-4">
                    <div className="flex items-start">
                      <div className="mr-4 mt-0.5 bg-primary/10 p-2 rounded-full">
                        <Activity className="h-5 w-5 text-primary" />
                      </div>
                      <div>
                        <h4 className="font-medium">Task Efficiency</h4>
                        <p className="text-sm text-muted-foreground">You complete tasks most efficiently on Tuesday mornings. Consider scheduling important work then.</p>
                      </div>
                    </div>
                    <div className="flex items-start">
                      <div className="mr-4 mt-0.5 bg-primary/10 p-2 rounded-full">
                        <ListTodo className="h-5 w-5 text-primary" />
                      </div>
                      <div>
                        <h4 className="font-medium">Task Management</h4>
                        <p className="text-sm text-muted-foreground">You have 3 overdue tasks. Consider rescheduling or completing these tasks first.</p>
                      </div>
                    </div>
                  </div>
                </CardContent>
              </Card>
            </div>
          </TabsContent>

          <TabsContent value="energy-mood">
            <Card>
              <CardHeader><CardTitle>Energy & Mood Patterns</CardTitle></CardHeader>
              <CardContent>
                <div className="space-y-6">
                  <div className="grid gap-6 md:grid-cols-2">
                    <Card>
                      <CardHeader className="pb-2">
                        <CardTitle className="text-base">Energy Levels (Last 7 Days)</CardTitle>
                      </CardHeader>
                      <CardContent>
                        {isLoading ? (
                          <div className="h-[250px] flex items-center justify-center">
                            <Skeleton className="h-[200px] w-full" />
                          </div>
                        ) : energyLogs.length === 0 ? (
                          <div className="h-[250px] flex flex-col items-center justify-center text-muted-foreground">
                            <Activity className="mb-2 h-12 w-12" />
                            <p>No energy data recorded yet</p>
                            <Button variant="outline" size="sm" className="mt-2">
                              <Plus className="mr-2 h-4 w-4" /> Log Energy Level
                            </Button>
                          </div>
                        ) : (
                          <ResponsiveContainer width="100%" height={250}>
                            <AreaChart
                              data={energyLogs.slice(0, 7).map(log => ({
                                timestamp: format(parseISO(log.timestamp), 'MM/dd'),
                                energy: log.energy_level,
                                mood: log.mood_level
                              }))}
                              margin={{ top: 10, right: 10, left: 0, bottom: 20 }}
                            >
                              <defs>
                                <linearGradient id="colorEnergy" x1="0" y1="0" x2="0" y2="1">
                                  <stop offset="5%" stopColor="#8884d8" stopOpacity={0.8}/>
                                  <stop offset="95%" stopColor="#8884d8" stopOpacity={0.1}/>
                                </linearGradient>
                              </defs>
                              <XAxis dataKey="timestamp" />
                              <YAxis domain={[0, 10]} />
                              <CartesianGrid strokeDasharray="3 3" />
                              <ReTooltip />
                              <Area 
                                type="monotone" 
                                dataKey="energy" 
                                stroke="#8884d8" 
                                fillOpacity={1} 
                                fill="url(#colorEnergy)" 
                              />
                            </AreaChart>
                          </ResponsiveContainer>
                        )}
                      </CardContent>
                    </Card>
                    
                    <Card>
                      <CardHeader className="pb-2">
                        <CardTitle className="text-base">Mood Levels (Last 7 Days)</CardTitle>
                      </CardHeader>
                      <CardContent>
                        {isLoading ? (
                          <div className="h-[250px] flex items-center justify-center">
                            <Skeleton className="h-[200px] w-full" />
                          </div>
                        ) : energyLogs.length === 0 ? (
                          <div className="h-[250px] flex flex-col items-center justify-center text-muted-foreground">
                            <Activity className="mb-2 h-12 w-12" />
                            <p>No mood data recorded yet</p>
                            <Button variant="outline" size="sm" className="mt-2">
                              <Plus className="mr-2 h-4 w-4" /> Log Mood Level
                            </Button>
                          </div>
                        ) : (
                          <ResponsiveContainer width="100%" height={250}>
                            <AreaChart
                              data={energyLogs.slice(0, 7).map(log => ({
                                timestamp: format(parseISO(log.timestamp), 'MM/dd'),
                                energy: log.energy_level,
                                mood: log.mood_level
                              }))}
                              margin={{ top: 10, right: 10, left: 0, bottom: 20 }}
                            >
                              <defs>
                                <linearGradient id="colorMood" x1="0" y1="0" x2="0" y2="1">
                                  <stop offset="5%" stopColor="#82ca9d" stopOpacity={0.8}/>
                                  <stop offset="95%" stopColor="#82ca9d" stopOpacity={0.1}/>
                                </linearGradient>
                              </defs>
                              <XAxis dataKey="timestamp" />
                              <YAxis domain={[0, 10]} />
                              <CartesianGrid strokeDasharray="3 3" />
                              <ReTooltip />
                              <Area 
                                type="monotone" 
                                dataKey="mood" 
                                stroke="#82ca9d" 
                                fillOpacity={1} 
                                fill="url(#colorMood)" 
                              />
                            </AreaChart>
                          </ResponsiveContainer>
                        )}
                      </CardContent>
                    </Card>
                  </div>

                  <Card>
                    <CardHeader className="pb-2">
                      <CardTitle className="text-base">Energy & Focus Correlation</CardTitle>
                      <CardDescription>How your energy levels affect focus sessions</CardDescription>
                    </CardHeader>
                    <CardContent>
                      <ResponsiveContainer width="100%" height={250}>
                        <ReBarChart
                          data={[
                            { name: 'Low Energy', focus: 45, energy: 3 },
                            { name: 'Medium Energy', focus: 75, energy: 5 },
                            { name: 'High Energy', focus: 85, energy: 8 }
                          ]}
                          margin={{ top: 10, right: 10, left: 0, bottom: 20 }}
                        >
                          <XAxis dataKey="name" />
                          <YAxis yAxisId="left" orientation="left" stroke="#8884d8" />
                          <YAxis yAxisId="right" orientation="right" stroke="#82ca9d" />
                          <ReTooltip />
                          <Legend />
                          <Bar yAxisId="left" dataKey="focus" name="Focus Quality (%)" fill="#8884d8" />
                          <Bar yAxisId="right" dataKey="energy" name="Energy Level" fill="#82ca9d" />
                        </ReBarChart>
                      </ResponsiveContainer>
                    </CardContent>
                  </Card>
                </div>
              </CardContent>
            </Card>
          </TabsContent>

          <TabsContent value="recommendations">
            <Card>
              <CardHeader><CardTitle>Personalized Recommendations</CardTitle></CardHeader>
              <CardContent>
                <div className="space-y-6">
                  <Card>
                    <CardHeader className="pb-2">
                      <CardTitle className="text-base">Focus Optimization</CardTitle>
                    </CardHeader>
                    <CardContent>
                      <div className="space-y-4">
                        <div className="flex items-start">
                          <div className="mr-4 mt-0.5 bg-primary/10 p-2 rounded-full">
                            <Timer className="h-5 w-5 text-primary" />
                          </div>
                          <div>
                            <h4 className="font-medium">Optimal Focus Time</h4>
                            <p className="text-sm text-muted-foreground">Your data suggests your peak focus time is between 9am - 11am. Schedule your most important tasks during this period.</p>
                          </div>
                        </div>
                        <div className="flex items-start">
                          <div className="mr-4 mt-0.5 bg-primary/10 p-2 rounded-full">
                            <Activity className="h-5 w-5 text-primary" />
                          </div>
                          <div>
                            <h4 className="font-medium">Focus Session Length</h4>
                            <p className="text-sm text-muted-foreground">Your most productive sessions last 35 minutes. Try to structure your work around this interval for best results.</p>
                          </div>
                        </div>
                      </div>
                    </CardContent>
                  </Card>

                  <Card>
                    <CardHeader className="pb-2">
                      <CardTitle className="text-base">Energy Management</CardTitle>
                    </CardHeader>
                    <CardContent>
                      <div className="space-y-4">
                        <div className="flex items-start">
                          <div className="mr-4 mt-0.5 bg-primary/10 p-2 rounded-full">
                            <Zap className="h-5 w-5 text-primary" />
                          </div>
                          <div>
                            <h4 className="font-medium">Energy Recovery</h4>
                            <p className="text-sm text-muted-foreground">Your energy dips mid-afternoon. Try a 10-minute walk outdoors around 2:30pm to recharge.</p>
                          </div>
                        </div>
                        <div className="flex items-start">
                          <div className="mr-4 mt-0.5 bg-primary/10 p-2 rounded-full">
                            <Lightbulb className="h-5 w-5 text-primary" />
                          </div>
                          <div>
                            <h4 className="font-medium">Task Optimization</h4>
                            <p className="text-sm text-muted-foreground">Schedule creative work for when your mood rating is highest, which tends to be in the morning.</p>
                          </div>
                        </div>
                      </div>
                    </CardContent>
                  </Card>

                  <div className="text-center">
                    <Button className="mt-4" variant="outline" size="sm">
                      <Sparkles className="mr-2 h-4 w-4" /> 
                      Generate More Recommendations
                    </Button>
                  </div>
                </div>
              </CardContent>
            </Card>
          </TabsContent>
        </Tabs>
      </div>
    </TooltipProvider>
  );
};
