import React from 'react';
import { Card, CardHeader, CardContent, CardTitle, CardDescription } from '@/components/ui/card';
import { Progress } from '@/components/ui/progress';
import { Button } from '@/components/ui/button';
import { 
  Battery, 
  Sun, 
  Moon, 
  Coffee, 
  Dumbbell, 
  Brain,
  Utensils,
  Clock,
  Calendar,
  ChevronRight
} from 'lucide-react';

export const WebappEnergyPlans: React.FC = () => {
  const currentPlan = {
    name: "Peak Performance Plan",
    progress: 78,
    metrics: [
      { name: "Sleep Schedule", progress: 85, icon: Moon },
      { name: "Morning Routine", progress: 90, icon: Sun },
      { name: "Exercise Goals", progress: 65, icon: Dumbbell },
      { name: "Nutrition Plan", progress: 75, icon: Utensils },
      { name: "Focus Sessions", progress: 80, icon: Brain }
    ]
  };

  const recommendedPlans = [
    {
      name: "Morning Energy Boost",
      description: "Optimize your morning routine for sustained energy",
      icon: Sun,
      duration: "21 days",
      difficulty: "Moderate"
    },
    {
      name: "Deep Focus Enhancement",
      description: "Improve concentration and mental clarity",
      icon: Brain,
      duration: "14 days",
      difficulty: "Advanced"
    },
    {
      name: "Energy-Sleep Balance",
      description: "Align your sleep cycle with energy needs",
      icon: Moon,
      duration: "30 days",
      difficulty: "Beginner"
    }
  ];

  const dailySchedule = [
    { time: "06:00", activity: "Wake Up & Hydration", icon: Sun },
    { time: "06:30", activity: "Morning Exercise", icon: Dumbbell },
    { time: "07:30", activity: "Energizing Breakfast", icon: Utensils },
    { time: "09:00", activity: "Peak Focus Block", icon: Brain },
    { time: "11:00", activity: "Energy Check-in", icon: Battery },
    { time: "13:00", activity: "Lunch & Light Exercise", icon: Utensils },
    { time: "15:00", activity: "Afternoon Boost", icon: Coffee },
    { time: "19:00", activity: "Evening Wind Down", icon: Moon }
  ];

  return (
    <div className="container mx-auto p-6 space-y-6">
      <div className="flex items-center justify-between">
        <h1 className="text-3xl font-bold">Energy Plans</h1>
        <Button variant="outline" className="flex items-center gap-2">
          <Calendar className="h-4 w-4" />
          View Calendar
        </Button>
      </div>

      {/* Current Plan Progress */}
      <Card>
        <CardHeader>
          <div className="flex items-center justify-between">
            <div>
              <CardTitle>{currentPlan.name}</CardTitle>
              <CardDescription>Overall Progress</CardDescription>
            </div>
            <div className="text-2xl font-bold text-primary">{currentPlan.progress}%</div>
          </div>
        </CardHeader>
        <CardContent>
          <div className="space-y-6">
            {currentPlan.metrics.map((metric, index) => {
              const Icon = metric.icon;
              return (
                <div key={index}>
                  <div className="flex items-center justify-between mb-2">
                    <div className="flex items-center gap-2">
                      <Icon className="h-4 w-4 text-primary" />
                      <span>{metric.name}</span>
                    </div>
                    <span>{metric.progress}%</span>
                  </div>
                  <Progress value={metric.progress} />
                </div>
              );
            })}
          </div>
        </CardContent>
      </Card>

      {/* Daily Schedule */}
      <Card>
        <CardHeader>
          <CardTitle className="flex items-center gap-2">
            <Clock className="h-5 w-5 text-primary" />
            Today's Energy Schedule
          </CardTitle>
        </CardHeader>
        <CardContent>
          <div className="space-y-4">
            {dailySchedule.map((item, index) => {
              const Icon = item.icon;
              return (
                <div key={index} className="flex items-center gap-4">
                  <div className="text-sm text-muted-foreground w-16">{item.time}</div>
                  <Icon className="h-4 w-4 text-primary" />
                  <div className="flex-1">{item.activity}</div>
                </div>
              );
            })}
          </div>
        </CardContent>
      </Card>

      {/* Recommended Plans */}
      <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
        {recommendedPlans.map((plan, index) => {
          const Icon = plan.icon;
          return (
            <Card key={index}>
              <CardHeader>
                <div className="flex items-center gap-2">
                  <Icon className="h-5 w-5 text-primary" />
                  <CardTitle className="text-lg">{plan.name}</CardTitle>
                </div>
              </CardHeader>
              <CardContent>
                <p className="text-muted-foreground mb-4">{plan.description}</p>
                <div className="flex items-center justify-between text-sm">
                  <span>{plan.duration}</span>
                  <span className="text-primary">{plan.difficulty}</span>
                </div>
                <Button className="w-full mt-4" variant="outline">
                  View Plan
                  <ChevronRight className="h-4 w-4 ml-2" />
                </Button>
              </CardContent>
            </Card>
          );
        })}
      </div>
    </div>
  );
};
