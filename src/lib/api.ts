import {
  supabaseRest,
  fetchTable,
  insertIntoTable,
  updateTable,
  deleteFromTable
} from './supabase-rest';

// Removed auth object - handled by AuthContext now

// Focus Sessions API (Refactored to use supabaseRest helpers)
export const focusSessions = {
  create: async (data: any) => {
    // Assumes data includes user_id if required by RLS
    return insertIntoTable('focus_sessions', data);
  },

  list: async (params: Record<string, any> = {}) => {
    // Pass Supabase query params like select, order, user_id filtering
    // Example: params = { select: '*', user_id: `eq.${userId}` }
    return fetchTable('focus_sessions', { ...params, select: params.select || '*' });
  },

  get: async (id: string, params: Record<string, any> = {}) => {
    // Match by ID and include any other specified params
    return fetchTable('focus_sessions', { ...params, id: `eq.${id}`, select: params.select || '*' }, true);
  },

  update: async (id: string, data: any) => {
    return updateTable('focus_sessions', { id }, data);
  },

  delete: async (id: string) => {
    return deleteFromTable('focus_sessions', { id });
  },
};

// Tasks API (Refactored)
export const focusTasks = { // Renamed export to avoid conflict with tasks keyword if any
  create: async (data: any) => {
    // Assumes data includes user_id. Timestamps managed by DB or added here if needed.
    // const userId = getUserIdFromAuth(); // Need a way to get user ID if not in data
    // data.user_id = userId;
    return insertIntoTable('focus_tasks', data);
  },

  list: async (params: Record<string, any> = {}) => {
    // Example: list({ user_id: `eq.${userId}`, order: 'created_at.desc' })
    return fetchTable('focus_tasks', { ...params, select: params.select || '*' });
  },

  update: async (id: string, data: any) => {
    // const userId = getUserIdFromAuth(); // If RLS requires user_id match
    // return updateTable('focus_tasks', { id, user_id: userId }, data);
    return updateTable('focus_tasks', { id }, data);
  },

  delete: async (id: string) => {
    // const userId = getUserIdFromAuth(); // If RLS requires user_id match
    // return deleteFromTable('focus_tasks', { id, user_id: userId });
    return deleteFromTable('focus_tasks', { id });
  },
};

// Focus Stats API (Refactored)
export const focusStats = {
  // Create might be handled by DB triggers/functions based on sessions/tasks
  // Example: Inserting a stat record manually
  create: async (data: any) => {
    return insertIntoTable('focus_stats', data);
  },

  list: async (params: Record<string, any> = {}) => {
    return fetchTable('focus_stats', { ...params, select: params.select || '*' });
  },

  getDaily: async (date: string, userId: string, params: Record<string, any> = {}) => {
    // Assuming RLS uses authenticated user_id, or pass it explicitly if needed
    return fetchTable('focus_stats', { ...params, date: `eq.${date}`, user_id: `eq.${userId}`, select: params.select || '*' });
  },

  update: async (id: string, data: any) => {
    // Stats updates might be complex, potentially handled by DB functions
    return updateTable('focus_stats', { id }, data);
  },
};

// Focus Settings API (Refactored)
export const focusSettings = {
  get: async (userId: string, params: Record<string, any> = {}) => {
    // Fetch settings for the specific user
    return fetchTable('focus_settings', { ...params, user_id: `eq.${userId}`, select: params.select || '*' }, true); // Enforce auth
  },

  update: async (userId: string, data: any) => {
    // Update (or upsert) settings for the user
    // Upsert requires specific header: { 'Prefer': 'resolution=merge-duplicates' }
    // Using updateTable assumes the record exists.
    return updateTable('focus_settings', { user_id: userId }, data, true); // Enforce auth

    // Example Upsert using supabaseRest directly:
    /*
    return supabaseRest('/rest/v1/focus_settings', {
        method: 'POST', // POST with Prefer: resolution=merge-duplicates acts as upsert
        body: { ...data, user_id: userId },
        headers: { 
            'Prefer': 'resolution=merge-duplicates',
            'Content-Profile': 'public' // Specify schema if not public
        },
        params: { user_id: `eq.${userId}` }, // Match condition for upsert
        needsAuth: true
    });
    */
  },
};

// Focus Strategies API (Refactored)
export const focusStrategies = {
  list: async (params: Record<string, any> = {}) => {
    // Strategies might be public or user-specific
    return fetchTable('focus_strategies', { ...params, select: params.select || '*' });
  },

  get: async (id: string, params: Record<string, any> = {}) => {
    return fetchTable('focus_strategies', { ...params, id: `eq.${id}`, select: params.select || '*' });
  },

  // Update strategy (e.g., user rating, effectiveness) - requires specific schema/logic
  updateUserStrategyInfo: async (userStrategyId: string, data: any) => {
    // This likely involves a linking table (e.g., user_focus_strategies)
    // Replace 'user_focus_strategies' with the actual table name
    return updateTable('user_focus_strategies', { id: userStrategyId }, data);
  },
};

// Focus Distractions API (Refactored)
export const focusDistractions = {
  create: async (data: any) => {
    // Assumes data includes user_id, session_id etc.
    return insertIntoTable('focus_distractions', data);
  },

  list: async (params: Record<string, any> = {}) => {
    // e.g., list({ user_id: `eq.${userId}`, session_id: `eq.${sessionId}` })
    return fetchTable('focus_distractions', { ...params, select: params.select || '*' });
  },

  // Other CRUD operations as needed...
};

// Focus Moods API (Refactored)
export const focusMoods = {
  create: async (data: any) => {
    return insertIntoTable('focus_moods', data);
  },

  list: async (params: Record<string, any> = {}) => {
    return fetchTable('focus_moods', { ...params, select: params.select || '*' });
  },
};

// Focus Achievements API (Refactored - similar to achievements.ts, consolidating here)
export const focusAchievements = {
  list: async (params: Record<string, any> = {}) => {
    // List all available achievements (potentially public)
    return fetchTable('achievements_definitions', { ...params, select: params.select || '*' }, false); // Example: public definitions
  },

  listUserAchievements: async (userId: string, params: Record<string, any> = {}) => {
    // List achievements earned by a specific user
    return fetchTable('focus_achievements', { ...params, user_id: `eq.${userId}`, select: params.select || '*' });
  },

  // Granting achievements might be done via DB triggers or functions
  grant: async (userId: string, achievementId: string) => {
    // Example: Directly inserting a user achievement record
    return insertIntoTable('focus_achievements', { user_id: userId, achievement_id: achievementId, achieved_at: new Date().toISOString() });
  },
};

// Add other API endpoints as needed (e.g., for community, games, etc.) following the same pattern.

// Example: Fetching user profile data (assuming a 'profiles' table)
export const userProfile = {
  get: async (userId: string) => {
    const result = await fetchTable('profiles', { user_id: `eq.${userId}`, select: '*' });
    // fetchTable returns an array, expect one profile
    return result?.[0] || null;
  },

  update: async (userId: string, data: any) => {
    return updateTable('profiles', { user_id: userId }, data);
  },
};
