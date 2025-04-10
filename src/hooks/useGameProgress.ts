import { useCallback } from 'react';
import { useAuth } from '@/components/AuthProvider';
import { supabase } from '@/integrations/supabase/supabase-client';
import type { GameProgress, GameStats, GameSession } from '@/types/brain-games';
import { useToast } from '@/components/ui/use-toast';

export function useGameProgress() {
  const { session } = useAuth();
  const { toast } = useToast();

  const saveProgress = useCallback(async (progress: GameProgress) => {
    if (!session?.user) {
      throw new Error('User must be authenticated to save progress');
    }

    const userId = session.user.id;
    progress.userId = userId;

    try {
      // Save progress
      const { error: progressError } = await supabase
        .from('game_progress')
        .insert(progress);

      if (progressError) throw progressError;

      // Update stats
      const { data: existingStats, error: statsError } = await supabase
        .from('game_stats')
        .select('*')
        .eq('user_id', userId)
        .eq('game_type', progress.gameId)
        .single();

      if (statsError && statsError.code !== 'PGRST116') {
        throw statsError;
      }

      const stats: Partial<GameStats> = {
        userId,
        gameType: progress.gameId as any,
        totalTimePlayed: (existingStats?.totalTimePlayed || 0) + progress.timeSpent,
        gamesCompleted: (existingStats?.gamesCompleted || 0) + 1,
        averageScore: existingStats 
          ? ((existingStats.averageScore * existingStats.gamesCompleted) + progress.score) / (existingStats.gamesCompleted + 1)
          : progress.score,
        highScore: existingStats
          ? Math.max(existingStats.highScore, progress.score)
          : progress.score,
        lastPlayed: new Date().toISOString(),
      };

      // Calculate improvement
      if (existingStats) {
        const recentScores = await supabase
          .from('game_progress')
          .select('score')
          .eq('user_id', userId)
          .eq('game_id', progress.gameId)
          .order('completed_at', { ascending: false })
          .limit(5);

        if (!recentScores.error && recentScores.data.length > 0) {
          const avgRecentScore = recentScores.data.reduce((acc, curr) => acc + curr.score, 0) / recentScores.data.length;
          stats.improvement = ((avgRecentScore - existingStats.averageScore) / existingStats.averageScore) * 100;
        }
      }

      // Update or insert stats
      const { error: upsertError } = await supabase
        .from('game_stats')
        .upsert({
          ...existingStats,
          ...stats,
        });

      if (upsertError) throw upsertError;

      // Check for achievements
      await checkAchievements(userId, progress);

      toast({
        title: "Progress Saved",
        description: `Score: ${progress.score} | Accuracy: ${Math.round(progress.accuracy)}%`,
      });

    } catch (error) {
      console.error('Error saving progress:', error);
      toast({
        title: "Error Saving Progress",
        description: "Please try again later",
        variant: "destructive",
      });
    }
  }, [session, toast]);

  const checkAchievements = useCallback(async (userId: string, progress: GameProgress) => {
    try {
      // Get game config
      const { data: gameConfig, error: configError } = await supabase
        .from('game_configs')
        .select('*')
        .eq('id', progress.gameId)
        .single();

      if (configError) throw configError;

      // Define achievement criteria
      const achievements = [
        {
          type: 'high_score',
          title: 'High Achiever',
          description: 'Score over 1000 points in a single game',
          criteria: { minScore: 1000 },
          check: () => progress.score >= 1000
        },
        {
          type: 'accuracy',
          title: 'Perfect Accuracy',
          description: 'Achieve 100% accuracy in a game',
          criteria: { minAccuracy: 100 },
          check: () => progress.accuracy === 100
        },
        {
          type: 'streak',
          title: 'Streak Master',
          description: 'Maintain a streak of 10 or more',
          criteria: { minStreak: 10 },
          check: () => progress.metrics.streaks >= 10
        }
      ];

      // Check each achievement
      for (const achievement of achievements) {
        const { data: existing } = await supabase
          .from('game_achievements')
          .select('*')
          .eq('user_id', userId)
          .eq('game_id', progress.gameId)
          .eq('type', achievement.type)
          .single();

        if (!existing && achievement.check()) {
          const { error: achievementError } = await supabase
            .from('game_achievements')
            .insert({
              userId,
              gameId: progress.gameId,
              type: achievement.type,
              title: achievement.title,
              description: achievement.description,
              criteria: achievement.criteria,
              unlockedAt: new Date().toISOString()
            });

          if (achievementError) throw achievementError;

          toast({
            title: "Achievement Unlocked!",
            description: achievement.title,
          });
        }
      }
    } catch (error) {
      console.error('Error checking achievements:', error);
    }
  }, [toast]);

  const startSession = useCallback(async (gameId: string, initialEnergy: number) => {
    if (!session?.user) {
      throw new Error('User must be authenticated to start a session');
    }

    try {
      const sessionData: Partial<GameSession> = {
        userId: session.user.id,
        gameId,
        initialEnergy,
        startTime: new Date().toISOString(),
      };

      const { data, error } = await supabase
        .from('game_sessions')
        .insert(sessionData)
        .select()
        .single();

      if (error) throw error;
      return data;
    } catch (error) {
      console.error('Error starting session:', error);
      throw error;
    }
  }, [session]);

  const endSession = useCallback(async (
    sessionId: string,
    {
      finalEnergy,
      moodAfter,
      focusLevel,
      stressLevel,
      notes
    }: {
      finalEnergy: number;
      moodAfter: string;
      focusLevel: number;
      stressLevel: number;
      notes?: string;
    }
  ) => {
    if (!session?.user) {
      throw new Error('User must be authenticated to end a session');
    }

    try {
      const { error } = await supabase
        .from('game_sessions')
        .update({
          endTime: new Date().toISOString(),
          finalEnergy,
          moodAfter,
          focusLevel,
          stressLevel,
          notes
        })
        .eq('id', sessionId);

      if (error) throw error;
    } catch (error) {
      console.error('Error ending session:', error);
      throw error;
    }
  }, [session]);

  return {
    saveProgress,
    startSession,
    endSession
  };
}
