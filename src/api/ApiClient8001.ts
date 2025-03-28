// Rest of imports remain the same...
import { Session } from '@supabase/supabase-js';
import {
  APIClientConfig,
  APIClientInterface,
  APIError,
  APIMetrics,
  APIRequestOptions,
  APIResponse,
  CircuitState,
  ErrorCategory8001,
  PerformanceMetrics,
  RetryConfig,
  SyncOperation
} from './apiTypes';

// Default configurations
const DEFAULT_CONFIG: APIClientConfig = {
  baseUrl: import.meta.env.VITE_SUPABASE_URL,
  version: '8',
  timeout: 30000,
  retry: {
    maxRetries: 3,
    initialDelay: 1000,
    maxDelay: 10000,
    backoffFactor: 2
  },
  enableMetrics: true
};

// LRU Cache implementation with strict type checking
class LRUCache<K extends string | number, V> {
  private cache = new Map<K, V>();
  private readonly maxSize: number;

  constructor(maxSize: number) {
    this.maxSize = maxSize;
  }

  get(key: K): V | undefined {
    const value = this.cache.get(key);
    if (value !== undefined) {
      // Move to front (most recently used)
      this.cache.delete(key);
      this.cache.set(key, value);
    }
    return value;
  }

  set(key: K, value: V): void {
    if (this.cache.size >= this.maxSize) {
      const firstKey = this.cache.keys().next().value as K;
      if (firstKey) {
        this.cache.delete(firstKey);
      }
    }
    this.cache.set(key, value);
  }

  clear(): void {
    this.cache.clear();
  }
}

export class ApiClient8001 implements APIClientInterface {
  private config: APIClientConfig;
  private session: Session | null = null;
  private circuitState: CircuitState = CircuitState.CLOSED;
  private failureCount = 0;
  private readonly FAILURE_THRESHOLD = 5;
  private readonly RECOVERY_TIMEOUT = 30000;
  private cache: LRUCache<string, any>;
  private metrics: PerformanceMetrics[] = [];
  private syncQueue: SyncOperation[] = [];
  private isProcessingQueue = false;

  constructor(config: Partial<APIClientConfig> = {}) {
    this.config = { ...DEFAULT_CONFIG, ...config };
    this.cache = new LRUCache(1000);
    this.initializeOfflineSupport();
  }

  // Rest of the implementation remains the same...
  private initializeOfflineSupport(): void {
    window.addEventListener('online', () => this.processSyncQueue());
    window.addEventListener('offline', () => {
      this.circuitState = CircuitState.OPEN;
    });
  }

  private async processSyncQueue(): Promise<void> {
    if (this.isProcessingQueue || this.syncQueue.length === 0) return;

    this.isProcessingQueue = true;
    const sortedQueue = [...this.syncQueue].sort((a, b) => b.priority - a.priority);

    for (const operation of sortedQueue) {
      try {
        await this.executeOperation(operation);
        this.syncQueue = this.syncQueue.filter(op => op.id !== operation.id);
      } catch (error) {
        operation.retryCount++;
        operation.status = 'FAILED';
        operation.errorDetails = error instanceof Error ? error.message : 'Unknown error';
      }
    }

    this.isProcessingQueue = false;
  }

  private async executeOperation(operation: SyncOperation): Promise<void> {
    const options: APIRequestOptions = {
      method: operation.operation,
      body: operation.payload,
      headers: {
        'X-Sync-Operation': 'true',
        'X-Operation-ID': operation.id
      }
    };

    await this.request(operation.table, options);
  }

  private categorizeError(error: Error): ErrorCategory8001 {
    if (error instanceof TypeError && error.message.includes('network')) {
      return ErrorCategory8001.NETWORK;
    }
    if (error instanceof Response) {
      const status = error.status;
      if (status === 401 || status === 403) return ErrorCategory8001.AUTH;
      if (status === 404) return ErrorCategory8001.RESOURCE;
      if (status === 429) return ErrorCategory8001.RATE_LIMIT;
      if (status >= 500) return ErrorCategory8001.SERVER;
    }
    return ErrorCategory8001.UNKNOWN;
  }

  private async retryWithBackoff<T>(
    fn: () => Promise<T>,
    retryCount: number = 0,
    config: RetryConfig = this.config.retry!
  ): Promise<T> {
    try {
      return await fn();
    } catch (error) {
      const shouldRetry = retryCount < config.maxRetries &&
        this.categorizeError(error as Error) !== ErrorCategory8001.AUTH;

      if (!shouldRetry) throw error;

      const delay = Math.min(
        config.initialDelay * Math.pow(config.backoffFactor, retryCount),
        config.maxDelay
      );

      await new Promise(resolve => setTimeout(resolve, delay));
      return this.retryWithBackoff(fn, retryCount + 1, config);
    }
  }

