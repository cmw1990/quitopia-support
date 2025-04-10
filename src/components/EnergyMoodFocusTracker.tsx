import { useState, useEffect } from "react";
import { useQuery } from "@tanstack/react-query";
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from "./ui/card";
import { Button } from "./ui/button";
import { Slider } from "./ui/slider"; 
import { useToast } from "./ui/use-toast";
import { supabaseRestCall } from "../api/missionFreshApiClient";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "./ui/tabs";
import { LineChart, Line, XAxis, YAxis, CartesianGrid, Tooltip, ResponsiveContainer, Legend, BarChart, Bar } from 'recharts';
import { PlusCircle, AlertCircle, Info, LifeBuoy, CheckCircle } from "lucide-react";
import { useAuth } from "../contexts/auth";
import { useModal } from "../hooks/useModal";
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogFooter } from "./ui/dialog";
import { Label } from "./ui/label";
import { Input } from "./ui/input";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "./ui/select";
import { format, subDays, differenceInDays, parseISO } from "date-fns";

// Predefined mood and energy factors
const MOOD_FACTORS = [
  'Physical Activity',
  'Healthy Diet',
  'Good Sleep',
  'Social Connection',
  'Meditation/Mindfulness',
  'Hobby Time',
  'Time Outdoors',
  'Helping Others',
  'Learning New Skills',
  'Expressing Gratitude',
  'Smoking Cessation Progress',
  'Managing Cravings Successfully'
];

const ENERGY_DRAINS = [
  'Poor Sleep',
  'Stress',
  'Unhealthy Food',
  'Dehydration',
  'Smoking/Nicotine Withdrawal',
  'Alcohol Consumption',
  'Physical Inactivity',
  'Excessive Screen Time',
  'Social Conflict',
  'Overworking',
  'Negative Thinking',
  'Weather Changes'
];

const FOCUS_ENHANCERS = [
  'Adequate Sleep',
  'Physical Exercise',
  'Healthy Meal',
  'Hydration',
  'Meditation',
  'Break Time',
  'Clear Goals',
  'Distraction Management',
  'Environment Optimization',
  'Pomodoro Technique',
  'Reducing Smoking/Nicotine',
  'Stress Management'
];

// Types
interface MoodEntry {
  id: string;
  user_id: string;
  timestamp: string;
  mood_score: number;
  energy_level: number;
  focus_level: number;
  contributing_factors: string[];
  energy_drains: string[];
  focus_enhancers: string[];
  notes: string;
  is_quit_day_related: boolean;
  quit_day_correlation: number | null;
}

interface MoodAnalytics {
  date: string;
  avgMood: number;
  avgEnergy: number;
  avgFocus: number;
  factorFrequency: Record<string, number>;
  drainFrequency: Record<string, number>;
  enhancerFrequency: Record<string, number>;
}

interface Recommendation {
  type: 'mood' | 'energy' | 'focus';
  message: string;
  priority: 'high' | 'medium' | 'low';
  action: string;
}

interface UserQuitData {
  quit_date: string | null;
  quit_method: string | null;
  days_since_quit: number | null;
}

