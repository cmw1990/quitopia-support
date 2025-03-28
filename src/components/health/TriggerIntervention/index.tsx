import React, { useState, useEffect, useMemo } from 'react';
import { Card, CardContent, CardDescription, CardFooter, CardHeader, CardTitle } from '@/components/ui/card';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { Button } from '@/components/ui/button';
import { Progress } from '@/components/ui/progress';
import { Separator } from '@/components/ui/separator';
import { Badge } from '@/components/ui/badge';
import { Alert, AlertDescription, AlertTitle } from '@/components/ui/alert';
import { BreathingExercise } from './BreathingExercise';
import { DistactionActivities } from './DistractionActivities';
import { ReframeThoughts } from './ReframeThoughts';
import { CravingTimer } from './CravingTimer';
import { HolisticAlternatives } from './HolisticAlternatives';
import { InterventionHistory } from './InterventionHistory';
import { TriggerPrediction } from './TriggerPrediction';
import { AlertCircle, Clock, Check, ThumbsUp, CheckCircle2, Award, BarChart, Clock4 } from 'lucide-react';
import { useToast } from '@/components/ui/use-toast';
import { useNavigate } from 'react-router-dom';
import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import { fetchCravingLogs, recordInterventionOutcome, CravingLog } from '@/api/cravingService';
import { format, parseISO, differenceInDays } from 'date-fns';

export interface TriggerInterventionProps {
  session: any;
  triggerId?: string; // Optional ID if coming from a specific trigger
  triggerType?: string; // The type of trigger (stress, social, etc.)
  intensity?: number; // The initial intensity (1-10)
  onComplete?: (success: boolean) => void; // Callback when intervention is complete
}

interface InterventionOutcome {
  triggerId: string;
  interventionType: string;
  successful: boolean;
  intensityBefore: number;
  intensityAfter: number;
  duration: number; // in seconds
  notes: string;
  timestamp?: string;
  timeOfDay?: string;
}

interface SuccessRateByMethod {
  method: string;
  successRate: number;
  totalUsed: number;
  averageTimeReduction: number;
}

interface TimeOfDayAnalysis {
  morning: number;
  afternoon: number;
  evening: number;
  night: number;
}

