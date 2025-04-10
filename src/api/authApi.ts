import { supabase } from '@/lib/supabase';
import { User, Session } from '@supabase/supabase-js';

// Get the current user from supabase auth
export async function getCurrentUser(): Promise<User | null> {
  const { data: { user } } = await supabase.auth.getUser();
  return user;
}

// Get the current session
export async function getCurrentSession(): Promise<Session | null> {
  const { data: { session } } = await supabase.auth.getSession();
  return session;
}

// Sign up with email and password
export async function signUp(email: string, password: string, metadata?: Record<string, any>) {
  const { data, error } = await supabase.auth.signUp({
    email,
    password,
    options: {
      data: metadata,
    }
  });
  
  if (error) {
    throw error;
  }
  
  return data;
}

// Sign in with email and password
export async function signIn(email: string, password: string) {
  const { data, error } = await supabase.auth.signInWithPassword({
    email,
    password
  });
  
  if (error) {
    throw error;
  }
  
  return data;
}

// Sign in with Google OAuth
export async function signInWithGoogle() {
  const { data, error } = await supabase.auth.signInWithOAuth({
    provider: 'google',
    options: {
      redirectTo: window.location.origin
    }
  });
  
  if (error) {
    throw error;
  }
  
  return data;
}

// Sign out
export async function signOut() {
  const { error } = await supabase.auth.signOut();
  
  if (error) {
    throw error;
  }
  
  return true;
}

// Reset password
export async function resetPassword(email: string) {
  const { error } = await supabase.auth.resetPasswordForEmail(email, {
    redirectTo: `${window.location.origin}/reset-password`
  });
  
  if (error) {
    throw error;
  }
  
  return true;
}

// Update password
export async function updatePassword(password: string) {
  const { error } = await supabase.auth.updateUser({
    password
  });
  
  if (error) {
    throw error;
  }
  
  return true;
}

// Update user profile
export async function updateProfile(updates: Record<string, any>) { // Use Record<string, any> matching user_metadata
  const { data, error } = await supabase.auth.updateUser({
    data: updates
  });
  
  if (error) {
    throw error;
  }
  
  return data;
}

// Get user profile from profiles table
export async function getUserProfile() {
  const user = await getCurrentUser();
  
  if (!user) {
    throw new Error('User not authenticated');
  }
  
  const { data, error } = await supabase
    .from('profiles')
    .select('*')
    .eq('id', user.id)
    .single();
  
  if (error) {
    throw error;
  }
  
  return data;
}

// Update user profile in profiles table
export async function updateUserProfile(updates: Record<string, unknown>) { // Use unknown as placeholder for profile structure
  const user = await getCurrentUser();
  
  if (!user) {
    throw new Error('User not authenticated');
  }
  
  const { data, error } = await supabase
    .from('profiles')
    .update(updates)
    .eq('id', user.id)
    .select()
    .single();
  
  if (error) {
    throw error;
  }
  
  return data;
}

// Check if user is authenticated
export async function isAuthenticated() {
  const session = await getCurrentSession();
  return !!session;
}

// Listen for auth state changes
export function onAuthStateChange(callback: (event: 'SIGNED_IN' | 'SIGNED_OUT' | 'USER_UPDATED' | 'PASSWORD_RECOVERY', session: Session | null) => void) {
  const { data } = supabase.auth.onAuthStateChange((event, session) => {
    callback(event, session); // Type assertion 'as any' removed, Supabase types should handle this
  });
  
  return data.subscription;
} 