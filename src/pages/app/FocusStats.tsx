import React, { useState, useEffect } from 'react';
import { FocusStats as FocusStatsComponent } from '@/components/FocusStats';
import { Helmet } from 'react-helmet-async';
import { Card, CardContent, CardDescription, CardFooter, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { useAuth } from '@/contexts/AuthContext';
import { Download, BarChart, PieChart, LineChart, Calendar } from 'lucide-react';
import { supabase } from '@/lib/supabase-client';

// Mock data for initial testing
const mockSessions = [
  {
    id: '1',
    start_time: '2025-03-18T09:00:00Z',
    end_time: '2025-03-18T10:00:00Z',
    duration_seconds: 3600,
    focus_type: 'pomodoro' as const,
    completed: true,
    energy_level: 8,
    focus_level: 9,
    tasks_completed: 3,
    context: 'Home Office',
    tags: ['work', 'project-alpha']
  },
  {
    id: '2',
    start_time: '2025-03-18T13:00:00Z',
    end_time: '2025-03-18T14:30:00Z',
    duration_seconds: 5400,
    focus_type: 'deep_work' as const,
    completed: true,
    energy_level: 7,
    focus_level: 8,
    tasks_completed: 1,
    context: 'Coffee Shop',
    tags: ['study', 'research']
  },
  {
    id: '3',
    start_time: '2025-03-19T10:00:00Z',
    end_time: '2025-03-19T11:00:00Z',
    duration_seconds: 3600,
    focus_type: 'flow' as const,
    completed: true,
    energy_level: 9,
    focus_level: 9,
    tasks_completed: 2,
    context: 'Home Office',
    tags: ['creative', 'design']
  }
];

interface FocusSession {
  id: string;
  start_time: string;
  end_time?: string;
  duration_seconds: number;
  focus_type: 'pomodoro' | 'deep_work' | 'flow';
  completed: boolean;
  energy_level?: number;
  focus_level?: number;
  tasks_completed?: number;
  context?: string;
  tags?: string[];
}

const FocusStats: React.FC = () => {
  const { user } = useAuth();
  const [timeRange, setTimeRange] = useState<'week' | 'month' | 'year'>('week');
  const [sessions, setSessions] = useState<FocusSession[]>(mockSessions);
  const [isLoading, setIsLoading] = useState(false);
  const [streakCount, setStreakCount] = useState(3);
  const [totalFocusTime, setTotalFocusTime] = useState(12600); // in seconds

  useEffect(() => {
    if (user?.id) {
      fetchFocusSessions();
    }
  }, [user, timeRange]);

  const fetchFocusSessions = async () => {
    if (!user?.id) return;
    
    setIsLoading(true);
    try {
      // Determine date range based on selected time range
      const now = new Date();
      let startDate = new Date();
      
      if (timeRange === 'week') {
        startDate.setDate(now.getDate() - 7);
      } else if (timeRange === 'month') {
        startDate.setMonth(now.getMonth() - 1);
      } else {
        startDate.setFullYear(now.getFullYear() - 1);
      }
      
      // Fetch focus sessions
      const { data, error } = await supabase
        .from('focus_sessions')
        .select('*')
        .eq('user_id', user.id)
        .gte('start_time', startDate.toISOString())
        .lte('start_time', now.toISOString());
      
      if (error) {
        throw error;
      }
      
      if (data && data.length > 0) {
        setSessions(data as FocusSession[]);
        
        // Calculate total focus time
        const totalSeconds = data.reduce((total: number, session: any) => {
          return total + (session.duration_seconds || 0);
        }, 0);
        
        setTotalFocusTime(totalSeconds);
      }
      
      // Get streak count
      const { data: streakData, error: streakError } = await supabase
        .rpc('get_focus_streak', { user_id_param: user.id });
      
      if (!streakError && streakData) {
        setStreakCount(streakData || 0);
      }
      
    } catch (error) {
      console.error('Error fetching focus sessions:', error);
      // Keep using mock data if there's an error
    } finally {
      setIsLoading(false);
    }
  };

  const handleExportData = async () => {
    if (!user?.id) return;
    
    try {
      const today = new Date();
      const startDate = new Date();
      
      if (timeRange === 'week') {
        startDate.setDate(today.getDate() - 7);
      } else if (timeRange === 'month') {
        startDate.setMonth(today.getMonth() - 1);
      } else {
        startDate.setFullYear(today.getFullYear() - 1);
      }
      
      const { data, error } = await supabase
        .from('focus_sessions')
        .select('*')
        .eq('user_id', user.id)
        .gte('start_time', startDate.toISOString())
        .lte('start_time', today.toISOString());
      
      if (error) throw error;
      
      // Create a downloadable file
      const dataStr = "data:text/json;charset=utf-8," + encodeURIComponent(JSON.stringify(data));
      const downloadAnchorNode = document.createElement('a');
      downloadAnchorNode.setAttribute("href", dataStr);
      downloadAnchorNode.setAttribute("download", "focus_stats_export.json");
      document.body.appendChild(downloadAnchorNode);
      downloadAnchorNode.click();
      downloadAnchorNode.remove();
    } catch (error) {
      console.error('Error exporting focus data:', error);
    }
  };

  return (
    <div className="container mx-auto py-6">
      <Helmet>
        <title>Focus Statistics | Easier Focus</title>
        <meta name="description" content="View detailed statistics about your focus sessions and productivity patterns" />
      </Helmet>
      
      <div className="flex flex-col md:flex-row items-start md:items-center justify-between mb-6">
        <div>
          <h1 className="text-3xl font-bold tracking-tight">Focus Statistics</h1>
          <p className="text-muted-foreground mt-2">
            Analyze your focus patterns and gain insights into your productivity
          </p>
        </div>
        
        <div className="flex items-center space-x-2 mt-4 md:mt-0">
          <Select value={timeRange} onValueChange={(value) => setTimeRange(value as any)}>
            <SelectTrigger className="w-[180px]">
              <SelectValue placeholder="Select time range" />
            </SelectTrigger>
            <SelectContent>
              <SelectItem value="week">Last Week</SelectItem>
              <SelectItem value="month">Last Month</SelectItem>
              <SelectItem value="year">Last Year</SelectItem>
            </SelectContent>
          </Select>
          
          <Button variant="outline" onClick={handleExportData}>
            <Download className="h-4 w-4 mr-2" />
            Export
          </Button>
        </div>
      </div>
      
      <Tabs defaultValue="overview" className="w-full">
        <TabsList className="grid grid-cols-4 mb-6">
          <TabsTrigger value="overview">
            <BarChart className="h-4 w-4 mr-2" />
            Overview
          </TabsTrigger>
          <TabsTrigger value="patterns">
            <LineChart className="h-4 w-4 mr-2" />
            Patterns
          </TabsTrigger>
          <TabsTrigger value="context">
            <PieChart className="h-4 w-4 mr-2" />
            Context
          </TabsTrigger>
          <TabsTrigger value="calendar">
            <Calendar className="h-4 w-4 mr-2" />
            Calendar
          </TabsTrigger>
        </TabsList>
        
        <TabsContent value="overview" className="mt-0">
          {isLoading ? (
            <Card className="w-full p-8 flex justify-center">
              <div className="animate-spin rounded-full h-12 w-12 border-t-2 border-b-2 border-primary"></div>
            </Card>
          ) : (
            <FocusStatsComponent 
              sessions={sessions}
              streakCount={streakCount}
              totalFocusTime={totalFocusTime}
            />
          )}
        </TabsContent>
        
        <TabsContent value="patterns" className="mt-0">
          {/* This would be implemented with the patterns analysis component */}
          <Card>
            <CardHeader>
              <CardTitle>Focus Patterns</CardTitle>
              <CardDescription>Discover your productivity rhythms and patterns</CardDescription>
            </CardHeader>
            <CardContent>
              <p>Detailed pattern analysis will be shown here</p>
            </CardContent>
          </Card>
        </TabsContent>
        
        <TabsContent value="context" className="mt-0">
          {/* This would be implemented with the context analysis component */}
          <Card>
            <CardHeader>
              <CardTitle>Focus Context</CardTitle>
              <CardDescription>Where and when you focus best</CardDescription>
            </CardHeader>
            <CardContent>
              <p>Context-based analysis will be shown here</p>
            </CardContent>
          </Card>
        </TabsContent>
        
        <TabsContent value="calendar" className="mt-0">
          {/* This would be implemented with a calendar view of focus sessions */}
          <Card>
            <CardHeader>
              <CardTitle>Focus Calendar</CardTitle>
              <CardDescription>View your focus sessions on a calendar</CardDescription>
            </CardHeader>
            <CardContent>
              <p>Calendar view will be shown here</p>
            </CardContent>
          </Card>
        </TabsContent>
      </Tabs>
    </div>
  );
};

export default FocusStats; 