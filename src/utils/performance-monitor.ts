import { GlobalErrorHandler, ErrorType } from './global-error-handler';

interface PerformanceMetric {
  name: string;
  startTime: number;
  endTime?: number;
  duration?: number;
  additionalData?: Record<string, any>;
}

class PerformanceMonitor {
  private static metrics: Map<string, PerformanceMetric> = new Map();
  private static performanceLogPath = './performance-logs/app-performance.log';
  private static maxLogSize = 20 * 1024 * 1024; // 20MB

  /**
   * Start tracking a performance metric
   * @param name Unique metric name
   * @param additionalData Optional additional context
   */
  static start(name: string, additionalData?: Record<string, any>): void {
    const metric: PerformanceMetric = {
      name,
      startTime: performance.now(),
      additionalData
    };
    this.metrics.set(name, metric);
  }

  /**
   * End tracking a performance metric
   * @param name Unique metric name
   * @returns Performance metric details
   */
  static end(name: string): PerformanceMetric | null {
    const metric = this.metrics.get(name);
    if (!metric) {
      GlobalErrorHandler.handleError(
        new Error(`Performance metric '${name}' not found`),
        { 
          type: 'unknown', 
          severity: 'low', 
          source: 'PerformanceMonitor' 
        }
      );
      return null;
    }

    metric.endTime = performance.now();
    metric.duration = metric.endTime - metric.startTime;

    // Log performance metric
    this.logPerformanceMetric(metric);

    // Check for performance thresholds
    this.checkPerformanceThresholds(metric);

    this.metrics.delete(name);
    return metric;
  }

  /**
   * Log performance metric to file
   * @param metric Performance metric to log
   */
  private static async logPerformanceMetric(metric: PerformanceMetric): Promise<void> {
    try {
      const fs = await import('fs/promises');
      const path = await import('path');

      // Ensure log directory exists
      await fs.mkdir(path.dirname(this.performanceLogPath), { recursive: true });

      // Check and rotate log file if needed
      await this.rotateLogFileIfNeeded(fs, path);

      // Append performance metric
      await fs.appendFile(
        this.performanceLogPath,
        JSON.stringify({
          timestamp: new Date().toISOString(),
          ...metric
        }, null, 2) + '\n'
      );
    } catch (error) {
      GlobalErrorHandler.handleError(
        error as Error,
        { 
          type: 'unknown', 
          severity: 'low', 
          source: 'PerformanceMonitor.logPerformanceMetric' 
        }
      );
    }
  }

  /**
   * Rotate performance log file if it exceeds maximum size
   */
  private static async rotateLogFileIfNeeded(
    fs: typeof import('fs/promises'), 
    path: typeof import('path')
  ): Promise<void> {
    try {
      const stats = await fs.stat(this.performanceLogPath);
      if (stats.size > this.maxLogSize) {
        const timestamp = new Date().toISOString().replace(/:/g, '-');
        const archivePath = `${this.performanceLogPath}.${timestamp}`;
        await fs.rename(this.performanceLogPath, archivePath);
      }
    } catch (error) {
      // File doesn't exist, no rotation needed
      if ((error as NodeJS.ErrnoException).code !== 'ENOENT') {
        throw error;
      }
    }
  }

  /**
   * Check performance metrics against predefined thresholds
   * @param metric Performance metric to evaluate
   */
  private static checkPerformanceThresholds(metric: PerformanceMetric): void {
    const thresholds: Record<string, number> = {
      // Example thresholds (adjust based on your app's requirements)
      'database-query': 500,  // 500ms
      'component-render': 100, // 100ms
      'api-call': 1000        // 1 second
    };

    const threshold = thresholds[metric.name];
    if (threshold && metric.duration && metric.duration > threshold) {
      GlobalErrorHandler.handleError(
        new Error(`Performance threshold exceeded for ${metric.name}`),
        { 
          type: 'network', 
          severity: 'medium', 
          source: 'PerformanceMonitor',
          additionalDetails: `Duration: ${metric.duration}ms, Threshold: ${threshold}ms`
        }
      );
    }
  }

  /**
   * Retrieve recent performance logs
   * @param limit Number of logs to retrieve
   */
  static async getRecentPerformanceLogs(limit = 10): Promise<any[]> {
    try {
      const fs = await import('fs/promises');
      const logContent = await fs.readFile(this.performanceLogPath, 'utf8');
      const logs = logContent.trim().split('\n')
        .map(line => JSON.parse(line) as PerformanceMetric);
      return logs.slice(-limit).reverse();
    } catch (error) {
      GlobalErrorHandler.handleError(
        error as Error,
        { 
          type: 'unknown', 
          severity: 'low', 
          source: 'PerformanceMonitor.getRecentPerformanceLogs' 
        }
      );
      return [];
    }
  }

  /**
   * Measure and log the performance of a function
   * @param fn Function to measure
   * @param name Metric name
   */
  static async measure<T>(fn: () => Promise<T>, name: string): Promise<T> {
    this.start(name);
    try {
      const result = await fn();
      this.end(name);
      return result;
    } catch (error) {
      this.end(name);
      throw error;
    }
  }
}

export default PerformanceMonitor;
export { ErrorType };