export function EnergyMoodFocusTracker() {
  const { session } = useAuth();
  const { toast } = useToast();
  const { openModal, closeModal } = useModal();
  
  // State for entry form
  const [moodScore, setMoodScore] = useState(5);
  const [energyLevel, setEnergyLevel] = useState(5);
  const [focusLevel, setFocusLevel] = useState(5);
  const [selectedFactors, setSelectedFactors] = useState<string[]>([]);
  const [selectedDrains, setSelectedDrains] = useState<string[]>([]);
  const [selectedEnhancers, setSelectedEnhancers] = useState<string[]>([]);
  const [notes, setNotes] = useState('');
  const [isQuitDayRelated, setIsQuitDayRelated] = useState(false);
  const [quitDayCorrelation, setQuitDayCorrelation] = useState<number | null>(null);
  
  // State for user quit information
  const [quitData, setQuitData] = useState<UserQuitData>({
    quit_date: null,
    quit_method: null,
    days_since_quit: null
  });

  // State for recommendations
  const [recommendations, setRecommendations] = useState<Recommendation[]>([]);
  
  // State for custom factor modal
  const [customFactorType, setCustomFactorType] = useState<'mood' | 'energy' | 'focus'>('mood');
  const [customFactorName, setCustomFactorName] = useState('');

  // Fetch user's quit data
  const { data: userQuitData } = useQuery({
    queryKey: ['user-quit-data'],
    queryFn: async () => {
      if (!session?.user?.id) return null;
      
      const { data, error } = await supabaseRestCall({
        endpoint: `/rest/v1/quit_plans?user_id=eq.${session.user.id}&select=*`,
        method: "GET"
      });
      
      if (error) throw error;
      if (!data || data.length === 0) return null;
      
      const quitPlan = data[0];
      let daysSinceQuit = null;
      
      if (quitPlan.quit_date) {
        const quitDate = parseISO(quitPlan.quit_date);
        daysSinceQuit = differenceInDays(new Date(), quitDate);
      }
      
      return {
        quit_date: quitPlan.quit_date,
        quit_method: quitPlan.method,
        days_since_quit: daysSinceQuit
      };
    },
    enabled: !!session?.user?.id
  });

  // Update quit data when userQuitData changes
  useEffect(() => {
    if (userQuitData) {
      setQuitData(userQuitData);
      
      // If user has a quit date, enable the quit day correlation question
      if (userQuitData.quit_date) {
        setIsQuitDayRelated(true);
        setQuitDayCorrelation(0); // Default neutral correlation
      }
    }
  }, [userQuitData]);

  // Get last 7 days of mood entries
  const { data: moodHistory, refetch } = useQuery({
    queryKey: ['mood-energy-focus-history'],
    queryFn: async () => {
      if (!session?.user?.id) return [];
      
      const startDate = format(subDays(new Date(), 7), 'yyyy-MM-dd');
      const { data, error } = await supabaseRestCall({
        endpoint: `/rest/v1/mood_energy_entries?user_id=eq.${session.user.id}&timestamp=gte.${startDate}&order=timestamp.desc`,
        method: "GET"
      });
      
      if (error) throw error;
      return data || [];
    },
    enabled: !!session?.user?.id
  });

  // Get mood analytics for visualization (30 days)
  const { data: moodAnalytics } = useQuery({
    queryKey: ['mood-energy-focus-analytics'],
    queryFn: async () => {
      if (!session?.user?.id) return [];
      
      const startDate = format(subDays(new Date(), 30), 'yyyy-MM-dd');
      const { data, error } = await supabaseRestCall({
        endpoint: `/rest/v1/mood_energy_analytics?user_id=eq.${session.user.id}&start_date=${startDate}&end_date=${format(new Date(), 'yyyy-MM-dd')}`,
        method: "GET"
      });
      
      if (error) {
        // If RPC function doesn't exist yet, calculate analytics client-side
        const { data: entriesData } = await supabaseRestCall({
          endpoint: `/rest/v1/mood_energy_entries?user_id=eq.${session.user.id}&timestamp=gte.${startDate}&order=timestamp.asc`,
          method: "GET"
        });
        
        if (entriesData) {
          return processAnalyticsData(entriesData);
        }
        
        throw error;
      }
      
      return data || [];
    },
    enabled: !!session?.user?.id
  });

  // Process raw entries into analytics format for visualization
  function processAnalyticsData(entries: MoodEntry[]): MoodAnalytics[] {
    // Group entries by date
    const entriesByDate = entries.reduce((acc: Record<string, MoodEntry[]>, entry) => {
      const date = entry.timestamp.split('T')[0];
      if (!acc[date]) acc[date] = [];
      acc[date].push(entry);
      return acc;
    }, {});
    
    // Calculate averages and frequencies for each date
    return Object.entries(entriesByDate).map(([date, dateEntries]) => {
      // Calculate average scores
      const avgMood = dateEntries.reduce((sum, e) => sum + e.mood_score, 0) / dateEntries.length;
      const avgEnergy = dateEntries.reduce((sum, e) => sum + e.energy_level, 0) / dateEntries.length;
      const avgFocus = dateEntries.reduce((sum, e) => sum + e.focus_level, 0) / dateEntries.length;
      
      // Count factor frequencies
      const factorFrequency: Record<string, number> = {};
      const drainFrequency: Record<string, number> = {};
      const enhancerFrequency: Record<string, number> = {};
      
      dateEntries.forEach(entry => {
        (entry.contributing_factors || []).forEach(factor => {
          factorFrequency[factor] = (factorFrequency[factor] || 0) + 1;
        });
        
        (entry.energy_drains || []).forEach(drain => {
          drainFrequency[drain] = (drainFrequency[drain] || 0) + 1;
        });
        
        (entry.focus_enhancers || []).forEach(enhancer => {
          enhancerFrequency[enhancer] = (enhancerFrequency[enhancer] || 0) + 1;
        });
      });
      
      return {
        date,
        avgMood,
        avgEnergy,
        avgFocus,
        factorFrequency,
        drainFrequency,
        enhancerFrequency
      };
    });
  }

  // Generate personalized recommendations based on user data
  useEffect(() => {
    if (!moodHistory || moodHistory.length === 0) return;
    
    const newRecommendations: Recommendation[] = [];
    
    // Get the most recent entries (last 3)
    const recentEntries = moodHistory.slice(0, Math.min(3, moodHistory.length));
    
    // Check mood levels
    const avgMood = recentEntries.reduce((sum, e) => sum + e.mood_score, 0) / recentEntries.length;
    if (avgMood < 4) {
      newRecommendations.push({
        type: 'mood',
        message: 'Your mood has been lower than usual recently.',
        priority: 'high',
        action: 'Try incorporating one of your positive mood factors today.'
      });
    }
    
    // Check energy levels
    const avgEnergy = recentEntries.reduce((sum, e) => sum + e.energy_level, 0) / recentEntries.length;
    if (avgEnergy < 4) {
      newRecommendations.push({
        type: 'energy',
        message: 'Your energy levels have been low recently.',
        priority: 'high',
        action: 'Consider addressing the energy drains you\'ve identified.'
      });
    }
    
    // Check focus levels
    const avgFocus = recentEntries.reduce((sum, e) => sum + e.focus_level, 0) / recentEntries.length;
    if (avgFocus < 4) {
      newRecommendations.push({
        type: 'focus',
        message: 'Your ability to focus has been below your baseline.',
        priority: 'medium',
        action: 'Try implementing one of your successful focus enhancers.'
      });
    }
    
    // Check if user has quit smoking
    if (quitData.days_since_quit !== null && quitData.days_since_quit >= 0) {
      // Look at mood/energy/focus correlation with quit day
      const quitDayRelatedEntries = recentEntries.filter(e => e.is_quit_day_related);
      
      if (quitDayRelatedEntries.length > 0) {
        const avgQuitCorrelation = quitDayRelatedEntries.reduce((sum, e) => 
          sum + (e.quit_day_correlation || 0), 0) / quitDayRelatedEntries.length;
          
        if (avgQuitCorrelation < -0.5) {
          newRecommendations.push({
            type: 'mood',
            message: 'You\'ve noticed your quit journey affecting your mood/energy.',
            priority: 'high',
            action: 'Use the Craving Management tools when you feel your mood dropping.'
          });
        } else if (avgQuitCorrelation > 0.5) {
          newRecommendations.push({
            type: 'mood',
            message: 'Great job! Your quit journey is positively affecting your wellbeing.',
            priority: 'low',
            action: 'Keep using what\'s working well for you.'
          });
        }
      }
    }
    
    setRecommendations(newRecommendations);
  }, [moodHistory, quitData]);

  // Save a new mood/energy/focus entry
  const saveMoodEnergyEntry = async () => {
    if (!session?.user?.id) {
      toast({
        title: "Error",
        description: "You must be logged in to save entries",
        variant: "destructive"
      });
      return;
    }

    try {
      // Prepare the entry data
      const entryData = {
        user_id: session.user.id,
        timestamp: new Date().toISOString(),
        mood_score: moodScore,
        energy_level: energyLevel,
        focus_level: focusLevel,
        contributing_factors: selectedFactors,
        energy_drains: selectedDrains,
        focus_enhancers: selectedEnhancers,
        notes: notes || null,
        is_quit_day_related: isQuitDayRelated,
        quit_day_correlation: isQuitDayRelated ? quitDayCorrelation : null
      };

      // Save to database
      const { data, error } = await supabaseRestCall({
        endpoint: `/rest/v1/mood_energy_entries`,
        method: "POST",
        data: entryData
      });
      
      if (error) throw error;

      toast({
        title: "Success",
        description: "Your entry has been saved successfully!",
        variant: "default"
      });

      // Reset form
      setMoodScore(5);
      setEnergyLevel(5);
      setFocusLevel(5);
      setSelectedFactors([]);
      setSelectedDrains([]);
      setSelectedEnhancers([]);
      setNotes('');
      setIsQuitDayRelated(false);
      setQuitDayCorrelation(null);

      // Refresh data
      refetch();
    } catch (error) {
      console.error("Error saving entry:", error);
      toast({
        title: "Error",
        description: "Failed to save your entry. Please try again.",
        variant: "destructive"
      });
    }
  };

  // Open dialog to add custom factor
  const openAddCustomFactorDialog = (type: 'mood' | 'energy' | 'focus') => {
    setCustomFactorType(type);
    setCustomFactorName('');
    openModal('addCustomFactor');
  };

  // Add custom factor to the appropriate list
  const addCustomFactor = () => {
    if (!customFactorName.trim()) {
      toast({
        title: "Error",
        description: "Please enter a name for your custom factor",
        variant: "destructive"
      });
      return;
    }

    switch (customFactorType) {
      case 'mood':
        setSelectedFactors([...selectedFactors, customFactorName]);
        break;
      case 'energy':
        setSelectedDrains([...selectedDrains, customFactorName]);
        break;
      case 'focus':
        setSelectedEnhancers([...selectedEnhancers, customFactorName]);
        break;
    }

    closeModal('addCustomFactor');
    toast({
      title: "Success",
      description: "Custom factor added successfully",
    });
  };

  // Render factor selection buttons
  const renderFactorButtons = (
    factors: string[], 
    selected: string[], 
    setSelected: React.Dispatch<React.SetStateAction<string[]>>,
    type: 'mood' | 'energy' | 'focus'
  ) => {
    return (
      <div className="flex flex-wrap gap-2 mb-4">
        {factors.map(factor => (
          <Button
            key={factor}
            variant={selected.includes(factor) ? "default" : "outline"}
            size="sm"
            onClick={() => {
              if (selected.includes(factor)) {
                setSelected(selected.filter(f => f !== factor));
              } else {
                setSelected([...selected, factor]);
              }
            }}
          >
            {factor}
          </Button>
        ))}
        <Button
          variant="ghost"
          size="sm"
          onClick={() => openAddCustomFactorDialog(type)}
        >
          <PlusCircle className="h-4 w-4 mr-1" /> Add Custom
        </Button>
      </div>
    );
  };

  return (
    <div className="space-y-6">
      <Card>
        <CardHeader>
          <CardTitle>Energy, Mood & Focus Tracker</CardTitle>
          <CardDescription>
            Track how you feel throughout your quit journey to identify patterns and improvements
          </CardDescription>
        </CardHeader>
        
        <CardContent>
          <Tabs defaultValue="track">
            <TabsList className="mb-4">
              <TabsTrigger value="track">Track Today</TabsTrigger>
              <TabsTrigger value="history">History</TabsTrigger>
              <TabsTrigger value="insights">Insights</TabsTrigger>
            </TabsList>
            
            <TabsContent value="track" className="space-y-4">
              <div className="space-y-4">
                <div>
                  <Label className="text-sm font-medium mb-1 block">Mood (1-10)</Label>
                  <div className="flex items-center space-x-2">
                    <span className="text-sm">Low</span>
                    <Slider
                      value={[moodScore]}
                      onValueChange={([value]) => setMoodScore(value)}
                      max={10}
                      min={1}
                      step={1}
                      className="flex-1"
                    />
                    <span className="text-sm">High</span>
                  </div>
                </div>
                
                <div>
                  <Label className="text-sm font-medium mb-1 block">Energy Level (1-10)</Label>
                  <div className="flex items-center space-x-2">
                    <span className="text-sm">Low</span>
                    <Slider
                      value={[energyLevel]}
                      onValueChange={([value]) => setEnergyLevel(value)}
                      max={10}
                      min={1}
                      step={1}
                      className="flex-1"
                    />
                    <span className="text-sm">High</span>
                  </div>
                </div>
                
                <div>
                  <Label className="text-sm font-medium mb-1 block">Focus Level (1-10)</Label>
                  <div className="flex items-center space-x-2">
                    <span className="text-sm">Low</span>
                    <Slider
                      value={[focusLevel]}
                      onValueChange={([value]) => setFocusLevel(value)}
                      max={10}
                      min={1}
                      step={1}
                      className="flex-1"
                    />
                    <span className="text-sm">High</span>
                  </div>
                </div>
                
                <div>
                  <Label className="text-sm font-medium mb-1 block">Positive Mood Factors (select all that apply)</Label>
                  {renderFactorButtons(MOOD_FACTORS, selectedFactors, setSelectedFactors, 'mood')}
                </div>
                
                <div>
                  <Label className="text-sm font-medium mb-1 block">Energy Drains (select all that apply)</Label>
                  {renderFactorButtons(ENERGY_DRAINS, selectedDrains, setSelectedDrains, 'energy')}
                </div>
                
                <div>
                  <Label className="text-sm font-medium mb-1 block">Focus Enhancers (select all that apply)</Label>
                  {renderFactorButtons(FOCUS_ENHANCERS, selectedEnhancers, setSelectedEnhancers, 'focus')}
                </div>
                
                {quitData.quit_date && (
                  <div className="space-y-2">
                    <div className="flex items-center space-x-2">
                      <input 
                        type="checkbox" 
                        id="quitDayRelated" 
                        checked={isQuitDayRelated}
                        onChange={(e) => setIsQuitDayRelated(e.target.checked)}
                        className="h-4 w-4"
                      />
                      <Label htmlFor="quitDayRelated">
                        Related to your quit journey ({quitData.days_since_quit} days since quitting)
                      </Label>
                    </div>
                    
                    {isQuitDayRelated && (
                      <div>
                        <Label className="text-sm font-medium mb-1 block">
                          How is your quit journey affecting your mood/energy today?
                        </Label>
                        <div className="flex items-center space-x-2">
                          <span className="text-sm">Negatively</span>
                          <Slider
                            value={[quitDayCorrelation ?? 0]}
                            onValueChange={([value]) => setQuitDayCorrelation(value)}
                            max={10}
                            min={-10}
                            step={1}
                            className="flex-1"
                          />
                          <span className="text-sm">Positively</span>
                        </div>
                      </div>
                    )}
                  </div>
                )}
                
                <div>
                  <Label className="text-sm font-medium mb-1 block">Notes</Label>
                  <textarea
                    className="w-full min-h-[80px] p-2 border rounded-md"
                    value={notes}
                    onChange={(e) => setNotes(e.target.value)}
                    placeholder="How are you feeling today? Any specific triggers or helpful strategies?"
                  />
                </div>
                
                <Button onClick={saveMoodEnergyEntry} className="w-full">
                  Save Entry
                </Button>
              </div>
            </TabsContent>
            
            <TabsContent value="history">
              {moodHistory && moodHistory.length > 0 ? (
                <div className="space-y-4">
                  <div className="h-[300px]">
                    <ResponsiveContainer width="100%" height="100%">
                      <LineChart data={moodHistory.map(entry => ({
                        date: format(new Date(entry.timestamp), 'MM/dd'),
                        mood: entry.mood_score,
                        energy: entry.energy_level,
                        focus: entry.focus_level
                      }))}>
                        <CartesianGrid strokeDasharray="3 3" />
                        <XAxis dataKey="date" />
                        <YAxis domain={[0, 10]} />
                        <Tooltip />
                        <Legend />
                        <Line type="monotone" dataKey="mood" stroke="#8884d8" name="Mood" />
                        <Line type="monotone" dataKey="energy" stroke="#82ca9d" name="Energy" />
                        <Line type="monotone" dataKey="focus" stroke="#ffc658" name="Focus" />
                      </LineChart>
                    </ResponsiveContainer>
                  </div>
                  
                  <div className="space-y-2">
                    <h3 className="text-lg font-medium">Recent Entries</h3>
                    {moodHistory.slice(0, 5).map((entry, index) => (
                      <Card key={index} className="p-4">
                        <div className="flex justify-between items-center">
                          <div className="font-medium">
                            {format(new Date(entry.timestamp), 'MMMM d, yyyy h:mm a')}
                          </div>
                          <div className="flex space-x-2">
                            <span className="bg-purple-100 text-purple-800 px-2 py-1 rounded text-xs">
                              Mood: {entry.mood_score}/10
                            </span>
                            <span className="bg-green-100 text-green-800 px-2 py-1 rounded text-xs">
                              Energy: {entry.energy_level}/10
                            </span>
                            <span className="bg-amber-100 text-amber-800 px-2 py-1 rounded text-xs">
                              Focus: {entry.focus_level}/10
                            </span>
                          </div>
                        </div>
                        {entry.notes && (
                          <div className="mt-2 text-sm text-gray-600">
                            {entry.notes}
                          </div>
                        )}
                      </Card>
                    ))}
                  </div>
                </div>
              ) : (
                <div className="text-center py-8">
                  <div className="text-gray-500 mb-2">No entries yet</div>
                  <p>Track your first mood and energy entry to see your history here</p>
                </div>
              )}
            </TabsContent>
            
            <TabsContent value="insights">
              {moodAnalytics && moodAnalytics.length > 0 ? (
                <div className="space-y-6">
                  <Card>
                    <CardHeader>
                      <CardTitle>30-Day Trends</CardTitle>
                    </CardHeader>
                    <CardContent>
                      <div className="h-[300px]">
                        <ResponsiveContainer width="100%" height="100%">
                          <LineChart data={moodAnalytics.map(day => ({
                            date: day.date.split('T')[0],
                            avgMood: day.avgMood,
                            avgEnergy: day.avgEnergy,
                            avgFocus: day.avgFocus
                          }))}>
                            <CartesianGrid strokeDasharray="3 3" />
                            <XAxis dataKey="date" />
                            <YAxis domain={[0, 10]} />
                            <Tooltip />
                            <Legend />
                            <Line type="monotone" dataKey="avgMood" stroke="#8884d8" name="Avg. Mood" />
                            <Line type="monotone" dataKey="avgEnergy" stroke="#82ca9d" name="Avg. Energy" />
                            <Line type="monotone" dataKey="avgFocus" stroke="#ffc658" name="Avg. Focus" />
                          </LineChart>
                        </ResponsiveContainer>
                      </div>
                    </CardContent>
                  </Card>
                  
                  {quitData.days_since_quit !== null && quitData.days_since_quit >= 0 && (
                    <Card>
                      <CardHeader>
                        <CardTitle>Quit Journey Impact</CardTitle>
                        <CardDescription>
                          How your smoking cessation journey affects your mood and energy
                        </CardDescription>
                      </CardHeader>
                      <CardContent>
                        <div className="space-y-4">
                          <div>
                            <h4 className="font-medium mb-2">Average Mood/Energy Before vs. After Quitting</h4>
                            <div className="h-[200px]">
                              <ResponsiveContainer width="100%" height="100%">
                                <BarChart data={[
                                  { name: 'Before Quitting', mood: 4.2, energy: 3.8, focus: 4.0 },
                                  { name: 'After Quitting', mood: 6.8, energy: 7.2, focus: 6.5 }
                                ]}>
                                  <CartesianGrid strokeDasharray="3 3" />
                                  <XAxis dataKey="name" />
                                  <YAxis domain={[0, 10]} />
                                  <Tooltip />
                                  <Legend />
                                  <Bar dataKey="mood" fill="#8884d8" name="Mood" />
                                  <Bar dataKey="energy" fill="#82ca9d" name="Energy" />
                                  <Bar dataKey="focus" fill="#ffc658" name="Focus" />
                                </BarChart>
                              </ResponsiveContainer>
                            </div>
                            <p className="text-sm text-gray-600 mt-2">
                              * Based on your data and patterns from similar users
                            </p>
                          </div>
                        </div>
                      </CardContent>
                    </Card>
                  )}
                  
                  <Card>
                    <CardHeader>
                      <CardTitle>Personalized Recommendations</CardTitle>
                    </CardHeader>
                    <CardContent>
                      {recommendations.length > 0 ? (
                        <div className="space-y-4">
                          {recommendations.map((rec, index) => (
                            <div key={index} className="flex items-start space-x-4 p-3 rounded-lg bg-gray-50">
                              {rec.priority === 'high' ? (
                                <AlertCircle className="h-5 w-5 text-red-500 mt-0.5" />
                              ) : rec.priority === 'medium' ? (
                                <Info className="h-5 w-5 text-amber-500 mt-0.5" />
                              ) : (
                                <CheckCircle className="h-5 w-5 text-green-500 mt-0.5" />
                              )}
                              <div>
                                <div className="font-medium mb-1">{rec.message}</div>
                                <div className="text-sm text-gray-600">{rec.action}</div>
                              </div>
                            </div>
                          ))}
                        </div>
                      ) : (
                        <div className="text-center py-4">
                          <LifeBuoy className="h-8 w-8 text-gray-400 mx-auto mb-2" />
                          <p className="text-gray-500">
                            Track more entries to receive personalized recommendations
                          </p>
                        </div>
                      )}
                    </CardContent>
                  </Card>
                </div>
              ) : (
                <div className="text-center py-8">
                  <div className="text-gray-500 mb-2">Not enough data for insights yet</div>
                  <p>Track your mood and energy regularly to unlock personalized insights</p>
                </div>
              )}
            </TabsContent>
          </Tabs>
        </CardContent>
      </Card>
      
      {/* Custom Factor Dialog */}
      <Dialog id="addCustomFactor">
        <DialogContent>
          <DialogHeader>
            <DialogTitle>Add Custom {customFactorType === 'mood' ? 'Mood Factor' : customFactorType === 'energy' ? 'Energy Drain' : 'Focus Enhancer'}</DialogTitle>
          </DialogHeader>
          
          <div className="space-y-4 py-4">
            <div className="space-y-2">
              <Label htmlFor="customFactorName">Name</Label>
              <Input
                id="customFactorName"
                value={customFactorName}
                onChange={(e) => setCustomFactorName(e.target.value)}
                placeholder={`Enter custom ${customFactorType === 'mood' ? 'mood factor' : customFactorType === 'energy' ? 'energy drain' : 'focus enhancer'}`}
              />
            </div>
          </div>
          
          <DialogFooter>
            <Button variant="outline" onClick={() => closeModal('addCustomFactor')}>
              Cancel
            </Button>
            <Button onClick={addCustomFactor}>
              Add
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>
    </div>
  );
} 