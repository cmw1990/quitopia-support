import React, { useState, useEffect } from 'react';
import { Card, CardContent, CardDescription, CardFooter, CardHeader, CardTitle } from '../ui/card';
import { Button } from '../ui/button';
import { Badge } from '../ui/badge';
import { Progress } from '../ui/progress';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '../ui/tabs';
import { 
  Footprints, 
  Gift, 
  Trophy, 
  ExternalLink, 
  CheckCircle2, 
  Info, 
  AlertCircle, 
  Smartphone,
  RefreshCw,
  Share2
} from 'lucide-react';
import { 
  Dialog, 
  DialogContent, 
  DialogDescription, 
  DialogFooter, 
  DialogHeader, 
  DialogTitle, 
  DialogTrigger 
} from '../ui/dialog';
import { Alert, AlertDescription, AlertTitle } from '../ui/alert';
import { toast } from 'sonner';
import { motion, AnimatePresence } from 'framer-motion';
import { useAuth } from '@/components/AuthProvider';
import { hapticFeedback } from '@/utils/hapticFeedback';
import { Confetti } from '@/components/ui/confetti';
import { authenticatedRestCall } from '@/lib/supabase/rest-client';

// Define interfaces for the component
interface StepIncentive {
  id: string;
  target: number;
  reward: string;
  description: string;
  unlocked: boolean;
  discount_percentage: number;
  valid_days: number;
}

interface StepsResponse {
  data?: StepIncentive[];
  error?: string;
}

// Interface for health services
interface HealthService {
  isAvailable(): Promise<boolean>;
  requestPermissions(): Promise<boolean>;
  getStepCount(startDate: Date, endDate: Date): Promise<number>;
}

// Define a proper interface for Capacitor plugins
interface CapacitorPlugins {
  Health?: {
    isAvailable: () => Promise<{value: boolean}>;
    requestPermissions: () => Promise<{granted: boolean}>;
    queryHKStepCount: (options: {startDate: string, endDate: string}) => Promise<{value: number}>;
  };
  HealthKit?: {
    isAvailable: () => Promise<{available: boolean}>;
    requestPermissions: () => Promise<{granted: boolean}>;
    queryHKQuantityTypeSum: (options: {sampleType: string, startDate: string, endDate: string}) => Promise<{value: number}>;
  };
  Haptics?: {
    impact: (options: { style: 'light' | 'medium' | 'heavy' }) => void;
    notification: (options: { type: 'success' | 'warning' | 'error' }) => void;
    selectionStart: () => void;
    selectionChanged: () => void;
    selectionEnd: () => void;
    vibrate: (options: { duration: number }) => void;
  };
}

// Define a proper interface for Capacitor
interface CapacitorInterface {
  Plugins?: CapacitorPlugins;
  getPlatform?: () => string;
}

// Extend Window interface to include Capacitor
declare global {
  interface Window {
    Capacitor?: CapacitorInterface;
    healthConnect?: any;
  }
}

// Health Connect API (Android)
class HealthConnectService implements HealthService {
  async isAvailable(): Promise<boolean> {
    if (typeof window !== 'undefined' && 'healthConnect' in window) {
      return true;
    }
    
    // Check if we're on Android with Capacitor
    if (typeof window !== 'undefined' && 
        'Capacitor' in window && 
        typeof window.Capacitor === 'object' && 
        window.Capacitor?.getPlatform && 
        window.Capacitor.getPlatform() === 'android') {
      try {
        const healthPlugin = window.Capacitor?.Plugins?.Health;
        if (healthPlugin) {
          const result = await healthPlugin.isAvailable();
          return result.value;
        }
      } catch (e) {
        console.error('Error checking Health Connect availability:', e);
      }
    }
    
    return false;
  }
  
  async requestPermissions(): Promise<boolean> {
    if (typeof window !== 'undefined' && 'healthConnect' in window) {
      // Implementation for Web API (not typically available)
      return true;
    }
    
    try {
      const healthPlugin = window.Capacitor?.Plugins?.Health;
      if (healthPlugin) {
        const result = await healthPlugin.requestPermissions();
        return result.granted;
      }
    } catch (e) {
      console.error('Error requesting Health Connect permissions:', e);
    }
    
    return false;
  }
  
  async getStepCount(startDate: Date, endDate: Date): Promise<number> {
    try {
      const healthPlugin = window.Capacitor?.Plugins?.Health;
      if (healthPlugin) {
        const result = await healthPlugin.queryHKStepCount({
          startDate: startDate.toISOString(),
          endDate: endDate.toISOString()
        });
        return result.value;
      }
    } catch (e) {
      console.error('Error getting step count from Health Connect:', e);
    }
    return 0;
  }
}

