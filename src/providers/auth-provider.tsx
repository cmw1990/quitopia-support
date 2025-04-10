// src/providers/auth-provider.tsx
import React, { createContext, useState, useEffect, ReactNode, useCallback } from 'react';
// Removed supabase-js import: import { supabase } from '@/lib/supabase-client';
// Removed supabase-js types: import { Session, User, AuthChangeEvent } from '@supabase/supabase-js';
import { supabaseRequest } from '@/utils/supabaseRequest'; // Import REST utility
// Removed unused AuthService import: import * as AuthService from '@/api/auth-service';
import { handleError } from "@/utils/error-handler"; // Import error handler

// Define simplified User and Session types based on expected REST API response
interface User {
  id: string;
  email?: string;
  // Add other relevant user fields from your user metadata if needed
  // e.g., user_metadata: { name?: string; avatar_url?: string; };
  [key: string]: any; // Allow other properties
}

interface Session {
  access_token: string;
  refresh_token: string;
  expires_in: number;
  token_type: string;
  user: User;
}

interface AuthContextType {
  user: User | null;
  session: Session | null; // Store the whole session object now
  loading: boolean;
  authLoading: boolean; // Specific loading for auth actions
  signIn: (email: string, password: string) => Promise<{ error?: Error | null }>;
  signUp: (email: string, password: string) => Promise<{ error?: Error | null, requiresConfirmation?: boolean }>;
  signOut: () => Promise<void>;
  sendPasswordReset: (email: string) => Promise<{ error?: Error | null }>;
  // updatePassword needs user context usually, handled via Supabase UI or custom flow
  // updatePassword: (token: string, newPassword: string) => Promise<void>;
}

const LOCAL_STORAGE_KEY = 'easier_focus_session';

// Create the context with a default value
export const AuthContext = createContext<AuthContextType>({
  user: null,
  session: null,
  loading: true,
  authLoading: false,
  signIn: async () => ({ error: new Error('Provider not ready') }),
  signUp: async () => ({ error: new Error('Provider not ready') }),
  signOut: async () => { throw new Error('Provider not ready') },
  sendPasswordReset: async () => ({ error: new Error('Provider not ready') }),
  // updatePassword: async () => { throw new Error('Provider not ready') },
});

interface AuthProviderProps {
  children: ReactNode;
}

