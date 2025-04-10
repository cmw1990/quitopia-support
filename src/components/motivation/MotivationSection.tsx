import { useState } from "react";
import { useQuery } from "@tanstack/react-query";
import { supabase } from "@/integrations/supabase/supabase-client";
import { Trophy, Star, Target, Flag } from "lucide-react";
import { Card } from "@/components/ui/card";
import { Progress } from "@/components/ui/progress";
import { useToast } from "@/hooks/use-toast";

export const MotivationSection = () => {
  const { toast } = useToast();
  const [dailyGoal, setDailyGoal] = useState("");

  const { data: quote } = useQuery({
    queryKey: ["motivationQuote"],
    queryFn: async () => {
      const { data, error } = await supabase
        .from("motivation_quotes")
        .select("*")
        .limit(1)
        .maybeSingle();

      if (error) throw error;
      return data;
    },
  });

  const { data: streaks } = useQuery({
    queryKey: ["exerciseStreaks"],
    queryFn: async () => {
      const { data, error } = await supabase
        .from("motivation_streaks")
        .select("*")
        .eq("streak_type", "exercise")
        .maybeSingle();

      if (error) throw error;
      
      // Return default values if no streak data exists
      return data || {
        current_streak: 0,
        longest_streak: 0,
        streak_type: "exercise"
      };
    },
  });

  return (
    <div className="space-y-6 animate-fade-in">
      {/* Motivational Quote */}
      <Card className="p-4 bg-gradient-to-r from-blue-50 to-purple-50 dark:from-blue-950 dark:to-purple-950">
        <p className="text-lg italic">{quote?.content || "Start your journey today!"}</p>
        <p className="text-sm text-muted-foreground mt-2">{quote?.author || "Mind Mate"}</p>
      </Card>

      {/* Exercise Streaks */}
      <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
        <Card className="p-4">
          <div className="flex items-center gap-2">
            <Trophy className="h-5 w-5 text-yellow-500" />
            <h3 className="font-semibold">Current Streak</h3>
          </div>
          <p className="text-2xl font-bold mt-2">{streaks?.current_streak || 0} days</p>
          <Progress value={((streaks?.current_streak || 0) / 30) * 100} className="mt-2" />
        </Card>

        <Card className="p-4">
          <div className="flex items-center gap-2">
            <Star className="h-5 w-5 text-yellow-500" />
            <h3 className="font-semibold">Best Streak</h3>
          </div>
          <p className="text-2xl font-bold mt-2">{streaks?.longest_streak || 0} days</p>
          <Progress value={((streaks?.longest_streak || 0) / 30) * 100} className="mt-2" />
        </Card>
      </div>

      {/* Goals Section */}
      <Card className="p-4">
        <div className="flex items-center gap-2 mb-4">
          <Target className="h-5 w-5 text-blue-500" />
          <h3 className="font-semibold">Exercise Goals</h3>
        </div>
        <div className="space-y-4">
          <div className="flex items-center gap-2">
            <Flag className="h-5 w-5 text-green-500" />
            <span>Complete 3 exercise sessions this week</span>
          </div>
          <Progress value={66} className="mt-2" />
        </div>
      </Card>
    </div>
  );
};