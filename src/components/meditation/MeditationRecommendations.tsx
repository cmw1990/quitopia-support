import { useQuery, useMutation } from "@tanstack/react-query";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Brain, Sparkles } from "lucide-react";
import { useAuth } from "@/components/AuthProvider";
import { supabase } from "@/integrations/supabase/supabase-client";
import { useToast } from "@/hooks/use-toast";
import { useState, useEffect } from "react";
import { MoodDisplay } from "./MoodDisplay";
import { SessionsList } from "./SessionsList";

type MeditationSession = {
  id: string;
  title: string;
  description: string | null;
  duration_minutes: number;
  type: string;
  difficulty_level: string;
  audio_url: string | null;
  background_image_url: string | null;
  created_at: string;
  updated_at: string;
};

export const MeditationRecommendations = () => {
  const { session } = useAuth();
  const { toast } = useToast();
  const [activeSession, setActiveSession] = useState<string | null>(null);
  const [sessionProgress, setSessionProgress] = useState(0);
  const [initialMood, setInitialMood] = useState<number | null>(null);
  const [generatingImageId, setGeneratingImageId] = useState<string | null>(null);

  const { data: recommendations } = useQuery({
    queryKey: ['meditation-recommendations'],
    queryFn: async () => {
      const [conditionsResponse, moodResponse, progressResponse] = await Promise.all([
        supabase
          .from('user_health_conditions')
          .select('conditions, needs_energy_support, needs_focus_support')
          .eq('user_id', session?.user?.id)
          .maybeSingle(),
        supabase
          .from('mood_logs')
          .select('mood_score, energy_level, stress_level')
          .eq('user_id', session?.user?.id)
          .order('created_at', { ascending: false })
          .limit(1)
          .maybeSingle(),
        supabase
          .from('meditation_progress')
          .select('created_at')
          .eq('user_id', session?.user?.id)
          .gte('created_at', new Date(Date.now() - 7 * 24 * 60 * 60 * 1000).toISOString())
      ]);

      const currentHour = new Date().getHours();
      let recommendedTypes = ['mindfulness'];
      let intensity = 'medium';

      if (moodResponse.data?.energy_level) {
        if (moodResponse.data.energy_level <= 3) intensity = 'light';
        else if (moodResponse.data.energy_level >= 8) intensity = 'strong';
      }

      if (currentHour >= 5 && currentHour < 11) {
        recommendedTypes = ['energy', 'focus'];
      } else if (currentHour >= 11 && currentHour < 17) {
        recommendedTypes = ['focus', 'stress-relief'];
      } else if (currentHour >= 17 && currentHour < 22) {
        recommendedTypes = ['stress-relief', 'sleep'];
      } else {
        recommendedTypes = ['sleep', 'mindfulness'];
      }

      let streak = 0;
      const progressSessions = progressResponse.data || [];
      let currentDate = new Date();
      
      for (const progressSession of progressSessions) {
        const sessionDate = new Date(progressSession.created_at).toDateString();
        if (sessionDate === currentDate.toDateString()) {
          streak++;
          currentDate.setDate(currentDate.getDate() - 1);
        } else {
          break;
        }
      }

      const { data: meditationSessions } = await supabase
        .from('meditation_sessions')
        .select('*')
        .in('type', recommendedTypes)
        .eq('difficulty_level', intensity)
        .order('duration_minutes');

      return {
        sessions: (meditationSessions || []) as MeditationSession[],
        streak,
        mood: moodResponse.data
      };
    },
    enabled: !!session?.user?.id,
  });

  const completeMeditationMutation = useMutation({
    mutationFn: async ({ sessionId, duration, moodAfter }: { sessionId: string, duration: number, moodAfter: number }) => {
      const { data: { user }, error: userError } = await supabase.auth.getUser();
      if (userError) throw userError;
      if (!user) throw new Error('User not authenticated');

      const { error } = await supabase
        .from('meditation_progress')
        .update({
          completed_duration: duration,
          mood_after: moodAfter
        })
        .eq('session_id', sessionId)
        .eq('user_id', user.id);

      if (error) throw error;
    },
    onSuccess: () => {
      toast({
        title: "Session Completed",
        description: "Great job! Your progress has been saved.",
      });
    },
    onError: (error) => {
      console.error('Error completing meditation:', error);
      toast({
        title: "Error Saving Progress",
        description: "Unable to save your meditation progress. Please try again.",
        variant: "destructive",
      });
    },
  });

  const startSessionMutation = useMutation({
    mutationFn: async (sessionId: string) => {
      const { data: { user }, error: userError } = await supabase.auth.getUser();
      if (userError) throw userError;
      if (!user) throw new Error('User not authenticated');

      const { data: currentMood } = await supabase
        .from('mood_logs')
        .select('mood_score')
        .eq('user_id', user.id)
        .order('created_at', { ascending: false })
        .limit(1)
        .single();

      const initialMoodScore = currentMood?.mood_score || null;
      setInitialMood(initialMoodScore);

      const { data, error } = await supabase
        .from('meditation_progress')
        .insert([{
          session_id: sessionId,
          user_id: user.id,
          completed_duration: 0,
          mood_before: initialMoodScore,
        }])
        .select()
        .single();

      if (error) throw error;
      return data;
    },
    onSuccess: (_, sessionId) => {
      const session = recommendations?.sessions.find(s => s.id === sessionId);
      setActiveSession(sessionId);
      setSessionProgress(0);
      
      toast({
        title: "Session Started",
        description: `Starting ${session?.title}. Find a comfortable position and follow along.`,
      });
    },
    onError: (error) => {
      console.error('Meditation session error:', error);
      toast({
        title: "Error Starting Session",
        description: "Unable to start meditation session. Please try again.",
        variant: "destructive",
      });
    },
  });

  const handleEndSession = async (moodAfter: number = 7) => {
    if (activeSession) {
      try {
        await completeMeditationMutation.mutateAsync({
          sessionId: activeSession,
          duration: sessionProgress,
          moodAfter
        });
      } catch (error) {
        console.error('Error ending session:', error);
      }
    }
    setActiveSession(null);
    setSessionProgress(0);
    setInitialMood(null);
  };

  const handleGenerateBackground = async (sessionId: string) => {
    if (!generatingImageId) {
      setGeneratingImageId(sessionId);
      try {
        const { error } = await supabase.functions.invoke('generate-meditation-backgrounds', {
          body: { sessionId },
        });
        if (error) throw error;
        toast({
          title: "Background Generated",
          description: "New meditation background has been created.",
        });
      } catch (error) {
        console.error('Background generation error:', error);
        toast({
          title: "Error Generating Background",
          description: "Unable to generate meditation background. Please try again.",
          variant: "destructive",
        });
      }
      setGeneratingImageId(null);
    }
  };

  // Update progress every minute
  useEffect(() => {
    let interval: NodeJS.Timeout;
    if (activeSession) {
      interval = setInterval(() => {
        setSessionProgress(prev => prev + 1);
      }, 60000); // Every minute
    }
    return () => {
      if (interval) {
        clearInterval(interval);
      }
    };
  }, [activeSession]);

  if (!recommendations?.sessions.length) return null;

  return (
    <Card>
      <CardHeader>
        <div className="flex items-center justify-between">
          <CardTitle className="flex items-center gap-2">
            <Brain className="h-5 w-5 text-primary" />
            Recommended Meditations
          </CardTitle>
          {recommendations.streak > 0 && (
            <div className="flex items-center gap-2 text-sm">
              <Sparkles className="h-4 w-4 text-yellow-500" />
              <span>{recommendations.streak} day streak!</span>
            </div>
          )}
        </div>
      </CardHeader>
      <CardContent>
        <div className="space-y-4">
          {recommendations.mood && (
            <MoodDisplay mood={recommendations.mood} />
          )}
          
          <SessionsList
            sessions={recommendations.sessions}
            activeSession={activeSession}
            sessionProgress={sessionProgress}
            generatingImageId={generatingImageId}
            onStartSession={(sessionId) => startSessionMutation.mutate(sessionId)}
            onEndSession={handleEndSession}
            onGenerateBackground={handleGenerateBackground}
          />
        </div>
      </CardContent>
    </Card>
  );
};
