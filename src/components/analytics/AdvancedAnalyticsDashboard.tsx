import React, { useState, useEffect } from 'react';
import { useQuery } from '@tanstack/react-query';
import { authenticatedRestCall } from '@/lib/supabase/rest-client';
import { useLocation } from 'react-router-dom';
import {
  Tabs,
  TabsContent,
  TabsList,
  TabsTrigger
} from '@/components/ui/tabs';
import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle
} from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Loader2 } from 'lucide-react';
import { 
  LineChart, Line, BarChart, Bar, PieChart, Pie, Cell, 
  XAxis, YAxis, CartesianGrid, Tooltip, Legend, ResponsiveContainer 
} from 'recharts';
import { toast } from 'sonner';
import { 
  Coins, Cigarette, Brain, Heart, Activity, Zap, Calendar, 
  Users, Smile, Download, Share2, FileText, ChevronRight
} from 'lucide-react';
import HealthcareReports from './HealthcareReports';
import { Session } from '@supabase/supabase-js';

// Utility function to get a color from a gradient based on a value between 0 and 1
const getGradientColor = (value) => {
  // Colors from red to yellow to green
  const colors = [
    '#ef4444', // red
    '#f97316', // orange
    '#eab308', // yellow
    '#84cc16', // lime
    '#22c55e'  // green
  ];
  
  // Make sure value is between 0 and 1
  const safeValue = Math.max(0, Math.min(1, value));
  
  // Calculate which segment of the gradient we're in
  const segment = safeValue * (colors.length - 1);
  const index = Math.floor(segment);
  
  // If we're exactly on a color, return that color
  if (segment === index) return colors[index];
  
  // Otherwise interpolate between two adjacent colors
  const ratio = segment - index;
  const r1 = parseInt(colors[index].substring(1, 3), 16);
  const g1 = parseInt(colors[index].substring(3, 5), 16);
  const b1 = parseInt(colors[index].substring(5, 7), 16);
  const r2 = parseInt(colors[index + 1].substring(1, 3), 16);
  const g2 = parseInt(colors[index + 1].substring(3, 5), 16);
  const b2 = parseInt(colors[index + 1].substring(5, 7), 16);
  
  const r = Math.round(r1 * (1 - ratio) + r2 * ratio);
  const g = Math.round(g1 * (1 - ratio) + g2 * ratio);
  const b = Math.round(b1 * (1 - ratio) + b2 * ratio);
  
  return `#${r.toString(16).padStart(2, '0')}${g.toString(16).padStart(2, '0')}${b.toString(16).padStart(2, '0')}`;
};

// Mock data - in a real app, this would come from the database
const mockData = {
  smokingData: [
    { date: 'Day 1', cigarettes: 20, cravingIntensity: 9, money: 0 },
    { date: 'Day 5', cigarettes: 15, cravingIntensity: 8, money: 25 },
    { date: 'Day 10', cigarettes: 10, cravingIntensity: 7, money: 50 },
    { date: 'Day 15', cigarettes: 5, cravingIntensity: 6, money: 75 },
    { date: 'Day 20', cigarettes: 2, cravingIntensity: 5, money: 90 },
    { date: 'Day 25', cigarettes: 1, cravingIntensity: 4, money: 95 },
    { date: 'Day 30', cigarettes: 0, cravingIntensity: 3, money: 100 },
    { date: 'Day 35', cigarettes: 0, cravingIntensity: 2, money: 120 },
    { date: 'Day 40', cigarettes: 0, cravingIntensity: 1, money: 140 },
  ],
  healthData: [
    { name: 'Heart Rate Recovery', value: 70 },
    { name: 'Blood Pressure Improvement', value: 60 },
    { name: 'Lung Function', value: 50 },
    { name: 'Carbon Monoxide Levels', value: 90 },
    { name: 'Circulation', value: 75 },
  ],
  cognitionData: [
    { date: 'Day 1', focus: 3, memory: 4, mood: 3 },
    { date: 'Day 7', focus: 4, memory: 4, mood: 4 },
    { date: 'Day 14', focus: 5, memory: 5, mood: 5 },
    { date: 'Day 21', focus: 6, memory: 6, mood: 7 },
    { date: 'Day 28', focus: 7, memory: 7, mood: 7 },
    { date: 'Day 35', focus: 8, memory: 8, mood: 8 },
    { date: 'Day 42', focus: 9, memory: 9, mood: 9 },
  ],
  socialData: [
    { name: 'Encouragement Posts', value: 65 },
    { name: 'Supportive Comments', value: 25 },
    { name: 'Group Challenges', value: 10 },
  ],
  topAchievements: [
    { name: '24 Hours Smoke-Free', completed: true, date: '2023-10-01' },
    { name: '3 Days Milestone', completed: true, date: '2023-10-03' },
    { name: '1 Week Champion', completed: true, date: '2023-10-07' },
    { name: '2 Weeks Strong', completed: true, date: '2023-10-14' },
    { name: '1 Month Freedom', completed: false, value: 87 },
  ]
};

