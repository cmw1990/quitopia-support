import React, { useState, useEffect } from 'react';
import { Card, CardContent, CardHeader, CardTitle, CardDescription, CardFooter } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Progress } from "@/components/ui/progress";
import { Slider } from "@/components/ui/slider";
import { Label } from "@/components/ui/label";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { toast } from "sonner";
import { 
  Battery, 
  BatteryCharging, 
  BatteryLow, 
  BatteryMedium, 
  BatteryFull,
  Clock, 
  Coffee, 
  Sun, 
  Moon, 
  Activity, 
  Zap, 
  Heart, 
  Plus,
  Save,
  Sparkles,
  Brain,
  Leaf,
  Timer,
  Droplet,
  LucideIcon
} from "lucide-react";
import { useAuth } from "@/components/AuthProvider";

interface EnergyManagementProps {
  onEnergyLogUpdate?: (energyData: EnergyLog) => void;
  initialLogs?: EnergyLog[];
}

interface EnergyLog {
  id?: string;
  timestamp: Date;
  level: number;
  mood: 'terrible' | 'bad' | 'neutral' | 'good' | 'great';
  activities: string[];
  notes?: string;
}

interface ActivityType {
  id: string;
  name: string;
  icon: LucideIcon;
  energyImpact: number;
  description: string;
  duration: number;
}

