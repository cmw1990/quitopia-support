import React, { useEffect, useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { format, differenceInDays, differenceInHours, addDays, parseISO } from 'date-fns';
import { 
  Cigarette, 
  Leaf,
  Timer,
  DollarSign,
  TrendingUp,
  ChevronRight,
  PiggyBank,
  Calendar,
  Clock,
  Zap,
  Brain,
  Wind,
  Droplet,
  Activity,
  Medal,
  Target,
  LineChart,
  BarChart3,
  Smile,
  Frown,
  Coffee,
  BatteryMedium,
  BrainCircuit,
  AreaChart as AreaChartIcon,
  AlertTriangle,
  Info,
  BarChart,
  ZapOff,
  ScanLine,
  ArrowRight,
  Moon
} from 'lucide-react';
import { motion } from 'framer-motion';
import { 
  getUserProgress, 
  getHealthImprovements,
  shareProgressToSocial
} from "../api/apiCompatibility";
import { Button, Progress, SmokeFreeCounter, SavingsCalculator, HealthImprovementCard, SectionCard, Card, CardContent, CardHeader, CardTitle, CardDescription, Badge } from './ui';
import { HealthMetricsSection } from './ui/health-metrics-section';
import { EnvironmentalImpactSection } from './ui/environmental-impact-section';
import { 
  calculateHealthImprovement, 
  calculateCigarettesAvoided,
  calculateCarbonReduction,
  calculateSavings
} from '../lib/health-calculation';
import {
  HealthImprovement,
  HealthMetric,
  SavingsDetail
} from '../types/dataTypes';
import { toast } from 'sonner';
import { HolisticDashboard } from './health/HolisticDashboard';
import { HolisticHealthProvider } from './health/HolisticDashboard/HolisticHealthContext';
import { CravingNotifier } from './health/CravingNotifier';
import { ApiErrorFallback } from './ApiErrorFallback';

// Create custom icon components for the missing icons
const MoodHappy = (props: any) => (
  <svg
    xmlns="http://www.w3.org/2000/svg"
    width="24"
    height="24"
    viewBox="0 0 24 24"
    fill="none"
    stroke="currentColor"
    strokeWidth="2"
    strokeLinecap="round"
    strokeLinejoin="round"
    {...props}
  >
    <circle cx="12" cy="12" r="10" />
    <path d="M8 14s1.5 2 4 2 4-2 4-2" />
    <line x1="9" y1="9" x2="9.01" y2="9" />
    <line x1="15" y1="9" x2="15.01" y2="9" />
  </svg>
);

const MoodSad = (props: any) => (
  <svg
    xmlns="http://www.w3.org/2000/svg"
    width="24"
    height="24"
    viewBox="0 0 24 24"
    fill="none"
    stroke="currentColor"
    strokeWidth="2"
    strokeLinecap="round"
    strokeLinejoin="round"
    {...props}
  >
    <circle cx="12" cy="12" r="10" />
    <path d="M16 16s-1.5-2-4-2-4 2-4 2" />
    <line x1="9" y1="9" x2="9.01" y2="9" />
    <line x1="15" y1="9" x2="15.01" y2="9" />
  </svg>
);

const Lightbulb = (props: any) => (
  <svg
    xmlns="http://www.w3.org/2000/svg"
    width="24"
    height="24"
    viewBox="0 0 24 24"
    fill="none"
    stroke="currentColor"
    strokeWidth="2"
    strokeLinecap="round"
    strokeLinejoin="round"
    {...props}
  >
    <path d="M9 18h6" />
    <path d="M10 22h4" />
    <path d="M12 2v4" />
    <path d="M4.93 10.93l2.83 2.83" />
    <path d="M16.24 13.76l2.83 2.83" />
    <path d="M19.07 10.93l-2.83 2.83" />
    <path d="M4.93 13.76l2.83-2.83" />
    <path d="M12 6a6 6 0 0 1 5 9.33c-.83 1.33-3 2.67-3 3.67v1" />
  </svg>
);

const Gauge = (props: any) => (
  <svg
    xmlns="http://www.w3.org/2000/svg"
    width="24"
    height="24"
    viewBox="0 0 24 24"
    fill="none"
    stroke="currentColor"
    strokeWidth="2"
    strokeLinecap="round"
    strokeLinejoin="round"
    {...props}
  >
    <path d="M12 15l3.5-3.5" />
    <path d="M20.3 18c.4-1 .7-2.2.7-3.4C21 9.8 17 6 12 6s-9 3.8-9 8.6c0 1.2.3 2.4.7 3.4" />
  </svg>
);

// Add breathing animation for the leaf
const breathingAnimation = {
  initial: { scale: 1 },
  animate: {
    scale: [1, 1.05, 1],
    transition: {
      duration: 3,
      repeat: Infinity,
      ease: "easeInOut"
    }
  }
};

interface DashboardProps {
  session: any;
}

export const Dashboard: React.FC<DashboardProps> = ({ session }) => {
  const navigate = useNavigate();
  const [isLoading, setIsLoading] = useState<boolean>(true);
  const [error, setError] = useState<Error | null>(null);
  const [userData, setUserData] = useState<any>(null);
  const [quitDate, setQuitDate] = useState<string | null>(null);
  const [quitDateObject, setQuitDateObject] = useState<Date | null>(null);
  const [daysSinceQuit, setDaysSinceQuit] = useState<number>(0);
  const [hoursSinceQuit, setHoursSinceQuit] = useState<number>(0);
  const [cigarettesAvoided, setCigarettesAvoided] = useState<number>(0);
  const [dailyAvgCigarettes, setDailyAvgCigarettes] = useState<number>(0);
  const [cigarettesPerPack, setCigarettesPerPack] = useState<number>(20);
  const [pricePerPack, setPricePerPack] = useState<number>(0);
  const [healthImprovement, setHealthImprovement] = useState<number>(0);
  const [upcomingMilestones, setUpcomingMilestones] = useState<HealthImprovement[]>([]);
  const [savingsDetail, setSavingsDetail] = useState<SavingsDetail>({
    daily: 0,
    weekly: 0,
    monthly: 0,
    yearly: 0,
    total: 0
  });
  const [carbonReduction, setCarbonReduction] = useState<number>(0);
  const [healthMetrics, setHealthMetrics] = useState<HealthMetric[]>([]);
  const [smokeFreeStreak, setSmokeFreeStreak] = useState<number>(0);
  const [totalSavings, setTotalSavings] = useState<number>(0);
  const [healthScore, setHealthScore] = useState<number>(0);
  const [holisticMetrics, setHolisticMetrics] = useState<{
    mood: number;
    energy: number;
    focus: number;
    fatigue: number;
  }>({
    mood: 50,
    energy: 50,
    focus: 50,
    fatigue: 50
  });
  const [isSharing, setIsSharing] = useState<boolean>(false);
  const [shareMessage, setShareMessage] = useState<string>('');
  
  // Reset error state
  const resetError = () => setError(null);
  
  // Retry loading data
  const retryLoadData = async () => {
    setIsLoading(true);
    setError(null);
    await loadUserData();
  };
  
  // Load user data when the component mounts
  useEffect(() => {
    loadUserData();
  }, [session]);
  
  // Load user data
  const loadUserData = async () => {
    try {
      if (!session?.user?.id) {
        // Only log warning in development
        if (import.meta.env.DEV) {
          console.warn('No user session available');
        }
        setIsLoading(false);
        return;
      }
      
      // Get user profile data
      const startDate = new Date(new Date().setDate(new Date().getDate() - 30)).toISOString().split('T')[0];
      const endDate = new Date().toISOString().split('T')[0];
      
      const response = await getUserProgress(
        session.user.id,
        startDate,
        endDate,
        session
      );
      
      if (response?.userProfile) {
        // Set quit date
        setQuitDate(response.userProfile.quit_date);
        
        // Set cigarettes and price per pack for calculations
        if (response.userProfile.cigarettes_per_pack) {
          setCigarettesPerPack(response.userProfile.cigarettes_per_pack);
        }
        
        if (response.userProfile.price_per_pack) {
          setPricePerPack(response.userProfile.price_per_pack);
        }
        
        if (response.userProfile.daily_cigarettes) {
          setDailyAvgCigarettes(response.userProfile.daily_cigarettes);
        }
        
        // Set health score
        setHealthScore(response.healthScore || 0);
      }
      
      // Get health improvements
      try {
        const healthImprovements = await getHealthImprovements(
          session?.user?.id || '',
          quitDate || '',
          session
        );
        
        if (healthImprovements && healthImprovements.length > 0) {
          setUpcomingMilestones(healthImprovements);
        }
      } catch (error) {
        // Only log error in development
        if (import.meta.env.DEV) {
          console.error('Error loading health improvements:', error);
        }
        // Continue without health improvements data
      }
      
      setIsLoading(false);
    } catch (error) {
      // Only log error in development
      if (import.meta.env.DEV) {
        console.error('Error loading dashboard data:', error);
      }
      setError(error instanceof Error ? error : new Error('Failed to load dashboard data'));
      setIsLoading(false);
    }
  };
  
  // Handle quit date parsing
  useEffect(() => {
    if (quitDate) {
      try {
        // Safely parse the quit date
        const parsedDate = parseISO(quitDate);
        if (isNaN(parsedDate.getTime())) {
          // Only log error in development
          if (import.meta.env.DEV) {
            console.error('Invalid date format:', quitDate);
          }
          setQuitDateObject(new Date());
        } else {
          setQuitDateObject(parsedDate);
        }
      } catch (error) {
        // Only log error in development
        if (import.meta.env.DEV) {
          console.error('Error parsing quit date:', error);
        }
        setQuitDateObject(new Date());
      }
    } else {
      setQuitDateObject(null);
    }
  }, [quitDate]);
  
  // Calculate metrics based on quit date
  useEffect(() => {
    if (quitDateObject) {
      // Calculate days since quitting
      const days = differenceInDays(new Date(), quitDateObject);
      setDaysSinceQuit(Math.max(0, days));
      
      // Calculate hours if less than a day
      if (days < 1) {
        const hours = differenceInHours(new Date(), quitDateObject);
        setHoursSinceQuit(Math.max(0, hours));
      }
      
      // Calculate cigarettes avoided
      const avoided = calculateCigarettesAvoided(quitDateObject, dailyAvgCigarettes);
      setCigarettesAvoided(avoided);
      
      // Calculate health improvement percentage
      const improvement = calculateHealthImprovement(quitDateObject);
      setHealthImprovement(Math.round(improvement));
      
      // Calculate savings
      const savings = calculateSavings(quitDateObject, pricePerPack, dailyAvgCigarettes / cigarettesPerPack);
      setSavingsDetail(savings);
      
      // Calculate carbon footprint reduction
      const co2Reduced = calculateCarbonReduction(avoided);
      setCarbonReduction(co2Reduced);
      
      // Set health metrics
      const metrics: HealthMetric[] = [
        {
          id: 'heartRate',
          title: 'Heart Rate',
          value: Math.min(days, 3) / 3 * 100,
          unit: 'bpm',
          icon: <Leaf className="h-5 w-5 text-green-500" />,
          description: 'Your heart rate and blood pressure drop to normal levels.',
          improvement: Math.min(days, 3) / 3 * 100
        },
        {
          id: 'oxygenLevels',
          title: 'Oxygen Levels',
          value: Math.min(days, 14) / 14 * 100,
          unit: '%',
          icon: <Wind className="h-5 w-5 text-green-500" />,
          description: 'Oxygen levels return to normal and breathing becomes easier.',
          improvement: Math.min(days, 14) / 14 * 100
        },
        {
          id: 'circulation',
          title: 'Circulation',
          value: Math.min(days, 30) / 30 * 100,
          unit: '%',
          icon: <Activity className="h-5 w-5 text-green-500" />,
          description: 'Your circulation has improved, making physical activity easier.',
          improvement: Math.min(days, 30) / 30 * 100
        },
        {
          id: 'lungFunction',
          title: 'Lung Function',
          value: Math.min(days, 90) / 90 * 100,
          unit: '%',
          icon: <Wind className="h-5 w-5 text-green-500" />,
          description: 'Your lung function is improving, reducing coughing and shortness of breath.',
          improvement: Math.min(days, 90) / 90 * 100
        },
        {
          id: 'taste',
          title: 'Taste & Smell',
          value: Math.min(days, 10) / 10 * 100,
          unit: '%',
          icon: <Droplet className="h-5 w-5 text-green-500" />,
          description: 'Your senses of taste and smell are getting sharper.',
          improvement: Math.min(days, 10) / 10 * 100
        },
        {
          id: 'cognition',
          title: 'Brain Function',
          value: Math.min(days, 14) / 14 * 100,
          unit: '%',
          icon: <Brain className="h-5 w-5 text-green-500" />,
          description: 'Improved blood flow to the brain enhances cognitive function.',
          improvement: Math.min(days, 14) / 14 * 100
        }
      ];
      
      setHealthMetrics(metrics);
      
      // Process health milestones
      if (upcomingMilestones.length > 0) {
        const processedMilestones = upcomingMilestones.map(milestone => {
          // Convert timeline_hours to days for display purposes
          const daysRequired = Math.ceil(milestone.timeline_hours / 24);
          return {
            ...milestone,
            daysRequired: daysRequired,
            achieved: days >= daysRequired
          };
        });
        
        setUpcomingMilestones(processedMilestones);
      }
      
      // Calculate holistic improvements
      // These follow a curve where improvements start slow, accelerate, then plateau
      const calculateHolisticImprovement = (
        baseDays: number,   // Days until noticeable improvement
        maxDays: number,    // Days until maximum improvement
        minValue: number,   // Starting value (percentage)
        maxValue: number    // Maximum value (percentage)
      ) => {
        if (days < baseDays) {
          // Initial slow improvement
          return minValue + (maxValue - minValue) * 0.2 * (days / baseDays);
        } else if (days < maxDays) {
          // Rapid improvement phase
          const progress = (days - baseDays) / (maxDays - baseDays);
          return minValue + (maxValue - minValue) * (0.2 + 0.8 * progress);
        } else {
          // Plateau at maximum
          return maxValue;
        }
      };
      
      setHolisticMetrics({
        // Mood improvement: starts at day 3, reaches 85% by day 30
        mood: calculateHolisticImprovement(3, 30, 50, 85),
        
        // Energy improvement: starts at day 2, reaches 90% by day 21
        energy: calculateHolisticImprovement(2, 21, 50, 90),
        
        // Focus improvement: starts at day 5, reaches 80% by day 28
        focus: calculateHolisticImprovement(5, 28, 50, 80),
        
        // Fatigue resistance: starts at day 7, reaches 75% by day 42
        fatigue: calculateHolisticImprovement(7, 42, 50, 75)
      });
    }
  }, [quitDateObject, dailyAvgCigarettes, cigarettesPerPack, pricePerPack, upcomingMilestones]);
  
  // Set up health metrics whenever data changes
  useEffect(() => {
    if (quitDate && daysSinceQuit > 0) {
      // Generate health metrics based on smoke-free days and health score
      const newHealthMetrics: HealthMetric[] = [
        {
          id: 'lungFunction',
          title: 'Lung Function',
          value: calculateMetricValue(daysSinceQuit, 10, 90, 30),
          unit: '%',
          icon: <Wind className="h-5 w-5 text-green-500" />,
          description: 'Your lungs are getting stronger every day',
          improvement: Math.min(Math.round(daysSinceQuit / 30 * 100), 90)
        },
        {
          id: 'bloodCirculation',
          title: 'Blood Circulation',
          value: calculateMetricValue(daysSinceQuit, 5, 90, 14),
          unit: '%',
          icon: <Leaf className="h-5 w-5 text-green-500" />,
          description: 'Your circulation is improving since quitting',
          improvement: Math.min(Math.round(daysSinceQuit / 14 * 100), 95)
        },
        {
          id: 'oxygenLevels',
          title: 'Oxygen Levels',
          value: calculateMetricValue(daysSinceQuit, 20, 99, 7),
          unit: '%',
          icon: <Droplet className="h-5 w-5 text-green-500" />,
          description: 'Your blood oxygen levels are increasing',
          improvement: Math.min(Math.round(daysSinceQuit / 7 * 100), 98)
        },
        {
          id: 'healingProgress',
          title: 'Recovery Progress',
          value: healthScore,
          unit: '%',
          icon: <Activity className="h-5 w-5 text-green-500" />,
          description: 'Overall healing progress based on your health data',
          improvement: Math.min(healthScore, 100)
        }
      ];
      
      setHealthMetrics(newHealthMetrics);
      
      // Calculate overall health improvement percentage
      const avgImprovement = newHealthMetrics.reduce((sum, metric) => sum + metric.improvement, 0) / newHealthMetrics.length;
      setHealthImprovement(Math.round(avgImprovement));
    }
  }, [quitDate, daysSinceQuit, healthScore]);

  // Helper function to calculate metric values based on days
  const calculateMetricValue = (
    days: number, 
    minValue: number, 
    maxValue: number, 
    daysToMax: number
  ): number => {
    const progress = Math.min(days / daysToMax, 1);
    return Math.round(minValue + progress * (maxValue - minValue));
  };
  
  // Add a function to convert string icons to React components
  const iconFromString = (iconName: string): React.ReactNode => {
    switch (iconName.toLowerCase()) {
      case 'heart':
        return <Leaf className="h-5 w-5" />;
      case 'lungs':
      case 'wind':
        return <Wind className="h-5 w-5" />;
      case 'brain':
        return <Brain className="h-5 w-5" />;
      case 'leaf':
        return <Leaf className="h-5 w-5" />;
      case 'zap':
        return <Zap className="h-5 w-5" />;
      case 'droplet':
        return <Droplet className="h-5 w-5" />;
      case 'smile':
        return <Leaf className="h-5 w-5" />;
      case 'clock':
        return <Clock className="h-5 w-5" />;
      default:
        return <Activity className="h-5 w-5" />;
    }
  };
  
  const containerVariants = {
    hidden: { opacity: 0 },
    visible: {
      opacity: 1,
      transition: {
        staggerChildren: 0.1
      }
    }
  };
  
  const itemVariants = {
    hidden: { y: 20, opacity: 0 },
    visible: {
      y: 0,
      opacity: 1,
      transition: {
        type: 'spring',
        stiffness: 80,
        damping: 10
      }
    }
  };
  
  // This is the Holistic Well-being section
  const renderHolisticSection = () => {
    if (!quitDateObject) {
      return null;
    }
    
    // Restore the internal function definitions
    const getMoodIcon = () => {
      if (holisticMetrics.mood >= 75) return <Smile className="h-5 w-5 text-green-500" />;
      if (holisticMetrics.mood >= 50) return <Smile className="h-5 w-5 text-amber-500" />;
      return <Frown className="h-5 w-5 text-red-500" />;
    };
    
    const getEnergyIcon = () => {
      if (holisticMetrics.energy >= 75) return <Zap className="h-5 w-5 text-green-500" />;
      if (holisticMetrics.energy >= 50) return <BatteryMedium className="h-5 w-5 text-amber-500" />;
      return <ZapOff className="h-5 w-5 text-red-500" />;
    };
    
    const getFocusIcon = () => {
      if (holisticMetrics.focus >= 75) return <BrainCircuit className="h-5 w-5 text-green-500" />;
      if (holisticMetrics.focus >= 50) return <Brain className="h-5 w-5 text-amber-500" />;
      return <Brain className="h-5 w-5 text-red-500" />;
    };
    
    const getFatigueIcon = () => {
      if (holisticMetrics.fatigue <= 25) return <Wind className="h-5 w-5 text-green-500" />;
      if (holisticMetrics.fatigue <= 50) return <Coffee className="h-5 w-5 text-amber-500" />;
      return <Moon className="h-5 w-5 text-red-500" />;
    };
    
    // Calculate correlations (example values, ideally would be calculated from actual data)
    const correlations = {
      moodEnergy: 75,
      moodFocus: 68,
      energyFocus: 82,
      energyFatigue: 70,
      focusFatigue: 65
    };
    
    // Helper function to get correlation color
    const getCorrelationColor = (value: number) => {
      if (value >= 80) return "text-green-500 bg-green-500";
      if (value >= 60) return "text-emerald-500 bg-emerald-500";
      if (value >= 40) return "text-yellow-500 bg-yellow-500";
      return "text-red-500 bg-red-500";
    };
    
    return (
      <div className="space-y-4">
        <div className="flex items-center justify-between">
          <h2 className="text-2xl font-semibold">Holistic Health Tracking</h2>
          <Button variant="outline" onClick={() => navigate('/app/health/holistic')} className="text-sm">
            View Full Dashboard
          </Button>
        </div>
        
        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
          <Card className="overflow-hidden">
            <CardHeader className="pb-2">
              <CardTitle className="text-md font-semibold flex items-center">
                {getMoodIcon()}
                <span className="ml-2">Mood Tracking</span>
              </CardTitle>
              <CardDescription>
                Monitor how your mood changes during your quit journey
              </CardDescription>
            </CardHeader>
            <CardContent>
              <div className="mt-2 flex justify-end">
                <Button variant="ghost" size="sm" onClick={() => navigate('/app/health/mood')} className="text-xs">
                  Track Mood <ChevronRight className="h-4 w-4 ml-1" />
                </Button>
              </div>
            </CardContent>
          </Card>
          
          <Card className="overflow-hidden">
            <CardHeader className="pb-2">
              <CardTitle className="text-md font-semibold flex items-center">
                {getEnergyIcon()}
                <span className="ml-2">Energy Levels</span>
              </CardTitle>
              <CardDescription>
                See how your energy improves as you quit
              </CardDescription>
            </CardHeader>
            <CardContent>
              <div className="mt-2 flex justify-end">
                <Button variant="ghost" size="sm" onClick={() => navigate('/app/health/energy')} className="text-xs">
                  Track Energy <ChevronRight className="h-4 w-4 ml-1" />
                </Button>
              </div>
            </CardContent>
          </Card>
        </div>
        
        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
          <Card className="overflow-hidden">
            <CardHeader className="pb-2">
              <CardTitle className="text-md font-semibold flex items-center">
                {getFocusIcon()}
                <span className="ml-2">Focus & Cognition</span>
              </CardTitle>
              <CardDescription>
                Track improvements in mental clarity and focus
              </CardDescription>
            </CardHeader>
            <CardContent>
              <div className="mt-2 flex justify-end">
                <Button variant="ghost" size="sm" onClick={() => navigate('/app/health/focus')} className="text-xs">
                  Track Focus <ChevronRight className="h-4 w-4 ml-1" />
                </Button>
              </div>
            </CardContent>
          </Card>
          
          <Card className="overflow-hidden">
            <CardHeader className="pb-2">
              <CardTitle className="text-md font-semibold flex items-center">
                <Moon className="h-5 w-5 text-green-400" />
                <span className="ml-2">Sleep Quality</span>
              </CardTitle>
              <CardDescription>
                Monitor your sleep patterns during recovery
              </CardDescription>
            </CardHeader>
            <CardContent>
              <div className="space-y-2">
                <div className="h-2 w-full bg-muted rounded-full overflow-hidden">
                  <div 
                    className="h-full bg-green-400" 
                    style={{ width: `${Math.min(65 + Math.floor(daysSinceQuit/10), 95)}%` }}
                  />
                </div>
                <div className="flex justify-between items-center text-sm text-muted-foreground">
                  <span>Sleep quality improving</span>
                  <span>{Math.min(65 + Math.floor(daysSinceQuit/10), 95)}%</span>
                </div>
                
                <p className="text-sm mt-2">
                  {daysSinceQuit < 7 
                    ? "You may experience disrupted sleep initially. Track your patterns to see improvement."
                    : daysSinceQuit < 30
                    ? "Your sleep quality should be improving gradually. Keep monitoring for better insights."
                    : "Your sleep cycles are likely returning to normal. Maintain good sleep hygiene."}
                </p>
              </div>
              <div className="mt-2 flex justify-end">
                <Button variant="ghost" size="sm" onClick={() => navigate('/app/health/sleep')} className="text-xs">
                  Track Sleep <ChevronRight className="h-4 w-4 ml-1" />
                </Button>
              </div>
            </CardContent>
          </Card>
        </div>
        
        <Card className="overflow-hidden">
          <CardHeader className="pb-2">
            <CardTitle className="text-md font-semibold flex items-center">
              <BarChart className="h-5 w-5 text-primary" />
              <span className="ml-2">Advanced Analytics & Healthcare Reports</span>
            </CardTitle>
            <CardDescription>
              Generate detailed reports for healthcare providers and gain deeper insights
            </CardDescription>
          </CardHeader>
          <CardContent>
            <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
              <div className="space-y-2">
                <h3 className="text-sm font-medium">Personal Analytics</h3>
                <p className="text-sm text-muted-foreground">
                  Advanced visualizations and correlations between different health metrics
                </p>
                <Button 
                  variant="outline" 
                  className="w-full text-xs" 
                  onClick={() => navigate('/app/analytics')}
                >
                  View Analytics Dashboard
                </Button>
              </div>
              <div className="space-y-2">
                <h3 className="text-sm font-medium">Healthcare Provider Reports</h3>
                <p className="text-sm text-muted-foreground">
                  Generate comprehensive reports to share with your healthcare team
                </p>
                <Button 
                  variant="outline" 
                  className="w-full text-xs" 
                  onClick={() => navigate('/app/analytics?tab=healthcare')}
                >
                  Generate Reports
                </Button>
              </div>
            </div>
          </CardContent>
        </Card>
      </div>
    );
  };

  // Add a function to handle sharing progress to social media
  const handleShareProgress = async (platform: string) => {
    if (!session?.user?.id) {
      toast.error('You must be logged in to share your progress');
      return;
    }

    setIsSharing(true);

    try {
      const defaultMessage = `I've been smoke-free for ${daysSinceQuit} days! I've avoided ${cigarettesAvoided} cigarettes and saved $${savingsDetail.total.toFixed(2)}. #MissionFresh #SmokeFree`;
      const message = shareMessage || defaultMessage;

      const response = await shareProgressToSocial(
        session.user.id,
        'latest',
        platform,
        message,
        session
      );

      if (response.success) {
        toast.success(`Successfully shared to ${platform}!`);
        setIsSharing(false);
        setShareMessage('');
      } else {
        toast.error(`Failed to share: ${response.error}`);
        setIsSharing(false);
      }
    } catch (error) {
      console.error('Error sharing progress:', error);
      toast.error('Error sharing progress');
      setIsSharing(false);
    }
  };

  // Add this at the end, just before the final return
  const renderSocialSharingSection = () => {
    if (!quitDateObject || daysSinceQuit < 1) {
      return null;
    }

    return (
      <SectionCard 
        title="Share Your Progress" 
        description="Let your friends know about your journey"
        icon={<Zap className="h-5 w-5" />}
      >
        <div className="space-y-4">
          <div className="p-4 bg-card/50 rounded-lg">
            <h3 className="font-medium mb-2">Share Your Achievement</h3>
            <p className="text-sm text-muted-foreground">
              You've been smoke-free for {daysSinceQuit} days! Share this achievement with your friends and family.
            </p>
            
            <textarea
              className="mt-3 w-full p-2 text-sm border rounded-md dark:bg-gray-800"
              rows={3}
              placeholder="Add a custom message (optional)"
              value={shareMessage}
              onChange={(e) => setShareMessage(e.target.value)}
            />
            
            <div className="flex flex-wrap gap-2 mt-4">
              <Button 
                variant="outline" 
                size="sm"
                className="flex items-center gap-2"
                onClick={() => handleShareProgress('twitter')}
                disabled={isSharing}
              >
                <svg className="h-4 w-4" fill="currentColor" viewBox="0 0 24 24">
                  <path d="M24 4.557c-.883.392-1.832.656-2.828.775 1.017-.609 1.798-1.574 2.165-2.724-.951.564-2.005.974-3.127 1.195-.897-.957-2.178-1.555-3.594-1.555-3.179 0-5.515 2.966-4.797 6.045-4.091-.205-7.719-2.165-10.148-5.144-1.29 2.213-.669 5.108 1.523 6.574-.806-.026-1.566-.247-2.229-.616-.054 2.281 1.581 4.415 3.949 4.89-.693.188-1.452.232-2.224.084.626 1.956 2.444 3.379 4.6 3.419-2.07 1.623-4.678 2.348-7.29 2.04 2.179 1.397 4.768 2.212 7.548 2.212 9.142 0 14.307-7.721 13.995-14.646.962-.695 1.797-1.562 2.457-2.549z"></path>
                </svg>
                Twitter
              </Button>
              
              <Button 
                variant="outline" 
                size="sm"
                className="flex items-center gap-2"
                onClick={() => handleShareProgress('facebook')}
                disabled={isSharing}
              >
                <svg className="h-4 w-4" fill="currentColor" viewBox="0 0 24 24">
                  <path d="M9 8h-3v4h3v12h5v-12h3.642l.358-4h-4v-1.667c0-.955.192-1.333 1.115-1.333h2.885v-5h-3.808c-3.596 0-5.192 1.583-5.192 4.615v3.385z"></path>
                </svg>
                Facebook
              </Button>
              
              <Button 
                variant="outline" 
                size="sm"
                className="flex items-center gap-2"
                onClick={() => handleShareProgress('instagram')}
                disabled={isSharing}
              >
                <svg className="h-4 w-4" fill="currentColor" viewBox="0 0 24 24">
                  <path d="M12 2.163c3.204 0 3.584.012 4.85.07 3.252.148 4.771 1.691 4.919 4.919.058 1.265.069 1.645.069 4.849 0 3.205-.012 3.584-.069 4.849-.149 3.225-1.664 4.771-4.919 4.919-1.266.058-1.644.07-4.85.07-3.204 0-3.584-.012-4.849-.07-3.26-.149-4.771-1.699-4.919-4.92-.058-1.265-.07-1.644-.07-4.849 0-3.204.013-3.583.07-4.849.149-3.227 1.664-4.771 4.919-4.919 1.266-.057 1.645-.069 4.849-.069zm0-2.163c-3.259 0-3.667.014-4.947.072-4.358.2-6.78 2.618-6.98 6.98-.059 1.281-.073 1.689-.073 4.948 0 3.259.014 3.668.072 4.948.2 4.358 2.618 6.78 6.98 6.98 1.281.058 1.689.072 4.948.072 3.259 0 3.668-.014 4.948-.072 4.354-.2 6.782-2.618 6.979-6.98.059-1.28.073-1.689.073-4.948 0-3.259-.014-3.667-.072-4.947-.196-4.354-2.617-6.78-6.979-6.98-1.281-.059-1.69-.073-4.949-.073zm0 5.838c-3.403 0-6.162 2.759-6.162 6.162s2.759 6.163 6.162 6.163 6.162-2.759 6.162-6.163c0-3.403-2.759-6.162-6.162-6.162zm0 10.162c-2.209 0-4-1.79-4-4 0-2.209 1.791-4 4-4s4 1.791 4 4c0 2.21-1.791 4-4 4zm6.406-11.845c-.796 0-1.441.645-1.441 1.44s.645 1.44 1.441 1.44c.795 0 1.439-.645 1.439-1.44s-.644-1.44-1.439-1.44z"></path>
                </svg>
                Instagram
              </Button>
            </div>
          </div>
          
          <div className="text-xs text-muted-foreground">
            <p>
              Note: Sharing your progress can help motivate others and hold yourself accountable.
              Your personal health data will not be shared, only the metrics you choose.
            </p>
          </div>
        </div>
      </SectionCard>
    );
  };
  
  const renderFallback = (error: Error) => (
    <ApiErrorFallback 
      error={error} 
      onReset={() => setError(null)}
      onRetry={retryLoadData}
      resourceName="dashboard data"
    />
  );
  
  if (isLoading) {
    return (
      <div className="p-4 max-w-7xl mx-auto">
        <div className="flex flex-col items-center justify-center min-h-[300px]">
          <motion.div
            initial="initial"
            animate="animate"
            variants={breathingAnimation}
            className="mb-4"
          >
            <Leaf className="h-10 w-10 text-emerald-500" />
          </motion.div>
          <div className="animate-spin rounded-full h-12 w-12 border-t-2 border-b-2 border-emerald-500 mb-4"></div>
          <p className="text-muted-foreground">Loading your dashboard...</p>
        </div>
      </div>
    );
  }
  
  if (error) {
    return renderFallback(error);
  }

  if (!session?.user) {
    return (
      <div className="container mx-auto px-4 py-8">
        <div className="text-center">
          <h1 className="text-2xl font-bold mb-4">Please Log In</h1>
          <p className="mb-4">
            You need to be logged in to view your dashboard.
          </p>
          <Button 
            onClick={() => navigate('/auth')} 
            className="bg-emerald-600 hover:bg-emerald-700"
          >
            Log In
          </Button>
        </div>
      </div>
    );
  }

  return (
    <HolisticHealthProvider>
      <div className="container px-4 py-6 mb-16 md:mb-0">
        {/* Welcome Section with Breathing Leaf */}
        <div className="flex flex-col md:flex-row justify-between items-start gap-4 mb-6">
          <div>
            <div className="flex items-center mb-3">
              <motion.div
                initial="initial"
                animate="animate"
                variants={breathingAnimation}
                className="mr-2"
              >
                <Leaf className="h-6 w-6 text-emerald-500" />
              </motion.div>
              <h1 className="text-2xl font-bold">Welcome back!</h1>
            </div>
            <p className="text-muted-foreground">
              Here's a summary of your smoke-free journey for the past {daysSinceQuit} days.
            </p>
          </div>
        </div>
        
        {/* Rest of the dashboard content */}
        <div className="dashboard-container pb-20 pt-4">
          {session?.user?.id && (
            <CravingNotifier userId={session.user.id} />
          )}
          {/* Hero Section with Quit Stats */}
          <section className="mb-8">
            <div className="relative overflow-hidden rounded-2xl bg-gradient-to-br from-emerald-500/80 to-emerald-700 p-6 shadow-lg">
              <div className="absolute -right-10 -top-10 h-40 w-40 rounded-full bg-emerald-400/20 blur-3xl" />
              <div className="absolute -bottom-10 -left-10 h-40 w-40 rounded-full bg-emerald-400/20 blur-3xl" />
              
              <div className="relative z-10">
                <h1 className="mb-2 text-3xl font-bold text-white">Your Journey</h1>
                
                {quitDateObject ? (
                  <div className="space-y-4">
                    <div className="flex flex-col space-y-2 sm:flex-row sm:items-center sm:space-x-4 sm:space-y-0">
                      <motion.div 
                        initial={{ opacity: 0, y: 20 }}
                        animate={{ opacity: 1, y: 0 }}
                        transition={{ duration: 0.5 }}
                        className="glass-card flex flex-1 items-center rounded-xl bg-white/10 p-4 backdrop-blur-md"
                      >
                        <div className="mr-4 rounded-full bg-white/20 p-3">
                          <Timer className="h-6 w-6 text-white" />
                        </div>
                        <div>
                          <h3 className="text-sm font-medium text-white/80">Smoke Free For</h3>
                          <p className="text-2xl font-bold text-white">
                            {daysSinceQuit > 0 ? (
                              `${daysSinceQuit} ${daysSinceQuit === 1 ? 'Day' : 'Days'}`
                            ) : (
                              `${hoursSinceQuit} ${hoursSinceQuit === 1 ? 'Hour' : 'Hours'}`
                            )}
                          </p>
                        </div>
                      </motion.div>
                      
                      <motion.div 
                        initial={{ opacity: 0, y: 20 }}
                        animate={{ opacity: 1, y: 0 }}
                        transition={{ duration: 0.5, delay: 0.1 }}
                        className="glass-card flex flex-1 items-center rounded-xl bg-white/10 p-4 backdrop-blur-md"
                      >
                        <div className="mr-4 rounded-full bg-white/20 p-3">
                          <Cigarette className="h-6 w-6 text-white" />
                        </div>
                        <div>
                          <h3 className="text-sm font-medium text-white/80">Not Smoked</h3>
                          <p className="text-2xl font-bold text-white">{Math.round(cigarettesAvoided)} Cigarettes</p>
                        </div>
                      </motion.div>
                    </div>
                    
                    <div className="flex flex-col space-y-2 sm:flex-row sm:items-center sm:space-x-4 sm:space-y-0">
                      <motion.div 
                        initial={{ opacity: 0, y: 20 }}
                        animate={{ opacity: 1, y: 0 }}
                        transition={{ duration: 0.5, delay: 0.2 }}
                        className="glass-card flex flex-1 items-center rounded-xl bg-white/10 p-4 backdrop-blur-md"
                      >
                        <div className="mr-4 rounded-full bg-white/20 p-3">
                          <DollarSign className="h-6 w-6 text-white" />
                        </div>
                        <div>
                          <h3 className="text-sm font-medium text-white/80">Money Saved</h3>
                          <p className="text-2xl font-bold text-white">${savingsDetail.total.toFixed(2)}</p>
                        </div>
                      </motion.div>
                      
                      <motion.div 
                        initial={{ opacity: 0, y: 20 }}
                        animate={{ opacity: 1, y: 0 }}
                        transition={{ duration: 0.5, delay: 0.3 }}
                        className="glass-card flex flex-1 items-center rounded-xl bg-white/10 p-4 backdrop-blur-md"
                      >
                        <div className="mr-4 rounded-full bg-white/20 p-3">
                          <Leaf className="h-6 w-6 text-white" />
                        </div>
                        <div>
                          <h3 className="text-sm font-medium text-white/80">Health Improvement</h3>
                          <p className="text-2xl font-bold text-white">{healthImprovement}%</p>
                        </div>
                      </motion.div>
                    </div>
                  </div>
                ) : (
                  <div className="glass-card rounded-xl bg-white/10 p-6 backdrop-blur-md">
                    <p className="mb-4 text-center text-white">Let's start your smoke-free journey!</p>
                    <Button 
                      onClick={() => navigate('/app/settings')}
                      className="w-full bg-white font-medium text-emerald-700 hover:bg-white/90"
                    >
                      Set Your Quit Date
                    </Button>
                  </div>
                )}
              </div>
            </div>
          </section>
          
          {/* Health Improvements Section */}
          {quitDateObject && daysSinceQuit > 0 && (
            <motion.section 
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ duration: 0.6 }}
              className="mb-8"
            >
              <div className="mb-4 flex items-center justify-between">
                <h2 className="text-2xl font-bold">Health Recovery</h2>
                <Button 
                  variant="ghost" 
                  className="flex items-center text-sm font-medium text-primary" 
                  onClick={() => navigate('/health')}
                >
                  Details <ChevronRight className="ml-1 h-4 w-4" />
                </Button>
              </div>
              
              <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-4">
                {healthMetrics.slice(0, 4).map((metric) => (
                  <div 
                    key={metric.id}
                    className="relative overflow-hidden rounded-xl border border-border/40 bg-card p-4 shadow-sm transition-all hover:shadow-md"
                  >
                    <div className="mb-2 flex items-center justify-between">
                      <div className="flex items-center space-x-2">
                        <div className="rounded-full bg-primary/10 p-2">
                          {metric.icon}
                        </div>
                        <h3 className="font-medium">{metric.title}</h3>
                      </div>
                      <span className="inline-flex h-6 items-center rounded-full bg-primary/10 px-2 text-xs font-medium text-primary">
                        {metric.improvement.toFixed(0)}%
                      </span>
                    </div>
                    
                    <div className="relative mt-4 h-4 overflow-hidden rounded-full bg-muted">
                      <motion.div 
                        className="absolute left-0 top-0 h-full rounded-full bg-primary"
                        initial={{ width: 0 }}
                        animate={{ width: `${metric.improvement}%` }}
                        transition={{ duration: 1, delay: 0.2 }}
                      />
                    </div>
                    
                    <p className="mt-3 text-xs text-muted-foreground">
                      {metric.description}
                    </p>
                  </div>
                ))}
              </div>
            </motion.section>
          )}
          
          {/* Holistic Wellness Section */}
          {quitDateObject && daysSinceQuit > 0 && (
            <motion.section 
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ duration: 0.6, delay: 0.2 }}
              className="mb-8"
            >
              <div className="mb-4 flex items-center justify-between">
                <h2 className="text-2xl font-bold">Wellness Overview</h2>
                <Button 
                  variant="ghost" 
                  className="flex items-center text-sm font-medium text-primary" 
                  onClick={() => navigate('/wellness')}
                >
                  Details <ChevronRight className="ml-1 h-4 w-4" />
                </Button>
              </div>
              
              <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-4">
                <div className="wellness-card">
                  <div className="relative flex aspect-square flex-col items-center justify-center rounded-xl bg-gradient-to-br from-green-50 to-green-100 p-4 dark:from-green-950/30 dark:to-green-900/20">
                    <div className="absolute left-1/2 top-1/2 -translate-x-1/2 -translate-y-1/2">
                      <svg className="h-32 w-32" viewBox="0 0 100 100">
                        <circle 
                          cx="50" 
                          cy="50" 
                          r="40" 
                          fill="none" 
                          stroke="#e2e8f0" 
                          strokeWidth="8"
                        />
                        <motion.circle 
                          cx="50" 
                          cy="50" 
                          r="40" 
                          fill="none" 
                          stroke="#10b981" 
                          strokeWidth="8"
                          strokeLinecap="round"
                          strokeDasharray={251.2}
                          initial={{ strokeDashoffset: 251.2 }}
                          animate={{ strokeDashoffset: 251.2 - (251.2 * holisticMetrics.mood / 100) }}
                          transition={{ duration: 1.5, delay: 0.3 }}
                        />
                      </svg>
                    </div>
                    <Smile className="relative mb-2 h-8 w-8 text-green-500" />
                    <h3 className="relative text-center font-semibold">Mood</h3>
                    <p className="relative text-center text-2xl font-bold text-green-600">
                      {Math.round(holisticMetrics.mood)}%
                    </p>
                  </div>
                </div>
                
                <div className="wellness-card">
                  <div className="relative flex aspect-square flex-col items-center justify-center rounded-xl bg-gradient-to-br from-amber-50 to-amber-100 p-4 dark:from-amber-950/30 dark:to-amber-900/20">
                    <div className="absolute left-1/2 top-1/2 -translate-x-1/2 -translate-y-1/2">
                      <svg className="h-32 w-32" viewBox="0 0 100 100">
                        <circle 
                          cx="50" 
                          cy="50" 
                          r="40" 
                          fill="none" 
                          stroke="#e2e8f0" 
                          strokeWidth="8"
                        />
                        <motion.circle 
                          cx="50" 
                          cy="50" 
                          r="40" 
                          fill="none" 
                          stroke="#f59e0b" 
                          strokeWidth="8"
                          strokeLinecap="round"
                          strokeDasharray={251.2}
                          initial={{ strokeDashoffset: 251.2 }}
                          animate={{ strokeDashoffset: 251.2 - (251.2 * holisticMetrics.energy / 100) }}
                          transition={{ duration: 1.5, delay: 0.5 }}
                        />
                      </svg>
                    </div>
                    <Zap className="relative mb-2 h-8 w-8 text-amber-500" />
                    <h3 className="relative text-center font-semibold">Energy</h3>
                    <p className="relative text-center text-2xl font-bold text-amber-600">
                      {Math.round(holisticMetrics.energy)}%
                    </p>
                  </div>
                </div>
                
                <div className="wellness-card">
                  <div className="relative flex aspect-square flex-col items-center justify-center rounded-xl bg-gradient-to-br from-emerald-50 to-emerald-100 p-4 dark:from-emerald-950/30 dark:to-emerald-900/20">
                    <div className="absolute left-1/2 top-1/2 -translate-x-1/2 -translate-y-1/2">
                      <svg className="h-32 w-32" viewBox="0 0 100 100">
                        <circle 
                          cx="50" 
                          cy="50" 
                          r="40" 
                          fill="none" 
                          stroke="#e2e8f0" 
                          strokeWidth="8"
                        />
                        <motion.circle 
                          cx="50" 
                          cy="50" 
                          r="40" 
                          fill="none" 
                          stroke="#059669" 
                          strokeWidth="8"
                          strokeLinecap="round"
                          strokeDasharray={251.2}
                          initial={{ strokeDashoffset: 251.2 }}
                          animate={{ strokeDashoffset: 251.2 - (251.2 * holisticMetrics.focus / 100) }}
                          transition={{ duration: 1.5, delay: 0.7 }}
                        />
                      </svg>
                    </div>
                    <BrainCircuit className="relative mb-2 h-8 w-8 text-emerald-500" />
                    <h3 className="relative text-center font-semibold">Focus</h3>
                    <p className="relative text-center text-2xl font-bold text-emerald-600">
                      {Math.round(holisticMetrics.focus)}%
                    </p>
                  </div>
                </div>
                
                <div className="wellness-card">
                  <div className="relative flex aspect-square flex-col items-center justify-center rounded-xl bg-gradient-to-br from-green-50 to-green-100 p-4 dark:from-green-950/30 dark:to-green-900/20">
                    <div className="absolute left-1/2 top-1/2 -translate-x-1/2 -translate-y-1/2">
                      <svg className="h-32 w-32" viewBox="0 0 100 100">
                        <circle 
                          cx="50" 
                          cy="50" 
                          r="40" 
                          fill="none" 
                          stroke="#e2e8f0" 
                          strokeWidth="8"
                        />
                        <motion.circle 
                          cx="50" 
                          cy="50" 
                          r="40" 
                          fill="none" 
                          stroke="#10b981" 
                          strokeWidth="8"
                          strokeLinecap="round"
                          strokeDasharray={251.2}
                          initial={{ strokeDashoffset: 251.2 }}
                          animate={{ strokeDashoffset: 251.2 - (251.2 * holisticMetrics.fatigue / 100) }}
                          transition={{ duration: 1.5, delay: 0.9 }}
                        />
                      </svg>
                    </div>
                    <BatteryMedium className="relative mb-2 h-8 w-8 text-emerald-500" />
                    <h3 className="relative text-center font-semibold">Stamina</h3>
                    <p className="relative text-center text-2xl font-bold text-emerald-600">
                      {Math.round(holisticMetrics.fatigue)}%
                    </p>
                  </div>
                </div>
              </div>
            </motion.section>
          )}
          
          {/* Upcoming Milestones */}
          {quitDateObject && upcomingMilestones.length > 0 && (
            <motion.section 
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ duration: 0.6, delay: 0.4 }}
              className="mb-8"
            >
              <h2 className="mb-4 text-2xl font-bold">Upcoming Milestones</h2>
              
              <div className="space-y-4">
                {upcomingMilestones
                  .filter(milestone => !milestone.achieved)
                  .slice(0, 3)
                  .map((milestone, index) => {
                    // Convert timeline_hours to days for display
                    const daysRequired = Math.ceil(milestone.timeline_hours / 24);
                    const daysLeft = daysRequired - daysSinceQuit;
                    const progress = Math.min(100, (daysSinceQuit / daysRequired) * 100);
                    
                    return (
                      <div 
                        key={index} 
                        className="rounded-xl border border-border bg-card p-4 shadow-sm"
                      >
                        <div className="mb-2 flex items-center justify-between">
                          <h3 className="font-medium">{milestone.title}</h3>
                          <span className="rounded-full bg-primary/10 px-2 py-1 text-xs font-medium text-primary">
                            {daysLeft} {daysLeft === 1 ? 'day' : 'days'} left
                          </span>
                        </div>
                        
                        <p className="mb-3 text-sm text-muted-foreground">{milestone.description}</p>
                        
                        <div className="relative h-2 overflow-hidden rounded-full bg-muted">
                          <motion.div 
                            className="absolute left-0 top-0 h-full rounded-full bg-primary"
                            initial={{ width: 0 }}
                            animate={{ width: `${progress}%` }}
                            transition={{ duration: 1 }}
                          />
                        </div>
                      </div>
                    );
                  })}
                
                {upcomingMilestones.filter(milestone => !milestone.achieved).length > 3 && (
                  <Button 
                    variant="outline" 
                    className="w-full" 
                    onClick={() => navigate('/progress')}
                  >
                    View All Milestones
                  </Button>
                )}
              </div>
            </motion.section>
          )}
          
          {/* Savings & Environmental Impact */}
          {quitDateObject && daysSinceQuit > 0 && (
            <motion.section 
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ duration: 0.6, delay: 0.6 }}
              className="mb-8 grid gap-6 md:grid-cols-2"
            >
              {/* Savings */}
              <div className="rounded-xl border border-border bg-card p-6 shadow-sm">
                <div className="mb-4 flex items-center">
                  <div className="mr-3 rounded-full bg-primary/10 p-2">
                    <PiggyBank className="h-5 w-5 text-primary" />
                  </div>
                  <h3 className="text-xl font-semibold">Financial Savings</h3>
                </div>
                
                <div className="mb-4 grid grid-cols-2 gap-3">
                  <div className="rounded-lg bg-muted p-3">
                    <p className="text-xs text-muted-foreground">Daily</p>
                    <p className="text-xl font-semibold">${savingsDetail.daily.toFixed(2)}</p>
                  </div>
                  <div className="rounded-lg bg-muted p-3">
                    <p className="text-xs text-muted-foreground">Weekly</p>
                    <p className="text-xl font-semibold">${savingsDetail.weekly.toFixed(2)}</p>
                  </div>
                  <div className="rounded-lg bg-muted p-3">
                    <p className="text-xs text-muted-foreground">Monthly</p>
                    <p className="text-xl font-semibold">${savingsDetail.monthly.toFixed(2)}</p>
                  </div>
                  <div className="rounded-lg bg-muted p-3">
                    <p className="text-xs text-muted-foreground">Yearly</p>
                    <p className="text-xl font-semibold">${savingsDetail.yearly.toFixed(2)}</p>
                  </div>
                </div>
                
                <div className="mt-4 rounded-lg bg-primary/5 p-4">
                  <div className="flex items-center justify-between">
                    <p className="font-medium">Total Saved</p>
                    <p className="text-2xl font-bold text-primary">${savingsDetail.total.toFixed(2)}</p>
                  </div>
                </div>
              </div>
              
              {/* Environmental Impact */}
              <div className="rounded-xl border border-border bg-card p-6 shadow-sm">
                <div className="mb-4 flex items-center">
                  <div className="mr-3 rounded-full bg-green-100 p-2 dark:bg-green-900/20">
                    <Leaf className="h-5 w-5 text-green-600 dark:text-green-500" />
                  </div>
                  <h3 className="text-xl font-semibold">Environmental Impact</h3>
                </div>
                
                <div className="mb-4 grid gap-4">
                  <div className="rounded-lg bg-muted p-4">
                    <div className="mb-2 flex items-center justify-between">
                      <p className="text-sm font-medium">Cigarettes Not Smoked</p>
                      <p className="text-lg font-semibold">{Math.round(cigarettesAvoided)}</p>
                    </div>
                    <div className="h-1.5 rounded-full bg-muted-foreground/20">
                      <motion.div 
                        className="h-full rounded-full bg-green-500"
                        initial={{ width: 0 }}
                        animate={{ width: '100%' }}
                        transition={{ duration: 1.5 }}
                      />
                    </div>
                  </div>
                  
                  <div className="rounded-lg bg-muted p-4">
                    <div className="mb-2 flex items-center justify-between">
                      <p className="text-sm font-medium">CO₂ Reduction</p>
                      <p className="text-lg font-semibold">{carbonReduction.toFixed(1)} kg</p>
                    </div>
                    <div className="h-1.5 rounded-full bg-muted-foreground/20">
                      <motion.div 
                        className="h-full rounded-full bg-green-500"
                        initial={{ width: 0 }}
                        animate={{ width: '100%' }}
                        transition={{ duration: 1.5, delay: 0.2 }}
                      />
                    </div>
                  </div>
                </div>
                
                <div className="mt-4 rounded-lg bg-green-50 p-4 dark:bg-green-900/10">
                  <div className="flex items-center">
                    <Info className="mr-2 h-4 w-4 text-green-600 dark:text-green-500" />
                    <p className="text-xs text-green-800 dark:text-green-300">
                      You've helped reduce environmental pollution equivalent to driving {(carbonReduction * 4).toFixed(1)} fewer kilometers!
                    </p>
                  </div>
                </div>
              </div>
            </motion.section>
          )}
          
          {/* Share Your Progress */}
          {quitDateObject && daysSinceQuit > 0 && (
            <motion.section 
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ duration: 0.6, delay: 0.8 }}
              className="mb-8"
            >
              <div className="overflow-hidden rounded-xl bg-gradient-to-r from-green-500/80 to-emerald-600/80 p-6 text-white shadow-lg">
                <h3 className="mb-3 text-xl font-bold">Share Your Progress</h3>
                <p className="mb-4 text-white/80">
                  Celebrate your accomplishment and inspire others on their journey!
                </p>
                
                <div className="flex flex-wrap gap-2">
                  <Button
                    onClick={() => handleShareProgress('twitter')}
                    disabled={isSharing}
                    className="bg-green-500 text-white hover:bg-green-600"
                  >
                    Twitter
                  </Button>
                  <Button
                    onClick={() => handleShareProgress('facebook')}
                    disabled={isSharing}
                    className="bg-green-700 text-white hover:bg-green-800"
                  >
                    Facebook
                  </Button>
                  <Button
                    onClick={() => handleShareProgress('copy')}
                    disabled={isSharing}
                    className="bg-slate-700 text-white hover:bg-slate-800"
                  >
                    Copy Link
                  </Button>
                </div>
                
                {shareMessage && (
                  <p className="mt-3 text-sm text-white/90">{shareMessage}</p>
                )}
              </div>
            </motion.section>
          )}
          
          {/* Health and Wellness Tools Section */}
          <SectionCard 
            title="Health & Wellness"
            description="Track your journey to better health"
            icon={<Leaf className="h-5 w-5" />}
            className="mt-6"
          >
            <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4 mt-4">
              {/* Add the new Craving Tracker card along with other health cards */}
              <Card 
                onClick={() => navigate('/app/health/cravings')}
                className="cursor-pointer hover:shadow-md transition-shadow"
              >
                <CardContent className="p-6">
                  <div className="flex flex-col items-center text-center">
                    <div className="rounded-full bg-red-100 dark:bg-red-900/20 p-3 mb-3">
                      <Cigarette className="h-6 w-6 text-red-500" />
                    </div>
                    <h3 className="font-semibold mb-1">Craving Tracker</h3>
                    <p className="text-sm text-muted-foreground">
                      Log and manage smoking urges
                    </p>
                  </div>
                </CardContent>
              </Card>
              
              {/* Existing Mood Tracker Card */}
              <Card 
                onClick={() => navigate('/app/health/mood')}
                className="cursor-pointer hover:shadow-md transition-shadow"
              >
                <CardContent className="p-6">
                  <div className="flex flex-col items-center text-center">
                    <div className="rounded-full bg-yellow-100 dark:bg-yellow-900/20 p-3 mb-3">
                      <Smile className="h-6 w-6 text-yellow-500" />
                    </div>
                    <h3 className="font-semibold mb-1">Mood Tracker</h3>
                    <p className="text-sm text-muted-foreground">
                      Monitor emotional well-being
                    </p>
                  </div>
                </CardContent>
              </Card>
              
              {/* Existing Energy Tracker Card */}
              <Card 
                onClick={() => navigate('/app/health/energy')}
                className="cursor-pointer hover:shadow-md transition-shadow"
              >
                <CardContent className="p-6">
                  <div className="flex flex-col items-center text-center">
                    <div className="rounded-full bg-green-100 dark:bg-green-900/20 p-3 mb-3">
                      <Zap className="h-6 w-6 text-green-500" />
                    </div>
                    <h3 className="font-semibold mb-1">Energy Tracker</h3>
                    <p className="text-sm text-muted-foreground">
                      Track physical vitality
                    </p>
                  </div>
                </CardContent>
              </Card>
              
              {/* Existing Focus Tracker Card */}
              <Card 
                onClick={() => navigate('/app/health/focus')}
                className="cursor-pointer hover:shadow-md transition-shadow"
              >
                <CardContent className="p-6">
                  <div className="flex flex-col items-center text-center">
                    <div className="rounded-full bg-green-100 dark:bg-green-900/20 p-3 mb-3">
                      <Brain className="h-6 w-6 text-green-500" />
                    </div>
                    <h3 className="font-semibold mb-1">Focus Tracker</h3>
                    <p className="text-sm text-muted-foreground">
                      Measure mental clarity
                    </p>
                  </div>
                </CardContent>
              </Card>
              
              {/* Trigger Intervention Card */}
              <Card 
                className="group hover:shadow-md transition-all duration-300 cursor-pointer"
                onClick={() => navigate('/interventions')}
              >
                <div className="p-5">
                  <div className="bg-red-50 rounded-full w-12 h-12 mb-4 flex items-center justify-center text-red-500 group-hover:text-white group-hover:bg-red-500 transition-colors duration-300">
                    <Zap className="h-6 w-6" />
                  </div>
                  <h3 className="text-lg font-semibold mb-1">Craving SOS</h3>
                  <p className="text-gray-500 text-sm mb-2">
                    Immediate help for cravings using evidence-based techniques
                  </p>
                  <div className="flex justify-between items-center">
                    <div className="text-xs text-gray-500">Real-time intervention</div>
                    <span className="text-primary">
                      <ArrowRight className="h-4 w-4" />
                    </span>
                  </div>
                </div>
              </Card>
            </div>
            
            {/* Holistic Dashboard Link */}
            <div className="mt-4">
              <Button 
                onClick={() => navigate('/app/health/holistic')}
                variant="outline" 
                className="w-full"
              >
                <Activity className="mr-2 h-4 w-4" />
                View Holistic Health Dashboard
              </Button>
            </div>
          </SectionCard>
        </div>
      </div>
    </HolisticHealthProvider>
  );
};

export default Dashboard;
