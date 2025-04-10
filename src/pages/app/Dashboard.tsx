import React, { useState, useEffect } from 'react';
import { motion } from 'framer-motion';
import { useNavigate } from 'react-router-dom';
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from '@/components/ui/card';
import { useAuth } from '@/components/AuthProvider';
import {
  Loader2,
  AlertCircle,
  LayoutDashboard
} from 'lucide-react';
import { useToast } from '@/components/ui/use-toast';
import { Alert, AlertDescription, AlertTitle } from '@/components/ui/alert';
import { useUserStats } from '@/hooks/useUserStats';

// Import Widgets
import { PomodoroTodayWidget } from '@/components/dashboard/PomodoroTodayWidget';
import { RecentMoodWidget } from '@/components/dashboard/RecentMoodWidget';
import { UpcomingTasksWidget } from '@/components/dashboard/UpcomingTasksWidget';
import { RecentAchievementsWidget } from '@/components/dashboard/RecentAchievementsWidget';

const DashboardPage: React.FC = () => {
  const { user } = useAuth();
  const { toast } = useToast();
  const navigate = useNavigate();
  
  // Use stats hook
  const { 
    isLoading: isLoadingStats,
    error: statsError,
    focusSessionsCompleted,
    totalFocusMinutes,
    tasksCompletedViaFocus
  } = useUserStats(user?.id);

  // --- Welcome Message ---
  const getGreeting = () => {
    const hour = new Date().getHours();
    if (hour < 12) return 'Good morning';
    if (hour < 18) return 'Good afternoon';
    return 'Good evening';
  };
  const greeting = getGreeting();
  const userName = user?.email?.split('@')[0] || 'User'; // Simplified username fetch

  // --- Loading and Error Handling ---
  const isLoading = isLoadingStats;
  const error = statsError;

  // --- Animation Variants ---
  const containerVariants = { hidden: { opacity: 0 }, visible: { opacity: 1, transition: { staggerChildren: 0.1 } } };
  const itemVariants = { hidden: { opacity: 0, y: 20 }, visible: { opacity: 1, y: 0, transition: { duration: 0.5, ease: 'easeOut' } } };

  // --- Main Return Statement --- 
  return (
    <motion.div 
      className="space-y-6 md:space-y-8 p-4 md:p-6 lg:p-8"
      variants={containerVariants}
      initial="hidden"
      animate="visible"
    >
      {/* Header */}
      <motion.div variants={itemVariants} className="space-y-1">
        <h1 className="text-2xl md:text-3xl font-bold tracking-tight flex items-center gap-2">
          <LayoutDashboard size={28} className="text-primary" /> Dashboard
        </h1>
        <p className="text-muted-foreground">{greeting}, {userName}! Here's your focus overview.</p>
      </motion.div>

      {/* Error Display */}
      {error && (
        <motion.div variants={itemVariants}>
          <Alert variant="destructive">
            <AlertCircle className="h-4 w-4" />
            <AlertTitle>Error Loading Dashboard Data</AlertTitle>
            <AlertDescription>{error}</AlertDescription>
          </Alert>
        </motion.div>
      )}

      {/* Loading State */}
      {isLoading && (
        <motion.div variants={itemVariants} className="flex justify-center items-center py-20">
          <Loader2 className="h-8 w-8 animate-spin text-muted-foreground" />
        </motion.div>
      )}

      {/* Dashboard Grid (with actual widgets) */}
      {!isLoading && !error && (
        <motion.div 
          variants={itemVariants} 
          className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4 md:gap-6"
        >
          {/* Pomodoro Widget */}
          <PomodoroTodayWidget 
            completedSessions={focusSessionsCompleted} 
            totalMinutes={totalFocusMinutes} 
          />
          
          {/* Mood Widget */}
          <RecentMoodWidget /> 

          {/* Tasks Widget */}
          <UpcomingTasksWidget />

          {/* Achievements Widget */}
          <RecentAchievementsWidget />
        </motion.div>
      )}
    </motion.div>
  );
};

export default DashboardPage;
