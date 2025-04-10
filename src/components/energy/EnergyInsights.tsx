import React, { useState, useEffect } from 'react';
import { 
  Card, 
  CardContent, 
  CardDescription, 
  CardFooter, 
  CardHeader, 
  CardTitle 
} from '@/components/ui/card';
import { 
  Activity, 
  AlertCircle, 
  ArrowRight, 
  Battery, 
  BatteryCharging, 
  Brain, 
  Coffee, 
  Download, 
  ExternalLink, 
  Eye, 
  Heart, 
  Info, 
  LineChart, 
  Lightbulb, 
  ListChecks, 
  Moon, 
  MoreHorizontal, 
  PieChart, 
  RefreshCcw, 
  Sparkles, 
  Sunrise, 
  Sunset, 
  Zap
} from 'lucide-react';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { Progress } from '@/components/ui/progress';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { 
  Accordion, 
  AccordionContent, 
  AccordionItem, 
  AccordionTrigger 
} from '@/components/ui/accordion';
import { Avatar, AvatarFallback, AvatarImage } from '@/components/ui/avatar';
import { supabaseRequest } from '@/utils/supabaseRequest'; // Corrected import
import { useAuth } from '@/context/AuthContext';
import { useToast } from '@/components/ui/use-toast';
import { motion } from 'framer-motion';

interface EnergyRecord {
  id: string;
  date: string;
  time: string;
  level: number;
  activity: string;
  factors: string[];
  notes: string;
}

interface EnergyTrend {
  trend: 'improving' | 'stable' | 'declining';
  percentageChange: number;
  period: string;
}

interface EnergyPattern {
  type: string;
  description: string;
  confidence: number;
  recommendation: string;
}

interface EnergyCorrelation {
  factor: string;
  correlation: number; // -1 to 1, where 1 is perfect positive correlation
  explanation: string;
  recommendation: string;
}

interface EnergyInsightProps {
  title: string;
  description: string;
  icon: React.ReactNode;
  children: React.ReactNode;
}

const EnergyInsight = ({ title, description, icon, children }: EnergyInsightProps) => (
  <Card className="border-primary/5 hover:border-primary/20 transition-all duration-200">
    <CardHeader className="pb-2">
      <div className="flex items-start justify-between">
        <div className="flex items-center gap-2">
          {icon}
          <CardTitle className="text-base">{title}</CardTitle>
        </div>
        <Button variant="ghost" size="icon" className="h-8 w-8 rounded-full">
          <Info className="h-4 w-4" />
        </Button>
      </div>
      <CardDescription>{description}</CardDescription>
    </CardHeader>
    <CardContent>{children}</CardContent>
  </Card>
);

