import { supabase } from '../contexts/AuthContext';
import { z } from 'zod';

// Zod schema for game sessions
export const GameSessionSchema = z.object({
  id: z.string().uuid().optional(),
  userId: z.string().uuid(),
  gameType: z.enum(['pattern_match', 'memory_cards', 'zen_drift']),
  score: z.number().min(0),
  duration: z.number().min(0),
  difficulty: z.enum(['easy', 'medium', 'hard']),
  timestamp: z.string().datetime(),
  completed: z.boolean().default(false)
});

export type GameSession = z.infer<typeof GameSessionSchema>;

export class GameService {
  static async logGameSession(session: Omit<GameSession, 'id' | 'timestamp'>): Promise<GameSession | null> {
    try {
      const validatedSession = GameSessionSchema.omit({ id: true, timestamp: true }).parse(session);

      const { data, error } = await supabase
        .from('game_sessions')
        .insert({
          ...validatedSession,
          timestamp: new Date().toISOString()
        })
        .select()
        .single();

      if (error) throw error;
      return data;
    } catch (error) {
      console.error('Failed to log game session:', error);
      return null;
    }
  }

  static async getUserGameStats(userId: string, gameType?: GameSession['gameType']): Promise<{
    totalSessions: number;
    highestScore: number;
    averageScore: number;
    completedSessions: number;
  }> {
    try {
      let query = supabase
        .from('game_sessions')
        .select('*')
        .eq('user_id', userId);

      if (gameType) {
        query = query.eq('game_type', gameType);
      }

      const { data, error } = await query;

      if (error) throw error;

      return {
        totalSessions: data.length,
        highestScore: Math.max(...data.map(session => session.score), 0),
        averageScore: data.reduce((sum, session) => sum + session.score, 0) / (data.length || 1),
        completedSessions: data.filter(session => session.completed).length
      };
    } catch (error) {
      console.error('Failed to fetch game stats:', error);
      return {
        totalSessions: 0,
        highestScore: 0,
        averageScore: 0,
        completedSessions: 0
      };
    }
  }

  static async getLeaderboard(gameType: GameSession['gameType'], limit: number = 10): Promise<Array<{
    userId: string;
    username: string;
    highestScore: number;
  }>> {
    try {
      const { data, error } = await supabase.rpc('get_game_leaderboard', {
        p_game_type: gameType,
        p_limit: limit
      });

      if (error) throw error;
      return data || [];
    } catch (error) {
      console.error('Failed to fetch leaderboard:', error);
      return [];
    }
  }

  static async generateGameRecommendations(userId: string): Promise<Array<{
    recommended_game: GameSession['gameType'];
    reason: string;
  }>> {
    try {
      const { data, error } = await supabase.rpc('generate_game_recommendations', { p_user_id: userId });

      if (error) throw error;
      return data || [];
    } catch (error) {
      console.error('Failed to generate game recommendations:', error);
      return [];
    }
  }

  static async generateGameAsset(gameType: GameSession['gameType'], assetType: string): Promise<string | null> {
    try {
      const { data: urlData } = await supabase
        .storage
        .from('game-assets')
        .getPublicUrl(`${gameType}/${assetType}.png`);

      if (!urlData?.publicUrl) return null;

      // Pre-load and validate image
      return new Promise((resolve) => {
        const img = new Image();
        img.onload = () => resolve(urlData.publicUrl);
        img.onerror = () => resolve(null);
        img.src = urlData.publicUrl;
      });
    } catch (error) {
      console.error('Failed to generate game asset:', error);
      return null;
    }
  }
}