import React from 'react';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '../../ui/card';
import { Separator } from '../../ui/separator';
import { Badge } from '../../ui/badge';
import { Alert, AlertDescription } from '../../ui/alert';
import { InfoIcon } from 'lucide-react';

interface CorrelationData {
  metric1: string;
  metric2: string;
  strength: number; // -1 to 1
  description: string;
}

interface CorrelationMatrixProps {
  correlations: CorrelationData[];
  className?: string;
}

export const CorrelationMatrix: React.FC<CorrelationMatrixProps> = ({
  correlations,
  className = ''
}) => {
  // Skip rendering if no correlations
  if (!correlations || correlations.length === 0) {
    return (
      <Card className={className}>
        <CardHeader>
          <CardTitle>Relationship Analysis</CardTitle>
          <CardDescription>
            How your health metrics influence each other
          </CardDescription>
        </CardHeader>
        <CardContent>
          <Alert>
            <InfoIcon className="h-4 w-4" />
            <AlertDescription>
              Not enough data to analyze relationships between your health metrics yet.
              Continue tracking to unlock insights.
            </AlertDescription>
          </Alert>
        </CardContent>
      </Card>
    );
  }

  return (
    <Card className={className}>
      <CardHeader>
        <CardTitle>Relationship Analysis</CardTitle>
        <CardDescription>
          How your health metrics influence each other
        </CardDescription>
      </CardHeader>
      <CardContent>
        <div className="space-y-4">
          {correlations.map((correlation, index) => (
            <div key={`${correlation.metric1}-${correlation.metric2}`} className="space-y-2">
              <div className="flex items-center justify-between">
                <span className="font-medium">{correlation.metric1} & {correlation.metric2}</span>
                <CorrelationBadge strength={correlation.strength} />
              </div>
              
              <div className="w-full bg-gray-200 dark:bg-gray-700 h-2 rounded-full overflow-hidden">
                <div 
                  className={`h-full ${getCorrelationColor(correlation.strength)}`}
                  style={{ 
                    width: `${Math.abs(correlation.strength) * 100}%`, 
                    marginLeft: correlation.strength < 0 ? '50%' : undefined,
                    transform: correlation.strength < 0 ? 'translateX(-100%)' : undefined
                  }}
                />
              </div>
              
              <p className="text-sm text-muted-foreground">{correlation.description}</p>
              
              {index < correlations.length - 1 && (
                <Separator className="my-3" />
              )}
            </div>
          ))}
        </div>
      </CardContent>
    </Card>
  );
};

const CorrelationBadge: React.FC<{ strength: number }> = ({ strength }) => {
  if (Math.abs(strength) > 0.7) {
    return (
      <Badge variant={strength > 0 ? "default" : "destructive"}>
        {strength > 0 ? 'Strong Positive' : 'Strong Negative'}
      </Badge>
    );
  } else if (Math.abs(strength) > 0.3) {
    return (
      <Badge variant={strength > 0 ? "outline" : "secondary"}>
        {strength > 0 ? 'Moderate Positive' : 'Moderate Negative'}
      </Badge>
    );
  } else {
    return (
      <Badge variant="outline">
        Weak
      </Badge>
    );
  }
};

const getCorrelationColor = (strength: number): string => {
  if (strength > 0.7) {
    return 'bg-green-500';
  } else if (strength > 0.3) {
    return 'bg-lime-500';
  } else if (strength > 0) {
    return 'bg-blue-500';
  } else if (strength > -0.3) {
    return 'bg-amber-500';
  } else if (strength > -0.7) {
    return 'bg-orange-500';
  } else {
    return 'bg-red-500';
  }
}; 