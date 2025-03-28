import React, { createContext, useContext, useEffect, useState } from 'react';
import { Navigate, useNavigate } from 'react-router-dom';
import { Loader2, Leaf } from 'lucide-react';
import { toast } from 'sonner';
import type { Session, User } from '@supabase/supabase-js';
import { getCurrentSession, getCurrentUser, refreshSession, signInWithEmail, signOut, onAuthStateChange } from '@/api/supabase-client';
import { MissionFreshLayout } from './MissionFreshLayout';
import { supabase } from '@/lib/supabase/supabase-client';

// Define the auth context type
type AuthContextType = {
  user: User | null;
  session: Session | null;
  loading: boolean;
  error: Error | null;
  setSession: (session: Session | null) => void;
  login: (email: string, password: string) => Promise<void>;
  logout: () => Promise<void>;
  refreshSession: () => Promise<Session | null>;
  signIn: (email: string, password: string) => Promise<{ error: Error | null }>;
  signUp: (email: string, password: string) => Promise<{ error: Error | null, user: User | null }>;
  signOut: () => Promise<void>;
  updateProfile: (userData: Partial<User>) => Promise<{ error: Error | null }>;
  resetPassword: (email: string) => Promise<{ error: Error | null }>;
};

// Create auth context with defaults
const AuthContext = createContext<AuthContextType>({
  user: null,
  session: null,
  loading: true,
  error: null,
  setSession: () => {},
  login: async () => {},
  logout: async () => {},
  refreshSession: async () => null,
  signIn: async () => ({ error: null }),
  signUp: async () => ({ error: null, user: null }),
  signOut: async () => {},
  updateProfile: async () => ({ error: null }),
  resetPassword: async () => ({ error: null }),
});

// Hook to use auth context
export const useAuth = () => useContext(AuthContext);

export function AuthProvider({ children }: { children: React.ReactNode }) {
  const [user, setUser] = useState<User | null>(null);
  const [session, setSession] = useState<Session | null>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<Error | null>(null);
  const navigate = useNavigate();

  // Initialize auth state
  useEffect(() => {
    // Get current session from local storage
    const currentSession = getCurrentSession();
    if (currentSession) {
      setSession(currentSession);
      setUser(currentSession.user);
    }

    // Try to refresh the session if available
    const initSession = async () => {
      try {
        const refreshedSession = await refreshSession();
        if (refreshedSession) {
          setSession(refreshedSession);
          setUser(refreshedSession.user);
        }
      } catch (refreshError) {
        console.warn('Failed to refresh session during initialization:', refreshError);
      } finally {
        setLoading(false);
      }
    };

    initSession();

    // Subscribe to auth state changes
    const { unsubscribe } = onAuthStateChange((event, newSession) => {
      console.log('Auth state changed:', event, newSession?.user?.email);
      
      if (newSession) {
        setSession(newSession);
        setUser(newSession.user);
      } else {
        setSession(null);
        setUser(null);
      }
      
      setLoading(false);
    });

    // Cleanup subscription
    return () => {
      unsubscribe();
    };
  }, []);

  // Login function
  const login = async (email: string, password: string) => {
    try {
      setLoading(true);
      setError(null);
      
      const newSession = await signInWithEmail(email, password);
      
      if (newSession) {
        setSession(newSession);
        setUser(newSession.user);
        navigate('/app/dashboard');
      } else {
        throw new Error('Login failed - no session returned');
      }
    } catch (error) {
      console.error('Login error:', error);
      
      setError(error instanceof Error ? error : new Error('An unknown error occurred'));
      
      // Show user-friendly error messages
      if (error instanceof Error) {
        // Handle specific error messages
        if (error.message.includes('401') || error.message.includes('invalid') || 
            error.message.includes('incorrect')) {
          toast.error('Invalid email or password. Please try again.');
        } else if (error.message.includes('429') || error.message.includes('rate limit')) {
          toast.error('Too many login attempts. Please try again later.');
        } else if (error.message.includes('network') || error.message.includes('connect')) {
          toast.error('Network error. Please check your internet connection.');
        } else {
          toast.error('Login failed. Please try again.');
        }
      } else {
        toast.error('Login failed. Please try again.');
      }
      
      throw error;
    } finally {
      setLoading(false);
    }
  };

  // Logout function
  const logout = async () => {
    try {
      setLoading(true);
      await signOut();
    } catch (error) {
      console.error('Error signing out:', error);
      // Even if API logout fails, clear local state
      setUser(null);
      setSession(null);
    } finally {
      setLoading(false);
      navigate('/auth');
    }
  };

  // Refresh session function (can be called manually if needed)
  const handleRefreshSession = async () => {
    try {
      setLoading(true);
      const refreshedSession = await refreshSession();
      if (refreshedSession) {
        setSession(refreshedSession);
        setUser(refreshedSession.user);
      }
      return refreshedSession;
    } catch (error) {
      console.error('Error refreshing session:', error);
      return null;
    } finally {
      setLoading(false);
    }
  };

  // If still loading, show loading indicator
  if (loading) {
    return (
      <div className="flex flex-col items-center justify-center min-h-screen bg-white">
        <div className="flex flex-col items-center gap-4">
          <Leaf className="h-12 w-12 text-emerald-600 animate-pulse" />
          <div className="text-xl font-semibold text-emerald-700">Loading Mission Fresh</div>
          <Loader2 className="h-8 w-8 animate-spin text-emerald-600" />
        </div>
      </div>
    );
  }

  // Provide auth context value
  const value = {
    user,
    session,
    loading,
    error,
    setSession,
    login,
    logout,
    refreshSession: handleRefreshSession,
    signIn: async (email: string, password: string) => {
      try {
        const { error } = await supabase.auth.signInWithPassword({ email, password });
        return { error };
      } catch (error) {
        return { error: error as Error };
      }
    },
    signUp: async (email: string, password: string) => {
      try {
        const { data, error } = await supabase.auth.signUp({ email, password });
        return { error, user: data.user };
      } catch (error) {
        return { error: error as Error, user: null };
      }
    },
    signOut: async () => {
      try {
        await supabase.auth.signOut();
      } catch (error) {
        console.error('Error signing out:', error);
      }
    },
    updateProfile: async (userData: Partial<User>) => {
      try {
        const { error } = await supabase.auth.updateUser(userData);
        if (!error && user) {
          setUser({ ...user, ...userData });
        }
        return { error };
      } catch (error) {
        return { error: error as Error };
      }
    },
    resetPassword: async (email: string) => {
      try {
        const { error } = await supabase.auth.resetPasswordForEmail(email, {
          redirectTo: `${window.location.origin}/reset-password`,
        });
        return { error };
      } catch (error) {
        return { error: error as Error };
      }
    },
  };

  return <AuthContext.Provider value={value}>{children}</AuthContext.Provider>;
}

