import React from 'react';
import { useQuery } from '@tanstack/react-query';
import { supabase } from '@/integrations/supabase/supabase-client';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Progress } from '@/components/ui/progress';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { useToast } from '@/components/ui/use-toast';
import {
  Activity,
  Brain,
  Utensils,
  Moon,
  Users,
  MessageSquare,
  Calendar,
  TrendingUp
} from 'lucide-react';

interface CareMetrics {
  energy_score: number;
  mood_stability: number;
  nutrition_adherence: number;
  sleep_quality: number;
  consultation_recommended: boolean;
}

export const CareIntegrationHub = () => {
  const { toast } = useToast();

  // Fetch user's care metrics
  const { data: metrics } = useQuery({
    queryKey: ['care-metrics'],
    queryFn: async () => {
      const { data, error } = await supabase
        .from('user_metrics')
        .select('*')
        .eq('user_id', supabase.auth.user()?.id)
        .single();

      if (error) throw error;
      return data as CareMetrics;
    }
  });

  // Fetch professional recommendations
  const { data: recommendations } = useQuery({
    queryKey: ['professional-recommendations'],
    queryFn: async () => {
      const { data, error } = await supabase
        .from('professional_recommendations')
        .select('*')
        .eq('user_id', supabase.auth.user()?.id)
        .order('created_at', { ascending: false })
        .limit(5);

      if (error) throw error;
      return data;
    }
  });

  const shouldRecommendConsultation = (metrics: CareMetrics) => {
    return (
      metrics.energy_score < 60 ||
      metrics.mood_stability < 65 ||
      metrics.nutrition_adherence < 50 ||
      metrics.sleep_quality < 55
    );
  };

  return (
    <div className="container mx-auto px-4 py-8">
      <Tabs defaultValue="overview">
        <TabsList>
          <TabsTrigger value="overview">Wellness Overview</TabsTrigger>
          <TabsTrigger value="integration">Care Integration</TabsTrigger>
          <TabsTrigger value="professional">Professional Support</TabsTrigger>
        </TabsList>

        <TabsContent value="overview">
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4">
            {/* Energy Score */}
            <Card>
              <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
                <CardTitle className="text-sm font-medium">Energy Score</CardTitle>
                <Activity className="h-4 w-4 text-muted-foreground" />
              </CardHeader>
              <CardContent>
                <div className="space-y-2">
                  <Progress value={metrics?.energy_score} className="h-2" />
                  <p className="text-xs text-muted-foreground">
                    {metrics?.energy_score < 60 ? 'Consider professional guidance' : 'On track'}
                  </p>
                </div>
              </CardContent>
            </Card>

            {/* Mood Stability */}
            <Card>
              <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
                <CardTitle className="text-sm font-medium">Mood Stability</CardTitle>
                <Brain className="h-4 w-4 text-muted-foreground" />
              </CardHeader>
              <CardContent>
                <div className="space-y-2">
                  <Progress value={metrics?.mood_stability} className="h-2" />
                  <p className="text-xs text-muted-foreground">
                    {metrics?.mood_stability < 65 ? 'Therapy might help' : 'Stable'}
                  </p>
                </div>
              </CardContent>
            </Card>

            {/* Nutrition */}
            <Card>
              <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
                <CardTitle className="text-sm font-medium">Nutrition Goals</CardTitle>
                <Utensils className="h-4 w-4 text-muted-foreground" />
              </CardHeader>
              <CardContent>
                <div className="space-y-2">
                  <Progress value={metrics?.nutrition_adherence} className="h-2" />
                  <p className="text-xs text-muted-foreground">
                    {metrics?.nutrition_adherence < 50 ? 'Consult a nutritionist' : 'Good habits'}
                  </p>
                </div>
              </CardContent>
            </Card>

            {/* Sleep Quality */}
            <Card>
              <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
                <CardTitle className="text-sm font-medium">Sleep Quality</CardTitle>
                <Moon className="h-4 w-4 text-muted-foreground" />
              </CardHeader>
              <CardContent>
                <div className="space-y-2">
                  <Progress value={metrics?.sleep_quality} className="h-2" />
                  <p className="text-xs text-muted-foreground">
                    {metrics?.sleep_quality < 55 ? 'Sleep consultation advised' : 'Restful sleep'}
                  </p>
                </div>
              </CardContent>
            </Card>
          </div>
        </TabsContent>

        <TabsContent value="integration">
          <div className="space-y-6">
            {/* Quick Actions */}
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
              <Card className="bg-primary/5">
                <CardContent className="p-6">
                  <Button variant="ghost" className="w-full justify-start">
                    <MessageSquare className="h-5 w-5 mr-2" />
                    Ask a Professional
                  </Button>
                </CardContent>
              </Card>
              <Card className="bg-primary/5">
                <CardContent className="p-6">
                  <Button variant="ghost" className="w-full justify-start">
                    <Users className="h-5 w-5 mr-2" />
                    Join Group Session
                  </Button>
                </CardContent>
              </Card>
              <Card className="bg-primary/5">
                <CardContent className="p-6">
                  <Button variant="ghost" className="w-full justify-start">
                    <Calendar className="h-5 w-5 mr-2" />
                    Schedule Check-in
                  </Button>
                </CardContent>
              </Card>
            </div>

            {/* Professional Recommendations */}
            {recommendations?.map((rec) => (
              <Card key={rec.id}>
                <CardContent className="p-6">
                  <div className="flex items-start space-x-4">
                    <div className="flex-1">
                      <h3 className="font-semibold">{rec.title}</h3>
                      <p className="text-sm text-muted-foreground">{rec.description}</p>
                      {rec.action_items && (
                        <ul className="mt-2 space-y-1">
                          {rec.action_items.map((item, index) => (
                            <li key={index} className="text-sm flex items-center">
                              <TrendingUp className="h-4 w-4 mr-2 text-primary" />
                              {item}
                            </li>
                          ))}
                        </ul>
                      )}
                    </div>
                    <Button variant="outline" size="sm">
                      Take Action
                    </Button>
                  </div>
                </CardContent>
              </Card>
            ))}
          </div>
        </TabsContent>

        <TabsContent value="professional">
          <div className="space-y-6">
            {metrics && shouldRecommendConsultation(metrics) && (
              <Card className="bg-primary/5 border-primary/20">
                <CardContent className="p-6">
                  <div className="space-y-4">
                    <div className="flex items-center space-x-4">
                      <div className="flex-1">
                        <h3 className="font-semibold">Professional Consultation Recommended</h3>
                        <p className="text-sm text-muted-foreground">
                          Based on your recent metrics, speaking with a professional could be beneficial
                        </p>
                      </div>
                      <Button>
                        Book Consultation
                      </Button>
                    </div>
                    <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                      <div className="space-y-2">
                        <h4 className="text-sm font-medium">Why Now?</h4>
                        <ul className="text-sm space-y-1">
                          {metrics.energy_score < 60 && (
                            <li className="flex items-center">
                              <Activity className="h-4 w-4 mr-2 text-primary" />
                              Energy levels below optimal range
                            </li>
                          )}
                          {metrics.mood_stability < 65 && (
                            <li className="flex items-center">
                              <Brain className="h-4 w-4 mr-2 text-primary" />
                              Mood patterns showing variability
                            </li>
                          )}
                          {metrics.nutrition_adherence < 50 && (
                            <li className="flex items-center">
                              <Utensils className="h-4 w-4 mr-2 text-primary" />
                              Nutrition goals need attention
                            </li>
                          )}
                          {metrics.sleep_quality < 55 && (
                            <li className="flex items-center">
                              <Moon className="h-4 w-4 mr-2 text-primary" />
                              Sleep quality could be improved
                            </li>
                          )}
                        </ul>
                      </div>
                      <div className="space-y-2">
                        <h4 className="text-sm font-medium">What to Expect</h4>
                        <ul className="text-sm space-y-1">
                          <li>Personalized assessment</li>
                          <li>Custom energy management plan</li>
                          <li>Integration with your current routines</li>
                          <li>Regular progress tracking</li>
                        </ul>
                      </div>
                    </div>
                  </div>
                </CardContent>
              </Card>
            )}
          </div>
        </TabsContent>
      </Tabs>
    </div>
  );
};
