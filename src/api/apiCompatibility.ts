import { Session, User } from '@supabase/supabase-js';
import { getMockMoodLogs, getMockEnergyLogs, getMockFocusLogs } from './mockLogs';
import { handleSupabaseError, ErrorSeverity } from '@/lib/supabase/global-error-handler';
import { ProgressEntry, UserProfile } from '@/types/dataTypes';
import { 
  SUPABASE_URL, 
  SUPABASE_ANON_KEY, 
  supabaseRestCall, 
  STORAGE_KEY,
  refreshSession
} from './supabase-client';
import { authenticatedRestCall } from '@/lib/supabase/rest-client';

// Re-export for backward compatibility
export { supabaseRestCall, SUPABASE_URL, SUPABASE_ANON_KEY, STORAGE_KEY };

// SSOT8001 compliant API fallback implementation
type FallbackStrategy = 'mock' | 'cached' | 'empty' | 'retry';

interface ApiFallbackOptions<T> {
  fallbackStrategy?: FallbackStrategy;
  mockData?: T;
  emptyValue?: T;
  retryCount?: number;
  retryDelay?: number;
  cacheKey?: string;
  cacheTTL?: number; // in milliseconds
  skipErrorLog?: boolean;
  skipRefreshToken?: boolean;
  expectedType?: 'array' | 'object';
}

// Create a cache for API responses
const apiCache = new Map<string, { data: any; timestamp: number }>();

/**
 * SSOT8001 compliant wrapper for API calls with automatic fallback handling
 * @param apiCall Function that makes the actual API request
 * @param options Options for fallback behavior
 * @returns API response or fallback value
 */
export async function withApiFallback<T>(
  apiCall: () => Promise<T>,
  options: ApiFallbackOptions<T> = {}
): Promise<T> {
  const {
    fallbackStrategy = 'empty',
    mockData,
    emptyValue = (options.expectedType === 'array' ? [] : {}) as T,
    retryCount = 2,
    retryDelay = 1000,
    cacheKey,
    cacheTTL = 5 * 60 * 1000, // 5 minutes default
    skipErrorLog = false,
    skipRefreshToken = false,
    expectedType
  } = options;

  // Check cache first if cacheKey is provided
  if (cacheKey && apiCache.has(cacheKey)) {
    const cachedData = apiCache.get(cacheKey);
    if (cachedData && Date.now() - cachedData.timestamp < cacheTTL) {
      return cachedData.data;
    }
  }

  let lastError: any = null;
  let attempts = 0;
  let sessionRefreshed = false;

  // Retry logic
  while (attempts <= retryCount) {
    try {
      const result = await apiCall();
      
      // Check if result is empty when we expect non-empty
      const isEmpty = 
        (Array.isArray(result) && result.length === 0) || 
        (typeof result === 'object' && result !== null && Object.keys(result).length === 0);
      
      // If result is empty and we're not on the last attempt, retry
      if (isEmpty && attempts < retryCount && fallbackStrategy !== 'empty') {
        attempts++;
        await new Promise(resolve => setTimeout(resolve, retryDelay * attempts));
        continue;
      }
      
      // Cache the result if cacheKey is provided and result is not empty
      if (cacheKey && !isEmpty) {
        apiCache.set(cacheKey, { data: result, timestamp: Date.now() });
      }
      
      return result;
    } catch (error) {
      lastError = error;
      
      // Enhanced error logging
      if (!skipErrorLog) {
        const errorMessage = error instanceof Error ? error.message : String(error);
        const errorDetails = {
          attempt: `${attempts + 1}/${retryCount + 1}`,
          message: errorMessage,
          status: (error as any)?.status || 'unknown',
          context: cacheKey || 'unknown context'
        };
        
        console.warn(`[API Fallback] API call failed:`, errorDetails);
        
        // Use the global error handler if available
        try {
          handleSupabaseError(error, ErrorSeverity.WARNING);
        } catch (e) {
          // If handleSupabaseError itself fails, just log to console
          console.warn('[API Fallback] Error handler failed:', e);
        }
      }
      
      // If token expired and this is the first attempt, try refreshing the token
      if (!sessionRefreshed && !skipRefreshToken && attempts === 0) {
        try {
          const session = await getCurrentSession();
          if (session) {
            try {
              // Call refreshSession without passing the session object
              const refreshedSession = await refreshSession();
              if (refreshedSession) {
                sessionRefreshed = true;
                // Don't increment attempts counter to give a fresh try with new token
                await new Promise(resolve => setTimeout(resolve, 500)); // Small delay before retry
                continue;
              }
            } catch (refreshError) {
              console.warn('[API Fallback] Token refresh failed:', refreshError);
            }
          }
        } catch (sessionError) {
          console.warn('[API Fallback] Session retrieval failed:', sessionError);
        }
      }
      
      attempts++;
      
      // If we have more attempts, wait before retrying
      if (attempts <= retryCount) {
        const delayTime = retryDelay * attempts;
        console.log(`[API Fallback] Retrying in ${delayTime}ms...`);
        await new Promise(resolve => setTimeout(resolve, delayTime));
      }
    }
  }

  // All attempts failed, use fallback strategy
  if (!skipErrorLog) {
    console.warn(`[API Fallback] All ${retryCount + 1} attempts failed. Using fallback strategy: ${fallbackStrategy}`);
  }
  
  switch (fallbackStrategy) {
    case 'mock':
      // Only use mock data in development mode
      if (import.meta.env.DEV && mockData !== undefined) {
        return mockData;
      }
      console.warn('[API Fallback] No mock data provided for mock strategy or not in dev mode, falling back to empty');
      return emptyValue;
    
    case 'cached':
      if (cacheKey && apiCache.has(cacheKey)) {
        const cachedData = apiCache.get(cacheKey)!.data;
        return cachedData;
      }
      console.warn('[API Fallback] No cached data available, falling back to empty');
      return emptyValue;
    
    case 'retry':
      throw lastError; // Let the caller handle the retry
    
    case 'empty':
    default:
      return emptyValue;
  }
}

// Only import types that don't conflict with local declarations

// Import required functions

