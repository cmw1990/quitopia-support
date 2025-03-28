import React, { useState, useEffect } from 'react';
import { Card, CardContent, CardDescription, CardHeader, CardTitle, Button, Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '../ui';
import { Session } from '@supabase/supabase-js';
import { Award, Download, RefreshCw, Trophy, Star, Medal, Calendar, Users, Flame, Heart, Brain, Leaf } from 'lucide-react';
import { format } from 'date-fns';
import useOfflineStatus from '../../hooks/useOfflineStatus';
import { 
  BarChart, 
  Bar, 
  XAxis, 
  YAxis, 
  CartesianGrid, 
  Tooltip, 
  ResponsiveContainer, 
  PieChart, 
  Pie, 
  Cell, 
  Legend,
  RadarChart,
  PolarGrid,
  PolarAngleAxis,
  PolarRadiusAxis,
  Radar
} from 'recharts';
import { toast } from 'sonner';
import { fetchAchievementsData, AchievementEntry } from '../../api/analyticsClient';

interface AchievementsAnalyticsProps {
  session: Session | null;
}

interface CategoryData {
  name: string;
  count: number;
  color: string;
}

interface TimelineData {
  date: string;
  count: number;
}

export const AchievementsAnalytics: React.FC<AchievementsAnalyticsProps> = ({ session }) => {
  const [achievementsData, setAchievementsData] = useState<AchievementEntry[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [dateRange, setDateRange] = useState<'30days' | '90days' | '180days' | 'all'>('all');
  const { isOnline } = useOfflineStatus();
  
  // Calculated metrics
  const [totalAchievements, setTotalAchievements] = useState(0);
  const [completedAchievements, setCompletedAchievements] = useState(0);
  const [recentUnlocks, setRecentUnlocks] = useState<AchievementEntry[]>([]);
  const [categoryDistribution, setCategoryDistribution] = useState<CategoryData[]>([]);
  const [completionTimeline, setCompletionTimeline] = useState<TimelineData[]>([]);
  const [radarData, setRadarData] = useState<any[]>([]);
  
  // Colors for charts
  const COLORS = ['#0088FE', '#00C49F', '#FFBB28', '#FF8042', '#8884d8', '#82ca9d', '#ff6b81', '#36a2eb'];
  
  // Map of category to icon and color
  const CATEGORY_INFO: Record<string, { icon: React.ReactNode, color: string }> = {
    'milestone': { icon: <Trophy size={16} />, color: '#FFBB28' },
    'streak': { icon: <Flame size={16} />, color: '#FF8042' },
    'progress': { icon: <Medal size={16} />, color: '#0088FE' },
    'action': { icon: <Star size={16} />, color: '#00C49F' },
    'holistic': { icon: <Leaf size={16} />, color: '#8884d8' },
    'health': { icon: <Heart size={16} />, color: '#ff6b81' },
    'focus': { icon: <Brain size={16} />, color: '#36a2eb' },
    'community': { icon: <Users size={16} />, color: '#82ca9d' }
  };
  
  // Fetch achievements data
  const fetchAchievementsDataForAnalytics = async () => {
    if (!session?.user?.id) {
      setIsLoading(false);
      return;
    }
    
    try {
      setIsLoading(true);
      
      // Fetch real data from Supabase using our analyticsClient
      const data = await fetchAchievementsData(session.user.id, dateRange, session);
      
      if (data.length === 0) {
        toast.info("No achievements data found. Keep using the app to earn achievements!");
      }
      
      setAchievementsData(data);
      
      // Calculate metrics from the real data
      calculateMetrics(data);
    } catch (error) {
      console.error('Error fetching achievements data:', error);
      toast.error('Failed to load achievements analytics. Using cached data if available.');
    } finally {
      setIsLoading(false);
    }
  };
  
  // Calculate metrics from achievements data
  const calculateMetrics = (data: AchievementEntry[]) => {
    if (data.length === 0) {
      setTotalAchievements(0);
      setCompletedAchievements(0);
      setRecentUnlocks([]);
      setCategoryDistribution([]);
      setCompletionTimeline([]);
      setRadarData([]);
      return;
    }
    
    // Total achievements
    setTotalAchievements(data.length);
    
    // Completed achievements
    const completed = data.filter(a => a.is_complete);
    setCompletedAchievements(completed.length);
    
    // Recent unlocks (last 5)
    const sorted = [...completed].sort((a, b) => 
      new Date(b.unlocked_at || 0).getTime() - new Date(a.unlocked_at || 0).getTime()
    );
    setRecentUnlocks(sorted.slice(0, 5));
    
    // Category distribution
    const categories: Record<string, number> = {};
    data.filter(a => a.is_complete).forEach(achievement => {
      const category = achievement.category;
      categories[category] = (categories[category] || 0) + 1;
    });
    
    const categoryData = Object.entries(categories).map(([name, count], index) => ({
      name,
      count,
      color: CATEGORY_INFO[name]?.color || COLORS[index % COLORS.length]
    }));
    setCategoryDistribution(categoryData);
    
    // Completion timeline
    const timeline: Record<string, number> = {};
    
    completed.forEach(achievement => {
      if (achievement.unlocked_at) {
        const date = format(new Date(achievement.unlocked_at), 'MMM d');
        timeline[date] = (timeline[date] || 0) + 1;
      }
    });
    
    const timelineData = Object.entries(timeline)
      .map(([date, count]) => ({ date, count }))
      .sort((a, b) => new Date(a.date).getTime() - new Date(b.date).getTime());
    
    setCompletionTimeline(timelineData);
    
    // Radar chart data for category completion percentage
    const categoryCounts: Record<string, { total: number, completed: number }> = {};
    
    data.forEach(achievement => {
      const category = achievement.category;
      if (!categoryCounts[category]) {
        categoryCounts[category] = { total: 0, completed: 0 };
      }
      
      categoryCounts[category].total += 1;
      if (achievement.is_complete) {
        categoryCounts[category].completed += 1;
      }
    });
    
    const radarChartData = Object.entries(categoryCounts).map(([category, counts]) => ({
      subject: category.charAt(0).toUpperCase() + category.slice(1),
      A: Math.round((counts.completed / counts.total) * 100)
    }));
    
    setRadarData(radarChartData);
  };
  
  useEffect(() => {
    fetchAchievementsDataForAnalytics();
  }, [session, dateRange]);
  
  // Custom tooltip for charts
  const CustomTooltip = ({ active, payload, label }: any) => {
    if (active && payload && payload.length) {
      return (
        <div className="bg-white dark:bg-gray-800 p-2 border shadow-sm rounded-md text-sm">
          <p className="font-medium">{label}</p>
          {payload.map((entry: any, index: number) => (
            <p key={index} style={{ color: entry.color }}>
              {entry.name}: {entry.value}
            </p>
          ))}
        </div>
      );
    }
    return null;
  };
  
  // Custom pie chart label
  const renderCustomizedLabel = ({ cx, cy, midAngle, innerRadius, outerRadius, percent, index, name }: any) => {
    const RADIAN = Math.PI / 180;
    const radius = innerRadius + (outerRadius - innerRadius) * 0.6;
    const x = cx + radius * Math.cos(-midAngle * RADIAN);
    const y = cy + radius * Math.sin(-midAngle * RADIAN);
    
    return (
      <text x={x} y={y} fill="white" textAnchor={x > cx ? 'start' : 'end'} dominantBaseline="central">
        {`${name}: ${(percent * 100).toFixed(0)}%`}
      </text>
    );
  };
  
  // Handle data export
  const handleDataExport = () => {
    if (achievementsData.length === 0) {
      toast.error("No data to export");
      return;
    }
    
    try {
      // Prepare data for CSV
      const headers = "Title,Description,Category,Progress,Is Complete,Unlocked At,Points\n";
      const csvData = achievementsData.map(item => {
        const unlockedDate = item.unlocked_at ? format(new Date(item.unlocked_at), 'yyyy-MM-dd') : '';
        return `"${item.title}","${item.description}","${item.category}",${item.progress},${item.is_complete ? 'Yes' : 'No'},"${unlockedDate}",${item.points}`;
      }).join('\n');
      
      const blob = new Blob([headers + csvData], { type: 'text/csv' });
      const url = URL.createObjectURL(blob);
      const a = document.createElement('a');
      a.href = url;
      a.download = `achievements-data-${format(new Date(), 'yyyy-MM-dd')}.csv`;
      document.body.appendChild(a);
      a.click();
      document.body.removeChild(a);
      URL.revokeObjectURL(url);
      
      toast.success("Data exported successfully");
    } catch (error) {
      console.error("Error exporting data:", error);
      toast.error("Failed to export data");
    }
  };
  
  return (
    <div className="space-y-6">
      <div className="flex flex-col sm:flex-row sm:justify-between sm:items-center gap-4">
        <div>
          <h2 className="text-2xl font-bold">Achievements Analytics</h2>
          <p className="text-muted-foreground">Track your milestones and badges</p>
        </div>
        
        <div className="flex items-center gap-2">
          <Select value={dateRange} onValueChange={(value: any) => setDateRange(value)}>
            <SelectTrigger className="w-[160px]">
              <SelectValue placeholder="Select time range" />
            </SelectTrigger>
            <SelectContent>
              <SelectItem value="30days">Last 30 days</SelectItem>
              <SelectItem value="90days">Last 90 days</SelectItem>
              <SelectItem value="180days">Last 180 days</SelectItem>
              <SelectItem value="all">All time</SelectItem>
            </SelectContent>
          </Select>
          
          <Button variant="outline" size="icon" onClick={fetchAchievementsDataForAnalytics} disabled={isLoading}>
            <RefreshCw className={`h-4 w-4 ${isLoading ? 'animate-spin' : ''}`} />
          </Button>
          
          <Button variant="outline" size="icon" onClick={handleDataExport} disabled={achievementsData.length === 0}>
            <Download className="h-4 w-4" />
          </Button>
        </div>
      </div>
      
      {/* Summary Cards */}
      <div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-3">
        <Card>
          <CardHeader className="pb-2">
            <CardTitle className="text-sm font-medium flex items-center">
              <Trophy className="h-4 w-4 mr-2 text-amber-500" />
              Total Achievements
            </CardTitle>
          </CardHeader>
          <CardContent>
            <div className="flex items-baseline">
              <div className="text-3xl font-bold">{completedAchievements}</div>
              <div className="ml-2 text-sm text-muted-foreground">of {totalAchievements}</div>
            </div>
            <p className="text-xs text-muted-foreground mt-1">
              {totalAchievements > 0 
                ? `${Math.round((completedAchievements / totalAchievements) * 100)}% completion rate` 
                : 'No achievements available'}
            </p>
          </CardContent>
        </Card>
        
        <Card>
          <CardHeader className="pb-2">
            <CardTitle className="text-sm font-medium flex items-center">
              <Star className="h-4 w-4 mr-2 text-amber-500" />
              Achievement Points
            </CardTitle>
          </CardHeader>
          <CardContent>
            <div className="flex items-baseline">
              <div className="text-3xl font-bold">
                {achievementsData
                  .filter(a => a.is_complete)
                  .reduce((sum, a) => sum + (a.points || 0), 0)}
              </div>
              <div className="ml-1 text-sm text-muted-foreground">pts</div>
            </div>
            <p className="text-xs text-muted-foreground mt-1">
              Total points earned from achievements
            </p>
          </CardContent>
        </Card>
        
        <Card>
          <CardHeader className="pb-2">
            <CardTitle className="text-sm font-medium flex items-center">
              <Calendar className="h-4 w-4 mr-2 text-blue-500" />
              Recent Unlocks
            </CardTitle>
          </CardHeader>
          <CardContent>
            <div className="text-sm">
              {recentUnlocks.length > 0 ? (
                <div className="space-y-1">
                  {recentUnlocks.slice(0, 3).map((achievement, i) => (
                    <div key={i} className="flex items-center justify-between">
                      <span className="truncate" title={achievement.title}>
                        {achievement.title}
                      </span>
                      <span className="text-xs text-muted-foreground">
                        {achievement.unlocked_at && format(new Date(achievement.unlocked_at), 'MM/dd')}
                      </span>
                    </div>
                  ))}
                </div>
              ) : (
                <span className="text-muted-foreground">No recent unlocks</span>
              )}
            </div>
          </CardContent>
        </Card>
      </div>
      
      {/* No Data State */}
      {achievementsData.length === 0 && !isLoading && (
        <Card className="w-full p-6 text-center">
          <div className="flex flex-col items-center justify-center py-10">
            <Award className="h-12 w-12 text-muted-foreground mb-4" />
            <h3 className="text-lg font-medium mb-2">No Achievements Data Available</h3>
            <p className="text-muted-foreground mb-4">
              {isOnline 
                ? "You haven't earned any achievements yet. Keep using the app to unlock more badges and milestones!"
                : "You appear to be offline. Connect to the internet to fetch your data."}
            </p>
            {isOnline && (
              <Button 
                variant="outline" 
                onClick={() => window.location.href = "/app/achievements"}
              >
                View Achievements
              </Button>
            )}
          </div>
        </Card>
      )}
      
      {/* Loading State */}
      {isLoading && (
        <Card className="w-full p-6 text-center">
          <div className="flex flex-col items-center justify-center py-10">
            <RefreshCw className="h-12 w-12 text-primary mb-4 animate-spin" />
            <h3 className="text-lg font-medium">Loading Analytics</h3>
            <p className="text-muted-foreground">Please wait while we fetch your data...</p>
          </div>
        </Card>
      )}
      
      {/* Charts - Only show if we have data */}
      {achievementsData.length > 0 && !isLoading && (
        <>
          <div className="grid gap-4 md:grid-cols-2">
            {/* Category Distribution */}
            <Card>
              <CardHeader>
                <CardTitle>Achievement Categories</CardTitle>
                <CardDescription>Distribution by category</CardDescription>
              </CardHeader>
              <CardContent>
                <div className="h-72">
                  {categoryDistribution.length > 0 ? (
                    <ResponsiveContainer width="100%" height="100%">
                      <PieChart>
                        <Pie
                          data={categoryDistribution}
                          cx="50%"
                          cy="50%"
                          labelLine={false}
                          label={renderCustomizedLabel}
                          outerRadius={80}
                          fill="#8884d8"
                          dataKey="count"
                        >
                          {categoryDistribution.map((entry, index) => (
                            <Cell key={`cell-${index}`} fill={entry.color} />
                          ))}
                        </Pie>
                        <Tooltip />
                        <Legend />
                      </PieChart>
                    </ResponsiveContainer>
                  ) : (
                    <div className="flex flex-col items-center justify-center h-full">
                      <p className="text-muted-foreground">No category data available</p>
                    </div>
                  )}
                </div>
              </CardContent>
            </Card>
            
            {/* Completion Timeline */}
            <Card>
              <CardHeader>
                <CardTitle>Achievement Timeline</CardTitle>
                <CardDescription>Unlocks over time</CardDescription>
              </CardHeader>
              <CardContent>
                <div className="h-72">
                  {completionTimeline.length > 0 ? (
                    <ResponsiveContainer width="100%" height="100%">
                      <BarChart
                        data={completionTimeline}
                        margin={{ top: 10, right: 30, left: 0, bottom: 20 }}
                      >
                        <CartesianGrid strokeDasharray="3 3" opacity={0.2} />
                        <XAxis 
                          dataKey="date" 
                          tick={{ fontSize: 12 }}
                          angle={-45}
                          textAnchor="end"
                          height={50}
                        />
                        <YAxis />
                        <Tooltip content={<CustomTooltip />} />
                        <Bar 
                          dataKey="count" 
                          name="Achievements" 
                          fill="#8884d8" 
                        />
                      </BarChart>
                    </ResponsiveContainer>
                  ) : (
                    <div className="flex flex-col items-center justify-center h-full">
                      <p className="text-muted-foreground">No timeline data available</p>
                    </div>
                  )}
                </div>
              </CardContent>
            </Card>
          </div>
          
          {/* Category Completion Radar */}
          <Card>
            <CardHeader>
              <CardTitle>Achievement Progress by Category</CardTitle>
              <CardDescription>Percentage completed in each category</CardDescription>
            </CardHeader>
            <CardContent>
              <div className="h-80">
                {radarData.length > 0 ? (
                  <ResponsiveContainer width="100%" height="100%">
                    <RadarChart cx="50%" cy="50%" outerRadius="80%" data={radarData}>
                      <PolarGrid />
                      <PolarAngleAxis dataKey="subject" />
                      <PolarRadiusAxis angle={30} domain={[0, 100]} />
                      <Radar name="Completion %" dataKey="A" stroke="#8884d8" fill="#8884d8" fillOpacity={0.6} />
                      <Legend />
                      <Tooltip />
                    </RadarChart>
                  </ResponsiveContainer>
                ) : (
                  <div className="flex flex-col items-center justify-center h-full">
                    <p className="text-muted-foreground">No radar data available</p>
                  </div>
                )}
              </div>
            </CardContent>
          </Card>
          
          {/* Recent Achievements */}
          <Card>
            <CardHeader>
              <CardTitle>Recently Unlocked Achievements</CardTitle>
              <CardDescription>Your latest milestones</CardDescription>
            </CardHeader>
            <CardContent>
              <div className="space-y-4">
                {recentUnlocks.length > 0 ? (
                  recentUnlocks.map((achievement, index) => (
                    <div key={index} className="flex items-start space-x-4 p-3 rounded-lg bg-muted/30">
                      <div className={`p-2 rounded-full`} style={{ backgroundColor: CATEGORY_INFO[achievement.category]?.color + '20' }}>
                        {CATEGORY_INFO[achievement.category]?.icon || <Award size={16} />}
                      </div>
                      <div className="space-y-1">
                        <div className="font-medium">{achievement.title}</div>
                        <div className="text-sm text-muted-foreground">{achievement.description}</div>
                        <div className="flex items-center text-xs">
                          <span className="text-muted-foreground">Unlocked: </span>
                          <span className="ml-1 font-medium">
                            {achievement.unlocked_at && format(new Date(achievement.unlocked_at), 'PPP')}
                          </span>
                          <span className="ml-2 px-2 py-0.5 rounded-full text-xs bg-primary/10 text-primary">
                            +{achievement.points || 0} pts
                          </span>
                        </div>
                      </div>
                    </div>
                  ))
                ) : (
                  <div className="text-center py-6 text-muted-foreground">
                    No achievements unlocked yet
                  </div>
                )}
              </div>
            </CardContent>
          </Card>
        </>
      )}
    </div>
  );
};

export default AchievementsAnalytics; 