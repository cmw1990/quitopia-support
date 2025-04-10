import React from 'react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Activity, Brain, Zap, Trophy, TrendingUp, Target, Clock } from 'lucide-react';

export const WebappPerformance: React.FC = () => {
  const performanceMetrics = [
    {
      icon: Brain,
      title: "Cognitive Score",
      value: "92",
      trend: "+5%",
      color: "text-blue-500"
    },
    {
      icon: Zap,
      title: "Energy Level",
      value: "85",
      trend: "+3%",
      color: "text-yellow-500"
    },
    {
      icon: Target,
      title: "Focus Score",
      value: "88",
      trend: "+7%",
      color: "text-green-500"
    },
    {
      icon: Clock,
      title: "Deep Work",
      value: "6.5h",
      trend: "+1.2h",
      color: "text-purple-500"
    }
  ];

  const weeklyHighlights = [
    {
      day: "Monday",
      achievements: ["4 hours deep work", "Peak energy: 9 AM", "3 goals completed"]
    },
    {
      day: "Tuesday",
      achievements: ["5.5 hours deep work", "New focus record", "Morning routine completed"]
    },
    {
      day: "Wednesday",
      achievements: ["Perfect energy score", "6 hours deep work", "All daily goals met"]
    }
  ];

  const improvementTips = [
    {
      area: "Cognitive Performance",
      tips: [
        "Practice mindfulness meditation",
        "Take regular brain breaks",
        "Stay mentally challenged"
      ]
    },
    {
      area: "Energy Management",
      tips: [
        "Optimize meal timing",
        "Schedule tasks by energy level",
        "Take strategic power naps"
      ]
    },
    {
      area: "Focus Enhancement",
      tips: [
        "Use the Pomodoro Technique",
        "Create a distraction-free zone",
        "Set clear daily priorities"
      ]
    }
  ];

  return (
    <div className="container mx-auto p-6 space-y-6">
      <h1 className="text-3xl font-bold">Performance Analytics</h1>

      {/* Performance Metrics */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
        {performanceMetrics.map((metric, index) => (
          <Card key={index}>
            <CardContent className="pt-6">
              <div className="flex flex-col items-center space-y-2">
                <metric.icon className={`h-8 w-8 ${metric.color}`} />
                <h3 className="text-sm font-medium text-muted-foreground">{metric.title}</h3>
                <div className="text-3xl font-bold">{metric.value}</div>
                <span className="text-sm text-green-600">{metric.trend}</span>
              </div>
            </CardContent>
          </Card>
        ))}
      </div>

      {/* Weekly Performance */}
      <Card>
        <CardHeader>
          <CardTitle className="flex items-center gap-2">
            <Trophy className="h-5 w-5 text-primary" />
            Weekly Highlights
          </CardTitle>
        </CardHeader>
        <CardContent>
          <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
            {weeklyHighlights.map((day, index) => (
              <Card key={index}>
                <CardHeader>
                  <CardTitle className="text-lg">{day.day}</CardTitle>
                </CardHeader>
                <CardContent>
                  <ul className="space-y-2">
                    {day.achievements.map((achievement, achievementIndex) => (
                      <li key={achievementIndex} className="flex items-center gap-2">
                        <TrendingUp className="h-4 w-4 text-green-500" />
                        <span className="text-sm">{achievement}</span>
                      </li>
                    ))}
                  </ul>
                </CardContent>
              </Card>
            ))}
          </div>
        </CardContent>
      </Card>

      {/* Improvement Tips */}
      <Card>
        <CardHeader>
          <CardTitle className="flex items-center gap-2">
            <Activity className="h-5 w-5 text-primary" />
            Performance Optimization Tips
          </CardTitle>
        </CardHeader>
        <CardContent>
          <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
            {improvementTips.map((section, index) => (
              <div key={index} className="space-y-2">
                <h3 className="font-medium">{section.area}</h3>
                <ul className="space-y-1">
                  {section.tips.map((tip, tipIndex) => (
                    <li key={tipIndex} className="text-sm text-muted-foreground flex items-center gap-2">
                      <div className="h-1 w-1 rounded-full bg-primary" />
                      {tip}
                    </li>
                  ))}
                </ul>
              </div>
            ))}
          </div>
        </CardContent>
      </Card>
    </div>
  );
};
