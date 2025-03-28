/**
 * Mission Fresh API Client
 * 
 * This module provides direct REST API access to the Mission Fresh database
 * following the SSOT8001 guidelines. Only direct REST API calls are used,
 * WITHOUT using any Supabase client methods.
 */

import { Session, User } from '@supabase/supabase-js'; // Only importing types, no client functionality
import { addDays } from 'date-fns';
import { 
  ApiResponse,
  PaginatedResponse
} from '../types/dataTypes';
import { 
  ProductVendorAvailability, 
  Vendor 
} from '../types/vendor';
import axios, { AxiosInstance, AxiosRequestConfig, AxiosResponse } from 'axios';
import offlineStorageService from '../services/BackwardCompatibility';
import { useOffline } from '../context/OfflineContext';
import { toast } from 'sonner';

// Export all compatibility functions from apiCompatibility
export * from './apiCompatibility';

// Import and reuse values from apiCompatibility
import { SUPABASE_URL, SUPABASE_ANON_KEY } from './apiCompatibility';

// Configure API URLs based on environment
const API_URL = import.meta.env.VITE_API_URL || 'https://api.missionfresh.com/v1';

// Interface for the API client options
interface MissionFreshApiClientOptions {
  baseURL?: string;
  timeout?: number;
  headers?: Record<string, string>;
}

// Flag to track mounting state for hooks
let isMounted = false;
let globalOfflineState = {
  isOnline: navigator.onLine,
  isOfflineModeEnabled: false,
  pendingSyncCount: 0
};

// Initialize the global offline state
if (typeof window !== 'undefined') {
  try {
    // Try to get offline mode from localStorage if OfflineContext isn't available yet
    const storedOfflineMode = localStorage.getItem('offlineMode');
    globalOfflineState.isOfflineModeEnabled = storedOfflineMode === 'true';
  } catch (e) {
    console.warn('Error accessing localStorage for offline mode:', e);
  }
}

export interface SmokelessProductsFilter {
  category?: string;
  price_min?: number;
  price_max?: number;
  sort_by?: 'price' | 'rating' | 'popularity';
  sort_order?: 'asc' | 'desc';
  country?: string;
  affiliate_only?: boolean;
  limit?: number;
  offset?: number;
}

class MissionFreshApiClient {
  private client: AxiosInstance;
  private _isInitialized: boolean = false;

  constructor(options: MissionFreshApiClientOptions = {}) {
    // Create axios instance with default options
    this.client = axios.create({
      baseURL: options.baseURL || API_URL,
      timeout: options.timeout || 30000,
      headers: {
        'Content-Type': 'application/json',
        ...options.headers,
      },
    });

    // Set up interceptors
    this.setupInterceptors();
  }

  // Initialize the client and sync with OfflineContext when available
  public initialize(): void {
    if (this._isInitialized) return;
    
    // Update the global offline state when the window comes online/offline
    if (typeof window !== 'undefined') {
      window.addEventListener('online', this.handleOnlineStatusChange);
      window.addEventListener('offline', this.handleOnlineStatusChange);
      
      // Listen for storage events to sync offline mode changes across tabs
      window.addEventListener('storage', this.handleStorageChange);
    }
    
    this._isInitialized = true;
  }

  // Setup request and response interceptors
  private setupInterceptors(): void {
    // Request interceptor
    this.client.interceptors.request.use(
      (config) => {
        // Check if we should use offline mode before making request
        if (this.canUseOfflineMode() && config.method?.toLowerCase() !== 'get') {
          // For non-GET requests in offline mode, store in queue and throw a custom error
          this.queueRequestForOffline(config);
          return Promise.reject(new Error('Request queued for offline mode'));
        }
        
        // Add auth token if available
        const token = localStorage.getItem('mf_auth_token');
        if (token && config.headers) {
          config.headers['Authorization'] = `Bearer ${token}`;
        }
        return config;
      },
      (error) => Promise.reject(error)
    );

    // Response interceptor
    this.client.interceptors.response.use(
      (response) => response,
      async (error) => {
        // Handle specific error cases
        if (error.response) {
          switch (error.response.status) {
            case 401:
              // Clear token and redirect to login if unauthorized
              localStorage.removeItem('mf_auth_token');
              window.location.href = '/login';
              break;
            case 403:
              console.error('Permission denied');
              break;
            case 429:
              console.error('Rate limit exceeded');
              break;
          }
        } else if (error.request) {
          // Handle network errors - could be offline
          console.warn('Network error, might be offline:', error.message);
          
        }
        return Promise.reject(error);
      }
    );
  }

