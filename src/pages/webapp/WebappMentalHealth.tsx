import React, { useEffect, useState } from 'react';
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Brain, Heart, SmilePlus, Frown, Meh, ThumbsUp, MessageSquare, Calendar, Activity, BookOpen } from 'lucide-react';
import { mentalHealthApi8 } from '@/lib/api';
import { useUser } from '@/lib/auth';
import { MoodTracking8, AnxietyTracking8, MindfulnessSession8, TherapyGoal8 } from '@/lib/types';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { Progress } from '@/components/ui/progress';
import { useToast } from '@/components/ui/use-toast';

export const WebappMentalHealth: React.FC = () => {
  const { user } = useUser();
  const { toast } = useToast();
  const [moodHistory, setMoodHistory] = useState<MoodTracking8[]>([]);
  const [anxietyHistory, setAnxietyHistory] = useState<AnxietyTracking8[]>([]);
  const [mindfulnessSessions, setMindfulnessSessions] = useState<MindfulnessSession8[]>([]);
  const [therapyGoals, setTherapyGoals] = useState<TherapyGoal8[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    if (user?.id) {
      loadMentalHealthData();
    }
  }, [user?.id]);

  const loadMentalHealthData = async () => {
    try {
      setLoading(true);
      const today = new Date();
      const lastWeek = new Date(today.getTime() - 7 * 24 * 60 * 60 * 1000);
      
      const [moodData, anxietyData, mindfulnessData, goalsData] = await Promise.all([
        mentalHealthApi8.getMoodEntries8(user.id, lastWeek.toISOString(), today.toISOString()),
        mentalHealthApi8.getAnxietyEntries8(user.id, lastWeek.toISOString(), today.toISOString()),
        mentalHealthApi8.getMindfulnessSessions8(user.id),
        mentalHealthApi8.getTherapyGoals8(user.id)
      ]);

      setMoodHistory(moodData.data || []);
      setAnxietyHistory(anxietyData.data || []);
      setMindfulnessSessions(mindfulnessData.data || []);
      setTherapyGoals(goalsData.data || []);
    } catch (error) {
      console.error('Error loading mental health data:', error);
      toast({
        title: 'Error',
        description: 'Failed to load mental health data. Please try again.',
        variant: 'destructive'
      });
    } finally {
      setLoading(false);
    }
  };

  const handleMoodSubmit = async (moodScore: number, label: string) => {
    try {
      await mentalHealthApi8.addMoodEntry8({
        user_id: user.id,
        timestamp: new Date().toISOString(),
        mood_score: moodScore,
        energy_level: moodScore, // Using same score for simplicity
        activities: [],
        triggers: [],
        notes: `Feeling ${label}`
      });
      
      toast({
        title: 'Success',
        description: 'Mood recorded successfully!',
      });
      
      loadMentalHealthData();
    } catch (error) {
      console.error('Error recording mood:', error);
      toast({
        title: 'Error',
        description: 'Failed to record mood. Please try again.',
        variant: 'destructive'
      });
    }
  };

  const moodTracking = [
    { icon: SmilePlus, label: 'Happy', score: 9, color: 'text-green-500' },
    { icon: Meh, label: 'Neutral', score: 5, color: 'text-yellow-500' },
    { icon: Frown, label: 'Low', score: 2, color: 'text-red-500' },
  ];

  const mindfulnessOptions = [
    { type: 'meditation', label: 'Meditation', duration: 10 },
    { type: 'breathing', label: 'Breathing Exercise', duration: 5 },
    { type: 'body_scan', label: 'Body Scan', duration: 15 },
    { type: 'visualization', label: 'Visualization', duration: 10 },
    { type: 'grounding', label: 'Grounding Exercise', duration: 5 },
  ] as const;

  const startMindfulnessSession = async (type: MindfulnessSession8['session_type'], duration: number) => {
    try {
      await mentalHealthApi8.addMindfulnessSession8({
        user_id: user.id,
        timestamp: new Date().toISOString(),
        session_type: type,
        duration_minutes: duration,
        focus_quality: 0, // Will be updated after session
        calm_level_before: 0,
        calm_level_after: 0,
        notes: ''
      });

      toast({
        title: 'Session Started',
        description: `Starting ${duration}-minute ${type} session`,
      });

      // Here you would typically navigate to the session screen
    } catch (error) {
      console.error('Error starting mindfulness session:', error);
      toast({
        title: 'Error',
        description: 'Failed to start session. Please try again.',
        variant: 'destructive'
      });
    }
  };

  return (
    <div className="container mx-auto p-6 space-y-6">
      <div className="flex justify-between items-center">
        <h1 className="text-3xl font-bold">Mental Health & Wellness</h1>
        <Button onClick={loadMentalHealthData} variant="outline" disabled={loading}>
          <Activity className="h-4 w-4 mr-2" />
          Refresh
        </Button>
      </div>

      <Tabs defaultValue="mood" className="space-y-6">
        <TabsList>
          <TabsTrigger value="mood">Mood & Energy</TabsTrigger>
          <TabsTrigger value="mindfulness">Mindfulness</TabsTrigger>
          <TabsTrigger value="goals">Goals & Progress</TabsTrigger>
          <TabsTrigger value="support">Professional Support</TabsTrigger>
        </TabsList>

        <TabsContent value="mood">
          {/* Mood Tracking */}
          <Card>
            <CardHeader>
              <CardTitle>Daily Mood Check-in</CardTitle>
              <CardDescription>How are you feeling today?</CardDescription>
            </CardHeader>
            <CardContent>
              <div className="flex justify-around">
                {moodTracking.map((mood, index) => {
                  const Icon = mood.icon;
                  return (
                    <Button
                      key={index}
                      variant="ghost"
                      className="flex flex-col items-center p-4 hover:bg-primary/5"
                      onClick={() => handleMoodSubmit(mood.score, mood.label)}
                    >
                      <Icon className={`h-12 w-12 ${mood.color}`} />
                      <span className="mt-2">{mood.label}</span>
                    </Button>
                  );
                })}
              </div>
              
              {moodHistory.length > 0 && (
                <div className="mt-6">
                  <h3 className="font-medium mb-2">Recent Mood History</h3>
                  <div className="space-y-2">
                    {moodHistory.slice(0, 5).map((entry, index) => (
                      <div key={index} className="flex items-center justify-between">
                        <span>{new Date(entry.timestamp).toLocaleDateString()}</span>
                        <Progress value={entry.mood_score * 10} className="w-1/2" />
                        <span>{entry.mood_score}/10</span>
                      </div>
                    ))}
                  </div>
                </div>
              )}
            </CardContent>
          </Card>
        </TabsContent>

        <TabsContent value="mindfulness">
          {/* Mindfulness Sessions */}
          <Card>
            <CardHeader>
              <CardTitle className="flex items-center gap-2">
                <Heart className="h-5 w-5 text-primary" />
                Mindfulness Practice
              </CardTitle>
              <CardDescription>Choose a mindfulness exercise to begin</CardDescription>
            </CardHeader>
            <CardContent>
              <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
                {mindfulnessOptions.map((option, index) => (
                  <Card key={index}>
                    <CardHeader>
                      <CardTitle className="text-lg">{option.label}</CardTitle>
                      <CardDescription>{option.duration} minutes</CardDescription>
                    </CardHeader>
                    <CardContent>
                      <Button 
                        className="w-full"
                        onClick={() => startMindfulnessSession(option.type, option.duration)}
                      >
                        Start Session
                      </Button>
                    </CardContent>
                  </Card>
                ))}
              </div>

              {mindfulnessSessions.length > 0 && (
                <div className="mt-6">
                  <h3 className="font-medium mb-2">Recent Sessions</h3>
                  <div className="space-y-2">
                    {mindfulnessSessions.slice(0, 5).map((session, index) => (
                      <div key={index} className="flex items-center justify-between">
                        <span>{new Date(session.timestamp).toLocaleDateString()}</span>
                        <span className="capitalize">{session.session_type}</span>
                        <span>{session.duration_minutes} min</span>
                      </div>
                    ))}
                  </div>
                </div>
              )}
            </CardContent>
          </Card>
        </TabsContent>

        <TabsContent value="goals">
          {/* Therapy Goals */}
          <Card>
            <CardHeader>
              <CardTitle className="flex items-center gap-2">
                <BookOpen className="h-5 w-5 text-primary" />
                Therapy Goals & Progress
              </CardTitle>
            </CardHeader>
            <CardContent>
              {therapyGoals.length > 0 ? (
                <div className="space-y-4">
                  {therapyGoals.map((goal, index) => (
                    <Card key={index}>
                      <CardHeader>
                        <CardTitle className="text-lg">{goal.title}</CardTitle>
                        <CardDescription>{goal.description}</CardDescription>
                      </CardHeader>
                      <CardContent>
                        <div className="space-y-2">
                          <div className="flex justify-between text-sm">
                            <span>Progress</span>
                            <span>{goal.progress}%</span>
                          </div>
                          <Progress value={goal.progress} />
                          <div className="flex justify-between text-sm text-muted-foreground">
                            <span>Status: {goal.status}</span>
                            {goal.target_date && (
                              <span>Target: {new Date(goal.target_date).toLocaleDateString()}</span>
                            )}
                          </div>
                        </div>
                      </CardContent>
                    </Card>
                  ))}
                </div>
              ) : (
                <div className="text-center py-6">
                  <p className="text-muted-foreground">No therapy goals set yet.</p>
                  <Button className="mt-4">Set New Goal</Button>
                </div>
              )}
            </CardContent>
          </Card>
        </TabsContent>

        <TabsContent value="support">
          {/* Professional Support */}
          <Card>
            <CardHeader>
              <CardTitle className="flex items-center gap-2">
                <MessageSquare className="h-5 w-5 text-primary" />
                Professional Support
              </CardTitle>
              <CardDescription>Connect with mental health professionals</CardDescription>
            </CardHeader>
            <CardContent>
              <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                <Card>
                  <CardHeader>
                    <CardTitle>Therapy Session</CardTitle>
                    <CardDescription>One-on-one counseling with licensed therapists</CardDescription>
                  </CardHeader>
                  <CardContent>
                    <Button className="w-full">Book Session</Button>
                  </CardContent>
                </Card>

                <Card>
                  <CardHeader>
                    <CardTitle>Support Group</CardTitle>
                    <CardDescription>Join guided group therapy sessions</CardDescription>
                  </CardHeader>
                  <CardContent>
                    <Button className="w-full" variant="outline">View Schedule</Button>
                  </CardContent>
                </Card>
              </div>
            </CardContent>
          </Card>
        </TabsContent>
      </Tabs>
    </div>
  );
};
