import React from 'react';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { api } from '@/lib/api';
import { useUser } from '@/hooks/useUser';
import { Trophy, Star, Award } from 'lucide-react';
import { motion } from 'framer-motion';
import './AchievementsWall.css';

const CATEGORY_ICONS = {
  energy: '⚡️',
  sleep: '😴',
  nutrition: '🥗',
  mindfulness: '🧘',
  fitness: '💪'
};

export function AchievementsWall() {
  const { user } = useUser();
  const [achievements, setAchievements] = React.useState<any[]>([]);
  const [loading, setLoading] = React.useState(true);
  const [totalPoints, setTotalPoints] = React.useState(0);

  React.useEffect(() => {
    if (user) {
      loadAchievements();
    }
  }, [user]);

  const loadAchievements = async () => {
    try {
      const { data } = await api.getAchievements(user!.id);
      setAchievements(data || []);
      setTotalPoints(data?.reduce((sum: number, a: any) => sum + a.points, 0) || 0);
    } catch (error) {
      console.error('Error loading achievements:', error);
    } finally {
      setLoading(false);
    }
  };

  const getLevel = (points: number) => {
    return Math.floor(points / 1000) + 1;
  };

  const getProgress = (points: number) => {
    return (points % 1000) / 10; // Convert to percentage
  };

  if (loading) {
    return <div>Loading achievements...</div>;
  }

  return (
    <div className="space-y-6">
      <Card>
        <CardHeader>
          <div className="flex items-center justify-between">
            <div>
              <CardTitle>Your Achievements</CardTitle>
              <CardDescription>Track your wellness milestones</CardDescription>
            </div>
            <div className="text-right">
              <div className="text-2xl font-bold">{totalPoints}</div>
              <div className="text-sm text-gray-500">Total Points</div>
            </div>
          </div>
        </CardHeader>
        <CardContent>
          <div className="space-y-4">
            <div className="p-4 border rounded-lg bg-gradient-to-r from-purple-50 to-pink-50">
              <div className="flex items-center justify-between mb-2">
                <div className="flex items-center space-x-2">
                  <Trophy className="w-5 h-5 text-purple-500" />
                  <span className="font-medium">Level {getLevel(totalPoints)}</span>
                </div>
                <Badge variant="secondary">
                  {totalPoints} / {getLevel(totalPoints) * 1000} XP
                </Badge>
              </div>
              <div className="w-full progress-bar">
                <div
                  className={`progress-bar-fill w-[${getProgress(totalPoints)}%]`}
                />
              </div>
            </div>

            <div className="grid gap-4 md:grid-cols-2">
              {achievements.map((achievement, index) => (
                <motion.div
                  key={achievement.id}
                  initial={{ opacity: 0, y: 20 }}
                  animate={{ opacity: 1, y: 0 }}
                  transition={{ delay: index * 0.1 }}
                >
                  <Card>
                    <CardContent className="pt-6">
                      <div className="flex items-start space-x-4">
                        <div className="flex-shrink-0 w-12 h-12 flex items-center justify-center rounded-full bg-gradient-to-r from-indigo-500 to-purple-500 text-white">
                          <span className="text-xl">
                            {CATEGORY_ICONS[achievement.category as keyof typeof CATEGORY_ICONS]}
                          </span>
                        </div>
                        <div className="flex-1">
                          <h3 className="font-medium">{achievement.title}</h3>
                          <p className="text-sm text-gray-500">
                            {achievement.description}
                          </p>
                          <div className="mt-2 flex items-center space-x-2 text-sm">
                            <Star className="w-4 h-4 text-yellow-500" />
                            <span>{achievement.points} points</span>
                            <span className="text-gray-300">•</span>
                            <span className="text-gray-500">
                              {new Date(achievement.achieved_at).toLocaleDateString()}
                            </span>
                          </div>
                        </div>
                      </div>
                    </CardContent>
                  </Card>
                </motion.div>
              ))}
            </div>
          </div>
        </CardContent>
      </Card>

      <Card>
        <CardHeader>
          <CardTitle>Achievement Categories</CardTitle>
          <CardDescription>Your progress in different areas</CardDescription>
        </CardHeader>
        <CardContent>
          <div className="grid gap-4 md:grid-cols-3">
            {Object.entries(CATEGORY_ICONS).map(([category, icon]) => {
              const categoryAchievements = achievements.filter(a => a.category === category);
              const categoryPoints = categoryAchievements.reduce((sum, a) => sum + a.points, 0);
              
              return (
                <Card key={category}>
                  <CardContent className="pt-6">
                    <div className="text-center">
                      <div className="text-3xl mb-2">{icon}</div>
                      <div className="font-medium capitalize">{category}</div>
                      <div className="text-sm text-gray-500">
                        {categoryAchievements.length} achievements
                      </div>
                      <div className="mt-2 font-bold text-purple-600">
                        {categoryPoints} points
                      </div>
                    </div>
                  </CardContent>
                </Card>
              );
            })}
          </div>
        </CardContent>
      </Card>
    </div>
  );
}
