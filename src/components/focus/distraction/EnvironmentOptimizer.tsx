
import React from 'react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { EnvironmentRecommendation } from '@/lib/types/distraction-types';
import { Home, Monitor, Users } from 'lucide-react';

interface EnvironmentOptimizerProps {
  recommendations: EnvironmentRecommendation[];
  onImplement: (id: string) => void;
  onDismiss: (id: string) => void;
}

export const EnvironmentOptimizer: React.FC<EnvironmentOptimizerProps> = ({ 
  recommendations, 
  onImplement, 
  onDismiss 
}) => {
  const getCategoryIcon = (category: EnvironmentRecommendation['category']) => {
    switch (category) {
      case 'physical':
        return <Home className="h-4 w-4" />;
      case 'digital':
        return <Monitor className="h-4 w-4" />;
      case 'social':
        return <Users className="h-4 w-4" />;
      default:
        return null;
    }
  };

  const getImpactColor = (level: EnvironmentRecommendation['impact_level']) => {
    switch (level) {
      case 'high':
        return 'bg-red-100 text-red-800';
      case 'medium':
        return 'bg-yellow-100 text-yellow-800';
      case 'low':
        return 'bg-green-100 text-green-800';
      default:
        return '';
    }
  };

  return (
    <div className="space-y-6">
      <div className="flex justify-between items-center">
        <h3 className="text-lg font-medium">Environment Optimization</h3>
        <div className="flex space-x-2">
          <Button variant="outline" size="sm">
            <Home className="h-4 w-4 mr-2" />
            Physical
          </Button>
          <Button variant="outline" size="sm">
            <Monitor className="h-4 w-4 mr-2" />
            Digital
          </Button>
          <Button variant="outline" size="sm">
            <Users className="h-4 w-4 mr-2" />
            Social
          </Button>
        </div>
      </div>

      {recommendations.length === 0 ? (
        <Card>
          <CardContent className="flex flex-col items-center justify-center p-6">
            <p className="text-muted-foreground mb-4">No recommendations yet</p>
            <Button variant="outline">Generate Recommendations</Button>
          </CardContent>
        </Card>
      ) : (
        <div className="space-y-4">
          {recommendations.map((rec) => (
            <Card key={rec.id} className={rec.implemented ? "bg-muted" : ""}>
              <CardHeader className="pb-2">
                <div className="flex justify-between items-center">
                  <div className="flex items-center gap-2">
                    {getCategoryIcon(rec.category)}
                    <CardTitle className="text-base">{rec.title}</CardTitle>
                  </div>
                  <Badge className={getImpactColor(rec.impact_level)}>
                    {rec.impact_level.charAt(0).toUpperCase() + rec.impact_level.slice(1)} Impact
                  </Badge>
                </div>
              </CardHeader>
              <CardContent>
                <p className="text-sm mb-4">{rec.description}</p>
                {!rec.implemented ? (
                  <div className="flex justify-end space-x-2">
                    <Button 
                      variant="outline" 
                      size="sm"
                      onClick={() => onDismiss(rec.id)}
                    >
                      Dismiss
                    </Button>
                    <Button 
                      size="sm"
                      onClick={() => onImplement(rec.id)}
                    >
                      Implement
                    </Button>
                  </div>
                ) : (
                  <div className="text-right">
                    <Badge variant="outline" className="bg-green-50 text-green-700 border-green-200">
                      Implemented
                    </Badge>
                  </div>
                )}
              </CardContent>
            </Card>
          ))}
        </div>
      )}
    </div>
  );
};