  private recordMetrics(metrics: PerformanceMetrics): void {
    if (!this.config.enableMetrics) return;
    
    this.metrics.push({
      ...metrics,
      _ssot8001: {
        version: this.config.version,
        lastSync: new Date().toISOString(),
        checksum: this.calculateChecksum(metrics)
      }
    });

    // Keep only last 1000 metrics
    if (this.metrics.length > 1000) {
      this.metrics = this.metrics.slice(-1000);
    }
  }

  private calculateChecksum(data: unknown): string {
    // Simple checksum implementation - in production use a more robust algorithm
    return Buffer.from(JSON.stringify(data)).toString('base64');
  }

  public async request<T>(endpoint: string, options: APIRequestOptions = {}): Promise<APIResponse<T>> {
    const startTime = performance.now();
    const requestId = crypto.randomUUID();

    // Check circuit breaker
    if (this.circuitState === CircuitState.OPEN) {
      throw new Error('Circuit breaker is OPEN');
    }

    // Check cache if GET request and cache not explicitly skipped
    if (options.method === 'GET' && !options.skipCache) {
      const cachedResponse = this.cache.get(endpoint);
      if (cachedResponse) {
        this.recordMetrics({
          requestId,
          timestamp: new Date().toISOString(),
          endpoint,
          duration: 0,
          status: 200,
          cacheHit: true,
          retryCount: 0,
          offlineOperation: false
        });
        return cachedResponse;
      }
    }

    try {
      const response = await this.retryWithBackoff(async () => {
        const url = `${this.config.baseUrl}${endpoint}`;
        const { priority, skipCache, retry, ...fetchOptions } = options;
        
        const requestOptions: RequestInit = {
          ...fetchOptions,
          headers: {
            ...this.getDefaultHeaders(),
            ...options.headers,
            ...(priority && { 'X-Request-Priority': priority })
          }
        };

        if (options.body) {
          requestOptions.body = JSON.stringify(options.body);
        }

        const response = await fetch(url, requestOptions);
        if (!response.ok) throw response;

        const data = await response.json();
        return { data, error: null };
      });

      // Cache successful GET responses
      if (options.method === 'GET') {
        this.cache.set(endpoint, response);
      }

      // Reset circuit breaker on success
      this.failureCount = 0;
      this.circuitState = CircuitState.CLOSED;

      const duration = performance.now() - startTime;
      this.recordMetrics({
        requestId,
        timestamp: new Date().toISOString(),
        endpoint,
        duration,
        status: 200,
        cacheHit: false,
        retryCount: 0,
        offlineOperation: false
      });

      return response;

    } catch (error) {
      // Handle circuit breaker logic
      this.failureCount++;
      if (this.failureCount >= this.FAILURE_THRESHOLD) {
        this.circuitState = CircuitState.OPEN;
        setTimeout(() => {
          this.circuitState = CircuitState.HALF_OPEN;
          this.failureCount = 0;
        }, this.RECOVERY_TIMEOUT);
      }

      const apiError: APIError = {
        name: 'APIError',
        message: error instanceof Error ? error.message : 'Unknown error',
        status: error instanceof Response ? error.status : undefined
      };

      const duration = performance.now() - startTime;
      this.recordMetrics({
        requestId,
        timestamp: new Date().toISOString(),
        endpoint,
        duration,
        status: apiError.status || 500,
        cacheHit: false,
        retryCount: 0,
        offlineOperation: false
      });

      return { data: null, error: apiError };
    }
  }

  private getDefaultHeaders(): Record<string, string> {
    const headers: Record<string, string> = {
      'Content-Type': 'application/json',
      'X-Client-Version': this.config.version,
      'X-Request-ID': crypto.randomUUID()
    };

    if (this.session?.access_token) {
      headers['Authorization'] = `Bearer ${this.session.access_token}`;
    }

    return headers;
  }

  public setSession(session: Session | null): void {
    this.session = session;
  }

  public async clearCache(): Promise<void> {
    this.cache.clear();
  }

  public getMetrics(): APIMetrics[] {
    return this.metrics.map(m => ({
      requestDuration: m.duration,
      requestSize: 0, // Would need to be calculated from actual request data
      responseSize: 0, // Would need to be calculated from actual response data
      cacheHit: m.cacheHit,
      retryCount: m.retryCount
    }));
  }
}
