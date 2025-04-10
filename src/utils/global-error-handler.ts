export type ErrorSeverity = 'low' | 'medium' | 'high' | 'critical';
export type ErrorType = 'network' | 'database' | 'authentication' | 'ui' | 'unknown' | 'performance';

export interface ErrorContext {
  type: ErrorType;
  severity: ErrorSeverity;
  source?: string;
  userId?: string;
  additionalDetails?: string;
}

export interface ErrorLog {
  timestamp: string;
  type: ErrorType;
  severity: ErrorSeverity;
  message: string;
  stack?: string;
  context: {
    source?: string;
    userId?: string;
    additionalDetails?: string;
  };
}

export class GlobalErrorHandler {
  private static logFilePath = './error-logs/global-errors.log';
  private static maxLogSize = 10 * 1024 * 1024; // 10MB

  private static severityColors: Record<ErrorSeverity, string> = {
    low: '\x1b[32m',     // Green
    medium: '\x1b[33m',  // Yellow
    high: '\x1b[31m',    // Red
    critical: '\x1b[41m' // Red Background
  };

  /**
   * Handle and log global application errors
   * @param error Error object
   * @param context Additional error context
   */
  static async handleError(
    error: Error, 
    context: ErrorContext
  ): Promise<void> {
    const timestamp = new Date().toISOString();
    
    const errorLog: ErrorLog = {
      timestamp,
      type: context.type,
      severity: context.severity,
      message: error.message,
      stack: error.stack,
      context: {
        source: context.source,
        userId: context.userId,
        additionalDetails: context.additionalDetails
      }
    };

    // Log to console based on severity
    this.logToConsole(errorLog);

    // Write to log file
    await this.writeToLogFile(errorLog);

    // Notify monitoring service
    this.notifyMonitoringService(errorLog);

    // Perform additional actions based on severity
    this.handleErrorBySeverity(context.severity);
  }

  /**
   * Log error to console with color-coded severity
   */
  private static logToConsole(errorLog: ErrorLog): void {
    const color = this.severityColors[errorLog.severity] || '\x1b[0m';
    console.error(
      `${color}[${errorLog.severity.toUpperCase()}] ${errorLog.message}\x1b[0m`,
      errorLog
    );
  }

  /**
   * Write error to log file with rotation
   */
  private static async writeToLogFile(errorLog: ErrorLog): Promise<void> {
    try {
      const fs = await import('fs/promises');
      const path = await import('path');

      // Ensure log directory exists
      await fs.mkdir(path.dirname(this.logFilePath), { recursive: true });

      // Check and rotate log file if needed
      await this.rotateLogFileIfNeeded(fs, path);

      // Append error log
      await fs.appendFile(
        this.logFilePath, 
        JSON.stringify(errorLog, null, 2) + '\n'
      );
    } catch (logError) {
      console.error('Failed to write error log:', logError);
    }
  }

  /**
   * Rotate log file if it exceeds maximum size
   */
  private static async rotateLogFileIfNeeded(
    fs: typeof import('fs/promises'), 
    path: typeof import('path')
  ): Promise<void> {
    try {
      const stats = await fs.stat(this.logFilePath);
      if (stats.size > this.maxLogSize) {
        const timestamp = new Date().toISOString().replace(/:/g, '-');
        const archivePath = `${this.logFilePath}.${timestamp}`;
        await fs.rename(this.logFilePath, archivePath);
      }
    } catch (error) {
      // File doesn't exist, no rotation needed
      if ((error as NodeJS.ErrnoException).code !== 'ENOENT') {
        throw error;
      }
    }
  }

  /**
   * Notify external monitoring service
   */
  private static notifyMonitoringService(errorLog: ErrorLog): void {
    // Placeholder for external error reporting 
    // Could integrate with services like Sentry, LogRocket, etc.
    console.log('Reporting to monitoring service:', errorLog);
  }

  /**
   * Handle error based on severity
   */
  private static handleErrorBySeverity(severity: ErrorSeverity): void {
    switch (severity) {
      case 'critical':
        // Potentially restart application or show critical error screen
        this.triggerCriticalErrorProtocol();
        break;
      case 'high':
        // Log additional diagnostics, potentially alert admin
        this.logHighSeverityDiagnostics();
        break;
    }
  }

  /**
   * Trigger critical error recovery protocol
   */
  private static triggerCriticalErrorProtocol(): void {
    // Implement application-wide error recovery
    console.error('🚨 CRITICAL ERROR: Initiating recovery protocol');
    // Could involve:
    // - Logging out user
    // - Clearing sensitive data
    // - Reporting to monitoring service
  }

  /**
   * Log additional diagnostics for high-severity errors
   */
  private static logHighSeverityDiagnostics(): void {
    // Collect and log system diagnostics
    console.warn('🔍 High Severity Error: Collecting system diagnostics');
    // Could involve:
    // - Capturing system state
    // - Logging recent user actions
    // - Gathering performance metrics
  }

  /**
   * Retrieve recent error logs
   */
  static async getRecentErrorLogs(limit = 10): Promise<ErrorLog[]> {
    try {
      const fs = await import('fs/promises');
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

// Global error event listeners
if (typeof window !== 'undefined') {
  window.addEventListener('error', (event) => {
    GlobalErrorHandler.handleError(
      new Error(event.message), 
      { 
        type: 'unknown', 
        severity: 'high', 
        source: 'window.onerror' 
      }
    );
  });

  window.addEventListener('unhandledrejection', (event) => {
    GlobalErrorHandler.handleError(
      event.reason || new Error('Unhandled Promise Rejection'), 
      { 
        type: 'unknown', 
        severity: 'high', 
        source: 'unhandledrejection' 
      }
    );
  });
}

export default GlobalErrorHandler;