export const EnergyManagement: React.FC<EnergyManagementProps> = ({
  onEnergyLogUpdate,
  initialLogs = []
}) => {
  const { } = useAuth();
  
  // State for energy tracking
  const [currentEnergy, setCurrentEnergy] = useState(7);
  const [currentMood, setCurrentMood] = useState<'terrible' | 'bad' | 'neutral' | 'good' | 'great'>('neutral');
  const [energyLogs, setEnergyLogs] = useState<EnergyLog[]>(initialLogs);
  const [activeTab, setActiveTab] = useState("tracker");
  
  // State for ultradian rhythm tracking
  const [peakTimes, setPeakTimes] = useState<string[]>([]);
  const [lowTimes, setLowTimes] = useState<string[]>([]);
  const [nextPeak, setNextPeak] = useState<string | null>(null);
  const [nextDip, setNextDip] = useState<string | null>(null);
  
  // State for recovery strategies
  const [selectedRecovery, setSelectedRecovery] = useState<string | null>(null);
  const [favoriteStrategies, setFavoriteStrategies] = useState<string[]>([
    'Short walk', 'Hydration', 'Deep breathing', 'Power nap'
  ]);
  
  // Recovery activities
  const recoveryActivities: ActivityType[] = [
    {
      id: 'walk',
      name: 'Short walk',
      icon: Activity,
      energyImpact: 3,
      description: 'A 5-minute walk to reset your mind and boost circulation',
      duration: 5
    },
    {
      id: 'hydration',
      name: 'Hydration',
      icon: Droplet,
      energyImpact: 2,
      description: 'Drink 8oz of water to combat fatigue and improve focus',
      duration: 2
    },
    {
      id: 'breathing',
      name: 'Deep breathing',
      icon: Leaf,
      energyImpact: 2,
      description: '4-7-8 breathing technique to restore balance and energy',
      duration: 3
    },
    {
      id: 'power-nap',
      name: 'Power nap',
      icon: Moon,
      energyImpact: 4,
      description: 'A 10-20 minute nap to restore alertness without grogginess',
      duration: 15
    },
    {
      id: 'meditation',
      name: 'Quick meditation',
      icon: Brain,
      energyImpact: 3,
      description: 'A 5-minute mindfulness practice to reset mental energy',
      duration: 5
    },
    {
      id: 'stretching',
      name: 'Desk stretching',
      icon: Heart,
      energyImpact: 2,
      description: 'Simple stretches to relieve tension and improve circulation',
      duration: 4
    },
    {
      id: 'coffee',
      name: 'Caffeine boost',
      icon: Coffee,
      energyImpact: 3,
      description: 'Strategic caffeine intake for temporary energy boost',
      duration: 1
    },
    {
      id: 'light-exposure',
      name: 'Bright light exposure',
      icon: Sun,
      energyImpact: 2,
      description: 'Get some natural light to reset your circadian rhythm',
      duration: 5
    }
  ];
  
  // Calculate ultradian rhythm patterns
  useEffect(() => {
    if (energyLogs.length > 7) {
      // Sort logs by timestamp
      const sortedLogs = [...energyLogs].sort((a, b) => 
        a.timestamp.getTime() - b.timestamp.getTime()
      );
      
      // Group by hour of day
      const hourlyAvg: {[hour: number]: number[]} = {};
      
      sortedLogs.forEach(log => {
        const hour = log.timestamp.getHours();
        if (!hourlyAvg[hour]) hourlyAvg[hour] = [];
        hourlyAvg[hour].push(log.level);
      });
      
      // Find peaks and dips
      const hourlyEnergyAvg: {[hour: number]: number} = {};
      Object.entries(hourlyAvg).forEach(([hour, levels]) => {
        const avg = levels.reduce((sum, val) => sum + val, 0) / levels.length;
        hourlyEnergyAvg[parseInt(hour)] = avg;
      });
      
      // Get peak hours (top 3)
      const sortedByEnergy = Object.entries(hourlyEnergyAvg)
        .sort(([, a], [, b]) => b - a);
      
      const peaks = sortedByEnergy.slice(0, 3).map(([hour]) => 
        `${hour.padStart(2, '0')}:00`
      );
      
      // Get low hours (bottom 3)
      const lows = sortedByEnergy.slice(-3).map(([hour]) => 
        `${hour.padStart(2, '0')}:00`
      );
      
      setPeakTimes(peaks);
      setLowTimes(lows);
      
      // Calculate next peak/dip times
      calculateNextPeakAndDip(peaks, lows);
    }
  }, [energyLogs]);
  
  // Calculate the next peak and dip based on current time
  const calculateNextPeakAndDip = (peaks: string[], dips: string[]) => {
    const now = new Date();
    const currentHour = now.getHours();
    const currentMinutes = now.getMinutes();
    
    // Convert peak/dip times to minutes since midnight
    const currentTimeInMinutes = currentHour * 60 + currentMinutes;
    
    const peakTimesInMinutes = peaks.map(time => {
      const [hours, minutes] = time.split(':').map(Number);
      return hours * 60 + minutes;
    });
    
    const dipTimesInMinutes = dips.map(time => {
      const [hours, minutes] = time.split(':').map(Number);
      return hours * 60 + minutes;
    });
    
    // Find next peak
    let nextPeakTime = peakTimesInMinutes.find(time => time > currentTimeInMinutes);
    if (!nextPeakTime && peakTimesInMinutes.length > 0) {
      // If no peak later today, use the first peak tomorrow
      nextPeakTime = peakTimesInMinutes[0] + 24 * 60;
    }
    
    // Find next dip
    let nextDipTime = dipTimesInMinutes.find(time => time > currentTimeInMinutes);
    if (!nextDipTime && dipTimesInMinutes.length > 0) {
      // If no dip later today, use the first dip tomorrow
      nextDipTime = dipTimesInMinutes[0] + 24 * 60;
    }
    
    // Convert back to formatted times
    if (nextPeakTime) {
      const peakHours = Math.floor(nextPeakTime / 60) % 24;
      const peakMinutes = nextPeakTime % 60;
      setNextPeak(`${peakHours.toString().padStart(2, '0')}:${peakMinutes.toString().padStart(2, '0')}`);
    }
    
    if (nextDipTime) {
      const dipHours = Math.floor(nextDipTime / 60) % 24;
      const dipMinutes = nextDipTime % 60;
      setNextDip(`${dipHours.toString().padStart(2, '0')}:${dipMinutes.toString().padStart(2, '0')}`);
    }
  };
  
  // Log current energy level
  const logEnergyLevel = () => {
    const newLog: EnergyLog = {
      timestamp: new Date(),
      level: currentEnergy,
      mood: currentMood,
      activities: [],
      notes: ''
    };
    
    setEnergyLogs(prev => [...prev, newLog]);
    
    if (onEnergyLogUpdate) {
      onEnergyLogUpdate(newLog);
    }
    
    toast.success('Energy level logged successfully');
  };
  
  // Calculate energy stats
  const getEnergyStats = () => {
    if (energyLogs.length === 0) {
      return { average: 5, trend: 0 };
    }
    
    // Calculate average
    const sum = energyLogs.reduce((total, log) => total + log.level, 0);
    const average = sum / energyLogs.length;
    
    // Calculate trend (comparing last 3 days to previous 3 days)
    if (energyLogs.length >= 6) {
      const sortedLogs = [...energyLogs].sort((a, b) => 
        b.timestamp.getTime() - a.timestamp.getTime()
      );
      
      const recent = sortedLogs.slice(0, 3);
      const previous = sortedLogs.slice(3, 6);
      
      const recentAvg = recent.reduce((total, log) => total + log.level, 0) / 3;
      const previousAvg = previous.reduce((total, log) => total + log.level, 0) / 3;
      
      return { average, trend: recentAvg - previousAvg };
    }
    
    return { average, trend: 0 };
  };
  
  // Energy level descriptor
  const getEnergyDescription = (level: number): string => {
    if (level <= 2) return 'Very Low';
    if (level <= 4) return 'Low';
    if (level <= 6) return 'Moderate';
    if (level <= 8) return 'High';
    return 'Very High';
  };
  
  // Get battery icon based on energy level
  const getBatteryIcon = (level: number) => {
    if (level <= 2) return <BatteryLow className="h-5 w-5 text-red-500" />;
    if (level <= 4) return <BatteryLow className="h-5 w-5 text-amber-500" />;
    if (level <= 6) return <BatteryMedium className="h-5 w-5 text-yellow-500" />;
    if (level <= 8) return <BatteryMedium className="h-5 w-5 text-green-500" />;
    return <BatteryFull className="h-5 w-5 text-emerald-500" />;
  };
  
  // Start a recovery activity
  const startRecovery = (activityId: string) => {
    const activity = recoveryActivities.find(a => a.id === activityId);
    if (!activity) return;
    
    setSelectedRecovery(activityId);
    
    toast.success(`Started ${activity.name} recovery activity`);
    
    // Simulate activity completion after the duration
    setTimeout(() => {
      setSelectedRecovery(null);
      
      // Update energy level based on activity impact
      setCurrentEnergy(prev => Math.min(10, prev + activity.energyImpact));
      
      toast.success(`${activity.name} completed! Energy boosted by ${activity.energyImpact} points.`, {
        icon: <Sparkles className="h-5 w-5 text-yellow-500" />
      });
      
      // Log the energy level after recovery
      const newLog: EnergyLog = {
        timestamp: new Date(),
        level: Math.min(10, currentEnergy + activity.energyImpact),
        mood: currentMood,
        activities: [activity.name],
        notes: `Completed ${activity.name} recovery activity`
      };
      
      setEnergyLogs(prev => [...prev, newLog]);
      
      if (onEnergyLogUpdate) {
        onEnergyLogUpdate(newLog);
      }
    }, activity.duration * 1000); // Simulate real duration
  };
  
  // Add to favorites
  const addToFavorites = (activityName: string) => {
    if (!favoriteStrategies.includes(activityName)) {
      setFavoriteStrategies(prev => [...prev, activityName]);
      toast.success(`Added ${activityName} to favorites`);
    }
  };
  
  // Remove from favorites
  const removeFromFavorites = (activityName: string) => {
    setFavoriteStrategies(prev => prev.filter(name => name !== activityName));
    toast.success(`Removed ${activityName} from favorites`);
  };
  
  // Get recommended activities based on current energy level
  const getRecommendedActivities = () => {
    if (currentEnergy <= 3) {
      // Low energy recommendations
      return recoveryActivities.filter(a => 
        ['power-nap', 'hydration', 'breathing', 'light-exposure'].includes(a.id)
      );
    } else if (currentEnergy <= 6) {
      // Medium energy recommendations
      return recoveryActivities.filter(a => 
        ['walk', 'stretching', 'meditation', 'coffee'].includes(a.id)
      );
    } else {
      // High energy - maintain it
      return recoveryActivities.filter(a => 
        ['walk', 'meditation', 'breathing'].includes(a.id)
      );
    }
  };
  
  const { average, trend } = getEnergyStats();
  const recommendedActivities = getRecommendedActivities();
  
  return (
    <div className="w-full max-w-3xl mx-auto">
      <Tabs defaultValue={activeTab} onValueChange={setActiveTab}>
        <TabsList className="grid grid-cols-3 mb-6">
          <TabsTrigger value="tracker">Energy Tracker</TabsTrigger>
          <TabsTrigger value="rhythm">Ultradian Rhythm</TabsTrigger>
          <TabsTrigger value="recovery">Recovery</TabsTrigger>
        </TabsList>
        
        {/* Energy Tracker Tab */}
        <TabsContent value="tracker">
          <div className="grid gap-6 md:grid-cols-2">
            <Card>
              <CardHeader>
                <CardTitle>Current Energy Level</CardTitle>
                <CardDescription>
                  Track your energy throughout the day
                </CardDescription>
              </CardHeader>
              <CardContent>
                <div className="flex justify-between items-center mb-2">
                  <span className="text-sm font-medium">Low Energy</span>
                  <span className="text-sm font-medium">High Energy</span>
                </div>
                <Slider
                  value={[currentEnergy]}
                  min={1}
                  max={10}
                  step={1}
                  onValueChange={([value]) => setCurrentEnergy(value)}
                  className="mb-6"
                />
                
                <div className="flex justify-between items-center mb-6">
                  <div className="flex items-center gap-2">
                    {getBatteryIcon(currentEnergy)}
                    <div>
                      <div className="text-2xl font-bold">{currentEnergy}/10</div>
                      <div className="text-sm text-muted-foreground">
                        {getEnergyDescription(currentEnergy)}
                      </div>
                    </div>
                  </div>
                  
                  <Select 
                    value={currentMood} 
                    onValueChange={(value: 'terrible' | 'bad' | 'neutral' | 'good' | 'great') => setCurrentMood(value)}
                  >
                    <SelectTrigger className="w-[150px]">
                      <SelectValue placeholder="Select mood" />
                    </SelectTrigger>
                    <SelectContent>
                      <SelectItem value="terrible">Terrible</SelectItem>
                      <SelectItem value="bad">Bad</SelectItem>
                      <SelectItem value="neutral">Neutral</SelectItem>
                      <SelectItem value="good">Good</SelectItem>
                      <SelectItem value="great">Great</SelectItem>
                    </SelectContent>
                  </Select>
                </div>
                
                <Button onClick={logEnergyLevel} className="w-full">
                  <Save className="mr-2 h-4 w-4" />
                  Log Current Energy
                </Button>
              </CardContent>
            </Card>
            
            <Card>
              <CardHeader>
                <CardTitle>Energy Insights</CardTitle>
                <CardDescription>
                  Analytics based on your energy patterns
                </CardDescription>
              </CardHeader>
              <CardContent>
                <div className="space-y-6">
                  <div>
                    <div className="flex justify-between items-center mb-2">
                      <Label>Average Energy Level</Label>
                      <span className="font-medium">{average.toFixed(1)}/10</span>
                    </div>
                    <Progress value={average * 10} className="h-2" />
                  </div>
                  
                  <div className="flex justify-between items-center">
                    <Label>Energy Trend</Label>
                    <div className="flex items-center gap-1">
                      {trend > 0 ? (
                        <span className="text-green-500">+{trend.toFixed(1)}</span>
                      ) : trend < 0 ? (
                        <span className="text-red-500">{trend.toFixed(1)}</span>
                      ) : (
                        <span className="text-muted-foreground">0</span>
                      )}
                    </div>
                  </div>
                  
                  <div className="pt-4 border-t">
                    <h4 className="font-medium mb-3">Energy Patterns</h4>
                    <div className="space-y-2 text-sm">
                      <div className="flex items-start gap-2">
                        <Sun className="h-4 w-4 text-amber-500 mt-0.5" />
                        <div>
                          <span className="font-medium">Peak Energy Times:</span>
                          <div className="text-muted-foreground">
                            {peakTimes.length > 0 ? peakTimes.join(', ') : 'Not enough data'}
                          </div>
                        </div>
                      </div>
                      
                      <div className="flex items-start gap-2">
                        <Moon className="h-4 w-4 text-blue-500 mt-0.5" />
                        <div>
                          <span className="font-medium">Low Energy Times:</span>
                          <div className="text-muted-foreground">
                            {lowTimes.length > 0 ? lowTimes.join(', ') : 'Not enough data'}
                          </div>
                        </div>
                      </div>
                      
                      {nextPeak && (
                        <div className="flex items-start gap-2">
                          <Clock className="h-4 w-4 text-purple-500 mt-0.5" />
                          <div>
                            <span className="font-medium">Next Energy Peak:</span>
                            <div className="text-muted-foreground">{nextPeak}</div>
                          </div>
                        </div>
                      )}
                    </div>
                  </div>
                </div>
              </CardContent>
            </Card>
          </div>
        </TabsContent>
        
        {/* Ultradian Rhythm Tab */}
        <TabsContent value="rhythm">
          <Card>
            <CardHeader>
              <CardTitle>Ultradian Rhythm Tracker</CardTitle>
              <CardDescription>
                Monitor your natural energy cycles throughout the day
              </CardDescription>
            </CardHeader>
            <CardContent>
              <div className="space-y-6">
                <div className="rounded-lg border p-4 bg-muted/30">
                  <h3 className="font-medium mb-2">What is an Ultradian Rhythm?</h3>
                  <p className="text-sm text-muted-foreground">
                    Your body naturally cycles through periods of high and low energy approximately every 90-120 minutes. 
                    By tracking these cycles, you can plan your work and breaks for optimal productivity and well-being.
                  </p>
                </div>
                
                <div className="grid gap-4 sm:grid-cols-2">
                  <div className="rounded-lg border p-4">
                    <div className="flex items-center gap-2 mb-3">
                      <Zap className="h-5 w-5 text-amber-500" />
                      <h3 className="font-medium">Current Peak Times</h3>
                    </div>
                    {peakTimes.length > 0 ? (
                      <ul className="space-y-2">
                        {peakTimes.map((time, i) => (
                          <li key={i} className="flex items-center gap-2">
                            <Sun className="h-4 w-4 text-amber-500" />
                            <span>{time}</span>
                          </li>
                        ))}
                      </ul>
                    ) : (
                      <p className="text-sm text-muted-foreground">
                        Log your energy levels for at least a week to see your patterns
                      </p>
                    )}
                  </div>
                  
                  <div className="rounded-lg border p-4">
                    <div className="flex items-center gap-2 mb-3">
                      <BatteryLow className="h-5 w-5 text-blue-500" />
                      <h3 className="font-medium">Current Dip Times</h3>
                    </div>
                    {lowTimes.length > 0 ? (
                      <ul className="space-y-2">
                        {lowTimes.map((time, i) => (
                          <li key={i} className="flex items-center gap-2">
                            <Moon className="h-4 w-4 text-blue-500" />
                            <span>{time}</span>
                          </li>
                        ))}
                      </ul>
                    ) : (
                      <p className="text-sm text-muted-foreground">
                        Log your energy levels for at least a week to see your patterns
                      </p>
                    )}
                  </div>
                </div>
                
                <div className="pt-4 border-t">
                  <h4 className="font-medium mb-3">Recommendations</h4>
                  <ul className="space-y-3">
                    <li className="flex items-start gap-2">
                      <Zap className="h-4 w-4 text-amber-500 mt-0.5" />
                      <div>
                        <span className="font-medium">During peak energy times:</span>
                        <p className="text-sm text-muted-foreground">
                          Schedule your most demanding cognitive work, important decisions, and creative tasks.
                        </p>
                      </div>
                    </li>
                    
                    <li className="flex items-start gap-2">
                      <Moon className="h-4 w-4 text-blue-500 mt-0.5" />
                      <div>
                        <span className="font-medium">During energy dips:</span>
                        <p className="text-sm text-muted-foreground">
                          Take short breaks, do administrative tasks, or engage in light physical activity.
                        </p>
                      </div>
                    </li>
                    
                    <li className="flex items-start gap-2">
                      <Clock className="h-4 w-4 text-purple-500 mt-0.5" />
                      <div>
                        <span className="font-medium">Work in 90-minute blocks:</span>
                        <p className="text-sm text-muted-foreground">
                          Align your work sessions with your natural ultradian cycle for optimal focus and productivity.
                        </p>
                      </div>
                    </li>
                  </ul>
                </div>
              </div>
            </CardContent>
            <CardFooter>
              <Button variant="outline" className="w-full" onClick={logEnergyLevel}>
                Log Current Energy Level
              </Button>
            </CardFooter>
          </Card>
        </TabsContent>
        
        {/* Recovery Tab */}
        <TabsContent value="recovery">
          <div className="grid gap-6 md:grid-cols-2">
            <Card>
              <CardHeader>
                <CardTitle>Recommended Recovery Activities</CardTitle>
                <CardDescription>
                  Based on your current energy level ({currentEnergy}/10)
                </CardDescription>
              </CardHeader>
              <CardContent>
                <div className="space-y-4">
                  {recommendedActivities.map((activity) => (
                    <div 
                      key={activity.id} 
                      className="flex items-center justify-between p-3 rounded-lg border"
                    >
                      <div className="flex items-center gap-3">
                        <div className="p-2 rounded-full bg-primary/10">
                          <activity.icon className="h-5 w-5 text-primary" />
                        </div>
                        <div>
                          <div className="font-medium">{activity.name}</div>
                          <div className="text-xs text-muted-foreground">
                            {activity.duration} min • +{activity.energyImpact} energy
                          </div>
                        </div>
                      </div>
                      <div className="flex gap-2">
                        <Button 
                          size="sm" 
                          onClick={() => startRecovery(activity.id)}
                          disabled={selectedRecovery !== null}
                        >
                          {selectedRecovery === activity.id ? (
                            <Timer className="h-4 w-4 animate-pulse" />
                          ) : (
                            <Zap className="h-4 w-4" />
                          )}
                        </Button>
                        <Button 
                          size="sm" 
                          variant="ghost"
                          onClick={() => 
                            favoriteStrategies.includes(activity.name) 
                              ? removeFromFavorites(activity.name) 
                              : addToFavorites(activity.name)
                          }
                        >
                          {favoriteStrategies.includes(activity.name) ? (
                            <Sparkles className="h-4 w-4 text-amber-500" />
                          ) : (
                            <Plus className="h-4 w-4" />
                          )}
                        </Button>
                      </div>
                    </div>
                  ))}
                </div>
              </CardContent>
            </Card>
            
            <Card>
              <CardHeader>
                <CardTitle>Your Favorite Strategies</CardTitle>
                <CardDescription>
                  Quick access to your most effective energy boosters
                </CardDescription>
              </CardHeader>
              <CardContent>
                {favoriteStrategies.length > 0 ? (
                  <div className="space-y-4">
                    {favoriteStrategies.map((name) => {
                      const activity = recoveryActivities.find(a => a.name === name);
                      if (!activity) return null;
                      
                      return (
                        <div 
                          key={activity.id} 
                          className="flex items-center justify-between p-3 rounded-lg border"
                        >
                          <div className="flex items-center gap-3">
                            <div className="p-2 rounded-full bg-primary/10">
                              <activity.icon className="h-5 w-5 text-primary" />
                            </div>
                            <div>
                              <div className="font-medium">{activity.name}</div>
                              <div className="text-xs text-muted-foreground">
                                {activity.description}
                              </div>
                            </div>
                          </div>
                          <Button 
                            size="sm" 
                            onClick={() => startRecovery(activity.id)}
                            disabled={selectedRecovery !== null}
                          >
                            {selectedRecovery === activity.id ? (
                              <Timer className="h-4 w-4 animate-pulse" />
                            ) : (
                              <Zap className="h-4 w-4" />
                            )}
                          </Button>
                        </div>
                      );
                    })}
                  </div>
                ) : (
                  <div className="flex flex-col items-center justify-center h-40 text-center">
                    <Sparkles className="h-8 w-8 text-muted-foreground mb-2" />
                    <p className="text-muted-foreground">
                      Add your favorite recovery strategies by clicking the + icon
                    </p>
                  </div>
                )}
              </CardContent>
              <CardFooter>
                <Button variant="outline" className="w-full" onClick={() => setActiveTab("tracker")}>
                  Update Your Energy Level
                </Button>
              </CardFooter>
            </Card>
          </div>
        </TabsContent>
      </Tabs>
    </div>
  );
};

export default EnergyManagement; 