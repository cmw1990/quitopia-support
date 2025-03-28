import React, { useState } from 'react';
import { Session } from '@supabase/supabase-js';
import { Card, CardContent, CardHeader, CardTitle, CardDescription, Tabs, TabsContent, TabsList, TabsTrigger } from '../ui';
import ConsumptionAnalytics from './ConsumptionAnalytics';
import MoodAnalytics from './MoodAnalytics';
import ProgressAnalytics from './ProgressAnalytics';
import { BarChart, LineChart, PieChart, Activity, Users, Heart, TrendingUp, Trophy } from 'lucide-react';

interface AnalyticsDashboardProps {
  session: Session | null;
}

export const AnalyticsDashboard: React.FC<AnalyticsDashboardProps> = ({ session }) => {
  const [activeTab, setActiveTab] = useState('overview');

  return (
    <div className="space-y-6">
      <div>
        <h1 className="text-3xl font-bold tracking-tight">Analytics Dashboard</h1>
        <p className="text-muted-foreground mt-2">
          Gain insights into your smoke-free journey with detailed analytics and tracking.
        </p>
      </div>

      <Tabs defaultValue={activeTab} onValueChange={setActiveTab} className="space-y-4">
        <TabsList className="grid grid-cols-5 max-w-2xl">
          <TabsTrigger value="overview" className="flex items-center gap-2">
            <Activity className="h-4 w-4" />
            <span className="hidden sm:inline">Overview</span>
          </TabsTrigger>
          <TabsTrigger value="consumption" className="flex items-center gap-2">
            <BarChart className="h-4 w-4" />
            <span className="hidden sm:inline">Consumption</span>
          </TabsTrigger>
          <TabsTrigger value="mood" className="flex items-center gap-2">
            <Heart className="h-4 w-4" />
            <span className="hidden sm:inline">Mood</span>
          </TabsTrigger>
          <TabsTrigger value="progress" className="flex items-center gap-2">
            <TrendingUp className="h-4 w-4" />
            <span className="hidden sm:inline">Progress</span>
          </TabsTrigger>
          <TabsTrigger value="achievements" className="flex items-center gap-2">
            <Trophy className="h-4 w-4" />
            <span className="hidden sm:inline">Achievements</span>
          </TabsTrigger>
        </TabsList>

        <TabsContent value="overview" className="space-y-4">
          <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-3">
            <Card className="col-span-2">
              <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
                <CardTitle className="text-base font-medium flex items-center gap-2">
                  <BarChart className="h-4 w-4 text-primary" />
                  Recent Consumption
                </CardTitle>
              </CardHeader>
              <CardContent>
                <div className="h-[200px]">
                  <div className="text-center text-muted-foreground flex items-center justify-center h-full">
                    Consumption summary data
                  </div>
                </div>
              </CardContent>
            </Card>

            <Card>
              <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
                <CardTitle className="text-base font-medium flex items-center gap-2">
                  <Heart className="h-4 w-4 text-primary" />
                  Mood Tracking
                </CardTitle>
              </CardHeader>
              <CardContent>
                <div className="h-[200px]">
                  <div className="text-center text-muted-foreground flex items-center justify-center h-full">
                    Mood tracking summary
                  </div>
                </div>
              </CardContent>
            </Card>
          </div>

          <div className="grid gap-4 md:grid-cols-2">
            <Card>
              <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
                <CardTitle className="text-base font-medium flex items-center gap-2">
                  <TrendingUp className="h-4 w-4 text-primary" />
                  Progress Summary
                </CardTitle>
              </CardHeader>
              <CardContent>
                <div className="h-[200px]">
                  <div className="text-center text-muted-foreground flex items-center justify-center h-full">
                    Progress tracking summary
                  </div>
                </div>
              </CardContent>
            </Card>

            <Card>
              <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
                <CardTitle className="text-base font-medium flex items-center gap-2">
                  <Trophy className="h-4 w-4 text-primary" />
                  Recent Achievements
                </CardTitle>
              </CardHeader>
              <CardContent>
                <div className="h-[200px] flex flex-col justify-center items-center">
                  <Trophy className="h-16 w-16 text-muted-foreground mb-2" />
                  <p className="text-center text-muted-foreground">View your achievements timeline and progress</p>
                </div>
              </CardContent>
            </Card>
          </div>
        </TabsContent>

        <TabsContent value="consumption" className="space-y-4">
          <ConsumptionAnalytics session={session} />
        </TabsContent>
        
        <TabsContent value="mood" className="space-y-4">
          <MoodAnalytics session={session} />
        </TabsContent>
        
        <TabsContent value="progress" className="space-y-4">
          <ProgressAnalytics session={session} />
        </TabsContent>
        
        <TabsContent value="achievements" className="space-y-4">
          <Card className="w-full p-6 text-center">
            <div className="flex flex-col items-center justify-center py-10">
              <Trophy className="h-16 w-16 text-muted-foreground mb-4" />
              <h3 className="text-lg font-medium mb-2">Achievements Analytics Coming Soon</h3>
              <p className="text-muted-foreground mb-4">
                Track your achievements, badges, and milestones in our upcoming update.
              </p>
            </div>
          </Card>
        </TabsContent>
      </Tabs>
    </div>
  );
};

export default AnalyticsDashboard; 