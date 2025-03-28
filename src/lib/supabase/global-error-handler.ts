import { toast } from 'sonner';

/**
 * Error severity levels for categorizing different types of errors
 */
export enum ErrorSeverity {
  INFO = 'info',
  WARNING = 'warning',
  ERROR = 'error',
  CRITICAL = 'critical',
}

/**
 * Interface for structured error information
 */
export interface ErrorInfo {
  message: string;
  code?: string;
  details?: any;
  severity: ErrorSeverity;
  userId?: string;
  timestamp: number;
  context?: string;
  silent?: boolean; // Flag to indicate if this error should be silent
}

/**
 * Log errors to the console in development mode,
 * and potentially to an error tracking service in production
 */
export function logError(errorInfo: ErrorInfo): void {
  // Skip logging if error is marked as silent
  if (errorInfo.silent) {
    return;
  }
  
  // In development, log to console with formatting
  if (import.meta.env.DEV) {
    const styles = {
      [ErrorSeverity.INFO]: 'color: #2563eb; font-weight: bold',
      [ErrorSeverity.WARNING]: 'color: #f59e0b; font-weight: bold',
      [ErrorSeverity.ERROR]: 'color: #dc2626; font-weight: bold',
      [ErrorSeverity.CRITICAL]: 'color: #7f1d1d; background: #fecaca; font-weight: bold; padding: 2px 5px; border-radius: 3px',
    };
    
    console.group(`%c${errorInfo.severity.toUpperCase()}: ${errorInfo.message}`, styles[errorInfo.severity]);
    if (errorInfo.code) console.log('Error code:', errorInfo.code);
    if (errorInfo.details) console.log('Details:', errorInfo.details);
    console.log('Time:', new Date(errorInfo.timestamp).toISOString());
    console.groupEnd();
  } else {
    // In production, we could send to an error tracking service
    // Example: sendToErrorTrackingService(errorInfo);
  }
}

/**
 * Check if this is a common error that should be silent
 */
function shouldSilenceError(error: any, context: string): boolean {
  // Check for common dashboard/analytics 404 errors that are expected
  if (context.includes('dashboard') || context.includes('analytics') || context.includes('statistics')) {
    return true;
  }
  
  // Check for known error codes that should be silent
  if (error && error.code) {
    const silentErrorCodes = [
      'PGRST204', // No content
      'PGRST404', // Resource not found
      'PGRST304', // Not modified
    ];
    
    if (silentErrorCodes.includes(error.code)) {
      return true;
    }
  }
  
  // Check for specific API endpoints that often return 404s for new users
  if (error && error.path) {
    const silentPaths = [
      '/user_health',
      '/user_achievements',
      '/user_progress',
      '/user_statistics',
    ];
    
    for (const path of silentPaths) {
      if (error.path.includes(path)) {
        return true;
      }
    }
  }
  
  return false;
}

/**
 * Handle Supabase-specific errors and convert them to user-friendly messages
 */
export function handleSupabaseError(error: any, context: string = 'operation'): ErrorInfo {
  // Default error info structure
  const errorInfo: ErrorInfo = {
    message: 'An unexpected error occurred',
    severity: ErrorSeverity.ERROR,
    timestamp: Date.now(),
    context: context,
    silent: shouldSilenceError(error, context),
  };
  
  // Extract error details if available
  if (error instanceof Error) {
    errorInfo.message = error.message;
    errorInfo.details = error.stack;
  } else if (typeof error === 'string') {
    errorInfo.message = error;
  } else if (error && typeof error === 'object') {
    // Handle structured Supabase errors
    if (error.error_description || error.error) {
      errorInfo.message = error.error_description || error.error;
    }
    
    if (error.code) {
      errorInfo.code = error.code;
      
      // Map specific error codes to user-friendly messages
      switch (error.code) {
        case 'PGRST301':
          errorInfo.message = 'Database resource not found';
          errorInfo.silent = true; // Silence resource not found errors
          break;
        case 'PGRST401':
          errorInfo.message = 'Authentication required';
          errorInfo.severity = ErrorSeverity.WARNING;
          break;
        case '42501':
          errorInfo.message = 'You don\'t have permission to access this resource';
          errorInfo.severity = ErrorSeverity.WARNING;
          break;
        case '23505':
          errorInfo.message = 'This record already exists';
          errorInfo.severity = ErrorSeverity.WARNING;
          break;
        case '23503':
          errorInfo.message = 'This operation would violate data constraints';
          errorInfo.severity = ErrorSeverity.WARNING;
          break;
        case 'PGRST409':
          errorInfo.message = 'The data you\'re trying to modify has changed';
          errorInfo.severity = ErrorSeverity.WARNING;
          break;
      }
    }
    
    // Include the full error object for logging
    errorInfo.details = error;
  }
  
  // Add context to the error message
  errorInfo.message = `Failed to ${context}: ${errorInfo.message}`;
  
  // Log the error unless it's marked as silent
  if (!errorInfo.silent) {
    logError(errorInfo);
  }
  
  return errorInfo;
}

/**
 * Show a user-friendly toast notification for an error
 */
export function showErrorToast(errorInfo: ErrorInfo): void {
  // Skip notifications for silent errors
  if (errorInfo.silent) {
    return;
  }
  
  const toastType = errorInfo.severity === ErrorSeverity.CRITICAL ? 'error' :
                    errorInfo.severity === ErrorSeverity.ERROR ? 'error' :
                    errorInfo.severity === ErrorSeverity.WARNING ? 'warning' : 'info';
  
  toast[toastType](errorInfo.message, {
    id: `error-${errorInfo.code || Date.now()}`,
    duration: errorInfo.severity === ErrorSeverity.CRITICAL ? 10000 : 5000,
  });
}

/**
 * Global error handler function that combines logging and user notification
 */
export function handleAndNotifyError(error: any, context: string = 'operation', showToast: boolean = true): ErrorInfo {
  const errorInfo = handleSupabaseError(error, context);
  
  if (showToast && !errorInfo.silent) {
    showErrorToast(errorInfo);
  }
  
  return errorInfo;
}

/**
 * Safe execution wrapper for async functions that handles errors
 */
export async function safeExecution<T>(
  operation: () => Promise<T>,
  context: string,
  defaultValue: T,
  showErrorToast: boolean = true
): Promise<T> {
  try {
    return await operation();
  } catch (error) {
    handleAndNotifyError(error, context, showErrorToast);
    return defaultValue;
  }
} 