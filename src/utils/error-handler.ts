import { toast } from 'react-hot-toast';

// Define error types for more specific error handling
export enum ErrorType {
  NETWORK_ERROR = 'NETWORK_ERROR',
  AUTHENTICATION_ERROR = 'AUTHENTICATION_ERROR',
  VALIDATION_ERROR = 'VALIDATION_ERROR',
  SYSTEM_ERROR = 'SYSTEM_ERROR',
  UNKNOWN_ERROR = 'UNKNOWN_ERROR'
}

// Error handler interface for more structured error management
export interface ErrorHandler {
  type: ErrorType;
  message: string;
  details?: any;
  timestamp: number;
}

// Main error handling function
export const handleError = (error: unknown, context?: string): ErrorHandler => {
  // Determine the error type and message
  const errorType = determineErrorType(error);
  const errorMessage = extractErrorMessage(error);

  // Create error handler object
  const errorHandler: ErrorHandler = {
    type: errorType,
    message: errorMessage,
    details: error instanceof Error ? error.stack : undefined,
    timestamp: Date.now()
  };

  // Log error to console
  console.error(`Error in ${context || 'Unknown Context'}:`, errorHandler);

  // Display toast notification
  toast.error(errorMessage, {
    duration: 5000,
  });

  // Optional: Send error to logging service
  logErrorToService(errorHandler);

  return errorHandler;
};

// Utility function to determine error type
const determineErrorType = (error: unknown): ErrorType => {
  if (error instanceof TypeError) return ErrorType.VALIDATION_ERROR;
  if (error instanceof Error && error.message.includes('Network')) return ErrorType.NETWORK_ERROR;
  if (error instanceof Error && error.message.includes('Auth')) return ErrorType.AUTHENTICATION_ERROR;
  if (error instanceof Error) return ErrorType.SYSTEM_ERROR;
  return ErrorType.UNKNOWN_ERROR;
};

// Utility function to extract error message
const extractErrorMessage = (error: unknown): string => {
  if (error instanceof Error) return error.message;
  if (typeof error === 'string') return error;
  return 'An unknown error occurred';
};

// Optional: Send error to external logging service
const logErrorToService = (errorHandler: ErrorHandler) => {
  try {
    // Implement error logging to external service
    // This could be Sentry, LogRocket, or a custom backend endpoint
    // fetch('/api/log-error', {
    //   method: 'POST',
    //   headers: { 'Content-Type': 'application/json' },
    //   body: JSON.stringify(errorHandler)
    // });
  } catch (logError) {
    console.error('Failed to log error:', logError);
  }
};

// Utility function to create an error boundary
export const createErrorBoundary = () => {
  // Implement error boundary logic
  // This could be a React error boundary or a generic error handling mechanism
};