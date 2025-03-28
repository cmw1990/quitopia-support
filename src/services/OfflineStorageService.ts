/**
 * Enhanced Offline Storage Service
 * - Improved conflict detection and resolution
 * - Better merge strategies for different data types
 * - Enhanced sync queue management
 */

import { openDB, deleteDB, IDBPDatabase } from 'idb';
import { MissionFreshOfflineDB, SyncQueueItem, OfflineStorageOptions } from '../types/offlineTypes';

// Database name and version
const DB_NAME = 'missionFreshOffline';
const DB_VERSION = 2; // Increased version to handle schema upgrades

// Cache expiration time for offline data (24 hours)
const CACHE_EXPIRATION_TIME = 24 * 60 * 60 * 1000;

// Helper class for managing offline data
export class OfflineStorageService {
  private db: IDBPDatabase<MissionFreshOfflineDB> | null = null;
  private syncQueue: Array<SyncQueueItem> = [];
  private offlineListeners: Array<(status: boolean) => void> = [];
  private isOffline: boolean = false;
  private offlineModeEnabled: boolean = true;
  private syncAbortController: AbortController | null = null;
  private lastSyncTime: number = 0;
  
  constructor() {
    this.initDB();
    this.monitorConnectivity();
  }
  
  // Monitor connectivity status
  private monitorConnectivity(): void {
    window.addEventListener('online', () => {
      this.isOffline = false;
      this.offlineListeners.forEach(listener => listener(false));
      // Add a small delay before syncing to allow network to stabilize
      setTimeout(() => this.syncData(), 1500);
    });
    
    window.addEventListener('offline', () => {
      this.isOffline = true;
      this.offlineListeners.forEach(listener => listener(true));
      // If there's an ongoing sync, abort it
      if (this.syncAbortController) {
        this.syncAbortController.abort();
        this.syncAbortController = null;
      }
    });
    
    // Check initial status
    this.isOffline = !navigator.onLine;
  }
  
  // Initialize the database
  private async initDB(): Promise<void> {
    try {
      this.db = await openDB<MissionFreshOfflineDB>(DB_NAME, DB_VERSION, {
        upgrade(db, oldVersion, newVersion, transaction) {
          // Create stores if they don't exist
          if (!db.objectStoreNames.contains('syncQueue')) {
            const syncQueueStore = db.createObjectStore('syncQueue', { keyPath: 'id' });
            syncQueueStore.createIndex('by-table', 'table');
            syncQueueStore.createIndex('by-timestamp', 'timestamp');
          }
          
          if (!db.objectStoreNames.contains('offlineData')) {
            db.createObjectStore('offlineData');
          }
          
          // Added in version 2: stores for different data types with their own schemas
          if (oldVersion < 2) {
            if (!db.objectStoreNames.contains('healthData')) {
              const healthStore = db.createObjectStore('healthData', { keyPath: 'id' });
              healthStore.createIndex('by-type', 'type');
              healthStore.createIndex('by-timestamp', 'timestamp');
              healthStore.createIndex('by-user', 'userId');
            }
            
            if (!db.objectStoreNames.contains('progressData')) {
              const progressStore = db.createObjectStore('progressData', { keyPath: 'id' });
              progressStore.createIndex('by-date', 'date');
              progressStore.createIndex('by-user', 'userId');
            }
            
            if (!db.objectStoreNames.contains('syncMetadata')) {
              db.createObjectStore('syncMetadata');
            }
          }
        }
      });
      
      console.log('Offline database initialized');
      
      // Load sync queue into memory for faster access
      await this.loadSyncQueue();
    } catch (error) {
      console.error('Error initializing offline database:', error);
    }
  }
  
  // Load sync queue items into memory
  private async loadSyncQueue(): Promise<void> {
    try {
      const db = await this.getDatabase();
      const items = await db.getAll('syncQueue');
      this.syncQueue = items;
    } catch (error) {
      console.error('Error loading sync queue:', error);
    }
  }
  
  // Get database instance, initializing if necessary
  private async getDatabase(): Promise<IDBPDatabase<MissionFreshOfflineDB>> {
    if (!this.db) {
      await this.initDB();
    }
    
    if (!this.db) {
      throw new Error('Failed to initialize the database');
    }
    
    return this.db;
  }
  
  // Check if offline mode is enabled
  public isOfflineModeEnabled(): boolean {
    return this.offlineModeEnabled;
  }
  
  // Toggle offline mode
  public toggleOfflineMode(enabled: boolean): void {
    this.offlineModeEnabled = enabled;
    
    // If going online and there are pending items, try to sync
    if (enabled === false && !this.isOffline && this.syncQueue.length > 0) {
      this.syncData();
    }
  }
  
