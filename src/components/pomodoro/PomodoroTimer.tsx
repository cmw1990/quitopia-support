import React, { useState, useEffect, useRef, useCallback } from 'react';
import { motion } from 'framer-motion';
import { Play, Pause, RotateCcw, SkipForward } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { cn } from '@/lib/utils';
import { useToast } from '@/components/ui/use-toast';
import { Progress } from '@/components/ui/progress';

// Timer modes
export type TimerMode = 'focus' | 'short' | 'long';

export interface PomodoroSettings {
  focusDuration: number; // in minutes
  shortBreakDuration: number; // in minutes
  longBreakDuration: number; // in minutes
  longBreakInterval: number; // cycles before long break
  autoStartBreaks: boolean;
  autoStartFocus: boolean;
  notifications: boolean;
  sounds: boolean;
}

export interface PomodoroTimerProps {
  initialSettings: PomodoroSettings;
  onSessionComplete?: (mode: TimerMode, duration: number) => void;
  onTick?: (minutes: number, seconds: number, mode: TimerMode) => void;
  onSkip?: () => void;
  className?: string;
}

const DEFAULT_SETTINGS: PomodoroSettings = {
  focusDuration: 25,
  shortBreakDuration: 5,
  longBreakDuration: 15,
  longBreakInterval: 4,
  autoStartBreaks: true,
  autoStartFocus: true,
  notifications: true,
  sounds: true,
};

// Define mode colors using HSL for easier theme adaptation
const modeStyles: Record<TimerMode, { primary: string; background: string; lightBg: string }> = {
    focus: {
        primary: 'hsl(var(--primary))',
        background: 'hsl(var(--primary) / 0.1)',
        lightBg: 'hsl(var(--primary) / 0.05)'
    },
    short: {
        primary: 'hsl(var(--success))' /* Adjust if needed */, 
        background: 'hsl(var(--success) / 0.1)',
        lightBg: 'hsl(var(--success) / 0.05)'
    }, 
    long: {
        primary: 'hsl(var(--info))' /* Adjust if needed */, 
        background: 'hsl(var(--info) / 0.1)',
        lightBg: 'hsl(var(--info) / 0.05)'
    },
};