// Define ShareAnalytics, Country, and Vendor interfaces to fix import issues
export interface ShareAnalytics {
  id?: string;
  user_id: string;
  share_date: string;
  platform: string;
  content_type: string;
  engagement_clicks: number;
  engagement_likes: number;
  engagement_shares: number;
  conversion_signups: number;
}

export interface Country {
  code: string;
  name: string;
}

export interface Vendor {
  id: string;
  name: string;
  website: string;
  description?: string;
  logo_url?: string;
  shipping_countries: string[];
  shipping_regions: string[];
  payment_methods: string[];
  average_rating?: number;
  total_reviews?: number;
}

// Type definitions to maintain compatibility
export interface NicotineConsumptionLog {
  id?: string;
  user_id: string;
  consumption_date: string;
  product_type: string;
  brand?: string;
  variant?: string;
  nicotine_strength?: number;
  quantity: number;
  unit: string;
  trigger?: string;
  location?: string;
  mood?: string;
  intensity?: number;
  notes?: string;
  created_at?: string;
  updated_at?: string;
}

export interface NicotineProduct {
  id: string;
  name: string;
  brand: string;
  category: string;
  subcategory?: string;
  nicotine_strength: number;
  nicotine_type?: string;
  description?: string;
  image_url?: string;
  ingredients?: string[];
  warnings?: string[];
  flavors?: string[];
  price_range?: [number, number];
  average_rating?: number;
  total_reviews?: number;
}

export interface HealthImprovement {
  id: string;
  title: string;
  description: string;
  timeline_hours: number;
  icon: string;
  achieved: boolean;
  user_id?: string;
  milestone_date?: string;
  milestone_type?: string;
  achievement_date?: string;
}

export interface UserProgressResponse {
  userProfile?: UserProfile;
  progressEntries: ProgressEntry[];
  smokeFreeStreak: number;
  totalSavings: number;
  healthScore: number;
}

export interface SocialShareResponse {
  success: boolean;
  shareUrl?: string;
  shareId?: string;
  message?: string;
  error?: string;
}

export interface CravingEntry {
  id?: string;
  user_id: string;
  date: string;
  time: string;
  intensity: number;
  trigger_category: string;
  trigger_details?: string;
  location?: string;
  activity?: string;
  succeeded: boolean;
  coping_strategy?: string;
  coping_effectiveness?: number;
  duration_minutes?: number;
  notes?: string;
  created_at?: string;
  updated_at?: string;
  timestamp?: string;
  trigger?: string;
  mood_before?: number | null;
}

export interface EnergyPlan {
  id?: string;
  user_id: string;
  plan_date: string;
  energy_activities: string[];
  energy_schedule: Record<string, string>;
  energy_goals: string[];
  custom_notes?: string;
  created_at?: string;
  updated_at?: string;
}

export interface MoodSupportPlan {
  id?: string;
  user_id: string;
  plan_date: string;
  mood_activities: string[];
  mood_coping_strategies: string[];
  mood_goals: string[];
  custom_notes?: string;
  created_at?: string;
  updated_at?: string;
}

export interface FatigueManagementPlan {
  id?: string;
  user_id: string;
  plan_date: string;
  fatigue_activities: string[];
  fatigue_rest_schedule: Record<string, string>;
  fatigue_goals: string[];
  custom_notes?: string;
  created_at?: string;
  updated_at?: string;
}

export interface ShareAnalyticsSummary {
  total_shares: number;
  total_clicks: number;
  total_likes: number;
  total_reshares: number;
  total_signups: number;
  shares_by_platform: { platform: string; count: number }[];
  most_popular_content: string;
  conversion_rate: number;
}

// Define the VendorAvailability interface needed for vendor functions
export interface VendorAvailability {
  vendor_id: string;
  vendor_name: string;
  in_stock: boolean;
  price: number;
  currency: string;
  url: string;
  shipping_countries: string[];
  shipping_regions: string[];
  delivery_estimate_days: [number, number];
  discount_code?: string;
  discount_percentage?: number;
}

export interface ProductVendorAvailability {
  id: string;
  product_id: string;
  vendor_id: string;
  vendor_name: string;
  price: number;
  currency: string;
  product_url: string;
  in_stock: boolean;
  countryAvailability: string[];
  delivery_time: string;
  shipping_cost?: number;
  discount_code?: string;
  discount_amount?: number;
}

// Direct REST API call to Supabase

// Auth functions
export const getCurrentSession = async (): Promise<Session | null> => {
  return withApiFallback(
    async () => {
      // Get the stored session from localStorage
      const storedSession = localStorage.getItem(STORAGE_KEY);
      if (!storedSession) return null;

      // Try to parse the stored session
      try {
        const parsedSession = JSON.parse(storedSession);
        const session = parsedSession.currentSession || parsedSession;

        // Check if the session is expired
        if (session.expires_at && typeof session.expires_at === 'number') {
          const now = Math.floor(Date.now() / 1000);
          if (now >= session.expires_at) {
            // Session is expired, try to refresh
            return await refreshSession();
          }
        }

        return session;
      } catch (e) {
        console.error('Error parsing session:', e);
        localStorage.removeItem(STORAGE_KEY);
        return null;
      }
    },
    {
      fallbackStrategy: 'empty',
      emptyValue: null,
      skipErrorLog: true,
      cacheKey: 'current_session',
      cacheTTL: 30000 // 30 seconds
    }
  );
};

export const getCurrentUser = async (): Promise<User | null> => {
  const session = await getCurrentSession();
  if (!session) return null;

  const response = await fetch(`${SUPABASE_URL}/auth/v1/user`, {
    headers: {
      'apikey': SUPABASE_ANON_KEY,
      'Authorization': `Bearer ${session.access_token}`,
    },
  });

  if (!response.ok) return null;
  
  const data = await response.json();
  return data;
};

export const onAuthStateChange = (callback: (event: string, session: Session | null) => void) => {
  const session = getCurrentSession();
  
  // Call initially with current session
  session.then(currentSession => {
    callback('INITIAL', currentSession);
  });

  // Setup storage listener for auth changes
  const storageListener = (event: StorageEvent) => {
    if (event.key === 'supabase.auth.token') {
      getCurrentSession().then(updatedSession => {
        callback(updatedSession ? 'SIGNED_IN' : 'SIGNED_OUT', updatedSession);
      });
    }
  };

  // Add the storage event listener
  window.addEventListener('storage', storageListener);

  // Return a function to unsubscribe
  return {
    unsubscribe: () => {
      window.removeEventListener('storage', storageListener);
    }
  };
};

