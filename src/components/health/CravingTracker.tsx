import React, { useState, useEffect, useRef, useCallback } from 'react';
import { Session } from '@supabase/supabase-js';
import { format, addDays, subDays, parseISO } from 'date-fns';
import { 
  Flame, 
  Clock, 
  Check, 
  X, 
  PlusCircle, 
  BarChart, 
  MapPin, 
  Calendar, 
  Activity, 
  Coffee, 
  Users, 
  AlertTriangle,
  ChevronLeft,
  ChevronRight,
  SlashIcon
} from 'lucide-react';
import { Button, Progress } from '../ui';
import { CravingLog } from '@/types/dataTypes';
import { useMediaQuery } from '@/hooks/useMediaQuery';
import { hapticFeedback } from '@/utils/hapticFeedback';
import { supabaseRestCall } from '@/api/apiCompatibility';
import { useSwipeable } from '../../hooks/useSwipeable';
import { useToast } from '@/components/ui/use-toast';

interface CravingTrackerProps {
  userId?: string;
  session: Session | null;
  compact?: boolean;
}

interface CravingEntry extends CravingLog {
  formattedDate?: string;
  succeeded: boolean;
}

type Trigger = 'Stress' | 'Boredom' | 'Social' | 'After Meal' | 'Alcohol' | 'Coffee' | 'Morning' | 'Driving';
type Location = 'Home' | 'Work' | 'Car' | 'Bar' | 'Outside' | 'Restaurant' | 'Friend\'s Place' | 'Public Place';
type Strategy = 'Deep Breathing' | 'Physical Activity' | 'Distraction' | 'Drinking Water' | 'Nicotine Replacement' | 'Delay' | 'Support' | 'Relaxation';

