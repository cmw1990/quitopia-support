/**
 * Supabase Client Bridge - Index File
 *
 * IMPORTANT: As per SSOT8001 guidelines, we MUST use direct REST API calls 
 * instead of Supabase client methods. This file serves as a compatibility layer
 * that re-exports the proper REST API client implementation.
 */

// Re-export from client.ts which now uses the proper REST API implementation
import { supabase } from './client';
import * as Types from './types';

// Export the supabase REST client and types
export { supabase, Types };

// Re-export all the functions from client.ts for backward compatibility
export * from './client';

// Re-export all types for consumers
export * from './types';

export default supabase; 