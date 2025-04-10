import React from 'react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { EnergyMetricsCard } from '@/components/cards/EnergyMetricsCard';
import { EnergyChart } from '@/components/charts/EnergyChart';
import { Battery, Coffee, Sun, Moon, Utensils } from 'lucide-react';

export const WebappEnergy: React.FC = () => {
  const energyTips = [
    {
      icon: Sun,
      title: "Morning Routine",
      tips: [
        "Get 10-15 minutes of morning sunlight",
        "Start with light exercise",
        "Hydrate with water before caffeine",
      ],
    },
    {
      icon: Coffee,
      title: "Optimal Caffeine",
      tips: [
        "Wait 90 minutes after waking",
        "Stay under 400mg daily",
        "Stop 8-10 hours before bed",
      ],
    },
    {
      icon: Utensils,
      title: "Energy Nutrition",
      tips: [
        "Eat protein with every meal",
        "Include complex carbohydrates",
        "Stay hydrated throughout day",
      ],
    },
    {
      icon: Moon,
      title: "Evening Routine",
      tips: [
        "Dim lights 2 hours before bed",
        "Avoid blue light exposure",
        "Keep bedroom cool and dark",
      ],
    },
  ];

  return (
    <div className="container mx-auto p-6 space-y-6">
      <h1 className="text-3xl font-bold">Energy Optimization</h1>

      <div className="grid grid-cols-1 gap-6">
        {/* Energy Overview */}
        <Card>
          <CardHeader>
            <CardTitle className="flex items-center gap-2">
              <Battery className="h-5 w-5 text-primary" />
              Energy Overview
            </CardTitle>
          </CardHeader>
          <CardContent>
            <EnergyChart />
          </CardContent>
        </Card>

        {/* Current Metrics */}
        <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
          <EnergyMetricsCard />
          
          {/* Quick Actions */}
          <Card>
            <CardHeader>
              <CardTitle>Quick Actions</CardTitle>
            </CardHeader>
            <CardContent>
              <div className="grid grid-cols-2 gap-4">
                <Card className="p-4 hover:bg-primary/5 cursor-pointer transition-colors">
                  <div className="flex flex-col items-center gap-2">
                    <Coffee className="h-8 w-8 text-primary" />
                    <span>Log Caffeine</span>
                  </div>
                </Card>
                <Card className="p-4 hover:bg-primary/5 cursor-pointer transition-colors">
                  <div className="flex flex-col items-center gap-2">
                    <Utensils className="h-8 w-8 text-primary" />
                    <span>Log Meal</span>
                  </div>
                </Card>
                <Card className="p-4 hover:bg-primary/5 cursor-pointer transition-colors">
                  <div className="flex flex-col items-center gap-2">
                    <Sun className="h-8 w-8 text-primary" />
                    <span>Log Activity</span>
                  </div>
                </Card>
                <Card className="p-4 hover:bg-primary/5 cursor-pointer transition-colors">
                  <div className="flex flex-col items-center gap-2">
                    <Moon className="h-8 w-8 text-primary" />
                    <span>Log Sleep</span>
                  </div>
                </Card>
              </div>
            </CardContent>
          </Card>
        </div>

        {/* Energy Tips */}
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
          {energyTips.map((section, index) => {
            const Icon = section.icon;
            return (
              <Card key={index}>
                <CardHeader>
                  <CardTitle className="flex items-center gap-2">
                    <Icon className="h-5 w-5 text-primary" />
                    {section.title}
                  </CardTitle>
                </CardHeader>
                <CardContent>
                  <ul className="space-y-2">
                    {section.tips.map((tip, tipIndex) => (
                      <li key={tipIndex} className="text-sm text-muted-foreground">
                        • {tip}
                      </li>
                    ))}
                  </ul>
                </CardContent>
              </Card>
            );
          })}
        </div>
      </div>
    </div>
  );
};
