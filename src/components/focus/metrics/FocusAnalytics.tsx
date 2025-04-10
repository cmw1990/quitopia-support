import { useState, useMemo } from 'react';
import { motion } from 'framer-motion';
import { 
  LineChart, 
  Line, 
  XAxis, 
  YAxis, 
  CartesianGrid, 
  Tooltip, 
  ResponsiveContainer,
  BarChart,
  Bar 
} from 'recharts';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { 
  Select, 
  SelectContent, 
  SelectItem, 
  SelectTrigger, 
  SelectValue 
} from '@/components/ui/select';
import { Tabs, TabsList, TabsTrigger, TabsContent } from '@/components/ui/tabs';
import type { FocusSession } from '@/lib/types/focus-types';

import type { FocusAnalyticsProps } from './types';

export const FocusAnalytics: React.FC<FocusAnalyticsProps> = ({ sessions, onClose }) => {
  const [timeRange, setTimeRange] = useState<'week' | 'month' | 'year'>('week');

  const filteredData = useMemo(() => {
    const now = new Date();
    const ranges = {
      week: now.setDate(now.getDate() - 7),
      month: now.setMonth(now.getMonth() - 1),
      year: now.setFullYear(now.getFullYear() - 1)
    };

    return sessions.filter(session => 
      new Date(session.timestamp).getTime() >= ranges[timeRange]
    );
  }, [sessions, timeRange]);

  const dailyStats = useMemo(() => {
    return filteredData.reduce((acc: Record<string, any>[], session) => {
      const date = new Date(session.timestamp).toLocaleDateString();
      const existing = acc.find(item => item.date === date);

      if (existing) {
        existing.totalMinutes += session.duration;
        existing.completedSessions += session.completed ? 1 : 0;
        existing.averageQuality = 
          (existing.averageQuality * (existing.sessions - 1) + (session.focus_quality || 0)) / existing.sessions;
        existing.sessions++;
      } else {
        acc.push({
          date,
          totalMinutes: session.duration,
          completedSessions: session.completed ? 1 : 0,
          averageQuality: session.focus_quality || 0,
          sessions: 1
        });
      }

      return acc;
    }, []);
  }, [filteredData]);

  return (
    <motion.div
      className="fixed inset-0 bg-background/80 backdrop-blur-sm z-50"
      initial={{ opacity: 0 }}
      animate={{ opacity: 1 }}
      exit={{ opacity: 0 }}
    >
      <motion.div 
        className="fixed inset-4 bg-background border rounded-lg shadow-lg overflow-auto"
        initial={{ scale: 0.95, opacity: 0 }}
        animate={{ scale: 1, opacity: 1 }}
        transition={{ delay: 0.1 }}
      >
        <div className="p-6">
          <div className="flex justify-between items-center mb-6">
            <h2 className="text-2xl font-bold">Focus Analytics</h2>
            <Select value={timeRange} onValueChange={(value: 'week' | 'month' | 'year') => setTimeRange(value)}>
              <SelectTrigger className="w-32">
                <SelectValue placeholder="Select range" />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="week">Past Week</SelectItem>
                <SelectItem value="month">Past Month</SelectItem>
                <SelectItem value="year">Past Year</SelectItem>
              </SelectContent>
            </Select>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
            {/* Focus Duration Trends */}
            <Card>
              <CardHeader>
                <CardTitle>Focus Duration Trends</CardTitle>
                <CardDescription>Daily focus time in minutes</CardDescription>
              </CardHeader>
              <CardContent className="h-72">
                <ResponsiveContainer width="100%" height="100%">
                  <LineChart data={dailyStats}>
                    <CartesianGrid strokeDasharray="3 3" />
                    <XAxis dataKey="date" />
                    <YAxis />
                    <Tooltip />
                    <Line 
                      type="monotone" 
                      dataKey="totalMinutes" 
                      stroke="#3b82f6" 
                      strokeWidth={2} 
                    />
                  </LineChart>
                </ResponsiveContainer>
              </CardContent>
            </Card>

            {/* Session Completion Rate */}
            <Card>
              <CardHeader>
                <CardTitle>Session Completion Rate</CardTitle>
                <CardDescription>Number of completed sessions per day</CardDescription>
              </CardHeader>
              <CardContent className="h-72">
                <ResponsiveContainer width="100%" height="100%">
                  <BarChart data={dailyStats}>
                    <CartesianGrid strokeDasharray="3 3" />
                    <XAxis dataKey="date" />
                    <YAxis />
                    <Tooltip />
                    <Bar 
                      dataKey="completedSessions" 
                      fill="#10b981" 
                      radius={[4, 4, 0, 0]} 
                    />
                  </BarChart>
                </ResponsiveContainer>
              </CardContent>
            </Card>

            {/* Focus Quality Metrics */}
            <Card>
              <CardHeader>
                <CardTitle>Focus Quality</CardTitle>
                <CardDescription>Average quality score per session</CardDescription>
              </CardHeader>
              <CardContent className="h-72">
                <ResponsiveContainer width="100%" height="100%">
                  <LineChart data={dailyStats}>
                    <CartesianGrid strokeDasharray="3 3" />
                    <XAxis dataKey="date" />
                    <YAxis domain={[0, 10]} />
                    <Tooltip />
                    <Line 
                      type="monotone" 
                      dataKey="averageQuality" 
                      stroke="#8b5cf6" 
                      strokeWidth={2} 
                    />
                  </LineChart>
                </ResponsiveContainer>
              </CardContent>
            </Card>

            {/* Detailed Stats */}
            <Card>
              <CardHeader>
                <CardTitle>Summary Statistics</CardTitle>
                <CardDescription>Key metrics for the selected period</CardDescription>
              </CardHeader>
              <CardContent>
                <Tabs defaultValue="general">
                  <TabsList className="grid w-full grid-cols-3">
                    <TabsTrigger value="general">General</TabsTrigger>
                    <TabsTrigger value="timing">Timing</TabsTrigger>
                    <TabsTrigger value="quality">Quality</TabsTrigger>
                  </TabsList>

                  <TabsContent value="general" className="space-y-4 mt-4">
                    <div className="grid grid-cols-2 gap-4">
                      <div>
                        <div className="text-2xl font-bold">{filteredData.length}</div>
                        <div className="text-sm text-muted-foreground">Total Sessions</div>
                      </div>
                      <div>
                        <div className="text-2xl font-bold">
                          {Math.round(filteredData.filter(s => s.completed).length / filteredData.length * 100)}%
                        </div>
                        <div className="text-sm text-muted-foreground">Completion Rate</div>
                      </div>
                    </div>
                  </TabsContent>

                  <TabsContent value="timing" className="space-y-4 mt-4">
                    <div className="grid grid-cols-2 gap-4">
                      <div>
                        <div className="text-2xl font-bold">
                          {Math.round(filteredData.reduce((acc, s) => acc + s.duration, 0) / filteredData.length)}
                        </div>
                        <div className="text-sm text-muted-foreground">Avg. Minutes/Session</div>
                      </div>
                      <div>
                        <div className="text-2xl font-bold">
                          {filteredData.reduce((acc, s) => acc + s.duration, 0)}
                        </div>
                        <div className="text-sm text-muted-foreground">Total Minutes</div>
                      </div>
                    </div>
                  </TabsContent>

                  <TabsContent value="quality" className="space-y-4 mt-4">
                    <div className="grid grid-cols-2 gap-4">
                      <div>
                        <div className="text-2xl font-bold">
                          {Math.round(filteredData.reduce((acc, s) => acc + (s.focus_quality || 0), 0) / filteredData.length * 10) / 10}
                        </div>
                        <div className="text-sm text-muted-foreground">Avg. Focus Quality</div>
                      </div>
                      <div>
                        <div className="text-2xl font-bold">
                          {Math.round(filteredData.reduce((acc, s) => acc + s.distractions, 0) / filteredData.length * 10) / 10}
                        </div>
                        <div className="text-sm text-muted-foreground">Avg. Distractions</div>
                      </div>
                    </div>
                  </TabsContent>
                </Tabs>
              </CardContent>
            </Card>
          </div>

          <div className="mt-6 flex justify-end">
            <Button variant="default" onClick={onClose}>
              Close
            </Button>
          </div>
        </div>
      </motion.div>
    </motion.div>
  );
};