export const signInWithEmail = async (email: string, password: string): Promise<{ session: Session }> => {
  try {
    const response = await fetch(`${SUPABASE_URL}/auth/v1/token?grant_type=password`, {
      method: 'POST',
      headers: {
        'apikey': SUPABASE_ANON_KEY,
        'Content-Type': 'application/json'
      },
      body: JSON.stringify({ email, password })
    });

    const data = await response.json();
    
    if (!response.ok) {
      throw new Error(data.error_description || data.message || `Sign in failed with status ${response.status}`);
    }

    if (!data.access_token) {
      throw new Error('Login failed: Invalid response from authentication server');
    }
    
    // Create a more standard session format
    const session: Session = {
      access_token: data.access_token,
      refresh_token: data.refresh_token,
      expires_in: data.expires_in,
      expires_at: Math.floor(Date.now() / 1000) + data.expires_in,
      token_type: 'bearer',
      user: data.user
    };
    
    // Store session in localStorage for persistence
    const storedSessionData = {
      currentSession: session
    };
    localStorage.setItem('supabase.auth.token', JSON.stringify(storedSessionData));
    
    // Trigger storage event for other tabs
    window.dispatchEvent(new StorageEvent('storage', {
      key: 'supabase.auth.token',
      newValue: JSON.stringify(storedSessionData)
    }));

    return { session };
  } catch (error) {
    throw error;
  }
};

export const signOut = async (session: Session): Promise<void> => {
  await fetch(`${SUPABASE_URL}/auth/v1/logout`, {
    method: 'POST',
    headers: {
      'apikey': SUPABASE_ANON_KEY,
      'Authorization': `Bearer ${session.access_token}`,
      'Content-Type': 'application/json'
    }
  });

  // Clear local session data
  localStorage.removeItem('supabase.auth.token');
  
  // Trigger storage event for other tabs
  window.dispatchEvent(new StorageEvent('storage', {
    key: 'supabase.auth.token',
    newValue: null
  }));
};

// API Functions
export const getUserProgress = async (
  userId: string,
  startDate: string,
  endDate: string,
  session: Session | null
): Promise<UserProgressResponse> => {
  try {
    const response = await authenticatedRestCall<any>(
      `/rest/v1/rpc/get_user_progress?user_id=${encodeURIComponent(userId)}&start_date=${encodeURIComponent(startDate)}&end_date=${encodeURIComponent(endDate)}`,
      {
        method: 'GET',
        headers: {
          'Content-Type': 'application/json'
        }
      },
      session
    );
    
    // Extract the user profile and progress entries from the response
    const responseData = response.data || {};
    const userProfile = responseData?.userProfile || undefined;
    const progressEntries = Array.isArray(responseData?.progressEntries) 
      ? responseData.progressEntries 
      : [];
    
    // Calculate smoke-free streak, total savings, and health score
    const smokeFreeStreak = calculateSmokeFreeStreak(progressEntries);
    const totalSavings = calculateTotalSavings(progressEntries);
    const healthScore = calculateHealthScore(progressEntries, userProfile);
    
    return {
      userProfile,
      progressEntries,
      smokeFreeStreak,
      totalSavings,
      healthScore
    };
  } catch (error) {
    console.error('Error getting user progress:', error);
    return { 
      userProfile: undefined, 
      progressEntries: [], 
      smokeFreeStreak: 0, 
      totalSavings: 0, 
      healthScore: 0 
    };
  }
};

export const getHealthImprovementsREST = async (
  userId: string,
  quitDate: string,
  session: Session | null
): Promise<HealthImprovement[]> => {
  try {
    // Build the endpoint URL with query parameters
    const endpoint = `/rest/v1/health_improvements?user_id=eq.${userId}`;
    
    // Make the API call using supabaseRestCall
    const response = await supabaseRestCall(endpoint, {}, session);
    
    // If we get a valid array response, return it
    if (Array.isArray(response)) {
      return response as HealthImprovement[];
    }
    
    // If no user-specific improvements found, return static list
    const staticImprovements = getStaticHealthImprovements();
    
    // If quit date is provided, calculate which improvements have been achieved
    if (quitDate) {
      const quitDateTime = new Date(quitDate).getTime();
      const currentTime = new Date().getTime();
      const hoursSinceQuit = Math.floor((currentTime - quitDateTime) / (1000 * 60 * 60));
      
      return staticImprovements.map(improvement => ({
        ...improvement,
        achieved: hoursSinceQuit >= improvement.timeline_hours,
        achievement_date: hoursSinceQuit >= improvement.timeline_hours
          ? new Date(quitDateTime + improvement.timeline_hours * 60 * 60 * 1000).toISOString()
          : undefined
      }));
    }
    
    return staticImprovements;
  } catch (error) {
    console.error('Error fetching health improvements:', error);
    return getStaticHealthImprovements();
  }
};

