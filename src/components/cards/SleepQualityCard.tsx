import React from 'react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Moon, Bed, Clock } from 'lucide-react';

export const SleepQualityCard: React.FC = () => {
  // Sample data - in production this would come from your sleep tracking data
  const sleepData = {
    quality: 85,
    duration: '7h 30m',
    bedtime: '10:30 PM',
    wakeTime: '6:00 AM',
  };

  return (
    <Card>
      <CardHeader>
        <CardTitle className="flex items-center gap-2">
          <Moon className="h-5 w-5 text-primary" />
          Sleep Quality
        </CardTitle>
      </CardHeader>
      <CardContent>
        <div className="space-y-4">
          <div className="flex items-center justify-between">
            <span className="text-sm text-muted-foreground">Quality Score</span>
            <span className="text-2xl font-bold text-primary">{sleepData.quality}%</span>
          </div>
          
          <div className="space-y-2">
            <div className="flex items-center gap-2">
              <Clock className="h-4 w-4 text-muted-foreground" />
              <span className="text-sm text-muted-foreground">Duration:</span>
              <span className="text-sm font-medium">{sleepData.duration}</span>
            </div>
            
            <div className="flex items-center gap-2">
              <Moon className="h-4 w-4 text-muted-foreground" />
              <span className="text-sm text-muted-foreground">Bedtime:</span>
              <span className="text-sm font-medium">{sleepData.bedtime}</span>
            </div>
            
            <div className="flex items-center gap-2">
              <Bed className="h-4 w-4 text-muted-foreground" />
              <span className="text-sm text-muted-foreground">Wake time:</span>
              <span className="text-sm font-medium">{sleepData.wakeTime}</span>
            </div>
          </div>
        </div>
      </CardContent>
    </Card>
  );
};
