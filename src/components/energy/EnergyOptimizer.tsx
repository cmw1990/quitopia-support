import React, { useState, useEffect } from 'react';
import { Card, CardContent, CardDescription, CardFooter, CardHeader, CardTitle } from '../ui/card';
import { Button } from '../ui/button';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '../ui/tabs';
import { format } from 'date-fns';
import { Progress } from '../ui/progress';
import { Badge } from '../ui/badge';
import { PieChart, Pie, Cell, ResponsiveContainer, Legend, Tooltip } from 'recharts';
import { useToast } from '../../hooks/use-toast';
import { supabaseRequest } from '@/utils/supabaseRequest'; // Corrected import
import { useAuth } from '../AuthProvider';
import {
  BatteryCharging,
  Battery,
  Zap,
  Activity,
  Brain,
  Coffee,
  Utensils,
  Lightbulb,
  Sun,
  Moon,
  Download,
  BookOpen,
  Check,
  Clock,
  AlertTriangle,
} from 'lucide-react';
import { cn } from '@/lib/utils';

interface EnergyEntry {
  id: string;
  user_id: string;
  timestamp: string;
  energy_level: number;
  mood_level: number;
  activity_context?: string;
  notes?: string;
  factors?: string[];
}

interface OptimizationPlan {
  id: string;
  title: string;
  description: string;
  timeOfDay: string;
  energyLevel: number;
  actions: string[];
  benefits: string[];
  icon: React.ReactNode;
}

const COLORS = ['#0088FE', '#00C49F', '#FFBB28', '#FF8042', '#8884d8', '#82ca9d'];

// Specific plans based on energy levels and time of day
const OPTIMIZATION_PLANS: OptimizationPlan[] = [
  {
    id: 'morning-low',
    title: 'Morning Energy Boost',
    description: 'Optimize your start of day when energy is low',
    timeOfDay: 'morning',
    energyLevel: 3,
    actions: [
      'Start with 5 minutes of light stretching',
      'Have a protein-rich breakfast',
      'Step outside for natural sunlight exposure',
      'Delay coffee until 9:30 AM for optimal effect',
      'Begin with a single, small achievable task'
    ],
    benefits: [
      'Activates your metabolism',
      'Stabilizes blood sugar levels',
      'Resets your circadian rhythm',
      'Maximizes caffeine effectiveness',
      'Builds momentum for the day'
    ],
    icon: <Sun className="h-5 w-5" />
  },
  {
    id: 'morning-high',
    title: 'Morning Productivity Maximizer',
    description: 'Leverage your high morning energy',
    timeOfDay: 'morning',
    energyLevel: 8,
    actions: [
      'Tackle your most complex, high-value tasks first',
      'Schedule important meetings before noon',
      'Use the Pomodoro technique (25 min work, 5 min break)',
      'Stay hydrated with water (not just coffee)',
      'Capture ideas and insights while your mind is fresh'
    ],
    benefits: [
      'Uses your peak cognitive capacity',
      'Maximizes decision-making quality',
      'Maintains focus on priority work',
      'Sustains energy throughout the morning',
      'Capitalizes on creative thinking'
    ],
    icon: <Zap className="h-5 w-5" />
  },
  {
    id: 'afternoon-low',
    title: 'Afternoon Recovery Protocol',
    description: 'Counteract the post-lunch energy dip',
    timeOfDay: 'afternoon',
    energyLevel: 3,
    actions: [
      'Take a 10-minute walk outside',
      'Switch to a different type of task',
      'Have a small protein snack (nuts, yogurt)',
      'Do 2 minutes of deep breathing exercises',
      'Consider a short power nap (15 min max)'
    ],
    benefits: [
      'Increases blood circulation and oxygen',
      'Refreshes mental perspective',
      'Stabilizes blood sugar levels',
      'Activates parasympathetic nervous system',
      'Recharges cognitive function'
    ],
    icon: <Battery className="h-5 w-5" />
  },
  {
    id: 'afternoon-high',
    title: 'Afternoon Momentum Sustainer',
    description: 'Maintain your productive streak',
    timeOfDay: 'afternoon',
    energyLevel: 7,
    actions: [
      'Transition to collaborative or creative work',
      'Schedule brainstorming sessions',
      'Use active listening techniques in meetings',
      'Document progress and adjust daily plans',
      'Prepare task list for tomorrow'
    ],
    benefits: [
      'Leverages your social energy',
      'Capitalizes on divergent thinking',
      'Enhances team engagement',
      'Creates sense of accomplishment',
      'Reduces morning decision fatigue'
    ],
    icon: <Activity className="h-5 w-5" />
  },
  {
    id: 'evening-low',
    title: 'Evening Wind-Down System',
    description: 'Prepare for restorative rest',
    timeOfDay: 'evening',
    energyLevel: 2,
    actions: [
      'Reduce blue light exposure 2 hours before bed',
      'Engage in light reading or journaling',
      'Prepare for tomorrow (clothes, meals, etc.)',
      'Practice a 5-minute gratitude routine',
      'Use relaxation techniques (deep breathing, meditation)'
    ],
    benefits: [
      'Signals your brain to produce melatonin',
      'Creates mental closure for the day',
      'Reduces morning stress and decision-making',
      'Improves psychological wellbeing',
      'Enhances sleep quality'
    ],
    icon: <Moon className="h-5 w-5" />
  },
  {
    id: 'evening-high',
    title: 'Evening Energy Channeler',
    description: 'Use unexpected evening energy constructively',
    timeOfDay: 'evening',
    energyLevel: 7,
    actions: [
      'Focus on creative hobbies, not work',
      'Engage in light physical activity',
      'Learn something new (30 min max)',
      'Connect socially with friends/family',
      'Avoid starting new work projects'
    ],
    benefits: [
      'Supports work-life boundaries',
      'Releases physical tension without disrupting sleep',
      'Satisfies intellectual stimulation needs',
      'Fulfills social connection needs',
      'Prevents late-night productivity that disrupts sleep'
    ],
    icon: <Lightbulb className="h-5 w-5" />
  }
];

