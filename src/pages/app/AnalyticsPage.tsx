import React, { useState, useEffect, useMemo } from 'react';
import { Card, CardContent, CardHeader, CardTitle } from '../../components/ui/card';
import { Button } from '../../components/ui/button';
import { toast } from '../../components/ui/toast';
import { useAuth } from '../../contexts/AuthContext';
import { ProgressAnalyticsService } from '../../services/progress-analytics-service';
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
  Cell 
} from 'recharts';

const AnalyticsPage: React.FC = () => {
  const { user } = useAuth();
  const [overallProgress, setOverallProgress] = useState({
    totalFocusSessions: 0,
    totalTasksCompleted: 0,
    totalEnergyTracked: 0,
    progressPercentage: 0
  });
  const [monthlyProgress, setMonthlyProgress] = useState<Array<{ month: string, progress: number }>>([]);
  const [topPerformingAreas, setTopPerformingAreas] = useState<Array<{ category: string, score: number }>>([]);
  const [recommendedImprovements, setRecommendedImprovements] = useState<string[]>([]);
  const [achievements, setAchievements] = useState<any[]>([]);

  // Fetch analytics data
  useEffect(() => {
    const fetchAnalyticsData = async () => {
      if (!user) return;

      try {
        // Fetch overall progress
        const progressData = await ProgressAnalyticsService.getOverallProgress(user.id);
        setOverallProgress(progressData);

        // Generate progress report
        const reportData = await ProgressAnalyticsService.generateProgressReport(user.id);
        setMonthlyProgress(reportData.monthlyProgress || []);
        setTopPerformingAreas(reportData.topPerformingAreas || []);
        setRecommendedImprovements(reportData.recommendedImprovements || []);

        // Fetch achievements
        const userAchievements = await ProgressAnalyticsService.getUserAchievements(user.id);
        setAchievements(userAchievements);
      } catch (error) {
        toast({
          title: 'Analytics Fetch Error',
          description: 'Could not load analytics data.',
          variant: 'destructive'
        });
      }
    };

    fetchAnalyticsData();
  }, [user]);

  // Export progress data
  const handleExportData = async (format: 'csv' | 'json') => {
    if (!user) return;

    try {
      const exportedData = await ProgressAnalyticsService.exportProgressData(user.id, format);
      
      if (exportedData) {
        // Create a downloadable file
        const blob = new Blob([exportedData], { type: format === 'csv' ? 'text/csv' : 'application/json' });
        const url = window.URL.createObjectURL(blob);
        const a = document.createElement('a');
        a.href = url;
        a.download = `progress_export.${format}`;
        a.click();
        window.URL.revokeObjectURL(url);

        toast({
          title: 'Export Successful',
          description: `Progress data exported as ${format.toUpperCase()}`,
          variant: 'success'
        });
      }
    } catch (error) {
      toast({
        title: 'Export Failed',
        description: 'Could not export progress data.',
        variant: 'destructive'
      });
    }
  };

  // Prepare chart data
  const monthlyChartData = useMemo(() => 
    monthlyProgress.map(item => ({
      month: item.month,
      progress: item.progress
    })).reverse(), 
    [monthlyProgress]
  );

  const performanceChartData = useMemo(() => 
    topPerformingAreas.map(area => ({
      name: area.category,
      value: area.score
    })),
    [topPerformingAreas]
  );

  const COLORS = ['#10B981', '#6366F1', '#8B5CF6'];

  return (
    <div className="container mx-auto px-4 py-8">
      <div className="grid md:grid-cols-3 gap-6">
        {/* Overall Progress */}
        <Card>
          <CardHeader>
            <CardTitle>Overall Progress</CardTitle>
          </CardHeader>
          <CardContent>
            <div className="grid grid-cols-3 gap-4 text-center">
              <div>
                <p className="text-sm text-gray-600">Focus Sessions</p>
                <p className="text-2xl font-bold">{overallProgress.totalFocusSessions}</p>
              </div>
              <div>
                <p className="text-sm text-gray-600">Tasks Completed</p>
                <p className="text-2xl font-bold">{overallProgress.totalTasksCompleted}</p>
              </div>
              <div>
                <p className="text-sm text-gray-600">Energy Tracked</p>
                <p className="text-2xl font-bold">{overallProgress.totalEnergyTracked}</p>
              </div>
            </div>
            <div className="mt-4">
              <p className="text-center text-sm text-gray-600">Total Progress</p>
              <div className="w-full bg-gray-200 rounded-full h-2.5 mt-2">
                <div 
                  className="bg-primary h-2.5 rounded-full" 
                  style={{ width: `${overallProgress.progressPercentage}%` }}
                ></div>
              </div>
              <p className="text-center text-sm mt-2">
                {overallProgress.progressPercentage.toFixed(1)}% Complete
              </p>
            </div>
          </CardContent>
        </Card>

        {/* Monthly Progress */}
        <Card className="md:col-span-2">
          <CardHeader>
            <CardTitle>Monthly Progress</CardTitle>
          </CardHeader>
          <CardContent>
            <div className="h-64">
              <ResponsiveContainer width="100%" height="100%">
                <BarChart data={monthlyChartData}>
                  <CartesianGrid strokeDasharray="3 3" />
                  <XAxis dataKey="month" />
                  <YAxis domain={[0, 100]} />
                  <Tooltip />
                  <Bar dataKey="progress" fill="#10B981" />
                </BarChart>
              </ResponsiveContainer>
            </div>
          </CardContent>
        </Card>

        {/* Performance Areas */}
        <Card>
          <CardHeader>
            <CardTitle>Performance Breakdown</CardTitle>
          </CardHeader>
          <CardContent>
            <div className="h-64">
              <ResponsiveContainer width="100%" height="100%">
                <PieChart>
                  <Pie
                    data={performanceChartData}
                    cx="50%"
                    cy="50%"
                    labelLine={false}
                    outerRadius={80}
                    fill="#8884d8"
                    dataKey="value"
                  >
                    {performanceChartData.map((entry, index) => (
                      <Cell key={`cell-${index}`} fill={COLORS[index % COLORS.length]} />
                    ))}
                  </Pie>
                  <Tooltip />
                </PieChart>
              </ResponsiveContainer>
            </div>
            <div className="mt-4 text-center">
              {performanceChartData.map((area, index) => (
                <div 
                  key={area.name} 
                  className="inline-flex items-center mr-4 mb-2"
                >
                  <span 
                    className="inline-block w-3 h-3 mr-2 rounded-full" 
                    style={{ backgroundColor: COLORS[index % COLORS.length] }}
                  ></span>
                  <span>{area.name}: {area.value.toFixed(1)}%</span>
                </div>
              ))}
            </div>
          </CardContent>
        </Card>

        {/* Recommendations & Achievements */}
        <Card className="md:col-span-2 grid md:grid-cols-2 gap-4">
          <div>
            <CardHeader>
              <CardTitle>Improvement Recommendations</CardTitle>
            </CardHeader>
            <CardContent>
              <ul className="space-y-2">
                {recommendedImprovements.map((recommendation, index) => (
                  <li 
                    key={index} 
                    className="flex items-center text-sm text-gray-700 dark:text-gray-300"
                  >
                    <svg 
                      className="w-4 h-4 mr-2 text-primary" 
                      fill="none" 
                      stroke="currentColor" 
                      viewBox="0 0 24 24"
                    >
                      <path 
                        strokeLinecap="round" 
                        strokeLinejoin="round" 
                        strokeWidth={2} 
                        d="M13 16h-1v-4h-1m1-4h.01M21 12a9 9 0 11-18 0 9 9 0 0118 0z" 
                      />
                    </svg>
                    {recommendation}
                  </li>
                ))}
              </ul>
            </CardContent>
          </div>
          <div>
            <CardHeader>
              <CardTitle>Achievements</CardTitle>
            </CardHeader>
            <CardContent>
              <div className="grid grid-cols-3 gap-4">
                {achievements.slice(0, 6).map((achievement) => (
                  <div 
                    key={achievement.id} 
                    className="flex flex-col items-center"
                  >
                    <div 
                      className="w-12 h-12 bg-primary/10 rounded-full flex items-center justify-center"
                    >
                      <span className="text-primary text-xl">
                        {achievement.icon || '🏆'}
                      </span>
                    </div>
                    <p className="text-xs text-center mt-2">
                      {achievement.name}
                    </p>
                  </div>
                ))}
              </div>
            </CardContent>
          </div>
        </Card>

        {/* Export Options */}
        <Card>
          <CardHeader>
            <CardTitle>Export Progress</CardTitle>
          </CardHeader>
          <CardContent>
            <div className="flex space-x-4">
              <Button 
                variant="outline" 
                onClick={() => handleExportData('csv')}
                className="w-full"
              >
                Export CSV
              </Button>
              <Button 
                variant="outline" 
                onClick={() => handleExportData('json')}
                className="w-full"
              >
                Export JSON
              </Button>
            </div>
          </CardContent>
        </Card>
      </div>
    </div>
  );
};

export default AnalyticsPage;