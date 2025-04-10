import { PostgrestError } from '@supabase/supabase-js';
import fs from 'fs/promises';
import path from 'path';

interface DatabaseErrorContext {
  operation: string;
  table?: string;
  query?: string;
  userId?: string;
  additionalDetails?: string;
}

interface ErrorLog {
  timestamp: string;
  type: string;
  message: string;
  code: string;
  details: DatabaseErrorContext & { stack?: string };
}

class DatabaseErrorHandler {
  private static logFilePath = path.join(process.cwd(), 'database-errors.log');

  /**
   * Standardized error handling for database operations
   * @param error PostgrestError or standard Error
   * @param context Additional context about the error
   */
  static async handleError(
    error: PostgrestError | Error, 
    context: DatabaseErrorContext
  ): Promise<void> {
    const timestamp = new Date().toISOString();
    
    const errorLog: ErrorLog = {
      timestamp,
      type: error instanceof PostgrestError ? 'Postgrest' : 'Standard',
      message: error.message,
      code: error instanceof PostgrestError ? error.code : 'N/A',
      details: {
        ...context,
        stack: error.stack
      }
    };

    // Log to console
    console.error(`🚨 Database Error [${context.operation}]:`, error.message);

    // Write to log file
    try {
      await fs.appendFile(
        this.logFilePath, 
        JSON.stringify(errorLog, null, 2) + '\n'
      );
    } catch (logError) {
      console.error('Failed to write error log:', logError);
    }

    // Optional: Send error to monitoring service
    this.reportToMonitoringService(errorLog);
  }

  /**
   * Validate database operation results
   * @param result Database query result
   * @param expectedDataType Expected type of returned data
   */
  static validateResult(
    result: { data: any, error: PostgrestError | null }, 
    expectedDataType?: string
  ): boolean {
    if (result.error) {
      this.handleError(result.error, { 
        operation: 'Result Validation',
        query: JSON.stringify(result),
        additionalDetails: 'Query validation failed'
      });
      return false;
    }

    if (expectedDataType) {
      const isValidType = Array.isArray(result.data) 
        ? result.data.every(item => typeof item === expectedDataType)
        : typeof result.data === expectedDataType;

      if (!isValidType) {
        this.handleError(
          new Error('Invalid data type'), 
          { 
            operation: 'Type Validation',
            additionalDetails: `Expected ${expectedDataType}, got ${typeof result.data}`
          }
        );
        return false;
      }
    }

    return true;
  }

  /**
   * Report error to external monitoring service
   * In a real-world scenario, this would integrate with services like Sentry, LogRocket, etc.
   */
  private static reportToMonitoringService(errorLog: ErrorLog): void {
    // Placeholder for external error reporting
    // console.log('Reporting to monitoring service:', errorLog);
  }

  /**
   * Retrieve recent error logs
   */
  static async getRecentErrorLogs(limit = 10): Promise<ErrorLog[]> {
    try {
      const logContent = await fs.readFile(this.logFilePath, 'utf8');
      const logs = logContent.trim().split('\n')
        .map(line => JSON.parse(line) as ErrorLog);
      return logs.slice(-limit).reverse();
    } catch (error) {
      console.error('Error reading log file:', error);
      return [];
    }
  }
}

export default DatabaseErrorHandler;
export { DatabaseErrorContext, ErrorLog };