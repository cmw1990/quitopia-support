import React, { useState, useEffect, useRef } from 'react';
import { useAuth } from '@/components/AuthProvider';
import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
  CardFooter
} from '@/components/ui/card';
import {
  Tabs,
  TabsContent,
  TabsList,
  TabsTrigger
} from '@/components/ui/tabs';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Textarea } from '@/components/ui/textarea';
import { Slider } from '@/components/ui/slider';
import { RadioGroup, RadioGroupItem } from '@/components/ui/radio-group';
import { Checkbox } from '@/components/ui/checkbox';
import { Badge } from '@/components/ui/badge';
import { 
  Brain, 
  Clock, 
  Calendar, 
  BookOpen, 
  Coffee, 
  AlertCircle, 
  Check, 
  X,
  Info,
  Lightbulb,
  Clock4,
  TrendingUp,
  Zap,
  Target,
  Sparkles,
  Activity,
  BarChart2,
  Smartphone,
  Layers,
  Thermometer,
  PlusCircle,
  Briefcase,
  CheckCircle,
  ArrowLeft,
  ArrowRight
} from 'lucide-react';
import { format, subDays, differenceInDays, isSameDay, parse, startOfDay, endOfDay, isToday } from 'date-fns';
import { toast } from 'sonner';
import { 
  AreaChart, 
  Area, 
  XAxis, 
  YAxis, 
  CartesianGrid, 
  Tooltip, 
  ResponsiveContainer, 
  LineChart, 
  Line, 
  BarChart, 
  Bar, 
  PieChart, 
  Pie, 
  Cell,
  ScatterChart,
  Scatter,
  Radar,
  RadarChart,
  PolarGrid,
  PolarAngleAxis,
  PolarRadiusAxis,
  Legend,
  Brush,
  ReferenceLine
} from 'recharts';
import { supabaseRestCall, getFocusLogs } from "../../api/apiCompatibility";
import { 
  initializeMobileIntegration,
  getMobileFeatureStatus
} from '@/utils/mobileIntegration';
import { motion, AnimatePresence } from 'framer-motion';
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import { useForm } from "react-hook-form";
import { TooltipProvider, TooltipContent, TooltipTrigger } from "@/components/ui/tooltip";
import { EmptyState } from "@/components/ui/empty-state";
import { TrendingUpIcon, TrendingDownIcon, MinusIcon } from "lucide-react";
import { ScrollArea } from "@/components/ui/scroll-area";
import { Progress } from "@/components/ui/progress";
import { Session } from '@supabase/supabase-js';
import { addDays, parseISO } from 'date-fns';
import { useToast } from "@/components/ui/use-toast";
import { hapticFeedback } from '@/utils/hapticFeedback';
import { useSwipeable } from 'react-swipeable';

interface FocusTrackerProps {
  userId?: string;
  session: Session | null;
  className?: string;
  onFocusUpdate?: (focusData: FocusLog) => void;
  onLogsLoaded?: (logs: FocusLog[]) => void;
  compact?: boolean;
}

interface FocusEntry {
  date: string;
  score: number;
  activity?: string;
  duration?: number;
  notes?: string;
}

// Type for focus log entries
interface FocusLog {
  id: string;
  user_id: string;
  timestamp: string;
  focus_level: number;
  duration_minutes: number;
  activity_type: 'work' | 'study' | 'creative' | 'reading' | 'other';
  environment: string[];
  distractions: string[];
  craving_interference: number;
  craving_management_technique?: string;
  notes: string | null;
  created_at: string;
  date: string;
  techniques: string[];
  factors?: string[];
  activities?: string[];
  task_type?: string;
  interruptions?: number;
}

// Interface for best technique result
interface BestTechniqueResult {
  name: string;
  focusAvg: number;
  cravingAvg: number;
}

// Interface for focus trend analysis
interface FocusTrendAnalysis {
  averageFocusLevel: number;
  cravingCorrelation: number; // -1 to
  bestEnvironment: string;
  bestTechnique: BestTechniqueResult;
  distractionFrequency: Record<string, number>;
  focusChangeOverTime: number; // percent change
  techniqueFocusMap: Record<string, number[]>; // Add technique focus map
}

// Time period for analysis
type AnalysisPeriod = 'week' | 'month' | 'all';

// Distraction options
const distractionOptions = [
  { id: 'notifications', label: 'Notifications' },
  { id: 'noise', label: 'Noise' },
  { id: 'social-media', label: 'Social Media' },
  { id: 'people', label: 'People Interruptions' },
  { id: 'cravings', label: 'Nicotine Cravings' },
  { id: 'hunger', label: 'Hunger/Thirst' },
  { id: 'fatigue', label: 'Fatigue' },
  { id: 'anxiety', label: 'Anxiety/Stress' }
];

// Environment options
const environmentOptions = [
  { id: 'home', label: 'Home' },
  { id: 'office', label: 'Office' },
  { id: 'cafe', label: 'Café' },
  { id: 'library', label: 'Library' },
  { id: 'outdoors', label: 'Outdoors' },
  { id: 'commuting', label: 'Commuting' },
  { id: 'quiet', label: 'Quiet Space' },
  { id: 'noisy', label: 'Noisy Environment' }
];

// Craving management techniques
const cravingManagementOptions = [
  { id: 'deep-breathing', label: 'Deep Breathing' },
  { id: 'physical-activity', label: 'Quick Physical Activity' },
  { id: 'nrt', label: 'Nicotine Replacement' },
  { id: 'distraction', label: 'Distraction Technique' },
  { id: 'delay', label: 'Delay Technique' },
  { id: 'hydration', label: 'Drinking Water' },
  { id: 'none', label: 'None Used' }
];

// Helper function to detect mobile devices
const detectMobile = () => {
  return (/Android|webOS|iPhone|iPad|iPod|BlackBerry|IEMobile|Opera Mini/i.test(navigator.userAgent) || (window.innerWidth <= 768));
};

// Custom radar chart data for focus factors
const prepareRadarData = (logs: FocusLog[] | undefined) => {
  if (!logs || logs.length === 0) return [];
  
  // Group by activity type
  const activityGroups = logs.reduce((acc, log) => {
    if (!acc[log.activity_type]) {
      acc[log.activity_type] = { 
        logs: [], 
        avgFocus: 0, 
        avgCraving: 0,
        count: 0 
      };
    }
    acc[log.activity_type].logs.push(log);
    acc[log.activity_type].count += 1;
    return acc;
  }, {} as Record<string, { logs: FocusLog[], avgFocus: number, avgCraving: number, count: number }>);
  
  // Calculate averages
  Object.keys(activityGroups).forEach(key => {
    const group = activityGroups[key];
    group.avgFocus = group.logs.reduce((sum, log) => sum + log.focus_level, 0) / group.count;
    group.avgCraving = group.logs.reduce((sum, log) => sum + log.craving_interference, 0) / group.count;
  });
  
  // Format data for radar chart
  return Object.keys(activityGroups).map(key => ({
    activity: key.charAt(0).toUpperCase() + key.slice(1),
    focus: parseFloat(activityGroups[key].avgFocus.toFixed(1)),
    craving: parseFloat(activityGroups[key].avgCraving.toFixed(1)),
    count: activityGroups[key].count
  }));
};

