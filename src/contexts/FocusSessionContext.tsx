import React, { createContext, useState, useContext, useEffect, useCallback } from 'react';
import { useAuth } from './AuthContext';
import { toast } from 'sonner';
import { supabaseGet, supabasePost } from '@/lib/supabaseApiService';
import { Task as TaskType } from '@/types/tasks'; // Import Task type

// Define focus session states and types
export type FocusSessionType = 'focus' | 'break';
export type FocusSessionStatus = 'active' | 'completed' | 'interrupted';

interface FocusSession {
  id?: string;
  user_id: string;
  start_time: string;
  end_time?: string;
  duration_minutes: number;
  type: FocusSessionType;
  status: FocusSessionStatus;
  interruptions_count?: number;
  target_duration_seconds?: number;
  break_type?: 'short' | 'long' | 'custom';
  notes?: string;
  technique?: string;
  planned_duration_seconds?: number;
  tasks_completed?: number;
  focus_score?: number;
  task_id?: string | null; // Add task_id field
}

interface FocusSessionState {
  currentSession: FocusSession | null;
  isRunning: boolean;
  remainingTime: number;
  startFocusSession: (duration?: number, taskId?: string | null) => void;
  startBreakSession: (duration?: number) => void;
  pauseSession: () => void;
  resumeSession: () => void;
  stopSession: () => void;
  sessions: FocusSession[];
  requestNotificationPermission: () => void; // Function to request permission
  hasNotificationPermission: boolean; // State for permission
  toggleSoundEnabled: () => void; // Function to toggle sound
  isSoundEnabled: boolean; // State for sound preference
}

const DEFAULT_FOCUS_DURATION = 25 * 60; // 25 minutes in seconds
const DEFAULT_BREAK_DURATION = 5 * 60; // 5 minutes in seconds

const FocusSessionContext = createContext<FocusSessionState | undefined>(undefined);

// Audio file for notification sound (place in public folder)
const notificationSound = new Audio('/sounds/notification.mp3'); 

