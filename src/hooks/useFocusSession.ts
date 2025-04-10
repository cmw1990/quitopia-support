import { useState, useEffect, useCallback } from 'react';
import { useAuth } from '@/hooks/useAuth';
import { focusSessions } from '@/lib/api';
import type { Session } from '@supabase/supabase-js';

export interface FocusSession {
  id: string;
  user_id: string;
  start_time: string;
  end_time?: string;
  duration: number;
  type: 'pomodoro' | 'deep_work' | 'flow_state';
  status: 'active' | 'completed' | 'interrupted';
  task_id?: string;
  notes?: string;
  distractions?: string[];
  mood_before?: number;
  mood_after?: number;
  focus_rating?: number;
  energy_level?: number;
  created_at: string;
  updated_at: string;
}

export interface CreateFocusSessionData {
  type: FocusSession['type'];
  task_id?: string;
  notes?: string;
  mood_before?: number;
  energy_level?: number;
}

export interface UpdateFocusSessionData {
  end_time?: string;
  status?: FocusSession['status'];
  notes?: string;
  distractions?: string[];
  mood_after?: number;
  focus_rating?: number;
}

export function useFocusSession() {
  const { session } = useAuth();
  const [isLoading, setIsLoading] = useState(false);
  const [error, setError] = useState<Error | null>(null);
  const [activeSessions, setActiveSessions] = useState<FocusSession[]>([]);
  const [recentSessions, setRecentSessions] = useState<FocusSession[]>([]);

  // Load active and recent sessions
  const loadSessions = useCallback(async () => {
    if (!session) return;

    try {
      setIsLoading(true);
      setError(null);

      const [activeData, recentData] = await Promise.all([
        focusSessions.list(session as Session),
        focusSessions.list(session as Session)
      ]);

      setActiveSessions(activeData.filter((s: FocusSession) => s.status === 'active'));
      setRecentSessions(
        activeData
          .filter((s: FocusSession) => s.status !== 'active')
          .sort((a: FocusSession, b: FocusSession) => 
            new Date(b.created_at).getTime() - new Date(a.created_at).getTime()
          )
          .slice(0, 10)
      );
    } catch (err) {
      setError(err instanceof Error ? err : new Error('Failed to load sessions'));
    } finally {
      setIsLoading(false);
    }
  }, [session]);

  // Load sessions on mount and when session changes
  useEffect(() => {
    loadSessions();
  }, [loadSessions]);

  // Create a new focus session
  const createSession = async (data: CreateFocusSessionData): Promise<FocusSession> => {
    if (!session) throw new Error('Not authenticated');

    try {
      setIsLoading(true);
      setError(null);

      const newSession = await focusSessions.create(session as Session, {
        ...data,
        start_time: new Date().toISOString(),
        status: 'active',
      });

      setActiveSessions(prev => [...prev, newSession]);
      return newSession;
    } catch (err) {
      const error = err instanceof Error ? err : new Error('Failed to create session');
      setError(error);
      throw error;
    } finally {
      setIsLoading(false);
    }
  };

  // Update an existing focus session
  const updateSession = async (id: string, data: UpdateFocusSessionData): Promise<FocusSession> => {
    if (!session) throw new Error('Not authenticated');

    try {
      setIsLoading(true);
      setError(null);

      const updatedSession = await focusSessions.update(session as Session, id, data);

      if (data.status === 'completed' || data.status === 'interrupted') {
        setActiveSessions(prev => prev.filter(s => s.id !== id));
        setRecentSessions(prev => [updatedSession, ...prev].slice(0, 10));
      } else {
        setActiveSessions(prev => 
          prev.map(s => s.id === id ? updatedSession : s)
        );
      }

      return updatedSession;
    } catch (err) {
      const error = err instanceof Error ? err : new Error('Failed to update session');
      setError(error);
      throw error;
    } finally {
      setIsLoading(false);
    }
  };

  // End a focus session
  const endSession = async (id: string, data: Omit<UpdateFocusSessionData, 'end_time' | 'status'>) => {
    return updateSession(id, {
      ...data,
      end_time: new Date().toISOString(),
      status: 'completed',
    });
  };

  // Interrupt a focus session
  const interruptSession = async (id: string, data: Omit<UpdateFocusSessionData, 'end_time' | 'status'>) => {
    return updateSession(id, {
      ...data,
      end_time: new Date().toISOString(),
      status: 'interrupted',
    });
  };

  return {
    isLoading,
    error,
    activeSessions,
    recentSessions,
    createSession,
    updateSession,
    endSession,
    interruptSession,
    refresh: loadSessions,
  };
} 