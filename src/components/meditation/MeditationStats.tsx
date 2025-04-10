import { useQuery } from "@tanstack/react-query";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Progress } from "@/components/ui/progress";
import { useAuth } from "@/components/AuthProvider";
import { supabase } from "@/integrations/supabase/supabase-client";
import { Timer, Calendar, Target, Award } from "lucide-react";

export const MeditationStats = () => {
  const { session } = useAuth();

  const { data: stats } = useQuery({
    queryKey: ['meditation-stats'],
    queryFn: async () => {
      const today = new Date();
      const startOfWeek = new Date(today);
      startOfWeek.setDate(today.getDate() - today.getDay());

      const { data: progress, error } = await supabase
        .from('meditation_progress')
        .select('*')
        .eq('user_id', session?.user?.id)
        .gte('created_at', startOfWeek.toISOString());

      if (error) throw error;

      // Calculate stats
      const totalMinutes = progress?.reduce((sum, session) => 
        sum + (session.completed_duration || 0), 0) || 0;

      const completedSessions = progress?.length || 0;

      // Calculate streak
      const sessionsGroupedByDay = progress?.reduce((acc, session) => {
        const date = new Date(session.created_at).toDateString();
        acc[date] = (acc[date] || 0) + 1;
        return acc;
      }, {} as Record<string, number>);

      let currentStreak = 0;
      let date = new Date();

      while (sessionsGroupedByDay?.[date.toDateString()]) {
        currentStreak++;
        date.setDate(date.getDate() - 1);
      }

      // Weekly goal progress (assuming goal is 7 sessions per week)
      const weeklyGoalProgress = Math.min((completedSessions / 7) * 100, 100);

      return {
        totalMinutes,
        completedSessions,
        currentStreak,
        weeklyGoalProgress
      };
    },
    enabled: !!session?.user?.id,
  });

  return (
    <Card>
      <CardHeader>
        <CardTitle className="flex items-center gap-2">
          <Award className="h-5 w-5 text-primary" />
          Meditation Progress
        </CardTitle>
      </CardHeader>
      <CardContent>
        <div className="grid gap-4 md:grid-cols-2">
          <div className="flex items-center gap-4 p-4 rounded-lg bg-muted/50">
            <Timer className="h-8 w-8 text-primary" />
            <div>
              <p className="text-sm font-medium">Total Time</p>
              <h3 className="text-2xl font-bold">{stats?.totalMinutes || 0} mins</h3>
            </div>
          </div>

          <div className="flex items-center gap-4 p-4 rounded-lg bg-muted/50">
            <Calendar className="h-8 w-8 text-primary" />
            <div>
              <p className="text-sm font-medium">Current Streak</p>
              <h3 className="text-2xl font-bold">{stats?.currentStreak || 0} days</h3>
            </div>
          </div>

          <div className="flex items-center gap-4 p-4 rounded-lg bg-muted/50">
            <Award className="h-8 w-8 text-primary" />
            <div>
              <p className="text-sm font-medium">Sessions Completed</p>
              <h3 className="text-2xl font-bold">{stats?.completedSessions || 0}</h3>
            </div>
          </div>

          <div className="space-y-2 p-4 rounded-lg bg-muted/50">
            <div className="flex items-center justify-between">
              <div className="flex items-center gap-2">
                <Target className="h-4 w-4 text-primary" />
                <span className="text-sm font-medium">Weekly Goal</span>
              </div>
              <span className="text-sm text-muted-foreground">
                {stats?.completedSessions || 0}/7 sessions
              </span>
            </div>
            <Progress value={stats?.weeklyGoalProgress || 0} className="h-2" />
          </div>
        </div>
      </CardContent>
    </Card>
  );
};