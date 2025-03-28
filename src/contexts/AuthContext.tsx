import React, { createContext, useContext, ReactNode } from 'react';
import useAuthentication from '../hooks/useAuthentication';
import { Session, User } from '@supabase/supabase-js';

// Define the shape of the auth context
export interface AuthContextType {
  user: User | null;
  session: Session | null;
  isLoading: boolean;
  error: Error | null;
  login: (email: string, password: string) => Promise<{ success: boolean; error?: Error }>;
  logout: () => Promise<void>;
  refreshSession: () => Promise<void>;
}

// Create the auth context with a default value (null) and a type check
const AuthContext = createContext<AuthContextType | null>(null);

// Auth provider props
interface AuthProviderProps {
  children: ReactNode;
}

/**
 * AuthProvider - Provides authentication state and functions to the app
 */
export const AuthProvider: React.FC<AuthProviderProps> = ({ children }) => {
  // Use our custom authentication hook to get auth state and functions
  const auth = useAuthentication();

  return (
    <AuthContext.Provider value={auth}>
      {children}
    </AuthContext.Provider>
  );
};

/**
 * Hook to use auth context
 */
export const useAuth = (): AuthContextType => {
  const context = useContext(AuthContext);
  
  if (!context) {
    throw new Error('useAuth must be used within an AuthProvider');
  }
  
  return context;
};

/**
 * Returns the current authenticated session
 */
export const useSession = (): Session | null => {
  const { session } = useAuth();
  return session;
};

/**
 * Returns the current authenticated user
 */
export const useUser = (): User | null => {
  const { user } = useAuth();
  return user;
};

/**
 * Returns whether the user is authenticated
 */
export const useIsAuthenticated = (): boolean => {
  const { user } = useAuth();
  return user !== null;
}; 