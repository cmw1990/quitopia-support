import React, { useState } from 'react';
import { motion } from 'framer-motion';
import { Card, CardContent, CardHeader, CardTitle, CardDescription, CardFooter } from '../ui/card';
import { Badge } from '../ui/badge';
import { Button } from '../ui/button';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '../ui/tabs';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '../ui/select';
import { Calendar } from '../ui/calendar';
import { Popover, PopoverContent, PopoverTrigger } from '../ui/popover';
import { format, isSameDay, parseISO, startOfWeek, endOfWeek, eachDayOfInterval, addDays, subDays } from 'date-fns';
import {
  BarChart2,
  Clock,
  Zap,
  Brain,
  Calendar as CalendarIcon,
  TrendingUp,
  Award,
  Target,
  Flame,
  Trophy,
  ChevronDown,
  ChevronLeft, 
  ChevronRight,
  ArrowUpRight,
  ArrowDownRight,
  BarChart,
  LineChart,
  PieChart,
  Activity,
  Coffee,
  Moon,
  Sun,
  Laptop,
  Lightbulb,
  BookOpen,
  Battery,
  Timer,
  Star,
  CircleOff,
  CheckCircle,
  MapPin,
  Dot,
  Compass,
  Lock
} from 'lucide-react';
import { Progress } from '../ui/progress';

interface FocusSession {
  id: string;
  start_time: string;
  end_time?: string;
  duration_seconds: number;
  focus_type: 'pomodoro' | 'deep_work' | 'flow';
  completed: boolean;
  energy_level?: number;
  focus_level?: number;
  distractions?: string[];
  tasks_completed?: number;
  context?: string;
  tags?: string[];
  notes?: string;
}

interface FocusStatsProps {
  sessions: FocusSession[];
  streakCount: number;
  totalFocusTime: number;
}

interface TimeOfDayData {
  period: string;
  sessions: number;
  avgFocus: number;
  avgEnergy: number;
  icon: React.ElementType;
  color: string;
}

interface WeekdayData {
  day: string;
  sessions: number;
  totalMinutes: number;
  avgFocus: number;
}

interface ContextData {
  context: string;
  sessions: number;
  totalMinutes: number;
  avgFocus: number;
  percentage: number;
}

interface Insight {
  title: string;
  description: string;
  icon: React.ElementType;
  color: string;
  score?: number;
}

interface FlowPattern {
  type: string;
  description: string;
  icon: React.ElementType;
  strength: 'high' | 'medium' | 'low';
}

