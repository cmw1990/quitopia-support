import React, { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { toast } from 'react-hot-toast';
import { signIn, signUp, resetPassword } from '@/api/auth-service';

interface AuthProviderProps {
  children: React.ReactNode;
}

export const AuthProvider: React.FC<AuthProviderProps> = ({ children }) => {
  const navigate = useNavigate();
  const [isLoading, setIsLoading] = useState(false);

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

  return (
    <AuthContext.Provider value={{
      signIn: handleSignIn,
      signUp: handleSignUp,
      sendPasswordResetEmail: handleSendPasswordResetEmail,
      isLoading
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
  isLoading: boolean;
}>({
  signIn: async () => false,
  signUp: async () => false,
  sendPasswordResetEmail: async () => false,
  isLoading: false
});

export const useAuth = () => {
  const context = React.useContext(AuthContext);
  if (context === undefined) {
    throw new Error('useAuth must be used within an AuthProvider');
  }
  return context;
};

export default AuthProvider;
