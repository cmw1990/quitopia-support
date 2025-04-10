import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Trophy, Star, Target } from "lucide-react";
import { useQuery } from "@tanstack/react-query";
import { motion } from "framer-motion";
import { focusDb } from "@/lib/focus-db";

interface AchievementDetails {
  title: string;
  description?: string;
}

interface Achievement {
  id: string;
  achievement_type: string;
  points_earned: number;
  details: string;
  streak_count: number;
}

export const FocusAchievements = () => {
  const { data: achievements } = useQuery({
    queryKey: ['focus-achievements'],
    queryFn: () => focusDb.getAchievements(3)
  });

  const parseDetails = (detailsStr: string): AchievementDetails => {
    try {
      return JSON.parse(detailsStr);
    } catch {
      return { title: 'Achievement Unlocked!' };
    }
  };

  return (
    <Card className="bg-gradient-to-br from-yellow-50 to-orange-50 dark:from-yellow-900/20 dark:to-orange-900/20">
      <CardHeader>
        <CardTitle className="flex items-center gap-2">
          <Trophy className="h-5 w-5 text-yellow-500" />
          Recent Focus Achievements
        </CardTitle>
      </CardHeader>
      <CardContent>
        <div className="space-y-4">
          {achievements?.map((achievement, index) => (
            <motion.div
              key={achievement.id}
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ delay: index * 0.1 }}
            >
              <Card className="p-4">
                <div className="flex items-center gap-3">
                  <div className="p-2 rounded-full bg-yellow-100 dark:bg-yellow-900/30">
                    {achievement.achievement_type === 'streak' ? (
                      <Star className="h-4 w-4 text-yellow-500" />
                    ) : (
                      <Target className="h-4 w-4 text-yellow-500" />
                    )}
                  </div>
                  <div>
                    <p className="font-medium">
                      {parseDetails(achievement.details).title}
                    </p>
                    <p className="text-sm text-muted-foreground">+{achievement.points_earned} points</p>
                  </div>
                </div>
              </Card>
            </motion.div>
          ))}
        </div>
      </CardContent>
    </Card>
  );
};