import { createClient } from '@supabase/supabase-js';

// Get environment variables
// Use the correct, known Supabase URL and Anon Key directly
const supabaseUrl = 'https://zoubqdwxemivxrjruvam.supabase.co';
const supabaseAnonKey = "eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6InpvdWJxZHd4ZW1pdnhyanJ1dmFtIiwicm9sZSI6ImFub24iLCJpYXQiOjE3Mzg0MjAxOTcsImV4cCI6MjA1Mzk5NjE5N30.tq2ssOiA8CbFUZc6HXWXMEev1dODzKZxzNrpvyzbbXs";

// Create supabase client
const supabaseClient = createClient(supabaseUrl, supabaseAnonKey);

// Export the supabase client
export { supabaseClient as supabase };

// Also export the URL and key for direct REST API calls
export const SUPABASE_URL = supabaseUrl;
export const SUPABASE_KEY = supabaseAnonKey;

// Removed mockSupabaseData object as per user instruction