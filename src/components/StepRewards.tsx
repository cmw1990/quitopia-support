import React, { useState, useEffect, useCallback } from 'react';
import { useAuth } from './AuthProvider';
import { Card, CardContent, CardDescription, CardFooter, CardHeader, CardTitle } from '@/components/ui/card';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { Button } from '@/components/ui/button';
import { Progress } from '@/components/ui/progress';
import { toast } from 'sonner';
import { AreaChart, Area, XAxis, YAxis, CartesianGrid, Tooltip, ResponsiveContainer, BarChart, Bar, Cell, PieChart, Pie, Legend } from 'recharts';
import { Footprints, Award, Trophy, Smartphone, Calendar, Heart, ChevronRight, Medal, Gift, UserCheck, TrendingUp, Dumbbell, Zap, RefreshCw } from 'lucide-react';
import { format, subDays, startOfWeek, endOfWeek, eachDayOfInterval, isSameDay } from 'date-fns';
import { getStepCount, getMobileFeatureStatus } from '@/utils/mobileIntegration';
import { supabaseRestCall } from "@/api/apiCompatibility";
import { motion, AnimatePresence } from 'framer-motion';

// Define step goals and rewards
const DAILY_STEP_GOAL = 8000;
const WEEKLY_STEP_GOAL = 50000;
const ACHIEVEMENT_LEVELS = [
  { steps: 5000, reward: 'Bronze Walker', discount: 2 },
  { steps: 10000, reward: 'Silver Strider', discount: 5 },
  { steps: 15000, reward: 'Gold Pacer', discount: 8 },
  { steps: 20000, reward: 'Platinum Marathoner', discount: 10 },
  { steps: 30000, reward: 'Diamond Trailblazer', discount: 15 },
];

// Interface for step data
interface StepData {
  date: string;
  steps: number;
  goal: number;
  goalMet: boolean;
  caloriesBurned?: number;
  distanceKm?: number;
}

// Interface for streak data
interface StreakData {
  currentStreak: number;
  longestStreak: number;
  lastStepDate: string | null;
}

// Interface for integration status
interface IntegrationStatus {
  connected: boolean;
  provider: string | null;
  lastSynced: string | null;
  features: Record<string, boolean>;
}