// Helper hook to get just the session
export const useSession = (): Session | null => {
  const { session } = useAuth();
  return session;
};

// Helper hook to get just the user
export const useUser = (): User | null => {
  const { user } = useAuth();
  return user;
};

// Helper hook to check if user is authenticated
export const useIsAuthenticated = (): boolean => {
  const { user } = useAuth();
  return user !== null;
};

// Protected route component that redirects to login if not authenticated
export const ProtectedRoute = ({ children }: { children: React.ReactNode }) => {
  const { user, loading, setSession } = useAuth();
  const [isChecking, setIsChecking] = useState(true);
  
  useEffect(() => {
    const checkAuth = async () => {
      try {
        const currentSession = await getCurrentSession();
        if (currentSession) {
          setSession(currentSession);
        }
      } catch (error) {
        console.error('Protected route auth check error:', error);
      } finally {
        setIsChecking(false);
      }
    };
    
    if (!user) {
      checkAuth();
    } else {
      setIsChecking(false);
    }
  }, [user, setSession]);
  
  if (loading || isChecking) {
    return <AuthLoading />;
  }
  
  if (!user) {
    return <Navigate to="/auth" replace />;
  }
  
  return <>{children}</>;
};

// Auth context provider that adds the layout wrapper
export const AuthContextProvider = ({ children }: { children: React.ReactNode }) => {
  return (
    <AuthProvider>
      {children}
    </AuthProvider>
  );
};

// Loading component shown while auth state is being initialized
export const AuthLoading = () => (
  <div className="fixed inset-0 flex flex-col items-center justify-center bg-background z-50">
    <div className="flex flex-col items-center">
      <Leaf className="h-16 w-16 text-emerald-500 mb-4 animate-pulse" />
      <h1 className="text-2xl font-bold text-emerald-600 mb-2">Mission Fresh</h1>
      <div className="flex items-center space-x-2">
        <Loader2 className="h-5 w-5 animate-spin text-emerald-500" />
        <p className="text-muted-foreground">Loading...</p>
      </div>
    </div>
  </div>
);