import { openDB, IDBPDatabase, StoreNames, IDBPObjectStore } from 'idb';

// Database name and version
const DB_NAME = 'missionFreshOfflineDB';
const DB_VERSION = 1;

// Collection names for different data types
const STORES = {
  PROGRESS: 'progress',
  CRAVINGS: 'cravings',
  TASKS: 'tasks',
  LOGS: 'consumptionLogs',
  SYNC_QUEUE: 'syncQueue',
} as const;

// Define database schema type
type DBSchema = {
  [STORES.PROGRESS]: {
    key: string;
    value: OfflineProgressEntry;
    indexes: { 'user_id': string; 'date': string; 'synced': boolean };
  };
  [STORES.CRAVINGS]: {
    key: string;
    value: OfflineCravingEntry;
    indexes: { 'user_id': string; 'timestamp': string; 'synced': boolean };
  };
  [STORES.TASKS]: {
    key: string;
    value: OfflineTaskEntry;
    indexes: { 'user_id': string; 'due_date': string; 'completed': boolean; 'synced': boolean };
  };
  [STORES.LOGS]: {
    key: string;
    value: OfflineConsumptionLog;
    indexes: { 'user_id': string; 'product_id': string; 'timestamp': string; 'synced': boolean };
  };
  [STORES.SYNC_QUEUE]: {
    key: string;
    value: SyncQueueItem;
    indexes: { 'store': string; 'synced': boolean; 'timestamp': string };
  };
};

// Data types for different collections
export interface OfflineProgressEntry {
  id?: string;
  localId?: string;
  user_id: string;
  date: string;
  smoke_free: boolean;
  craving_intensity?: number;
  mood?: string;
  notes?: string;
  symptoms?: string[];
  created_at?: string;
  updated_at?: string;
  synced?: boolean;
  operation?: 'CREATE' | 'UPDATE' | 'DELETE';
}

export interface OfflineCravingEntry {
  id?: string;
  localId?: string;
  user_id: string;
  timestamp: string;
  intensity: number;
  trigger?: string;
  location?: string;
  duration?: number;
  coping_strategy?: string;
  success?: boolean;
  notes?: string;
  synced?: boolean;
  operation?: 'CREATE' | 'UPDATE' | 'DELETE';
}

export interface OfflineTaskEntry {
  id?: string;
  localId?: string;
  user_id: string;
  title: string;
  description?: string;
  due_date?: string;
  completed?: boolean;
  completed_at?: string;
  category?: string;
  priority?: number;
  points?: number;
  synced?: boolean;
  operation?: 'CREATE' | 'UPDATE' | 'DELETE';
}

export interface OfflineConsumptionLog {
  id?: string;
  localId?: string;
  user_id: string;
  product_id: string;
  timestamp: string;
  quantity: number;
  notes?: string;
  synced?: boolean;
  operation?: 'CREATE' | 'UPDATE' | 'DELETE';
}

// Queue item for syncing when online
export interface SyncQueueItem {
  id: string;
  store: string;
  data: OfflineProgressEntry | OfflineCravingEntry | OfflineTaskEntry | OfflineConsumptionLog;
  operation: 'CREATE' | 'UPDATE' | 'DELETE';
  timestamp: string;
  attempts: number;
  synced: boolean;
}

type ProgressCallback = (total: number, completed: number) => void;

class OfflineStorageService {
  private db: IDBPDatabase<DBSchema> | null = null;
  private isOnline: boolean = navigator.onLine;
  private syncInProgress: boolean = false;
  private syncQueue: SyncQueueItem[] = [];
  private offlineStatusListeners: ((isOnline: boolean) => void)[] = [];

  constructor() {
    this.initDB();
    this.setupNetworkListeners();
  }