  // Check network status and offline mode settings
  private canUseOfflineMode(): boolean {
    return !offlineStorageService.isNetworkOnline() && this.offlineMode;
  }

  // Generic request method
  public async request<T>(config: AxiosRequestConfig): Promise<T> {
    try {
      const response: AxiosResponse<T> = await this.client(config);
      return response.data;
    } catch (error) {
      throw error;
    }
  }

  // User progress methods
  public async getUserProgress(userId: string, startDate?: string, endDate?: string): Promise<any[]> {
    if (this.canUseOfflineMode()) {
      return offlineStorageService.getProgressEntries(userId, startDate, endDate);
    }

    try {
      const response = await this.client.get(`/users/${userId}/progress`, {
        params: { startDate, endDate }
      });
      return response.data;
    } catch (error) {
      // Fallback to offline storage if network error
      if (this.offlineMode && axios.isAxiosError(error) && !error.response) {
        return offlineStorageService.getProgressEntries(userId, startDate, endDate);
      }
      throw error;
    }
  }

  public async saveUserProgress(userId: string, progressData: any): Promise<any> {
    // Always save to offline storage first for data safety
    const savedOfflineData = await offlineStorageService.saveProgress({
      ...progressData,
      user_id: userId,
    });

    // If offline or can't connect, just return the offline saved data
    if (this.canUseOfflineMode()) {
      return savedOfflineData;
    }

    try {
      const isUpdate = !!progressData.id && !progressData.id.startsWith('temp_');
      let response;

      if (isUpdate) {
        response = await this.client.put(
          `/users/${userId}/progress/${progressData.id}`,
          progressData
        );
      } else {
        response = await this.client.post(`/users/${userId}/progress`, progressData);
      }

      // Sync successful - trigger sync to update any pending changes
      await offlineStorageService.syncPendingChanges();
      return response.data;
    } catch (error) {
      // If network error, return the offline data
      if (axios.isAxiosError(error) && !error.response) {
        return savedOfflineData;
      }
      throw error;
    }
  }

  // Consumption logs methods
  public async getUserConsumptionLogs(userId: string, startDate?: string, endDate?: string): Promise<any[]> {
    if (this.canUseOfflineMode()) {
      return offlineStorageService.getConsumptionLogs(userId, startDate, endDate);
    }

    try {
      const response = await this.client.get(`/users/${userId}/consumption`, {
        params: { startDate, endDate }
      });
      return response.data;
    } catch (error) {
      // Fallback to offline storage if network error
      if (this.offlineMode && axios.isAxiosError(error) && !error.response) {
        return offlineStorageService.getConsumptionLogs(userId, startDate, endDate);
      }
      throw error;
    }
  }

  public async saveConsumptionLog(userId: string, logData: any): Promise<any> {
    // Always save to offline storage first
    const savedOfflineData = await offlineStorageService.saveConsumptionLog({
      ...logData,
      user_id: userId,
    });

    // If offline or can't connect, just return the offline saved data
    if (this.canUseOfflineMode()) {
      return savedOfflineData;
    }

    try {
      const isUpdate = !!logData.id && !logData.id.startsWith('temp_');
      let response;

      if (isUpdate) {
        response = await this.client.put(
          `/users/${userId}/consumption/${logData.id}`,
          logData
        );
      } else {
        response = await this.client.post(`/users/${userId}/consumption`, logData);
      }

      // Sync successful - trigger sync
      await offlineStorageService.syncPendingChanges();
      return response.data;
    } catch (error) {
      // If network error, return the offline data
      if (axios.isAxiosError(error) && !error.response) {
        return savedOfflineData;
      }
      throw error;
    }
  }

  // Craving logs methods
  public async getUserCravings(userId: string, startDate?: string, endDate?: string): Promise<any[]> {
    if (this.canUseOfflineMode()) {
      return offlineStorageService.getCravingEntries(userId, startDate, endDate);
    }

    try {
      const response = await this.client.get(`/users/${userId}/cravings`, {
        params: { startDate, endDate }
      });
      return response.data;
    } catch (error) {
      // Fallback to offline storage if network error
      if (this.offlineMode && axios.isAxiosError(error) && !error.response) {
        return offlineStorageService.getCravingEntries(userId, startDate, endDate);
      }
      throw error;
    }
  }

