import React, { useState, useEffect } from 'react';
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Progress } from "@/components/ui/progress";
import { Button } from "@/components/ui/button";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { AreaChart, Area, XAxis, Tooltip, ResponsiveContainer } from 'recharts';
import { isMobile, getStepCount, getHealthData, registerWidgetData, type StepData, type HealthData, type WidgetConfig } from '@/utils/mobileIntegration';
import { Activity, Heart, Footprints, Clock, TrendingUp, Medal, Wind, Award, ArrowUpRight, Download } from 'lucide-react';
import { motion, AnimatePresence } from 'framer-motion';
import { useAnimation } from '@/contexts/AnimationContext';
import { Loader } from '@/components/ui/loader';

interface HealthStat {
  label: string;
  value: string | number;
  icon: React.ReactNode;
  change?: number;
  color?: string;
}

interface HealthWidgetProps {
  userId: string;
  size?: 'sm' | 'md' | 'lg';
  exportable?: boolean;
  activeTab?: string;
  onlyShowTab?: string;
  widgetTheme?: 'light' | 'dark' | 'system';
  widgetTitle?: string;
}

export const HealthWidget: React.FC<HealthWidgetProps> = ({
  userId,
  size = 'md',
  exportable = false,
  activeTab = 'overview',
  onlyShowTab,
  widgetTheme = 'system',
  widgetTitle = 'Health Progress'
}) => {
  const [loading, setLoading] = useState(true);
  const [steps, setSteps] = useState<StepData | null>(null);
  const [health, setHealth] = useState<HealthData | null>(null);
  const [healthStats, setHealthStats] = useState<HealthStat[]>([]);
  const [stepHistory, setStepHistory] = useState<StepData[]>([]);
  const [isMobileDevice, setIsMobileDevice] = useState(false);
  const { prefersReducedMotion, getTransition, getVariants } = useAnimation();
  
  // Size-based styling
  const sizeClasses = {
    sm: 'w-full max-w-[250px]',
    md: 'w-full max-w-[350px]',
    lg: 'w-full max-w-[450px]'
  };
  
  // Animation variants
  const containerVariants = {
    hidden: { opacity: 0, y: 20 },
    visible: { 
      opacity: 1, 
      y: 0,
      transition: {
        ...getTransition(),
        staggerChildren: 0.1
      }
    }
  };
  
  const itemVariants = {
    hidden: { opacity: 0, y: 10 },
    visible: { 
      opacity: 1, 
      y: 0,
      transition: getTransition()
    }
  };
  
  const statCardVariants = {
    hidden: { opacity: 0, scale: 0.9 },
    visible: (i: number) => ({ 
      opacity: 1, 
      scale: 1,
      transition: {
        ...getTransition(),
        delay: i * 0.05
      }
    })
  };
  
  const progressVariants = {
    hidden: { width: 0 },
    visible: (value: number) => ({
      width: `${value}%`,
      transition: {
        duration: 1,
        ease: [0.165, 0.84, 0.44, 1]
      }
    })
  };
  
  // Calculate days since smoking
  const calculateDaysSinceQuitting = (): number => {
    // In a real app, this would come from the user's profile
    // For demo purposes, we'll use a random number between 7 and 90
    const seed = userId.charCodeAt(0) % 83;
    return 7 + seed;
  };
  
  // Calculate money saved
  const calculateMoneySaved = (days: number): number => {
    // Assuming average cost of $10 per day for smoking
    return days * 10;
  };
  
  // Calculate health improvement percentage
  const calculateHealthImprovement = (days: number): number => {
    // Simple logarithmic function to estimate health improvements
    // Plateaus around 95% at 365 days
    return Math.min(95, Math.round(20 * Math.log10(days + 1)));
  };
  
  // Calculate lung capacity recovery
  const calculateLungCapacity = (days: number): number => {
    // Lung capacity improves more slowly
    return Math.min(100, Math.round(15 * Math.log10(days + 1)));
  };
  
  // Get the last 7 days of step data
  const fetchStepHistory = async () => {
    try {
      const history: StepData[] = [];
      const today = new Date();
      
      for (let i = 6; i >= 0; i--) {
        const date = new Date();
        date.setDate(today.getDate() - i);
        const data = await getStepCount(date);
        history.push(data);
      }
      
      setStepHistory(history);
    } catch (error) {
      console.error('Error fetching step history:', error);
    }
  };
  
  // Fetch all health data
  const fetchHealthData = async () => {
    try {
      setLoading(true);
      
      // Get today's step count
      const stepsData = await getStepCount();
      setSteps(stepsData);
      
      // Get other health metrics
      const healthData = await getHealthData();
      setHealth(healthData);
      
      // Get step history for the chart
      await fetchStepHistory();
      
      setLoading(false);
    } catch (error) {
      console.error('Error fetching health data:', error);
      setLoading(false);
    }
  };
  
  // Register widget data for homescreen widgets
  const exportWidgetData = () => {
    if (!exportable || !steps || !health) return;
    
    const daysSinceQuitting = calculateDaysSinceQuitting();
    const healthImprovement = calculateHealthImprovement(daysSinceQuitting);
    
    const widgetConfig: WidgetConfig = {
      type: 'steps',
      refreshInterval: 30, // minutes
      backgroundColor: '#ffffff',
      textColor: '#1f2937'
    };
    
    const widgetData = {
      steps: steps.steps,
      calories: steps.caloriesBurned || 0,
      daysSinceQuitting,
      healthImprovement,
      lastUpdated: new Date().toISOString()
    };
    
    registerWidgetData(widgetConfig, widgetData);
    
    // If we have haptic feedback available, provide success feedback
    if (window.hapticFeedback) {
      window.hapticFeedback.success();
    }
  };
  
  // Update health stats whenever data changes
  useEffect(() => {
    const daysSinceQuitting = calculateDaysSinceQuitting();
    const healthImprovement = calculateHealthImprovement(daysSinceQuitting);
    const lungCapacity = calculateLungCapacity(daysSinceQuitting);
    const moneySaved = calculateMoneySaved(daysSinceQuitting);
    
    const newStats: HealthStat[] = [
      {
        label: 'Days Smoke-Free',
        value: daysSinceQuitting,
        icon: <Clock className="h-4 w-4" />,
        color: 'text-green-500'
      },
      {
        label: 'Health Recovery',
        value: `${healthImprovement}%`,
        icon: <TrendingUp className="h-4 w-4" />,
        change: 2.5,
        color: 'text-blue-500'
      },
      {
        label: 'Money Saved',
        value: `$${moneySaved}`,
        icon: <Medal className="h-4 w-4" />,
        color: 'text-amber-500'
      },
      {
        label: 'Lung Capacity',
        value: `${lungCapacity}%`,
        icon: <Wind className="h-4 w-4" />,
        change: 1.2,
        color: 'text-purple-500'
      }
    ];
    
    // Add step data if available
    if (steps) {
      newStats.push({
        label: 'Steps Today',
        value: steps.steps.toLocaleString(),
        icon: <Footprints className="h-4 w-4" />,
        color: 'text-cyan-500'
      });
      
      // Add calories if available
      if (steps.caloriesBurned) {
        newStats.push({
          label: 'Calories Burned',
          value: steps.caloriesBurned,
          icon: <Activity className="h-4 w-4" />,
          color: 'text-rose-500'
        });
      }
    }
    
    // Add heart rate if available
    if (health && health.heartRate) {
      newStats.push({
        label: 'Heart Rate',
        value: `${health.heartRate} bpm`,
        icon: <Heart className="h-4 w-4" />,
        color: 'text-red-500'
      });
    }
    
    setHealthStats(newStats);
    
    // If exportable, register widget data
    if (exportable) {
      exportWidgetData();
    }
  }, [steps, health, exportable]);
  
  // Initialize on mount
  useEffect(() => {
    setIsMobileDevice(isMobile());
    fetchHealthData();
    
    // Refresh data every 5 minutes
    const interval = setInterval(fetchHealthData, 5 * 60 * 1000);
    
    return () => clearInterval(interval);
  }, []);
  
  // Prepare chart data
  const chartData = stepHistory.map((day) => ({
    name: new Date(day.date).toLocaleDateString('en-US', { weekday: 'short' }),
    steps: day.steps
  }));
  
  // Custom tooltip for chart
  const CustomTooltip = ({ active, payload, label }: any) => {
    if (active && payload && payload.length) {
      return (
        <div className="p-2 bg-background border border-border rounded shadow-md">
          <p className="text-sm font-medium">{label}</p>
          <p className="text-sm text-primary">
            {payload[0].value.toLocaleString()} steps
          </p>
        </div>
      );
    }
    return null;
  };
  
  const getWidgetSize = () => {
    switch (size) {
      case 'sm':
        return 'col-span-1';
      case 'md':
        return 'col-span-1 md:col-span-1';
      case 'lg':
        return 'col-span-1 md:col-span-2';
      default:
        return 'col-span-1';
    }
  };
  
  // Determine what we should show based on props
  const tabs = onlyShowTab ? [onlyShowTab] : ['overview', 'stats', 'history'];
  
  // Determine the component to render based on loading state
  if (loading) {
    return (
      <Card className={`${sizeClasses[size]} overflow-hidden`}>
        <CardContent className="flex items-center justify-center p-8">
          <Loader variant="dots" color="primary" text="Loading health data..." />
        </CardContent>
      </Card>
    );
  }
  
  return (
    <motion.div
      variants={containerVariants}
      initial={prefersReducedMotion ? "visible" : "hidden"}
      animate="visible"
      className={sizeClasses[size]}
    >
      <Card className="overflow-hidden">
        <CardHeader className="pb-2">
          <div className="flex items-center justify-between">
            <motion.div
              variants={itemVariants}
              className="space-y-1"
            >
              <CardTitle>{widgetTitle}</CardTitle>
              <CardDescription>
                Track your health improvements
              </CardDescription>
            </motion.div>
            
            {exportable && isMobileDevice && (
              <motion.div
                variants={itemVariants}
                whileHover={{ scale: 1.05 }}
                whileTap={{ scale: 0.95 }}
              >
                <Button 
                  size="sm" 
                  variant="ghost" 
                  onClick={exportWidgetData}
                  className="h-8 w-8 p-0"
                >
                  <Download className="h-4 w-4" />
                  <span className="sr-only">Export to widget</span>
                </Button>
              </motion.div>
            )}
          </div>
        </CardHeader>
        
        <CardContent className="pb-2">
          <Tabs defaultValue={activeTab} className="w-full">
            {tabs.length > 1 && (
              <motion.div variants={itemVariants}>
                <TabsList className="w-full mb-4">
                  {tabs.includes('overview') && (
                    <TabsTrigger value="overview" className="flex-1">Overview</TabsTrigger>
                  )}
                  {tabs.includes('stats') && (
                    <TabsTrigger value="stats" className="flex-1">Stats</TabsTrigger>
                  )}
                  {tabs.includes('history') && (
                    <TabsTrigger value="history" className="flex-1">History</TabsTrigger>
                  )}
                </TabsList>
              </motion.div>
            )}
            
            <AnimatePresence mode="wait">
              {tabs.includes('overview') && (
                <TabsContent value="overview" className="mt-0 space-y-4">
                  <motion.div
                    variants={itemVariants}
                    className="space-y-2"
                  >
                    <div className="flex justify-between items-center">
                      <h3 className="text-sm font-medium">Health Recovery Progress</h3>
                      <Badge variant="outline" className="font-normal">
                        {calculateHealthImprovement(calculateDaysSinceQuitting())}%
                      </Badge>
                    </div>
                    
                    <div className="h-2 w-full bg-secondary/30 rounded-full overflow-hidden">
                      <motion.div
                        custom={calculateHealthImprovement(calculateDaysSinceQuitting())}
                        variants={progressVariants}
                        initial={prefersReducedMotion ? "visible" : "hidden"}
                        animate="visible"
                        className="h-full bg-gradient-to-r from-emerald-500 to-green-400 rounded-full"
                      />
                    </div>
                    
                    <div className="text-xs text-muted-foreground pt-1">
                      {calculateDaysSinceQuitting()} days smoke-free
                    </div>
                  </motion.div>
                  
                  <motion.div variants={itemVariants} className="grid grid-cols-2 gap-2">
                    {healthStats.slice(0, 4).map((stat, i) => (
                      <motion.div
                        key={stat.label}
                        custom={i}
                        variants={statCardVariants}
                        className="bg-secondary/10 p-3 rounded-lg"
                      >
                        <div className={`flex items-center gap-1.5 text-xs font-medium ${stat.color}`}>
                          {stat.icon}
                          {stat.label}
                        </div>
                        <div className="text-lg font-semibold mt-1">
                          {stat.value}
                        </div>
                        {stat.change && (
                          <div className="flex items-center gap-0.5 text-xs text-emerald-500 mt-1">
                            <ArrowUpRight className="h-3 w-3" />
                            {stat.change}%
                          </div>
                        )}
                      </motion.div>
                    ))}
                  </motion.div>
                  
                  {steps && (
                    <motion.div
                      variants={itemVariants}
                      className="pt-2"
                    >
                      <div className="flex items-center justify-between mb-2">
                        <h3 className="text-sm font-medium">
                          Weekly Step Activity
                        </h3>
                        <Badge variant="secondary" className="font-normal">
                          {steps.steps.toLocaleString()} today
                        </Badge>
                      </div>
                      
                      <div className="h-[100px]">
                        <ResponsiveContainer width="100%" height="100%">
                          <AreaChart
                            data={chartData}
                            margin={{ top: 0, right: 0, left: 0, bottom: 0 }}
                          >
                            <defs>
                              <linearGradient id="stepsGradient" x1="0" y1="0" x2="0" y2="1">
                                <stop offset="5%" stopColor="#3B82F6" stopOpacity={0.3} />
                                <stop offset="95%" stopColor="#3B82F6" stopOpacity={0} />
                              </linearGradient>
                            </defs>
                            <XAxis 
                              dataKey="name" 
                              tick={{ fontSize: 10 }}
                              tickLine={false}
                              axisLine={false}
                            />
                            <Tooltip content={<CustomTooltip />} />
                            <Area 
                              type="monotone" 
                              dataKey="steps" 
                              stroke="#3B82F6" 
                              strokeWidth={2}
                              fillOpacity={1}
                              fill="url(#stepsGradient)" 
                            />
                          </AreaChart>
                        </ResponsiveContainer>
                      </div>
                    </motion.div>
                  )}
                </TabsContent>
              )}
              
              {tabs.includes('stats') && (
                <TabsContent value="stats" className="mt-0">
                  <motion.div
                    variants={itemVariants} 
                    className="grid grid-cols-2 gap-2"
                  >
                    {healthStats.map((stat, i) => (
                      <motion.div
                        key={stat.label}
                        custom={i}
                        variants={statCardVariants}
                        whileHover={{ scale: 1.03 }}
                        className="bg-secondary/10 p-3 rounded-lg"
                      >
                        <div className={`flex items-center gap-1.5 text-xs font-medium ${stat.color}`}>
                          {stat.icon}
                          {stat.label}
                        </div>
                        <div className="text-lg font-semibold mt-1">
                          {stat.value}
                        </div>
                        {stat.change && (
                          <div className="flex items-center gap-0.5 text-xs text-emerald-500 mt-1">
                            <ArrowUpRight className="h-3 w-3" />
                            {stat.change}%
                          </div>
                        )}
                      </motion.div>
                    ))}
                  </motion.div>
                </TabsContent>
              )}
              
              {tabs.includes('history') && (
                <TabsContent value="history" className="mt-0">
                  <motion.div 
                    variants={itemVariants}
                    className="space-y-4"
                  >
                    <div className="h-[150px]">
                      <ResponsiveContainer width="100%" height="100%">
                        <AreaChart
                          data={chartData}
                          margin={{ top: 10, right: 0, left: 0, bottom: 0 }}
                        >
                          <defs>
                            <linearGradient id="stepsGradientLarge" x1="0" y1="0" x2="0" y2="1">
                              <stop offset="5%" stopColor="#3B82F6" stopOpacity={0.3} />
                              <stop offset="95%" stopColor="#3B82F6" stopOpacity={0} />
                            </linearGradient>
                          </defs>
                          <XAxis 
                            dataKey="name" 
                            tick={{ fontSize: 12 }}
                            tickLine={false}
                            axisLine={false}
                          />
                          <Tooltip content={<CustomTooltip />} />
                          <Area 
                            type="monotone" 
                            dataKey="steps" 
                            stroke="#3B82F6" 
                            strokeWidth={2}
                            fillOpacity={1}
                            fill="url(#stepsGradientLarge)" 
                          />
                        </AreaChart>
                      </ResponsiveContainer>
                    </div>
                    
                    <div className="space-y-2">
                      {stepHistory.map((day, i) => (
                        <motion.div
                          key={day.date}
                          custom={i}
                          variants={statCardVariants}
                          className="flex items-center justify-between p-2 rounded-lg bg-secondary/5"
                        >
                          <div className="flex items-center gap-2">
                            <Footprints className="h-4 w-4 text-blue-500" />
                            <span className="text-sm">
                              {new Date(day.date).toLocaleDateString('en-US', {
                                weekday: 'short',
                                month: 'short',
                                day: 'numeric'
                              })}
                            </span>
                          </div>
                          <div className="flex items-center gap-2">
                            <span className="font-medium">
                              {day.steps.toLocaleString()}
                            </span>
                            <span className="text-xs text-muted-foreground">
                              steps
                            </span>
                          </div>
                        </motion.div>
                      ))}
                    </div>
                  </motion.div>
                </TabsContent>
              )}
            </AnimatePresence>
          </Tabs>
        </CardContent>
      </Card>
    </motion.div>
  );
};

export default HealthWidget; 