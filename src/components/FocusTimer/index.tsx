import React, { useState, useEffect, useRef, useCallback, useMemo } from 'react';
import { useLocation } from 'react-router-dom';
import { Card, CardContent, CardHeader, CardTitle, CardDescription, CardFooter } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Progress } from "@/components/ui/progress";
import { Slider } from "@/components/ui/slider";
import { Label } from "@/components/ui/label";
import { Switch } from "@/components/ui/switch";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Badge } from "@/components/ui/badge";
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar";
import { toast } from "sonner";
import { 
  Play, 
  Pause, 
  SkipForward, 
  Timer as TimerIcon,
  Bell, 
  BellOff, 
  Settings,
  BarChart, 
  Coffee, 
  Brain, 
  CheckCircle, 
  Zap,
  Moon,
  RefreshCw,
  Clock,
  BarChart2,
  LineChart,
  Calendar,
  Trophy,
  Flame,
  User,
  Shield,
  Volume2,
  VolumeX,
  Monitor,
  Smartphone,
  PieChart,
  AlertTriangle,
  Info,
  CheckIcon,
  TrashIcon,
} from "lucide-react";
import { useAuth } from "@/components/AuthProvider";
import { motion, AnimatePresence } from "framer-motion";
import { createFocusSession, FocusSession } from '@/api/supabaseClient';
import { Accordion, AccordionContent, AccordionItem, AccordionTrigger } from "@/components/ui/accordion";
import { Tooltip, TooltipContent, TooltipProvider, TooltipTrigger } from '@/components/ui/tooltip';
import { useToast } from '@/components/ui/use-toast';
import { cn } from '@/lib/utils';
import { Input } from '@/components/ui/input';
import { Command, CommandEmpty, CommandGroup, CommandInput, CommandItem, CommandList } from "@/components/ui/command";
import { Popover, PopoverContent, PopoverTrigger } from '@/components/ui/popover';
import { Task } from '@/types/task';

interface FocusTimerProps {
  onSessionComplete?: (sessionData: SessionData) => void;
  initialSettings?: TimerSettings;
  tasks: Task[];
  onTaskUpdate: (task: Task) => void;
}

interface TimerSettings {
  focusDuration: number;
  shortBreakDuration: number;
  longBreakDuration: number;
  longBreakInterval: number;
  autoStartFocus: boolean;
  autoStartBreaks: boolean;
  notificationSound: string;
  dailyGoalMinutes: number;
}

interface SessionData {
  id?: string;
  completedPomodoros: number;
  totalFocusTime: number;
  startTime: Date;
  endTime: Date;
  task?: string;
  tags?: string[];
  notes?: string | null;
  successful: boolean;
  distractions?: number;
  user_id?: string;
  start_time_iso?: string;
  end_time_iso?: string | null;
  duration_minutes?: number;
  focus_type?: 'pomodoro' | 'deep_work' | 'flow' | 'timeboxed';
  completed?: boolean;
  task_id?: string | null;
  distractions_count?: number;
  status?: 'planned' | 'active' | 'paused' | 'completed' | 'cancelled';
}

interface TimerStats {
  dailyTotal: number;
  weeklyTotal: number;
  streak: number;
  sessionsToday: number;
  bestDay: {
    date: string;
    minutes: number;
  };
  averageSession: number;
  completionRate: number;
  achievements: Achievement[];
}

interface Achievement {
  id: string;
  name: string;
  description: string;
  icon: string;
  completed: boolean;
  progress: number;
  goal: number;
}

interface SessionPlan {
  technique: 'pomodoro' | 'deep_work' | 'timeboxed' | 'flow';
  taskId?: string;
  taskName?: string;
  plannedDurationMinutes: number;
  scheduledStartTime?: Date;
}

type TimerState = 'focus' | 'shortBreak' | 'longBreak' | 'idle';