  public async saveCraving(userId: string, cravingData: any): Promise<any> {
    // Always save to offline storage first
    const savedOfflineData = await offlineStorageService.saveCraving({
      ...cravingData,
      user_id: userId,
    });

    // If offline or can't connect, just return the offline saved data
    if (this.canUseOfflineMode()) {
      return savedOfflineData;
    }

    try {
      const isUpdate = !!cravingData.id && !cravingData.id.startsWith('temp_');
      let response;

      if (isUpdate) {
        response = await this.client.put(
          `/users/${userId}/cravings/${cravingData.id}`,
          cravingData
        );
      } else {
        response = await this.client.post(`/users/${userId}/cravings`, cravingData);
      }

      // Sync successful - trigger sync
      await offlineStorageService.syncPendingChanges();
      return response.data;
    } catch (error) {
      // If network error, return the offline data
      if (axios.isAxiosError(error) && !error.response) {
        return savedOfflineData;
      }
      throw error;
    }
  }

  // User tasks methods
  public async getUserTasks(userId: string, includeCompleted: boolean = true): Promise<any[]> {
    if (this.canUseOfflineMode()) {
      return offlineStorageService.getTasks(userId, includeCompleted);
    }

    try {
      const response = await this.client.get(`/users/${userId}/tasks`, {
        params: { includeCompleted }
      });
      return response.data;
    } catch (error) {
      // Fallback to offline storage if network error
      if (this.offlineMode && axios.isAxiosError(error) && !error.response) {
        return offlineStorageService.getTasks(userId, includeCompleted);
      }
      throw error;
    }
  }

  public async saveTask(userId: string, taskData: any): Promise<any> {
    // Always save to offline storage first
    const savedOfflineData = await offlineStorageService.saveTask({
      ...taskData,
      user_id: userId,
    });

    // If offline or can't connect, just return the offline saved data
    if (this.canUseOfflineMode()) {
      return savedOfflineData;
    }

    try {
      const isUpdate = !!taskData.id && !taskData.id.startsWith('temp_');
      let response;

      if (isUpdate) {
        response = await this.client.put(
          `/users/${userId}/tasks/${taskData.id}`,
          taskData
        );
      } else {
        response = await this.client.post(`/users/${userId}/tasks`, taskData);
      }

      // Sync successful - trigger sync
      await offlineStorageService.syncPendingChanges();
      return response.data;
    } catch (error) {
      // If network error, return the offline data
      if (axios.isAxiosError(error) && !error.response) {
        return savedOfflineData;
      }
      throw error;
    }
  }

  // Delete methods
  public async deleteUserTask(userId: string, taskId: string): Promise<boolean> {
    // Always delete from offline storage first
    await offlineStorageService.deleteItem('tasks', taskId);

    // If offline or can't connect, just return success
    if (this.canUseOfflineMode()) {
      return true;
    }

    try {
      await this.client.delete(`/users/${userId}/tasks/${taskId}`);
      return true;
    } catch (error) {
      // If network error, consider it "successful" since it's in deletion queue
      if (axios.isAxiosError(error) && !error.response) {
        return true;
      }
      throw error;
    }
  }

  // Set offline mode
  public setOfflineMode(enabled: boolean): void {
    this.offlineMode = enabled;
    offlineStorageService.setOfflineModeEnabled(enabled);
  }

  // Force sync all pending changes
  public async syncPendingChanges(): Promise<boolean> {
    return offlineStorageService.syncPendingChanges();
  }

  async fetchSmokelessProducts(filters: SmokelessProductsFilter = {}): Promise<SmokelessProduct[]> {
    const {
      category,
      price_min,
      price_max,
      sort_by = 'popularity',
      sort_order = 'desc',
      country,
      affiliate_only,
      limit = 20,
      offset = 0
    } = filters;
    
    let query = `${this.apiBase}/smokeless-products?limit=${limit}&offset=${offset}`;
    
    if (category) {
      query += `&category=${encodeURIComponent(category)}`;
    }
    
    if (price_min !== undefined) {
      query += `&price_min=${price_min}`;
    }
    
    if (price_max !== undefined) {
      query += `&price_max=${price_max}`;
    }
    
    if (sort_by) {
      query += `&sort_by=${sort_by}&sort_order=${sort_order}`;
    }
    
    if (country) {
      query += `&country=${encodeURIComponent(country)}`;
    }
    
    if (affiliate_only) {
      query += `&affiliate_only=true`;
    }
    
    const response = await fetch(query, {
      headers: this.headers,
    });
    
    if (!response.ok) {
      throw new Error(`Error fetching smokeless products: ${response.statusText}`);
    }
    
    return await response.json();
  }
}

