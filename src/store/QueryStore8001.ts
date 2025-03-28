import { QueryClient } from '@tanstack/react-query';
import { ApiClient8001 } from '../api/ApiClient8001';
import { Session } from '@supabase/supabase-js';
import { 
  NicotineConsumptionLog, 
  NicotineProduct,
  StepData
} from "../api/apiCompatibility";
import { ProgressEntry, RewardData } from "../types/dataTypes";
import {
  getUserProgress,
  getNicotineConsumptionLogs,
  getNicotineProducts,
  getProductById
} from "../api/apiCompatibility";

// Initialize API Client with SSOT8001 configuration
const apiClient = new ApiClient8001({
  version: '8',
  enableMetrics: true
});

// QueryClient configuration following SSOT8001 guidelines
export const queryClient = new QueryClient({
  defaultOptions: {
    queries: {
      staleTime: 1000 * 60 * 30, // 30 minutes (increased from 5 minutes)
      gcTime: 1000 * 60 * 60, // 60 minutes (formerly cacheTime)
      retry: 3,
      retryDelay: (attemptIndex) => Math.min(1000 * Math.pow(2, attemptIndex), 30000),
      refetchOnWindowFocus: false, // Disabled to prevent refreshes when window gets focus
      refetchOnReconnect: false, // Disabled to prevent refreshes on network reconnect
      refetchInterval: false // Disable automatic polling
    },
    mutations: {
      retry: 3,
      retryDelay: (attemptIndex) => Math.min(1000 * Math.pow(2, attemptIndex), 30000)
    }
  }
});

// Type-safe query keys following SSOT8001
export const QueryKeys8001 = {
  products: ['products8'] as const,
  product: (id: string) => ['products8', id] as const,
  consumptionLogs: (userId: string) => ['consumption_logs8', userId] as const,
  progress: (userId: string) => ['progress8', userId] as const,
  cravings: (userId: string) => ['cravings8', userId] as const,
  quitPlan: (userId: string) => ['quit_plans8', userId] as const
} as const;

// Query Store class following SSOT8001
export class QueryStore8001 {
  private static instance: QueryStore8001;
  private session: Session | null = null;

  private constructor() {
    // Private constructor to enforce singleton
  }

  public static getInstance(): QueryStore8001 {
    if (!QueryStore8001.instance) {
      QueryStore8001.instance = new QueryStore8001();
    }
    return QueryStore8001.instance;
  }

  setSession(session: Session | null): void {
    this.session = session;
    apiClient.setSession(session);
  }

  // Products
  async getProducts(category?: string): Promise<NicotineProduct[]> {
    const response = await apiClient.request<NicotineProduct[]>(
      `products8${category ? `?category=eq.${category}` : ''}`,
      { method: 'GET' }
    );
    if (response.error) throw response.error;
    return response.data || [];
  }

  async getProductDetails(productId: string): Promise<NicotineProduct> {
    const response = await apiClient.request<NicotineProduct[]>(
      `products8?id=eq.${productId}`,
      { method: 'GET' }
    );
    if (response.error) throw response.error;
    if (!response.data?.[0]) throw new Error('Product not found');
    return response.data[0];
  }

  // Consumption Logs
  async getConsumptionLogs(
    userId: string,
    startDate: string,
    endDate: string
  ): Promise<NicotineConsumptionLog[]> {
    const response = await apiClient.request<NicotineConsumptionLog[]>(
      `consumption_logs8?user_id=eq.${userId}&consumption_date=gte.${startDate}&consumption_date=lte.${endDate}&order=consumption_date.desc`,
      { method: 'GET' }
    );
    if (response.error) throw response.error;
    return response.data || [];
  }

  async addConsumptionLog(
    log: Omit<NicotineConsumptionLog, 'id' | 'created_at' | 'updated_at'>
  ): Promise<NicotineConsumptionLog> {
    const response = await apiClient.request<NicotineConsumptionLog[]>(
      'consumption_logs8',
      {
        method: 'POST',
        body: log
      }
    );
    if (response.error) throw response.error;
    return response.data![0];
  }

  // Progress Tracking
  async getUserProgress(
    userId: string,
    startDate: string,
    endDate: string
  ): Promise<ProgressEntry[]> {
    const response = await apiClient.request<ProgressEntry[]>(
      `progress8?user_id=eq.${userId}&date=gte.${startDate}&date=lte.${endDate}&order=date.desc`,
      { method: 'GET' }
    );
    if (response.error) throw response.error;
    return response.data || [];
  }

  // Cravings
  async getCravingEntries(
    userId: string,
    startDate: string,
    endDate: string
  ): Promise<StepData[]> {
    const response = await apiClient.request<StepData[]>(
      `cravings8?user_id=eq.${userId}&timestamp=gte.${startDate}&timestamp=lte.${endDate}&order=timestamp.desc`,
      { method: 'GET' }
    );
    if (response.error) throw response.error;
    return response.data || [];
  }

  // Quit Plans
  async getQuitPlan(userId: string): Promise<RewardData> {
    const response = await apiClient.request<RewardData[]>(
      `quit_plans8?user_id=eq.${userId}&order=created_at.desc.limit.1`,
      { method: 'GET' }
    );
    if (response.error) throw response.error;
    if (!response.data?.[0]) throw new Error('Quit plan not found');
    return response.data[0];
  }

  // Cache Management
  clearCache(): void {
    queryClient.clear();
    apiClient.clearCache();
  }

  // Metrics
  getMetrics() {
    return apiClient.getMetrics();
  }

  // Prefetching
  async prefetchUserData(userId: string): Promise<void> {
    const today = new Date();
    const thirtyDaysAgo = new Date();
    thirtyDaysAgo.setDate(today.getDate() - 30);

    const startDate = thirtyDaysAgo.toISOString().split('T')[0];
    const endDate = today.toISOString().split('T')[0];

    // Prefetch common queries
    await Promise.all([
      queryClient.prefetchQuery({
        queryKey: QueryKeys8001.consumptionLogs(userId),
        queryFn: () => this.getConsumptionLogs(userId, startDate, endDate)
      }),
      queryClient.prefetchQuery({
        queryKey: QueryKeys8001.progress(userId),
        queryFn: () => this.getUserProgress(userId, startDate, endDate)
      }),
      queryClient.prefetchQuery({
        queryKey: QueryKeys8001?.cravings(userId),
        queryFn: () => this.getCravingEntries(userId, startDate, endDate)
      }),
      queryClient.prefetchQuery({
        queryKey: QueryKeys8001.quitPlan(userId),
        queryFn: () => this.getQuitPlan(userId)
      })
    ]);
  }

  // Error Boundary Handler
  handleQueryError(error: unknown): void {
    console.error('Query error:', error);
    // Implement error reporting and recovery logic
  }
}

// Export singleton instance
export const queryStore = QueryStore8001.getInstance();
