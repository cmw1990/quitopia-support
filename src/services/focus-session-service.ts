import { handleError, ErrorType } from '../utils/error-handler';
import { supabaseRequest } from '@/utils/supabaseRequest';

export interface FocusSession {
  id?: string;
  user_id: string;
  type: 'focus' | 'break';
  duration: number;
  start_time: string;
  end_time?: string;
  status: 'completed' | 'interrupted' | 'in_progress';
}

export interface FocusSessionResponse {
  data?: FocusSession | FocusSession[] | null;
  error?: Error | null;
}

export class FocusSessionService {
  static async createSession(sessionData: Omit<FocusSession, 'id'>): Promise<FocusSessionResponse> {
    try {
      const response = await supabaseRequest<FocusSession>({
        tableName: 'focus_sessions',
        method: 'POST',
        body: sessionData
      });

      if (response.error) {
        handleError(response.error, 'FocusSessionService.createSession');
        return { error: response.error };
      }

      return { data: response.data };
    } catch (error) {
      const processedError = handleError(error, 'FocusSessionService.createSession');
      return { error: new Error(processedError.message) };
    }
  }

  static async getSessions(userId: string, options?: { 
    limit?: number, 
    type?: 'focus' | 'break' 
  }): Promise<FocusSessionResponse> {
    try {
      const query: Record<string, any> = { user_id: userId };
      if (options?.type) query.type = options.type;

      const response = await supabaseRequest<FocusSession[]>({
        tableName: 'focus_sessions',
        method: 'GET',
        params: {
          ...query,
          limit: options?.limit || 10,
          order: 'start_time.desc'
        }
      });

      if (response.error) {
        handleError(response.error, 'FocusSessionService.getSessions');
        return { error: response.error };
      }

      return { data: response.data || [] };
    } catch (error) {
      const processedError = handleError(error, 'FocusSessionService.getSessions');
      return { error: new Error(processedError.message) };
    }
  }

  static async updateSession(sessionId: string, updateData: Partial<FocusSession>): Promise<FocusSessionResponse> {
    try {
      const response = await supabaseRequest<FocusSession>({
        tableName: 'focus_sessions',
        method: 'PATCH',
        params: { id: sessionId },
        body: updateData
      });

      if (response.error) {
        handleError(response.error, 'FocusSessionService.updateSession');
        return { error: response.error };
      }

      return { data: response.data };
    } catch (error) {
      const processedError = handleError(error, 'FocusSessionService.updateSession');
      return { error: new Error(processedError.message) };
    }
  }

  static async deleteSession(sessionId: string): Promise<FocusSessionResponse> {
    try {
      const response = await supabaseRequest({
        tableName: 'focus_sessions',
        method: 'DELETE',
        params: { id: sessionId }
      });

      if (response.error) {
        handleError(response.error, 'FocusSessionService.deleteSession');
        return { error: response.error };
      }

      return { data: null };
    } catch (error) {
      const processedError = handleError(error, 'FocusSessionService.deleteSession');
      return { error: new Error(processedError.message) };
    }
  }
}