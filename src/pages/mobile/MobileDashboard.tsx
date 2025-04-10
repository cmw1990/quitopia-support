
import React from 'react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Progress } from '@/components/ui/progress';
import { Brain, Zap, Clock, Check, List, Battery } from 'lucide-react';
import { FocusMeter } from '@/components/ui/focus-meter';

const MobileDashboard: React.FC = () => {
  // This would be fetched from the API in a real implementation
  const focusScore = 75;
  const energyLevel = 8;
  const todaysTasks = 5;
  const completedTasks = 2;
  const taskCompletion = (completedTasks / todaysTasks) * 100;
  const streakDays = 3;

  return (
    <div className="space-y-4 px-4">
      <h1 className="text-2xl font-bold mb-4">Dashboard</h1>
      
      <Card>
        <CardHeader className="pb-2">
          <CardTitle className="text-lg">Focus Status</CardTitle>
        </CardHeader>
        <CardContent>
          <FocusMeter 
            value={focusScore} 
            maxValue={100} 
            streakCount={streakDays} 
            flowState="building" 
          />
        </CardContent>
      </Card>

      <Card>
        <CardHeader className="pb-2">
          <CardTitle className="text-lg">Energy Level</CardTitle>
        </CardHeader>
        <CardContent>
          <div className="flex items-center gap-3">
            <Battery className="h-5 w-5 text-primary" />
            <div className="flex-1">
              <div className="flex justify-between mb-1">
                <span className="text-sm">Current Energy</span>
                <span className="text-sm font-medium">{energyLevel}/10</span>
              </div>
              <Progress value={energyLevel * 10} />
            </div>
          </div>
        </CardContent>
      </Card>

      <Card>
        <CardHeader className="pb-2">
          <CardTitle className="text-lg">Today's Tasks</CardTitle>
        </CardHeader>
        <CardContent className="space-y-3">
          <div className="flex justify-between items-center">
            <div className="flex items-center gap-2">
              <Check className="h-4 w-4 text-green-500" />
              <span>{completedTasks} of {todaysTasks} completed</span>
            </div>
            <span className="text-sm font-medium">{Math.round(taskCompletion)}%</span>
          </div>
          <Progress value={taskCompletion} />
          
          <Button variant="outline" className="w-full mt-2 gap-2">
            <List className="h-4 w-4" />
            View All Tasks
          </Button>
        </CardContent>
      </Card>

      <div className="grid grid-cols-2 gap-4">
        <Button className="h-20 flex flex-col gap-1 items-center justify-center">
          <Clock className="h-5 w-5" />
          <span>Start Timer</span>
        </Button>
        
        <Button variant="outline" className="h-20 flex flex-col gap-1 items-center justify-center">
          <Brain className="h-5 w-5" />
          <span>ADHD Tools</span>
        </Button>
        
        <Button variant="outline" className="h-20 flex flex-col gap-1 items-center justify-center">
          <Zap className="h-5 w-5" />
          <span>Energy Log</span>
        </Button>
        
        <Button variant="outline" className="h-20 flex flex-col gap-1 items-center justify-center">
          <List className="h-5 w-5" />
          <span>Quick Task</span>
        </Button>
      </div>
    </div>
  );
};

export default MobileDashboard;
