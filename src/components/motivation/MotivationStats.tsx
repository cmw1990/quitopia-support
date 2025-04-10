import { useQuery } from "@tanstack/react-query";
import { supabase } from "@/integrations/supabase/supabase-client";
import { Card } from "@/components/ui/card";
import { Progress } from "@/components/ui/progress";
import { Trophy, Star, Target, Flame } from "lucide-react";

export const MotivationStats = () => {
  const { data: stats } = useQuery({
    queryKey: ["motivationStats"],
    queryFn: async () => {
      const { data: streaks, error } = await supabase
        .from("motivation_streaks")
        .select("*")
        .single();

      if (error) throw error;
      return streaks;
    },
  });

  return (
    <Card className="p-6 space-y-6">
      <div className="flex items-center gap-3">
        <Flame className="h-6 w-6 text-red-500" />
        <h2 className="text-2xl font-semibold">Your Progress</h2>
      </div>

      <div className="grid gap-4">
        <div>
          <div className="flex items-center gap-2 mb-2">
            <Trophy className="h-5 w-5 text-yellow-500" />
            <span className="font-medium">Current Streak</span>
          </div>
          <Progress value={((stats?.current_streak || 0) / 30) * 100} />
          <p className="text-sm text-muted-foreground mt-1">
            {stats?.current_streak || 0} days
          </p>
        </div>

        <div>
          <div className="flex items-center gap-2 mb-2">
            <Star className="h-5 w-5 text-yellow-500" />
            <span className="font-medium">Best Streak</span>
          </div>
          <Progress value={((stats?.longest_streak || 0) / 30) * 100} />
          <p className="text-sm text-muted-foreground mt-1">
            {stats?.longest_streak || 0} days
          </p>
        </div>
      </div>
    </Card>
  );
};