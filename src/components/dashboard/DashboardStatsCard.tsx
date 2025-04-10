import React from 'react';
import { Card, CardHeader, CardTitle, CardDescription, CardContent } from '../ui/card';
import { Progress } from '../ui/progress';
import { Button } from '../ui/button';
import { 
  Clock, 
  CheckCircle, 
  BarChart2, 
  Zap 
} from 'lucide-react';

interface DashboardStatsCardProps {
  title: string;
  description: string;
  icon: React.ReactNode;
  value: number;
  total: number;
  color?: 'emerald' | 'indigo' | 'purple';
}

export const DashboardStatsCard: React.FC<DashboardStatsCardProps> = ({
  title,
  description,
  icon,
  value,
  total,
  color = 'emerald'
}) => {
  const percentage = (value / total) * 100;

  const colorClasses = {
    emerald: {
      bg: 'bg-emerald-50 dark:bg-emerald-900/30',
      text: 'text-emerald-600 dark:text-emerald-400',
      progress: 'bg-emerald-500 dark:bg-emerald-600'
    },
    indigo: {
      bg: 'bg-indigo-50 dark:bg-indigo-900/30',
      text: 'text-indigo-600 dark:text-indigo-400',
      progress: 'bg-indigo-500 dark:bg-indigo-600'
    },
    purple: {
      bg: 'bg-purple-50 dark:bg-purple-900/30',
      text: 'text-purple-600 dark:text-purple-400',
      progress: 'bg-purple-500 dark:bg-purple-600'
    }
  };

  return (
    <Card 
      className={`
        ${colorClasses[color].bg} 
        shadow-sm hover:shadow-md transition-shadow
      `}
    >
      <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
        <CardTitle className="text-sm font-medium text-gray-600 dark:text-gray-300">
          {title}
        </CardTitle>
        <div className={`${colorClasses[color].text}`}>
          {icon}
        </div>
      </CardHeader>
      <CardContent>
        <div className="text-2xl font-bold text-gray-900 dark:text-gray-100 mb-2">
          {value} / {total}
        </div>
        <CardDescription className="text-xs text-gray-500 dark:text-gray-400 mb-2">
          {description}
        </CardDescription>
        <Progress 
          value={percentage} 
          className="w-full h-2"
        />
      </CardContent>
    </Card>
  );
};

export const DashboardQuickActions: React.FC = () => {
  const actions = [
    {
      label: 'Start Focus Session',
      icon: <Clock className="mr-2 h-4 w-4" />,
      variant: 'outline' as const
    },
    {
      label: 'Add Task',
      icon: <CheckCircle className="mr-2 h-4 w-4" />,
      variant: 'secondary' as const
    },
    {
      label: 'View Analytics',
      icon: <BarChart2 className="mr-2 h-4 w-4" />,
      variant: 'default' as const
    },
    {
      label: 'Energy Boost',
      icon: <Zap className="mr-2 h-4 w-4" />,
      variant: 'destructive' as const
    }
  ];

  return (
    <div className="space-y-3">
      {actions.map((action, index) => (
        <Button 
          key={index} 
          variant={action.variant} 
          className="w-full justify-start"
        >
          {action.icon}
          {action.label}
        </Button>
      ))}
    </div>
  );
};

export const DashboardRecentActivities: React.FC = () => {
  const activities = [
    { 
      title: 'Completed Pomodoro Session', 
      icon: <Clock className="h-4 w-4 text-emerald-500" /> 
    },
    { 
      title: 'Added New Task', 
      icon: <CheckCircle className="h-4 w-4 text-indigo-500" /> 
    },
    { 
      title: 'Achieved Focus Goal', 
      icon: <BarChart2 className="h-4 w-4 text-purple-500" /> 
    }
  ];

  return (
    <div className="space-y-3">
      {activities.map((activity, index) => (
        <div 
          key={index} 
          className="flex items-center gap-3 bg-white dark:bg-gray-800 p-3 rounded-lg shadow-sm"
        >
          {activity.icon}
          <span className="text-sm text-gray-700 dark:text-gray-300">
            {activity.title}
          </span>
        </div>
      ))}
    </div>
  );
};