  // Initialize the IndexedDB database
  private async initDB(): Promise<void> {
    try {
      this.db = await openDB<DBSchema>(DB_NAME, DB_VERSION, {
        upgrade(db: IDBPDatabase<DBSchema>) {
          // Create object stores if they don't exist
          if (!db.objectStoreNames.contains(STORES.PROGRESS)) {
            const progressStore = db.createObjectStore(STORES.PROGRESS, { keyPath: 'localId' });
            progressStore.createIndex('user_id', 'user_id');
            progressStore.createIndex('date', 'date');
            progressStore.createIndex('synced', 'synced');
          }

          if (!db.objectStoreNames.contains(STORES.CRAVINGS)) {
            const cravingsStore = db.createObjectStore(STORES.CRAVINGS, { keyPath: 'localId' });
            cravingsStore.createIndex('user_id', 'user_id');
            cravingsStore.createIndex('timestamp', 'timestamp');
            cravingsStore.createIndex('synced', 'synced');
          }

          if (!db.objectStoreNames.contains(STORES.TASKS)) {
            const tasksStore = db.createObjectStore(STORES.TASKS, { keyPath: 'localId' });
            tasksStore.createIndex('user_id', 'user_id');
            tasksStore.createIndex('due_date', 'due_date');
            tasksStore.createIndex('completed', 'completed');
            tasksStore.createIndex('synced', 'synced');
          }

          if (!db.objectStoreNames.contains(STORES.LOGS)) {
            const logsStore = db.createObjectStore(STORES.LOGS, { keyPath: 'localId' });
            logsStore.createIndex('user_id', 'user_id');
            logsStore.createIndex('product_id', 'product_id');
            logsStore.createIndex('timestamp', 'timestamp');
            logsStore.createIndex('synced', 'synced');
          }

          if (!db.objectStoreNames.contains(STORES.SYNC_QUEUE)) {
            const syncStore = db.createObjectStore(STORES.SYNC_QUEUE, { keyPath: 'id' });
            syncStore.createIndex('store', 'store');
            syncStore.createIndex('synced', 'synced');
            syncStore.createIndex('timestamp', 'timestamp');
          }
        },
      });

      console.log('IndexedDB initialized successfully');
      this.loadSyncQueue();
    } catch (error) {
      console.error('Error initializing IndexedDB:', error);
    }
  }

  // Setup network status listeners
  private setupNetworkListeners(): void {
    window.addEventListener('online', this.handleOnline);
    window.addEventListener('offline', this.handleOffline);
  }

  // Handle going online
  private handleOnline = async (): Promise<void> => {
    console.log('Device is online, starting sync process');
    this.isOnline = true;
    
    // Notify listeners about online status
    this.notifyStatusListeners(true);
    
    // Start sync process
    this.syncData();
  };

  // Handle going offline
  private handleOffline = (): void => {
    console.log('Device is offline, pausing sync process');
    this.isOnline = false;
    
    // Notify listeners about offline status
    this.notifyStatusListeners(false);
    
    this.syncInProgress = false;
  };

  // Notify listeners about network status changes
  private notifyStatusListeners(isOnline: boolean): void {
    this.offlineStatusListeners.forEach(listener => listener(isOnline));
  }

  // Add a listener for network status changes
  public addOfflineStatusListener(listener: (isOnline: boolean) => void): void {
    this.offlineStatusListeners.push(listener);
    // Initialize with current status
    listener(this.isOnline);
  }

  // Remove a network status listener
  public removeOfflineStatusListener(listener: (isOnline: boolean) => void): void {
    this.offlineStatusListeners = this.offlineStatusListeners.filter(l => l !== listener);
  }

  // Get current online status
  public isNetworkOnline(): boolean {
    return this.isOnline;
  }

  // Load sync queue from IndexedDB
  private async loadSyncQueue(): Promise<void> {
    if (!this.db) await this.initDB();
    if (!this.db) {
      console.error('Database not initialized');
      return;
    }

    try {
      // Fix: Use getAll on the store with a query filter instead of getAllFromIndex with an invalid key
      const items = await this.db.getAll(STORES.SYNC_QUEUE);
      // Filter to only get non-synced items
      this.syncQueue = items.filter(item => item.synced === false);
      console.log(`Loaded ${this.syncQueue.length} items to sync queue`);
    } catch (error) {
      console.error('Error loading sync queue:', error);
    }
  }

  // Make addToSyncQueue method public
  public async addToSyncQueue(data: any): Promise<void> {
    try {
      const store = data.type === 'CREATE_TASK' || data.type === 'UPDATE_TASK' || data.type === 'DELETE_TASK' 
        ? STORES.TASKS 
        : STORES.SYNC_QUEUE;
      
      const operation = data.type.startsWith('CREATE') 
        ? 'CREATE' 
        : data.type.startsWith('UPDATE') 
          ? 'UPDATE' 
          : 'DELETE';
      
      await this.addToSyncQueue_internal(store, data.data, operation);
    } catch (error) {
      console.error('Error adding to sync queue:', error);
    }
  }

