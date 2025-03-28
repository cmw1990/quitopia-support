import React, { useState, useEffect, useMemo, useCallback, useRef } from 'react';
import { Session } from '@supabase/supabase-js';
import { format, addDays, differenceInDays, subDays, parseISO } from 'date-fns';
import { HealthImprovementTimeline } from '../HealthImprovementTimeline';
import { MoodTracker } from './MoodTracker';
import { EnergyTracker } from './EnergyTracker';
import { FocusTracker } from './FocusTracker';
import { CravingTracker } from './CravingTracker';
import { StepRewards } from './StepRewards';
import { HealthScore } from './HealthScore';
import { CalendarHeatmap } from './CalendarHeatmap';
import { ResistanceStrategies } from './ResistanceStrategies';
import { 
  BarChart, 
  LineChart, 
  PieChart, 
  Battery, 
  Brain, 
  Zap, 
  Heart, 
  BarChart3, 
  Feather,
  Plus,
  Minus,
  Activity,
  Moon,
  Footprints,
  Gift,
  Flame,
  Info,
  Calendar,
  TrendingUp,
  TrendingDown,
  AlertCircle,
  CheckCircle2,
  RefreshCw,
  Lightbulb,
  Target,
  Smartphone,
  Download,
  Share,
  FileText,
  Hourglass,
  Menu,
  User
} from 'lucide-react';
import { Button, Card, Tabs, TabsList, TabsTrigger, TabsContent, Progress, Badge, Alert, AlertDescription, CardHeader, CardTitle, CardDescription, CardContent } from '../ui';
import { Separator } from '../ui/separator';
import { 
  getUserProgress, 
  getHealthImprovements, 
  getNicotineConsumptionLogs,
  getCravingLogs as getApiCravingLogs,
  getMoodLogs,
  getEnergyLogs,
  getFocusLogs,
  getSleepLogs,
  CravingLog as ApiCravingLog
} from '../../api/apiCompatibility';
import { toast } from 'sonner';
import { UserProgressResponse, ProgressEntry, MoodLog, EnergyLog, FocusLog, SleepLog, CorrelationData, CravingLog } from '@/types/dataTypes';
import { SleepTracker } from './SleepTracker';
import { StepTracker } from './StepTracker';
import { 
  LineChart as RechartsLineChart, 
  Line, 
  XAxis, 
  YAxis, 
  CartesianGrid, 
  Tooltip as RechartsTooltip, 
  ResponsiveContainer,
  Legend,
  ScatterChart,
  Scatter,
  ZAxis,
  BarChart as RechartsBarChart,
  Bar,
  ComposedChart,
  Area
} from 'recharts';
import { useMediaQuery } from '../../hooks/useMediaQuery';
import CorrelationMatrix from './CorrelationMatrix';
import StatusCard from './StatusCard';
import { hapticFeedback } from '@/utils/hapticFeedback';
import { useParams } from 'react-router-dom';
import { AnimatePresence, motion } from 'framer-motion';
import 'jspdf-autotable';

interface IntegratedHealthViewProps {
  session: Session | null;
  quitDate?: string;
}

interface HealthMetricCard {
  title: string;
  value: number | string;
  change: number;
  icon: React.ReactNode;
  unit?: string;
  interpretation?: string;
  color: string;
}

interface HealthInsight {
  title: string;
  description: string;
  icon: React.JSX.Element;
}

// Helper function to adapt API CravingLog to dataTypes CravingLog
const adaptCravingLogs = (apiLogs: ApiCravingLog[]): CravingLog[] => {
  return apiLogs.map(log => ({
    id: log.id,
    user_id: log.user_id,
    timestamp: log.timestamp,
    intensity: log.intensity,
    trigger: log.trigger || '',
    location: log.location,
    activity: undefined,
    resisted: log.succeeded || false,
    notes: null,
    created_at: log.timestamp,
    triggers: log.trigger ? [log.trigger] : []
  }));
};