export const FocusSessionProvider: React.FC<{ children: React.ReactNode }> = ({ children }) => {
  const { user } = useAuth();
  const [currentSession, setCurrentSession] = useState<FocusSession | null>(null);
  const [isRunning, setIsRunning] = useState(false);
  const [remainingTime, setRemainingTime] = useState(0);
  const [sessions, setSessions] = useState<FocusSession[]>([]);
  const [timerTargetDuration, setTimerTargetDuration] = useState(0);
  // Notification and Sound State
  const [hasNotificationPermission, setHasNotificationPermission] = useState(Notification.permission === 'granted');
  const [isSoundEnabled, setIsSoundEnabled] = useState(true); // Default sound on

  // Function to request notification permission
  const requestNotificationPermission = useCallback(() => {
    if (!('Notification' in window)) {
        toast.error("This browser does not support desktop notification");
        return;
    }
    if (Notification.permission !== 'denied' && Notification.permission !== 'granted') {
        Notification.requestPermission().then((permission) => {
            setHasNotificationPermission(permission === 'granted');
            if (permission === 'granted') {
                toast.success("Notifications enabled!");
            } else {
                toast.info("Notifications permission denied.");
            }
        });
    }
  }, []);

  // Function to toggle sound
  const toggleSoundEnabled = useCallback(() => {
      setIsSoundEnabled(prev => !prev);
      toast.info(`Sound ${!isSoundEnabled ? 'enabled' : 'disabled'}`);
  }, [isSoundEnabled]);

  // Effect to check permission on load
  useEffect(() => {
    setHasNotificationPermission(Notification.permission === 'granted');
  }, []);

  // Timer management - Add notification/sound logic
  useEffect(() => {
    let timer: NodeJS.Timeout | null = null;

    if (isRunning && remainingTime > 0) {
      timer = setInterval(() => {
        setRemainingTime(prev => {
          if (prev <= 1) {
            if (timer) clearInterval(timer); // Clear interval BEFORE calling completeSession
            // Trigger completion logic
            completeSession(); 
            return 0;
          }
          return prev - 1;
        });
      }, 1000);
    } 

    // Cleanup function
    return () => {
      if (timer) clearInterval(timer);
    };
  }, [isRunning]); // Depend only on isRunning

  // Load previous sessions on user change
  useEffect(() => {
    if (user?.id) {
      fetchPreviousSessions();
    }
  }, [user?.id]);

  const fetchPreviousSessions = async () => {
    if (!user?.id) return;
    try {
      const { data: fetchedSessions, error } = await supabaseGet<FocusSession>(
        'focus_sessions',
        `user_id=eq.${user.id}&order=start_time.desc&limit=10`
      );

      if (error) throw error;
      setSessions(fetchedSessions || []);
    } catch (err) {
      console.error("Error fetching previous sessions:", err);
      toast.error('Failed to load previous sessions.');
      setSessions([]);
    }
  };

  const startSession = (type: FocusSessionType, duration: number, taskId?: string | null) => {
    if (!user?.id) {
      toast.warning("Please log in to start a session.");
      return;
    }
    if (isRunning) {
      stopSession();
    }

    const newSession: FocusSession = {
      user_id: user.id,
      start_time: new Date().toISOString(),
      duration_minutes: Math.round(duration / 60),
      planned_duration_seconds: duration,
      type: type,
      status: 'active',
      interruptions_count: 0,
      target_duration_seconds: duration,
      break_type: type === 'break' ? (duration === DEFAULT_BREAK_DURATION ? 'short' : 'custom') : undefined,
      technique: type === 'focus' ? 'pomodoro' : undefined,
      task_id: taskId, // Store the task ID
    };

    setCurrentSession(newSession);
    setRemainingTime(duration);
    setTimerTargetDuration(duration);
    setIsRunning(true);

    toast.success(`${type === 'focus' ? 'Focus' : 'Break'} session started (${duration / 60} min)`);
  };

  const startFocusSession = useCallback((duration = DEFAULT_FOCUS_DURATION, taskId?: string | null) => {
    startSession('focus', duration, taskId);
  }, [user?.id, isRunning]);

  const startBreakSession = useCallback((duration = DEFAULT_BREAK_DURATION) => {
    startSession('break', duration, null);
  }, [user?.id, isRunning]);

  const pauseSession = useCallback(() => {
    if (!isRunning) return;
    setIsRunning(false);
    setCurrentSession(prev => prev ? {
      ...prev,
      interruptions_count: (prev.interruptions_count || 0) + 1
    } : null);
    toast.info('Session paused');
  }, [isRunning]);

  const resumeSession = useCallback(() => {
    if (isRunning || !currentSession) return;
    setIsRunning(true);
    toast.info('Session resumed');
  }, [isRunning, currentSession]);

  const saveSession = async (status: FocusSessionStatus) => {
    if (!currentSession || !user?.id) return;

    setIsRunning(false);
    const sessionToSave = { ...currentSession };
    setCurrentSession(null);
    setRemainingTime(0);

    const endTime = new Date();
    const actualDurationSeconds = timerTargetDuration - remainingTime;
    const actualDurationMinutes = Math.round(actualDurationSeconds / 60);

    const payload: Omit<FocusSession, 'id'> = {
      ...sessionToSave,
      end_time: endTime.toISOString(),
      status: status,
      duration_minutes: actualDurationMinutes,
      task_id: sessionToSave.task_id, // Ensure task_id is passed
    };

    try {
      const { data: savedSession, error } = await supabasePost<FocusSession>(
        'focus_sessions',
        [payload],
        'representation'
      );

      if (error) throw error;

      if (savedSession && savedSession.length > 0) {
        setSessions(prev => [savedSession[0], ...prev]);
        toast.success(`Session ${status}`);
        // --- Notification/Sound Trigger --- 
        const notificationTitle = status === 'completed' 
            ? `${sessionToSave.type === 'focus' ? 'Focus' : 'Break'} Complete!`
            : 'Session Interrupted';
        const notificationBody = status === 'completed' 
            ? (sessionToSave.type === 'focus' ? 'Time for a break!' : 'Time to focus!')
            : 'Your session was stopped.';

        if (hasNotificationPermission) {
            new Notification(notificationTitle, { body: notificationBody });
        }
        if (isSoundEnabled && status === 'completed') { // Only play sound on completion
            notificationSound.play().catch(e => console.error("Error playing sound:", e));
        }
        // --- End Notification/Sound Trigger --- 
      } else {
        toast.warning(`Session ${status}, but couldn't update list.`);
        fetchPreviousSessions();
      }
    } catch (err: any) {
      console.error("Error saving session:", err);
      toast.error(`Failed to save session: ${err.message || 'Unknown error'}`);
    }
  };

  const completeSession = useCallback(async () => {
    await saveSession('completed');
  }, [currentSession, user?.id, timerTargetDuration, remainingTime]);

  const stopSession = useCallback(async () => {
    await saveSession('interrupted');
  }, [currentSession, user?.id, timerTargetDuration, remainingTime]);

  const value: FocusSessionState = {
    currentSession,
    isRunning,
    remainingTime,
    startFocusSession,
    startBreakSession,
    pauseSession,
    resumeSession,
    stopSession,
    sessions,
    requestNotificationPermission,
    hasNotificationPermission,
    toggleSoundEnabled,
    isSoundEnabled,
  };

  return (
    <FocusSessionContext.Provider value={value}>
      {children}
    </FocusSessionContext.Provider>
  );
};

export const useFocusSession = () => {
  const context = useContext(FocusSessionContext);
  if (context === undefined) {
    throw new Error('useFocusSession must be used within a FocusSessionProvider');
  }
  return context;
};