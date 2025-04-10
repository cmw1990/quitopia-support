import React from 'react';
import { Card } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { Button } from '@/components/ui/button';
import { Label } from '@/components/ui/label';
import { Switch } from '@/components/ui/switch';
import { EnvironmentRecommendation } from '@/lib/types/distraction-types';
import { motion } from 'framer-motion';
import { SunDim, Moon, Volume2, Users, Laptop, Brain, Activity } from 'lucide-react';
import { useAuth } from '@/components/AuthProvider';
import { useToast } from '@/hooks/use-toast';
import { DistractionApiClient } from '@/lib/api/distraction-api';
import { EnvironmentStatus } from '@/components/ui/environment-status';
import { useState, useEffect, useCallback } from 'react';

type EnvironmentStatusType = {
  noise: 'low' | 'moderate' | 'high';
  lighting: 'dark' | 'dim' | 'bright';
  temperature: 'cold' | 'moderate' | 'warm';
};

type EnvironmentStats = {
  total_implemented: number;
  impact_score: number;
  top_recommendations: string[];
} | null;

interface Props {
  className?: string;
}

const getImpactColor = (level: EnvironmentRecommendation['impact_level']) => {
  switch (level) {
    case 'high': return 'bg-green-500';
    case 'medium': return 'bg-yellow-500';
    case 'low': return 'bg-blue-500';
    default: return 'bg-gray-500';
  }
};

const getTypeIcon = (type: EnvironmentRecommendation['type']) => {
  switch (type) {
    case 'physical': return SunDim;
    case 'digital': return Laptop;
    case 'social': return Users;
    default: return Brain;
  }
};

