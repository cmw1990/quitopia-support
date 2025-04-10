import { supabaseRestApi } from '@/integrations/supabase/supabase-client';
import { FocusSession, CreateFocusSessionDto, UpdateFocusSessionDto } from '@/types/focusSession';

// Focus Sessions API - Using direct REST API calls as specified in SSOT
const API_ENDPOINT = 'focus_sessions8';

/**
 * Get all focus sessions for the current user
 */
export const getFocusSessions = async (): Promise<FocusSession[]> => {
  try {
    return await supabaseRestApi.get<FocusSession[]>(API_ENDPOINT, {
      select: '*',
      order: 'created_at.desc'
    });
  } catch (error) {
    console.error('Error fetching focus sessions:', error);
    throw error;
  }
};

/**
 * Get a specific focus session by ID
 */
export const getFocusSessionById = async (id: string): Promise<FocusSession> => {
  try {
    const sessions = await supabaseRestApi.get<FocusSession[]>(API_ENDPOINT, {
      select: '*',
      id: `eq.${id}`
    });
    
    if (!sessions || sessions.length === 0) {
      throw new Error(`Focus session with ID ${id} not found`);
    }
    
    return sessions[0];
  } catch (error) {
    console.error(`Error fetching focus session with ID ${id}:`, error);
    throw error;
  }
};

/**
 * Create a new focus session
 */
export const createFocusSession = async (session: CreateFocusSessionDto): Promise<FocusSession> => {
  try {
    const newSession = {
      ...session,
      status: 'planned' as const,
      distractions_logged: 0,
    };
    
    const createdSession = await supabaseRestApi.post<FocusSession[]>(API_ENDPOINT, newSession);
    
    if (!createdSession || createdSession.length === 0) {
      throw new Error('Failed to create focus session');
    }
    
    return createdSession[0];
  } catch (error) {
    console.error('Error creating focus session:', error);
    throw error;
  }
};

/**
 * Update an existing focus session
 */
export const updateFocusSession = async (id: string, updates: UpdateFocusSessionDto): Promise<FocusSession> => {
  try {
    // Add updated_at timestamp
    const sessionUpdates = {
      ...updates,
      updated_at: new Date().toISOString()
    };
    
    // If session is being completed, ensure end_time is set
    if (sessionUpdates.status === 'completed' && !sessionUpdates.end_time) {
      sessionUpdates.end_time = new Date().toISOString();
    }
    
    // Calculate actual_duration_seconds if not provided but session is complete
    if (sessionUpdates.status === 'completed' && !sessionUpdates.actual_duration_seconds) {
      const session = await getFocusSessionById(id);
      if (session.start_time && sessionUpdates.end_time) {
        const startTime = new Date(session.start_time).getTime();
        const endTime = new Date(sessionUpdates.end_time).getTime();
        sessionUpdates.actual_duration_seconds = Math.floor((endTime - startTime) / 1000);
      }
    }
    
    const updatedSession = await supabaseRestApi.patch<FocusSession[]>(`${API_ENDPOINT}?id=eq.${id}`, sessionUpdates);
    
    if (!updatedSession || updatedSession.length === 0) {
      throw new Error(`Failed to update focus session with ID ${id}`);
    }
    
    return updatedSession[0];
  } catch (error) {
    console.error(`Error updating focus session with ID ${id}:`, error);
    throw error;
  }
};

/**
 * Delete a focus session
 */
export const deleteFocusSession = async (id: string): Promise<void> => {
  try {
    await supabaseRestApi.delete(`${API_ENDPOINT}?id=eq.${id}`);
  } catch (error) {
    console.error(`Error deleting focus session with ID ${id}:`, error);
    throw error;
  }
};

/**
 * Log a distraction during a focus session
 */
export const logDistraction = async (sessionId: string): Promise<FocusSession> => {
  try {
    // Get current session
    const session = await getFocusSessionById(sessionId);
    
    // Increment distractions_logged
    const updatedSession = await supabaseRestApi.patch<FocusSession[]>(
      `${API_ENDPOINT}?id=eq.${sessionId}`,
      {
        distractions_logged: (session.distractions_logged || 0) + 1,
        updated_at: new Date().toISOString()
      }
    );
    
    if (!updatedSession || updatedSession.length === 0) {
      throw new Error(`Failed to log distraction for session with ID ${sessionId}`);
    }
    
    return updatedSession[0];
  } catch (error) {
    console.error(`Error logging distraction for session with ID ${sessionId}:`, error);
    throw error;
  }
};

/**
 * Get focus sessions stats (counts by status, average duration, etc.)
 */
export const getFocusSessionStats = async (): Promise<any> => {
  try {
    // Get all sessions for current user
    const sessions = await getFocusSessions();
    
    // Calculate stats
    const totalSessions = sessions.length;
    const completedSessions = sessions.filter(s => s.status === 'completed').length;
    const cancelledSessions = sessions.filter(s => s.status === 'cancelled').length;
    
    // Calculate average duration for completed sessions
    const completedSessionsWithDuration = sessions.filter(
      s => s.status === 'completed' && s.actual_duration_seconds
    );
    
    const totalDuration = completedSessionsWithDuration.reduce(
      (sum, session) => sum + (session.actual_duration_seconds || 0),
      0
    );
    
    const averageDuration = completedSessionsWithDuration.length > 0
      ? totalDuration / completedSessionsWithDuration.length
      : 0;
      
    // Calculate total focus time
    const totalFocusTime = totalDuration;
    
    // Calculate total distractions
    const totalDistractions = sessions.reduce(
      (sum, session) => sum + (session.distractions_logged || 0),
      0
    );
    
    return {
      totalSessions,
      completedSessions,
      cancelledSessions,
      averageDuration,
      totalFocusTime,
      totalDistractions
    };
  } catch (error) {
    console.error('Error getting focus session stats:', error);
    throw error;
  }
}; 