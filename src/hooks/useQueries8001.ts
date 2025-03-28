import { useQuery, useMutation, UseQueryOptions } from '@tanstack/react-query';
import { queryStore, QueryKeys8001 } from '../store/QueryStore8001';
import { 
  NicotineConsumptionLog, 
  NicotineProduct,
  ProgressEntry,
  StepData,
  RewardData,
  getUserProgress,
  getNicotineConsumptionLogs,
  getNicotineProducts,
  getProductById,
  addNicotineConsumptionLog
} from "../api/apiCompatibility";
import toast from 'react-hot-toast';
import { useState, useCallback } from 'react';
import { SUPABASE_URL, SUPABASE_ANON_KEY } from "../api/apiCompatibility";

// Custom error handling with toast notifications
const useQueryError = () => {
  return {
    onError: (error: unknown) => {
      const message = error instanceof Error ? error.message : 'An error occurred';
      toast.error(message);
      queryStore.handleQueryError(error);
    }
  };
};

// Products
export const useProducts = (category?: string) => {
  const errorHandler = useQueryError();
  
  return useQuery({
    queryKey: [...QueryKeys8001.products, category],
    queryFn: () => queryStore.getProducts(category)
  } as UseQueryOptions<NicotineProduct[], Error>);
};

export const useProductDetails = (productId: string) => {
  const errorHandler = useQueryError();

  return useQuery({
    queryKey: QueryKeys8001.product(productId),
    queryFn: () => queryStore.getProductDetails(productId)
  } as UseQueryOptions<NicotineProduct, Error>);
};

// Consumption Logs
export const useConsumptionLogs = (
  userId: string,
  startDate: string,
  endDate: string
) => {
  const errorHandler = useQueryError();

  return useQuery({
    queryKey: [...QueryKeys8001.consumptionLogs(userId), startDate, endDate],
    queryFn: () => queryStore.getConsumptionLogs(userId, startDate, endDate)
  } as UseQueryOptions<NicotineConsumptionLog[], Error>);
};

export const useAddConsumptionLog = () => {
  const errorHandler = useQueryError();

  return useMutation({
    mutationFn: (log: Omit<NicotineConsumptionLog, 'id' | 'created_at' | 'updated_at'>) =>
      queryStore.addConsumptionLog(log),
    onSuccess: () => {
      toast.success('Consumption log added successfully');
    }
  });
};

// Progress
export const useUserProgress = (
  userId: string,
  startDate: string,
  endDate: string
) => {
  const errorHandler = useQueryError();

  return useQuery({
    queryKey: [...QueryKeys8001.progress(userId), startDate, endDate],
    queryFn: () => queryStore.getUserProgress(userId, startDate, endDate)
  } as UseQueryOptions<ProgressEntry[], Error>);
};

// Cravings
export const useCravingEntries = (
  userId: string,
  startDate: string,
  endDate: string
) => {
  const errorHandler = useQueryError();

  return useQuery({
    queryKey: [...QueryKeys8001?.cravings(userId), startDate, endDate],
    queryFn: () => queryStore.getCravingEntries(userId, startDate, endDate)
  } as UseQueryOptions<StepData[], Error>);
};

// Quit Plan
export const useQuitPlan = (userId: string) => {
  const errorHandler = useQueryError();

  return useQuery({
    queryKey: QueryKeys8001.quitPlan(userId),
    queryFn: () => queryStore.getQuitPlan(userId),
  } as UseQueryOptions<RewardData, Error>);
};

// Utility hook for date-based queries
export interface DateRange {
  startDate: string;
  endDate: string;
}

export const useDateRangeQueries = (
  userId: string,
  dateRange: DateRange
) => {
  const consumptionLogs = useConsumptionLogs(userId, dateRange.startDate, dateRange.endDate);
  const progress = useUserProgress(userId, dateRange.startDate, dateRange.endDate);
  const cravings = useCravingEntries(userId, dateRange.startDate, dateRange.endDate);
  const quitPlan = useQuitPlan(userId);

  const isLoading = consumptionLogs.isPending || progress.isPending || cravings.isPending || quitPlan.isPending;
  const isError = consumptionLogs.isError || progress.isError || cravings.isError || quitPlan.isError;

  return {
    consumptionLogs,
    progress,
    cravings,
    quitPlan,
    isLoading,
    isError,
    // Refetch all queries
    refetch: () => {
      void consumptionLogs.refetch();
      void progress.refetch();
      void cravings.refetch();
      void quitPlan.refetch();
    }
  };
};

// Cache management hook
export const useCacheControl = () => {
  return {
    clearCache: () => {
      queryStore.clearCache();
      toast.success('All cached data has been cleared');
    },
    refreshData: async (userId: string) => {
      await queryStore.prefetchUserData(userId);
      toast.success('Latest data has been fetched');
    }
  };
};
