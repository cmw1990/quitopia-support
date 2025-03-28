/**
 * DEPRECATED - COMPATIBILITY LAYER
 * 
 * This file is maintained only for backward compatibility.
 * All new code should directly use the REST client from @/lib/supabase/rest-client.ts
 * 
 * Per SSOT8001 guidelines, we must NEVER use direct Supabase client methods.
 * This file provides a compatibility layer that forwards all calls to our REST client.
 */

// Import our REST client
import restClient from './supabase/rest-client';
// Import from the main implementation instead of redeclaring
import { SUPABASE_URL, SUPABASE_ANON_KEY } from '@/api/supabase-client';

// Re-export environment variables
export { SUPABASE_URL, SUPABASE_ANON_KEY };

// Re-export the REST client functions for backward compatibility
export const {
  auth,
  from,
  storage
} = restClient;

// Export a compatibility supabase object that forwards all calls to our REST client
export const supabase = restClient;

// Log a warning when this file is imported
console.warn(
  'WARNING: You are using the deprecated supabase-client.ts compatibility layer. ' +
  'Please update your imports to use @/lib/supabase/rest-client.ts directly.'
);

export default supabase; 