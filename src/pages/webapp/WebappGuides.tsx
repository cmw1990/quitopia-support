import React from 'react';
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Brain, Coffee, Moon, Sun, Dumbbell, Utensils, Heart, ArrowRight } from 'lucide-react';

export const WebappGuides: React.FC = () => {
  const guides = [
    {
      icon: Brain,
      title: "Cognitive Enhancement",
      description: "Science-backed strategies to boost mental performance",
      topics: [
        "Nootropics Guide",
        "Memory Techniques",
        "Brain Training Exercises",
        "Mental Models"
      ]
    },
    {
      icon: Coffee,
      title: "Energy Management",
      description: "Optimize your daily energy levels naturally",
      topics: [
        "Caffeine Optimization",
        "Energy-Boosting Foods",
        "Natural Supplements",
        "Peak Performance Timing"
      ]
    },
    {
      icon: Moon,
      title: "Sleep Optimization",
      description: "Improve your sleep quality and recovery",
      topics: [
        "Sleep Hygiene",
        "Circadian Rhythm",
        "Recovery Protocols",
        "Sleep Environment"
      ]
    },
    {
      icon: Sun,
      title: "Morning Routines",
      description: "Start your day for peak performance",
      topics: [
        "Light Exposure",
        "Morning Exercise",
        "Nutrition Timing",
        "Mindfulness Practice"
      ]
    },
    {
      icon: Dumbbell,
      title: "Physical Performance",
      description: "Enhance your physical energy and vitality",
      topics: [
        "Exercise Protocols",
        "Recovery Methods",
        "Movement Patterns",
        "Strength Training"
      ]
    },
    {
      icon: Utensils,
      title: "Nutrition Optimization",
      description: "Fuel your body and mind optimally",
      topics: [
        "Brain Foods",
        "Meal Timing",
        "Supplements Guide",
        "Hydration Protocol"
      ]
    },
    {
      icon: Heart,
      title: "Stress Management",
      description: "Build resilience and manage energy drains",
      topics: [
        "Breathing Techniques",
        "Meditation Guide",
        "Stress Response",
        "Recovery Practices"
      ]
    }
  ];

  return (
    <div className="container mx-auto p-6 space-y-6">
      <div className="space-y-2">
        <h1 className="text-3xl font-bold">Wellness Guides</h1>
        <p className="text-muted-foreground">
          Comprehensive guides to optimize your energy, focus, and overall well-being
        </p>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
        {guides.map((guide, index) => {
          const Icon = guide.icon;
          return (
            <Card key={index} className="flex flex-col">
              <CardHeader>
                <div className="flex items-start space-x-4">
                  <div className="p-2 bg-primary/10 rounded-lg">
                    <Icon className="h-6 w-6 text-primary" />
                  </div>
                  <div className="space-y-1">
                    <CardTitle>{guide.title}</CardTitle>
                    <CardDescription>{guide.description}</CardDescription>
                  </div>
                </div>
              </CardHeader>
              <CardContent className="flex-1">
                <ul className="space-y-2">
                  {guide.topics.map((topic, topicIndex) => (
                    <li key={topicIndex} className="flex items-center gap-2 text-sm text-muted-foreground">
                      <div className="h-1 w-1 rounded-full bg-primary" />
                      {topic}
                    </li>
                  ))}
                </ul>
              </CardContent>
              <CardContent className="pt-0">
                <Button variant="ghost" className="w-full justify-between">
                  View Guide
                  <ArrowRight className="h-4 w-4" />
                </Button>
              </CardContent>
            </Card>
          );
        })}
      </div>
    </div>
  );
};