  // Rename private method to avoid conflict
  private async addToSyncQueue_internal(
    store: string, 
    data: OfflineProgressEntry | OfflineCravingEntry | OfflineTaskEntry | OfflineConsumptionLog, 
    operation: 'CREATE' | 'UPDATE' | 'DELETE'
  ): Promise<void> {
    if (!this.db) await this.initDB();
    if (!this.db) {
      console.error('Database not initialized');
      return;
    }

    const queueItem: SyncQueueItem = {
      id: `${Date.now()}-${Math.random().toString(36).substr(2, 9)}`,
      store,
      data,
      operation,
      timestamp: new Date().toISOString(),
      attempts: 0,
      synced: false,
    };

    try {
      await this.db.add(STORES.SYNC_QUEUE, queueItem);
      this.syncQueue.push(queueItem);
      console.log(`Added item to sync queue: ${store} - ${operation}`);
      
      // If online, try to sync immediately
      if (this.isOnline && !this.syncInProgress) {
        this.syncData();
      }
    } catch (error) {
      console.error('Error adding to sync queue:', error);
    }
  }

  // Generate a local ID
  private generateLocalId(): string {
    return `local_${Date.now()}_${Math.random().toString(36).substr(2, 9)}`;
  }

  // Save progress entry
  public async saveProgress(entry: OfflineProgressEntry): Promise<OfflineProgressEntry> {
    if (!this.db) await this.initDB();
    if (!this.db) throw new Error('Database not initialized');

    // Add local ID if not present
    if (!entry.localId) {
      entry.localId = this.generateLocalId();
    }
    
    // Mark as not synced
    entry.synced = false;
    entry.operation = entry.id ? 'UPDATE' : 'CREATE';
    entry.updated_at = new Date().toISOString();
    
    try {
      await this.db.put(STORES.PROGRESS, entry);
      
      // Add to sync queue
      await this.addToSyncQueue_internal(STORES.PROGRESS, entry, entry.operation);
      
      return entry;
    } catch (error) {
      console.error('Error saving progress entry:', error);
      throw error;
    }
  }

  // Get progress entries
  public async getProgressEntries(userId: string, startDate?: string, endDate?: string): Promise<OfflineProgressEntry[]> {
    if (!this.db) await this.initDB();
    if (!this.db) throw new Error('Database not initialized');

    try {
      const entries = await this.db.getAllFromIndex(STORES.PROGRESS, 'user_id', userId);
      
      if (startDate && endDate) {
        return entries.filter(entry => {
          const entryDate = new Date(entry.date);
          const start = new Date(startDate);
          const end = new Date(endDate);
          return entryDate >= start && entryDate <= end;
        });
      }
      
      return entries;
    } catch (error) {
      console.error('Error getting progress entries:', error);
      throw error;
    }
  }

  // Save craving entry
  public async saveCraving(entry: OfflineCravingEntry): Promise<OfflineCravingEntry> {
    if (!this.db) await this.initDB();
    if (!this.db) throw new Error('Database not initialized');

    // Add local ID if not present
    if (!entry.localId) {
      entry.localId = this.generateLocalId();
    }
    
    // Mark as not synced
    entry.synced = false;
    entry.operation = entry.id ? 'UPDATE' : 'CREATE';
    
    try {
      await this.db.put(STORES.CRAVINGS, entry);
      
      // Add to sync queue
      await this.addToSyncQueue_internal(STORES.CRAVINGS, entry, entry.operation);
      
      return entry;
    } catch (error) {
      console.error('Error saving craving entry:', error);
      throw error;
    }
  }

  // Get craving entries
  public async getCravingEntries(userId: string, startDate?: string, endDate?: string): Promise<OfflineCravingEntry[]> {
    if (!this.db) await this.initDB();
    if (!this.db) throw new Error('Database not initialized');

    try {
      const entries = await this.db.getAllFromIndex(STORES.CRAVINGS, 'user_id', userId);
      
      if (startDate && endDate) {
        return entries.filter(entry => {
          const entryDate = new Date(entry.timestamp);
          const start = new Date(startDate);
          const end = new Date(endDate);
          return entryDate >= start && entryDate <= end;
        });
      }
      
      return entries;
    } catch (error) {
      console.error('Error getting craving entries:', error);
      throw error;
    }
  }

