
import React, { useState } from 'react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Progress } from '@/components/ui/progress';
import { Switch } from '@/components/ui/switch';
import { Label } from '@/components/ui/label';
import { HomeIcon, Monitor, Volume2, Sun, Users, Plus, Check } from 'lucide-react';
import { EnvironmentRecommendation } from '@/lib/types/distraction-types';
import { useToast } from '@/hooks/use-toast';

export const EnvironmentOptimizer: React.FC = () => {
  const [recommendations, setRecommendations] = useState<EnvironmentRecommendation[]>([
    {
      id: "1",
      user_id: "current-user", // Would be replaced with actual user ID
      category: "physical",
      title: "Declutter workspace",
      description: "Remove unnecessary items from your desk and organize cables",
      impact_level: "high",
      implemented: false,
      created_at: new Date().toISOString()
    },
    {
      id: "2",
      user_id: "current-user",
      category: "digital",
      title: "Clean up desktop",
      description: "Organize desktop files and create a clear folder structure",
      impact_level: "medium",
      implemented: false,
      created_at: new Date().toISOString()
    },
    {
      id: "3",
      user_id: "current-user",
      category: "social",
      title: "Establish office hours",
      description: "Let others know when you're available and when you need uninterrupted time",
      impact_level: "high",
      implemented: false,
      created_at: new Date().toISOString()
    }
  ]);
  const { toast } = useToast();

  const getImpactColor = (level: 'high' | 'medium' | 'low') => {
    switch (level) {
      case 'high': return 'text-green-500';
      case 'medium': return 'text-amber-500';
      case 'low': return 'text-blue-500';
      default: return 'text-gray-500';
    }
  };

  const getCategoryIcon = (category: 'physical' | 'digital' | 'social') => {
    switch (category) {
      case 'physical': return <HomeIcon className="h-4 w-4" />;
      case 'digital': return <Monitor className="h-4 w-4" />;
      case 'social': return <Users className="h-4 w-4" />;
      default: return <HomeIcon className="h-4 w-4" />;
    }
  };

  const handleToggleImplemented = (id: string) => {
    setRecommendations(recommendations.map(rec => {
      if (rec.id === id) {
        const newState = !rec.implemented;
        
        toast({
          title: newState ? "Recommendation Implemented" : "Recommendation Reset",
          description: newState ? "Great job implementing this change!" : "You can try this again when ready",
          variant: newState ? "success" : "default",
        });
        
        return { ...rec, implemented: newState };
      }
      return rec;
    }));
  };

  const implementedCount = recommendations.filter(rec => rec.implemented).length;
  const implementationRate = (implementedCount / recommendations.length) * 100;

  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between">
        <h2 className="text-2xl font-bold">Environment Optimizer</h2>
        <Button variant="outline" className="gap-2">
          <Plus className="h-4 w-4" />
          Add Custom
        </Button>
      </div>

      <Card>
        <CardHeader>
          <CardTitle>Implementation Progress</CardTitle>
        </CardHeader>
        <CardContent>
          <div className="space-y-2">
            <div className="flex justify-between text-sm">
              <span>{implementedCount} of {recommendations.length} implemented</span>
              <span>{Math.round(implementationRate)}%</span>
            </div>
            <Progress value={implementationRate} />
          </div>
        </CardContent>
      </Card>

      <div className="space-y-4">
        {recommendations.map(rec => (
          <Card key={rec.id}>
            <CardContent className="p-4">
              <div className="flex items-center justify-between">
                <div className="flex items-start gap-4">
                  <div className="p-2 bg-primary/10 rounded-full">
                    {getCategoryIcon(rec.category)}
                  </div>
                  <div>
                    <h3 className="font-medium">{rec.title}</h3>
                    <p className="text-sm text-muted-foreground">{rec.description}</p>
                    <div className="flex items-center mt-1 text-xs">
                      <span className={`font-medium ${getImpactColor(rec.impact_level)}`}>
                        {rec.impact_level.charAt(0).toUpperCase() + rec.impact_level.slice(1)} Impact
                      </span>
                    </div>
                  </div>
                </div>
                <div className="flex items-center gap-2">
                  <Label htmlFor={`switch-${rec.id}`} className="sr-only">
                    Toggle implemented
                  </Label>
                  <Switch
                    id={`switch-${rec.id}`}
                    checked={rec.implemented}
                    onCheckedChange={() => handleToggleImplemented(rec.id)}
                  />
                </div>
              </div>
            </CardContent>
          </Card>
        ))}
      </div>
    </div>
  );
};
