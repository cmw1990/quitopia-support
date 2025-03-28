import React, { useState, useEffect } from 'react';
import { useAuth } from '@/components/AuthProvider';
import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import { Session } from '@supabase/supabase-js';
import {
  Card,
  CardContent,
  CardDescription,
  CardFooter,
  CardHeader,
  CardTitle
} from '@/components/ui/card';
import {
  Tabs,
  TabsContent,
  TabsList,
  TabsTrigger
} from '@/components/ui/tabs';
import {
  Form,
  FormControl,
  FormDescription,
  FormField,
  FormItem,
  FormLabel,
  FormMessage
} from '@/components/ui/form';
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue
} from '@/components/ui/select';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Textarea } from '@/components/ui/textarea';
import { Slider } from '@/components/ui/slider';
import { Switch } from '@/components/ui/switch';
import { Checkbox } from '@/components/ui/checkbox';
import { Battery, Coffee, Dumbbell, Brain, Moon, Sun, Info, Check, BatteryCharging, BatteryLow, BatteryMedium, BatteryFull, CalendarIcon, PlusCircle } from 'lucide-react';
import { format, subDays, addDays, parseISO } from 'date-fns';
import { useToast } from '@/components/ui/use-toast';
import { zodResolver } from '@hookform/resolvers/zod';
import { useForm } from 'react-hook-form';
import * as z from 'zod';
import { AreaChart, Area, XAxis, YAxis, CartesianGrid, Tooltip, ResponsiveContainer, LineChart, Line, BarChart, Bar, Legend } from 'recharts';
import { saveEnergyPlan } from "@/api/apiCompatibility";
import { supabaseRestCall } from "../../api/apiCompatibility";
import { Progress } from '../ui';

// Define the schema for the energy tracking form
const energyTrackingSchema = z.object({
  energyLevel: z.number().min(1).max(10),
  timeOfDay: z.enum(['morning', 'afternoon', 'evening', 'night']),
  caffeineConsumed: z.boolean(),
  caffeineAmountMg: z.number().min(0).optional(),
  physicalActivity: z.boolean(),
  sleepHours: z.number().min(0).max(24),
  notes: z.string().optional()
});

// Add new schema for energy plan
const energyPlanSchema = z.object({
  morningRoutine: z.string().min(1, "Please specify a morning routine"),
  afternoonBoost: z.string().min(1, "Please specify an afternoon energy boost strategy"),
  eveningWindDown: z.string().min(1, "Please specify an evening wind-down routine"),
  caffeineStrategy: z.string().min(1, "Please specify your caffeine management strategy"),
  exerciseCommitment: z.string().min(1, "Please specify your exercise commitment"),
  enabled: z.boolean().default(true)
});

// Type for energy logs
type EnergyLog = {
  id: string;
  user_id: string;
  timestamp: string;
  energy_level: number;
  time_of_day: 'morning' | 'afternoon' | 'evening' | 'night';
  caffeine_consumed: boolean;
  caffeine_amount_mg: number | null;
  physical_activity: boolean;
  sleep_hours: number;
  notes: string | null;
  created_at: string;
};

type EnergyPlan = {
  id?: string;
  user_id: string;
  morning_routine: string;
  afternoon_boost: string;
  evening_wind_down: string;
  caffeine_strategy: string;
  exercise_commitment: string;
  enabled: boolean;
  created_at?: string;
  updated_at?: string;
};

interface EnergyTrackerProps {
  session: Session | null;
  compact?: boolean;
}

interface EnergyEntry {
  date: string;
  level: number;
  note?: string;
}

