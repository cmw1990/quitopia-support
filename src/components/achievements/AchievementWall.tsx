import { useQuery } from "@tanstack/react-query";
import { supabase } from "@/integrations/supabase/supabase-client";
import { Card, CardHeader, CardTitle, CardContent } from "@/components/ui/card";
import { AchievementCard } from "./AchievementCard";
import { Trophy } from "lucide-react";

export const AchievementWall = () => {
  const { data: achievements } = useQuery({
    queryKey: ['achievements'],
    queryFn: async () => {
      const { data: rules, error: rulesError } = await supabase
        .from('achievement_rules')
        .select('*');

      if (rulesError) throw rulesError;

      const { data: progress, error: progressError } = await supabase
        .from('achievement_progress')
        .select('*');

      if (progressError) throw progressError;

      return rules.map(rule => {
        const userProgress = progress?.find(p => p.achievement_id === rule.id);
        return {
          ...rule,
          progress: userProgress ? Math.min((userProgress.current_progress / rule.trigger_value) * 100, 100) : 0,
          unlocked: userProgress?.current_progress >= rule.trigger_value
        };
      });
    }
  });

  return (
    <Card className="w-full">
      <CardHeader>
        <CardTitle className="flex items-center gap-2">
          <Trophy className="h-5 w-5 text-primary" />
          Achievements
        </CardTitle>
      </CardHeader>
      <CardContent>
        <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-3">
          {achievements?.map((achievement) => (
            <AchievementCard
              key={achievement.id}
              title={achievement.name}
              description={achievement.description}
              icon={achievement.badge_icon || 'trophy'}
              progress={achievement.progress}
              points={achievement.points_reward}
              unlocked={achievement.unlocked}
            />
          ))}
        </div>
      </CardContent>
    </Card>
  );
};