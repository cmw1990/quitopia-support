import React from 'react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Battery, Coffee, Sun } from 'lucide-react';

export const EnergyMetricsCard: React.FC = () => {
  // Sample data - in production this would come from your energy tracking data
  const energyData = {
    energyLevel: 88,
    caffeine: '200mg',
    peakHours: '9 AM - 1 PM',
  };

  return (
    <Card>
      <CardHeader>
        <CardTitle className="flex items-center gap-2">
          <Battery className="h-5 w-5 text-primary" />
          Energy Metrics
        </CardTitle>
      </CardHeader>
      <CardContent>
        <div className="space-y-4">
          <div className="flex items-center justify-between">
            <span className="text-sm text-muted-foreground">Energy Level</span>
            <span className="text-2xl font-bold text-primary">{energyData.energyLevel}%</span>
          </div>
          
          <div className="space-y-2">
            <div className="flex items-center gap-2">
              <Coffee className="h-4 w-4 text-muted-foreground" />
              <span className="text-sm text-muted-foreground">Caffeine Intake:</span>
              <span className="text-sm font-medium">{energyData.caffeine}</span>
            </div>
            
            <div className="flex items-center gap-2">
              <Sun className="h-4 w-4 text-muted-foreground" />
              <span className="text-sm text-muted-foreground">Peak Hours:</span>
              <span className="text-sm font-medium">{energyData.peakHours}</span>
            </div>
          </div>
        </div>
      </CardContent>
    </Card>
  );
};
