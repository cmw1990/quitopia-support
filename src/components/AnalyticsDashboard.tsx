import React, { useState, useEffect } from 'react';
import { Card, CardContent, CardDescription, CardHeader, CardTitle, Tabs, TabsContent, TabsList, TabsTrigger } from './ui';
import { Session } from '@supabase/supabase-js';
import { BarChart, LineChart, PieChart, AreaChart, ListFilter, Download } from 'lucide-react';
import { CravingAnalytics } from './analytics/CravingAnalytics';
import { ConsumptionAnalytics } from './analytics/ConsumptionAnalytics';
import { ProgressAnalytics } from './analytics/ProgressAnalytics';
import { MoodAnalytics } from './analytics/MoodAnalytics';
import useOfflineStatus from '../hooks/useOfflineStatus';

interface AnalyticsDashboardProps {
  session: Session | null;
}

export const AnalyticsDashboard: React.FC<AnalyticsDashboardProps> = ({ session }) => {
  const [activeTab, setActiveTab] = useState<string>('overview');
  const { isOnline } = useOfflineStatus();
  
  return (
    <div className="container mx-auto py-6 px-4 space-y-6">
      <div className="flex flex-col sm:flex-row sm:justify-between sm:items-center gap-4 mb-6">
        <div>
          <h1 className="text-3xl font-bold mb-1">Analytics Dashboard</h1>
          <p className="text-muted-foreground">
            Track your progress and gain insights on your quit journey
          </p>
        </div>
      </div>
      
      <Tabs defaultValue="overview" value={activeTab} onValueChange={setActiveTab} className="space-y-4">
        <TabsList className="grid sm:grid-cols-5 grid-cols-2 gap-2 sm:gap-0">
          <TabsTrigger value="overview" className="flex items-center gap-2">
            <AreaChart className="h-4 w-4" /> Overview
          </TabsTrigger>
          <TabsTrigger value="cravings" className="flex items-center gap-2">
            <BarChart className="h-4 w-4" /> Cravings
          </TabsTrigger>
          <TabsTrigger value="consumption" className="flex items-center gap-2">
            <LineChart className="h-4 w-4" /> Consumption
          </TabsTrigger>
          <TabsTrigger value="moods" className="flex items-center gap-2">
            <PieChart className="h-4 w-4" /> Moods
          </TabsTrigger>
          <TabsTrigger value="progress" className="flex items-center gap-2">
            <ListFilter className="h-4 w-4" /> Progress
          </TabsTrigger>
        </TabsList>
        
        <TabsContent value="overview" className="space-y-4">
          <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-4">
            <SummaryCard 
              title="Days Smoke Free" 
              value="36" 
              trend="+5"
              trendType="positive"
              description="Moving towards your goal"
            />
            <SummaryCard 
              title="Cravings Resisted" 
              value="124" 
              trend="+12"
              trendType="positive"
              description="Last 7 days"
            />
            <SummaryCard 
              title="Money Saved" 
              value="$342" 
              trend="+$47"
              trendType="positive"
              description="Based on your consumption"
            />
            <SummaryCard 
              title="Health Score" 
              value="7.8" 
              trend="+0.3"
              trendType="positive"
              description="Improving steadily"
            />
          </div>
          
          <div className="grid gap-4 md:grid-cols-2">
            <Card>
              <CardHeader>
                <CardTitle>Recent Activity</CardTitle>
                <CardDescription>Your last 5 recorded activities</CardDescription>
              </CardHeader>
              <CardContent>
                <div className="space-y-4">
                  <TimelineItem 
                    title="Logged a craving" 
                    description="Triggered by: Stress" 
                    time="2 hours ago" 
                  />
                  <TimelineItem 
                    title="Completed daily task" 
                    description="Drink water instead of smoking" 
                    time="Yesterday" 
                  />
                  <TimelineItem 
                    title="Reached milestone" 
                    description="1 month smoke-free!" 
                    time="5 days ago" 
                    highlight
                  />
                  <TimelineItem 
                    title="Updated mood journal" 
                    description="Feeling: Motivated" 
                    time="1 week ago" 
                  />
                  <TimelineItem 
                    title="Added trigger" 
                    description="Social gatherings" 
                    time="1 week ago" 
                  />
                </div>
              </CardContent>
            </Card>
            
            <Card>
              <CardHeader>
                <CardTitle>Progress Summary</CardTitle>
                <CardDescription>Based on your initial quit goals</CardDescription>
              </CardHeader>
              <CardContent className="space-y-4">
                <ProgressItem 
                  label="Smoke-Free Days" 
                  current={36} 
                  target={90} 
                  color="bg-green-500" 
                />
                <ProgressItem 
                  label="Cravings Managed" 
                  current={124} 
                  target={200} 
                  color="bg-blue-500" 
                />
                <ProgressItem 
                  label="Tasks Completed" 
                  current={42} 
                  target={60} 
                  color="bg-purple-500" 
                />
                <ProgressItem 
                  label="NRT Reduction" 
                  current={65} 
                  target={100} 
                  color="bg-amber-500" 
                />
                <ProgressItem 
                  label="Mood Improvement" 
                  current={72} 
                  target={100} 
                  color="bg-pink-500" 
                />
              </CardContent>
            </Card>
          </div>
        </TabsContent>
        
        <TabsContent value="cravings">
          <CravingAnalytics session={session} />
        </TabsContent>
        
        <TabsContent value="consumption">
          <ConsumptionAnalytics session={session} />
        </TabsContent>
        
        <TabsContent value="moods">
          <MoodAnalytics session={session} />
        </TabsContent>
        
        <TabsContent value="progress">
          <ProgressAnalytics session={session} />
        </TabsContent>
      </Tabs>
    </div>
  );
};

