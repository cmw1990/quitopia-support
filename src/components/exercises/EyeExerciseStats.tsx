
import { useQuery } from "@tanstack/react-query";
import { supabase } from "@/integrations/supabase/supabase-client";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Progress } from "@/components/ui/progress";
import { Timer, Award, Zap, Calendar } from "lucide-react";

export const EyeExerciseStats = () => {
  const { data: stats } = useQuery({
    queryKey: ["eye-exercise-stats"],
    queryFn: async () => {
      const { data, error } = await supabase
        .from("eye_exercise_stats")
        .select("*")
        .maybeSingle();

      if (error) throw error;
      return data;
    },
  });

  const formatDuration = (seconds: number) => {
    const hours = Math.floor(seconds / 3600);
    const minutes = Math.floor((seconds % 3600) / 60);
    if (hours > 0) {
      return `${hours}h ${minutes}m`;
    }
    return `${minutes}m`;
  };

  return (
    <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-4">
      <Card>
        <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
          <CardTitle className="text-sm font-medium">Total Exercises</CardTitle>
          <Timer className="h-4 w-4 text-muted-foreground" />
        </CardHeader>
        <CardContent>
          <div className="text-2xl font-bold">{stats?.total_exercises || 0}</div>
          <p className="text-xs text-muted-foreground">
            Total time: {formatDuration(stats?.total_duration_seconds || 0)}
          </p>
        </CardContent>
      </Card>

      <Card>
        <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
          <CardTitle className="text-sm font-medium">Current Streak</CardTitle>
          <Zap className="h-4 w-4 text-muted-foreground" />
        </CardHeader>
        <CardContent>
          <div className="text-2xl font-bold">{stats?.current_streak || 0} days</div>
          <Progress 
            value={((stats?.current_streak || 0) / 30) * 100} 
            className="mt-2"
          />
        </CardContent>
      </Card>

      <Card>
        <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
          <CardTitle className="text-sm font-medium">Longest Streak</CardTitle>
          <Award className="h-4 w-4 text-muted-foreground" />
        </CardHeader>
        <CardContent>
          <div className="text-2xl font-bold">{stats?.longest_streak || 0} days</div>
          <Progress 
            value={((stats?.longest_streak || 0) / 30) * 100} 
            className="mt-2"
          />
        </CardContent>
      </Card>

      <Card>
        <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
          <CardTitle className="text-sm font-medium">Effectiveness</CardTitle>
          <Calendar className="h-4 w-4 text-muted-foreground" />
        </CardHeader>
        <CardContent>
          <div className="text-2xl font-bold">
            {stats?.avg_effectiveness ? stats.avg_effectiveness.toFixed(1) : "N/A"}
          </div>
          {stats?.avg_effectiveness && (
            <Progress 
              value={(stats.avg_effectiveness / 5) * 100} 
              className="mt-2"
            />
          )}
        </CardContent>
      </Card>
    </div>
  );
};
