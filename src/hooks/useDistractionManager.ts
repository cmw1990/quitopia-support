import { useState, useEffect, useCallback } from 'react';
import { DistractionApiClient } from '@/lib/api/distraction-api';
import { useToast } from '@/components/hooks/use-toast';
import { useAuth } from '@/components/AuthProvider';
import {
  BlockedSite,
  DistractionPattern,
  DistractionLog,
  EnvironmentRecommendation,
  DigitalMinimalismGoal,
  BlockingStats,
  DistractionBlockerState
} from '@/lib/types/distraction-types';

const initialState: DistractionBlockerState = {
  isBlockingEnabled: false,
  blockedSites: [],
  distractionPatterns: [],
  blockingStats: {
    totalBlocked: 0,
    todayBlocked: 0,
    mostCommonTime: '',
    productivity: 0,
    streakDays: 0,
    improvementRate: 0,
    focusScore: 0
  },
  distractionLogs: [],
  environmentRecommendations: [],
  digitalGoals: [],
  selectedCategory: 'social',
  showScheduler: false,
  showAnalytics: false,
  showEnvironment: false,
  showJournal: false,
  showMinimalism: false
};

export const useDistractionManager = () => {
  const [state, setState] = useState<DistractionBlockerState>(initialState);
  const { session } = useAuth();
  const { toast } = useToast();

  // Initialize API client
  const api = new DistractionApiClient(session?.access_token || '');

  // Load all data
  const loadData = useCallback(async () => {
    if (!session?.user?.id) return;

    try {
      const [
        blockedSites,
        distractionPatterns,
        blockingStats,
        distractionLogs,
        environmentRecommendations,
        digitalGoals
      ] = await Promise.all([
        api.getBlockedSites(session.user.id),
        api.getDistractionPatterns(session.user.id),
        api.getBlockingStats(session.user.id),
        api.getDistractionLogs(session.user.id),
        api.getEnvironmentRecommendations(session.user.id),
        api.getDigitalGoals(session.user.id)
      ]);

      setState(prev => ({
        ...prev,
        blockedSites,
        distractionPatterns,
        blockingStats,
        distractionLogs,
        environmentRecommendations,
        digitalGoals
      }));
    } catch (error) {
      console.error('Error loading distraction data:', error);
      toast({
        title: 'Error loading data',
        description: 'Please try again later',
        variant: 'destructive'
      });
    }
  }, [session?.user?.id, api, toast]);

  // Subscribe to real-time updates
  useEffect(() => {
    if (!session?.user?.id) return;

    const unsubscribe = api.subscribeToUpdates((payload) => {
      loadData(); // Reload all data when any changes occur
    });

    return () => {
      unsubscribe();
    };
  }, [session?.user?.id, api, loadData]);

  // Load initial data
  useEffect(() => {
    loadData();
  }, [loadData]);

  // Action handlers
  const addBlockedSite = async (domain: string) => {
    if (!session?.user?.id || !domain.trim()) return;

    try {
      const newSite = await api.addBlockedSite({
        user_id: session.user.id,
        domain: domain.trim(),
        block_intensity: state.selectedCategory === 'productivity' ? 'strict' : 'moderate',
        days_active: ['monday', 'tuesday', 'wednesday', 'thursday', 'friday'],
        category: state.selectedCategory,
        created_at: new Date().toISOString()
      });

      setState(prev => ({
        ...prev,
        blockedSites: [...prev.blockedSites, newSite]
      }));

      toast({
        title: 'Site blocked',
        description: `${domain} has been added to your blocked sites`
      });
    } catch (error) {
      console.error('Error adding blocked site:', error);
      toast({
        title: 'Failed to block site',
        description: 'Please try again later',
        variant: 'destructive'
      });
    }
  };

  const removeBlockedSite = async (id: string) => {
    try {
      await api.removeBlockedSite(id);
      setState(prev => ({
        ...prev,
        blockedSites: prev.blockedSites.filter(site => site.id !== id)
      }));

      toast({
        title: 'Site unblocked',
        description: 'The site has been removed from your blocked list'
      });
    } catch (error) {
      console.error('Error removing blocked site:', error);
      toast({
        title: 'Failed to unblock site',
        description: 'Please try again later',
        variant: 'destructive'
      });
    }
  };

  const updateBlockedSite = async (id: string, updates: Partial<BlockedSite>) => {
    try {
      const updated = await api.updateBlockedSite(id, updates);
      setState(prev => ({
        ...prev,
        blockedSites: prev.blockedSites.map(site => 
          site.id === id ? { ...site, ...updated } : site
        )
      }));
    } catch (error) {
      console.error('Error updating blocked site:', error);
      toast({
        title: 'Failed to update site',
        description: 'Please try again later',
        variant: 'destructive'
      });
    }
  };

  const toggleBlocking = () => {
    setState(prev => ({
      ...prev,
      isBlockingEnabled: !prev.isBlockingEnabled
    }));

    toast({
      title: state.isBlockingEnabled ? 'Blocking disabled' : 'Blocking enabled',
      description: state.isBlockingEnabled ? 
        'Distraction blocking has been turned off' : 
        'Distraction blocking is now active'
    });
  };

  const updateDigitalGoal = async (id: string, updates: Partial<DigitalMinimalismGoal>) => {
    try {
      const updated = await api.updateDigitalGoal(id, updates);
      setState(prev => ({
        ...prev,
        digitalGoals: prev.digitalGoals.map(goal => 
          goal.id === id ? { ...goal, ...updated } : goal
        )
      }));
    } catch (error) {
      console.error('Error updating digital goal:', error);
      toast({
        title: 'Failed to update goal',
        description: 'Please try again later',
        variant: 'destructive'
      });
    }
  };

  const logDistraction = async (log: Partial<DistractionLog>) => {
    if (!session?.user?.id) return;

    try {
      const newLog = await api.addDistractionLog({
        user_id: session.user.id,
        timestamp: new Date().toISOString(),
        ...log
      });

      setState(prev => ({
        ...prev,
        distractionLogs: [newLog, ...prev.distractionLogs]
      }));
    } catch (error) {
      console.error('Error logging distraction:', error);
      toast({
        title: 'Failed to log distraction',
        description: 'Please try again later',
        variant: 'destructive'
      });
    }
  };

  const toggleView = (view: keyof Pick<DistractionBlockerState, 'showScheduler' | 'showAnalytics' | 'showEnvironment' | 'showJournal' | 'showMinimalism'>) => {
    setState(prev => ({
      ...prev,
      [view]: !prev[view]
    }));
  };

  const setSelectedCategory = (category: BlockedSite['category']) => {
    setState(prev => ({
      ...prev,
      selectedCategory: category
    }));
  };

  return {
    state,
    actions: {
      addBlockedSite,
      removeBlockedSite,
      updateBlockedSite,
      toggleBlocking,
      updateDigitalGoal,
      logDistraction,
      toggleView,
      setSelectedCategory,
      refresh: loadData
    }
  };
};
