import React, { useState, useEffect, useCallback } from 'react';
import { useTimer, TimerState } from '@/hooks/useTimer';
import { Button } from "@/components/ui/button";
import { Play, Pause, RotateCcw, StopCircle, Settings } from 'lucide-react';
import { cn } from '@/lib/utils';
import { Progress } from "@/components/ui/progress"; // Assuming a Progress component exists
import { Badge } from "@/components/ui/badge"; // Assuming a Badge component exists

// Types of sessions
type SessionType = 'focus' | 'shortBreak' | 'longBreak';

interface FocusTimerProps {
  initialFocusDuration?: number; // in seconds
  initialShortBreakDuration?: number; // in seconds
  initialLongBreakDuration?: number; // in seconds
  longBreakInterval?: number; // Number of focus sessions before a long break
  onSessionComplete?: (completedSessionType: SessionType, duration: number) => void;
  // TODO: Add more props for customization, e.g., sound notifications, auto-start breaks
}

const FOCUS_DURATION_DEFAULT = 25 * 60; // 25 minutes
const SHORT_BREAK_DURATION_DEFAULT = 5 * 60; // 5 minutes
const LONG_BREAK_DURATION_DEFAULT = 15 * 60; // 15 minutes
const LONG_BREAK_INTERVAL_DEFAULT = 4; // Long break after 4 focus sessions

