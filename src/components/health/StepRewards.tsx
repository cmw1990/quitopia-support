import React, { useState, useEffect, useMemo } from 'react';
import { Session } from '@supabase/supabase-js';
import {
  Card,
  CardHeader,
  CardTitle,
  CardDescription,
  CardContent,
  CardFooter,
  Button,
  Progress,
  Badge,
  Avatar,
  AvatarImage,
  AvatarFallback,
  Tabs,
  TabsList,
  TabsTrigger,
  TabsContent,
  Dialog,
  DialogTrigger,
  DialogContent,
  DialogHeader,
  DialogTitle,
  DialogDescription,
  DialogFooter,
  Alert,
  AlertTitle,
  AlertDescription,
} from '../ui';
import {
  Footprints,
  Trophy,
  Gift,
  ChevronRight,
  Calendar,
  CheckCircle2,
  Clock,
  Smartphone,
  AlertCircle,
  Share2,
  CircleSlash,
  BarChart,
  ChevronDown,
  ChevronUp,
  Plus,
  Minus,
  Award,
  Zap,
  Info,
  ExternalLink,
  ShoppingBag,
  RefreshCw,
  Flame,
  Percent,
  X,
  Gift as GiftIcon,
  Star
} from 'lucide-react';
import { 
  getUserStepData, 
  calculateStepRewards, 
  connectHealthApp, 
  disconnectHealthApp,
  syncHealthDataForUser,
  getAvailableRewards,
  StepReward,
  Reward,
  StepData,
  DiscountCode,
  NRTProductPreview,
  supabaseRestCall
} from "../../api/apiCompatibility";
import { motion, AnimatePresence } from 'framer-motion';
import { toast } from 'sonner';
import { format, subDays, isAfter, formatDistanceToNow } from 'date-fns';
import { hapticFeedback } from '@/utils/hapticFeedback';

interface ConnectedApp {
  app_name: string;
  connected_at: string;
  last_sync: string;
  status: 'active' | 'disconnected' | 'error';
}

// Create an extended interface for our local use that extends the API Reward interface
interface LocalReward extends Reward {
  steps_required?: number;
  claimed?: boolean;
  claimed_at?: string;
  reward_link?: string;
}

interface StepRewardsProps {
  session: Session | null;
  className?: string;
  onStepMilestoneReached?: (milestone: number) => void;
  onRewardClaimed?: (reward: LocalReward) => void;
  compact?: boolean;
}