export const FocusTimer: React.FC<FocusTimerProps> = ({ 
  onSessionComplete,
  initialSettings,
  tasks,
  onTaskUpdate
}) => {
  const { user } = useAuth();
  const location = useLocation();
  const passedState = location.state as { sessionPlan?: SessionPlan };
  const { toast: useToastToast } = useToast();
  
  // Timer settings
  const [settings, setSettings] = useState<TimerSettings>(() => {
    const savedSettings = localStorage.getItem('focusTimerSettings');
    const defaultSettings: TimerSettings = {
      focusDuration: 25,
      shortBreakDuration: 5,
      longBreakDuration: 15,
      longBreakInterval: 4,
      autoStartFocus: false,
      autoStartBreaks: true,
      notificationSound: 'ding',
      dailyGoalMinutes: 120,
    };
    if (passedState?.sessionPlan?.plannedDurationMinutes) {
      defaultSettings.focusDuration = passedState.sessionPlan.plannedDurationMinutes;
    }
    return savedSettings ? { ...defaultSettings, ...JSON.parse(savedSettings) } : defaultSettings;
  });
  
  // Timer state
  const [timerState, setTimerState] = useState<TimerState>('idle');
  const [isRunning, setIsRunning] = useState(false);
  const [timeRemaining, setTimeRemaining] = useState(() => {
     return (passedState?.sessionPlan?.plannedDurationMinutes || settings.focusDuration) * 60;
  });
  const [completedPomodoros, setCompletedPomodoros] = useState(0);
  const [currentTask, setCurrentTask] = useState(passedState?.sessionPlan?.taskName || "");
  const [linkedTaskId, setLinkedTaskId] = useState<string | undefined>(passedState?.sessionPlan?.taskId);
  const [linkedTaskName, setLinkedTaskName] = useState<string | undefined>(passedState?.sessionPlan?.taskName);
  const [sessionNotes, setSessionNotes] = useState("");
  const [distractionCount, setDistractionCount] = useState(0);
  const [sessionData, setSessionData] = useState<SessionData>({
    completedPomodoros: 0,
    totalFocusTime: 0,
    startTime: new Date(),
    endTime: new Date(),
    successful: false,
    distractions: 0,
    task_id: linkedTaskId
  });
  
  // Stats
  const [stats, setStats] = useState<TimerStats>({
    dailyTotal: 142,
    weeklyTotal: 785,
    streak: 4,
    sessionsToday: 3,
    bestDay: {
      date: new Date(Date.now() - 2 * 24 * 60 * 60 * 1000).toLocaleDateString(),
      minutes: 230
    },
    averageSession: 45,
    completionRate: 0.82,
    achievements: [
      {
        id: '1',
        name: 'Focus Beginner',
        description: 'Complete 5 focus sessions',
        icon: 'brain',
        completed: true,
        progress: 5,
        goal: 5
      },
      {
        id: '2',
        name: 'Consistency Champion',
        description: 'Maintain a 5-day focus streak',
        icon: 'flame',
        completed: false,
        progress: 4,
        goal: 5
      },
      {
        id: '3',
        name: 'Deep Worker',
        description: 'Complete 10 focus sessions of 50+ minutes',
        icon: 'zap',
        completed: false,
        progress: 7,
        goal: 10
      }
    ]
  });
  
  // UI state
  const [activeTab, setActiveTab] = useState("timer");
  const [timerProgress, setTimerProgress] = useState(0);
  const [isPulsing, setIsPulsing] = useState(false);
  
  // Refs
  const timerRef = useRef<NodeJS.Timeout | null>(null);
  const startTimeRef = useRef<Date | null>(null);
  const audioRef = useRef<HTMLAudioElement | null>(null);
  
  // Historical sessions data
  const [historicalSessions, setHistoricalSessions] = useState<SessionData[]>([
    {
      id: '1',
      completedPomodoros: 4,
      totalFocusTime: 100,
      startTime: new Date(Date.now() - 2 * 24 * 60 * 60 * 1000),
      endTime: new Date(Date.now() - 2 * 24 * 60 * 60 * 1000 + 2 * 60 * 60 * 1000),
      task: "Project research",
      successful: true,
      distractions: 2
    },
    {
      id: '2',
      completedPomodoros: 2,
      totalFocusTime: 50,
      startTime: new Date(Date.now() - 1 * 24 * 60 * 60 * 1000),
      endTime: new Date(Date.now() - 1 * 24 * 60 * 60 * 1000 + 1 * 60 * 60 * 1000),
      task: "Writing documentation",
      successful: true,
      distractions: 1
    },
    {
      id: '3',
      completedPomodoros: 3,
      totalFocusTime: 75,
      startTime: new Date(Date.now() - 8 * 60 * 60 * 1000),
      endTime: new Date(Date.now() - 6.5 * 60 * 60 * 1000),
      task: "Code review",
      successful: false,
      distractions: 5
    }
  ]);

  // Initialize audio
  useEffect(() => {
    audioRef.current = new Audio('/sounds/bell.mp3');
    
    // Apply passed plan settings on component mount
    if (passedState?.sessionPlan) {
      const plan = passedState.sessionPlan;
      console.log("Received session plan:", plan);
      if (plan.plannedDurationMinutes) {
        // Update settings and timer state based on the plan
        setSettings(prev => ({ ...prev, focusDuration: plan.plannedDurationMinutes }));
        if (timerState === 'idle') { // Only update if idle
          setTimeRemaining(plan.plannedDurationMinutes * 60);
        }
      }
      if (plan.taskName) {
        setCurrentTask(plan.taskName);
      }
      // Optional: Auto-start the timer if a plan was passed?
      // startTimer(); 
    }

    return () => {
      if (timerRef.current) {
        clearInterval(timerRef.current);
      }
    };
  }, [passedState]);

  // Update linked task info and timer duration if passedState changes (e.g., navigation)
  useEffect(() => {
    if (passedState?.sessionPlan) {
      const plan = passedState.sessionPlan;
      console.log("FocusTimer: Received/Updated session plan:", plan);
      
      // Update linked task state
      setLinkedTaskId(plan.taskId);
      setLinkedTaskName(plan.taskName);
      
      // Update the displayed task name if it changed
      if (plan.taskName) {
        setCurrentTask(plan.taskName); 
      } else {
        setCurrentTask(""); // Clear if no task name provided
      }

      // Update settings and timer duration if planned duration exists AND timer is idle
      if (plan.plannedDurationMinutes && timerState === 'idle') {
        const newDuration = plan.plannedDurationMinutes;
        setSettings(prev => ({ ...prev, focusDuration: newDuration }));
        setTimeRemaining(newDuration * 60);
        console.log(`FocusTimer: Set duration to ${newDuration} minutes from plan.`);
      }
    }
  }, [passedState, timerState]); // Add timerState dependency

  // Calculate timer progress percentage
  useEffect(() => {
    if (timerState === 'idle') {
      setTimerProgress(0);
      return;
    }
    
    const totalSeconds = timerState === 'focus'
      ? settings.focusDuration * 60
      : timerState === 'shortBreak'
        ? settings.shortBreakDuration * 60
        : settings.longBreakDuration * 60;
    
    setTimerProgress(100 - (timeRemaining / totalSeconds * 100));
    
    // Add pulsing effect in last 10 seconds
    if (timeRemaining <= 10 && !isPulsing) {
      setIsPulsing(true);
    } else if (timeRemaining > 10 && isPulsing) {
      setIsPulsing(false);
    }
  }, [timeRemaining, timerState, settings]);
  
  // Timer logic
  const startTimer = () => {
    if (timerState === 'idle') {
      setTimerState('focus');
      setTimeRemaining(settings.focusDuration * 60);
      setSessionData({
        ...sessionData,
        startTime: new Date(),
        task: linkedTaskName || currentTask,
        distractions: 0,
        successful: false
      });
    }
    
    setIsRunning(true);
    startTimeRef.current = new Date();
    
    timerRef.current = setInterval(() => {
      setTimeRemaining(prev => {
        if (prev <= 1) {
          handleTimerComplete();
          return 0;
        }
        return prev - 1;
      });
    }, 1000);
    
    toast.success(`${timerState === 'focus' ? 'Focus' : 'Break'} timer started`);
  };
  
  const pauseTimer = () => {
    if (timerRef.current) {
      clearInterval(timerRef.current);
      timerRef.current = null;
    }
    setIsRunning(false);
    toast.info("Timer paused");
  };
  
  const resetTimer = () => {
    pauseTimer();
    setTimerState('idle');
    setTimeRemaining(settings.focusDuration * 60);
    setTimerProgress(0);
    setCompletedPomodoros(0);
    setDistractionCount(0);
    setSessionData({
      completedPomodoros: 0,
      totalFocusTime: 0,
      startTime: new Date(),
      endTime: new Date(),
      task: linkedTaskName || currentTask,
      successful: false,
      distractions: 0,
      task_id: linkedTaskId
    });
    toast.info("Timer reset");
  };
  
  const skipToNext = () => {
    pauseTimer();
    
    if (timerState === 'focus') {
      const nextBreakIsLong = (completedPomodoros + 1) % settings.longBreakInterval === 0;
      
      setCompletedPomodoros(prev => prev + 1);
      
      if (nextBreakIsLong) {
        setTimerState('longBreak');
        setTimeRemaining(settings.longBreakDuration * 60);
        toast.success(`Long break started (${settings.longBreakDuration} minutes)`);
          } else {
        setTimerState('shortBreak');
        setTimeRemaining(settings.shortBreakDuration * 60);
        toast.success(`Short break started (${settings.shortBreakDuration} minutes)`);
      }
      
      if (settings.autoStartBreaks) {
        startTimer();
      }
    } else {
      setTimerState('focus');
      setTimeRemaining(settings.focusDuration * 60);
      toast.success(`Focus session started (${settings.focusDuration} minutes)`);
      
      if (settings.autoStartFocus) {
        startTimer();
      }
    }
  };
  
  const handleTimerComplete = () => {
    pauseTimer();
    
    // Play sound if enabled
    if (settings.notificationSound && audioRef.current) {
      audioRef.current.play().catch(e => console.error("Error playing sound:", e));
    }
    
    // Show notification if enabled
    if (settings.notificationSound) {
      if (timerState === 'focus') {
        toast.success("Focus session completed! Time for a break.", {
          duration: 5000
        });
        
        if ('Notification' in window && Notification.permission === 'granted') {
          new Notification('Focus Session Complete', {
            body: 'Great job! Time for a break.',
            icon: '/favicon.ico'
          });
        }
      } else {
        toast.success("Break finished! Ready to focus again?", {
          duration: 5000
        });
        
        if ('Notification' in window && Notification.permission === 'granted') {
          new Notification('Break Complete', {
            body: 'Break time is over. Ready to focus again?',
            icon: '/favicon.ico'
          });
        }
      }
    }
    
    // Update session data if completing a focus session
    if (timerState === 'focus') {
      const totalFocusTime = settings.focusDuration;
      setSessionData(prev => ({
        ...prev,
        totalFocusTime: prev.totalFocusTime + totalFocusTime,
        completedPomodoros: prev.completedPomodoros + 1,
        distractions: distractionCount
      }));
      
      // Check if we've completed enough pomodoros for a long break
      const completedCycles = (completedPomodoros + 1) % settings.longBreakInterval;
      
      if (completedCycles === 0) {
        setTimerState('longBreak');
        setTimeRemaining(settings.longBreakDuration * 60);
      } else {
        setTimerState('shortBreak');
        setTimeRemaining(settings.shortBreakDuration * 60);
      }
      
      if (settings.autoStartBreaks) {
        startTimer();
      }
    } else {
      // Finished a break
      setTimerState('focus');
      setTimeRemaining(settings.focusDuration * 60);
      
      if (settings.autoStartFocus) {
        startTimer();
      }
    }
  };
  
  const completeSession = async () => {
    pauseTimer();
    
    const endTime = new Date();
    const totalFocusTimeMinutes = completedPomodoros * settings.focusDuration;
    
    // Combine task name and session notes into the notes field for saving
    const finalNotes = [
        linkedTaskName ? `Task: ${linkedTaskName}` : null,
        sessionNotes ? `Notes: ${sessionNotes}` : null
    ].filter(Boolean).join('\n'); // Combine task and notes

    const finalSessionData: Partial<FocusSession> = {
      user_id: user?.id,
      start_time: sessionData.startTime.toISOString(),
      end_time: endTime.toISOString(),
      duration_minutes: totalFocusTimeMinutes, 
      focus_type: settings.focusDuration > 50 ? 'deep_work' : 'pomodoro', 
      completed: true, 
      notes: finalNotes || null, // Use combined notes, ensure null if empty
      distractions_count: distractionCount,
      status: 'completed',
      task_id: linkedTaskId || null
    };
    
    try {
      const savedSession = await createFocusSession(finalSessionData);
      console.log("Session saved:", savedSession);
      
      // Create the entry for local history state
      const newHistoryEntry: SessionData = {
        id: savedSession.id,
        completedPomodoros: completedPomodoros,
        totalFocusTime: totalFocusTimeMinutes,
        startTime: sessionData.startTime,
        endTime: endTime,
        task: linkedTaskName || currentTask,
        notes: sessionNotes,
        successful: true,
        distractions: distractionCount,
        // Mirror fields from savedSession
        user_id: savedSession.user_id,
        start_time_iso: savedSession.start_time,
        end_time_iso: savedSession.end_time,
        duration_minutes: savedSession.duration_minutes,
        focus_type: savedSession.focus_type,
        completed: savedSession.completed,
        task_id: savedSession.task_id,
        distractions_count: savedSession.distractions_count,
        status: savedSession.status
      };

      setHistoricalSessions(prev => [newHistoryEntry, ...prev]);
      
      // Update local stats 
      setStats(prev => ({
        ...prev,
        dailyTotal: prev.dailyTotal + totalFocusTimeMinutes,
        weeklyTotal: prev.weeklyTotal + totalFocusTimeMinutes,
        sessionsToday: prev.sessionsToday + 1,
      }));

      toast.success("Session completed and saved!", { duration: 5000 });
      
      // Prepare data for callback, ensuring notes is string | undefined
      const callbackData: SessionData = {
        ...newHistoryEntry,
        notes: newHistoryEntry.notes ?? undefined, // Convert null to undefined for callback
        task: linkedTaskName || newHistoryEntry.task,
        task_id: newHistoryEntry.task_id,
      };

      // Callback with the saved session data structure
      if (onSessionComplete) {
        onSessionComplete(callbackData); // Pass the aligned structure
      }

    } catch (error) {
      console.error("Failed to save session:", error);
      toast.error("Failed to save session. Please try again.", {
        description: error instanceof Error ? error.message : undefined
      });
    } finally {
      resetTimer();
      setSessionNotes("");
      setDistractionCount(0);
    }
  };
  
  const logDistraction = () => {
    if (isRunning && timerState === 'focus') {
      setDistractionCount(prev => prev + 1);
      toast.info("Distraction logged. Stay focused!", {
        duration: 3000
      });
    }
  };
  
  const updateSetting = (key: keyof TimerSettings, value: any) => {
    setSettings(prev => ({
      ...prev,
      [key]: value
    }));
    
    // If updating a timer length and timer is idle, update the remaining time
    if (timerState === 'idle' && (key === 'focusDuration')) {
      setTimeRemaining(value * 60);
    }
    
    toast.success(`Setting updated: ${key.replace(/([A-Z])/g, ' $1').toLowerCase()}`);
  };
  
  const formatTime = (seconds: number): string => {
    const mins = Math.floor(seconds / 60);
    const secs = seconds % 60;
    return `${mins.toString().padStart(2, '0')}:${secs.toString().padStart(2, '0')}`;
  };

  const getStateTitle = (): string => {
    switch (timerState) {
      case 'focus':
        return 'Focus Session';
      case 'shortBreak':
        return 'Short Break';
      case 'longBreak':
        return 'Long Break';
      default:
        return 'Ready to Focus';
    }
  };
  
  const formatDate = (date: Date): string => {
    return new Intl.DateTimeFormat('en-US', {
      weekday: 'short',
      month: 'short',
      day: 'numeric',
      hour: 'numeric',
      minute: 'numeric'
    }).format(date);
  };
  
  const getProgressColor = (): string => {
    switch (timerState) {
      case 'focus':
        return 'bg-red-500';
      case 'shortBreak':
        return 'bg-green-500';
      case 'longBreak':
        return 'bg-blue-500';
      default:
        return 'bg-slate-500';
    }
  };
  
  const getAchievementIcon = (iconName: string) => {
    switch (iconName) {
      case 'brain':
        return <Brain className="h-5 w-5" />;
      case 'flame':
        return <Flame className="h-5 w-5" />;
      case 'zap':
        return <Zap className="h-5 w-5" />;
      default:
        return <Trophy className="h-5 w-5" />;
    }
  };
  
  const getDailyGoalProgress = (): number => {
    return Math.min(100, (stats.dailyTotal / settings.dailyGoalMinutes) * 100);
  };

  const InfoTooltip = ({ content }: { content: string }) => (
    <TooltipProvider delayDuration={100}>
      <Tooltip>
        <TooltipTrigger asChild>
          <Button variant="ghost" size="icon" className="ml-1 p-0 h-4 w-4 text-muted-foreground hover:text-foreground">
            <Info className="h-3 w-3" />
          </Button>
        </TooltipTrigger>
        <TooltipContent>
          <p className="max-w-xs text-xs">{content}</p>
        </TooltipContent>
      </Tooltip>
    </TooltipProvider>
  );

  const calculateDailyProgress = useCallback(() => {
    const today = new Date().toISOString().split('T')[0];
    const todaysSessions = historicalSessions.filter(session => 
        session.startTime && 
        new Date(session.startTime).toISOString().startsWith(today) && 
        (session.focus_type === 'deep_work' || session.focus_type === 'pomodoro' || session.focus_type === 'timeboxed')
    );
    const dailyTotalMinutes = todaysSessions.reduce((sum, session) => sum + (session.duration_minutes || 0), 0);
    const progress = settings.dailyGoalMinutes > 0 
      ? (dailyTotalMinutes / settings.dailyGoalMinutes) * 100
      : 0;
    return Math.min(100, progress);
  }, [historicalSessions, settings.dailyGoalMinutes]);

  return (
    <div className="w-full">
      <Tabs defaultValue={activeTab} onValueChange={setActiveTab} className="w-full">
        <TabsList className="grid grid-cols-2 mb-6">
          <TabsTrigger value="timer">Timer</TabsTrigger>
          <TabsTrigger value="stats">Stats</TabsTrigger>
        </TabsList>
        
        <TabsContent value="timer" className="space-y-6">
          <Card className="overflow-hidden">
            <CardHeader className="pb-4">
                  <div className="flex justify-between items-center">
                    <AnimatePresence mode="wait">
                      <motion.div
                        key={timerState}
                        initial={{ opacity: 0, y: -10 }}
                        animate={{ opacity: 1, y: 0 }}
                        exit={{ opacity: 0, y: 10 }}
                        transition={{ duration: 0.2 }}
                      >
                        <CardTitle>{getStateTitle()}</CardTitle>
                        {linkedTaskName && (
                          <CardDescription className="text-center pt-1 text-base">
                            Focusing on: <span className="font-semibold">{linkedTaskName}</span>
                          </CardDescription>
                        )}
                      </motion.div>
                    </AnimatePresence>
                    <Badge variant={isRunning ? "default" : "outline"} className="capitalize">
                       {isRunning ? timerState : "Paused"}
                     </Badge>
                  </div>
                </CardHeader>
            
            <CardContent className="space-y-8 pt-2 pb-8">
              <AnimatePresence>
                {!isRunning && timerState === 'idle' && (
                  <motion.div 
                    className="space-y-2"
                    initial={{ opacity: 0, height: 0 }}
                    animate={{ opacity: 1, height: 'auto' }}
                    exit={{ opacity: 0, height: 0 }}
                    transition={{ duration: 0.3 }}
                  >
                    <Label htmlFor="task">What are you working on?</Label>
                    <input
                      id="task"
                      className="w-full px-3 py-2 border border-input bg-background rounded-md text-sm disabled:opacity-70 disabled:cursor-not-allowed"
                      value={currentTask}
                      onChange={(e) => setCurrentTask(e.target.value)}
                      placeholder="Enter task name or link from planner..."
                      disabled={!!linkedTaskName}
                    />
                  </motion.div>
                )}
              </AnimatePresence>
              
              <div className="relative mx-auto w-56 h-56 flex items-center justify-center">
                <div className="absolute inset-0 rounded-full border-8 border-muted" />
                <motion.div 
                    className={`absolute inset-0 rounded-full`}
                    style={{ 
                       background: `conic-gradient(hsl(var(--primary)) ${timerProgress}%, transparent 0%)`,
                       borderRadius: '100%'
                     }}
                    initial={{ opacity: 0 }}
                    animate={{ opacity: 1 }}
                    exit={{ opacity: 0 }}
                    transition={{ duration: 0.5 }}
                  />
                <div className="absolute inset-2 bg-card rounded-full" />
                <div className="absolute inset-0 rounded-full flex items-center justify-center flex-col z-10">
                  <motion.h2 
                     className={`text-5xl font-bold tracking-tight tabular-nums ${isPulsing ? 'animate-pulse text-primary' : ''}`}
                     key={timeRemaining}
                     initial={{ opacity: 0.5, scale: 0.98 }}
                     animate={{ opacity: 1, scale: 1 }}
                     transition={{ duration: 0.15 }}
                   >
                     {formatTime(timeRemaining)}
                   </motion.h2>
                   <AnimatePresence mode="wait">
                     <motion.p 
                       className="text-sm text-muted-foreground mt-1 capitalize"
                       key={timerState + "-label"}
                       initial={{ opacity: 0 }}
                       animate={{ opacity: 1 }}
                       exit={{ opacity: 0 }}
                       transition={{ duration: 0.2 }}
                     >
                       {timerState !== 'idle' ? `${timerState.replace('Break', ' break')}` : 'Ready'}
                     </motion.p>
                   </AnimatePresence>
                   {completedPomodoros > 0 && (
                    <div className="absolute bottom-4 flex items-center space-x-1.5">
                      {Array.from({ length: completedPomodoros }).map((_, i) => (
                        <motion.div 
                          key={i} 
                          className="w-2 h-2 rounded-full bg-primary/80"
                          initial={{ scale: 0 }}
                          animate={{ scale: 1 }}
                          transition={{ delay: i * 0.05 }}
                        />
                      ))}
                    </div>
                  )}
                 </div>
               </div>
              
              <AnimatePresence>
                {(timerState === 'shortBreak' || timerState === 'longBreak') && (
                  <motion.div 
                    className="text-center text-sm text-primary/90 font-medium pt-2"
                    initial={{ opacity: 0, y: 10 }}
                    animate={{ opacity: 1, y: 0 }}
                    exit={{ opacity: 0, y: -10 }}
                    transition={{ duration: 0.3 }}
                    key="break-suggestion"
                  >
                     {timerState === 'shortBreak' ? "💡 Quick break: Stretch or grab some water!" : "💡 Long break: Step away, relax your eyes!"}
                   </motion.div>
                 )}
              </AnimatePresence>

              <div className="grid grid-cols-3 gap-3">
                      {isRunning ? (
                  <Button onClick={pauseTimer} variant="outline" className="w-full">
                    <Pause className="h-4 w-4 mr-2" />
                          Pause
                  </Button>
                      ) : (
                  <Button onClick={startTimer} variant="default" className="w-full">
                    <Play className="h-4 w-4 mr-2" />
                          Start
                  </Button>
                      )}
                
                <Button onClick={skipToNext} variant="outline" className="w-full">
                  <SkipForward className="h-4 w-4 mr-2" />
                  Skip
                    </Button>
                
                <Button onClick={resetTimer} variant="outline" className="w-full">
                  <RefreshCw className="h-4 w-4 mr-2" />
                      Reset
                    </Button>
              </div>
              
              {(isRunning || timerState !== 'idle') && (
                <div className="space-y-4 pt-4 border-t">
                  <div className="flex justify-between text-sm text-muted-foreground">
                    <div>
                      <Clock className="inline h-4 w-4 mr-1" />
                      Completed: {completedPomodoros} {completedPomodoros === 1 ? 'session' : 'sessions'}
                    </div>
                    <div>
                      <Shield className="inline h-4 w-4 mr-1" />
                      Distractions: {distractionCount}
                    </div>
                  </div>
                  
                  {timerState === 'focus' && isRunning && (
                      <Button 
                        variant="outline"
                      size="sm" 
                      className="w-full"
                      onClick={logDistraction}
                      >
                      <AlertTriangle className="h-4 w-4 mr-2" />
                      Log Distraction
                      </Button>
                    )}
                  </div>
              )}
              
              <Accordion type="single" collapsible className="w-full pt-4 border-t">
                <AccordionItem value="timer-settings">
                  <AccordionTrigger className="text-base font-medium">Timer Settings</AccordionTrigger>
                  <AccordionContent className="pt-4 space-y-5">
                      <div className="space-y-2">
                        <div className="flex items-center">
                          <Label htmlFor="focusDuration">Focus Duration</Label>
                          <InfoTooltip content="Length of each focus session in minutes." />
                        </div>
                        <div className="flex items-center gap-2">
                          <Slider
                            id="focusDuration"
                            defaultValue={[settings.focusDuration]}
                            min={5}
                            max={90}
                            step={5}
                            onValueChange={([val]) => updateSetting('focusDuration', val)}
                          />
                          <span className="w-10 text-center text-sm tabular-nums">{settings.focusDuration}m</span>
                        </div>
                    </div>
                      
                      <div className="space-y-2">
                         <div className="flex items-center">
                           <Label htmlFor="shortBreakDuration">Short Break</Label>
                           <InfoTooltip content="Length of short breaks between focus sessions." />
                         </div>
                        <div className="flex items-center gap-2">
                          <Slider
                            id="shortBreakDuration"
                            defaultValue={[settings.shortBreakDuration]}
                            min={1}
                            max={15}
                            step={1}
                            onValueChange={([val]) => updateSetting('shortBreakDuration', val)}
                          />
                          <span className="w-10 text-center text-sm tabular-nums">{settings.shortBreakDuration}m</span>
                        </div>
                  </div>
                  
                      <div className="space-y-2">
                         <div className="flex items-center">
                           <Label htmlFor="longBreakDuration">Long Break</Label>
                           <InfoTooltip content="Length of longer breaks after a set number of focus sessions." />
                         </div>
                        <div className="flex items-center gap-2">
                          <Slider
                            id="longBreakDuration"
                            defaultValue={[settings.longBreakDuration]}
                            min={5}
                            max={30}
                            step={5}
                            onValueChange={([val]) => updateSetting('longBreakDuration', val)}
                          />
                          <span className="w-10 text-center text-sm tabular-nums">{settings.longBreakDuration}m</span>
                        </div>
                      </div>
                      
                      <div className="space-y-2">
                         <div className="flex items-center">
                           <Label htmlFor="longBreakInterval">Sessions Before Long Break</Label>
                           <InfoTooltip content="Number of focus sessions to complete before taking a long break." />
                         </div>
                        <div className="flex items-center gap-2">
                          <Slider
                            id="longBreakInterval"
                            defaultValue={[settings.longBreakInterval]}
                            min={2}
                            max={10}
                            step={1}
                            onValueChange={([val]) => updateSetting('longBreakInterval', val)}
                          />
                          <span className="w-10 text-center text-sm tabular-nums">{settings.longBreakInterval}</span>
                        </div>
                      </div>

                      <div className="space-y-2">
                         <div className="flex items-center">
                           <Label htmlFor="dailyGoalMinutes">Daily Focus Goal</Label>
                           <InfoTooltip content="Your target total focus time for the day." />
                         </div>
                         <div className="flex items-center gap-2">
                           <Slider
                             id="dailyGoalMinutes"
                             defaultValue={[settings.dailyGoalMinutes]}
                             min={30}
                             max={480}
                             step={15}
                             onValueChange={([val]) => updateSetting('dailyGoalMinutes', val)}
                           />
                           <span className="w-16 text-center text-sm tabular-nums">
                              {Math.floor(settings.dailyGoalMinutes / 60)}h {settings.dailyGoalMinutes % 60}m
                            </span>
                         </div>
                       </div>
                      
                      <div className="grid grid-cols-1 sm:grid-cols-2 gap-x-4 gap-y-3 pt-2">
                        <div className="flex items-center justify-between space-x-2">
                           <div className="flex items-center">
                             <Label htmlFor="autoStartFocus" className="cursor-pointer">Auto-start Focus</Label>
                             <InfoTooltip content="Automatically start the next focus session after a break ends." />
                           </div>
                          <Switch
                            id="autoStartFocus"
                            checked={settings.autoStartFocus}
                            onCheckedChange={(checked) => updateSetting('autoStartFocus', checked)}
                           />
                        </div>
                        <div className="flex items-center justify-between space-x-2">
                           <div className="flex items-center">
                             <Label htmlFor="autoStartBreaks" className="cursor-pointer">Auto-start Breaks</Label>
                             <InfoTooltip content="Automatically start the break timer after a focus session ends." />
                           </div>
                          <Switch
                            id="autoStartBreaks"
                            checked={settings.autoStartBreaks}
                            onCheckedChange={(checked) => updateSetting('autoStartBreaks', checked)}
                           />
                        </div>
                      </div>
                      
                      <div className="space-y-2 pt-3">
                         <div className="flex items-center">
                            <Label htmlFor="notificationSound">Notification Sound</Label>
                            <InfoTooltip content="Sound played when a timer completes." />
                         </div>
                         <Select 
                           value={settings.notificationSound} 
                           onValueChange={(val: TimerSettings['notificationSound']) => updateSetting('notificationSound', val)}
                         >
                           <SelectTrigger id="notificationSound">
                             <SelectValue placeholder="Select sound" />
                           </SelectTrigger>
                           <SelectContent>
                             <SelectItem value="ding">Ding</SelectItem>
                             <SelectItem value="bell">Bell</SelectItem>
                             <SelectItem value="chime">Chime</SelectItem>
                             <SelectItem value="none">None</SelectItem> 
                           </SelectContent>
                         </Select>
                       </div>
                  </AccordionContent>
                </AccordionItem>
              </Accordion>

              {(isRunning || timerState !== 'idle') && currentTask && (
                <div className="pt-4 space-y-3 border-t">
                  <div>
                    <Label htmlFor="notes" className="text-sm">Session Notes</Label>
                    <textarea
                      id="notes"
                      rows={3}
                      className="w-full px-3 py-2 border border-input bg-background rounded-md mt-1"
                      placeholder="Add notes about your progress..."
                      value={sessionNotes}
                      onChange={(e) => setSessionNotes(e.target.value)}
                    />
            </div>
          </div>
        )}
                </CardContent>
            
            {(isRunning || timerState !== 'idle') && (
              <CardFooter>
                <Button onClick={completeSession} variant="default" className="w-full">
                  <CheckCircle className="h-4 w-4 mr-2" />
                  Complete Session
                </Button>
              </CardFooter>
            )}
              </Card>
        </TabsContent>
        
        <TabsContent value="stats" className="space-y-6">
              <Card>
                <CardHeader>
              <CardTitle>Focus Statistics</CardTitle>
              <CardDescription>Track your productivity progress</CardDescription>
                </CardHeader>
            <CardContent className="space-y-6">
              <div className="space-y-2">
                <div className="flex justify-between">
                  <Label>Daily Goal Progress</Label>
                  <span className="text-sm font-medium">{stats.dailyTotal} / {settings.dailyGoalMinutes} min</span>
            </div>
                <Progress value={calculateDailyProgress()} className="h-2" />
          </div>
              
              <div className="grid grid-cols-2 gap-4">
                <div className="space-y-1">
                  <Label className="text-sm text-muted-foreground">Weekly Total</Label>
                  <p className="font-medium">{stats.weeklyTotal} minutes</p>
                </div>
                <div className="space-y-1">
                  <Label className="text-sm text-muted-foreground">Daily Streak</Label>
                  <p className="font-medium">{stats.streak} days</p>
                </div>
              </div>
              
              <div className="space-y-1">
                <Label className="text-sm text-muted-foreground">Recent Sessions</Label>
                <div className="space-y-2 max-h-48 overflow-y-auto pr-2">
                  {historicalSessions.length > 0 ? (
                    historicalSessions.map((session, index) => (
                      <div key={index} className="flex justify-between items-center border-b pb-2">
                        <div>
                          <p className="font-medium text-sm">{session.task || "Unnamed session"}</p>
                          <p className="text-xs text-muted-foreground">{formatDate(session.startTime)}</p>
                        </div>
                        <div className="text-right">
                          <Badge variant={session.successful ? "default" : "destructive"}>
                            {session.totalFocusTime} min
                          </Badge>
                          <p className="text-xs text-muted-foreground">
                            {session.completedPomodoros} session{session.completedPomodoros === 1 ? '' : 's'}
                          </p>
                        </div>
                      </div>
                    ))
                  ) : (
                    <p className="text-sm text-muted-foreground text-center py-4">
                      No sessions recorded yet
                    </p>
        )}
      </div>
              </div>
              
              <div className="space-y-3">
                <Label>Achievements</Label>
                <div className="space-y-2">
                  {stats.achievements.map((achievement, index) => (
                    <div key={index} className="flex items-center gap-3 p-3 border rounded-md">
                      <div className={`p-2 rounded-full ${achievement.completed ? 'bg-green-100 text-green-600' : 'bg-slate-100 text-slate-600'}`}>
                        {getAchievementIcon(achievement.icon)}
                      </div>
                      <div className="flex-1 min-w-0">
                        <p className="font-medium text-sm">{achievement.name}</p>
                        <p className="text-xs text-muted-foreground">{achievement.description}</p>
                        <div className="mt-1">
                          <Progress 
                            value={(achievement.progress / achievement.goal) * 100} 
                            className="h-1"
                          />
                        </div>
                      </div>
                      <Badge variant={achievement.completed ? "default" : "outline"}>
                        {achievement.progress}/{achievement.goal}
                      </Badge>
                    </div>
                  ))}
                </div>
              </div>
            </CardContent>
          </Card>
        </TabsContent>
      </Tabs>
    </div>
  );
};

export default FocusTimer; 