export const EnergyTracker: React.FC<EnergyTrackerProps> = ({ session }) => {
  const { toast } = useToast();
  const [currentTab, setCurrentTab] = useState('track');
  const queryClient = useQueryClient();
  const [showEnergyTips, setShowEnergyTips] = useState(false);
  const [selectedDate, setSelectedDate] = useState<Date>(new Date());
  const [viewMode, setViewMode] = useState<'day' | 'week' | 'month'>('week');
  const [energyEntries, setEnergyEntries] = useState<EnergyEntry[]>([]);
  const [currentLevel, setCurrentLevel] = useState<number>(5);
  const [energyNote, setEnergyNote] = useState<string>('');
  const [showAddForm, setShowAddForm] = useState<boolean>(false);
  const [loading, setLoading] = useState<boolean>(true);
  const userId = session?.user?.id || '';

  // Form setup with React Hook Form for tracking
  const form = useForm<z.infer<typeof energyTrackingSchema>>({
    resolver: zodResolver(energyTrackingSchema),
    defaultValues: {
      energyLevel: 5,
      timeOfDay: 'morning',
      caffeineConsumed: false,
      caffeineAmountMg: 0,
      physicalActivity: false,
      sleepHours: 7,
      notes: ''
    }
  });

  // Form setup for energy plan
  const planForm = useForm<z.infer<typeof energyPlanSchema>>({
    resolver: zodResolver(energyPlanSchema),
    defaultValues: {
      morningRoutine: "",
      afternoonBoost: "",
      eveningWindDown: "",
      caffeineStrategy: "",
      exerciseCommitment: "",
      enabled: true
    }
  });

  // Query to fetch energy logs
  const { data: energyLogs, isLoading } = useQuery({
    queryKey: ['energy-logs'],
    queryFn: async () => {
      if (!session?.user?.id) {
        throw new Error("User not authenticated");
      }
      
      const endpoint = `/rest/v1/energy_focus_logs?user_id=eq.${session.user.id}&order=timestamp.desc&limit=20`;
      const data = await supabaseRestCall(endpoint, {}, session);
      return data as unknown as EnergyLog[];
    },
    enabled: !!session?.user?.id,
  });

  // Query to fetch existing energy plan
  const { data: energyPlan } = useQuery({
    queryKey: ['energy-plan'],
    queryFn: async () => {
      if (!session?.user?.id) {
        throw new Error("User not authenticated");
      }
      
      const endpoint = `/rest/v1/energy_plans?user_id=eq.${session.user.id}&limit=1`;
      const data = await supabaseRestCall(endpoint, {}, session) as unknown as any[];
      
      if (data && data.length > 0) {
        // Update form with existing plan data
        planForm.reset({
          morningRoutine: data[0].morning_routine,
          afternoonBoost: data[0].afternoon_boost,
          eveningWindDown: data[0].evening_wind_down,
          caffeineStrategy: data[0].caffeine_strategy,
          exerciseCommitment: data[0].exercise_commitment,
          enabled: data[0].enabled
        });
        return data[0] as EnergyPlan;
      }
      
      return null;
    },
    enabled: !!session?.user?.id,
  });

  // Mutation to save a new energy log
  const createEnergyLogMutation = useMutation({
    mutationFn: async (values: z.infer<typeof energyTrackingSchema>) => {
      if (!session?.user?.id) {
        throw new Error('User not authenticated');
      }

      const endpoint = '/rest/v1/energy_focus_logs';
      const data = await supabaseRestCall(
        endpoint, 
        {
          method: 'POST',
          body: JSON.stringify({
            user_id: session.user.id,
            timestamp: new Date().toISOString(),
            energy_level: values.energyLevel,
            time_of_day: values.timeOfDay,
            caffeine_consumed: values.caffeineConsumed,
            caffeine_amount_mg: values.caffeineAmountMg || 0,
            physical_activity: values.physicalActivity,
            sleep_hours: values.sleepHours,
            notes: values.notes
          })
        },
        session
      );
      
      return data;
    },
    onSuccess: () => {
      toast({
        title: "Energy log saved",
        description: "Your energy level has been recorded successfully.",
      });
      form.reset();
      queryClient.invalidateQueries({ queryKey: ['energy-logs'] });
    },
    onError: (error) => {
      toast({
        title: "Error saving energy log",
        description: "There was a problem saving your energy log. Please try again.",
        variant: "destructive",
      });
      console.error("Error saving energy log:", error);
    }
  });

  // Update energy plan mutation
  const updateEnergyPlanMutation = useMutation({
    mutationFn: async (values: z.infer<typeof energyPlanSchema>) => {
      if (!session?.user?.id) {
        throw new Error('User not authenticated');
      }

      const endpoint = '/rest/v1/energy_plans';
      const method = energyPlan ? 'PATCH' : 'POST';
      const queryParams = energyPlan ? `?id=eq.${energyPlan.id}` : '';
      
      const data = await supabaseRestCall(
        endpoint + queryParams, 
        {
          method,
          body: JSON.stringify({
            user_id: session.user.id,
            morning_routine: values.morningRoutine,
            afternoon_boost: values.afternoonBoost,
            evening_wind_down: values.eveningWindDown,
            caffeine_strategy: values.caffeineStrategy,
            exercise_commitment: values.exerciseCommitment,
            enabled: values.enabled,
            updated_at: new Date().toISOString()
          })
        },
        session
      );
      
      return data;
    },
    onSuccess: () => {
      toast({
        title: "Energy plan saved",
        description: "Your energy management plan has been updated successfully.",
      });
      queryClient.invalidateQueries({ queryKey: ['energy-plan'] });
    },
    onError: (error) => {
      toast({
        title: "Error saving energy plan",
        description: "There was a problem saving your energy plan. Please try again.",
        variant: "destructive",
      });
      console.error("Error saving energy plan:", error);
    }
  });

  // Submit handler for the form
  const onSubmit = (values: z.infer<typeof energyTrackingSchema>) => {
    if (!session?.user?.id) {
      toast({
        title: "Authentication required",
        description: "Please sign in to track your energy levels.",
        variant: "destructive",
      });
      return;
    }
    createEnergyLogMutation.mutate(values);
  };

  // Submit handler for energy plan
  const onPlanSubmit = (values: z.infer<typeof energyPlanSchema>) => {
    if (!session?.user?.id) {
      toast({
        title: "Authentication required",
        description: "Please sign in to save your energy plan.",
        variant: "destructive",
      });
      return;
    }
    updateEnergyPlanMutation.mutate(values);
  };

  // Transform data for charts
  const chartData = energyLogs?.map(log => ({
    date: format(new Date(log.timestamp), 'MM/dd'),
    energyLevel: log.energy_level,
    timeOfDay: log.time_of_day,
    caffeine: log.caffeine_consumed ? log.caffeine_amount_mg : 0,
    sleep: log.sleep_hours,
    exercise: log.physical_activity ? 1 : 0
  })) || [];

  // Time of day distribution
  const timeOfDayData = !energyLogs ? [] : [
    { name: 'Morning', value: energyLogs.filter(log => log.time_of_day === 'morning').length },
    { name: 'Afternoon', value: energyLogs.filter(log => log.time_of_day === 'afternoon').length },
    { name: 'Evening', value: energyLogs.filter(log => log.time_of_day === 'evening').length },
    { name: 'Night', value: energyLogs.filter(log => log.time_of_day === 'night').length }
  ];

  // Calculate averages
  const averageEnergyLevel = !energyLogs?.length ? 0 : 
    energyLogs.reduce((sum, log) => sum + log.energy_level, 0) / energyLogs.length;
  
  const averageSleepHours = !energyLogs?.length ? 0 : 
    energyLogs.reduce((sum, log) => sum + log.sleep_hours, 0) / energyLogs.length;

  // Factor correlation data
  const energyByFactors = [
    { 
      name: 'With Caffeine', 
      value: !energyLogs?.length ? 0 : 
        energyLogs.filter(log => log.caffeine_consumed)
          .reduce((sum, log) => sum + log.energy_level, 0) / 
          (energyLogs.filter(log => log.caffeine_consumed).length || 1)
    },
    { 
      name: 'Without Caffeine', 
      value: !energyLogs?.length ? 0 : 
        energyLogs.filter(log => !log.caffeine_consumed)
          .reduce((sum, log) => sum + log.energy_level, 0) / 
          (energyLogs.filter(log => !log.caffeine_consumed).length || 1)
    },
    { 
      name: 'With Exercise', 
      value: !energyLogs?.length ? 0 : 
        energyLogs.filter(log => log.physical_activity)
          .reduce((sum, log) => sum + log.energy_level, 0) / 
          (energyLogs.filter(log => log.physical_activity).length || 1)
    },
    { 
      name: 'Without Exercise', 
      value: !energyLogs?.length ? 0 : 
        energyLogs.filter(log => !log.physical_activity)
          .reduce((sum, log) => sum + log.energy_level, 0) / 
          (energyLogs.filter(log => !log.physical_activity).length || 1)
    }
  ];

  // Generate personalized recommendations based on user data
  const getEnergyRecommendations = () => {
    if (!energyLogs || energyLogs.length < 3) {
      return [
        "Track your energy for at least 3 days to receive personalized recommendations",
        "Try to be consistent with your tracking time to improve pattern recognition"
      ];
    }

    const recommendations: string[] = [];
    
    // Check for caffeine dependency
    const caffeineEntries = energyLogs.filter(log => log.caffeine_consumed);
    const nonCaffeineEntries = energyLogs.filter(log => !log.caffeine_consumed);
    
    if (caffeineEntries.length > 0 && nonCaffeineEntries.length > 0) {
      const avgWithCaffeine = caffeineEntries.reduce((sum, log) => sum + log.energy_level, 0) / caffeineEntries.length;
      const avgWithoutCaffeine = nonCaffeineEntries.reduce((sum, log) => sum + log.energy_level, 0) / nonCaffeineEntries.length;
      
      if (avgWithCaffeine - avgWithoutCaffeine > 2) {
        recommendations.push("You show strong energy dependence on caffeine. Consider gradually reducing intake to build natural energy.");
      }
    }
    
    // Check sleep correlation
    const lowEnergy = energyLogs.filter(log => log.energy_level < 5);
    const avgSleepLowEnergy = lowEnergy.length ? lowEnergy.reduce((sum, log) => sum + log.sleep_hours, 0) / lowEnergy.length : 0;
    
    if (lowEnergy.length > 0 && avgSleepLowEnergy < 6) {
      recommendations.push("Low energy days correlate with less sleep. Try to maintain 7-8 hours of sleep consistently.");
    }
    
    // Check exercise impact
    const withExercise = energyLogs.filter(log => log.physical_activity);
    const withoutExercise = energyLogs.filter(log => !log.physical_activity);
    
    if (withExercise.length > 0 && withoutExercise.length > 0) {
      const avgWithExercise = withExercise.reduce((sum, log) => sum + log.energy_level, 0) / withExercise.length;
      const avgWithoutExercise = withoutExercise.reduce((sum, log) => sum + log.energy_level, 0) / withoutExercise.length;
      
      if (avgWithExercise > avgWithoutExercise) {
        recommendations.push(`Exercise is boosting your energy by approximately ${((avgWithExercise - avgWithoutExercise) / 10 * 100).toFixed(0)}%. Try to incorporate at least 20 minutes daily.`);
      }
    }
    
    // Check best time of day
    const timeOfDayAvg: Record<string, number> = {
      morning: 0,
      afternoon: 0,
      evening: 0,
      night: 0
    };
    
    const timeOfDayCount: Record<string, number> = {
      morning: 0,
      afternoon: 0,
      evening: 0,
      night: 0
    };
    
    energyLogs.forEach(log => {
      timeOfDayAvg[log.time_of_day] += log.energy_level;
      timeOfDayCount[log.time_of_day]++;
    });
    
    const timeOfDayAverages = Object.keys(timeOfDayAvg).map(key => ({
      time: key,
      avg: timeOfDayCount[key] > 0 
        ? timeOfDayAvg[key] / timeOfDayCount[key] 
        : 0
    }));
    
    const bestTimeOfDay = timeOfDayAverages.reduce((best, current) => 
      current.avg > best.avg ? current : best, { time: '', avg: 0 }
    );
    
    if (bestTimeOfDay.time && bestTimeOfDay.avg > 0) {
      recommendations.push(`Your energy peaks during the ${bestTimeOfDay.time}. Schedule important tasks or challenging activities during this time.`);
    }
    
    // Add specific recommendations for quitting smoking
    recommendations.push("During nicotine withdrawal, energy dips are normal. Try 5-minute brisk walks when energy is low.");
    recommendations.push("Drinking water can help maintain energy levels during cravings - aim for 8 glasses daily.");
    
    return recommendations;
  };

  // Energy tips specifically for quitting smoking
  const energyTips = [
    {
      title: "Morning Routine",
      tips: [
        "Start with 5 minutes of stretching to activate your body",
        "Drink a full glass of water before caffeine to hydrate",
        "Try a cold shower to boost alertness naturally",
        "Eat a protein-rich breakfast to stabilize energy"
      ]
    },
    {
      title: "Afternoon Slump",
      tips: [
        "Take a 10-minute power walk outside during lunch",
        "Try breathing exercises: 4-7-8 breathing pattern",
        "Snack on nuts and fruits instead of sugar",
        "Do desk stretches to improve circulation"
      ]
    },
    {
      title: "Caffeine Management",
      tips: [
        "Limit caffeine to morning hours before 2pm",
        "Gradually reduce intake by 25% each week",
        "Try lower-caffeine alternatives like green tea",
        "Stay hydrated to reduce caffeine dependence"
      ]
    },
    {
      title: "Physical Activity",
      tips: [
        "Short 5-10 minute walks help manage cravings",
        "Aim for 20-30 minutes of moderate exercise daily",
        "Include strength training 2-3 times per week",
        "Try yoga for both energy and stress management"
      ]
    }
  ];

  useEffect(() => {
    if (userId && session) {
      loadEnergyData();
    }
  }, [userId, session, viewMode, selectedDate]);

  const loadEnergyData = async () => {
    try {
      setLoading(true);
      
      // Calculate date range based on view mode
      let startDate: Date, endDate: Date;
      
      if (viewMode === 'day') {
        startDate = selectedDate;
        endDate = selectedDate;
      } else if (viewMode === 'week') {
        startDate = subDays(selectedDate, 6);
        endDate = selectedDate;
      } else {
        startDate = subDays(selectedDate, 29);
        endDate = selectedDate;
      }
      
      // Format dates for API
      const formattedStartDate = format(startDate, 'yyyy-MM-dd');
      const formattedEndDate = format(endDate, 'yyyy-MM-dd');
      
      // In a real implementation, we would call an API here
      // For this demo, we'll generate mock data
      const mockEntries: EnergyEntry[] = [];
      
      // Generate entries for the date range
      let currentDate = startDate;
      while (currentDate <= endDate) {
        // 80% chance of having an entry for this day
        if (Math.random() < 0.8) {
          // Random energy level between 1-10
          const randomLevel = Math.floor(Math.random() * 10) + 1;
          
          mockEntries.push({
            date: format(currentDate, 'yyyy-MM-dd'),
            level: randomLevel,
            note: Math.random() < 0.3 ? 'Note for this day...' : undefined
          });
        }
        
        currentDate = addDays(currentDate, 1);
      }
      
      setEnergyEntries(mockEntries);
      
      // Check if we have an energy entry for today
      const today = format(new Date(), 'yyyy-MM-dd');
      const todayEntry = mockEntries.find(entry => entry.date === today);
      
      if (todayEntry) {
        setCurrentLevel(todayEntry.level);
        setEnergyNote(todayEntry.note || '');
      } else {
        setCurrentLevel(5);
        setEnergyNote('');
      }
    } catch (error) {
      console.error('Error loading energy data:', error);
    } finally {
      setLoading(false);
    }
  };

  const handleLevelSelection = (level: number) => {
    setCurrentLevel(level);
  };

  const handleSaveEnergy = async () => {
    try {
      // In a real app, this would save to the API
      const today = format(new Date(), 'yyyy-MM-dd');
      
      // Check if there's already an entry for today
      const existingEntryIndex = energyEntries.findIndex(entry => entry.date === today);
      
      if (existingEntryIndex >= 0) {
        // Update existing entry
        const updatedEntries = [...energyEntries];
        updatedEntries[existingEntryIndex] = {
          ...updatedEntries[existingEntryIndex],
          level: currentLevel,
          note: energyNote || undefined
        };
        
        setEnergyEntries(updatedEntries);
      } else {
        // Add new entry
        setEnergyEntries([
          ...energyEntries,
          {
            date: today,
            level: currentLevel,
            note: energyNote || undefined
          }
        ]);
      }
      
      setShowAddForm(false);
    } catch (error) {
      console.error('Error saving energy level:', error);
    }
  };

  const getEnergyIcon = (level: number, size: number = 5) => {
    if (level >= 8) {
      return <BatteryFull className={`h-${size} w-${size} text-green-500`} />;
    } else if (level >= 6) {
      return <BatteryCharging className={`h-${size} w-${size} text-green-400`} />;
    } else if (level >= 4) {
      return <BatteryMedium className={`h-${size} w-${size} text-yellow-500`} />;
    } else if (level >= 2) {
      return <BatteryLow className={`h-${size} w-${size} text-orange-500`} />;
    } else {
      return <Battery className={`h-${size} w-${size} text-red-500`} />;
    }
  };

  const getEnergyText = (level: number) => {
    if (level >= 9) return 'Excellent';
    if (level >= 7) return 'Very Good';
    if (level >= 5) return 'Good';
    if (level >= 3) return 'Low';
    return 'Very Low';
  };

  const getAverageEnergyLevel = () => {
    if (energyEntries.length === 0) return 0;
    
    const total = energyEntries.reduce((sum, entry) => sum + entry.level, 0);
    return total / energyEntries.length;
  };

  const getEnergyTrend = () => {
    if (energyEntries.length < 2) return 'stable';
    
    // Sort entries by date
    const sortedEntries = [...energyEntries].sort((a, b) => {
      return parseISO(a.date).getTime() - parseISO(b.date).getTime();
    });
    
    // Split into two halves and compare averages
    const halfLength = Math.floor(sortedEntries.length / 2);
    const firstHalf = sortedEntries.slice(0, halfLength);
    const secondHalf = sortedEntries.slice(halfLength);
    
    const firstAvg = firstHalf.reduce((sum, entry) => sum + entry.level, 0) / firstHalf.length;
    const secondAvg = secondHalf.reduce((sum, entry) => sum + entry.level, 0) / secondHalf.length;
    
    const difference = secondAvg - firstAvg;
    
    if (difference > 0.5) return 'improving';
    if (difference < -0.5) return 'declining';
    return 'stable';
  };

  const renderEnergyCalendar = () => {
    // Generate dates for the view
    let dates: Date[] = [];
    
    if (viewMode === 'day') {
      dates = [selectedDate];
    } else if (viewMode === 'week') {
      dates = Array.from({ length: 7 }, (_, i) => subDays(selectedDate, 6 - i));
    } else {
      dates = Array.from({ length: 30 }, (_, i) => subDays(selectedDate, 29 - i));
    }
    
    return (
      <div className="mt-4">
        {viewMode === 'day' ? (
          // Single day view
          <div className="bg-gray-50 rounded-lg p-4">
            <h3 className="text-lg font-medium mb-2">
              {format(selectedDate, 'EEEE, MMMM d, yyyy')}
            </h3>
            
            {energyEntries.find(entry => entry.date === format(selectedDate, 'yyyy-MM-dd')) ? (
              <div className="flex flex-col mt-2">
                <div className="flex items-center">
                  {getEnergyIcon(energyEntries.find(entry => entry.date === format(selectedDate, 'yyyy-MM-dd'))!.level)}
                  <span className="ml-2 font-medium">
                    {getEnergyText(energyEntries.find(entry => entry.date === format(selectedDate, 'yyyy-MM-dd'))!.level)}
                  </span>
                </div>
                <div className="mt-2">
                  <Progress 
                    value={energyEntries.find(entry => entry.date === format(selectedDate, 'yyyy-MM-dd'))!.level * 10} 
                    className="h-2" 
                  />
                </div>
                {energyEntries.find(entry => entry.date === format(selectedDate, 'yyyy-MM-dd'))!.note && (
                  <div className="mt-2 text-sm text-gray-600">
                    {energyEntries.find(entry => entry.date === format(selectedDate, 'yyyy-MM-dd'))!.note}
                  </div>
                )}
              </div>
            ) : (
              <div className="text-gray-500">No energy data for this day</div>
            )}
          </div>
        ) : (
          // Week or month view
          <div className="grid grid-cols-7 gap-1 mt-2">
            {/* Day headers for week/month view */}
            {['Sun', 'Mon', 'Tue', 'Wed', 'Thu', 'Fri', 'Sat'].map((day, i) => (
              <div key={`header-${i}`} className="text-xs text-center font-medium text-gray-500">
                {day}
              </div>
            ))}
            
            {/* Fill in any empty days at the start to align with weekdays */}
            {viewMode === 'month' && Array.from({ length: dates[0].getDay() }, (_, i) => (
              <div key={`empty-start-${i}`} className="aspect-square"></div>
            ))}
            
            {/* Render calendar days */}
            {dates.map((date, i) => {
              const dateStr = format(date, 'yyyy-MM-dd');
              const entry = energyEntries.find(entry => entry.date === dateStr);
              const isToday = dateStr === format(new Date(), 'yyyy-MM-dd');
              
              return (
                <div 
                  key={`day-${i}`}
                  className={`aspect-square p-1 border rounded-md flex flex-col items-center justify-center cursor-pointer hover:bg-gray-50 ${isToday ? 'border-primary' : 'border-gray-200'}`}
                  onClick={() => setSelectedDate(date)}
                >
                  <div className={`text-xs ${isToday ? 'font-bold text-primary' : 'text-gray-700'}`}>
                    {format(date, 'd')}
                  </div>
                  {entry && (
                    <div className="mt-1">
                      {getEnergyIcon(entry.level, 4)}
                    </div>
                  )}
                </div>
              );
            })}
            
            {/* Fill in any empty days at the end to complete the grid */}
            {viewMode === 'month' && Array.from({ length: 6 - dates[dates.length - 1].getDay() }, (_, i) => (
              <div key={`empty-end-${i}`} className="aspect-square"></div>
            ))}
          </div>
        )}
      </div>
    );
  };

  const renderEnergyForm = () => {
    return (
      <div className="mt-4 bg-white p-4 rounded-lg border">
        <h3 className="font-medium mb-3">How's your energy level today?</h3>
        
        <div className="space-y-4">
          <div className="flex justify-between">
            <span className="text-sm text-gray-500">Low</span>
            <span className="text-sm text-gray-500">High</span>
          </div>
          
          <div className="grid grid-cols-10 gap-1">
            {[1, 2, 3, 4, 5, 6, 7, 8, 9, 10].map(level => (
              <button
                key={level}
                className={`p-2 rounded ${currentLevel === level ? 'bg-blue-100 ring-2 ring-blue-400' : 'bg-gray-100 hover:bg-gray-200'}`}
                onClick={() => handleLevelSelection(level)}
              >
                {level}
              </button>
            ))}
          </div>
          
          <div className="flex items-center justify-center mt-2">
            {getEnergyIcon(currentLevel)}
            <span className="ml-2 font-medium">{getEnergyText(currentLevel)}</span>
          </div>
        </div>
        
        <div className="mt-4 mb-4">
          <label className="block text-sm font-medium text-gray-700 mb-1">
            Notes (optional)
          </label>
          <textarea
            className="w-full p-2 border rounded-md"
            rows={2}
            value={energyNote}
            onChange={e => setEnergyNote(e.target.value)}
            placeholder="Any notes about your energy levels today?"
          />
        </div>
        
        <div className="flex justify-end space-x-2">
          <Button 
            variant="outline"
            onClick={() => setShowAddForm(false)}
          >
            Cancel
          </Button>
          <Button
            onClick={handleSaveEnergy}
          >
            Save
          </Button>
        </div>
      </div>
    );
  };

  const renderEnergySummary = () => {
    const averageLevel = getAverageEnergyLevel();
    const trend = getEnergyTrend();
    
    return (
      <div className="bg-yellow-50 rounded-lg p-4 mb-4">
        <div className="flex justify-between">
          <div>
            <h3 className="text-yellow-800 font-medium">Average Energy</h3>
            <div className="flex items-center mt-1">
              {getEnergyIcon(Math.round(averageLevel))}
              <span className="text-xl font-bold text-yellow-900 ml-1">
                {averageLevel.toFixed(1)}
              </span>
              <span className="text-sm text-yellow-700 ml-1">/10</span>
            </div>
          </div>
          
          <div className="text-right">
            <h3 className="text-yellow-800 font-medium">Trend</h3>
            <p className={`text-sm font-medium ${
              trend === 'improving' ? 'text-green-600' :
              trend === 'declining' ? 'text-red-600' :
              'text-yellow-600'
            }`}>
              {trend === 'improving' ? '↗ Improving' :
               trend === 'declining' ? '↘ Declining' :
               '→ Stable'}
            </p>
          </div>
        </div>
        
        <div className="mt-3">
          <div className="text-xs text-yellow-700 mb-1">Energy level distribution</div>
          <div className="flex h-4 overflow-hidden rounded-full bg-gray-200">
            <div className="bg-red-500" style={{ width: `${energyEntries.filter(e => e.level <= 2).length / energyEntries.length * 100}%` }}></div>
            <div className="bg-orange-500" style={{ width: `${energyEntries.filter(e => e.level > 2 && e.level <= 4).length / energyEntries.length * 100}%` }}></div>
            <div className="bg-yellow-500" style={{ width: `${energyEntries.filter(e => e.level > 4 && e.level <= 6).length / energyEntries.length * 100}%` }}></div>
            <div className="bg-green-400" style={{ width: `${energyEntries.filter(e => e.level > 6 && e.level <= 8).length / energyEntries.length * 100}%` }}></div>
            <div className="bg-green-600" style={{ width: `${energyEntries.filter(e => e.level > 8).length / energyEntries.length * 100}%` }}></div>
          </div>
        </div>
      </div>
    );
  };

  return (
    <Card className="w-full">
      <CardHeader>
        <CardTitle className="flex items-center gap-2">
          <Battery className="h-5 w-5 text-yellow-500" />
          Energy Tracker
        </CardTitle>
        <CardDescription>
          Track your energy levels and identify patterns related to your quit journey
        </CardDescription>
      </CardHeader>
      <CardContent>
        <Tabs value={currentTab} onValueChange={setCurrentTab}>
          <TabsList className="grid w-full grid-cols-4">
            <TabsTrigger value="track">Track</TabsTrigger>
            <TabsTrigger value="history">History</TabsTrigger>
            <TabsTrigger value="insights">Insights</TabsTrigger>
            <TabsTrigger value="plan">My Plan</TabsTrigger>
          </TabsList>
          
          <TabsContent value="track" className="pt-4">
            <Form {...form}>
              <form onSubmit={form.handleSubmit(onSubmit)} className="space-y-6">
                <FormField
                  control={form.control}
                  name="energyLevel"
                  render={({ field }) => (
                    <FormItem className="space-y-3">
                      <div className="flex justify-between">
                        <FormLabel>Energy Level</FormLabel>
                        <span className="text-sm text-muted-foreground">{field.value}/10</span>
                      </div>
                      <FormControl>
                        <Slider
                          min={1}
                          max={10}
                          step={1}
                          value={[field.value]}
                          onValueChange={(value) => field.onChange(value[0])}
                        />
                      </FormControl>
                      <div className="flex justify-between text-xs text-muted-foreground">
                        <span>Low</span>
                        <span>High</span>
                      </div>
                      <FormMessage />
                    </FormItem>
                  )}
                />
                
                <FormField
                  control={form.control}
                  name="timeOfDay"
                  render={({ field }) => (
                    <FormItem>
                      <FormLabel>Time of Day</FormLabel>
                      <Select 
                        onValueChange={field.onChange} 
                        defaultValue={field.value}
                      >
                        <FormControl>
                          <SelectTrigger>
                            <SelectValue placeholder="Select time of day" />
                          </SelectTrigger>
                        </FormControl>
                        <SelectContent>
                          <SelectItem value="morning">Morning</SelectItem>
                          <SelectItem value="afternoon">Afternoon</SelectItem>
                          <SelectItem value="evening">Evening</SelectItem>
                          <SelectItem value="night">Night</SelectItem>
                        </SelectContent>
                      </Select>
                      <FormMessage />
                    </FormItem>
                  )}
                />
                
                <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                  <FormField
                    control={form.control}
                    name="caffeineConsumed"
                    render={({ field }) => (
                      <FormItem className="flex flex-row items-center justify-between rounded-lg border p-4">
                        <div className="space-y-0.5">
                          <FormLabel className="text-base flex items-center gap-2">
                            <Coffee className="h-4 w-4 text-muted-foreground" />
                            Caffeine Consumed
                          </FormLabel>
                          <FormDescription>
                            Did you consume caffeine today?
                          </FormDescription>
                        </div>
                        <FormControl>
                          <Switch
                            checked={field.value}
                            onCheckedChange={field.onChange}
                          />
                        </FormControl>
                      </FormItem>
                    )}
                  />
                  
                  {form.watch('caffeineConsumed') && (
                    <FormField
                      control={form.control}
                      name="caffeineAmountMg"
                      render={({ field }) => (
                        <FormItem>
                          <FormLabel>Caffeine Amount (mg)</FormLabel>
                          <FormControl>
                            <Input
                              type="number"
                              {...field}
                              onChange={(e) => field.onChange(Number(e.target.value))}
                            />
                          </FormControl>
                          <FormDescription>
                            Cup of coffee ≈ 100mg, Espresso ≈ 75mg, Tea ≈ 50mg
                          </FormDescription>
                          <FormMessage />
                        </FormItem>
                      )}
                    />
                  )}
                </div>
                
                <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                  <FormField
                    control={form.control}
                    name="physicalActivity"
                    render={({ field }) => (
                      <FormItem className="flex flex-row items-center justify-between rounded-lg border p-4">
                        <div className="space-y-0.5">
                          <FormLabel className="text-base flex items-center gap-2">
                            <Dumbbell className="h-4 w-4 text-muted-foreground" />
                            Physical Activity
                          </FormLabel>
                          <FormDescription>
                            Did you exercise today?
                          </FormDescription>
                        </div>
                        <FormControl>
                          <Switch
                            checked={field.value}
                            onCheckedChange={field.onChange}
                          />
                        </FormControl>
                      </FormItem>
                    )}
                  />
                  
                  <FormField
                    control={form.control}
                    name="sleepHours"
                    render={({ field }) => (
                      <FormItem>
                        <FormLabel>Sleep Hours</FormLabel>
                        <FormControl>
                          <Input
                            type="number"
                            step="0.5"
                            {...field}
                            onChange={(e) => field.onChange(Number(e.target.value))}
                          />
                        </FormControl>
                        <FormMessage />
                      </FormItem>
                    )}
                  />
                </div>
                
                <FormField
                  control={form.control}
                  name="notes"
                  render={({ field }) => (
                    <FormItem>
                      <FormLabel>Notes</FormLabel>
                      <FormControl>
                        <Textarea 
                          placeholder="Any additional notes about your energy levels today..." 
                          className="resize-none" 
                          {...field} 
                        />
                      </FormControl>
                      <FormMessage />
                    </FormItem>
                  )}
                />
                
                <Button 
                  type="submit" 
                  className="w-full"
                  disabled={createEnergyLogMutation.isPending}
                >
                  {createEnergyLogMutation.isPending ? "Saving..." : "Save Energy Log"}
                </Button>
              </form>
            </Form>
          </TabsContent>
          
          <TabsContent value="history" className="pt-4">
            {isLoading ? (
              <div className="flex justify-center py-10">
                <div className="animate-spin">
                  <Info className="h-6 w-6 text-muted-foreground" />
                </div>
              </div>
            ) : !energyLogs?.length ? (
              <div className="text-center py-10">
                <h3 className="text-lg font-medium">No Energy Logs Yet</h3>
                <p className="text-sm text-muted-foreground mt-2">
                  Start tracking your energy levels to see your history here.
                </p>
              </div>
            ) : (
              <div className="space-y-6">
                <div className="h-[300px]">
                  <ResponsiveContainer width="100%" height="100%">
                    <LineChart data={chartData.reverse()}>
                      <CartesianGrid strokeDasharray="3 3" />
                      <XAxis dataKey="date" />
                      <YAxis domain={[0, 10]} />
                      <Tooltip />
                      <Line 
                        type="monotone" 
                        dataKey="energyLevel" 
                        stroke="#FFC53D" 
                        strokeWidth={2}
                        name="Energy Level"
                      />
                      <Line 
                        type="monotone" 
                        dataKey="sleep" 
                        stroke="#38BDF8" 
                        strokeWidth={2}
                        name="Sleep Hours"
                      />
                    </LineChart>
                  </ResponsiveContainer>
                </div>
                
                <div className="space-y-4">
                  <h3 className="text-lg font-medium">Recent Logs</h3>
                  <div className="space-y-4">
                    {energyLogs.slice(0, 5).map((log) => (
                      <div key={log.id} className="rounded-lg border p-4">
                        <div className="flex justify-between items-start mb-2">
                          <div className="flex items-center gap-2">
                            <Battery className="h-5 w-5 text-yellow-500" />
                            <span className="font-medium">Energy Level: {log.energy_level}/10</span>
                          </div>
                          <span className="text-sm text-muted-foreground">
                            {format(new Date(log.timestamp), 'MMM d, yyyy h:mm a')}
                          </span>
                        </div>
                        <div className="grid grid-cols-2 gap-2 text-sm">
                          <div className="flex items-center gap-1">
                            <Moon className="h-4 w-4 text-muted-foreground" />
                            <span>{log.sleep_hours} hours sleep</span>
                          </div>
                          <div className="flex items-center gap-1">
                            <Coffee className="h-4 w-4 text-muted-foreground" />
                            <span>{log.caffeine_consumed ? `${log.caffeine_amount_mg}mg caffeine` : 'No caffeine'}</span>
                          </div>
                          <div className="flex items-center gap-1">
                            <Sun className="h-4 w-4 text-muted-foreground" />
                            <span>{log.time_of_day}</span>
                          </div>
                          <div className="flex items-center gap-1">
                            <Dumbbell className="h-4 w-4 text-muted-foreground" />
                            <span>{log.physical_activity ? 'Exercised' : 'No exercise'}</span>
                          </div>
                        </div>
                        {log.notes && (
                          <div className="mt-2 text-sm">
                            <p className="text-muted-foreground">{log.notes}</p>
                          </div>
                        )}
                      </div>
                    ))}
                  </div>
                </div>
              </div>
            )}
          </TabsContent>
          
          <TabsContent value="insights" className="pt-4">
            {isLoading ? (
              <div className="flex justify-center py-10">
                <div className="animate-spin">
                  <Info className="h-6 w-6 text-muted-foreground" />
                </div>
              </div>
            ) : !energyLogs?.length ? (
              <div className="text-center py-10">
                <h3 className="text-lg font-medium">No Energy Data Yet</h3>
                <p className="text-sm text-muted-foreground mt-2">
                  Track your energy levels to unlock personalized insights.
                </p>
              </div>
            ) : (
              <div className="space-y-6">
                <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                  <div className="rounded-lg border p-4">
                    <h3 className="text-sm font-medium mb-3">Average Energy Level</h3>
                    <div className="flex items-center gap-2">
                      <Battery className="h-5 w-5 text-yellow-500" />
                      <span className="text-2xl font-bold">{averageEnergyLevel.toFixed(1)}/10</span>
                    </div>
                  </div>
                  
                  <div className="rounded-lg border p-4">
                    <h3 className="text-sm font-medium mb-3">Average Sleep Duration</h3>
                    <div className="flex items-center gap-2">
                      <Moon className="h-5 w-5 text-blue-500" />
                      <span className="text-2xl font-bold">{averageSleepHours.toFixed(1)} hours</span>
                    </div>
                  </div>
                </div>
                
                <div className="space-y-4">
                  <h3 className="text-lg font-medium">Energy By Factors</h3>
                  <div className="h-[250px]">
                    <ResponsiveContainer width="100%" height="100%">
                      <BarChart data={energyByFactors}>
                        <CartesianGrid strokeDasharray="3 3" />
                        <XAxis dataKey="name" />
                        <YAxis domain={[0, 10]} />
                        <Tooltip />
                        <Bar dataKey="value" fill="#FFC53D" name="Average Energy Level" />
                      </BarChart>
                    </ResponsiveContainer>
                  </div>
                </div>
                
                <div className="space-y-4">
                  <h3 className="text-lg font-medium">Time of Day Distribution</h3>
                  <div className="h-[250px]">
                    <ResponsiveContainer width="100%" height="100%">
                      <BarChart data={timeOfDayData}>
                        <CartesianGrid strokeDasharray="3 3" />
                        <XAxis dataKey="name" />
                        <YAxis />
                        <Tooltip />
                        <Bar dataKey="value" fill="#38BDF8" name="Number of Entries" />
                      </BarChart>
                    </ResponsiveContainer>
                  </div>
                </div>
                
                <div className="rounded-lg border p-4">
                  <h3 className="text-lg font-medium mb-4">Key Insights</h3>
                  <ul className="space-y-3">
                    {averageSleepHours < 7 && (
                      <li className="flex items-start gap-2">
                        <Info className="h-5 w-5 text-blue-500 mt-0.5" />
                        <div>
                          <p className="font-medium">Sleep May Be Affecting Your Energy</p>
                          <p className="text-sm text-muted-foreground">Your average sleep is {averageSleepHours.toFixed(1)} hours, which is below the recommended 7-9 hours.</p>
                        </div>
                      </li>
                    )}
                    
                    {energyByFactors[0].value > energyByFactors[1].value && (
                      <li className="flex items-start gap-2">
                        <Info className="h-5 w-5 text-yellow-500 mt-0.5" />
                        <div>
                          <p className="font-medium">Caffeine May Be Boosting Your Energy</p>
                          <p className="text-sm text-muted-foreground">Your energy levels are higher on days when you consume caffeine.</p>
                        </div>
                      </li>
                    )}
                    
                    {energyByFactors[2].value > energyByFactors[3].value && (
                      <li className="flex items-start gap-2">
                        <Info className="h-5 w-5 text-green-500 mt-0.5" />
                        <div>
                          <p className="font-medium">Exercise Has a Positive Impact</p>
                          <p className="text-sm text-muted-foreground">Your energy levels are higher on days when you exercise.</p>
                        </div>
                      </li>
                    )}
                    
                    {/* Always show this tip */}
                    <li className="flex items-start gap-2">
                      <Info className="h-5 w-5 text-purple-500 mt-0.5" />
                      <div>
                        <p className="font-medium">Your Most Energetic Time</p>
                        <p className="text-sm text-muted-foreground">
                          Based on your logs, your energy tends to be highest during the 
                          {timeOfDayData.sort((a, b) => b.value - a.value)[0]?.name.toLowerCase() || 'day'}.
                        </p>
                      </div>
                    </li>
                  </ul>
                </div>
              </div>
            )}
          </TabsContent>
          
          <TabsContent value="plan" className="pt-4">
            <div className="grid gap-6">
              <div className="flex items-start gap-4">
                <div className="p-3 bg-yellow-50 rounded-lg">
                  <Battery className="h-10 w-10 text-yellow-500" />
                </div>
                <div>
                  <h3 className="text-lg font-medium">Your Energy Management Plan</h3>
                  <p className="text-sm text-muted-foreground">
                    Create a personalized plan to manage your energy levels during your quit journey
                  </p>
                </div>
              </div>
              
              <div className="border rounded-lg p-4 mb-4">
                <div className="flex justify-between items-center mb-4">
                  <h4 className="font-medium">Energy Tips for Quitting</h4>
                  <Button 
                    variant="ghost"
                    size="sm"
                    onClick={() => setShowEnergyTips(!showEnergyTips)}
                  >
                    {showEnergyTips ? "Hide Tips" : "Show Tips"}
                  </Button>
                </div>
                
                {showEnergyTips && (
                  <div className="grid grid-cols-1 md:grid-cols-2 gap-4 mt-2">
                    {energyTips.map((section, i) => (
                      <div key={i} className="border rounded p-3 bg-muted/30">
                        <h5 className="text-sm font-medium mb-2">{section.title}</h5>
                        <ul className="text-sm space-y-1">
                          {section.tips.map((tip, j) => (
                            <li key={j} className="flex items-start gap-2">
                              <div className="rounded-full bg-green-100 p-1 mt-0.5">
                                <Check className="h-3 w-3 text-green-600" />
                              </div>
                              <span>{tip}</span>
                            </li>
                          ))}
                        </ul>
                      </div>
                    ))}
                  </div>
                )}
              </div>
              
              <Form {...planForm}>
                <form onSubmit={planForm.handleSubmit(onPlanSubmit)} className="space-y-6">
                  <div className="grid md:grid-cols-2 gap-6">
                    <FormField
                      control={planForm.control}
                      name="morningRoutine"
                      render={({ field }) => (
                        <FormItem>
                          <FormLabel>Morning Routine</FormLabel>
                          <FormControl>
                            <Textarea
                              placeholder="What activities will you do each morning to boost energy?"
                              {...field}
                            />
                          </FormControl>
                          <FormDescription>
                            Include hydration, movement, and nutrition elements
                          </FormDescription>
                          <FormMessage />
                        </FormItem>
                      )}
                    />
                    
                    <FormField
                      control={planForm.control}
                      name="afternoonBoost"
                      render={({ field }) => (
                        <FormItem>
                          <FormLabel>Afternoon Energy Boost</FormLabel>
                          <FormControl>
                            <Textarea
                              placeholder="How will you combat the afternoon energy slump?"
                              {...field}
                            />
                          </FormControl>
                          <FormDescription>
                            Strategies for when cravings and fatigue often peak
                          </FormDescription>
                          <FormMessage />
                        </FormItem>
                      )}
                    />
                    
                    <FormField
                      control={planForm.control}
                      name="eveningWindDown"
                      render={({ field }) => (
                        <FormItem>
                          <FormLabel>Evening Wind-Down</FormLabel>
                          <FormControl>
                            <Textarea
                              placeholder="How will you prepare for restful sleep?"
                              {...field}
                            />
                          </FormControl>
                          <FormDescription>
                            Quality sleep is crucial for energy during quit
                          </FormDescription>
                          <FormMessage />
                        </FormItem>
                      )}
                    />
                    
                    <FormField
                      control={planForm.control}
                      name="caffeineStrategy"
                      render={({ field }) => (
                        <FormItem>
                          <FormLabel>Caffeine Management</FormLabel>
                          <FormControl>
                            <Textarea
                              placeholder="How will you manage caffeine intake during quitting?"
                              {...field}
                            />
                          </FormControl>
                          <FormDescription>
                            Caffeine can affect nicotine cravings and sleep
                          </FormDescription>
                          <FormMessage />
                        </FormItem>
                      )}
                    />
                  </div>
                  
                  <FormField
                    control={planForm.control}
                    name="exerciseCommitment"
                    render={({ field }) => (
                      <FormItem>
                        <FormLabel>Exercise Commitment</FormLabel>
                        <FormControl>
                          <Textarea
                            placeholder="What type of physical activity will you commit to?"
                            {...field}
                          />
                        </FormControl>
                        <FormDescription>
                          Exercise helps manage cravings and improves energy
                        </FormDescription>
                        <FormMessage />
                      </FormItem>
                    )}
                  />
                  
                  <FormField
                    control={planForm.control}
                    name="enabled"
                    render={({ field }) => (
                      <FormItem className="flex flex-row items-center justify-between rounded-lg border p-4">
                        <div className="space-y-0.5">
                          <FormLabel className="text-base">
                            Enable Reminders
                          </FormLabel>
                          <FormDescription>
                            Receive notifications based on your energy plan
                          </FormDescription>
                        </div>
                        <FormControl>
                          <Switch
                            checked={field.value}
                            onCheckedChange={field.onChange}
                          />
                        </FormControl>
                      </FormItem>
                    )}
                  />
                  
                  <Button type="submit" className="w-full">
                    Save Energy Plan
                  </Button>
                </form>
              </Form>
            </div>
          </TabsContent>
        </Tabs>
      </CardContent>
      
      {currentTab === 'insights' && (
        <CardFooter className="flex flex-col border-t pt-6">
          <div className="space-y-4 w-full">
            <h3 className="text-sm font-medium">Personalized Recommendations</h3>
            <div className="grid gap-2">
              {getEnergyRecommendations().map((recommendation, index) => (
                <div key={index} className="flex items-start gap-3 p-3 bg-muted/30 rounded-lg">
                  <Info className="h-5 w-5 text-blue-500 mt-0.5 flex-shrink-0" />
                  <p className="text-sm">{recommendation}</p>
                </div>
              ))}
            </div>
          </div>
        </CardFooter>
      )}
    </Card>
  );
}; 