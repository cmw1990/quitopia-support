/**
 * useOfflineSync hook
 * 
 * Custom hook for working with offline data synchronization
 * Provides functions and state for tracking offline status and sync progress
 */

import { useState, useEffect, useCallback } from 'react';
import { offlineStorage } from '../services/OfflineStorageService';

interface OfflineSyncState {
  isOffline: boolean;
  isSyncing: boolean;
  syncProgress: number;
  pendingChanges: number;
  failedChanges: number;
  lastSyncTime: Date | null;
}

interface OfflineSyncActions {
  syncNow: () => Promise<boolean>;
  cancelSync: () => void;
  toggleOfflineMode: (enabled: boolean) => void;
  clearFailedItems: () => Promise<void>;
}

/**
 * Hook for managing offline data synchronization
 * 
 * @returns An object containing offline state and sync actions
 */
export function useOfflineSync(): [OfflineSyncState, OfflineSyncActions] {
  const [state, setState] = useState<OfflineSyncState>({
    isOffline: false,
    isSyncing: false,
    syncProgress: 0,
    pendingChanges: 0,
    failedChanges: 0,
    lastSyncTime: null
  });

  // Update sync status from storage service
  const updateSyncStatus = useCallback(async () => {
    const status = await offlineStorage.getSyncStatus();
    const lastSyncTime = offlineStorage.getLastSyncTime();
    
    setState(prevState => ({
      ...prevState,
      pendingChanges: status.pending,
      failedChanges: status.failed,
      lastSyncTime: lastSyncTime > 0 ? new Date(lastSyncTime) : null
    }));
  }, []);

  // Handle changes in offline status
  const handleOfflineStatusChange = useCallback((status: boolean) => {
    setState(prevState => ({
      ...prevState,
      isOffline: status
    }));
    
    // Update sync status when online status changes
    if (!status) {
      updateSyncStatus();
    }
  }, [updateSyncStatus]);

  // Initialize offline status listener
  useEffect(() => {
    // Set initial offline status
    handleOfflineStatusChange(!navigator.onLine);
    
    // Add listener from storage service
    offlineStorage.addOfflineStatusListener(handleOfflineStatusChange);
    
    // Set up interval to regularly update sync status
    const interval = setInterval(updateSyncStatus, 30000);
    
    // Initial update
    updateSyncStatus();
    
    // Clean up on unmount
    return () => {
      offlineStorage.removeOfflineStatusListener(handleOfflineStatusChange);
      clearInterval(interval);
    };
  }, [handleOfflineStatusChange, updateSyncStatus]);

  // Sync action - initiates data synchronization
  const syncNow = useCallback(async (): Promise<boolean> => {
    if (state.isOffline || state.isSyncing) {
      return false;
    }
    
    setState(prevState => ({
      ...prevState,
      isSyncing: true,
      syncProgress: 0
    }));
    
    try {
      const result = await offlineStorage.syncData((total, completed) => {
        const progress = total > 0 ? Math.round((completed / total) * 100) : 100;
        setState(prevState => ({
          ...prevState,
          syncProgress: progress
        }));
      });
      
      // Update status after sync completes
      await updateSyncStatus();
      
      return result;
    } finally {
      setState(prevState => ({
        ...prevState,
        isSyncing: false
      }));
    }
  }, [state.isOffline, state.isSyncing, updateSyncStatus]);

  // Cancel ongoing sync
  const cancelSync = useCallback(() => {
    offlineStorage.cancelSync();
    
    setState(prevState => ({
      ...prevState,
      isSyncing: false
    }));
  }, []);

  // Toggle offline mode
  const toggleOfflineMode = useCallback((enabled: boolean) => {
    offlineStorage.toggleOfflineMode(enabled);
  }, []);

  // Clear failed sync items
  const clearFailedItems = useCallback(async () => {
    if (state.failedChanges > 0) {
      // TODO: Implement this once the service has this capability
      // For now, we could implement a workaround by clearing expired items
      const cleared = await offlineStorage.clearExpiredSyncQueueItems(7 * 24 * 60 * 60 * 1000); // 7 days
      
      if (cleared > 0) {
        updateSyncStatus();
      }
    }
  }, [state.failedChanges, updateSyncStatus]);

  // Return state and actions
  return [
    state,
    {
      syncNow,
      cancelSync,
      toggleOfflineMode,
      clearFailedItems
    }
  ];
} 