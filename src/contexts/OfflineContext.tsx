/**
 * Offline Context
 * 
 * Provides offline state and functionality throughout the application
 * Handles offline detection, synchronization, and UI state
 */

import React, { createContext, useContext, useState, useEffect, useCallback } from 'react';

interface SyncItem {
  id: string;
  type: 'health' | 'craving' | 'progress' | 'settings';
  action: 'create' | 'update' | 'delete';
  data: any;
  timestamp: number;
  retryCount: number;
}

interface OfflineContextType {
  isOnline: boolean;
  hasPendingChanges: boolean;
  pendingChangesCount: number;
  isSyncing: boolean;
  lastSyncTime: Date | null;
  addToSyncQueue: (item: Omit<SyncItem, 'timestamp' | 'retryCount'>) => void;
  syncNow: () => Promise<boolean>;
  clearSyncQueue: () => void;
  isOfflineModeEnabled: boolean;
  setOfflineModeEnabled: (enabled: boolean) => void;
  syncPendingChanges: () => Promise<boolean>;
  pendingSyncCount: number;
  syncStatus: 'idle' | 'syncing' | 'error' | 'success';
  syncData?: () => Promise<boolean>;
}

const defaultContext: OfflineContextType = {
  isOnline: true,
  hasPendingChanges: false,
  pendingChangesCount: 0,
  isSyncing: false,
  lastSyncTime: null,
  addToSyncQueue: () => {},
  syncNow: async () => false,
  clearSyncQueue: () => {},
  isOfflineModeEnabled: false,
  setOfflineModeEnabled: () => {},
  syncPendingChanges: async () => false,
  pendingSyncCount: 0,
  syncStatus: 'idle'
};

const OfflineContext = createContext<OfflineContextType>(defaultContext);

export const useOffline = () => useContext(OfflineContext);

