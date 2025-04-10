import { useState, useEffect, useCallback } from 'react';
import { Card } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Progress } from '@/components/ui/progress';
import { Tabs, TabsList, TabsTrigger, TabsContent } from '@/components/ui/tabs';
import {
  LineChart,
  Line,
  XAxis,
  YAxis,
  CartesianGrid,
  Tooltip,
  ResponsiveContainer
} from 'recharts';
import { useToast } from '@/components/ui/use-toast';
import type {
  CognitiveVitals,
  CognitiveSession,
  CognitiveLoadLevel
} from '@/types/cognitive-monitoring';
import { cn } from '@/lib/utils';

// Simulated monitoring logic - in production, this would use real metrics
const calculateCognitiveLoad = (
  focusScore: number,
  errorRate: number,
  responseTime: number
): CognitiveLoadLevel => {
  const load = (focusScore * 0.4) + (100 - errorRate) * 0.3 + (1000 - responseTime) * 0.3;
  if (load > 90) return 'excessive';
  if (load > 75) return 'optimal';
  if (load > 50) return 'moderate';
  return 'low';
};

const generateVitals = (previousVitals?: CognitiveVitals): CognitiveVitals => {
  const baseValue = previousVitals ? 
    Math.min(100, Math.max(0, previousVitals.focusScore + (Math.random() * 20 - 10))) :
    75 + Math.random() * 10;

  const vitals: CognitiveVitals = {
    id: crypto.randomUUID(),
    userId: 'current-user',
    timestamp: new Date().toISOString(),
    focusScore: baseValue,
    mentalFatigue: Math.max(0, 100 - baseValue),
    attentionSpan: baseValue * 0.8,
    workingMemoryCapacity: baseValue * 0.9,
    processingSpeed: 500 + Math.random() * 200,
    errorRate: (100 - baseValue) * 0.2,
    responseLatency: 250 + Math.random() * 100,
    taskSwitchingCost: 100 + Math.random() * 50,
    energyLevel: baseValue * 0.9,
    cognitiveLoad: calculateCognitiveLoad(
      baseValue,
      (100 - baseValue) * 0.2,
      250 + Math.random() * 100
    )
  };

  return vitals;
};