  // Save task entry
  public async saveTask(entry: OfflineTaskEntry): Promise<OfflineTaskEntry> {
    if (!this.db) await this.initDB();
    if (!this.db) throw new Error('Database not initialized');

    // Add local ID if not present
    if (!entry.localId) {
      entry.localId = this.generateLocalId();
    }
    
    // Mark as not synced
    entry.synced = false;
    entry.operation = entry.id ? 'UPDATE' : 'CREATE';
    
    try {
      await this.db.put(STORES.TASKS, entry);
      
      // Add to sync queue
      await this.addToSyncQueue_internal(STORES.TASKS, entry, entry.operation);
      
      return entry;
    } catch (error) {
      console.error('Error saving task entry:', error);
      throw error;
    }
  }

  // Get task entries
  public async getTasks(userId: string, includeCompleted: boolean = true): Promise<OfflineTaskEntry[]> {
    if (!this.db) await this.initDB();
    if (!this.db) throw new Error('Database not initialized');

    try {
      const entries = await this.db.getAllFromIndex(STORES.TASKS, 'user_id', userId);
      
      if (!includeCompleted) {
        return entries.filter(entry => !entry.completed);
      }
      
      return entries;
    } catch (error) {
      console.error('Error getting task entries:', error);
      throw error;
    }
  }

  // Save consumption log
  public async saveConsumptionLog(entry: OfflineConsumptionLog): Promise<OfflineConsumptionLog> {
    if (!this.db) await this.initDB();
    if (!this.db) throw new Error('Database not initialized');

    // Add local ID if not present
    if (!entry.localId) {
      entry.localId = this.generateLocalId();
    }
    
    // Mark as not synced
    entry.synced = false;
    entry.operation = entry.id ? 'UPDATE' : 'CREATE';
    
    try {
      await this.db.put(STORES.LOGS, entry);
      
      // Add to sync queue
      await this.addToSyncQueue_internal(STORES.LOGS, entry, entry.operation);
      
      return entry;
    } catch (error) {
      console.error('Error saving consumption log:', error);
      throw error;
    }
  }

  // Get consumption logs
  public async getConsumptionLogs(userId: string, startDate?: string, endDate?: string): Promise<OfflineConsumptionLog[]> {
    if (!this.db) await this.initDB();
    if (!this.db) throw new Error('Database not initialized');

    try {
      const entries = await this.db.getAllFromIndex(STORES.LOGS, 'user_id', userId);
      
      if (startDate && endDate) {
        return entries.filter(entry => {
          const entryDate = new Date(entry.timestamp);
          const start = new Date(startDate);
          const end = new Date(endDate);
          return entryDate >= start && entryDate <= end;
        });
      }
      
      return entries;
    } catch (error) {
      console.error('Error getting consumption logs:', error);
      throw error;
    }
  }

  // Delete an item from any store
  public async deleteItem(store: string, localId: string, id?: string): Promise<void> {
    if (!this.db) await this.initDB();
    if (!this.db) throw new Error('Database not initialized');

    try {
      // Get the item first
      const item = await this.db.get(store as StoreNames<DBSchema>, localId);
      
      if (!item) {
        throw new Error(`Item not found in ${store} with localId ${localId}`);
      }
      
      // If the item has a server ID, mark for deletion
      if (id) {
        (item as any).operation = 'DELETE';
        (item as any).synced = false;
        await this.db.put(store as StoreNames<DBSchema>, item);
        await this.addToSyncQueue_internal(store, item as any, 'DELETE');
      } else {
        // If it's a local-only item, just delete it
        await this.db.delete(store as StoreNames<DBSchema>, localId);
      }
    } catch (error) {
      console.error(`Error deleting item from ${store}:`, error);
      throw error;
    }
  }

