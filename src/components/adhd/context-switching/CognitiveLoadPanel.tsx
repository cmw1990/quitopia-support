import React from 'react';
import { 
  Card, 
  CardContent, 
  CardDescription, 
  CardHeader, 
  CardTitle 
} from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { 
  BarChart3, 
  Brain, 
  Clock, 
  RefreshCcw, 
  Zap,
  Sparkles, 
  BarChart
} from 'lucide-react';

import * as contextSwitchingService from '@/services/contextSwitchingService';
import { ContextSwitchStats, CognitiveMetrics } from './types';

interface CognitiveLoadPanelProps {
  stats: ContextSwitchStats | null;
  metrics: CognitiveMetrics;
  onRefreshData: () => Promise<void>;
}

const CognitiveLoadPanel: React.FC<CognitiveLoadPanelProps> = ({
  stats,
  metrics,
  onRefreshData
}) => {
  const getCognitiveLoadColor = (load: string) => {
    switch (load) {
      case 'low': return 'bg-green-500';
      case 'medium': return 'bg-yellow-500';
      case 'high': return 'bg-red-500';
      default: return 'bg-gray-500';
    }
  };

  const getLoadDescription = (load: string) => {
    switch (load) {
      case 'low':
        return 'Your cognitive load is manageable. You have mental capacity for complex tasks.';
      case 'medium':
        return 'Your cognitive load is moderate. Balance your tasks to prevent mental fatigue.';
      case 'high':
        return 'Your cognitive load is high. Consider reducing context switches and focusing on one task at a time.';
      default:
        return 'Unable to determine cognitive load level.';
    }
  };

  const getSwitchFrequencyDescription = (dailySwitches: number) => {
    if (dailySwitches <= 3) {
      return 'Low frequency. You maintain focus well.';
    } else if (dailySwitches <= 6) {
      return 'Moderate frequency. Balance with focused work periods.';
    } else {
      return 'High frequency. Consider reducing switches to improve focus.';
    }
  };

  const formatDuration = (seconds: number) => {
    if (seconds < 60) {
      return `${seconds} seconds`;
    } else {
      const minutes = Math.floor(seconds / 60);
      const remainingSeconds = seconds % 60;
      return `${minutes}m ${remainingSeconds > 0 ? `${remainingSeconds}s` : ''}`;
    }
  };

  return (
    <div className="space-y-4">
      <div className="flex justify-between items-center">
        <h2 className="text-2xl font-bold">Cognitive Metrics</h2>
        <Button variant="outline" onClick={onRefreshData}>
          <RefreshCcw className="h-4 w-4 mr-2" />
          Refresh
        </Button>
      </div>
      
      {stats ? (
        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
          {/* Cognitive Load Card */}
          <Card>
            <CardHeader className="pb-2">
              <div className="flex items-center space-x-2">
                <Sparkles className="h-5 w-5" />
                <CardTitle>Cognitive Load</CardTitle>
              </div>
              <CardDescription>
                Your current mental workload assessment
              </CardDescription>
            </CardHeader>
            <CardContent className="space-y-4">
              <div className="flex justify-center">
                <Badge 
                  className={`text-xl py-2 px-4 ${getCognitiveLoadColor(metrics.cognitive_load)} text-white`}
                >
                  {metrics.cognitive_load.toUpperCase()}
                </Badge>
              </div>
              <p className="text-sm text-center">
                {getLoadDescription(metrics.cognitive_load)}
              </p>
              
              <div className="grid grid-cols-3 gap-2 mt-4">
                <div className="flex flex-col items-center justify-center p-2 border rounded-md bg-green-50">
                  <Zap className="h-5 w-5 text-green-500 mb-1" />
                  <span className="text-xs text-gray-500">Low Load</span>
                </div>
                <div className="flex flex-col items-center justify-center p-2 border rounded-md bg-yellow-50">
                  <Zap className="h-5 w-5 text-yellow-500 mb-1" />
                  <span className="text-xs text-gray-500">Medium Load</span>
                </div>
                <div className="flex flex-col items-center justify-center p-2 border rounded-md bg-red-50">
                  <Zap className="h-5 w-5 text-red-500 mb-1" />
                  <span className="text-xs text-gray-500">High Load</span>
                </div>
              </div>
            </CardContent>
          </Card>
          
          {/* Switching Frequency Card */}
          <Card>
            <CardHeader className="pb-2">
              <div className="flex items-center space-x-2">
                <BarChart className="h-5 w-5" />
                <CardTitle>Switching Frequency</CardTitle>
              </div>
              <CardDescription>
                How often you change contexts
              </CardDescription>
            </CardHeader>
            <CardContent className="space-y-4">
              <div className="grid grid-cols-2 gap-4">
                <div className="flex flex-col items-center justify-center p-4 border rounded-md">
                  <span className="text-2xl font-bold">{metrics.daily_switches}</span>
                  <span className="text-sm text-gray-500">Daily Switches</span>
                </div>
                <div className="flex flex-col items-center justify-center p-4 border rounded-md">
                  <span className="text-2xl font-bold">{metrics.weekly_switches}</span>
                  <span className="text-sm text-gray-500">Weekly Switches</span>
                </div>
              </div>
              <p className="text-sm text-center">
                {getSwitchFrequencyDescription(metrics.daily_switches)}
              </p>
            </CardContent>
          </Card>
          
          {/* Complexity Card */}
          <Card>
            <CardHeader className="pb-2">
              <div className="flex items-center space-x-2">
                <Brain className="h-5 w-5" />
                <CardTitle>Switch Complexity</CardTitle>
              </div>
              <CardDescription>
                The cognitive demand of your context switches
              </CardDescription>
            </CardHeader>
            <CardContent className="space-y-4">
              <div className="flex items-center justify-center">
                <div className="w-32 h-32 rounded-full border-8 flex items-center justify-center relative">
                  <span className="text-3xl font-bold">{metrics.switch_complexity}</span>
                  <span className="text-xs absolute bottom-2">Out of 10</span>
                </div>
              </div>
              <p className="text-sm text-center">
                {metrics.switch_complexity < 4 
                  ? 'Your context switches involve simple tasks.' 
                  : metrics.switch_complexity < 7 
                    ? 'Your switches involve moderately complex tasks.' 
                    : 'Your switches involve highly complex tasks.'}
              </p>
            </CardContent>
          </Card>
          
          {/* Duration Card */}
          <Card>
            <CardHeader className="pb-2">
              <div className="flex items-center space-x-2">
                <Clock className="h-5 w-5" />
                <CardTitle>Switch Duration</CardTitle>
              </div>
              <CardDescription>
                Time spent transitioning between contexts
              </CardDescription>
            </CardHeader>
            <CardContent className="space-y-4">
              <div className="flex flex-col items-center justify-center p-4">
                <span className="text-2xl font-bold">{formatDuration(metrics.average_duration)}</span>
                <span className="text-sm text-gray-500">Average Switch Time</span>
              </div>
              <div className="h-4 w-full bg-gray-100 rounded-full overflow-hidden">
                <div 
                  className="h-full bg-primary"
                  style={{ width: `${Math.min((metrics.average_duration / 300) * 100, 100)}%` }}
                />
              </div>
              <p className="text-sm text-center">
                {metrics.average_duration < 60 
                  ? 'Quick transitions between contexts.' 
                  : metrics.average_duration < 180 
                    ? 'Moderate transition time, which helps with mental preparation.' 
                    : 'Longer transitions indicate thorough context preparation.'}
              </p>
            </CardContent>
          </Card>
          
          {/* Total Stats Card */}
          <Card className="md:col-span-2">
            <CardHeader className="pb-2">
              <div className="flex items-center space-x-2">
                <BarChart3 className="h-5 w-5" />
                <CardTitle>Overall Statistics</CardTitle>
              </div>
              <CardDescription>
                Summary of your context switching activity
              </CardDescription>
            </CardHeader>
            <CardContent>
              <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
                <div className="flex flex-col items-center justify-center p-4 border rounded-md">
                  <span className="text-3xl font-bold">{stats.switch_count || 0}</span>
                  <span className="text-sm text-gray-500">Total Switches</span>
                </div>
                <div className="flex flex-col items-center justify-center p-4 border rounded-md">
                  <span className="text-3xl font-bold">{formatDuration(stats.average_switch_time || 0)}</span>
                  <span className="text-sm text-gray-500">Average Time</span>
                </div>
                <div className="flex flex-col items-center justify-center p-4 border rounded-md">
                  <span className="text-3xl font-bold">{formatDuration(stats.total_switch_time || 0)}</span>
                  <span className="text-sm text-gray-500">Total Switch Time</span>
                </div>
                <div className="flex flex-col items-center justify-center p-4 border rounded-md">
                  <span className="text-3xl font-bold">
                    {stats.most_frequent_contexts 
                      ? Object.keys(stats.most_frequent_contexts).length 
                      : 0}
                  </span>
                  <span className="text-sm text-gray-500">Unique Contexts</span>
                </div>
              </div>
            </CardContent>
          </Card>
        </div>
      ) : (
        <Card>
          <CardHeader>
            <CardTitle>No Metrics Available</CardTitle>
            <CardDescription>
              Start using the context switching feature to generate cognitive metrics.
            </CardDescription>
          </CardHeader>
          <CardContent className="flex flex-col items-center justify-center py-8">
            <BarChart3 className="h-16 w-16 text-gray-400 mb-4" />
            <p className="text-center text-sm text-gray-500 mb-4">
              Cognitive metrics will appear here after you start switching between different contexts.
              These metrics help you understand your cognitive load and optimize your work patterns.
            </p>
          </CardContent>
        </Card>
      )}
    </div>
  );
};

export default CognitiveLoadPanel; 