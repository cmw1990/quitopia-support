/**
 * Supabase REST API Client for Easier Focus
 * 
 * IMPORTANT: This file uses direct REST API calls to Supabase, 
 * following the requirements outlined in ssot8001. We do NOT use the Supabase client library.
 */

const SUPABASE_URL = import.meta.env.VITE_SUPABASE_URL as string;
const SUPABASE_ANON_KEY = import.meta.env.VITE_SUPABASE_ANON_KEY as string;

if (!SUPABASE_URL || !SUPABASE_ANON_KEY) {
  console.error('Supabase URL or Anon Key is missing. Make sure VITE_SUPABASE_URL and VITE_SUPABASE_ANON_KEY are set in your .env file.');
  // Optionally throw an error or handle this situation appropriately
  // throw new Error('Supabase configuration is missing.');
}

// ----- Types -----

export interface FocusSession {
  id: string;
  user_id: string;
  start_time: string;
  end_time: string | null;
  duration_minutes: number;
  focus_type: 'pomodoro' | 'deep_work' | 'flow' | 'timeboxed';
  completed: boolean;
  notes: string | null;
  task_id: string | null;
  distractions_count: number;
  focus_quality_rating: number | null;
  environment_factors: Record<string, any> | null;
  created_at: string;
  status?: 'planned' | 'active' | 'paused' | 'completed' | 'cancelled';
}

export interface FocusTask {
  id: string;
  user_id: string;
  title: string;
  description: string | null;
  due_date: string | null;
  status: 'todo' | 'in_progress' | 'completed';
  priority: 'low' | 'medium' | 'high';
  estimated_minutes: number | null;
  actual_minutes: number | null;
  cognitive_load_estimate: number | null;
  parent_task_id: string | null;
  tags: string[] | null;
  created_at: string;
}

export interface FocusStat {
  id: string;
  user_id: string;
  date: string;
  total_sessions: number;
  total_minutes: number;
  longest_session: number;
  completed_tasks: number;
  focus_score: number;
  average_cognitive_load: number | null;
  distraction_count: number;
  mood_energy_correlation: number | null;
  created_at: string;
}

export interface FocusSettings {
  id: string;
  user_id: string;
  pomodoro_work_minutes: number;
  pomodoro_break_minutes: number;
  pomodoro_long_break_minutes: number;
  pomodoro_long_break_interval: number;
  distraction_sites: string[] | null;
  notification_preferences: Record<string, any> | null;
  ui_preferences: Record<string, any> | null;
  default_focus_technique: string;
  gamification_enabled: boolean;
  created_at: string;
}

export interface FocusStrategy {
  id: string;
  user_id: string;
  strategy_name: string;
  description: string;
  category: string;
  effectiveness_rating: number | null;
  times_used: number;
  best_for_task_types: string[] | null;
  scientific_backing: string | null;
  personalized_notes: string | null;
  created_at: string;
}

export interface FocusDistraction {
  id: string;
  user_id: string;
  session_id: string;
  timestamp: string;
  type: 'internal' | 'external' | 'digital';
  description: string;
  duration_seconds: number | null;
  intervention_used: string | null;
  intervention_effectiveness: number | null;
  created_at: string;
}

export interface EnergyLevel {
  id: string;
  user_id: string;
  timestamp: string;
  energy_level: number;
  mood_rating: number;
  stress_level: number;
  focus_ability_estimate: number;
  factors: Record<string, any> | null;
  notes: string | null;
  created_at: string;
}

export interface FocusAchievement {
  id: string;
  user_id: string;
  achievement_id: string;
  name: string;
  description: string;
  category: string;
  difficulty: string;
  progress: number;
  completed: boolean;
  completion_date: string | null;
  reward: string | null;
  created_at: string;
}

export interface CBTInsight {
  id: string;
  date: string;
  thought: string;
  situation: string;
  automatic_thoughts: string;
  emotions: string;
  evidence_supporting: string;
  evidence_against: string;
  alternative_thoughts: string;
  behavior: string;
  outcome: string;
}

// ----- Dashboard Specific Types -----

export interface DashboardStats {
  totalSessions: number;
  completedSessions: number;
  totalMinutes: number;
  streak: number;
  completionRate: number;
  avgSessionLength: number;
}

