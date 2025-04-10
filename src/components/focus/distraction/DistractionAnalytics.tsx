import React from 'react';
import { Card } from '@/components/ui/card';
import { Progress } from '@/components/ui/progress';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { 
  DistractionPattern, 
  DistractionLog,
  BlockingStats,
  TimeWindow
} from '@/lib/types/distraction-types';
import {
  BarChart,
  LineChart,
  Line,
  Bar,
  XAxis,
  YAxis,
  CartesianGrid,
  Tooltip,
  ResponsiveContainer
} from 'recharts';
import { motion } from 'framer-motion';
import {
  TrendingUp,
  Clock,
  Zap,
  Target,
  Brain,
  Calendar,
  Activity,
  AlertCircle
} from 'lucide-react';

interface Props {
  stats: BlockingStats;
  patterns: DistractionPattern[];
  logs: DistractionLog[];
}

export const DistractionAnalytics: React.FC<Props> = ({
  stats,
  patterns,
  logs
}) => {
  const productiveWindows = stats.productiveTimeWindows?.map(window => ({
    ...window,
    timeRange: `${window.start.slice(0, 5)} - ${window.end.slice(0, 5)}`,
    score: window.productivity_score
  })) || [];

  const weeklyData = stats.weeklyTrend?.map((value, index) => ({
    day: ['Sun', 'Mon', 'Tue', 'Wed', 'Thu', 'Fri', 'Sat'][index],
    distractions: value
  })) || [];

  const getPatternIcon = (type: DistractionPattern['pattern_type']) => {
    switch (type) {
      case 'time_based': return Clock;
      case 'trigger_based': return AlertCircle;
      case 'context_based': return Target;
      case 'emotional': return Brain;
      default: return AlertCircle;
    }
  };

  return (
    <div className="space-y-6">
      <Tabs defaultValue="overview" className="w-full">
        <TabsList className="grid w-full grid-cols-4">
          <TabsTrigger value="overview">Overview</TabsTrigger>
          <TabsTrigger value="patterns">Patterns</TabsTrigger>
          <TabsTrigger value="timeline">Timeline</TabsTrigger>
          <TabsTrigger value="insights">Insights</TabsTrigger>
        </TabsList>

        <TabsContent value="overview" className="mt-4">
          <div className="grid grid-cols-2 gap-4 mb-6">
            <Card className="p-4">
              <div className="flex items-center gap-2 mb-2">
                <Activity className="h-5 w-5 text-blue-500" />
                <h3 className="text-sm font-medium">Focus Score</h3>
              </div>
              <div className="text-2xl font-bold">{stats.focusScore}/100</div>
              <Progress value={stats.focusScore} className="mt-2" />
            </Card>

            <Card className="p-4">
              <div className="flex items-center gap-2 mb-2">
                <TrendingUp className="h-5 w-5 text-green-500" />
                <h3 className="text-sm font-medium">Improvement</h3>
              </div>
              <div className="text-2xl font-bold">+{stats.improvementRate}%</div>
              <div className="text-sm text-gray-500 mt-2">From last week</div>
            </Card>
          </div>

          <Card className="p-4 mb-4">
            <h3 className="text-sm font-medium mb-4">Weekly Trend</h3>
            <ResponsiveContainer width="100%" height={200}>
              <LineChart data={weeklyData}>
                <CartesianGrid strokeDasharray="3 3" />
                <XAxis dataKey="day" />
                <YAxis />
                <Tooltip />
                <Line
                  type="monotone"
                  dataKey="distractions"
                  stroke="#3b82f6"
                  strokeWidth={2}
                />
              </LineChart>
            </ResponsiveContainer>
          </Card>

          <Card className="p-4">
            <h3 className="text-sm font-medium mb-4">Productive Time Windows</h3>
            <ResponsiveContainer width="100%" height={200}>
              <BarChart data={productiveWindows}>
                <CartesianGrid strokeDasharray="3 3" />
                <XAxis dataKey="timeRange" />
                <YAxis />
                <Tooltip />
                <Bar dataKey="score" fill="#22c55e" />
              </BarChart>
            </ResponsiveContainer>
          </Card>
        </TabsContent>

        <TabsContent value="patterns" className="mt-4">
          <div className="grid gap-4">
            {patterns.map((pattern) => {
              const Icon = getPatternIcon(pattern.pattern_type);
              const successRate = pattern.success_rate * 100;

              return (
                <motion.div
                  key={pattern.id}
                  initial={{ opacity: 0, y: 20 }}
                  animate={{ opacity: 1, y: 0 }}
                >
                  <Card className="p-4">
                    <div className="flex items-start gap-4">
                      <div className="p-2 rounded-lg bg-blue-100">
                        <Icon className="h-5 w-5 text-blue-500" />
                      </div>

                      <div className="flex-1">
                        <div className="flex items-center justify-between mb-2">
                          <div>
                            <h4 className="font-medium">
                              {pattern.pattern_type.replace('_', ' ').split(' ').map(
                                word => word.charAt(0).toUpperCase() + word.slice(1)
                              ).join(' ')} Pattern
                            </h4>
                            <div className="text-sm text-gray-500">
                              Frequency: {pattern.frequency} times per day
                            </div>
                          </div>
                          <div className="text-sm">
                            Success rate: {Math.round(successRate)}%
                          </div>
                        </div>

                        <Progress value={successRate} className="mb-4" />

                        <div className="space-y-2">
                          <div>
                            <h5 className="text-sm font-medium text-gray-600">Triggers:</h5>
                            <div className="flex flex-wrap gap-2 mt-1">
                              {pattern.trigger_conditions.map((trigger, i) => (
                                <span
                                  key={i}
                                  className="px-2 py-1 text-xs bg-gray-100 dark:bg-gray-800 rounded-full"
                                >
                                  {trigger}
                                </span>
                              ))}
                            </div>
                          </div>

                          <div>
                            <h5 className="text-sm font-medium text-gray-600">Effective Strategies:</h5>
                            <ul className="text-sm space-y-1 mt-1">
                              {pattern.coping_strategies.map((strategy, i) => (
                                <li key={i} className="flex items-start gap-2">
                                  <span className="mt-1">•</span>
                                  <span>{strategy}</span>
                                </li>
                              ))}
                            </ul>
                          </div>
                        </div>
                      </div>
                    </div>
                  </Card>
                </motion.div>
              );
            })}
          </div>
        </TabsContent>

        <TabsContent value="timeline" className="mt-4">
          <div className="space-y-4">
            {logs.map((log) => (
              <motion.div
                key={log.id}
                initial={{ opacity: 0, x: -20 }}
                animate={{ opacity: 1, x: 0 }}
              >
                <Card className="p-4">
                  <div className="flex items-start gap-4">
                    <div className="p-2 rounded-lg bg-gray-100">
                      <Calendar className="h-5 w-5 text-gray-500" />
                    </div>

                    <div className="flex-1">
                      <div className="flex items-center justify-between mb-2">
                        <h4 className="font-medium">{log.site}</h4>
                        <span className="text-sm text-gray-500">
                          {new Date(log.timestamp).toLocaleTimeString()}
                        </span>
                      </div>

                      <div className="grid grid-cols-2 gap-4 text-sm">
                        <div>
                          <span className="text-gray-500">Duration: </span>
                          {log.duration} minutes
                        </div>
                        <div>
                          <span className="text-gray-500">Context: </span>
                          {log.activity_context}
                        </div>
                        <div>
                          <span className="text-gray-500">Mood: </span>
                          {log.emotional_state}
                        </div>
                        <div>
                          <span className="text-gray-500">Resolution: </span>
                          {log.resolution}
                        </div>
                      </div>

                      {log.insights.length > 0 && (
                        <div className="mt-3 text-sm text-blue-600">
                          Insight: {log.insights[0]}
                        </div>
                      )}
                    </div>
                  </div>
                </Card>
              </motion.div>
            ))}
          </div>
        </TabsContent>

        <TabsContent value="insights" className="mt-4">
          <div className="grid gap-4">
            <Card className="p-4">
              <h4 className="font-medium mb-3">Peak Distraction Hours</h4>
              <div className="space-y-2">
                {stats.peakDistractionHours?.map((hour, i) => (
                  <div key={i} className="flex items-center gap-2">
                    <Clock className="h-4 w-4 text-gray-500" />
                    <span className="text-sm">{hour}</span>
                  </div>
                ))}
              </div>
            </Card>

            <Card className="p-4">
              <h4 className="font-medium mb-3">Most Common Patterns</h4>
              <div className="space-y-4">
                {patterns.slice(0, 3).map((pattern) => (
                  <div key={pattern.id} className="space-y-2">
                    <div className="flex items-center justify-between">
                      <div className="flex items-center gap-2">
                        <Brain className="h-4 w-4 text-blue-500" />
                        <span className="text-sm font-medium">
                          {pattern.pattern_type.replace('_', ' ')}
                        </span>
                      </div>
                      <span className="text-sm text-gray-500">
                        {Math.round(pattern.success_rate * 100)}% managed
                      </span>
                    </div>
                    <Progress value={pattern.success_rate * 100} />
                  </div>
                ))}
              </div>
            </Card>

            <Card className="p-4">
              <h4 className="font-medium mb-3">Improvement Areas</h4>
              <div className="space-y-2">
                <div className="flex items-center gap-2">
                  <Zap className="h-4 w-4 text-yellow-500" />
                  <span className="text-sm">Increase focus duration</span>
                </div>
                <div className="flex items-center gap-2">
                  <Target className="h-4 w-4 text-red-500" />
                  <span className="text-sm">Reduce context switching</span>
                </div>
                <div className="flex items-center gap-2">
                  <Brain className="h-4 w-4 text-purple-500" />
                  <span className="text-sm">Better emotional regulation</span>
                </div>
              </div>
            </Card>
          </div>
        </TabsContent>
      </Tabs>
    </div>
  );
};