  // Sync data with the server
  public async syncData(progressCallback?: ProgressCallback): Promise<boolean> {
    if (!this.isOnline || this.syncInProgress) {
      return false;
    }

    this.syncInProgress = true;
    
    try {
      // Load sync queue if needed
      if (this.syncQueue.length === 0) {
        await this.loadSyncQueue();
      }
      
      const totalItems = this.syncQueue.length;
      let completedItems = 0;
      
      if (totalItems === 0) {
        this.syncInProgress = false;
        return true;
      }
      
      if (progressCallback) {
        progressCallback(totalItems, completedItems);
      }
      
      // Get items that need syncing, sorted by timestamp
      const itemsToSync = [...this.syncQueue]
        .filter(item => !item.synced)
        .sort((a, b) => new Date(a.timestamp).getTime() - new Date(b.timestamp).getTime());
      
      // Use navigator.connection if available to check connection quality
      let connectionType = 'unknown';
      let isMetered = false;
      let isLowBandwidth = false;
      
      // @ts-ignore - Navigator connection API not in all TS definitions
      if (navigator.connection) {
        // @ts-ignore
        connectionType = navigator.connection.effectiveType || 'unknown';
        // @ts-ignore
        isMetered = navigator.connection.saveData || false;
        // @ts-ignore
        isLowBandwidth = ['slow-2g', '2g'].includes(connectionType);
      }
      
      // Adjust batch size based on connection quality
      let batchSize = 10; // Default batch size
      if (isLowBandwidth || isMetered) {
        batchSize = 3; // Smaller batch for poor connections
      } else if (connectionType === '4g' || connectionType === 'wifi') {
        batchSize = 20; // Larger batch for good connections
      }
      
      // Process items in batches for more efficient sync
      for (let i = 0; i < itemsToSync.length; i += batchSize) {
        if (!this.isOnline) {
          this.syncInProgress = false;
          return false;
        }
        
        const batch = itemsToSync.slice(i, i + batchSize);
        
        // For mobile battery optimization, check if device is on battery and adjust
        // @ts-ignore - Battery API not in all TS definitions
        if (navigator.getBattery) {
          try {
            // @ts-ignore
            const battery = await navigator.getBattery();
            if (!battery.charging && battery.level < 0.2) {
              // If battery is low and not charging, reduce batch size further
              batchSize = Math.min(batchSize, 2);
            }
          } catch (e) {
            console.log('Battery status check failed:', e);
          }
        }
        
        const batchPromises = batch.map(async (item) => {
          try {
            // For debugging in the mobile app
            console.log(`Syncing ${item.operation} operation for ${item.store} item`);
            
            // Simulating API call - in a real implementation, this would be a fetch call
            const endpoint = `${import.meta.env.VITE_SUPABASE_URL}/rest/v1/${item.store}`;
            const token = sessionStorage.getItem('supabase.auth.token') || localStorage.getItem('supabase.auth.token');
            
            let success = false;
            
            // Simulate network latency to show the progress UI (remove in production)
            await new Promise(resolve => setTimeout(resolve, 150));
            
            try {
              if (item.operation === 'CREATE') {
                // In a real implementation:
                // const response = await fetch(endpoint, {
                //   method: 'POST',
                //   headers: {
                //     'Authorization': `Bearer ${token}`,
                //     'apikey': import.meta.env.VITE_SUPABASE_ANON_KEY,
                //     'Content-Type': 'application/json'
                //   },
                //   body: JSON.stringify(item.data)
                // });
                // success = response.ok;
                
                // For now, simulate success
                success = true;
              } else if (item.operation === 'UPDATE') {
                // In a real implementation:
                // const id = item.data.id;
                // const response = await fetch(`${endpoint}?id=eq.${id}`, {
                //   method: 'PATCH',
                //   headers: {
                //     'Authorization': `Bearer ${token}`,
                //     'apikey': import.meta.env.VITE_SUPABASE_ANON_KEY,
                //     'Content-Type': 'application/json',
                //     'Prefer': 'return=minimal'
                //   },
                //   body: JSON.stringify(item.data)
                // });
                // success = response.ok;
                
                // For now, simulate success
                success = true;
              } else if (item.operation === 'DELETE') {
                // In a real implementation:
                // const id = item.data.id;
                // const response = await fetch(`${endpoint}?id=eq.${id}`, {
                //   method: 'DELETE',
                //   headers: {
                //     'Authorization': `Bearer ${token}`,
                //     'apikey': import.meta.env.VITE_SUPABASE_ANON_KEY,
                //     'Prefer': 'return=minimal'
                //   }
                // });
                // success = response.ok;
                
                // For now, simulate success
                success = true;
              }
            } catch (apiError) {
              console.error('API error during sync:', apiError);
              success = false;
            }
            
            if (success) {
              // Mark item as synced in the queue
              item.synced = true;
              await this.db?.put(STORES.SYNC_QUEUE, item);
              
              // Also mark the actual data item as synced
              const localId = item.data.localId;
              if (localId) {
                const storeType = item.store as StoreNames<DBSchema>;
                const dataItem = await this.db?.get(storeType, localId);
                if (dataItem) {
                  (dataItem as any).synced = true;
                  if (item.operation === 'CREATE' && item.data.id) {
                    (dataItem as any).id = item.data.id;
                  }
                  await this.db?.put(storeType, dataItem);
                }
                
                // If it was a delete operation and successful, remove the item
                if (item.operation === 'DELETE' && success) {
                  await this.db?.delete(storeType, localId);
                }
              }
            } else {
              // Increment attempt counter
              item.attempts += 1;
              await this.db?.put(STORES.SYNC_QUEUE, item);
              
              // If too many attempts, mark as failed but still synced
              if (item.attempts >= 5) {
                item.synced = true;
                await this.db?.put(STORES.SYNC_QUEUE, item);
                console.warn(`Sync failed after 5 attempts for item ${item.id}`);
              }
            }
            
            return success;
          } catch (error) {
            console.error('Error syncing item:', error, item);
            
            // Increment attempt counter
            item.attempts += 1;
            await this.db?.put(STORES.SYNC_QUEUE, item);
            
            return false;
          }
        });
        
        // Wait for all items in the batch to complete
        await Promise.all(batchPromises);
        
        // Update progress after each batch
        completedItems += batch.length;
        if (progressCallback) {
          progressCallback(totalItems, completedItems);
        }
        
        // Add a small delay between batches to prevent overwhelming the device
        if (isLowBandwidth || isMetered) {
          await new Promise(resolve => setTimeout(resolve, 500));
        }
      }
      
      // Update the sync queue
      await this.loadSyncQueue();
      
      this.syncInProgress = false;
      
      // Register background sync if supported by the browser
      this.registerBackgroundSync();
      
      return true;
    } catch (error) {
      console.error('Error during sync process:', error);
      this.syncInProgress = false;
      return false;
    }
  }

