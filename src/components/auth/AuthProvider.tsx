
import React, { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { toast } from 'sonner';
import { signIn, signUp, resetPassword, signOut } from '@/api/auth-service';
import { supabase } from '@/integrations/supabase/supabase-client';

interface AuthProviderProps {
  children: React.ReactNode;
}

export const AuthProvider: React.FC<AuthProviderProps> = ({ children }) => {
  const navigate = useNavigate();
  const [isLoading, setIsLoading] = useState(true);
  const [session, setSession] = useState<any>(null);

  useEffect(() => {
    // Initial session check
    const initializeAuth = async () => {
      try {
        const { data } = await supabase.auth.getSession();
        setSession(data.session);
        setIsLoading(false);

        // Set up listener for auth changes
        const { data: { subscription } } = supabase.auth.onAuthStateChange(
          (_event, currentSession) => {
            setSession(currentSession);
          }
        );

        return () => {
          subscription.unsubscribe();
        };
      } catch (error) {
        console.error('Error initializing auth:', error);
        setIsLoading(false);
      }
    };

    initializeAuth();
  }, []);

  const handleSignIn = async (email: string, password: string) => {
    setIsLoading(true);
    try {
      const { error } = await signIn(email, password);
      
      if (error) {
        toast.error(error.message || 'Sign in failed');
        return false;
      }
      
      toast.success('Signed in successfully');
      navigate('/app/dashboard');
      return true;
    } catch (err) {
      const errorMessage = err instanceof Error ? err.message : 'An unexpected error occurred';
      toast.error(errorMessage);
      return false;
    } finally {
      setIsLoading(false);
    }
  };

  const handleSignUp = async (email: string, password: string, metadata?: any) => {
    setIsLoading(true);
    try {
      const { error, data } = await signUp(email, password, metadata);
      
      if (error) {
        toast.error(error.message || 'Sign up failed');
        return false;
      }
      
      toast.success('Account created successfully');
      navigate('/auth/login');
      return true;
    } catch (err) {
      const errorMessage = err instanceof Error ? err.message : 'An unexpected error occurred';
      toast.error(errorMessage);
      return false;
    } finally {
      setIsLoading(false);
    }
  };

  const handleSendPasswordResetEmail = async (email: string) => {
    setIsLoading(true);
    try {
      const { error } = await resetPassword(email);
      
      if (error) {
        toast.error(error.message || 'Failed to send password reset email');
        return false;
      }
      
      toast.success('Password reset email sent');
      return true;
    } catch (err) {
      const errorMessage = err instanceof Error ? err.message : 'An unexpected error occurred';
      toast.error(errorMessage);
      return false;
    } finally {
      setIsLoading(false);
    }
  };

  const handleSignOut = async () => {
    try {
      const { error } = await signOut();
      
      if (error) {
        toast.error(error.message || 'Sign out failed');
        return false;
      }
      
      toast.success('Signed out successfully');
      navigate('/');
      return true;
    } catch (err) {
      const errorMessage = err instanceof Error ? err.message : 'An unexpected error occurred';
      toast.error(errorMessage);
      return false;
    }
  };

  return (
    <AuthContext.Provider value={{
      signIn: handleSignIn,
      signUp: handleSignUp,
      sendPasswordResetEmail: handleSendPasswordResetEmail,
      signOut: handleSignOut,
      isLoading,
      session,
      user: session?.user || null
    }}>
      {children}
    </AuthContext.Provider>
  );
};

// Create a context for the AuthProvider
const AuthContext = React.createContext<{
  signIn: (email: string, password: string) => Promise<boolean>;
  signUp: (email: string, password: string, metadata?: any) => Promise<boolean>;
  sendPasswordResetEmail: (email: string) => Promise<boolean>;
  signOut: () => Promise<boolean>;
  isLoading: boolean;
  session: any | null;
  user: any | null;
}>({
  signIn: async () => false,
  signUp: async () => false,
  sendPasswordResetEmail: async () => false,
  signOut: async () => false,
  isLoading: false,
  session: null,
  user: null
});

export const useAuth = () => {
  const context = React.useContext(AuthContext);
  if (context === undefined) {
    throw new Error('useAuth must be used within an AuthProvider');
  }
  return context;
};

export default AuthProvider;