export interface DashboardData {
  stats: DashboardStats;
  recentSessions: FocusSession[];
  energyLevels: EnergyLevel[];
  tasks: FocusTask[]; // Using FocusTask directly for now
  achievements: FocusAchievement[]; // Using FocusAchievement directly
  focusScore: number;
  streakDates: string[]; // Dates of completed sessions for streak visualization
}

// ----- Helper Functions -----

/**
 * Get session token from localStorage
 */
const getSessionToken = (): string | null => {
  try {
    const sessionStr = localStorage.getItem('supabase.auth.token');
    if (!sessionStr) return null;
    
    const session = JSON.parse(sessionStr);
    return session?.access_token || null;
  } catch (error) {
    console.error('Error getting session token:', error);
    return null;
  }
};

/**
 * Make a REST API call to Supabase
 */
export const supabaseRestCall = async <T>(
  endpoint: string, 
  options: RequestInit = {},
): Promise<T> => {
  const token = getSessionToken();
  
  const response = await fetch(`${import.meta.env.VITE_SUPABASE_URL}${endpoint}`, {
    ...options,
    headers: {
      'Content-Type': 'application/json',
      'apikey': import.meta.env.VITE_SUPABASE_ANON_KEY,
      'Authorization': `Bearer ${token || import.meta.env.VITE_SUPABASE_ANON_KEY}`,
      'Prefer': 'return=representation',
      ...options.headers
    }
  });

  if (!response.ok) {
    const error = await response.json();
    throw new Error(error.message || response.statusText);
  }

  return await response.json();
};

// ----- API Functions -----

// Focus Sessions
export const getFocusSessions = async (limit = 10): Promise<FocusSession[]> => {
  return supabaseRestCall<{ data: FocusSession[] }>('/rest/v1/focus_sessions8?select=*&order=start_time.desc&limit=' + limit, {
    method: 'GET'
  }).then(res => res.data || []);
};

export const getFocusSession = async (id: string): Promise<FocusSession | null> => {
  const result = await supabaseRestCall<{ data: FocusSession[] }>(`/rest/v1/focus_sessions8?id=eq.${id}&select=*`, {
    method: 'GET'
  });
  return result.data && result.data.length > 0 ? result.data[0] : null;
};

export const createFocusSession = async (session: Partial<FocusSession>): Promise<FocusSession> => {
  return supabaseRestCall<FocusSession>('/rest/v1/focus_sessions8', {
    method: 'POST',
    body: JSON.stringify(session)
  });
};

export const updateFocusSession = async (id: string, updates: Partial<FocusSession>): Promise<FocusSession> => {
  return supabaseRestCall<FocusSession>(`/rest/v1/focus_sessions8?id=eq.${id}`, {
    method: 'PATCH',
    body: JSON.stringify(updates)
  });
};

// Function specifically for creating a *planned* session
export const createFocusSessionPlan = async (plan: Partial<FocusSession>): Promise<FocusSession> => {
  // Ensure status is set to 'planned' and completed is false
  const sessionPlan = {
    ...plan,
    status: 'planned', // Explicitly set status
    completed: false, // Planned sessions are not completed
    // start_time, end_time, duration_minutes might be null or set based on plan
  };
  
  // Use the generic create endpoint
  return supabaseRestCall<FocusSession>('/rest/v1/focus_sessions8', {
    method: 'POST',
    body: JSON.stringify(sessionPlan)
  });
};

// Focus Tasks
export const getFocusTasks = async (status?: string, limit = 10): Promise<FocusTask[]> => {
  let url = '/rest/v1/focus_tasks8?select=*&order=due_date.asc,priority.desc';
  if (status) {
    url += `&status=eq.${status}`;
  }
  if (limit) {
    url += `&limit=${limit}`;
  }
  
  return supabaseRestCall<{ data: FocusTask[] }>(url, {
    method: 'GET'
  }).then(res => res.data || []);
};

export const createFocusTask = async (task: Partial<FocusTask>): Promise<FocusTask> => {
  return supabaseRestCall<FocusTask>('/rest/v1/focus_tasks8', {
    method: 'POST',
    body: JSON.stringify(task)
  });
};

