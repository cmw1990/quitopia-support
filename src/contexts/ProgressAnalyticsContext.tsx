import React, { createContext, useState, useContext, useEffect, useCallback } from 'react';
import { ProgressAnalytics, ProgressAnalyticsService } from '../services/progress-analytics-service';
import { ProgressEntry } from '../services/progress-analytics-service';
import { useAuth } from './AuthContext';
import { toast } from '../components/ui/toast';

// Define the shape of the ProgressAnalyticsContext
interface ProgressAnalyticsContextType {
  progressEntries: ProgressEntry[];
  analytics: ProgressAnalytics;
  logProgressEntry: (
    progressEntry: Omit<ProgressEntry, 'id' | 'timestamp'>
  ) => Promise<ProgressEntry | null>;
  fetchProgressAnalytics: (options?: {
    startDate?: string,
    endDate?: string,
    categories?: Array<'focus_sessions' | 'tasks' | 'energy_levels' | 'achievements'>
  }) => Promise<void>;
  generateAchievementRecommendations: () => string[];
  exportProgressToCSV: () => Promise<string | null>;
}

const ProgressAnalyticsContext = createContext<ProgressAnalyticsContextType | undefined>(undefined);

export const ProgressAnalyticsProvider: React.FC<{ children: React.ReactNode }> = ({ children }) => {
  const { user } = useAuth();
  const [progressEntries, setProgressEntries] = useState<ProgressEntry[]>([]);
  const [analytics, setAnalytics] = useState<ProgressAnalytics>({
    overallProgress: 0,
    categoryBreakdown: {},
    achievements: {
      unlocked: [],
      totalAchievements: 0,
      progressPercentage: 0
    },
    exportOptions: {
      csv: ''
    }
  });

  // Log a new progress entry
  const logProgressEntry = useCallback(async (
    progressEntry: Omit<ProgressEntry, 'id' | 'timestamp'>
  ) => {
    if (!user) {
      toast({
        title: 'Authentication Required',
        description: 'Please log in to track progress',
        variant: 'destructive'
      });
      return null;
    }

    try {
      const newProgressEntry = await ProgressAnalyticsService.logProgressEntry({
        ...progressEntry,
        userId: user.id
      });

      if (newProgressEntry) {
        setProgressEntries(prev => [...prev, newProgressEntry]);
        await fetchProgressAnalytics();
        toast({
          title: 'Progress Entry Logged',
          description: `Logged ${progressEntry.metric} in ${progressEntry.category}`,
          variant: 'default'
        });
      }

      return newProgressEntry;
    } catch (error) {
      toast({
        title: 'Progress Entry Logging Failed',
        description: 'Unable to log progress entry',
        variant: 'destructive'
      });
      return null;
    }
  }, [user]);

  // Fetch progress analytics
  const fetchProgressAnalytics = useCallback(async (options?: {
    startDate?: string,
    endDate?: string,
    categories?: Array<'focus_sessions' | 'tasks' | 'energy_levels' | 'achievements'>
  }) => {
    if (!user) return;

    try {
      const progressAnalytics = await ProgressAnalyticsService.getProgressAnalytics(
        user.id, 
        options
      );
      setAnalytics(progressAnalytics);
    } catch (error) {
      toast({
        title: 'Fetch Progress Analytics Failed',
        description: 'Unable to retrieve progress analytics',
        variant: 'destructive'
      });
    }
  }, [user]);

  // Generate achievement recommendations
  const generateAchievementRecommendations = useCallback(() => {
    return ProgressAnalyticsService.generateAchievementRecommendations(analytics);
  }, [analytics]);

  // Export progress to CSV
  const exportProgressToCSV = useCallback(async () => {
    if (!user) return null;

    try {
      const csvUrl = await ProgressAnalyticsService.exportProgressToCSV(user.id, analytics);
      
      if (csvUrl) {
        toast({
          title: 'CSV Export Successful',
          description: 'Your progress report has been generated',
          variant: 'default'
        });
      }

      return csvUrl;
    } catch (error) {
      toast({
        title: 'CSV Export Failed',
        description: 'Unable to generate CSV report',
        variant: 'destructive'
      });
      return null;
    }
  }, [user, analytics]);

  // Initial data fetching
  useEffect(() => {
    if (user) {
      fetchProgressAnalytics();
    }
  }, [user, fetchProgressAnalytics]);

  const value = {
    progressEntries,
    analytics,
    logProgressEntry,
    fetchProgressAnalytics,
    generateAchievementRecommendations,
    exportProgressToCSV
  };

  return (
    <ProgressAnalyticsContext.Provider value={value}>
      {children}
    </ProgressAnalyticsContext.Provider>
  );
};

// Custom hook for using progress analytics context
export const useProgressAnalytics = () => {
  const context = useContext(ProgressAnalyticsContext);
  if (context === undefined) {
    throw new Error('useProgressAnalytics must be used within a ProgressAnalyticsProvider');
  }
  return context;
};