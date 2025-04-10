/**
 * Easier Focus API Client
 * 
 * This module provides direct REST API access to the Easier Focus database
 * following the SSOT8001 guidelines. Only direct REST API calls are used,
 * WITHOUT using any Supabase client methods.
 */

import { Session } from '@supabase/supabase-js';
import { supabaseRestCall } from './supabase-rest';

// Types
export interface FocusSession {
  id?: string;
  user_id: string;
  title: string;
  description?: string;
  start_time: string;
  end_time?: string;
  duration_minutes?: number;
  focus_score?: number;
  focus_technique?: string;
  interruption_count?: number;
  completed?: boolean;
  notes?: string;
  created_at?: string;
  updated_at?: string;
}

export interface EnergyLevel {
  id?: string;
  user_id: string;
  energy_level: number;
  timestamp?: string;
  fatigue_level?: number;
  activity_context?: string;
  caffeine_intake?: number;
  water_intake?: number;
  sleep_hours?: number;
  notes?: string;
  created_at?: string;
  updated_at?: string;
}

export interface DistractionLog {
  id?: string;
  user_id: string;
  focus_session_id?: string;
  distraction_type: string;
  description?: string;
  timestamp?: string;
  duration_seconds?: number;
  trigger?: string;
  created_at?: string;
  updated_at?: string;
}

export interface ADHDStrategy {
  id?: string;
  user_id: string;
  title: string;
  description: string;
  strategy_type: string;
  effectiveness_rating?: number;
  is_favorite?: boolean;
  created_at?: string;
  updated_at?: string;
}

export interface Task {
  id?: string;
  user_id: string;
  title: string;
  description?: string;
  priority: number;
  status: 'todo' | 'in_progress' | 'completed';
  due_date?: string;
  difficulty_level?: number;
  estimated_duration_minutes?: number;
  actual_duration_minutes?: number;
  tags?: string[];
  created_at?: string;
  updated_at?: string;
}

export interface FocusTechnique {
  id: string;
  name: string;
  description: string;
  duration_minutes: number;
  steps: string[];
  benefits: string[];
  suitable_for: string[];
}

export interface FocusScore {
  id?: string;
  user_id: string;
  score: number;
  date: string;
  distractions_count: number;
  productive_minutes: number;
  deep_work_minutes: number;
  created_at?: string;
  updated_at?: string;
}

export interface AntiDistractionRule {
  id?: string;
  user_id: string;
  rule_name: string;
  target_websites?: string[];
  target_apps?: string[];
  schedule?: BlockSchedule[]; // Use defined BlockSchedule type, assuming array
  strictness_level?: number;
  is_active: boolean;
  created_at?: string;
  updated_at?: string;
}

// Focus sessions API functions
export const getFocusSessions = async (
  session: Session | null,
  filters?: { startDate?: string; endDate?: string; limit?: number }
): Promise<FocusSession[]> => {
  if (!session?.user?.id) {
    return [];
  }

  let query = `/rest/v1/focus_sessions8?user_id=eq.${session.user.id}&order=start_time.desc`;
  
  if (filters?.startDate) {
    query += `&start_time=gte.${filters.startDate}`;
  }
  
  if (filters?.endDate) {
    query += `&start_time=lte.${filters.endDate}`;
  }
  
  if (filters?.limit) {
    query += `&limit=${filters.limit}`;
  }

  const { data } = await supabaseRestCall(
    query,
    { method: 'GET' },
    session
  );
  
  return data || [];
};

export const createFocusSession = async (
  session: Session | null,
  focusSession: Omit<FocusSession, 'id' | 'user_id' | 'created_at' | 'updated_at'>
): Promise<FocusSession> => {
  if (!session?.user?.id) {
    throw new Error('User not authenticated');
  }

  const newSession = {
    ...focusSession,
    user_id: session.user.id,
  };

  const { data } = await supabaseRestCall(
    '/rest/v1/focus_sessions8',
    {
      method: 'POST',
      body: JSON.stringify(newSession)
    },
    session
  );
  
  return data[0] || data;
};

