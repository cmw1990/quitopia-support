import React, { useEffect, useState } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import { Card, CardContent, CardDescription, CardFooter, CardHeader, CardTitle } from '../ui/card';
import { Button } from '../ui/button';
import { Progress } from '../ui/progress';
import { Badge } from '../ui/badge';
import { toast } from 'sonner';
import { useAuth } from '../AuthProvider';
import { Tooltip, TooltipContent, TooltipProvider, TooltipTrigger } from "@/components/ui/tooltip";
import { 
  Clock, 
  Check, 
  PlayCircle, 
  LineChart, 
  Calendar, 
  CheckCircle, 
  Timer,
  Brain,
  Zap,
  Trophy,
  BatteryCharging,
  ArrowRight,
  Ban,
  Coffee,
  Loader2,
  ListTodo,
  ClipboardCheck,
  Star,
  Award,
  Info,
  Target,
  BatteryLow,
  BatteryMedium,
  BatteryFull
} from 'lucide-react';
import { 
  getDashboardData,
  DashboardData,
  FocusSession, 
  EnergyLevel, 
  FocusTask, 
  FocusAchievement,
  FocusSettings,
  getFocusSettings,
  createFocusMood
} from '@/api/supabaseClient';
import { motion } from 'framer-motion';
import { MotivationalQuote } from '@/components/MotivationalQuote';
import { cn } from '@/lib/utils';

const initialDashboardData: DashboardData = {
  stats: { 
    totalSessions: 0, 
    completedSessions: 0, 
    totalMinutes: 0, 
    streak: 0, 
    completionRate: 0, 
    avgSessionLength: 0 
  },
  recentSessions: [],
  energyLevels: [],
  tasks: [],
  achievements: [],
  focusScore: 0,
  streakDates: []
};

interface EnergyLevelCheckinProps {
  userId: string;
  onLevelSaved?: (level: number) => void;
}

const EnergyLevelCheckin: React.FC<EnergyLevelCheckinProps> = ({ userId, onLevelSaved }) => {
  const [selectedLevel, setSelectedLevel] = useState<number | null>(null);
  const [isSaving, setIsSaving] = useState(false);

  const handleSelectLevel = async (level: number) => {
    if (isSaving) return;
    setSelectedLevel(level);
    setIsSaving(true);

    try {
      await createFocusMood({ user_id: userId, energy_level: level });
      toast.success(`Energy level set to ${level}.`);
      if (onLevelSaved) {
        onLevelSaved(level);
      }
    } catch (error) {
      console.error("Failed to save energy level:", error);
      toast.error("Failed to save energy level. Please try again.");
      setSelectedLevel(null);
    } finally {
      setIsSaving(false);
    }
  };

  const energyOptions: { levelValue: number; icon: React.ReactNode; label: string }[] = [
    { levelValue: 1, icon: <BatteryLow className="h-5 w-5 text-red-500" />, label: 'Low' },
    { levelValue: 3, icon: <BatteryMedium className="h-5 w-5 text-yellow-500" />, label: 'Medium' },
    { levelValue: 5, icon: <BatteryFull className="h-5 w-5 text-green-500" />, label: 'High' },
  ];

  return (
    <Card>
      <CardHeader className="pb-3">
        <CardTitle className="text-base font-semibold flex items-center gap-2">
          <BatteryCharging className="h-5 w-5 text-primary/80" />
          How's Your Energy?
        </CardTitle>
        <CardDescription className="text-xs">Quickly log your current focus energy.</CardDescription>
      </CardHeader>
      <CardContent>
        <div className="flex justify-around items-center gap-3">
          {energyOptions.map((option) => (
            <Tooltip key={option.levelValue}>
              <TooltipTrigger asChild>
                <Button
                  variant={selectedLevel === option.levelValue ? 'secondary' : 'ghost'}
                  size="lg"
                  className={cn(
                    "flex flex-col items-center justify-center h-auto p-4 gap-1.5 rounded-lg border border-transparent transition-all",
                    selectedLevel === option.levelValue && 'border-primary/50 bg-primary/10',
                    selectedLevel && selectedLevel !== option.levelValue && 'opacity-60',
                    isSaving && 'cursor-not-allowed'
                  )}
                  onClick={() => handleSelectLevel(option.levelValue)}
                  disabled={isSaving}
                >
                  {isSaving && selectedLevel === option.levelValue ? (
                    <Loader2 className="h-5 w-5 animate-spin" />
                  ) : (
                    option.icon
                  )}
                  <span className="text-sm font-medium">{option.label}</span>
                </Button>
              </TooltipTrigger>
              <TooltipContent>
                <p>Set energy to {option.label}</p>
              </TooltipContent>
            </Tooltip>
          ))}
        </div>
      </CardContent>
    </Card>
  );
};