  // Reset the database (mainly for debugging/testing)
  public async resetDatabase(): Promise<void> {
    // Abort any ongoing sync
    if (this.syncAbortController) {
      this.syncAbortController.abort();
      this.syncAbortController = null;
    }
    
    // Delete the database
    await deleteDB(DB_NAME);
    
    // Re-initialize
    this.db = null;
    this.syncQueue = [];
    await this.initDB();
    
    console.log('Offline database reset');
  }
  
  // Clear all data stored
  public async clearAllData(): Promise<void> {
    const db = await this.getDatabase();
    
    // Clear all stores
    const tx1 = db.transaction('syncQueue', 'readwrite');
    await tx1.objectStore('syncQueue').clear();
    
    const tx2 = db.transaction('offlineData', 'readwrite');
    await tx2.objectStore('offlineData').clear();
    
    if (db.objectStoreNames.contains('healthData')) {
      const tx3 = db.transaction('healthData', 'readwrite');
      await tx3.objectStore('healthData').clear();
    }
    
    if (db.objectStoreNames.contains('progressData')) {
      const tx4 = db.transaction('progressData', 'readwrite');
      await tx4.objectStore('progressData').clear();
    }
    
    // Reset sync queue in memory
    this.syncQueue = [];
    
    console.log('All offline data cleared');
  }

  // Get item from offline storage
  public async getItem<T>(key: string): Promise<T | null> {
    try {
      const db = await this.getDatabase();
      
      const transaction = db.transaction('offlineData', 'readonly');
      const store = transaction.objectStore('offlineData');
      const data = await store.get(key);
      
      // Check if data is expired
      if (data && data.expiresAt && data.expiresAt < Date.now()) {
        // Data is expired, remove it
        const txDelete = db.transaction('offlineData', 'readwrite');
        await txDelete.objectStore('offlineData').delete(key);
        return null;
      }
      
      return data?.value || null;
    } catch (error) {
      console.error('Error getting item from offline storage:', error);
      return null;
    }
  }

  // Set item in offline storage
  public async setItem<T>(key: string, value: T, options?: { expiresIn?: number }): Promise<boolean> {
    try {
      const db = await this.getDatabase();
      
      const expiresAt = options?.expiresIn ? Date.now() + options.expiresIn : Date.now() + CACHE_EXPIRATION_TIME;
      
      const transaction = db.transaction('offlineData', 'readwrite');
      const store = transaction.objectStore('offlineData');
      await store.put({
        value,
        expiresAt,
        timestamp: Date.now()
      }, key);
      
      return true;
    } catch (error) {
      console.error('Error setting item in offline storage:', error);
      return false;
    }
  }

  // Remove item from offline storage
  public async removeItem(key: string): Promise<boolean> {
    try {
      const db = await this.getDatabase();
      
      const transaction = db.transaction('offlineData', 'readwrite');
      const store = transaction.objectStore('offlineData');
      await store.delete(key);
      
      return true;
    } catch (error) {
      console.error('Error removing item from offline storage:', error);
      return false;
    }
  }

  // Add offline status listener
  public addOfflineStatusListener(callback: (status: boolean) => void): void {
    this.offlineListeners.push(callback);
    // Call immediately with current status
    callback(this.isOffline);
  }

  // Remove offline status listener
  public removeOfflineStatusListener(callback: (status: boolean) => void): void {
    this.offlineListeners = this.offlineListeners.filter(listener => listener !== callback);
  }

  // Get sync status
  public async getSyncStatus(): Promise<{ pending: number, total: number, failed: number }> {
    try {
      // Use in-memory queue for faster access
      const failedItems = this.syncQueue.filter(item => (item.retries || 0) > 3);
      
      return {
        pending: this.syncQueue.length,
        total: this.syncQueue.length,
        failed: failedItems.length
      };
    } catch (error) {
      console.error('Error getting sync status:', error);
      return { pending: 0, total: 0, failed: 0 };
    }
  }
  
  // Check for conflicts between local and remote data
  private async checkForConflicts(item: SyncQueueItem, remoteData: any): Promise<boolean> {
    // Skip conflict check for delete operations
    if (item.method === 'DELETE') {
      return false;
    }
    
    // Skip if we don't have proper timestamps or IDs
    if (!item.data?.id || !item.timestamp || !remoteData?.updated_at) {
      return false;
    }
    
    // Compare timestamps to see if remote data has been updated since local changes
    const localTimestamp = new Date(item.timestamp).getTime();
    const remoteTimestamp = new Date(remoteData.updated_at).getTime();
    
    // If remote data is newer, we have a conflict
    return remoteTimestamp > localTimestamp;
  }
  
