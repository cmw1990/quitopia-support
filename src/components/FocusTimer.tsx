import React, { useState, useEffect, useCallback, useRef, useMemo } from 'react';
import { Play, Pause, RefreshCw, CheckCircle, Settings, Coffee, SkipForward, BellOff, BellRing, Plus, Trash2, Clock, Ban, ShieldCheck, BarChartHorizontal, Pencil, Save, X, MessageSquareWarning } from 'lucide-react';
import { Button } from './ui/button';
import { Slider } from './ui/slider';
import { Card, CardContent, CardHeader, CardTitle, CardDescription, CardFooter } from './ui/card';
import { Progress } from './ui/progress';
import { Label } from './ui/label';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from './ui/select';
import { motion } from 'framer-motion';
import { supabaseRequest } from '@/utils/supabaseRequest';
import { supabase } from '@/integrations/supabase/supabase-client';
import type { User } from '@supabase/supabase-js';
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogDescription, DialogFooter, DialogTrigger } from '@/components/ui/dialog';
import { Textarea } from '@/components/ui/textarea';
import { RadioGroup, RadioGroupItem } from '@/components/ui/radio-group';
import { Task } from '@/types/task';
import { toast } from 'sonner';
import { cn } from '@/lib/utils';
import { FocusSession, CreateFocusSessionDto, UpdateFocusSessionDto } from '@/types/focusSession';
import { useAuth } from '@/components/auth/AuthProvider';

type TimerPhase = 'WORK' | 'SHORT_BREAK' | 'LONG_BREAK';

// Interface for session data
interface FocusSessionData extends FocusSession {}

interface FocusDistractionData {
    id?: string;
    user_id: string;
    focus_session_id: string;
    timestamp: string;
    distraction_type: DistractionType;
    notes: string | null;
}

type DistractionType = 'internal' | 'external_env' | 'external_digital' | 'other';

type CreateDistractionDto = Omit<FocusDistractionData, 'id'>;

// Add task suggestion interface
interface TaskSuggestion {
  task: Task;
  reason: string;
  score: number;
}

// Add task suggestion helper
const suggestTasks = (tasks: Task[], currentPhase: TimerPhase): TaskSuggestion[] => {
  if (!tasks.length) return [];

  const suggestions: TaskSuggestion[] = tasks
    .filter(task => task.status === 'todo')
    .map(task => {
      let score = 0;
      let reasons: string[] = [];

      // Score based on priority
      if (task.priority === 'high') {
        score += 3;
        reasons.push('High priority');
      } else if (task.priority === 'medium') {
        score += 2;
      }

      // Score based on due date
      if (task.due_date) {
        const dueDate = new Date(task.due_date);
        const daysUntilDue = Math.ceil((dueDate.getTime() - Date.now()) / (1000 * 60 * 60 * 24));
        if (daysUntilDue <= 1) {
          score += 3;
          reasons.push('Due soon');
        } else if (daysUntilDue <= 3) {
          score += 2;
          reasons.push('Due in a few days');
        }
      }

      // Score based on cognitive load for different phases
      if (task.cognitive_load_estimate) {
        if (currentPhase === 'WORK' && task.cognitive_load_estimate >= 7) {
          score += 2;
          reasons.push('High focus task');
        } else if (currentPhase === 'SHORT_BREAK' && task.cognitive_load_estimate <= 3) {
          score += 2;
          reasons.push('Good for short break');
        }
      }

      // Score based on estimated duration
      if (task.estimated_minutes) {
        const phaseDuration = currentPhase === 'WORK' ? 25 : currentPhase === 'SHORT_BREAK' ? 5 : 15;
        if (task.estimated_minutes <= phaseDuration * 60) {
          score += 2;
          reasons.push('Fits in current phase');
        }
      }

      return {
        task,
        score,
        reason: reasons.join(', ') || 'Available task'
      };
    })
    .sort((a, b) => b.score - a.score)
    .slice(0, 3); // Get top 3 suggestions

  return suggestions;
};

// Add session stats interface
interface SessionStats {
  totalSessions: number;
  totalMinutes: number;
  averageSessionLength: number;
  completionRate: number;
  mostProductiveTime: string;
  distractionsByType: Record<DistractionType, number>;
}

