import React from 'react';
import { Card } from '@/components/ui/card';
import { useDistractionManager } from '@/hooks/useDistractionManager';
import { DistractionAnalytics } from '@/components/focus/distraction';
import { useNavigate } from 'react-router-dom';
import { motion } from 'framer-motion';
import {
  Clock,
  Target,
  Shield,
  List,
  Activity,
  Zap,
  Brain,
  Calendar
} from 'lucide-react';

const FocusDashboard: React.FC = () => {
  const { state } = useDistractionManager();
  const navigate = useNavigate();

  const focusTools = [
    {
      title: 'Focus Timer',
      description: 'Start a focused work session',
      icon: Clock,
      route: '/timer',
      color: 'bg-blue-500'
    },
    {
      title: 'Task Management',
      description: 'Organize tasks with Eisenhower Matrix',
      icon: List,
      route: '/tasks',
      color: 'bg-green-500'
    },
    {
      title: 'Distraction Blocker',
      description: 'Block distracting websites and apps',
      icon: Shield,
      route: '/focus',
      color: 'bg-purple-500'
    },
    {
      title: 'ADHD Task Breakdown',
      description: 'Break down complex tasks',
      icon: Brain,
      route: '/breakdown',
      color: 'bg-amber-500'
    }
  ];

  return (
    <div className="space-y-8 p-6">
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4">
        {focusTools.map((tool) => {
          const Icon = tool.icon;
          return (
            <motion.div
              key={tool.title}
              whileHover={{ scale: 1.02 }}
              whileTap={{ scale: 0.98 }}
              onClick={() => navigate(tool.route)}
            >
              <Card className="p-4 cursor-pointer hover:shadow-lg transition-shadow">
                <div className="flex items-center gap-3 mb-3">
                  <div className={`p-2 rounded-lg ${tool.color} bg-opacity-10`}>
                    <Icon className={`h-5 w-5 ${tool.color.replace('bg-', 'text-')}`} />
                  </div>
                  <h3 className="font-medium">{tool.title}</h3>
                </div>
                <p className="text-sm text-gray-600 dark:text-gray-400">
                  {tool.description}
                </p>
              </Card>
            </motion.div>
          );
        })}
      </div>

      <Card className="p-6">
        <h2 className="text-xl font-bold mb-6">Focus Analytics</h2>
        <DistractionAnalytics
          stats={state.blockingStats}
          patterns={state.distractionPatterns}
          logs={state.distractionLogs}
        />
      </Card>

      <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
        <Card className="p-6">
          <div className="flex items-center gap-2 mb-4">
            <Activity className="h-5 w-5 text-blue-500" />
            <h3 className="text-lg font-semibold">Today's Focus Score</h3>
          </div>
          <div className="text-3xl font-bold">{state.blockingStats.focusScore}/100</div>
          <p className="text-sm text-gray-600 mt-2">
            {state.blockingStats.improvementRate > 0
              ? `${state.blockingStats.improvementRate}% improvement from yesterday`
              : 'Keep working on your focus!'}
          </p>
        </Card>

        <Card className="p-6">
          <div className="flex items-center gap-2 mb-4">
            <Target className="h-5 w-5 text-purple-500" />
            <h3 className="text-lg font-semibold">Distractions Blocked</h3>
          </div>
          <div className="text-3xl font-bold">{state.blockingStats.todayBlocked}</div>
          <p className="text-sm text-gray-600 mt-2">
            {state.blockingStats.streakDays} day streak of staying focused
          </p>
        </Card>
      </div>
    </div>
  );
};

export default FocusDashboard;
