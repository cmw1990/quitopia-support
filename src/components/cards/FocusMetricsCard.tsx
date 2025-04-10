import React from 'react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Brain, Clock, Target } from 'lucide-react';

export const FocusMetricsCard: React.FC = () => {
  // Sample data - in production this would come from your focus tracking data
  const focusData = {
    focusScore: 92,
    deepWorkHours: 4.5,
    tasksCompleted: 8,
  };

  return (
    <Card>
      <CardHeader>
        <CardTitle className="flex items-center gap-2">
          <Brain className="h-5 w-5 text-primary" />
          Focus Metrics
        </CardTitle>
      </CardHeader>
      <CardContent>
        <div className="space-y-4">
          <div className="flex items-center justify-between">
            <span className="text-sm text-muted-foreground">Focus Score</span>
            <span className="text-2xl font-bold text-primary">{focusData.focusScore}%</span>
          </div>
          
          <div className="space-y-2">
            <div className="flex items-center gap-2">
              <Clock className="h-4 w-4 text-muted-foreground" />
              <span className="text-sm text-muted-foreground">Deep Work:</span>
              <span className="text-sm font-medium">{focusData.deepWorkHours} hours</span>
            </div>
            
            <div className="flex items-center gap-2">
              <Target className="h-4 w-4 text-muted-foreground" />
              <span className="text-sm text-muted-foreground">Tasks Completed:</span>
              <span className="text-sm font-medium">{focusData.tasksCompleted}</span>
            </div>
          </div>
        </div>
      </CardContent>
    </Card>
  );
};