// Export a singleton instance
const missionFreshApiClient = new MissionFreshApiClient();
export default missionFreshApiClient;

// Add missing type exports that are needed by other components
export interface StepData {
  id: string;
  user_id: string;
  date: string;
  step_count: number;
  created_at: string;
  updated_at: string;
}

export interface RewardData {
  id: string;
  user_id: string;
  name: string;
  description: string;
  points_required: number;
  is_redeemed: boolean;
  redeemed_at?: string;
  created_at: string;
  updated_at: string;
}

export interface NicotineProduct {
  id: string;
  name: string;
  brand: string;
  type: string;
  description: string;
  nicotine_strength: number;
  price: number;
  image_url?: string;
  flavors?: string[];
  rating?: number;
  reviews_count?: number;
  health_impact_rating?: number;
  gum_health_rating?: number;
  chemicals_of_concern?: string[];
  available_regions?: string[];
  created_at: string;
  updated_at: string;
}

// Add the missing function for getting a product by ID
export const getProductById = async (
  productId: string,
  session: Session
): Promise<NicotineProduct> => {
  try {
    const response = await fetch(
      `${SUPABASE_URL}/rest/v1/mission4_nicotine_products?id=eq.${productId}&select=*`,
      {
        headers: {
          apikey: SUPABASE_ANON_KEY,
          Authorization: `Bearer ${session.access_token}`,
          'Content-Type': 'application/json'
        }
      }
    );

    if (!response.ok) {
      const error = await response.json();
      throw new Error(error.message || response.statusText);
    }

    const products = await response.json();
    
    if (products.length === 0) {
      throw new Error(`No product found with ID: ${productId}`);
    }

    return products[0];
  } catch (error) {
    console.error('Error fetching product by ID:', error);
    throw error;
  }
};

// Add functions for Achievements
export interface Achievement {
  id: string;
  user_id: string;
  achievement_id: string;
  title: string;
  description: string;
  icon: string;
  category: string;
  progress: number;
  completed: boolean;
  unlocked_at?: string;
  created_at: string;
  updated_at: string;
}

export const getUserAchievements = async (
  userId: string,
  session: Session
): Promise<Achievement[]> => {
  try {
    const response = await fetch(
      `${SUPABASE_URL}/rest/v1/mission4_user_achievements?user_id=eq.${userId}&select=*`,
      {
        headers: {
          apikey: SUPABASE_ANON_KEY,
          Authorization: `Bearer ${session.access_token}`,
          'Content-Type': 'application/json'
        }
      }
    );

    if (!response.ok) {
      const error = await response.json();
      throw new Error(error.message || response.statusText);
    }

    return await response.json();
  } catch (error) {
    console.error('Error fetching user achievements:', error);
    throw error;
  }
};

export const unlockAchievement = async (
  userId: string,
  achievementId: string,
  session: Session
): Promise<Achievement> => {
  try {
    const timestamp = new Date().toISOString();
    const response = await fetch(
      `${SUPABASE_URL}/rest/v1/mission4_user_achievements`,
      {
        method: 'POST',
        headers: {
          apikey: SUPABASE_ANON_KEY,
          Authorization: `Bearer ${session.access_token}`,
          'Content-Type': 'application/json',
          'Prefer': 'return=representation'
        },
        body: JSON.stringify({
          user_id: userId,
          achievement_id: achievementId,
          completed: true,
          progress: 100,
          unlocked_at: timestamp,
          created_at: timestamp,
          updated_at: timestamp
        })
      }
    );

    if (!response.ok) {
      const error = await response.json();
      throw new Error(error.message || response.statusText);
    }

    const achievements = await response.json();
    return achievements[0];
  } catch (error) {
    console.error('Error unlocking achievement:', error);
    throw error;
  }
};

export const getUserStepData = async (
  userId: string,
  session: Session
): Promise<StepData[]> => {
  try {
    const response = await fetch(
      `${SUPABASE_URL}/rest/v1/mission4_step_data?user_id=eq.${userId}&order=date.desc`,
      {
        headers: {
          apikey: SUPABASE_ANON_KEY,
          Authorization: `Bearer ${session.access_token}`,
          'Content-Type': 'application/json'
        }
      }
    );
    
    if (!response.ok) {
      const error = await response.json();
      throw new Error(error.message || response.statusText);
    }
    
    return await response.json();
  } catch (error) {
    console.error('Error fetching step data:', error);
    return [];
  }
};

