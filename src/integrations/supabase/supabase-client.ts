import { createClient, SupabaseClient } from '@supabase/supabase-js';
import { resetPassword } from '../../api/auth-service';

const supabaseUrl = import.meta.env.VITE_SUPABASE_URL;
const supabaseAnonKey = import.meta.env.VITE_SUPABASE_ANON_KEY;

export const supabase: SupabaseClient = createClient(supabaseUrl, supabaseAnonKey);

// Optional: Add any additional Supabase-related utility functions here
export const sendPasswordResetEmail = async (email: string) => {
  return await resetPassword(email);
};