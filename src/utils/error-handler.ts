/**
 * Centralized error handling utility
 * Logs errors and formats them consistently
 */
export interface ProcessedError {
  code: string;
  message: string;
  originalError?: any;
}

export function handleError(error: any, context = 'general'): ProcessedError {
  // Default error information
  let code = 'unknown_error';
  let message = 'An unexpected error occurred';
  
  // Log the error with context for debugging
  console.error(`Error in ${context}:`, error);
  
  // Format Supabase errors
  if (error?.code && typeof error.code === 'string') {
    code = error.code;
    
    // Handle common Supabase error codes
    if (error.code === 'auth/invalid-email') {
      message = 'The email address is invalid.';
    } else if (error.code === 'auth/user-disabled') {
      message = 'This user account has been disabled.';
    } else if (error.code === 'auth/user-not-found') {
      message = 'No user found with this email address.';
    } else if (error.code === 'auth/wrong-password') {
      message = 'Incorrect password.';
    } else if (error.code.includes('auth/')) {
      // Other auth errors
      message = error.message || 'Authentication error';
    } else if (error.code.includes('storage/')) {
      // Storage errors
      message = error.message || 'Storage error';
    } else if (error.code.includes('functions/')) {
      // Functions errors
      message = error.message || 'Function execution error';
    } else {
      // Generic error with code
      message = error.message || 'Unexpected error';
    }
  } else if (error?.message && typeof error.message === 'string') {
    // Simple error with message
    code = 'error';
    message = error.message;
  } else if (typeof error === 'string') {
    // Plain string error
    code = 'string_error';
    message = error;
  }
  
  return {
    code,
    message,
    originalError: error
  };
}

/**
 * Handle asynchronous errors with a consistent pattern
 * @param promise The promise to handle
 * @param errorContext Context string for error logging
 */
export async function handleAsyncError<T>(
  promise: Promise<T>,
  errorContext = 'async_operation'
): Promise<[T | null, ProcessedError | null]> {
  try {
    const data = await promise;
    return [data, null];
  } catch (error) {
    const processedError = handleError(error, errorContext);
    return [null, processedError];
  }
}
