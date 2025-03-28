import { offlineStorage } from './OfflineStorageService';

// Define types for backward compatibility
export interface ProgressEntry {
  id?: string;
  localId?: string;
  user_id: string;
  date: string;
  notes?: string;
  symptoms?: string[];
  mood?: string;
  smoke_free?: boolean;
  created_at?: string;
  synced?: boolean;
}

// This provides a default export to match old import patterns
// for code that imports offlineStorageService directly
// It's a temporary solution to avoid breaking changes
const offlineStorageService = {
  // Core storage methods
  getItem: offlineStorage.getItem.bind(offlineStorage),
  setItem: offlineStorage.setItem.bind(offlineStorage),
  removeItem: offlineStorage.removeItem.bind(offlineStorage),
  
  // Status methods
  isOfflineModeEnabled: offlineStorage.isOfflineModeEnabled.bind(offlineStorage),
  toggleOfflineMode: offlineStorage.toggleOfflineMode.bind(offlineStorage),
  setOfflineModeEnabled: offlineStorage.toggleOfflineMode.bind(offlineStorage),
  isNetworkOnline: () => navigator.onLine,
  addOfflineStatusListener: offlineStorage.addOfflineStatusListener.bind(offlineStorage),
  removeOfflineStatusListener: offlineStorage.removeOfflineStatusListener.bind(offlineStorage),
  
  // Sync methods  
  syncData: offlineStorage.syncData.bind(offlineStorage),
  getSyncStatus: offlineStorage.getSyncStatus.bind(offlineStorage),
  addToSyncQueue: offlineStorage.addToSyncQueue.bind(offlineStorage),
  getSyncQueueSize: offlineStorage.getSyncQueueSize.bind(offlineStorage),
  hasPendingSyncData: async () => {
    const size = await offlineStorage.getSyncQueueSize();
    return size > 0;
  },
  
  // For compatibility with old code
  syncPendingChanges: async () => offlineStorage.syncData(),
  clearOfflineData: async () => offlineStorage.clearAllData(),
  clearAllData: offlineStorage.clearAllData.bind(offlineStorage),
  resetDatabase: offlineStorage.resetDatabase.bind(offlineStorage),
  
  // Stub methods for old code
  getProgressEntries: async (userId: string, startDate?: string, endDate?: string): Promise<ProgressEntry[]> => [],
  saveProgress: async (data: ProgressEntry): Promise<ProgressEntry> => data,
  getConsumptionLogs: async (userId: string, startDate?: string, endDate?: string): Promise<any[]> => [],
  saveConsumptionLog: async (data: any) => data,
  getCravingEntries: async (userId: string, startDate?: string, endDate?: string): Promise<any[]> => [],
  saveCraving: async (data: any) => data,
  getTasks: async (userId: string, includeCompleted?: boolean): Promise<any[]> => [],
  saveTask: async (data: any) => data,
  deleteItem: async (tableName: string, id: string): Promise<boolean> => true,
  clearAllTables: async (): Promise<void> => {},
};

export default offlineStorageService; 