// Static fallback data for health improvements
function getStaticHealthImprovements(): HealthImprovement[] {
  return [
    {
      id: '1',
      title: 'Blood Oxygen Normalizes',
      description: 'Your blood oxygen levels have returned to normal.',
      timeline_hours: 8,
      icon: 'heart',
      achieved: false
    },
    {
      id: '2',
      title: 'Carbon Monoxide Levels Drop',
      description: 'Carbon monoxide levels in your blood drop by half.',
      timeline_hours: 24,
      icon: 'wind',
      achieved: false
    },
    {
      id: '3',
      title: 'Nicotine Eliminated',
      description: 'Nicotine is eliminated from your body.',
      timeline_hours: 72,
      icon: 'zap',
      achieved: false
    },
    {
      id: '4',
      title: 'Improved Sense of Taste',
      description: 'Your sense of taste begins to improve.',
      timeline_hours: 48,
      icon: 'coffee',
      achieved: false
    },
    {
      id: '5',
      title: 'Improved Smell',
      description: 'Your sense of smell starts to return to normal.',
      timeline_hours: 72,
      icon: 'wind',
      achieved: false
    },
    {
      id: '6',
      title: 'Breathing Easier',
      description: 'Breathing becomes easier as bronchial tubes relax.',
      timeline_hours: 72,
      icon: 'wind',
      achieved: false
    },
    {
      id: '7',
      title: 'Energy Increase',
      description: 'Blood circulation improves, giving you more energy.',
      timeline_hours: 336, // 2 weeks
      icon: 'zap',
      achieved: false
    },
    {
      id: '8',
      title: 'Lung Function Improves',
      description: 'Your lung function begins to improve.',
      timeline_hours: 720, // 30 days
      icon: 'activity',
      achieved: false
    },
    {
      id: '9',
      title: 'Reduced Heart Attack Risk',
      description: 'Your risk of heart attack begins to drop.',
      timeline_hours: 2160, // 90 days
      icon: 'heart',
      achieved: false
    },
    {
      id: '10',
      title: 'Lung Cilia Regrow',
      description: 'Your lungs start to regrow cilia (tiny hairs that move mucus).',
      timeline_hours: 4320, // 6 months
      icon: 'wind',
      achieved: false
    },
    {
      id: '11',
      title: 'Heart Disease Risk Halved',
      description: 'Your risk of coronary heart disease is now half that of a smoker.',
      timeline_hours: 8760, // 1 year
      icon: 'heart',
      achieved: false
    },
    {
      id: '12',
      title: 'Stroke Risk Reduced',
      description: 'Your risk of stroke is now reduced to that of a nonsmoker.',
      timeline_hours: 43800, // 5 years
      icon: 'activity',
      achieved: false
    }
  ];
}

export const addProgressEntry = async (
  entry: Omit<ProgressEntry, 'id' | 'created_at' | 'updated_at'>,
  session: Session | null
): Promise<ProgressEntry> => {
  // This is a mock implementation until the new API endpoints are fully implemented
  return {
    ...entry,
    id: 'mock-id-' + Date.now(),
    created_at: new Date().toISOString(),
    updated_at: new Date().toISOString()
  };
};

export const shareProgressToSocial = async (
  userId: string,
  progressId: string | 'latest',
  platform: string,
  message: string,
  session: Session | null
): Promise<SocialShareResponse> => {
  // This is a mock implementation until the new API endpoints are fully implemented
  return {
    success: true,
    shareUrl: 'https://missionfresh.com/share/mock-share-id',
    shareId: 'mock-share-id',
    message: `Successfully shared to ${platform}`
  };
};

export const getNicotineConsumptionLogsREST = async (
  userId: string,
  startDate: string,
  endDate: string,
  session: Session | null
): Promise<NicotineConsumptionLog[]> => {
  const endpoint = `/rest/v1/nicotine_consumption_logs?user_id=eq.${userId}&consumption_date=gte.${startDate}&consumption_date=lte.${endDate}&order=consumption_date.desc`;
  
  try {
    const response = await supabaseRestCall(endpoint, {}, session);
    return Array.isArray(response) ? response : [];
  } catch (error) {
    console.error('Error fetching nicotine consumption logs:', error);
    return [];
  }
};

export const addNicotineConsumptionLog = async (
  log: Omit<NicotineConsumptionLog, 'id' | 'created_at' | 'updated_at'>,
  session: Session | null
): Promise<NicotineConsumptionLog> => {
  // This is a mock implementation until the new API endpoints are fully implemented
  return {
    ...log,
    id: 'mock-id-' + Date.now(),
    created_at: new Date().toISOString(),
    updated_at: new Date().toISOString()
  };
};

export const getNicotineProducts = async (
  filters: Partial<{
    category: string;
    brand: string;
    nicotine_strength_min: number;
    nicotine_strength_max: number;
    flavors: string[];
    limit: number;
    offset: number;
  }>,
  session: Session | null
): Promise<NicotineProduct[]> => {
  try {
    let endpoint = `/rest/v1/nicotine_products?select=*`;
    
    // Add filters if provided
    if (filters.category) {
      endpoint += `&category=eq.${filters.category}`;
    }
    if (filters.brand) {
      endpoint += `&brand=eq.${filters.brand}`;
    }
    if (filters.nicotine_strength_min) {
      endpoint += `&nicotine_strength=gte.${filters.nicotine_strength_min}`;
    }
    if (filters.nicotine_strength_max) {
      endpoint += `&nicotine_strength=lte.${filters.nicotine_strength_max}`;
    }
    
    // Add limit and offset if provided
    if (filters.limit) {
      endpoint += `&limit=${filters.limit}`;
    }
    if (filters.offset) {
      endpoint += `&offset=${filters.offset}`;
    }
    
    const response = await supabaseRestCall(
      endpoint,
      {
        headers: {
          'Content-Type': 'application/json'
        }
      },
      session
    );
    
    // Handle response safely
    if (response && response.data && Array.isArray(response.data)) {
      return response.data;
    }
    
    if (Array.isArray(response)) {
      return response;
    }
    
    return [];
  } catch (error) {
    console.error('Error fetching nicotine products:', error);
    return [];
  }
};

export const getShareAnalytics = async (
  userId: string,
  startDate: string,
  endDate: string,
  session: Session | null
): Promise<ShareAnalytics[]> => {
  try {
    const endpoint = `/rest/v1/share_analytics?user_id=eq.${userId}&share_date=gte.${startDate}&share_date=lte.${endDate}&order=share_date.desc`;
    
    const result = await supabaseRestCall(
      endpoint,
      { headers: { 'Content-Type': 'application/json' } },
      session
    );
    
    if (Array.isArray(result)) {
      return result;
    }
    
    return [];
  } catch (error) {
    console.error('Error fetching share analytics:', error);
    return [];
  }
};

