import React, { useState, useEffect } from 'react';
import { Card, CardContent, CardHeader, CardTitle, CardDescription, CardFooter } from '@/components/ui/card';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { Badge } from '@/components/ui/badge';
import { Separator } from '@/components/ui/separator';
import { Button } from '@/components/ui/button';
import { Progress } from '@/components/ui/progress';
import { AlertCircle, ArrowRight, ArrowUpRight, Clock, Coffee, Moon, Sun, Zap } from 'lucide-react';
import { SleepLog } from '@/types/health';

interface SleepQualityRecommendationsProps {
  sleepData?: SleepLog[];
  quitDays: number;
  recentSleepQuality?: number;
}

// Define recommendation types with priority levels
type RecommendationPriority = 'high' | 'medium' | 'low';

interface Recommendation {
  id: string;
  title: string;
  description: string;
  priority: RecommendationPriority;
  icon: React.ReactNode;
  quitStages: ('early' | 'middle' | 'late' | 'all')[];
  sleepQualityRange: [number, number]; // [min, max] - if current sleep quality is in this range, show recommendation
}

// Common sleep hygiene recommendations
const sleepRecommendations: Recommendation[] = [
  {
    id: 'nicotine-timing',
    title: 'Avoid nicotine before bed',
    description: 'If you\'re using NRT, try to avoid using it within 3 hours of bedtime as nicotine is a stimulant.',
    priority: 'high',
    icon: <Coffee className="h-5 w-5 text-orange-500" />,
    quitStages: ['early', 'middle'],
    sleepQualityRange: [0, 7]
  },
  {
    id: 'consistent-schedule',
    title: 'Maintain a consistent sleep schedule',
    description: 'Go to bed and wake up at the same time every day, even on weekends, to regulate your body\'s sleep-wake cycle.',
    priority: 'high',
    icon: <Clock className="h-5 w-5 text-blue-500" />,
    quitStages: ['all'],
    sleepQualityRange: [0, 10]
  },
  {
    id: 'bedroom-environment',
    title: 'Optimize your sleep environment',
    description: 'Keep your bedroom cool, dark, and quiet. Consider using earplugs, an eye mask, or a white noise machine.',
    priority: 'medium',
    icon: <Moon className="h-5 w-5 text-indigo-500" />,
    quitStages: ['all'],
    sleepQualityRange: [0, 8]
  },
  {
    id: 'relaxation-techniques',
    title: 'Practice relaxation techniques',
    description: 'Try deep breathing, progressive muscle relaxation, or meditation before bed to calm cravings and racing thoughts.',
    priority: 'high',
    icon: <Zap className="h-5 w-5 text-purple-500" />,
    quitStages: ['early', 'middle'],
    sleepQualityRange: [0, 6]
  },
  {
    id: 'nrt-timing',
    title: 'Adjust NRT timing',
    description: 'If you\'re using 24-hour nicotine patches, consider removing them before bed or switching to a lower dose if sleep is affected.',
    priority: 'medium',
    icon: <AlertCircle className="h-5 w-5 text-red-500" />,
    quitStages: ['early'],
    sleepQualityRange: [0, 5]
  },
  {
    id: 'exercise',
    title: 'Exercise regularly, but not too late',
    description: 'Regular physical activity can help you fall asleep faster and enjoy deeper sleep, but avoid exercising within a few hours of bedtime.',
    priority: 'medium',
    icon: <Zap className="h-5 w-5 text-green-500" />,
    quitStages: ['all'],
    sleepQualityRange: [0, 10]
  },
  {
    id: 'sleep-restriction',
    title: 'Implement sleep restriction',
    description: 'If you\'re spending too much time in bed awake, temporarily reduce your time in bed to increase sleep efficiency.',
    priority: 'low',
    icon: <ArrowRight className="h-5 w-5 text-amber-500" />,
    quitStages: ['middle', 'late'],
    sleepQualityRange: [0, 6]
  },
  {
    id: 'avoid-alcohol',
    title: 'Avoid alcohol as a sleep aid',
    description: 'While alcohol may help you fall asleep initially, it disrupts sleep quality and can increase cravings.',
    priority: 'high',
    icon: <AlertCircle className="h-5 w-5 text-red-500" />,
    quitStages: ['early', 'middle', 'late'],
    sleepQualityRange: [0, 8]
  },
  {
    id: 'morning-light',
    title: 'Get morning sunlight',
    description: 'Exposure to natural light in the morning helps regulate your body\'s circadian rhythm and improves sleep quality.',
    priority: 'medium',
    icon: <Sun className="h-5 w-5 text-yellow-500" />,
    quitStages: ['all'],
    sleepQualityRange: [0, 10]
  },
  {
    id: 'caffeine-limit',
    title: 'Limit caffeine intake',
    description: 'Avoid caffeine (coffee, tea, cola, chocolate) for at least 6 hours before bedtime.',
    priority: 'high',
    icon: <Coffee className="h-5 w-5 text-brown-500" />,
    quitStages: ['all'],
    sleepQualityRange: [0, 7]
  }
];

