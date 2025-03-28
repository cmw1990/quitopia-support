/**
 * Auth Service - Utility functions for authentication
 * Provides convenience methods for authentication tasks
 */

import { Session } from '@supabase/supabase-js';
import { toast } from 'sonner';
import { signInWithEmail, signOut as signOutApi } from "./apiCompatibility";

/**
 * Login with email and password
 * Returns a session if successful, otherwise throws an error
 */
export const login = async (email: string, password: string): Promise<Session> => {
  try {
    console.log('AuthService: Attempting login with email:', email);
    const { session } = await signInWithEmail(email, password);
    
    if (!session) {
      throw new Error('Login failed: No session returned');
    }
    
    console.log('AuthService: Login successful');
    return session;
  } catch (error) {
    console.error('AuthService: Login error:', error);
    
    // Format the error message for display
    let errorMessage = 'Login failed. Please check your credentials.';
    if (error instanceof Error) {
      errorMessage = error.message;
    } else if (typeof error === 'string') {
      errorMessage = error;
    }
    
    // Show toast notification
    toast.error('Login Error', {
      description: errorMessage,
    });
    
    throw error;
  }
};

/**
 * Logout the current user
 * Returns true if successful
 */
export const logout = async (session: Session): Promise<boolean> => {
  try {
    console.log('AuthService: Attempting logout');
    await signOutApi(session);
    console.log('AuthService: Logout successful');
    
    toast.success('Logged Out', {
      description: 'You have been successfully logged out',
    });
    
    return true;
  } catch (error) {
    console.error('AuthService: Logout error:', error);
    
    // Format the error message for display
    let errorMessage = 'Logout failed.';
    if (error instanceof Error) {
      errorMessage = error.message;
    } else if (typeof error === 'string') {
      errorMessage = error;
    }
    
    // Show toast notification
    toast.error('Logout Error', {
      description: errorMessage,
    });
    
    throw error;
  }
};

export default {
  login,
  logout
}; 