export const getShareAnalyticsSummary = async (
  userId: string,
  session: Session | null
): Promise<ShareAnalyticsSummary> => {
  try {
    const endpoint = `/rest/v1/share_analytics_summary?user_id=eq.${userId}`;
    
    const result = await supabaseRestCall(
      endpoint,
      { headers: { 'Content-Type': 'application/json' } },
      session
    );
    
    if (Array.isArray(result) && result.length > 0) {
      return result[0];
    }
    
    // Default summary if none found
    return {
      total_shares: 0,
      total_clicks: 0,
      total_likes: 0,
      total_reshares: 0,
      total_signups: 0,
      shares_by_platform: [],
      most_popular_content: '',
      conversion_rate: 0
    };
  } catch (error) {
    console.error('Error fetching share analytics summary:', error);
    return {
      total_shares: 0,
      total_clicks: 0,
      total_likes: 0,
      total_reshares: 0,
      total_signups: 0,
      shares_by_platform: [],
      most_popular_content: '',
      conversion_rate: 0
    };
  }
};

export const getCravingEntries = async (
  userId: string,
  startDate: string,
  endDate: string,
  session: Session | null
): Promise<CravingEntry[]> => {
  const endpoint = `/rest/v1/craving_logs?user_id=eq.${userId}&date=gte.${startDate}&date=lte.${endDate}&order=date.desc,time.desc`;
  
  try {
    const response = await supabaseRestCall(endpoint, {}, session);
    
    if (Array.isArray(response)) {
      return response as CravingEntry[];
    }
    
    if (response?.data && Array.isArray(response.data)) {
      return response.data as CravingEntry[];
    }
    
    return [];
  } catch (error) {
    console.error('Error fetching craving entries:', error);
    return [];
  }
};

export const saveEnergyPlan = async (
  plan: Omit<EnergyPlan, 'id' | 'created_at' | 'updated_at'>,
  session: Session | null
): Promise<EnergyPlan> => {
  // This is a mock implementation until the new API endpoints are fully implemented
  return {
    ...plan,
    id: 'mock-id-' + Date.now(),
    created_at: new Date().toISOString(),
    updated_at: new Date().toISOString()
  };
};

export const saveMoodSupportPlan = async (
  plan: Omit<MoodSupportPlan, 'id' | 'created_at' | 'updated_at'>,
  session: Session | null
): Promise<MoodSupportPlan> => {
  // This is a mock implementation until the new API endpoints are fully implemented
  return {
    ...plan,
    id: 'mock-id-' + Date.now(),
    created_at: new Date().toISOString(),
    updated_at: new Date().toISOString()
  };
};

export const saveFatigueManagementPlan = async (
  plan: Omit<FatigueManagementPlan, 'id' | 'created_at' | 'updated_at'>,
  session: Session | null
): Promise<FatigueManagementPlan> => {
  // This is a mock implementation until the new API endpoints are fully implemented
  return {
    ...plan,
    id: 'mock-id-' + Date.now(),
    created_at: new Date().toISOString(),
    updated_at: new Date().toISOString()
  };
};

export const syncHealthData = async (
  userId: string,
  healthData: {
    step_count?: number,
    sleep_hours?: number,
    stress_level?: number
  },
  session: Session | null
): Promise<{ success: boolean; message: string }> => {
  // This is a mock implementation until the new API endpoints are fully implemented
  return {
    success: true,
    message: 'Health data synchronized successfully'
  };
};

// Alias functions to support legacy code
export const addConsumptionLog = addNicotineConsumptionLog;
export const getConsumptionLogs = getNicotineConsumptionLogsREST;
export const getAllProducts = getNicotineProducts;

// Fix the type issues in the function
export const getProductById = async (
  productId: string,
  session: Session | null
): Promise<NicotineProduct> => {
  try {
    const response = await supabaseRestCall(
      `/rest/v1/mission4_nicotine_products?id=eq.${productId}&select=*`,
      {
        method: 'GET',
        headers: { 'Content-Type': 'application/json' }
      },
      session
    );
    
    if (Array.isArray(response) && response.length > 0) {
      return response[0] as NicotineProduct;
    }
    
    // Return a default product if not found
    return {
      id: productId,
      name: 'Product Not Found',
      brand: 'Unknown',
      category: 'Unknown',
      nicotine_strength: 0,
      description: 'This product could not be found in our database.'
    };
  } catch (error) {
    console.error('Error fetching product:', error);
    
    // Return a default product on error
    return {
      id: productId,
      name: 'Error Loading Product',
      brand: 'Unknown',
      category: 'Unknown',
      nicotine_strength: 0,
      description: 'There was an error loading this product.'
    };
  }
};

// Define interfaces for health-related logs
export interface MoodLog {
  id: string;
  user_id: string;
  timestamp: string;
  mood_score: number;
  triggers: string[];
  activities: string[];
  notes: string | null;
  related_to_cravings: boolean;
  created_at: string;
}

export interface EnergyLog {
  id: string;
  user_id: string;
  timestamp: string;
  energy_level: number;
  time_of_day: string;
  caffeine_consumed: boolean;
  caffeine_amount_mg: number | null;
  physical_activity: boolean;
  sleep_hours: number;
  notes: string | null;
  created_at: string;
}

export interface FocusLog {
  id: string;
  user_id: string;
  timestamp: string;
  focus_level: number;
  duration_minutes: number;
  interruptions: number;
  task_type: string;
  notes: string | null;
  environment: string;
  created_at: string;
}

/**
 * Get mood logs for a user
 */
export const getMoodLogsREST = async (userId: string, startDate: string, endDate: string) => {
  try {
    const response = await supabaseRestCall(`/rest/v1/mood_logs?user_id=eq.${userId}&date=gte.${startDate}&date=lte.${endDate}`);
    
    if (response.error) {
      return { error: response.error };
    }
    
    return { data: Array.isArray(response.data) ? response.data : [], error: null };
  } catch (error) {
    console.error("Error in getMoodLogsREST:", error);
    return { data: [], error: error instanceof Error ? error.message : String(error) };
  }
};

/**
 * Get energy logs for a user
 */
export const getEnergyLogsREST = async (userId: string, startDate: string, endDate: string) => {
  try {
    const response = await supabaseRestCall(`/rest/v1/energy_logs?user_id=eq.${userId}&date=gte.${startDate}&date=lte.${endDate}`);
    
    if (response.error) {
      return { error: response.error };
    }
    
    return { data: Array.isArray(response.data) ? response.data : [], error: null };
  } catch (error) {
    console.error("Error in getEnergyLogsREST:", error);
    return { data: [], error: error instanceof Error ? error.message : String(error) };
  }
};