export const FocusTimer: React.FC<FocusTimerProps> = ({
  initialFocusDuration = FOCUS_DURATION_DEFAULT,
  initialShortBreakDuration = SHORT_BREAK_DURATION_DEFAULT,
  initialLongBreakDuration = LONG_BREAK_DURATION_DEFAULT,
  longBreakInterval = LONG_BREAK_INTERVAL_DEFAULT,
  onSessionComplete,
}) => {
  const [currentSessionType, setCurrentSessionType] = useState<SessionType>('focus');
  const [focusSessionsCompleted, setFocusSessionsCompleted] = useState<number>(0);
  
  // Determine duration based on current session type
  const getDurationForSession = (sessionType: SessionType): number => {
    switch (sessionType) {
      case 'focus':
        return initialFocusDuration;
      case 'shortBreak':
        return initialShortBreakDuration;
      case 'longBreak':
        return initialLongBreakDuration;
      default:
        return initialFocusDuration;
    }
  };
  
  const [currentDuration, setCurrentDuration] = useState(getDurationForSession(currentSessionType));

  const handleTimerEnd = useCallback(() => {
    const completedType = currentSessionType;
    const completedDuration = getDurationForSession(completedType);
    
    onSessionComplete?.(completedType, completedDuration);
    // TODO: Add sound notification here

    let nextSessionType: SessionType;
    let nextFocusCount = focusSessionsCompleted;

    if (completedType === 'focus') {
      nextFocusCount += 1;
      setFocusSessionsCompleted(nextFocusCount);
      if (nextFocusCount % longBreakInterval === 0) {
        nextSessionType = 'longBreak';
      } else {
        nextSessionType = 'shortBreak';
      }
    } else { // If a break just ended
      nextSessionType = 'focus';
    }

    setCurrentSessionType(nextSessionType);
    const nextDuration = getDurationForSession(nextSessionType);
    setCurrentDuration(nextDuration);
    resetTimer(nextDuration); 
    // TODO: Implement auto-start toggle
    // if(autoStart) { startTimer(); }
    
  }, [currentSessionType, focusSessionsCompleted, longBreakInterval, onSessionComplete, getDurationForSession]);

  const {
    timeRemaining,
    timerState,
    startTimer,
    pauseTimer,
    resetTimer: baseResetTimer, // Rename to avoid conflict
    stopTimer,
    setDuration,
  } = useTimer({ 
      initialDurationSeconds: currentDuration, 
      onTimerEnd: handleTimerEnd 
    });

  // Reset function that also resets session counts and type
  const resetTimerFlow = useCallback(() => {
    const initialDuration = getDurationForSession('focus');
    setCurrentSessionType('focus');
    setFocusSessionsCompleted(0);
    setCurrentDuration(initialDuration);
    baseResetTimer(initialDuration);
  }, [baseResetTimer, getDurationForSession]);

  // Update timer duration if the session type changes
  useEffect(() => {
     setDuration(currentDuration);
  }, [currentDuration, setDuration]);

  const formatTime = (seconds: number): string => {
    const mins = Math.floor(seconds / 60);
    const secs = seconds % 60;
    return `${String(mins).padStart(2, '0')}:${String(secs).padStart(2, '0')}`;
  };

  const getProgress = (): number => {
    if (timerState === 'idle' || timerState === 'finished') {
       // Show full progress when idle before start or after finished before reset
       return (currentSessionType === 'focus' && timerState === 'idle') ? 0 : 100; 
    }
    if (currentDuration === 0) return 0;
    return ((currentDuration - timeRemaining) / currentDuration) * 100;
  };

  const getTimerStatusText = (): string => {
    switch (currentSessionType) {
      case 'focus': return 'Focus';
      case 'shortBreak': return 'Short Break';
      case 'longBreak': return 'Long Break';
      default: return '';
    }
  };

  return (
    <div className="flex flex-col items-center justify-center p-6 md:p-8 bg-card rounded-lg shadow-lg border border-border/60 w-full max-w-md mx-auto">
      {/* Session Type Badge */}
      <Badge 
        variant={currentSessionType === 'focus' ? 'default' : 'secondary'}
        className="mb-4 transition-colors duration-300"
      >
        {getTimerStatusText()}
      </Badge>
      
      {/* Timer Display */}
      <div className="text-6xl md:text-7xl font-bold font-mono text-foreground mb-4 tabular-nums">
        {formatTime(timeRemaining)}
      </div>

      {/* Progress Bar */}
      <Progress value={getProgress()} className="w-full h-2 mb-6" />

      {/* Control Buttons */}
      <div className="flex items-center space-x-4">
        {/* Reset Button */}
        <Button 
          variant="ghost" 
          size="icon" 
          onClick={resetTimerFlow}
          aria-label="Reset Timer"
          disabled={timerState === 'idle' && timeRemaining === currentDuration} // Disable if already reset
        >
          <RotateCcw className="h-6 w-6" />
        </Button>

        {/* Start/Pause Button */}
        <Button 
          size="lg"
          onClick={timerState === 'running' ? pauseTimer : startTimer}
          className={cn(
            "w-24 transition-all duration-300",
            timerState === 'running' ? "bg-yellow-500 hover:bg-yellow-600" : "bg-primary hover:bg-primary/90"
          )}
          aria-label={timerState === 'running' ? "Pause Timer" : "Start Timer"}
        >
          {timerState === 'running' ? (
            <Pause className="h-6 w-6 mr-1" />
          ) : (
            <Play className="h-6 w-6 mr-1" />
          )}
          {timerState === 'running' ? 'Pause' : timerState === 'paused' ? 'Resume' : 'Start'}
        </Button>

        {/* Stop Button (optional, or could be combined/replaced with Reset) */}
        {/* Consider if Stop should just reset or have a different behavior */}
        <Button 
          variant="ghost" 
          size="icon" 
          onClick={stopTimer} // Use stopTimer which resets to idle
          aria-label="Stop Timer" 
          disabled={timerState === 'idle' || timerState === 'finished'}
         >
          <StopCircle className="h-6 w-6" />
        </Button>
        
        {/* Settings Button (Placeholder) */}
        {/* <Button variant="ghost" size="icon" aria-label="Timer Settings">
          <Settings className="h-6 w-6" />
        </Button> */}
      </div>
      
      {/* Session Counter (Optional) */}
      <div className="mt-6 text-sm text-muted-foreground">
        Focus sessions completed: {focusSessionsCompleted}
      </div>
    </div>
  );
};