export function Dashboard() {
  const [dashboardData, setDashboardData] = useState<DashboardData>(initialDashboardData);
  const [isLoading, setIsLoading] = useState(true);
  const [settings, setSettings] = useState<FocusSettings | null>(null);
  
  const { user } = useAuth();
  const navigate = useNavigate();

  useEffect(() => {
    if (user) {
      loadDashboardData();
      loadSettings();
    } else {
      navigate('/auth/login');
    }
  }, [user, navigate]);

  const loadDashboardData = async () => {
    if (!user) return;
    
    setIsLoading(true);
    
    try {
      const data = await getDashboardData(user.id);
      setDashboardData(data);
    } catch (error) {
      console.error('Error loading dashboard data:', error);
      toast.error('Failed to load dashboard data');
      setDashboardData(initialDashboardData); 
    } finally {
      setIsLoading(false);
    }
  };

  const loadSettings = async () => {
    try {
      const loadedSettings = await getFocusSettings();
      setSettings(loadedSettings);
    } catch (error) {
      console.error("Failed to load settings:", error);
    }
  };

  const formatTime = (minutes: number): string => {
    const hours = Math.floor(minutes / 60);
    const mins = Math.floor(minutes % 60);
    
    if (hours > 0) {
      return `${hours}h ${mins}m`;
    }
    return `${mins} min`;
  };
  
  const getFocusTypeIcon = (type: string) => {
    switch (type) {
      case 'pomodoro':
        return <Clock className="h-4 w-4" />;
      case 'deep_work':
        return <Brain className="h-4 w-4" />;
      case 'flow':
        return <Zap className="h-4 w-4" />;
      default:
        return <Clock className="h-4 w-4" />;
    }
  };
  
  const getFocusScoreColor = () => {
    if (dashboardData.focusScore >= 80) return "text-emerald-500";
    if (dashboardData.focusScore >= 60) return "text-blue-500";
    if (dashboardData.focusScore >= 40) return "text-amber-500";
    return "text-rose-500";
  };
  
  const getFocusScoreLabel = () => {
    if (dashboardData.focusScore >= 80) return "Excellent";
    if (dashboardData.focusScore >= 60) return "Good";
    if (dashboardData.focusScore >= 40) return "Average";
    return "Needs Improvement";
  };

  const dailyGoalMinutes = settings?.pomodoro_work_minutes ? settings.pomodoro_work_minutes * (settings.pomodoro_long_break_interval ?? 4) * 2 : 120;
  const todaysFocusMinutes = dashboardData.stats.totalMinutes;
  const dailyGoalProgress = dailyGoalMinutes > 0 ? Math.min(100, (todaysFocusMinutes / dailyGoalMinutes) * 100) : 0;

  if (isLoading) {
    return (
      <div className="flex flex-col items-center justify-center min-h-[500px]">
        <Loader2 className="h-12 w-12 animate-spin text-primary/70" />
        <p className="mt-4 text-muted-foreground">Loading your dashboard...</p>
      </div>
    );
  }

  const listItemVariants = {
    hidden: { opacity: 0, y: 10 },
    visible: (i: number) => ({
      opacity: 1,
      y: 0,
      transition: { delay: i * 0.05, duration: 0.3, ease: "easeOut" }
    }),
  };

  return (
    <TooltipProvider>
      <motion.div 
        className="container mx-auto px-4 py-8"
        initial={{ opacity: 0 }}
        animate={{ opacity: 1 }}
        transition={{ duration: 0.5 }}
      >
        <div className="max-w-7xl mx-auto">
          <div className="flex flex-col md:flex-row md:justify-between md:items-center gap-4 mb-10">
            <div>
              <h1 className="text-3xl font-bold tracking-tight">Dashboard</h1>
              <p className="text-muted-foreground text-lg">
                Welcome back! Here's your focus overview.
              </p>
            </div>
            <Link to="/app/focus-session-planner">
              <Button size="lg" className="gap-2 shadow-sm hover:shadow-md transition-shadow">
                <PlayCircle className="h-5 w-5" /> Plan New Focus Session
              </Button>
            </Link>
          </div>

          <motion.div 
            className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-5 gap-6 mb-10"
            initial="hidden"
            animate="visible"
            variants={{ visible: { transition: { staggerChildren: 0.1 } } }}
          >
            <motion.div variants={listItemVariants}>
              <Card>
                <Tooltip>
                  <TooltipTrigger asChild>
                    <CardHeader className="pb-2 flex flex-row justify-between items-center cursor-help">
                      <CardTitle className="text-sm font-medium text-muted-foreground">
                        Focus Score
                      </CardTitle>
                      <Info className="h-4 w-4 text-muted-foreground/70"/>
                    </CardHeader>
                  </TooltipTrigger>
                  <TooltipContent>
                    <p className="text-xs max-w-xs">
                      Calculated based on your focus streak, session completion rate, 
                      total sessions, and total focus time. Aim for 80+!
                    </p>
                  </TooltipContent>
                </Tooltip>
                <CardContent>
                  <div className="flex items-center">
                    <div className={`text-4xl font-bold ${getFocusScoreColor()}`}>
                      {dashboardData.focusScore}
                    </div>
                    <div className="text-lg ml-1 mt-1 text-muted-foreground">/100</div>
                  </div>
                  <p className="text-sm text-muted-foreground mt-1">{getFocusScoreLabel()}</p>
                  <Progress 
                    value={dashboardData.focusScore} 
                    max={100} 
                    className="h-2 mt-2"
                  />
                </CardContent>
              </Card>
            </motion.div>
            
            <motion.div variants={listItemVariants}><Card>
              <CardHeader className="pb-2">
                <CardTitle className="text-sm font-medium text-muted-foreground">
                  Focus Streak
                </CardTitle>
              </CardHeader>
              <CardContent>
                <div className="flex flex-col">
                  <div className="flex items-baseline">
                    <div className="text-4xl font-bold">{dashboardData.stats.streak}</div>
                    <div className="text-sm ml-2 text-muted-foreground">days</div>
                  </div>
                  <div className="flex space-x-1 mt-2">
                    {Array.from({ length: 7 }).map((_, i) => {
                      const isActive = i < dashboardData.streakDates.length;
                      return (
                        <div 
                          key={i}
                          className={`h-2 flex-1 rounded-full ${
                            isActive ? 'bg-green-500' : 'bg-gray-200 dark:bg-gray-700'
                          }`}
                        />
                      );
                    })}
                  </div>
                  <p className="text-sm text-muted-foreground mt-1">
                    {dashboardData.stats.streak > 0 
                      ? `Keep it up! ${dashboardData.stats.streak} consecutive days` 
                      : "Start your streak today!"}
                  </p>
                </div>
              </CardContent>
            </Card></motion.div>
            
            <motion.div variants={listItemVariants}><Card>
              <CardHeader className="pb-2">
                <CardTitle className="text-sm font-medium text-muted-foreground">
                  Total Focus Time
                </CardTitle>
              </CardHeader>
              <CardContent>
                <div className="flex items-baseline">
                  <div className="text-4xl font-bold">{formatTime(dashboardData.stats.totalMinutes)}</div>
                </div>
                <p className="text-sm text-muted-foreground mt-1">
                  Across {dashboardData.stats.completedSessions} completed sessions
                </p>
                <div className="mt-2 flex items-center text-sm">
                  <div className="text-green-500 mr-1">
                    <CheckCircle className="h-4 w-4" />
                  </div>
                  <span>{Math.round(dashboardData.stats.completionRate)}% completion rate</span>
                </div>
              </CardContent>
            </Card></motion.div>
            
            <motion.div variants={listItemVariants}><Card>
              <CardHeader className="pb-2">
                <CardTitle className="text-sm font-medium text-muted-foreground">
                  Average Session
                </CardTitle>
              </CardHeader>
              <CardContent>
                <div className="flex items-baseline">
                  <div className="text-4xl font-bold">{formatTime(dashboardData.stats.avgSessionLength)}</div>
                </div>
                <p className="text-sm text-muted-foreground mt-1">
                  Per completed session
                </p>
                <div className="mt-2 flex items-center text-sm">
                  <div className="text-blue-500 mr-1">
                    <Timer className="h-4 w-4" />
                  </div>
                  <span>Total of {dashboardData.stats.totalSessions} sessions</span>
                </div>
              </CardContent>
            </Card></motion.div>
            
            <motion.div variants={listItemVariants}>
              <Card>
                <CardHeader className="pb-2">
                  <CardTitle className="text-sm font-medium text-muted-foreground flex items-center gap-1">
                    <Target className="h-4 w-4"/> Daily Goal
                  </CardTitle>
                </CardHeader>
                <CardContent>
                  <div className="flex items-baseline">
                     <div className="text-4xl font-bold">{Math.round(dailyGoalProgress)}%</div>
                   </div>
                   <p className="text-xs text-muted-foreground mt-1">
                     {formatTime(todaysFocusMinutes)} / {formatTime(dailyGoalMinutes)} focused
                   </p>
                   <Progress 
                     value={dailyGoalProgress} 
                     max={100} 
                     className="h-2 mt-2"
                   />
                 </CardContent>
               </Card>
             </motion.div>
          </motion.div>

          <div className="grid grid-cols-1 lg:grid-cols-3 gap-6 my-10">
            <div className="lg:col-span-2">
              <MotivationalQuote />
            </div>
            <div className="">
              {user && <EnergyLevelCheckin userId={user.id} />}
            </div>
          </div>

          <div className="grid grid-cols-1 lg:grid-cols-3 gap-6 mt-8">
            <div className="space-y-6">
              <Card>
                <CardHeader>
                  <CardTitle className="flex items-center">
                    <ListTodo className="h-5 w-5 mr-2" /> Priority Tasks
                  </CardTitle>
                  <CardDescription>
                    Your most important tasks for today
                  </CardDescription>
                </CardHeader>
                <CardContent>
                  {dashboardData.tasks.length === 0 ? (
                    <div className="text-center py-8 text-muted-foreground">
                      <ClipboardCheck className="h-10 w-10 mx-auto mb-3 opacity-50" />
                      <p>No priority tasks found.</p>
                      <Link to="/app/tasks">
                        <Button variant="outline" size="sm" className="mt-3">Manage Tasks</Button>
                      </Link>
                    </div>
                  ) : (
                    <motion.div 
                      className="space-y-3"
                      initial="hidden"
                      animate="visible"
                      variants={{ visible: { transition: { staggerChildren: 0.07 } } }}
                    >
                      {dashboardData.tasks.map((task, index) => (
                        <motion.div 
                          key={task.id} 
                          custom={index}
                          variants={listItemVariants}
                          whileHover={{ backgroundColor: 'hsl(var(--accent) / 0.7)'}}
                          className="flex items-center justify-between p-3 rounded-lg border bg-card cursor-pointer transition-colors"
                          onClick={() => navigate(`/app/tasks/${task.id}`)}
                        >
                          <div className="flex items-center overflow-hidden mr-2">
                            <div className={`mr-3 size-4 rounded-sm border ${task.priority === 'high' ? 'border-destructive' : task.priority === 'medium' ? 'border-yellow-500' : 'border-muted-foreground'}`}></div>
                            <span className="truncate font-medium text-sm">{task.title}</span>
                          </div>
                          <Badge variant={task.priority === 'high' ? 'destructive' : 'outline'} className="capitalize text-xs flex-shrink-0">
                            {task.priority}
                          </Badge>
                        </motion.div>
                      ))}
                    </motion.div>
                  )}
                </CardContent>
                {dashboardData.tasks.length > 0 && (
                  <CardFooter className="flex justify-center border-t px-6 py-3">
                    <Link to="/app/tasks">
                      <Button variant="ghost" size="sm" className="gap-1 text-primary hover:text-primary/80">
                        View all tasks <ArrowRight className="h-4 w-4 ml-1" />
                      </Button>
                    </Link>
                  </CardFooter>
                )}
              </Card>

              <Card>
                <CardHeader>
                  <CardTitle className="flex items-center">
                    <Trophy className="h-5 w-5 mr-2 text-yellow-500" /> Recent Achievements
                  </CardTitle>
                  <CardDescription>
                    Milestones you've recently unlocked
                  </CardDescription>
                </CardHeader>
                <CardContent>
                  {dashboardData.achievements.length === 0 ? (
                    <div className="text-center py-8 text-muted-foreground">
                      <Award className="h-10 w-10 mx-auto mb-3 opacity-50" />
                      <p>No achievements earned yet.</p>
                      <p className="text-xs mt-1">Keep focusing to unlock them!</p>
                    </div>
                  ) : (
                    <motion.div 
                      className="space-y-3"
                      initial="hidden"
                      animate="visible"
                      variants={{ visible: { transition: { staggerChildren: 0.07 } } }}
                    >
                      {dashboardData.achievements.map((ach, index) => (
                        <motion.div 
                          key={ach.id} 
                          custom={index}
                          variants={listItemVariants}
                          className="flex items-center p-3 rounded-lg border bg-card"
                        >
                          <div className="p-2 rounded-full bg-yellow-500/10 mr-3">
                            <Star className="h-5 w-5 text-yellow-600" />
                          </div>
                          <div>
                            <div className="font-medium text-sm">{ach.name}</div>
                            <div className="text-xs text-muted-foreground">
                              Unlocked on {ach.completion_date ? new Date(ach.completion_date).toLocaleDateString() : 'N/A'}
                            </div>
                          </div>
                        </motion.div>
                      ))}
                    </motion.div>
                  )}
                </CardContent>
                {dashboardData.achievements.length > 0 && (
                  <CardFooter className="flex justify-center border-t px-6 py-3">
                    <Link to="/app/achievements">
                      <Button variant="ghost" size="sm" className="gap-1">
                        View all achievements <ArrowRight className="h-4 w-4 ml-1" />
                      </Button>
                    </Link>
                  </CardFooter>
                )}
              </Card>
            </div>
            
            <Card className="lg:col-span-2 shadow-sm hover:shadow-md transition-shadow">
              <CardHeader>
                <CardTitle className="flex items-center">
                  <Calendar className="h-5 w-5 mr-2" /> Recent Focus Sessions
                </CardTitle>
                <CardDescription>
                  Your latest focus sessions and their outcomes
                </CardDescription>
              </CardHeader>
              <CardContent>
                {dashboardData.recentSessions.length === 0 ? (
                  <div className="text-center py-12">
                    <Coffee className="h-12 w-12 mx-auto mb-4 text-muted-foreground/50" />
                    <p className="text-muted-foreground">No focus sessions recorded yet.</p>
                    <p className="text-sm text-muted-foreground mt-1">
                      Start your first focus session to begin tracking your progress.
                    </p>
                    <Link to="/app/focus-timer" className="mt-4 inline-block">
                      <Button variant="outline" className="mt-2">Start Your First Session</Button>
                    </Link>
                  </div>
                ) : (
                  <motion.div 
                    className="space-y-4"
                    initial="hidden"
                    animate="visible"
                    variants={{ visible: { transition: { staggerChildren: 0.07 } } }}
                  >
                    {dashboardData.recentSessions.map((session, index) => (
                      <motion.div 
                        key={session.id} 
                        custom={index}
                        variants={listItemVariants}
                        className="flex flex-col sm:flex-row justify-between p-4 rounded-lg border bg-card transition-colors hover:bg-muted/50"
                      >
                        <div className="flex flex-col">
                          <div className="font-medium">
                            {session.notes || 'Untitled Session'}
                          </div>
                          <div className="flex items-center mt-1">
                            <Badge 
                              variant="outline" 
                              className="flex items-center gap-1 text-xs"
                            >
                              {getFocusTypeIcon(session.focus_type)}
                              {session.focus_type.replace('_', ' ')}
                            </Badge>
                            <span className="text-muted-foreground text-xs ml-2">
                              {new Date(session.start_time).toLocaleDateString('en-US', {
                                month: 'short',
                                day: 'numeric',
                                hour: '2-digit',
                                minute: '2-digit'
                              })}
                            </span>
                          </div>
                        </div>
                        <div className="flex items-center mt-2 sm:mt-0">
                          <div className="flex items-center mr-4">
                            <Timer className="h-4 w-4 mr-1 text-muted-foreground" />
                            <span>
                              {formatTime(session.duration_minutes)}
                            </span>
                          </div>
                          {session.completed ? (
                            <Badge variant="outline" className="flex items-center gap-1 bg-green-100 text-green-700 dark:bg-green-900/30 dark:text-green-400">
                              <Check className="h-3 w-3" /> Completed
                            </Badge>
                          ) : (
                            <Badge variant="secondary" className="flex items-center gap-1">
                              {session.status || 'In Progress'}
                            </Badge>
                          )}
                        </div>
                      </motion.div>
                    ))}
                  </motion.div>
                )}
              </CardContent>
              {dashboardData.recentSessions.length > 0 && (
                <CardFooter className="flex justify-center border-t px-6 py-4">
                  <Link to="/app/analytics">
                    <Button variant="ghost" className="gap-1 text-primary hover:text-primary/80">
                      View focus history <ArrowRight className="h-4 w-4 ml-1" />
                    </Button>
                  </Link>
                </CardFooter>
              )}
            </Card>
          </div>
        </div>
      </motion.div>
    </TooltipProvider>
  );
} 