export const updateFocusTask = async (id: string, updates: Partial<FocusTask>): Promise<FocusTask> => {
  return supabaseRestCall<FocusTask>(`/rest/v1/focus_tasks8?id=eq.${id}`, {
    method: 'PATCH',
    body: JSON.stringify(updates)
  });
};

// Function to get tasks suitable for planning (not completed)
export const getPlannableTasks = async (userId: string): Promise<FocusTask[]> => {
  // Fetches tasks that are not marked as 'completed'
  const url = `/rest/v1/focus_tasks8?select=id,title,status,priority,estimated_minutes&user_id=eq.${userId}&status=neq.completed&order=priority.desc,due_date.asc`;
  
  return supabaseRestCall<FocusTask[]>(url, {
    method: 'GET'
  });
  // Note: RLS should also enforce user_id matching, but explicit filtering is safer.
};

// Focus Stats
export const getFocusStats = async (days = 7): Promise<FocusStat[]> => {
  const today = new Date();
  const startDate = new Date();
  startDate.setDate(today.getDate() - days);
  
  const todayStr = today.toISOString().split('T')[0];
  const startDateStr = startDate.toISOString().split('T')[0];
  
  return supabaseRestCall<{ data: FocusStat[] }>(`/rest/v1/focus_stats8?select=*&date=gte.${startDateStr}&date=lte.${todayStr}&order=date.desc`, {
    method: 'GET'
  }).then(res => res.data || []);
};

export const getTodayStats = async (): Promise<FocusStat | null> => {
  const today = new Date().toISOString().split('T')[0];
  
  const result = await supabaseRestCall<{ data: FocusStat[] }>(`/rest/v1/focus_stats8?date=eq.${today}&select=*`, {
    method: 'GET'
  });
  
  return result.data && result.data.length > 0 ? result.data[0] : null;
};

// Focus Settings
export const getFocusSettings = async (): Promise<FocusSettings | null> => {
  const result = await supabaseRestCall<{ data: FocusSettings[] }>('/rest/v1/focus_settings8?select=*&limit=1', {
    method: 'GET'
  });
  
  return result.data && result.data.length > 0 ? result.data[0] : null;
};

export const updateFocusSettings = async (id: string, updates: Partial<FocusSettings>): Promise<FocusSettings> => {
  return supabaseRestCall<FocusSettings>(`/rest/v1/focus_settings8?id=eq.${id}`, {
    method: 'PATCH',
    body: JSON.stringify(updates)
  });
};

// Focus Strategies
export const getFocusStrategies = async (): Promise<FocusStrategy[]> => {
  return supabaseRestCall<{ data: FocusStrategy[] }>('/rest/v1/focus_strategies8?select=*&order=effectiveness_rating.desc', {
    method: 'GET'
  }).then(res => res.data || []);
};

export const createFocusStrategy = async (strategy: Partial<FocusStrategy>): Promise<FocusStrategy> => {
  return supabaseRestCall<FocusStrategy>('/rest/v1/focus_strategies8', {
    method: 'POST',
    body: JSON.stringify(strategy)
  });
};

// Focus Distractions
export const getFocusDistractions = async (sessionId?: string): Promise<FocusDistraction[]> => {
  let url = '/rest/v1/focus_distractions8?select=*&order=timestamp.desc';
  if (sessionId) {
    url += `&session_id=eq.${sessionId}`;
  }
  
  return supabaseRestCall<{ data: FocusDistraction[] }>(url, {
    method: 'GET'
  }).then(res => res.data || []);
};

export const createFocusDistraction = async (distraction: Partial<FocusDistraction>): Promise<FocusDistraction> => {
  return supabaseRestCall<FocusDistraction>('/rest/v1/focus_distractions8', {
    method: 'POST',
    body: JSON.stringify(distraction)
  });
};

// Focus Moods
export const getFocusMoods = async (days = 7): Promise<EnergyLevel[]> => {
  const today = new Date();
  const startDate = new Date();
  startDate.setDate(today.getDate() - days);
  
  const todayStr = today.toISOString();
  const startDateStr = startDate.toISOString();
  
  return supabaseRestCall<{ data: EnergyLevel[] }>(`/rest/v1/focus_moods8?select=*&timestamp=gte.${startDateStr}&timestamp=lte.${todayStr}&order=timestamp.desc`, {
    method: 'GET'
  }).then(res => res.data || []);
};

