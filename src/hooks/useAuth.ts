import { useAuth as useAuthFromProvider } from '../components/AuthProvider';
import { Session, User } from '@supabase/supabase-js';
import { supabaseRestCall } from "../api/apiCompatibility";

// Define the expected response type from Supabase auth
interface AuthResponse {
  access_token: string;
  refresh_token: string;
  expires_in: number;
  user: User;
}

// Extend the auth context type to include setSession
export interface AuthContextType {
  session: Session | null;
  user: User | null;
  loading: boolean;
  error: Error | null;
  login: (email: string, password: string) => Promise<void>;
  logout: () => Promise<void>;
  refreshSession: () => Promise<Session | null>;
  setSession: (session: Session | null) => void;
}

// Export the useAuth hook
export const useAuth = useAuthFromProvider;

// This function is being kept for reference or if needed elsewhere
export const signInWithRestApi = async (email: string, password: string): Promise<Session> => {
  try {
    const response = await supabaseRestCall<AuthResponse>('/auth/v1/token?grant_type=password', {
      method: 'POST',
      body: JSON.stringify({ email, password }),
    }, null);
    
    if (!response.access_token) {
      throw new Error('Login failed');
    }
    
    const newSession: Session = {
      access_token: response.access_token,
      refresh_token: response.refresh_token,
      expires_at: Math.floor(Date.now() / 1000) + response.expires_in,
      expires_in: response.expires_in,
      token_type: 'bearer',
      user: response.user
    };
    
    return newSession;
  } catch (error) {
    console.error('Login error:', error);
    throw error;
  }
};