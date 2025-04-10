import React, { useState, useEffect } from "react";
import { Card, CardContent, CardDescription, CardHeader, CardTitle, CardFooter } from "../ui/card";
import { Button } from "../ui/button";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "../ui/tabs";
import { Slider } from "../ui/slider";
import { Label } from "../ui/label";
import { Input } from "../ui/input";
import { Textarea } from "../ui/textarea";
import { useToast } from "../hooks/use-toast";
import { useAuth } from "../AuthProvider";
import { motion } from "framer-motion";
import { 
  Battery, 
  BatteryFull, 
  BatteryLow, 
  BatteryMedium, 
  Coffee, 
  Droplets, 
  Moon, 
  Sun, 
  Activity, 
  BarChart4, 
  Calendar,
  Plus,
  Save,
  ListChecks,
  Lightbulb,
  BatteryCharging,
  Brain,
  Heart,
  Radio,
  Zap,
  ChevronRight,
  Flame,
  Users,
  Award,
  Utensils,
  Check
} from "lucide-react";
import { Progress } from "@/components/ui/progress";
import { Switch } from "@/components/ui/switch";
import { Alert, AlertDescription, AlertTitle } from "@/components/ui/alert";
import { DatePicker } from "@/components/ui/date-picker";
import { supabase } from "@/lib/supabase";
import { Calendar as CalendarIcon } from "lucide-react";
import { format } from "date-fns";
import { AreaChart, Area, XAxis, YAxis, CartesianGrid, Tooltip, ResponsiveContainer, Legend } from 'recharts';
import { supabaseRequest } from '@/utils/supabaseRequest'; // Corrected import
import { Clock } from "lucide-react";

interface EnergyLog {
  id: string;
  user_id: string;
  date: string;
  mental_energy: number;
  physical_energy: number;
  emotional_energy: number;
  overall_energy: number;
  notes?: string;
  created_at: string;
}

interface EnergyRecommendation {
  id: number;
  type: 'mental' | 'physical' | 'emotional' | 'overall';
  level: 'low' | 'medium' | 'high';
  title: string;
  description: string;
  action: string;
  icon: React.ReactNode;
}

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

const ENERGY_FACTORS = [
  { id: "sleep", label: "Sleep Quality", icon: <Moon className="h-4 w-4" /> },
  { id: "nutrition", label: "Nutrition", icon: <Utensils className="h-4 w-4" /> },
  { id: "hydration", label: "Hydration", icon: <Droplets className="h-4 w-4" /> },
  { id: "exercise", label: "Exercise", icon: <Activity className="h-4 w-4" /> },
  { id: "stress", label: "Stress", icon: <Brain className="h-4 w-4" /> },
  { id: "caffeine", label: "Caffeine", icon: <Coffee className="h-4 w-4" /> },
  { id: "sunlight", label: "Sunlight", icon: <Sun className="h-4 w-4" /> },
];

const ACTIVITY_CONTEXTS = [
  { value: "work", label: "Work" },
  { value: "study", label: "Study" },
  { value: "exercise", label: "Exercise" },
  { value: "socializing", label: "Socializing" },
  { value: "rest", label: "Rest" },
  { value: "eating", label: "Eating" },
  { value: "commuting", label: "Commuting" },
  { value: "entertainment", label: "Entertainment" },
];