// Summary Card Component
interface SummaryCardProps {
  title: string;
  value: string;
  trend?: string;
  trendType?: 'positive' | 'negative' | 'neutral';
  description: string;
}

const SummaryCard: React.FC<SummaryCardProps> = ({ 
  title, 
  value, 
  trend, 
  trendType = 'neutral',
  description 
}) => {
  const getTrendColor = () => {
    switch (trendType) {
      case 'positive': return 'text-green-500';
      case 'negative': return 'text-red-500';
      default: return 'text-gray-500';
    }
  };
  
  return (
    <Card>
      <CardContent className="p-6">
        <div className="flex flex-col space-y-1.5">
          <p className="text-sm font-medium text-muted-foreground">{title}</p>
          <div className="flex items-end justify-between">
            <h2 className="text-3xl font-bold">{value}</h2>
            {trend && (
              <span className={`text-sm font-medium ${getTrendColor()}`}>
                {trend}
              </span>
            )}
          </div>
          <p className="text-xs text-muted-foreground">{description}</p>
        </div>
      </CardContent>
    </Card>
  );
};

// Timeline Item Component
interface TimelineItemProps {
  title: string;
  description: string;
  time: string;
  highlight?: boolean;
}

const TimelineItem: React.FC<TimelineItemProps> = ({ 
  title, 
  description, 
  time,
  highlight = false
}) => {
  return (
    <div className="flex gap-3">
      <div className="relative flex flex-col items-center">
        <div className={`h-3 w-3 rounded-full ${highlight ? 'bg-primary' : 'bg-muted-foreground'}`} />
        <div className="w-px h-full bg-border flex-1" />
      </div>
      <div className="pb-4 flex-1">
        <div className="flex justify-between items-start">
          <p className="font-medium">{title}</p>
          <span className="text-xs text-muted-foreground">{time}</span>
        </div>
        <p className="text-sm text-muted-foreground">{description}</p>
      </div>
    </div>
  );
};

// Progress Item Component
interface ProgressItemProps {
  label: string;
  current: number;
  target: number;
  color: string;
}

const ProgressItem: React.FC<ProgressItemProps> = ({ 
  label, 
  current, 
  target,
  color
}) => {
  const percentage = Math.min(100, Math.round((current / target) * 100));
  
  return (
    <div className="space-y-2">
      <div className="flex justify-between text-sm">
        <span>{label}</span>
        <span className="font-medium">{percentage}%</span>
      </div>
      <div className="h-2 bg-muted rounded-full overflow-hidden">
        <div className={`h-full ${color}`} style={{ width: `${percentage}%` }} />
      </div>
      <div className="flex justify-between text-xs text-muted-foreground">
        <span>{current} / {target}</span>
        <span>{target - current} to go</span>
      </div>
    </div>
  );
};

export default AnalyticsDashboard; 