export const IntegratedHealthView: React.FC<IntegratedHealthViewProps> = ({
  session,
  quitDate = new Date().toISOString()
}) => {
  const [activeTab, setActiveTab] = useState<string>("overview");
  const [loading, setLoading] = useState<boolean>(true);
  const [healthMetrics, setHealthMetrics] = useState<HealthMetricCard[]>([]);
  const [healthScore, setHealthScore] = useState<number>(0);
  const [daysSinceQuit, setDaysSinceQuit] = useState<number>(0);
  const [hasWearableConnected, setHasWearableConnected] = useState<boolean>(false);
  const [integratedDevices, setIntegratedDevices] = useState<string[]>([]);
  const [lastSyncDate, setLastSyncDate] = useState<string | null>(null);
  const [timeframe, setTimeframe] = useState<'week' | 'month' | 'all'>('week');
  const [cravingSummary, setCravingSummary] = useState({
    totalCount: 0,
    resistedCount: 0,
    averageIntensity: 0,
    triggerCategories: [] as {name: string, count: number}[]
  });
  const [moodLogs, setMoodLogs] = useState<MoodLog[]>([]);
  const [energyLogs, setEnergyLogs] = useState<EnergyLog[]>([]);
  const [focusLogs, setFocusLogs] = useState<FocusLog[]>([]);
  const [sleepLogs, setSleepLogs] = useState<SleepLog[]>([]);
  const [cravingLogs, setCravingLogs] = useState<CravingLog[]>([]);
  const [integratedData, setIntegratedData] = useState<any[]>([]);
  const [correlationInsights, setCorrelationInsights] = useState<CorrelationData[]>([]);
  const [personalizationLevel, setPersonalizationLevel] = useState<'basic' | 'advanced'>('basic');
  const [isSyncing, setIsSyncing] = useState(false);
  const userId = session?.user?.id || '';
  const isMobile = useMediaQuery("(max-width: 768px)");
  const { userId: urlUserId } = useParams<{ userId: string }>();
  const dashboardRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    if (userId && session) {
      loadHealthData();
      checkConnectedDevices();
      loadAllHealthMetrics();
    }
  }, [userId, session, quitDate, timeframe]);

  // Generate integrated timeline data when logs change
  useEffect(() => {
    if (moodLogs.length || energyLogs.length || focusLogs.length || sleepLogs.length || cravingLogs.length) {
      generateIntegratedData();
      analyzeCorrelations();
    }
  }, [moodLogs, energyLogs, focusLogs, sleepLogs, cravingLogs]);

  // Add new useEffect for touch interaction
  useEffect(() => {
    // Only add touch handlers if on mobile
    if (!isMobile || !dashboardRef.current) return;
    
    let initialDistance = 0;
    let currentScale = 1;
    let initialPanPosition = { x: 0, y: 0 };
    let chartTransform = { scale: 1, translateX: 0, translateY: 0 };
    const maxScale = 2.5;
    const minScale = 0.8;
    const chartElements = dashboardRef.current.querySelectorAll('.recharts-responsive-container');
    
    const handleTouchStart = (e: TouchEvent) => {
      if (e.touches.length === 2) {
        // Pinch/zoom gesture starting
        initialDistance = Math.hypot(
          e.touches[0].clientX - e.touches[1].clientX,
          e.touches[0].clientY - e.touches[1].clientY
        );
        // Provide haptic feedback to indicate zoom mode
        hapticFeedback.light();
        e.preventDefault();
      } else if (e.touches.length === 1) {
        // Single touch for panning
        initialPanPosition = {
          x: e.touches[0].clientX,
          y: e.touches[0].clientY
        };
      }
    };
    
    const handleTouchMove = (e: TouchEvent) => {
      if (e.touches.length === 2) {
        // Handle pinch/zoom
        const currentDistance = Math.hypot(
          e.touches[0].clientX - e.touches[1].clientX,
          e.touches[0].clientY - e.touches[1].clientY
        );
        
        const newScale = Math.min(
          maxScale,
          Math.max(minScale, currentScale * (currentDistance / initialDistance))
        );
        
        // Apply scale transformation to chart elements
        chartElements.forEach((chart) => {
          const svgElement = chart.querySelector('svg');
          if (svgElement) {
            chartTransform.scale = newScale;
            svgElement.style.transform = `scale(${newScale}) translate(${chartTransform.translateX}px, ${chartTransform.translateY}px)`;
            svgElement.style.transformOrigin = 'center center';
          }
        });
        
        e.preventDefault();
      } else if (e.touches.length === 1 && currentScale > 1) {
        // Handle panning (only when zoomed in)
        const deltaX = (e.touches[0].clientX - initialPanPosition.x) / currentScale;
        const deltaY = (e.touches[0].clientY - initialPanPosition.y) / currentScale;
        
        chartTransform.translateX += deltaX / 2;
        chartTransform.translateY += deltaY / 2;
        
        // Limit pan amount based on zoom level
        const maxPan = (currentScale - 1) * 100;
        chartTransform.translateX = Math.min(maxPan, Math.max(-maxPan, chartTransform.translateX));
        chartTransform.translateY = Math.min(maxPan, Math.max(-maxPan, chartTransform.translateY));
        
        // Apply transformation
        chartElements.forEach((chart) => {
          const svgElement = chart.querySelector('svg');
          if (svgElement) {
            svgElement.style.transform = `scale(${currentScale}) translate(${chartTransform.translateX}px, ${chartTransform.translateY}px)`;
          }
        });
        
        initialPanPosition = {
          x: e.touches[0].clientX,
          y: e.touches[0].clientY
        };
      }
    };
    
    const handleTouchEnd = (e: TouchEvent) => {
      if (e.touches.length < 2) {
        // Update current scale for the next gesture
        currentScale = chartTransform.scale;
        
        // If scale is close to 1, reset to exactly 1
        if (Math.abs(currentScale - 1) < 0.1) {
          currentScale = 1;
          chartTransform = { scale: 1, translateX: 0, translateY: 0 };
          chartElements.forEach((chart) => {
            const svgElement = chart.querySelector('svg');
            if (svgElement) {
              svgElement.style.transform = 'scale(1) translate(0px, 0px)';
            }
          });
        }
      }
    };
    
    const handleDoubleTap = (e: TouchEvent) => {
      if (e.touches.length === 1) {
        // Reset zoom and pan on double tap
        currentScale = 1;
        chartTransform = { scale: 1, translateX: 0, translateY: 0 };
        chartElements.forEach((chart) => {
          const svgElement = chart.querySelector('svg');
          if (svgElement) {
            svgElement.style.transform = 'scale(1) translate(0px, 0px)';
            // Add a brief highlight effect to show reset
            svgElement.style.transition = 'all 0.3s ease';
            setTimeout(() => {
              if (svgElement) svgElement.style.transition = '';
            }, 300);
          }
        });
        hapticFeedback.medium();
      }
    };
    
    // Add event listeners to all chart containers
    chartElements.forEach(chart => {
      chart.addEventListener('touchstart', handleTouchStart as EventListener);
      chart.addEventListener('touchmove', handleTouchMove as EventListener);
      chart.addEventListener('touchend', handleTouchEnd as EventListener);
      
      // Add double tap listener
      let lastTap = 0;
      chart.addEventListener('touchstart', (e: Event) => {
        const touchEvent = e as unknown as TouchEvent;
        const now = new Date().getTime();
        const timeDiff = now - lastTap;
        if (timeDiff < 300 && timeDiff > 0) {
          handleDoubleTap(touchEvent);
        }
        lastTap = now;
      });
    });
    
    // Cleanup
    return () => {
      chartElements.forEach(chart => {
        chart.removeEventListener('touchstart', handleTouchStart as EventListener);
        chart.removeEventListener('touchmove', handleTouchMove as EventListener);
        chart.removeEventListener('touchend', handleTouchEnd as EventListener);
      });
    };
  }, [isMobile, dashboardRef.current]);

  // Add zoom controls for tablet/mobile users
  const ZoomControls = () => {
    const handleZoomIn = () => {
      const chartElements = dashboardRef.current?.querySelectorAll('.recharts-responsive-container');
      if (!chartElements) return;
      
      chartElements.forEach((chart) => {
        const svgElement = chart.querySelector('svg');
        if (svgElement) {
          const currentTransform = svgElement.style.transform;
          const currentScale = currentTransform ? parseFloat(currentTransform.match(/scale\(([^)]+)\)/)?.[1] || "1") : 1;
          const newScale = Math.min(2.5, currentScale + 0.2);
          svgElement.style.transform = `scale(${newScale})`;
          svgElement.style.transformOrigin = 'center center';
        }
      });
      hapticFeedback.light();
    };
    
    const handleZoomOut = () => {
      const chartElements = dashboardRef.current?.querySelectorAll('.recharts-responsive-container');
      if (!chartElements) return;
      
      chartElements.forEach((chart) => {
        const svgElement = chart.querySelector('svg');
        if (svgElement) {
          const currentTransform = svgElement.style.transform;
          const currentScale = currentTransform ? parseFloat(currentTransform.match(/scale\(([^)]+)\)/)?.[1] || "1") : 1;
          const newScale = Math.max(0.8, currentScale - 0.2);
          svgElement.style.transform = `scale(${newScale})`;
          svgElement.style.transformOrigin = 'center center';
        }
      });
      hapticFeedback.light();
    };
    
    const handleReset = () => {
      const chartElements = dashboardRef.current?.querySelectorAll('.recharts-responsive-container');
      if (!chartElements) return;
      
      chartElements.forEach((chart) => {
        const svgElement = chart.querySelector('svg');
        if (svgElement) {
          svgElement.style.transform = 'scale(1)';
          svgElement.style.transition = 'all 0.3s ease';
          setTimeout(() => {
            if (svgElement) svgElement.style.transition = '';
          }, 300);
        }
      });
      hapticFeedback.medium();
    };
    
    return (
      <div className="absolute top-2 right-2 flex flex-col gap-1 z-10">
        <Button 
          variant="outline" 
          size="icon" 
          className="bg-background/80 backdrop-blur-sm h-8 w-8"
          onClick={handleZoomIn}
        >
          <Plus className="h-4 w-4" />
        </Button>
        <Button 
          variant="outline" 
          size="icon" 
          className="bg-background/80 backdrop-blur-sm h-8 w-8"
          onClick={handleZoomOut}
        >
          <Minus className="h-4 w-4" />
        </Button>
        <Button 
          variant="outline" 
          size="icon" 
          className="bg-background/80 backdrop-blur-sm h-8 w-8"
          onClick={handleReset}
        >
          <RefreshCw className="h-4 w-4" />
        </Button>
      </div>
    );
  };

  const loadHealthData = async () => {
    try {
      setLoading(true);
      
      // Calculate days since quit
      const quitDateObj = new Date(quitDate);
      const days = differenceInDays(new Date(), quitDateObj);
      setDaysSinceQuit(Math.max(0, days));
      
      // Get user progress data
      const startDate = format(addDays(new Date(), -30), 'yyyy-MM-dd');
      const endDate = format(new Date(), 'yyyy-MM-dd');
      
      const progressData = await getUserProgress(userId, startDate, endDate, session);
      
      if (progressData && progressData.progressEntries) {
        // Calculate health score from the response
        setHealthScore(progressData.healthScore || Math.floor(Math.random() * 30) + 70);
        
        // Create health metrics
        const metrics: HealthMetricCard[] = [
          {
            title: "Overall Health",
            value: progressData.healthScore || Math.floor(Math.random() * 30) + 70,
            change: +4.5,
            icon: <Heart className="text-red-500" />,
            unit: "%",
            interpretation: progressData.healthScore > 80 ? "Excellent" : progressData.healthScore > 60 ? "Good" : "Improving",
            color: "text-red-500"
          },
          {
            title: "Energy Level",
            value: Math.floor(Math.random() * 20) + 70,
            change: +12.3,
            icon: <Zap className="text-yellow-500" />,
            unit: "%",
            interpretation: "Increasing",
            color: "text-yellow-500"
          },
          {
            title: "Focus Quality",
            value: Math.floor(Math.random() * 15) + 70,
            change: +8.7,
            icon: <Brain className="text-purple-500" />,
            unit: "%",
            interpretation: "Improving steadily",
            color: "text-purple-500"
          },
          {
            title: "Lung Recovery",
            value: Math.min(100, days * 0.3 + 40),
            change: +0.3,
            icon: <Feather className="text-blue-500" />,
            unit: "%",
            interpretation: "Regenerating",
            color: "text-blue-500"
          },
          {
            title: "Stress Level",
            value: Math.max(20, 100 - days * 0.5),
            change: -1.2,
            icon: <BarChart3 className="text-indigo-500" />,
            unit: "%",
            interpretation: "Decreasing",
            color: "text-indigo-500"
          },
          {
            title: "Sleep Quality",
            value: Math.min(95, 60 + days * 0.2),
            change: +0.8,
            icon: <Moon className="text-teal-500" />,
            unit: "%",
            interpretation: "Improving",
            color: "text-teal-500"
          }
        ];
        
        setHealthMetrics(metrics);
      }
    } catch (error) {
      console.error('Error loading health data:', error);
      toast.error('Failed to load health data');
    } finally {
      setLoading(false);
    }
  };

  const checkConnectedDevices = async () => {
    try {
      // Simulated check for connected devices
      // In a real app, this would query device connections from a health API
      
      // Randomize for demo purposes
      const devices: string[] = [];
      const rand = Math.random();
      
      if (rand > 0.4) devices.push('Apple Health');
      if (rand > 0.6) devices.push('Fitbit');
      if (rand > 0.8) devices.push('Google Fit');
      
      setIntegratedDevices(devices);
      setHasWearableConnected(devices.length > 0);
      
      if (devices.length > 0) {
        setLastSyncDate(new Date().toISOString());
      }
    } catch (error) {
      console.error('Error checking connected devices:', error);
    }
  };

  const loadAllHealthMetrics = async () => {
    try {
      setLoading(true);
      
      // Get date range based on timeframe
      const endDate = new Date();
      let startDate: Date;
      
      if (timeframe === 'week') {
        startDate = subDays(endDate, 7);
      } else if (timeframe === 'month') {
        startDate = subDays(endDate, 30);
      } else {
        startDate = subDays(endDate, 90);
      }
      
      const startDateStr = startDate.toISOString();
      const endDateStr = endDate.toISOString();
      
      // Load all health metrics in parallel
      const [moodData, energyData, focusData, sleepData, cravingData] = await Promise.all([
        getMoodLogs(userId, startDateStr, endDateStr, session),
        getEnergyLogs(userId, startDateStr, endDateStr, session),
        getFocusLogs(userId, startDateStr, endDateStr, session),
        getSleepLogs(userId, startDateStr, endDateStr, session),
        getApiCravingLogs(userId, startDateStr, endDateStr, session)
      ]);
      
      // Update state with loaded data
      setMoodLogs(moodData || []);
      setEnergyLogs(energyData || []);
      setFocusLogs(focusData || []);
      setSleepLogs(sleepData || []);
      setCravingLogs(adaptCravingLogs(cravingData || []));
      
      // Process craving summary data
      if (cravingData && cravingData.length > 0) {
        const resistedCount = cravingData.filter(log => log.succeeded).length;
        const totalIntensity = cravingData.reduce((sum, log) => sum + (log.intensity || 0), 0);
        
        // Extract trigger categories
        const triggerCounts: Record<string, number> = {};
        cravingData.forEach(log => {
          const trigger = log.trigger || 'Unknown';
          if (!triggerCounts[trigger]) {
            triggerCounts[trigger] = 0;
          }
          triggerCounts[trigger]++;
        });
        
        // Convert to expected format
        const triggerCategories = Object.entries(triggerCounts)
          .map(([name, count]) => ({ name, count }))
          .sort((a, b) => b.count - a.count)
          .slice(0, 5);
        
        setCravingSummary({
          totalCount: cravingData.length,
          resistedCount,
          averageIntensity: cravingData.length > 0 ? totalIntensity / cravingData.length : 0,
          triggerCategories
        });
      }
    } catch (error) {
      console.error('Error loading health metrics:', error);
      toast.error('Failed to load health metrics');
    } finally {
      setLoading(false);
    }
  };
  
  const generateIntegratedData = () => {
    // Create a map to store data by date
    const dataByDate: Record<string, any> = {};
    
    // Process mood logs
    moodLogs.forEach(log => {
      const date = format(new Date(log.timestamp), 'yyyy-MM-dd');
      if (!dataByDate[date]) {
        dataByDate[date] = { date };
      }
      dataByDate[date].mood = log.mood_score;
      dataByDate[date].moodNotes = log.notes;
      dataByDate[date].moodTriggers = log.triggers;
    });
    
    // Process energy logs
    energyLogs.forEach(log => {
      const date = format(new Date(log.timestamp), 'yyyy-MM-dd');
      if (!dataByDate[date]) {
        dataByDate[date] = { date };
      }
      dataByDate[date].energy = log.energy_level;
      dataByDate[date].energyTriggers = log.triggers;
    });
    
    // Process focus logs
    focusLogs.forEach(log => {
      const date = format(new Date(log.timestamp), 'yyyy-MM-dd');
      if (!dataByDate[date]) {
        dataByDate[date] = { date };
      }
      dataByDate[date].focus = log.focus_level;
      dataByDate[date].focusDuration = log.duration_minutes;
    });
    
    // Process sleep logs
    sleepLogs.forEach(log => {
      const date = format(new Date(log.timestamp), 'yyyy-MM-dd');
      if (!dataByDate[date]) {
        dataByDate[date] = { date };
      }
      dataByDate[date].sleep = log.sleep_quality;
      dataByDate[date].sleepDuration = log.duration_minutes;
    });
    
    // Process craving logs
    cravingLogs.forEach(log => {
      const date = format(new Date(log.timestamp), 'yyyy-MM-dd');
      if (!dataByDate[date]) {
        dataByDate[date] = { date };
      }
      
      // Initialize craving count for this date if not already present
      if (dataByDate[date].cravingCount === undefined) {
        dataByDate[date].cravingCount = 0;
        dataByDate[date].cravingIntensity = 0;
        dataByDate[date].resistedCravings = 0;
      }
      
      dataByDate[date].cravingCount++;
      dataByDate[date].cravingIntensity += log.intensity || 0;
      
      if (log.resisted) {
        dataByDate[date].resistedCravings++;
      }
    });
    
    // Calculate average craving intensity for each day
    Object.keys(dataByDate).forEach(date => {
      if (dataByDate[date].cravingCount > 0) {
        dataByDate[date].avgCravingIntensity = 
          dataByDate[date].cravingIntensity / dataByDate[date].cravingCount;
      }
    });
    
    // Convert map to array and sort by date
    const integratedArray = Object.values(dataByDate).sort((a, b) => {
      return new Date(a.date).getTime() - new Date(b.date).getTime();
    });
    
    setIntegratedData(integratedArray);
  };
  
  const analyzeCorrelations = () => {
    if (integratedData.length < 5) {
      // Not enough data for meaningful correlations
      setCorrelationInsights([]);
      return;
    }
    
    // Calculate correlations between different metrics
    const correlations: CorrelationData[] = [];
    
    // Mood and energy correlation
    const moodEnergyData = integratedData.filter(d => d.mood && d.energy);
    if (moodEnergyData.length >= 5) {
      const correlation = calculateCorrelation(
        moodEnergyData.map(d => d.mood),
        moodEnergyData.map(d => d.energy)
      );
      
      correlations.push({
        factor1: 'Mood',
        factor2: 'Energy',
        coefficient: correlation,
        interpretation: correlation > 0.5 
          ? 'Your mood and energy levels are strongly connected. Improving one likely benefits the other.'
          : correlation > 0.3
          ? 'There appears to be a moderate connection between your mood and energy levels.'
          : 'Your mood and energy levels seem to vary somewhat independently.',
        strength: getCorrelationStrength(correlation)
      });
    }
    
    // Focus and sleep correlation
    const focusSleepData = integratedData.filter(d => d.focus && d.sleep);
    if (focusSleepData.length >= 5) {
      const correlation = calculateCorrelation(
        focusSleepData.map(d => d.focus),
        focusSleepData.map(d => d.sleep)
      );
      
      correlations.push({
        factor1: 'Focus',
        factor2: 'Sleep',
        coefficient: correlation,
        interpretation: correlation > 0.5 
          ? 'Better sleep quality strongly correlates with improved focus ability.'
          : correlation > 0.3
          ? 'There appears to be some relationship between your sleep quality and focus ability.'
          : 'Your focus ability may be influenced by factors beyond just sleep quality.',
        strength: getCorrelationStrength(correlation)
      });
    }
    
    // Cravings and mood correlation
    const cravingMoodData = integratedData.filter(d => d.mood && d.cravingCount);
    if (cravingMoodData.length >= 5) {
      const correlation = calculateCorrelation(
        cravingMoodData.map(d => d.mood),
        cravingMoodData.map(d => d.cravingCount * -1) // Inverse relationship expected
      );
      
      correlations.push({
        factor1: 'Mood',
        factor2: 'Cravings',
        coefficient: correlation,
        interpretation: correlation > 0.5 
          ? 'Better mood strongly correlates with fewer cravings. Focus on mood-enhancing activities.'
          : correlation > 0.3
          ? 'There appears to be some connection between your mood and cravings frequency.'
          : 'Your cravings may be triggered by factors beyond mood states.',
        strength: getCorrelationStrength(correlation)
      });
    }
    
    // Energy and craving intensity correlation
    const energyCravingData = integratedData.filter(d => d.energy && d.avgCravingIntensity);
    if (energyCravingData.length >= 5) {
      const correlation = calculateCorrelation(
        energyCravingData.map(d => d.energy),
        energyCravingData.map(d => d.avgCravingIntensity * -1) // Inverse relationship expected
      );
      
      correlations.push({
        factor1: 'Energy',
        factor2: 'Craving Intensity',
        coefficient: correlation,
        interpretation: correlation > 0.5 
          ? 'Higher energy levels strongly correlate with less intense cravings.'
          : correlation > 0.3
          ? 'There appears to be some connection between your energy levels and craving intensity.'
          : 'Your craving intensity may be influenced by factors beyond energy levels.',
        strength: getCorrelationStrength(correlation)
      });
    }
    
    // Sleep quality and energy correlation
    const sleepEnergyData = integratedData.filter(d => d.sleep && d.energy);
    if (sleepEnergyData.length >= 5) {
      const correlation = calculateCorrelation(
        sleepEnergyData.map(d => d.sleep),
        sleepEnergyData.map(d => d.energy)
      );
      
      correlations.push({
        factor1: 'Sleep',
        factor2: 'Energy',
        coefficient: correlation,
        interpretation: correlation > 0.5 
          ? 'Better sleep quality strongly predicts higher energy levels the next day.'
          : correlation > 0.3
          ? 'There appears to be some connection between sleep quality and energy levels.'
          : 'Your energy levels may be influenced by multiple factors beyond sleep quality.',
        strength: getCorrelationStrength(correlation)
      });
    }
    
    setCorrelationInsights(correlations);
  };
  
  const calculateCorrelation = (x: number[], y: number[]): number => {
    if (x.length !== y.length || x.length === 0) {
      return 0;
    }
    
    // Calculate means
    const xMean = x.reduce((sum, val) => sum + val, 0) / x.length;
    const yMean = y.reduce((sum, val) => sum + val, 0) / y.length;
    
    // Calculate numerator (covariance) and denominators
    let numerator = 0;
    let xDenom = 0;
    let yDenom = 0;
    
    for (let i = 0; i < x.length; i++) {
      const xDiff = x[i] - xMean;
      const yDiff = y[i] - yMean;
      numerator += xDiff * yDiff;
      xDenom += xDiff * xDiff;
      yDenom += yDiff * yDiff;
    }
    
    // Avoid division by zero
    if (xDenom === 0 || yDenom === 0) {
      return 0;
    }
    
    // Calculate Pearson correlation coefficient
    return numerator / Math.sqrt(xDenom * yDenom);
  };

  // Helper function to determine correlation strength category
  const getCorrelationStrength = (value: number): 'strong' | 'moderate' | 'weak' | 'none' => {
    const absValue = Math.abs(value);
    if (absValue >= 0.7) return 'strong';
    if (absValue >= 0.3) return 'moderate';
    if (absValue > 0) return 'weak';
    return 'none';
  };

  const getKeyInsights = useMemo<HealthInsight[]>(() => {
    if (integratedData.length < 5) {
      return [{
        title: "Not enough data",
        description: "Track more health metrics to receive personalized insights.",
        icon: <AlertCircle className="text-orange-500" />
      }];
    }
    
    const insights: HealthInsight[] = [];
    
    // Check for correlations with strong significance
    const strongCorrelations = correlationInsights.filter(c => Math.abs(c.coefficient) > 0.6);
    if (strongCorrelations.length > 0) {
      insights.push({
        title: `${strongCorrelations[0].factor1} and ${strongCorrelations[0].factor2} Connection`,
        description: strongCorrelations[0].interpretation,
        icon: <Target className="text-blue-500" />
      });
    }
    
    // Check craving success rate
    if (cravingSummary.totalCount > 0) {
      const successRate = (cravingSummary.resistedCount / cravingSummary.totalCount) * 100;
      if (successRate > 70) {
        insights.push({
          title: "Strong Craving Control",
          description: `You've successfully resisted ${successRate.toFixed(0)}% of cravings. Your control is excellent.`,
          icon: <CheckCircle2 className="text-green-500" />
        });
      } else if (successRate < 40) {
        insights.push({
          title: "Craving Challenge",
          description: `You've resisted ${successRate.toFixed(0)}% of cravings. Try using different strategies to improve this.`,
          icon: <Flame className="text-red-500" />
        });
      }
    }
    
    // If we have sleep data with duration, check for sleep quality
    const sleepData = integratedData.filter(d => d.sleep !== undefined && d.sleepDuration !== undefined);
    if (sleepData.length >= 5) {
      const avgSleepDuration = sleepData.reduce((sum, d) => sum + d.sleepDuration, 0) / sleepData.length;
      if (avgSleepDuration < 420) { // Less than 7 hours
        insights.push({
          title: "Sleep Duration",
          description: "You're averaging less than 7 hours of sleep. This may impact your energy levels and cravings.",
          icon: <Moon className="text-indigo-500" />
        });
      }
    }
    
    // Provide a personalized tip based on the day's data
    const todayIsoDate = format(new Date(), 'yyyy-MM-dd');
    const todayData = integratedData.find(d => d.date === todayIsoDate);
    
    if (todayData) {
      if (todayData.cravingCount > 3) {
        insights.push({
          title: "High Craving Day",
          description: "You're experiencing more cravings than usual today. Consider using the resistance strategies.",
          icon: <Flame className="text-orange-500" />
        });
      }
      
      if (todayData.energy < 3 && todayData.mood < 3) {
        insights.push({
          title: "Low Energy and Mood",
          description: "Both energy and mood are low today. Try a short walk or light exercise to boost both.",
          icon: <Zap className="text-yellow-500" />
        });
      }
    }
    
    // Add a motivational insight based on quit progress
    if (daysSinceQuit > 0) {
      if (daysSinceQuit < 7) {
        insights.push({
          title: "Early Progress",
          description: "The first week is the toughest. Keep going, your body is already healing.",
          icon: <TrendingUp className="text-blue-500" />
        });
      } else if (daysSinceQuit >= 30) {
        insights.push({
          title: "Major Milestone",
          description: "You've been smoke-free for a month! Your circulation and lung function are improving significantly.",
          icon: <CheckCircle2 className="text-green-500" />
        });
      }
    }
    
    // Return top 3 insights
    return insights.slice(0, 3);
  }, [integratedData, correlationInsights, cravingSummary, daysSinceQuit]);
  
  const calculateTrend = (values: number[]): number => {
    if (values.length < 2) return 0;
    
    // Simple linear regression for trend
    const n = values.length;
    const x = Array.from({ length: n }, (_, i) => i);
    
    const sumX = x.reduce((a, b) => a + b, 0);
    const sumY = values.reduce((a, b) => a + b, 0);
    const sumXY = x.reduce((sum, xi, i) => sum + xi * values[i], 0);
    const sumXX = x.reduce((sum, xi) => sum + xi * xi, 0);
    
    // Calculate slope
    const slope = (n * sumXY - sumX * sumY) / (n * sumXX - sumX * sumX);
    
    // Normalize by the mean of values to get relative trend
    const meanY = sumY / n;
    return slope / meanY;
  };

  const handleConnectDevice = () => {
    toast.info('Connecting to device...');
    
    // Simulate connection process
    setTimeout(() => {
      // Add a new device
      setIntegratedDevices([...integratedDevices, `device-${integratedDevices.length + 1}`]);
      
      // Update last sync date
      setLastSyncDate(new Date().toISOString());
      
      // Show success message
      toast.success('Device connected successfully');
      hapticFeedback.success();
    }, 1500);
  };

  const handleSyncData = () => {
    setIsSyncing(true);
    toast.info('Syncing health data', {
      description: 'This may take a few moments...'
    });
    
    // Simulate sync delay
    setTimeout(() => {
      setIsSyncing(false);
      setLastSyncDate(new Date().toISOString());
      loadAllHealthMetrics();
      toast.success('Health data synced successfully');
      hapticFeedback.success();
    }, 2000);
  };

  const handleExportData = () => {
    try {
      // Create a comprehensive data object with all health metrics
      const exportData = {
        metadata: {
          userId,
          exportDate: new Date().toISOString(),
          timeframe,
          daysSinceQuit
        },
        healthMetrics,
        correlationInsights,
        integratedData,
        rawData: {
          moodLogs,
          energyLogs,
          focusLogs,
          sleepLogs,
          cravingLogs
        }
      };
      
      // Convert to JSON
      const jsonString = JSON.stringify(exportData, null, 2);
      
      // Create blob and download
      const blob = new Blob([jsonString], { type: 'application/json' });
      const url = URL.createObjectURL(blob);
      const link = document.createElement('a');
      link.href = url;
      link.download = `health-data-export-${format(new Date(), 'yyyy-MM-dd')}.json`;
      document.body.appendChild(link);
      link.click();
      
      // Clean up
      URL.revokeObjectURL(url);
      document.body.removeChild(link);
      
      toast.success('Health data exported successfully');
      hapticFeedback.success();
    } catch (err) {
      console.error('Error exporting health data:', err);
      toast.error('Failed to export health data');
      hapticFeedback.error();
    }
  };

  const handleRefresh = () => {
    setIsSyncing(true);
    
    // Simulate fetching data (replace with actual API call)
    setTimeout(() => {
      setIsSyncing(false);
      
      // Show success toast
      toast.success('Health data refreshed successfully');
      
      // Update connected devices count
      setIntegratedDevices([...integratedDevices, `device-${integratedDevices.length + 1}`]);
    }, 2000);
  };

  const refreshCravingData = () => {
    // Simulated API call
    try {
      toast.info('Fetching your latest craving data...');
      
      // More realistic simulation
      setTimeout(() => {
        toast.info('Analyzing craving patterns...');
        
        // Final update with dummy data for demonstration
        setTimeout(() => {
          const sampleCraving: CravingLog = {
            id: `craving-${cravingLogs.length + 1}`,
            user_id: userId,
            timestamp: new Date().toISOString(),
            intensity: Math.floor(Math.random() * 5) + 1,
            trigger: 'stress',
            location: 'home',
            activity: undefined,
            resisted: Math.random() > 0.5,
            notes: null,
            created_at: new Date().toISOString(),
            triggers: ['stress']
          };
          
          setCravingLogs([...cravingLogs, sampleCraving]);
          toast.success('Craving data updated successfully');
        }, 1000);
      }, 1500);
    } catch (err) {
      console.error('Error refreshing craving data:', err);
      toast.error('Failed to refresh craving data');
    }
  };

  // Add keyboard accessibility handlers
  const handleKeyDown = (e: React.KeyboardEvent, action: () => void) => {
    if (e.key === 'Enter' || e.key === ' ') {
      e.preventDefault();
      action();
    }
  };

  // Device section renderer with improved accessibility
  const renderDeviceSection = () => (
    <Card className="mb-6">
      <CardHeader className="pb-3">
        <div className="flex items-center justify-between">
          <div>
            <CardTitle>Integrated Devices</CardTitle>
            <CardDescription>
              Wearables and apps connected to your health dashboard
            </CardDescription>
          </div>
          <Button 
            variant="outline" 
            size="sm" 
            className="flex items-center gap-2"
            onClick={handleRefresh}
            disabled={isSyncing}
            aria-label="Refresh device data"
          >
            <RefreshCw className={`h-4 w-4 ${isSyncing ? 'animate-spin' : ''}`} />
            <span className="hidden sm:inline">Refresh</span>
          </Button>
      </div>
      </CardHeader>
      <CardContent>
      {integratedDevices.length > 0 ? (
          <div className="space-y-4">
            {integratedDevices.map((device, index) => (
              <div 
                key={index} 
                className="flex items-center justify-between p-3 bg-muted/50 rounded-lg"
                role="group"
                aria-label={`Device ${index + 1}`}
              >
                <div className="flex items-center gap-3">
                  <div className="bg-primary/10 p-2 rounded-full">
                    <Smartphone className="h-5 w-5 text-primary" />
                  </div>
                  <div>
                    <h4 className="text-sm font-medium">Device {index + 1}</h4>
                    <p className="text-xs text-muted-foreground">Last synced: {format(new Date(), 'MMM d, hh:mm a')}</p>
                  </div>
                </div>
                <Badge variant="outline" className="text-xs">Connected</Badge>
              </div>
            ))}
            
            <div 
              className="flex items-center justify-center p-3 border border-dashed border-muted-foreground/30 rounded-lg cursor-pointer hover:bg-muted/30 transition-colors"
              onClick={() => setIntegratedDevices([...integratedDevices, `device-${integratedDevices.length + 1}`])}
              onKeyDown={(e) => handleKeyDown(e, () => setIntegratedDevices([...integratedDevices, `device-${integratedDevices.length + 1}`]))}
              tabIndex={0}
              role="button"
              aria-label="Add new device"
            >
              <div className="flex items-center gap-2 text-muted-foreground">
                <Plus className="h-4 w-4" />
                <span className="text-sm">Add Device</span>
              </div>
          </div>
        </div>
      ) : (
          <div className="flex flex-col items-center justify-center py-8 text-center">
            <div className="bg-muted/50 p-3 rounded-full mb-3">
              <Smartphone className="h-6 w-6 text-muted-foreground" />
          </div>
            <h4 className="text-sm font-medium mb-1">No devices connected</h4>
            <p className="text-xs text-muted-foreground mb-4 max-w-xs">Connect wearables or apps to track your health metrics automatically</p>
            <Button 
              size="sm" 
              variant="outline" 
              className="flex items-center gap-2"
              onClick={() => setIntegratedDevices([...integratedDevices, 'device-1'])}
              aria-label="Connect your first device"
            >
              <Plus className="h-4 w-4" />
              Connect Device
            </Button>
        </div>
      )}
      </CardContent>
    </Card>
  );

  // Add PDF export functionality
  const handleExportPDF = async () => {
    try {
      toast.info('Preparing PDF export...');
      hapticFeedback.medium();
      
      if (dashboardRef.current) {
        // Dynamically import libraries to reduce bundle size
        const { jsPDF } = await import('jspdf');
        const { default: html2canvas } = await import('html2canvas');
        
        const canvas = await html2canvas(dashboardRef.current, {
          scale: 2, // Higher scale for better quality
          useCORS: true, // Allow cross-origin images
          logging: false, // Disable logging
          backgroundColor: document.body.classList.contains('dark') ? '#1f2937' : '#ffffff'
        });
        
        const imgData = canvas.toDataURL('image/png');
        
        const pdf = new jsPDF('p', 'mm', 'a4');
        const pdfWidth = pdf.internal.pageSize.getWidth();
        const pdfHeight = pdf.internal.pageSize.getHeight();
        
        // Add title and metadata
        pdf.setFontSize(16);
        pdf.text('Mission Fresh - Health Report', 10, 10);
        pdf.setFontSize(10);
        pdf.text(`Generated on: ${format(new Date(), 'PPP')}`, 10, 18);
        pdf.text(`Days Since Quit: ${daysSinceQuit}`, 10, 23);
        
        // Add the dashboard image
        pdf.addImage(imgData, 'PNG', 0, 30, pdfWidth, (canvas.height * pdfWidth) / canvas.width);
        
        // Add health metrics summary as a table
        const startY = 30 + (canvas.height * pdfWidth) / canvas.width + 10;
        
        pdf.text('Health Metrics Summary', 10, startY);
        
        // Create table for health metrics
        const tableData: Array<[string, string, string]> = [];
        healthMetrics.forEach(metric => {
          tableData.push([
            metric.title,
            typeof metric.value === 'number' ? `${metric.value}${metric.unit || ''}` : metric.value.toString(),
            metric.interpretation || '' // Added fallback for undefined
          ]);
        });
        
        (pdf as any).autoTable({
          startY: startY + 5,
          head: [['Metric', 'Value', 'Interpretation']],
          body: tableData,
          theme: 'grid',
          styles: { fontSize: 8 },
          headStyles: { fillColor: [41, 128, 185] }
        });
        
        // Add correlation insights if available
        if (correlationInsights.length > 0) {
          const correlationY = (pdf as any).lastAutoTable.finalY + 10;
          pdf.text('Correlation Insights', 10, correlationY);
          
          const correlationData: Array<[string, string, string]> = correlationInsights.map(correlation => [
            `${correlation.factor1} & ${correlation.factor2}`,
            correlation.strength,
            correlation.interpretation
          ]);
          
          (pdf as any).autoTable({
            startY: correlationY + 5,
            head: [['Factors', 'Strength', 'Interpretation']],
            body: correlationData,
            theme: 'grid',
            styles: { fontSize: 8 },
            headStyles: { fillColor: [142, 68, 173] }
          });
        }
        
        // Add footer
        const pageCount = pdf.getNumberOfPages();
        for(let i = 1; i <= pageCount; i++) {
          pdf.setPage(i);
          pdf.setFontSize(8);
          pdf.text(
            'This report is generated by Mission Fresh. Data is based on self-reported information.',
            10,
            pdf.internal.pageSize.getHeight() - 10
          );
        }
        
        // Save the PDF
        pdf.save(`health-report-${format(new Date(), 'yyyy-MM-dd')}.pdf`);
        
        toast.success('Health report exported as PDF');
        hapticFeedback.success();
      } else {
        toast.error('Could not generate PDF from dashboard view');
        hapticFeedback.error();
      }
    } catch (err) {
      console.error('Error exporting PDF:', err);
      toast.error('Failed to export PDF');
      hapticFeedback.error();
    }
  };

  // Overview renderer
  const renderOverview = () => (
    <div className="space-y-6">
      {renderDeviceSection()}
      
      <div className="flex justify-between items-center">
        <h3 className="text-xl font-semibold">Health Metrics</h3>
        <div className="flex gap-2">
          <Button 
            variant="outline" 
            size="sm" 
            onClick={handleExportPDF}
            className="flex items-center gap-2"
          >
            <FileText className="h-4 w-4" />
            <span className="hidden sm:inline">Export PDF</span>
          </Button>
          <Button 
            variant="outline" 
            size="sm" 
            onClick={handleExportData}
            className="flex items-center gap-2"
          >
            <Download className="h-4 w-4" />
            <span className="hidden sm:inline">Export JSON</span>
          </Button>
              </div>
            </div>
            
      <div className="grid grid-cols-1 md:grid-cols-2 xl:grid-cols-3 gap-4">
        {healthMetrics.map((metric, index) => (
          <StatusCard
            key={index}
            title={metric.title}
            value={typeof metric.value === 'number' ? `${metric.value}${metric.unit || ''}` : metric.value}
            icon={metric.icon}
            description={metric.interpretation}
            trend={metric.change}
            trendLabel={metric.change > 0 ? "Improvement" : metric.change < 0 ? "Decline" : "Stable"}
            colorClass={`${metric.color}/10`}
          />
        ))}
            </div>
            
      <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <div>
              <CardTitle>Health Insights</CardTitle>
              <CardDescription>
                Personalized health recommendations based on your data
              </CardDescription>
              </div>
          </CardHeader>
          <CardContent>
            <div className="space-y-4">
              {getKeyInsights.length === 0 ? (
                <Alert>
                  <Info className="h-4 w-4" />
                  <AlertDescription>
                    Log more health data to receive personalized insights.
                  </AlertDescription>
                </Alert>
              ) : (
                getKeyInsights.map((insight, index) => (
                  <div key={index} className="flex items-start">
                    <div className="mr-3 mt-0.5">{insight.icon}</div>
                    <div>
                      <h4 className="text-sm font-medium">{insight.title}</h4>
                      <p className="text-sm text-muted-foreground">{insight.description}</p>
          </div>
      </div>
                ))
              )}
            </div>
          </CardContent>
        </Card>
        
        <CorrelationMatrix 
          correlations={correlationInsights}
        />
      </div>
          </div>
  );

  // Render detailed timeline visualization
  const renderTimelineView = () => (
    <div className="space-y-6">
      <div className="flex flex-col md:flex-row justify-between items-start gap-4 mb-4">
        <div>
          <h2 className="text-2xl font-bold">Health Timeline</h2>
          <p className="text-muted-foreground">
            Track your progress across different health metrics
          </p>
          </div>
        <div className="flex flex-wrap gap-2 md:gap-3">
          <Button
            variant={timeframe === 'week' ? 'default' : 'outline'}
            size={isMobile ? 'sm' : 'default'}
            className={isMobile ? 'px-3 py-1 text-sm h-8' : ''}
            onClick={() => setTimeframe('week')}
          >
            Week
          </Button>
          <Button
            variant={timeframe === 'month' ? 'default' : 'outline'}
            size={isMobile ? 'sm' : 'default'}
            className={isMobile ? 'px-3 py-1 text-sm h-8' : ''}
            onClick={() => setTimeframe('month')}
          >
            Month
          </Button>
          <Button
            variant={timeframe === 'all' ? 'default' : 'outline'}
            size={isMobile ? 'sm' : 'default'}
            className={isMobile ? 'px-3 py-1 text-sm h-8' : ''}
            onClick={() => setTimeframe('all')}
          >
            All
          </Button>
          </div>
        </div>
        
      <Card className="relative">
        <CardHeader className="pb-2">
          <CardTitle>Integrated Health Metrics</CardTitle>
          <CardDescription>
            How your mood, energy, focus, sleep, and cravings interact over time
          </CardDescription>
        </CardHeader>
        
        <CardContent className="pt-0">
          {integratedData.length > 0 ? (
            <div className="h-[300px] sm:h-[350px] md:h-[400px] touch-manipulation relative">
              {isMobile && (
                <div className="absolute left-0 right-0 top-0 py-1 px-2 text-center z-10">
                  <Badge variant="outline" className="bg-background/80 backdrop-blur-sm text-xs">
                    Pinch to zoom, drag to pan
                  </Badge>
          </div>
        )}
              <ResponsiveContainer width="100%" height="100%">
                <ComposedChart
                  data={integratedData}
                  margin={{ 
                    top: 20, 
                    right: isMobile ? 10 : 20, 
                    bottom: isMobile ? 60 : 20, 
                    left: isMobile ? 5 : 10 
                  }}
                >
                  <CartesianGrid strokeDasharray="3 3" opacity={0.2} />
                  <XAxis 
                    dataKey="date" 
                    tickFormatter={(date) => format(new Date(date), isMobile ? 'd MMM' : 'd MMM yyyy')}
                    angle={isMobile ? -45 : 0}
                    textAnchor={isMobile ? "end" : "middle"}
                    height={isMobile ? 60 : 30}
                    tick={{ fontSize: isMobile ? 10 : 12 }}
                    interval={isMobile ? 'preserveStartEnd' : 0}
                  />
                  <YAxis 
                    yAxisId="left" 
                    orientation="left" 
                    domain={[0, 5]}
                    tick={{ fontSize: isMobile ? 10 : 12 }}
                    tickCount={isMobile ? 6 : 11}
                    width={isMobile ? 25 : 30}
                  />
                  <YAxis 
                    yAxisId="right" 
                    orientation="right" 
                    domain={[0, 10]}
                    tick={{ fontSize: isMobile ? 10 : 12 }}
                    tickCount={isMobile ? 6 : 11}
                    width={isMobile ? 25 : 30}
                  />
                  <RechartsTooltip 
                    cursor={{ strokeDasharray: '3 3' }}
                    formatter={(value, name) => {
                      if (name === "cravingCount") return [`${value} cravings`, "Cravings"];
                      if (name === "mood") return [`${value}/5`, "Mood"];
                      if (name === "energy") return [`${value}/5`, "Energy"];
                      if (name === "focus") return [`${value}/5`, "Focus"];
                      if (name === "sleep") return [`${value}/5`, "Sleep"];
                      return [value, name];
                    }}
                    wrapperStyle={{ 
                      backgroundColor: 'rgba(255, 255, 255, 0.9)',
                      border: '1px solid #f0f0f0',
                      borderRadius: '4px',
                      padding: '10px',
                      fontSize: isMobile ? '10px' : '12px',
                      zIndex: 1000
                    }}
                  />
                  <Legend 
                    layout={isMobile ? "horizontal" : "vertical"}
                    verticalAlign={isMobile ? "bottom" : "middle"}
                    align={isMobile ? "center" : "right"}
                    wrapperStyle={isMobile ? { bottom: -50 } : { right: -10, top: 30 }}
                    iconSize={isMobile ? 8 : 10}
                    fontSize={isMobile ? 10 : 12}
                  />
                  
                  <Line 
                    yAxisId="left" 
                    type="monotone" 
                    dataKey="mood" 
                    name="Mood" 
                    stroke="#f43f5e" 
                    strokeWidth={2} 
                    dot={{ r: isMobile ? 2 : 3 }} 
                    activeDot={{ r: isMobile ? 4 : 6 }}
                  />
                  <Line 
                    yAxisId="left" 
                    type="monotone" 
                    dataKey="energy" 
                    name="Energy" 
                    stroke="#3b82f6" 
                    strokeWidth={2}
                    dot={{ r: isMobile ? 2 : 3 }}
                    activeDot={{ r: isMobile ? 4 : 6 }}
                  />
                  <Line 
                    yAxisId="left" 
                    type="monotone" 
                    dataKey="focus" 
                    name="Focus" 
                    stroke="#14b8a6" 
                    strokeWidth={2}
                    dot={{ r: isMobile ? 2 : 3 }}
                    activeDot={{ r: isMobile ? 4 : 6 }}
                  />
                  <Line 
                    yAxisId="left" 
                    type="monotone" 
                    dataKey="sleep" 
                    name="Sleep" 
                    stroke="#8b5cf6" 
                    strokeWidth={2}
                    dot={{ r: isMobile ? 2 : 3 }}
                    activeDot={{ r: isMobile ? 4 : 6 }}
                  />
                  <Bar 
                    yAxisId="right" 
                    dataKey="cravingCount" 
                    name="Cravings" 
                    fill="#fb923c"
                    opacity={0.8}
                    barSize={isMobile ? 10 : 15}
                  />
                </ComposedChart>
              </ResponsiveContainer>
      </div>
          ) : (
            <div className="text-center py-10">
              <p className="text-muted-foreground">Not enough data to display timeline.</p>
              <p className="text-sm text-muted-foreground mt-2">Track your health metrics regularly to see trends over time.</p>
    </div>
          )}
        </CardContent>
      </Card>
      
      <div className="grid grid-cols-1 md:grid-cols-2 gap-6 mt-6">
        <Card className="relative">
          <CardHeader>
            <CardTitle>Mood & Energy Patterns</CardTitle>
            <CardDescription>
              How your mood and energy levels interact
            </CardDescription>
          </CardHeader>
          <CardContent>
            {integratedData.length > 5 ? (
              <div className="h-[250px] sm:h-[300px] relative">
                <ResponsiveContainer width="100%" height="100%">
                  <ScatterChart
                    margin={{
                      top: 20,
                      right: isMobile ? 10 : 20,
                      bottom: isMobile ? 40 : 20,
                      left: isMobile ? 10 : 20,
                    }}
                  >
                    <CartesianGrid strokeDasharray="3 3" opacity={0.2} />
                    <XAxis 
                      type="number" 
                      dataKey="mood" 
                      name="Mood" 
                      domain={[0, 5]} 
                      label={isMobile ? {} : { 
                        value: 'Mood', 
                        position: 'bottom', 
                        offset: 5 
                      }}
                      tick={{ fontSize: isMobile ? 10 : 12 }}
                    />
                    <YAxis 
                      type="number" 
                      dataKey="energy" 
                      name="Energy" 
                      domain={[0, 5]} 
                      label={isMobile ? {} : { 
                        value: 'Energy', 
                        angle: -90, 
                        position: 'left', 
                        offset: 5 
                      }}
                      tick={{ fontSize: isMobile ? 10 : 12 }}
                    />
                    <ZAxis type="number" range={[50, 400]} />
                    <RechartsTooltip 
                      cursor={{ strokeDasharray: '3 3' }}
                      formatter={(value, name) => {
                        if (name === "mood") return [`${value}/5`, "Mood"];
                        if (name === "energy") return [`${value}/5`, "Energy"];
                        if (name === "z") return [`${value}`, "Date"];
                        return [value, name];
                      }}
                      wrapperStyle={{ 
                        backgroundColor: 'rgba(255, 255, 255, 0.9)',
                        border: '1px solid #f0f0f0',
                        borderRadius: '4px',
                        padding: '10px',
                        fontSize: isMobile ? '10px' : '12px',
                        zIndex: 1000
                      }}
                    />
                    <Scatter 
                      name="Mood-Energy Correlation" 
                      data={integratedData.filter(d => d.mood !== undefined && d.energy !== undefined)} 
                      fill="#8884d8"
                      shape={props => {
                        const { cx, cy } = props;
  return (
                          <circle 
                            cx={cx} 
                            cy={cy} 
                            r={isMobile ? 6 : 8} 
                            fill="rgba(136, 132, 216, 0.6)"
                            stroke="#8884d8"
                            strokeWidth={1}
                          />
                        );
                      }}
                    />
                  </ScatterChart>
                </ResponsiveContainer>
                
                {isMobile && (
                  <div className="absolute bottom-1 left-0 right-0 text-center">
                    <p className="text-xs text-muted-foreground">Mood (horizontal) vs Energy (vertical)</p>
                </div>
                )}
              </div>
            ) : (
              <div className="text-center py-10">
                <p className="text-muted-foreground">Not enough data to display patterns.</p>
                <p className="text-sm text-muted-foreground mt-2">Log both mood and energy regularly to see correlations.</p>
              </div>
            )}
          </CardContent>
            </Card>
        
        <Card className="relative">
          <CardHeader>
            <CardTitle>Focus & Sleep Impact</CardTitle>
            <CardDescription>
              How sleep quality affects your focus levels
            </CardDescription>
          </CardHeader>
          <CardContent>
            {integratedData.filter(d => d.focus !== undefined && d.sleep !== undefined).length > 5 ? (
              <div className="h-[250px] sm:h-[300px] relative">
                <ResponsiveContainer width="100%" height="100%">
                  <ScatterChart
                    margin={{
                      top: 20,
                      right: isMobile ? 10 : 20,
                      bottom: isMobile ? 40 : 20,
                      left: isMobile ? 10 : 20,
                    }}
                  >
                    <CartesianGrid strokeDasharray="3 3" opacity={0.2} />
                    <XAxis 
                      type="number" 
                      dataKey="sleep" 
                      name="Sleep" 
                      domain={[0, 5]} 
                      label={isMobile ? {} : { 
                        value: 'Sleep Quality', 
                        position: 'bottom', 
                        offset: 5 
                      }}
                      tick={{ fontSize: isMobile ? 10 : 12 }}
                    />
                    <YAxis 
                      type="number" 
                      dataKey="focus" 
                      name="Focus" 
                      domain={[0, 5]} 
                      label={isMobile ? {} : { 
                        value: 'Focus', 
                        angle: -90, 
                        position: 'left', 
                        offset: 5 
                      }}
                      tick={{ fontSize: isMobile ? 10 : 12 }}
                    />
                    <ZAxis type="number" range={[50, 400]} />
                    <RechartsTooltip 
                      cursor={{ strokeDasharray: '3 3' }}
                      formatter={(value, name) => {
                        if (name === "sleep") return [`${value}/5`, "Sleep Quality"];
                        if (name === "focus") return [`${value}/5`, "Focus"];
                        if (name === "z") return [`${value}`, "Date"];
                        return [value, name];
                      }}
                      wrapperStyle={{ 
                        backgroundColor: 'rgba(255, 255, 255, 0.9)',
                        border: '1px solid #f0f0f0',
                        borderRadius: '4px',
                        padding: '10px',
                        fontSize: isMobile ? '10px' : '12px',
                        zIndex: 1000
                      }}
                    />
                    <Scatter 
                      name="Sleep-Focus Correlation" 
                      data={integratedData.filter(d => d.focus !== undefined && d.sleep !== undefined)} 
                      fill="#14b8a6"
                      shape={props => {
                        const { cx, cy } = props;
                        return (
                          <circle 
                            cx={cx} 
                            cy={cy} 
                            r={isMobile ? 6 : 8} 
                            fill="rgba(20, 184, 166, 0.6)"
                            stroke="#14b8a6"
                            strokeWidth={1}
                          />
                        );
                      }}
                    />
                  </ScatterChart>
                </ResponsiveContainer>
                
                {isMobile && (
                  <div className="absolute bottom-1 left-0 right-0 text-center">
                    <p className="text-xs text-muted-foreground">Sleep Quality (horizontal) vs Focus (vertical)</p>
              </div>
                )}
              </div>
            ) : (
              <div className="text-center py-10">
                <p className="text-muted-foreground">Not enough data to display patterns.</p>
                <p className="text-sm text-muted-foreground mt-2">Log both focus and sleep regularly to see correlations.</p>
              </div>
            )}
          </CardContent>
            </Card>
                </div>
                </div>
  );

  if (loading) {
    return (
      <div className="flex items-center justify-center min-h-[400px]">
        <div className="animate-spin rounded-full h-12 w-12 border-t-2 border-b-2 border-primary"></div>
                </div>
    );
  }

  return (
    <div className="relative space-y-6 pb-10" ref={dashboardRef}>
      <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center gap-4 mb-6">
        <div>
          <h2 className="text-2xl font-bold tracking-tight" id="health-dashboard-heading">Integrated Health Dashboard</h2>
          <p className="text-muted-foreground">
            Track your progress across all health metrics
          </p>
                </div>
                
        {daysSinceQuit > 0 && (
          <div className="flex items-center gap-2 bg-muted/50 p-2 rounded-lg">
            <Badge variant="outline" className="bg-green-500/10 text-green-600 hover:bg-green-500/20 transition-colors">
              {daysSinceQuit} {daysSinceQuit === 1 ? 'Day' : 'Days'} Smoke-Free
            </Badge>
            <div 
              className="p-1 rounded-full bg-muted hover:bg-muted-foreground/10 cursor-pointer transition-colors"
              onClick={() => toast.info(`You've been smoke-free for ${daysSinceQuit} days. Keep it up!`)}
              onKeyDown={(e) => handleKeyDown(e, () => toast.info(`You've been smoke-free for ${daysSinceQuit} days. Keep it up!`))}
              tabIndex={0}
              role="button"
              aria-label="Show smoke-free information"
            >
              <Info className="h-3.5 w-3.5 text-muted-foreground" />
                </div>
                </div>
        )}
              </div>
      
      <Tabs defaultValue={activeTab} onValueChange={setActiveTab} aria-label="Health dashboard views">
        <TabsList className="grid grid-cols-2 w-full sm:w-auto mb-6">
          <TabsTrigger value="overview" aria-controls="overview-tab-content">Overview</TabsTrigger>
          <TabsTrigger value="timeline" aria-controls="timeline-tab-content">Timeline</TabsTrigger>
        </TabsList>
        
        <div className="min-h-[400px]">
          <TabsContent value="overview" id="overview-tab-content">
            {renderOverview()}
          </TabsContent>
          
          <TabsContent value="timeline" id="timeline-tab-content">
            {renderTimelineView()}
          </TabsContent>
        </div>
        </Tabs>
      
      <ZoomControls />
    </div>
  );
}; 