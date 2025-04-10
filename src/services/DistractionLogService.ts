
import { supabase } from '@/integrations/supabase/supabase-client';
import { toast } from 'sonner';

// Define the DistractionLog type
export interface DistractionLog {
  id: string;
  user_id: string;
  session_id?: string | null;
  timestamp: string;
  distraction_type: string;
  duration_seconds?: number | null;
  notes?: string | null;
  created_at?: string;
}

class DistractionLogService {
  // Get user's distraction history
  async getDistractionHistory(userId: string, limit: number = 100): Promise<DistractionLog[]> {
    try {
      const { data, error } = await supabase
        .from('focus_distractions')
        .select('*')
        .eq('user_id', userId)
        .order('timestamp', { ascending: false })
        .limit(limit);

      if (error) throw error;
      
      return data || [];
    } catch (error) {
      console.error('Error fetching distraction logs:', error);
      toast.error('Failed to load distraction data');
      return [];
    }
  }

  // Create a new distraction log
  async createDistractionLog(log: Omit<DistractionLog, 'id' | 'created_at'>): Promise<DistractionLog | null> {
    try {
      const { data, error } = await supabase
        .from('focus_distractions')
        .insert(log)
        .select()
        .single();

      if (error) throw error;
      
      return data;
    } catch (error) {
      console.error('Error creating distraction log:', error);
      toast.error('Failed to log distraction');
      return null;
    }
  }

  // Update a distraction log
  async updateDistractionLog(logId: string, updates: Partial<DistractionLog>): Promise<DistractionLog | null> {
    try {
      const { data, error } = await supabase
        .from('focus_distractions')
        .update(updates)
        .eq('id', logId)
        .select()
        .single();

      if (error) throw error;
      
      return data;
    } catch (error) {
      console.error('Error updating distraction log:', error);
      toast.error('Failed to update distraction log');
      return null;
    }
  }

  // Delete a distraction log
  async deleteDistractionLog(logId: string): Promise<boolean> {
    try {
      const { error } = await supabase
        .from('focus_distractions')
        .delete()
        .eq('id', logId);

      if (error) throw error;
      
      return true;
    } catch (error) {
      console.error('Error deleting distraction log:', error);
      toast.error('Failed to delete distraction log');
      return false;
    }
  }
}

// Export a singleton instance
export const DistractionLogServiceInstance = new DistractionLogService();