export const AuthProvider: React.FC<AuthProviderProps> = ({ children }) => {
  const [user, setUser] = useState<User | null>(null);
  const [session, setSession] = useState<Session | null>(null);
  const [loading, setLoading] = useState(true); // For initial session load
  const [authLoading, setAuthLoading] = useState(false); // For specific actions like sign in/up

  // Function to update state and storage
  const setAuthState = useCallback((newSession: Session | null) => {
    setSession(newSession);
    setUser(newSession?.user ?? null);
    if (newSession) {
      localStorage.setItem(LOCAL_STORAGE_KEY, JSON.stringify(newSession));
    } else {
      localStorage.removeItem(LOCAL_STORAGE_KEY);
    }
  }, []);

  // Check local storage for session on initial load
  useEffect(() => {
    setLoading(true);
    try {
      const storedSessionString = localStorage.getItem(LOCAL_STORAGE_KEY);
      if (storedSessionString) {
        const storedSession: Session = JSON.parse(storedSessionString);
        // Basic validation: check if token exists and maybe expiry (simplified)
        if (storedSession.access_token) {
           // TODO: Add more robust validation: check expiry, maybe ping /auth/v1/user endpoint
           console.log("Restoring session from localStorage");
           setAuthState(storedSession);
        } else {
           localStorage.removeItem(LOCAL_STORAGE_KEY); // Clean invalid entry
        }
      }
    } catch (error) {
      console.error("Failed to parse stored session:", error);
      localStorage.removeItem(LOCAL_STORAGE_KEY); // Clean corrupted entry
    } finally {
      setLoading(false);
    }
    // No listener needed with manual state management
  }, [setAuthState]);


  // --- Implement Auth Methods using supabaseRequest ---

  const signIn = async (email: string, password: string): Promise<{ error?: Error | null }> => {
    setAuthLoading(true);
    try {
      const { data, error } = await supabaseRequest<Session>({
        // Use special path for auth endpoints
        tableName: '../auth/v1/token', // Adjust relative path as needed based on base URL structure
        method: 'POST',
        params: { grant_type: 'password' }, // Specify grant type in params
        headers: { 'Content-Type': 'application/json' }, // Ensure correct Content-Type
        body: { email, password },
        // No accessToken needed for sign-in
      });

      if (error) throw error;
      if (!data) throw new Error('No session data returned from sign in');

      setAuthState(data);
      return { error: null };

    } catch (error: any) {
      handleError(error, "AuthProvider.signIn");
      // Clear state on failed login attempt? Optional.
      // setAuthState(null);
      return { error: new Error(error?.message || 'Sign in failed') };
    } finally {
      setAuthLoading(false);
    }
  };

  const signUp = async (email: string, password: string): Promise<{ error?: Error | null, requiresConfirmation?: boolean }> => {
    setAuthLoading(true);
    try {
      const { data, error } = await supabaseRequest<User>({ // Sign up returns User object initially
        tableName: '../auth/v1/signup',
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: { email, password },
        // Add options like data for user_metadata if needed
        // body: { email, password, data: { full_name: '...' } }
      });

      if (error) throw error;

      // Check if user object indicates confirmation needed (e.g., based on Supabase settings)
      const requiresConfirmation = !!(data && !data.email_confirmed_at); // Adjust based on actual response
      
      // Don't set auth state automatically on signup if email confirmation is required
      if (!requiresConfirmation && data) {
         // If auto-confirm is enabled, or for testing, log the user in immediately
         // This usually requires a separate signIn call after signup in REST
         console.warn("Auto sign-in after signup is not directly supported via REST without another call. User needs to verify email or sign in manually.");
         // OR: Call signIn immediately if appropriate for your flow
         // await signIn(email, password); 
      }

      return { error: null, requiresConfirmation };

    } catch (error: any) {
      handleError(error, "AuthProvider.signUp");
      return { error: new Error(error?.message || 'Sign up failed') };
    } finally {
      setAuthLoading(false);
    }
  };

  const signOut = async (): Promise<void> => {
    setAuthLoading(true);
    const currentToken = session?.access_token; // Get token before clearing state
    setAuthState(null); // Clear local state immediately for responsiveness
    try {
       if (!currentToken) {
          console.warn("No active session token found to sign out via API.");
          return; // Nothing to do if no token
       }
      // Call the logout endpoint
      const { error } = await supabaseRequest<null>({
        tableName: '../auth/v1/logout',
        method: 'POST',
        accessToken: currentToken, // Send the token to invalidate
      });

      if (error) {
          // Log error but state is already cleared locally
          console.error("Error during API sign out:", error);
          handleError(error, "AuthProvider.signOut API Call");
      }

    } catch (error) {
      // State is already cleared locally
      handleError(error, "AuthProvider.signOut");
    } finally {
      setAuthLoading(false);
    }
  };

  const sendPasswordReset = async (email: string): Promise<{ error?: Error | null }> => {
      setAuthLoading(true);
      try {
          const { error } = await supabaseRequest<null>({
              tableName: '../auth/v1/recover',
              method: 'POST',
              headers: { 'Content-Type': 'application/json' },
              body: { email },
          });
          if (error) throw error;
          return { error: null };
      } catch (error: any) {
          handleError(error, "AuthProvider.sendPasswordReset");
          return { error: new Error(error?.message || 'Password reset request failed') };
      } finally {
          setAuthLoading(false);
      }
  };

  // NOTE: updatePassword using a reset token typically happens on a dedicated page
  // that receives the token from the URL. It would call the `/auth/v1/user` endpoint
  // with the PATCH method and the access_token obtained from the recovery link.
  // Adding a method here might require complex token handling.

  const value = {
    user,
    session,
    loading,
    authLoading,
    signIn,
    signUp,
    signOut,
    sendPasswordReset,
    // updatePassword,
  };

  // Render children immediately now, initial loading is handled internally
  return (
    <AuthContext.Provider value={value}>
      {children}
    </AuthContext.Provider>
  );
};

// Custom hook to use the AuthContext (keep as is)
export const useAuth = () => {
  const context = React.useContext(AuthContext);
  if (context === undefined) {
    throw new Error('useAuth must be used within an AuthProvider');
  }
  return context;
};

// Remember to wrap your main application component (e.g., in App.tsx or main.tsx)
// with <AuthProvider> ... </AuthProvider> 