/**
 * Get focus logs for a user
 */
export const getFocusLogsREST = async (userId: string, startDate: string, endDate: string) => {
  try {
    const response = await supabaseRestCall(`/rest/v1/focus_logs?user_id=eq.${userId}&date=gte.${startDate}&date=lte.${endDate}`);
    
    if (response.error) {
      return { error: response.error };
    }
    
    return { data: Array.isArray(response.data) ? response.data : [], error: null };
  } catch (error) {
    console.error("Error in getFocusLogsREST:", error);
    return { data: [], error: error instanceof Error ? error.message : String(error) };
  }
};

/**
 * Get sleep logs for a user
 */
export const getSleepLogsREST = async (userId: string, startDate: string, endDate: string) => {
  try {
    const response = await supabaseRestCall(`/rest/v1/sleep_logs?user_id=eq.${userId}&date=gte.${startDate}&date=lte.${endDate}`);
    
    if (response.error) {
      return { error: response.error };
    }
    
    return { data: Array.isArray(response.data) ? response.data : [], error: null };
  } catch (error) {
    console.error("Error in getSleepLogsREST:", error);
    return { data: [], error: error instanceof Error ? error.message : String(error) };
  }
};

// Add Step-related interfaces and functions 
export interface StepData {
  id: string;
  user_id: string;
  date: string;
  step_count: number;
  calories_burned: number;
  distance_km: number;
  source_app: string;
  created_at: string;
  updated_at: string;
}

export interface StepReward {
  id: string;
  steps_required: number;
  discount_percentage: number;
  reward_type: string;
  claimed: boolean;
  claimed_at?: string;
  valid_until?: string;
}

export interface ConnectedApp {
  app_name: string;
  connected_at: string;
  last_sync: string;
  status: 'active' | 'disconnected' | 'error';
}

export interface StepDataResponse {
  stepData: StepData[];
  connectedApps: ConnectedApp[];
}

/**
 * Get step data for a user
 */
export const getUserStepData = async (
  userId: string,
  session: Session | null
): Promise<StepDataResponse> => {
  try {
    const endpoint = `/rest/v1/step_data?user_id=eq.${userId}&order=date.desc&limit=30`;
    const appsEndpoint = `/rest/v1/connected_apps?user_id=eq.${userId}`;
    
    // Fetch step data
    const stepData = await supabaseRestCall(
      endpoint,
      {
        headers: {
          'Content-Type': 'application/json'
        }
      },
      session
    );
    
    // Fetch connected apps
    const connectedAppsData = await supabaseRestCall(
      appsEndpoint,
      {
        headers: {
          'Content-Type': 'application/json'
        }
      },
      session
    );
    
    return {
      stepData: Array.isArray(stepData) ? stepData : [],
      connectedApps: Array.isArray(connectedAppsData) ? connectedAppsData : []
    };
  } catch (error) {
    console.error('Error fetching user step data:', error);
    return {
      stepData: [],
      connectedApps: []
    };
  }
};

/**
 * Calculate step rewards for a user
 */
export const calculateStepRewards = async (
  userId: string,
  session: Session | null
): Promise<StepReward[]> => {
  try {
    const endpoint = `/rest/v1/step_rewards?user_id=eq.${userId}`;
    
    const stepRewards = await supabaseRestCall(
      endpoint,
      {
        headers: {
          'Content-Type': 'application/json'
        }
      },
      session
    );
    
    if (Array.isArray(stepRewards)) {
      return stepRewards;
    }
    
    return [];
  } catch (error) {
    console.error('Error calculating step rewards:', error);
    return [];
  }
};

/**
 * Connect to a health app
 */
export const connectHealthApp = async (
  userId: string,
  appName: string,
  session: Session | null
): Promise<{ success: boolean; message: string }> => {
  try {
    const endpoint = `/rest/v1/connected_health_apps`;
    
    await supabaseRestCall(
      endpoint, 
      {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          user_id: userId,
          app_name: appName,
          connected_at: new Date().toISOString(),
          last_sync: new Date().toISOString(),
          status: 'active'
        })
      }, 
      session
    );
    
    return {
      success: true,
      message: `Successfully connected to ${appName}`
    };
  } catch (error) {
    console.error(`Error connecting to ${appName}:`, error);
    return {
      success: false,
      message: `Failed to connect to ${appName}`
    };
  }
};

/**
 * Disconnect from a health app
 */
export const disconnectHealthApp = async (
  userId: string,
  appName: string,
  session: Session | null
): Promise<{ success: boolean; message: string }> => {
  try {
    const endpoint = `/rest/v1/connected_health_apps?user_id=eq.${userId}&app_name=eq.${appName}`;
    
    await supabaseRestCall(
      endpoint, 
      {
        method: 'PATCH',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          status: 'disconnected'
        })
      }, 
      session
    );
    
    return {
      success: true,
      message: `Successfully disconnected from ${appName}`
    };
  } catch (error) {
    console.error(`Error disconnecting from ${appName}:`, error);
    return {
      success: false,
      message: `Failed to disconnect from ${appName}`
    };
  }
};

/**
 * Sync health data for a user
 */
export const syncHealthDataForUser = async (
  userId: string,
  session: Session | null
): Promise<{ success: boolean; message: string, syncedData?: StepData[] }> => {
  try {
    // Simulate syncing data from a health app
    const stepData = Array.from({ length: 7 }).map((_, i) => {
      const date = new Date();
      date.setDate(date.getDate() - i);
      
      return {
        user_id: userId,
        date: date.toISOString().split('T')[0],
        step_count: Math.floor(Math.random() * 5000) + 3000,
        calories_burned: Math.floor(Math.random() * 300) + 100,
        distance_km: parseFloat((Math.random() * 4 + 1).toFixed(2)),
        source_app: ['Apple Health', 'Google Fit', 'Fitbit'][Math.floor(Math.random() * 3)]
      };
    });
    
    // Save the synced data
    const endpoint = `/rest/v1/step_data`;
    
    for (const data of stepData) {
      await supabaseRestCall(
        endpoint,
        {
          method: 'POST',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify(data)
        },
        session
      );
    }
    
    // Update the last sync time
    const appsEndpoint = `/rest/v1/connected_health_apps?user_id=eq.${userId}`;
    
    await supabaseRestCall(
      appsEndpoint,
      {
        method: 'PATCH',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          last_sync: new Date().toISOString()
        })
      },
      session
    );
    
    return {
      success: true,
      message: 'Successfully synced health data',
      syncedData: stepData as StepData[]
    };
  } catch (error) {
    console.error('Error syncing health data:', error);
    return {
      success: false,
      message: 'Failed to sync health data'
    };
  }
};

