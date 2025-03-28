import { DBSchema } from 'idb';

/**
 * Types for offline storage functionality
 */

// Sync queue item interface
export interface SyncQueueItem {
  id: string;
  table: string;
  operation: 'create' | 'update' | 'delete';
  url: string;
  data?: any;
  method: string;
  headers?: Record<string, string>;
  timestamp: string;
  retries: number;
}

// Stored data with expiration
export interface StoredData<T> {
  value: T;
  expiresAt: number;
  timestamp: number;
}

// Health data record
export interface HealthDataRecord {
  id: string;
  type: 'mood' | 'energy' | 'focus' | 'craving';
  timestamp: number;
  userId: string;
  score: number;
  notes?: string;
  user_entered?: boolean;
}

// Progress data record
export interface ProgressDataRecord {
  id: string;
  date: string;
  userId: string;
  achievements?: string[];
  milestones?: string[];
  metrics?: Record<string, number>;
}

// Options for offline storage operations
export interface OfflineStorageOptions {
  expiresIn?: number;
}

// Sync metadata
export interface SyncMetadata {
  lastSyncTime: number;
  syncStatus: 'idle' | 'in-progress' | 'failed';
  errorDetails?: string;
}

// Database schema for IndexedDB
export interface MissionFreshOfflineDB {
  syncQueue: {
    key: string;
    value: SyncQueueItem;
    indexes: {
      'by-table': string;
      'by-timestamp': string;
    };
  };
  offlineData: {
    key: string;
    value: StoredData<any>;
  };
  healthData: {
    key: string;
    value: HealthDataRecord;
    indexes: {
      'by-type': string;
      'by-timestamp': number;
      'by-user': string;
    };
  };
  progressData: {
    key: string;
    value: ProgressDataRecord;
    indexes: {
      'by-date': string;
      'by-user': string;
    };
  };
  syncMetadata: {
    key: string;
    value: SyncMetadata;
  };
} 