const SleepQualityRecommendations: React.FC<SleepQualityRecommendationsProps> = ({
  sleepData = [],
  quitDays,
  recentSleepQuality = 5
}) => {
  const [activeTab, setActiveTab] = useState<string>('recommendations');
  
  // Determine quit stage based on days since quitting
  const getQuitStage = (): 'early' | 'middle' | 'late' => {
    if (quitDays < 14) return 'early';
    if (quitDays < 60) return 'middle';
    return 'late';
  };
  
  const quitStage = getQuitStage();
  
  // Get relevant recommendations based on quit stage and sleep quality
  const getRelevantRecommendations = (): Recommendation[] => {
    return sleepRecommendations.filter(rec => 
      (rec.quitStages.includes(quitStage) || rec.quitStages.includes('all')) && 
      (recentSleepQuality >= rec.sleepQualityRange[0] && recentSleepQuality <= rec.sleepQualityRange[1])
    ).sort((a, b) => {
      const priorityOrder = { high: 0, medium: 1, low: 2 };
      return priorityOrder[a.priority] - priorityOrder[b.priority];
    });
  };
  
  const relevantRecommendations = getRelevantRecommendations();
  
  // Calculate sleep quality improvement if there's enough data
  const getSleepQualityImprovement = (): number | null => {
    if (sleepData.length < 7) return null;
    
    const recent = sleepData.slice(0, 3).reduce((sum, log) => sum + (log.quality || 0), 0) / 3;
    const earlier = sleepData.slice(-3).reduce((sum, log) => sum + (log.quality || 0), 0) / 3;
    
    return recent - earlier;
  };
  
  const improvement = getSleepQualityImprovement();
  
  // Calculate average sleep hours
  const getAverageSleepHours = (): number | null => {
    if (sleepData.length === 0) return null;
    return sleepData.reduce((sum, log) => sum + log.hours, 0) / sleepData.length;
  };
  
  const averageSleepHours = getAverageSleepHours();
  
  return (
    <Card>
      <CardHeader>
        <CardTitle className="flex items-center">
          <Moon className="mr-2 h-5 w-5 text-primary" />
          Sleep Recommendations
        </CardTitle>
        <CardDescription>
          Personalized guidance for improving sleep during your quit journey
        </CardDescription>
      </CardHeader>
      <CardContent className="space-y-4">
        <Tabs value={activeTab} onValueChange={setActiveTab}>
          <TabsList className="grid grid-cols-2">
            <TabsTrigger value="recommendations">Recommendations</TabsTrigger>
            <TabsTrigger value="insights">Insights</TabsTrigger>
          </TabsList>
          
          <TabsContent value="recommendations" className="space-y-4">
            {relevantRecommendations.length > 0 ? (
              <div className="space-y-3">
                {relevantRecommendations.map((rec, index) => (
                  <div key={rec.id} className="flex space-x-3 p-3 bg-muted/30 rounded-lg">
                    <div className="mt-0.5">{rec.icon}</div>
                    <div className="space-y-1 flex-1">
                      <div className="flex items-center justify-between">
                        <h4 className="font-medium text-sm">{rec.title}</h4>
                        <Badge 
                          variant={rec.priority === 'high' ? 'default' : rec.priority === 'medium' ? 'secondary' : 'outline'}
                          className="text-xs"
                        >
                          {rec.priority === 'high' ? 'Priority' : rec.priority === 'medium' ? 'Recommended' : 'Optional'}
                        </Badge>
                      </div>
                      <p className="text-xs text-muted-foreground">{rec.description}</p>
                    </div>
                  </div>
                ))}
              </div>
            ) : (
              <div className="text-center py-6">
                <Moon className="h-10 w-10 mx-auto text-muted-foreground mb-3" />
                <p className="text-muted-foreground">No specific recommendations at this time.</p>
              </div>
            )}
            
            <div className="pt-2">
              <Separator />
              <p className="text-xs text-muted-foreground mt-3">
                These recommendations are tailored to your quit journey stage ({quitDays} days) and recent sleep quality.
              </p>
            </div>
          </TabsContent>
          
          <TabsContent value="insights" className="space-y-4">
            <div className="grid grid-cols-2 gap-3">
              <Card className="bg-muted/30">
                <CardContent className="p-4">
                  <h4 className="text-xs text-muted-foreground mb-1">Quit Journey Stage</h4>
                  <div className="flex items-center justify-between">
                    <p className="font-medium">{quitStage === 'early' ? 'Early Phase' : quitStage === 'middle' ? 'Middle Phase' : 'Late Phase'}</p>
                    <Badge variant="outline">{quitDays} days</Badge>
                  </div>
                </CardContent>
              </Card>
              
              <Card className="bg-muted/30">
                <CardContent className="p-4">
                  <h4 className="text-xs text-muted-foreground mb-1">Recent Sleep Quality</h4>
                  <div className="space-y-1">
                    <div className="flex justify-between items-center">
                      <span className="text-sm font-medium">{recentSleepQuality}/10</span>
                      {improvement !== null && (
                        <Badge variant={improvement > 0 ? "success" : improvement < 0 ? "destructive" : "outline"}>
                          {improvement > 0 ? `+${improvement.toFixed(1)}` : improvement.toFixed(1)}
                        </Badge>
                      )}
                    </div>
                    <Progress value={recentSleepQuality * 10} className="h-2" />
                  </div>
                </CardContent>
              </Card>
            </div>
            
            <div className="space-y-2">
              <h4 className="text-sm font-medium">Sleep & Nicotine Withdrawal</h4>
              <p className="text-xs text-muted-foreground">
                {quitStage === 'early' ? (
                  "During the first 2 weeks of quitting, sleep disturbances are common. Your brain is adjusting to the absence of nicotine, which can lead to insomnia, vivid dreams, and restless sleep."
                ) : quitStage === 'middle' ? (
                  "In weeks 2-8, sleep typically begins to improve. You may experience fewer awakenings and more restful sleep, though some disturbances might still occur."
                ) : (
                  "After 2 months, most quitters experience significant improvements in sleep quality, with deeper sleep and more consistent rest patterns."
                )}
              </p>
              
              {averageSleepHours !== null && (
                <div className="bg-muted/30 rounded-lg p-3 mt-3">
                  <div className="flex justify-between items-center">
                    <h4 className="text-sm font-medium">Your Average Sleep Duration</h4>
                    <Badge variant={averageSleepHours >= 7 ? "success" : "outline"}>
                      {averageSleepHours.toFixed(1)} hours
                    </Badge>
                  </div>
                  <p className="text-xs text-muted-foreground mt-1">
                    {averageSleepHours < 6 ? (
                      "You're getting less sleep than recommended. Aim for 7-9 hours for optimal recovery."
                    ) : averageSleepHours < 7 ? (
                      "You're close to the recommended amount of sleep. Try to get a bit more for better recovery."
                    ) : (
                      "You're getting a healthy amount of sleep, which is excellent for your recovery journey."
                    )}
                  </p>
                </div>
              )}
            </div>
          </TabsContent>
        </Tabs>
      </CardContent>
      <CardFooter>
        <Button variant="outline" className="w-full" size="sm">
          View Sleep Hygiene Guide <ArrowUpRight className="ml-2 h-4 w-4" />
        </Button>
      </CardFooter>
    </Card>
  );
};

export default SleepQualityRecommendations; 