// HealthKit API (iOS)
class AppleHealthService implements HealthService {
  async isAvailable(): Promise<boolean> {
    if (typeof window !== 'undefined' && 
        'Capacitor' in window && 
        typeof window.Capacitor === 'object' && 
        window.Capacitor?.getPlatform && 
        window.Capacitor.getPlatform() === 'ios') {
      try {
        const healthPlugin = window.Capacitor?.Plugins?.HealthKit;
        if (healthPlugin) {
          const result = await healthPlugin.isAvailable();
          return result.available;
        }
      } catch (e) {
        console.error('Error checking HealthKit availability:', e);
      }
    }
    return false;
  }
  
  async requestPermissions(): Promise<boolean> {
    try {
      const healthPlugin = window.Capacitor?.Plugins?.HealthKit;
      if (healthPlugin) {
        const result = await healthPlugin.requestPermissions();
        return result.granted;
      }
    } catch (e) {
      console.error('Error requesting HealthKit permissions:', e);
    }
    return false;
  }
  
  async getStepCount(startDate: Date, endDate: Date): Promise<number> {
    try {
      const healthPlugin = window.Capacitor?.Plugins?.HealthKit;
      if (healthPlugin) {
        const result = await healthPlugin.queryHKQuantityTypeSum({
          sampleType: 'steps',
          startDate: startDate.toISOString(),
          endDate: endDate.toISOString()
        });
        return result.value;
      }
    } catch (e) {
      console.error('Error getting step count from HealthKit:', e);
    }
    return 0;
  }
}

// Get appropriate health service based on platform
const getHealthService = async (): Promise<HealthService | null> => {
  const appleHealthService = new AppleHealthService();
  if (await appleHealthService.isAvailable()) {
    return appleHealthService;
  }
  
  const healthConnectService = new HealthConnectService();
  if (await healthConnectService.isAvailable()) {
    return healthConnectService;
  }
  
  return null;
};

// Define interfaces for our response data
interface DiscountCode {
  id: string;
  code: string;
  discount_percentage: number;
  valid_until: string;
  is_used: boolean;
  product_id?: string;
  created_at: string;
}

interface NRTProductPreview {
  id: string;
  name: string;
  description: string;
  image_url: string;
  price: number;
  rating: number;
  review_count: number;
  created_at: string;
}

