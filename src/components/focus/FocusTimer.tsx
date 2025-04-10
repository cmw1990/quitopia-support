import React, { useState, useEffect, useRef, useCallback } from 'react';
import { motion } from 'framer-motion';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '../ui/card';
import { Button } from '../ui/button';
import { Slider } from '../ui/slider';
import { Switch } from '../ui/switch';
import { Label } from '../ui/label';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '../ui/select';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '../ui/tabs';
import { Progress } from '../ui/progress';
import { Volume2, Play, Pause, SkipForward, RotateCcw, Settings, Clock, CheckCircle2, X, Bell, Music, Coffee, Save, Loader2 } from 'lucide-react';
import { useToast } from '../hooks/use-toast';
import { useAuth } from '../AuthProvider';
import { FocusService, FocusSession } from '@/services/FocusService';
import { DistractionLogger } from './DistractionLogger';

type TimerMode = 'focus' | 'shortBreak' | 'longBreak';

interface TimerSettings {
  focusDuration: number;
  shortBreakDuration: number;
  longBreakDuration: number;
  longBreakInterval: number;
  autoStartBreaks: boolean;
  autoStartPomodoros: boolean;
  alarmSound: string;
  alarmVolume: number;
  enableBackgroundSounds: boolean;
  backgroundSound: string;
  backgroundVolume: number;
}

const defaultSettings: TimerSettings = {
  focusDuration: 25,
  shortBreakDuration: 5,
  longBreakDuration: 15,
  longBreakInterval: 4,
  autoStartBreaks: true,
  autoStartPomodoros: false,
  alarmSound: 'bell',
  alarmVolume: 50,
  enableBackgroundSounds: false,
  backgroundSound: 'white-noise',
  backgroundVolume: 30
};

// Available background sounds
const backgroundSounds = [
  { id: 'white-noise', name: 'White Noise' },
  { id: 'brown-noise', name: 'Brown Noise' },
  { id: 'pink-noise', name: 'Pink Noise' },
  { id: 'rain', name: 'Rainfall' },
  { id: 'coffee-shop', name: 'Coffee Shop' },
  { id: 'forest', name: 'Forest Ambience' },
  { id: 'ocean', name: 'Ocean Waves' },
  { id: 'fire', name: 'Crackling Fire' }
];

// Alarm sounds
const alarmSounds = [
  { id: 'bell', name: 'Bell' },
  { id: 'digital', name: 'Digital Alarm' },
  { id: 'gentle', name: 'Gentle Chime' },
  { id: 'zen', name: 'Zen Gong' }
];

