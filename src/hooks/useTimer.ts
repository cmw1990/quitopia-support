import { useState, useEffect, useRef, useCallback } from 'react';

export type TimerState = 'idle' | 'running' | 'paused' | 'finished';

interface UseTimerProps {
  initialDurationSeconds: number;
  onTimerEnd?: () => void; // Callback when the timer finishes naturally
  onTick?: (timeRemaining: number) => void; // Callback on each tick
}

interface UseTimerReturn {
  timeRemaining: number;
  timerState: TimerState;
  startTimer: () => void;
  pauseTimer: () => void;
  resetTimer: (newDuration?: number) => void;
  stopTimer: () => void; // Stop completely, different from pause
  setDuration: (newDuration: number) => void;
}

export const useTimer = ({
  initialDurationSeconds,
  onTimerEnd,
  onTick,
}: UseTimerProps): UseTimerReturn => {
  const [duration, setDuration] = useState<number>(initialDurationSeconds);
  const [timeRemaining, setTimeRemaining] = useState<number>(duration);
  const [timerState, setTimerState] = useState<TimerState>('idle');
  const intervalRef = useRef<NodeJS.Timeout | null>(null);
  const endTimeRef = useRef<number | null>(null); // Store the expected end time

  const clearTimerInterval = useCallback(() => {
    if (intervalRef.current) {
      clearInterval(intervalRef.current);
      intervalRef.current = null;
    }
  }, []);

  useEffect(() => {
    // Update timeRemaining if the duration changes while idle or finished
    if (timerState === 'idle' || timerState === 'finished') {
      setTimeRemaining(duration);
    }
  }, [duration, timerState]);

  useEffect(() => {
    // Cleanup interval on unmount
    return () => {
      clearTimerInterval();
    };
  }, [clearTimerInterval]);

  const tick = useCallback(() => {
    if (endTimeRef.current === null) return;

    const now = Date.now();
    const remaining = Math.max(0, Math.round((endTimeRef.current - now) / 1000));
    
    setTimeRemaining(remaining);
    onTick?.(remaining);

    if (remaining <= 0) {
      clearTimerInterval();
      setTimerState('finished');
      onTimerEnd?.();
      endTimeRef.current = null;
    }
  }, [clearTimerInterval, onTimerEnd, onTick]);

  const startTimer = useCallback(() => {
    if (timerState === 'running') return; // Already running
    
    clearTimerInterval(); // Clear any existing interval

    const currentTime = Date.now();
    // Calculate end time based on current timeRemaining if resuming, or full duration if starting/restarting
    endTimeRef.current = currentTime + (timerState === 'paused' ? timeRemaining : duration) * 1000;

    setTimerState('running');
    tick(); // Initial tick to update immediately
    intervalRef.current = setInterval(tick, 1000);
  }, [timerState, timeRemaining, duration, clearTimerInterval, tick]);

  const pauseTimer = useCallback(() => {
    if (timerState !== 'running') return;
    clearTimerInterval();
    setTimerState('paused');
    // timeRemaining is already updated by tick, no need to recalculate here
    endTimeRef.current = null; // Clear end time when paused
  }, [timerState, clearTimerInterval]);

  const resetTimer = useCallback((newDuration?: number) => {
    clearTimerInterval();
    const newInitialDuration = newDuration ?? duration;
    if (newDuration !== undefined) {
      setDuration(newInitialDuration); // Update internal duration if provided
    }
    setTimeRemaining(newInitialDuration);
    setTimerState('idle');
    endTimeRef.current = null;
  }, [duration, clearTimerInterval]);

  const stopTimer = useCallback(() => {
    clearTimerInterval();
    setTimeRemaining(duration); // Reset time to full duration
    setTimerState('idle');
    endTimeRef.current = null;
  }, [duration, clearTimerInterval]);

  const setDurationHandler = useCallback((newDuration: number) => {
      if (timerState === 'idle' || timerState === 'finished') {
          setDuration(newDuration);
          setTimeRemaining(newDuration); // Update remaining time immediately
      } else {
          console.warn("Cannot change duration while timer is running or paused. Reset timer first.");
          // Optionally, you could reset the timer here or throw an error
          // resetTimer(newDuration);
      }
  }, [timerState]);

  return {
    timeRemaining,
    timerState,
    startTimer,
    pauseTimer,
    resetTimer,
    stopTimer,
    setDuration: setDurationHandler,
  };
};
