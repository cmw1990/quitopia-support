import { rpc } from './db';
import type { User } from '@supabase/supabase-js';

// Helper to get user ID from response
const getUserId = (user: User | null): string => {
  if (!user) throw new Error('User not authenticated');
  return user.id;
};

// Focus habits
export async function getFocusHabits(user: User | null) {
  const userId = getUserId(user);
  const { data, error } = await rpc('get_focus_habits', {
    user_id: userId
  });
  if (error) throw error;
  return data;
}

export async function addFocusHabit(user: User | null, data: {
  habit_name: string;
  frequency: string;
  reminder_time?: string;
}) {
  const userId = getUserId(user);
  const { error } = await rpc('add_focus_habit', {
    user_id: userId,
    ...data
  });
  if (error) throw error;
}

export async function updateFocusHabit(user: User | null, habitId: string, data: {
  habit_name?: string;
  frequency?: string;
  reminder_time?: string;
  completed?: boolean;
}) {
  const userId = getUserId(user);
  const { error } = await rpc('update_focus_habit', {
    user_id: userId,
    habit_id: habitId,
    ...data
  });
  if (error) throw error;
}

export async function deleteFocusHabit(user: User | null, habitId: string) {
  const userId = getUserId(user);
  const { error } = await rpc('delete_focus_habit', {
    user_id: userId,
    habit_id: habitId
  });
  if (error) throw error;
}

// Focus sessions
export async function startFocusSession(user: User | null, data: {
  duration: number;
  task: string;
  type: string;
}) {
  const userId = getUserId(user);
  const { data: session, error } = await rpc('start_focus_session', {
    user_id: userId,
    ...data
  });
  if (error) throw error;
  return session;
}

export async function endFocusSession(user: User | null, sessionId: string, data: {
  completed: boolean;
  actual_duration: number;
  interruptions?: number;
  notes?: string;
}) {
  const userId = getUserId(user);
  const { error } = await rpc('end_focus_session', {
    user_id: userId,
    session_id: sessionId,
    ...data
  });
  if (error) throw error;
}

export async function getFocusSessions(user: User | null, startDate?: string, endDate?: string) {
  const userId = getUserId(user);
  const { data, error } = await rpc('get_focus_sessions', {
    user_id: userId,
    start_date: startDate,
    end_date: endDate
  });
  if (error) throw error;
  return data;
}

// Focus interruptions
export async function logFocusInterruption(user: User | null, data: {
  session_id: string;
  type: string;
  duration?: number;
  notes?: string;
}) {
  const userId = getUserId(user);
  const { error } = await rpc('log_focus_interruption', {
    user_id: userId,
    ...data
  });
  if (error) throw error;
}

// Focus analytics
export async function getFocusAnalytics(user: User | null, timeframe: string) {
  const userId = getUserId(user);
  const { data, error } = await rpc('get_focus_analytics', {
    user_id: userId,
    timeframe
  });
  if (error) throw error;
  return data;
}

// Focus settings
export async function updateFocusSettings(user: User | null, settings: Record<string, any>) {
  const userId = getUserId(user);
  const { error } = await rpc('update_focus_settings', {
    user_id: userId,
    settings
  });
  if (error) throw error;
}

// Focus environment
export async function updateFocusEnvironment(user: User | null, data: {
  noise_level?: string;
  lighting?: string;
  temperature?: string;
  location?: string;
  notes?: string;
}) {
  const userId = getUserId(user);
  const { error } = await rpc('update_focus_environment', {
    user_id: userId,
    ...data
  });
  if (error) throw error;
}

export async function getFocusEnvironment(user: User | null) {
  const userId = getUserId(user);
  const { data, error } = await rpc('get_focus_environment', {
    user_id: userId
  });
  if (error) throw error;
  return data;
} 