export function FocusTimer() {
  const [settings, setSettings] = useState<TimerSettings>(() => {
    const savedSettings = localStorage.getItem('focus-timer-settings');
    const loadedSettings = savedSettings ? JSON.parse(savedSettings) : {};
    return { ...defaultSettings, ...loadedSettings };
  });
  
  const [timeLeft, setTimeLeft] = useState(settings.focusDuration * 60);
  const [isActive, setIsActive] = useState(false);
  const [mode, setMode] = useState<TimerMode>('focus');
  const [pomodoroCount, setPomodoroCount] = useState(0);
  const [showSettings, setShowSettings] = useState(false);
  const [completedFocusSessionsToday, setCompletedFocusSessionsToday] = useState(0);
  const [dailyGoal, setDailyGoal] = useState(() => {
    const savedGoal = localStorage.getItem('focus-timer-daily-goal');
    return savedGoal ? parseInt(savedGoal, 10) : 8;
  });
  const [sessionsToday, setSessionsToday] = useState(0);
  const [completedToday, setCompletedToday] = useState(0);
  const [currentSessionId, setCurrentSessionId] = useState<string | null>(null);
  const startTimeRef = useRef<Date | null>(null);
  
  const timerRef = useRef<number | null>(null);
  const audioRef = useRef<HTMLAudioElement | null>(null);
  const backgroundAudioRef = useRef<HTMLAudioElement | null>(null);
  
  const { toast } = useToast();
  const { session, user } = useAuth();
  const focusService = FocusService.getInstance();
  
  const totalSeconds = mode === 'focus' 
    ? settings.focusDuration * 60 
    : mode === 'shortBreak' 
      ? settings.shortBreakDuration * 60 
      : settings.longBreakDuration * 60;
  
  const progress = ((totalSeconds - timeLeft) / totalSeconds) * 100;
  
  const [isLoading, setIsLoading] = useState(false);
  
  useEffect(() => {
    if (user?.id) {
      loadSessions();
    }
    
    audioRef.current = new Audio();
    backgroundAudioRef.current = new Audio();
    
    return () => {
      if (timerRef.current) clearInterval(timerRef.current);
      if (audioRef.current) audioRef.current.pause();
      if (backgroundAudioRef.current) backgroundAudioRef.current.pause();
    };
  }, [user?.id]);
  
  useEffect(() => {
    localStorage.setItem('focus-timer-settings', JSON.stringify(settings));
    localStorage.setItem('focus-timer-daily-goal', dailyGoal.toString());
    
    if (!isActive) {
      if (mode === 'focus') {
        setTimeLeft(settings.focusDuration * 60);
      } else if (mode === 'shortBreak') {
        setTimeLeft(settings.shortBreakDuration * 60);
      } else {
        setTimeLeft(settings.longBreakDuration * 60);
      }
    }
  }, [settings, mode, isActive, dailyGoal]);
  
  useEffect(() => {
    if (isActive) {
      timerRef.current = window.setInterval(() => {
        setTimeLeft(prevTime => {
          if (prevTime <= 1) {
            clearInterval(timerRef.current!);
            handleTimerComplete();
            return 0;
          }
          return prevTime - 1;
        });
      }, 1000);
    } else if (timerRef.current) {
      clearInterval(timerRef.current);
    }
    
    return () => {
      if (timerRef.current) clearInterval(timerRef.current);
    };
  }, [isActive]);
  
  useEffect(() => {
    if (backgroundAudioRef.current) {
      if (settings.enableBackgroundSounds && isActive) {
        backgroundAudioRef.current.src = `/sounds/${settings.backgroundSound}.mp3`;
        backgroundAudioRef.current.loop = true;
        backgroundAudioRef.current.volume = settings.backgroundVolume / 100;
        backgroundAudioRef.current.play().catch(err => console.error('Error playing background sound:', err));
      } else {
        backgroundAudioRef.current.pause();
      }
    }
  }, [settings.enableBackgroundSounds, settings.backgroundSound, settings.backgroundVolume, isActive]);
  
  const playSound = useCallback((type: 'alarm' | 'background') => {
    if (type === 'alarm' && audioRef.current) {
      audioRef.current.src = `/sounds/${settings.alarmSound}.mp3`;
      audioRef.current.volume = settings.alarmVolume / 100;
      audioRef.current.play().catch(err => console.error('Error playing alarm:', err));
    } else if (type === 'background' && backgroundAudioRef.current && settings.enableBackgroundSounds) {
       if (!backgroundAudioRef.current.src) {
           backgroundAudioRef.current.src = `/sounds/${settings.backgroundSound}.mp3`;
           backgroundAudioRef.current.loop = true;
           backgroundAudioRef.current.volume = settings.backgroundVolume / 100;
       }
       if (isActive) {
         backgroundAudioRef.current.play().catch(err => console.error('Error playing background sound:', err));
       }
    }
  }, [settings.alarmSound, settings.alarmVolume, settings.backgroundSound, settings.backgroundVolume, settings.enableBackgroundSounds, isActive]);
  
  const loadSessions = async () => {
    if (!user?.id || !session) return;
    
    console.log("FocusTimer: Loading sessions...");
    try {
      const today = new Date();
      today.setHours(0, 0, 0, 0);
      
      const sessionsData = await focusService.getFocusSessionHistory(user.id, 100);
      
      const todaySessions = sessionsData.filter(s => {
         if (!s.start_time) return false;
         try {
            const sessionDate = new Date(s.start_time);
            return sessionDate >= today;
         } catch (e) { 
            console.error("Invalid date format for session:", s.id, s.start_time);
            return false;
         }
      });
      
      const completed = todaySessions.filter(s => s.status === 'completed' && s.focus_type === 'focus');
      
      setSessionsToday(todaySessions.length);
      setCompletedFocusSessionsToday(completed.length);
      
      if (completed.length > 0) {
        setPomodoroCount(completed.length % settings.longBreakInterval);
      }
      console.log(`FocusTimer: Loaded ${todaySessions.length} sessions today, ${completed.length} completed focus sessions.`);
    } catch (error: any) {
      console.error('FocusTimer: Error loading sessions:', error);
      toast({ title: "Error Loading Sessions", description: error.message, variant: "destructive" });
    }
  };
  
  const startFocusSession = useCallback(async () => {
    if (!user?.id) {
        console.warn('FocusTimer: Cannot start session, user not logged in.');
        return; 
    }
    console.log('FocusTimer: Attempting to start focus session...');
    setIsLoading(true);
    try {
        const newSessionData: Omit<FocusSession, 'id' | 'created_at' | 'updated_at'> = {
            user_id: user.id,
            duration_seconds: 0,
            focus_type: mode,
            start_time: new Date().toISOString(),
            completed: false, 
            status: 'in_progress',
        };
        const createdSession = await focusService.createFocusSession(newSessionData);
        setCurrentSessionId(createdSession.id ?? null);
        console.log('FocusTimer: Focus session started successfully with ID:', createdSession.id);
    } catch (error: any) {
        console.error('FocusTimer: Failed to start focus session:', error);
        toast({
            title: "Error Starting Session",
            description: `Could not start the focus session. ${error.message || 'Please try again.'}`, 
            variant: "destructive",
        });
        setIsActive(false);
    } finally {
        setIsLoading(false);
    }
  }, [user, mode, toast]);
  
  const endFocusSession = useCallback(async (status: 'completed' | 'cancelled') => {
      if (!currentSessionId) {
          console.warn('FocusTimer: No active session ID to end.');
          return; 
      }
      if (!user?.id) {
          console.warn('FocusTimer: Cannot end session, user not logged in.');
          return; 
      }

      console.log(`FocusTimer: Attempting to end focus session ${currentSessionId} with status ${status}`);
      setIsLoading(true);
      
      const sessionDuration = totalSeconds - timeLeft;
      
      try {
          const updates: Partial<Omit<FocusSession, 'id' | 'user_id' | 'created_at' | 'updated_at'>> = {
              end_time: new Date().toISOString(),
              status: status,
              completed: status === 'completed',
              duration_seconds: sessionDuration > 0 ? sessionDuration : 0
          };
          await focusService.updateFocusSession(currentSessionId, updates);
          console.log(`FocusTimer: Focus session ${currentSessionId} ended successfully with status ${status}.`);
          setCurrentSessionId(null);
      } catch (error: any) {
          console.error(`FocusTimer: Failed to end focus session ${currentSessionId}:`, error);
           toast({
              title: "Error Ending Session",
              description: `Could not update the focus session. ${error.message || 'Please try again.'}`, 
              variant: "destructive",
          });
      } finally {
          setIsLoading(false);
      }
  }, [currentSessionId, user, mode, timeLeft, totalSeconds, toast]);

  const handleTimerComplete = () => {
    playSound('alarm');
    
    let nextMode: TimerMode;
    let shouldAutoStart = false;
    let sessionCompleted = false;
    
    if (mode === 'focus') {
      sessionCompleted = true;
      const newPomodoroCount = pomodoroCount + 1;
      const newCompletedToday = completedFocusSessionsToday + 1;
      
      setPomodoroCount(newPomodoroCount % settings.longBreakInterval);
      setCompletedFocusSessionsToday(newCompletedToday);
      
      endFocusSession('completed');
      
      if (newPomodoroCount % settings.longBreakInterval === 0) {
        nextMode = 'longBreak';
        toast({ title: "Focus Complete", description: `Cycle complete! Time for a long break (${settings.longBreakDuration} min).` });
      } else {
        nextMode = 'shortBreak';
        toast({ title: "Focus Complete", description: `Time for a short break (${settings.shortBreakDuration} min).` });
      }
      shouldAutoStart = settings.autoStartBreaks;
    } else {
      nextMode = 'focus';
      toast({ title: "Break Complete", description: "Ready to focus again?" });
      shouldAutoStart = settings.autoStartPomodoros;
    }
    
    setMode(nextMode);
    const newDuration = 
        nextMode === 'focus' ? settings.focusDuration :
        nextMode === 'shortBreak' ? settings.shortBreakDuration :
        settings.longBreakDuration;
    setTimeLeft(newDuration * 60);

    if (shouldAutoStart) {
      setIsActive(true);
      if (nextMode === 'focus') {
         startFocusSession();
      }
    } else {
      setIsActive(false);
    }
  };
  
  const startTimer = () => {
    if (timeLeft <= 0) {
      console.warn("FocusTimer: Attempted to start timer with timeLeft <= 0");
      return;
    }
    setIsActive(true);
    playSound('background');
    
    if (mode === 'focus' && !currentSessionId) {
        startFocusSession(); 
    }
  };
  
  const pauseTimer = () => {
    setIsActive(false);
    if (backgroundAudioRef.current) {
      backgroundAudioRef.current.pause();
    }
  };
  
  const resetTimer = () => {
    if (isActive && !window.confirm('Reset timer? This will cancel the current session.')) {
      return;
    }
    
    const wasActiveFocus = isActive && mode === 'focus';
    setIsActive(false);
    
    if (wasActiveFocus) {
      endFocusSession('cancelled');
    }
    
    setMode('focus');
    setTimeLeft(settings.focusDuration * 60);
    setCurrentSessionId(null);
    startTimeRef.current = null;
    toast({ title: "Timer Reset" });
  };
  
  const skipTimer = () => {
    if (isActive && !window.confirm('Skip timer? This will end the current session.')) {
      return;
    }
    
    const wasFocus = mode === 'focus';
    setIsActive(false);

    if (wasFocus) {
       endFocusSession('completed');
    }
    
    handleTimerComplete();
  };
  
  const formatTime = (seconds: number): string => {
    const mins = Math.floor(seconds / 60);
    const secs = seconds % 60;
    return `${mins.toString().padStart(2, '0')}:${secs.toString().padStart(2, '0')}`;
  };
  
  const updateSettings = (updatedSettings: Partial<TimerSettings>) => {
    setSettings(prev => ({ ...prev, ...updatedSettings }));
  };
  
  const getModeColor = () => {
    switch(mode) {
      case 'focus': return 'bg-red-500';
      case 'shortBreak': return 'bg-green-500';
      case 'longBreak': return 'bg-blue-500';
      default: return 'bg-gray-500';
    }
  };
  
  return (
    <div className="max-w-4xl mx-auto p-4">
      <div className="space-y-8">
        <div className="flex flex-col md:flex-row justify-between items-start md:items-center gap-4">
          <div>
            <h1 className="text-3xl font-bold">Focus Timer</h1>
            <p className="text-muted-foreground">Boost your productivity with timed focus sessions</p>
          </div>
          <div className="flex items-center gap-2">
            <Button
              variant="outline"
              size="sm"
              onClick={() => setShowSettings(!showSettings)}
            >
              <Settings className="mr-2 h-4 w-4" /> Settings
            </Button>
          </div>
        </div>
        
        <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
          <Card className="col-span-1 lg:col-span-2 overflow-hidden border-2 shadow-lg">
            <CardContent className="p-0">
              <div className="p-6 flex flex-col items-center">
                <div className="w-full mb-8">
                  <Tabs 
                    value={mode}
                    onValueChange={(value) => {
                      if (isActive) {
                        if (!window.confirm('Changing mode will reset the current timer. Continue?')) {
                          return;
                        }
                        setIsActive(false);
                      }
                      
                      setMode(value as TimerMode);
                      
                      if (value === 'focus') {
                        setTimeLeft(settings.focusDuration * 60);
                      } else if (value === 'shortBreak') {
                        setTimeLeft(settings.shortBreakDuration * 60);
                      } else {
                        setTimeLeft(settings.longBreakDuration * 60);
                      }
                    }}
                    className="w-full"
                  >
                    <TabsList className="w-full grid grid-cols-3">
                      <TabsTrigger value="focus" className="text-base">Focus</TabsTrigger>
                      <TabsTrigger value="shortBreak" className="text-base">Short Break</TabsTrigger>
                      <TabsTrigger value="longBreak" className="text-base">Long Break</TabsTrigger>
                    </TabsList>
                  </Tabs>
                </div>
                
                <div className="relative mb-8">
                  <svg className="w-64 h-64">
                    <circle
                      className="text-gray-200 dark:text-gray-700"
                      strokeWidth="12"
                      stroke="currentColor"
                      fill="transparent"
                      r="120"
                      cx="132"
                      cy="132"
                    />
                    <circle
                      className={`${mode === 'focus' ? 'text-red-500' : mode === 'shortBreak' ? 'text-green-500' : 'text-blue-500'}`}
                      strokeWidth="12"
                      strokeDasharray={754}
                      strokeDashoffset={754 - (754 * progress) / 100}
                      strokeLinecap="round"
                      stroke="currentColor"
                      fill="transparent"
                      r="120"
                      cx="132"
                      cy="132"
                    />
                  </svg>
                  <div className="absolute inset-0 flex items-center justify-center">
                    <div className="text-center">
                      <div className="text-5xl font-bold tracking-tighter">{formatTime(timeLeft)}</div>
                      <div className="text-sm text-muted-foreground uppercase tracking-wider mt-2">
                        {mode === 'focus' ? 'FOCUS TIME' : mode === 'shortBreak' ? 'SHORT BREAK' : 'LONG BREAK'}
                      </div>
                    </div>
                  </div>
                </div>
                
                <div className="flex space-x-4">
                  {!isActive ? (
                    <Button onClick={startTimer} className="w-24" disabled={isLoading}>
                      <Play className="mr-2 h-4 w-4" /> Start
                    </Button>
                  ) : (
                    <Button onClick={pauseTimer} variant="secondary" className="w-24" disabled={isLoading}>
                      <Pause className="mr-2 h-4 w-4" /> Pause
                    </Button>
                  )}
                  <Button onClick={resetTimer} variant="outline" size="icon" title="Reset" disabled={isLoading}>
                    <RotateCcw className="h-5 w-5" />
                  </Button>
                  {/* DistractionLogger integration: Show only during active focus sessions */}
                  {isActive && mode === 'focus' && (
                     <DistractionLogger 
                       focusSessionId={currentSessionId} // Pass the current session ID
                       triggerLabel="Distracted?" // Custom label
                     />
                  )}
                  <Button onClick={skipTimer} variant="outline" className="w-24" disabled={isLoading}>
                    <SkipForward className="mr-2 h-4 w-4" /> Skip
                  </Button>
                </div>
              </div>
              
              <div className={`p-4 ${mode === 'focus' ? 'bg-red-100 dark:bg-red-900/20' : mode === 'shortBreak' ? 'bg-green-100 dark:bg-green-900/20' : 'bg-blue-100 dark:bg-blue-900/20'} flex justify-between items-center`}>
                <div>
                  <span className="font-medium">Cycle #</span>{' '}
                  <span className="font-bold">{pomodoroCount + 1}</span>{' '}
                  <span className="text-sm">of {settings.longBreakInterval}</span>
                </div>
                <div>
                  <span className="font-medium">Daily</span>{' '}
                  <span className="font-bold">{completedFocusSessionsToday}</span>{' '}
                  <span className="text-sm">of {dailyGoal}</span>
                </div>
              </div>
            </CardContent>
          </Card>
          
          <Card>
            <CardHeader>
              <CardTitle className="text-xl">Today's Progress</CardTitle>
              <CardDescription>Focus sessions and productivity metrics</CardDescription>
            </CardHeader>
            <CardContent className="space-y-4">
              <div>
                <div className="flex justify-between mb-2">
                  <span className="text-sm">Daily Goal</span>
                  <span className="text-sm font-medium">{completedFocusSessionsToday}/{dailyGoal} sessions</span>
                </div>
                <Progress value={(completedFocusSessionsToday / dailyGoal) * 100} />
              </div>
              
              <div className="grid grid-cols-2 gap-4 pt-4">
                <div className="bg-gray-100 dark:bg-gray-800 p-3 rounded-lg text-center">
                  <Clock className="h-5 w-5 mx-auto mb-1 text-blue-500" />
                  <div className="text-2xl font-bold">{completedFocusSessionsToday * settings.focusDuration}</div>
                  <div className="text-xs text-muted-foreground">Minutes Focused</div>
                </div>
                <div className="bg-gray-100 dark:bg-gray-800 p-3 rounded-lg text-center">
                  <CheckCircle2 className="h-5 w-5 mx-auto mb-1 text-green-500" />
                  <div className="text-2xl font-bold">{completedFocusSessionsToday}</div>
                  <div className="text-xs text-muted-foreground">Sessions Completed</div>
                </div>
              </div>
            </CardContent>
          </Card>
        </div>
        
        {showSettings && (
          <motion.div
            initial={{ opacity: 0, height: 0 }}
            animate={{ opacity: 1, height: "auto" }}
            exit={{ opacity: 0, height: 0 }}
            transition={{ duration: 0.3 }}
          >
            <Card>
              <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
                <CardTitle className="text-xl">Timer Settings</CardTitle>
                <Button size="sm" variant="ghost" onClick={() => setShowSettings(false)}>
                  <X className="h-4 w-4" />
                </Button>
              </CardHeader>
              <CardContent className="space-y-6">
                <Tabs defaultValue="duration">
                  <TabsList className="grid w-full grid-cols-3">
                    <TabsTrigger value="duration">Duration</TabsTrigger>
                    <TabsTrigger value="behavior">Behavior</TabsTrigger>
                    <TabsTrigger value="sounds">Sounds</TabsTrigger>
                  </TabsList>
                  
                  <TabsContent value="duration" className="space-y-4 pt-4">
                    <div className="space-y-2">
                      <Label htmlFor="focusDuration">Focus Duration (minutes)</Label>
                      <div className="flex items-center gap-4">
                        <Slider 
                          id="focusDuration" 
                          min={1} 
                          max={60} 
                          step={1}
                          value={[settings.focusDuration]}
                          onValueChange={(value) => updateSettings({ focusDuration: value[0] })}
                          className="flex-1"
                        />
                        <span className="w-12 text-center">{settings.focusDuration}</span>
                      </div>
                    </div>
                    
                    <div className="space-y-2">
                      <Label htmlFor="shortBreakDuration">Short Break (minutes)</Label>
                      <div className="flex items-center gap-4">
                        <Slider 
                          id="shortBreakDuration" 
                          min={1} 
                          max={15} 
                          step={1}
                          value={[settings.shortBreakDuration]}
                          onValueChange={(value) => updateSettings({ shortBreakDuration: value[0] })}
                          className="flex-1"
                        />
                        <span className="w-12 text-center">{settings.shortBreakDuration}</span>
                      </div>
                    </div>
                    
                    <div className="space-y-2">
                      <Label htmlFor="longBreakDuration">Long Break (minutes)</Label>
                      <div className="flex items-center gap-4">
                        <Slider 
                          id="longBreakDuration" 
                          min={5} 
                          max={30} 
                          step={1}
                          value={[settings.longBreakDuration]}
                          onValueChange={(value) => updateSettings({ longBreakDuration: value[0] })}
                          className="flex-1"
                        />
                        <span className="w-12 text-center">{settings.longBreakDuration}</span>
                      </div>
                    </div>
                    
                    <div className="space-y-2">
                      <Label htmlFor="longBreakInterval">Long Break After (pomodoros)</Label>
                      <div className="flex items-center gap-4">
                        <Slider 
                          id="longBreakInterval" 
                          min={2} 
                          max={8} 
                          step={1}
                          value={[settings.longBreakInterval]}
                          onValueChange={(value) => updateSettings({ longBreakInterval: value[0] })}
                          className="flex-1"
                        />
                        <span className="w-12 text-center">{settings.longBreakInterval}</span>
                      </div>
                    </div>
                  </TabsContent>
                  
                  <TabsContent value="behavior" className="space-y-4 pt-4">
                    <div className="flex items-center justify-between">
                      <div className="space-y-0.5">
                        <Label htmlFor="autoStartBreaks">Auto-start Breaks</Label>
                        <p className="text-sm text-muted-foreground">
                          Automatically start break timers when focus sessions end
                        </p>
                      </div>
                      <Switch
                        id="autoStartBreaks"
                        checked={settings.autoStartBreaks}
                        onCheckedChange={(checked) => updateSettings({ autoStartBreaks: checked })}
                      />
                    </div>
                    
                    <div className="flex items-center justify-between border-t pt-4">
                      <div className="space-y-0.5">
                        <Label htmlFor="autoStartPomodoros">Auto-start Focus Sessions</Label>
                        <p className="text-sm text-muted-foreground">
                          Automatically start focus timers when breaks end
                        </p>
                      </div>
                      <Switch
                        id="autoStartPomodoros"
                        checked={settings.autoStartPomodoros}
                        onCheckedChange={(checked) => updateSettings({ autoStartPomodoros: checked })}
                      />
                    </div>
                    
                    <div className="border-t pt-4">
                      <Label htmlFor="dailyGoal" className="mb-2 block">Daily Focus Sessions Goal</Label>
                      <div className="flex items-center gap-4">
                        <Slider 
                          id="dailyGoal" 
                          min={1} 
                          max={16} 
                          step={1}
                          value={[dailyGoal]}
                          onValueChange={(value) => setDailyGoal(value[0])}
                          className="flex-1"
                        />
                        <span className="w-12 text-center">{dailyGoal}</span>
                      </div>
                    </div>
                  </TabsContent>
                  
                  <TabsContent value="sounds" className="space-y-4 pt-4">
                    <div className="space-y-2">
                      <Label htmlFor="alarmSound">Alarm Sound</Label>
                      <Select
                        value={settings.alarmSound}
                        onValueChange={(value) => updateSettings({ alarmSound: value })}
                      >
                        <SelectTrigger>
                          <SelectValue placeholder="Select alarm sound" />
                        </SelectTrigger>
                        <SelectContent>
                          {alarmSounds.map(sound => (
                            <SelectItem key={sound.id} value={sound.id}>
                              {sound.name}
                            </SelectItem>
                          ))}
                        </SelectContent>
                      </Select>
                    </div>
                    
                    <div className="space-y-2">
                      <div className="flex justify-between">
                        <Label htmlFor="alarmVolume">Alarm Volume</Label>
                        <span className="text-sm">{settings.alarmVolume}%</span>
                      </div>
                      <div className="flex items-center gap-2">
                        <Bell className="h-4 w-4 text-muted-foreground" />
                        <Slider 
                          id="alarmVolume" 
                          min={0} 
                          max={100} 
                          step={1}
                          value={[settings.alarmVolume]}
                          onValueChange={(value) => updateSettings({ alarmVolume: value[0] })}
                          className="flex-1"
                        />
                        <Volume2 className="h-4 w-4 text-muted-foreground" />
                      </div>
                    </div>
                    
                    <div className="flex items-center justify-between border-t pt-4 mt-4">
                      <div className="space-y-0.5">
                        <Label htmlFor="enableBackgroundSounds">Background Sounds</Label>
                        <p className="text-sm text-muted-foreground">
                          Play ambient sounds during focus sessions
                        </p>
                      </div>
                      <Switch
                        id="enableBackgroundSounds"
                        checked={settings.enableBackgroundSounds}
                        onCheckedChange={(checked) => updateSettings({ enableBackgroundSounds: checked })}
                      />
                    </div>
                    
                    {settings.enableBackgroundSounds && (
                      <>
                        <div className="space-y-2">
                          <Label htmlFor="backgroundSound">Background Sound</Label>
                          <Select
                            value={settings.backgroundSound}
                            onValueChange={(value) => updateSettings({ backgroundSound: value })}
                          >
                            <SelectTrigger>
                              <SelectValue placeholder="Select background sound" />
                            </SelectTrigger>
                            <SelectContent>
                              {backgroundSounds.map(sound => (
                                <SelectItem key={sound.id} value={sound.id}>
                                  {sound.name}
                                </SelectItem>
                              ))}
                            </SelectContent>
                          </Select>
                        </div>
                        
                        <div className="space-y-2">
                          <div className="flex justify-between">
                            <Label htmlFor="backgroundVolume">Background Volume</Label>
                            <span className="text-sm">{settings.backgroundVolume}%</span>
                          </div>
                          <div className="flex items-center gap-2">
                            <Music className="h-4 w-4 text-muted-foreground" />
                            <Slider 
                              id="backgroundVolume" 
                              min={0} 
                              max={100} 
                              step={1}
                              value={[settings.backgroundVolume]}
                              onValueChange={(value) => updateSettings({ backgroundVolume: value[0] })}
                              className="flex-1"
                            />
                            <Volume2 className="h-4 w-4 text-muted-foreground" />
                          </div>
                        </div>
                      </>
                    )}
                  </TabsContent>
                </Tabs>
              </CardContent>
            </Card>
          </motion.div>
        )}
      </div>
    </div>
  );
} 