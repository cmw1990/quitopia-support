// micro-frontends/easier-focus/src/components/AntiGooglitis/api/google-api.ts
// Following SSOT8001 guidelines - Direct REST API calls only
import { supabaseRequest } from '@/utils/supabaseRequest'; // Corrected import
import { Session } from '@supabase/supabase-js';
import { handleError } from '../../../utils/error-handler';

// Types
export interface SearchPattern {
  id?: string;
  user_id: string;
  pattern: string;
  category: 'research' | 'distraction' | 'work' | 'information' | 'social';
  timeWasted: number;
  occurrences: number;
  timestamp: string;
  created_at?: string;
}

export interface SearchAlternative {
  id?: string;
  title: string;
  description: string;
  url: string;
  category: string;
  created_at?: string;
}

export interface GoogleBlockSettings {
  enabled: boolean;
  blockLevel: 'light' | 'moderate' | 'strict';
  scheduledHours: {
    start: string;
    end: string;
    days: ('mon' | 'tue' | 'wed' | 'thu' | 'fri' | 'sat' | 'sun')[];
  }[];
  allowedSearches: string[];
  focusQuestions: string[];
  redirectTo: string;
  deepWorkMode?: boolean;
  deepWorkDuration?: number; // minutes
  notificationBlocking?: boolean;
  keywordBlocking?: boolean;
  blockSocialMedia?: boolean;
  customBlockedDomains?: string[];
  intensityLevel?: number; // 1-10 scale
}

export interface GoogleBlockStats {
  searchesBlocked: number;
  timeWasted: number;
  topDistractingPatterns: string[];
  weeklyData: {
    date: string;
    blocked: number;
    allowed: number;
  }[];
  categoriesData: {
    category: string;
    count: number;
    timeWasted: number;
  }[];
}

/**
 * Get Google Block Settings for the current user
 * @param session User session
 * @returns Google Block Settings object
 */
export const getGoogleBlockSettings = async (session: Session | null) => {
  try {
    if (!session?.user?.id) {
      throw new Error('User not authenticated');
    }

    const { data: response, error: getSettingsError } = await supabaseRequest<any[]>( // Use specific type if known
      `/rest/v1/user_settings8?user_id=eq.${session.user.id}&key=eq.google_block_settings`,
      { method: 'GET' }
    );
    if (getSettingsError) throw getSettingsError; // Propagate error
    
    if (!response || response.length === 0) {
      // Create default settings if none exist
      const defaultSettings: GoogleBlockSettings = {
        enabled: false,
        blockLevel: 'light',
        scheduledHours: [
          {
            start: '09:00',
            end: '17:00',
            days: ['mon', 'tue', 'wed', 'thu', 'fri']
          }
        ],
        allowedSearches: ['important', 'work', 'urgent'],
        focusQuestions: ['Is this search critical for my current task?', 'Can this wait until my break time?'],
        redirectTo: ''
      };
      
      await saveGoogleBlockSettings(defaultSettings, session);
      
      return defaultSettings;
    }
    
    return response[0].value;
  } catch (error) {
    handleError(
      error, 
      'getGoogleBlockSettings', 
      'Failed to load Google block settings',
      { silent: true }
    );
    throw error;
  }
};

/**
 * Save Google Block Settings for the current user
 * @param settings Settings object to save
 * @param session User session
 * @returns Updated settings
 */
export const saveGoogleBlockSettings = async (settings: GoogleBlockSettings, session: Session | null) => {
  try {
    if (!session?.user?.id) {
      throw new Error('User not authenticated');
    }

    const data: {
      user_id: string;
      key: string;
      value: GoogleBlockSettings;
      updated_at: string;
      created_at?: string;
    } = {
      user_id: session.user.id,
      key: 'google_block_settings',
      value: settings,
      updated_at: new Date().toISOString()
    };

    // Check if settings already exist
    const { data: existing, error: checkExistingError } = await supabaseRequest<any[]>( // Use specific type if known
      `/rest/v1/user_settings8?user_id=eq.${session.user.id}&key=eq.google_block_settings`,
      { method: 'GET' }
    );
    if (checkExistingError) throw checkExistingError; // Propagate error
    
    if (existing && existing.length > 0) {
      // Update existing settings
       const { error: updateError } = await supabaseRequest(
         `/rest/v1/user_settings8?id=eq.${existing[0].id}`,
         {
           method: 'PATCH',
           headers: { 'Prefer': 'return=minimal' },
           body: JSON.stringify(data)
         }
       );
       if (updateError) throw updateError; // Propagate error
    } else {
      // Create new settings
      data.created_at = new Date().toISOString();
       const { error: createError } = await supabaseRequest(
         '/rest/v1/user_settings8',
         {
           method: 'POST',
           headers: { 'Prefer': 'return=minimal' },
           body: JSON.stringify(data)
         }
       );
       if (createError) throw createError; // Propagate error
    }
    
    return settings;
  } catch (error) {
    handleError(
      error, 
      'saveGoogleBlockSettings', 
      'Failed to save Google block settings',
      { 
        critical: true,
        retry: () => saveGoogleBlockSettings(settings, session)
      }
    );
    throw error;
  }
};

