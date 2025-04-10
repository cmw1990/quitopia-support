import React, { useState, useEffect } from 'react';
import { Link } from 'react-router-dom';
import {
  Brain, 
  Clock, 
  ListChecks, 
  Shield, 
  Calendar, 
  BarChart, 
  Lightbulb, 
  Smile, 
  Trophy, 
  Users, 
  Settings,
  Zap,
  Timer as TimerIcon,
  Focus,
  AlertCircle
} from 'lucide-react';

import MoodTracker from '../MoodTracker';
import CBTInsights from '../CBTInsights';
import TaskManager from '../TaskManager';
import HealthTimeline from '../HealthTimeline';
import CopingStrategies from '../CopingStrategies';

import { Card, CardContent, CardDescription, CardFooter, CardHeader, CardTitle } from '../ui/card';
import { Button } from '../ui/button';
import { Progress } from '../ui/progress';
import { Timer as TimerComponent } from '../ui/timer';

import { getFocusSessions, getFocusStats, getFocusTasks, getFocusSettings } from '../../api/supabaseClient';
import type { FocusSession as ApiFocusSession, FocusStat as ApiFocusStat, FocusTask as ApiFocusTask, FocusSettings as ApiFocusSettings } from '../../api/supabaseClient';

interface FocusSession {
  id: string;
  start_time: string;
  end_time: string | null;
  duration_minutes: number;
  focus_type: string;
  completed: boolean;
}

interface FocusStat {
  date: string;
  total_minutes: number;
  focus_score: number;
  completed_tasks: number;
}

interface FocusTask {
  id: string;
  title: string;
  status: string;
  priority: string;
  due_date: string | null;
}

interface FocusSettings {
  pomodoro_work_minutes: number;
  pomodoro_break_minutes: number;
}

// Mock data for development
const mockSessions: FocusSession[] = [
  {
    id: '1',
    start_time: '2025-05-23T09:00:00Z',
    end_time: '2025-05-23T10:00:00Z',
    duration_minutes: 60,
    focus_type: 'pomodoro',
    completed: true
  },
  {
    id: '2',
    start_time: '2025-05-22T14:00:00Z',
    end_time: '2025-05-22T15:30:00Z',
    duration_minutes: 90,
    focus_type: 'deep_work',
    completed: true
  },
  {
    id: '3',
    start_time: '2025-05-21T11:00:00Z',
    end_time: null,
    duration_minutes: 45,
    focus_type: 'pomodoro',
    completed: false
  }
];

const mockStats: FocusStat = {
  date: '2025-05-23',
  total_minutes: 120,
  focus_score: 85,
  completed_tasks: 7
};

const mockTasks: FocusTask[] = [
  {
    id: '1',
    title: 'Complete project proposal',
    status: 'todo',
    priority: 'high',
    due_date: '2025-05-25'
  },
  {
    id: '2',
    title: 'Review code changes',
    status: 'todo',
    priority: 'medium',
    due_date: null
  },
  {
    id: '3',
    title: 'Research new APIs',
    status: 'todo',
    priority: 'low',
    due_date: '2025-05-30'
  }
];

const mockSettings: FocusSettings = {
  pomodoro_work_minutes: 25,
  pomodoro_break_minutes: 5
};