export const StepRewards = () => {
  const { session } = useAuth();
  const [activeTab, setActiveTab] = useState('today');
  const [stepData, setStepData] = useState<StepData[]>([]);
  const [weeklySteps, setWeeklySteps] = useState<number>(0);
  const [weeklyProgress, setWeeklyProgress] = useState<number>(0);
  const [streakData, setStreakData] = useState<StreakData>({
    currentStreak: 0,
    longestStreak: 0,
    lastStepDate: null
  });
  const [loading, setLoading] = useState<boolean>(true);
  const [subscriptionDiscount, setSubscriptionDiscount] = useState<number>(0);
  const [integrationStatus, setIntegrationStatus] = useState<IntegrationStatus>({
    connected: false,
    provider: null,
    lastSynced: null,
    features: {}
  });
  const [animateCount, setAnimateCount] = useState(false);
  const [previousTodaySteps, setPreviousTodaySteps] = useState(0);

  // Calculate today's steps and progress
  const todaySteps = stepData.find(day => 
    isSameDay(new Date(day.date), new Date())
  )?.steps || 0;
  
  const todayProgress = Math.min(Math.round((todaySteps / DAILY_STEP_GOAL) * 100), 100);

  // Fetch data on component mount
  useEffect(() => {
    if (session?.user?.id) {
      fetchStepData();
      fetchIntegrationStatus();
    }
  }, [session]);

  // Trigger animation when today's steps change
  useEffect(() => {
    if (previousTodaySteps !== todaySteps && previousTodaySteps > 0) {
      setAnimateCount(true);
      
      // Provide haptic feedback if available
      if (window.hapticFeedback?.success) {
        window.hapticFeedback.success();
      }
      
      // Reset animation state
      setTimeout(() => setAnimateCount(false), 1500);
    }
    setPreviousTodaySteps(todaySteps);
  }, [todaySteps, previousTodaySteps]);

  // Fetch step data from server and health integrations
  const fetchStepData = async () => {
    setLoading(true);
    try {
      const today = new Date();
      const weekStart = startOfWeek(today, { weekStartsOn: 1 }); // Monday
      const weekEnd = endOfWeek(today, { weekStartsOn: 1 }); // Sunday
      
      // Get date range for the week
      const dateRange = eachDayOfInterval({ start: weekStart, end: weekEnd });
      
      // Prepare array to store step data for each day
      const weekStepData: StepData[] = [];
      let weeklyStepsTotal = 0;
      let currentStreak = 0;
      let lastStepDate: string | null = null;
      
      // Process each day of the week
      for (const date of dateRange) {
        // Try to get steps from health integration
        const nativeSteps = await getStepCount(date);
        
        // Get stored step data from our database
        const dateStr = format(date, 'yyyy-MM-dd');
        
        // Ensure session exists before proceeding
        if (!session?.user?.id) {
          continue;
        }
        
        const endpoint = `/rest/v1/mission4_step_data?user_id=eq.${session.user.id}&date=eq.${dateStr}`;
        const storedData = await supabaseRestCall<any[]>(endpoint, {}, session);
        
        // Use native data if available, otherwise fallback to stored data
        const steps = nativeSteps?.steps || (storedData[0]?.steps || 0);
        
        // If this is today or a past day and we have steps, consider for streak
        if (isSameDay(date, today) || date < today) {
          if (steps >= DAILY_STEP_GOAL) {
            currentStreak += 1;
            lastStepDate = dateStr;
          } else {
            // Break in streak
            if (date < today && !isSameDay(date, subDays(today, 1))) {
              currentStreak = 0;
            }
          }
        }
        
        // Add to weekly total
        weeklyStepsTotal += steps;
        
        // Store in step data array
        weekStepData.push({
          date: dateStr,
          steps,
          goal: DAILY_STEP_GOAL,
          goalMet: steps >= DAILY_STEP_GOAL,
          caloriesBurned: Math.round(steps * 0.04),
          distanceKm: parseFloat((steps * 0.0007).toFixed(2))
        });
        
        // If we have new data from health integration, store it
        if (nativeSteps?.steps && date <= today) {
          storeStepData(dateStr, nativeSteps.steps, nativeSteps.caloriesBurned, nativeSteps.distanceKm);
        }
      }
      
      // Calculate weekly progress
      const weeklyProgressPercent = Math.min(Math.round((weeklyStepsTotal / WEEKLY_STEP_GOAL) * 100), 100);
      
      // Get streak data from database
      if (!session?.user?.id) {
        throw new Error("User session is required");
      }
      
      const streakEndpoint = `/rest/v1/mission4_user_stats?user_id=eq.${session.user.id}`;
      const streakData = await supabaseRestCall<any[]>(streakEndpoint, {}, session);
      
      let longestStreak = 0;
      
      if (streakData.length > 0) {
        longestStreak = streakData[0].longest_step_streak || 0;
        
        // Update longest streak if current is higher
        if (currentStreak > longestStreak) {
          longestStreak = currentStreak;
          updateLongestStreak(longestStreak);
        }
      } else {
        // Create new stats record if none exists
        longestStreak = currentStreak;
        createUserStats(currentStreak);
      }
      
      // Calculate subscription discount based on weekly steps
      const discountLevel = ACHIEVEMENT_LEVELS.reduce((prev, current) => {
        return weeklyStepsTotal >= current.steps ? current : prev;
      }, { steps: 0, reward: '', discount: 0 });
      
      // Update state
      setStepData(weekStepData);
      setWeeklySteps(weeklyStepsTotal);
      setWeeklyProgress(weeklyProgressPercent);
      setStreakData({
        currentStreak,
        longestStreak,
        lastStepDate
      });
      setSubscriptionDiscount(discountLevel.discount);
      
      // Record last sync time
      localStorage.setItem('last_step_sync', new Date().toISOString());
      setIntegrationStatus(prev => ({
        ...prev,
        lastSynced: new Date().toISOString()
      }));
      
    } catch (error) {
      console.error('Error fetching step data:', error);
      toast.error('Could not fetch step data');
    } finally {
      setLoading(false);
    }
  };

  // Store step data in our database
  const storeStepData = async (date: string, steps: number, caloriesBurned?: number, distanceKm?: number) => {
    try {
      // Ensure session exists before proceeding
      if (!session?.user?.id) {
        console.error("Cannot store step data: No user session");
        return;
      }
      
      const endpoint = `/rest/v1/mission4_step_data`;
      const existingDataEndpoint = `/rest/v1/mission4_step_data?user_id=eq.${session.user.id}&date=eq.${date}`;
      
      // Check if we already have data for this date
      const existingData = await supabaseRestCall<any[]>(existingDataEndpoint, {}, session);
      
      if (existingData.length > 0) {
        // Update existing data
        const updateEndpoint = `${endpoint}?id=eq.${existingData[0].id}`;
        await supabaseRestCall(
          updateEndpoint,
          {
            method: 'PATCH',
            body: JSON.stringify({
              steps,
              calories_burned: caloriesBurned,
              distance_km: distanceKm,
              updated_at: new Date().toISOString()
            })
          },
          session
        );
      } else {
        // Insert new data
        await supabaseRestCall(
          endpoint,
          {
            method: 'POST',
            body: JSON.stringify({
              user_id: session.user.id,
              date,
              steps,
              calories_burned: caloriesBurned,
              distance_km: distanceKm,
              created_at: new Date().toISOString(),
              updated_at: new Date().toISOString()
            })
          },
          session
        );
      }
    } catch (error) {
      console.error('Error storing step data:', error);
    }
  };

  // Update user's longest streak
  const updateLongestStreak = async (longestStreak: number) => {
    try {
      // Ensure session exists before proceeding
      if (!session?.user?.id) {
        console.error("Cannot update streak: No user session");
        return;
      }
      
      const endpoint = `/rest/v1/mission4_user_stats?user_id=eq.${session.user.id}`;
      await supabaseRestCall(
        endpoint,
        {
          method: 'PATCH',
          body: JSON.stringify({
            longest_step_streak: longestStreak,
            updated_at: new Date().toISOString()
          })
        },
        session
      );
    } catch (error) {
      console.error('Error updating longest streak:', error);
    }
  };

  // Create user stats record
  const createUserStats = async (currentStreak: number) => {
    try {
      // Ensure session exists before proceeding
      if (!session?.user?.id) {
        console.error("Cannot create user stats: No user session");
        return;
      }
      
      const endpoint = `/rest/v1/mission4_user_stats`;
      await supabaseRestCall(
        endpoint,
        {
          method: 'POST',
          body: JSON.stringify({
            user_id: session.user.id,
            longest_step_streak: currentStreak,
            created_at: new Date().toISOString(),
            updated_at: new Date().toISOString()
          })
        },
        session
      );
    } catch (error) {
      console.error('Error creating user stats:', error);
    }
  };

  // Fetch health integration status
  const fetchIntegrationStatus = async () => {
    try {
      // In real implementation, check if health app is connected
      const isConnected = localStorage.getItem('health_integration_connected') === 'true';
      const provider = localStorage.getItem('health_integration_provider') || null;
      const lastSynced = localStorage.getItem('last_step_sync') || null;
      
      // Get mobile feature status from utilities
      const featureStatus = getMobileFeatureStatus();
      
      setIntegrationStatus({
        connected: isConnected,
        provider,
        lastSynced,
        features: featureStatus
      });
    } catch (error) {
      console.error('Error fetching integration status:', error);
    }
  };

  // Connect to health app
  const connectToHealthApp = async () => {
    try {
      // In real implementation, this would initiate OAuth or native health app permission flow
      // For demo, we'll simulate a successful connection
      localStorage.setItem('health_integration_connected', 'true');
      
      // Detect platform and set provider
      const isIOS = /iPhone|iPad|iPod/i.test(navigator.userAgent);
      const provider = isIOS ? 'Apple Health' : 'Google Fit';
      localStorage.setItem('health_integration_provider', provider);
      
      // Update state
      setIntegrationStatus(prev => ({
        ...prev,
        connected: true,
        provider
      }));
      
      // Refresh data
      await fetchStepData();
      
      toast.success(`Connected to ${provider} successfully!`);
      
      // Add haptic feedback for success if available
      if (window.hapticFeedback?.success) {
        window.hapticFeedback.success();
      }
    } catch (error) {
      console.error('Error connecting to health app:', error);
      toast.error('Could not connect to health app');
      
      // Add haptic feedback for error if available
      if (window.hapticFeedback?.error) {
        window.hapticFeedback.error();
      }
    }
  };

  // Manual sync
  const syncNow = useCallback(async () => {
    if (loading) return;
    
    toast.info('Syncing step data...');
    
    // Add haptic feedback for interaction if available
    if (window.hapticFeedback?.medium) {
      window.hapticFeedback.medium();
    }
    
    await fetchStepData();
    
    toast.success('Step data synced successfully!');
    
    // Add haptic feedback for success if available
    if (window.hapticFeedback?.success) {
      window.hapticFeedback.success();
    }
  }, [loading, fetchStepData]);

  // Calculate achievement level based on weekly steps
  const getAchievementLevel = () => {
    for (let i = ACHIEVEMENT_LEVELS.length - 1; i >= 0; i--) {
      if (weeklySteps >= ACHIEVEMENT_LEVELS[i].steps) {
        return ACHIEVEMENT_LEVELS[i];
      }
    }
    return null;
  };

  // Format data for charts
  const weeklyChartData = stepData.map(day => ({
    name: format(new Date(day.date), 'EEE'),
    steps: day.steps,
    goal: day.goal,
    goalMet: day.goalMet
  }));

  const achievementLevelData = ACHIEVEMENT_LEVELS.map(level => ({
    name: level.reward,
    steps: level.steps,
    discount: level.discount,
    current: weeklySteps >= level.steps
  }));

  const currentLevel = getAchievementLevel();

  // Custom tooltip component for charts
  const CustomTooltip = ({ active, payload, label }: any) => {
    if (active && payload && payload.length) {
      return (
        <div className="bg-background/95 shadow-lg border rounded-lg p-3 backdrop-blur-sm">
          <p className="font-medium">{label}</p>
          <p className="text-sm">
            <span className="inline-block w-3 h-3 bg-primary mr-1 rounded-full"></span>
            {`Steps: ${payload[0].value.toLocaleString()}`}
          </p>
          <p className="text-sm">
            <span className="inline-block w-3 h-3 bg-green-500 mr-1 rounded-full opacity-30"></span>
            {`Goal: ${payload[1]?.value.toLocaleString()}`}
          </p>
        </div>
      );
    }
    return null;
  };

  // Motion variants for animations
  const countAnimationVariants = {
    initial: { scale: 1 },
    animate: { 
      scale: [1, 1.2, 1],
      transition: { duration: 0.5 }
    }
  };

  const progressAnimationVariants = {
    initial: { width: '0%' },
    animate: (value: number) => ({
      width: `${value}%`,
      transition: { duration: 1, ease: "easeOut" }
    })
  };

  return (
    <Card className="w-full">
      <CardHeader>
        <CardTitle className="flex items-center gap-2">
          <Footprints className="h-5 w-5 text-green-500" />
          Step Rewards
        </CardTitle>
        <CardDescription>
          Track your steps and earn subscription discounts for staying active
        </CardDescription>
      </CardHeader>
      <CardContent>
        <Tabs value={activeTab} onValueChange={setActiveTab}>
          <TabsList className="grid w-full grid-cols-3">
            <TabsTrigger value="today">Today</TabsTrigger>
            <TabsTrigger value="weekly">Weekly</TabsTrigger>
            <TabsTrigger value="rewards">Rewards</TabsTrigger>
          </TabsList>
          
          {/* Today Tab */}
          <TabsContent value="today" className="py-4 space-y-6">
            {loading ? (
              <div className="flex justify-center py-6">
                <div className="animate-spin">
                  <Footprints className="h-6 w-6 text-green-500" />
                </div>
              </div>
            ) : (
              <>
                <div className="text-center mb-6">
                  <motion.h3 
                    className="text-3xl font-bold"
                    variants={countAnimationVariants}
                    initial="initial"
                    animate={animateCount ? "animate" : "initial"}
                  >
                    {todaySteps.toLocaleString()}
                  </motion.h3>
                  <p className="text-sm text-muted-foreground">steps today</p>
                </div>
                
                <div className="space-y-2">
                  <div className="flex justify-between text-sm">
                    <span>Daily Goal: {DAILY_STEP_GOAL.toLocaleString()} steps</span>
                    <span>{todayProgress}% complete</span>
                  </div>
                  <div className="h-2 bg-neutral-200 dark:bg-neutral-800 rounded-full overflow-hidden">
                    <motion.div 
                      className="h-full bg-green-500 rounded-full"
                      variants={progressAnimationVariants}
                      initial="initial"
                      animate="animate"
                      custom={todayProgress}
                    />
                  </div>
                </div>
                
                <div className="grid grid-cols-3 gap-3 my-6">
                  <div className="rounded-lg border p-3 text-center">
                    <div className="text-lg font-semibold">
                      {stepData.find(day => isSameDay(new Date(day.date), new Date()))?.caloriesBurned || 0}
                    </div>
                    <div className="text-xs text-muted-foreground">calories</div>
                  </div>
                  <div className="rounded-lg border p-3 text-center">
                    <div className="text-lg font-semibold">
                      {stepData.find(day => isSameDay(new Date(day.date), new Date()))?.distanceKm || 0} km
                    </div>
                    <div className="text-xs text-muted-foreground">distance</div>
                  </div>
                  <div className="rounded-lg border p-3 text-center">
                    <div className="text-lg font-semibold">{streakData.currentStreak}</div>
                    <div className="text-xs text-muted-foreground">day streak</div>
                  </div>
                </div>
                
                <div className="rounded-lg border p-4">
                  <h4 className="text-sm font-medium mb-3">Health Integration</h4>
                  
                  {integrationStatus.connected ? (
                    <div className="space-y-3">
                      <div className="flex items-center justify-between">
                        <div className="flex items-center gap-2">
                          <Smartphone className="h-4 w-4 text-green-500" />
                          <span className="text-sm">Connected to {integrationStatus.provider}</span>
                        </div>
                        <Button 
                          variant="ghost" 
                          size="sm" 
                          onClick={syncNow}
                          disabled={loading}
                          className={loading ? "opacity-50 cursor-not-allowed" : ""}
                        >
                          {loading ? (
                            <span className="flex items-center">
                              <RefreshCw className="h-3 w-3 mr-1 animate-spin" />
                              Syncing...
                            </span>
                          ) : (
                            "Sync Now"
                          )}
                        </Button>
                      </div>
                      
                      {integrationStatus.lastSynced && (
                        <p className="text-xs text-muted-foreground">
                          Last synced: {format(new Date(integrationStatus.lastSynced), 'MMM d, h:mm a')}
                        </p>
                      )}
                      
                      {/* Feature availability badges */}
                      <div className="flex flex-wrap gap-2 mt-2">
                        {Object.entries(integrationStatus.features).map(([feature, available]) => (
                          <span 
                            key={feature}
                            className={`text-xs px-2 py-1 rounded-full ${
                              available ? 'bg-green-100 text-green-800 dark:bg-green-900/30 dark:text-green-300' : 
                                         'bg-neutral-100 text-neutral-800 dark:bg-neutral-800 dark:text-neutral-300'
                            }`}
                          >
                            {feature.replace(/([A-Z])/g, ' $1').trim()}
                          </span>
                        ))}
                      </div>
                    </div>
                  ) : (
                    <div className="flex items-center justify-between">
                      <span className="text-sm">Connect your health app to sync steps</span>
                      <Button 
                        size="sm" 
                        onClick={connectToHealthApp}
                        disabled={loading}
                      >
                        Connect
                      </Button>
                    </div>
                  )}
                </div>
              </>
            )}
          </TabsContent>
          
          {/* Weekly Tab */}
          <TabsContent value="weekly" className="py-4 space-y-6">
            {loading ? (
              <div className="flex justify-center py-6">
                <div className="animate-spin">
                  <Calendar className="h-6 w-6 text-green-500" />
                </div>
              </div>
            ) : (
              <>
                <div className="text-center mb-4">
                  <AnimatePresence mode="wait">
                    <motion.h3 
                      key={weeklySteps}
                      className="text-3xl font-bold"
                      initial={{ opacity: 0, y: 10 }}
                      animate={{ opacity: 1, y: 0 }}
                      exit={{ opacity: 0, y: -10 }}
                      transition={{ duration: 0.3 }}
                    >
                      {weeklySteps.toLocaleString()}
                    </motion.h3>
                  </AnimatePresence>
                  <p className="text-sm text-muted-foreground">steps this week</p>
                </div>
                
                <div className="space-y-2">
                  <div className="flex justify-between text-sm">
                    <span>Weekly Goal: {WEEKLY_STEP_GOAL.toLocaleString()} steps</span>
                    <span>{weeklyProgress}% complete</span>
                  </div>
                  <div className="h-2 bg-neutral-200 dark:bg-neutral-800 rounded-full overflow-hidden">
                    <motion.div 
                      className="h-full bg-green-500 rounded-full"
                      initial={{ width: "0%" }}
                      animate={{ width: `${weeklyProgress}%` }}
                      transition={{ duration: 1, ease: "easeOut" }}
                    />
                  </div>
                </div>
                
                <div className="mt-6 h-[240px]">
                  <ResponsiveContainer width="100%" height="100%">
                    <BarChart data={weeklyChartData}>
                      <CartesianGrid strokeDasharray="3 3" opacity={0.2} />
                      <XAxis dataKey="name" />
                      <YAxis width={35} />
                      <Tooltip content={<CustomTooltip />} />
                      <Legend />
                      <Bar 
                        name="Steps" 
                        dataKey="steps" 
                        fill="#8884d8"
                        radius={[4, 4, 0, 0]}
                        animationDuration={1000}
                      >
                        {weeklyChartData.map((entry, index) => (
                          <Cell 
                            key={`cell-${index}`} 
                            fill={entry.goalMet ? '#10b981' : '#8884d8'} 
                          />
                        ))}
                      </Bar>
                      <Bar 
                        name="Goal" 
                        dataKey="goal" 
                        fill="#82ca9d" 
                        opacity={0.3}
                        animationDuration={1000} 
                      />
                    </BarChart>
                  </ResponsiveContainer>
                </div>
                
                <div className="mt-4 rounded-lg border p-4">
                  <div className="flex justify-between items-center mb-2">
                    <h4 className="font-medium">Activity Streak</h4>
                    <div className="flex items-center text-amber-500">
                      <Zap className="h-4 w-4 mr-1" />
                      <span>{streakData.currentStreak} days</span>
                    </div>
                  </div>
                  
                  <div className="flex items-center justify-between text-sm">
                    <span className="text-muted-foreground">Longest streak</span>
                    <span className="font-medium">{streakData.longestStreak} days</span>
                  </div>
                  
                  {streakData.lastStepDate && (
                    <div className="flex items-center justify-between text-sm mt-1">
                      <span className="text-muted-foreground">Last goal met</span>
                      <span>{format(new Date(streakData.lastStepDate), 'MMM d, yyyy')}</span>
                    </div>
                  )}
                </div>
              </>
            )}
          </TabsContent>
          
          {/* Rewards Tab */}
          <TabsContent value="rewards" className="py-4 space-y-6">
            {loading ? (
              <div className="flex justify-center py-6">
                <div className="animate-spin">
                  <Award className="h-6 w-6 text-green-500" />
                </div>
              </div>
            ) : (
              <>
                <div className="text-center mb-6">
                  <motion.div 
                    className="inline-flex items-center justify-center w-16 h-16 rounded-full bg-green-100 mb-2"
                    initial={{ rotate: 0 }}
                    animate={{ rotate: subscriptionDiscount > 0 ? 360 : 0 }}
                    transition={{ duration: 0.6, ease: "easeInOut" }}
                  >
                    <Gift className="h-8 w-8 text-green-500" />
                  </motion.div>
                  <AnimatePresence mode="wait">
                    <motion.h3 
                      key={subscriptionDiscount}
                      className="text-2xl font-bold"
                      initial={{ opacity: 0, scale: 0.8 }}
                      animate={{ opacity: 1, scale: 1 }}
                      exit={{ opacity: 0, scale: 1.2 }}
                      transition={{ duration: 0.3 }}
                    >
                      {subscriptionDiscount > 0 ? `${subscriptionDiscount}% OFF` : 'No discount yet'}
                    </motion.h3>
                  </AnimatePresence>
                  <p className="text-sm text-muted-foreground">
                    Current subscription discount based on your activity
                  </p>
                </div>
                
                {currentLevel && (
                  <motion.div 
                    className="rounded-lg border p-4 bg-green-50 dark:bg-green-900/20 mb-6"
                    initial={{ opacity: 0, y: 20 }}
                    animate={{ opacity: 1, y: 0 }}
                    transition={{ duration: 0.5, delay: 0.2 }}
                  >
                    <div className="flex items-center gap-3">
                      <Trophy className="h-10 w-10 text-amber-500" />
                      <div>
                        <h4 className="font-semibold">{currentLevel.reward}</h4>
                        <p className="text-sm">
                          You've earned {currentLevel.discount}% off your subscription!
                        </p>
                      </div>
                    </div>
                  </motion.div>
                )}
                
                <div className="rounded-lg border p-4">
                  <h4 className="font-medium mb-3">Reward Levels</h4>
                  <div className="space-y-4">
                    {ACHIEVEMENT_LEVELS.map((level, index) => (
                      <motion.div 
                        key={level.reward}
                        className={`flex items-center p-3 rounded-lg border ${
                          weeklySteps >= level.steps ? 'bg-green-50 border-green-200 dark:bg-green-900/20 dark:border-green-800' : ''
                        }`}
                        initial={{ opacity: 0, x: -10 }}
                        animate={{ opacity: 1, x: 0 }}
                        transition={{ duration: 0.3, delay: index * 0.1 }}
                        whileHover={{ scale: 1.02 }}
                        whileTap={{ scale: 0.98 }}
                      >
                        <div className={`w-8 h-8 rounded-full flex items-center justify-center mr-3 ${
                          weeklySteps >= level.steps ? 'bg-green-100 text-green-700 dark:bg-green-800 dark:text-green-200' : 'bg-gray-100 text-gray-500 dark:bg-gray-800'
                        }`}>
                          <Medal className="h-4 w-4" />
                        </div>
                        <div className="flex-1">
                          <h5 className="font-medium">{level.reward}</h5>
                          <p className="text-xs text-muted-foreground">
                            {level.steps.toLocaleString()} steps weekly
                          </p>
                        </div>
                        <div className="text-right">
                          <span className="font-semibold">{level.discount}%</span>
                          <p className="text-xs text-muted-foreground">discount</p>
                        </div>
                      </motion.div>
                    ))}
                  </div>
                </div>
                
                <div className="mt-8 h-[240px]">
                  <ResponsiveContainer width="100%" height="100%">
                    <BarChart
                      data={achievementLevelData}
                      layout="vertical"
                      margin={{ top: 5, right: 30, left: 20, bottom: 5 }}
                    >
                      <CartesianGrid strokeDasharray="3 3" opacity={0.2} />
                      <XAxis type="number" />
                      <YAxis type="category" dataKey="name" width={100} />
                      <Tooltip 
                        content={({ active, payload, label }: any) => {
                          if (active && payload && payload.length) {
                            return (
                              <div className="bg-background/95 shadow-lg border rounded-lg p-3 backdrop-blur-sm">
                                <p className="font-medium">{label}</p>
                                <p className="text-sm">{`${payload[0].value.toLocaleString()} steps`}</p>
                                <p className="text-sm">{`${payload[0].payload.discount}% discount`}</p>
                              </div>
                            );
                          }
                          return null;
                        }}
                      />
                      <Legend />
                      <Bar 
                        dataKey="steps" 
                        name="Steps Required" 
                        fill="#8884d8"
                        radius={[0, 4, 4, 0]}
                        animationDuration={1200}
                      >
                        {achievementLevelData.map((entry, index) => (
                          <Cell 
                            key={`cell-${index}`} 
                            fill={entry.current ? '#10b981' : '#8884d8'} 
                          />
                        ))}
                      </Bar>
                    </BarChart>
                  </ResponsiveContainer>
                </div>
              </>
            )}
          </TabsContent>
        </Tabs>
      </CardContent>
      <CardFooter className="flex justify-between border-t pt-4">
        <Button 
          variant="ghost" 
          size="sm" 
          className="text-xs text-muted-foreground"
          onClick={syncNow}
          disabled={loading}
        >
          <TrendingUp className="h-3 w-3 mr-1" />
          Sync
        </Button>
        <Button 
          variant="ghost" 
          size="sm" 
          className="text-xs text-muted-foreground"
          onClick={() => window.open('/health/dashboard', '_self')}
        >
          <Heart className="h-3 w-3 mr-1" />
          Health Dashboard
        </Button>
      </CardFooter>
    </Card>
  );
}; 