export const updateFocusSession = async (
  session: Session | null,
  id: string,
  updates: Partial<FocusSession>
): Promise<FocusSession> => {
  if (!session?.user?.id) {
    throw new Error('User not authenticated');
  }

  const { data } = await supabaseRestCall(
    `/rest/v1/focus_sessions8?id=eq.${id}&user_id=eq.${session.user.id}`,
    {
      method: 'PATCH',
      body: JSON.stringify(updates)
    },
    session
  );
  
  return data[0] || data;
};

export const deleteFocusSession = async (
  session: Session | null,
  id: string
): Promise<void> => {
  if (!session?.user?.id) {
    throw new Error('User not authenticated');
  }

  await supabaseRestCall(
    `/rest/v1/focus_sessions8?id=eq.${id}&user_id=eq.${session.user.id}`,
    { method: 'DELETE' },
    session
  );
};

// Energy levels API functions
export const getEnergyLevels = async (
  session: Session | null,
  filters?: { startDate?: string; endDate?: string; limit?: number }
): Promise<EnergyLevel[]> => {
  if (!session?.user?.id) {
    return [];
  }

  let query = `/rest/v1/energy_levels8?user_id=eq.${session.user.id}&order=timestamp.desc`;
  
  if (filters?.startDate) {
    query += `&timestamp=gte.${filters.startDate}`;
  }
  
  if (filters?.endDate) {
    query += `&timestamp=lte.${filters.endDate}`;
  }
  
  if (filters?.limit) {
    query += `&limit=${filters.limit}`;
  }

  const { data } = await supabaseRestCall(
    query,
    { method: 'GET' },
    session
  );
  
  return data || [];
};

export const createEnergyLevel = async (
  session: Session | null,
  energyLevel: Omit<EnergyLevel, 'id' | 'user_id' | 'created_at' | 'updated_at'>
): Promise<EnergyLevel> => {
  if (!session?.user?.id) {
    throw new Error('User not authenticated');
  }

  const newEnergyLevel = {
    ...energyLevel,
    user_id: session.user.id,
    timestamp: energyLevel.timestamp || new Date().toISOString(),
  };

  const { data } = await supabaseRestCall(
    '/rest/v1/energy_levels8',
    {
      method: 'POST',
      body: JSON.stringify(newEnergyLevel)
    },
    session
  );
  
  return data[0] || data;
};

// Distraction logs API functions
export const getDistractionLogs = async (
  session: Session | null,
  filters?: { focusSessionId?: string; limit?: number }
): Promise<DistractionLog[]> => {
  if (!session?.user?.id) {
    return [];
  }

  let query = `/rest/v1/distraction_logs8?user_id=eq.${session.user.id}&order=timestamp.desc`;
  
  if (filters?.focusSessionId) {
    query += `&focus_session_id=eq.${filters.focusSessionId}`;
  }
  
  if (filters?.limit) {
    query += `&limit=${filters.limit}`;
  }

  const { data } = await supabaseRestCall(
    query,
    { method: 'GET' },
    session
  );
  
  return data || [];
};

export const createDistractionLog = async (
  session: Session | null,
  distractionLog: Omit<DistractionLog, 'id' | 'user_id' | 'created_at' | 'updated_at'>
): Promise<DistractionLog> => {
  if (!session?.user?.id) {
    throw new Error('User not authenticated');
  }

  const newLog = {
    ...distractionLog,
    user_id: session.user.id,
    timestamp: distractionLog.timestamp || new Date().toISOString(),
  };

  const { data } = await supabaseRestCall(
    '/rest/v1/distraction_logs8',
    {
      method: 'POST',
      body: JSON.stringify(newLog)
    },
    session
  );
  
  return data[0] || data;
};

