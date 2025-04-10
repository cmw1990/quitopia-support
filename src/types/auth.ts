import { User, Session } from '@supabase/supabase-js';
import { SupabaseClient } from '@supabase/supabase-js';

export interface AuthError {
  message: string;
}

export interface LoadingState {
  initial: boolean;
  signIn: boolean;
  signUp: boolean;
  signOut: boolean;
  resetPassword: boolean;
  updatePassword: boolean;
}

export const DEFAULT_LOADING_STATE: LoadingState = {
  initial: false,
  signIn: false,
  signUp: false,
  signOut: false,
  resetPassword: false,
  updatePassword: false
};

export interface AuthContextType {
  user: User | null;
  session: Session | null;
  supabase: SupabaseClient;
  loading: LoadingState;
  error: AuthError | null;
  signIn: (email: string, password: string) => Promise<{ error?: any }>;
  signOut: () => Promise<void>;
  logout: () => Promise<void>;
  signUp: (email: string, password: string, metadata?: any) => Promise<{ error?: any, data?: any }>;
  resetPassword: (email: string) => Promise<{ error?: any }>;
  updatePassword: (password: string) => Promise<{ error?: any }>;
}