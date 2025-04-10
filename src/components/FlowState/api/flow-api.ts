// micro-frontends/easier-focus/src/components/FlowState/api/flow-api.ts
// Following SSOT8001 guidelines - Direct REST API calls only
import { supabaseRequest } from '@/utils/supabaseRequest'; // Corrected import
import { Session } from '@supabase/supabase-js'; // Assuming Session type comes directly from the Supabase client library
import { toast } from 'sonner';
import { handleError } from '../../../utils/error-handler';

// Types
export interface FlowSession {
  id?: string;
  user_id: string;
  start_time: string;
  end_time?: string;
  duration_minutes: number;
  avg_focus_level: number;
  avg_energy_level: number;
  flow_time_minutes: number;
  notes?: string;
  distractions: Distraction[];
  created_at?: string;
}

export interface Distraction {
  id?: string;
  user_id: string;
  timestamp: string;
  session_id: string | null;
  type: 'external' | 'internal' | 'tech' | 'physical' | 'social' | 'manual';
  notes?: string;
  created_at?: string;
}

export interface FlowState {
  id?: string;
  user_id: string;
  timestamp: string;
  focus_level: number;
  energy_level: number;
  is_flow: boolean;
  notes?: string;
  created_at?: string;
}

/**
 * Save a complete flow session
 * @param sessionData Flow session data to save
 * @param session User session for authentication
 * @returns Response data from API
 */
export const saveFlowSession = async (sessionData: FlowSession, session: Session | null) => {
  try {
    if (!session?.user?.id) {
      throw new Error('User not authenticated');
    }

    // Use supabaseRequest, handle response, remove session arg
    // Add select=* and Prefer header to get the created item back
    const { data: response, error } = await supabaseRequest<any[]>( // Expect array, use specific type if known
      '/rest/v1/flow_sessions8?select=*',
      {
        method: 'POST',
        headers: { 'Prefer': 'return=representation' },
        body: JSON.stringify({
          ...sessionData,
          user_id: session.user.id,
          created_at: new Date().toISOString()
        })
      }
      // Removed session argument
    );
     if (error) throw error; // Propagate error
    
    return response;
  } catch (error) {
    handleError(
      error, 
      'saveFlowSession', 
      'Failed to save flow session',
      {
        critical: true,
        retry: () => saveFlowSession(sessionData, session)
      }
    );
    throw error;
  }
};

/**
 * Log a distraction event
 * @param distraction Distraction data to save
 * @param session User session for authentication
 * @returns Response data from API
 */
export const logDistraction = async (distraction: Distraction, session: Session | null) => {
  try {
    if (!session?.user?.id) {
      throw new Error('User not authenticated');
    }

    // Use supabaseRequest, handle response, remove session arg
    // Add select=* and Prefer header to get the created item back
    const { data: response, error } = await supabaseRequest<any[]>( // Expect array, use specific type if known
      '/rest/v1/distractions8?select=*',
      {
        method: 'POST',
        headers: { 'Prefer': 'return=representation' },
        body: JSON.stringify({
          ...distraction,
          user_id: session.user.id,
          created_at: new Date().toISOString()
        })
      }
       // Removed session argument
    );
     if (error) throw error; // Propagate error
    
    return response;
  } catch (error) {
    handleError(
      error, 
      'logDistraction', 
      'Failed to log distraction',
      { 
        silent: !session, // Only show error to logged-in users
        retry: () => logDistraction(distraction, session)
      }
    );
    throw error;
  }
};

/**
 * Save a flow state snapshot
 * @param stateData Flow state data to save
 * @param session User session for authentication
 * @returns Response data from API
 */
export const saveFlowState = async (stateData: FlowState, session: Session | null) => {
  try {
    if (!session?.user?.id) {
      throw new Error('User not authenticated');
    }

    // Use supabaseRequest, handle response, remove session arg
     // Add select=* and Prefer header to get the created item back
     const { data: response, error } = await supabaseRequest<any[]>( // Expect array, use specific type if known
       '/rest/v1/flow_states8?select=*',
       {
         method: 'POST',
         headers: { 'Prefer': 'return=representation' },
         body: JSON.stringify({
           ...stateData,
           user_id: session.user.id,
           created_at: new Date().toISOString()
         })
       }
        // Removed session argument
     );
     if (error) throw error; // Propagate error
    
    return response;
  } catch (error) {
    handleError(
      error, 
      'saveFlowState', 
      'Failed to save flow state',
      { silent: true } // Don't interrupt user's flow with error messages
    );
    throw error;
  }
};

/**
 * Get recent flow sessions for a user
 * @param session User session for authentication
 * @param limit Maximum number of sessions to return
 * @returns Array of flow sessions
 */
export const getRecentFlowSessions = async (session: Session | null, limit = 10) => {
  try {
    if (!session?.user?.id) {
      throw new Error('User not authenticated');
    }

    // Use supabaseRequest, handle response, remove session arg
    const { data: response, error } = await supabaseRequest<FlowSession[]>(
      `/rest/v1/flow_sessions8?user_id=eq.${session.user.id}&order=created_at.desc&limit=${limit}`,
      { method: 'GET' }
      // Removed session argument
    );
     if (error) throw error; // Propagate error
    
    return response;
  } catch (error) {
    handleError(
      error, 
      'getRecentFlowSessions', 
      'Failed to fetch recent flow sessions',
      {
        retry: () => getRecentFlowSessions(session, limit)
      }
    );
    throw error;
  }
};

/**
 * Get flow statistics for a user
 * @param session User session for authentication
 * @returns Flow statistics data
 */
export const getFlowStatistics = async (session: Session | null) => {
  try {
    if (!session?.user?.id) {
      throw new Error('User not authenticated');
    }

    // Use supabaseRequest, handle response, remove session arg
    const { data: response, error: getStatsError } = await supabaseRequest<any[]>( // Use specific type if known
      `/rest/v1/user_stats8?user_id=eq.${session.user.id}&key=eq.flow_statistics`,
      { method: 'GET' }
      // Removed session argument
    );
    if (getStatsError) throw getStatsError; // Propagate error
    
    // If no statistics exist yet, create a default entry
    if (!response || response.length === 0) {
      const defaultStats = {
        user_id: session.user.id,
        key: 'flow_statistics',
        value: {
          total_sessions: 0,
          total_flow_minutes: 0,
          average_focus: 0,
          average_energy: 0,
          total_distractions: 0,
          best_day_of_week: null,
          best_time_of_day: null,
          streak: 0
        },
        created_at: new Date().toISOString(),
        updated_at: new Date().toISOString()
      };
      
      try {
        // Use supabaseRequest, handle error, remove session arg
        const { error: createStatsError } = await supabaseRequest(
          '/rest/v1/user_stats8',
          {
            method: 'POST',
            headers: { 'Prefer': 'return=minimal' }, // Don't need result back
            body: JSON.stringify(defaultStats)
          }
          // Removed session argument
        );
        if (createStatsError) throw createStatsError; // Propagate error
      } catch (innerError) {
        handleError(
          innerError,
          'getFlowStatistics:createDefault',
          'Failed to create initial flow statistics',
          { silent: true }
        );
      }
      
      return [defaultStats];
    }
    
    return response;
  } catch (error) {
    handleError(
      error, 
      'getFlowStatistics', 
      'Failed to fetch flow statistics',
      {
        retry: () => getFlowStatistics(session)
      }
    );
    throw error;
  }
}; 