export const createFocusMood = async (mood: Partial<EnergyLevel>): Promise<EnergyLevel> => {
  return supabaseRestCall<EnergyLevel>('/rest/v1/focus_moods8', {
    method: 'POST',
    body: JSON.stringify(mood)
  });
};

// Focus Achievements
export const getFocusAchievements = async (): Promise<FocusAchievement[]> => {
  return supabaseRestCall<{ data: FocusAchievement[] }>('/rest/v1/focus_achievements8?select=*&order=created_at.desc', {
    method: 'GET'
  }).then(res => res.data || []);
};

export const updateFocusAchievement = async (id: string, updates: Partial<FocusAchievement>): Promise<FocusAchievement> => {
  return supabaseRestCall<FocusAchievement>(`/rest/v1/focus_achievements8?id=eq.${id}`, {
    method: 'PATCH',
    body: JSON.stringify(updates)
  });
};

// CBT Insights
export const getCBTInsights = async (): Promise<CBTInsight[]> => {
  return supabaseRestCall<{ data: CBTInsight[] }>('/rest/v1/cbt_insights8?select=*&order=date.desc', {
    method: 'GET'
  }).then(res => res.data || []);
};

// ----- Stats Functions -----

// Define the expected stats shape
export interface FocusSessionStats {
  totalSessions: number;
  completedSessions: number;
  cancelledSessions: number;
  averageDuration: number; // in minutes
  totalFocusTime: number; // in minutes
  totalDistractions: number;
}

// Function to get stats (adapting logic from focus-sessions.ts)
export const getFocusSessionStats = async (): Promise<FocusSessionStats> => {
  // Get all sessions for the current user (Requires user context - assuming RLS handles this)
  // TODO: Confirm if getFocusSessions needs user_id filter or if RLS is sufficient
  const sessions = await supabaseRestCall<FocusSession[]>(
    `/rest/v1/focus_sessions8?select=status,duration_minutes,distractions_count,start_time,end_time`,
    { method: "GET" }
  );

  const totalSessions = sessions.length;
  const completedSessions = sessions.filter(s => s.status === 'completed').length; // Assuming status field exists
  const cancelledSessions = sessions.filter(s => s.status === 'cancelled').length; // Assuming status field exists
  
  const completedSessionsWithDuration = sessions.filter(
    s => s.status === 'completed' && s.duration_minutes != null
  );
  
  const totalDurationMinutes = completedSessionsWithDuration.reduce(
    (sum, session) => sum + (session.duration_minutes || 0),
    0
  );
  
  const averageDuration = completedSessionsWithDuration.length > 0
    ? totalDurationMinutes / completedSessionsWithDuration.length
    : 0;
    
  const totalFocusTime = totalDurationMinutes; // Total time is sum of completed durations
  
  const totalDistractions = sessions.reduce(
    (sum, session) => sum + (session.distractions_count || 0),
    0
  );

  return {
    totalSessions,
    completedSessions,
    cancelledSessions,
    averageDuration: Math.round(averageDuration),
    totalFocusTime: Math.round(totalFocusTime),
    totalDistractions
  };
};

// ----- Authentication Functions -----

export interface AuthResponse {
  access_token: string;
  refresh_token: string;
  user: {
    id: string;
    email: string;
  };
}

export const loginWithEmail = async (email: string, password: string): Promise<AuthResponse> => {
  const response = await fetch(`${import.meta.env.VITE_SUPABASE_URL}/auth/v1/token?grant_type=password`, {
    method: 'POST',
    headers: {
      'Content-Type': 'application/json',
      'apikey': import.meta.env.VITE_SUPABASE_ANON_KEY
    },
    body: JSON.stringify({ email, password })
  });
  
  if (!response.ok) {
    const error = await response.json();
    throw new Error(error.message || response.statusText);
  }
  
  const data = await response.json();
  localStorage.setItem('supabase.auth.token', JSON.stringify(data));
  return data;
};

export const logout = async (): Promise<void> => {
  const token = getSessionToken();
  
  if (token) {
    await fetch(`${import.meta.env.VITE_SUPABASE_URL}/auth/v1/logout`, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
        'apikey': import.meta.env.VITE_SUPABASE_ANON_KEY,
        'Authorization': `Bearer ${token}`
      }
    });
  }
  
  localStorage.removeItem('supabase.auth.token');
};

