import React from 'react';
import { useQuery } from '@tanstack/react-query';
import { supabase } from '@/integrations/supabase/supabase-client';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Progress } from '@/components/ui/progress';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { Slider } from '@/components/ui/slider';
import { useToast } from '@/components/ui/use-toast';
import {
  Brain,
  Heart,
  Smile,
  Moon,
  Sun,
  Activity,
  Users,
  Battery,
  Zap,
  Shield,
  HeartPulse,
  Sparkles
} from 'lucide-react';

interface WellnessMetrics {
  meditation_minutes: number;
  mood_score: number;
  energy_level: number;
  focus_score: number;
  stress_level: number;
  anxiety_level: number;
  sleep_quality: number;
  relationship_satisfaction: number;
  daily_achievements: string[];
  emotional_triggers: string[];
}

interface WellnessGoals {
  meditation_target: number;
  mood_target: number;
  energy_target: number;
  focus_target: number;
  stress_reduction: number;
}

export const HolisticWellnessHub = () => {
  const { toast } = useToast();

  // Fetch user's wellness metrics
  const { data: metrics } = useQuery({
    queryKey: ['wellness-metrics'],
    queryFn: async () => {
      const { data, error } = await supabase
        .from('user_wellness_metrics')
        .select('*')
        .eq('user_id', supabase.auth.user()?.id)
        .single();

      if (error) throw error;
      return data as WellnessMetrics;
    }
  });

  // Fetch user's wellness goals
  const { data: goals } = useQuery({
    queryKey: ['wellness-goals'],
    queryFn: async () => {
      const { data, error } = await supabase
        .from('user_wellness_goals')
        .select('*')
        .eq('user_id', supabase.auth.user()?.id)
        .single();

      if (error) throw error;
      return data as WellnessGoals;
    }
  });

  return (
    <div className="container mx-auto px-4 py-8">
      <Tabs defaultValue="overview">
        <TabsList className="grid grid-cols-4 gap-4">
          <TabsTrigger value="overview">Overview</TabsTrigger>
          <TabsTrigger value="meditation">Meditation & Focus</TabsTrigger>
          <TabsTrigger value="emotional">Emotional Support</TabsTrigger>
          <TabsTrigger value="energy">Energy & Recovery</TabsTrigger>
        </TabsList>

        <TabsContent value="overview">
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
            {/* Quick Actions */}
            <Card className="col-span-full bg-primary/5">
              <CardContent className="p-6">
                <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
                  <Button variant="ghost" className="flex flex-col items-center p-4">
                    <Brain className="h-6 w-6 mb-2" />
                    <span>Quick Meditation</span>
                  </Button>
                  <Button variant="ghost" className="flex flex-col items-center p-4">
                    <Shield className="h-6 w-6 mb-2" />
                    <span>Stress Relief</span>
                  </Button>
                  <Button variant="ghost" className="flex flex-col items-center p-4">
                    <Zap className="h-6 w-6 mb-2" />
                    <span>Energy Boost</span>
                  </Button>
                  <Button variant="ghost" className="flex flex-col items-center p-4">
                    <HeartPulse className="h-6 w-6 mb-2" />
                    <span>Calm Anxiety</span>
                  </Button>
                </div>
              </CardContent>
            </Card>

            {/* Wellness Score */}
            <Card>
              <CardHeader>
                <CardTitle className="flex items-center">
                  <Sparkles className="h-5 w-5 mr-2" />
                  Overall Wellness
                </CardTitle>
              </CardHeader>
              <CardContent>
                <div className="space-y-4">
                  <div className="flex items-center justify-between">
                    <span className="text-2xl font-bold">
                      {metrics ? Math.round((
                        metrics.mood_score +
                        metrics.energy_level +
                        metrics.focus_score +
                        (100 - metrics.stress_level) +
                        (100 - metrics.anxiety_level)
                      ) / 5) : '--'}%
                    </span>
                    <Battery className="h-6 w-6" />
                  </div>
                  <Progress 
                    value={metrics ? (
                      metrics.mood_score +
                      metrics.energy_level +
                      metrics.focus_score +
                      (100 - metrics.stress_level) +
                      (100 - metrics.anxiety_level)
                    ) / 5 : 0} 
                    className="h-2" 
                  />
                </div>
              </CardContent>
            </Card>

            {/* Daily Check-in */}
            <Card>
              <CardHeader>
                <CardTitle className="flex items-center">
                  <Heart className="h-5 w-5 mr-2" />
                  Daily Check-in
                </CardTitle>
              </CardHeader>
              <CardContent>
                <div className="space-y-4">
                  <div className="space-y-2">
                    <label className="text-sm font-medium">How are you feeling?</label>
                    <div className="grid grid-cols-5 gap-2">
                      {['😔', '😕', '😐', '🙂', '😊'].map((emoji, index) => (
                        <Button
                          key={index}
                          variant="outline"
                          className="text-2xl p-2 h-12"
                        >
                          {emoji}
                        </Button>
                      ))}
                    </div>
                  </div>
                  <Button className="w-full">Log Mood</Button>
                </div>
              </CardContent>
            </Card>

            {/* Energy Level */}
            <Card>
              <CardHeader>
                <CardTitle className="flex items-center">
                  <Activity className="h-5 w-5 mr-2" />
                  Energy Level
                </CardTitle>
              </CardHeader>
              <CardContent>
                <div className="space-y-4">
                  <div className="flex items-center justify-between">
                    <span className="text-2xl font-bold">{metrics?.energy_level || '--'}%</span>
                    <Zap className="h-6 w-6" />
                  </div>
                  <Progress value={metrics?.energy_level || 0} className="h-2" />
                </div>
              </CardContent>
            </Card>
          </div>
        </TabsContent>

        <TabsContent value="meditation">
          <div className="space-y-6">
            {/* Meditation Stats */}
            <Card>
              <CardContent className="p-6">
                <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
                  <div className="text-center">
                    <h3 className="text-lg font-semibold">{metrics?.meditation_minutes || 0}</h3>
                    <p className="text-sm text-muted-foreground">Minutes Meditated</p>
                  </div>
                  <div className="text-center">
                    <h3 className="text-lg font-semibold">{metrics?.focus_score || 0}%</h3>
                    <p className="text-sm text-muted-foreground">Focus Score</p>
                  </div>
                  <div className="text-center">
                    <h3 className="text-lg font-semibold">
                      {goals?.meditation_target ? 
                        Math.round((metrics?.meditation_minutes || 0) / goals.meditation_target * 100) : 0}%
                    </h3>
                    <p className="text-sm text-muted-foreground">Daily Goal Progress</p>
                  </div>
                </div>
              </CardContent>
            </Card>

            {/* Meditation Programs */}
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
              <Card>
                <CardContent className="p-6">
                  <div className="space-y-4">
                    <div className="flex items-center space-x-4">
                      <Brain className="h-8 w-8" />
                      <div>
                        <h3 className="font-semibold">Focus Enhancement</h3>
                        <p className="text-sm text-muted-foreground">Improve concentration</p>
                      </div>
                    </div>
                    <Button className="w-full">Start Session</Button>
                  </div>
                </CardContent>
              </Card>

              <Card>
                <CardContent className="p-6">
                  <div className="space-y-4">
                    <div className="flex items-center space-x-4">
                      <Shield className="h-8 w-8" />
                      <div>
                        <h3 className="font-semibold">Stress Relief</h3>
                        <p className="text-sm text-muted-foreground">Calm your mind</p>
                      </div>
                    </div>
                    <Button className="w-full">Start Session</Button>
                  </div>
                </CardContent>
              </Card>

              <Card>
                <CardContent className="p-6">
                  <div className="space-y-4">
                    <div className="flex items-center space-x-4">
                      <Moon className="h-8 w-8" />
                      <div>
                        <h3 className="font-semibold">Sleep Preparation</h3>
                        <p className="text-sm text-muted-foreground">Evening wind-down</p>
                      </div>
                    </div>
                    <Button className="w-full">Start Session</Button>
                  </div>
                </CardContent>
              </Card>
            </div>
          </div>
        </TabsContent>

        <TabsContent value="emotional">
          <div className="space-y-6">
            {/* Emotional Support Tools */}
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
              <Card>
                <CardContent className="p-6">
                  <div className="space-y-4">
                    <div className="flex items-center space-x-4">
                      <Shield className="h-8 w-8" />
                      <div>
                        <h3 className="font-semibold">Anxiety Relief</h3>
                        <p className="text-sm text-muted-foreground">Guided breathing & grounding</p>
                      </div>
                    </div>
                    <Button className="w-full">Start Exercise</Button>
                  </div>
                </CardContent>
              </Card>

              <Card>
                <CardContent className="p-6">
                  <div className="space-y-4">
                    <div className="flex items-center space-x-4">
                      <Heart className="h-8 w-8" />
                      <div>
                        <h3 className="font-semibold">Mood Boost</h3>
                        <p className="text-sm text-muted-foreground">Positive energy exercises</p>
                      </div>
                    </div>
                    <Button className="w-full">Start Exercise</Button>
                  </div>
                </CardContent>
              </Card>

              <Card>
                <CardContent className="p-6">
                  <div className="space-y-4">
                    <div className="flex items-center space-x-4">
                      <Users className="h-8 w-8" />
                      <div>
                        <h3 className="font-semibold">Relationship Support</h3>
                        <p className="text-sm text-muted-foreground">Communication exercises</p>
                      </div>
                    </div>
                    <Button className="w-full">Start Exercise</Button>
                  </div>
                </CardContent>
              </Card>
            </div>

            {/* Mood Tracking */}
            <Card>
              <CardHeader>
                <CardTitle>Mood History</CardTitle>
              </CardHeader>
              <CardContent>
                <div className="space-y-4">
                  {metrics?.daily_achievements && (
                    <div>
                      <h4 className="text-sm font-medium mb-2">Today's Achievements</h4>
                      <div className="space-y-2">
                        {metrics.daily_achievements.map((achievement, index) => (
                          <div key={index} className="flex items-center space-x-2">
                            <Sparkles className="h-4 w-4 text-primary" />
                            <span className="text-sm">{achievement}</span>
                          </div>
                        ))}
                      </div>
                    </div>
                  )}

                  {metrics?.emotional_triggers && (
                    <div>
                      <h4 className="text-sm font-medium mb-2">Identified Triggers</h4>
                      <div className="space-y-2">
                        {metrics.emotional_triggers.map((trigger, index) => (
                          <div key={index} className="flex items-center space-x-2">
                            <Shield className="h-4 w-4 text-primary" />
                            <span className="text-sm">{trigger}</span>
                          </div>
                        ))}
                      </div>
                    </div>
                  )}
                </div>
              </CardContent>
            </Card>
          </div>
        </TabsContent>

        <TabsContent value="energy">
          <div className="space-y-6">
            {/* Energy Management */}
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              <Card>
                <CardHeader>
                  <CardTitle>Energy Level Tracking</CardTitle>
                </CardHeader>
                <CardContent>
                  <div className="space-y-4">
                    <div className="flex items-center justify-between">
                      <span>Current Energy</span>
                      <span className="font-bold">{metrics?.energy_level || 0}%</span>
                    </div>
                    <Progress value={metrics?.energy_level || 0} className="h-2" />
                    <div className="grid grid-cols-3 gap-4 text-center">
                      <div>
                        <span className="text-sm font-medium">Morning</span>
                        <Progress value={75} className="h-1 mt-1" />
                      </div>
                      <div>
                        <span className="text-sm font-medium">Afternoon</span>
                        <Progress value={60} className="h-1 mt-1" />
                      </div>
                      <div>
                        <span className="text-sm font-medium">Evening</span>
                        <Progress value={45} className="h-1 mt-1" />
                      </div>
                    </div>
                  </div>
                </CardContent>
              </Card>

              <Card>
                <CardHeader>
                  <CardTitle>Recovery Activities</CardTitle>
                </CardHeader>
                <CardContent>
                  <div className="space-y-4">
                    <Button className="w-full" variant="outline">
                      <Moon className="h-4 w-4 mr-2" />
                      Power Nap (20 min)
                    </Button>
                    <Button className="w-full" variant="outline">
                      <Activity className="h-4 w-4 mr-2" />
                      Quick Exercise
                    </Button>
                    <Button className="w-full" variant="outline">
                      <Sun className="h-4 w-4 mr-2" />
                      Sunlight Break
                    </Button>
                  </div>
                </CardContent>
              </Card>
            </div>

            {/* Fatigue Management */}
            <Card>
              <CardHeader>
                <CardTitle>Fatigue Management</CardTitle>
              </CardHeader>
              <CardContent>
                <div className="space-y-6">
                  <div className="space-y-2">
                    <label className="text-sm font-medium">Mental Fatigue Level</label>
                    <Slider defaultValue={[30]} max={100} step={1} />
                  </div>
                  <div className="space-y-2">
                    <label className="text-sm font-medium">Physical Fatigue Level</label>
                    <Slider defaultValue={[45]} max={100} step={1} />
                  </div>
                  <Button className="w-full">
                    Generate Recovery Plan
                  </Button>
                </div>
              </CardContent>
            </Card>
          </div>
        </TabsContent>
      </Tabs>
    </div>
  );
};