// ADHD strategies API functions
export const getADHDStrategies = async (
  session: Session | null
): Promise<ADHDStrategy[]> => {
  if (!session?.user?.id) {
    return [];
  }

  const { data } = await supabaseRestCall(
    `/rest/v1/adhd_strategies8?user_id=eq.${session.user.id}&order=created_at.desc`,
    { method: 'GET' },
    session
  );
  
  return data || [];
};

export const createADHDStrategy = async (
  session: Session | null,
  strategy: Omit<ADHDStrategy, 'id' | 'user_id' | 'created_at' | 'updated_at'>
): Promise<ADHDStrategy> => {
  if (!session?.user?.id) {
    throw new Error('User not authenticated');
  }

  const newStrategy = {
    ...strategy,
    user_id: session.user.id,
  };

  const { data } = await supabaseRestCall(
    '/rest/v1/adhd_strategies8',
    {
      method: 'POST',
      body: JSON.stringify(newStrategy)
    },
    session
  );
  
  return data[0] || data;
};

// Tasks API functions
export const getTasks = async (
  session: Session | null,
  filters?: { status?: string; priority?: number }
): Promise<Task[]> => {
  if (!session?.user?.id) {
    return [];
  }

  let query = `/rest/v1/tasks8?user_id=eq.${session.user.id}&order=priority.asc`;
  
  if (filters?.status) {
    query += `&status=eq.${filters.status}`;
  }
  
  if (filters?.priority) {
    query += `&priority=eq.${filters.priority}`;
  }

  const { data } = await supabaseRestCall(
    query,
    { method: 'GET' },
    session
  );
  
  return data || [];
};

export const createTask = async (
  session: Session | null,
  task: Omit<Task, 'id' | 'user_id' | 'created_at' | 'updated_at'>
): Promise<Task> => {
  if (!session?.user?.id) {
    throw new Error('User not authenticated');
  }

  const newTask = {
    ...task,
    user_id: session.user.id,
  };

  const { data } = await supabaseRestCall(
    '/rest/v1/tasks8',
    {
      method: 'POST',
      body: JSON.stringify(newTask)
    },
    session
  );
  
  return data[0] || data;
};

export const updateTask = async (
  session: Session | null,
  id: string,
  updates: Partial<Task>
): Promise<Task> => {
  if (!session?.user?.id) {
    throw new Error('User not authenticated');
  }

  const { data } = await supabaseRestCall(
    `/rest/v1/tasks8?id=eq.${id}&user_id=eq.${session.user.id}`,
    {
      method: 'PATCH',
      body: JSON.stringify(updates)
    },
    session
  );
  
  return data[0] || data;
};

export const deleteTask = async (
  session: Session | null,
  id: string
): Promise<void> => {
  if (!session?.user?.id) {
    throw new Error('User not authenticated');
  }

  await supabaseRestCall(
    `/rest/v1/tasks8?id=eq.${id}&user_id=eq.${session.user.id}`,
    { method: 'DELETE' },
    session
  );
};

// Anti-distraction rules API functions
export const getAntiDistractionRules = async (
  session: Session | null
): Promise<AntiDistractionRule[]> => {
  if (!session?.user?.id) {
    return [];
  }

  const { data } = await supabaseRestCall(
    `/rest/v1/anti_distraction_rules8?user_id=eq.${session.user.id}&order=created_at.desc`,
    { method: 'GET' },
    session
  );
  
  return data || [];
};

export const createAntiDistractionRule = async (
  session: Session | null,
  rule: Omit<AntiDistractionRule, 'id' | 'user_id' | 'created_at' | 'updated_at'>
): Promise<AntiDistractionRule> => {
  if (!session?.user?.id) {
    throw new Error('User not authenticated');
  }

  const newRule = {
    ...rule,
    user_id: session.user.id,
  };

  const { data } = await supabaseRestCall(
    '/rest/v1/anti_distraction_rules8',
    {
      method: 'POST',
      body: JSON.stringify(newRule)
    },
    session
  );
  
  return data[0] || data;
};

