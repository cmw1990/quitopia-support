import { supabase } from '../contexts/AuthContext';
import { z } from 'zod';

// Zod schema for energy tracking
export const EnergyEntrySchema = z.object({
  id: z.string().uuid().optional(),
  userId: z.string().uuid(),
  energyLevel: z.number().min(1).max(10),
  timestamp: z.string().datetime(),
  notes: z.string().optional(),
  factors: z.array(z.string()).optional()
});

export type EnergyEntry = z.infer<typeof EnergyEntrySchema>;

export class EnergyTrackingService {
  static async logEnergyLevel(entry: Omit<EnergyEntry, 'id' | 'timestamp'>): Promise<EnergyEntry | null> {
    try {
      const validatedEntry = EnergyEntrySchema.omit({ id: true, timestamp: true }).parse(entry);

      const { data, error } = await supabase
        .from('energy_tracking')
        .insert({
          ...validatedEntry,
          timestamp: new Date().toISOString()
        })
        .select()
        .single();

      if (error) throw error;
      return data;
    } catch (error) {
      console.error('Failed to log energy level:', error);
      return null;
    }
  }

  static async getUserEnergyEntries(userId: string, options?: {
    limit?: number,
    startDate?: string,
    endDate?: string
  }): Promise<EnergyEntry[]> {
    try {
      let query = supabase
        .from('energy_tracking')
        .select('*')
        .eq('user_id', userId)
        .order('timestamp', { ascending: false });

      if (options?.startDate) {
        query = query.gte('timestamp', options.startDate);
      }

      if (options?.endDate) {
        query = query.lte('timestamp', options.endDate);
      }

      if (options?.limit) {
        query = query.limit(options.limit);
      }

      const { data, error } = await query;

      if (error) throw error;
      return data || [];
    } catch (error) {
      console.error('Failed to fetch energy entries:', error);
      return [];
    }
  }

  static async getEnergyTrends(userId: string): Promise<{
    averageEnergyLevel: number;
    dailyTrends: Array<{ date: string, averageEnergy: number }>;
    factorImpact: Array<{ factor: string, averageImpact: number }>;
  }> {
    try {
      const { data, error } = await supabase.rpc('get_energy_trends', { p_user_id: userId });

      if (error) throw error;
      return data || {
        averageEnergyLevel: 0,
        dailyTrends: [],
        factorImpact: []
      };
    } catch (error) {
      console.error('Failed to fetch energy trends:', error);
      return {
        averageEnergyLevel: 0,
        dailyTrends: [],
        factorImpact: []
      };
    }
  }

  static async getEnergyRecommendations(userId: string): Promise<string[]> {
    try {
      const { data, error } = await supabase.rpc('generate_energy_recommendations', { p_user_id: userId });

      if (error) throw error;
      return data || [];
    } catch (error) {
      console.error('Failed to generate energy recommendations:', error);
      return [];
    }
  }
}