/**
 * Get available rewards
 */
export const getAvailableRewards = async (
  userId: string,
  session: Session | null
): Promise<StepReward[]> => {
  try {
    const endpoint = `/rest/v1/available_rewards?user_id=eq.${userId}&claimed=eq.false`;
    
    const rewards = await supabaseRestCall(
      endpoint,
      {
        headers: {
          'Content-Type': 'application/json'
        }
      },
      session
    );
    
    if (Array.isArray(rewards)) {
      return rewards;
    }
    
    return [];
  } catch (error) {
    console.error('Error fetching available rewards:', error);
    return [];
  }
};

// Add utility functions for calculations
/**
 * Calculate the current smoke-free streak in days
 */
function calculateSmokeFreeStreak(progressEntries: ProgressEntry[]): number {
  if (!progressEntries || progressEntries.length === 0) {
    return 0;
  }
  
  // Sort entries by date in descending order to ensure latest first
  const sortedEntries = [...progressEntries].sort((a, b) => {
    return new Date(b.date).getTime() - new Date(a.date).getTime();
  });
  
  // Check if the user has reported not being smoke-free in the most recent entry
  if (!sortedEntries[0].smoke_free) {
    return 0;
  }
  
  // Count consecutive days being smoke-free
  let streak = 1; // Start with today
  const oneDayMs = 24 * 60 * 60 * 1000;
  
  for (let i = 0; i < sortedEntries.length - 1; i++) {
    const currentDate = new Date(sortedEntries[i].date);
    const nextDate = new Date(sortedEntries[i + 1].date);
    
    // Check if next entry is exactly one day before
    const dayDiff = Math.round((currentDate.getTime() - nextDate.getTime()) / oneDayMs);
    
    if (dayDiff === 1 && sortedEntries[i + 1].smoke_free) {
      streak++;
    } else {
      break;
    }
  }
  
  return streak;
}

/**
 * Calculate total money saved based on progress entries
 */
function calculateTotalSavings(progressEntries: ProgressEntry[]): number {
  if (!progressEntries || progressEntries.length === 0) {
    return 0;
  }
  
  return progressEntries.reduce((total, entry) => {
    return total + (entry.money_saved || 0);
  }, 0);
}

/**
 * Calculate overall health score based on progress entries and user profile
 */
function calculateHealthScore(progressEntries: ProgressEntry[], userProfile?: UserProfile): number {
  if (!progressEntries || progressEntries.length === 0) {
    return 50; // Default baseline score
  }
  
  // Get latest entry
  const latestEntry = progressEntries[0];
  
  // Base score calculation
  let score = 50;
  
  // Factors that improve score
  if (latestEntry.smoke_free) score += 10;
  if (latestEntry.exercise_duration && latestEntry.exercise_duration > 30) score += 5;
  if (latestEntry.water_intake && latestEntry.water_intake > 6) score += 5;
  if (latestEntry.sleep_duration && latestEntry.sleep_duration >= 7) score += 5;
  if (latestEntry.stress_level !== undefined && latestEntry.stress_level < 3) score += 5;
  
  // Cap score at 100
  return Math.min(100, score);
}

// Basic compatibility exports
export default {
  getNicotineConsumptionLogsREST,
  addNicotineConsumptionLog,
  getNicotineProducts,
  getUserProgress,
  addProgressEntry,
  getHealthImprovementsREST,
  shareProgressToSocial,
  getCravingEntries,
  addConsumptionLog,
  getConsumptionLogs,
  getAllProducts,
  syncHealthData,
  getShareAnalytics,
  getShareAnalyticsSummary,
  saveEnergyPlan,
  saveMoodSupportPlan,
  saveFatigueManagementPlan,
  supabaseRestCall,
  getCurrentSession,
  getCurrentUser,
  onAuthStateChange,
  signInWithEmail,
  signOut,
  getProductById,
  getMoodLogsREST,
  getEnergyLogsREST,
  getFocusLogsREST,
  getSleepLogsREST,
  getUserStepData,
  calculateStepRewards,
  connectHealthApp,
  disconnectHealthApp,
  syncHealthDataForUser,
  getAvailableRewards
};

/**
 * User Progress Response
 */
export interface UserProgressResponse {
  userProfile?: UserProfile;
  progressEntries: ProgressEntry[];
  smokeFreeStreak: number;
  totalSavings: number;
  healthScore: number;
}

/**
 * User Progress Entry
 */
export interface UserProgressEntry {
  id: string;
  user_id: string;
  date: string;
  health_score?: number;
  mood_score?: number;
  energy_level?: number;
  focus_level?: number;
  craving_count?: number;
  craving_intensity?: number;
  steps_count?: number;
  sleep_hours?: number;
  created_at: string;
}

/**
 * Reward Interfaces
 */
export interface Reward {
  id: string;
  title: string;
  description: string;
  sponsor: string;
  sponsor_logo?: string;
  type: 'discount' | 'product' | 'badge';
  value?: number;
  code?: string;
  expiry_date?: string;
}

/**
 * Step Reward
 */
export interface StepReward {
  id: string;
  user_id: string;
  reward_id: string;
  title: string;
  description: string;
  step_count: number;
  is_claimed: boolean;
  reward_code?: string;
  sponsor?: string;
  sponsor_logo?: string;
  created_at: string;
}

/**
 * Discount Code
 */
export interface DiscountCode {
  code: string;
  value: number;
  type: 'percentage' | 'fixed';
  expiry_date: string;
  retailer: string;
}