export const updateAntiDistractionRule = async (
  session: Session | null,
  id: string,
  updates: Partial<AntiDistractionRule>
): Promise<AntiDistractionRule> => {
  if (!session?.user?.id) {
    throw new Error('User not authenticated');
  }

  const { data } = await supabaseRestCall(
    `/rest/v1/anti_distraction_rules8?id=eq.${id}&user_id=eq.${session.user.id}`,
    {
      method: 'PATCH',
      body: JSON.stringify(updates)
    },
    session
  );
  
  return data[0] || data;
};

export const deleteAntiDistractionRule = async (
  session: Session | null,
  id: string
): Promise<void> => {
  if (!session?.user?.id) {
    throw new Error('User not authenticated');
  }

  await supabaseRestCall(
    `/rest/v1/anti_distraction_rules8?id=eq.${id}&user_id=eq.${session.user.id}`,
    { method: 'DELETE' },
    session
  );
};

// Focus techniques API functions
export const getFocusTechniques = async (
  session: Session | null
): Promise<FocusTechnique[]> => {
  const { data } = await supabaseRestCall(
    '/rest/v1/focus_techniques8?order=name.asc',
    { method: 'GET' },
    session
  );
  
  return data || [];
};

// Focus score API functions
export const getFocusScores = async (
  session: Session | null,
  filters?: { startDate?: string; endDate?: string; limit?: number }
): Promise<FocusScore[]> => {
  if (!session?.user?.id) {
    return [];
  }

  let query = `/rest/v1/focus_scores8?user_id=eq.${session.user.id}&order=date.desc`;
  
  if (filters?.startDate) {
    query += `&date=gte.${filters.startDate}`;
  }
  
  if (filters?.endDate) {
    query += `&date=lte.${filters.endDate}`;
  }
  
  if (filters?.limit) {
    query += `&limit=${filters.limit}`;
  }

  const { data } = await supabaseRestCall(
    query,
    { method: 'GET' },
    session
  );
  
  return data || [];
};

export const createFocusScore = async (
  session: Session | null,
  focusScore: Omit<FocusScore, 'id' | 'user_id' | 'created_at' | 'updated_at'>
): Promise<FocusScore> => {
  if (!session?.user?.id) {
    throw new Error('User not authenticated');
  }

  const newScore = {
    ...focusScore,
    user_id: session.user.id,
    date: focusScore.date || new Date().toISOString().split('T')[0],
  };

  const { data } = await supabaseRestCall(
    '/rest/v1/focus_scores8',
    {
      method: 'POST',
      body: JSON.stringify(newScore)
    },
    session
  );
  
  return data[0] || data;
};

export const getOverallStats = async (
  session: Session | null,
  days: number = 30
): Promise<OverallStats> => { // Use defined OverallStats type
  if (!session?.user?.id) {
    throw new Error('User not authenticated');
  }

  const startDate = new Date();
  startDate.setDate(startDate.getDate() - days);
  const startDateStr = startDate.toISOString().split('T')[0];

  // Get focus sessions
  const focusSessions = await getFocusSessions(session, { 
    startDate: startDateStr,
  });

  // Get energy levels
  const energyLevels = await getEnergyLevels(session, {
    startDate: startDateStr,
  });

  // Get distraction logs
  const distractionLogs = await getDistractionLogs(session);

  // Calculate stats
  const totalFocusMinutes = focusSessions.reduce((sum, session) => {
    return sum + (session.duration_minutes || 0);
  }, 0);

  const averageFocusScore = focusSessions.length > 0
    ? focusSessions.reduce((sum, session) => sum + (session.focus_score || 0), 0) / focusSessions.length
    : 0;

  const averageEnergyLevel = energyLevels.length > 0
    ? energyLevels.reduce((sum, level) => sum + level.energy_level, 0) / energyLevels.length
    : 0;

  const totalDistractions = distractionLogs.length;

  return {
    totalFocusMinutes,
    averageFocusScore,
    averageEnergyLevel,
    totalDistractions,
    focusSessionCount: focusSessions.length,
    periodDays: days
  };
};