const COLORS = ['#0088FE', '#00C49F', '#FFBB28', '#FF8042', '#A28BFF'];

export const AdvancedAnalyticsDashboard = () => {
  const location = useLocation();
  const [activeTab, setActiveTab] = useState('overview');
  
  // Check for tab parameter in URL
  useEffect(() => {
    const params = new URLSearchParams(location.search);
    const tabParam = params.get('tab');
    if (tabParam && ['overview', 'smoking', 'health', 'cognitive', 'social', 'healthcare'].includes(tabParam)) {
      setActiveTab(tabParam);
    }
  }, [location]);
  
  // Fetch user analytics data
  const { data: analyticsData, isLoading, error } = useQuery({
    queryKey: ['userAnalytics'],
    queryFn: async () => {
      // In a real implementation, this would fetch actual user data from Supabase
      const { data: user } = await authenticatedRestCall('/auth/user');
      if (!user) throw new Error('User not authenticated');

      // For now, return mock data
      return mockData;
    }
  });
  
  const downloadAnalytics = () => {
    // In a real implementation, this would generate and download a file
    toast.success('Analytics data downloaded successfully');
  };
  
  if (isLoading) {
    return (
      <div className="flex items-center justify-center min-h-[400px]">
        <Loader2 className="mr-2 h-4 w-4 animate-spin" />
        Loading analytics data...
      </div>
    );
  }
  
  if (error) {
    return (
      <div className="flex flex-col items-center justify-center min-h-[400px] p-6">
        <p className="text-destructive">Failed to load analytics data</p>
        <Button onClick={() => window.location.reload()} variant="outline" className="mt-4">
          Try Again
        </Button>
      </div>
    );
  }

  // At this point, analyticsData is guaranteed to be defined
  const data = analyticsData!;

  return (
    <div className="space-y-6">
      <div className="flex justify-between items-center">
        <h2 className="text-3xl font-bold tracking-tight">Analytics Dashboard</h2>
        <div className="flex space-x-2">
          <Button variant="outline" onClick={downloadAnalytics}>
            <Download className="mr-2 h-4 w-4" />
            Download Data
          </Button>
        </div>
      </div>

      <Tabs defaultValue="overview" value={activeTab} onValueChange={setActiveTab} className="space-y-4">
        <TabsList>
          <TabsTrigger value="overview">Overview</TabsTrigger>
          <TabsTrigger value="smoking">Smoking Behavior</TabsTrigger>
          <TabsTrigger value="health">Health Metrics</TabsTrigger>
          <TabsTrigger value="cognitive">Cognitive Function</TabsTrigger>
          <TabsTrigger value="social">Social Support</TabsTrigger>
          <TabsTrigger value="healthcare">Healthcare Reports</TabsTrigger>
        </TabsList>
        
        <TabsContent value="overview" className="space-y-4">
          <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
            <Card>
              <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
                <CardTitle className="text-sm font-medium">Smoke-Free Days</CardTitle>
                <Calendar className="h-4 w-4 text-muted-foreground" />
              </CardHeader>
              <CardContent>
                <div className="text-2xl font-bold">42 days</div>
                <p className="text-xs text-muted-foreground">
                  You've saved $140 so far
                </p>
              </CardContent>
            </Card>
            <Card>
              <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
                <CardTitle className="text-sm font-medium">Health Improvement</CardTitle>
                <Heart className="h-4 w-4 text-muted-foreground" />
              </CardHeader>
              <CardContent>
                <div className="text-2xl font-bold">68%</div>
                <p className="text-xs text-muted-foreground">
                  Across all measured metrics
                </p>
              </CardContent>
            </Card>
            <Card>
              <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
                <CardTitle className="text-sm font-medium">Current Craving Level</CardTitle>
                <Zap className="h-4 w-4 text-muted-foreground" />
              </CardHeader>
              <CardContent>
                <div className="text-2xl font-bold">Low</div>
                <p className="text-xs text-muted-foreground">
                  85% reduction since starting
                </p>
              </CardContent>
            </Card>
          </div>
          
          <div className="grid grid-cols-1 lg:grid-cols-2 gap-4">
            <Card className="col-span-1">
              <CardHeader>
                <CardTitle>Smoking Reduction Progress</CardTitle>
                <CardDescription>
                  Your journey to becoming smoke-free
                </CardDescription>
              </CardHeader>
              <CardContent className="h-[300px]">
                <ResponsiveContainer width="100%" height="100%">
                  <LineChart
                    data={data.smokingData}
                    margin={{ top: 5, right: 30, left: 20, bottom: 5 }}
                  >
                    <CartesianGrid strokeDasharray="3 3" />
                    <XAxis dataKey="date" />
                    <YAxis />
                    <Tooltip />
                    <Legend />
                    <Line 
                      type="monotone" 
                      dataKey="cigarettes" 
                      stroke="#ef4444" 
                      name="Cigarettes/day"
                    />
                    <Line 
                      type="monotone" 
                      dataKey="cravingIntensity" 
                      stroke="#f97316" 
                      name="Craving Intensity (1-10)"
                    />
                  </LineChart>
                </ResponsiveContainer>
              </CardContent>
            </Card>
            
            <Card className="col-span-1">
              <CardHeader>
                <CardTitle>Recent Achievements</CardTitle>
                <CardDescription>
                  Milestones in your quit journey
                </CardDescription>
              </CardHeader>
              <CardContent>
                <div className="space-y-4">
                  {data.topAchievements.map((achievement, index) => (
                    <div key={index} className="flex items-center justify-between">
                      <div className="flex items-center">
                        {achievement.completed ? (
                          <div className="w-10 h-10 rounded-full bg-primary/20 flex items-center justify-center text-primary">
                            <Smile className="h-5 w-5" />
                          </div>
                        ) : (
                          <div className="w-10 h-10 rounded-full bg-muted flex items-center justify-center text-muted-foreground">
                            <Activity className="h-5 w-5" />
                          </div>
                        )}
                        <div className="ml-4">
                          <p className="text-sm font-medium leading-none">
                            {achievement.name}
                          </p>
                          <p className="text-sm text-muted-foreground">
                            {achievement.completed 
                              ? `Completed on ${achievement.date}` 
                              : `${achievement.value}% progress`
                            }
                          </p>
                        </div>
                      </div>
                      {!achievement.completed && (
                        <div className="w-16 h-2 bg-muted rounded-full overflow-hidden">
                          <div 
                            className="h-full bg-primary" 
                            style={{ width: `${achievement.value}%` }}
                          />
                        </div>
                      )}
                    </div>
                  ))}
                </div>
              </CardContent>
            </Card>
          </div>
          
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            <Card>
              <CardHeader>
                <CardTitle>Health Improvements</CardTitle>
                <CardDescription>
                  Physical changes since quitting
                </CardDescription>
              </CardHeader>
              <CardContent className="h-[300px]">
                <ResponsiveContainer width="100%" height="100%">
                  <BarChart
                    data={data.healthData}
                    layout="vertical"
                    margin={{ top: 5, right: 30, left: 120, bottom: 5 }}
                  >
                    <CartesianGrid strokeDasharray="3 3" />
                    <XAxis type="number" domain={[0, 100]} />
                    <YAxis dataKey="name" type="category" width={100} />
                    <Tooltip />
                    <Bar dataKey="value" name="Improvement (%)">
                      {data.healthData.map((entry, index) => (
                        <Cell key={`cell-${index}`} fill={getGradientColor(entry.value / 100)} />
                      ))}
                    </Bar>
                  </BarChart>
                </ResponsiveContainer>
              </CardContent>
            </Card>
            
            <Card>
              <CardHeader>
                <CardTitle>Community Support</CardTitle>
                <CardDescription>
                  Your social engagement statistics
                </CardDescription>
              </CardHeader>
              <CardContent className="flex justify-center h-[300px]">
                <ResponsiveContainer width="100%" height="100%">
                  <PieChart>
                    <Pie
                      data={data.socialData}
                      cx="50%"
                      cy="50%"
                      innerRadius={70}
                      outerRadius={90}
                      fill="#8884d8"
                      paddingAngle={5}
                      dataKey="value"
                      label={({name, percent}) => `${name} ${(percent * 100).toFixed(0)}%`}
                    >
                      {data.socialData.map((entry, index) => (
                        <Cell key={`cell-${index}`} fill={COLORS[index % COLORS.length]} />
                      ))}
                    </Pie>
                    <Tooltip />
                  </PieChart>
                </ResponsiveContainer>
              </CardContent>
            </Card>
          </div>
          
          <Button variant="outline" className="w-full" onClick={() => setActiveTab('healthcare')}>
            <FileText className="mr-2 h-4 w-4" />
            Generate Healthcare Provider Report
            <ChevronRight className="ml-2 h-4 w-4" />
          </Button>
        </TabsContent>
        
        <TabsContent value="smoking" className="space-y-4">
          {/* Smoking behavior specific analysis */}
          <Card>
            <CardHeader>
              <CardTitle>Detailed Smoking Patterns</CardTitle>
              <CardDescription>
                Comprehensive analysis of your smoking behavior
              </CardDescription>
            </CardHeader>
            <CardContent className="h-[400px]">
              <ResponsiveContainer width="100%" height="100%">
                <LineChart
                  data={data.smokingData}
                  margin={{ top: 5, right: 30, left: 20, bottom: 5 }}
                >
                  <CartesianGrid strokeDasharray="3 3" />
                  <XAxis dataKey="date" />
                  <YAxis yAxisId="left" />
                  <YAxis yAxisId="right" orientation="right" />
                  <Tooltip />
                  <Legend />
                  <Line 
                    yAxisId="left"
                    type="monotone" 
                    dataKey="cigarettes" 
                    stroke="#ef4444" 
                    name="Cigarettes/day"
                  />
                  <Line 
                    yAxisId="left"
                    type="monotone" 
                    dataKey="cravingIntensity" 
                    stroke="#f97316" 
                    name="Craving Intensity (1-10)"
                  />
                  <Line 
                    yAxisId="right"
                    type="monotone" 
                    dataKey="money" 
                    stroke="#22c55e" 
                    name="Money Saved ($)"
                  />
                </LineChart>
              </ResponsiveContainer>
            </CardContent>
          </Card>
          
          {/* Additional smoking insights would go here */}
        </TabsContent>
        
        <TabsContent value="health" className="space-y-4">
          {/* Health metrics specific analysis */}
          <Card>
            <CardHeader>
              <CardTitle>Health Recovery Timeline</CardTitle>
              <CardDescription>
                Scientific timeline of your body's recovery
              </CardDescription>
            </CardHeader>
            <CardContent>
              <div className="space-y-8">
                <div className="relative">
                  <div className="absolute h-full w-px bg-muted left-9 top-0"></div>
                  
                  <div className="mb-8 grid grid-cols-[72px_1fr] gap-4 relative">
                    <div className="flex h-18 w-18 items-center justify-center rounded-full border bg-background z-10">
                      <Heart className="h-8 w-8 text-primary" />
                    </div>
                    <div>
                      <h3 className="font-semibold">20 Minutes</h3>
                      <p className="text-sm text-muted-foreground mb-2">Heart rate and blood pressure drop</p>
                      <div className="h-2 w-full bg-muted rounded-full overflow-hidden">
                        <div className="h-full bg-primary" style={{ width: '100%' }} />
                      </div>
                    </div>
                  </div>
                  
                  <div className="mb-8 grid grid-cols-[72px_1fr] gap-4 relative">
                    <div className="flex h-18 w-18 items-center justify-center rounded-full border bg-background z-10">
                      <Activity className="h-8 w-8 text-primary" />
                    </div>
                    <div>
                      <h3 className="font-semibold">12 Hours</h3>
                      <p className="text-sm text-muted-foreground mb-2">Carbon monoxide level in blood drops to normal</p>
                      <div className="h-2 w-full bg-muted rounded-full overflow-hidden">
                        <div className="h-full bg-primary" style={{ width: '100%' }} />
                      </div>
                    </div>
                  </div>
                  
                  <div className="mb-8 grid grid-cols-[72px_1fr] gap-4 relative">
                    <div className="flex h-18 w-18 items-center justify-center rounded-full border bg-background z-10">
                      <Zap className="h-8 w-8 text-primary" />
                    </div>
                    <div>
                      <h3 className="font-semibold">2-3 Days</h3>
                      <p className="text-sm text-muted-foreground mb-2">Nerve endings start to regrow, sense of smell and taste improve</p>
                      <div className="h-2 w-full bg-muted rounded-full overflow-hidden">
                        <div className="h-full bg-primary" style={{ width: '100%' }} />
                      </div>
                    </div>
                  </div>
                  
                  <div className="mb-8 grid grid-cols-[72px_1fr] gap-4 relative">
                    <div className="flex h-18 w-18 items-center justify-center rounded-full border bg-background z-10">
                      <Brain className="h-8 w-8 text-primary" />
                    </div>
                    <div>
                      <h3 className="font-semibold">1-3 Months</h3>
                      <p className="text-sm text-muted-foreground mb-2">Circulation, lung function, and energy levels improve</p>
                      <div className="h-2 w-full bg-muted rounded-full overflow-hidden">
                        <div className="h-full bg-primary" style={{ width: '90%' }} />
                      </div>
                    </div>
                  </div>
                  
                  <div className="grid grid-cols-[72px_1fr] gap-4 relative">
                    <div className="flex h-18 w-18 items-center justify-center rounded-full border bg-muted z-10">
                      <Heart className="h-8 w-8 text-muted-foreground" />
                    </div>
                    <div>
                      <h3 className="font-semibold">1 Year</h3>
                      <p className="text-sm text-muted-foreground mb-2">Risk of coronary heart disease drops to half that of a smoker</p>
                      <div className="h-2 w-full bg-muted rounded-full overflow-hidden">
                        <div className="h-full bg-primary" style={{ width: '12%' }} />
                      </div>
                    </div>
                  </div>
                </div>
              </div>
            </CardContent>
          </Card>
        </TabsContent>
        
        <TabsContent value="cognitive" className="space-y-4">
          {/* Cognitive function specific analysis */}
          <Card>
            <CardHeader>
              <CardTitle>Cognitive Function Improvement</CardTitle>
              <CardDescription>
                Changes in focus, memory, and mood since quitting
              </CardDescription>
            </CardHeader>
            <CardContent className="h-[400px]">
              <ResponsiveContainer width="100%" height="100%">
                <LineChart
                  data={data.cognitionData}
                  margin={{ top: 5, right: 30, left: 20, bottom: 5 }}
                >
                  <CartesianGrid strokeDasharray="3 3" />
                  <XAxis dataKey="date" />
                  <YAxis domain={[0, 10]} />
                  <Tooltip />
                  <Legend />
                  <Line 
                    type="monotone" 
                    dataKey="focus" 
                    stroke="#0ea5e9" 
                    name="Focus (1-10)"
                  />
                  <Line 
                    type="monotone" 
                    dataKey="memory" 
                    stroke="#8b5cf6" 
                    name="Memory (1-10)"
                  />
                  <Line 
                    type="monotone" 
                    dataKey="mood" 
                    stroke="#22c55e" 
                    name="Mood (1-10)"
                  />
                </LineChart>
              </ResponsiveContainer>
            </CardContent>
          </Card>
        </TabsContent>
        
        <TabsContent value="social" className="space-y-4">
          {/* Social support specific analysis */}
          <Card>
            <CardHeader>
              <CardTitle>Community Engagement</CardTitle>
              <CardDescription>
                Your interactions with the support community
              </CardDescription>
            </CardHeader>
            <CardContent>
              <div className="space-y-6">
                <div className="flex items-center">
                  <div className="w-16 h-16 rounded-full bg-primary/20 flex items-center justify-center text-primary">
                    <Users className="h-8 w-8" />
                  </div>
                  <div className="ml-4">
                    <p className="text-xl font-medium">85% of users</p>
                    <p className="text-sm text-muted-foreground">
                      found social support critical to success
                    </p>
                  </div>
                </div>
                
                <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
                  <Card>
                    <CardHeader className="pb-2">
                      <CardTitle className="text-sm">Posts Created</CardTitle>
                    </CardHeader>
                    <CardContent>
                      <div className="text-2xl font-bold">12</div>
                    </CardContent>
                  </Card>
                  <Card>
                    <CardHeader className="pb-2">
                      <CardTitle className="text-sm">Comments Made</CardTitle>
                    </CardHeader>
                    <CardContent>
                      <div className="text-2xl font-bold">48</div>
                    </CardContent>
                  </Card>
                  <Card>
                    <CardHeader className="pb-2">
                      <CardTitle className="text-sm">Kudos Received</CardTitle>
                    </CardHeader>
                    <CardContent>
                      <div className="text-2xl font-bold">156</div>
                    </CardContent>
                  </Card>
                </div>
                
                <div className="space-y-2">
                  <h3 className="font-semibold">Recent Support Interactions</h3>
                  <div className="space-y-2">
                    <div className="p-3 border rounded-lg">
                      <p className="text-sm font-medium">Sam H. sent you words of encouragement</p>
                      <p className="text-xs text-muted-foreground">2 days ago</p>
                    </div>
                    <div className="p-3 border rounded-lg">
                      <p className="text-sm font-medium">You completed the "Week 6 Check-in" challenge</p>
                      <p className="text-xs text-muted-foreground">3 days ago</p>
                    </div>
                    <div className="p-3 border rounded-lg">
                      <p className="text-sm font-medium">Taylor K. commented on your milestone post</p>
                      <p className="text-xs text-muted-foreground">5 days ago</p>
                    </div>
                  </div>
                </div>
                
                <Button className="w-full">
                  <Share2 className="mr-2 h-4 w-4" />
                  Share Your Progress Story
                </Button>
              </div>
            </CardContent>
          </Card>
        </TabsContent>
        
        <TabsContent value="healthcare" className="space-y-4">
          <HealthcareReports />
        </TabsContent>
      </Tabs>
    </div>
  );
};

export default AdvancedAnalyticsDashboard; 