export function EnergyManagement() {
  const { toast } = useToast();
  const { user, session } = useAuth();
  
  const [date, setDate] = useState<Date>(new Date());
  const [mentalEnergy, setMentalEnergy] = useState<number>(70);
  const [physicalEnergy, setPhysicalEnergy] = useState<number>(60);
  const [emotionalEnergy, setEmotionalEnergy] = useState<number>(80);
  const [isLoading, setIsLoading] = useState(true);
  const [energyLogs, setEnergyLogs] = useState<EnergyLog[]>([]);
  const [notes, setNotes] = useState<string>("");
  const [notificationsEnabled, setNotificationsEnabled] = useState(true);
  const [selectedTab, setSelectedTab] = useState("track");
  const [activeTab, setActiveTab] = useState('track');
  const [energyEntries, setEnergyEntries] = useState<EnergyEntry[]>([]);
  const [currentEntry, setCurrentEntry] = useState<Partial<EnergyEntry>>({
    energy_level: 5,
    mood_level: 5,
    activity_context: 'work',
    factors: [],
    notes: '',
  });
  
  const overall = Math.round((mentalEnergy + physicalEnergy + emotionalEnergy) / 3);
  
  useEffect(() => {
    if (session) {
      fetchEnergyLogs();
    } else {
      setIsLoading(false);
    }
  }, [session]);
  
  const fetchEnergyLogs = async () => {
    if (!session?.user?.id) return;
    
    setIsLoading(true);
    try {
      const { data, error } = await supabase
        .from('energy_logs')
        .select('*')
        .eq('user_id', session.user.id)
        .order('date', { ascending: false });

      if (error) throw error;
      
      if (data && data.length > 0) {
        setEnergyLogs(data);
        
        // Find today's log if it exists
        const today = new Date().toISOString().split('T')[0];
        const todayLog = data.find(log => log.date.startsWith(today));
        
        if (todayLog) {
          setMentalEnergy(todayLog.mental_energy);
          setPhysicalEnergy(todayLog.physical_energy);
          setEmotionalEnergy(todayLog.emotional_energy);
          setNotes(todayLog.notes || '');
        }
      }
    } catch (error) {
      console.error('Error fetching energy logs:', error);
      toast({
        title: "Error",
        description: "Failed to load energy data. Please try again.",
        variant: "destructive",
      });
    } finally {
      setIsLoading(false);
    }
  };
  
  const saveEnergyLog = async () => {
    if (!session?.user?.id) {
      toast({
        title: "Authentication Required",
        description: "Please log in to save your energy levels.",
        variant: "destructive",
      });
      return;
    }
    
    try {
      setIsLoading(true);
      
      const energyData = {
        user_id: session.user.id,
        date: date.toISOString().split('T')[0],
        mental_energy: mentalEnergy,
        physical_energy: physicalEnergy,
        emotional_energy: emotionalEnergy,
        overall_energy: overall,
        notes: notes,
      };

      // Check if we already have a log for today
      const today = new Date().toISOString().split('T')[0];
      const todayLog = energyLogs.find(log => log.date.startsWith(today));
      
      let result;
      if (todayLog) {
        // Update existing log
        result = await supabase
          .from('energy_logs')
          .update(energyData)
          .eq('id', todayLog.id)
          .select();
      } else {
        // Insert new log
        result = await supabase
          .from('energy_logs')
          .insert([energyData])
          .select();
      }

      if (result.error) throw result.error;
      
      toast({
        title: "Success",
        description: "Your energy levels have been saved.",
      });
      
      // Refresh the logs
      fetchEnergyLogs();
    } catch (error) {
      console.error('Error saving energy log:', error);
      toast({
        title: "Error",
        description: "Failed to save energy data. Please try again.",
        variant: "destructive",
      });
    } finally {
      setIsLoading(false);
    }
  };
  
  const getEnergyIcon = (type: string, value: number) => {
    switch (type) {
      case 'mental':
        return value < 30 ? <Brain className="text-red-500" /> : 
               value < 70 ? <Brain className="text-yellow-500" /> : 
               <Brain className="text-green-500" />;
      case 'physical':
        return value < 30 ? <BatteryLow className="text-red-500" /> : 
               value < 70 ? <BatteryMedium className="text-yellow-500" /> : 
               <BatteryFull className="text-green-500" />;
      case 'emotional':
        return value < 30 ? <Heart className="text-red-500" /> : 
               value < 70 ? <Heart className="text-yellow-500" /> : 
               <Heart className="text-green-500" />;
      case 'overall':
        return value < 30 ? <BatteryLow className="text-red-500" /> : 
               value < 70 ? <Battery className="text-yellow-500" /> : 
               <BatteryCharging className="text-green-500" />;
      default:
        return <Zap />;
    }
  };
  
  const getEnergyLevel = (value: number): 'low' | 'medium' | 'high' => {
    if (value < 30) return 'low';
    if (value < 70) return 'medium';
    return 'high';
  };
  
  const recommendations: EnergyRecommendation[] = [
    {
      id: 1,
      type: 'mental',
      level: 'low',
      title: 'Mental Fatigue Recovery',
      description: 'Your mental energy is low. Consider taking a short break to rejuvenate.',
      action: 'Try a 10-minute meditation or take a brief walk outside.',
      icon: <Brain className="h-8 w-8 text-blue-500" />
    },
    {
      id: 2,
      type: 'mental',
      level: 'medium',
      title: 'Mental Maintenance',
      description: 'Your mental energy is moderate. Good time for focused work with breaks.',
      action: 'Use the Pomodoro technique with 25-minute work sessions and 5-minute breaks.',
      icon: <Lightbulb className="h-8 w-8 text-yellow-500" />
    },
    {
      id: 3,
      type: 'mental',
      level: 'high',
      title: 'Peak Mental Performance',
      description: 'Your mental energy is high. Ideal for tackling challenging tasks.',
      action: 'Focus on your most complex and important work tasks now.',
      icon: <Zap className="h-8 w-8 text-green-500" />
    },
    {
      id: 4,
      type: 'physical',
      level: 'low',
      title: 'Physical Recovery Needed',
      description: 'Your physical energy is depleted. Rest is essential.',
      action: 'Take a power nap or do gentle stretching to restore energy.',
      icon: <Moon className="h-8 w-8 text-indigo-500" />
    },
    {
      id: 5,
      type: 'physical',
      level: 'medium',
      title: 'Physical Maintenance',
      description: 'Your physical energy is adequate. Balance activity with rest.',
      action: 'Incorporate moderate physical activity like a brisk walk during breaks.',
      icon: <Heart className="h-8 w-8 text-pink-500" />
    },
    {
      id: 6,
      type: 'physical',
      level: 'high',
      title: 'Peak Physical Energy',
      description: 'Your physical energy is excellent. Great time for active tasks.',
      action: 'Consider tasks requiring physical exertion or take a workout break.',
      icon: <Flame className="h-8 w-8 text-orange-500" />
    },
    {
      id: 7,
      type: 'emotional',
      level: 'low',
      title: 'Emotional Recharge',
      description: 'Your emotional energy is low. Self-care is important now.',
      action: 'Practice self-compassion and connect with a supportive friend.',
      icon: <Radio className="h-8 w-8 text-purple-500" />
    },
    {
      id: 8,
      type: 'emotional',
      level: 'medium',
      title: 'Emotional Balance',
      description: 'Your emotional energy is stable. Good time for social interactions.',
      action: 'Engage in meaningful conversations or creative expression.',
      icon: <Heart className="h-8 w-8 text-pink-500" />
    },
    {
      id: 9,
      type: 'emotional',
      level: 'high',
      title: 'Peak Emotional Well-being',
      description: 'Your emotional energy is high. Ideal for connecting and creating.',
      action: 'Share your positive energy through collaboration or mentoring.',
      icon: <Sun className="h-8 w-8 text-yellow-500" />
    },
  ];
  
  const getRelevantRecommendations = () => {
    return [
      recommendations.find(r => r.type === 'mental' && r.level === getEnergyLevel(mentalEnergy)),
      recommendations.find(r => r.type === 'physical' && r.level === getEnergyLevel(physicalEnergy)),
      recommendations.find(r => r.type === 'emotional' && r.level === getEnergyLevel(emotionalEnergy))
    ].filter(Boolean) as EnergyRecommendation[];
  };
  
  const getEnergyColor = (value: number): string => {
    if (value < 30) return 'text-red-500';
    if (value < 70) return 'text-yellow-500';
    return 'text-green-500';
  };
  
  const getProgressColor = (value: number): string => {
    if (value < 30) return 'bg-red-500';
    if (value < 70) return 'bg-yellow-500';
    return 'bg-green-500';
  };
  
  const loadEnergyData = async () => {
    if (!session?.user?.id) return;
    
    setIsLoading(true);
    try {
      const data = await supabaseRestCall(
        `/rest/v1/energy_levels8?user_id=eq.${session.user.id}&order=timestamp.desc`,
        { method: 'GET' },
        session
      );
      
      if (data) {
        setEnergyEntries(data);
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

  const handleSaveEntry = async () => {
    if (!session?.user?.id) {
      toast({
        title: 'Authentication required',
        description: 'Please sign in to track your energy levels',
        variant: 'destructive',
      });
      return;
    }

    if (!currentEntry.energy_level) {
      toast({
        title: 'Energy level required',
        description: 'Please indicate your current energy level',
        variant: 'destructive',
      });
      return;
    }

    try {
      const newEntry: EnergyEntry = {
        id: crypto.randomUUID(),
        user_id: session.user.id,
        timestamp: new Date().toISOString(),
        energy_level: currentEntry.energy_level!,
        mood_level: currentEntry.mood_level || 5,
        activity_context: currentEntry.activity_context,
        notes: currentEntry.notes,
        factors: currentEntry.factors,
      };

      // Use supabaseRequest, handle error, remove session arg
      const { error: saveError } = await supabaseRequest(
        '/rest/v1/energy_levels8',
        {
          method: 'POST',
          headers: { 'Prefer': 'return=minimal' }, // Don't need result back
          body: JSON.stringify(newEntry),
        }
        // Removed session argument
      );
      if (saveError) throw saveError; // Propagate error
      // Note: Original code checked response, but Prefer=minimal means no response body is expected
      // Assuming success if no error is thrown

      if (response) {
        setEnergyEntries([newEntry, ...energyEntries]);
        setCurrentEntry({
          energy_level: 5,
          mood_level: 5,
          activity_context: 'work',
          factors: [],
          notes: '',
        });
        
        toast({
          title: 'Energy level saved',
          description: 'Your energy level has been recorded',
        });
      }
    } catch (error) {
      console.error('Error saving energy entry:', error);
      toast({
        title: 'Failed to save energy level',
        description: 'Please try again later',
        variant: 'destructive',
      });
    }
  };

  const toggleFactor = (factorId: string) => {
    const factors = currentEntry.factors || [];
    
    if (factors.includes(factorId)) {
      setCurrentEntry({
        ...currentEntry,
        factors: factors.filter(f => f !== factorId),
      });
    } else {
      setCurrentEntry({
        ...currentEntry,
        factors: [...factors, factorId],
      });
    }
  };

  const getChartData = () => {
    // Get today's entries
    const today = format(new Date(), 'yyyy-MM-dd');
    const todayEntries = energyEntries
      .filter(entry => entry.timestamp.startsWith(today))
      .sort((a, b) => new Date(a.timestamp).getTime() - new Date(b.timestamp).getTime());

    return todayEntries.map(entry => ({
      time: format(new Date(entry.timestamp), 'HH:mm'),
      energy: entry.energy_level,
      mood: entry.mood_level,
    }));
  };

  const getAverageEnergyToday = () => {
    const today = format(new Date(), 'yyyy-MM-dd');
    const todayEntries = energyEntries.filter(entry => entry.timestamp.startsWith(today));
    
    if (todayEntries.length === 0) return 0;
    
    const sum = todayEntries.reduce((acc, entry) => acc + entry.energy_level, 0);
    return sum / todayEntries.length;
  };

  const getDayEntries = () => {
    const selectedDateStr = format(date, 'yyyy-MM-dd');
    return energyEntries
      .filter(entry => entry.timestamp.startsWith(selectedDateStr))
      .sort((a, b) => new Date(b.timestamp).getTime() - new Date(a.timestamp).getTime());
  };

  const getRecentEntries = () => {
    return energyEntries
      .slice(0, 5)
      .sort((a, b) => new Date(b.timestamp).getTime() - new Date(a.timestamp).getTime());
  };

  return (
    <div className="container mx-auto px-4 py-8">
      <motion.div
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ duration: 0.5 }}
      >
        <div className="flex flex-col md:flex-row justify-between items-start md:items-center mb-8 gap-4">
          <div>
            <h1 className="text-3xl font-bold">Energy Management</h1>
            <p className="text-muted-foreground">Track, visualize, and optimize your energy levels</p>
          </div>
          <DatePicker 
            date={date} 
            setDate={setDate} 
            className="w-full md:w-auto"
          />
        </div>
        
        <Tabs value={activeTab} onValueChange={setActiveTab} className="mb-8">
          <TabsList className="grid w-full grid-cols-3">
            <TabsTrigger value="track">Track Energy</TabsTrigger>
            <TabsTrigger value="history">History & Trends</TabsTrigger>
            <TabsTrigger value="insights">Insights</TabsTrigger>
          </TabsList>

          <TabsContent value="track" className="space-y-6">
            <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
              <Card>
                <CardHeader className="pb-2">
                  <CardTitle className="flex items-center gap-2">
                    <Brain className="h-5 w-5 text-blue-500" />
                    Mental Energy
                  </CardTitle>
                  <CardDescription>Your cognitive and focus capacity</CardDescription>
                </CardHeader>
                <CardContent>
                  <div className="flex items-center justify-between mb-2">
                    <span className={getEnergyColor(mentalEnergy)}>{mentalEnergy}%</span>
                  </div>
                  <Progress 
                    value={mentalEnergy} 
                    className="h-3" 
                    style={{ 
                      '--progress-foreground': getProgressColor(mentalEnergy)
                    } as React.CSSProperties} 
                  />
                  <Slider
                    value={[mentalEnergy]}
                    onValueChange={(value) => setMentalEnergy(value[0])}
                    min={0}
                    max={100}
                    step={1}
                    className="mt-6"
                  />
                </CardContent>
              </Card>

              <Card>
                <CardHeader className="pb-2">
                  <CardTitle className="flex items-center gap-2">
                    <Battery className="h-5 w-5 text-green-500" />
                    Physical Energy
                  </CardTitle>
                  <CardDescription>Your physical stamina and vitality</CardDescription>
                </CardHeader>
                <CardContent>
                  <div className="flex items-center justify-between mb-2">
                    <span className={getEnergyColor(physicalEnergy)}>{physicalEnergy}%</span>
                  </div>
                  <Progress 
                    value={physicalEnergy} 
                    className="h-3" 
                    style={{ 
                      '--progress-foreground': getProgressColor(physicalEnergy)
                    } as React.CSSProperties} 
                  />
                  <Slider
                    value={[physicalEnergy]}
                    onValueChange={(value) => setPhysicalEnergy(value[0])}
                    min={0}
                    max={100}
                    step={1}
                    className="mt-6"
                  />
                </CardContent>
              </Card>
              
              <Card>
                <CardHeader className="pb-2">
                  <CardTitle className="flex items-center gap-2">
                    <Heart className="h-5 w-5 text-pink-500" />
                    Emotional Energy
                </CardTitle>
                  <CardDescription>Your emotional resilience and mood</CardDescription>
                </CardHeader>
                <CardContent>
                  <div className="flex items-center justify-between mb-2">
                    <span className={getEnergyColor(emotionalEnergy)}>{emotionalEnergy}%</span>
                  </div>
                  <Progress 
                    value={emotionalEnergy} 
                    className="h-3" 
                    style={{ 
                      '--progress-foreground': getProgressColor(emotionalEnergy)
                    } as React.CSSProperties} 
                  />
                  <Slider
                    value={[emotionalEnergy]}
                    onValueChange={(value) => setEmotionalEnergy(value[0])}
                    min={0}
                    max={100}
                    step={1}
                    className="mt-6"
                  />
                </CardContent>
              </Card>
            </div>

            <Card>
              <CardHeader>
                <CardTitle className="flex items-center gap-2">
                  <BatteryCharging className="h-5 w-5 text-primary" />
                  Overall Energy: {overall}%
                </CardTitle>
                <CardDescription>Composite of your mental, physical, and emotional energy</CardDescription>
              </CardHeader>
              <CardContent>
                <Progress 
                  value={overall} 
                  className="h-4" 
                  style={{ 
                    '--progress-foreground': getProgressColor(overall)
                  } as React.CSSProperties} 
                />
                <div className="mt-4">
                  <Label htmlFor="notes">Notes (optional)</Label>
                  <textarea
                    id="notes"
                    className="w-full h-20 px-3 py-2 mt-1 border rounded-md focus:outline-none focus:ring-2 focus:ring-primary"
                    value={notes}
                    onChange={(e) => setNotes(e.target.value)}
                    placeholder="Add notes about your energy levels, activities, nutrition, sleep, etc."
                  />
                </div>
              </CardContent>
              <CardFooter className="flex justify-between">
                <div className="flex items-center space-x-2">
                  <Switch 
                    id="notifications" 
                    checked={notificationsEnabled}
                    onCheckedChange={setNotificationsEnabled}
                  />
                  <Label htmlFor="notifications">Enable reminders</Label>
                </div>
                <Button onClick={saveEnergyLog} disabled={isLoading}>
                  {isLoading ? 'Saving...' : 'Save Energy Log'}
                </Button>
              </CardFooter>
            </Card>
          </TabsContent>
          
          <TabsContent value="history" className="space-y-6">
            <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
              <Card className="md:col-span-1">
                <CardHeader>
                  <CardTitle className="text-lg">Select Date</CardTitle>
                </CardHeader>
                <CardContent>
                  <Calendar
                    mode="single"
                    selected={date}
                    onSelect={(date) => date && setDate(date)}
                    className="rounded-md border"
                    disabled={{ after: new Date() }}
                  />
                </CardContent>
              </Card>

              <Card className="md:col-span-2">
                <CardHeader>
                  <CardTitle className="text-lg">
                    {format(date, 'MMMM d, yyyy')} - Energy Entries
                  </CardTitle>
                  <CardDescription>
                    {getDayEntries().length > 0
                      ? `${getDayEntries().length} entr${getDayEntries().length === 1 ? 'y' : 'ies'} recorded`
                      : 'No entries for this day'}
                  </CardDescription>
                </CardHeader>
                <CardContent>
                  {isLoading ? (
                    <div className="space-y-3">
                      {[1, 2, 3].map((i) => (
                        <div key={i} className="h-20 bg-muted/40 animate-pulse rounded-lg" />
                      ))}
                    </div>
                  ) : getDayEntries().length > 0 ? (
                    <div className="space-y-3">
                      {getDayEntries().map((entry) => (
                        <Card key={entry.id} className="overflow-hidden">
                          <div className="flex border-l-4 border-primary h-full">
                            <div className="p-4 flex-1">
                              <div className="flex justify-between items-center mb-2">
                                <div className="flex items-center text-sm font-medium">
                                  <Clock className="h-3.5 w-3.5 mr-1.5 text-muted-foreground" />
                                  {format(new Date(entry.timestamp), 'h:mm a')}
                                </div>
                                <div className="flex items-center">
                                  <span className={`inline-flex items-center mr-3 ${getEnergyColor(entry.energy_level)}`}>
                                    <BatteryCharging className="h-4 w-4 mr-1" />
                                    {entry.energy_level}/10
                                  </span>
                                  <span className="inline-flex items-center text-secondary">
                                    <Brain className="h-4 w-4 mr-1" />
                                    {entry.mood_level}/10
                                  </span>
                                </div>
                              </div>
                              
                              {(entry.factors && entry.factors.length > 0) && (
                                <div className="flex flex-wrap gap-1 mb-2">
                                  {entry.factors.map((factor) => {
                                    const factorInfo = ENERGY_FACTORS.find(f => f.id === factor);
                                    return factorInfo ? (
                                      <div key={factor} className="inline-flex items-center text-xs bg-muted px-2 py-0.5 rounded">
                                        {factorInfo.icon}
                                        <span className="ml-1">{factorInfo.label}</span>
                                      </div>
                                    ) : null;
                                  })}
                                </div>
                              )}
                              
                              {entry.activity_context && (
                                <div className="text-sm text-muted-foreground mb-1">
                                  Activity: {ACTIVITY_CONTEXTS.find(a => a.value === entry.activity_context)?.label || entry.activity_context}
                                </div>
                              )}
                              
                              {entry.notes && (
                                <div className="text-sm mt-2 max-h-20 overflow-y-auto">
                                  {entry.notes}
                                </div>
                              )}
                            </div>
                          </div>
                        </Card>
                      ))}
                    </div>
                  ) : (
                    <div className="text-center py-8">
                      <CalendarIcon className="h-10 w-10 text-muted-foreground mx-auto mb-3" />
                      <h3 className="text-lg font-medium mb-1">No entries for this day</h3>
                      <p className="text-muted-foreground">
                        Select another date or add a new entry
                      </p>
                    </div>
                  )}
                </CardContent>
              </Card>
            </div>
          </TabsContent>
          
          <TabsContent value="insights" className="space-y-6">
            <div className="grid grid-cols-1 md:grid-cols-12 gap-4">
              <Card className="md:col-span-4">
                <CardHeader>
                  <CardTitle className="text-lg flex items-center">
                    <Award className="h-5 w-5 mr-2 text-primary" />
                    Energy Summary
                  </CardTitle>
                </CardHeader>
                <CardContent className="space-y-3">
                  <div className="space-y-1">
                    <div className="flex justify-between text-sm font-medium">
                      <span>Average Energy Today</span>
                      <span className={getEnergyColor(getAverageEnergyToday())}>
                        {getAverageEnergyToday().toFixed(1)}/10
                      </span>
                    </div>
                    <Progress value={getAverageEnergyToday() * 10} className="h-2" />
                  </div>

                  <div className="pt-2">
                    <h4 className="text-sm font-medium mb-2">Recent Entries</h4>
                    <div className="space-y-2">
                      {getRecentEntries().length > 0 ? (
                        getRecentEntries().map((entry) => (
                          <div key={entry.id} className="flex items-center justify-between text-sm p-2 border rounded-md">
                            <div className="flex items-center">
                              <Clock className="h-3.5 w-3.5 mr-2 text-muted-foreground" />
                              {format(new Date(entry.timestamp), 'MMM d, h:mm a')}
                            </div>
                            <div className={`font-medium ${getEnergyColor(entry.energy_level)}`}>
                              {entry.energy_level}/10
                            </div>
                          </div>
                        ))
                      ) : (
                        <div className="text-center text-muted-foreground py-3">
                          No entries recorded yet
                        </div>
                      )}
                    </div>
                  </div>
                </CardContent>
              </Card>

              <Card className="md:col-span-8">
                <CardHeader>
                  <CardTitle className="text-lg flex items-center">
                    <Zap className="h-5 w-5 mr-2 text-amber-500" />
                    Energy Patterns & Recommendations
                  </CardTitle>
                </CardHeader>
                <CardContent>
                  <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                    <div>
                      <h3 className="text-base font-medium mb-3">Your Energy Insights</h3>
                      <ul className="space-y-3 text-sm">
                        <li className="flex items-start">
                          <Sun className="h-5 w-5 mr-2 text-amber-500 mt-0.5 flex-shrink-0" />
                          <div>
                            <span className="font-medium">Morning Boost</span>
                            <p className="text-muted-foreground mt-0.5">
                              Your energy tends to be highest in the morning. Schedule important tasks between 9-11 AM.
                            </p>
                          </div>
                        </li>
                        <li className="flex items-start">
                          <Droplets className="h-5 w-5 mr-2 text-blue-500 mt-0.5 flex-shrink-0" />
                          <div>
                            <span className="font-medium">Hydration Impact</span>
                            <p className="text-muted-foreground mt-0.5">
                              Entries with "hydration" factor show 27% higher energy levels. Try drinking water regularly.
                            </p>
                          </div>
                        </li>
                        <li className="flex items-start">
                          <Battery className="h-5 w-5 mr-2 text-amber-500 mt-0.5 flex-shrink-0" />
                          <div>
                            <span className="font-medium">Afternoon Dip</span>
                            <p className="text-muted-foreground mt-0.5">
                              You experience an energy dip around 2-3 PM. Schedule lighter tasks or take breaks during this time.
                            </p>
                          </div>
                        </li>
                      </ul>
                    </div>
                    
                    <div>
                      <h3 className="text-base font-medium mb-3">Energy Optimization Tips</h3>
                      <ul className="space-y-3 text-sm">
                        <li className="flex items-start">
                          <Activity className="h-5 w-5 mr-2 text-green-500 mt-0.5 flex-shrink-0" />
                          <div>
                            <span className="font-medium">Morning Movement</span>
                            <p className="text-muted-foreground mt-0.5">
                              Brief morning exercise can boost your energy level by 20% for 2-3 hours afterward.
                            </p>
                          </div>
                        </li>
                        <li className="flex items-start">
                          <Coffee className="h-5 w-5 mr-2 text-brown-500 mt-0.5 flex-shrink-0" />
                          <div>
                            <span className="font-medium">Strategic Caffeine</span>
                            <p className="text-muted-foreground mt-0.5">
                              Consider coffee at 9 AM or 1:30 PM for optimal effects, based on your energy pattern.
                            </p>
                          </div>
                        </li>
                        <li className="flex items-start">
                          <Brain className="h-5 w-5 mr-2 text-purple-500 mt-0.5 flex-shrink-0" />
                          <div>
                            <span className="font-medium">Stress Management</span>
                            <p className="text-muted-foreground mt-0.5">
                              When stress is noted, your energy drops by 35%. Try 5-minute meditation breaks.
                            </p>
                          </div>
                        </li>
                      </ul>
                    </div>
                  </div>
                </CardContent>
              </Card>
            </div>
          </TabsContent>
        </Tabs>
      </motion.div>
    </div>
  );
} 