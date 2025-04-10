
import { supabase } from '@/integrations/supabase/supabase-client';
import { toast } from 'sonner';

// Define the FocusSession type
export interface FocusSession {
  id: string;
  user_id: string;
  start_time: string;
  end_time?: string | null;
  duration_seconds?: number;
  status: string;
  focus_type?: string;
  completed?: boolean;
  created_at?: string;
  updated_at?: string;
}

class FocusService {
  // Get user's focus session history
  async getFocusSessionHistory(userId: string): Promise<FocusSession[]> {
    try {
      const { data, error } = await supabase
        .from('focus_sessions8')
        .select('*')
        .eq('user_id', userId)
        .order('start_time', { ascending: false });

      if (error) throw error;
      
      return data || [];
    } catch (error) {
      console.error('Error fetching focus session history:', error);
      toast.error('Failed to load focus sessions');
      return [];
    }
  }

  // Create a new focus session
  async createFocusSession(session: Omit<FocusSession, 'id' | 'created_at' | 'updated_at'>): Promise<FocusSession | null> {
    try {
      const { data, error } = await supabase
        .from('focus_sessions8')
        .insert(session)
        .select()
        .single();

      if (error) throw error;
      
      return data;
    } catch (error) {
      console.error('Error creating focus session:', error);
      toast.error('Failed to create focus session');
      return null;
    }
  }

  // Update a focus session
  async updateFocusSession(sessionId: string, updates: Partial<FocusSession>): Promise<FocusSession | null> {
    try {
      const { data, error } = await supabase
        .from('focus_sessions8')
        .update(updates)
        .eq('id', sessionId)
        .select()
        .single();

      if (error) throw error;
      
      return data;
    } catch (error) {
      console.error('Error updating focus session:', error);
      toast.error('Failed to update focus session');
      return null;
    }
  }

  // Delete a focus session
  async deleteFocusSession(sessionId: string): Promise<boolean> {
    try {
      const { error } = await supabase
        .from('focus_sessions8')
        .delete()
        .eq('id', sessionId);

      if (error) throw error;
      
      return true;
    } catch (error) {
      console.error('Error deleting focus session:', error);
      toast.error('Failed to delete focus session');
      return false;
    }
  }
}

// Export a singleton instance
export const FocusServiceInstance = new FocusService();