// Add session stats helper
const calculateSessionStats = async (userId: string, workDuration: number, shortBreakDuration: number): Promise<SessionStats> => {
  try {
    // Fetch all sessions for the user
    const sessions = await supabaseRequest<FocusSessionData[]>(
      'focus_sessions8',
      'GET',
      {
        filters: {
          user_id: userId
        }
      }
    );

    // Fetch all distractions
    const distractions = await supabaseRequest<FocusDistractionData[]>(
      'focus_distractions',
      'GET',
      {
        filters: {
          user_id: userId
        }
      }
    );

    if (!sessions?.length) return {
      totalSessions: 0,
      totalMinutes: 0,
      averageSessionLength: 0,
      completionRate: 0,
      mostProductiveTime: 'N/A',
      distractionsByType: {
        internal: 0,
        external_env: 0,
        external_digital: 0,
        other: 0
      }
    };

    // Calculate basic stats
    const totalSessions = sessions.length;
    const totalMinutes = sessions.reduce((acc: number, session: FocusSessionData) => 
      acc + (session.actual_duration_seconds || 0) / 60, 0
    );
    const averageSessionLength = totalMinutes / totalSessions;

    // Calculate completion rate (sessions completed vs interrupted)
    const completedSessions = sessions.filter((s: FocusSessionData) => 
      s.actual_duration_seconds !== null && 
      s.actual_duration_seconds >= (s.technique === 'pomodoro' ? workDuration : shortBreakDuration)
    ).length;
    const completionRate = (completedSessions / totalSessions) * 100;

    // Calculate most productive time
    const sessionsByHour = new Array(24).fill(0);
    sessions.forEach((session: FocusSessionData) => {
      const hour = new Date(session.start_time).getHours();
      sessionsByHour[hour] += (session.actual_duration_seconds || 0) / 60;
    });
    const mostProductiveHour = sessionsByHour.indexOf(Math.max(...sessionsByHour));
    const mostProductiveTime = `${mostProductiveHour.toString().padStart(2, '0')}:00`;

    // Calculate distractions by type
    const distractionsByType = {
      internal: 0,
      external_env: 0,
      external_digital: 0,
      other: 0
    };
    distractions?.forEach((d: FocusDistractionData) => {
      if (d.distraction_type in distractionsByType) {
        distractionsByType[d.distraction_type as DistractionType]++;
      }
    });

    return {
      totalSessions,
      totalMinutes,
      averageSessionLength,
      completionRate,
      mostProductiveTime,
      distractionsByType
    };
  } catch (error) {
    console.error('Error calculating session stats:', error);
    throw error;
  }
};

// Add session stats component
const SessionStatsCard: React.FC<{ stats: SessionStats }> = ({ stats }) => {
  return (
    <Card>
      <CardHeader>
        <CardTitle className="text-lg">Focus Session Stats</CardTitle>
        <CardDescription>Your focus session performance</CardDescription>
      </CardHeader>
      <CardContent className="space-y-4">
        <div className="grid grid-cols-2 gap-4">
          <div className="space-y-1">
            <Label>Total Sessions</Label>
            <p className="text-2xl font-bold">{stats.totalSessions}</p>
          </div>
          <div className="space-y-1">
            <Label>Total Minutes</Label>
            <p className="text-2xl font-bold">{Math.round(stats.totalMinutes)}</p>
          </div>
          <div className="space-y-1">
            <Label>Avg. Session Length</Label>
            <p className="text-2xl font-bold">{Math.round(stats.averageSessionLength)}m</p>
          </div>
          <div className="space-y-1">
            <Label>Completion Rate</Label>
            <p className="text-2xl font-bold">{Math.round(stats.completionRate)}%</p>
          </div>
        </div>
        
        <div className="space-y-2">
          <Label>Most Productive Time</Label>
          <p className="text-lg font-semibold">{stats.mostProductiveTime}</p>
        </div>
        
        <div className="space-y-2">
          <Label>Distractions by Type</Label>
          <div className="space-y-1">
            {Object.entries(stats.distractionsByType).map(([type, count]) => (
              <div key={type} className="flex justify-between items-center">
                <span className="capitalize">{type.replace('_', ' ')}</span>
                <span className="font-medium">{count}</span>
              </div>
            ))}
          </div>
        </div>
      </CardContent>
    </Card>
  );
};