/**
 * Get Search Patterns for the current user
 * @param session User session
 * @returns Array of search patterns
 */
export const getSearchPatterns = async (session: Session | null) => {
  try {
    if (!session?.user?.id) {
      throw new Error('User not authenticated');
    }

    const { data: response, error: getPatternsError } = await supabaseRequest<SearchPattern[]>(
      `/rest/v1/search_patterns8?user_id=eq.${session.user.id}&order=occurrences.desc`,
      { method: 'GET' }
    );
    if (getPatternsError) throw getPatternsError; // Propagate error
    
    return response || [];
  } catch (error) {
    handleError(
      error, 
      'getSearchPatterns', 
      'Failed to fetch search patterns',
      { silent: true }
    );
    throw error;
  }
};

/**
 * Save or update a Search Pattern
 * @param pattern Pattern object to save
 * @param session User session
 * @returns Updated pattern object
 */
export const saveSearchPattern = async (pattern: SearchPattern, session: Session | null) => {
  try {
    if (!session?.user?.id) {
      throw new Error('User not authenticated');
    }

    const data = {
      ...pattern,
      user_id: session.user.id,
      timestamp: new Date().toISOString(),
      created_at: new Date().toISOString(),
      updated_at: new Date().toISOString()
    };

    // Check if pattern already exists
    const { data: existing, error: checkExistingPatternError } = await supabaseRequest<SearchPattern[]>(
      `/rest/v1/search_patterns8?user_id=eq.${session.user.id}&pattern=eq.${encodeURIComponent(pattern.pattern)}`,
      { method: 'GET' }
    );
     if (checkExistingPatternError) throw checkExistingPatternError; // Propagate error
    
    if (existing && existing.length > 0) {
      // Update existing pattern
      const updatedPattern = {
        ...existing[0],
        occurrences: existing[0].occurrences + 1,
        timeWasted: existing[0].timeWasted + pattern.timeWasted,
        category: pattern.category,
        timestamp: new Date().toISOString(),
        updated_at: new Date().toISOString()
      };
      
       const { error: updatePatternError } = await supabaseRequest(
         `/rest/v1/search_patterns8?id=eq.${existing[0].id}`,
         {
           method: 'PATCH',
           headers: { 'Prefer': 'return=minimal' },
           body: JSON.stringify(updatedPattern)
         }
       );
       if (updatePatternError) throw updatePatternError; // Propagate error
      
      return updatedPattern;
    } else {
      // Create new pattern
       const { data: responseData, error: createPatternError } = await supabaseRequest<SearchPattern[]>(
         '/rest/v1/search_patterns8?select=*',
         {
           method: 'POST',
           headers: { 'Prefer': 'return=representation' },
           body: JSON.stringify(data)
         }
       );
       if (createPatternError) throw createPatternError; // Propagate error
       const response = responseData; // Keep as array for check below
      
      return response?.[0] || data;
    }
  } catch (error) {
    handleError(
      error, 
      'saveSearchPattern', 
      'Failed to save search pattern',
      {
        retry: () => saveSearchPattern(pattern, session)
      }
    );
    throw error;
  }
};

/**
 * Delete a Search Pattern
 * @param patternId ID of the pattern to delete
 * @param session User session
 * @returns True if successful
 */
export const deleteSearchPattern = async (patternId: string, session: Session | null) => {
  try {
    if (!session?.user?.id) {
      throw new Error('User not authenticated');
    }

     const { error: deletePatternError } = await supabaseRequest(
       `/rest/v1/search_patterns8?id=eq.${patternId}&user_id=eq.${session.user.id}`,
       { method: 'DELETE' }
     );
     if (deletePatternError) throw deletePatternError; // Propagate error
    
    return true;
  } catch (error) {
    handleError(
      error, 
      'deleteSearchPattern', 
      'Failed to delete search pattern',
      {
        retry: () => deleteSearchPattern(patternId, session)
      }
    );
    throw error;
  }
};

