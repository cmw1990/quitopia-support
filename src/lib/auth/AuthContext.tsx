import React, { createContext, useContext, useState, useEffect, ReactNode } from 'react';
import { supabase } from '@/lib/supabase/supabase-client';

interface User {
  id: string;
  email: string;
  metadata?: {
    name?: string;
    avatar_url?: string;
  };
}

interface AuthContextType {
  user: User | null;
  loading: boolean;
  error: string | null;
  login: (email: string, password: string) => Promise<{ error: string | null }>;
  loginWithSocialProvider: (provider: 'google' | 'apple') => Promise<{ error: string | null }>;
  signup: (email: string, password: string) => Promise<{ error: string | null }>;
  logout: () => Promise<void>;
  resetPassword: (email: string) => Promise<{ error: string | null }>;
  updateUser: (updates: Partial<User>) => Promise<{ error: string | null }>;
  setUser: (user: User | null) => void;
}

const AuthContext = createContext<AuthContextType | undefined>(undefined);

export function AuthProvider({ children }: { children: ReactNode }) {
  const [user, setUser] = useState<User | null>(null);
  const [loading, setLoading] = useState<boolean>(true);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    // Check if there's an active session
    const checkUser = async () => {
      try {
        setLoading(true);
        const { data, error } = await supabase.auth.getSession();
        
        if (error) {
          console.error('Error getting session:', error.message);
          setError(error.message);
          setUser(null);
          return;
        }
        
        if (data?.session?.user) {
          setUser({
            id: data.session.user.id,
            email: data.session.user.email || '',
            metadata: {
              name: data.session.user.user_metadata?.name,
              avatar_url: data.session.user.user_metadata?.avatar_url
            }
          });
        } else {
          setUser(null);
        }
      } catch (error) {
        console.error('Unexpected error during auth check:', error);
        setError(error instanceof Error ? error.message : 'An unexpected error occurred');
        setUser(null);
      } finally {
        setLoading(false);
      }
    };

    // Set up auth listener
    const { data: authListener } = supabase.auth.onAuthStateChange(
      async (event, session) => {
        if (event === 'SIGNED_IN' && session?.user) {
          setUser({
            id: session.user.id,
            email: session.user.email || '',
            metadata: {
              name: session.user.user_metadata?.name,
              avatar_url: session.user.user_metadata?.avatar_url
            }
          });
          setError(null);
        } else if (event === 'SIGNED_OUT') {
          setUser(null);
        }
      }
    );

    // Check user on initial load
    checkUser();

    // Cleanup auth listener
    return () => {
      authListener?.subscription.unsubscribe();
    };
  }, []);

  const login = async (email: string, password: string) => {
    try {
      setLoading(true);
      const { data, error } = await supabase.auth.signInWithPassword({
        email,
        password,
      });

      if (error) {
        setError(error.message);
        return { error: error.message };
      }

      setError(null);
      return { error: null };
    } catch (error) {
      const errorMessage = error instanceof Error ? error.message : 'An unexpected error occurred';
      setError(errorMessage);
      return { error: errorMessage };
    } finally {
      setLoading(false);
    }
  };

  const loginWithSocialProvider = async (provider: 'google' | 'apple') => {
    try {
      setLoading(true);
      const { error } = await supabase.auth.signInWithOAuth({
        provider,
        options: {
          redirectTo: `${window.location.origin}/auth/callback`
        }
      });

      if (error) {
        setError(error.message);
        return { error: error.message };
      }

      setError(null);
      return { error: null };
    } catch (error) {
      const errorMessage = error instanceof Error ? error.message : 'An unexpected error occurred';
      setError(errorMessage);
      return { error: errorMessage };
    } finally {
      setLoading(false);
    }
  };

  const signup = async (email: string, password: string) => {
    try {
      setLoading(true);
      const { error } = await supabase.auth.signUp({
        email,
        password,
        options: {
          emailRedirectTo: `${window.location.origin}/auth/callback`
        }
      });

      if (error) {
        setError(error.message);
        return { error: error.message };
      }

      setError(null);
      return { error: null };
    } catch (error) {
      const errorMessage = error instanceof Error ? error.message : 'An unexpected error occurred';
      setError(errorMessage);
      return { error: errorMessage };
    } finally {
      setLoading(false);
    }
  };

  const logout = async () => {
    try {
      setLoading(true);
      await supabase.auth.signOut();
      setUser(null);
    } catch (error) {
      console.error('Error during logout:', error);
    } finally {
      setLoading(false);
    }
  };

  const resetPassword = async (email: string) => {
    try {
      setLoading(true);
      const { error } = await supabase.auth.resetPasswordForEmail(email, {
        redirectTo: `${window.location.origin}/reset-password`,
      });

      if (error) {
        setError(error.message);
        return { error: error.message };
      }

      setError(null);
      return { error: null };
    } catch (error) {
      const errorMessage = error instanceof Error ? error.message : 'An unexpected error occurred';
      setError(errorMessage);
      return { error: errorMessage };
    } finally {
      setLoading(false);
    }
  };

  const updateUser = async (updates: Partial<User>) => {
    try {
      setLoading(true);
      
      // Only attempt to update if we have a user
      if (!user) {
        return { error: 'No authenticated user' };
      }
      
      const { error } = await supabase.auth.updateUser({
        data: updates.metadata
      });

      if (error) {
        setError(error.message);
        return { error: error.message };
      }

      // Update the local user state with the changes
      setUser({
        ...user,
        ...updates,
        metadata: {
          ...user.metadata,
          ...updates.metadata
        }
      });

      setError(null);
      return { error: null };
    } catch (error) {
      const errorMessage = error instanceof Error ? error.message : 'An unexpected error occurred';
      setError(errorMessage);
      return { error: errorMessage };
    } finally {
      setLoading(false);
    }
  };

  const value = {
    user,
    loading,
    error,
    login,
    loginWithSocialProvider,
    signup,
    logout,
    resetPassword,
    updateUser,
    setUser,
  };

  return <AuthContext.Provider value={value}>{children}</AuthContext.Provider>;
}

export function useAuth() {
  const context = useContext(AuthContext);
  if (context === undefined) {
    throw new Error('useAuth must be used within an AuthProvider');
  }
  return context;
} 