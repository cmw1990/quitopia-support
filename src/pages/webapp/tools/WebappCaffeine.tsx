import React, { useState } from 'react';
import { Card, CardHeader, CardContent, CardTitle, CardDescription } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Progress } from '@/components/ui/progress';
import { Coffee, Clock, AlertTriangle, Plus, Minus, BarChart, Calendar } from 'lucide-react';

export const WebappCaffeine: React.FC = () => {
  const [dailyIntake, setDailyIntake] = useState(0);
  const maxRecommended = 400; // mg per day

  const caffeineContent = [
    { name: "Coffee (8 oz)", amount: 95, icon: Coffee },
    { name: "Espresso (1 oz)", amount: 64, icon: Coffee },
    { name: "Green Tea (8 oz)", amount: 28, icon: Coffee },
    { name: "Energy Drink (8 oz)", amount: 80, icon: Coffee },
  ];

  const intakeHistory = [
    { day: "Monday", amount: 285 },
    { day: "Tuesday", amount: 190 },
    { day: "Wednesday", amount: 380 },
    { day: "Thursday", amount: 285 },
    { day: "Friday", amount: 320 },
    { day: "Saturday", amount: 95 },
    { day: "Sunday", amount: 190 },
  ];

  const addCaffeine = (amount: number) => {
    setDailyIntake(prev => Math.min(prev + amount, 1000));
  };

  const resetIntake = () => {
    setDailyIntake(0);
  };

  const getIntakeStatus = () => {
    if (dailyIntake <= maxRecommended * 0.5) return "text-green-500";
    if (dailyIntake <= maxRecommended * 0.75) return "text-yellow-500";
    return "text-red-500";
  };

  return (
    <div className="container mx-auto p-6 space-y-6">
      <div className="flex items-center justify-between">
        <h1 className="text-3xl font-bold">Caffeine Tracker</h1>
        <Button variant="outline" className="flex items-center gap-2" onClick={resetIntake}>
          <Calendar className="h-4 w-4" />
          Reset Daily
        </Button>
      </div>

      {/* Daily Intake Tracker */}
      <Card>
        <CardHeader>
          <CardTitle className="flex items-center gap-2">
            <Coffee className="h-5 w-5 text-primary" />
            Today's Caffeine Intake
          </CardTitle>
          <CardDescription>Recommended daily limit: {maxRecommended}mg</CardDescription>
        </CardHeader>
        <CardContent>
          <div className="space-y-4">
            <div className="flex items-center justify-between">
              <span className={`text-2xl font-bold ${getIntakeStatus()}`}>
                {dailyIntake}mg
              </span>
              <Progress value={(dailyIntake / maxRecommended) * 100} className="w-2/3" />
            </div>
            
            {dailyIntake > maxRecommended && (
              <div className="flex items-center gap-2 text-red-500 text-sm">
                <AlertTriangle className="h-4 w-4" />
                <span>You've exceeded the recommended daily intake</span>
              </div>
            )}
          </div>
        </CardContent>
      </Card>

      {/* Quick Add */}
      <Card>
        <CardHeader>
          <CardTitle>Quick Add</CardTitle>
        </CardHeader>
        <CardContent>
          <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
            {caffeineContent.map((item, index) => (
              <Button
                key={index}
                variant="outline"
                className="flex flex-col items-center gap-2 h-auto p-4"
                onClick={() => addCaffeine(item.amount)}
              >
                <item.icon className="h-6 w-6" />
                <span className="text-sm font-medium">{item.name}</span>
                <span className="text-sm text-muted-foreground">{item.amount}mg</span>
              </Button>
            ))}
          </div>
        </CardContent>
      </Card>

      {/* Weekly History */}
      <Card>
        <CardHeader>
          <CardTitle className="flex items-center gap-2">
            <BarChart className="h-5 w-5 text-primary" />
            Weekly Intake History
          </CardTitle>
        </CardHeader>
        <CardContent>
          <div className="space-y-4">
            {intakeHistory.map((day, index) => (
              <div key={index}>
                <div className="flex items-center justify-between mb-2">
                  <span className="text-sm">{day.day}</span>
                  <span className="text-sm font-medium">{day.amount}mg</span>
                </div>
                <Progress value={(day.amount / maxRecommended) * 100} />
              </div>
            ))}
          </div>
        </CardContent>
      </Card>

      {/* Tips */}
      <Card>
        <CardHeader>
          <CardTitle>Caffeine Management Tips</CardTitle>
        </CardHeader>
        <CardContent>
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4 text-sm">
            <div>
              <h3 className="font-medium mb-2">Best Practices</h3>
              <ul className="space-y-1">
                <li>• Avoid caffeine 6 hours before bedtime</li>
                <li>• Stay hydrated with water</li>
                <li>• Consider caffeine alternatives</li>
                <li>• Monitor your tolerance levels</li>
              </ul>
            </div>
            <div>
              <h3 className="font-medium mb-2">Warning Signs</h3>
              <ul className="space-y-1">
                <li>• Jitters or anxiety</li>
                <li>• Sleep disturbances</li>
                <li>• Increased heart rate</li>
                <li>• Digestive issues</li>
              </ul>
            </div>
          </div>
        </CardContent>
      </Card>
    </div>
  );
};
