import React, { createContext, useContext, useState, useEffect, ReactNode } from 'react';
import { useLocalStorage } from '../hooks/useLocalStorage';
import { toast } from 'sonner';

// Define interface for OfflineContext
interface OfflineContextType {
  isOnline: boolean;
  isOfflineModeEnabled: boolean;
  setOfflineModeEnabled: (enabled: boolean) => void;
  pendingSyncCount: number;
  syncInProgress: boolean;
  lastSyncTime: number | null;
  syncPendingChanges: () => Promise<void>;
  offlineReady: boolean;
}

// Define interface for pending items
interface PendingItem {
  id: string;
  endpoint: string;
  method: string;
  data: any;
  timestamp: number;
}

// Create context with default values
const OfflineContext = createContext<OfflineContextType>({
  isOnline: true,
  isOfflineModeEnabled: false,
  setOfflineModeEnabled: () => {},
  pendingSyncCount: 0,
  syncInProgress: false,
  lastSyncTime: null,
  syncPendingChanges: async () => {},
  offlineReady: false,
});

// Interface for OfflineProvider props
interface OfflineProviderProps {
  children: ReactNode;
}

/**
 * IndexedDB setup for offline storage
 */
const setupIndexedDB = (): Promise<IDBDatabase> => {
  return new Promise((resolve, reject) => {
    if (!window.indexedDB) {
      console.error("Your browser doesn't support IndexedDB");
      reject("IndexedDB not supported");
      return;
    }

    const request = window.indexedDB.open("MissionFreshOfflineDB", 1);
    
    request.onerror = (event) => {
      console.error("IndexedDB error:", event);
      reject("Error opening IndexedDB");
    };
    
    request.onsuccess = (event) => {
      const db = (event.target as IDBOpenDBRequest).result;
      resolve(db);
    };
    
    request.onupgradeneeded = (event) => {
      const db = (event.target as IDBOpenDBRequest).result;
      
      // Create stores for different types of offline data
      if (!db.objectStoreNames.contains("pendingRequests")) {
        db.createObjectStore("pendingRequests", { keyPath: "id" });
      }
      
      if (!db.objectStoreNames.contains("offlineCache")) {
        db.createObjectStore("offlineCache", { keyPath: "url" });
      }
    };
  });
};

/**
 * OfflineProvider component
 * 
 * Manages online/offline state and provides sync functionality
 * Part of Mobile Experience & Offline Mode Enhancement (Priority 2)
 */