export const calculateStepRewards = async (
  userId: string,
  session: Session
): Promise<RewardData[]> => {
  try {
    const response = await fetch(
      `${SUPABASE_URL}/rest/v1/mission4_step_rewards?user_id=eq.${userId}&order=points_required.asc`,
      {
        headers: {
          apikey: SUPABASE_ANON_KEY,
          Authorization: `Bearer ${session.access_token}`,
          'Content-Type': 'application/json'
        }
      }
    );
    
    if (!response.ok) {
      const error = await response.json();
      throw new Error(error.message || response.statusText);
    }
    
    return await response.json();
  } catch (error) {
    console.error('Error calculating step rewards:', error);
    return [];
  }
};

export const connectHealthApp = async (
  userId: string,
  appName: string,
  session: Session
): Promise<boolean> => {
  try {
    const response = await fetch(
      `${SUPABASE_URL}/rest/v1/mission4_health_connections`,
      {
        method: 'POST',
        headers: {
          apikey: SUPABASE_ANON_KEY,
          Authorization: `Bearer ${session.access_token}`,
          'Content-Type': 'application/json',
          'Prefer': 'return=minimal'
        },
        body: JSON.stringify({
          user_id: userId,
          app_name: appName,
          is_connected: true,
          last_sync: new Date().toISOString()
        })
      }
    );
    
    if (!response.ok) {
      const error = await response.json();
      throw new Error(error.message || response.statusText);
    }
    
    return true;
  } catch (error) {
    console.error('Error connecting health app:', error);
    return false;
  }
};

export const disconnectHealthApp = async (
  userId: string,
  appName: string,
  session: Session
): Promise<boolean> => {
  try {
    const response = await fetch(
      `${SUPABASE_URL}/rest/v1/mission4_health_connections?user_id=eq.${userId}&app_name=eq.${appName}`,
      {
        method: 'PATCH',
        headers: {
          apikey: SUPABASE_ANON_KEY,
          Authorization: `Bearer ${session.access_token}`,
          'Content-Type': 'application/json',
          'Prefer': 'return=minimal'
        },
        body: JSON.stringify({
          is_connected: false,
          last_sync: new Date().toISOString()
        })
      }
    );
    
    if (!response.ok) {
      const error = await response.json();
      throw new Error(error.message || response.statusText);
    }
    
    return true;
  } catch (error) {
    console.error('Error disconnecting health app:', error);
    return false;
  }
};

// Guide types
export interface Guide {
  id: string;
  title: string;
  description: string;
  type: 'article' | 'video' | 'pdf';
  category: string;
  tags: string[];
  difficulty: 'beginner' | 'intermediate' | 'advanced';
  duration: number; // in minutes
  published_at: string;
  thumbnail?: string;
  url: string;
  author: string;
  featured: boolean;
}

/**
 * Get all guides from the database
 * 
 * @param session User session for authentication
 * @returns Array of guides
 */
export const getGuides = async (session: Session | null): Promise<Guide[]> => {
  try {
    if (!session) {
      throw new Error('User must be authenticated to fetch guides');
    }
    
    const response = await supabaseRestCall<Guide[]>(
      `/rest/v1/guides?order=created_at.desc`,
      {
        method: 'GET'
      },
      session
    );
    
    return Array.isArray(response) ? response : [];
  } catch (error) {
    console.error('Error fetching guides:', error);
    return [];
  }
};

/**
 * Get bookmarked guides for a user
 * 
 * @param session User session for authentication
 * @returns Array of bookmarked guide IDs
 */
export const getBookmarkedGuides = async (
  session: Session | null
): Promise<{guide_id: string}[]> => {
  try {
    if (!session?.user?.id) {
      throw new Error('User must be authenticated to fetch bookmarked guides');
    }
    
    const bookmarksEndpoint = `/rest/v1/mission4_guide_bookmarks?user_id=eq.${session.user.id}&select=guide_id`;
    const response = await supabaseRestCall<{guide_id: string}[]>(
      bookmarksEndpoint,
      {
        method: 'GET'
      },
      session
    );
    
    return Array.isArray(response) ? response : [];
  } catch (error) {
    console.error('Error fetching bookmarked guides:', error);
    return [];
  }
};

/**
 * Get recently viewed guides for a user
 * 
 * @param session User session for authentication
 * @returns Array of recently viewed guide IDs with timestamps
 */