export const StepRewards: React.FC<StepRewardsProps> = ({
  session,
  className = '',
  onStepMilestoneReached,
  onRewardClaimed,
  compact = false
}) => {
  // State
  const [stepData, setStepData] = useState<StepData[]>([]);
  const [rewards, setRewards] = useState<LocalReward[]>([]);
  const [availableRewards, setAvailableRewards] = useState<LocalReward[]>([]);
  const [loading, setLoading] = useState(true);
  const [connectedApps, setConnectedApps] = useState<ConnectedApp[]>([]);
  const [selectedReward, setSelectedReward] = useState<LocalReward | null>(null);
  const [isSyncing, setIsSyncing] = useState(false);
  const [timeframe, setTimeframe] = useState<'week' | 'month' | 'all'>('week');
  const [showConnectDialog, setShowConnectDialog] = useState(false);
  const [expandedReward, setExpandedReward] = useState<string | null>(null);
  const [totals, setTotals] = useState({
    steps: 0,
    distance: 0,
    calories: 0,
    daysLogged: 0
  });

  // Calculate totals
  const calculateTotals = () => {
    if (stepData.length === 0) return { steps: 0, distance: 0, calories: 0 };

    let filteredData = [...stepData];
    
    if (timeframe === 'week') {
      const weekAgo = subDays(new Date(), 7);
      filteredData = filteredData.filter(d => isAfter(new Date(d.date), weekAgo));
    } else if (timeframe === 'month') {
      const monthAgo = subDays(new Date(), 30);
      filteredData = filteredData.filter(d => isAfter(new Date(d.date), monthAgo));
    }

    const steps = filteredData.reduce((total, day) => total + day?.step_count, 0);
    const distance = filteredData.reduce((total, day) => total + day.distance_km, 0);
    const calories = filteredData.reduce((total, day) => total + day.calories_burned, 0);
    
    setTotals({
      steps,
      distance: Math.round(distance * 100) / 100,
      calories: Math.round(calories),
      daysLogged: filteredData.length
    });
    
    // Check if we reached a milestone
    const milestones = [5000, 10000, 25000, 50000, 100000];
    for (const milestone of milestones) {
      if (steps >= milestone && onStepMilestoneReached) {
        onStepMilestoneReached(milestone);
      }
    }

    return { steps, distance, calories };
  };

  const { steps, distance, calories } = calculateTotals();

  // Load step data and rewards
  const loadStepData = async () => {
    try {
      setLoading(true);
      
      // Get user's step data
      const data = await getUserStepData(session?.user?.id || '', session);
      
      // Validate and handle data safely
      if (data && Array.isArray(data.stepData)) {
        setStepData(data.stepData);
      } else {
        setStepData([]);
      }
      
      // Set connected apps data
      if (data && Array.isArray(data.connectedApps)) {
        setConnectedApps(data.connectedApps);
      } else {
        setConnectedApps([]);
      }
      
      // Calculate rewards based on step data
      const rewardData = await calculateStepRewards(session?.user?.id || '', session);
      
      // Convert StepReward[] to LocalReward[] with proper type property
      const fullRewards: LocalReward[] = (rewardData || []).map(stepReward => ({
        id: stepReward.id,
        title: `Step Reward: ${stepReward?.steps_required?.toLocaleString() || '0'} Steps`,
        description: `Reward for reaching ${stepReward?.steps_required?.toLocaleString() || '0'} steps`,
        sponsor: stepReward?.sponsor || 'Mission Fresh',
        type: 'discount' as const, // Add required type property
        // Optional properties
        value: stepReward?.discount_percentage,
        code: stepReward?.reward_code,
        expiry_date: stepReward?.valid_until,
        // Local properties
        steps_required: stepReward?.steps_required,
        claimed: stepReward?.is_claimed
      }));
      
      setRewards(fullRewards);
      
      // Get available rewards
      const available = await getAvailableRewards(session?.user?.id || '', session);
      
      // Convert available rewards to LocalReward[] with proper type property
      const availableWithClaimed: LocalReward[] = (available || []).map(reward => ({
        id: reward.id,
        title: reward.title || '',
        description: reward.description || '',
        sponsor: reward.sponsor || '',
        type: (reward.reward_type as 'discount' | 'product' | 'badge') || 'discount',
        // Optional properties
        sponsor_logo: reward.sponsor_logo,
        value: reward?.discount_percentage,
        code: reward?.reward_code,
        expiry_date: reward.expiry_date,
        // Local properties
        steps_required: reward?.steps_required,
        claimed: reward?.claimed
      }));
      
      setAvailableRewards(availableWithClaimed);
      
      // Calculate totals after data is loaded
      calculateTotals();
    } catch (error) {
      console.error('Error loading step data:', error);
      toast.error('Failed to load step rewards data');
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    loadStepData();
  }, [session]);

  useEffect(() => {
    calculateTotals();
  }, [stepData]);

  // Handle health app connection
  const handleConnectApp = async (appName: string) => {
    try {
      setLoading(true);
      const result = await connectHealthApp(session?.user?.id || '', appName, session);
      
      if (result.success) {
        toast.success(`Successfully connected to ${appName}`);
        hapticFeedback.success();
        loadStepData(); // Reload data after connection
      } else {
        toast.error(result.message || `Failed to connect to ${appName}`);
        hapticFeedback.error();
      }
    } catch (error) {
      console.error('Error connecting app:', error);
      toast.error(`Error connecting to ${appName}`);
      hapticFeedback.error();
    } finally {
      setShowConnectDialog(false);
      setLoading(false);
    }
  };

  // Handle health app disconnection
  const handleDisconnectApp = async (appName: string) => {
    try {
      setLoading(true);
      const result = await disconnectHealthApp(session?.user?.id || '', appName, session);
      
      if (result.success) {
        toast.success(`Successfully disconnected from ${appName}`);
        hapticFeedback.success();
        loadStepData(); // Reload data after disconnection
      } else {
        toast.error(result.message || `Failed to disconnect from ${appName}`);
        hapticFeedback.error();
      }
    } catch (error) {
      console.error('Error disconnecting app:', error);
      toast.error(`Error disconnecting from ${appName}`);
      hapticFeedback.error();
    } finally {
      setLoading(false);
    }
  };

  // Sync health data
  const handleSyncData = async () => {
    try {
      setIsSyncing(true);
      const result = await syncHealthDataForUser(session?.user?.id || '', session);
      
      if (result.success) {
        toast.success('Health data successfully synced');
        hapticFeedback.success();
        
        // If we have new data, update the UI
        if (result.syncedData && Array.isArray(result.syncedData)) {
          setStepData(prevData => {
            // Merge the new data with existing data
            const existingDates = new Set(prevData.map(d => d.date));
            const newData = result.syncedData?.filter(d => !existingDates.has(d.date)) || [];
            return [...prevData, ...newData];
          });
          
          // Recalculate totals with new data
          calculateTotals();
        }
      } else {
        toast.error(result.message || 'Failed to sync health data');
        hapticFeedback.error();
      }
    } catch (error) {
      console.error('Error syncing data:', error);
      toast.error('Error syncing health data');
      hapticFeedback.error();
    } finally {
      setIsSyncing(false);
    }
  };

  // Handle reward claim
  const handleClaimReward = async (reward: LocalReward) => {
    try {
      if (!session?.user?.id) {
        toast.error('You must be logged in to claim rewards');
        hapticFeedback.error();
        return;
      }
      
      setLoading(true);
      
      // Prepare the endpoint and request data
      const endpoint = `/rest/v1/step_rewards?id=eq.${reward.id}`;
      const updateData = {
        is_claimed: true,
        claimed_at: new Date().toISOString()
      };
      
      // Call the Supabase REST API to update the reward
      const result = await supabaseRestCall(endpoint, {
        method: 'PATCH',
        body: JSON.stringify(updateData)
      }, session);
      
      if (result) {
        // Update local state to reflect the claimed reward
        setRewards(prev => 
          prev.map(r => 
            r.id === reward.id ? { ...r, claimed: true } : r
          )
        );
        
        // Trigger callback if provided
        if (onRewardClaimed) {
          onRewardClaimed(reward);
        }
        
        toast.success('Reward claimed successfully!');
        hapticFeedback.success();
        
        // Close reward dialog
        setSelectedReward(null);
      } else {
        toast.error('Failed to claim reward');
        hapticFeedback.error();
      }
    } catch (error) {
      console.error('Error claiming reward:', error);
      toast.error('Error claiming reward');
      hapticFeedback.error();
    } finally {
      setLoading(false);
    }
  };

  // Calculate next reward milestone
  const getNextRewardMilestone = () => {
    if (availableRewards.length === 0) return null;
    
    const sortedRewards = [...availableRewards]
      .filter(r => !rewards.some(earned => earned.id === r.id))
      .sort((a, b) => a?.steps_required - b?.steps_required);
    
    return sortedRewards[0] || null;
  };

  const nextMilestone = getNextRewardMilestone();
  
  // Calculate steps to next milestone
  const getStepsToNextMilestone = () => {
    if (!nextMilestone) return null;
    return Math.max(0, nextMilestone?.steps_required - steps);
  };

  const stepsToNext = getStepsToNextMilestone();
  
  // Calculate percentage to next milestone
  const getPercentageToNextMilestone = () => {
    if (!nextMilestone || steps === 0) return 0;
    const percentage = (steps / nextMilestone?.steps_required) * 100;
    return Math.min(percentage, 100);
  };

  // Toggle reward details
  const toggleRewardDetails = (rewardId: string) => {
    setExpandedReward(prev => prev === rewardId ? null : rewardId);
    hapticFeedback.light(); // Add haptic feedback for expanding/collapsing
  };

  // Add device integration functions

  // Function to check if device health integration is available
  const checkDeviceHealthAvailability = () => {
    // Check if we're on a mobile device by inspecting user agent
    const isMobileDevice = /Android|webOS|iPhone|iPad|iPod|BlackBerry|IEMobile|Opera Mini/i.test(navigator.userAgent);
    
    // Check if we have the Health API available (iOS Health or Android Health Connect)
    const hasHealthAPI = typeof window !== 'undefined' && 
      (
        // @ts-ignore - Check for Health API availability
        (window.Health || window.HealthKit) || 
        // @ts-ignore - Check for Android Health Connect
        (window.AndroidHealthConnect) ||
        // For development testing
        import.meta.env.DEV
      );
    
    return { isMobileDevice, hasHealthAPI };
  };

  // Function to request health permissions on device
  const requestHealthPermissions = async () => {
    try {
      const { isMobileDevice, hasHealthAPI } = checkDeviceHealthAvailability();
      
      if (!isMobileDevice || !hasHealthAPI) {
        toast.error('Health data integration is not available on this device');
        return false;
      }
      
      // This would be replaced with actual native health API calls in a real implementation
      // For now, we'll simulate a successful permission granting
      
      toast.success('Health data permissions granted');
      hapticFeedback.success();
      
      // In a real app, you would need to:
      // 1. Request specific permissions (steps, distance, etc.)
      // 2. Store the granted permissions
      // 3. Begin fetching data based on those permissions
      
      return true;
    } catch (error) {
      console.error('Error requesting health permissions:', error);
      toast.error('Failed to get health data permissions');
      return false;
    }
  };

  // Render loading state
  if (loading) {
    return (
      <Card className={className}>
        <CardHeader>
          <CardTitle>Step Rewards</CardTitle>
          <CardDescription>Earn rewards for staying active</CardDescription>
        </CardHeader>
        <CardContent>
          <div className="space-y-4">
            <div className="h-20 w-full rounded-md bg-muted animate-pulse" />
            <div className="h-4 w-3/4 rounded-md bg-muted animate-pulse" />
            <div className="h-4 w-1/2 rounded-md bg-muted animate-pulse" />
            <div className="space-y-2">
              <div className="h-16 w-full rounded-md bg-muted animate-pulse" />
              <div className="h-16 w-full rounded-md bg-muted animate-pulse" />
            </div>
          </div>
        </CardContent>
      </Card>
    );
  }

  // Render no session state
  if (!session) {
    return (
      <Card className={className}>
        <CardHeader>
          <CardTitle>Step Rewards</CardTitle>
          <CardDescription>Earn rewards for staying active</CardDescription>
        </CardHeader>
        <CardContent className="text-center">
          <div className="py-6">
            <Trophy className="h-12 w-12 text-amber-500 mx-auto mb-4" />
            <h3 className="text-lg font-medium mb-2">Sign in to track your steps</h3>
            <p className="text-sm text-muted-foreground mb-4">
              Connect your fitness app and earn rewards for your daily activity
            </p>
            <Button>Sign In</Button>
          </div>
        </CardContent>
      </Card>
    );
  }

  // Render no connected apps state
  if (connectedApps.length === 0) {
    return (
      <Card className={className}>
        <CardHeader>
          <CardTitle>Step Rewards</CardTitle>
          <CardDescription>Earn rewards for staying active</CardDescription>
        </CardHeader>
        <CardContent className="text-center">
          <div className="py-6">
            <Smartphone className="h-12 w-12 text-muted-foreground mx-auto mb-4" />
            <h3 className="text-lg font-medium mb-2">Connect a Health App</h3>
            <p className="text-sm text-muted-foreground mb-4">
              Connect your fitness app to track steps and earn rewards
            </p>
            <Button onClick={() => setShowConnectDialog(true)}>
              Connect App
            </Button>
          </div>
        </CardContent>
      </Card>
    );
  }

  // Main component render
  return (
    <>
      <Card className={className}>
        <CardHeader>
          <div className="flex items-center justify-between">
            <div>
              <CardTitle>Step Rewards</CardTitle>
              <CardDescription>Earn rewards for staying active</CardDescription>
            </div>
            <div className="flex items-center space-x-2">
              {connectedApps.length > 0 && (
                <Button 
                  size="sm" 
                  variant="outline" 
                  className="flex items-center"
                  onClick={handleSyncData}
                  disabled={isSyncing}
                >
                  <RefreshCw className={`h-4 w-4 mr-2 ${isSyncing ? 'animate-spin' : ''}`} />
                  Sync
                </Button>
              )}
              <Button 
                size="sm" 
                variant="ghost"
                onClick={() => setShowConnectDialog(true)}
              >
                {connectedApps.length > 0 ? 'Manage Apps' : 'Connect App'}
              </Button>
            </div>
          </div>
        </CardHeader>
        
        <CardContent className="space-y-6">
          {/* Step summary */}
          <div className="rounded-lg border bg-card shadow-sm">
            <div className="p-4">
              <Tabs defaultValue={timeframe} onValueChange={(value: any) => setTimeframe(value)}>
                <TabsList className="grid w-full grid-cols-3">
                  <TabsTrigger value="week">This Week</TabsTrigger>
                  <TabsTrigger value="month">This Month</TabsTrigger>
                  <TabsTrigger value="all">All Time</TabsTrigger>
                </TabsList>
                
                <TabsContent value={timeframe} className="mt-4">
                  <div className="flex flex-col md:flex-row justify-between items-center gap-4">
                    <div className="flex flex-col items-center p-3 flex-1">
                      <div className="text-2xl font-bold">{steps.toLocaleString()}</div>
                      <div className="text-xs text-muted-foreground">steps</div>
                    </div>
                    
                    <div className="flex flex-col items-center p-3 flex-1">
                      <div className="text-2xl font-bold">{distance.toFixed(1)}</div>
                      <div className="text-xs text-muted-foreground">kilometers</div>
                    </div>
                    
                    <div className="flex flex-col items-center p-3 flex-1">
                      <div className="text-2xl font-bold">{calories.toLocaleString()}</div>
                      <div className="text-xs text-muted-foreground">calories</div>
                    </div>
                  </div>
                </TabsContent>
              </Tabs>
            </div>
          </div>
          
          {/* Next milestone */}
          {nextMilestone && (
            <div className="space-y-2">
              <div className="flex justify-between items-center">
                <h3 className="text-sm font-medium">Next Reward</h3>
                <Badge variant="outline">
                  {stepsToNext?.toLocaleString() || 0} steps to go
                </Badge>
              </div>
              
              <div className="bg-muted p-4 rounded-lg">
                <div className="flex items-center mb-2">
                  <Trophy className="h-5 w-5 text-amber-500 mr-2" />
                  <span className="font-medium">{nextMilestone.title}</span>
                </div>
                
                <div className="mb-3 text-sm text-muted-foreground">
                  {nextMilestone.description}
                </div>
                
                <div className="relative h-2 w-full bg-background rounded-full overflow-hidden">
                  <motion.div 
                    className="absolute h-full bg-amber-500"
                    style={{ width: `${getPercentageToNextMilestone()}%` }}
                    initial={{ width: 0 }}
                    animate={{ width: `${getPercentageToNextMilestone()}%` }}
                    transition={{ duration: 1, ease: "easeOut" }}
                  />
                </div>
                
                <div className="flex justify-between text-xs text-muted-foreground mt-1">
                  <span>0</span>
                  <span>{nextMilestone?.steps_required.toLocaleString()} steps</span>
                </div>
              </div>
            </div>
          )}
          
          {/* Earned rewards */}
          {rewards.length > 0 && (
            <div className="space-y-3">
              <h3 className="text-sm font-medium">Your Rewards</h3>
              
              <AnimatePresence>
                {rewards.map(reward => (
                  <motion.div
                    key={reward.id}
                    initial={{ opacity: 0, y: 20 }}
                    animate={{ opacity: 1, y: 0 }}
                    exit={{ opacity: 0, height: 0 }}
                    className="rounded-lg border bg-card overflow-hidden"
                  >
                    <div 
                      className="p-4 cursor-pointer"
                      onClick={() => setExpandedReward(expandedReward === reward.id ? null : reward.id)}
                    >
                      <div className="flex justify-between items-center">
                        <div className="flex items-center">
                          {reward.type === 'discount' ? (
                            <Badge className="bg-amber-100 text-amber-800 mr-2 dark:bg-amber-900 dark:text-amber-300">
                              {reward?.value}% OFF
                            </Badge>
                          ) : reward.type === 'badge' ? (
                            <Award className="h-5 w-5 text-purple-500 mr-2" />
                          ) : (
                            <Gift className="h-5 w-5 text-rose-500 mr-2" />
                          )}
                          <div>
                            <div className="font-medium">{reward.title}</div>
                            <div className="text-xs text-muted-foreground">
                              {reward.claimed ? (
                                <span className="flex items-center">
                                  <CheckCircle2 className="h-3 w-3 text-green-500 mr-1" />
                                  Claimed {reward.claimed_at && format(new Date(reward.claimed_at), 'MMM d, yyyy')}
                                </span>
                              ) : (
                                <span className="flex items-center">
                                  <Trophy className="h-3 w-3 text-amber-500 mr-1" />
                                  Earned for {reward?.steps_required.toLocaleString()} steps
                                </span>
                              )}
                            </div>
                          </div>
                        </div>
                        <div>
                          {expandedReward === reward.id ? (
                            <ChevronUp className="h-5 w-5 text-muted-foreground" />
                          ) : (
                            <ChevronDown className="h-5 w-5 text-muted-foreground" />
                          )}
                        </div>
                      </div>
                    </div>
                    
                    {expandedReward === reward.id && (
                      <motion.div
                        initial={{ height: 0, opacity: 0 }}
                        animate={{ height: 'auto', opacity: 1 }}
                        exit={{ height: 0, opacity: 0 }}
                        className="px-4 pb-4"
                      >
                        <div className="pt-2 border-t">
                          <p className="text-sm mb-3">{reward.description}</p>
                          
                          <div className="flex items-center mb-2">
                            <Calendar className="h-4 w-4 text-muted-foreground mr-2" />
                            <span className="text-xs text-muted-foreground">
                              {reward?.expiry_date ? 
                                `Valid until ${format(new Date(reward?.expiry_date), 'MMMM d, yyyy')}` : 
                                'No expiration date'}
                            </span>
                          </div>
                          
                          {reward.sponsor && (
                            <div className="flex items-center mb-3">
                              {reward.sponsor_logo ? (
                                <Avatar className="h-5 w-5 mr-2">
                                  <AvatarImage src={reward.sponsor_logo} alt={reward.sponsor} />
                                  <AvatarFallback>{reward.sponsor.charAt(0)}</AvatarFallback>
                                </Avatar>
                              ) : (
                                <ShoppingBag className="h-4 w-4 text-muted-foreground mr-2" />
                              )}
                              <span className="text-xs text-muted-foreground">Sponsored by {reward.sponsor}</span>
                            </div>
                          )}
                          
                          {!reward.claimed ? (
                            <Button 
                              className="w-full" 
                              onClick={() => handleClaimReward(reward)}
                            >
                              Claim Reward
                            </Button>
                          ) : reward.reward_link ? (
                            <Button 
                              className="w-full flex items-center" 
                              variant="outline"
                              onClick={() => window.open(reward.reward_link, '_blank')}
                            >
                              Use Reward
                              <ExternalLink className="h-4 w-4 ml-2" />
                            </Button>
                          ) : reward?.reward_code ? (
                            <div className="mt-2 p-2 bg-muted rounded-md text-center">
                              <div className="text-xs text-muted-foreground mb-1">Reward Code</div>
                              <div className="font-mono font-medium">{reward?.reward_code}</div>
                            </div>
                          ) : null}
                        </div>
                      </motion.div>
                    )}
                  </motion.div>
                ))}
              </AnimatePresence>
            </div>
          )}
          
          {/* Available rewards */}
          {!compact && availableRewards.length > 0 && rewards.length < availableRewards.length && (
            <div className="space-y-3">
              <h3 className="text-sm font-medium">Available Rewards</h3>
              
              <div className="space-y-2">
                {availableRewards
                  .filter(r => !rewards.some(earned => earned.id === r.id))
                  .slice(0, 3)
                  .map((reward) => (
                    <div key={reward.id} className="rounded-lg border bg-card p-4">
                      <div className="flex items-start justify-between">
                        <div>
                          <div className="font-medium">{reward.title}</div>
                          <div className="text-sm text-muted-foreground">{reward.description}</div>
                          <div className="text-xs text-muted-foreground mt-1">
                            <Footprints className="h-3 w-3 inline mr-1" />
                            {reward?.steps_required.toLocaleString()} steps required
                          </div>
                        </div>
                        {reward.type === 'discount' && (
                          <Badge className="bg-amber-100 text-amber-800 dark:bg-amber-900 dark:text-amber-300">
                            {reward?.value}% OFF
                          </Badge>
                        )}
                      </div>
                    </div>
                  ))}
              </div>
              
              {availableRewards.filter(r => !rewards.some(earned => earned.id === r.id)).length > 3 && (
                <Button 
                  variant="outline" 
                  className="w-full"
                  onClick={() => {/* View all available rewards */}}
                >
                  View All Available Rewards
                  <ChevronRight className="h-4 w-4 ml-2" />
                </Button>
              )}
            </div>
          )}
          
          {/* Active streak */}
          {!compact && stepData.length > 0 && (
            <div className="rounded-lg border bg-card p-4">
              <div className="flex items-center justify-between mb-3">
                <h3 className="text-sm font-medium">Activity Streak</h3>
                <Badge variant="outline" className="flex items-center">
                  <Flame className="h-3 w-3 text-orange-500 mr-1" />
                  7 days
                </Badge>
              </div>
              
              <div className="flex justify-between">
                {Array.from({ length: 7 }).map((_, index) => {
                  const date = subDays(new Date(), 6 - index);
                  const dayData = stepData.find(d => d.date === format(date, 'yyyy-MM-dd'));
                  const hasSteps = dayData && dayData?.step_count > 1000;
                  
                  return (
                    <div key={index} className="flex flex-col items-center">
                      <div 
                        className={`w-8 h-8 rounded-full flex items-center justify-center mb-1 ${
                          hasSteps 
                            ? 'bg-green-100 text-green-800 dark:bg-green-900 dark:text-green-300' 
                            : 'bg-gray-100 text-gray-400 dark:bg-gray-800'
                        }`}
                      >
                        {hasSteps ? (
                          <CheckCircle2 className="h-4 w-4" />
                        ) : (
                          <CircleSlash className="h-4 w-4" />
                        )}
                      </div>
                      <div className="text-xs text-muted-foreground">
                        {format(date, 'E')}
                      </div>
                    </div>
                  );
                })}
              </div>
            </div>
          )}
        </CardContent>
        
        {!compact && (
          <CardFooter className="flex justify-between">
            <div className="text-sm text-muted-foreground">
              {connectedApps.length > 0 && connectedApps[0].last_sync && (
                <span className="flex items-center">
                  <Clock className="h-4 w-4 mr-1" />
                  Last synced {formatDistanceToNow(new Date(connectedApps[0].last_sync), { addSuffix: true })}
                </span>
              )}
            </div>
            
            <Button 
              variant="outline" 
              size="sm"
              onClick={() => {
                // Share functionality would go here
                toast.success('Sharing your step progress');
              }}
            >
              <Share2 className="h-4 w-4 mr-2" />
              Share Progress
            </Button>
          </CardFooter>
        )}
      </Card>
      {/* Connect Health App Dialog */}
      <Dialog open={showConnectDialog} onOpenChange={setShowConnectDialog}>
        <DialogContent className="sm:max-w-md">
          <DialogHeader>
            <DialogTitle>Connect Health App</DialogTitle>
            <DialogDescription>
              Link your fitness app to track steps and earn rewards
            </DialogDescription>
          </DialogHeader>
          
          <div className="space-y-4 py-4">
            <div className="space-y-2">
              <h3 className="text-sm font-medium">Available Apps</h3>
              
              <div className="space-y-2">
                {['Apple Health', 'Google Fit', 'Fitbit', 'Garmin'].map(app => {
                  const isConnected = connectedApps.some(a => a.app_name === app);
                  
                  return (
                    <div key={app} className="flex items-center justify-between p-3 border rounded-lg">
                      <div className="flex items-center">
                        <Avatar className="h-8 w-8 mr-3">
                          <AvatarFallback>{app.charAt(0)}</AvatarFallback>
                        </Avatar>
                        <div>
                          <div className="font-medium">{app}</div>
                          <div className="text-xs text-muted-foreground">
                            {isConnected ? 'Connected' : 'Not connected'}
                          </div>
                        </div>
                      </div>
                      
                      {isConnected ? (
                        <Button 
                          variant="outline" 
                          size="sm"
                          onClick={() => handleDisconnectApp(app)}
                        >
                          Disconnect
                        </Button>
                      ) : (
                        <Button 
                          size="sm"
                          onClick={() => handleConnectApp(app)}
                        >
                          Connect
                        </Button>
                      )}
                    </div>
                  );
                })}
              </div>
            </div>
            
            <Alert variant="default" className="bg-blue-50 dark:bg-blue-950 border-blue-200 dark:border-blue-900">
              <Info className="h-4 w-4 text-blue-600 dark:text-blue-400" />
              <AlertTitle>Privacy Information</AlertTitle>
              <AlertDescription>
                We only access your step count and distance data. Your information is kept private and secure.
              </AlertDescription>
            </Alert>
          </div>
          
          <DialogFooter>
            <Button variant="outline" onClick={() => setShowConnectDialog(false)}>
              Close
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>
      {/* Reward Detail Dialog */}
      {selectedReward && (
        <Dialog open={!!selectedReward} onOpenChange={() => setSelectedReward(null)}>
          <DialogContent className="sm:max-w-md">
            <DialogHeader>
              <DialogTitle>{selectedReward.title}</DialogTitle>
              <DialogDescription>
                {selectedReward.description}
              </DialogDescription>
            </DialogHeader>
            
            <div className="space-y-4 py-4">
              <div className="bg-muted p-4 rounded-lg">
                {selectedReward.type === 'discount' ? (
                  <div className="text-center">
                    <div className="text-3xl font-bold text-amber-600 dark:text-amber-400">
                      {selectedReward?.value}% OFF
                    </div>
                    <div className="text-sm text-muted-foreground mt-1">
                      at {selectedReward.sponsor}
                    </div>
                  </div>
                ) : selectedReward.type === 'badge' ? (
                  <div className="text-center">
                    <Award className="h-16 w-16 text-purple-500 mx-auto" />
                    <div className="text-sm text-muted-foreground mt-2">Achievement Unlocked</div>
                  </div>
                ) : (
                  <div className="text-center">
                    <Gift className="h-16 w-16 text-rose-500 mx-auto" />
                    <div className="text-sm text-muted-foreground mt-2">Free Item</div>
                  </div>
                )}
              </div>
              
              {selectedReward.terms_conditions && (
                <div>
                  <h4 className="text-sm font-medium mb-1">Terms & Conditions</h4>
                  <p className="text-xs text-muted-foreground">{selectedReward.terms_conditions}</p>
                </div>
              )}
              
              {selectedReward.expiry_date && (
                <div className="flex items-center">
                  <Calendar className="h-4 w-4 text-muted-foreground mr-2" />
                  <span className="text-sm text-muted-foreground">
                    Expires {format(new Date(selectedReward.expiry_date), 'MMMM d, yyyy')}
                  </span>
                </div>
              )}
            </div>
            
            <DialogFooter>
              <Button variant="outline" onClick={() => setSelectedReward(null)}>
                Close
              </Button>
              {!selectedReward.claimed && (
                <Button onClick={() => handleClaimReward(selectedReward)}>
                  Claim Reward
                </Button>
              )}
            </DialogFooter>
          </DialogContent>
        </Dialog>
      )}
    </>
  );
}; 