export function EnergyOptimizer() {
  const [energyEntries, setEnergyEntries] = useState<EnergyEntry[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [currentEnergy, setCurrentEnergy] = useState<number | null>(null);
  const [selectedPlan, setSelectedPlan] = useState<OptimizationPlan | null>(null);
  const { toast } = useToast();
  const { session } = useAuth();

  useEffect(() => {
    if (session?.user?.id) {
      loadEnergyData();
    }
  }, [session]);

  useEffect(() => {
    // Get current time of day
    const currentHour = new Date().getHours();
    let timeOfDay = 'afternoon'; // default
    
    if (currentHour < 12) {
      timeOfDay = 'morning';
    } else if (currentHour >= 17) {
      timeOfDay = 'evening';
    }
    
    // If we know the user's current energy level, recommend a plan
    if (currentEnergy !== null) {
      const isLowEnergy = currentEnergy <= 5;
      const planId = `${timeOfDay}-${isLowEnergy ? 'low' : 'high'}`;
      const plan = OPTIMIZATION_PLANS.find(p => p.id === planId) || null;
      setSelectedPlan(plan);
    }
  }, [currentEnergy]);

  const loadEnergyData = async () => {
    if (!session?.user?.id) return;
    
    setIsLoading(true);
    try {
      // Use supabaseRequest, handle response, remove session arg
      const { data, error: loadError } = await supabaseRequest<EnergyEntry[]>(
        `/rest/v1/energy_levels8?user_id=eq.${session.user.id}&order=timestamp.desc&limit=10`,
        { method: 'GET' }
        // Removed session argument
      );
      if (loadError) throw loadError; // Propagate error
      
      if (data && data.length > 0) {
        setEnergyEntries(data);
        
        // Set current energy level from most recent entry
        const now = new Date();
        const latestEntry = data[0];
        const entryTime = new Date(latestEntry.timestamp);
        
        // Only use latest entry if it's from the current day
        if (entryTime.toDateString() === now.toDateString()) {
          setCurrentEnergy(latestEntry.energy_level);
        }
      }
    } catch (error) {
      console.error('Error loading energy data:', error);
      toast({
        title: 'Failed to load energy data',
        description: 'Please try again later',
        variant: 'destructive',
      });
    } finally {
      setIsLoading(false);
    }
  };

  const getEnergyDistribution = () => {
    if (energyEntries.length === 0) return [];
    
    // Create distribution of energy levels
    const distribution: { name: string; value: number; color: string }[] = [];
    
    // Group by levels
    const energyGroups = {
      'Very Low (1-2)': 0,
      'Low (3-4)': 0,
      'Moderate (5-6)': 0,
      'Good (7-8)': 0,
      'Excellent (9-10)': 0
    };
    
    energyEntries.forEach(entry => {
      const level = entry.energy_level;
      
      if (level <= 2) energyGroups['Very Low (1-2)']++;
      else if (level <= 4) energyGroups['Low (3-4)']++;
      else if (level <= 6) energyGroups['Moderate (5-6)']++;
      else if (level <= 8) energyGroups['Good (7-8)']++;
      else energyGroups['Excellent (9-10)']++;
    });
    
    // Convert to chart data
    Object.entries(energyGroups).forEach(([name, value], index) => {
      if (value > 0) {
        distribution.push({
          name,
          value,
          color: COLORS[index % COLORS.length]
        });
      }
    });
    
    return distribution;
  };

  // Get analysis of energy patterns
  const getEnergyAnalysis = () => {
    if (energyEntries.length < 3) {
      return { message: "Insufficient data for analysis", emoji: "📊" };
    }
    
    // Calculate average energy
    const totalEnergy = energyEntries.reduce((sum, entry) => sum + entry.energy_level, 0);
    const averageEnergy = totalEnergy / energyEntries.length;
    
    // Get time-based patterns
    const morningEntries = energyEntries.filter(entry => {
      const hour = new Date(entry.timestamp).getHours();
      return hour >= 5 && hour < 12;
    });
    
    const afternoonEntries = energyEntries.filter(entry => {
      const hour = new Date(entry.timestamp).getHours();
      return hour >= 12 && hour < 17;
    });
    
    const eveningEntries = energyEntries.filter(entry => {
      const hour = new Date(entry.timestamp).getHours();
      return hour >= 17;
    });
    
    // Calculate averages for each time period
    const avgMorning = morningEntries.length > 0 
      ? morningEntries.reduce((sum, e) => sum + e.energy_level, 0) / morningEntries.length 
      : 0;
      
    const avgAfternoon = afternoonEntries.length > 0 
      ? afternoonEntries.reduce((sum, e) => sum + e.energy_level, 0) / afternoonEntries.length 
      : 0;
    
    const avgEvening = eveningEntries.length > 0 
      ? eveningEntries.reduce((sum, e) => sum + e.energy_level, 0) / eveningEntries.length 
      : 0;
    
    // Find peak energy time
    let peakTime = "unknown";
    let peakValue = 0;
    
    if (avgMorning > avgAfternoon && avgMorning > avgEvening && avgMorning > 0) {
      peakTime = "morning";
      peakValue = avgMorning;
    } else if (avgAfternoon > avgMorning && avgAfternoon > avgEvening && avgAfternoon > 0) {
      peakTime = "afternoon";
      peakValue = avgAfternoon;
    } else if (avgEvening > 0) {
      peakTime = "evening";
      peakValue = avgEvening;
    }
    
    // Check energy variability
    const energyValues = energyEntries.map(e => e.energy_level);
    const minEnergy = Math.min(...energyValues);
    const maxEnergy = Math.max(...energyValues);
    const energyRange = maxEnergy - minEnergy;
    
    // Create analysis message
    let message = `Your average energy level is ${averageEnergy.toFixed(1)}/10. `;
    let emoji = "";
    
    if (peakTime !== "unknown") {
      message += `Your peak energy time appears to be in the ${peakTime} (${peakValue.toFixed(1)}/10). `;
      
      if (peakTime === "morning") {
        emoji = "☀️";
        message += "Consider scheduling important tasks before noon. ";
      } else if (peakTime === "afternoon") {
        emoji = "⏱️";
        message += "You're a mid-day performer - plan your most critical work after lunch. ";
      } else {
        emoji = "🌙";
        message += "You seem to be a night owl - save creative work for evening hours. ";
      }
    }
    
    if (energyRange >= 5) {
      message += "Your energy levels fluctuate significantly throughout the day. Try more consistent meal timing and hydration. ";
      emoji = emoji || "📈";
    } else if (energyRange <= 2) {
      message += "Your energy remains fairly stable throughout the day. This consistency is beneficial for steady productivity. ";
      emoji = emoji || "📊";
    }
    
    return { message, emoji };
  };

  const getTimeOfDay = () => {
    const hour = new Date().getHours();
    if (hour < 12) return 'morning';
    if (hour < 17) return 'afternoon';
    return 'evening';
  };

  const getFactorStats = () => {
    // Analyze the impact of different factors on energy levels
    const factorImpacts: Record<string, { count: number; totalEnergy: number; avgEnergy: number }> = {};
    
    energyEntries.forEach(entry => {
      if (entry.factors && entry.factors.length > 0) {
        entry.factors.forEach(factor => {
          if (!factorImpacts[factor]) {
            factorImpacts[factor] = { count: 0, totalEnergy: 0, avgEnergy: 0 };
          }
          
          factorImpacts[factor].count += 1;
          factorImpacts[factor].totalEnergy += entry.energy_level;
        });
      }
    });
    
    // Calculate averages
    Object.keys(factorImpacts).forEach(factor => {
      const impact = factorImpacts[factor];
      impact.avgEnergy = impact.totalEnergy / impact.count;
    });
    
    // Sort factors by average energy
    return Object.entries(factorImpacts)
      .map(([name, stats]) => ({ name, ...stats }))
      .sort((a, b) => b.avgEnergy - a.avgEnergy);
  };

  return (
    <div className="space-y-6">
      <Card>
        <CardHeader>
          <CardTitle className="flex items-center text-xl">
            <BatteryCharging className="h-5 w-5 mr-2 text-primary" />
            Energy Optimization Center
          </CardTitle>
          <CardDescription>
            Personalized strategies to optimize your energy levels throughout the day
          </CardDescription>
        </CardHeader>
        <CardContent className="space-y-6">
          {isLoading ? (
            <div className="space-y-4">
              <div className="h-24 bg-muted/40 animate-pulse rounded-lg" />
              <div className="h-48 bg-muted/40 animate-pulse rounded-lg" />
            </div>
          ) : energyEntries.length > 0 ? (
            <>
              {/* Current Energy Status */}
              <Card className="border border-primary/20">
                <CardHeader className="pb-2">
                  <CardTitle className="text-base">Current Energy Status</CardTitle>
                </CardHeader>
                <CardContent>
                  <div className="flex flex-col sm:flex-row items-center gap-4">
                    <div className="relative">
                      <div className={`w-24 h-24 rounded-full flex items-center justify-center border-4 ${
                        currentEnergy && currentEnergy >= 7 ? 'border-success text-success' :
                        currentEnergy && currentEnergy >= 4 ? 'border-amber-500 text-amber-500' :
                        'border-destructive text-destructive'
                      }`}>
                        <span className="text-3xl font-bold">
                          {currentEnergy !== null ? currentEnergy : '?'}
                        </span>
                      </div>
                      {currentEnergy !== null && (
                        <div className={`absolute -top-2 -right-2 p-1 rounded-full ${
                          currentEnergy >= 7 ? 'bg-success' :
                          currentEnergy >= 4 ? 'bg-amber-500' :
                          'bg-destructive'
                        }`}>
                          {currentEnergy >= 7 ? (
                            <Zap className="h-5 w-5 text-white" />
                          ) : currentEnergy >= 4 ? (
                            <Battery className="h-5 w-5 text-white" />
                          ) : (
                            <AlertTriangle className="h-5 w-5 text-white" />
                          )}
                        </div>
                      )}
                    </div>
                    
                    <div className="flex-1 space-y-2">
                      <h3 className="font-medium">
                        {currentEnergy !== null ? (
                          <>
                            Your energy is {currentEnergy >= 7 ? 'High' : currentEnergy >= 4 ? 'Moderate' : 'Low'} right now
                          </>
                        ) : (
                          'No recent energy data'
                        )}
                      </h3>
                      <p className="text-sm text-muted-foreground">
                        {currentEnergy !== null ? (
                          <>
                            It's currently {getTimeOfDay()} and your energy level indicates {
                              currentEnergy >= 7 ? 'this is a great time for focused or creative work.' :
                              currentEnergy >= 4 ? 'you can handle moderate complexity tasks.' :
                              'you should consider lighter tasks or a recovery activity.'
                            }
                          </>
                        ) : (
                          'Log your current energy level to get personalized recommendations'
                        )}
                      </p>
                      
                      {currentEnergy === null && (
                        <Button variant="outline" size="sm" className="mt-2" asChild>
                          <a href="/energy">
                            Log Energy Level
                          </a>
                        </Button>
                      )}
                    </div>
                  </div>
                </CardContent>
              </Card>
              
              {/* Recommended Optimization Plan */}
              {selectedPlan && (
                <Card className="border border-secondary/20">
                  <CardHeader className="pb-2">
                    <div className="flex items-start justify-between">
                      <div>
                        <CardTitle className="text-base flex items-center">
                          {selectedPlan.icon}
                          <span className="ml-2">{selectedPlan.title}</span>
                        </CardTitle>
                        <CardDescription className="mt-1">
                          {selectedPlan.description}
                        </CardDescription>
                      </div>
                      <Badge variant="outline" className="bg-secondary/10">
                        Recommended Plan
                      </Badge>
                    </div>
                  </CardHeader>
                  <CardContent className="space-y-4">
                    <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                      <div className="space-y-2">
                        <h4 className="text-sm font-medium flex items-center">
                          <Check className="h-4 w-4 mr-1.5 text-success" />
                          Action Steps
                        </h4>
                        <ul className="space-y-2">
                          {selectedPlan.actions.map((action, index) => (
                            <li key={index} className="flex items-start text-sm">
                              <span className="mr-2 text-muted-foreground">{index + 1}.</span>
                              <span>{action}</span>
                            </li>
                          ))}
                        </ul>
                      </div>
                      <div className="space-y-2">
                        <h4 className="text-sm font-medium flex items-center">
                          <Zap className="h-4 w-4 mr-1.5 text-amber-500" />
                          Benefits
                        </h4>
                        <ul className="space-y-2">
                          {selectedPlan.benefits.map((benefit, index) => (
                            <li key={index} className="flex items-start text-sm">
                              <span className="mr-1.5">•</span>
                              <span>{benefit}</span>
                            </li>
                          ))}
                        </ul>
                      </div>
                    </div>
                    
                    <Button className="w-full" variant="outline" size="sm">
                      <Download className="h-4 w-4 mr-2" />
                      Save Plan to Calendar
                    </Button>
                  </CardContent>
                </Card>
              )}
              
              {/* Energy Insights */}
              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                <Card>
                  <CardHeader className="pb-2">
                    <CardTitle className="text-base flex items-center">
                      <Activity className="h-5 w-5 mr-2 text-primary" />
                      Energy Distribution
                    </CardTitle>
                  </CardHeader>
                  <CardContent>
                    {getEnergyDistribution().length > 0 ? (
                      <div className="h-64">
                        <ResponsiveContainer width="100%" height="100%">
                          <PieChart>
                            <Pie
                              data={getEnergyDistribution()}
                              cx="50%"
                              cy="50%"
                              labelLine={false}
                              outerRadius={80}
                              fill="#8884d8"
                              dataKey="value"
                              label={({ name, percent }) => `${name} ${(percent * 100).toFixed(0)}%`}
                            >
                              {getEnergyDistribution().map((entry, index) => (
                                <Cell key={`cell-${index}`} fill={entry.color} />
                              ))}
                            </Pie>
                            <Tooltip />
                            <Legend />
                          </PieChart>
                        </ResponsiveContainer>
                      </div>
                    ) : (
                      <div className="text-center py-8">
                        <BatteryCharging className="h-8 w-8 mx-auto text-muted-foreground mb-2" />
                        <p className="text-muted-foreground">Not enough data to show distribution</p>
                      </div>
                    )}
                  </CardContent>
                </Card>
                
                <Card>
                  <CardHeader className="pb-2">
                    <CardTitle className="text-base flex items-center">
                      <Brain className="h-5 w-5 mr-2 text-primary" />
                      Energy Pattern Analysis
                    </CardTitle>
                  </CardHeader>
                  <CardContent>
                    {energyEntries.length >= 3 ? (
                      <div className="space-y-4">
                        <div className="p-4 bg-muted/30 rounded-lg">
                          <div className="flex items-center mb-2">
                            <div className="text-2xl mr-2">{getEnergyAnalysis().emoji}</div>
                            <h3 className="font-medium">Your Energy Pattern</h3>
                          </div>
                          <p className="text-sm text-muted-foreground">
                            {getEnergyAnalysis().message}
                          </p>
                        </div>
                        
                        {getFactorStats().length > 0 && (
                          <div>
                            <h4 className="text-sm font-medium mb-2">Factor Impact on Energy</h4>
                            <div className="space-y-2 max-h-40 overflow-y-auto pr-2">
                              {getFactorStats().map(factor => (
                                <div key={factor.name} className="flex flex-col">
                                  <div className="flex justify-between items-center text-sm mb-1">
                                    <span>{factor.name} ({factor.count} entries)</span>
                                    <span className={`font-medium ${
                                      factor.avgEnergy >= 7 ? 'text-success' :
                                      factor.avgEnergy >= 4 ? 'text-amber-500' :
                                      'text-destructive'
                                    }`}>
                                      {factor.avgEnergy.toFixed(1)}/10
                                    </span>
                                  </div>
                                  <Progress value={factor.avgEnergy * 10} className="h-1.5" />
                                </div>
                              ))}
                            </div>
                          </div>
                        )}
                      </div>
                    ) : (
                      <div className="text-center py-8">
                        <Clock className="h-8 w-8 mx-auto text-muted-foreground mb-2" />
                        <h3 className="text-sm font-medium mb-1">Insufficient Data</h3>
                        <p className="text-xs text-muted-foreground mb-3">
                          Log at least 3 energy entries to see pattern analysis
                        </p>
                        <Button variant="outline" size="sm" asChild>
                          <a href="/energy">Track Energy</a>
                        </Button>
                      </div>
                    )}
                  </CardContent>
                </Card>
              </div>
              
              {/* Learn More */}
              <Card className="bg-primary/5">
                <CardHeader className="pb-2">
                  <CardTitle className="text-base flex items-center">
                    <BookOpen className="h-5 w-5 mr-2 text-primary" />
                    Energy Optimization Resources
                  </CardTitle>
                </CardHeader>
                <CardContent>
                  <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 gap-3">
                    {[
                      {
                        title: "Ultradian Rhythms & Energy",
                        desc: "How to work with your body's natural 90-minute cycles",
                        icon: <Clock className="h-4 w-4" />
                      },
                      {
                        title: "Nutrition for Sustained Energy",
                        desc: "Food combinations that prevent energy crashes",
                        icon: <Utensils className="h-4 w-4" />
                      },
                      {
                        title: "Strategic Exercise Timing",
                        desc: "When to work out for maximum energy benefits",
                        icon: <Activity className="h-4 w-4" />
                      }
                    ].map((resource, i) => (
                      <Card key={i} className="bg-background hover:bg-muted/50 transition-colors cursor-pointer">
                        <CardContent className="p-4">
                          <div className="flex items-center space-x-2 mb-1 text-primary">
                            {resource.icon}
                            <h3 className="font-medium text-sm">{resource.title}</h3>
                          </div>
                          <p className="text-xs text-muted-foreground">{resource.desc}</p>
                        </CardContent>
                      </Card>
                    ))}
                  </div>
                </CardContent>
              </Card>
            </>
          ) : (
            <div className="text-center py-12">
              <BatteryCharging className="h-12 w-12 mx-auto text-muted-foreground mb-4" />
              <h2 className="text-xl font-medium mb-2">No Energy Data Yet</h2>
              <p className="text-muted-foreground max-w-md mx-auto mb-6">
                Start tracking your energy levels to receive personalized optimization strategies and insights
              </p>
              <Button asChild>
                <a href="/energy">Track Your Energy Now</a>
              </Button>
            </div>
          )}
        </CardContent>
      </Card>
    </div>
  );
} 