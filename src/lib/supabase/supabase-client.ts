import { createClient } from '@supabase/supabase-js';

// Get environment variables for Supabase
const supabaseUrl = import.meta.env.VITE_SUPABASE_URL || '';
const supabaseAnonKey = import.meta.env.VITE_SUPABASE_ANON_KEY || '';

// Create Supabase client
export const supabase = createClient(supabaseUrl, supabaseAnonKey);

// Type definitions
export interface UserSteps {
  id: string;
  user_id: string;
  date: string;
  step_count: number;
  source: string;
  last_synced?: string;
  created_at: string;
}

export interface SupabaseResponse<T> {
  data: T | null;
  error: Error | null;
}

export interface DatabaseUser {
  id: string;
  email: string;
  username?: string;
  created_at: string;
  updated_at: string;
  profile_completed: boolean;
  health_connected: boolean;
}

export interface DiscountCode {
  id: string;
  code: string;
  discount_percentage: number;
  valid_until: string;
  is_used: boolean;
  product_id?: string;
  created_at: string;
}

export interface NRTProductPreview {
  id: string;
  name: string;
  description: string;
  image_url: string;
  price: number;
  rating: number;
  review_count: number;
  created_at: string;
}

// Helper function to handle typical Supabase responses with proper typing
export async function handleSupabaseResponse<T>(
  promise: Promise<{ data: T | null; error: Error | null }>
): Promise<{ data: T | null; error: string | null }> {
  try {
    const { data, error } = await promise;
    if (error) {
      console.error('Supabase error:', error);
      return { data: null, error: error.message };
    }
    return { data, error: null };
  } catch (error) {
    console.error('Unexpected error:', error);
    return { 
      data: null, 
      error: error instanceof Error ? error.message : 'An unexpected error occurred' 
    };
  }
} 