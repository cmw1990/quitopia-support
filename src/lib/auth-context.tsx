import React, { createContext, useContext, useState, useEffect } from 'react';
// Removed incorrect import: import { authApi } from '../api/supabase-rest';

interface AuthContextProps {
  session: Session | null;
  loading: boolean;
  signIn: (email: string, password: string) => Promise<void>;
  signUp: (email: string, password: string) => Promise<void>;
  signOut: () => Promise<void>;
  resetPassword: (email: string) => Promise<void>;
  getUser: () => Promise<any>;
}

export interface Session {
  access_token: string;
  refresh_token: string;
  user: {
    id: string;
    email: string;
  };
}

const AuthContext = createContext<AuthContextProps>({
  session: null,
  loading: true,
  signIn: async () => {},
  signUp: async () => {},
  signOut: async () => {},
  resetPassword: async () => {},
  getUser: async () => {},
});

export const useAuth = () => useContext(AuthContext);

export const AuthProvider: React.FC<{ children: React.ReactNode }> = ({ children }) => {
  const [session, setSession] = useState<Session | null>(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    // Check for existing session in localStorage
    const storedSession = localStorage.getItem('easier_focus_session');
    if (storedSession) {
      try {
        const parsedSession = JSON.parse(storedSession);
        setSession(parsedSession);
        
        // Check session validity by fetching the user
        authApi.getUser(parsedSession)
          .then(() => {
            setSession(parsedSession);
          })
          .catch((error) => {
            console.error('Session invalid, attempting refresh:', error);
            if (parsedSession.refresh_token) {
              refreshSession(parsedSession.refresh_token);
            } else {
              localStorage.removeItem('easier_focus_session');
              setSession(null);
            }
          })
          .finally(() => {
            setLoading(false);
          });
      } catch (e) {
        console.error('Error parsing stored session:', e);
        localStorage.removeItem('easier_focus_session');
        setLoading(false);
      }
    } else {
      setLoading(false);
    }
  }, []);

  const refreshSession = async (refreshToken: string) => {
    try {
      const response = await authApi.refreshSession(refreshToken);
      const newSession = {
        access_token: response.access_token,
        refresh_token: response.refresh_token,
        user: response.user
      };
      
      localStorage.setItem('easier_focus_session', JSON.stringify(newSession));
      setSession(newSession);
    } catch (error) {
      console.error('Error refreshing session:', error);
      localStorage.removeItem('easier_focus_session');
      setSession(null);
    }
  };

  const signIn = async (email: string, password: string) => {
    try {
      setLoading(true);
      const response = await authApi.signIn(email, password);
      
      const newSession = {
        access_token: response.access_token,
        refresh_token: response.refresh_token,
        user: response.user
      };
      
      localStorage.setItem('easier_focus_session', JSON.stringify(newSession));
      setSession(newSession);
      alert('Successfully signed in!');
    } catch (error) {
      console.error('Sign in error:', error);
      alert('Failed to sign in. Please check your credentials.');
      throw error;
    } finally {
      setLoading(false);
    }
  };

  const signUp = async (email: string, password: string) => {
    try {
      setLoading(true);
      const response = await authApi.signUp(email, password);
      
      alert('Account created successfully! Please check your email to confirm your account.');
      
      // Some Supabase instances might auto-confirm and return a session
      if (response.access_token) {
        const newSession = {
          access_token: response.access_token,
          refresh_token: response.refresh_token,
          user: response.user
        };
        
        localStorage.setItem('easier_focus_session', JSON.stringify(newSession));
        setSession(newSession);
      }
    } catch (error) {
      console.error('Sign up error:', error);
      alert('Failed to create account. Please try again.');
      throw error;
    } finally {
      setLoading(false);
    }
  };

  const signOut = async () => {
    try {
      setLoading(true);
      if (session) {
        await authApi.signOut(session);
      }
      
      localStorage.removeItem('easier_focus_session');
      setSession(null);
      alert('Successfully signed out!');
    } catch (error) {
      console.error('Sign out error:', error);
      alert('Failed to sign out. Please try again.');
    } finally {
      setLoading(false);
    }
  };

  const resetPassword = async (email: string) => {
    try {
      setLoading(true);
      await authApi.resetPassword(email);
      alert('Password reset email sent. Please check your inbox.');
    } catch (error) {
      console.error('Reset password error:', error);
      alert('Failed to send password reset email. Please try again.');
      throw error;
    } finally {
      setLoading(false);
    }
  };

  const getUser = async () => {
    if (!session) {
      return null;
    }
    
    try {
      return await authApi.getUser(session);
    } catch (error) {
      console.error('Get user error:', error);
      if (session.refresh_token) {
        await refreshSession(session.refresh_token);
        return await authApi.getUser(session);
      }
      throw error;
    }
  };

  return (
    <AuthContext.Provider value={{
      session,
      loading,
      signIn,
      signUp,
      signOut,
      resetPassword,
      getUser
    }}>
      {children}
    </AuthContext.Provider>
  );
}; 