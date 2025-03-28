import { useState, useEffect } from 'react';
import { offlineStorage } from '../services/OfflineStorageService';

export interface OfflineStatusResult {
  isOnline: boolean;
  pendingOperations?: number;
  syncProgress?: {
    total: number;
    completed: number;
  } | null;
  triggerSync?: () => Promise<boolean>;
}

/**
 * Custom hook to track online/offline status and network connectivity
 * Returns offline status information for the app
 */
export const useOfflineStatus = (): OfflineStatusResult => {
  const [isOffline, setIsOffline] = useState<boolean>(!navigator.onLine);
  const [pendingOperations, setPendingOperations] = useState<number>(0);
  const [syncProgress, setSyncProgress] = useState<{total: number, completed: number} | null>(null);

  useEffect(() => {
    // Function to update state based on online/offline status
    const handleOnline = () => setIsOffline(false);
    const handleOffline = () => setIsOffline(true);

    // Register event listeners
    window.addEventListener('online', handleOnline);
    window.addEventListener('offline', handleOffline);

    // Check pending operations if available
    const checkPendingOps = async () => {
      try {
        if (offlineStorage && typeof offlineStorage.getSyncQueueSize === 'function') {
          const size = await offlineStorage.getSyncQueueSize();
          setPendingOperations(size);
        }
      } catch (err) {
        console.error('Error checking pending operations:', err);
      }
    };

    // Run initial check
    checkPendingOps();

    // Set up interval to check regularly
    const interval = setInterval(checkPendingOps, 60000); // Check every minute

    // Cleanup
    return () => {
      window.removeEventListener('online', handleOnline);
      window.removeEventListener('offline', handleOffline);
      clearInterval(interval);
    };
  }, []);

  // Sync function if offlineStorage is available
  const triggerSync = async (): Promise<boolean> => {
    if (isOffline || !offlineStorage || typeof offlineStorage.syncData !== 'function') {
      return false;
    }
    
    try {
      return await offlineStorage.syncData((total, completed) => {
        setSyncProgress({ total, completed });
      });
    } catch (error) {
      console.error('Error triggering sync:', error);
      return false;
    } finally {
      setSyncProgress(null);
    }
  };

  return {
    isOnline: !isOffline,
    pendingOperations,
    syncProgress,
    triggerSync
  };
};

export default useOfflineStatus; 