// StepIncentives component 
export const StepIncentives: React.FC = () => {
  const { user } = useAuth();
  const [todaySteps, setTodaySteps] = useState<number>(0);
  const [incentives, setIncentives] = useState<StepIncentive[]>([]);
  const [discountCodes, setDiscountCodes] = useState<DiscountCode[]>([]);
  const [eligibleProducts, setEligibleProducts] = useState<NRTProductPreview[]>([]);
  const [syncingSteps, setSyncingSteps] = useState<boolean>(false);
  const [showConfetti, setShowConfetti] = useState<boolean>(false);
  
  // Group discount codes by discount percentage for easier display
  const discountCodesByPercentage = discountCodes.reduce((acc, code) => {
    const discountKey = code.discount_percentage;
    if (!acc[discountKey]) {
      acc[discountKey] = [];
    }
    acc[discountKey].push(code);
    return acc;
  }, {} as Record<number, DiscountCode[]>);
  
  // Fetch incentives
  const fetchIncentives = async (): Promise<{data: StepIncentive[] | null, error: string | null}> => {
    try {
      if (!user?.id) {
        return { data: null, error: 'User not authenticated' };
      }
      
      const response = await authenticatedRestCall<StepIncentive[]>(
        '/rest/v1/step_incentives',
        {
          method: 'GET',
          headers: {
            'Prefer': 'return=representation'
          }
        }
      );
      
      if (response.error) {
        return { data: null, error: String(response.error) };
      }
      
      // If we got data back, return it; otherwise, return an empty array
      return { 
        data: response.data || [], 
        error: null 
      };
    } catch (error) {
      console.error('Error fetching incentives:', error);
      return { 
        data: null, 
        error: error instanceof Error ? error.message : 'An unexpected error occurred' 
      };
    }
  };
  
  // Fetch discount codes
  const fetchDiscountCodes = async (): Promise<{data: DiscountCode[] | null, error: string | null}> => {
    try {
      if (!user?.id) {
        return { data: null, error: 'User not authenticated' };
      }
      
      const response = await authenticatedRestCall<DiscountCode[]>(
        '/rest/v1/user_discount_codes',
        {
          method: 'GET',
          headers: {
            'Prefer': 'return=representation'
          }
        }
      );
      
      if (response.error) {
        return { data: null, error: String(response.error) };
      }
      
      // If we got data back, return it; otherwise, return an empty array
      return { 
        data: response.data || [], 
        error: null 
      };
    } catch (error) {
      console.error('Error fetching discount codes:', error);
      return { 
        data: null, 
        error: error instanceof Error ? error.message : 'An unexpected error occurred' 
      };
    }
  };
  
  // Fetch NRT products
  const fetchNRTProducts = async (): Promise<{data: NRTProductPreview[] | null, error: string | null}> => {
    try {
      const response = await authenticatedRestCall<NRTProductPreview[]>(
        '/rest/v1/nrt_products',
        {
          method: 'GET',
          headers: {
            'Prefer': 'return=representation'
          }
        }
      );
      
      if (response.error) {
        return { data: null, error: String(response.error) };
      }
      
      // If we got data back, return it; otherwise, return an empty array
      return { 
        data: response.data || [], 
        error: null 
      };
    } catch (error) {
      console.error('Error fetching NRT products:', error);
      return { 
        data: null, 
        error: error instanceof Error ? error.message : 'An unexpected error occurred' 
      };
    }
  };
  
  // Sync steps with health device
  const syncStepsWithHealthDevice = async () => {
    setSyncingSteps(true);
    
    try {
      // Check if health service is available
      const healthService = await getHealthService();
      if (!healthService) {
        toast.error("Health service not available", {
          description: "We couldn't connect to your health tracking device."
        });
        setSyncingSteps(false);
        return;
      }
      
      // Request permissions
      const hasPermission = await healthService.requestPermissions();
      if (!hasPermission) {
        toast.error("Permission denied", {
          description: "We need permission to access your step data."
        });
        setSyncingSteps(false);
        return;
      }
      
      // Get steps for today
      const today = new Date();
      // Create start and end of day for proper step counting
      const startOfDay = new Date(today);
      startOfDay.setHours(0, 0, 0, 0);
      const endOfDay = new Date(today);
      endOfDay.setHours(23, 59, 59, 999);
      
      // Get steps from health device
      const steps = await healthService.getStepCount(startOfDay, endOfDay);
        
        // Update steps in database
      const { error } = await updateUserSteps(steps);
      
      if (error) {
        toast.error("Error updating steps", {
          description: error
        });
        setSyncingSteps(false);
        return;
      }
      
      // Update local state with fetched steps
      setTodaySteps(steps);
      
      // Update incentives
      const incentivesResult = await fetchIncentives();
      
      if (incentivesResult.error) {
        toast.error("Error fetching incentives", {
          description: incentivesResult.error
        });
      } else if (incentivesResult.data && incentivesResult.data.length > 0) {
        setIncentives(incentivesResult.data);
        
        // Check for newly unlocked incentives
        const previouslyUnlocked = incentives.filter(i => i.unlocked).map(i => i.id);
        const newlyUnlocked = incentivesResult.data.filter(
          incentive => incentive.unlocked && !previouslyUnlocked.includes(incentive.id)
        );
        
        if (newlyUnlocked.length > 0) {
          setShowConfetti(true);
          hapticFeedback.medium();
          
          // Show toast for each newly unlocked incentive
          newlyUnlocked.forEach((incentive) => {
            toast.success("Achievement Unlocked!", {
              description: `${incentive.description} - ${incentive.reward}`
            });
          });
          
          // Fetch discount codes
          const discountResult = await fetchDiscountCodes();
          if (discountResult.data) {
            setDiscountCodes(discountResult.data);
          }
          
          // Fetch NRT products
          const productsResult = await fetchNRTProducts();
          if (productsResult.data) {
            setEligibleProducts(productsResult.data);
          }
          
          // Hide confetti after 5 seconds
          setTimeout(() => setShowConfetti(false), 5000);
        }
      }
      
      toast.success("Steps updated!", {
        description: `You've taken ${steps.toLocaleString()} steps today.`
      });
      
      hapticFeedback.light();
    } catch (error) {
      console.error("Error syncing with health device:", error);
      toast.error("Sync failed", {
        description: "Something went wrong while syncing your health data."
      });
    } finally {
      setSyncingSteps(false);
    }
  };
  
  // Create a function to update user steps
  const updateUserSteps = async (steps: number): Promise<{data: any, error: string | null}> => {
    try {
      if (!user?.id) {
        return { data: null, error: 'User not authenticated' };
      }
      
      const today = new Date().toISOString().split('T')[0];
      
      // Check if we have a record for today
      const existingStepsResponse = await authenticatedRestCall(
        `/rest/v1/user_steps?user_id=eq.${user.id}&date=eq.${today}`,
        {
          method: 'GET',
          headers: {
            'Prefer': 'return=representation'
          }
        }
      );
      
      if (existingStepsResponse.error) {
        return { data: null, error: String(existingStepsResponse.error) };
      }
      
      let result;
      
      if (!existingStepsResponse.data || (Array.isArray(existingStepsResponse.data) && existingStepsResponse.data.length === 0)) {
        // Create new record
        result = await authenticatedRestCall(
          '/rest/v1/user_steps',
        {
          method: 'POST',
            headers: {
              'Prefer': 'return=representation',
              'Content-Type': 'application/json'
            },
          body: JSON.stringify({
              user_id: user.id,
              date: today,
              step_count: steps,
              source: 'health_api'
            })
          }
        );
      } else {
        // Update existing record
        const existingRecord = Array.isArray(existingStepsResponse.data) 
          ? existingStepsResponse.data[0] 
          : existingStepsResponse.data;
          
        result = await authenticatedRestCall(
          `/rest/v1/user_steps?id=eq.${existingRecord.id}`,
          {
            method: 'PATCH',
            headers: {
              'Prefer': 'return=representation',
              'Content-Type': 'application/json'
            },
            body: JSON.stringify({
              step_count: steps,
              source: 'health_api',
              last_synced: new Date().toISOString()
            })
          }
        );
      }
      
      if (result.error) {
        return { data: null, error: String(result.error) };
      }
      
      return { data: result.data, error: null };
    } catch (error) {
      console.error('Error updating user steps:', error);
      return { data: null, error: error instanceof Error ? error.message : 'An unexpected error occurred' };
    }
  };
  
  // Initialize data on component mount
  useEffect(() => {
    const initializeData = async () => {
      try {
        if (!user?.id) return;
        
        // Check if health service is available
        const healthService = await getHealthService();
        
        // Fetch today's steps if we have them stored
        const today = new Date().toISOString().split('T')[0];
        const stepsResponse = await authenticatedRestCall(
          `/rest/v1/user_steps?user_id=eq.${user.id}&date=eq.${today}`,
          {
            method: 'GET',
            headers: {
              'Prefer': 'return=representation'
            }
          }
        );
        
        if (!stepsResponse.error && stepsResponse.data && Array.isArray(stepsResponse.data) && stepsResponse.data.length > 0) {
          setTodaySteps(stepsResponse.data[0].step_count);
        } else if (healthService) {
          // If we have a health service but no stored steps, sync now
          await syncStepsWithHealthDevice();
        }
        
        // Fetch incentives
        const incentivesResult = await fetchIncentives();
        if (!incentivesResult.error && incentivesResult.data) {
          setIncentives(incentivesResult.data);
        } else if (!incentivesResult.error && (!incentivesResult.data || incentivesResult.data.length === 0)) {
          // If no incentives found, create default ones
          await createDefaultIncentives();
          const newIncentives = await fetchIncentives();
          if (newIncentives.data) {
            setIncentives(newIncentives.data);
          }
        }
        
        // Fetch discount codes
        const discountResult = await fetchDiscountCodes();
        if (!discountResult.error && discountResult.data) {
          setDiscountCodes(discountResult.data);
        }
        
        // Fetch NRT products
        const productsResult = await fetchNRTProducts();
        if (!productsResult.error && productsResult.data) {
          setEligibleProducts(productsResult.data);
        }
      } catch (error) {
        console.error('Error initializing step incentives:', error);
        toast.error("Failed to initialize", {
          description: "There was an error loading your step incentives."
        });
      }
    };
    
    initializeData();
  }, [user]);
  
  // Create default incentives if user doesn't have any
  const createDefaultIncentives = async () => {
    if (!user?.id) return;
    
    const defaultTiers = [
      { steps: 5000, discount: 5 },
      { steps: 7500, discount: 10 },
      { steps: 10000, discount: 15 },
      { steps: 12500, discount: 20 },
      { steps: 15000, discount: 25 }
    ];
    
    try {
      // Create incentives for each tier
      await authenticatedRestCall(
        '/rest/v1/step_incentives',
        {
          method: 'POST',
          headers: {
            'Prefer': 'return=representation',
            'Content-Type': 'application/json'
          },
          body: JSON.stringify(defaultTiers.map(tier => ({
            user_id: user.id,
            target: tier.steps,
            reward: `${tier.discount}% off any NRT product`,
            description: `${tier.discount}% off any NRT product for reaching ${tier.steps.toLocaleString()} steps`,
            unlocked: false,
            discount_percentage: tier.discount,
            valid_days: 7 // Default valid for 7 days
          })))
        }
      );
    } catch (error) {
      console.error('Error creating default incentives:', error);
    }
  };
  
  return (
    <Card className="w-full relative overflow-hidden">
      {showConfetti && <Confetti />}
      
      <CardHeader>
        <CardTitle className="flex items-center gap-2">
          <Footprints className="h-5 w-5 text-green-500" />
          Step Rewards Program
        </CardTitle>
        <CardDescription>
          Earn discounts on smokeless nicotine products by staying active
        </CardDescription>
      </CardHeader>
      
      <CardContent className="space-y-6">
        {/* Step Summary */}
        <div className="bg-muted/30 rounded-lg p-4">
          <div className="flex flex-col md:flex-row justify-between items-center mb-4 gap-4">
            <div className="text-center md:text-left">
              <h3 className="text-3xl font-bold">{todaySteps.toLocaleString()}</h3>
              <p className="text-sm text-muted-foreground">Today's Steps</p>
            </div>
            
            <div className="flex flex-wrap justify-center md:justify-end gap-2">
              <Button 
                variant="outline" 
                size="sm" 
                className="flex items-center gap-1 relative overflow-hidden"
                onClick={syncStepsWithHealthDevice}
                disabled={syncingSteps}
              >
                {syncingSteps ? (
                  <>
                  <RefreshCw className="h-4 w-4 animate-spin" />
                    <span className="relative z-10">Syncing...</span>
                  </>
                ) : (
                  <>
                  <Smartphone className="h-4 w-4" />
                    <span>Sync with Health App</span>
                  </>
                )}
              </Button>
            </div>
          </div>
          
          <div className="grid grid-cols-2 md:grid-cols-4 gap-2 mb-4">
            <motion.div 
              className="bg-background/50 p-3 rounded text-center"
              whileHover={{ scale: 1.03 }}
              transition={{ type: "spring", stiffness: 400, damping: 10 }}
            >
              <p className="text-lg font-semibold">{todaySteps.toLocaleString()}</p>
              <p className="text-xs text-muted-foreground">Today's Steps</p>
            </motion.div>
          </div>
        </div>
        
        {/* Rewards Tabs */}
        <Tabs value="available" className="space-y-4">
          <TabsList className="grid grid-cols-2 mb-4">
            <TabsTrigger value="available">Available Rewards</TabsTrigger>
          </TabsList>
          
          <TabsContent value="available" className="space-y-4">
            {incentives.length === 0 ? (
              <div className="text-center py-6">
                <Trophy className="h-10 w-10 text-muted-foreground mx-auto mb-2" />
                <h3 className="text-lg font-medium mb-1">No Rewards Yet</h3>
                <p className="text-sm text-muted-foreground">
                  Start claiming rewards by reaching step milestones
                </p>
              </div>
            ) : (
              incentives.map(incentive => (
                  <motion.div
                    key={incentive.id}
                    initial={{ opacity: 0, y: 10 }}
                    animate={{ opacity: 1, y: 0 }}
                    transition={{ duration: 0.3 }}
                  >
                  <Card className={`border ${todaySteps >= incentive.target ? 'border-green-500' : ''}`}>
                      <CardHeader className="pb-2">
                        <div className="flex justify-between items-center">
                        <Badge variant={todaySteps >= incentive.target ? "default" : "outline"}>
                          {incentive.discount_percentage}% Off
                          </Badge>
                          <span className="text-sm font-medium">
                          {incentive.target.toLocaleString()} steps
                          </span>
                        </div>
                      </CardHeader>
                      <CardContent className="pb-3">
                        <p className="text-sm">{incentive.description}</p>
                        
                      {todaySteps < incentive.target && (
                          <div className="mt-2">
                            <Progress 
                            value={(todaySteps / incentive.target) * 100} 
                              className="h-1 mb-1" 
                            />
                            <p className="text-xs text-muted-foreground">
                            {(incentive.target - todaySteps).toLocaleString()} steps to go
                            </p>
                          </div>
                        )}
                      </CardContent>
                    </Card>
                  </motion.div>
                ))
            )}
          </TabsContent>
        </Tabs>
      </CardContent>
    </Card>
  );
}; 