export function CognitiveMonitor() {
  const [isMonitoring, setIsMonitoring] = useState(false);
  const [currentVitals, setCurrentVitals] = useState<CognitiveVitals | null>(null);
  const [vitalsHistory, setVitalsHistory] = useState<CognitiveVitals[]>([]);
  const [activeTab, setActiveTab] = useState('realtime');
  const { toast } = useToast();

  const startMonitoring = useCallback(() => {
    setIsMonitoring(true);
    const initialVitals = generateVitals();
    setCurrentVitals(initialVitals);
    setVitalsHistory([initialVitals]);
    
    toast({
      title: "Cognitive Monitoring Started",
      description: "Tracking your mental performance in real-time",
    });
  }, [toast]);

  const stopMonitoring = useCallback(() => {
    setIsMonitoring(false);
    toast({
      title: "Monitoring Paused",
      description: "Your cognitive data has been saved",
    });
  }, [toast]);

  // Simulated real-time monitoring
  useEffect(() => {
    let interval: NodeJS.Timeout;
    if (isMonitoring) {
      interval = setInterval(() => {
        const newVitals = generateVitals(currentVitals);
        setCurrentVitals(newVitals);
        setVitalsHistory(prev => [...prev, newVitals]);

        // Alert if cognitive load becomes excessive
        if (newVitals.cognitiveLoad === 'excessive') {
          toast({
            title: "High Cognitive Load Detected",
            description: "Consider taking a break to prevent mental fatigue",
            variant: "destructive"
          });
        }
      }, 5000);
    }
    return () => clearInterval(interval);
  }, [isMonitoring, currentVitals, toast]);

  const renderMetricCard = (
    label: string,
    value: number,
    unit: string,
    colorClass: string
  ) => (
    <div className="p-4 rounded-lg border bg-card">
      <div className="text-sm font-medium text-muted-foreground mb-2">
        {label}
      </div>
      <div className={cn("text-2xl font-bold", colorClass)}>
        {Math.round(value)}
        <span className="text-sm font-normal text-muted-foreground ml-1">
          {unit}
        </span>
      </div>
    </div>
  );

  return (
    <Card className="p-6">
      <Tabs value={activeTab} onValueChange={setActiveTab}>
        <TabsList className="grid w-full grid-cols-3">
          <TabsTrigger value="realtime">Real-time</TabsTrigger>
          <TabsTrigger value="trends">Trends</TabsTrigger>
          <TabsTrigger value="insights">Insights</TabsTrigger>
        </TabsList>

        <TabsContent value="realtime" className="space-y-6">
          <div className="flex justify-between items-center">
            <div>
              <h3 className="text-2xl font-bold">Cognitive Monitor</h3>
              <p className="text-muted-foreground">
                Real-time tracking of your mental performance
              </p>
            </div>
            <Button
              onClick={isMonitoring ? stopMonitoring : startMonitoring}
              variant={isMonitoring ? "destructive" : "default"}
            >
              {isMonitoring ? "Stop Monitoring" : "Start Monitoring"}
            </Button>
          </div>

          {currentVitals && (
            <div className="grid grid-cols-2 gap-4">
              {renderMetricCard(
                "Focus Score",
                currentVitals.focusScore,
                "%",
                "text-primary"
              )}
              {renderMetricCard(
                "Mental Fatigue",
                currentVitals.mentalFatigue,
                "%",
                "text-destructive"
              )}
              {renderMetricCard(
                "Processing Speed",
                currentVitals.processingSpeed,
                "ms",
                "text-blue-500"
              )}
              {renderMetricCard(
                "Energy Level",
                currentVitals.energyLevel,
                "%",
                "text-green-500"
              )}
            </div>
          )}

          {currentVitals && (
            <div className="space-y-4">
              <div className="space-y-2">
                <div className="flex justify-between text-sm">
                  <span>Cognitive Load</span>
                  <span className={cn(
                    currentVitals.cognitiveLoad === 'excessive' && "text-destructive",
                    currentVitals.cognitiveLoad === 'optimal' && "text-primary"
                  )}>
                    {currentVitals.cognitiveLoad.toUpperCase()}
                  </span>
                </div>
                <Progress
                  value={
                    currentVitals.cognitiveLoad === 'low' ? 25 :
                    currentVitals.cognitiveLoad === 'moderate' ? 50 :
                    currentVitals.cognitiveLoad === 'optimal' ? 75 :
                    100
                  }
                  className={cn(
                    currentVitals.cognitiveLoad === 'excessive' && "text-destructive"
                  )}
                />
              </div>

              <div className="grid grid-cols-2 gap-4">
                <div className="space-y-2">
                  <div className="text-sm">Attention Span</div>
                  <Progress value={currentVitals.attentionSpan} />
                </div>
                <div className="space-y-2">
                  <div className="text-sm">Working Memory</div>
                  <Progress value={currentVitals.workingMemoryCapacity} />
                </div>
              </div>
            </div>
          )}
        </TabsContent>

        <TabsContent value="trends" className="space-y-6">
          {vitalsHistory.length > 0 && (
            <div className="h-[300px]">
              <ResponsiveContainer width="100%" height="100%">
                <LineChart data={vitalsHistory}>
                  <CartesianGrid strokeDasharray="3 3" />
                  <XAxis
                    dataKey="timestamp"
                    tickFormatter={(value) => new Date(value).toLocaleTimeString()}
                  />
                  <YAxis />
                  <Tooltip
                    labelFormatter={(value) => new Date(value).toLocaleTimeString()}
                  />
                  <Line
                    type="monotone"
                    dataKey="focusScore"
                    stroke="#2563eb"
                    name="Focus"
                  />
                  <Line
                    type="monotone"
                    dataKey="mentalFatigue"
                    stroke="#dc2626"
                    name="Fatigue"
                  />
                  <Line
                    type="monotone"
                    dataKey="energyLevel"
                    stroke="#16a34a"
                    name="Energy"
                  />
                </LineChart>
              </ResponsiveContainer>
            </div>
          )}
        </TabsContent>

        <TabsContent value="insights" className="space-y-6">
          {vitalsHistory.length > 0 && (
            <>
              <div className="space-y-4">
                <h4 className="font-semibold">Performance Insights</h4>
                <div className="grid grid-cols-2 gap-4">
                  <Card className="p-4">
                    <h5 className="font-medium mb-2">Peak Performance</h5>
                    <p className="text-sm text-muted-foreground">
                      Your focus is highest between{" "}
                      {new Date().getHours()}:00 - {new Date().getHours() + 2}:00
                    </p>
                  </Card>
                  <Card className="p-4">
                    <h5 className="font-medium mb-2">Recovery Needed</h5>
                    <p className="text-sm text-muted-foreground">
                      Consider a break in the next{" "}
                      {Math.round(
                        (100 - (currentVitals?.energyLevel || 0)) / 10
                      )}{" "}
                      minutes
                    </p>
                  </Card>
                </div>
              </div>

              <div className="space-y-4">
                <h4 className="font-semibold">Recommendations</h4>
                <ul className="space-y-2 text-sm text-muted-foreground">
                  <li>• Take a 5-minute mindfulness break</li>
                  <li>• Switch to less demanding tasks</li>
                  <li>• Hydrate and have a healthy snack</li>
                  <li>• Do some light stretching exercises</li>
                </ul>
              </div>
            </>
          )}
        </TabsContent>
      </Tabs>
    </Card>
  );
}
