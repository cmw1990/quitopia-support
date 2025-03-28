import React from 'react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { useQuery } from '@tanstack/react-query';
import { predictCravingTimes } from '@/api/cravingService';
import { Alert, AlertDescription } from '@/components/ui/alert';
import { Clock, AlertCircle, Activity, Flame, Zap } from 'lucide-react';
import { format } from 'date-fns';
import { Progress } from '@/components/ui/progress';

interface TriggerPredictionProps {
  session: any;
}

export const TriggerPrediction: React.FC<TriggerPredictionProps> = ({ session }) => {
  // Query for craving time predictions
  const { data: predictions, isLoading, isError } = useQuery({
    queryKey: ['craving-predictions', session?.user?.id],
    queryFn: () => predictCravingTimes(session?.user?.id),
    enabled: !!session?.user?.id,
    staleTime: 1000 * 60 * 30, // 30 minutes
  });
  
  // Get the current hour
  const currentHour = new Date().getHours();
  
  // Format hour with AM/PM
  const formatHour = (hour: number): string => {
    return format(new Date().setHours(hour, 0, 0, 0), 'h a');
  };
  
  // Get color based on risk level
  const getRiskColor = (riskLevel: string): string => {
    switch (riskLevel) {
      case 'high':
        return 'bg-red-100 text-red-700';
      case 'medium':
        return 'bg-yellow-100 text-yellow-700';
      case 'low':
        return 'bg-green-100 text-green-700';
      default:
        return 'bg-blue-100 text-blue-700';
    }
  };
  
  // Get intervention icon based on type
  const getInterventionIcon = (interventionType: string) => {
    switch (interventionType) {
      case 'breathing':
        return <Activity className="h-4 w-4" />;
      case 'distract':
        return <Zap className="h-4 w-4" />;
      case 'reframe':
        return <Flame className="h-4 w-4" />;
      case 'timer':
        return <Clock className="h-4 w-4" />;
      default:
        return <Activity className="h-4 w-4" />;
    }
  };
  
  if (isLoading) {
    return (
      <Card>
        <CardContent className="pt-6">
          <p className="text-center text-sm text-muted-foreground py-4">
            Analyzing your patterns...
          </p>
        </CardContent>
      </Card>
    );
  }
  
  if (isError || !predictions || predictions.length === 0) {
    return (
      <Card>
        <CardContent className="pt-6">
          <Alert>
            <AlertCircle className="h-4 w-4" />
            <AlertDescription>
              Not enough data yet to predict your craving patterns. Continue tracking your cravings to get personalized predictions.
            </AlertDescription>
          </Alert>
        </CardContent>
      </Card>
    );
  }
  
  return (
    <Card>
      <CardHeader className="pb-2">
        <CardTitle className="text-lg">Craving Prediction</CardTitle>
      </CardHeader>
      <CardContent>
        <div className="space-y-4">
          <p className="text-sm text-muted-foreground">
            Based on your patterns, you may experience cravings during these times:
          </p>
          
          <div className="space-y-3">
            {predictions.map((prediction, index) => {
              const [startHour] = prediction.timeframe.split(' - ')[0].split(':').map(Number);
              const isCurrentTimeframe = currentHour === startHour;
              
              return (
                <div 
                  key={index} 
                  className={`p-3 rounded-lg border ${isCurrentTimeframe ? 'border-primary' : ''}`}
                >
                  <div className="flex items-center justify-between mb-2">
                    <div className="flex items-center">
                      <Clock className="h-4 w-4 mr-2 text-muted-foreground" />
                      <span className="font-medium">
                        {formatHour(startHour)} - {formatHour(startHour === 23 ? 0 : startHour + 1)}
                      </span>
                      {isCurrentTimeframe && (
                        <Badge variant="outline" className="ml-2 text-xs">Now</Badge>
                      )}
                    </div>
                    <Badge className={getRiskColor(prediction.riskLevel)}>
                      {prediction.riskLevel.charAt(0).toUpperCase() + prediction.riskLevel.slice(1)} Risk
                    </Badge>
                  </div>
                  
                  <Progress 
                    value={prediction.riskPercentage} 
                    className="h-1 mb-2" 
                  />
                  
                  <div className="flex items-center text-sm text-muted-foreground">
                    <span>Recommended:</span>
                    <div className="flex items-center ml-2">
                      {getInterventionIcon(prediction.recommendedIntervention)}
                      <span className="ml-1 text-primary font-medium">
                        {prediction.recommendedIntervention.charAt(0).toUpperCase() + 
                         prediction.recommendedIntervention.slice(1)}
                      </span>
                    </div>
                  </div>
                </div>
              );
            })}
          </div>
          
          <p className="text-xs text-muted-foreground mt-2">
            These predictions improve with more data. Continue tracking your cravings for more accurate insights.
          </p>
        </div>
      </CardContent>
    </Card>
  );
}; 