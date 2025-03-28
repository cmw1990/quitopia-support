import { useState, useContext, createContext, ReactNode, useEffect } from 'react';
import { Session, User } from '@supabase/supabase-js';
import { supabase, getCurrentSession, getCurrentUser, onAuthStateChange } from '../api/supabase-client';

// Define the auth context type
export interface AuthContextType {
  user: User | null;
  session: Session | null;
  isLoading: boolean;
  error: Error | null;
  setSession: (session: Session | null) => void;
  login: (email: string, password: string) => Promise<{ success: boolean; error?: Error }>;
  logout: () => Promise<void>;
  refreshSession: () => Promise<void>;
}

// Create the context
const AuthContext = createContext<AuthContextType | null>(null);

// Provider component
interface AuthProviderProps {
  children: ReactNode;
}

export const AuthProvider: React.FC<AuthProviderProps> = ({ children }) => {
  const [state, setState] = useState<{
    user: User | null;
    session: Session | null;
    isLoading: boolean;
    error: Error | null;
  }>({
    user: null,
    session: null,
    isLoading: true,
    error: null
  });

  // Set session in context state
  const setSession = (session: Session | null) => {
    if (session) {
      setState(prev => ({
        ...prev,
        session,
        user: session.user,
        isLoading: false
      }));
    } else {
      setState(prev => ({
        ...prev,
        session: null,
        user: null,
        isLoading: false
      }));
    }
  };

  // Initialize auth state
  useEffect(() => {
    const initializeAuth = async () => {
      try {
        const session = await getCurrentSession();
        if (session) {
          const user = await getCurrentUser();
          setState({
            user,
            session,
            isLoading: false,
            error: null
          });
        } else {
          setState({
            user: null,
            session: null,
            isLoading: false,
            error: null
          });
        }
      } catch (error) {
        console.error('Error initializing auth:', error);
        setState({
          user: null,
          session: null,
          isLoading: false,
          error: error instanceof Error ? error : new Error('Unknown auth initialization error')
        });
      }
    };

    initializeAuth();
  }, []);

  // Set up auth state change listener
  useEffect(() => {
    const { unsubscribe } = onAuthStateChange((event, session) => {
      console.log('Auth state change:', event, session?.user?.email);
      if (event === 'SIGNED_IN' && session) {
        setState({
          user: session.user,
          session,
          isLoading: false,
          error: null
        });
      } else if (event === 'SIGNED_OUT') {
        setState({
          user: null,
          session: null,
          isLoading: false,
          error: null
        });
      }
    });

    // Clean up subscription on unmount
    return () => {
      unsubscribe();
    };
  }, []);

  // Login function
  const login = async (email: string, password: string) => {
    setState(prev => ({ ...prev, isLoading: true, error: null }));

    try {
      const { data, error } = await supabase.auth.signInWithPassword({ email, password });

      if (error) throw error;
      if (!data.session) throw new Error('No session returned from login');

      setState({
        user: data.user,
        session: data.session,
        isLoading: false,
        error: null
      });

      return { success: true };
    } catch (error) {
      const authError = error instanceof Error ? error : new Error('Unknown login error');
      
      setState(prev => ({
        ...prev,
        isLoading: false,
        error: authError
      }));
      
      return { success: false, error: authError };
    }
  };

  // Logout function
  const logout = async () => {
    setState(prev => ({ ...prev, isLoading: true }));
    
    try {
      await supabase.auth.signOut();
      
      setState({
        user: null,
        session: null,
        isLoading: false,
        error: null
      });
    } catch (error) {
      setState(prev => ({
        ...prev,
        isLoading: false,
        error: error instanceof Error ? error : new Error('Unknown logout error')
      }));
    }
  };

  // Refresh session
  const refreshSession = async () => {
    setState(prev => ({ ...prev, isLoading: true }));
    
    try {
      const session = await getCurrentSession();
      const user = await getCurrentUser();
      
      setState({
        user,
        session,
        isLoading: false,
        error: null
      });
    } catch (error) {
      setState(prev => ({
        ...prev,
        isLoading: false,
        error: error instanceof Error ? error : new Error('Unknown session refresh error')
      }));
    }
  };

  // Return provider with auth context
  return (
    <AuthContext.Provider
      value={{
        ...state,
        setSession,
        login,
        logout,
        refreshSession
      }}
    >
      {children}
    </AuthContext.Provider>
  );
};

// Hook to use auth context
export const useAuth = (): AuthContextType => {
  const context = useContext(AuthContext);
  
  if (!context) {
    throw new Error('useAuth must be used within an AuthProvider');
  }
  
  return context;
};

// Helper hooks
export const useSession = (): Session | null => {
  const { session } = useAuth();
  return session;
};

export const useUser = (): User | null => {
  const { user } = useAuth();
  return user;
};

export const useIsAuthenticated = (): boolean => {
  const { user } = useAuth();
  return user !== null;
}; 