  // Register for background sync when available (PWA support)
  private registerBackgroundSync(): void {
    // @ts-ignore - ServiceWorker registration API may not be fully typed
    if ('serviceWorker' in navigator && 'SyncManager' in window) {
      navigator.serviceWorker.ready
        .then((registration) => {
          // @ts-ignore
          return registration.sync.register('mission-fresh-sync');
        })
        .catch((err) => {
          console.error('Background sync registration failed:', err);
        });
    }
  }

  // Get sync status
  public async getSyncStatus(): Promise<{ total: number; pending: number; failed: number }> {
    if (!this.db) await this.initDB();
    if (!this.db) throw new Error('Database not initialized');

    try {
      const allItems = await this.db.getAll(STORES.SYNC_QUEUE);
      const pending = allItems.filter(item => !item.synced).length;
      const failed = allItems.filter(item => !item.synced && item.attempts >= 5).length;
      
      return {
        total: allItems.length,
        pending,
        failed,
      };
    } catch (error) {
      console.error('Error getting sync status:', error);
      throw error;
    }
  }

  // Check if there's data that needs to be synced
  public async hasPendingSyncData(): Promise<boolean> {
    const status = await this.getSyncStatus();
    return status.pending > 0;
  }

  // Clear all data (for testing or user logout)
  public async clearAllData(): Promise<void> {
    if (!this.db) await this.initDB();
    if (!this.db) throw new Error('Database not initialized');

    try {
      await this.db.clear(STORES.PROGRESS);
      await this.db.clear(STORES.CRAVINGS);
      await this.db.clear(STORES.TASKS);
      await this.db.clear(STORES.LOGS);
      await this.db.clear(STORES.SYNC_QUEUE);
      
      this.syncQueue = [];
      console.log('All offline data cleared');
    } catch (error) {
      console.error('Error clearing all data:', error);
      throw error;
    }
  }

