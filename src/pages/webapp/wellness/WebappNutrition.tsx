import React from 'react';
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Utensils, Apple, Coffee, Droplet, MessageSquare, Calendar } from 'lucide-react';

export const WebappNutrition: React.FC = () => {
  const nutritionMetrics = [
    {
      icon: Apple,
      title: "Energy Foods",
      value: "8/10",
      description: "Energy-optimizing food intake"
    },
    {
      icon: Coffee,
      title: "Caffeine",
      value: "200mg",
      description: "Daily caffeine consumption"
    },
    {
      icon: Droplet,
      title: "Hydration",
      value: "2.5L",
      description: "Daily water intake"
    }
  ];

  const mealPlan = [
    {
      time: "7:30 AM",
      meal: "Breakfast",
      suggestions: [
        "Oatmeal with berries",
        "Greek yogurt",
        "Green tea"
      ]
    },
    {
      time: "10:30 AM",
      meal: "Morning Snack",
      suggestions: [
        "Almonds",
        "Apple",
        "Green juice"
      ]
    },
    {
      time: "1:00 PM",
      meal: "Lunch",
      suggestions: [
        "Quinoa bowl",
        "Grilled chicken",
        "Mixed vegetables"
      ]
    }
  ];

  const supplements = [
    {
      name: "Omega-3",
      timing: "Morning",
      benefit: "Brain function & energy"
    },
    {
      name: "Vitamin D",
      timing: "Morning",
      benefit: "Energy & mood"
    },
    {
      name: "Magnesium",
      timing: "Evening",
      benefit: "Recovery & sleep"
    }
  ];

  return (
    <div className="container mx-auto p-6 space-y-6">
      <div className="flex justify-between items-center">
        <h1 className="text-3xl font-bold">Nutrition & Diet</h1>
        <Button className="flex items-center gap-2">
          <MessageSquare className="h-4 w-4" />
          Consult Dietitian
        </Button>
      </div>

      {/* Nutrition Metrics */}
      <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
        {nutritionMetrics.map((metric, index) => {
          const Icon = metric.icon;
          return (
            <Card key={index}>
              <CardContent className="pt-6">
                <div className="flex flex-col items-center space-y-2">
                  <Icon className="h-8 w-8 text-primary" />
                  <h3 className="font-medium">{metric.title}</h3>
                  <div className="text-2xl font-bold">{metric.value}</div>
                  <p className="text-sm text-muted-foreground">{metric.description}</p>
                </div>
              </CardContent>
            </Card>
          );
        })}
      </div>

      {/* Meal Planning */}
      <Card>
        <CardHeader>
          <CardTitle className="flex items-center gap-2">
            <Utensils className="h-5 w-5 text-primary" />
            Energy-Optimized Meal Plan
          </CardTitle>
          <CardDescription>Personalized meal suggestions for optimal energy levels</CardDescription>
        </CardHeader>
        <CardContent>
          <div className="space-y-6">
            {mealPlan.map((meal, index) => (
              <div key={index} className="space-y-2">
                <div className="flex items-center gap-2">
                  <Calendar className="h-4 w-4 text-primary" />
                  <h3 className="font-medium">{meal.time} - {meal.meal}</h3>
                </div>
                <ul className="grid grid-cols-1 md:grid-cols-3 gap-2">
                  {meal.suggestions.map((suggestion, suggestionIndex) => (
                    <li key={suggestionIndex} className="text-sm text-muted-foreground">
                      • {suggestion}
                    </li>
                  ))}
                </ul>
              </div>
            ))}
          </div>
        </CardContent>
      </Card>

      {/* Supplements */}
      <Card>
        <CardHeader>
          <CardTitle>Supplement Recommendations</CardTitle>
          <CardDescription>Personalized supplement plan for energy optimization</CardDescription>
        </CardHeader>
        <CardContent>
          <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
            {supplements.map((supplement, index) => (
              <div key={index} className="space-y-2">
                <h3 className="font-medium">{supplement.name}</h3>
                <div className="text-sm text-muted-foreground">
                  <p>Timing: {supplement.timing}</p>
                  <p>Benefit: {supplement.benefit}</p>
                </div>
              </div>
            ))}
          </div>
        </CardContent>
      </Card>
    </div>
  );
};
