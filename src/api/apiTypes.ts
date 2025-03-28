import { Session } from '@supabase/supabase-js';

export interface APIError extends Error {
  status?: number;
  code?: string;
  details?: unknown;
}

export interface APIResponse<T> {
  data: T | null;
  error: APIError | null;
  metadata?: {
    requestId: string;
    timestamp: string;
    processingTime: number;
  };
}

export interface RetryConfig {
  maxRetries: number;
  initialDelay: number;
  maxDelay: number;
  backoffFactor: number;
}

export interface APIClientConfig {
  baseUrl: string;
  version: '8';  // SSOT8001 version
  timeout: number;
  retry?: RetryConfig;
  enableMetrics?: boolean;
}

export interface APIMetrics {
  requestDuration: number;
  requestSize: number;
  responseSize: number;
  cacheHit: boolean;
  retryCount: number;
}

export interface APIRequestOptions {
  method?: string;
  headers?: Record<string, string>;
  body?: any;
  timeout?: number;
  retry?: Partial<RetryConfig>;
  skipCache?: boolean;
  priority?: 'high' | 'normal' | 'low';
  signal?: AbortSignal;
}

export interface APIClientInterface {
  request<T>(endpoint: string, options?: APIRequestOptions): Promise<APIResponse<T>>;
  setSession(session: Session | null): void;
  clearCache(): Promise<void>;
  getMetrics(): APIMetrics[];
}

// SSOT8001 Table Interfaces
export interface Table8Base {
  id: string;
  created_at?: string;
  updated_at?: string;
}

export interface WithMetadata {
  _ssot8001?: {
    version: string;
    lastSync: string;
    checksum: string;
  };
}

// Enhanced type for retry strategies
export type RetryStrategy = 
  | 'linear'
  | 'exponential'
  | 'fibonacci'
  | {
      type: 'custom';
      getDelay: (attempt: number, error: APIError) => number;
    };

// Enhanced error categories following SSOT8001
export enum ErrorCategory8001 {
  NETWORK = 'NETWORK',
  AUTH = 'AUTH',
  VALIDATION = 'VALIDATION',
  RESOURCE = 'RESOURCE',
  RATE_LIMIT = 'RATE_LIMIT',
  SERVER = 'SERVER',
  UNKNOWN = 'UNKNOWN'
}

// Circuit breaker states
export enum CircuitState {
  CLOSED = 'CLOSED',
  HALF_OPEN = 'HALF_OPEN',
  OPEN = 'OPEN'
}

// Enhanced offline synchronization types
export interface SyncOperation extends Table8Base {
  operation: 'CREATE' | 'UPDATE' | 'DELETE';
  table: string;
  payload: unknown;
  status: 'PENDING' | 'IN_PROGRESS' | 'COMPLETED' | 'FAILED';
  retryCount: number;
  errorDetails?: string;
  priority: number;
}

// Cache management types
export interface CacheConfig {
  ttl: number;
  maxSize: number;
  strategy: 'LRU' | 'LFU' | 'FIFO';
}

// Monitoring and analytics
export interface PerformanceMetrics extends WithMetadata {
  requestId: string;
  timestamp: string;
  endpoint: string;
  duration: number;
  status: number;
  cacheHit: boolean;
  retryCount: number;
  offlineOperation: boolean;
  syncDelay?: number;
}

// Enhanced validation
export interface ValidationRule8001 {
  field: string;
  type: 'required' | 'format' | 'range' | 'custom';
  params?: unknown;
  message: string;
  priority: number;
}

// Data integrity
export interface IntegrityCheck8001 {
  table: string;
  checksum: string;
  lastVerified: string;
  status: 'VALID' | 'INVALID' | 'PENDING';
  repairAction?: string;
}
