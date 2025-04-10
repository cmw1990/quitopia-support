import { useEffect, useState } from 'react';
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Progress } from '@/components/ui/progress';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { useToast } from '@/components/ui/use-toast';
import { 
  getUserPoints, 
  getPointsTransactions, 
  getActiveChallenges,
  getUserChallenges,
  getAvailableSubscriptionRewards,
  joinChallenge
} from '@/lib/points-db';
import type { 
  UserPoints, 
  PointsTransaction, 
  Challenge,
  ChallengeParticipant,
  SubscriptionReward 
} from '@/types/points';
import { formatDistanceToNow, format } from 'date-fns';
import { Trophy, Target, Flame, Gift, History, Award } from 'lucide-react';

export function PointsDashboard() {
  const [userPoints, setUserPoints] = useState<UserPoints | null>(null);
  const [transactions, setTransactions] = useState<PointsTransaction[]>([]);
  const [activeChallenges, setActiveChallenges] = useState<Challenge[]>([]);
  const [userChallenges, setUserChallenges] = useState<{
    challenge: Challenge;
    participation: ChallengeParticipant;
  }[]>([]);
  const [subscriptionRewards, setSubscriptionRewards] = useState<SubscriptionReward[]>([]);
  const [loading, setLoading] = useState(true);
  const { toast } = useToast();

  useEffect(() => {
    loadPointsData();
  }, []);

  async function loadPointsData() {
    try {
      const [points, history, challenges, userChallenges, rewards] = await Promise.all([
        getUserPoints(),
        getPointsTransactions(),
        getActiveChallenges(),
        getUserChallenges(),
        getAvailableSubscriptionRewards()
      ]);
      setUserPoints(points);
      setTransactions(history);
      setActiveChallenges(challenges);
      setUserChallenges(userChallenges);
      setSubscriptionRewards(rewards);
    } catch (error) {
      toast({
        title: 'Error',
        description: 'Failed to load points data',
        variant: 'destructive',
      });
    } finally {
      setLoading(false);
    }
  }

  async function handleJoinChallenge(challengeId: string) {
    try {
      await joinChallenge(challengeId);
      toast({
        title: 'Success',
        description: 'Successfully joined the challenge!'
      });
      loadPointsData();
    } catch (error) {
      toast({
        title: 'Error',
        description: 'Failed to join challenge',
        variant: 'destructive',
      });
    }
  }

  if (loading) {
    return (
      <div className="flex justify-center items-center h-64">
        <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-primary"></div>
      </div>
    );
  }

  return (
    <div className="space-y-6">
      {/* Points Summary */}
      <Card>
        <CardHeader>
          <CardTitle>Your Points Summary</CardTitle>
          <CardDescription>Track your progress and rewards</CardDescription>
        </CardHeader>
        <CardContent className="space-y-4">
          <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
            <div className="flex flex-col space-y-2">
              <span className="text-sm text-gray-500">Total Points</span>
              <span className="text-2xl font-bold">{userPoints?.totalPoints}</span>
            </div>
            <div className="flex flex-col space-y-2">
              <span className="text-sm text-gray-500">Current Streak</span>
              <div className="flex items-center space-x-2">
                <Flame className="h-5 w-5 text-orange-500" />
                <span className="text-2xl font-bold">{userPoints?.currentStreak} days</span>
              </div>
            </div>
            <div className="flex flex-col space-y-2">
              <span className="text-sm text-gray-500">Streak Multiplier</span>
              <span className="text-2xl font-bold">{userPoints?.streakMultiplier}x</span>
            </div>
          </div>

          <div className="space-y-2">
            <div className="flex justify-between text-sm">
              <span>Level {userPoints?.level}</span>
              <span>{userPoints?.totalPoints} / {userPoints?.nextLevelPoints}</span>
            </div>
            <Progress value={(userPoints?.totalPoints || 0) / (userPoints?.nextLevelPoints || 1) * 100} />
          </div>
        </CardContent>
      </Card>

      <Tabs defaultValue="challenges">
        <TabsList className="grid grid-cols-4 gap-4">
          <TabsTrigger value="challenges">
            <Trophy className="h-4 w-4 mr-2" />
            Challenges
          </TabsTrigger>
          <TabsTrigger value="rewards">
            <Gift className="h-4 w-4 mr-2" />
            Rewards
          </TabsTrigger>
          <TabsTrigger value="goals">
            <Target className="h-4 w-4 mr-2" />
            Goals
          </TabsTrigger>
          <TabsTrigger value="history">
            <History className="h-4 w-4 mr-2" />
            History
          </TabsTrigger>
        </TabsList>

        {/* Challenges Tab */}
        <TabsContent value="challenges" className="space-y-4">
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            {activeChallenges.map(challenge => {
              const userParticipation = userChallenges.find(
                uc => uc.challenge.id === challenge.id
              );
              return (
                <Card key={challenge.id}>
                  <CardHeader>
                    <CardTitle>{challenge.title}</CardTitle>
                    <CardDescription>{challenge.description}</CardDescription>
                  </CardHeader>
                  <CardContent className="space-y-4">
                    <div className="flex justify-between text-sm">
                      <span>Progress</span>
                      <span>
                        {userParticipation?.participation.currentSteps || 0} / {challenge.requiredSteps} steps
                      </span>
                    </div>
                    <Progress 
                      value={((userParticipation?.participation.currentSteps || 0) / challenge.requiredSteps) * 100} 
                    />
                    <div className="flex justify-between items-center">
                      <div className="flex items-center space-x-2">
                        <Award className="h-5 w-5 text-yellow-500" />
                        <span>{challenge.rewardPoints} points</span>
                      </div>
                      {!userParticipation && (
                        <Button onClick={() => handleJoinChallenge(challenge.id)}>
                          Join Challenge
                        </Button>
                      )}
                    </div>
                  </CardContent>
                </Card>
              );
            })}
          </div>
        </TabsContent>

        {/* Rewards Tab */}
        <TabsContent value="rewards" className="space-y-4">
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            {subscriptionRewards.map(reward => (
              <Card key={reward.id}>
                <CardHeader>
                  <CardTitle>{reward.title}</CardTitle>
                  <CardDescription>{reward.description}</CardDescription>
                </CardHeader>
                <CardContent className="space-y-4">
                  <div className="flex justify-between items-center">
                    <div className="flex items-center space-x-2">
                      <Target className="h-5 w-5 text-primary" />
                      <span>{reward.requiredSteps} steps required</span>
                    </div>
                    <div className="text-sm text-gray-500">
                      Expires {format(new Date(reward.validUntil || ''), 'PP')}
                    </div>
                  </div>
                  <div className="flex justify-between items-center">
                    <span className="text-sm font-medium">
                      {reward.rewardType === 'discount' && `${reward.rewardValue}% off`}
                      {reward.rewardType === 'free_trial' && `${reward.rewardValue} days free`}
                      {reward.rewardType === 'free_month' && 'Free Month'}
                    </span>
                    <Button variant="outline">Claim Reward</Button>
                  </div>
                </CardContent>
              </Card>
            ))}
          </div>
        </TabsContent>

        {/* Goals Tab */}
        <TabsContent value="goals" className="space-y-4">
          <Card>
            <CardHeader>
              <CardTitle>Weekly Goal</CardTitle>
            </CardHeader>
            <CardContent className="space-y-4">
              <div className="flex justify-between text-sm">
                <span>Progress</span>
                <span>{userPoints?.weeklyProgress} / {userPoints?.weeklyGoal} steps</span>
              </div>
              <Progress 
                value={(userPoints?.weeklyProgress || 0) / (userPoints?.weeklyGoal || 1) * 100} 
              />
            </CardContent>
          </Card>

          <Card>
            <CardHeader>
              <CardTitle>Monthly Goal</CardTitle>
            </CardHeader>
            <CardContent className="space-y-4">
              <div className="flex justify-between text-sm">
                <span>Progress</span>
                <span>{userPoints?.monthlyProgress} / {userPoints?.monthlyGoal} steps</span>
              </div>
              <Progress 
                value={(userPoints?.monthlyProgress || 0) / (userPoints?.monthlyGoal || 1) * 100} 
              />
            </CardContent>
          </Card>
        </TabsContent>

        {/* History Tab */}
        <TabsContent value="history">
          <Card>
            <CardHeader>
              <CardTitle>Points History</CardTitle>
            </CardHeader>
            <CardContent>
              <div className="space-y-4">
                {transactions.map(transaction => (
                  <div key={transaction.id} className="flex justify-between items-center py-2 border-b">
                    <div>
                      <p className="font-medium">{transaction.description}</p>
                      <p className="text-sm text-gray-500">
                        {formatDistanceToNow(new Date(transaction.createdAt), { addSuffix: true })}
                      </p>
                    </div>
                    <span className={transaction.type === 'spent' ? 'text-red-500' : 'text-green-500'}>
                      {transaction.type === 'spent' ? '-' : '+'}
                      {transaction.amount} points
                    </span>
                  </div>
                ))}
              </div>
            </CardContent>
          </Card>
        </TabsContent>
      </Tabs>
    </div>
  );
}

export default PointsDashboard;
