import { supabase } from '@/integrations/supabase/supabase-client';
import { AuthError } from '@supabase/supabase-js';

interface AuthResult {
  data?: any;
  error?: AuthError | null;
}

export const signIn = async (email: string, password: string): Promise<AuthResult> => {
  try {
    const { data, error } = await supabase.auth.signInWithPassword({
      email,
      password
    });

    if (error) {
      console.error('Sign in error:', error);
      return { error };
    }

    return { data };
  } catch (err) {
    console.error('Unexpected sign in error:', err);
    return { 
      error: {
        name: 'UnexpectedError',
        message: err instanceof Error ? err.message : 'An unexpected error occurred'
      } as AuthError
    };
  }
};

export const signUp = async (email: string, password: string, metadata?: any): Promise<AuthResult> => {
  try {
    const { data, error } = await supabase.auth.signUp({
      email,
      password,
      options: {
        data: metadata
      }
    });

    if (error) {
      console.error('Sign up error:', error);
      return { error };
    }

    return { data };
  } catch (err) {
    console.error('Unexpected sign up error:', err);
    return { 
      error: {
        name: 'UnexpectedError',
        message: err instanceof Error ? err.message : 'An unexpected error occurred'
      } as AuthError
    };
  }
};

export const resetPassword = async (email: string): Promise<AuthResult> => {
  try {
    const { data, error } = await supabase.auth.resetPasswordForEmail(email, {
      redirectTo: `${window.location.origin}/auth/reset-password`
    });

    if (error) {
      console.error('Password reset error:', error);
      return { error };
    }

    return { data };
  } catch (err) {
    console.error('Unexpected password reset error:', err);
    return { 
      error: {
        name: 'UnexpectedError',
        message: err instanceof Error ? err.message : 'An unexpected error occurred'
      } as AuthError
    };
  }
};

export const updatePassword = async (newPassword: string): Promise<AuthResult> => {
  try {
    const { data, error } = await supabase.auth.updateUser({
      password: newPassword
    });

    if (error) {
      console.error('Update password error:', error);
      return { error };
    }

    return { data };
  } catch (err) {
    console.error('Unexpected update password error:', err);
    return { 
      error: {
        name: 'UnexpectedError',
        message: err instanceof Error ? err.message : 'An unexpected error occurred'
      } as AuthError
    };
  }
};

export const signOut = async (): Promise<AuthResult> => {
  try {
    const { error } = await supabase.auth.signOut();

    if (error) {
      console.error('Sign out error:', error);
      return { error };
    }

    return {};
  } catch (err) {
    console.error('Unexpected sign out error:', err);
    return { 
      error: {
        name: 'UnexpectedError',
        message: err instanceof Error ? err.message : 'An unexpected error occurred'
      } as AuthError
    };
  }
};