/**
 * Get Search Alternatives
 * @param session User session
 * @returns Array of search alternatives
 */
export const getSearchAlternatives = async (session: Session | null) => {
  try {
    if (!session?.user?.id) {
      throw new Error('User not authenticated');
    }

    const { data: response, error: getAlternativesError } = await supabaseRequest<SearchAlternative[]>(
      `/rest/v1/search_alternatives8?order=title.asc`,
      { method: 'GET' }
    );
    if (getAlternativesError) throw getAlternativesError; // Propagate error
    
    return response || [];
  } catch (error) {
    handleError(
      error, 
      'getSearchAlternatives', 
      'Failed to fetch search alternatives',
      { silent: true }
    );
    throw error;
  }
};

/**
 * Get Google Block Stats for the current user
 * @param session User session
 * @returns Google Block Stats object
 */
export const getGoogleBlockStats = async (session: Session | null) => {
  try {
    if (!session?.user?.id) {
      throw new Error('User not authenticated');
    }

    const { data: response, error: getStatsError } = await supabaseRequest<any[]>( // Use specific type if known
      `/rest/v1/user_stats8?user_id=eq.${session.user.id}&key=eq.google_block_stats`,
      { method: 'GET' }
    );
     if (getStatsError) throw getStatsError; // Propagate error
    
    if (!response || response.length === 0) {
      // Create default stats if none exist
      const defaultStats: GoogleBlockStats = {
        searchesBlocked: 0,
        timeWasted: 0,
        topDistractingPatterns: [],
        weeklyData: Array.from({ length: 7 }, (_, i) => {
          const date = new Date();
          date.setDate(date.getDate() - (6 - i));
          return {
            date: date.toISOString().split('T')[0],
            blocked: 0,
            allowed: 0
          };
        }),
        categoriesData: [
          { category: 'research', count: 0, timeWasted: 0 },
          { category: 'distraction', count: 0, timeWasted: 0 },
          { category: 'work', count: 0, timeWasted: 0 },
          { category: 'information', count: 0, timeWasted: 0 },
          { category: 'social', count: 0, timeWasted: 0 }
        ]
      };
      
      try {
        await updateGoogleBlockStats(defaultStats, session);
      } catch (innerError) {
        handleError(
          innerError,
          'getGoogleBlockStats:createDefault',
          'Failed to initialize stats',
          { silent: true }
        );
      }
      
      return defaultStats;
    }
    
    return response[0].value;
  } catch (error) {
    handleError(
      error, 
      'getGoogleBlockStats', 
      'Failed to fetch Google block stats',
      { silent: true }
    );
    throw error;
  }
};

/**
 * Update Google Block Stats for the current user
 * @param stats Stats object to save
 * @param session User session
 * @returns Updated stats
 */
export const updateGoogleBlockStats = async (stats: GoogleBlockStats, session: Session | null) => {
  try {
    if (!session?.user?.id) {
      throw new Error('User not authenticated');
    }

    const data = {
      user_id: session.user.id,
      key: 'google_block_stats',
      value: stats,
      updated_at: new Date().toISOString()
    };

    // Check if stats already exist
    const { data: existing, error: checkStatsError } = await supabaseRequest<any[]>( // Use specific type if known
      `/rest/v1/user_stats8?user_id=eq.${session.user.id}&key=eq.google_block_stats`,
      { method: 'GET' }
    );
    if (checkStatsError) throw checkStatsError; // Propagate error
    
    if (existing && existing.length > 0) {
      // Update existing stats
       const { error: updateStatsError } = await supabaseRequest(
         `/rest/v1/user_stats8?id=eq.${existing[0].id}`,
         {
           method: 'PATCH',
           headers: { 'Prefer': 'return=minimal' },
           body: JSON.stringify(data)
         }
       );
       if (updateStatsError) throw updateStatsError; // Propagate error
    } else {
      // Create new stats
       const { error: createStatsError } = await supabaseRequest(
         '/rest/v1/user_stats8',
         {
           method: 'POST',
           headers: { 'Prefer': 'return=minimal' },
           body: JSON.stringify({
             ...data,
             created_at: new Date().toISOString()
           })
         }
       );
       if (createStatsError) throw createStatsError; // Propagate error
    }
    
    return stats;
  } catch (error) {
    handleError(
      error, 
      'updateGoogleBlockStats', 
      'Failed to update Google block stats',
      { silent: true }
    );
    throw error;
  }
}; 