const Dashboard: React.FC = () => {
  const [isLoading, setIsLoading] = useState<boolean>(true);
  const [error, setError] = useState<string | null>(null);
  const [recentSessions, setRecentSessions] = useState<FocusSession[]>([]);
  const [todayStats, setTodayStats] = useState<FocusStat | null>(null);
  const [priorityTasks, setPriorityTasks] = useState<FocusTask[]>([]);
  const [settings, setSettings] = useState<FocusSettings | null>(null);
  const [focusStreak, setFocusStreak] = useState<number>(0);
  const [pomodoroSeconds, setPomodoroSeconds] = useState<number>(1500); // 25 minutes
  const [isTimerRunning, setIsTimerRunning] = useState<boolean>(false);

  useEffect(() => {
    const loadDashboardData = async () => {
      try {
        setIsLoading(true);
        
        // In a real implementation, we would fetch data from the API
        // For now, we'll use mock data for development
        setTimeout(() => {
          setRecentSessions(mockSessions);
          setTodayStats(mockStats);
          setPriorityTasks(mockTasks);
          setSettings(mockSettings);
          setFocusStreak(3); // Mock streak
          setIsLoading(false);
        }, 1000);
        
        // This is how we would fetch from the API in production
        /*
        const [sessionsData, statsData, tasksData, settingsData] = await Promise.all([
          getFocusSessions(),
          getFocusStats(),
          getFocusTasks(),
          getFocusSettings()
        ]);
        
        // Process and set the data
        setRecentSessions(sessionsData);
        if (statsData.length > 0) {
          setTodayStats(statsData[0]);
          // Calculate streak...
        }
        setPriorityTasks(tasksData);
        setSettings(settingsData);
        */
        
      } catch (err) {
        console.error('Error loading dashboard data:', err);
        setError('Failed to load dashboard data. Please try again.');
      } finally {
        setIsLoading(false);
      }
    };
    
    loadDashboardData();
  }, []);
  
  // Timer controls
  const handleStartTimer = () => {
    setIsTimerRunning(true);
  };
  
  const handlePauseTimer = () => {
    setIsTimerRunning(false);
  };
  
  const handleResetTimer = () => {
    setIsTimerRunning(false);
    if (settings?.pomodoro_work_minutes) {
      setPomodoroSeconds(settings.pomodoro_work_minutes * 60);
    } else {
      setPomodoroSeconds(1500); // Default 25 minutes
    }
  };
  
  // Timer countdown effect
  useEffect(() => {
    let interval: NodeJS.Timeout;
    
    if (isTimerRunning && pomodoroSeconds > 0) {
      interval = setInterval(() => {
        setPomodoroSeconds(prevSeconds => prevSeconds - 1);
      }, 1000);
    } else if (pomodoroSeconds === 0) {
      setIsTimerRunning(false);
      // Could trigger notification here
    }
    
    return () => clearInterval(interval);
  }, [isTimerRunning, pomodoroSeconds]);

  if (isLoading) {
    return (
      <div className="flex h-full items-center justify-center">
        <div className="text-center">
          <div className="animate-spin h-12 w-12 border-t-2 border-b-2 border-purple-500 rounded-full mx-auto"></div>
          <p className="mt-4 text-slate-600 dark:text-slate-400">Loading your focus dashboard...</p>
        </div>
      </div>
    );
  }

  if (error) {
    return (
      <div className="flex h-full items-center justify-center">
        <div className="text-center">
          <AlertCircle className="h-12 w-12 text-red-500 mx-auto" />
          <p className="mt-4 text-red-500">{error}</p>
          <Button 
            variant="outline" 
            className="mt-4"
            onClick={() => window.location.reload()}
          >
            Try Again
          </Button>
        </div>
      </div>
    );
  }

  return (
    <div className="container mx-auto p-4 space-y-6">
      <h1 className="text-3xl font-bold tracking-tight">Focus Dashboard</h1>
      <p className="text-slate-600 dark:text-slate-400">Your central hub for managing focus and productivity</p>
      
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
        {/* Quick Start Focus Session */}
        <Card className="col-span-1 md:col-span-2 lg:col-span-1">
          <CardHeader>
            <CardTitle>Quick Focus</CardTitle>
            <CardDescription>Start a focused work session</CardDescription>
          </CardHeader>
          <CardContent className="flex flex-col items-center">
            <TimerComponent 
              seconds={pomodoroSeconds}
              size="lg"
              variant={pomodoroSeconds < 300 ? "danger" : pomodoroSeconds < 600 ? "warning" : "default"}
              showControls={true}
              onStart={handleStartTimer}
              onPause={handlePauseTimer}
              onReset={handleResetTimer}
              isRunning={isTimerRunning}
            />
          </CardContent>
          <CardFooter className="flex justify-between">
            <Button variant="outline" asChild>
              <Link to="/easier-focus/app/pomodoro">
                <Clock className="mr-2 h-4 w-4" />
                Pomodoro
              </Link>
            </Button>
            <Button variant="outline" asChild>
              <Link to="/easier-focus/app/sessions">
                <Focus className="mr-2 h-4 w-4" />
                Sessions
              </Link>
            </Button>
          </CardFooter>
        </Card>
        
        {/* Today's Focus Stats */}
        <Card>
          <CardHeader>
            <CardTitle>Today's Focus</CardTitle>
            <CardDescription>Your progress so far</CardDescription>
          </CardHeader>
          <CardContent className="space-y-4">
            <div className="space-y-2">
              <div className="flex justify-between">
                <span className="text-sm font-medium">Focus Time</span>
                <span className="text-sm font-medium">{todayStats?.total_minutes || 0} mins</span>
              </div>
              <Progress value={todayStats?.total_minutes || 0} max={120} />
            </div>
            
            <div className="space-y-2">
              <div className="flex justify-between">
                <span className="text-sm font-medium">Focus Score</span>
                <span className="text-sm font-medium">{todayStats?.focus_score || 0}/100</span>
              </div>
              <Progress 
                value={todayStats?.focus_score || 0} 
                variant={
                  (todayStats?.focus_score || 0) > 75 ? "success" : 
                  (todayStats?.focus_score || 0) > 50 ? "default" : 
                  (todayStats?.focus_score || 0) > 25 ? "warning" : "danger"
                }
              />
            </div>
            
            <div className="space-y-2">
              <div className="flex justify-between">
                <span className="text-sm font-medium">Tasks Completed</span>
                <span className="text-sm font-medium">{todayStats?.completed_tasks || 0}</span>
              </div>
              <Progress value={todayStats?.completed_tasks || 0} max={10} variant="success" />
            </div>
          </CardContent>
          <CardFooter>
            <Button variant="outline" className="w-full" asChild>
              <Link to="/easier-focus/app/analytics">
                <BarChart className="mr-2 h-4 w-4" />
                View Analytics
              </Link>
            </Button>
          </CardFooter>
        </Card>
        
        {/* Focus Streak */}
        <Card>
          <CardHeader>
            <CardTitle>Focus Streak</CardTitle>
            <CardDescription>Your consistency record</CardDescription>
          </CardHeader>
          <CardContent className="flex flex-col items-center justify-center">
            <div className="text-6xl font-bold text-purple-500">{focusStreak}</div>
            <p className="mt-2 text-slate-600 dark:text-slate-400">days in a row</p>
            
            <div className="mt-4 flex space-x-1">
              {[...Array(7)].map((_, i) => (
                <div 
                  key={i} 
                  className={`h-2 w-8 rounded-full ${i < focusStreak % 7 ? 'bg-purple-500' : 'bg-slate-200 dark:bg-slate-700'}`}
                />
              ))}
            </div>
          </CardContent>
          <CardFooter>
            <Button variant="outline" className="w-full" asChild>
              <Link to="/easier-focus/app/achievements">
                <Trophy className="mr-2 h-4 w-4" />
                View Achievements
              </Link>
            </Button>
          </CardFooter>
        </Card>
        
        {/* Priority Tasks */}
        <Card className="col-span-1 md:col-span-2">
          <CardHeader>
            <CardTitle>Priority Tasks</CardTitle>
            <CardDescription>Your most important tasks</CardDescription>
          </CardHeader>
          <CardContent>
            {priorityTasks.length > 0 ? (
              <ul className="space-y-2">
                {priorityTasks.map(task => (
                  <li key={task.id} className="flex items-center justify-between p-2 rounded-md hover:bg-slate-100 dark:hover:bg-slate-800">
                    <div className="flex items-center">
                      <div className={`h-3 w-3 rounded-full mr-3 ${
                        task.priority === 'high' ? 'bg-red-500' : 
                        task.priority === 'medium' ? 'bg-yellow-500' : 'bg-blue-500'
                      }`} />
                      <span>{task.title}</span>
                    </div>
                    {task.due_date && (
                      <span className="text-xs text-slate-500">
                        {new Date(task.due_date).toLocaleDateString()}
                      </span>
                    )}
                  </li>
                ))}
              </ul>
            ) : (
              <div className="text-center py-6">
                <ListChecks className="h-12 w-12 text-slate-400 mx-auto" />
                <p className="mt-2 text-slate-500">No priority tasks</p>
              </div>
            )}
          </CardContent>
          <CardFooter>
            <Button variant="outline" className="w-full" asChild>
              <Link to="/easier-focus/app/tasks">
                <ListChecks className="mr-2 h-4 w-4" />
                Manage Tasks
              </Link>
            </Button>
          </CardFooter>
        </Card>
        
        {/* Recent Focus Sessions */}
        <Card className="col-span-1 lg:col-span-1">
          <CardHeader>
            <CardTitle>Recent Sessions</CardTitle>
            <CardDescription>Your latest focus periods</CardDescription>
          </CardHeader>
          <CardContent>
            {recentSessions.length > 0 ? (
              <ul className="space-y-2">
                {recentSessions.map(session => (
                  <li key={session.id} className="flex items-center justify-between p-2 rounded-md hover:bg-slate-100 dark:hover:bg-slate-800">
                    <div className="flex items-center">
                      <div className={`h-8 w-8 rounded-full flex items-center justify-center mr-3 ${
                        session.completed ? 'bg-green-100 text-green-600' : 'bg-slate-100 text-slate-600'
                      }`}>
                        {session.focus_type === 'pomodoro' ? (
                          <TimerIcon className="h-4 w-4" />
                        ) : (
                          <Focus className="h-4 w-4" />
                        )}
                      </div>
                      <div>
                        <div className="font-medium">{session.focus_type}</div>
                        <div className="text-xs text-slate-500">
                          {session.duration_minutes} mins
                        </div>
                      </div>
                    </div>
                    <span className={`text-xs ${session.completed ? 'text-green-500' : 'text-slate-500'}`}>
                      {session.completed ? 'Completed' : 'Interrupted'}
                    </span>
                  </li>
                ))}
              </ul>
            ) : (
              <div className="text-center py-6">
                <Clock className="h-12 w-12 text-slate-400 mx-auto" />
                <p className="mt-2 text-slate-500">No recent sessions</p>
              </div>
            )}
          </CardContent>
          <CardFooter>
            <Button variant="outline" className="w-full" asChild>
              <Link to="/easier-focus/app/sessions">
                <Calendar className="mr-2 h-4 w-4" />
                View All Sessions
              </Link>
            </Button>
          </CardFooter>
        </Card>
      
        {/* Mood Tracker */}
        <Card className="col-span-1 lg:col-span-1">
          <CardHeader>
            <CardTitle>Mood Tracker</CardTitle>
            <CardDescription>Track your mood over time</CardDescription>
          </CardHeader>
          <CardContent>
            <MoodTracker />
          </CardContent>
        </Card>

        {/* CBT Insights */}
        <Card className="col-span-1 lg:col-span-1">
          <CardHeader>
            <CardTitle>CBT Insights</CardTitle>
            <CardDescription>Personalized insights based on CBT principles</CardDescription>
          </CardHeader>
          <CardContent>
            <CBTInsights />
          </CardContent>
        </Card>

        {/* Task Manager */}
        <Card className="col-span-1 lg:col-span-1">
          <CardHeader>
            <CardTitle>Task Manager</CardTitle>
            <CardDescription>Manage your tasks and stay organized</CardDescription>
          </CardHeader>
          <CardContent>
            <TaskManager />
          </CardContent>
        </Card>

        {/* Health Timeline */}
        <Card className="col-span-1 lg:col-span-1">
          <CardHeader>
            <CardTitle>Health Timeline</CardTitle>
            <CardDescription>Visualize health-related events and their impact on focus and energy</CardDescription>
          </CardHeader>
          <CardContent>
            <HealthTimeline />
          </CardContent>
        </Card>

        {/* Coping Strategies */}
        <Card className="col-span-1 lg:col-span-1">
          <CardHeader>
            <CardTitle>Coping Strategies</CardTitle>
            <CardDescription>Strategies for managing distractions and improving focus</CardDescription>
          </CardHeader>
          <CardContent>
            <CopingStrategies />
          </CardContent>
        </Card>
      </div>
      
      {/* Quick Access Feature Links */}
      <div className="grid grid-cols-2 sm:grid-cols-3 md:grid-cols-4 lg:grid-cols-6 gap-4 mt-8">
        <Button variant="outline" className="h-24 flex flex-col" asChild>
          <Link to="/easier-focus/app/tasks">
            <ListChecks className="h-6 w-6 mb-2" />
            <span>Tasks</span>
          </Link>
        </Button>
        
        <Button variant="outline" className="h-24 flex flex-col" asChild>
          <Link to="/easier-focus/app/pomodoro">
            <Clock className="h-6 w-6 mb-2" />
            <span>Pomodoro</span>
          </Link>
        </Button>
        
        <Button variant="outline" className="h-24 flex flex-col" asChild>
          <Link to="/easier-focus/app/blocker">
            <Shield className="h-6 w-6 mb-2" />
            <span>Blocker</span>
          </Link>
        </Button>
        
        <Button variant="outline" className="h-24 flex flex-col" asChild>
          <Link to="/easier-focus/app/sessions">
            <Focus className="h-6 w-6 mb-2" />
            <span>Sessions</span>
          </Link>
        </Button>
        
        <Button variant="outline" className="h-24 flex flex-col" asChild>
          <Link to="/easier-focus/app/analytics">
            <BarChart className="h-6 w-6 mb-2" />
            <span>Analytics</span>
          </Link>
        </Button>
        
        <Button variant="outline" className="h-24 flex flex-col" asChild>
          <Link to="/easier-focus/app/strategies">
            <Lightbulb className="h-6 w-6 mb-2" />
            <span>Strategies</span>
          </Link>
        </Button>
        
        <Button variant="outline" className="h-24 flex flex-col" asChild>
          <Link to="/easier-focus/app/mood">
            <Smile className="h-6 w-6 mb-2" />
            <span>Mood</span>
          </Link>
        </Button>
        
        <Button variant="outline" className="h-24 flex flex-col" asChild>
          <Link to="/easier-focus/app/achievements">
            <Trophy className="h-6 w-6 mb-2" />
            <span>Achievements</span>
          </Link>
        </Button>

        <Button variant="outline" className="h-24 flex flex-col" asChild>
          <Link to="/easier-focus/app/cbt">
            <Brain className="h-6 w-6 mb-2" />
            <span>CBT Insights</span>
          </Link>
        </Button>
        
        <Button variant="outline" className="h-24 flex flex-col" asChild>
          <Link to="/easier-focus/app/community">
            <Users className="h-6 w-6 mb-2" />
            <span>Community</span>
          </Link>
        </Button>
        
        <Button variant="outline" className="h-24 flex flex-col" asChild>
          <Link to="/easier-focus/app/settings">
            <Settings className="h-6 w-6 mb-2" />
            <span>Settings</span>
          </Link>
        </Button>
      </div>
    </div>
  );
};

export default Dashboard;
