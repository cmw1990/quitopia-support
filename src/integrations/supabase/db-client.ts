
import { createClient } from '@supabase/supabase-js';

// Get environment variables
const supabaseUrl = 'https://zoubqdwxemivxrjruvam.supabase.co';
const supabaseAnonKey = "eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6InpvdWJxZHd4ZW1pdnhyanJ1dmFtIiwicm9sZSI6ImFub24iLCJpYXQiOjE3Mzg0MjAxOTcsImV4cCI6MjA1Mzk5NjE5N30.tq2ssOiA8CbFUZc6HXWXMEev1dODzKZxzNrpvyzbbXs";
const supabaseServiceKey = "eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6InpvdWJxZHd4ZW1pdnhyanJ1dmFtIiwicm9sZSI6InNlcnZpY2Vfcm9sZSIsImlhdCI6MTczODQyMDE5NywiZXhwIjoyMDUzOTk2MTk3fQ.VMGEmVXub9PA-lQiE4b1XJu-dqjdUq1UpqVnppynYFw";

// Create supabase client
const supabaseClient = createClient(supabaseUrl, supabaseAnonKey);

// Create a service role client for admin operations
const supabaseAdmin = createClient(supabaseUrl, supabaseServiceKey);

// Export the supabase client
export const dbClient = supabaseClient;

// Also export the URL and keys for direct REST API calls
export const SUPABASE_URL = supabaseUrl;
export const SUPABASE_KEY = supabaseAnonKey;
export const SUPABASE_SERVICE_KEY = supabaseServiceKey;

// Export admin client for privileged operations
export const dbAdminClient = supabaseAdmin;