export const TriggerIntervention: React.FC<TriggerInterventionProps> = ({
  session,
  triggerId,
  triggerType = 'unknown',
  intensity = 7,
  onComplete
}) => {
  const [activeTab, setActiveTab] = useState('breathing');
  const [currentIntensity, setCurrentIntensity] = useState(intensity);
  const [interventionStarted, setInterventionStarted] = useState(false);
  const [interventionCompleted, setInterventionCompleted] = useState(false);
  const [startTime, setStartTime] = useState<Date | null>(null);
  const [elapsedTime, setElapsedTime] = useState(0);
  const [outcome, setOutcome] = useState<InterventionOutcome | null>(null);
  const [successfulMethods, setSuccessfulMethods] = useState<string[]>([]);
  const [currentStreak, setCurrentStreak] = useState(0);
  const [bestStreak, setBestStreak] = useState(0);
  const [successRate, setSuccessRate] = useState(0);
  const [showAnalytics, setShowAnalytics] = useState(false);
  const [methodStats, setMethodStats] = useState<SuccessRateByMethod[]>([]);
  const [timeOfDayStats, setTimeOfDayStats] = useState<TimeOfDayAnalysis>({
    morning: 0,
    afternoon: 0,
    evening: 0,
    night: 0
  });
  
  const { toast } = useToast();
  const navigate = useNavigate();
  const queryClient = useQueryClient();
  
  // Fetch previous successful interventions
  const { data: cravingLogs, isLoading: logsLoading } = useQuery({
    queryKey: ['craving-logs', session?.user?.id],
    queryFn: () => fetchCravingLogs(session?.user?.id, session),
    enabled: !!session?.user?.id,
    staleTime: 5 * 60 * 1000, // Cache for 5 minutes
  });
  
  // Record intervention outcome mutation
  const recordOutcome = useMutation({
    mutationFn: (outcome: InterventionOutcome) => {
      // Transform our component outcome to match the API expectations
      return recordInterventionOutcome({
        triggerId: outcome.triggerId,
        interventionType: outcome.interventionType,
        successful: outcome.successful,
        intensityBefore: outcome.intensityBefore,
        intensityAfter: outcome.intensityAfter,
        duration: outcome.duration,
        notes: outcome.notes
      });
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['craving-logs'] });
      toast({
        title: "Intervention recorded",
        description: "Your intervention outcome has been saved",
      });
    }
  });
  
  // Start intervention timer
  useEffect(() => {
    if (interventionStarted && !interventionCompleted) {
      const timer = setInterval(() => {
        if (startTime) {
          const seconds = Math.floor((new Date().getTime() - startTime.getTime()) / 1000);
          setElapsedTime(seconds);
        }
      }, 1000);
      
      return () => clearInterval(timer);
    }
  }, [interventionStarted, interventionCompleted, startTime]);
  
  // Determine current time of day
  const getCurrentTimeOfDay = (): string => {
    const hour = new Date().getHours();
    if (hour >= 5 && hour < 12) return 'morning';
    if (hour >= 12 && hour < 17) return 'afternoon';
    if (hour >= 17 && hour < 22) return 'evening';
    return 'night';
  };
  
  // Helper function to estimate initial intensity from intensity_reduction
  const getIntensityValues = (log: CravingLog): [number, number] => {
    if (!log.intervention_outcome) return [intensity, intensity];
    
    // If we have intensity_reduction, calculate the before/after values
    const reduction = log.intervention_outcome.intensity_reduction;
    // Use the log's intensity as the initial value if available, otherwise use current intensity
    const estimatedInitial = log.intensity || intensity;
    const estimatedAfter = Math.max(1, estimatedInitial - reduction);
    
    return [estimatedInitial, estimatedAfter];
  };
  
  // Analyze previous successful interventions when data logs load
  useEffect(() => {
    if (!cravingLogs || !Array.isArray(cravingLogs)) return;
    
    // Find successful intervention methods for this trigger type
    const successfulInterventions = cravingLogs
      .filter(log => log.trigger === triggerType && log.intervention_outcome?.successful)
      .map(log => log.intervention_outcome?.intervention_type)
      .filter(Boolean);
    
    // Count frequency of each method
    const methodCounts: Record<string, number> = {};
    successfulInterventions.forEach(method => {
      if (method) {
        methodCounts[method] = (methodCounts[method] || 0) + 1;
      }
    });
    
    // Get top methods
    const topMethods = Object.entries(methodCounts)
      .sort((a, b) => b[1] - a[1])
      .slice(0, 3)
      .map(([method]) => method);
    
    setSuccessfulMethods(topMethods);
    
    // Set initial tab to most successful method if available
    if (topMethods.length > 0) {
      setActiveTab(topMethods[0]);
    }
    
    // Calculate current streak
    const sortedLogs = [...cravingLogs]
      .filter(log => log.intervention_outcome !== null)
      .sort((a, b) => 
        new Date(b.timestamp).getTime() - new Date(a.timestamp).getTime()
      );
    
    // Calculate streak of successful interventions
    let streak = 0;
    for (const log of sortedLogs) {
      if (log.intervention_outcome?.successful) {
        streak++;
      } else {
        break;
      }
    }
    setCurrentStreak(streak);
    
    // Calculate best streak
    let bestStreak = 0;
    let currentBest = 0;
    for (const log of sortedLogs.reverse()) {
      if (log.intervention_outcome?.successful) {
        currentBest++;
        if (currentBest > bestStreak) {
          bestStreak = currentBest;
        }
      } else {
        currentBest = 0;
      }
    }
    setBestStreak(bestStreak);
    
    // Calculate overall success rate
    const totalInterventions = cravingLogs.filter(log => log.intervention_outcome !== null).length;
    const totalSuccessful = cravingLogs.filter(log => log.intervention_outcome?.successful).length;
    setSuccessRate(totalInterventions > 0 ? Math.round((totalSuccessful / totalInterventions) * 100) : 0);
    
    // Calculate success rate by method
    const methodStats: SuccessRateByMethod[] = [];
    const allMethods = new Set<string>();
    
    cravingLogs.forEach(log => {
      if (log.intervention_outcome?.intervention_type) {
        allMethods.add(log.intervention_outcome.intervention_type);
      }
    });
    
    allMethods.forEach(method => {
      const methodLogs = cravingLogs.filter(
        log => log.intervention_outcome?.intervention_type === method
      );
      
      const totalUsed = methodLogs.length;
      const successful = methodLogs.filter(log => log.intervention_outcome?.successful).length;
      const successRate = totalUsed > 0 ? (successful / totalUsed) * 100 : 0;
      
      // Calculate average intensity reduction
      let totalReduction = 0;
      let countWithReduction = 0;
      
      methodLogs.forEach(log => {
        if (log.intervention_outcome?.intensity_reduction) {
          totalReduction += log.intervention_outcome.intensity_reduction;
          countWithReduction++;
        }
      });
      
      const averageReduction = countWithReduction > 0 ? totalReduction / countWithReduction : 0;
      
      methodStats.push({
        method,
        successRate,
        totalUsed,
        averageTimeReduction: averageReduction
      });
    });
    
    setMethodStats(methodStats.sort((a, b) => b.successRate - a.successRate));
    
    // Calculate time of day success rates
    const timeOfDaySuccess: Record<string, {success: number, total: number}> = {
      morning: {success: 0, total: 0},
      afternoon: {success: 0, total: 0},
      evening: {success: 0, total: 0},
      night: {success: 0, total: 0}
    };
    
    cravingLogs.forEach(log => {
      if (log.timestamp) {
        const hour = new Date(log.timestamp).getHours();
        let timeOfDay = 'morning';
        
        if (hour >= 5 && hour < 12) timeOfDay = 'morning';
        else if (hour >= 12 && hour < 17) timeOfDay = 'afternoon';
        else if (hour >= 17 && hour < 22) timeOfDay = 'evening';
        else timeOfDay = 'night';
        
        timeOfDaySuccess[timeOfDay].total++;
        if (log.intervention_outcome?.successful) {
          timeOfDaySuccess[timeOfDay].success++;
        }
      }
    });
    
    // Convert to success rates
    const timeRates: TimeOfDayAnalysis = {
      morning: timeOfDaySuccess.morning.total > 0 
        ? (timeOfDaySuccess.morning.success / timeOfDaySuccess.morning.total) * 100 
        : 0,
      afternoon: timeOfDaySuccess.afternoon.total > 0 
        ? (timeOfDaySuccess.afternoon.success / timeOfDaySuccess.afternoon.total) * 100 
        : 0,
      evening: timeOfDaySuccess.evening.total > 0 
        ? (timeOfDaySuccess.evening.success / timeOfDaySuccess.evening.total) * 100 
        : 0,
      night: timeOfDaySuccess.night.total > 0 
        ? (timeOfDaySuccess.night.success / timeOfDaySuccess.night.total) * 100 
        : 0
    };
    
    setTimeOfDayStats(timeRates);
  }, [cravingLogs, triggerType, intensity]);
  
  const startIntervention = () => {
    setInterventionStarted(true);
    setStartTime(new Date());
    
    toast({
      title: "Intervention started",
      description: "Try different techniques until you feel the craving subside."
    });
  };
  
  const completeIntervention = (successful: boolean) => {
    setInterventionCompleted(true);
    
    const newOutcome: InterventionOutcome = {
      triggerId: triggerId || `manual-${new Date().getTime()}`,
      interventionType: activeTab,
      successful,
      intensityBefore: intensity,
      intensityAfter: currentIntensity,
      duration: elapsedTime,
      notes: `${successful ? 'Successfully' : 'Unsuccessfully'} managed a ${triggerType} trigger using ${activeTab}.`,
      timestamp: new Date().toISOString(),
      timeOfDay: getCurrentTimeOfDay()
    };
    
    setOutcome(newOutcome);
    recordOutcome.mutate(newOutcome);
    
    // Update local streak without waiting for server refresh
    if (successful) {
      setCurrentStreak(prev => prev + 1);
      setBestStreak(prev => Math.max(prev, currentStreak + 1));
    } else {
      setCurrentStreak(0);
    }
    
    if (onComplete) {
      onComplete(successful);
    }
  };
  
  const formatTime = (seconds: number): string => {
    const mins = Math.floor(seconds / 60);
    const secs = seconds % 60;
    return `${mins}:${secs < 10 ? '0' : ''}${secs}`;
  };
  
  // Calculate predicted success rate for current intervention based on historical data
  const predictedSuccessRate = useMemo(() => {
    if (!cravingLogs || !Array.isArray(cravingLogs) || cravingLogs.length === 0) return 50; // Default 50% if no data
    
    // Find similar interventions (same trigger type, similar intensity, same time of day)
    const currentTimeOfDay = getCurrentTimeOfDay();
    const similarInterventions = cravingLogs.filter(log => {
      if (!log.intervention_outcome) return false;
      
      const logHour = log.timestamp ? new Date(log.timestamp).getHours() : -1;
      let logTimeOfDay = '';
      
      if (logHour >= 5 && logHour < 12) logTimeOfDay = 'morning';
      else if (logHour >= 12 && logHour < 17) logTimeOfDay = 'afternoon';
      else if (logHour >= 17 && logHour < 22) logTimeOfDay = 'evening';
      else logTimeOfDay = 'night';
      
      // Estimate the initial intensity from the log
      const [estimatedInitial] = getIntensityValues(log);
      const intensitySimilar = Math.abs(estimatedInitial - intensity) <= 2;
      const sameTimeOfDay = logTimeOfDay === currentTimeOfDay;
      const sameTrigger = log.trigger === triggerType;
      
      return sameTrigger && (intensitySimilar || sameTimeOfDay);
    });
    
    if (similarInterventions.length === 0) {
      // Fallback to overall success rate
      const totalSuccessful = cravingLogs.filter(log => log.intervention_outcome?.successful).length;
      return Math.round((totalSuccessful / cravingLogs.length) * 100);
    }
    
    const successfulSimilar = similarInterventions.filter(log => log.intervention_outcome?.successful).length;
    return Math.round((successfulSimilar / similarInterventions.length) * 100);
  }, [cravingLogs, intensity, triggerType]);
  
  // Find most successful intervention method for current time of day
  const bestMethodForTimeOfDay = useMemo(() => {
    if (!cravingLogs || !Array.isArray(cravingLogs) || cravingLogs.length < 5) return null; // Not enough data
    
    const currentTimeOfDay = getCurrentTimeOfDay();
    
    // Group logs by method and time of day
    const methodSuccessByTime: Record<string, Record<string, {success: number, total: number}>> = {};
    
    cravingLogs.forEach(log => {
      if (!log.intervention_outcome?.intervention_type || !log.timestamp) return;
      
      const method = log.intervention_outcome.intervention_type;
      const logHour = new Date(log.timestamp).getHours();
      let logTimeOfDay = '';
      
      if (logHour >= 5 && logHour < 12) logTimeOfDay = 'morning';
      else if (logHour >= 12 && logHour < 17) logTimeOfDay = 'afternoon';
      else if (logHour >= 17 && logHour < 22) logTimeOfDay = 'evening';
      else logTimeOfDay = 'night';
      
      if (!methodSuccessByTime[method]) {
        methodSuccessByTime[method] = {
          morning: {success: 0, total: 0},
          afternoon: {success: 0, total: 0},
          evening: {success: 0, total: 0},
          night: {success: 0, total: 0}
        };
      }
      
      methodSuccessByTime[method][logTimeOfDay].total++;
      if (log.intervention_outcome.successful) {
        methodSuccessByTime[method][logTimeOfDay].success++;
      }
    });
    
    // Find method with best success rate for current time of day
    let bestMethod = '';
    let bestRate = 0;
    
    Object.entries(methodSuccessByTime).forEach(([method, timeStats]) => {
      const stats = timeStats[currentTimeOfDay];
      if (stats.total >= 3) { // Only consider methods with at least 3 tries at this time
        const rate = stats.success / stats.total;
        if (rate > bestRate) {
          bestRate = rate;
          bestMethod = method;
        }
      }
    });
    
    return bestMethod ? { method: bestMethod, successRate: Math.round(bestRate * 100) } : null;
  }, [cravingLogs]);
  
  return (
    <Card className="w-full">
      <CardHeader>
        <CardTitle>Trigger Intervention</CardTitle>
        <CardDescription>
          Use these tools to help manage your {triggerType} trigger
        </CardDescription>
        
        {!interventionStarted ? (
          <>
            <Button 
              onClick={startIntervention}
              className="w-full mt-2"
            >
              Start Intervention
            </Button>
            
            {predictedSuccessRate > 0 && (
              <div className="mt-2">
                <div className="flex items-center justify-between">
                  <span className="text-sm">Predicted success:</span>
                  <Badge 
                    variant={predictedSuccessRate >= 70 ? "success" : predictedSuccessRate >= 40 ? "warning" : "destructive"}
                    className="ml-2"
                  >
                    {predictedSuccessRate}% chance
                  </Badge>
                </div>
                <Progress value={predictedSuccessRate} className="h-1 mt-1" />
              </div>
            )}
            
            {bestMethodForTimeOfDay && (
              <Alert className="mt-3">
                <Clock4 className="h-4 w-4" />
                <AlertTitle>Time-Based Recommendation</AlertTitle>
                <AlertDescription>
                  Try <strong>{bestMethodForTimeOfDay.method}</strong> first - it has a {bestMethodForTimeOfDay.successRate}% success rate 
                  during this time of day.
                </AlertDescription>
              </Alert>
            )}
          </>
        ) : (
          <div className="flex flex-col space-y-2">
            <div className="flex justify-between items-center">
              <span className="text-sm font-medium">Current craving intensity: {currentIntensity}/10</span>
              <Badge variant={currentIntensity <= 3 ? "success" : currentIntensity <= 6 ? "warning" : "destructive"}>
                {currentIntensity <= 3 ? "Mild" : currentIntensity <= 6 ? "Moderate" : "Severe"}
              </Badge>
            </div>
            <Progress value={(10 - currentIntensity) * 10} className="h-2" />
            
            <div className="flex items-center justify-between mt-2">
              <div className="flex items-center">
                <Clock className="h-4 w-4 mr-1" />
                <span className="text-sm">{formatTime(elapsedTime)}</span>
              </div>
              <span className="text-xs text-muted-foreground">
                Most cravings pass within 3-5 minutes
              </span>
            </div>
          </div>
        )}
        
        {!interventionStarted && currentStreak > 0 && (
          <div className="mt-3 flex items-center">
            <Award className="h-4 w-4 mr-2 text-amber-500" />
            <span className="text-sm font-medium">Current streak: {currentStreak} successful interventions</span>
          </div>
        )}
        
        {successfulMethods.length > 0 && (
          <div className="mt-4">
            <p className="text-sm font-medium mb-1">Previously effective for you:</p>
            <div className="flex flex-wrap gap-2">
              {successfulMethods.map(method => (
                <Badge key={method} variant="outline" className="cursor-pointer" onClick={() => setActiveTab(method)}>
                  <CheckCircle2 className="h-3 w-3 mr-1" />
                  {method.charAt(0).toUpperCase() + method.slice(1)}
                </Badge>
              ))}
            </div>
          </div>
        )}
      </CardHeader>
      
      <CardContent>
        {interventionStarted && !interventionCompleted ? (
          <Tabs value={activeTab} onValueChange={setActiveTab}>
            <TabsList className="grid grid-cols-5 mb-4">
              <TabsTrigger value="breathing">Breathe</TabsTrigger>
              <TabsTrigger value="distract">Distract</TabsTrigger>
              <TabsTrigger value="reframe">Reframe</TabsTrigger>
              <TabsTrigger value="timer">Wait it Out</TabsTrigger>
              <TabsTrigger value="holistic">Alternatives</TabsTrigger>
            </TabsList>
            
            <TabsContent value="breathing">
              <BreathingExercise 
                onComplete={(newIntensity) => setCurrentIntensity(newIntensity)} 
              />
            </TabsContent>
            
            <TabsContent value="distract">
              <DistactionActivities
                onComplete={(newIntensity) => setCurrentIntensity(newIntensity)}
              />
            </TabsContent>
            
            <TabsContent value="reframe">
              <ReframeThoughts 
                triggerType={triggerType}
                onComplete={(newIntensity) => setCurrentIntensity(newIntensity)}
              />
            </TabsContent>
            
            <TabsContent value="timer">
              <CravingTimer 
                initialDuration={300} // 5 minutes
                onComplete={(newIntensity) => setCurrentIntensity(newIntensity)}
              />
            </TabsContent>
            
            <TabsContent value="holistic">
              <HolisticAlternatives
                onComplete={(newIntensity) => setCurrentIntensity(newIntensity)}
              />
            </TabsContent>
          </Tabs>
        ) : interventionCompleted ? (
          <div className="space-y-4">
            <Alert variant={outcome?.successful ? "default" : "destructive"} className={outcome?.successful ? "bg-green-50 border-green-200 dark:bg-green-900/20" : ""}>
              <AlertTitle>
                {outcome?.successful 
                  ? "Great job! You've successfully managed this craving." 
                  : "It's okay! Managing cravings takes practice."}
              </AlertTitle>
              <AlertDescription>
                {outcome?.successful 
                  ? `You reduced your craving intensity from ${outcome.intensityBefore} to ${outcome.intensityAfter} in ${formatTime(outcome.duration)}.`
                  : "Even unsuccessful attempts help build your resilience. Try a different technique next time."}
              </AlertDescription>
            </Alert>
            
            {outcome?.successful && currentStreak > 1 && (
              <Alert className="bg-amber-50 border-amber-200 dark:bg-amber-900/20">
                <Award className="h-4 w-4 text-amber-500" />
                <AlertTitle>Streak: {currentStreak}</AlertTitle>
                <AlertDescription>
                  You've successfully managed {currentStreak} cravings in a row! 
                  {currentStreak >= bestStreak && " That's a new personal best!"}
                </AlertDescription>
              </Alert>
            )}
            
            <div className="flex gap-2">
              <Button 
                onClick={() => navigate('/health/intervention-history')}
                variant="outline"
              >
                View History
              </Button>
              <Button 
                onClick={() => {
                  setInterventionStarted(false);
                  setInterventionCompleted(false);
                  setCurrentIntensity(intensity);
                  setElapsedTime(0);
                  setStartTime(null);
                  setOutcome(null);
                }}
              >
                Start New Intervention
              </Button>
            </div>
          </div>
        ) : !interventionStarted && (
          <div>
            <Button 
              variant="outline" 
              onClick={() => setShowAnalytics(!showAnalytics)}
              className="mb-4"
            >
              <BarChart className="h-4 w-4 mr-2" />
              {showAnalytics ? "Hide Analytics" : "Show Analytics"}
            </Button>
            
            {showAnalytics && (
              <div className="space-y-4">
                <div>
                  <h3 className="font-medium mb-2">Success Rate by Method</h3>
                  <div className="space-y-2">
                    {methodStats.map(stat => (
                      <div key={stat.method} className="space-y-1">
                        <div className="flex justify-between text-sm">
                          <span>{stat.method} ({stat.totalUsed} uses)</span>
                          <span>{Math.round(stat.successRate)}% success</span>
                        </div>
                        <Progress value={stat.successRate} className="h-1" />
                      </div>
                    ))}
                  </div>
                </div>
                
                <div>
                  <h3 className="font-medium mb-2">Success Rate by Time of Day</h3>
                  <div className="grid grid-cols-2 gap-2">
                    <div className="space-y-1">
                      <div className="flex justify-between text-sm">
                        <span>Morning</span>
                        <span>{Math.round(timeOfDayStats.morning)}%</span>
                      </div>
                      <Progress value={timeOfDayStats.morning} className="h-1" />
                    </div>
                    <div className="space-y-1">
                      <div className="flex justify-between text-sm">
                        <span>Afternoon</span>
                        <span>{Math.round(timeOfDayStats.afternoon)}%</span>
                      </div>
                      <Progress value={timeOfDayStats.afternoon} className="h-1" />
                    </div>
                    <div className="space-y-1">
                      <div className="flex justify-between text-sm">
                        <span>Evening</span>
                        <span>{Math.round(timeOfDayStats.evening)}%</span>
                      </div>
                      <Progress value={timeOfDayStats.evening} className="h-1" />
                    </div>
                    <div className="space-y-1">
                      <div className="flex justify-between text-sm">
                        <span>Night</span>
                        <span>{Math.round(timeOfDayStats.night)}%</span>
                      </div>
                      <Progress value={timeOfDayStats.night} className="h-1" />
                    </div>
                  </div>
                </div>
                
                <div className="flex items-center justify-between">
                  <div>
                    <div className="text-sm text-muted-foreground">Current Streak</div>
                    <div className="text-2xl font-bold">{currentStreak}</div>
                  </div>
                  <div>
                    <div className="text-sm text-muted-foreground">Best Streak</div>
                    <div className="text-2xl font-bold">{bestStreak}</div>
                  </div>
                  <div>
                    <div className="text-sm text-muted-foreground">Success Rate</div>
                    <div className="text-2xl font-bold">{successRate}%</div>
                  </div>
                </div>
                
                {/* Only pass session to TriggerPrediction */}
                <TriggerPrediction 
                  session={session}
                />
              </div>
            )}
          </div>
        )}
      </CardContent>
      
      {interventionStarted && !interventionCompleted && (
        <CardFooter className="flex justify-between">
          <Button
            variant="outline"
            onClick={() => completeIntervention(false)}
          >
            Still Craving
          </Button>
          <Button
            onClick={() => completeIntervention(true)}
          >
            Craving Managed
          </Button>
        </CardFooter>
      )}
    </Card>
  );
}; 