const FocusTimer = () => {
  const [phase, setPhase] = useState<TimerPhase>('WORK');
  const [cyclesCompleted, setCyclesCompleted] = useState(0);
  const [timeLeft, setTimeLeft] = useState(0); 
  const [isRunning, setIsRunning] = useState(false);
  const [showSettings, setShowSettings] = useState(false);
  const [sessionStartTime, setSessionStartTime] = useState<Date | null>(null);
  const [userId, setUserId] = useState<string | undefined>(undefined);
  
  // --- Notification State ---
  const [notificationPermission, setNotificationPermission] = useState<NotificationPermission>('default');
  const [notificationsEnabled, setNotificationsEnabled] = useState(true); 

  // --- Audio State ---
  const [audioContext, setAudioContext] = useState<AudioContext | null>(null);
  const [timerEndSoundBuffer, setTimerEndSoundBuffer] = useState<AudioBuffer | null>(null);
  const [soundEnabled, setSoundEnabled] = useState(true); 

  // --- Settings State --- 
  const [workDuration, setWorkDuration] = useState(25 * 60); 
  const [shortBreakDuration, setShortBreakDuration] = useState(5 * 60); 
  const [longBreakDuration, setLongBreakDuration] = useState(15 * 60); 
  const [cyclesBeforeLongBreak, setCyclesBeforeLongBreak] = useState(4);

  // --- New State for Distraction Logging ---
  const [currentFocusSessionId, setCurrentFocusSessionId] = useState<string | null>(null);
  const [showDistractionModal, setShowDistractionModal] = useState(false);
  const [distractionType, setDistractionType] = useState<DistractionType>('internal');
  const [distractionNotes, setDistractionNotes] = useState('');
  const [isLoggingDistraction, setIsLoggingDistraction] = useState(false);

  // --- Derived State --- 
  const currentDuration = 
    phase === 'WORK' ? workDuration : 
    phase === 'SHORT_BREAK' ? shortBreakDuration : 
    longBreakDuration;
  const progress = currentDuration > 0 ? Math.round(((currentDuration - timeLeft) / currentDuration) * 100) : 0;

  const [selectedTaskId, setSelectedTaskId] = useState<string | null>(null);
  const [availableTasks, setAvailableTasks] = useState<Task[]>([]);
  const [sessionStats, setSessionStats] = useState<SessionStats | null>(null);
  const [taskSuggestions, setTaskSuggestions] = useState<TaskSuggestion[]>([]);

  const auth = useAuth();

  useEffect(() => {
    supabase.auth.getUser().then(async ({ data: { user } }: { data: { user: User | null } }) => {
      setUserId(user?.id);
      if (user?.id) {
          try {
               const { data: tasksData, error: tasksError } = await supabase
                    .from('focus_tasks')
                    .select('*')
                    .eq('user_id', user.id)
                    .eq('completed', false)
                    .order('created_at', { ascending: false });
               if(tasksError) throw tasksError;
               setAvailableTasks((tasksData as Task[]) || []);
          } catch (error: any) { 
              console.error("Error fetching tasks for timer:", error);
              toast.error("Could not load tasks for timer.");
          }
      }
    });
  }, []);

  useEffect(() => {
    setTimeLeft(currentDuration);
    setIsRunning(false);
    if (phase === 'WORK') {
      setSessionStartTime(new Date()); 
    } else {
      setSessionStartTime(null); 
    }
  }, [phase, workDuration, shortBreakDuration, longBreakDuration]);

  useEffect(() => {
    if ('Notification' in window) {
      setNotificationPermission(Notification.permission);
    }
    const context = new (window.AudioContext || (window as any).webkitAudioContext)();
    setAudioContext(context);
    fetch('/sounds/timer-complete.mp3') 
      .then(response => response.arrayBuffer())
      .then(arrayBuffer => context.decodeAudioData(arrayBuffer))
      .then(audioBuffer => setTimerEndSoundBuffer(audioBuffer))
      .catch(error => console.error("Error loading timer sound:", error));
    return () => { context?.close(); }
  }, []);

  useEffect(() => {
    document.title = isRunning ? `${formatTime(timeLeft)} - ${phase}` : 'Easier Focus Timer';
  }, [timeLeft, isRunning, phase]);

  const showNotificationInternal = useCallback((title: string, options?: NotificationOptions) => {
    if (notificationPermission !== 'granted' || !notificationsEnabled) return;
    if (!('Notification' in window)) return;
    new Notification(title, { icon: '/favicon.ico', badge: '/favicon.ico', ...options });
  }, [notificationPermission, notificationsEnabled]);

  const playTimerEndSound = useCallback(() => {
    if (soundEnabled && audioContext && timerEndSoundBuffer) {
      try {
          if (audioContext.state === 'suspended') { audioContext.resume(); }
          const source = audioContext.createBufferSource();
          source.buffer = timerEndSoundBuffer;
          source.connect(audioContext.destination);
          source.start(0);
      } catch (error) { console.error("Error playing sound:", error); }
    }
  }, [soundEnabled, audioContext, timerEndSoundBuffer]);

  const requestNotificationPermission = useCallback(async () => {
    if (!('Notification' in window)) return;
    try {
      const permission = await Notification.requestPermission();
      setNotificationPermission(permission);
      if (permission === 'granted') {
        showNotificationInternal('Notifications Enabled', { body: 'You will now receive timer alerts.' });
      } else {
        setNotificationsEnabled(false); 
      }
    } catch (error) { 
        console.error('Error requesting notification permission:', error); 
        setNotificationsEnabled(false);
    }
  }, [showNotificationInternal]);
  
  const saveFocusSession = async (sessionData: CreateFocusSessionDto) => {
    try {
      const result = await supabaseRequest<FocusSession>(
        'focus_sessions8',
        'POST',
        {
          data: sessionData
        }
      );
      
      if (result) {
        toast.success('Focus session saved successfully');
        return result.id;
      } else {
        throw new Error('No data returned from save operation');
      }
    } catch (error) {
      console.error('Error saving focus session:', error);
      toast.error('Failed to save focus session');
      return null;
    }
  };

  const handleLogDistraction = async () => {
    const userId = auth?.user?.id;
    const sessionId = currentFocusSessionId;
    const type = distractionType;

    if (!userId || !sessionId || !type) {
      console.error('Missing required data for distraction log');
      toast.error('Cannot log distraction without required data.');
      return;
    }

    try {
      setIsLoggingDistraction(true);
      
      const distractionData = {
        user_id: userId as string,
        focus_session_id: sessionId as string,
        timestamp: new Date().toISOString(),
        distraction_type: type as DistractionType,
        notes: distractionNotes.trim() || null
      } satisfies Omit<FocusDistractionData, 'id'>;
      
      console.log('Logging distraction:', distractionData);
      
      const result = await supabaseRequest<FocusDistractionData>(
        'focus_distractions',
        'POST',
        { data: distractionData }
      );
      
      if (result) {
        toast.success('Distraction logged successfully');
        setIsLoggingDistraction(false);
        setDistractionType('internal');
        setDistractionNotes('');
        setShowDistractionModal(false);
      } else {
        throw new Error('No data returned from save operation');
      }
    } catch (error) {
      console.error('Error logging distraction:', error);
      toast.error('Failed to log distraction');
      setIsLoggingDistraction(false);
    }
  };

  const handlePhaseCompletion = useCallback(async () => {
    const endTime = new Date();
    setIsRunning(false); 
    playTimerEndSound();
    
    const completedPhase = phase;
    const phaseStartTime = (completedPhase === 'WORK' && sessionStartTime) ? sessionStartTime : null;
    const nextPhase = completedPhase === 'WORK' 
        ? (cyclesCompleted + 1) % cyclesBeforeLongBreak === 0 ? 'LONG_BREAK' : 'SHORT_BREAK' 
        : 'WORK';

    if (completedPhase === 'WORK' && phaseStartTime) {
      const sessionData: Omit<FocusSessionData, 'id'> = {
        start_time: phaseStartTime.toISOString(),
        end_time: endTime.toISOString(),
        duration_seconds: Math.max(0, Math.round((endTime.getTime() - phaseStartTime.getTime()) / 1000)),
        phase_type: 'WORK',
        user_id: userId,
        task_id: selectedTaskId
      };
      const savedSessionId = await saveFocusSession(sessionData);
      if(savedSessionId) setCurrentFocusSessionId(savedSessionId); 
    }
    
    const message = completedPhase === 'WORK' ? `Focus session complete! Time for a ${nextPhase === 'SHORT_BREAK' ? 'short' : 'long'} break.`
      : `Break finished! Time to focus.`;
    showNotificationInternal('Easier Focus Timer', { body: message, tag: 'timer-phase-end' });

    if (completedPhase === 'WORK') {
      setCyclesCompleted(prev => prev + 1);
    }
    setPhase(nextPhase); 

  }, [ phase, cyclesCompleted, cyclesBeforeLongBreak, playTimerEndSound, showNotificationInternal, sessionStartTime, userId, selectedTaskId ]);

  useEffect(() => {
    let intervalId: NodeJS.Timeout | undefined;
    if (isRunning && timeLeft > 0) {
      intervalId = setInterval(() => { setTimeLeft((prevTime) => prevTime - 1); }, 1000);
    } else if (isRunning && timeLeft <= 0) { 
      handlePhaseCompletion();
    }
    return () => clearInterval(intervalId);
  }, [isRunning, timeLeft]);

  const startTimer = () => {
    if (audioContext && audioContext.state === 'suspended') { audioContext.resume(); }
    if (timeLeft <= 0) { 
       handlePhaseCompletion();
       return;
    }
    setIsRunning(true);
  };

  const pauseTimer = () => setIsRunning(false);

  const resetCurrentPhase = () => {
    setIsRunning(false);
    setTimeLeft(currentDuration);
  };
  
  const skipToNextPhase = () => handlePhaseCompletion();

  const formatTime = (seconds: number): string => {
    const minutes = Math.floor(seconds / 60);
    const remainingSeconds = seconds % 60;
    return `${minutes.toString().padStart(2, '0')}:${remainingSeconds.toString().padStart(2, '0')}`;
  };

  const getPhaseInfo = () => {
    switch (phase) {
      case 'WORK': return { title: 'Focus Session', color: 'text-primary', bgColor: 'bg-primary/10', progressColor: 'bg-primary' };
      case 'SHORT_BREAK': return { title: 'Short Break', color: 'text-green-500', bgColor: 'bg-green-500/10', progressColor: 'bg-green-500' };
      case 'LONG_BREAK': return { title: 'Long Break', color: 'text-blue-500', bgColor: 'bg-blue-500/10', progressColor: 'bg-blue-500' };
      default: return { title: 'Focus', color: 'text-foreground', bgColor: 'bg-muted', progressColor: 'bg-primary' };
    }
  };
  const phaseInfo = getPhaseInfo();

  const updateWorkDuration = (value: number[]) => setWorkDuration(value[0] * 60);
  const updateShortBreakDuration = (value: number[]) => setShortBreakDuration(value[0] * 60);
  const updateLongBreakDuration = (value: number[]) => setLongBreakDuration(value[0] * 60);
  const updateCyclesBeforeLongBreak = (value: string) => setCyclesBeforeLongBreak(parseInt(value, 10));

  // Clear focus session ID when a new WORK phase starts
  useEffect(() => {
    if (phase === 'WORK') {
       setCurrentFocusSessionId(null); 
    }
  }, [phase]);

  // Add effect to load session stats
  useEffect(() => {
    if (userId) {
      calculateSessionStats(userId, workDuration, shortBreakDuration)
        .then(stats => setSessionStats(stats))
        .catch(error => {
          console.error('Error loading session stats:', error);
          toast.error('Could not load session statistics');
        });
    }
  }, [userId, workDuration, shortBreakDuration]);

  // Add effect to update task suggestions
  useEffect(() => {
    setTaskSuggestions(suggestTasks(availableTasks, phase));
  }, [availableTasks, phase]);

  return (
    <div className="container mx-auto py-12 px-4 space-y-6">
      {/* Notification Prompts */} 
      {notificationPermission === 'default' && (
        <div className="mb-4 p-3 bg-yellow-100 border border-yellow-300 rounded-md text-center text-sm text-yellow-800 flex items-center justify-center gap-4">
          <span>Enable notifications for timer alerts?</span>
          <Button size="sm" variant="outline" onClick={requestNotificationPermission}>Enable</Button>
        </div>
      )}
      {notificationPermission === 'denied' && notificationsEnabled && (
        <div className="mb-4 p-3 bg-red-100 border border-red-300 rounded-md text-center text-sm text-red-800">
          Notifications are blocked by your browser. Please update settings to receive alerts.
        </div>
      )}

      <Card className={`max-w-md mx-auto shadow-xl border-t-4 ${phaseInfo.color.replace('text-', 'border-')} transition-colors duration-500`}>
        <CardHeader className={`pb-4 ${phaseInfo.bgColor} transition-colors duration-500 rounded-t-lg`}>
          <div className="flex items-center justify-between">
            <CardTitle className={`text-xl font-bold ${phaseInfo.color} transition-colors duration-500`}>{phaseInfo.title}</CardTitle>
            <div className="flex items-center gap-1">
                {/* Sound Toggle */} 
                <Button variant="ghost" size="icon" onClick={() => setSoundEnabled(!soundEnabled)} title={soundEnabled ? 'Mute Sound' : 'Unmute Sound'} className={`rounded-full ${soundEnabled ? phaseInfo.color : 'text-muted-foreground'} hover:${phaseInfo.bgColor}`}>
                    {soundEnabled ? <BellRing className="h-5 w-5"/> : <BellOff className="h-5 w-5"/>}
                </Button>
                {/* Notification Toggle */} 
                {notificationPermission === 'granted' && (
                     <Button variant="ghost" size="icon" onClick={() => setNotificationsEnabled(!notificationsEnabled)} title={notificationsEnabled ? 'Disable Notifications' : 'Enable Notifications'} className={`rounded-full ${notificationsEnabled ? phaseInfo.color : 'text-muted-foreground'} hover:${phaseInfo.bgColor}`}>
                         {notificationsEnabled ? <BellRing className="h-5 w-5"/> : <BellOff className="h-5 w-5"/>}
                    </Button>
                )}
                {/* Settings */} 
                <Button variant="ghost" size="icon" onClick={() => setShowSettings(!showSettings)} title="Timer Settings" className={`rounded-full ${phaseInfo.color} hover:${phaseInfo.bgColor}`}>
                    <Settings className="h-5 w-5" />
                </Button>
            </div>
          </div>
          <CardDescription className="text-sm mt-1">
            Cycle {Math.floor(cyclesCompleted / cyclesBeforeLongBreak) + 1}, Session {(cyclesCompleted % cyclesBeforeLongBreak) + 1} / {cyclesBeforeLongBreak}
          </CardDescription>
        </CardHeader>
        <CardContent className="pt-8 pb-6">
          {showSettings ? (
            <motion.div initial={{ opacity: 0, height: 0 }} animate={{ opacity: 1, height: 'auto' }} exit={{ opacity: 0, height: 0 }} transition={{ duration: 0.3 }} className="space-y-6 overflow-hidden">
              <h3 className="text-lg font-semibold border-b pb-2 mb-4">Timer Settings</h3>
              {/* Duration Sliders */} 
              <div className="space-y-5">
                <div className="space-y-2">
                  <Label htmlFor="work-duration">Focus Duration (minutes)</Label>
                  <div className="flex justify-between items-center text-sm text-muted-foreground"><span>1</span><span>{workDuration / 60}</span><span>60</span></div>
                  <Slider id="work-duration" defaultValue={[workDuration / 60]} max={60} min={1} step={1} onValueChange={updateWorkDuration}/>
                </div>
                <div className="space-y-2">
                  <Label htmlFor="short-break">Short Break (minutes)</Label>
                  <div className="flex justify-between items-center text-sm text-muted-foreground"><span>1</span><span>{shortBreakDuration / 60}</span><span>30</span></div>
                  <Slider id="short-break" defaultValue={[shortBreakDuration / 60]} max={30} min={1} step={1} onValueChange={updateShortBreakDuration}/>
                </div>
                <div className="space-y-2">
                  <Label htmlFor="long-break">Long Break (minutes)</Label>
                  <div className="flex justify-between items-center text-sm text-muted-foreground"><span>5</span><span>{longBreakDuration / 60}</span><span>60</span></div>
                  <Slider id="long-break" defaultValue={[longBreakDuration / 60]} max={60} min={5} step={1} onValueChange={updateLongBreakDuration}/>
                </div>
              </div>
              {/* Cycles Setting */} 
              <div className="space-y-2">
                 <Label htmlFor="cycles">Focus Sessions Before Long Break</Label>
                 <Select defaultValue={cyclesBeforeLongBreak.toString()} onValueChange={updateCyclesBeforeLongBreak}>
                    <SelectTrigger id="cycles"><SelectValue placeholder="Select cycles..." /></SelectTrigger>
                    <SelectContent>{[2, 3, 4, 5, 6].map(num => (<SelectItem key={num} value={num.toString()}>{num}</SelectItem>))}</SelectContent>
                  </Select>
              </div>
              <CardFooter className="pt-6 pb-0 px-0 flex justify-end">
                <Button variant="default" onClick={() => setShowSettings(false)}>Close Settings</Button>
              </CardFooter>
            </motion.div>
          ) : (
            <div className="flex flex-col items-center space-y-6">
              {/* Task Selector */}
              {phase === 'WORK' && !isRunning && (
                 <div className="w-full space-y-1">
                     <Label htmlFor="task-select">Link to Task (Optional)</Label>
                     <Select 
                         value={selectedTaskId || ''} 
                         onValueChange={(value) => setSelectedTaskId(value || null)}
                         disabled={availableTasks.length === 0}
                     >
                         <SelectTrigger id="task-select">
                             <SelectValue placeholder={availableTasks.length > 0 ? "Select a task..." : "No active tasks found"} />
                         </SelectTrigger>
                         <SelectContent>
                             <SelectItem value="">None</SelectItem>
                             {availableTasks.map(task => (
                                 <SelectItem key={task.id} value={task.id}>{task.title}</SelectItem>
                             ))}
                         </SelectContent>
                     </Select>
                 </div>
              )}
              {/* Timer Display */} 
              <div className={`text-7xl font-bold tabular-nums ${phaseInfo.color} transition-colors duration-500`}>
                {formatTime(timeLeft)}
              </div>
              {/* Progress Bar */} 
              <Progress value={progress} className={`h-2 ${phaseInfo.progressColor} transition-colors duration-500`}/>
              {/* Controls */} 
              <div className="flex items-center justify-center space-x-4 pt-4">
                <Button variant="ghost" size="icon" onClick={resetCurrentPhase} title="Reset Current Phase" className="text-muted-foreground hover:text-foreground">
                  <RefreshCw className="h-5 w-5" />
                </Button>
                <Button size="lg" className={`rounded-full w-20 h-20 shadow-lg text-lg ${isRunning ? 'bg-red-500 hover:bg-red-600' : 'bg-primary hover:bg-primary/90'}`} onClick={isRunning ? pauseTimer : startTimer}>
                  {isRunning ? <Pause className="h-8 w-8" /> : <Play className="h-8 w-8" />}
                </Button>
                <Button variant="ghost" size="icon" onClick={skipToNextPhase} title="Skip to Next Phase" className="text-muted-foreground hover:text-foreground">
                  <SkipForward className="h-5 w-5" />
                </Button>
              </div>
              {/* Distraction Logger Button & Dialog */}
              <Dialog open={showDistractionModal} onOpenChange={setShowDistractionModal}>
                <DialogTrigger asChild>
                  <Button 
                      variant="secondary" 
                      className="w-full max-w-xs mt-6" 
                      disabled={!isRunning || phase !== 'WORK' || !currentFocusSessionId}
                      title={!currentFocusSessionId ? "Session data not saved yet" : undefined}
                    >
                    <MessageSquareWarning className="mr-2 h-4 w-4" /> Log Distraction
                  </Button>
                </DialogTrigger>
                <DialogContent className="sm:max-w-[425px]">
                  <DialogHeader>
                    <DialogTitle>Log a Distraction</DialogTitle>
                    <DialogDescription>
                      What pulled your focus away? Logging helps identify patterns.
                    </DialogDescription>
                  </DialogHeader>
                  <div className="grid gap-4 py-4">
                    <div className="space-y-2">
                        <Label>Type of Distraction</Label>
                        <RadioGroup 
                           defaultValue={distractionType} 
                           onValueChange={(value: string) => setDistractionType(value as DistractionType)}
                           className="flex flex-col space-y-1"
                        >
                            <div className="flex items-center space-x-2">
                               <RadioGroupItem value="internal" id="distraction-internal" />
                               <Label htmlFor="distraction-internal">Internal Thought / Urge</Label>
                            </div>
                            <div className="flex items-center space-x-2">
                               <RadioGroupItem value="external_env" id="distraction-external_env" />
                               <Label htmlFor="distraction-external_env">External Environment (Noise, person, etc.)</Label>
                            </div>
                             <div className="flex items-center space-x-2">
                               <RadioGroupItem value="external_digital" id="distraction-external_digital" />
                               <Label htmlFor="distraction-external_digital">External Digital (Notification, different app/site)</Label>
                            </div>
                            <div className="flex items-center space-x-2">
                               <RadioGroupItem value="other" id="distraction-other" />
                               <Label htmlFor="distraction-other">Other</Label>
                            </div>
                        </RadioGroup>
                    </div>
                     <div className="space-y-2">
                         <Label htmlFor="distraction-notes">Optional Notes</Label>
                         <Textarea 
                            id="distraction-notes" 
                            placeholder="Describe the distraction (e.g., checked email, loud noise outside)" 
                            value={distractionNotes}
                            onChange={(e) => setDistractionNotes(e.target.value)}
                         />
                     </div>
                  </div>
                  <DialogFooter>
                    <Button type="button" variant="outline" onClick={() => setShowDistractionModal(false)}>Cancel</Button>
                    <Button 
                      type="button" 
                      onClick={handleLogDistraction} 
                      disabled={isLoggingDistraction || !auth?.user?.id || !currentFocusSessionId || !distractionType}
                    >
                      {isLoggingDistraction ? 'Logging...' : 'Log Distraction'}
                    </Button>
                  </DialogFooter>
                </DialogContent>
              </Dialog>
            </div>
          )}
        </CardContent>
      </Card>

      {/* Task Suggestions */}
      {taskSuggestions.length > 0 && (
        <Card>
          <CardHeader>
            <CardTitle className="text-lg">Suggested Tasks</CardTitle>
            <CardDescription>Tasks that fit your current focus phase</CardDescription>
          </CardHeader>
          <CardContent className="space-y-4">
            {taskSuggestions.map(({ task, reason }) => (
              <div
                key={task.id}
                className={cn(
                  "p-4 rounded-lg border cursor-pointer transition-colors",
                  selectedTaskId === task.id ? "bg-primary/10 border-primary" : "hover:bg-muted"
                )}
                onClick={() => setSelectedTaskId(task.id)}
              >
                <div className="flex justify-between items-start">
                  <div>
                    <h4 className="font-medium">{task.title}</h4>
                    <p className="text-sm text-muted-foreground">{reason}</p>
                  </div>
                  {task.estimated_minutes && (
                    <span className="text-sm text-muted-foreground">
                      {task.estimated_minutes}m
                    </span>
                  )}
                </div>
              </div>
            ))}
          </CardContent>
        </Card>
      )}

      {/* Session Stats */}
      {sessionStats && <SessionStatsCard stats={sessionStats} />}
    </div>
  );
};

export default FocusTimer;
