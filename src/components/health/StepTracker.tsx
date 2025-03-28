import React, { useState, useEffect } from 'react';
import { useAuth } from '../AuthProvider';
import { Progress } from '../ui/progress';
import { format, startOfWeek, endOfWeek } from 'date-fns';
import { Button } from '../ui/button';
import { BarChart, Bar, XAxis, YAxis, CartesianGrid, Tooltip, ResponsiveContainer } from 'recharts';
import { Activity, Award, TrendingUp } from 'lucide-react';
import { motion, AnimatePresence } from 'framer-motion';
import { useAnimation } from '../../contexts/AnimationContext';
import { Loader } from '../ui/loader';

// In a real implementation, this would come from an API
const fetchStepData = async (userId: string, startDate: string, endDate: string) => {
  // This is mock data - in a real app, this would be fetched from the API
  const dates: string[] = [];
  const currentDate = new Date(startDate);
  const end = new Date(endDate);
  
  while (currentDate <= end) {
    dates.push(format(currentDate, 'yyyy-MM-dd'));
    currentDate.setDate(currentDate.getDate() + 1);
  }
  
  return dates.map(date => {
    const dayOfWeek = new Date(date).getDay();
    // Generate more realistic step patterns - weekends have fewer steps
    const baseSteps = dayOfWeek === 0 || dayOfWeek === 6 ? 5000 : 8000;
    const randomVariation = Math.floor(Math.random() * 4000) - 2000; // +/- 2000 steps
    return {
      date,
      steps: Math.max(0, baseSteps + randomVariation),
      goal: 10000
    };
  });
};

