
import { createContext, useState, useEffect, useContext } from 'react';
import { initAuth, getCurrentUser, signIn as authSignIn, signOut as authSignOut, signUp as authSignUp, resetPassword as authResetPassword } from '@/lib/auth';

interface AuthContextType {
  user: any;
  session: any;
  isLoading: boolean;
  isAuthenticated: boolean;
  signIn: (email: string, password: string) => Promise<{ error?: any }>;
  signOut: () => Promise<{ error?: any }>;
  signUp: (email: string, password: string) => Promise<{ error?: any }>;
  sendPasswordResetEmail: (email: string) => Promise<{ error?: any }>;
}

const AuthContext = createContext<AuthContextType | undefined>(undefined);

export const AuthProvider = ({ children }: { children: React.ReactNode }) => {
  const [user, setUser] = useState<any>(null);
  const [session, setSession] = useState<any>(null);
  const [isLoading, setIsLoading] = useState(true);

  useEffect(() => {
    const initializeAuth = async () => {
      try {
        await initAuth();
        const { data } = await getCurrentUser();
        setUser(data?.user || null);
        setSession(data || null);
        setIsLoading(false);
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
      const { data, error } = await authSignIn({ email, password });
      
      if (!error) {
        setUser(data?.user || null);
        setSession(data || null);
      }
      
      setIsLoading(false);
      return { error };
    } catch (error) {
      setIsLoading(false);
      return { error };
    }
  };

  const handleSignUp = async (email: string, password: string) => {
    setIsLoading(true);
    try {
      const { data, error } = await authSignUp({ email, password });
      setIsLoading(false);
      return { error };
    } catch (error) {
      setIsLoading(false);
      return { error };
    }
  };

  const handleSignOut = async () => {
    try {
      const { error } = await authSignOut();
      
      if (!error) {
        setUser(null);
        setSession(null);
      }
      
      return { error };
    } catch (error) {
      return { error };
    }
  };

  const handleSendPasswordResetEmail = async (email: string) => {
    setIsLoading(true);
    try {
      const { error } = await authResetPassword(email);
      setIsLoading(false);
      return { error };
    } catch (error) {
      setIsLoading(false);
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
