
import React from 'react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { BarChart, Calendar, Clock, TrendingUp } from 'lucide-react';
import { BlockingStats } from '@/lib/types/distraction-types';

interface DistractionAnalyticsProps {
  stats?: BlockingStats;
}

export const DistractionAnalytics: React.FC<DistractionAnalyticsProps> = ({ stats }) => {
  const defaultStats: BlockingStats = {
    totalBlocked: 0,
    todayBlocked: 0,
    mostCommonTime: 'N/A',
    productivity: 0,
    streakDays: 0,
    improvementRate: 0,
    focusScore: 0,
  };

  const displayStats = stats || defaultStats;

  return (
    <div className="space-y-6">
      <h2 className="text-2xl font-bold">Distraction Analytics</h2>
      
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4">
        <Card>
          <CardHeader className="pb-2">
            <CardTitle className="text-sm font-medium flex items-center">
              <TrendingUp className="h-4 w-4 mr-2 text-primary" />
              Total Blocks
            </CardTitle>
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">{displayStats.totalBlocked}</div>
            <p className="text-xs text-muted-foreground">Distractions prevented</p>
          </CardContent>
        </Card>

        <Card>
          <CardHeader className="pb-2">
            <CardTitle className="text-sm font-medium flex items-center">
              <Calendar className="h-4 w-4 mr-2 text-primary" />
              Today
            </CardTitle>
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">{displayStats.todayBlocked}</div>
            <p className="text-xs text-muted-foreground">Blocks today</p>
          </CardContent>
        </Card>

        <Card>
          <CardHeader className="pb-2">
            <CardTitle className="text-sm font-medium flex items-center">
              <Clock className="h-4 w-4 mr-2 text-primary" />
              Common Time
            </CardTitle>
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">{displayStats.mostCommonTime}</div>
            <p className="text-xs text-muted-foreground">When distractions occur</p>
          </CardContent>
        </Card>

        <Card>
          <CardHeader className="pb-2">
            <CardTitle className="text-sm font-medium flex items-center">
              <BarChart className="h-4 w-4 mr-2 text-primary" />
              Focus Score
            </CardTitle>
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">{displayStats.focusScore}/100</div>
            <p className="text-xs text-muted-foreground">Based on your history</p>
          </CardContent>
        </Card>
      </div>

      <Card>
        <CardHeader>
          <CardTitle>Focus Trends</CardTitle>
        </CardHeader>
        <CardContent>
          <div className="h-[200px] flex items-center justify-center text-muted-foreground">
            Chart will be displayed here with your focus history data
          </div>
        </CardContent>
      </Card>
    </div>
  );
};