export const PomodoroTimer: React.FC<PomodoroTimerProps> = ({
  initialSettings = DEFAULT_SETTINGS,
  onSessionComplete,
  onTick,
  onSkip,
  className,
}) => {
  const [settings, setSettings] = useState<PomodoroSettings>(initialSettings);
  const [mode, setMode] = useState<TimerMode>('focus');
  const [minutes, setMinutes] = useState(settings.focusDuration);
  const [seconds, setSeconds] = useState(0);
  const [isRunning, setIsRunning] = useState(false);
  const [cyclesCompleted, setCyclesCompleted] = useState(0); // Since last long break
  const [totalCyclesToday, setTotalCyclesToday] = useState(0); // Track total focus cycles

  const timerRef = useRef<NodeJS.Timeout | null>(null);
  const audioRef = useRef<HTMLAudioElement | null>(null);
  const { toast } = useToast();

  // Load audio only once
  useEffect(() => {
    if (typeof window !== 'undefined') {
      // Use a royalty-free sound - replace with a better one if available
      audioRef.current = new Audio('/sounds/timer-complete.mp3'); // Assuming sound in /public/sounds
      audioRef.current.load(); // Preload
    }
  }, []);

  // --- Core Timer Logic ---

  const getDuration = useCallback((currentMode: TimerMode): number => {
    switch (currentMode) {
      case 'focus': return settings.focusDuration;
      case 'short': return settings.shortBreakDuration;
      case 'long': return settings.longBreakDuration;
      default: return settings.focusDuration;
    }
  }, [settings]);

  const resetTimer = useCallback((newMode?: TimerMode) => {
    if (timerRef.current) clearInterval(timerRef.current);
    setIsRunning(false);
    const targetMode = newMode || mode;
    const duration = getDuration(targetMode);
    setMinutes(duration);
    setSeconds(0);
    if (newMode) setMode(newMode);
    if (onTick) onTick(duration, 0, targetMode);
    document.title = `(${duration}:00) Easier Focus`;
  }, [mode, getDuration, onTick]);

  // Effect to reset timer when settings or mode change while paused
  useEffect(() => {
    if (!isRunning) {
      resetTimer();
    }
  }, [settings.focusDuration, settings.shortBreakDuration, settings.longBreakDuration, mode, isRunning, resetTimer]);

  // Handle countdown
  useEffect(() => {
    if (!isRunning) return;

    timerRef.current = setInterval(() => {
      setSeconds(prevSeconds => {
        if (prevSeconds > 0) {
          if (onTick) onTick(minutes, prevSeconds - 1, mode);
          document.title = `(${String(minutes).padStart(2, '0')}:${String(prevSeconds - 1).padStart(2, '0')}) ${mode.charAt(0).toUpperCase() + mode.slice(1)} - Easier Focus`;
          return prevSeconds - 1;
        }
        // Seconds hit 0
        setMinutes((prevMinutes: number) => {
          if (prevMinutes > 0) {
            if (onTick) onTick(prevMinutes - 1, 59, mode);
            document.title = `(${String(prevMinutes - 1).padStart(2, '0')}:59) ${mode.charAt(0).toUpperCase() + mode.slice(1)} - Easier Focus`;
            return prevMinutes - 1;
          }
          // Minutes also hit 0 - Timer finished
          handleTimerEnd(); // This will set the next state, including title
          return 0; // Reset minutes for the next phase
        });
        return 59;
      });
    }, 1000);

    return () => { if (timerRef.current) clearInterval(timerRef.current); };
  }, [isRunning, minutes, mode, onTick]); // Removed handleTimerEnd from deps as it causes issues

  // Function to manually end the timer (called by handleTimerEnd and onSkip)
  const endCurrentPhase = useCallback((skipped = false) => {
    if (timerRef.current) clearInterval(timerRef.current);
    setIsRunning(false);
    document.title = 'Switching phase... - Easier Focus';

    if (!skipped) {
        // Play sound if not skipped
        if (settings.sounds && audioRef.current) {
            audioRef.current.play().catch((e: any) => console.error("Audio play failed:", e));
        }

        // Show Notification if not skipped
        if (settings.notifications && Notification.permission === 'granted') {
            new Notification(`Easier Focus: ${mode === 'focus' ? 'Focus session ended' : 'Break finished'}!`, {
                body: mode === 'focus' ? 'Time for a break!' : 'Time to focus!',
                icon: '/icon-192x192.png'
            });
        }
    }

    toast({ 
        title: `${mode === 'focus' ? 'Focus ended' : 'Break ended'}${skipped ? ' (Skipped)' : ''}`,
        description: `Starting next phase...` 
    });

    const completedDuration = getDuration(mode);
    // Only call onSessionComplete if the session wasn't skipped or if it was a focus session being skipped (log partially completed focus time? TBD)
    // For now, let's ONLY log fully completed sessions
    if (onSessionComplete && !skipped) {
         onSessionComplete(mode, completedDuration);
    }

    // Determine next mode
    let nextMode: TimerMode = 'focus';
    let shouldAutoStart = false;

    if (mode === 'focus') {
        const newCyclesCompleted = cyclesCompleted + 1;
        if (!skipped) { // Only count completed cycles if not skipped
             setCyclesCompleted(newCyclesCompleted);
             setTotalCyclesToday(prev => prev + 1);
        }

        if (newCyclesCompleted >= settings.longBreakInterval && !skipped) {
            nextMode = 'long';
            if (!skipped) setCyclesCompleted(0); // Reset cycle count for long break
        } else {
            nextMode = 'short';
        }
        shouldAutoStart = settings.autoStartBreaks;
    } else { // Short or Long break ended/skipped
        nextMode = 'focus';
        shouldAutoStart = settings.autoStartFocus;
        if (mode === 'long') setCyclesCompleted(0); // Reset cycles after long break
    }

    setMode(nextMode);
    const nextDuration = getDuration(nextMode);
    setMinutes(nextDuration);
    setSeconds(0);
    if (onTick) onTick(nextDuration, 0, nextMode); // Update UI immediately
    document.title = `(${nextDuration}:00) ${nextMode.charAt(0).toUpperCase() + nextMode.slice(1)} - Easier Focus`;

    if (shouldAutoStart) {
        setIsRunning(true);
    }

  }, [settings, mode, cyclesCompleted, getDuration, onSessionComplete, onTick, toast]);

  // Handler when timer naturally reaches zero
  const handleTimerEnd = useCallback(() => {
      endCurrentPhase(false); // Call the common logic, indicating it wasn't skipped
  }, [endCurrentPhase]);

  // Handler for the Skip button
  const handleSkip = useCallback(() => {
      if (!isRunning) return; // Should be disabled anyway, but safety check
      endCurrentPhase(true); // Call common logic, indicating it was skipped
      if (onSkip) onSkip(); // Also call the external onSkip if provided
  }, [isRunning, endCurrentPhase, onSkip]);

  const startTimer = () => {
    if (settings.notifications && Notification.permission !== 'granted') {
        Notification.requestPermission().then(permission => {
            if (permission !== 'granted') {
                toast({ title: 'Notifications Disabled', description: 'Enable notifications in browser settings for alerts.', variant: 'destructive' });
                setSettings((s: PomodoroSettings) => ({ ...s, notifications: false }));
            }
        });
    }
    setIsRunning(true);
  };

  const pauseTimer = () => {
    setIsRunning(false);
    if (timerRef.current) clearInterval(timerRef.current);
    document.title = `Paused (${String(minutes).padStart(2, '0')}:${String(seconds).padStart(2, '0')}) - Easier Focus`;
  };

  // Calculate progress percentage
  const totalSecondsDuration = getDuration(mode) * 60;
  const currentSecondsRemaining = (minutes * 60 + seconds);
  const progress = totalSecondsDuration > 0 ? ((totalSecondsDuration - currentSecondsRemaining) / totalSecondsDuration) * 100 : 0;
  const currentColor = modeStyles[mode]?.primary || modeStyles.focus.primary;
  const currentBgColor = modeStyles[mode]?.background || modeStyles.focus.background;
  const currentLightBg = modeStyles[mode]?.lightBg || modeStyles.focus.lightBg;

  // --- UI Rendering ---
  const formatTime = (time: number): string => String(time).padStart(2, '0');

  const getModeLabel = () => {
    switch (mode) {
      case 'focus': return 'Focus Time';
      case 'short': return 'Short Break';
      case 'long': return 'Long Break';
    }
  };

  return (
    <motion.div 
      layout
      className={cn("flex flex-col items-center justify-center p-6 pt-4 w-full transition-colors duration-500 ease-in-out", className)}
      style={{ backgroundColor: currentLightBg }}
    >
        {/* Mode Label - Animated */}
        <motion.div 
           key={`${mode}-label`}
           initial={{ opacity: 0, y: -10 }} 
           animate={{ opacity: 1, y: 0 }} 
           transition={{ duration: 0.4, delay: 0.1 }}
           className="text-base font-medium mb-6 text-center capitalize tracking-wide"
           style={{ color: currentColor }}
        >
            {getModeLabel()}
        </motion.div>
        
        {/* Timer Display - Larger, cleaner */}
        <div className="relative w-64 h-64 mb-10">
            {/* Outer ring - static background */}
            <svg className="absolute inset-0 w-full h-full" viewBox="0 0 100 100">
                <circle cx="50" cy="50" r="45" strokeWidth="8" className="stroke-muted/10" fill="transparent"/>
            </svg>
            {/* Progress Ring - Animated */}
            <svg className="absolute inset-0 w-full h-full" viewBox="0 0 100 100">
                <motion.circle 
                    cx="50" 
                    cy="50" 
                    r="45" 
                    strokeWidth="8" // Thicker ring
                    strokeLinecap="round" 
                    transform="rotate(-90 50 50)" 
                    fill="transparent" 
                    // Animate strokeDashoffset for progress
                    initial={{ strokeDasharray: '283', strokeDashoffset: 283 }} // 2 * PI * 45 approx 283
                    animate={{ strokeDashoffset: 283 * (1 - progress / 100) }}
                    transition={{ duration: 0.5, ease: "linear" }} // Smoother linear transition
                    style={{ stroke: currentColor }}
                />
            </svg>
            {/* Time Text */}
            <div className="absolute inset-0 flex items-center justify-center">
               <span className="text-6xl font-light tracking-tight font-mono tabular-nums text-foreground/90">
                  {formatTime(minutes)}:{formatTime(seconds)}
               </span>
            </div>
        </div>

        {/* Linear Progress Bar (Optional alternative/addition) */}
        {/* <Progress value={progress} className="w-full h-1 mb-8" indicatorClassName={cn("transition-all duration-500 ease-linear")} style={{backgroundColor: currentColor}}/> */}

        {/* Controls - Refined layout and appearance */}
        <div className="flex items-center justify-center gap-5 w-full max-w-xs">
            {/* Reset Button */}
            <Button 
               variant="ghost" 
               size="icon" 
               className="rounded-full h-11 w-11 text-muted-foreground/70 hover:text-foreground hover:bg-muted/40 transition-colors"
               onClick={() => resetTimer()} 
               aria-label="Reset Timer"
               title="Reset Timer"
            >
                <RotateCcw size={18} />
            </Button>
            
            {/* Play/Pause Button - Main Action */}
            <Button 
                variant="default" 
                size="lg" 
                className={cn(
                   "rounded-full h-16 w-16 text-lg shadow-lg transition-all duration-300 transform hover:scale-105",
                   isRunning ? 'bg-destructive/80 hover:bg-destructive/90 text-destructive-foreground' : 'text-primary-foreground'
                )}
                onClick={isRunning ? pauseTimer : startTimer}
                style={{ backgroundColor: !isRunning ? currentColor : undefined }} // Only apply mode color when paused/ready to play
                aria-label={isRunning ? 'Pause Timer' : 'Start Timer'}
                title={isRunning ? 'Pause Timer' : 'Start Timer'}
            >
                {isRunning ? <Pause size={22} /> : <Play size={22} className="ml-1"/>}
            </Button>

            {/* Skip Button */}
            <Button 
                variant="ghost" 
                size="icon" 
                className="rounded-full h-11 w-11 text-muted-foreground/70 hover:text-foreground hover:bg-muted/40 transition-colors disabled:opacity-40 disabled:cursor-not-allowed disabled:hover:bg-transparent"
                onClick={handleSkip} 
                disabled={!isRunning} 
                aria-label="Skip Current Phase"
                title="Skip Current Phase"
             >
                <SkipForward size={18} />
             </Button> 
        </div>
    </motion.div>
  );
};