export const OfflineProvider: React.FC<{ children: React.ReactNode }> = ({ children }) => {
  const [isOnline, setIsOnline] = useState<boolean>(navigator.onLine);
  const [syncQueue, setSyncQueue] = useState<SyncItem[]>([]);
  const [isSyncing, setIsSyncing] = useState<boolean>(false);
  const [lastSyncTime, setLastSyncTime] = useState<Date | null>(null);
  const [isOfflineModeEnabled, setIsOfflineModeEnabled] = useState<boolean>(
    localStorage.getItem('mission-fresh-offline-mode') === 'true'
  );
  const [syncStatus, setSyncStatus] = useState<'idle' | 'syncing' | 'error' | 'success'>('idle');
  
  // Listen for online/offline status changes
  useEffect(() => {
    const handleOnline = () => {
      setIsOnline(true);
      // Auto-sync when coming back online if there are pending changes
      if (syncQueue.length > 0) {
        syncNow();
      }
    };
    
    const handleOffline = () => {
      setIsOnline(false);
    };
    
    window.addEventListener('online', handleOnline);
    window.addEventListener('offline', handleOffline);
    
    return () => {
      window.removeEventListener('online', handleOnline);
      window.removeEventListener('offline', handleOffline);
    };
  }, [syncQueue]);

  // Save sync queue to localStorage whenever it changes
  useEffect(() => {
    if (syncQueue.length > 0) {
      localStorage.setItem('mission-fresh-sync-queue', JSON.stringify(syncQueue));
    } else {
      localStorage.removeItem('mission-fresh-sync-queue');
    }
  }, [syncQueue]);

  // Load sync queue from localStorage on initial load
  useEffect(() => {
    const savedQueue = localStorage.getItem('mission-fresh-sync-queue');
    if (savedQueue) {
      try {
        const parsedQueue = JSON.parse(savedQueue);
        setSyncQueue(parsedQueue);
      } catch (error) {
        console.error('Error loading sync queue from localStorage', error);
      }
    }
  }, []);

  // Add an item to the sync queue
  const addToSyncQueue = useCallback((item: Omit<SyncItem, 'timestamp' | 'retryCount'>) => {
    const newItem: SyncItem = {
      ...item,
      timestamp: Date.now(),
      retryCount: 0
    };
    
    setSyncQueue(prevQueue => {
      // If this is an update or delete, remove any previous items for the same id
      const filteredQueue = prevQueue.filter(queueItem => 
        !(queueItem.id === item.id && queueItem.type === item.type)
      );
      return [...filteredQueue, newItem];
    });
  }, []);

  // Clear the sync queue
  const clearSyncQueue = useCallback(() => {
    setSyncQueue([]);
    localStorage.removeItem('mission-fresh-sync-queue');
  }, []);

  // Sync all pending changes to the server
  const syncNow = useCallback(async () => {
    if (!isOnline || isSyncing || syncQueue.length === 0) {
      return false;
    }
    
    setIsSyncing(true);
    setSyncStatus('syncing');
    
    try {
      // Clone the queue to avoid race conditions
      const queueToProcess = [...syncQueue];
      const successfulIds: string[] = [];
      const failedItems: SyncItem[] = [];
      
      // Sort the queue by timestamp (oldest first)
      queueToProcess.sort((a, b) => a.timestamp - b.timestamp);
      
      // Group by type for more efficient processing
      const itemsByType = queueToProcess.reduce((acc, item) => {
        if (!acc[item.type]) {
          acc[item.type] = [];
        }
        acc[item.type].push(item);
        return acc;
      }, {} as Record<string, SyncItem[]>);
      
      // Process each type in parallel
      await Promise.all(Object.entries(itemsByType).map(async ([type, items]) => {
        try {
          // This would be replaced with actual API calls
          // For now, we'll simulate API calls with a timeout
          await new Promise(resolve => setTimeout(resolve, 1000));
          
          // In a real implementation, we would call the appropriate API
          // and handle conflicts, errors, etc.
          
          // For this simulation, we'll assume all items were successfully synced
          items.forEach(item => {
            successfulIds.push(`${item.type}_${item.id}`);
          });
        } catch (error) {
          console.error(`Error syncing ${type} items`, error);
          items.forEach(item => {
            const updatedItem: SyncItem = {
              ...item,
              retryCount: item.retryCount + 1
            };
            failedItems.push(updatedItem);
          });
        }
      }));
      
      // Remove successfully synced items and update retry counts for failed items
      setSyncQueue(prevQueue => {
        return prevQueue
          .filter(item => !successfulIds.includes(`${item.type}_${item.id}`))
          .map(item => {
            const failedItem = failedItems.find(
              failed => failed.id === item.id && failed.type === item.type
            );
            return failedItem || item;
          });
      });
      
      setSyncStatus('success');
      setLastSyncTime(new Date());
      return syncQueue.length === successfulIds.length;
    } catch (error) {
      console.error('Error during sync process', error);
      setSyncStatus('error');
      return false;
    } finally {
      setIsSyncing(false);
    }
  }, [isOnline, isSyncing, syncQueue]);

  // Background sync at regular intervals
  useEffect(() => {
    let syncInterval: NodeJS.Timeout;
    
    if (isOnline && syncQueue.length > 0) {
      // Attempt to sync every 5 minutes
      syncInterval = setInterval(() => {
        syncNow();
      }, 5 * 60 * 1000);
    }
    
    return () => {
      if (syncInterval) {
        clearInterval(syncInterval);
      }
    };
  }, [isOnline, syncQueue, syncNow]);

  // Add handler for syncPendingChanges (alias for syncNow)
  const syncPendingChanges = useCallback(async () => {
    return syncNow();
  }, [syncNow]);

  // Handler for setOfflineModeEnabled
  const handleSetOfflineModeEnabled = useCallback((enabled: boolean) => {
    setIsOfflineModeEnabled(enabled);
    localStorage.setItem('mission-fresh-offline-mode', enabled ? 'true' : 'false');
  }, []);

  const value = {
    isOnline,
    hasPendingChanges: syncQueue.length > 0,
    pendingChangesCount: syncQueue.length,
    isSyncing,
    lastSyncTime,
    addToSyncQueue,
    syncNow,
    clearSyncQueue,
    isOfflineModeEnabled,
    setOfflineModeEnabled: handleSetOfflineModeEnabled,
    syncPendingChanges,
    pendingSyncCount: syncQueue.length,
    syncStatus,
    syncData: syncNow
  };

  return (
    <OfflineContext.Provider value={value}>
      {children}
    </OfflineContext.Provider>
  );
}; 