/**
 * NRT Product Preview
 */
export interface NRTProductPreview {
  id: string;
  name: string;
  description: string;
  image_url: string;
  price: number;
  discount_price?: number;
  category: string;
  rating: number;
}

/**
 * Craving Log
 */
export interface CravingLog {
  id: string;
  user_id: string;
  timestamp: string;
  intensity: number;
  trigger?: string;
  location?: string;
  succeeded: boolean;
  strategy_used?: string;
}

/**
 * Get health improvements data
 */
export const getHealthImprovementsMock = async (
  userId: string,
  session: Session | null
): Promise<any> => {
  try {
    // This is a mock implementation for backward compatibility
    console.warn('Using mock implementation of getHealthImprovements. Please use getHealthImprovementsREST instead.');
    return getStaticHealthImprovements().map(improvement => ({
      ...improvement,
      achieved: Math.random() > 0.5
    }));
  } catch (error) {
    console.error('Error getting health improvements:', error);
    return [];
  }
};

/**
 * Get nicotine consumption logs
 */
export const getNicotineConsumptionLogsMock = async (
  userId: string,
  startDate: string,
  endDate: string,
  session: Session | null
): Promise<any> => {
  try {
    // This is a mock implementation for backward compatibility
    console.warn('Using mock implementation of getNicotineConsumptionLogs. Please use getNicotineConsumptionLogsREST instead.');
    return [];
  } catch (error) {
    console.error('Error getting nicotine consumption logs:', error);
    return [];
  }
};

/**
 * Get craving logs
 */
export const getCravingLogs = async (
  userId: string,
  startDate?: string,
  endDate?: string,
  session: Session | null = null
): Promise<CravingLog[]> => {
  try {
    // Set default date range if not provided
    const start = startDate || new Date(Date.now() - 30 * 24 * 60 * 60 * 1000).toISOString().split('T')[0];
    const end = endDate || new Date().toISOString().split('T')[0];
    
    // Use REST API compliant with SSOT8001
    const endpoint = `/rest/v1/craving_logs?user_id=eq.${userId}&timestamp=gte.${start}&timestamp=lte.${end}&order=timestamp.desc`;
    
    const response = await supabaseRestCall(endpoint, {}, session);
    
    if (response.error) {
      console.error('Error getting craving logs:', response.error);
      return [];
    }
    
    return Array.isArray(response.data) ? response.data : [];
  } catch (error) {
    console.error('Error getting craving logs:', error);
    return [];
  }
};

// Fix the getUserProfile function to properly handle response and properties
export const getUserProfile = async (userId: string) => {
  try {
    const response = await supabaseRestCall(`/rest/v1/user_profiles?user_id=eq.${userId}`);
    
    // Handle error case
    if (!response || response.error) {
      return { 
        userProfile: null, 
        progressEntries: [], 
        error: response?.error || "Unknown error" 
      };
    }
    
    // Cast the data to the expected type to fix property access errors
    const data = Array.isArray(response.data) ? response.data : [];
    const userData = data.length > 0 ? data[0] : null;
      
    return {
      userProfile: userData,
      progressEntries: userData?.progress_entries || [],
      error: null
    };
  } catch (error) {
    console.error("Error in getUserProfile:", error);
    return { 
      userProfile: null, 
      progressEntries: [], 
      error: error instanceof Error ? error.message : String(error)
    };
  }
};

// Fix type errors on lines 1108, 1134, 1160, 1175, 1186
// Add SleepLog interface
interface SleepLog {
  id: string;
  user_id: string;
  date: string;
  hours: number;
  quality: number;
  notes?: string;
}

// Define getMoodLogs and handle the empty array case properly
export const getMoodLogs = async (userId: string, startDate: string, endDate: string) => {
  try {
    const response = await supabaseRestCall(`/rest/v1/mood_logs?user_id=eq.${userId}&date=gte.${startDate}&date=lte.${endDate}`);
    
    if (response.error) {
      return { error: response.error };
    }
    
    return { data: Array.isArray(response.data) ? response.data : [], error: null };
  } catch (error) {
    console.error("Error in getMoodLogs:", error);
    return { data: [], error: error instanceof Error ? error.message : String(error) };
  }
};

// Define getEnergyLogs and handle the empty array case properly
export const getEnergyLogs = async (userId: string, startDate: string, endDate: string) => {
  try {
    const response = await supabaseRestCall(`/rest/v1/energy_logs?user_id=eq.${userId}&date=gte.${startDate}&date=lte.${endDate}`);
    
    if (response.error) {
      return { error: response.error };
    }
    
    return { data: Array.isArray(response.data) ? response.data : [], error: null };
  } catch (error) {
    console.error("Error in getEnergyLogs:", error);
    return { data: [], error: error instanceof Error ? error.message : String(error) };
  }
};

// Define getFocusLogs and handle the empty array case properly
export const getFocusLogs = async (userId: string, startDate: string, endDate: string) => {
  try {
    const response = await supabaseRestCall(`/rest/v1/focus_logs?user_id=eq.${userId}&date=gte.${startDate}&date=lte.${endDate}`);
    
    if (response.error) {
      return { error: response.error };
    }
    
    return { data: Array.isArray(response.data) ? response.data : [], error: null };
  } catch (error) {
    console.error("Error in getFocusLogs:", error);
    return { data: [], error: error instanceof Error ? error.message : String(error) };
  }
};

// Define getSleepLogs and handle the empty array case properly
export const getSleepLogs = async (userId: string, startDate: string, endDate: string) => {
  try {
    const response = await supabaseRestCall(`/rest/v1/sleep_logs?user_id=eq.${userId}&date=gte.${startDate}&date=lte.${endDate}`);
    
    if (response.error) {
      return { error: response.error };
    }
    
    return { data: Array.isArray(response.data) ? response.data : [], error: null };
  } catch (error) {
    console.error("Error in getSleepLogs:", error);
    return { data: [], error: error instanceof Error ? error.message : String(error) };
  }
};

// Re-export the REST versions as the default implementation
export { 
  getHealthImprovementsREST as getHealthImprovements,
  getNicotineConsumptionLogsREST as getNicotineConsumptionLogs
}; 