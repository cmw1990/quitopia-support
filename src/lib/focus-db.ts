import { rpc } from './db';
import type { User } from '@supabase/supabase-js';

// Helper to get user ID from response
const getUserId = (user: User | null): string => {
  if (!user) throw new Error('User not authenticated');
  return user.id;
};

// Sleep tracking
export async function recordSleep(user: User | null, data: {
  duration: number;
  quality: number;
  notes?: string;
}) {
  const userId = getUserId(user);
  const { error } = await rpc('record_sleep', {
    user_id: userId,
    ...data
  });
  if (error) throw error;
}

// Exercise tracking
export async function recordExercise(user: User | null, data: {
  type: string;
  duration: number;
  intensity: number;
  notes?: string;
}) {
  const userId = getUserId(user);
  const { error } = await rpc('record_exercise', {
    user_id: userId,
    ...data
  });
  if (error) throw error;
}

// Focus session tracking
export async function recordFocusSession(user: User | null, data: {
  duration: number;
  task: string;
  productivity: number;
  notes?: string;
}) {
  const userId = getUserId(user);
  const { error } = await rpc('record_focus_session', {
    user_id: userId,
    ...data
  });
  if (error) throw error;
}

// Mental health tracking
export async function recordMentalHealth(user: User | null, data: {
  mood: number;
  anxiety: number;
  stress: number;
  notes?: string;
}) {
  const userId = getUserId(user);
  const { error } = await rpc('record_mental_health', {
    user_id: userId,
    ...data
  });
  if (error) throw error;
}

// Mood tracking
export async function recordMood(user: User | null, data: {
  level: number;
  triggers?: string[];
  notes?: string;
}) {
  const userId = getUserId(user);
  const { error } = await rpc('record_mood', {
    user_id: userId,
    ...data
  });
  if (error) throw error;
}

// Anxiety tracking
export async function recordAnxiety(user: User | null, data: {
  level: number;
  triggers?: string[];
  coping_strategies?: string[];
  notes?: string;
}) {
  const userId = getUserId(user);
  const { error } = await rpc('record_anxiety', {
    user_id: userId,
    ...data
  });
  if (error) throw error;
}

// Depression monitoring
export async function recordDepression(user: User | null, data: {
  level: number;
  symptoms?: string[];
  coping_strategies?: string[];
  notes?: string;
}) {
  const userId = getUserId(user);
  const { error } = await rpc('record_depression', {
    user_id: userId,
    ...data
  });
  if (error) throw error;
}

// OCD management
export async function recordOCD(user: User | null, data: {
  severity: number;
  triggers?: string[];
  compulsions?: string[];
  notes?: string;
}) {
  const userId = getUserId(user);
  const { error } = await rpc('record_ocd', {
    user_id: userId,
    ...data
  });
  if (error) throw error;
}

// Mindfulness sessions
export async function recordMindfulness(user: User | null, data: {
  duration: number;
  type: string;
  notes?: string;
}) {
  const userId = getUserId(user);
  const { error } = await rpc('record_mindfulness', {
    user_id: userId,
    ...data
  });
  if (error) throw error;
}

// Therapy goals
export async function recordTherapyGoal(user: User | null, data: {
  goal: string;
  target_date?: string;
  progress?: number;
  notes?: string;
}) {
  const userId = getUserId(user);
  const { error } = await rpc('record_therapy_goal', {
    user_id: userId,
    ...data
  });
  if (error) throw error;
}

// Coping strategies
export async function recordCopingStrategy(user: User | null, data: {
  strategy: string;
  effectiveness: number;
  situation?: string;
  notes?: string;
}) {
  const userId = getUserId(user);
  const { error } = await rpc('record_coping_strategy', {
    user_id: userId,
    ...data
  });
  if (error) throw error;
}

// Get user's focus data
export async function getFocusData(user: User | null) {
  const userId = getUserId(user);
  const { data, error } = await rpc('get_focus_data', {
    user_id: userId
  });
  if (error) throw error;
  return data;
}

// Get user's mental health data
export async function getMentalHealthData(user: User | null) {
  const userId = getUserId(user);
  const { data, error } = await rpc('get_mental_health_data', {
    user_id: userId
  });
  if (error) throw error;
  return data;
}

// Get user's therapy goals
export async function getTherapyGoals(user: User | null) {
  const userId = getUserId(user);
  const { data, error } = await rpc('get_therapy_goals', {
    user_id: userId
  });
  if (error) throw error;
  return data;
}

// Get user's coping strategies
export async function getCopingStrategies(user: User | null) {
  const userId = getUserId(user);
  const { data, error } = await rpc('get_coping_strategies', {
    user_id: userId
  });
  if (error) throw error;
  return data;
}

// Get user's progress report
export async function getProgressReport(user: User | null) {
  const userId = getUserId(user);
  const { data, error } = await rpc('get_progress_report', {
    user_id: userId
  });
  if (error) throw error;
  return data;
}

