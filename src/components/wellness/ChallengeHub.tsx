import React from 'react';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Progress } from '@/components/ui/progress';
import { Badge } from '@/components/ui/badge';
import { api } from '@/lib/api';
import { useUser } from '@/hooks/useUser';
import { Trophy, Target, Calendar } from 'lucide-react';

export function ChallengeHub() {
  const { user } = useUser();
  const [challenges, setChallenges] = React.useState<any[]>([]);
  const [userChallenges, setUserChallenges] = React.useState<any[]>([]);
  const [loading, setLoading] = React.useState(true);

  React.useEffect(() => {
    if (user) {
      loadChallenges();
    }
  }, [user]);

  const loadChallenges = async () => {
    try {
      const [challengesResponse, userChallengesResponse] = await Promise.all([
        api.getChallenges(),
        api.getUserChallenges(user!.id)
      ]);
      setChallenges(challengesResponse.data || []);
      setUserChallenges(userChallengesResponse.data || []);
    } catch (error) {
      console.error('Error loading challenges:', error);
    } finally {
      setLoading(false);
    }
  };

  const joinChallenge = async (challengeId: string) => {
    if (!user) return;

    try {
      await api.joinChallenge(user.id, challengeId);
      loadChallenges();
    } catch (error) {
      console.error('Error joining challenge:', error);
    }
  };

  const updateProgress = async (userChallengeId: string, newProgress: number) => {
    try {
      const pointsEarned = Math.floor((newProgress / 100) * 1000); // Example points calculation
      await api.updateChallengeProgress(userChallengeId, newProgress, pointsEarned);
      loadChallenges();
    } catch (error) {
      console.error('Error updating progress:', error);
    }
  };

  const getDifficultyColor = (difficulty: string) => {
    switch (difficulty) {
      case 'beginner':
        return 'bg-green-100 text-green-800';
      case 'intermediate':
        return 'bg-yellow-100 text-yellow-800';
      case 'advanced':
        return 'bg-red-100 text-red-800';
      default:
        return 'bg-gray-100 text-gray-800';
    }
  };

  if (loading) {
    return <div>Loading challenges...</div>;
  }

  return (
    <div className="space-y-6">
      <Card>
        <CardHeader>
          <CardTitle>Active Challenges</CardTitle>
          <CardDescription>Track your ongoing wellness challenges</CardDescription>
        </CardHeader>
        <CardContent>
          <div className="space-y-4">
            {userChallenges.map(userChallenge => (
              <div
                key={userChallenge.id}
                className="border rounded-lg p-4 space-y-3"
              >
                <div className="flex items-center justify-between">
                  <div>
                    <h3 className="font-medium">{userChallenge.challenge.title}</h3>
                    <p className="text-sm text-gray-500">
                      {userChallenge.challenge.description}
                    </p>
                  </div>
                  <Badge
                    className={getDifficultyColor(userChallenge.challenge.difficulty)}
                  >
                    {userChallenge.challenge.difficulty}
                  </Badge>
                </div>

                <div className="space-y-2">
                  <div className="flex justify-between text-sm">
                    <span>Progress</span>
                    <span>{userChallenge.progress}%</span>
                  </div>
                  <Progress value={userChallenge.progress} />
                </div>

                <div className="flex items-center justify-between text-sm">
                  <div className="flex items-center space-x-2">
                    <Trophy className="w-4 h-4" />
                    <span>{userChallenge.points_earned} points</span>
                  </div>
                  <div className="flex items-center space-x-2">
                    <Calendar className="w-4 h-4" />
                    <span>
                      {new Date(userChallenge.challenge.end_date).toLocaleDateString()}
                    </span>
                  </div>
                </div>

                <Button
                  onClick={() => updateProgress(userChallenge.id, Math.min(userChallenge.progress + 10, 100))}
                  className="w-full"
                >
                  Update Progress
                </Button>
              </div>
            ))}
          </div>
        </CardContent>
      </Card>

      <Card>
        <CardHeader>
          <CardTitle>Available Challenges</CardTitle>
          <CardDescription>Join new wellness challenges</CardDescription>
        </CardHeader>
        <CardContent>
          <div className="grid gap-4 md:grid-cols-2">
            {challenges
              .filter(challenge => !userChallenges.some(uc => uc.challenge_id === challenge.id))
              .map(challenge => (
                <Card key={challenge.id}>
                  <CardHeader>
                    <div className="flex items-center justify-between">
                      <CardTitle className="text-lg">{challenge.title}</CardTitle>
                      <Badge className={getDifficultyColor(challenge.difficulty)}>
                        {challenge.difficulty}
                      </Badge>
                    </div>
                    <CardDescription>{challenge.description}</CardDescription>
                  </CardHeader>
                  <CardContent>
                    <div className="space-y-4">
                      <div className="flex items-center justify-between text-sm">
                        <div className="flex items-center space-x-2">
                          <Target className="w-4 h-4" />
                          <span>{challenge.points} points</span>
                        </div>
                        <div className="flex items-center space-x-2">
                          <Calendar className="w-4 h-4" />
                          <span>{challenge.duration_days} days</span>
                        </div>
                      </div>
                      <Button
                        onClick={() => joinChallenge(challenge.id)}
                        className="w-full"
                      >
                        Join Challenge
                      </Button>
                    </div>
                  </CardContent>
                </Card>
              ))}
          </div>
        </CardContent>
      </Card>
    </div>
  );
}