export const getCurrentUser = async (): Promise<{ id: string; email: string } | null> => {
  const token = getSessionToken();
  
  if (!token) return null;
  
  const response = await fetch(`${import.meta.env.VITE_SUPABASE_URL}/auth/v1/user`, {
    headers: {
      'apikey': import.meta.env.VITE_SUPABASE_ANON_KEY,
      'Authorization': `Bearer ${token}`
    }
  });
  
  if (!response.ok) return null;
  
  return await response.json();
};

// ----- Dashboard Specific API Functions -----

export const getDashboardData = async (userId: string): Promise<DashboardData> => {
  const today = new Date();
  const todayStr = today.toISOString().split('T')[0];

  try {
    // Fetch all necessary data concurrently
    const [
      recentSessionsData, 
      allSessionsData, 
      energyData, 
      tasksData, 
      achievementsData
    ] = await Promise.all([
      // Recent Sessions (last 5)
      supabaseRestCall<FocusSession[]>(
        `/rest/v1/focus_sessions8?select=*&user_id=eq.${userId}&order=start_time.desc&limit=5`,
        { method: "GET" }
      ),
      // All Sessions (for stats calculation)
      supabaseRestCall<FocusSession[]>(
        `/rest/v1/focus_sessions8?select=start_time,completed,duration_minutes&user_id=eq.${userId}`, 
        { method: "GET" }
      ),
      // Recent Energy Levels (last 5)
      supabaseRestCall<EnergyLevel[]>(
        `/rest/v1/energy_levels8?select=*&user_id=eq.${userId}&order=timestamp.desc&limit=5`,
        { method: "GET" }
      ),
      // Priority Tasks (High priority OR due today/overdue, limit 5)
      supabaseRestCall<FocusTask[]>(
        `/rest/v1/focus_tasks8?select=*&user_id=eq.${userId}&status=neq.completed&or=(priority.eq.high,due_date.lte.${todayStr})&order=priority.desc,due_date.asc&limit=5`,
        { method: "GET" }
      ),
      // Recent Achievements (last 3 completed)
      supabaseRestCall<FocusAchievement[]>(
        `/rest/v1/focus_achievements8?select=*&user_id=eq.${userId}&completed=eq.true&order=completion_date.desc&limit=3`,
        { method: "GET" }
      )
    ]);

    const allSessions = allSessionsData || [];
    let stats: DashboardStats;
    let focusScore = 0;
    let streakDates: string[] = [];

    if (allSessions.length > 0) {
      const totalSessions = allSessions.length;
      const completedSessions = allSessions.filter(s => s.completed).length;
      const totalMinutes = Math.round(
        allSessions.reduce((acc, s) => acc + (s.duration_minutes || 0), 0)
      );
      const completionRate = totalSessions > 0 ? Math.round((completedSessions / totalSessions) * 100) : 0;
      const avgSessionLength = completedSessions > 0 
        ? Math.round(totalMinutes / completedSessions) 
        : 0;

      // Streak Calculation
      const sortedDates = allSessions
        .filter(s => s.completed)
        .map(s => new Date(s.start_time).toLocaleDateString())
        .filter(dateStr => !isNaN(new Date(dateStr).getTime()))
        .sort((a, b) => new Date(b).getTime() - new Date(a).getTime());
      
      const uniqueDates = Array.from(new Set(sortedDates));
      streakDates = uniqueDates.slice(0, 7); // Keep track of recent dates for UI

      let currentStreak = 0;
      if (uniqueDates.length > 0) {
        const todayLocale = new Date().toLocaleDateString();
        const mostRecentDate = new Date(uniqueDates[0]);
        const yesterday = new Date();
        yesterday.setDate(yesterday.getDate() - 1);

        if (mostRecentDate.toLocaleDateString() === todayLocale || mostRecentDate.toLocaleDateString() === yesterday.toLocaleDateString()) {
          currentStreak = 1;
          for (let i = 1; i < uniqueDates.length; i++) {
            const currentDate = new Date(uniqueDates[i-1]);
            const prevDate = new Date(uniqueDates[i]);
            const diffTime = currentDate.getTime() - prevDate.getTime();
            const diffDays = Math.ceil(diffTime / (1000 * 60 * 60 * 24));
            
            if (diffDays === 1) {
              currentStreak++;
            } else {
              break; // Streak broken
            }
          }
        }
      }

      stats = {
        totalSessions,
        completedSessions,
        totalMinutes,
        streak: currentStreak,
        completionRate,
        avgSessionLength
      };

      // Focus Score Calculation
      const streakFactor = Math.min(currentStreak * 5, 25); // Max 25 points from streak
      const completionFactor = (completionRate / 100) * 25; // Max 25 points from completion rate
      const sessionsFactor = Math.min(totalSessions / 20, 1) * 25; // Max 25 points based on total sessions (caps at 20 sessions)
      const timeFactor = Math.min(totalMinutes / 1000, 1) * 25; // Max 25 points based on total time (caps at 1000 mins)
      focusScore = Math.round(streakFactor + completionFactor + sessionsFactor + timeFactor);

    } else {
      // Default stats if no sessions exist
      stats = { totalSessions: 0, completedSessions: 0, totalMinutes: 0, streak: 0, completionRate: 0, avgSessionLength: 0 };
      focusScore = 0;
      streakDates = [];
    }

    return {
      stats,
      recentSessions: recentSessionsData || [],
      energyLevels: energyData || [],
      tasks: tasksData || [],
      achievements: achievementsData || [],
      focusScore,
      streakDates
    };

  } catch (error) {
    console.error('Error fetching dashboard data:', error);
    // Return default empty state in case of error
    return {
      stats: { totalSessions: 0, completedSessions: 0, totalMinutes: 0, streak: 0, completionRate: 0, avgSessionLength: 0 },
      recentSessions: [],
      energyLevels: [],
      tasks: [],
      achievements: [],
      focusScore: 0,
      streakDates: []
    };
  }
};

