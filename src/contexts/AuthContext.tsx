
import React, { createContext, useState, useEffect, useContext } from 'react';
import { supabase } from '@/integrations/supabase/supabase-client';
import { useToast } from '@/hooks/use-toast';

interface User {
  id: string;
  email?: string;
  user_metadata?: {
    full_name?: string;
    avatar_url?: string;
  };
}

interface Session {
  access_token: string;
  refresh_token?: string;
  user: User;
}

interface AuthContextType {
  user: User | null;
  session: Session | null;
  isLoading: boolean;
  isAuthenticated: boolean;
  signIn: (email: string, password: string) => Promise<{ error?: any }>;
  signOut: () => Promise<{ error?: any }>;
  signUp: (email: string, password: string) => Promise<{ error?: any }>;
  sendPasswordResetEmail: (email: string) => Promise<{ error?: any }>;
}

const AuthContext = createContext<AuthContextType | undefined>(undefined);

export const AuthProvider = ({ children }: { children: React.ReactNode }) => {
  const [user, setUser] = useState<User | null>(null);
  const [session, setSession] = useState<Session | null>(null);
  const [isLoading, setIsLoading] = useState(true);
  const { toast } = useToast();

  useEffect(() => {
    // Check for existing session when the component mounts
    const checkSession = async () => {
      try {
        const { data: { session }, error } = await supabase.auth.getSession();
        
        if (error) {
          console.error('Error fetching session:', error);
          setIsLoading(false);
          return;
        }
        
        if (session) {
          setSession(session);
          setUser(session.user);
        }
      } catch (error) {
        console.error('Session fetch error:', error);
      } finally {
        setIsLoading(false);
      }
    };

    // Set up auth state listener
    const { data: { subscription } } = supabase.auth.onAuthStateChange((event, currentSession) => {
      console.log('Auth state changed:', event);
      
      if (currentSession) {
        setSession(currentSession);
        setUser(currentSession.user);
        
        // Store session in localStorage for persistence
        localStorage.setItem('supabase.auth.token', JSON.stringify({
          currentSession: {
            access_token: currentSession.access_token,
            refresh_token: currentSession.refresh_token || "",
            // Set a long expiration (1 year)
            expires_at: new Date().getTime() + (365 * 24 * 3600 * 1000)
          }
        }));
      } else {
        setSession(null);
        setUser(null);
      }
    });

    // Check for existing session
    checkSession();

    // Cleanup function
    return () => {
      subscription.unsubscribe();
    };
  }, []);

  const handleSignIn = async (email: string, password: string) => {
    setIsLoading(true);
    try {
      const { data, error } = await supabase.auth.signInWithPassword({
        email,
        password
      });
      
      if (!error && data?.session) {
        setUser(data.session.user);
        setSession(data.session);
        toast({
          title: "Welcome back!",
          description: "You've successfully signed in.",
        });
      } else if (error) {
        toast({
          title: "Sign in failed",
          description: error.message,
          variant: "destructive",
        });
      }
      
      setIsLoading(false);
      return { error };
    } catch (error) {
      setIsLoading(false);
      toast({
        title: "Sign in error",
        description: "An unexpected error occurred.",
        variant: "destructive", 
      });
      return { error };
    }
  };

  const handleSignUp = async (email: string, password: string) => {
    setIsLoading(true);
    try {
      const { data, error } = await supabase.auth.signUp({
        email,
        password
      });
      
      if (!error) {
        toast({
          title: "Account created!",
          description: "Please check your email for verification.",
        });
      } else {
        toast({
          title: "Sign up failed",
          description: error.message,
          variant: "destructive",
        });
      }
      
      setIsLoading(false);
      return { error };
    } catch (error) {
      setIsLoading(false);
      toast({
        title: "Sign up error",
        description: "An unexpected error occurred.",
        variant: "destructive",
      });
      return { error };
    }
  };

  const handleSignOut = async () => {
    try {
      const { error } = await supabase.auth.signOut();
      
      if (!error) {
        setUser(null);
        setSession(null);
        localStorage.removeItem('supabase.auth.token');
        toast({
          title: "Signed out",
          description: "You've been successfully signed out.",
        });
      } else {
        toast({
          title: "Sign out failed",
          description: error.message,
          variant: "destructive",
        });
      }
      
      return { error };
    } catch (error) {
      toast({
        title: "Sign out error",
        description: "An unexpected error occurred.",
        variant: "destructive",
      });
      return { error };
    }
  };

  const handleSendPasswordResetEmail = async (email: string) => {
    setIsLoading(true);
    try {
      const { error } = await supabase.auth.resetPasswordForEmail(email, {
        redirectTo: `${window.location.origin}/reset-password`
      });
      
      if (!error) {
        toast({
          title: "Password reset email sent",
          description: "Please check your email for password reset instructions.",
        });
      } else {
        toast({
          title: "Password reset failed",
          description: error.message,
          variant: "destructive",
        });
      }
      
      setIsLoading(false);
      return { error };
    } catch (error) {
      setIsLoading(false);
      toast({
        title: "Password reset error",
        description: "An unexpected error occurred.",
        variant: "destructive",
      });
      return { error };
    }
  };

  return (
    <AuthContext.Provider
      value={{
        user,
        session,
        isLoading,
        isAuthenticated: !!user,
        signIn: handleSignIn,
        signOut: handleSignOut,
        signUp: handleSignUp,
        sendPasswordResetEmail: handleSendPasswordResetEmail,
      }}
    >
      {children}
    </AuthContext.Provider>
  );
};

export const useAuth = () => {
  const context = useContext(AuthContext);
  if (!context) {
    throw new Error('useAuth must be used within an AuthProvider');
  }
  return context;
};
