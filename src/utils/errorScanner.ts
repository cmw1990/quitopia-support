/**
 * Error Scanner Utility
 * 
 * This utility scans the application for console errors and reports them.
 * It helps ensure the application is production-ready with no lingering errors.
 */

import { capturedLogs } from './consoleLogger';

// List of critical paths to check
const criticalPaths = [
  '/',
  '/app/dashboard',
  '/app/progress',
  '/app/consumption-logger',
  '/app/nrt-directory',
  '/app/journal',
  '/app/task-manager',
  '/app/trigger-analysis',
  '/app/settings',
  '/app/community',
  '/app/games',
  '/mobile-enhancements'
];

// Error categories to check for
export interface ErrorScanResult {
  path: string;
  errors: {
    type: 'api' | 'render' | 'network' | 'auth' | 'other';
    message: string;
    timestamp: Date;
    severity: 'critical' | 'high' | 'medium' | 'low';
  }[];
}

/**
 * Categorize an error based on its message
 */
const categorizeError = (errorMsg: string): 'api' | 'render' | 'network' | 'auth' | 'other' => {
  // Convert to string if not already
  const message = String(errorMsg).toLowerCase();
  
  if (message.includes('api') || message.includes('fetch') || message.includes('http')) {
    return 'api';
  } else if (message.includes('render') || message.includes('react') || message.includes('element')) {
    return 'render';
  } else if (message.includes('network') || message.includes('connection') || message.includes('offline')) {
    return 'network';
  } else if (message.includes('auth') || message.includes('login') || message.includes('session')) {
    return 'auth';
  } else {
    return 'other';
  }
};

/**
 * Determine error severity based on its message and category
 */
const determineSeverity = (message: string, category: string): 'critical' | 'high' | 'medium' | 'low' => {
  if (
    message.includes('uncaught exception') || 
    message.includes('cannot read property') ||
    message.includes('is not a function') ||
    message.includes('is not defined')
  ) {
    return 'critical';
  } else if (
    message.includes('failed to fetch') ||
    message.includes('error loading') ||
    message.includes('authentication')
  ) {
    return 'high';
  } else if (
    message.includes('warning') ||
    message.includes('deprecated')
  ) {
    return 'medium';
  } else {
    return 'low';
  }
};

/**
 * Scan for errors on the current page
 */
export const scanForErrors = (): ErrorScanResult => {
  const currentPath = window.location.pathname;
  const errors = capturedLogs
    .filter(log => log.type === 'error')
    .map(log => {
      const message = log.args.map(arg => 
        typeof arg === 'object' 
          ? JSON.stringify(arg) 
          : String(arg)
      ).join(' ');
      
      const type = categorizeError(message);
      const severity = determineSeverity(message.toLowerCase(), type);
      
      return {
        type,
        message,
        timestamp: log.timestamp,
        severity
      };
    });
  
  return {
    path: currentPath,
    errors
  };
};

/**
 * Log error scan results to console
 */
export const logErrorScanResults = (result: ErrorScanResult) => {
  if (result.errors.length === 0) {
    console.log(`✅ No errors found on ${result.path}`);
    return;
  }
  
  console.group(`🔍 Error scan results for ${result.path}`);
  console.log(`Found ${result.errors.length} errors`);
  
  // Group by severity
  const bySeverity = result.errors.reduce((acc, error) => {
    acc[error.severity] = acc[error.severity] || [];
    acc[error.severity].push(error);
    return acc;
  }, {} as Record<string, typeof result.errors>);
  
  // Log critical errors first
  if (bySeverity.critical?.length) {
    console.group(`🚨 Critical Errors (${bySeverity.critical.length})`);
    bySeverity.critical.forEach(error => {
      console.error(`[${error.type}] ${error.message}`);
    });
    console.groupEnd();
  }
  
  // Then high severity
  if (bySeverity.high?.length) {
    console.group(`⚠️ High Severity Errors (${bySeverity.high.length})`);
    bySeverity.high.forEach(error => {
      console.error(`[${error.type}] ${error.message}`);
    });
    console.groupEnd();
  }
  
  // Then medium severity
  if (bySeverity.medium?.length) {
    console.group(`⚠️ Medium Severity Errors (${bySeverity.medium.length})`);
    bySeverity.medium.forEach(error => {
      console.warn(`[${error.type}] ${error.message}`);
    });
    console.groupEnd();
  }
  
  // Then low severity
  if (bySeverity.low?.length) {
    console.group(`ℹ️ Low Severity Errors (${bySeverity.low.length})`);
    bySeverity.low.forEach(error => {
      console.info(`[${error.type}] ${error.message}`);
    });
    console.groupEnd();
  }
  
  console.groupEnd();
};

export default {
  scanForErrors,
  logErrorScanResults,
  criticalPaths
}; 