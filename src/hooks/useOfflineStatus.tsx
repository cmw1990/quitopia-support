import { useEffect, useState } from 'react';
import { offlineStorage } from '../services/OfflineStorageService';
import { useOffline } from '../contexts/OfflineContext';

export interface SyncProgress {
  total: number;
  completed: number;
}

/**
 * Custom hook for checking offline status and managing data sync.
 */
export const useOfflineStatus = () => {
  const { isOnline, pendingOperations, syncStatus, syncData } = useOffline();
  const [syncProgress, setSyncProgress] = useState<SyncProgress | null>(null);

  // Update local state when syncStatus changes
  useEffect(() => {
    if (syncStatus.inProgress) {
      setSyncProgress({
        total: syncStatus.total,
        completed: syncStatus.completed
      });
    } else if (syncProgress) {
      // Clear sync progress when sync is complete
      setSyncProgress(null);
    }
  }, [syncStatus, syncProgress]);

  // Trigger sync when coming back online
  useEffect(() => {
    if (isOnline && pendingOperations > 0 && !syncStatus.inProgress) {
      triggerSync();
    }
  }, [isOnline, pendingOperations]);

  /**
   * Manually trigger data synchronization.
   */
  const triggerSync = async (): Promise<boolean> => {
    if (!isOnline) {
      return false;
    }
    
    try {
      return await syncData();
    } catch (error) {
      console.error('Error triggering sync:', error);
      return false;
    }
  };

  return {
    isOnline,
    syncProgress,
    pendingOperations,
    triggerSync
  };
};

// For backward compatibility
export default useOfflineStatus; 