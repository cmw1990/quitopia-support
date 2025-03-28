import { useState, useEffect, useCallback } from 'react';
import { Session, User } from '@supabase/supabase-js';
import { signInWithEmail, signOut, getCurrentSession, getCurrentUser, onAuthStateChange } from '../api/supabase-client';
import { offlineStorage } from '../services/OfflineStorageService';
import useOfflineStatus from './useOfflineStatus';

interface AuthState {
  user: User | null;
  session: Session | null;
  isLoading: boolean;
  error: Error | null;
}

interface UseAuthenticationReturn extends AuthState {
  login: (email: string, password: string) => Promise<{ success: boolean; error?: Error }>;
  logout: () => Promise<void>;
  refreshSession: () => Promise<void>;
  setSession: (session: Session | null) => void;
}

/**
 * Custom hook for authentication state and operations
 * Provides consistent session management across the application
 * with support for offline mode
 */
export default function useAuthentication(): UseAuthenticationReturn {
  const [authState, setAuthState] = useState<AuthState>({
    user: null,
    session: null,
    isLoading: true,
    error: null
  });
  
  const { isOnline } = useOfflineStatus();

  // Load initial session
  useEffect(() => {
    const initAuth = async () => {
      try {
        // Attempt to get current session
        const session = await getCurrentSession();
        
        if (session) {
          // If we have a session, get the user
          const user = await getCurrentUser();
          setAuthState({
            user,
            session,
            isLoading: false,
            error: null
          });
          
          // Cache authentication state for offline use
          if (user) {
            await offlineStorage.setItem('auth_user', user);
            await offlineStorage.setItem('auth_session', session);
          }
        } else if (!isOnline) {
          // If offline and no active session, try to use cached credentials
          const cachedUser = await offlineStorage.getItem<User>('auth_user');
          const cachedSession = await offlineStorage.getItem<Session>('auth_session');
          
          if (cachedUser && cachedSession) {
            // Use cached credentials for offline mode
            setAuthState({
              user: cachedUser,
              session: cachedSession,
              isLoading: false,
              error: null
            });
          } else {
            // No cached credentials available
            setAuthState({
              user: null,
              session: null,
              isLoading: false,
              error: null
            });
          }
        } else {
          // No active session and online
          setAuthState({
            user: null,
            session: null,
            isLoading: false,
            error: null
          });
        }
      } catch (error) {
        // Handle initialization error
        setAuthState({
          user: null,
          session: null,
          isLoading: false,
          error: error instanceof Error ? error : new Error('Unknown authentication error')
        });
      }
    };

    initAuth();
  }, [isOnline]);

  // Subscribe to auth state changes
  useEffect(() => {
    const { unsubscribe } = onAuthStateChange((event, session) => {
      if (event === 'SIGNED_IN' && session) {
        getCurrentUser().then(user => {
          setAuthState({
            user,
            session,
            isLoading: false,
            error: null
          });
          
          // Cache authentication state for offline use
          if (user) {
            offlineStorage.setItem('auth_user', user);
            offlineStorage.setItem('auth_session', session);
          }
        });
      } else if (event === 'SIGNED_OUT') {
        setAuthState({
          user: null,
          session: null,
          isLoading: false,
          error: null
        });
        
        // Clear cached authentication data
        offlineStorage.removeItem('auth_user');
        offlineStorage.removeItem('auth_session');
      }
    });

    return () => {
      unsubscribe();
    };
  }, []);

  // Handle login
  const login = useCallback(async (email: string, password: string) => {
    if (!isOnline) {
      return { 
        success: false, 
        error: new Error('Cannot login while offline. Please connect to the internet and try again.') 
      };
    }
    
    try {
      setAuthState(prev => ({ ...prev, isLoading: true, error: null }));
      
      // Call signInWithEmail and handle potential errors
      try {
        const result = await signInWithEmail(email, password);
        
        // If we got here, login was successful
        setAuthState({
          user: result.user,
          session: result.session,
          isLoading: false,
          error: null
        });
        
        // Cache authentication state for offline use
        await offlineStorage.setItem('auth_user', result.user);
        await offlineStorage.setItem('auth_session', result.session);
        
        return { success: true };
      } catch (err) {
        // Handle authentication errors
        throw err;
      }
    } catch (error) {
      const authError = error instanceof Error ? error : new Error('Unknown login error');
      
      setAuthState(prev => ({
        ...prev,
        isLoading: false,
        error: authError
      }));
      
      return { 
        success: false, 
        error: authError 
      };
    }
  }, [isOnline]);

  // Handle logout
  const logout = useCallback(async () => {
    try {
      setAuthState(prev => ({ ...prev, isLoading: true }));
      
      if (isOnline && authState.session) {
        // Only call signOut if we have a session
        await signOut(authState.session);
      }
      
      // Always clear local state, even if offline
      setAuthState({
        user: null,
        session: null,
        isLoading: false,
        error: null
      });
      
      // Clear cached authentication data
      await offlineStorage.removeItem('auth_user');
      await offlineStorage.removeItem('auth_session');
    } catch (error) {
      setAuthState(prev => ({
        ...prev,
        isLoading: false,
        error: error instanceof Error ? error : new Error('Unknown logout error')
      }));
    }
  }, [isOnline, authState.session]);

  // Refresh session
  const refreshSession = useCallback(async () => {
    try {
      setAuthState(prev => ({ ...prev, isLoading: true }));
      
      if (isOnline) {
        const session = await getCurrentSession();
        const user = await getCurrentUser();
        
        setAuthState({
          user,
          session,
          isLoading: false,
          error: null
        });
        
        // Update cached authentication state
        if (user && session) {
          await offlineStorage.setItem('auth_user', user);
          await offlineStorage.setItem('auth_session', session);
        }
      }
    } catch (error) {
      setAuthState(prev => ({
        ...prev,
        isLoading: false,
        error: error instanceof Error ? error : new Error('Unknown session refresh error')
      }));
    }
  }, [isOnline]);

  // Set session
  const setSession = useCallback((session: Session | null) => {
    setAuthState(prev => ({ ...prev, session }));
  }, []);

  return {
    ...authState,
    login,
    logout,
    refreshSession,
    setSession
  };
} 