export const StepTracker: React.FC = () => {
  const { session } = useAuth();
  const [loading, setLoading] = useState(true);
  const [stepData, setStepData] = useState<Array<{date: string, steps: number, goal: number}>>([]);
  const [weeklyTotal, setWeeklyTotal] = useState(0);
  const [weeklyGoal, setWeeklyGoal] = useState(70000); // 10k steps per day
  const [weekStart, setWeekStart] = useState(format(startOfWeek(new Date()), 'yyyy-MM-dd'));
  const [weekEnd, setWeekEnd] = useState(format(endOfWeek(new Date()), 'yyyy-MM-dd'));
  const [connected, setConnected] = useState(false);
  const { prefersReducedMotion, getTransition, getVariants } = useAnimation();

  // Animation variants
  const containerVariants = {
    hidden: { opacity: 0 },
    visible: { 
      opacity: 1,
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

  const progressVariants = {
    hidden: { width: '0%' },
    visible: (value: number) => ({
      width: `${value}%`,
      transition: {
        duration: 1,
        ease: [0.165, 0.84, 0.44, 1]
      }
    })
  };

  const statsCardVariants = {
    hidden: { opacity: 0, scale: 0.9 },
    visible: (i: number) => ({ 
      opacity: 1, 
      scale: 1,
      transition: {
        ...getTransition(),
        delay: i * 0.05
      }
    }),
    hover: { 
      scale: 1.03,
      boxShadow: "0 5px 15px rgba(0,0,0,0.05)",
      transition: { 
        ...getTransition(),
        duration: 0.2
      }
    }
  };

  const chartVariants = {
    hidden: { opacity: 0, y: 20 },
    visible: { 
      opacity: 1, 
      y: 0,
      transition: {
        ...getTransition(),
        delay: 0.2
      }
    }
  };

  useEffect(() => {
    const getStepData = async () => {
      if (!session?.user?.id) return;
      
      try {
        setLoading(true);
        const data = await fetchStepData(session.user.id, weekStart, weekEnd);
        setStepData(data);
        
        const total = data.reduce((sum, day) => sum + day.steps, 0);
        setWeeklyTotal(total);
      } catch (error) {
        console.error('Failed to fetch step data:', error);
      } finally {
        setLoading(false);
      }
    };
    
    getStepData();
  }, [session, weekStart, weekEnd]);

  const connectHealthApp = () => {
    setConnected(true);
    // In a real app, this would trigger a connection to Apple Health/Google Fit
  };

  // The component to render based on loading state
  if (loading) {
    return (
      <div className="h-[200px] flex items-center justify-center">
        <Loader variant="dots" color="primary" text="Loading step data..." />
      </div>
    );
  }

  return (
    <motion.div 
      className="space-y-4"
      variants={containerVariants}
      initial={prefersReducedMotion ? "visible" : "hidden"}
      animate="visible"
    >
      <AnimatePresence mode="wait">
        {!connected ? (
          <motion.div 
            key="connect-prompt"
            variants={itemVariants}
            initial={prefersReducedMotion ? "visible" : "hidden"}
            animate="visible"
            exit={{ opacity: 0, y: -10, transition: { duration: 0.2 } }}
            className="flex flex-col items-center gap-2 p-4 bg-muted/50 rounded-lg mb-4 overflow-hidden"
          >
            <motion.div
              initial={{ scale: 0.8, opacity: 0 }}
              animate={{ 
                scale: [0.8, 1.1, 1],
                opacity: 1
              }}
              transition={{ duration: 0.6 }}
            >
              <div className="relative">
                <Activity className="h-10 w-10 text-primary mb-1 relative z-10" />
                <motion.div 
                  className="absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 h-16 w-16 bg-primary/10 rounded-full z-0"
                  animate={{ 
                    scale: [1, 1.2, 1],
                    opacity: [0.7, 0.3, 0.7]
                  }}
                  transition={{ 
                    repeat: Infinity,
                    duration: 3,
                    ease: "easeInOut"
                  }}
                />
              </div>
            </motion.div>
            
            <motion.p 
              className="text-sm text-center"
              variants={itemVariants}
            >
              Connect to your health app to track steps automatically
            </motion.p>
            
            <motion.div
              variants={itemVariants}
              whileHover={{ scale: 1.05 }}
              whileTap={{ scale: 0.95 }}
            >
              <Button 
                size="sm" 
                onClick={connectHealthApp}
                animated
              >
                Connect Health App
              </Button>
            </motion.div>
          </motion.div>
        ) : (
          <motion.div 
            key="connected-data"
            className="space-y-4"
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            transition={{ duration: 0.4 }}
          >
            <motion.div 
              className="space-y-2"
              variants={itemVariants}
            >
              <div className="flex justify-between items-center">
                <motion.h4 
                  className="text-sm font-medium flex items-center gap-1.5"
                  variants={itemVariants}
                >
                  <Activity className="h-4 w-4 text-primary" />
                  Weekly Progress
                </motion.h4>
                
                <motion.span 
                  className="text-sm font-medium"
                  variants={itemVariants}
                >
                  {Math.round((weeklyTotal / weeklyGoal) * 100)}%
                </motion.span>
              </div>
              
              <div className="h-2 w-full bg-muted rounded-full overflow-hidden">
                <motion.div
                  className="h-full bg-gradient-to-r from-blue-600 to-blue-400 rounded-full"
                  custom={(weeklyTotal / weeklyGoal) * 100}
                  variants={progressVariants}
                  initial={prefersReducedMotion ? "visible" : "hidden"}
                  animate="visible"
                />
              </div>
              
              <motion.p 
                className="text-xs text-muted-foreground"
                variants={itemVariants}
              >
                {weeklyTotal.toLocaleString()} / {weeklyGoal.toLocaleString()} steps
              </motion.p>
            </motion.div>
            
            <motion.div 
              className="h-[200px] mt-4"
              variants={chartVariants}
            >
              <ResponsiveContainer width="100%" height="100%">
                <BarChart
                  data={stepData}
                  margin={{ top: 5, right: 5, left: 0, bottom: 15 }}
                >
                  <CartesianGrid strokeDasharray="3 3" opacity={0.2} />
                  <XAxis 
                    dataKey="date" 
                    tick={{ fontSize: 10 }}
                    tickFormatter={(date) => format(new Date(date), 'EEE')}
                    stroke="#888888"
                  />
                  <YAxis tick={{ fontSize: 10 }} stroke="#888888" />
                  <Tooltip
                    formatter={(value) => [`${value.toLocaleString()} steps`, 'Steps']}
                    labelFormatter={(date) => format(new Date(date), 'EEE, MMM dd')}
                    contentStyle={{
                      backgroundColor: 'rgba(255, 255, 255, 0.95)',
                      borderRadius: '8px',
                      boxShadow: '0 4px 20px rgba(0, 0, 0, 0.1)',
                      border: '1px solid rgba(0, 0, 0, 0.1)',
                      fontSize: '12px',
                      padding: '8px 12px',
                    }}
                  />
                  <Bar 
                    dataKey="steps" 
                    fill="#2563eb" 
                    radius={[4, 4, 0, 0]}
                    animationDuration={prefersReducedMotion ? 0 : 1500}
                    animationEasing="ease-out"
                  />
                </BarChart>
              </ResponsiveContainer>
            </motion.div>
            
            <motion.div 
              className="grid grid-cols-3 gap-2 pt-2"
              variants={itemVariants}
            >
              {[
                { icon: <TrendingUp className="h-4 w-4 text-green-500 mb-1" />, text: "+12% vs last week" },
                { icon: <Activity className="h-4 w-4 text-amber-500 mb-1" />, text: "8,459 daily avg" },
                { icon: <Award className="h-4 w-4 text-primary mb-1" />, text: "10 day streak" }
              ].map((item, i) => (
                <motion.div
                  key={i}
                  custom={i}
                  variants={statsCardVariants}
                  whileHover="hover"
                  className="flex flex-col items-center p-2 bg-muted/30 rounded-lg border border-transparent hover:border-muted-foreground/10"
                >
                  <motion.div
                    whileHover={{ scale: 1.1, rotate: [0, -5, 5, 0] }}
                    transition={{ duration: 0.3 }}
                  >
                    {item.icon}
                  </motion.div>
                  <span className="text-xs font-medium text-center">{item.text}</span>
                </motion.div>
              ))}
            </motion.div>
          </motion.div>
        )}
      </AnimatePresence>
    </motion.div>
  );
}; 