  // Merge local and remote data (strategy depends on data type)
  private mergeData(local: any, remote: any, entityType: string): any {
    // Basic merge: keep newer values for each field, prioritizing remote values
    const merged = { ...local, ...remote };
    
    // Special handling for specific entity types
    switch (entityType) {
      case 'health':
        // For health data, prioritize user entries over system-generated ones
        if (local.user_entered && !remote.user_entered) {
          merged.score = local.score;
          merged.notes = local.notes;
        }
        break;
        
      case 'progress':
        // For progress data, combine achievements
        if (local.achievements && remote.achievements) {
          merged.achievements = [...new Set([...local.achievements, ...remote.achievements])];
        }
        break;
        
      case 'craving':
        // For craving logs, keep user-entered intensity
        if (local.intensity && (!remote.intensity || local.intensity > remote.intensity)) {
          merged.intensity = local.intensity;
        }
        break;
    }
    
    // Keep the newer timestamp
    merged.updated_at = new Date().toISOString();
    
    return merged;
  }

  // Synchronize data with the server
  public async syncData(progressCallback?: (total: number, completed: number) => void): Promise<boolean> {
    if (this.isOffline) {
      return false;
    }
    
    // If sync is already in progress, return
    if (this.syncAbortController) {
      return false;
    }

    try {
      // Create abort controller for this sync session
      this.syncAbortController = new AbortController();
      const signal = this.syncAbortController.signal;
      
      // Get a fresh copy of the sync queue
      await this.loadSyncQueue();
      
      if (this.syncQueue.length === 0) {
        this.syncAbortController = null;
        this.lastSyncTime = Date.now();
        return true;
      }
      
      // Sort by timestamp (oldest first)
      this.syncQueue.sort((a, b) => new Date(a.timestamp).getTime() - new Date(b.timestamp).getTime());
      
      let completed = 0;
      let hasErrors = false;
      
      // Call initial progress callback
      if (progressCallback) {
        progressCallback(this.syncQueue.length, completed);
      }
      
      // Group operations by entity to handle dependencies
      const groupedOperations: Record<string, SyncQueueItem[]> = {};
      this.syncQueue.forEach(item => {
        const key = `${item.table}-${item.data?.id || 'unknown'}`;
        if (!groupedOperations[key]) {
          groupedOperations[key] = [];
        }
        groupedOperations[key].push(item);
      });
      
      // Process groups sequentially
      for (const key of Object.keys(groupedOperations)) {
        const items = groupedOperations[key];
        
        // Skip if signal is aborted
        if (signal.aborted) {
          console.log('Sync aborted');
          this.syncAbortController = null;
          return false;
        }
        
        // If there are multiple operations on the same entity, only perform the latest
        const latestItem = items[items.length - 1];
        
        try {
          // Skip items with too many retries
          if ((latestItem.retries || 0) > 3) {
            completed += items.length;
            if (progressCallback) {
              progressCallback(this.syncQueue.length, completed);
            }
            continue;
          }
          
          // Fetch latest remote data for conflict checking
          let remoteData;
          let hasConflict = false;
          
          if (latestItem.method !== 'POST' && latestItem.data?.id) {
            try {
              const response = await fetch(`${latestItem.url}/${latestItem.data.id}`, {
                method: 'GET',
                headers: latestItem.headers || { 'Content-Type': 'application/json' },
                signal
              });
              
              if (response.ok) {
                remoteData = await response.json();
                
                // Check for conflicts
                hasConflict = await this.checkForConflicts(latestItem, remoteData);
                
                if (hasConflict) {
                  // Merge data and update
                  const mergedData = this.mergeData(
                    latestItem.data, 
                    remoteData, 
                    latestItem.table
                  );
                  
                  // Update item with merged data
                  latestItem.data = mergedData;
                }
              }
            } catch (error) {
              // Ignore fetch errors for conflict check
              console.warn('Error checking conflicts:', error);
            }
          }
          
          // Perform the actual operation
          const response = await fetch(latestItem.url || '', {
            method: latestItem.method || 'POST',
            headers: latestItem.headers || { 'Content-Type': 'application/json' },
            body: JSON.stringify(latestItem.data),
            signal
          });
          
          if (response.ok) {
            // Remove all items for this entity from sync queue on success
            const db = await this.getDatabase();
            const tx = db.transaction('syncQueue', 'readwrite');
            for (const item of items) {
              await tx.objectStore('syncQueue').delete(item.id);
            }
            
            // Update in-memory queue
            this.syncQueue = this.syncQueue.filter(item => !items.includes(item));
          } else {
            // Increment retry count for the failed item
            const db = await this.getDatabase();
            latestItem.retries = (latestItem.retries || 0) + 1;
            await db.put('syncQueue', latestItem);
            
            // Update in-memory queue
            const index = this.syncQueue.findIndex(item => item.id === latestItem.id);
            if (index !== -1) {
              this.syncQueue[index] = latestItem;
            }
            
            hasErrors = true;
          }
        } catch (error) {
          if (signal.aborted) {
            console.log('Sync aborted');
            this.syncAbortController = null;
            return false;
          }
          
          console.error(`Error syncing item ${latestItem.id}:`, error);
          
          // Increment retry count
          const db = await this.getDatabase();
          latestItem.retries = (latestItem.retries || 0) + 1;
          await db.put('syncQueue', latestItem);
          
          // Update in-memory queue
          const index = this.syncQueue.findIndex(item => item.id === latestItem.id);
          if (index !== -1) {
            this.syncQueue[index] = latestItem;
          }
          
          hasErrors = true;
        }
        
        completed += items.length;
        if (progressCallback) {
          progressCallback(this.syncQueue.length, completed);
        }
      }
      
      // Update last sync time
      this.lastSyncTime = Date.now();
      
      // Clear abort controller
      this.syncAbortController = null;
      
      return !hasErrors;
    } catch (error) {
      console.error('Error syncing data:', error);
      
      // Clear abort controller
      this.syncAbortController = null;
      
      return false;
    }
  }
  