export function FocusTracker({
  session,
  className = '',
  userId,
  onFocusUpdate,
  onLogsLoaded,
  compact = false
}: FocusTrackerProps) {
  const { session: authSession } = useAuth();
  const [currentTab, setCurrentTab] = useState('track');
  const queryClient = useQueryClient();
  const [analysisPeriod, setAnalysisPeriod] = useState<AnalysisPeriod>('week');
  const [isMobileDevice, setIsMobileDevice] = useState(false);
  const [mobileFeatures, setMobileFeatures] = useState<Record<string, boolean>>({});
  
  // Add missing focusTrends state variable
  const [focusTrends, setFocusTrends] = useState<FocusTrendAnalysis | null>(null);
  
  // Form state
  const [focusLevel, setFocusLevel] = useState(5);
  const [activityDuration, setActivityDuration] = useState(30);
  const [activityType, setActivityType] = useState<'work' | 'study' | 'creative' | 'reading' | 'other'>('work');
  const [selectedEnvironment, setSelectedEnvironment] = useState<string[]>([]);
  const [selectedDistractions, setSelectedDistractions] = useState<string[]>([]);
  const [cravingInterference, setCravingInterference] = useState(0);
  const [cravingManagementTechnique, setCravingManagementTechnique] = useState<string>('none');
  const [notes, setNotes] = useState('');
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [focusEntries, setFocusEntries] = useState<FocusEntry[]>([]);
  const [focusLogs, setFocusLogs] = useState<FocusLog[]>([]);
  const [loading, setLoading] = useState<boolean>(true);
  const [viewMode, setViewMode] = useState<'day' | 'week' | 'month'>('week');
  const [selectedDate, setSelectedDate] = useState<Date>(new Date());
  const [showAddForm, setShowAddForm] = useState<boolean>(false);
  
  // Form state for adding new focus entry
  const [focusScore, setFocusScore] = useState<number>(7);
  const [focusActivity, setFocusActivity] = useState<string>('');
  const [focusDuration, setFocusDuration] = useState<number>(30);
  const [focusNotes, setFocusNotes] = useState<string>('');

  const actualUserId = userId || (session?.user?.id || '');

  // Refs
  const contentRef = useRef<HTMLDivElement>(null);
  
  // Swipe handlers for mobile navigation
  const swipeHandlers = useSwipeable({
    onSwipedLeft: () => {
      handleNextDay();
      hapticFeedback.light();
    },
    onSwipedRight: () => {
      handlePreviousDay();
      hapticFeedback.light();
    },
    preventScrollOnSwipe: true,
    trackMouse: false
  });

  useEffect(() => {
    // Initialize mobile detection and features
    const initMobile = async () => {
      const mobile = detectMobile();
      setIsMobileDevice(mobile);
      
      if (mobile) {
        try {
          await initializeMobileIntegration();
          const features = getMobileFeatureStatus();
          setMobileFeatures(features);
        } catch (err) {
          console.warn('Mobile integration initialization failed:', err);
        }
      }
    };
    
    initMobile();
  }, []);

  useEffect(() => {
    if (userId && session) {
      loadFocusData();
    }
  }, [userId, session, viewMode, selectedDate]);

  // Query to fetch focus logs using REST API
  const { data: focusLogsData, isLoading } = useQuery({
    queryKey: ['focus-logs'],
    queryFn: async () => {
      if (!session?.user?.id) {
        throw new Error("User not authenticated");
      }
      
      const response = await supabaseRestCall<FocusLog[]>(
        `/rest/v1/focus_logs?user_id=eq.${session.user.id}&order=timestamp.desc&limit=100`,
        { method: 'GET' },
        session
      );
      
      return response;
    },
    enabled: !!session?.user?.id,
  });

  // Function to toggle environment selection
  const toggleEnvironment = (environment: string) => {
    if (selectedEnvironment.includes(environment)) {
      setSelectedEnvironment(selectedEnvironment.filter(e => e !== environment));
    } else {
      setSelectedEnvironment([...selectedEnvironment, environment]);
    }
  };

  // Function to toggle distraction selection
  const toggleDistraction = (distraction: string) => {
    if (selectedDistractions.includes(distraction)) {
      setSelectedDistractions(selectedDistractions.filter(d => d !== distraction));
    } else {
      setSelectedDistractions([...selectedDistractions, distraction]);
    }
  };

  // Mutation to save a new focus log using REST API
  const createFocusLogMutation = useMutation({
    mutationFn: async () => {
      if (!session?.user?.id) {
        throw new Error('User not authenticated');
      }

      const data = await supabaseRestCall<FocusLog>(
        '/rest/v1/focus_logs',
        { 
          method: 'POST',
          body: JSON.stringify({
            user_id: session.user.id,
            timestamp: new Date().toISOString(),
            focus_level: focusLevel,
            duration_minutes: activityDuration,
            activity_type: activityType,
            environment: selectedEnvironment,
            distractions: selectedDistractions,
            craving_interference: cravingInterference,
            craving_management_technique: cravingManagementTechnique,
            notes: notes || null
          })
        },
        session
      );
      
      return data;
    },
    onSuccess: () => {
      toast.success('Focus log saved successfully');
      
      // Add haptic feedback for mobile devices if available
      if (isMobileDevice && window.navigator && window.navigator.vibrate) {
        window.navigator.vibrate(200); // 200ms vibration
      }
      
      resetForm();
      queryClient.invalidateQueries({ queryKey: ['focus-logs'] });
    },
    onError: (error) => {
      toast.error('Error saving focus log');
      console.error('Error saving focus log:', error);
    }
  });

  // Function to reset form
  const resetForm = () => {
    setFocusLevel(5);
    setActivityDuration(30);
    setActivityType('work');
    setSelectedEnvironment([]);
    setSelectedDistractions([]);
    setCravingInterference(0);
    setCravingManagementTechnique('none');
    setNotes('');
  };

  // Function to handle form submission
  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (!session?.user?.id) {
      toast.error('Please sign in to track your focus levels');
      return;
    }
    createFocusLogMutation.mutate();
  };

  // Filter logs by analysis period
  const getFilteredLogs = () => {
    if (!focusLogs || focusLogs.length === 0) return [];
    
    const now = new Date();
    
    switch (analysisPeriod) {
      case 'week':
        const oneWeekAgo = subDays(now, 7);
        return focusLogs.filter(log => {
          const logDate = new Date(log.timestamp);
          return logDate >= oneWeekAgo;
        });
      case 'month':
        const oneMonthAgo = subDays(now, 30);
        return focusLogs.filter(log => {
          const logDate = new Date(log.timestamp);
          return logDate >= oneMonthAgo;
        });
      case 'all':
      default:
        return focusLogs;
    }
  };

  // Prepare data for charts
  const filteredLogs = getFilteredLogs();
  const focusChartData = filteredLogs.map(log => ({
    date: format(new Date(log.timestamp), 'MM/dd'),
    focusLevel: log.focus_level,
    duration: log.duration_minutes,
    cravingInterference: log.craving_interference
  })).reverse();

  // Activity type distribution data
  const activityData = !filteredLogs.length ? [] : [
    { name: 'Work', value: filteredLogs.filter(log => log.activity_type === 'work').length },
    { name: 'Study', value: filteredLogs.filter(log => log.activity_type === 'study').length },
    { name: 'Creative', value: filteredLogs.filter(log => log.activity_type === 'creative').length },
    { name: 'Reading', value: filteredLogs.filter(log => log.activity_type === 'reading').length },
    { name: 'Other', value: filteredLogs.filter(log => log.activity_type === 'other').length }
  ].filter(item => item.value > 0);

  // Calculate average focus level
  const averageFocusLevel = !filteredLogs.length ? 0 : 
    filteredLogs.reduce((sum, log) => sum + log.focus_level, 0) / filteredLogs.length;

  // Calculate average craving interference
  const averageCravingInterference = !filteredLogs.length ? 0 : 
    filteredLogs.reduce((sum, log) => sum + log.craving_interference, 0) / filteredLogs.length;

  // Calculate focus trend (are focus levels improving?)
  const calculateFocusTrend = () => {
    if (!filteredLogs || filteredLogs.length < 5) return 'neutral';
    
    const recentLogs = [...filteredLogs].sort((a, b) => 
      new Date(b.timestamp).getTime() - new Date(a.timestamp).getTime()
    ).slice(0, 5);
    
    const olderAvg = recentLogs.slice(2, 5).reduce((sum, log) => sum + log.focus_level, 0) / 3;
    const newerAvg = recentLogs.slice(0, 2).reduce((sum, log) => sum + log.focus_level, 0) / 2;
    
    if (newerAvg - olderAvg > 0.5) return 'improving';
    if (olderAvg - newerAvg > 0.5) return 'declining';
    return 'stable';
  };

  // Calculate most productive environment
  const calculateBestEnvironment = () => {
    if (!filteredLogs || filteredLogs.length < 3) return '';
    
    const envMap = new Map<string, { count: number, totalFocus: number }>();
    
    filteredLogs.forEach(log => {
      log.environment.forEach(env => {
        if (!envMap.has(env)) {
          envMap.set(env, { count: 0, totalFocus: 0 });
        }
        const current = envMap.get(env)!;
        current.count += 1;
        current.totalFocus += log.focus_level;
      });
    });
    
    let bestEnv = '';
    let bestScore = 0;
    
    envMap.forEach((data, env) => {
      if (data.count >= 3) {
        const avgFocus = data.totalFocus / data.count;
        if (avgFocus > bestScore) {
          bestScore = avgFocus;
          bestEnv = env;
        }
      }
    });
    
    return bestEnv;
  };

  // Colors for pie chart
  const COLORS = ['#0088FE', '#00C49F', '#FFBB28', '#FF8042', '#A28BFC'];

  const focusTrend = calculateFocusTrend();
  const bestEnvironment = calculateBestEnvironment();
  const radarData = prepareRadarData(filteredLogs);

  // Calculate correlation between cravings and focus
  const calculateCravingFocusCorrelation = () => {
    if (!filteredLogs || filteredLogs.length < 5) return null;
    
    // Calculate Pearson correlation coefficient
    const n = filteredLogs.length;
    const sumX = filteredLogs.reduce((sum, log) => sum + log.craving_interference, 0);
    const sumY = filteredLogs.reduce((sum, log) => sum + log.focus_level, 0);
    const sumXY = filteredLogs.reduce((sum, log) => sum + (log.craving_interference * log.focus_level), 0);
    const sumXSquare = filteredLogs.reduce((sum, log) => sum + (log.craving_interference * log.craving_interference), 0);
    const sumYSquare = filteredLogs.reduce((sum, log) => sum + (log.focus_level * log.focus_level), 0);
    
    const numerator = n * sumXY - sumX * sumY;
    const denominator = Math.sqrt((n * sumXSquare - sumX * sumX) * (n * sumYSquare - sumY * sumY));
    
    if (denominator === 0) return 0;
    
    return numerator / denominator;
  };

  // Identify most effective craving management technique
  const findBestCravingManagementTechnique = (): BestTechniqueResult | null => {
    if (!filteredLogs || filteredLogs.length < 5) return null;
    
    const techniques = new Map<string, { count: number, avgFocus: number, avgCraving: number }>();
    
    filteredLogs.forEach(log => {
      if (log.craving_management_technique && log.craving_management_technique !== 'none') {
        if (!techniques.has(log.craving_management_technique)) {
          techniques.set(log.craving_management_technique, { 
            count: 0, 
            avgFocus: 0,
            avgCraving: 0 
          });
        }
        
        const technique = techniques.get(log.craving_management_technique)!;
        technique.count += 1;
        technique.avgFocus += log.focus_level;
        technique.avgCraving += log.craving_interference;
      }
    });
    
    let bestTechnique: BestTechniqueResult | null = null;
    let bestRatio = 0;
    
    techniques.forEach((data, technique) => {
      if (data.count >= 3) {
        data.avgFocus /= data.count;
        data.avgCraving /= data.count;
        
        // Higher focus and lower craving is better
        const ratio = data.avgFocus / (data.avgCraving || 1);
        
        if (ratio > bestRatio) {
          bestRatio = ratio;
          bestTechnique = {
            name: technique,
            focusAvg: data.avgFocus,
            cravingAvg: data.avgCraving
          };
        }
      }
    });
    
    return bestTechnique;
  };

  // Custom tooltip for charts
  const CustomChartTooltip = ({ active, payload, label }: any) => {
    if (active && payload && payload.length) {
      return (
        <motion.div 
          initial={{ opacity: 0, y: 10 }}
          animate={{ opacity: 1, y: 0 }}
          className="bg-white dark:bg-gray-800 p-3 rounded-md shadow-md border border-gray-200 dark:border-gray-700"
        >
          <p className="font-semibold text-sm">{label}</p>
          {payload.map((item: any, index: number) => (
            <div key={index} className="flex items-center mt-1">
              <div className="w-3 h-3 mr-2" style={{ backgroundColor: item.color }}></div>
              <p className="text-xs">
                {item.name}: <span className="font-medium">{item.value}</span>
              </p>
            </div>
          ))}
        </motion.div>
      );
    }
    return null;
  };

  // Custom mobile feature badge
  const FeatureStatusBadge = ({ feature, available }: { feature: string, available: boolean }) => (
    <Badge className={`text-xs ${available ? 'bg-green-100 text-green-800 dark:bg-green-900 dark:text-green-300' : 'bg-gray-100 text-gray-600 dark:bg-gray-800 dark:text-gray-400'}`}>
      {feature} {available ? <Check className="ml-1 h-3 w-3" /> : <X className="ml-1 h-3 w-3" />}
    </Badge>
  );

  // Analyze focus trends
  const analyzeFocusTrends = () => {
    const filteredLogs = getFilteredLogs();
    
    if (filteredLogs.length === 0) {
      setFocusTrends(null);
      return;
    }
    
    // Calculate average focus level
    const avgFocusLevel = filteredLogs.reduce((sum, log) => sum + log.focus_level, 0) / filteredLogs.length;
    
    // Calculate craving correlation
    const cravingFocusProducts = filteredLogs.map(log => log.craving_interference * log.focus_level);
    const cravingSum = filteredLogs.reduce((sum, log) => sum + log.craving_interference, 0);
    const cravingSquaredSum = filteredLogs.reduce((sum, log) => sum + Math.pow(log.craving_interference, 2), 0);
    const focusSum = filteredLogs.reduce((sum, log) => sum + log.focus_level, 0);
    const focusSquaredSum = filteredLogs.reduce((sum, log) => sum + Math.pow(log.focus_level, 2), 0);
    const productSum = cravingFocusProducts.reduce((sum, product) => sum + product, 0);
    
    const n = filteredLogs.length;
    const numerator = n * productSum - cravingSum * focusSum;
    const denominator = Math.sqrt((n * cravingSquaredSum - Math.pow(cravingSum, 2)) * (n * focusSquaredSum - Math.pow(focusSum, 2)));
    
    // Calculate correlation coefficient (limit to -1 to 1 range)
    const cravingCorrelation = denominator === 0 ? 0 : Math.max(-1, Math.min(1, numerator / denominator));
    
    // Find best environment
    const environmentFocusMap: Record<string, number[]> = {};
    
    filteredLogs.forEach(log => {
      // Convert environment array to string key
      const envKey = log.environment.join(',');
      
      if (!environmentFocusMap[envKey]) {
        environmentFocusMap[envKey] = [];
      }
      environmentFocusMap[envKey].push(log.focus_level);
    });
    
    let bestEnvironment = '';
    let bestEnvironmentAvg = 0;
    
    Object.entries(environmentFocusMap).forEach(([env, levels]) => {
      const avg = levels.reduce((sum, level) => sum + level, 0) / levels.length;
      if (avg > bestEnvironmentAvg) {
        bestEnvironmentAvg = avg;
        bestEnvironment = env;
      }
    });
    
    // Find best technique
    const techniqueFocusMap: Record<string, number[]> = {};
    const techniqueUsageCount: Record<string, number> = {};
    
    filteredLogs.forEach(log => {
      // Check if techniques exists and is an array
      const techniques = log.techniques || [];
      techniques.forEach(technique => {
        if (!techniqueFocusMap[technique]) {
          techniqueFocusMap[technique] = [];
          techniqueUsageCount[technique] = 0;
        }
        techniqueFocusMap[technique].push(log.focus_level);
        techniqueUsageCount[technique]++;
      });
    });
    
    let bestTechnique = '';
    let bestTechniqueAvg = 0;
    let bestTechniqueCount = 0;
    
    Object.entries(techniqueFocusMap).forEach(([technique, levels]) => {
      const avg = levels.reduce((sum, level) => sum + level, 0) / levels.length;
      if (avg > bestTechniqueAvg) {
        bestTechniqueAvg = avg;
        bestTechnique = technique;
        bestTechniqueCount = techniqueUsageCount[technique];
      }
    });
    
    // Calculate distraction frequency
    const distractionFrequency: Record<string, number> = {};
    
    filteredLogs.forEach(log => {
      log.distractions.forEach(distraction => {
        distractionFrequency[distraction] = (distractionFrequency[distraction] || 0) + 1;
      });
    });
    
    // Calculate focus change over time if we have enough data
    let focusChangeOverTime = 0;
    
    if (filteredLogs.length >= 5) {
      // Sort logs by date
      const sortedLogs = [...filteredLogs].sort((a, b) => {
        // Handle the case where date may not exist
        const dateA = a.date ? new Date(a.date) : new Date(a.timestamp);
        const dateB = b.date ? new Date(b.date) : new Date(b.timestamp);
        return dateA.getTime() - dateB.getTime();
      });
      
      // Create batches of first 30% and last 30% of logs
      const firstBatchSize = Math.max(1, Math.floor(sortedLogs.length * 0.3));
      const lastBatchSize = Math.max(1, Math.floor(sortedLogs.length * 0.3));
      
      const firstBatch = sortedLogs.slice(0, firstBatchSize);
      const lastBatch = sortedLogs.slice(-lastBatchSize);
      
      // Calculate average focus for first and last batch
      const firstAvg = firstBatch.reduce((sum, log) => sum + log.focus_level, 0) / firstBatchSize;
      const lastAvg = lastBatch.reduce((sum, log) => sum + log.focus_level, 0) / lastBatchSize;
      
      // Calculate percent change
      focusChangeOverTime = firstAvg === 0 ? 0 : ((lastAvg - firstAvg) / firstAvg) * 100;
    }
    
    // Set focus trends with techniqueFocusMap
    setFocusTrends({
      averageFocusLevel: Math.round(avgFocusLevel * 10) / 10,
      cravingCorrelation: Math.round(cravingCorrelation * 100) / 100,
      bestEnvironment,
      bestTechnique: {
        name: bestTechnique,
        focusAvg: Math.round(bestTechniqueAvg * 10) / 10,
        cravingAvg: 0 // Add a default value for cravingAvg
      },
      distractionFrequency,
      focusChangeOverTime: Math.round(focusChangeOverTime * 10) / 10,
      techniqueFocusMap
    });
  };

  // Fix rendering of FocusTrendSection where trends could be null
  const FocusTrendSection = () => {
    if (!focusTrends) {
      return (
        <EmptyState
          title="No Focus Trends"
          description="Add more focus logs to see trends and insights"
          icon={<TrendingUpIcon size={32} />}
        />
      );
    }

    return (
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-4">
        <Card>
          <CardHeader>
            <CardTitle>Focus Overview</CardTitle>
          </CardHeader>
          <CardContent>
            <div className="space-y-4">
              <div>
                <p className="text-sm text-muted-foreground mb-1">Average Focus Level</p>
                <h3 className="text-2xl font-bold">{focusTrends.averageFocusLevel} / 10</h3>
              </div>
              <div>
                <p className="text-sm text-muted-foreground mb-1">Change Over Time</p>
                <div className="flex items-center">
                  <h3 className="text-2xl font-bold">
                    {focusTrends.focusChangeOverTime > 0 ? '+' : ''}
                    {focusTrends.focusChangeOverTime}%
                  </h3>
                  {focusTrends.focusChangeOverTime > 0 ? (
                    <TrendingUpIcon className="ml-2 text-green-500" />
                  ) : focusTrends.focusChangeOverTime < 0 ? (
                    <TrendingDownIcon className="ml-2 text-red-500" />
                  ) : (
                    <MinusIcon className="ml-2 text-gray-500" />
                  )}
                </div>
              </div>
            </div>
          </CardContent>
        </Card>

        <Card>
          <CardHeader>
            <CardTitle>Environment Impact</CardTitle>
          </CardHeader>
          <CardContent>
            <div className="space-y-4">
              <div>
                <p className="text-sm text-muted-foreground mb-1">Best Environment</p>
                <h3 className="text-lg font-bold capitalize">
                  {focusTrends.bestEnvironment ? focusTrends.bestEnvironment.replace(',', ', ') : 'No data'}
                </h3>
              </div>
              <div>
                <p className="text-sm text-muted-foreground mb-1">Best Technique</p>
                <h3 className="text-lg font-bold capitalize">
                  {focusTrends.bestTechnique?.name || 'No techniques logged'}
                </h3>
                {focusTrends.bestTechnique?.name && (
                  <p className="text-sm text-muted-foreground">
                    Avg Focus: {focusTrends.bestTechnique.focusAvg} / 10
                  </p>
                )}
              </div>
            </div>
          </CardContent>
        </Card>

        <Card className="lg:col-span-2">
          <CardHeader>
            <CardTitle>Correlation Analysis</CardTitle>
          </CardHeader>
          <CardContent>
            <div className="space-y-4">
              <div>
                <p className="text-sm text-muted-foreground mb-1">Craving-Focus Correlation</p>
                <div className="flex items-center">
                  <h3 className="text-lg font-bold">
                    {focusTrends.cravingCorrelation}
                  </h3>
                  <div className="ml-2 text-sm">
                    {focusTrends.cravingCorrelation < -0.3 ? (
                      <span className="text-green-500">Strong negative correlation (higher cravings → lower focus)</span>
                    ) : focusTrends.cravingCorrelation > 0.3 ? (
                      <span className="text-yellow-500">Positive correlation (higher cravings → higher focus)</span>
                    ) : (
                      <span className="text-muted-foreground">Weak correlation</span>
                    )}
                  </div>
                </div>
              </div>
            </div>
          </CardContent>
        </Card>

        {focusTrends.techniqueFocusMap && Object.keys(focusTrends.techniqueFocusMap).length > 0 && (
          <Card className="lg:col-span-2">
            <CardHeader>
              <CardTitle>Technique Effectiveness</CardTitle>
            </CardHeader>
            <CardContent>
              <ScrollArea className="h-64">
                <div className="space-y-4">
                  {Object.entries(focusTrends.techniqueFocusMap).map(([technique, levels]) => {
                    const avgFocus = levels.reduce((sum, level) => sum + level, 0) / levels.length;
                    return (
                      <div key={technique} className="flex items-center">
                        <div className="w-40 font-medium capitalize">{technique}</div>
                        <div className="flex-1">
                          <div className="h-2 bg-slate-100 rounded-full overflow-hidden">
                            <div
                              className="h-full bg-primary"
                              style={{ width: `${(avgFocus / 10) * 100}%` }}
                            />
                          </div>
                        </div>
                        <div className="ml-4 text-sm font-medium">{Math.round(avgFocus * 10) / 10}</div>
                      </div>
                    );
                  })}
                </div>
              </ScrollArea>
            </CardContent>
          </Card>
        )}
        
        {Object.keys(focusTrends.distractionFrequency).length > 0 && (
          <Card className="lg:col-span-2">
            <CardHeader>
              <CardTitle>Common Distractions</CardTitle>
            </CardHeader>
            <CardContent>
              <ScrollArea className="h-64">
                <div className="space-y-4">
                  {Object.entries(focusTrends.distractionFrequency)
                    .sort((a, b) => b[1] - a[1])
                    .map(([distraction, count]) => (
                      <div key={distraction} className="flex items-center">
                        <div className="w-40 font-medium capitalize">{distraction}</div>
                        <div className="flex-1">
                          <div className="h-2 bg-slate-100 rounded-full overflow-hidden">
                            <div
                              className="h-full bg-orange-400"
                              style={{
                                width: `${Math.min(
                                  100,
                                  (count / Math.max(...Object.values(focusTrends.distractionFrequency))) * 100
                                )}%`,
                              }}
                            />
                          </div>
                        </div>
                        <div className="ml-4 text-sm font-medium">{count}x</div>
                      </div>
                    ))}
                </div>
              </ScrollArea>
            </CardContent>
          </Card>
        )}
      </div>
    );
  };

  const loadFocusData = async () => {
    try {
      setLoading(true);
      
      // Calculate date range based on selected period
      let startDate: Date, endDate: Date = new Date();
      
      if (viewMode === 'week') {
        startDate = subDays(new Date(), 7);
      } else if (viewMode === 'month') {
        startDate = subDays(new Date(), 30);
      } else {
        startDate = subDays(new Date(), 365); // Get up to a year of data
      }
      
      // Format dates for API
      const formattedStartDate = format(startDate, 'yyyy-MM-dd');
      const formattedEndDate = format(endDate, 'yyyy-MM-dd');
      
      if (!session || !actualUserId) {
        throw new Error('No active session or user ID');
      }
      
      // Call the API to get focus logs
      const logs = await getFocusLogs(actualUserId, formattedStartDate, formattedEndDate, session);
      
      if (Array.isArray(logs)) {
        // Transform API data to our internal format with proper type casting
        const formattedLogs = logs.map(log => ({
          ...log,
          date: format(parseISO(log.timestamp), 'yyyy-MM-dd'),
          techniques: log.environment ? (Array.isArray(log.environment) ? log.environment : [log.environment]) : [],
          activity_type: (log.task_type as 'work' | 'study' | 'creative' | 'reading' | 'other') || 'other',
          environment: log.environment ? (Array.isArray(log.environment) ? log.environment : [log.environment]) : [],
          distractions: log.distractions || [],
          craving_interference: log.craving_interference || 0
        })) as FocusLog[];
        
        setFocusLogs(formattedLogs);
        
        // Also update the focusEntries for backward compatibility
        const entries: FocusEntry[] = formattedLogs.map(log => ({
          date: log.date,
          score: log.focus_level,
          activity: log.activity_type,
          duration: log.duration_minutes,
          notes: log.notes || undefined
        }));
        
        setFocusEntries(entries);
        
        // Run analysis on the data
        analyzeFocusTrends();
      } else {
        // Handle empty or invalid response
        setFocusLogs([]);
        setFocusEntries([]);
      }
    } catch (error) {
      console.error('Error loading focus data:', error);
      toast.error("Error loading focus data", {
        description: "Could not retrieve your focus history. Please try again later."
      });
      setFocusLogs([]);
      setFocusEntries([]);
    } finally {
      setLoading(false);
    }
  };

  const handleSaveFocus = async () => {
    if (!session || !actualUserId) {
      toast.error("Cannot save focus data", {
        description: "You must be logged in to save focus data."
      });
      return;
    }
    
    if (focusScore === 0) {
      toast.error("Invalid focus score", {
        description: "Please set a focus score before saving."
      });
      return;
    }
    
    try {
      hapticFeedback.medium();
      setIsSubmitting(true);
      
      const now = new Date().toISOString();
      const today = format(new Date(), 'yyyy-MM-dd');
      
      // Prepare the focus log data
      const focusData = {
        user_id: actualUserId,
        timestamp: now,
        focus_level: focusScore,
        duration_minutes: focusDuration,
        activity_type: focusActivity,
        environment: selectedEnvironment,
        distractions: selectedDistractions,
        craving_interference: cravingInterference,
        craving_management_technique: cravingManagementTechnique,
        notes: notes || null
      };
      
      // Make API call to save the focus log
      const endpoint = '/rest/v1/focus_logs';
      const response = await supabaseRestCall(endpoint, {
        method: 'POST',
        body: JSON.stringify(focusData)
      }, session);
      
      if (response) {
        // Add the new entry to our local state with proper type assertion
        const newLog: FocusLog = {
          id: (response as any).id || `temp-${Date.now()}`,
          user_id: actualUserId,
          timestamp: now,
          focus_level: focusScore,
          duration_minutes: focusDuration,
          activity_type: focusActivity as any,
          environment: selectedEnvironment,
          distractions: selectedDistractions,
          craving_interference: cravingInterference,
          notes: notes || null,
          created_at: now,
          date: today,
          techniques: []
        };
        
        setFocusLogs([newLog, ...focusLogs]);
        
        // Also update focusEntries for backward compatibility
        const newEntry: FocusEntry = {
          date: today,
          score: focusScore,
          activity: focusActivity,
          duration: focusDuration,
          notes: notes || undefined
        };
        
        setFocusEntries([newEntry, ...focusEntries]);
        
        // Reset the form
        resetForm();
        
        // Show success message
        toast.success("Focus session saved", {
          description: "Your focus session has been recorded successfully."
        });
        hapticFeedback.success();
        
        // Reload data to ensure everything is up to date
        loadFocusData();
      }
    } catch (error) {
      console.error('Error saving focus data:', error);
      toast.error("Error saving focus data", {
        description: "Failed to save your focus session. Please try again."
      });
      hapticFeedback.error();
    } finally {
      setIsSubmitting(false);
    }
  };

  const getAverageFocusScore = () => {
    if (focusEntries.length === 0) return 0;
    
    const totalScore = focusEntries.reduce((sum, entry) => sum + entry.score, 0);
    return totalScore / focusEntries.length;
  };

  const getFocusTrend = () => {
    if (focusEntries.length < 2) return 'stable';
    
    // Sort entries by date
    const sortedEntries = [...focusEntries].sort((a, b) => {
      return parseISO(a.date).getTime() - parseISO(b.date).getTime();
    });
    
    // Split into two halves and compare averages
    const halfLength = Math.floor(sortedEntries.length / 2);
    const firstHalf = sortedEntries.slice(0, halfLength);
    const secondHalf = sortedEntries.slice(halfLength);
    
    const firstAvg = firstHalf.reduce((sum, entry) => sum + entry.score, 0) / firstHalf.length;
    const secondAvg = secondHalf.reduce((sum, entry) => sum + entry.score, 0) / secondHalf.length;
    
    const difference = secondAvg - firstAvg;
    
    if (difference > 0.5) return 'improving';
    if (difference < -0.5) return 'declining';
    return 'stable';
  };

  const getAverageFocusDuration = () => {
    const entriesWithDuration = focusEntries.filter(entry => entry.duration !== undefined);
    if (entriesWithDuration.length === 0) return 0;
    
    const totalDuration = entriesWithDuration.reduce((sum, entry) => sum + (entry.duration || 0), 0);
    return Math.round(totalDuration / entriesWithDuration.length);
  };

  const renderFocusCalendar = () => {
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
            
            {focusEntries.find(entry => entry.date === format(selectedDate, 'yyyy-MM-dd')) ? (
              <div className="flex flex-col mt-2">
                <div className="flex items-center">
                  <Brain className="h-5 w-5 text-purple-500 mr-2" />
                  <span className="font-medium">
                    Focus Score: {focusEntries.find(entry => entry.date === format(selectedDate, 'yyyy-MM-dd'))!.score}/10
                  </span>
                </div>
                
                {focusEntries.find(entry => entry.date === format(selectedDate, 'yyyy-MM-dd'))!.activity && (
                  <div className="mt-2 flex items-center">
                    <Target className="h-4 w-4 text-blue-500 mr-2" />
                    <span>
                      Activity: {focusEntries.find(entry => entry.date === format(selectedDate, 'yyyy-MM-dd'))!.activity}
                    </span>
                  </div>
                )}
                
                {focusEntries.find(entry => entry.date === format(selectedDate, 'yyyy-MM-dd'))!.duration && (
                  <div className="mt-1 flex items-center">
                    <Calendar className="h-4 w-4 text-green-500 mr-2" />
                    <span>
                      Duration: {focusEntries.find(entry => entry.date === format(selectedDate, 'yyyy-MM-dd'))!.duration} minutes
                    </span>
                  </div>
                )}
                
                {focusEntries.find(entry => entry.date === format(selectedDate, 'yyyy-MM-dd'))!.notes && (
                  <div className="mt-2 text-sm text-gray-600">
                    <p className="italic">
                      "{focusEntries.find(entry => entry.date === format(selectedDate, 'yyyy-MM-dd'))!.notes}"
                    </p>
                  </div>
                )}
                
                <div className="mt-3">
                  <Progress 
                    value={focusEntries.find(entry => entry.date === format(selectedDate, 'yyyy-MM-dd'))!.score * 10} 
                    className="h-2" 
                  />
                </div>
              </div>
            ) : (
              <div className="text-gray-500">No focus data for this day</div>
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
              const entry = focusEntries.find(entry => entry.date === dateStr);
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
                      <div 
                        className={`h-3 w-3 rounded-full mx-auto ${
                          entry.score >= 8 ? 'bg-green-500' :
                          entry.score >= 5 ? 'bg-yellow-500' :
                          'bg-red-500'
                        }`}
                        title={`Focus Score: ${entry.score}/10`}
                      />
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

  const renderFocusForm = () => {
    const activities = ['Work', 'Reading', 'Creative Project', 'Learning', 'Problem Solving', 'Studying'];
    
    return (
      <div className="mt-4 bg-white p-4 rounded-lg border">
        <h3 className="font-medium mb-3">Record Your Focus Session</h3>
        
        <div className="space-y-4">
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-1">
              Focus Score (1-10)
            </label>
            <div className="flex items-center space-x-2">
              <input 
                type="range" 
                min="1" 
                max="10" 
                value={focusScore} 
                onChange={(e) => setFocusScore(parseInt(e.target.value))}
                className="flex-1" 
              />
              <span className="font-bold text-purple-500">{focusScore}</span>
            </div>
          </div>
          
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-1">
              Activity Type
            </label>
            <select 
              value={focusActivity} 
              onChange={(e) => setFocusActivity(e.target.value)}
              className="w-full p-2 border rounded-md"
            >
              <option value="">Select an activity</option>
              {activities.map(activity => (
                <option key={activity} value={activity}>{activity}</option>
              ))}
            </select>
          </div>
          
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-1">
              Duration (minutes)
            </label>
            <input 
              type="number" 
              min="1" 
              value={focusDuration} 
              onChange={(e) => setFocusDuration(parseInt(e.target.value))}
              className="w-full p-2 border rounded-md" 
            />
          </div>
          
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-1">
              Notes (optional)
            </label>
            <textarea 
              value={notes} 
              onChange={(e) => setNotes(e.target.value)}
              className="w-full p-2 border rounded-md"
              rows={2}
              placeholder="How was your concentration? Any distractions?"
            />
          </div>
          
          <div className="flex justify-end space-x-2">
            <Button 
              variant="outline"
              onClick={() => {
                resetForm();
                setShowAddForm(false);
              }}
            >
              Cancel
            </Button>
            <Button onClick={handleSaveFocus}>
              Save
            </Button>
          </div>
        </div>
      </div>
    );
  };

  const renderFocusSummary = () => {
    const averageScore = getAverageFocusScore();
    const trend = getFocusTrend();
    const averageDuration = getAverageFocusDuration();
    
    return (
      <div className="bg-purple-50 rounded-lg p-4 mb-4">
        <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
          <div>
            <h3 className="text-purple-800 font-medium">Average Focus</h3>
            <div className="flex items-center mt-1">
              <Brain className="h-5 w-5 text-purple-500 mr-1" />
              <span className="text-xl font-bold text-purple-900">
                {averageScore.toFixed(1)}
              </span>
              <span className="text-sm text-purple-700 ml-1">/10</span>
            </div>
          </div>
          
          <div>
            <h3 className="text-purple-800 font-medium">Trend</h3>
            <p className={`text-sm font-medium mt-1 ${
              trend === 'improving' ? 'text-green-600' :
              trend === 'declining' ? 'text-red-600' :
              'text-yellow-600'
            }`}>
              {trend === 'improving' ? '↗ Improving' :
               trend === 'declining' ? '↘ Declining' :
               '→ Stable'}
            </p>
          </div>
          
          <div>
            <h3 className="text-purple-800 font-medium">Avg. Duration</h3>
            <div className="flex items-center mt-1">
              <Calendar className="h-5 w-5 text-purple-500 mr-1" />
              <span className="text-xl font-bold text-purple-900">
                {averageDuration}
              </span>
              <span className="text-sm text-purple-700 ml-1">min</span>
            </div>
          </div>
        </div>
        
        <div className="mt-3">
          <div className="text-xs text-purple-700 mb-1">Focus score distribution</div>
          <div className="flex h-4 overflow-hidden rounded-full bg-gray-200">
            <div className="bg-red-500" style={{ width: `${focusEntries.filter(e => e.score <= 3).length / focusEntries.length * 100}%` }}></div>
            <div className="bg-orange-500" style={{ width: `${focusEntries.filter(e => e.score > 3 && e.score <= 5).length / focusEntries.length * 100}%` }}></div>
            <div className="bg-yellow-500" style={{ width: `${focusEntries.filter(e => e.score > 5 && e.score <= 7).length / focusEntries.length * 100}%` }}></div>
            <div className="bg-green-500" style={{ width: `${focusEntries.filter(e => e.score > 7).length / focusEntries.length * 100}%` }}></div>
          </div>
        </div>
      </div>
    );
  };

  const renderFocusTips = () => {
    return (
      <div className="bg-white rounded-lg border p-4 mt-4">
        <h3 className="font-medium text-lg mb-3">Improving Focus During Quit Journey</h3>
        <div className="space-y-3">
          <div className="flex">
            <div className="mr-3 flex-shrink-0">
              <BookOpen className="h-5 w-5 text-blue-500" />
            </div>
            <div>
              <p className="font-medium">Regular Breaks</p>
              <p className="text-sm text-gray-600">The Pomodoro Technique (25 minutes of focus followed by a 5-minute break) can help maintain concentration.</p>
            </div>
          </div>
          
          <div className="flex">
            <div className="mr-3 flex-shrink-0">
              <Coffee className="h-5 w-5 text-blue-500" />
            </div>
            <div>
              <p className="font-medium">Hydration</p>
              <p className="text-sm text-gray-600">Staying well-hydrated improves brain function. Consider herbal tea if you're avoiding caffeine.</p>
            </div>
          </div>
          
          <div className="flex">
            <div className="mr-3 flex-shrink-0">
              <Briefcase className="h-5 w-5 text-blue-500" />
            </div>
            <div>
              <p className="font-medium">Task Prioritization</p>
              <p className="text-sm text-gray-600">During nicotine withdrawal, focus on important but less cognitively demanding tasks when possible.</p>
            </div>
          </div>
          
          <div className="flex">
            <div className="mr-3 flex-shrink-0">
              <Target className="h-5 w-5 text-blue-500" />
            </div>
            <div>
              <p className="font-medium">One Task at a Time</p>
              <p className="text-sm text-gray-600">Multitasking reduces efficiency. Focus on completing one task before moving to the next.</p>
            </div>
          </div>
          
          <div className="flex">
            <div className="mr-3 flex-shrink-0">
              <CheckCircle className="h-5 w-5 text-blue-500" />
            </div>
            <div>
              <p className="font-medium">Improved Long-term</p>
              <p className="text-sm text-gray-600">While focus may decline initially after quitting, it typically improves substantially after 2-4 weeks.</p>
            </div>
          </div>
        </div>
      </div>
    );
  };

  // Navigation functions
  const handlePreviousDay = () => {
    setSelectedDate(prev => subDays(prev, 1));
  };
  
  const handleNextDay = () => {
    const tomorrow = addDays(selectedDate, 1);
    if (tomorrow <= new Date()) {
      setSelectedDate(tomorrow);
    }
  };

  return (
    <Card className={`overflow-hidden ${className}`}>
      <CardHeader className="space-y-0 pb-2">
        <div className="flex justify-between items-center">
          <CardTitle className="text-xl">Focus Tracker</CardTitle>
          {!compact && (
            <div className="flex items-center space-x-2">
              <Select
                value={viewMode}
                onValueChange={(value) => setViewMode(value as 'day' | 'week' | 'month')}
              >
                <SelectTrigger className="w-[120px] h-8">
                  <SelectValue placeholder="Timeframe" />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="day">Day</SelectItem>
                  <SelectItem value="week">Week</SelectItem>
                  <SelectItem value="month">Month</SelectItem>
                </SelectContent>
              </Select>
            </div>
          )}
        </div>
        {!compact && (
          <CardDescription>
            Track your cognitive focus and productivity
          </CardDescription>
        )}
      </CardHeader>
      
      <div 
        ref={swipeHandlers.ref}
        className="relative"
      >
        <CardContent className="pt-2">
          {loading ? (
            <div className="flex flex-col items-center py-8">
              <div className="h-8 w-8 rounded-full border-2 border-primary border-t-transparent animate-spin" />
              <p className="text-sm text-muted-foreground mt-2">Loading focus data...</p>
            </div>
          ) : (
            <div>
              {/* Focus Summary */}
              {focusEntries.length > 0 && renderFocusSummary()}
              
              {/* View Controls */}
              <div className="flex justify-between items-center mb-4">
                <Button
                  variant="ghost"
                  size="sm"
                  onClick={handlePreviousDay}
                  className="h-8 w-8 p-0"
                >
                  <span className="sr-only">Previous day</span>
                  <ArrowLeft className="h-4 w-4" />
                </Button>
                
                <div className="flex items-center">
                  <Calendar className="mr-2 h-4 w-4 text-muted-foreground" />
                  <span className="text-sm font-medium">
                    {format(selectedDate, viewMode === 'day' ? 'EEEE, MMMM d' : 'MMM d') +
                     (viewMode !== 'day' 
                      ? ` - ${format(
                          viewMode === 'week' 
                            ? addDays(selectedDate, 6)
                            : addDays(selectedDate, 29),
                          'MMM d'
                        )}`
                      : ''
                     )}
                  </span>
                </div>
                
                <Button
                  variant="ghost"
                  size="sm"
                  onClick={handleNextDay}
                  disabled={addDays(selectedDate, 1) > new Date()}
                  className="h-8 w-8 p-0"
                >
                  <span className="sr-only">Next day</span>
                  <ArrowRight className="h-4 w-4" />
                </Button>
              </div>
              
              {!focusLogs.length ? (
                <div className="text-center py-6">
                  <Brain className="h-12 w-12 text-muted-foreground mx-auto mb-3" />
                  <h3 className="text-lg font-medium">No focus data yet</h3>
                  <p className="text-sm text-muted-foreground mt-1 mb-4">
                    {viewMode === 'day'
                      ? "Track your focus for this day"
                      : viewMode === 'week'
                      ? "Track your focus for the past week"
                      : "Track your focus for the past month"}
                  </p>
                  {isToday(selectedDate) && (
                    <Button
                      onClick={() => {
                        setShowAddForm(true);
                        hapticFeedback.light();
                      }}
                    >
                      <PlusCircle className="mr-2 h-4 w-4" />
                      Add Entry
                    </Button>
                  )}
                </div>
              ) : (
                <div className="space-y-4">
                  {viewMode !== 'day' && (
                    <div className="space-y-2 mb-4">
                      <div className="flex justify-between items-center">
                        <span className="text-sm font-medium">Average Focus</span>
                        <span className="text-sm">{averageFocusLevel.toFixed(1)}</span>
                      </div>
                      <Progress value={averageFocusLevel * 20} className="h-2" />
                    </div>
                  )}
                  
                  <div className="space-y-3">
                    {viewMode === 'day' && focusLogs.length > 0 ? (
                      <div className="border rounded-lg p-3">
                        <div className="flex justify-between items-center mb-2">
                          <div className="flex items-center">
                            <Brain className={`h-5 w-5 ${focusLogs[0].focus_level && focusLogs[0].focus_level >= 4 ? 'text-green-500' : focusLogs[0].focus_level === 3 ? 'text-yellow-500' : 'text-red-500'}`} />
                            <span className="ml-2 font-medium">
                              {focusLevel.toFixed(1)} Focus
                            </span>
                          </div>
                          <span className="text-xs text-muted-foreground">
                            {format(new Date(focusLogs[0].timestamp), 'h:mm a')}
                          </span>
                        </div>
                        
                        <div className="my-2">
                          <div className="mb-1 flex items-center">
                            <Activity className="h-3.5 w-3.5 text-muted-foreground mr-1" />
                            <span className="text-xs font-medium">Activities</span>
                          </div>
                          {focusLogs[0].activities && focusLogs[0].activities.length > 0 ? (
                            <div className="flex flex-wrap gap-1 mb-2">
                              {focusLogs[0].activities.map(activity => (
                                <span 
                                  key={activity}
                                  className="inline-flex items-center rounded-full bg-primary/10 px-2.5 py-0.5 text-xs font-semibold transition-colors focus:outline-none focus:ring-2 focus:ring-ring focus:ring-offset-2"
                                >
                                  {activity}
                                </span>
                              ))}
                            </div>
                          ) : (
                            <p className="text-xs text-muted-foreground mb-2">No activities recorded</p>
                          )}
                        </div>
                        
                        <div className="my-2">
                          <div className="mb-1 flex items-center">
                            <Lightbulb className="h-3.5 w-3.5 text-muted-foreground mr-1" />
                            <span className="text-xs font-medium">Factors</span>
                          </div>
                          {focusLogs[0].factors && focusLogs[0].factors.length > 0 ? (
                            <div className="flex flex-wrap gap-1">
                              {focusLogs[0].factors.map(factor => (
                                <span 
                                  key={factor}
                                  className="inline-flex items-center rounded-full border px-2.5 py-0.5 text-xs font-semibold transition-colors focus:outline-none focus:ring-2 focus:ring-ring focus:ring-offset-2"
                                >
                                  {factor}
                                </span>
                              ))}
                            </div>
                          ) : (
                            <p className="text-xs text-muted-foreground">No factors recorded</p>
                          )}
                        </div>
                        
                        {focusLogs[0].notes && (
                          <p className="text-sm mt-2 pt-2 border-t">{focusLogs[0].notes}</p>
                        )}
                      </div>
                    ) : (
                      focusLogs.slice(0, 3).map(log => (
                        <div key={log.id} className="border rounded-lg p-3">
                          <div className="flex justify-between items-center mb-1">
                            <div className="flex items-center">
                              <Brain className={`h-5 w-5 ${log.focus_level && log.focus_level >= 4 ? 'text-green-500' : log.focus_level === 3 ? 'text-yellow-500' : 'text-red-500'}`} />
                              <span className="ml-2 font-medium">
                                {focusLevel.toFixed(1)}
                              </span>
                            </div>
                            <span className="text-xs text-muted-foreground">
                              {format(new Date(log.timestamp), viewMode === 'month' ? 'MMM d' : 'EEE, h:mm a')}
                            </span>
                          </div>
                          
                          {(log.activities && log.activities.length > 0) || (log.factors && log.factors.length > 0) ? (
                            <div className="flex flex-wrap gap-1 my-1">
                              {log.activities && log.activities.slice(0, 2).map(activity => (
                                <span 
                                  key={activity}
                                  className="inline-flex items-center rounded-full bg-primary/10 px-2 py-0.5 text-xs transition-colors focus:outline-none focus:ring-2 focus:ring-ring focus:ring-offset-2"
                                >
                                  {activity}
                                </span>
                              ))}
                              {log.factors && log.factors.slice(0, 1).map(factor => (
                                <span 
                                  key={factor}
                                  className="inline-flex items-center rounded-full border px-2 py-0.5 text-xs transition-colors focus:outline-none focus:ring-2 focus:ring-ring focus:ring-offset-2"
                                >
                                  {factor}
                                </span>
                              ))}
                              {((log.activities?.length || 0) > 2 || (log.factors?.length || 0) > 1) && (
                                <span className="text-xs text-muted-foreground">
                                  +{Math.max(0, (log.activities?.length || 0) - 2) + Math.max(0, (log.factors?.length || 0) - 1)} more
                                </span>
                              )}
                            </div>
                          ) : null}
                          
                          {log.notes && (
                            <p className="text-sm mt-1 line-clamp-2">{log.notes}</p>
                          )}
                        </div>
                      ))
                    )}
                  </div>
                  
                  {isToday(selectedDate) && viewMode === 'day' && (
                    <div className="mt-4 flex justify-center">
                      {focusLogs.some(log => isToday(new Date(log.timestamp))) ? (
                        <Button
                          variant="outline"
                          onClick={() => {
                            setShowAddForm(true);
                            hapticFeedback.light();
                          }}
                        >
                          Update Today's Focus
                        </Button>
                      ) : (
                        <Button
                          onClick={() => {
                            setShowAddForm(true);
                            hapticFeedback.light();
                          }}
                        >
                          <PlusCircle className="mr-2 h-4 w-4" />
                          Add Entry
                        </Button>
                      )}
                    </div>
                  )}
                </div>
              )}
            </div>
          )}
        </CardContent>
      </div>
    </Card>
  );
} 