export const EnvironmentOptimizer: React.FC<Props> = ({
  className = ''
}) => {
  const { session } = useAuth();
  const { toast } = useToast();
  const [recommendations, setRecommendations] = useState<EnvironmentRecommendation[]>([]);
  const [isAutoImplementEnabled, setIsAutoImplementEnabled] = useState(false);
  const [stats, setStats] = useState<EnvironmentStats>(null);
  const [isLoading, setIsLoading] = useState(true);
  const [environmentStatus, setEnvironmentStatus] = useState<EnvironmentStatusType>({
    noise: 'moderate',
    lighting: 'bright',
    temperature: 'moderate'
  });

  const api = new DistractionApiClient(session?.access_token || '');

  const calculateEnvironmentScore = useCallback((status: EnvironmentStatusType): number => {
    let score = 0;

    if (status.noise === 'low') score += 33;
    else if (status.noise === 'moderate') score += 20;

    if (status.lighting === 'bright') score += 34;
    else if (status.lighting === 'dim') score += 20;

    if (status.temperature === 'moderate') score += 33;
    else if (status.temperature === 'cold' || status.temperature === 'warm') score += 15;

    return score;
  }, []);

  const getNextValue = useCallback(
    (type: keyof EnvironmentStatusType, currentValue: EnvironmentStatusType[keyof EnvironmentStatusType]): EnvironmentStatusType[keyof EnvironmentStatusType] => {
      const values = {
        noise: ['low', 'moderate', 'high'],
        lighting: ['dark', 'dim', 'bright'],
        temperature: ['cold', 'moderate', 'warm']
      };
      const currentIndex = values[type].indexOf(currentValue as string);
      return values[type][(currentIndex + 1) % values[type].length] as EnvironmentStatusType[keyof EnvironmentStatusType];
    },
    []
  );

  const handleImplement = useCallback(
    async (id: string, isAuto = false) => {
      try {
        await api.implementRecommendation(id, session!.user.id);
        await api.addEnvironmentLog({
          user_id: session!.user.id,
          recommendation_id: id,
          action: isAuto ? 'auto_implement' : 'implement',
          timestamp: new Date().toISOString()
        });

        setRecommendations(prev => prev.filter(rec => rec.id !== id));

        toast({
          title: 'Success',
          description: `Recommendation ${isAuto ? 'auto-' : ''}implemented successfully`,
        });

        const newStats = await api.getEnvironmentStats(session!.user.id);
        setStats(newStats);
      } catch (error) {
        console.error('Failed to implement recommendation:', error);
        toast({
          title: 'Error',
          description: 'Failed to implement recommendation',
          variant: 'destructive'
        });
      }
    },
    [api, session, toast]
  );

  const handleAutoImplementToggle = useCallback(
    async (checked: boolean) => {
      setIsAutoImplementEnabled(checked);
      if (checked) {
        const highImpactRecs = recommendations.filter(rec => rec.impact_level === 'high');
        for (const rec of highImpactRecs) {
          await handleImplement(rec.id, true);
        }
      }
    },
    [recommendations, handleImplement]
  );

  const handleDismiss = useCallback(
    async (id: string) => {
      try {
        await api.addEnvironmentLog({
          user_id: session!.user.id,
          recommendation_id: id,
          action: 'dismiss',
          timestamp: new Date().toISOString()
        });

        setRecommendations(prev => prev.filter(rec => rec.id !== id));

        toast({
          title: 'Success',
          description: 'Recommendation dismissed'
        });
      } catch (error) {
        console.error('Failed to dismiss recommendation:', error);
        toast({
          title: 'Error',
          description: 'Failed to dismiss recommendation',
          variant: 'destructive'
        });
      }
    },
    [api, session, toast]
  );

  const handleEnvironmentChange = useCallback(
    async (type: keyof EnvironmentStatusType, value: EnvironmentStatusType[keyof EnvironmentStatusType]) => {
      const newStatus = { ...environmentStatus, [type]: value };
      setEnvironmentStatus(newStatus);
      try {
        await api.updateEnvironmentStatus(session!.user.id, newStatus);
      } catch (error) {
        console.error('Failed to update environment status:', error);
      }
    },
    [api, session, environmentStatus]
  );

  useEffect(() => {
    if (session?.user?.id) {
      loadData();
    }
  }, [session?.user?.id]);

  const loadData = async () => {
    try {
      const [recommendationsData, statsData] = await Promise.all([
        api.getEnvironmentRecommendations(session!.user.id),
        api.getEnvironmentStats(session!.user.id)
      ]);

      setRecommendations(recommendationsData);
      setStats(statsData);
    } catch (error) {
      console.error('Failed to load environment data:', error);
      toast({
        title: 'Error',
        description: 'Failed to load environment data',
        variant: 'destructive'
      });
    } finally {
      setIsLoading(false);
    }
  };

  if (isLoading) {
    return (
      <div className="flex justify-center items-center h-40">
        <div className="animate-spin rounded-full h-12 w-12 border-t-2 border-b-2 border-blue-500" />
      </div>
    );
  }

  return (
    <div className="space-y-4">
      <div className="flex items-center justify-between mb-4">
        <h3 className="text-lg font-semibold">Environment Optimization</h3>
        <div className="flex items-center gap-2">
          <Label htmlFor="auto-implement">Auto-implement</Label>
          <Switch 
            id="auto-implement" 
            checked={isAutoImplementEnabled}
            onCheckedChange={handleAutoImplementToggle}
          />
        </div>
      </div>

      <div className={`space-y-4 ${className}`}>
        {stats && (
          <div className="grid grid-cols-3 gap-4 mb-6">
            <div className="bg-blue-50 dark:bg-blue-900/20 p-4 rounded-lg">
              <h4 className="text-sm font-medium text-blue-700 dark:text-blue-300">Implemented</h4>
              <p className="text-2xl font-bold text-blue-600 dark:text-blue-400">{stats.total_implemented}</p>
            </div>
            <div className="bg-green-50 dark:bg-green-900/20 p-4 rounded-lg">
              <h4 className="text-sm font-medium text-green-700 dark:text-green-300">Impact Score</h4>
              <p className="text-2xl font-bold text-green-600 dark:text-green-400">{stats.impact_score}</p>
            </div>
            <div className="bg-purple-50 dark:bg-purple-900/20 p-4 rounded-lg">
              <h4 className="text-sm font-medium text-purple-700 dark:text-purple-300">Environment Score</h4>
              <p className="text-2xl font-bold text-purple-600 dark:text-purple-400">
                {calculateEnvironmentScore(environmentStatus)}%
              </p>
            </div>
          </div>
        )}

        <div className="mb-6">
          <h3 className="text-lg font-semibold mb-4">Current Environment</h3>
          <EnvironmentStatus 
            noise={environmentStatus.noise}
            lighting={environmentStatus.lighting}
            temperature={environmentStatus.temperature}
            onStatusClick={type => {
              const nextValue = getNextValue(type, environmentStatus[type]);
              handleEnvironmentChange(type, nextValue);
            }}
          />
        </div>

        <div className="grid gap-4">
          {recommendations.map((rec) => {
            const Icon = getTypeIcon(rec.type);
            
            return (
              <motion.div
                key={rec.id}
                initial={{ opacity: 0, y: 20 }}
                animate={{ opacity: 1, y: 0 }}
                exit={{ opacity: 0, y: -20 }}
              >
                <Card className="p-4">
                  <div className="flex items-start gap-4">
                    <div className={`p-2 rounded-lg bg-${rec.type === 'physical' ? 'amber' : rec.type === 'digital' ? 'blue' : 'green'}-100`}>
                      <Icon className={`h-5 w-5 text-${rec.type === 'physical' ? 'amber' : rec.type === 'digital' ? 'blue' : 'green'}-500`} />
                    </div>

                    <div className="flex-1">
                      <div className="flex items-center justify-between mb-2">
                        <div className="flex items-center gap-2">
                          <h4 className="font-medium">{rec.description}</h4>
                          <Badge variant="outline" className={getImpactColor(rec.impact_level)}>
                            {rec.impact_level} impact
                          </Badge>
                        </div>
                      </div>

                      <div className="space-y-2 mt-4">
                        <h5 className="text-sm font-medium text-gray-600 dark:text-gray-400">Implementation Steps:</h5>
                        <ul className="text-sm space-y-1">
                          {rec.implementation_steps.map((step, i) => (
                            <li key={i} className="flex items-start gap-2">
                              <span className="mt-1">•</span>
                              <span>{step}</span>
                            </li>
                          ))}
                        </ul>

                        {rec.scientific_backing && (
                          <div className="mt-4">
                            <h5 className="text-sm font-medium text-gray-600 dark:text-gray-400">Research Basis:</h5>
                            <p className="text-sm text-gray-500 dark:text-gray-400 mt-1">{rec.scientific_backing}</p>
                          </div>
                        )}

                        <div className="flex items-center gap-2 mt-4">
                          <Button
                            variant="outline"
                            size="sm"
                            onClick={() => handleImplement(rec.id)}
                            className="flex-1"
                          >
                            Implement
                          </Button>
                          <Button
                            variant="ghost"
                            size="sm"
                            onClick={() => handleDismiss(rec.id)}
                          >
                            Dismiss
                          </Button>
                        </div>
                      </div>
                    </div>
                  </div>
                </Card>
              </motion.div>
            );
          })}
        </div>
      </div>
    </div>
  );
};
