import { useState } from 'react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Progress } from '@/components/ui/progress';
import { Badge } from '@/components/ui/badge';
import { Achievement } from '@/types/wellness';
import { useUser } from '@/lib/auth';

export function Dashboard() {
  const { user } = useUser();
  const [achievements, setAchievements] = useState<Achievement[]>([]);
  const [loading, setLoading] = useState(false);

  return (
    <div className="container mx-auto py-6">
      <Card>
        <CardHeader>
          <CardTitle>Achievements Dashboard</CardTitle>
        </CardHeader>
        <CardContent>
          <div className="space-y-6">
            {loading ? (
              <div className="flex justify-center">
                <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-primary"></div>
              </div>
            ) : achievements.length === 0 ? (
              <div className="text-center py-8">
                <p className="text-gray-500">Start your wellness journey to unlock achievements!</p>
              </div>
            ) : (
              <div className="grid gap-4 md:grid-cols-2">
                {achievements.map((achievement) => (
                  <Card key={achievement.id}>
                    <CardContent className="p-4">
                      <div className="flex items-start justify-between">
                        <div>
                          <h3 className="font-semibold">{achievement.title}</h3>
                          <p className="text-sm text-gray-500">{achievement.description}</p>
                        </div>
                        <Badge>{achievement.category}</Badge>
                      </div>
                      <div className="mt-4">
                        <Progress value={achievement.progress} />
                        <p className="text-sm text-gray-500 mt-1">
                          Progress: {achievement.progress}%
                        </p>
                      </div>
                      {achievement.milestones && (
                        <div className="mt-4">
                          <h4 className="text-sm font-medium mb-2">Milestones</h4>
                          <div className="space-y-2">
                            {achievement.milestones.map((milestone, index) => (
                              <div key={index} className="flex items-center">
                                <div className={`w-4 h-4 rounded-full mr-2 ${
                                  milestone.completed ? 'bg-green-500' : 'bg-gray-200'
                                }`} />
                                <span className="text-sm">{milestone.title}</span>
                              </div>
                            ))}
                          </div>
                        </div>
                      )}
                    </CardContent>
                  </Card>
                ))}
              </div>
            )}
          </div>
        </CardContent>
      </Card>
    </div>
  );
}

export default Dashboard;
