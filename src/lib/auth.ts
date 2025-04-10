import { auth } from '@/integrations/supabase/rest-api';
import { useEffect, useState } from 'react';

// Get the session token from localStorage
const getSessionToken = () => {
  try {
    const storedSession = localStorage.getItem('supabase.auth.token');
    if (!storedSession) return null;
    
    const parsedSession = JSON.parse(storedSession);
    
    // Handle different possible formats
    
    // Format 1: { currentSession: { access_token: "..." } }
    if (parsedSession?.currentSession?.access_token) {
      const token = parsedSession.currentSession.access_token;
      const expiresAt = parsedSession.currentSession.expires_at;
      
      // Check if token is expired (if expires_at is available)
      if (expiresAt && new Date().getTime() > expiresAt) {
        console.warn('Token expired, clearing from localStorage');
        localStorage.removeItem('supabase.auth.token');
        return null;
      }
      
      return token;
    }
    
    // Format 2: { access_token: "..." } (direct token object)
    if (parsedSession?.access_token) {
      return parsedSession.access_token;
    }
    
    // No valid token format found
    console.warn('Invalid token format in localStorage');
    return null;
  } catch (error) {
    console.error('Error parsing auth token:', error);
    // Clean up invalid token
    localStorage.removeItem('supabase.auth.token');
    return null;
  }
};

// Initialize auth state
let currentUser: any = null;
let authStateListeners: ((user: any) => void)[] = [];

// Helper to notify listeners
const notifyListeners = (user: any) => {
  authStateListeners.forEach(listener => listener(user));
};

// Initialize auth state
export const initAuth = async () => {
  const token = getSessionToken();
  if (token) {
    const { data } = await auth.getUser(token);
    currentUser = data;
    notifyListeners(currentUser);
  }
};

// Subscribe to auth changes
export const onAuthStateChange = (callback: (user: any) => void) => {
  authStateListeners.push(callback);
  // Return unsubscribe function
  return () => {
    authStateListeners = authStateListeners.filter(listener => listener !== callback);
  };
};

// Get current user
export const getCurrentUser = async () => {
  const token = getSessionToken();
  if (!token) return { data: { user: null }, error: null };
  return auth.getUser(token);
};

// Sign out
export const signOut = async () => {
  const token = getSessionToken();
  if (token) {
    await auth.signOut(token);
  }
  localStorage.removeItem('supabase.auth.token');
  currentUser = null;
  notifyListeners(null);
  return { error: null };
};

// Sign in
export const signIn = async ({ email, password }: { email: string; password: string }) => {
  try {
    const { data, error } = await auth.signIn(email, password);
    
    if (error) return { data: null, error };
    
    if (data?.access_token) {
      // Format the data properly for localStorage with a long expiration (1 year)
      localStorage.setItem('supabase.auth.token', JSON.stringify({
        currentSession: {
          access_token: data.access_token,
          refresh_token: data.refresh_token || "",
          // Set a very long expiration (1 year from now)
          expires_at: new Date().getTime() + (365 * 24 * 3600 * 1000)
        }
      }));
      
      // Get user data with the access token
      const { data: userData } = await auth.getUser(data.access_token);
      currentUser = userData;
      notifyListeners(currentUser);
      
      return { data, error: null };
    }
    
    return { data, error: { message: "No access token received from the server" } };
  } catch (err: any) {
    return { data: null, error: err };
  }
};

// Sign up
export const signUp = async ({ email, password }: { email: string; password: string }) => {
  return auth.signUp(email, password);
};

// Reset password
export const resetPassword = async (email: string) => {
  return auth.resetPassword(email);
};

// Update password
export const updatePassword = async (password: string) => {
  const token = getSessionToken();
  if (!token) return { error: { message: 'No session found' } };
  return auth.updatePassword(token, password);
};

export interface User {
  id: string;
  email: string;
  full_name?: string;
  avatar_url?: string;
  created_at: string;
  updated_at: string;
}

// React hook for getting the current user
export function useUser() {
  const [user, setUser] = useState<User | null>(null);
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState<Error | null>(null);

  useEffect(() => {
    const fetchUser = async () => {
      try {
        setIsLoading(true);
        const { data, error } = await getCurrentUser();
        
        if (error) {
          throw new Error(error.message);
        }
        
        if (data?.user) {
          // Get additional user data if needed
          setUser(data.user as unknown as User);
        } else {
          setUser(null);
        }
      } catch (err) {
        console.error('Error fetching user:', err);
        setError(err instanceof Error ? err : new Error('Failed to fetch user'));
      } finally {
        setIsLoading(false);
      }
    };

    fetchUser();

    // Subscribe to auth changes
    const unsubscribe = onAuthStateChange((user) => {
      setUser(user as unknown as User);
    });

    return () => {
      unsubscribe();
    };
  }, []);

  return {
    user,
    isLoading,
    error,
  };
}