  // Clean up old sync items
  public async cleanupOldSyncItems(olderThanDays: number = 30): Promise<number> {
    if (!this.db) await this.initDB();
    if (!this.db) throw new Error('Database not initialized');

    try {
      const allItems = await this.db.getAll(STORES.SYNC_QUEUE);
      const cutoffDate = new Date();
      cutoffDate.setDate(cutoffDate.getDate() - olderThanDays);
      
      let deletedCount = 0;
      
      for (const item of allItems) {
        if (item.synced && new Date(item.timestamp) < cutoffDate) {
          await this.db.delete(STORES.SYNC_QUEUE, item.id);
          deletedCount++;
        }
      }
      
      console.log(`Cleaned up ${deletedCount} old sync items`);
      return deletedCount;
    } catch (error) {
      console.error('Error cleaning up old sync items:', error);
      throw error;
    }
  }

  // Dispose event listeners when no longer needed
  public dispose(): void {
    window.removeEventListener('online', this.handleOnline);
    window.removeEventListener('offline', this.handleOffline);
    this.offlineStatusListeners = [];
  }

  // Clear data for a specific user (for logout)
  public async clearUserData(userId: string): Promise<void> {
    if (!this.db) await this.initDB();
    if (!this.db) throw new Error('Database not initialized');

    try {
      // Delete progress data for this user
      const progressTx = this.db.transaction(STORES.PROGRESS, 'readwrite');
      const progressIndex = progressTx.store.index('user_id');
      let progressCursor = await progressIndex.openCursor(userId);
      
      while (progressCursor) {
        await progressCursor.delete();
        progressCursor = await progressCursor.continue();
      }
      
      // Delete cravings data for this user
      const cravingsTx = this.db.transaction(STORES.CRAVINGS, 'readwrite');
      const cravingsIndex = cravingsTx.store.index('user_id');
      let cravingsCursor = await cravingsIndex.openCursor(userId);
      
      while (cravingsCursor) {
        await cravingsCursor.delete();
        cravingsCursor = await cravingsCursor.continue();
      }
      
      // Delete tasks data for this user
      const tasksTx = this.db.transaction(STORES.TASKS, 'readwrite');
      const tasksIndex = tasksTx.store.index('user_id');
      let tasksCursor = await tasksIndex.openCursor(userId);
      
      while (tasksCursor) {
        await tasksCursor.delete();
        tasksCursor = await tasksCursor.continue();
      }
      
      // Delete consumption logs for this user
      const logsTx = this.db.transaction(STORES.LOGS, 'readwrite');
      const logsIndex = logsTx.store.index('user_id');
      let logsCursor = await logsIndex.openCursor(userId);
      
      while (logsCursor) {
        await logsCursor.delete();
        logsCursor = await logsCursor.continue();
      }
      
      console.log(`Cleared all data for user ${userId}`);
    } catch (error) {
      console.error('Error clearing user data:', error);
      throw error;
    }
  }

  // Get storage usage statistics
  public async getStorageStats(): Promise<{ 
    totalItems: number;
    totalSizeKB: number;
    itemsByStore: Record<string, number>;
  }> {
    if (!this.db) await this.initDB();
    if (!this.db) throw new Error('Database not initialized');

    try {
      const stats: { 
        totalItems: number;
        totalSizeKB: number;
        itemsByStore: Record<string, number>;
      } = {
        totalItems: 0,
        totalSizeKB: 0,
        itemsByStore: {}
      };
      
      // Get counts from each store
      const storeNames = Object.values(STORES);
      
      for (const store of storeNames) {
        const items = await this.db.getAll(store);
        stats.itemsByStore[store] = items.length;
        stats.totalItems += items.length;
        
        // Estimate size based on JSON stringification
        let storeSize = 0;
        for (const item of items) {
          storeSize += JSON.stringify(item).length;
        }
        
        stats.totalSizeKB += storeSize / 1024;
      }
      
      stats.totalSizeKB = Math.round(stats.totalSizeKB);
      
      return stats;
    } catch (error) {
      console.error('Error getting storage stats:', error);
      throw error;
    }
  }

  // Add public methods for localStorage-like API
  public async getItem(key: string): Promise<any> {
    try {
      return localStorage.getItem(key) ? JSON.parse(localStorage.getItem(key) || '') : null;
    } catch (error) {
      console.error(`Error getting item from storage for key ${key}:`, error);
      return null;
    }
  }

  public async setItem(key: string, value: any): Promise<void> {
    try {
      localStorage.setItem(key, JSON.stringify(value));
    } catch (error) {
      console.error(`Error setting item in storage for key ${key}:`, error);
    }
  }
}

// Create singleton instance
const offlineStorageService = new OfflineStorageService();

export default offlineStorageService;