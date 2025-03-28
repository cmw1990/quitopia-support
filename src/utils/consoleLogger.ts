// consoleLogger.ts
// Utility to help debug console errors across browsers

// Store original console methods
const originalConsoleError = console.error;
const originalConsoleWarn = console.warn;
const originalConsoleLog = console.log;

// Array to store captured logs
export const capturedLogs: Array<{
  type: 'error' | 'warn' | 'log';
  args: any[];
  timestamp: Date;
}> = [];

// Override console methods to capture logs
console.error = function(...args: any[]) {
  capturedLogs.push({
    type: 'error',
    args,
    timestamp: new Date()
  });
  originalConsoleError.apply(console, args);
};

console.warn = function(...args: any[]) {
  capturedLogs.push({
    type: 'warn',
    args,
    timestamp: new Date()
  });
  originalConsoleWarn.apply(console, args);
};

console.log = function(...args: any[]) {
  capturedLogs.push({
    type: 'log',
    args, 
    timestamp: new Date()
  });
  originalConsoleLog.apply(console, args);
};

// Function to retrieve captured logs
export function getCapturedLogs() {
  return capturedLogs;
}

// Function to clear captured logs
export function clearCapturedLogs() {
  capturedLogs.length = 0;
}

// Initialize logger
export function initConsoleLogger() {
  // Already initialized by importing this file
  console.log('Console logger initialized');
}

export default {
  getCapturedLogs,
  clearCapturedLogs,
  initConsoleLogger
}; 