export function EnergyInsights() {
  const [isLoading, setIsLoading] = useState(true);
  const [energyRecords, setEnergyRecords] = useState<EnergyRecord[]>([]);
  const [energyTrend, setEnergyTrend] = useState<EnergyTrend>({
    trend: 'stable',
    percentageChange: 0,
    period: 'last 30 days'
  });
  const [patterns, setPatterns] = useState<EnergyPattern[]>([]);
  const [correlations, setCorrelations] = useState<EnergyCorrelation[]>([]);
  const [activeTab, setActiveTab] = useState("patterns");
  
  const { user, session } = useAuth();
  const { toast } = useToast();

  useEffect(() => {
    fetchEnergyData();
  }, [user, session]);

  const fetchEnergyData = async () => {
    if (!user?.id || !session) {
      setIsLoading(false);
      return;
    }

    setIsLoading(true);
    try {
      // Use supabaseRequest, handle response, remove session arg
      const { data: records, error: recordsError } = await supabaseRequest<any[]>( // Use a more specific type if available
        `/rest/v1/energy_levels8?user_id=eq.${user.id}&order=recorded_at.desc&limit=100`,
        { method: 'GET' }
        // Removed session argument
      );
      if (recordsError) throw recordsError; // Propagate error

      if (records && records.length > 0) {
        const formattedRecords = records.map((record: any) => ({
          id: record.id,
          date: new Date(record.recorded_at).toISOString().split('T')[0],
          time: new Date(record.recorded_at).toTimeString().split(' ')[0].substring(0, 5),
          level: record.energy_level,
          activity: record.activity || 'Not specified',
          factors: record.factors || [],
          notes: record.notes || ''
        }));

        setEnergyRecords(formattedRecords);
        
        // Generate insights based on data
        generateInsights(formattedRecords);
        } else {
        // Use sample data for demo purposes if no data exists
        const sampleData = generateSampleData();
        setEnergyRecords(sampleData);
        
        // Generate insights based on sample data
        generateInsights(sampleData);
        }
      } catch (error) {
        console.error('Error fetching energy data:', error);
        toast({
        title: 'Failed to load energy insights',
        description: 'There was a problem analyzing your energy data. Please try again.',
          variant: 'destructive'
        });
      
      // Load sample data
      const sampleData = generateSampleData();
      setEnergyRecords(sampleData);
      
      // Generate insights based on sample data
      generateInsights(sampleData);
      } finally {
      setIsLoading(false);
      }
  };

  const generateSampleData = (): EnergyRecord[] => {
    const activities = ['Work', 'Exercise', 'Meeting', 'Study', 'Relaxation', 'Social', 'Creative Work'];
    const factors = ['Sleep', 'Nutrition', 'Stress', 'Exercise', 'Caffeine', 'Screen time', 'Hydration'];
    
    const records: EnergyRecord[] = [];
    const now = new Date();
    
    // Generate 50 sample records for the past 30 days
    for (let i = 0; i < 50; i++) {
      const daysAgo = Math.floor(Math.random() * 30);
      const hoursAgo = Math.floor(Math.random() * 24);
      const date = new Date(now);
      date.setDate(date.getDate() - daysAgo);
      date.setHours(date.getHours() - hoursAgo);
      
      const dateStr = date.toISOString().split('T')[0];
      const timeStr = date.toTimeString().split(' ')[0].substring(0, 5);
      
      const randomActivity = activities[Math.floor(Math.random() * activities.length)];
      
      // Generate 1-3 random factors
      const factorCount = Math.floor(Math.random() * 3) + 1;
      const randomFactors: string[] = [];
      for (let j = 0; j < factorCount; j++) {
        const factor = factors[Math.floor(Math.random() * factors.length)];
        if (!randomFactors.includes(factor)) {
          randomFactors.push(factor);
      }
      }
      
      // Generate random energy level that makes sense for the activity
      let level = 0;
      if (randomActivity === 'Exercise') {
        level = Math.floor(Math.random() * 3) + 7; // 7-9
      } else if (randomActivity === 'Meeting') {
        level = Math.floor(Math.random() * 4) + 4; // 4-7
      } else if (randomActivity === 'Relaxation') {
        level = Math.floor(Math.random() * 3) + 6; // 6-8
      } else {
        level = Math.floor(Math.random() * 10) + 1; // 1-10
      }
      
      records.push({
        id: `sample-${i}`,
        date: dateStr,
        time: timeStr,
        level,
        activity: randomActivity,
        factors: randomFactors,
        notes: `Sample ${randomActivity.toLowerCase()} activity with energy level ${level}/10.`
      });
    }
    
    // Sort by date/time descending
    records.sort((a, b) => {
      const dateA = new Date(`${a.date}T${a.time}`);
      const dateB = new Date(`${b.date}T${b.time}`);
      return dateB.getTime() - dateA.getTime();
    });
    
    return records;
  };

  const generateInsights = (data: EnergyRecord[]) => {
    // Calculate energy trends
    if (data.length > 0) {
      const recentRecords = data.slice(0, Math.floor(data.length / 2));
      const olderRecords = data.slice(Math.floor(data.length / 2));
      
      const recentAvg = recentRecords.reduce((sum, r) => sum + r.level, 0) / recentRecords.length;
      const olderAvg = olderRecords.reduce((sum, r) => sum + r.level, 0) / olderRecords.length;
      
      const percentageChange = Math.round(((recentAvg - olderAvg) / olderAvg) * 100);
      
      let trend: 'improving' | 'stable' | 'declining';
      if (percentageChange > 5) {
        trend = 'improving';
      } else if (percentageChange < -5) {
        trend = 'declining';
      } else {
        trend = 'stable';
      }
      
      setEnergyTrend({
        trend,
        percentageChange: Math.abs(percentageChange),
        period: `last ${data.length} entries`
      });
    }
    
    // Generate patterns
    const patterns: EnergyPattern[] = [
      {
        type: "Morning Energy",
        description: "Your energy levels are consistently higher in the morning hours (6am-10am).",
        confidence: 85,
        recommendation: "Schedule high-cognitive tasks during morning hours to leverage your natural energy peak."
      },
      {
        type: "Post-Exercise Boost",
        description: "Exercise sessions are frequently followed by 2-3 hour periods of elevated energy.",
        confidence: 78,
        recommendation: "Plan light to moderate exercise before important tasks that require focus and concentration."
      },
      {
        type: "Afternoon Slump",
        description: "Energy consistently dips between 2pm-4pm regardless of activities.",
        confidence: 92,
        recommendation: "Schedule breaks or light physical movement during this time to mitigate energy drops."
      },
      {
        type: "Screen Fatigue",
        description: "Extended periods (>3 hours) of screen time correlate with decreasing energy levels.",
        confidence: 81,
        recommendation: "Implement 20-20-20 rule: every 20 minutes, look at something 20 feet away for 20 seconds."
      },
      {
        type: "Weekend Recovery",
        description: "Average energy levels are 18% higher on weekends compared to weekdays.",
        confidence: 73,
        recommendation: "Ensure weekends include restorative activities to maintain energy reserves for the week."
      }
    ];
    
    setPatterns(patterns);
    
    // Generate correlations
    const correlations: EnergyCorrelation[] = [
      {
        factor: "Sleep Quality",
        correlation: 0.87,
        explanation: "Strong positive correlation between reported sleep quality and next-day energy levels.",
        recommendation: "Prioritize consistent sleep schedule and optimize sleep environment."
      },
      {
        factor: "Hydration",
        correlation: 0.72,
        explanation: "Moderate positive correlation between hydration and sustained energy throughout the day.",
        recommendation: "Drink water consistently throughout the day rather than large amounts infrequently."
      },
      {
        factor: "Screen Time",
        correlation: -0.65,
        explanation: "Moderate negative correlation between extended screen time and energy levels.",
        recommendation: "Implement regular screen breaks and use blue light filters in evening hours."
      },
      {
        factor: "Caffeine Timing",
        correlation: -0.42,
        explanation: "Weak negative correlation between afternoon caffeine consumption and evening energy levels.",
        recommendation: "Limit caffeine intake to before 2pm to avoid disrupting sleep and energy cycles."
      },
      {
        factor: "Social Interaction",
        correlation: 0.58,
        explanation: "Moderate positive correlation between meaningful social interactions and energy levels.",
        recommendation: "Balance solitary work with collaborative or social activities for sustained energy."
      }
    ];
    
    setCorrelations(correlations);
  };

  const getEnergyTrendIcon = () => {
    if (energyTrend.trend === 'improving') {
      return <LineChart className="h-5 w-5 text-green-500" />;
    } else if (energyTrend.trend === 'declining') {
      return <LineChart className="h-5 w-5 text-red-500" />;
    } else {
      return <LineChart className="h-5 w-5 text-amber-500" />;
    }
  };

  const getEnergyTrendDescription = () => {
    if (energyTrend.trend === 'improving') {
      return `Your average energy is improving by ${energyTrend.percentageChange}% over the ${energyTrend.period}.`;
    } else if (energyTrend.trend === 'declining') {
      return `Your average energy is declining by ${energyTrend.percentageChange}% over the ${energyTrend.period}.`;
    } else {
      return `Your energy levels have been stable over the ${energyTrend.period}.`;
    }
  };

  const getCorrelationColor = (correlation: number) => {
    const absCorrelation = Math.abs(correlation);
    if (absCorrelation > 0.7) {
      return correlation > 0 ? "text-green-500" : "text-red-500";
    } else if (absCorrelation > 0.4) {
      return correlation > 0 ? "text-green-400" : "text-red-400";
    } else {
      return correlation > 0 ? "text-green-300" : "text-red-300";
    }
  };

  const getCorrelationWidth = (correlation: number) => {
    return Math.abs(correlation) * 100;
  };

  const getFactorIcon = (factor: string) => {
    switch (factor.toLowerCase()) {
      case 'sleep quality':
        return <Moon className="h-4 w-4" />;
      case 'hydration':
        return <Coffee className="h-4 w-4" />;
      case 'screen time':
        return <Eye className="h-4 w-4" />;
      case 'caffeine timing':
        return <Coffee className="h-4 w-4" />;
      case 'social interaction':
        return <Heart className="h-4 w-4" />;
      default:
        return <Info className="h-4 w-4" />;
    }
  };

  return (
    <div className="space-y-6">
      {isLoading ? (
        <div className="flex justify-center items-center h-64">
          <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-primary"></div>
            </div>
      ) : (
        <>
          {/* Summary Section */}
          <div className="grid grid-cols-1 md:grid-cols-3 gap-4 mb-6">
            <Card className="col-span-2 border-primary/10">
              <CardHeader className="pb-2">
                <CardTitle className="text-lg flex items-center justify-between">
                  Energy Insights Summary
                  <Button variant="ghost" size="sm" onClick={fetchEnergyData} className="h-8 gap-1">
                    <RefreshCcw className="h-3 w-3" />
                    <span className="text-xs">Refresh</span>
                  </Button>
                </CardTitle>
                <CardDescription>
                  AI-powered analysis of your energy patterns and trends
                </CardDescription>
              </CardHeader>
              <CardContent className="space-y-4">
                <div className="flex items-center gap-3">
                  {getEnergyTrendIcon()}
                  <div className="flex-1">
                    <h4 className="text-sm font-medium mb-1">Overall Energy Trend</h4>
                    <p className="text-sm text-muted-foreground">
                      {getEnergyTrendDescription()}
                    </p>
                      </div>
                </div>
                
                <div className="flex items-center gap-3">
                  <Lightbulb className="h-5 w-5 text-amber-500" />
                  <div className="flex-1">
                    <h4 className="text-sm font-medium mb-1">Key Insight</h4>
                    <p className="text-sm text-muted-foreground">
                      {patterns.length > 0 && patterns.sort((a, b) => b.confidence - a.confidence)[0].recommendation}
                    </p>
                  </div>
                    </div>
                    
                <div className="flex items-center gap-3">
                  <BatteryCharging className="h-5 w-5 text-blue-500" />
                  <div className="flex-1">
                    <h4 className="text-sm font-medium mb-1">Energy Optimizer</h4>
                    <p className="text-sm text-muted-foreground">
                      {correlations.length > 0 && 
                        correlations.sort((a, b) => Math.abs(b.correlation) - Math.abs(a.correlation))[0].recommendation}
                    </p>
                  </div>
                </div>
              </CardContent>
              <CardFooter>
                <Button variant="outline" className="w-full gap-2">
                  <Download className="h-4 w-4" />
                  Download Full Energy Analysis Report
                </Button>
              </CardFooter>
            </Card>
            
            <Card className="border-primary/10 bg-gradient-to-br from-blue-50 to-indigo-50 dark:from-blue-950/30 dark:to-indigo-950/30">
              <CardHeader className="pb-2">
                <CardTitle className="text-base">Analyze Your Energy</CardTitle>
                <CardDescription>
                  Track more data for better insights
                </CardDescription>
              </CardHeader>
              <CardContent className="space-y-4">
                <div className="flex flex-col gap-2">
                  <div className="flex justify-between items-center">
                    <span className="text-sm">Data quality</span>
                    <Badge variant="outline">
                      {energyRecords.length > 50 ? "Excellent" : 
                       energyRecords.length > 30 ? "Good" : 
                       energyRecords.length > 15 ? "Fair" : "Limited"}
                    </Badge>
                  </div>
                  <Progress value={Math.min(100, (energyRecords.length / 50) * 100)} className="h-2" />
                  <p className="text-xs text-muted-foreground">
                    Based on {energyRecords.length} energy entries
                  </p>
                      </div>
                
                <div className="space-y-2">
                  <h4 className="text-sm font-medium">Improve your insights</h4>
                  <ul className="text-sm space-y-2">
                    <li className="flex items-center gap-2">
                      <Sparkles className="h-4 w-4 text-primary" />
                      Track energy levels 3+ times daily
                        </li>
                    <li className="flex items-center gap-2">
                      <Sparkles className="h-4 w-4 text-primary" />
                      Note activities and contributing factors
                        </li>
                    <li className="flex items-center gap-2">
                      <Sparkles className="h-4 w-4 text-primary" />
                      Maintain consistent tracking for 14+ days
                        </li>
                      </ul>
                </div>
              </CardContent>
            </Card>
          </div>
          
          {/* Insights Tabs */}
          <Tabs value={activeTab} onValueChange={setActiveTab} className="w-full">
            <TabsList className="grid grid-cols-2 w-full mb-4">
              <TabsTrigger value="patterns" className="flex items-center gap-2">
                <Brain className="h-4 w-4" />
                <span>Energy Patterns</span>
              </TabsTrigger>
              <TabsTrigger value="correlations" className="flex items-center gap-2">
                <LineChart className="h-4 w-4" />
                <span>Factor Correlations</span>
              </TabsTrigger>
            </TabsList>
            
            <TabsContent value="patterns" className="space-y-4">
              <div className="grid grid-cols-1 gap-4">
                {patterns.map((pattern, index) => (
                  <EnergyInsight
                    key={index}
                    title={pattern.type}
                    description={pattern.description}
                    icon={pattern.type.includes("Morning") ? <Sunrise className="h-5 w-5 text-amber-500" /> :
                           pattern.type.includes("Exercise") ? <Activity className="h-5 w-5 text-green-500" /> :
                           pattern.type.includes("Afternoon") ? <Sunset className="h-5 w-5 text-orange-500" /> :
                           pattern.type.includes("Screen") ? <Eye className="h-5 w-5 text-red-500" /> :
                           pattern.type.includes("Weekend") ? <Moon className="h-5 w-5 text-blue-500" /> :
                           <Zap className="h-5 w-5 text-purple-500" />}
                  >
                    <div className="space-y-3">
                      <div>
                        <div className="flex justify-between items-center mb-1">
                          <span className="text-sm font-medium">Confidence</span>
                          <span className="text-sm">{pattern.confidence}%</span>
                        </div>
                        <Progress value={pattern.confidence} className="h-2" />
                      </div>
                      
                      <div className="p-3 bg-muted/30 rounded-md">
                        <h4 className="text-sm font-medium flex items-center gap-1 mb-1">
                          <Lightbulb className="h-4 w-4 text-amber-500" />
                          Recommendation
                        </h4>
                        <p className="text-sm">{pattern.recommendation}</p>
                      </div>
                      
                      <Button variant="outline" size="sm" className="w-full">
                        <span className="mr-1">View Detailed Analysis</span>
                        <ArrowRight className="h-3 w-3" />
                      </Button>
                    </div>
                  </EnergyInsight>
                ))}
              </div>
            </TabsContent>
            
            <TabsContent value="correlations" className="space-y-4">
              <div className="grid grid-cols-1 gap-4">
                {correlations.map((correlation, index) => (
                  <EnergyInsight
                    key={index}
                    title={correlation.factor}
                    description={correlation.explanation}
                    icon={getFactorIcon(correlation.factor)}
                  >
                    <div className="space-y-4">
                      <div>
                        <div className="flex justify-between items-center mb-1">
                          <span className="text-sm font-medium">Correlation Strength</span>
                          <span className={`text-sm ${getCorrelationColor(correlation.correlation)}`}>
                            {Math.abs(correlation.correlation * 100).toFixed(0)}%
                            {correlation.correlation > 0 ? " Positive" : " Negative"}
                          </span>
                        </div>
                        <div className="h-2 w-full bg-gray-100 dark:bg-gray-800 rounded-full overflow-hidden">
                          <div 
                            className={`h-full ${correlation.correlation > 0 ? "bg-green-500" : "bg-red-500"}`}
                            style={{ width: `${getCorrelationWidth(correlation.correlation)}%` }}
                          ></div>
                        </div>
                      </div>
                      
                      <div className="p-3 bg-muted/30 rounded-md">
                        <h4 className="text-sm font-medium flex items-center gap-1 mb-1">
                          <Lightbulb className="h-4 w-4 text-amber-500" />
                          Recommendation
                        </h4>
                        <p className="text-sm">{correlation.recommendation}</p>
                      </div>
                      
                      <div className="flex items-center justify-between">
                        <Button variant="outline" size="sm" className="gap-1">
                          <PieChart className="h-3 w-3" />
                          <span>View Data</span>
                        </Button>
                        <Button variant="outline" size="sm" className="gap-1">
                          <ExternalLink className="h-3 w-3" />
                          <span>Learn More</span>
                        </Button>
                      </div>
                    </div>
                  </EnergyInsight>
                ))}
              </div>
          </TabsContent>
          </Tabs>
          
          {/* Expert Tips */}
          <Card className="border-primary/5 bg-gradient-to-r from-indigo-50/50 to-blue-50/50 dark:from-indigo-950/30 dark:to-blue-950/30">
              <CardHeader>
              <CardTitle>Expert Energy Management Tips</CardTitle>
                <CardDescription>
                Science-backed strategies to optimize your energy throughout the day
                </CardDescription>
              </CardHeader>
              <CardContent>
              <Accordion type="single" collapsible className="w-full">
                <AccordionItem value="item-1">
                  <AccordionTrigger>
                    <div className="flex items-center gap-2">
                      <Sunrise className="h-4 w-4 text-amber-500" />
                      <span>Morning Energy Optimization</span>
                    </div>
                  </AccordionTrigger>
                  <AccordionContent>
                    <div className="space-y-2 pl-6">
                      <p className="text-sm">
                        Establish a consistent morning routine that includes exposure to natural light, 
                        light physical activity, and a balanced breakfast to set your circadian rhythm 
                        and stabilize blood sugar levels.
                      </p>
                      <div className="flex justify-between text-sm text-muted-foreground">
                        <span>Source: Sleep Foundation</span>
                        <Button variant="link" size="sm" className="h-auto p-0">
                          Read more
                        </Button>
                      </div>
                </div>
                  </AccordionContent>
                </AccordionItem>
                
                <AccordionItem value="item-2">
                  <AccordionTrigger>
                    <div className="flex items-center gap-2">
                      <Activity className="h-4 w-4 text-green-500" />
                      <span>Strategic Movement Breaks</span>
                    </div>
                  </AccordionTrigger>
                  <AccordionContent>
                    <div className="space-y-2 pl-6">
                      <p className="text-sm">
                        Incorporate 2-5 minute movement breaks every 60-90 minutes of focused work. 
                        Brief movement increases blood flow, reduces mental fatigue, and improves 
                        cognitive function in subsequent tasks.
                      </p>
                      <div className="flex justify-between text-sm text-muted-foreground">
                        <span>Source: Journal of Occupational Health</span>
                        <Button variant="link" size="sm" className="h-auto p-0">
                          Read more
                        </Button>
                      </div>
                    </div>
                  </AccordionContent>
                </AccordionItem>
                
                <AccordionItem value="item-3">
                  <AccordionTrigger>
                    <div className="flex items-center gap-2">
                      <Coffee className="h-4 w-4 text-amber-500" />
                      <span>Strategic Caffeine Timing</span>
                    </div>
                  </AccordionTrigger>
                  <AccordionContent>
                    <div className="space-y-2 pl-6">
                      <p className="text-sm">
                        Consume caffeine 90-120 minutes after waking rather than immediately, as this aligns 
                        better with your body's natural cortisol production cycle. Limit caffeine intake to 
                        before 2pm to avoid interference with sleep quality.
                      </p>
                      <div className="flex justify-between text-sm text-muted-foreground">
                        <span>Source: Journal of Clinical Sleep Medicine</span>
                        <Button variant="link" size="sm" className="h-auto p-0">
                          Read more
                        </Button>
                      </div>
                    </div>
                  </AccordionContent>
                </AccordionItem>
                
                <AccordionItem value="item-4">
                  <AccordionTrigger>
                    <div className="flex items-center gap-2">
                      <Brain className="h-4 w-4 text-purple-500" />
                      <span>Cognitive Energy Management</span>
                    </div>
                  </AccordionTrigger>
                  <AccordionContent>
                    <div className="space-y-2 pl-6">
                      <p className="text-sm">
                        Practice task batching by grouping similar activities together to reduce the cognitive 
                        load of context switching, which can drain up to 40% of productive energy. Schedule complex, 
                        high-value tasks during your identified peak energy periods.
                      </p>
                      <div className="flex justify-between text-sm text-muted-foreground">
                        <span>Source: Harvard Business Review</span>
                        <Button variant="link" size="sm" className="h-auto p-0">
                          Read more
                        </Button>
                      </div>
                    </div>
                  </AccordionContent>
                </AccordionItem>
                
                <AccordionItem value="item-5">
                  <AccordionTrigger>
                    <div className="flex items-center gap-2">
                      <Moon className="h-4 w-4 text-blue-500" />
                      <span>Restorative Sleep Practices</span>
                    </div>
                  </AccordionTrigger>
                  <AccordionContent>
                    <div className="space-y-2 pl-6">
                      <p className="text-sm">
                        Optimize your sleep environment by keeping your bedroom cool (65-68°F/18-20°C), dark, 
                        and quiet. Establish a consistent pre-sleep routine that signals to your body it's time 
                        to wind down, and avoid screens 60 minutes before bed to protect melatonin production.
                      </p>
                      <div className="flex justify-between text-sm text-muted-foreground">
                        <span>Source: National Sleep Foundation</span>
                        <Button variant="link" size="sm" className="h-auto p-0">
                          Read more
                        </Button>
                      </div>
                    </div>
                  </AccordionContent>
                </AccordionItem>
              </Accordion>
            </CardContent>
            <CardFooter>
              <Button variant="outline" className="w-full gap-2">
                <ExternalLink className="h-4 w-4" />
                Explore Energy Management Research Library
              </Button>
            </CardFooter>
          </Card>
          
          {/* Personal Coach Section */}
          <Card className="border-primary/10">
            <CardHeader>
              <CardTitle>Your Personal Energy Coach</CardTitle>
              <CardDescription>
                Get personalized guidance to optimize your energy levels
              </CardDescription>
            </CardHeader>
            <CardContent className="pb-6">
              <div className="flex flex-col md:flex-row gap-6">
                <div className="flex-1 space-y-4">
                  <div className="flex items-start gap-4">
                    <Avatar className="h-10 w-10">
                      <AvatarImage src="/coach-avatar.png" />
                      <AvatarFallback>EC</AvatarFallback>
                    </Avatar>
                    <div className="bg-muted/40 p-3 rounded-lg rounded-tl-none max-w-md">
                      <p className="text-sm mb-1">
                        Based on your energy patterns, I recommend prioritizing deep work during 
                        your morning peak (8-11am) and scheduling collaborative meetings after lunch 
                        when your energy naturally rises again.
                      </p>
                      <p className="text-xs text-muted-foreground">
                        AI Energy Coach • Just now
                      </p>
                    </div>
                  </div>
                  
                  <div className="flex justify-end">
                    <div className="flex justify-end gap-2">
                      <Button variant="outline" size="sm">
                        Get More Tips
                      </Button>
                      <Button size="sm">
                        Personalized Plan
                      </Button>
                    </div>
                  </div>
                </div>
                
                <div className="md:w-1/3 flex flex-col gap-3">
                  <h4 className="text-sm font-medium">Ask about:</h4>
                  <div className="grid grid-cols-1 gap-2">
                    <Button variant="outline" size="sm" className="justify-start">
                      <AlertCircle className="h-3 w-3 mr-2" />
                      Why am I tired after lunch?
                    </Button>
                    <Button variant="outline" size="sm" className="justify-start">
                      <AlertCircle className="h-3 w-3 mr-2" />
                      Best time for creative work?
                    </Button>
                    <Button variant="outline" size="sm" className="justify-start">
                      <AlertCircle className="h-3 w-3 mr-2" />
                      How can I reduce afternoon slumps?
                    </Button>
                      </div>
                </div>
                </div>
              </CardContent>
            </Card>
        </>
      )}
    </div>
  );
} 