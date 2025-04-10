import React, { useState, useEffect, useCallback, useRef } from 'react';
import {
  Timer, Settings2, Repeat, RefreshCw, Music, Brain, Coffee, Battery,
  PlayCircle, PauseCircle, RotateCcw, ListTodo, ChevronDown
} from 'lucide-react';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Slider } from '@/components/ui/slider';
import { Progress } from '@/components/ui/progress';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Switch } from '@/components/ui/switch';
import { Separator } from '@/components/ui/separator';
import { Badge } from '@/components/ui/badge';
import { Tooltip, TooltipContent, TooltipTrigger } from "@/components/ui/tooltip"; // Ensure TooltipProvider is at root
import { Collapsible, CollapsibleContent, CollapsibleTrigger } from "@/components/ui/collapsible";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";

type TaskHistoryItem = {
  task: string;
  duration: number;
  completed: boolean;
  timestamp: Date;
};

export const PomodoroTimer: React.FC = () => {
  const [minutes, setMinutes] = useState(25);
  const [seconds, setSeconds] = useState(0);
  const [isRunning, setIsRunning] = useState(false);
  const [mode, setMode] = useState<'focus' | 'short' | 'long'>('focus');
  const [cyclesCompleted, setCyclesCompleted] = useState(0);
  const [currentTask, setCurrentTask] = useState("");
  const [taskHistory, setTaskHistory] = useState<TaskHistoryItem[]>([]);
  const [showSettings, setShowSettings] = useState(false);
  const [customFocusTime, setCustomFocusTime] = useState(25);
  const [customShortBreak, setCustomShortBreak] = useState(5);
  const [customLongBreak, setCustomLongBreak] = useState(15);
  const [longBreakInterval, setLongBreakInterval] = useState(4);
  const [timerSoundEnabled, setTimerSoundEnabled] = useState(true);
  const [notificationSound, setNotificationSound] = useState('/sounds/notification-simple.mp3');
  const [autoStartBreaks, setAutoStartBreaks] = useState(false);
  const [autoStartPomodoros, setAutoStartPomodoros] = useState(false);
  const audioRef = useRef<HTMLAudioElement>(null);

  const modeStyles = {
    focus: { bg: 'bg-red-500/10 dark:bg-red-500/20', text: 'text-red-600 dark:text-red-400', progress: 'bg-red-500', button: 'bg-red-500 hover:bg-red-600' },
    short: { bg: 'bg-green-500/10 dark:bg-green-500/20', text: 'text-green-600 dark:text-green-400', progress: 'bg-green-500', button: 'bg-green-500 hover:bg-green-600' },
    long: { bg: 'bg-blue-500/10 dark:bg-blue-500/20', text: 'text-blue-600 dark:text-blue-400', progress: 'bg-blue-500', button: 'bg-blue-500 hover:bg-blue-600' },
  };
  const currentStyle = modeStyles[mode];

  const startTimer = () => setIsRunning(true);
  const pauseTimer = () => setIsRunning(false);

  const getMinutes = useCallback((modeType: 'focus' | 'short' | 'long') => {
    switch(modeType) {
        case 'focus': return customFocusTime;
        case 'short': return customShortBreak;
        case 'long': return customLongBreak;
        default: return 25; // Should not happen
    }
  }, [customFocusTime, customShortBreak, customLongBreak]);

  const setTimerValues = useCallback((newMode: 'focus' | 'short' | 'long') => {
    setMinutes(getMinutes(newMode));
    setSeconds(0);
  }, [getMinutes]);


  const resetTimer = useCallback(() => {
    setIsRunning(false);
    setTimerValues(mode);
  }, [mode, setTimerValues]);

  const formatTime = (mins: number, secs: number) =>
    `${mins.toString().padStart(2, '0')}:${secs.toString().padStart(2, '0')}`;

  const setTimerMode = useCallback((newMode: 'focus' | 'short' | 'long') => {
    setIsRunning(false);
    setMode(newMode);
    setTimerValues(newMode);
    // Update document title (might move this logic up if component is reused)
    document.title = `${formatTime(getMinutes(newMode), 0)} - ${newMode.charAt(0).toUpperCase() + newMode.slice(1)} | Easier Focus`;
  }, [setTimerValues, getMinutes]);

  const calculateProgress = useCallback(() => {
    const totalSeconds = getMinutes(mode) * 60;
    if (totalSeconds === 0) return 100;
    const elapsedSeconds = totalSeconds - (minutes * 60 + seconds);
    return (elapsedSeconds / totalSeconds) * 100;
  }, [mode, minutes, seconds, getMinutes]);

  const playNotificationSound = useCallback(() => {
    if (timerSoundEnabled && audioRef.current) {
      audioRef.current.src = notificationSound;
      audioRef.current.play().catch(e => console.error('Error playing sound:', e));
    }
  }, [timerSoundEnabled, notificationSound]);

  const completeSession = useCallback(() => {
    let nextMode: 'focus' | 'short' | 'long' = 'focus';
    let focusCompleted = false;

    if (mode === 'focus') {
      focusCompleted = true;
      if (currentTask) {
        setTaskHistory(prev => [
          { task: currentTask, duration: customFocusTime, completed: true, timestamp: new Date() },
          ...prev.slice(0, 49)
        ]);
        setCurrentTask("");
      }
      setCyclesCompleted(prev => prev + 1);
      nextMode = (cyclesCompleted + 1) % longBreakInterval === 0 ? 'long' : 'short';
    } else {
        // Break finished, go back to focus
        nextMode = 'focus';
    }

    playNotificationSound();
    setTimerMode(nextMode); // This also stops the timer

    // Auto-start logic AFTER setting the new mode
    if ((nextMode !== 'focus' && autoStartBreaks) || (nextMode === 'focus' && autoStartPomodoros)) {
      // Use a slight delay to allow state update before starting
       setTimeout(() => setIsRunning(true), 50);
    }

  }, [mode, currentTask, customFocusTime, cyclesCompleted, longBreakInterval, playNotificationSound, autoStartBreaks, autoStartPomodoros, setTimerMode]);


  const formattedTime = formatTime(minutes, seconds);

  // Update browser title
  useEffect(() => {
    document.title = `${isRunning ? '' : '(Paused) '}${formattedTime} - ${mode.charAt(0).toUpperCase() + mode.slice(1)} | Easier Focus`;
  }, [minutes, seconds, mode, isRunning, formattedTime]);

  // Timer countdown logic
  useEffect(() => {
    let interval: NodeJS.Timeout | null = null;

    if (isRunning) {
      interval = setInterval(() => {
        setSeconds(prevSeconds => {
          if (prevSeconds > 0) {
            return prevSeconds - 1;
          } else {
            // Seconds are 0
            if (minutes > 0) {
              setMinutes(prevMinutes => prevMinutes - 1);
              return 59;
            } else {
              // Timer finished (minutes and seconds are 0)
              if (interval) clearInterval(interval); // Clear immediately
              completeSession();
              return 0; // Keep seconds at 0 for the next state
            }
          }
        });
      }, 1000);
    }

    // Cleanup
    return () => {
      if (interval) clearInterval(interval);
    };
  }, [isRunning, minutes, completeSession]); // dependencies updated

  // Effect to update timer display if custom times change while not running
  useEffect(() => {
    if (!isRunning) {
      setTimerValues(mode);
    }
  }, [customFocusTime, customShortBreak, customLongBreak, mode, isRunning, setTimerValues]);

 return (
    <Card className={`w-full max-w-2xl mx-auto overflow-hidden shadow-lg ${currentStyle.bg} border`}>
      {/* Header */}
      <CardHeader className="border-b bg-background/50 backdrop-blur-sm">
        <div className="flex items-center justify-between">
          <CardTitle className="flex items-center gap-2 text-lg font-semibold">
            <Timer className={`h-5 w-5 ${currentStyle.text}`} />
            Pomodoro Timer
          </CardTitle>
           <Collapsible open={showSettings} onOpenChange={setShowSettings}>
            <CollapsibleTrigger asChild>
              <Tooltip>
                <TooltipTrigger asChild>
                  <Button
                    variant="ghost"
                    size="icon"
                    className="h-8 w-8 data-[state=open]:bg-muted"
                  >
                    <Settings2 className="h-4 w-4" />
                  </Button>
                </TooltipTrigger>
                <TooltipContent><p>Timer Settings</p></TooltipContent>
              </Tooltip>
            </CollapsibleTrigger>
          </Collapsible>
        </div>
        <CardDescription className="mt-1">
          Boost productivity with focused work intervals and restorative breaks.
        </CardDescription>
      </CardHeader>

      {/* Settings Section */}
      <CollapsibleContent>
        <div className="p-6 bg-muted/50 border-b">
          <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
            {/* Time Settings */}
            <div className="space-y-4">
              <h4 className="font-medium text-sm mb-2">Time Intervals (minutes)</h4>
              {/* Focus Time Slider */}
              <div className="flex items-center gap-2">
                <Label htmlFor="focus-time" className="w-20">Focus</Label>
                <Slider id="focus-time" min={5} max={90} step={5} value={[customFocusTime]} onValueChange={(val) => setCustomFocusTime(val[0])} className="flex-grow"/>
                <span className="text-sm font-medium w-8 text-right">{customFocusTime}</span>
              </div>
              {/* Short Break Slider */}
               <div className="flex items-center gap-2">
                <Label htmlFor="short-break" className="w-20">Short Break</Label>
                <Slider id="short-break" min={1} max={30} step={1} value={[customShortBreak]} onValueChange={(val) => setCustomShortBreak(val[0])} className="flex-grow"/>
                <span className="text-sm font-medium w-8 text-right">{customShortBreak}</span>
              </div>
              {/* Long Break Slider */}
              <div className="flex items-center gap-2">
                <Label htmlFor="long-break" className="w-20">Long Break</Label>
                <Slider id="long-break" min={5} max={60} step={5} value={[customLongBreak]} onValueChange={(val) => setCustomLongBreak(val[0])} className="flex-grow"/>
                <span className="text-sm font-medium w-8 text-right">{customLongBreak}</span>
              </div>
              {/* Long Break Interval Slider */}
              <div className="flex items-center gap-2">
                <Label htmlFor="long-break-interval" className="w-20">LB Interval</Label>
                 <Tooltip>
                  <TooltipTrigger asChild>
                     <Slider id="long-break-interval" min={2} max={8} step={1} value={[longBreakInterval]} onValueChange={(val) => setLongBreakInterval(val[0])} className="flex-grow"/>
                  </TooltipTrigger>
                  <TooltipContent><p>Long break after {longBreakInterval} focus cycles.</p></TooltipContent>
                </Tooltip>
                <span className="text-sm font-medium w-8 text-right">{longBreakInterval}</span>
              </div>
            </div>

            {/* Behavior Settings */}
            <div className="space-y-4">
              <h4 className="font-medium text-sm mb-2">Behavior</h4>
               <div className="flex items-center justify-between">
                <Label htmlFor="auto-start-breaks" className="flex items-center gap-2"><Repeat className="h-4 w-4 text-muted-foreground" /> Auto-start Breaks</Label>
                <Switch id="auto-start-breaks" checked={autoStartBreaks} onCheckedChange={setAutoStartBreaks}/>
              </div>
               <div className="flex items-center justify-between">
                <Label htmlFor="auto-start-pomos" className="flex items-center gap-2"><RefreshCw className="h-4 w-4 text-muted-foreground" /> Auto-start Focus</Label>
                <Switch id="auto-start-pomos" checked={autoStartPomodoros} onCheckedChange={setAutoStartPomodoros}/>
              </div>
              <div className="flex items-center justify-between">
                <Label htmlFor="timer-sound" className="flex items-center gap-2"><Music className="h-4 w-4 text-muted-foreground" /> Timer Sound</Label>
                <Switch id="timer-sound" checked={timerSoundEnabled} onCheckedChange={setTimerSoundEnabled}/>
              </div>
              {/* Sound Selector */}
              {timerSoundEnabled && (
                <div className="pl-6">
                  <Label htmlFor="notification-sound" className="text-xs text-muted-foreground">Notification Sound</Label>
                  <Select value={notificationSound} onValueChange={setNotificationSound}>
                    <SelectTrigger id="notification-sound"><SelectValue placeholder="Select sound" /></SelectTrigger>
                    <SelectContent>
                      <SelectItem value="/sounds/notification-simple.mp3">Simple Beep</SelectItem>
                      <SelectItem value="/sounds/notification-bell.mp3">Bell Ring</SelectItem>
                      <SelectItem value="/sounds/notification-chime.mp3">Gentle Chime</SelectItem>
                    </SelectContent>
                  </Select>
                </div>
              )}
            </div>
          </div>
        </div>
      </CollapsibleContent>

      {/* Main Content */}
      <CardContent className="pt-6 pb-6 space-y-6">
        {/* Task Input */}
        <div className="relative">
          <Label htmlFor="current-task" className="text-sm font-medium text-muted-foreground">Current Focus Task</Label>
          <Input
            id="current-task"
            placeholder="What will you accomplish? (Optional)"
            value={currentTask}
            onChange={(e) => setCurrentTask(e.target.value)}
            disabled={isRunning && mode === 'focus'}
            className={`mt-1 pr-10 ${currentStyle.bg} border-0 focus-visible:ring-1 ${mode === 'focus' ? 'focus-visible:ring-red-500' : 'focus-visible:ring-gray-400'}`}
          />
           <ListTodo className="absolute right-3 top-7 h-5 w-5 text-muted-foreground" />
        </div>

        {/* Timer Display */}
        <div className="text-center pt-4 pb-2 relative">
           <Progress
            value={calculateProgress()}
            className={`h-20 absolute inset-x-0 top-0 opacity-10 dark:opacity-20 rounded-none ${currentStyle.progress}`}
            // indicatorClassName={currentStyle.progress} // Removed as it doesn't work reliably, style the main Progress element
          />
           <div className="relative z-10">
             <div className={`text-7xl md:text-8xl font-mono font-bold ${currentStyle.text}`}>{formattedTime}</div>
             <div className="text-sm text-muted-foreground mt-2 flex items-center justify-center gap-2">
               {/* Mode Indicator */}
               {mode === 'focus' ? (<><Brain className="h-4 w-4" /><span>Focusing</span></>)
                : mode === 'short' ? (<><Coffee className="h-4 w-4" /><span>Short Break</span></>)
                : (<><Battery className="h-4 w-4" /><span>Long Break</span></>)}
               <span className="text-xs opacity-70">• Cycle {cyclesCompleted + 1}</span>
             </div>
           </div>
        </div>

        {/* Controls */}
        <div className="flex justify-center items-center gap-4">
           {/* Mode Buttons */}
           <Tooltip><TooltipTrigger asChild><Button variant="ghost" size="icon" onClick={() => setTimerMode('focus')} className={`h-10 w-10 rounded-full ${mode === 'focus' ? 'bg-primary/20' : 'hover:bg-muted'}`} aria-label="Switch to Focus mode"><Brain className={`h-5 w-5 ${mode === 'focus' ? 'text-primary' : 'text-muted-foreground'}`} /></Button></TooltipTrigger><TooltipContent>Focus ({customFocusTime} min)</TooltipContent></Tooltip>
           <Tooltip><TooltipTrigger asChild><Button variant="ghost" size="icon" onClick={() => setTimerMode('short')} className={`h-10 w-10 rounded-full ${mode === 'short' ? 'bg-primary/20' : 'hover:bg-muted'}`} aria-label="Switch to Short Break mode"><Coffee className={`h-5 w-5 ${mode === 'short' ? 'text-primary' : 'text-muted-foreground'}`} /></Button></TooltipTrigger><TooltipContent>Short Break ({customShortBreak} min)</TooltipContent></Tooltip>
           <Tooltip><TooltipTrigger asChild><Button variant="ghost" size="icon" onClick={() => setTimerMode('long')} className={`h-10 w-10 rounded-full ${mode === 'long' ? 'bg-primary/20' : 'hover:bg-muted'}`} aria-label="Switch to Long Break mode"><Battery className={`h-5 w-5 ${mode === 'long' ? 'text-primary' : 'text-muted-foreground'}`} /></Button></TooltipTrigger><TooltipContent>Long Break ({customLongBreak} min)</TooltipContent></Tooltip>

          <Separator orientation="vertical" className="h-8 mx-2" />

          {/* Start/Pause Button */}
          {!isRunning ? (
            <Button onClick={startTimer} className={`gap-2 w-32 shadow-md hover:shadow-lg transition-shadow ${currentStyle.button} text-white`} size="lg"><PlayCircle className="h-5 w-5" /><span>Start</span></Button>
          ) : (
            <Button onClick={pauseTimer} variant="secondary" className="gap-2 w-32 shadow-md hover:shadow-lg transition-shadow" size="lg"><PauseCircle className="h-5 w-5" /><span>Pause</span></Button>
          )}
          {/* Reset Button */}
          <Tooltip>
            <TooltipTrigger asChild><Button variant="outline" size="icon" onClick={resetTimer} className="h-10 w-10 rounded-full"><RotateCcw className="h-4 w-4" /></Button></TooltipTrigger>
            <TooltipContent><p>Reset Timer</p></TooltipContent>
          </Tooltip>
        </div>
      </CardContent>

      {/* Task History */}
      {taskHistory.length > 0 && (
        <Collapsible className="border-t">
          <CollapsibleTrigger className="flex items-center justify-between w-full p-4 text-sm font-medium bg-muted/30 hover:bg-muted/50 transition-colors">
            <span>Task History ({taskHistory.length})</span>
            <ChevronDown className="h-4 w-4 transition-transform data-[state=open]:rotate-180" />
          </CollapsibleTrigger>
          <CollapsibleContent className="p-4 bg-muted/20 max-h-48 overflow-y-auto">
            <ul className="space-y-2 text-xs">
              {taskHistory.map((item, index) => (
                <li key={index} className="flex justify-between items-center p-2 rounded bg-background/50">
                  <span className="truncate pr-2" title={item.task}>{item.task}</span>
                  <Badge variant="secondary">{item.duration} min</Badge>
                </li>
              ))}
            </ul>
          </CollapsibleContent>
        </Collapsible>
      )}

      {/* Audio Element */}
      <audio ref={audioRef} preload="auto"></audio>
    </Card>
  );
}; 