// ----- Distraction Blocker Settings ----- 

export interface DistractionSettings {
  blocked_sites_categories: Record<string, boolean>; // e.g., { social: true, video: false }
  custom_blocked_sites: string[];
  schedules: any[]; // Define a proper Schedule type if saving actual schedule data
  notifications_blocked: boolean;
  strict_mode: boolean;
  user_id?: string; // Foreign key to users table
  id?: string; // Primary key for the settings row
  updated_at?: string;
}

// Placeholder: Get user's distraction settings
export const getUserDistractionSettings = async (userId: string): Promise<DistractionSettings | null> => {
  console.warn('API Call: getUserDistractionSettings - Placeholder, returning null.');
  // In a real scenario, fetch settings for the user:
  // const result = await supabaseRestCall<DistractionSettings[]>(`/rest/v1/distraction_settings8?select=*&user_id=eq.${userId}&limit=1`);
  // return result?.[0] || null;
  return null; // Return null to simulate no settings saved yet
};

// Placeholder: Update or create user's distraction settings
export const updateUserDistractionSettings = async (userId: string, settings: Partial<DistractionSettings>): Promise<DistractionSettings> => {
  console.warn('API Call: updateUserDistractionSettings - Placeholder, logging payload:', { userId, settings });
  // In a real scenario, use UPSERT or separate CREATE/UPDATE logic
  // Example UPSERT (if 'user_id' is unique constraint):
  // return supabaseRestCall<DistractionSettings>('/rest/v1/distraction_settings8?on_conflict=user_id', {
  //   method: 'POST',
  //   headers: {
  //      'Prefer': 'resolution=merge-duplicates' // Or 'resolution=ignore-duplicates'
  //    },
  //   body: JSON.stringify({ ...settings, user_id: userId })
  // });
  
  // Simulate returning the updated settings (add dummy id/timestamp)
  const simulatedResult: DistractionSettings = {
    blocked_sites_categories: settings.blocked_sites_categories || {},
    custom_blocked_sites: settings.custom_blocked_sites || [],
    schedules: settings.schedules || [],
    notifications_blocked: settings.notifications_blocked || false,
    strict_mode: settings.strict_mode || false,
    user_id: userId,
    id: 'simulated-id-' + Date.now(),
    updated_at: new Date().toISOString(),
  };
  return Promise.resolve(simulatedResult);
};