export const getRecentlyViewedGuides = async (
  session: Session | null
): Promise<{guide_id: string, viewed_at: string}[]> => {
  try {
    if (!session?.user?.id) {
      throw new Error('User must be authenticated to fetch recently viewed guides');
    }
    
    const viewsEndpoint = `/rest/v1/mission4_guide_views?user_id=eq.${session.user.id}&select=guide_id,viewed_at&order=viewed_at.desc&limit=5`;
    const response = await supabaseRestCall<{guide_id: string, viewed_at: string}[]>(
      viewsEndpoint,
      {
        method: 'GET'
      },
      session
    );
    
    return Array.isArray(response) ? response : [];
  } catch (error) {
    console.error('Error fetching recently viewed guides:', error);
    return [];
  }
};

/**
 * Add a guide bookmark for a user
 * 
 * @param session User session for authentication
 * @param guideId ID of the guide to bookmark
 * @returns Success status
 */
export const addBookmarkGuide = async (
  session: Session | null,
  guideId: string
): Promise<boolean> => {
  try {
    if (!session?.user?.id) {
      throw new Error('User must be authenticated to bookmark guides');
    }
    
    await supabaseRestCall(
      `/rest/v1/mission4_guide_bookmarks`,
      {
        method: 'POST',
        body: JSON.stringify({
          user_id: session.user.id,
          guide_id: guideId,
          bookmarked_at: new Date().toISOString()
        })
      },
      session
    );
    
    return true;
  } catch (error) {
    console.error('Error adding guide bookmark:', error);
    return false;
  }
};

/**
 * Remove a guide bookmark for a user
 * 
 * @param session User session for authentication
 * @param guideId ID of the guide to remove bookmark
 * @returns Success status
 */
export const removeBookmarkGuide = async (
  session: Session | null,
  guideId: string
): Promise<boolean> => {
  try {
    if (!session?.user?.id) {
      throw new Error('User must be authenticated to remove guide bookmarks');
    }
    
    await supabaseRestCall(
      `/rest/v1/mission4_guide_bookmarks?user_id=eq.${session.user.id}&guide_id=eq.${guideId}`,
      {
        method: 'DELETE'
      },
      session
    );
    
    return true;
  } catch (error) {
    console.error('Error removing guide bookmark:', error);
    return false;
  }
};

/**
 * Record a guide view for a user
 * 
 * @param session User session for authentication
 * @param guideId ID of the guide that was viewed
 * @returns Success status
 */
export const recordGuideView = async (
  session: Session | null,
  guideId: string
): Promise<boolean> => {
  try {
    if (!session?.user?.id) {
      throw new Error('User must be authenticated to record guide views');
    }
    
    await supabaseRestCall(
      `/rest/v1/mission4_guide_views`,
      {
        method: 'POST',
        body: JSON.stringify({
          user_id: session.user.id,
          guide_id: guideId,
          viewed_at: new Date().toISOString()
        })
      },
      session
    );
    
    return true;
  } catch (error) {
    console.error('Error recording guide view:', error);
    return false;
  }
};

// Define the SmokelessProduct type
export interface SmokelessProduct {
  id: string;
  name: string;
  brand: string;
  category: string;
  strength: string;
  nicotineContent: number;
  flavors: string[];
  image: string;
  price: number;
  rating: number;
  reviewCount: number;
  description: string;
  highlights: string[];
  concerns: string[];
  inStock: boolean;
  isNatural: boolean;
  isNew: boolean;
  vendor_id: string;
  country_availability: string[];
}

// Define the Vendor type
export interface Vendor {
  id: string;
  name: string;
  website: string;
  countries: string[];
  shipping_times: Record<string, string>;
  has_subscription: boolean;
  rating: number;
  price_comparison: 'discount' | 'competitive' | 'premium';
}

/**
 * Fetch vendors that ship to a specific country
 * 
 * @param session User session for authentication
 * @param countryCode ISO country code to filter vendors by shipping capability
 * @returns Array of Vendor objects
 */
export const fetchVendors = async (
  session: Session | null,
  countryCode: string
): Promise<Vendor[]> => {
  try {
    if (!session) {
      throw new Error('User must be authenticated to fetch vendors');
    }
    
    let endpoint = `/rest/v1/mission4_vendors?select=*`;
    
    // Filter by country if provided
    if (countryCode) {
      endpoint += `&countries=cs.{${countryCode}}`;
    }
    
    const response = await supabaseRestCall<Vendor[]>(
      endpoint,
      {
        method: 'GET'
      },
      session
    );
    
    return Array.isArray(response) ? response : [];
  } catch (error) {
    console.error('Error fetching vendors:', error);
    return [];
  }
};