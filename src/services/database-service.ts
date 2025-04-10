import { createClient, SupabaseClient, PostgrestResponse } from '@supabase/supabase-js';
import ConfigManager from '../config/config-manager';
import GlobalErrorHandler from '../utils/global-error-handler';
import PerformanceMonitor from '../utils/performance-monitor';

// Define generic database operation types
type DatabaseOperation = 'select' | 'insert' | 'update' | 'delete' | 'upsert';

// Database operation context for detailed error tracking
interface DatabaseOperationContext {
  table: string;
  operation: DatabaseOperation;
  userId?: string;
  additionalDetails?: Record<string, any>;
}

class DatabaseService {
  private static instance: DatabaseService;
  private client: SupabaseClient;

  private constructor() {
    const config = ConfigManager.get('supabase');
    this.client = createClient(config.url, config.anonKey, {
      auth: {
        persistSession: true
      }
    });
  }

  /**
   * Singleton instance getter
   */
  public static getInstance(): DatabaseService {
    if (!DatabaseService.instance) {
      DatabaseService.instance = new DatabaseService();
    }
    return DatabaseService.instance;
  }

  /**
   * Perform a database operation with error handling and performance monitoring
   * @param operation Function to execute database operation
   * @param context Operation context for detailed logging
   */
  private async executeOperation<T>(
    operation: () => Promise<PostgrestResponse<T>>,
    context: DatabaseOperationContext
  ): Promise<T[] | null> {
    try {
      const result = await PerformanceMonitor.measure(
        async () => {
          const response = await operation();
          if (response.error) throw response.error;
          return response;
        },
        `database-${context.operation}`
      );

      return result.data;
    } catch (error) {
      GlobalErrorHandler.handleError(
        error as Error,
        {
          type: 'database',
          severity: 'high',
          source: `DatabaseService.${context.operation}`,
          userId: context.userId,
          additionalDetails: JSON.stringify({
            table: context.table,
            ...context.additionalDetails
          })
        }
      );

      return null;
    }
  }

  /**
   * Select records from a table
   * @param table Table name
   * @param query Supabase query builder
   * @param userId Optional user ID for context
   */
  public async select<T>(
    table: string, 
    query: (client: SupabaseClient) => Promise<PostgrestResponse<T>>,
    userId?: string
  ): Promise<T[] | null> {
    return this.executeOperation(
      () => query(this.client),
      { 
        table, 
        operation: 'select', 
        userId 
      }
    );
  }

  /**
   * Insert records into a table
   * @param table Table name
   * @param data Records to insert
   * @param userId Optional user ID for context
   */
  public async insert<T>(
    table: string, 
    data: T | T[], 
    userId?: string
  ): Promise<T[] | null> {
    return this.executeOperation(
      async () => {
        const response = await this.client.from(table).insert(data).select();
        return response as PostgrestResponse<T>;
      },
      { 
        table, 
        operation: 'insert', 
        userId,
        additionalDetails: { 
          recordCount: Array.isArray(data) ? data.length : 1 
        }
      }
    );
  }

  /**
   * Update records in a table
   * @param table Table name
   * @param data Update data
   * @param match Matching conditions
   * @param userId Optional user ID for context
   */
  public async update<T>(
    table: string, 
    data: Partial<T>, 
    match: Record<string, any>, 
    userId?: string
  ): Promise<T[] | null> {
    return this.executeOperation(
      async () => {
        const response = await this.client.from(table).update(data).match(match).select();
        return response as PostgrestResponse<T>;
      },
      { 
        table, 
        operation: 'update', 
        userId,
        additionalDetails: { matchConditions: Object.keys(match) }
      }
    );
  }

  /**
   * Delete records from a table
   * @param table Table name
   * @param match Matching conditions
   * @param userId Optional user ID for context
   */
  public async delete(
    table: string, 
    match: Record<string, any>, 
    userId?: string
  ): Promise<boolean> {
    const result = await this.executeOperation(
      async () => {
        const response = await this.client.from(table).delete().match(match).select();
        return response as PostgrestResponse<unknown>;
      },
      { 
        table, 
        operation: 'delete', 
        userId,
        additionalDetails: { matchConditions: Object.keys(match) }
      }
    );

    return result !== null;
  }

  /**
   * Upsert records (insert or update)
   * @param table Table name
   * @param data Records to upsert
   * @param onConflict Conflict resolution strategy
   * @param userId Optional user ID for context
   */
  public async upsert<T>(
    table: string, 
    data: T | T[], 
    onConflict = 'id', 
    userId?: string
  ): Promise<T[] | null> {
    return this.executeOperation(
      async () => {
        const response = await this.client.from(table).upsert(data, { onConflict }).select();
        return response as PostgrestResponse<T>;
      },
      { 
        table, 
        operation: 'upsert', 
        userId,
        additionalDetails: { 
          recordCount: Array.isArray(data) ? data.length : 1,
          conflictStrategy: onConflict
        }
      }
    );
  }

  /**
   * Get Supabase client for advanced operations
   */
  public getClient(): SupabaseClient {
    return this.client;
  }
}

// Export singleton instance
export default DatabaseService.getInstance();