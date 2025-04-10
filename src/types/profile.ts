// Basic Profile type definition
import { User } from '@supabase/supabase-js';

export interface Profile {
  id: string; // Matches Supabase auth user ID
  username: string | null;
  avatar_url?: string | null; // Optional avatar URL
  updated_at?: string;
  // Add any other profile-specific fields here
  // e.g., full_name?: string;
} 