  // Cancel ongoing sync
  public cancelSync(): void {
    if (this.syncAbortController) {
      this.syncAbortController.abort();
      this.syncAbortController = null;
    }
  }

  // Get last sync time
  public getLastSyncTime(): number {
    return this.lastSyncTime;
  }

  // Add to sync queue with improved capabilities
  public async addToSyncQueue(
    table: string, 
    operation: 'create' | 'update' | 'delete',
    item: {
      type: string;
      url: string;
      data?: any;
      method: string;
      headers?: Record<string, string>;
    }
  ): Promise<string> {
    try {
      const db = await this.getDatabase();
      
      // Generate unique ID
      const id = `${table}-${item.data?.id || Date.now()}-${Math.random().toString(36).substring(2, 15)}`;
      
      const queueItem: SyncQueueItem = {
        id,
        table,
        operation,
        url: item.url,
        data: item.data,
        method: item.method,
        headers: item.headers,
        timestamp: new Date().toISOString(),
        retries: 0
      };
      
      // Add to database
      await db.put('syncQueue', queueItem);
      
      // Add to in-memory queue
      this.syncQueue.push(queueItem);
      
      return id;
    } catch (error) {
      console.error('Error adding to sync queue:', error);
      throw error;
    }
  }

  // Get sync queue size
  public async getSyncQueueSize(): Promise<number> {
    // Use in-memory queue for performance
    return this.syncQueue.length;
  }
  
  // Get expired sync queue items (for cleanup)
  public async getExpiredSyncQueueItems(maxAge: number = 30 * 24 * 60 * 60 * 1000): Promise<SyncQueueItem[]> {
    try {
      const db = await this.getDatabase();
      const items = await db.getAll('syncQueue');
      
      const now = Date.now();
      return items.filter(item => {
        const timestamp = new Date(item.timestamp).getTime();
        return now - timestamp > maxAge;
      });
    } catch (error) {
      console.error('Error getting expired sync queue items:', error);
      return [];
    }
  }
  
  // Clear expired sync queue items
  public async clearExpiredSyncQueueItems(maxAge: number = 30 * 24 * 60 * 60 * 1000): Promise<number> {
    try {
      const expiredItems = await this.getExpiredSyncQueueItems(maxAge);
      
      if (expiredItems.length === 0) {
        return 0;
      }
      
      const db = await this.getDatabase();
      const tx = db.transaction('syncQueue', 'readwrite');
      
      let count = 0;
      for (const item of expiredItems) {
        await tx.objectStore('syncQueue').delete(item.id);
        count++;
      }
      
      // Update in-memory queue
      this.syncQueue = this.syncQueue.filter(item => 
        !expiredItems.some(expiredItem => expiredItem.id === item.id)
      );
      
      return count;
    } catch (error) {
      console.error('Error clearing expired sync queue items:', error);
      return 0;
    }
  }
}

// Create singleton instance
export const offlineStorage = new OfflineStorageService(); 