import React, { useState, useEffect } from 'react';
import { 
  Card, CardContent, CardDescription, CardFooter, CardHeader, CardTitle 
} from './ui/card';
import { Button } from './ui/button';
import { Badge } from './ui/badge';
import { Progress } from './ui/progress';
import { Tabs, TabsContent, TabsList, TabsTrigger } from './ui/tabs';
import { Check, Trophy, Users, Calendar, Clock, AlertCircle } from 'lucide-react';
import { toast } from 'sonner';
import { useAuth } from '../hooks/useAuth';
import { 
  Challenge, 
  ChallengeTask, 
  UserProgress, 
  getAllChallenges, 
  getChallengeTasks, 
  getAllUserProgress,
  joinChallenge as apiJoinChallenge,
  completeTask as apiCompleteTask,
  checkChallengeCompletion,
  awardChallengePoints
} from '../api/challengeApiClient';

// Simple skeleton component to avoid import issues
const SkeletonItem = ({ className }: { className: string }) => (
  <div className={`animate-pulse bg-muted ${className}`}></div>
);

export default function CommunityChallenges(): JSX.Element {
  const { session, user } = useAuth();
  const [activeChallenges, setActiveChallenges] = useState<Challenge[]>([]);
  const [completedChallenges, setCompletedChallenges] = useState<Challenge[]>([]);
  const [upcomingChallenges, setUpcomingChallenges] = useState<Challenge[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [selectedChallenge, setSelectedChallenge] = useState<Challenge | null>(null);
  const [userProgress, setUserProgress] = useState<Record<string, UserProgress>>({});
  const [activeTab, setActiveTab] = useState('active');

  useEffect(() => {
    fetchChallenges();
  }, [session]);

  const fetchChallenges = async () => {
    setIsLoading(true);
    try {
      if (!session || !user) {
        console.error('No authenticated user');
        setIsLoading(false);
        return;
      }
      
      const userId = user.id;
      
      // Fetch all challenges
      const challenges = await getAllChallenges();
      
      // Fetch challenge tasks
      const tasksPromises = challenges.map(challenge => 
        getChallengeTasks(challenge.id)
      );
      const tasksResults = await Promise.all(tasksPromises);
      
      // Assign tasks to each challenge
      challenges.forEach((challenge, index) => {
        challenge.tasks = tasksResults[index];
      });
      
      // Fetch user progress
      const progressData = await getAllUserProgress(userId);
      
      // Create a map of user progress by challenge_id
      const progressMap: Record<string, UserProgress> = {};
      progressData.forEach((progress: UserProgress) => {
        progressMap[progress.challenge_id] = progress;
      });
      setUserProgress(progressMap);

      // Process challenges and categorize them
      const now = new Date();
      const active: Challenge[] = [];
      const completed: Challenge[] = [];
      const upcoming: Challenge[] = [];

      challenges.forEach((challenge: Challenge) => {
        const startDate = new Date(challenge.start_date);
        const endDate = new Date(challenge.end_date);
        
        // Check if user has completed this challenge
        const progress = progressMap[challenge.id];
        
        if (progress && progress.status === 'completed') {
          completed.push(challenge);
        } else if (now < startDate) {
          upcoming.push(challenge);
        } else if (now >= startDate && now <= endDate) {
          active.push(challenge);
        }
      });

      setActiveChallenges(active);
      setCompletedChallenges(completed);
      setUpcomingChallenges(upcoming);
    } catch (error) {
      console.error('Error fetching challenges:', error);
      toast.error('Failed to load challenges');
    } finally {
      setIsLoading(false);
    }
  };

  const joinChallenge = async (challengeId: string) => {
    try {
      if (!user) {
        toast.error('You need to be logged in to join a challenge');
        return;
      }

      const progress = await apiJoinChallenge(user.id, challengeId);
      
      // Update the userProgress state
      setUserProgress(prev => ({
        ...prev,
        [challengeId]: progress
      }));

      toast.success('Successfully joined the challenge!');
      fetchChallenges(); // Refresh data
    } catch (error) {
      console.error('Error joining challenge:', error);
      toast.error('Failed to join challenge');
    }
  };

  const completeTask = async (challengeId: string, taskId: string) => {
    try {
      const progress = userProgress[challengeId];
      if (!progress || !progress.id) {
        toast.error('You must join this challenge first');
        return;
      }

      const completedTasks = [...progress.completed_tasks];
      const taskIndex = completedTasks.indexOf(taskId);
      
      // Toggle task completion status
      if (taskIndex === -1) {
        completedTasks.push(taskId);
      } else {
        completedTasks.splice(taskIndex, 1);
      }

      // Update task completion
      const updatedProgress = await apiCompleteTask(progress.id, taskId, completedTasks);
      
      // Check if all tasks are completed
      const allTasksCompleted = await checkChallengeCompletion(
        progress.id, 
        challengeId, 
        updatedProgress.completed_tasks
      );
      
      // If all tasks are completed, award points to user
      if (allTasksCompleted) {
        const challenge = [...activeChallenges, ...upcomingChallenges, ...completedChallenges]
          .find(c => c.id === challengeId);
          
        if (challenge) {
          await awardChallengePoints(user.id, challenge.reward_points);
          toast.success(`Challenge completed! You earned ${challenge.reward_points} points!`);
        }
      } else {
        toast.success('Task status updated!');
      }

      // Update local state
      setUserProgress(prev => ({
        ...prev,
        [challengeId]: updatedProgress
      }));

      // Refresh data to ensure everything is up to date
      fetchChallenges();
    } catch (error) {
      console.error('Error updating task:', error);
      toast.error('Failed to update task status');
    }
  };

  const calculateProgress = (challenge: Challenge): number => {
    const progress = userProgress[challenge.id];
    if (!progress || !challenge.tasks || challenge.tasks.length === 0) return 0;
    
    return Math.round((progress.completed_tasks.length / challenge.tasks.length) * 100);
  };

  const getDifficultyColor = (difficulty: string): string => {
    switch (difficulty) {
      case 'easy': return 'bg-green-500';
      case 'medium': return 'bg-yellow-500';
      case 'hard': return 'bg-red-500';
      default: return 'bg-blue-500';
    }
  };

  const getTimeRemaining = (endDate: string): string => {
    const end = new Date(endDate);
    const now = new Date();
    const diffTime = Math.abs(end.getTime() - now.getTime());
    const diffDays = Math.ceil(diffTime / (1000 * 60 * 60 * 24));
    
    if (diffDays === 1) return '1 day';
    return `${diffDays} days`;
  };

  const handleChallengeClick = (challenge: Challenge) => {
    setSelectedChallenge(challenge);
  };

  const handleBackClick = () => {
    setSelectedChallenge(null);
  };
  
  const handleTabChange = (value: string) => {
    setActiveTab(value);
  };

  // Render challenge detail view
  if (selectedChallenge) {
    const progress = userProgress[selectedChallenge.id];
    const progressPercent = calculateProgress(selectedChallenge);
    const hasJoined = Boolean(progress);
    
    return (
      <div className="container mx-auto p-4">
        <Button variant="ghost" onClick={handleBackClick} className="mb-4">
          ← Back to Challenges
        </Button>
        
        <Card className="mb-6">
          <CardHeader>
            <div className="flex justify-between items-center">
              <div>
                <CardTitle className="text-2xl">{selectedChallenge.title}</CardTitle>
                <CardDescription>{selectedChallenge.description}</CardDescription>
              </div>
              <Badge className={`${getDifficultyColor(selectedChallenge.difficulty)} text-white`}>
                {selectedChallenge.difficulty.charAt(0).toUpperCase() + selectedChallenge.difficulty.slice(1)}
              </Badge>
            </div>
          </CardHeader>
          
          <CardContent>
            <div className="flex justify-between items-center mb-4">
              <div className="flex items-center">
                <Users className="mr-2 h-5 w-5 text-muted-foreground" />
                <span>{selectedChallenge.participants_count} participants</span>
              </div>
              
              <div className="flex items-center">
                <Clock className="mr-2 h-5 w-5 text-muted-foreground" />
                <span>Ends in {getTimeRemaining(selectedChallenge.end_date)}</span>
              </div>
              
              <div className="flex items-center">
                <Trophy className="mr-2 h-5 w-5 text-muted-foreground" />
                <span>{selectedChallenge.reward_points} points</span>
              </div>
            </div>
            
            {hasJoined && (
              <div className="mb-6">
                <div className="flex justify-between mb-2">
                  <span>Your progress</span>
                  <span>{progressPercent}%</span>
                </div>
                <Progress value={progressPercent} className="h-2" />
              </div>
            )}
            
            <div className="mt-6">
              <h3 className="text-lg font-medium mb-4">Challenge Tasks</h3>
              <div className="space-y-3">
                {selectedChallenge.tasks?.map(task => (
                  <div 
                    key={task.id} 
                    className="flex items-center justify-between p-3 border rounded-md"
                  >
                    <div className="flex items-center">
                      {hasJoined && (
                        <div 
                          className={`w-5 h-5 rounded border mr-3 flex items-center justify-center ${
                            progress?.completed_tasks.includes(task.id) 
                              ? 'bg-primary border-primary' 
                              : 'border-gray-300'
                          }`}
                          onClick={() => hasJoined && completeTask(selectedChallenge.id, task.id)}
                          role="checkbox"
                          aria-checked={progress?.completed_tasks.includes(task.id)}
                          tabIndex={0}
                          onKeyDown={(e) => {
                            if (e.key === 'Enter' || e.key === ' ') {
                              hasJoined && completeTask(selectedChallenge.id, task.id);
                            }
                          }}
                        >
                          {progress?.completed_tasks.includes(task.id) && (
                            <Check className="h-4 w-4 text-white" />
                          )}
                        </div>
                      )}
                      <span>{task.description}</span>
                    </div>
                    <Badge variant="outline">{task.points} pts</Badge>
                  </div>
                ))}
              </div>
            </div>
          </CardContent>
          
          <CardFooter>
            {!hasJoined ? (
              <Button 
                className="w-full" 
                onClick={() => joinChallenge(selectedChallenge.id)}
              >
                Join Challenge
              </Button>
            ) : progress?.status === 'completed' ? (
              <Button disabled className="w-full bg-green-600">
                Challenge Completed!
              </Button>
            ) : (
              <Button disabled={progressPercent === 100} className="w-full">
                {progressPercent === 100 ? 'All Tasks Completed!' : 'Continue Challenge'}
              </Button>
            )}
          </CardFooter>
        </Card>
      </div>
    );
  }

  // Render challenges list view
  return (
    <div className="container mx-auto p-4">
      <div className="mb-6">
        <h1 className="text-3xl font-bold mb-2">Community Challenges</h1>
        <p className="text-muted-foreground">
          Join challenges with the community to stay motivated on your quit smoking journey.
        </p>
      </div>
      
      <Tabs defaultValue="active" value={activeTab} onValueChange={handleTabChange}>
        <TabsList className="mb-4">
          <TabsTrigger value="active">Active</TabsTrigger>
          <TabsTrigger value="upcoming">Upcoming</TabsTrigger>
          <TabsTrigger value="completed">Completed</TabsTrigger>
        </TabsList>
        
        <TabsContent value="active">
          {isLoading ? (
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
              {[1, 2, 3].map(i => (
                <Card key={i} className="overflow-hidden">
                  <CardHeader>
                    <SkeletonItem className="h-8 w-3/4 mb-2" />
                    <SkeletonItem className="h-4 w-full" />
                  </CardHeader>
                  <CardContent>
                    <SkeletonItem className="h-20 w-full mb-4" />
                    <SkeletonItem className="h-4 w-2/3" />
                  </CardContent>
                  <CardFooter>
                    <SkeletonItem className="h-10 w-full" />
                  </CardFooter>
                </Card>
              ))}
            </div>
          ) : activeChallenges.length === 0 ? (
            <div className="text-center p-8">
              <AlertCircle className="mx-auto h-12 w-12 text-muted-foreground mb-4" />
              <h3 className="text-lg font-medium">No active challenges</h3>
              <p className="text-muted-foreground">Check back later or view upcoming challenges.</p>
            </div>
          ) : (
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
              {activeChallenges.map(challenge => {
                const progress = userProgress[challenge.id];
                const progressPercent = calculateProgress(challenge);
                const hasJoined = Boolean(progress);
                
                return (
                  <Card key={challenge.id} className="overflow-hidden">
                    <CardHeader>
                      <div className="flex justify-between items-start">
                        <CardTitle className="text-xl mb-2">{challenge.title}</CardTitle>
                        <Badge className={`${getDifficultyColor(challenge.difficulty)} text-white`}>
                          {challenge.difficulty.charAt(0).toUpperCase() + challenge.difficulty.slice(1)}
                        </Badge>
                      </div>
                      <CardDescription>{challenge.description}</CardDescription>
                    </CardHeader>
                    
                    <CardContent>
                      <div className="flex justify-between mb-4 text-sm">
                        <div className="flex items-center">
                          <Users className="mr-1 h-4 w-4 text-muted-foreground" />
                          <span>{challenge.participants_count}</span>
                        </div>
                        <div className="flex items-center">
                          <Clock className="mr-1 h-4 w-4 text-muted-foreground" />
                          <span>{getTimeRemaining(challenge.end_date)}</span>
                        </div>
                        <div className="flex items-center">
                          <Trophy className="mr-1 h-4 w-4 text-muted-foreground" />
                          <span>{challenge.reward_points} pts</span>
                        </div>
                      </div>
                      
                      {hasJoined && (
                        <div className="mb-4">
                          <div className="flex justify-between mb-1 text-sm">
                            <span>Your progress</span>
                            <span>{progressPercent}%</span>
                          </div>
                          <Progress value={progressPercent} className="h-2" />
                        </div>
                      )}
                      
                      <div className="mt-4">
                        <Button 
                          variant="outline" 
                          className="w-full"
                          onClick={() => handleChallengeClick(challenge)}
                        >
                          View Details
                        </Button>
                      </div>
                    </CardContent>
                    
                    <CardFooter>
                      {!hasJoined ? (
                        <Button 
                          className="w-full" 
                          onClick={() => joinChallenge(challenge.id)}
                        >
                          Join Challenge
                        </Button>
                      ) : progress?.status === 'completed' ? (
                        <Button disabled className="w-full bg-green-600">
                          Completed!
                        </Button>
                      ) : (
                        <Button className="w-full" onClick={() => handleChallengeClick(challenge)}>
                          Continue
                        </Button>
                      )}
                    </CardFooter>
                  </Card>
                );
              })}
            </div>
          )}
        </TabsContent>
        
        <TabsContent value="upcoming">
          {isLoading ? (
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
              {[1, 2].map(i => (
                <Card key={i} className="overflow-hidden">
                  <CardHeader>
                    <SkeletonItem className="h-8 w-3/4 mb-2" />
                    <SkeletonItem className="h-4 w-full" />
                  </CardHeader>
                  <CardContent>
                    <SkeletonItem className="h-20 w-full mb-4" />
                    <SkeletonItem className="h-4 w-2/3" />
                  </CardContent>
                </Card>
              ))}
            </div>
          ) : upcomingChallenges.length === 0 ? (
            <div className="text-center p-8">
              <AlertCircle className="mx-auto h-12 w-12 text-muted-foreground mb-4" />
              <h3 className="text-lg font-medium">No upcoming challenges</h3>
              <p className="text-muted-foreground">Check back later for new challenges.</p>
            </div>
          ) : (
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
              {upcomingChallenges.map(challenge => (
                <Card key={challenge.id} className="overflow-hidden">
                  <CardHeader>
                    <div className="flex justify-between items-start">
                      <CardTitle className="text-xl mb-2">{challenge.title}</CardTitle>
                      <Badge className={`${getDifficultyColor(challenge.difficulty)} text-white`}>
                        {challenge.difficulty.charAt(0).toUpperCase() + challenge.difficulty.slice(1)}
                      </Badge>
                    </div>
                    <CardDescription>{challenge.description}</CardDescription>
                  </CardHeader>
                  
                  <CardContent>
                    <div className="flex justify-between mb-4 text-sm">
                      <div className="flex items-center">
                        <Calendar className="mr-1 h-4 w-4 text-muted-foreground" />
                        <span>
                          Starts: {new Date(challenge.start_date).toLocaleDateString()}
                        </span>
                      </div>
                      <div className="flex items-center">
                        <Trophy className="mr-1 h-4 w-4 text-muted-foreground" />
                        <span>{challenge.reward_points} pts</span>
                      </div>
                    </div>
                    
                    <div className="mt-4">
                      <Button 
                        variant="outline" 
                        className="w-full"
                        onClick={() => handleChallengeClick(challenge)}
                      >
                        View Details
                      </Button>
                    </div>
                  </CardContent>
                </Card>
              ))}
            </div>
          )}
        </TabsContent>
        
        <TabsContent value="completed">
          {isLoading ? (
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
              {[1, 2].map(i => (
                <Card key={i} className="overflow-hidden">
                  <CardHeader>
                    <SkeletonItem className="h-8 w-3/4 mb-2" />
                    <SkeletonItem className="h-4 w-full" />
                  </CardHeader>
                  <CardContent>
                    <SkeletonItem className="h-20 w-full mb-4" />
                    <SkeletonItem className="h-4 w-2/3" />
                  </CardContent>
                </Card>
              ))}
            </div>
          ) : completedChallenges.length === 0 ? (
            <div className="text-center p-8">
              <AlertCircle className="mx-auto h-12 w-12 text-muted-foreground mb-4" />
              <h3 className="text-lg font-medium">No completed challenges</h3>
              <p className="text-muted-foreground">Join and complete challenges to see them here.</p>
            </div>
          ) : (
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
              {completedChallenges.map(challenge => (
                <Card key={challenge.id} className="overflow-hidden">
                  <CardHeader>
                    <div className="flex justify-between items-start">
                      <CardTitle className="text-xl mb-2">{challenge.title}</CardTitle>
                      <Badge className="bg-green-600 text-white">Completed</Badge>
                    </div>
                    <CardDescription>{challenge.description}</CardDescription>
                  </CardHeader>
                  
                  <CardContent>
                    <div className="flex justify-between mb-4 text-sm">
                      <div className="flex items-center">
                        <Calendar className="mr-1 h-4 w-4 text-muted-foreground" />
                        <span>
                          Completed: {
                            new Date(userProgress[challenge.id]?.updated_at || '').toLocaleDateString()
                          }
                        </span>
                      </div>
                      <div className="flex items-center">
                        <Trophy className="mr-1 h-4 w-4 text-green-600" />
                        <span className="text-green-600 font-medium">
                          +{challenge.reward_points} pts
                        </span>
                      </div>
                    </div>
                    
                    <div className="mt-4">
                      <Button 
                        variant="outline" 
                        className="w-full"
                        onClick={() => handleChallengeClick(challenge)}
                      >
                        View Details
                      </Button>
                    </div>
                  </CardContent>
                </Card>
              ))}
            </div>
          )}
        </TabsContent>
      </Tabs>
    </div>
  );
} 