export function FocusStats({
  sessions,
  streakCount,
  totalFocusTime
}: FocusStatsProps) {
  const completedSessions = sessions.filter((s) => s.completed);
  const averageEnergyLevel =
    completedSessions.reduce((acc, s) => acc + (s.energy_level || 0), 0) /
    completedSessions.length || 0;
  const averageFocusLevel =
    completedSessions.reduce((acc, s) => acc + (s.focus_level || 0), 0) /
    completedSessions.length || 0;
  const completionRate =
    (completedSessions.length / (sessions.length || 1)) * 100;

  const formatDuration = (seconds: number) => {
    const hours = Math.floor(seconds / 3600);
    const minutes = Math.floor((seconds % 3600) / 60);
    if (hours > 0) {
      return `${hours}h ${minutes}m`;
    }
    return `${minutes}m`;
  };

  const getFocusTypeDistribution = () => {
    const distribution = completedSessions.reduce(
      (acc, session) => {
        acc[session.focus_type] = (acc[session.focus_type] || 0) + 1;
        return acc;
      },
      {} as Record<string, number>
    );

    const total = Object.values(distribution).reduce((a, b) => a + b, 0);
    return Object.entries(distribution).map(([type, count]) => ({
      type,
      percentage: Math.round((count / total) * 100),
      count
    }));
  };

  const getAchievements = () => {
    const achievements = [];
    
    if (streakCount >= 3) {
      achievements.push({
        title: 'Focus Streak',
        description: `${streakCount} days in a row!`,
        icon: Flame,
      });
    }
    
    if (completedSessions.length >= 10) {
      achievements.push({
        title: 'Focus Master',
        description: '10+ completed sessions',
        icon: Trophy,
      });
    }
    
    if (totalFocusTime >= 7200) { // 2 hours
      achievements.push({
        title: 'Time Champion',
        description: '2+ hours of focus time',
        icon: Clock,
      });
    }
    
    if (averageFocusLevel >= 7) {
      achievements.push({
        title: 'Deep Focus',
        description: 'High focus level maintained',
        icon: Target,
      });
    }

    return achievements;
  };

  return (
    <div className="w-full space-y-4">
      <div className="flex items-center justify-between">
        <h2 className="text-2xl font-bold">Focus Analytics</h2>
        <Select 
          value={dateRange} 
          onValueChange={(value) => setDateRange(value as 'week' | 'month' | 'year')}
        >
          <SelectTrigger className="w-[180px]">
            <SelectValue placeholder="Select time range" />
          </SelectTrigger>
          <SelectContent>
            <SelectItem value="week">Last Week</SelectItem>
            <SelectItem value="month">Last Month</SelectItem>
            <SelectItem value="year">Last Year</SelectItem>
          </SelectContent>
        </Select>
      </div>
      
      <Tabs defaultValue="overview" value={activeTab} onValueChange={setActiveTab}>
        <TabsList className="grid w-full grid-cols-5">
          <TabsTrigger value="overview">Overview</TabsTrigger>
          <TabsTrigger value="patterns">Patterns</TabsTrigger>
          <TabsTrigger value="insights">Insights</TabsTrigger>
          <TabsTrigger value="heatmap">Heatmap</TabsTrigger>
          <TabsTrigger value="achievements">Achievements</TabsTrigger>
        </TabsList>
        
        <TabsContent value="overview" className="space-y-4">
          <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-4">
            <Card>
              <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
                <CardTitle className="text-sm font-medium">Total Sessions</CardTitle>
                <BarChart className="h-4 w-4 text-muted-foreground" />
              </CardHeader>
              <CardContent>
                <div className="text-2xl font-bold">{completedSessions.length}</div>
                <p className="text-xs text-muted-foreground">
                  {totalFocusTime
                    ? formatDuration(totalFocusTime)
                    : 'No focus time'}
                </p>
              </CardContent>
            </Card>

            <Card>
              <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
                <CardTitle className="text-sm font-medium">
                  Current Streak
                </CardTitle>
                <Flame className="h-4 w-4 text-muted-foreground" />
              </CardHeader>
              <CardContent>
                <div className="text-2xl font-bold">{streakCount} days</div>
                <p className="text-xs text-muted-foreground">
                  {streakCount > 0
                    ? 'Keep it going!'
                    : 'Start your streak today'}
                </p>
              </CardContent>
            </Card>

            <Card>
              <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
                <CardTitle className="text-sm font-medium">
                  Avg. Focus Level
                </CardTitle>
                <Target className="h-4 w-4 text-muted-foreground" />
              </CardHeader>
              <CardContent>
                <div className="text-2xl font-bold">
                  {averageFocusLevel.toFixed(1)}/10
                </div>
                <Progress
                  value={averageFocusLevel * 10}
                  className="h-2"
                />
              </CardContent>
            </Card>

            <Card>
              <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
                <CardTitle className="text-sm font-medium">
                  Completion Rate
                </CardTitle>
                <CheckCircle className="h-4 w-4 text-muted-foreground" />
              </CardHeader>
              <CardContent>
                <div className="text-2xl font-bold">{completionRate.toFixed(0)}%</div>
                <Progress
                  value={completionRate}
                  className="h-2"
                />
              </CardContent>
            </Card>
          </div>

          <Card>
            <CardHeader>
              <CardTitle>Focus Type Distribution</CardTitle>
            </CardHeader>
            <CardContent>
              <div className="space-y-4">
                {getFocusTypeDistribution().map(({ type, percentage, count }) => (
                  <div key={type} className="flex items-center">
                    <div className="mr-4 w-24 font-medium">{type}</div>
                    <div className="flex-1">
                      <div className="flex items-center">
                        <Progress value={percentage} className="h-2 flex-1" />
                        <span className="ml-2 text-sm text-muted-foreground">
                          {percentage}% ({count})
                        </span>
                      </div>
                    </div>
                  </div>
                ))}
              </div>
            </CardContent>
          </Card>
        </TabsContent>
        
        <TabsContent value="patterns" className="space-y-4">
          <div className="grid gap-4 md:grid-cols-2">
            <Card>
              <CardHeader>
                <CardTitle>Time of Day Analysis</CardTitle>
                <CardDescription>When you focus best</CardDescription>
              </CardHeader>
              <CardContent>
                <div className="space-y-6">
                  {getTimeOfDayStats().map(({ period, sessions, avgFocus, avgEnergy, icon: Icon, color }) => (
                    <div key={period} className="flex items-center space-x-4">
                      <div className={`p-2 rounded-full bg-muted ${color}`}>
                        <Icon className="h-5 w-5" />
                      </div>
                      <div className="flex-1 space-y-1">
                        <p className="text-sm font-medium leading-none capitalize">{period}</p>
                        <div className="flex items-center text-xs text-muted-foreground">
                          <span>{sessions} sessions</span>
                          <Dot />
                          <span>Focus: {avgFocus.toFixed(1)}/10</span>
                          <Dot />
                          <span>Energy: {avgEnergy.toFixed(1)}/10</span>
                        </div>
                      </div>
                      <div>
                        <Progress value={avgFocus * 10} className="h-2 w-24" />
                      </div>
                    </div>
                  ))}
                </div>
              </CardContent>
            </Card>
            
            <Card>
              <CardHeader>
                <CardTitle>Weekday Performance</CardTitle>
                <CardDescription>Your focus patterns by day</CardDescription>
              </CardHeader>
              <CardContent>
                <div className="grid grid-cols-7 gap-2">
                  {getWeekdayStats().map(({ day, sessions, totalMinutes, avgFocus }) => (
                    <div 
                      key={day} 
                      className="flex flex-col items-center justify-between p-2 rounded-lg border"
                    >
                      <span className="text-sm font-medium">{day}</span>
                      <div 
                        className="my-2 w-full rounded-full bg-primary-foreground"
                        style={{
                          height: `${Math.max(4, Math.min(80, avgFocus * 8))}px`,
                          opacity: sessions ? 1 : 0.3
                        }}
                      />
                      <span className="text-xs text-muted-foreground">{sessions}</span>
                    </div>
                  ))}
                </div>
                <div className="mt-4 text-xs text-muted-foreground text-center">
                  Bar height = Average focus level • Number = Session count
                </div>
              </CardContent>
            </Card>
            
            <Card>
              <CardHeader>
                <CardTitle>Context Analysis</CardTitle>
                <CardDescription>Where you focus best</CardDescription>
              </CardHeader>
              <CardContent>
                <div className="space-y-4">
                  {getContextStats().map(({ context, sessions, totalMinutes, avgFocus, percentage }) => (
                    <div key={context} className="space-y-2">
                      <div className="flex items-center justify-between">
                        <div className="flex items-center space-x-2">
                          <MapPin className="h-4 w-4 text-muted-foreground" />
                          <span className="font-medium">{context}</span>
                        </div>
                        <Badge variant="outline">{percentage}%</Badge>
                      </div>
                      <div className="flex items-center text-xs text-muted-foreground">
                        <span>{sessions} sessions</span>
                        <Dot />
                        <span>{totalMinutes} minutes</span>
                        <Dot />
                        <span>Avg focus: {avgFocus.toFixed(1)}/10</span>
                      </div>
                      <Progress value={avgFocus * 10} className="h-1" />
                    </div>
                  ))}
                </div>
              </CardContent>
            </Card>
            
            <Card>
              <CardHeader>
                <CardTitle>Flow Patterns</CardTitle>
                <CardDescription>Your journey to flow state</CardDescription>
              </CardHeader>
              <CardContent>
                {completedSessions.length < 5 ? (
                  <div className="flex flex-col items-center justify-center h-40 text-center">
                    <FolderSearch className="h-8 w-8 text-muted-foreground mb-2" />
                    <p className="text-sm text-muted-foreground">Complete at least 5 sessions to see your flow patterns</p>
                  </div>
                ) : (
                  <div className="space-y-4">
                    <div className="flex items-center space-x-4">
                      <motion.div 
                        className="h-16 w-16 rounded-full bg-blue-100 flex items-center justify-center"
                        initial={{ scale: 0.9 }}
                        animate={{ 
                          scale: [0.9, 1.1, 0.9],
                          backgroundColor: [
                            'rgba(219, 234, 254, 1)',
                            'rgba(191, 219, 254, 1)',
                            'rgba(219, 234, 254, 1)'
                          ]
                        }}
                        transition={{ 
                          duration: 4,
                          repeat: Infinity,
                          ease: "easeInOut"
                        }}
                      >
                        <Brain className="h-8 w-8 text-blue-600" />
                      </motion.div>
                      <div className="flex-1">
                        <h4 className="font-medium">Your Flow Profile</h4>
                        <p className="text-sm text-muted-foreground">
                          {averageFocusLevel > 7 
                            ? "You reach flow state quickly and maintain it well" 
                            : averageFocusLevel > 5
                            ? "You can reach flow state with some effort"
                            : "You're still building your flow capacity"}
                        </p>
                      </div>
                    </div>
                    
                    <div className="pt-2">
                      <div className="relative">
                        <div className="absolute left-0 w-full h-0.5 bg-muted" />
                        <div 
                          className="absolute left-0 h-0.5 bg-primary transition-all" 
                          style={{ width: `${averageFocusLevel * 10}%` }} 
                        />
                        <div className="relative flex justify-between pt-2 text-xs">
                          <span>Distracted</span>
                          <span>Focused</span>
                          <span>Flow</span>
                        </div>
                      </div>
                    </div>
                    
                    <div className="flex justify-end">
                      <Button variant="outline" size="sm" className="text-xs">
                        <Compass className="mr-1 h-3 w-3" />
                        View Flow Journey
                      </Button>
                    </div>
                  </div>
                )}
              </CardContent>
            </Card>
          </div>
        </TabsContent>
        
        <TabsContent value="insights" className="space-y-4">
          {getInsights().length === 0 ? (
            <Card>
              <CardContent className="flex flex-col items-center justify-center py-10 text-center">
                <TrendingUp className="h-8 w-8 text-muted-foreground mb-2" />
                <p className="text-muted-foreground">
                  Complete more focus sessions to unlock personalized insights
                </p>
              </CardContent>
            </Card>
          ) : (
            <div className="grid gap-4 md:grid-cols-2">
              {getInsights().map((insight, i) => (
                <Card key={i}>
                  <CardContent className="pt-6">
                    <div className="flex items-start space-x-4">
                      <div className={`p-2 rounded-full bg-muted ${insight.color || 'text-primary'}`}>
                        <insight.icon className="h-5 w-5" />
                      </div>
                      <div>
                        <h3 className="font-medium">{insight.title}</h3>
                        <p className="text-sm text-muted-foreground">
                          {insight.description}
                        </p>
                        {insight.score && (
                          <div className="mt-2 flex items-center">
                            <Progress value={insight.score * 10} className="h-1 w-16 mr-2" />
                            <span className="text-xs text-muted-foreground">{insight.score.toFixed(1)}/10</span>
                          </div>
                        )}
                      </div>
                    </div>
                  </CardContent>
                </Card>
              ))}
            </div>
          )}
          
          <Card>
            <CardHeader>
              <CardTitle>Focus Recommendations</CardTitle>
            </CardHeader>
            <CardContent>
              <ul className="space-y-2">
                {completedSessions.length < 3 ? (
                  <li className="text-muted-foreground">
                    Complete more sessions to get personalized recommendations
                  </li>
                ) : (
                  <>
                    <li className="flex items-start space-x-2">
                      <LightbulbIcon className="mt-0.5 h-4 w-4 text-yellow-500" />
                      <span>Try {getTimeOfDayStats().sort((a, b) => b.avgFocus - a.avgFocus)[0]?.period || 'morning'} sessions for better focus</span>
                    </li>
                    
                    {averageEnergyLevel < 6 && (
                      <li className="flex items-start space-x-2">
                        <BatteryMedium className="mt-0.5 h-4 w-4 text-orange-500" />
                        <span>Your energy levels are affecting focus - try an energy boosting activity</span>
                      </li>
                    )}
                    
                    {averageFocusLevel < 7 && (
                      <li className="flex items-start space-x-2">
                        <Glasses className="mt-0.5 h-4 w-4 text-blue-500" />
                        <span>Use the Pomodoro technique to build focus gradually</span>
                      </li>
                    )}
                    
                    <li className="flex items-start space-x-2">
                      <Timer className="mt-0.5 h-4 w-4 text-indigo-500" />
                      <span>Your ideal session length is around {
                        completedSessions.length > 0 
                          ? Math.round(completedSessions.reduce((sum, s) => sum + (s.duration_seconds || 0), 0) / 
                              completedSessions.length / 60)
                          : 25
                      } minutes</span>
                    </li>
                  </>
                )}
              </ul>
            </CardContent>
          </Card>
        </TabsContent>
        
        <TabsContent value="heatmap" className="space-y-4">
          <Card>
            <CardHeader>
              <CardTitle>Focus Heatmap</CardTitle>
              <CardDescription>Your focus intensity over time</CardDescription>
            </CardHeader>
            <CardContent>
              <div className="space-y-4">
                <div className="flex items-center justify-center">
                  <Calendar 
                    mode="single"
                    selected={selectedDate}
                    onSelect={setSelectedDate}
                    className="rounded-md border"
                    components={{
                      DayContent: ({ day }) => {
                        const date = day.toDate();
                        const sessionsOnDate = getFilteredSessions().filter(session => {
                          const sessionDate = new Date(session.start_time);
                          return (
                            sessionDate.getDate() === date.getDate() &&
                            sessionDate.getMonth() === date.getMonth() &&
                            sessionDate.getFullYear() === date.getFullYear()
                          );
                        });
                        
                        const totalFocus = sessionsOnDate.reduce(
                          (sum, session) => sum + (session.focus_level || 0), 
                          0
                        );
                        
                        const avgFocus = sessionsOnDate.length 
                          ? totalFocus / sessionsOnDate.length 
                          : 0;
                        
                        // Determine color intensity based on focus
                        let bgColor = 'bg-transparent';
                        if (sessionsOnDate.length > 0) {
                          if (avgFocus > 8) bgColor = 'bg-green-500 text-white';
                          else if (avgFocus > 6) bgColor = 'bg-green-400 text-white';
                          else if (avgFocus > 4) bgColor = 'bg-green-300';
                          else bgColor = 'bg-green-200';
                        }
                        
                        return (
                          <div className={`h-9 w-9 p-0 flex items-center justify-center rounded-md ${bgColor}`}>
                            {day.date}
                            {sessionsOnDate.length > 0 && (
                              <div className="absolute bottom-1 right-1 h-1 w-1 rounded-full bg-primary" />
                            )}
                          </div>
                        );
                      }
                    }}
                  />
                </div>
                
                <div className="flex items-center justify-center space-x-2 text-xs">
                  <div className="flex items-center">
                    <div className="h-3 w-3 rounded-sm bg-transparent border mr-1" />
                    <span>None</span>
                  </div>
                  <div className="flex items-center">
                    <div className="h-3 w-3 rounded-sm bg-green-200 mr-1" />
                    <span>Low</span>
                  </div>
                  <div className="flex items-center">
                    <div className="h-3 w-3 rounded-sm bg-green-300 mr-1" />
                    <span>Medium</span>
                  </div>
                  <div className="flex items-center">
                    <div className="h-3 w-3 rounded-sm bg-green-400 mr-1" />
                    <span>High</span>
                  </div>
                  <div className="flex items-center">
                    <div className="h-3 w-3 rounded-sm bg-green-500 mr-1" />
                    <span>Excellent</span>
                  </div>
                </div>
                
                {selectedDate && (
                  <div className="mt-4 space-y-2">
                    <h3 className="font-medium">
                      {format(selectedDate, 'MMMM d, yyyy')}
                    </h3>
                    
                    {(() => {
                      const sessionsOnDate = getFilteredSessions().filter(session => {
                        const sessionDate = new Date(session.start_time);
                        return (
                          sessionDate.getDate() === selectedDate.getDate() &&
                          sessionDate.getMonth() === selectedDate.getMonth() &&
                          sessionDate.getFullYear() === selectedDate.getFullYear()
                        );
                      });
                      
                      if (sessionsOnDate.length === 0) {
                        return (
                          <p className="text-sm text-muted-foreground">
                            No focus sessions on this day
                          </p>
                        );
                      }
                      
                      return (
                        <div className="space-y-2">
                          {sessionsOnDate.map((session, i) => (
                            <div key={i} className="flex items-center justify-between border-b pb-2 last:border-0">
                              <div>
                                <div className="font-medium">
                                  {format(new Date(session.start_time), 'h:mm a')} - {session.focus_type}
                                </div>
                                <div className="text-sm text-muted-foreground">
                                  {formatDuration(session.duration_seconds || 0)}
                                  {session.completed ? ' • Completed' : ' • Interrupted'}
                                </div>
                              </div>
                              <div className="flex items-center space-x-2">
                                <div className="flex items-center">
                                  <Target className="h-4 w-4 mr-1 text-blue-500" />
                                  <span>{session.focus_level || 0}/10</span>
                                </div>
                                <div className="flex items-center">
                                  <Battery className="h-4 w-4 mr-1 text-green-500" />
                                  <span>{session.energy_level || 0}/10</span>
                                </div>
                              </div>
                            </div>
                          ))}
                        </div>
                      );
                    })()}
                  </div>
                )}
              </div>
            </CardContent>
          </Card>
        </TabsContent>
        
        <TabsContent value="achievements" className="space-y-4">
          <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-3">
            {getAchievements().map((achievement, i) => (
              <Card key={i} className="overflow-hidden">
                <CardContent className="p-0">
                  <div 
                    className="
                      flex flex-col items-center justify-center p-6 text-center
                      bg-gradient-to-b from-primary-50 to-transparent dark:from-primary-950/20
                    "
                  >
                    <div className="relative mb-4">
                      <div className="h-16 w-16 rounded-full bg-primary/10 flex items-center justify-center">
                        <achievement.icon className="h-8 w-8 text-primary" />
                      </div>
                      <motion.div
                        className="absolute -inset-1 rounded-full border-2 border-primary/50"
                        initial={{ opacity: 0.5, scale: 0.8 }}
                        animate={{ 
                          opacity: [0.5, 1, 0.5],
                          scale: [0.8, 1.1, 0.8],
                        }}
                        transition={{ 
                          duration: 3,
                          repeat: Infinity,
                          ease: "easeInOut"
                        }}
                      />
                    </div>
                    <h3 className="font-semibold">{achievement.title}</h3>
                    <p className="text-sm text-muted-foreground">
                      {achievement.description}
                    </p>
                  </div>
                </CardContent>
              </Card>
            ))}
            
            {/* Locked achievements */}
            {getAchievements().length < 8 && (
              <>
                <Card className="overflow-hidden opacity-50">
                  <CardContent className="p-0">
                    <div 
                      className="
                        flex flex-col items-center justify-center p-6 text-center
                        bg-gradient-to-b from-muted/50 to-transparent
                      "
                    >
                      <div className="relative mb-4">
                        <div className="h-16 w-16 rounded-full bg-muted flex items-center justify-center">
                          <Lock className="h-8 w-8 text-muted-foreground" />
                        </div>
                      </div>
                      <h3 className="font-semibold">Consistency King</h3>
                      <p className="text-sm text-muted-foreground">
                        14 day streak
                      </p>
                    </div>
                  </CardContent>
                </Card>
                
                <Card className="overflow-hidden opacity-50">
                  <CardContent className="p-0">
                    <div 
                      className="
                        flex flex-col items-center justify-center p-6 text-center
                        bg-gradient-to-b from-muted/50 to-transparent
                      "
                    >
                      <div className="relative mb-4">
                        <div className="h-16 w-16 rounded-full bg-muted flex items-center justify-center">
                          <Lock className="h-8 w-8 text-muted-foreground" />
                        </div>
                      </div>
                      <h3 className="font-semibold">Focus Guru</h3>
                      <p className="text-sm text-muted-foreground">
                        10 sessions with 8+ focus
                      </p>
                    </div>
                  </CardContent>
                </Card>
              </>
            )}
          </div>
          
          <Card>
            <CardHeader>
              <CardTitle>Progress Tracker</CardTitle>
            </CardHeader>
            <CardContent>
              <div className="space-y-4">
                <div className="flex items-center justify-between">
                  <div className="flex items-center space-x-4">
                    <Target className="h-5 w-5 text-primary" />
                    <div>
                      <p className="font-medium">Focus Master</p>
                      <p className="text-sm text-muted-foreground">
                        Complete 50 focus sessions
                      </p>
                    </div>
                  </div>
                  <Badge variant="outline">
                    {completedSessions.length}/50
                  </Badge>
                </div>
                <Progress 
                  value={Math.min(100, (completedSessions.length / 50) * 100)} 
                  className="h-2" 
                />
                
                <div className="flex items-center justify-between">
                  <div className="flex items-center space-x-4">
                    <Clock className="h-5 w-5 text-primary" />
                    <div>
                      <p className="font-medium">Time Collector</p>
                      <p className="text-sm text-muted-foreground">
                        Accumulate 24 hours of focus time
                      </p>
                    </div>
                  </div>
                  <Badge variant="outline">
                    {formatDuration(totalFocusTime || 0)}/24h
                  </Badge>
                </div>
                <Progress 
                  value={Math.min(100, (totalFocusTime / (24 * 3600)) * 100)} 
                  className="h-2" 
                />
                
                <div className="flex items-center justify-between">
                  <div className="flex items-center space-x-4">
                    <Flame className="h-5 w-5 text-primary" />
                    <div>
                      <p className="font-medium">Streak Champion</p>
                      <p className="text-sm text-muted-foreground">
                        Maintain a 7-day focus streak
                      </p>
                    </div>
                  </div>
                  <Badge variant="outline">
                    {streakCount}/7
                  </Badge>
                </div>
                <Progress 
                  value={Math.min(100, (streakCount / 7) * 100)} 
                  className="h-2" 
                />
              </div>
            </CardContent>
          </Card>
        </TabsContent>
      </Tabs>
    </div>
  );
} 