export const OfflineProvider: React.FC<OfflineProviderProps> = ({ children }) => {
  // Track online status
  const [isOnline, setIsOnline] = useState<boolean>(navigator.onLine);
  
  // Offline mode preferences
  const [isOfflineModeEnabled, setOfflineModeEnabled] = useLocalStorage('offlineMode', false);
  
  // Sync state
  const [pendingSyncCount, setPendingSyncCount] = useState<number>(0);
  const [syncInProgress, setSyncInProgress] = useState<boolean>(false);
  const [lastSyncTime, setLastSyncTime] = useLocalStorage<number | null>('lastSyncTime', null);
  const [db, setDb] = useState<IDBDatabase | null>(null);
  const [offlineReady, setOfflineReady] = useState<boolean>(false);

  // Initialize IndexedDB
  useEffect(() => {
    setupIndexedDB()
      .then((database) => {
        setDb(database);
        setOfflineReady(true);
        console.log("IndexedDB setup complete");
      })
      .catch((error) => {
        console.error("Failed to set up IndexedDB:", error);
        toast.error("Failed to initialize offline storage");
      });
      
    return () => {
      if (db) {
        db.close();
      }
    };
  }, []);

  // Count pending items on mount and when db changes
  useEffect(() => {
    if (!db) return;
    
    const countPendingItems = () => {
      const transaction = db.transaction(["pendingRequests"], "readonly");
      const store = transaction.objectStore("pendingRequests");
      const countRequest = store.count();
      
      countRequest.onsuccess = () => {
        setPendingSyncCount(countRequest.result);
      };
    };
    
    countPendingItems();
    
    // Set up periodic check for pending items
    const interval = setInterval(countPendingItems, 30000);
    return () => clearInterval(interval);
  }, [db]);

  // Listen for online/offline events
  useEffect(() => {
    const handleOnline = () => {
      setIsOnline(true);
      toast.success("You're back online!");
      
      // Try to sync when coming back online
      if (pendingSyncCount > 0) {
        toast.info(`Syncing ${pendingSyncCount} pending items...`);
        syncPendingChanges();
      }
    };
    
    const handleOffline = () => {
      setIsOnline(false);
      toast.warning("You're offline. Changes will be saved locally.");
    };

    window.addEventListener('online', handleOnline);
    window.addEventListener('offline', handleOffline);

    return () => {
      window.removeEventListener('online', handleOnline);
      window.removeEventListener('offline', handleOffline);
    };
  }, [pendingSyncCount]);

  // Toggle offline mode
  const handleSetOfflineModeEnabled = (enabled: boolean) => {
    setOfflineModeEnabled(enabled);
    if (enabled) {
      toast.info("Offline mode enabled. Data will be stored locally.");
    } else {
      toast.info("Offline mode disabled.");
      if (isOnline && pendingSyncCount > 0) {
        syncPendingChanges();
      }
    }
  };

  // Add a request to the pending queue
  const addPendingRequest = (endpoint: string, method: string, data: any): Promise<void> => {
    return new Promise((resolve, reject) => {
      if (!db) {
        reject("IndexedDB not initialized");
        return;
      }
      
      const pendingItem: PendingItem = {
        id: `${Date.now()}-${Math.random().toString(36).substr(2, 9)}`,
        endpoint,
        method,
        data,
        timestamp: Date.now()
      };
      
      const transaction = db.transaction(["pendingRequests"], "readwrite");
      const store = transaction.objectStore("pendingRequests");
      const request = store.add(pendingItem);
      
      request.onsuccess = () => {
        setPendingSyncCount(prev => prev + 1);
        resolve();
      };
      
      request.onerror = () => {
        reject("Failed to store pending request");
      };
    });
  };

  // Sync function - process all pending requests
  const syncPendingChanges = async (): Promise<void> => {
    if (!isOnline || syncInProgress || pendingSyncCount === 0 || !db) {
      return;
    }

    setSyncInProgress(true);

    try {
      const transaction = db.transaction(["pendingRequests"], "readwrite");
      const store = transaction.objectStore("pendingRequests");
      const getAllRequest = store.getAll();
      
      getAllRequest.onsuccess = async () => {
        const pendingItems: PendingItem[] = getAllRequest.result;
        let successCount = 0;
        
        // Process each pending request
        for (const item of pendingItems) {
          try {
            // Perform actual API request
            const response = await fetch(item.endpoint, {
              method: item.method,
              headers: {
                'Content-Type': 'application/json'
              },
              body: item.method !== 'GET' ? JSON.stringify(item.data) : undefined
            });
            
            if (response.ok) {
              // Delete from queue if successful
              store.delete(item.id);
              successCount++;
            } else {
              console.error(`Failed to sync item ${item.id}: ${response.statusText}`);
            }
          } catch (error) {
            console.error(`Error processing sync for item ${item.id}:`, error);
          }
        }
        
        // Update sync state
        const newPendingCount = pendingSyncCount - successCount;
        setPendingSyncCount(newPendingCount);
        setLastSyncTime(Date.now());
        
        if (successCount > 0) {
          toast.success(`Synced ${successCount} items successfully`);
        }
        
        if (newPendingCount > 0) {
          toast.warning(`${newPendingCount} items failed to sync and will retry later`);
        }
      };
      
      getAllRequest.onerror = () => {
        throw new Error("Failed to retrieve pending items");
      };
      
    } catch (error) {
      console.error('Sync failed:', error);
      toast.error("Sync failed. Will try again later.");
    } finally {
      setSyncInProgress(false);
    }
  };

  // Context value
  const value: OfflineContextType = {
    isOnline,
    isOfflineModeEnabled,
    setOfflineModeEnabled: handleSetOfflineModeEnabled,
    pendingSyncCount,
    syncInProgress,
    lastSyncTime,
    syncPendingChanges,
    offlineReady
  };

  return (
    <OfflineContext.Provider value={value}>
      {children}
    </OfflineContext.Provider>
  );
};

// Custom hook to use offline context
export const useOffline = (): OfflineContextType => {
  const context = useContext(OfflineContext);
  
  if (context === undefined) {
    throw new Error('useOffline must be used within an OfflineProvider');
  }
  
  return context;
}; 