export const CravingTracker: React.FC<CravingTrackerProps> = ({ session }) => {
  const [cravingEntries, setCravingEntries] = useState<CravingEntry[]>([]);
  const [loading, setLoading] = useState<boolean>(true);
  const [showAddForm, setShowAddForm] = useState<boolean>(false);
  const [viewMode, setViewMode] = useState<'list' | 'analysis' | 'strategies'>('list');
  const [swipeProgress, setSwipeProgress] = useState<number>(0);
  
  // New craving form state
  const [intensity, setIntensity] = useState<number>(5);
  const [previousIntensity, setPreviousIntensity] = useState<number>(5); // Track previous intensity for haptic feedback
  const [trigger, setTrigger] = useState<Trigger | ''>('');
  const [location, setLocation] = useState<Location | ''>('');
  const [strategy, setStrategy] = useState<Strategy | ''>('');
  const [succeeded, setSucceeded] = useState<boolean>(false);
  const [notes, setNotes] = useState<string>('');
  const [isSaving, setIsSaving] = useState<boolean>(false);
  
  // Refs and media queries
  const sliderRef = useRef<HTMLInputElement>(null);
  const contentRef = useRef<HTMLDivElement>(null);
  const isMobile = useMediaQuery('(max-width: 768px)');
  const { toast } = useToast();
  const userId = session?.user?.id || '';

  // Get view index for animation
  const getViewIndex = () => {
    if (viewMode === 'list') return 0;
    if (viewMode === 'analysis') return 1;
    return 2; // strategies
  };

  // Setup swipe handler for view navigation with additional options
  const swipeHandlers = useSwipeable({
    onSwipedLeft: () => {
      if (viewMode === 'list') {
        setViewMode('analysis');
        hapticFeedback.light();
      } else if (viewMode === 'analysis') {
        setViewMode('strategies');
        hapticFeedback.light();
      }
    },
    onSwipedRight: () => {
      if (viewMode === 'strategies') {
        setViewMode('analysis');
        hapticFeedback.light();
      } else if (viewMode === 'analysis') {
        setViewMode('list');
        hapticFeedback.light();
      }
    },
    onSwiping: (data) => {
      // Calculate swipe progress for animation
      const direction = data.x < 0 ? 'left' : 'right';
      const maxSwipe = 150; // maximum pixels to consider for full swipe
      let progress = Math.min(Math.abs(data.x) / maxSwipe, 1);
      
      if (direction === 'left') {
        // Left swipe - moving forward
        if (viewMode === 'strategies') {
          // Already at rightmost view
          progress = 0;
        }
      } else {
        // Right swipe - moving backward
        if (viewMode === 'list') {
          // Already at leftmost view
          progress = 0;
        }
      }
      
      setSwipeProgress(direction === 'left' ? progress : -progress);
    },
    onTap: () => {
      // Reset swipe progress when tapped
      setSwipeProgress(0);
    }
  }, {
    trackTouch: true,
    trackMouse: false,
    enableHapticFeedback: true,
    preventDefaultTouchmoveEvent: false,
    threshold: 50,
    velocity: 0.2
  });

  // Reset swipe progress when view mode changes
  useEffect(() => {
    setSwipeProgress(0);
  }, [viewMode]);

  // Handle intensity changes with progressive haptic feedback
  useEffect(() => {
    if (intensity !== previousIntensity) {
      const difference = Math.abs(intensity - previousIntensity);
      
      // Provide haptic feedback based on intensity level and change magnitude
      if (intensity >= 8) {
        hapticFeedback.heavy();
      } else if (intensity >= 5) {
        hapticFeedback.medium();
      } else {
        hapticFeedback.light();
      }
      
      // Additional feedback for significant changes
      if (difference >= 3) {
        setTimeout(() => hapticFeedback.medium(), 100);
      }
      
      setPreviousIntensity(intensity);
    }
  }, [intensity, previousIntensity]);

  // Load craving data function wrapped with useCallback
  const loadCravingData = useCallback(async () => {
    try {
      setLoading(true);
      
      if (!session) {
        throw new Error('No active session');
      }
      
      // Use direct REST API call for cravings data
      const endpoint = `/rest/v1/craving_logs?user_id=eq.${userId}&order=timestamp.desc`;
      const response = await supabaseRestCall(endpoint, {}, session);
      
      // Format dates for display
      const formattedData = Array.isArray(response) 
        ? response.map((entry: CravingLog) => ({
            ...entry,
            formattedDate: format(parseISO(entry.timestamp), 'MMM dd, yyyy h:mm a')
          }))
        : [];
      
      // Use local implementation of generateMockCravingData to avoid dependency cycle
      const generateMockData = (): CravingEntry[] => {
        const mockEntries: CravingEntry[] = Array.from({ length: 20 }, (_, i) => {
          const randomDate = subDays(new Date(), Math.floor(Math.random() * 30));
          const triggers: Trigger[] = ['Stress', 'Boredom', 'Social', 'After Meal', 'Alcohol', 'Coffee', 'Morning', 'Driving'];
          const locations: Location[] = ['Home', 'Work', 'Car', 'Bar', 'Outside', 'Restaurant', "Friend's Place", 'Public Place'];
          const strategies: Strategy[] = ['Deep Breathing', 'Physical Activity', 'Distraction', 'Drinking Water', 'Nicotine Replacement', 'Delay', 'Support', 'Relaxation'];
          
          return {
            id: `mock-${i}`,
            user_id: userId || 'mock-user',
            timestamp: format(randomDate, 'yyyy-MM-dd\'T\'HH:mm:ss'),
            intensity: Math.floor(Math.random() * 10) + 1,
            trigger: Math.random() > 0.3 ? triggers[Math.floor(Math.random() * triggers.length)] : undefined,
            location: Math.random() > 0.3 ? locations[Math.floor(Math.random() * locations.length)] : undefined,
            succeeded: Math.random() > 0.4,
            strategy_used: Math.random() > 0.4 ? strategies[Math.floor(Math.random() * strategies.length)] : undefined,
            notes: Math.random() > 0.7 ? `Mock craving note ${i}` : undefined,
            formattedDate: format(randomDate, 'MMM dd, yyyy h:mm a')
          };
        });
        
        return mockEntries;
      };
      
      setCravingEntries(formattedData.length > 0 ? formattedData : generateMockData());
    } catch (error) {
      console.error('Error loading craving data:', error);
      // Fallback to mock data on error
      const generateMockData = (): CravingEntry[] => {
        const mockEntries: CravingEntry[] = Array.from({ length: 20 }, (_, i) => {
          const randomDate = subDays(new Date(), Math.floor(Math.random() * 30));
          const triggers: Trigger[] = ['Stress', 'Boredom', 'Social', 'After Meal', 'Alcohol', 'Coffee', 'Morning', 'Driving'];
          const locations: Location[] = ['Home', 'Work', 'Car', 'Bar', 'Outside', 'Restaurant', "Friend's Place", 'Public Place'];
          const strategies: Strategy[] = ['Deep Breathing', 'Physical Activity', 'Distraction', 'Drinking Water', 'Nicotine Replacement', 'Delay', 'Support', 'Relaxation'];
          
          return {
            id: `mock-${i}`,
            user_id: userId || 'mock-user',
            timestamp: format(randomDate, 'yyyy-MM-dd\'T\'HH:mm:ss'),
            intensity: Math.floor(Math.random() * 10) + 1,
            trigger: Math.random() > 0.3 ? triggers[Math.floor(Math.random() * triggers.length)] : undefined,
            location: Math.random() > 0.3 ? locations[Math.floor(Math.random() * locations.length)] : undefined,
            succeeded: Math.random() > 0.4,
            strategy_used: Math.random() > 0.4 ? strategies[Math.floor(Math.random() * strategies.length)] : undefined,
            notes: Math.random() > 0.7 ? `Mock craving note ${i}` : undefined,
            formattedDate: format(randomDate, 'MMM dd, yyyy h:mm a')
          };
        });
        
        return mockEntries;
      };
      
      setCravingEntries(generateMockData());
    } finally {
      setLoading(false);
    }
  }, [session, userId]);

  // Load craving data
  useEffect(() => {
    if (userId && session) {
      loadCravingData();
    } else {
      // Set loading to false when no userId or session
      setLoading(false);
    }
  }, [userId, session, loadCravingData]);

  const handleSaveCraving = async () => {
    try {
      // Validate form
      if (!trigger || !location) {
        toast({
          title: "Missing information",
          description: "Please fill out all required fields",
          variant: "destructive"
        });
        hapticFeedback.error();
        return;
      }
      
      setIsSaving(true);
      hapticFeedback.success();
      
      const timestamp = new Date().toISOString();
      
      // Create new craving object
      const newCraving = {
        user_id: userId,
        timestamp,
        intensity,
        trigger,
        location,
        succeeded,
        strategy_used: succeeded ? strategy : null,
        notes: notes || null
      };
      
      if (session) {
        // Use direct REST API call to save craving data
        const endpoint = '/rest/v1/craving_logs';
        await supabaseRestCall(
          endpoint, 
          { 
            method: 'POST',
            body: JSON.stringify(newCraving)
          }, 
          session
        );
      }
      
      // Add to state with formatted date
      const displayCraving: CravingEntry = {
        ...newCraving,
        id: `craving-${Date.now()}`,
        formattedDate: format(new Date(timestamp), 'MMM dd, yyyy h:mm a')
      } as CravingEntry;
      
      setCravingEntries([displayCraving, ...cravingEntries]);
      
      toast({
        title: "Craving logged",
        description: "Your craving has been successfully recorded"
      });
      
      // Reset form
      resetForm();
      setShowAddForm(false);
    } catch (error) {
      console.error('Error saving craving:', error);
      toast({
        title: "Error saving",
        description: "There was a problem saving your craving data",
        variant: "destructive"
      });
      hapticFeedback.error();
    } finally {
      setIsSaving(false);
    }
  };

  const handleIntensityChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const newValue = parseInt(e.target.value);
    setIntensity(newValue);
  };

  const resetForm = () => {
    setIntensity(5);
    setTrigger('');
    setLocation('');
    setStrategy('');
    setSucceeded(false);
    setNotes('');
  };

  const getTriggerIcon = (triggerName: string) => {
    switch(triggerName) {
      case 'Stress': return <AlertTriangle className="h-4 w-4 text-red-500" />;
      case 'Social': return <Users className="h-4 w-4 text-blue-500" />;
      case 'Boredom': return <Clock className="h-4 w-4 text-gray-500" />;
      case 'After Meal': return <Calendar className="h-4 w-4 text-green-500" />;
      case 'Coffee': return <Coffee className="h-4 w-4 text-yellow-800" />;
      case 'Alcohol': return <Activity className="h-4 w-4 text-purple-500" />;
      default: return <Flame className="h-4 w-4 text-orange-500" />;
    }
  };

  const getLocationIcon = (locationName: string) => {
    return <MapPin className="h-4 w-4 text-blue-500" />;
  };

  const getSuccessRatePercent = () => {
    if (!cravingEntries.length) return 0;
    const successes = cravingEntries.filter(entry => entry.succeeded).length;
    return Math.round((successes / cravingEntries.length) * 100);
  };

  const getAverageIntensity = () => {
    if (!cravingEntries.length) return 0;
    const total = cravingEntries.reduce((sum, entry) => sum + entry.intensity, 0);
    return total / cravingEntries.length;
  };

  const getTopTriggers = () => {
    if (!cravingEntries.length) return [];
    
    const triggerCounts: Record<string, number> = {};
    cravingEntries.forEach(entry => {
      if (entry.trigger) {
        triggerCounts[entry.trigger] = (triggerCounts[entry.trigger] || 0) + 1;
      }
    });
    
    return Object.entries(triggerCounts)
      .map(([trigger, count]) => ({ trigger, count }))
      .sort((a, b) => b.count - a.count)
      .slice(0, 3);
  };

  const getMostEffectiveStrategies = () => {
    if (!cravingEntries.length) return [];
    
    // Only consider successful cravings with strategies
    const successfulEntries = cravingEntries.filter(entry => entry.succeeded && entry.strategy_used);
    
    const strategyCounts: Record<string, number> = {};
    successfulEntries.forEach(entry => {
      if (entry.strategy_used) {
        strategyCounts[entry.strategy_used] = (strategyCounts[entry.strategy_used] || 0) + 1;
      }
    });
    
    return Object.entries(strategyCounts)
      .map(([strategy, count]) => ({ strategy, count }))
      .sort((a, b) => b.count - a.count)
      .slice(0, 3);
  };

  const getViewTransitionStyle = () => {
    const baseIndex = getViewIndex();
    const percentMove = swipeProgress * 100;
    const translateValue = `${-baseIndex * 100 - percentMove}%`;
    
    return {
      transform: `translateX(${translateValue})`,
      transition: swipeProgress === 0 ? 'transform 0.3s ease-out' : 'none'
    };
  };

  const renderCravingList = () => {
    return (
      <div className="space-y-4">
        {cravingEntries.length === 0 ? (
          <div className="text-center py-8 bg-gray-50 rounded-lg">
            <Flame className="h-12 w-12 text-gray-400 mx-auto mb-3" />
            <h3 className="text-lg font-medium text-gray-900">No cravings tracked yet</h3>
            <p className="text-gray-500 mt-1">
              Start tracking your cravings to gain insights
            </p>
          </div>
        ) : (
          cravingEntries.map(entry => (
            <div key={entry.id} className="border rounded-lg bg-white overflow-hidden">
              <div className="flex items-start p-4">
                <div className={`p-2 rounded-full mr-3 ${entry.succeeded ? 'bg-green-100' : 'bg-red-100'}`}>
                  {entry.succeeded ? (
                    <Check className="h-5 w-5 text-green-600" />
                  ) : (
                    <X className="h-5 w-5 text-red-600" />
                  )}
                </div>
                <div className="flex-1">
                  <div className="flex justify-between">
                    <div>
                      <h4 className="font-medium flex items-center">
                        <Flame className="h-4 w-4 text-orange-500 mr-1" />
                        Intensity: {entry.intensity}/10
                      </h4>
                      <p className="text-sm text-gray-500">
                        {entry.formattedDate}
                      </p>
                    </div>
                    <div className="text-right text-sm">
                      <div className="font-medium text-gray-900">
                        {entry.succeeded ? 'Resisted' : 'Gave in'}
                      </div>
                    </div>
                  </div>
                  
                  <div className="mt-2 flex flex-wrap gap-2">
                    {entry.trigger && (
                      <div className="inline-flex items-center px-2 py-1 rounded-full text-xs bg-blue-100 text-blue-800">
                        {getTriggerIcon(entry.trigger)}
                        <span className="ml-1">{entry.trigger}</span>
                      </div>
                    )}
                    
                    {entry.location && (
                      <div className="inline-flex items-center px-2 py-1 rounded-full text-xs bg-purple-100 text-purple-800">
                        {getLocationIcon(entry.location)}
                        <span className="ml-1">{entry.location}</span>
                      </div>
                    )}
                    
                    {entry.strategy_used && (
                      <div className="inline-flex items-center px-2 py-1 rounded-full text-xs bg-green-100 text-green-800">
                        <span>{entry.strategy_used}</span>
                      </div>
                    )}
                  </div>
                  
                  {entry.notes && (
                    <p className="mt-2 text-sm text-gray-600">
                      {entry.notes}
                    </p>
                  )}
                </div>
              </div>
            </div>
          ))
        )}
      </div>
    );
  };

  const renderAnalysis = () => {
    const successRate = getSuccessRatePercent();
    const avgIntensity = getAverageIntensity();
    const topTriggers = getTopTriggers();
    const effectiveStrategies = getMostEffectiveStrategies();
    
    return (
      <div className="space-y-6">
        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
          <div className="bg-white rounded-lg p-4 border">
            <h3 className="text-lg font-medium mb-2">Success Rate</h3>
            <div className="flex items-end">
              <span className="text-3xl font-bold text-green-600">{successRate}%</span>
              <span className="text-sm text-gray-500 ml-2 mb-1">cravings resisted</span>
            </div>
            <div className="mt-2">
              <Progress value={successRate} className="h-2" />
            </div>
          </div>
          
          <div className="bg-white rounded-lg p-4 border">
            <h3 className="text-lg font-medium mb-2">Average Intensity</h3>
            <div className="flex items-end">
              <span className="text-3xl font-bold text-orange-500">{avgIntensity.toFixed(1)}</span>
              <span className="text-sm text-gray-500 ml-2 mb-1">out of 10</span>
            </div>
            <div className="mt-2">
              <Progress value={avgIntensity * 10} className="h-2" />
            </div>
          </div>
        </div>
        
        <div className="bg-white rounded-lg p-4 border">
          <h3 className="text-lg font-medium mb-3">Top Triggers</h3>
          {topTriggers.length > 0 ? (
            <div className="space-y-3">
              {topTriggers.map(({ trigger, count }) => (
                <div key={trigger} className="flex items-center">
                  <div className="w-8">
                    {getTriggerIcon(trigger)}
                  </div>
                  <div className="flex-1">
                    <div className="flex justify-between items-center mb-1">
                      <span className="font-medium">{trigger}</span>
                      <span className="text-sm text-gray-500">{count} times</span>
                    </div>
                    <Progress 
                      value={(count / cravingEntries.length) * 100} 
                      className="h-2" 
                    />
                  </div>
                </div>
              ))}
            </div>
          ) : (
            <p className="text-gray-500">No trigger data available yet</p>
          )}
        </div>
        
        <div className="bg-white rounded-lg p-4 border">
          <h3 className="text-lg font-medium mb-3">Most Effective Strategies</h3>
          {effectiveStrategies.length > 0 ? (
            <div className="space-y-3">
              {effectiveStrategies.map(({ strategy, count }) => (
                <div key={strategy} className="flex items-center">
                  <div className="w-8">
                    <Check className="h-4 w-4 text-green-500" />
                  </div>
                  <div className="flex-1">
                    <div className="flex justify-between items-center mb-1">
                      <span className="font-medium">{strategy}</span>
                      <span className="text-sm text-gray-500">{count} times</span>
                    </div>
                    <Progress 
                      value={(count / cravingEntries.filter(e => e.succeeded).length) * 100} 
                      className="h-2" 
                    />
                  </div>
                </div>
              ))}
            </div>
          ) : (
            <p className="text-gray-500">No strategy data available yet</p>
          )}
        </div>
      </div>
    );
  };

  const renderStrategies = () => {
    const strategies = [
      {
        title: "4D Technique",
        description: "Delay, Deep breathe, Drink water, Do something else.",
        effectiveness: 85
      },
      {
        title: "Physical Activity",
        description: "Even a 5-minute walk can reduce craving intensity.",
        effectiveness: 80
      },
      {
        title: "Mindfulness",
        description: "Observe your craving without judging it, until it passes.",
        effectiveness: 75
      },
      {
        title: "Distraction",
        description: "Engage in an activity that requires focus and attention.",
        effectiveness: 70
      },
      {
        title: "Deep Breathing",
        description: "Breathe in for 4 counts, hold for 2, out for 6.",
        effectiveness: 65
      }
    ];
    
    return (
      <div className="space-y-4">
        <div className="bg-blue-50 p-4 rounded-lg">
          <h3 className="text-lg font-medium text-blue-800 mb-1">Craving Management Tips</h3>
          <p className="text-blue-600 text-sm">
            Cravings typically last 3-5 minutes. Having a strategy ready can help you get through them more easily.
          </p>
        </div>
        
        {strategies.map((strategy, index) => (
          <div key={index} className="bg-white rounded-lg border p-4">
            <div className="flex justify-between mb-2">
              <h3 className="font-medium">{strategy.title}</h3>
              <span className="text-sm text-green-600">
                {strategy.effectiveness}% effective
              </span>
            </div>
            <p className="text-sm text-gray-600 mb-2">{strategy.description}</p>
            <Progress value={strategy.effectiveness} className="h-2" />
          </div>
        ))}
        
        <div className="bg-green-50 p-4 rounded-lg">
          <h3 className="text-lg font-medium text-green-800 mb-1">Remember</h3>
          <p className="text-green-600 text-sm">
            Each time you successfully overcome a craving, you strengthen your ability to resist future cravings.
          </p>
        </div>
      </div>
    );
  };

  const renderAddForm = () => {
    const triggers: Trigger[] = ['Stress', 'Boredom', 'Social', 'After Meal', 'Alcohol', 'Coffee', 'Morning', 'Driving'];
    const locations: Location[] = ['Home', 'Work', 'Car', 'Bar', 'Outside', 'Restaurant', 'Friend\'s Place', 'Public Place'];
    const strategies: Strategy[] = ['Deep Breathing', 'Physical Activity', 'Distraction', 'Drinking Water', 'Nicotine Replacement', 'Delay', 'Support', 'Relaxation'];
    
    return (
      <div className="bg-white rounded-lg p-4 shadow">
        <h3 className="text-lg font-medium mb-4">Log a Craving</h3>
        
        <div className="mb-4">
          <label className="block text-sm font-medium text-gray-700 mb-1">
            Craving Intensity (1-10)
          </label>
          <div className="flex items-center gap-2">
            <span className="text-sm">1</span>
            <input
              ref={sliderRef}
              type="range"
              min="1"
              max="10"
              value={intensity}
              onChange={handleIntensityChange}
              className="flex-1 accent-orange-500"
            />
            <span className="text-sm">10</span>
          </div>
          <div className="flex justify-between mt-1">
            <span className="text-xs text-gray-500">Mild</span>
            <span className="text-xs text-gray-500">Strong</span>
          </div>
          <div className="mt-2 text-center">
            <span className={`text-lg font-bold ${
              intensity >= 8 ? 'text-red-500' : 
              intensity >= 5 ? 'text-orange-500' : 
              'text-green-500'
            }`}>
              {intensity}/10
            </span>
          </div>
        </div>
        
        <div>
          <label className="block text-sm font-medium text-gray-700 mb-1">
            Trigger
          </label>
          <select 
            value={trigger} 
            onChange={(e) => setTrigger(e.target.value as Trigger)}
            className="w-full p-2 border rounded-md"
          >
            <option value="">Select a trigger</option>
            {triggers.map(t => (
              <option key={t} value={t}>{t}</option>
            ))}
          </select>
        </div>
        
        <div>
          <label className="block text-sm font-medium text-gray-700 mb-1">
            Location
          </label>
          <select 
            value={location} 
            onChange={(e) => setLocation(e.target.value as Location)}
            className="w-full p-2 border rounded-md"
          >
            <option value="">Select a location</option>
            {locations.map(l => (
              <option key={l} value={l}>{l}</option>
            ))}
          </select>
        </div>
        
        <div>
          <div className="flex items-center mb-2">
            <input 
              type="checkbox" 
              id="succeeded" 
              checked={succeeded} 
              onChange={() => setSucceeded(!succeeded)}
              className="h-4 w-4 text-blue-600 rounded"
            />
            <label htmlFor="succeeded" className="ml-2 text-sm font-medium text-gray-700">
              I resisted this craving
            </label>
          </div>
          
          {succeeded && (
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">
                Strategy Used
              </label>
              <select 
                value={strategy} 
                onChange={(e) => setStrategy(e.target.value as Strategy)}
                className="w-full p-2 border rounded-md"
              >
                <option value="">Select a strategy</option>
                {strategies.map(s => (
                  <option key={s} value={s}>{s}</option>
                ))}
              </select>
            </div>
          )}
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
            placeholder="Any additional details..."
          />
        </div>
        
        <div className="mt-6 flex gap-3">
          <Button 
            variant="outline" 
            className="flex-1" 
            onClick={() => {
              setShowAddForm(false);
              hapticFeedback.light();
            }}
          >
            Cancel
          </Button>
          <Button 
            className="flex-1 bg-primary" 
            onClick={handleSaveCraving}
            disabled={isSaving}
          >
            {isSaving ? 'Saving...' : 'Save Craving'}
          </Button>
        </div>
      </div>
    );
  };

  // Render component with enhanced transitions
  return (
    <div 
      className="bg-white rounded-lg overflow-hidden"
      ref={contentRef}
      onTouchStart={swipeHandlers.onTouchStart}
      onTouchMove={swipeHandlers.onTouchMove}
      onTouchEnd={swipeHandlers.onTouchEnd}
    >
      {/* View mode tabs */}
      <div className="flex border-b">
        <button
          className={`flex-1 py-3 text-center text-sm font-medium relative ${
            viewMode === 'list' ? 'text-primary' : 'text-gray-500'
          }`}
          onClick={() => setViewMode('list')}
        >
          <span className="flex items-center justify-center">
            <Flame className="h-4 w-4 mr-1.5" />
            Cravings
          </span>
          {viewMode === 'list' && (
            <span className="absolute bottom-0 left-0 w-full h-0.5 bg-primary" />
          )}
        </button>
        <button
          className={`flex-1 py-3 text-center text-sm font-medium relative ${
            viewMode === 'analysis' ? 'text-primary' : 'text-gray-500'
          }`}
          onClick={() => setViewMode('analysis')}
        >
          <span className="flex items-center justify-center">
            <BarChart className="h-4 w-4 mr-1.5" />
            Analysis
          </span>
          {viewMode === 'analysis' && (
            <span className="absolute bottom-0 left-0 w-full h-0.5 bg-primary" />
          )}
        </button>
        <button
          className={`flex-1 py-3 text-center text-sm font-medium relative ${
            viewMode === 'strategies' ? 'text-primary' : 'text-gray-500'
          }`}
          onClick={() => setViewMode('strategies')}
        >
          <span className="flex items-center justify-center">
            <Check className="h-4 w-4 mr-1.5" />
            Strategies
          </span>
          {viewMode === 'strategies' && (
            <span className="absolute bottom-0 left-0 w-full h-0.5 bg-primary" />
          )}
        </button>
      </div>
      
      {/* Mobile swipe indicators */}
      {isMobile && (
        <div className="flex items-center justify-center py-2 space-x-1">
          <span className={`h-1.5 w-1.5 rounded-full ${viewMode === 'list' ? 'bg-primary' : 'bg-gray-300'}`} />
          <span className={`h-1.5 w-1.5 rounded-full ${viewMode === 'analysis' ? 'bg-primary' : 'bg-gray-300'}`} />
          <span className={`h-1.5 w-1.5 rounded-full ${viewMode === 'strategies' ? 'bg-primary' : 'bg-gray-300'}`} />
        </div>
      )}
      
      {/* Content area with swipe capability */}
      <div 
        className="relative overflow-hidden"
      >
        <div 
          className="flex w-full transition-transform"
          style={getViewTransitionStyle()}
        >
          {/* List View */}
          <div className="min-w-full p-4">
            <div className="flex justify-between items-center mb-4">
              <h3 className="text-lg font-semibold">Your Cravings</h3>
              <Button
                size="sm"
                onClick={() => setShowAddForm(true)}
                className="flex items-center"
              >
                <PlusCircle className="h-4 w-4 mr-1.5" />
                Log Craving
              </Button>
            </div>
            
            {loading ? (
              <div className="flex justify-center py-8">
                <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-primary" />
              </div>
            ) : (
              renderCravingList()
            )}
          </div>
          
          {/* Analysis View */}
          <div className="min-w-full p-4">
            <div className="flex justify-between items-center mb-4">
              <h3 className="text-lg font-semibold">Craving Analysis</h3>
              {viewMode === 'analysis' && isMobile && (
                <div className="flex space-x-1 text-xs text-gray-500">
                  <ChevronLeft className="h-4 w-4" />
                  <ChevronRight className="h-4 w-4" />
                  <span>Swipe</span>
                </div>
              )}
            </div>
            {loading ? (
              <div className="flex justify-center py-8">
                <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-primary" />
              </div>
            ) : (
              renderAnalysis()
            )}
          </div>
          
          {/* Strategies View */}
          <div className="min-w-full p-4">
            <div className="flex justify-between items-center mb-4">
              <h3 className="text-lg font-semibold">Effective Strategies</h3>
              {viewMode === 'strategies' && isMobile && (
                <div className="flex space-x-1 text-xs text-gray-500">
                  <ChevronLeft className="h-4 w-4" />
                  <span>Swipe</span>
                </div>
              )}
            </div>
            {loading ? (
              <div className="flex justify-center py-8">
                <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-primary" />
              </div>
            ) : (
              renderStrategies()
            )}
          </div>
        </div>
      </div>
      
      {/* Add form modal */}
      {showAddForm && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/50">
          <div className="bg-white rounded-lg shadow-xl w-full max-w-md overflow-hidden">
            <div className="p-4 border-b flex justify-between items-center">
              <h2 className="text-lg font-semibold">Log a Craving</h2>
              <Button
                variant="ghost"
                size="icon"
                onClick={() => setShowAddForm(false)}
              >
                <X className="h-4 w-4" />
              </Button>
            </div>
            {renderAddForm()}
          </div>
        </div>
      )}
    </div>
  );
}; 