// Combining all exports into a single focusDb object for easier imports
export const focusDb = {
  recordSleep,
  recordExercise,
  recordFocusSession,
  recordMentalHealth,
  recordMood,
  recordAnxiety,
  recordDepression,
  recordOCD,
  recordMindfulness,
  recordTherapyGoal,
  recordCopingStrategy,
  getFocusData,
  getMentalHealthData,
  getTherapyGoals,
  getCopingStrategies,
  getProgressReport,
  
  // These functions are used in components but not defined in the file - adding stubs
  createTimerSession: async (data: any) => {
    const { error } = await rpc('create_timer_session', data);
    if (error) throw error;
    return { id: Date.now().toString() }; // Return a temporary ID
  },
  
  updateTimerSession: async (id: string, data: any) => {
    const { error } = await rpc('update_timer_session', { id, ...data });
    if (error) throw error;
    return { success: true };
  },
  
  getAnalytics: async (timeRange: number) => {
    const { data, error } = await rpc('get_focus_analytics', { time_range: timeRange });
    if (error) throw error;
    return data || [];
  },
  
  getTimerSessions: async (startDate: string, endDate: string) => {
    const { data, error } = await rpc('get_timer_sessions', { start_date: startDate, end_date: endDate });
    if (error) throw error;
    return data || [];
  },
  
  getTaskBreakdowns: async (includeCompleted = false) => {
    const { data, error } = await rpc('get_task_breakdowns', { include_completed: includeCompleted });
    if (error) throw error;
    return data || [];
  },
  
  getAchievements: async (limit: number) => {
    const { data, error } = await rpc('get_focus_achievements', { limit });
    if (error) throw error;
    return data || [];
  },
  
  getSessionParticipants: async () => {
    const { data, error } = await rpc('get_body_doubling_participants', {});
    if (error) throw error;
    return data || [];
  },
  
  getBodyDoublingSettings: async () => {
    const { data, error } = await rpc('get_body_doubling_settings', {});
    if (error) throw error;
    return data || { camera: false, microphone: false, chat: true };
  },
  
  joinBodyDoublingSession: async (data: any) => {
    const { error } = await rpc('join_body_doubling_session', data);
    if (error) throw error;
    return { success: true };
  },
  
  leaveBodyDoublingSession: async () => {
    const { error } = await rpc('leave_body_doubling_session', {});
    if (error) throw error;
    return { success: true };
  },
  
  updateBodyDoublingSettings: async (settings: any) => {
    const { error } = await rpc('update_body_doubling_settings', settings);
    if (error) throw error;
    return { success: true };
  },
  
  getMedicationReminders: async () => {
    const { data, error } = await rpc('get_medication_reminders', {});
    if (error) throw error;
    return data || [];
  },
  
  addMedicationReminder: async (reminder: any) => {
    const { error } = await rpc('add_medication_reminder', reminder);
    if (error) throw error;
    return { success: true };
  },
  
  deleteMedicationReminder: async (id: string) => {
    const { error } = await rpc('delete_medication_reminder', { id });
    if (error) throw error;
    return { success: true };
  },
  
  getBlockedSites: async () => {
    const { data, error } = await rpc('get_blocked_sites', {});
    if (error) throw error;
    return data || [];
  },
  
  getBlockingSettings: async () => {
    const { data, error } = await rpc('get_blocking_settings', {});
    if (error) throw error;
    return data || { isEnabled: false, scheduleEnabled: false, startTime: '09:00', endTime: '17:00' };
  },
  
  updateBlockingSettings: async (settings: any) => {
    const { error } = await rpc('update_blocking_settings', settings);
    if (error) throw error;
    return { success: true };
  },
  
  addBlockedSite: async (site: any) => {
    const { error } = await rpc('add_blocked_site', site);
    if (error) throw error;
    return { success: true };
  },
  
  removeBlockedSite: async (id: string) => {
    const { error } = await rpc('remove_blocked_site', { id });
    if (error) throw error;
    return { success: true };
  },
  
  updateBlockedSite: async (id: string, data: any) => {
    const { error } = await rpc('update_blocked_site', { id, ...data });
    if (error) throw error;
    return { success: true };
  },
  
  createJournalEntry: async (entry: any) => {
    const { error } = await rpc('create_journal_entry', entry);
    if (error) throw error;
    return { success: true };
  },
  
  createTaskBreakdown: async (task: any) => {
    const { error } = await rpc('create_task_breakdown', task);
    if (error) throw error;
    return { success: true, id: Date.now().toString() };
  },
  
  updateTaskProgress: async (taskId: string, completedSteps: number) => {
    const { error } = await rpc('update_task_progress', { task_id: taskId, completed_steps: completedSteps });
    if (error) throw error;
    return { success: true };
  }
};
