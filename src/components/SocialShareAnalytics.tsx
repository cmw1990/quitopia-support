import React, { useState, useEffect } from 'react';
import { useAuth } from './AuthProvider';
import { format, subDays, startOfMonth, endOfMonth } from 'date-fns';
import { toast } from 'sonner';
import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle
} from './ui/card';
import {
  Tabs,
  TabsContent,
  TabsList,
  TabsTrigger
} from './ui/tabs';
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue
} from './ui/select';
import { Button } from './ui/button';
import { getShareAnalytics, getShareAnalyticsSummary, ShareAnalytics, ShareAnalyticsSummary } from "../api/apiCompatibility";
import { BarChart, Bar, XAxis, YAxis, CartesianGrid, Tooltip, Legend, ResponsiveContainer } from 'recharts';
import { PieChart, Pie, Cell } from 'recharts';

export function SocialShareAnalytics() {
  const { session } = useAuth();
  const [timeRange, setTimeRange] = useState<'7days' | '30days' | 'month'>('30days');
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [analytics, setAnalytics] = useState<ShareAnalytics[]>([]);
  const [summary, setSummary] = useState<ShareAnalyticsSummary | null>(null);

  // Get date range based on selected time range
  const getDateRange = () => {
    const today = new Date();
    
    if (timeRange === '7days') {
      return {
        start: format(subDays(today, 7), 'yyyy-MM-dd'),
        end: format(today, 'yyyy-MM-dd')
      };
    } else if (timeRange === '30days') {
      return {
        start: format(subDays(today, 30), 'yyyy-MM-dd'),
        end: format(today, 'yyyy-MM-dd')
      };
    } else {
      return {
        start: format(startOfMonth(today), 'yyyy-MM-dd'),
        end: format(endOfMonth(today), 'yyyy-MM-dd')
      };
    }
  };

  // Fetch analytics data
  useEffect(() => {
    const fetchAnalytics = async () => {
      if (!session?.user?.id) {
        setLoading(false);
        return;
      }
      
      setLoading(true);
      setError(null);
      
      try {
        // Determine date range
        let startDate, endDate;
        
        if (timeRange === '7days') {
          startDate = format(subDays(new Date(), 7), 'yyyy-MM-dd');
          endDate = format(new Date(), 'yyyy-MM-dd');
        } else if (timeRange === '30days') {
          startDate = format(subDays(new Date(), 30), 'yyyy-MM-dd');
          endDate = format(new Date(), 'yyyy-MM-dd');
        } else {
          startDate = format(startOfMonth(new Date()), 'yyyy-MM-dd');
          endDate = format(endOfMonth(new Date()), 'yyyy-MM-dd');
        }
        
        // Fetch analytics data
        const analyticsData = await getShareAnalytics(
          session.user.id,
          startDate,
          endDate,
          session
        );
        setAnalytics(analyticsData);
        
        // Fetch summary data
        const summaryData = await getShareAnalyticsSummary(
          session.user.id,
          session
        );
        setSummary(summaryData);
      } catch (err) {
        console.error('Error fetching share analytics:', err);
        setError(err instanceof Error ? err.message : 'Failed to load share analytics data');
        toast.error(err instanceof Error ? err.message : 'Failed to load share analytics data');
      } finally {
        setLoading(false);
      }
    };
    
    fetchAnalytics();
  }, [timeRange, session]);

  const refreshData = () => {
    const fetchAnalytics = async () => {
      if (!session?.user?.id) {
        setLoading(false);
        return;
      }
      
      setLoading(true);
      setError(null);
      
      try {
        // Determine date range
        let startDate, endDate;
        
        if (timeRange === '7days') {
          startDate = format(subDays(new Date(), 7), 'yyyy-MM-dd');
          endDate = format(new Date(), 'yyyy-MM-dd');
        } else if (timeRange === '30days') {
          startDate = format(subDays(new Date(), 30), 'yyyy-MM-dd');
          endDate = format(new Date(), 'yyyy-MM-dd');
        } else {
          startDate = format(startOfMonth(new Date()), 'yyyy-MM-dd');
          endDate = format(endOfMonth(new Date()), 'yyyy-MM-dd');
        }
        
        // Fetch analytics data
        const analyticsData = await getShareAnalytics(
          session.user.id,
          startDate,
          endDate,
          session
        );
        setAnalytics(analyticsData);
        
        // Fetch summary data
        const summaryData = await getShareAnalyticsSummary(
          session.user.id,
          session
        );
        setSummary(summaryData);
      } catch (err) {
        console.error('Error fetching share analytics:', err);
        setError(err instanceof Error ? err.message : 'Failed to load share analytics data');
        toast.error(err instanceof Error ? err.message : 'Failed to load share analytics data');
      } finally {
        setLoading(false);
      }
    };
    
    fetchAnalytics();
  };

  // Format platform name for display
  const formatPlatformName = (platform: string) => {
    return platform.charAt(0).toUpperCase() + platform.slice(1);
  };

  // Format item type for display
  const formatItemType = (itemType: string) => {
    switch (itemType) {
      case 'achievement':
        return 'Achievement';
      case 'progress':
        return 'Progress';
      case 'milestone':
        return 'Milestone';
      default:
        return itemType.charAt(0).toUpperCase() + itemType.slice(1);
    }
  };

  // Render loading state
  if (loading && !analytics.length) {
    return <div className="p-8 text-center">Loading share analytics...</div>;
  }

  // Render error state
  if (error && !analytics.length) {
    return (
      <div className="p-8 text-center text-red-500">
        <p>Error loading share analytics: {error}</p>
        <Button onClick={refreshData} className="mt-4">Retry</Button>
      </div>
    );
  }

  // Summary statistics cards
  const renderSummaryCards = () => {
    if (!summary) return null;

    return (
      <div className="grid grid-cols-1 md:grid-cols-3 gap-4 mb-6">
        <Card>
          <CardHeader className="pb-2">
            <CardTitle className="text-lg">Total Shares</CardTitle>
          </CardHeader>
          <CardContent>
            <p className="text-3xl font-bold">{summary.total_shares}</p>
          </CardContent>
        </Card>
        
        <Card>
          <CardHeader className="pb-2">
            <CardTitle className="text-lg">Share Success Rate</CardTitle>
          </CardHeader>
          <CardContent>
            <p className="text-3xl font-bold">
              {summary.total_signups && summary.total_shares
                ? `${Math.round((summary.total_signups / summary.total_shares) * 100)}%`
                : '0%'}
            </p>
          </CardContent>
        </Card>
        
        <Card>
          <CardHeader className="pb-2">
            <CardTitle className="text-lg">Click Through Rate</CardTitle>
          </CardHeader>
          <CardContent>
            <p className="text-3xl font-bold">
              {summary.total_clicks ? `${Math.round((summary.total_clicks / summary.total_shares) * 100)}%` : '0%'}
            </p>
          </CardContent>
        </Card>
        
        <Card>
          <CardHeader className="pb-2">
            <CardTitle className="text-lg">Conversion Rate</CardTitle>
          </CardHeader>
          <CardContent>
            <p className="text-3xl font-bold">{summary.conversion_rate ? `${Math.round(summary.conversion_rate * 100)}%` : '0%'}</p>
          </CardContent>
        </Card>
      </div>
    );
  };
  
  // Platform breakdown chart
  const renderPlatformChart = () => {
    if (!summary) return null;
    
    // Transform the data for the chart
    const platformData = summary.shares_by_platform.map(item => ({
      name: formatPlatformName(item.platform),
      value: item.count
    }));

    return (
      <div className="h-[300px] w-full">
        <ResponsiveContainer width="100%" height="100%">
          <PieChart>
            <Pie
              data={platformData}
              cx="50%"
              cy="50%"
              labelLine={false}
              outerRadius={80}
              fill="#8884d8"
              dataKey="value"
            >
              {platformData.map((entry, index) => (
                <Cell key={`cell-${index}`} fill={`#${Math.floor(Math.random() * 0xFFFFFF).toString(16)}`} />
              ))}
            </Pie>
            <Tooltip
              labelFormatter={(value) => {
                return formatPlatformName(value.name);
              }}
            />
            <Legend />
          </PieChart>
        </ResponsiveContainer>
      </div>
    );
  };

  return (
    <div className="container mx-auto p-4">
      <div className="flex justify-between items-center mb-6">
        <h1 className="text-2xl font-bold">Social Sharing Analytics</h1>
        
        <div className="flex items-center gap-4">
          <Select
            value={timeRange}
            onValueChange={(value) => setTimeRange(value as any)}
          >
            <SelectTrigger className="w-[180px]">
              <SelectValue placeholder="Select time range" />
            </SelectTrigger>
            <SelectContent>
              <SelectItem value="7days">Last 7 days</SelectItem>
              <SelectItem value="30days">Last 30 days</SelectItem>
              <SelectItem value="month">This month</SelectItem>
            </SelectContent>
          </Select>
          
          <Button onClick={refreshData} variant="outline" size="sm">
            Refresh
          </Button>
        </div>
      </div>
      {renderSummaryCards()}
      <Tabs defaultValue="overview" className="w-full">
        <TabsList className="mb-4">
          <TabsTrigger value="overview">Overview</TabsTrigger>
          <TabsTrigger value="platforms">Platforms</TabsTrigger>
          <TabsTrigger value="content-type">Content Types</TabsTrigger>
          <TabsTrigger value="details">Share Details</TabsTrigger>
        </TabsList>
        
        {/* Overview Tab */}
        <TabsContent value="overview" className="space-y-4">
          <Card>
            <CardHeader>
              <CardTitle>Sharing Overview</CardTitle>
              <CardDescription>
                Summary of your social sharing activity for the selected time period
              </CardDescription>
            </CardHeader>
            <CardContent>
              {analytics.length === 0 ? (
                <div className="text-center py-8 text-muted-foreground">
                  No sharing activity found for this time period.
                </div>
              ) : (
                <div className="space-y-6">
                  <div>
                    <h3 className="font-medium mb-2">Sharing Activity</h3>
                    <div className="text-sm text-muted-foreground">
                      You've shared content {analytics.length} times in this period.
                    </div>
                  </div>
                  
                  <div>
                    <h3 className="font-medium mb-2">Most Used Platform</h3>
                    {summary && Object.keys(summary?.platformBreakdown).length > 0 ? (
                      <div className="text-sm">
                        {formatPlatformName(Object.entries(summary?.platformBreakdown)
                          .sort((a, b) => b[1] - a[1])[0][0])}
                      </div>
                    ) : (
                      <div className="text-sm text-muted-foreground">No platform data available</div>
                    )}
                  </div>
                  
                  <div>
                    <h3 className="font-medium mb-2">Most Shared Content</h3>
                    {summary && Object.keys(summary?.itemTypeBreakdown).length > 0 ? (
                      <div className="text-sm">
                        {formatItemType(Object.entries(summary?.itemTypeBreakdown)
                          .sort((a, b) => b[1] - a[1])[0][0])}
                      </div>
                    ) : (
                      <div className="text-sm text-muted-foreground">No content type data available</div>
                    )}
                  </div>
                </div>
              )}
            </CardContent>
          </Card>
        </TabsContent>
        
        {/* Platforms Tab */}
        <TabsContent value="platforms" className="space-y-4">
          <Card>
            <CardHeader>
              <CardTitle>Platform Breakdown</CardTitle>
              <CardDescription>
                Distribution of shares across different social platforms
              </CardDescription>
            </CardHeader>
            <CardContent>
              {renderPlatformChart()}
            </CardContent>
          </Card>
        </TabsContent>
        
        {/* Content Types Tab */}
        <TabsContent value="content-type">
          <Card>
            <CardHeader>
              <CardTitle>Content Type Breakdown</CardTitle>
              <CardDescription>Share distribution by content type</CardDescription>
            </CardHeader>
            <CardContent>
              {summary && summary.most_popular_content ? (
                <div className="space-y-8">
                  <div>
                    <h3 className="text-lg font-medium mb-2">Most Popular Content</h3>
                    <p className="text-xl font-bold">{summary.most_popular_content}</p>
                  </div>
                  
                  <div>
                    <h3 className="text-lg font-medium mb-2">Content Engagement</h3>
                    <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
                      <div className="bg-muted p-4 rounded-lg">
                        <p className="text-sm text-muted-foreground">Total Clicks</p>
                        <p className="text-2xl font-bold">{summary.total_clicks}</p>
                      </div>
                      <div className="bg-muted p-4 rounded-lg">
                        <p className="text-sm text-muted-foreground">Total Likes</p>
                        <p className="text-2xl font-bold">{summary.total_likes}</p>
                      </div>
                      <div className="bg-muted p-4 rounded-lg">
                        <p className="text-sm text-muted-foreground">Total Reshares</p>
                        <p className="text-2xl font-bold">{summary.total_reshares}</p>
                      </div>
                    </div>
                  </div>
                </div>
              ) : (
                <div className="text-center py-8 text-muted-foreground">
                  No content data available for this time period.
                </div>
              )}
            </CardContent>
          </Card>
        </TabsContent>
      </Tabs>
    </div>
  );
}