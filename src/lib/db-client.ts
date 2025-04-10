// Re-export the Supabase client from the existing location
import { dbClient as supabaseClient } from '../integrations/supabase/db-client';

// Export the Supabase client so it can be imported from @/lib/db-client
export const dbClient = supabaseClient;

// Export any other needed functionality
export default dbClient;
