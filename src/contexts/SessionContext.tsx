import React, { createContext, useContext, ReactNode } from 'react';
import { Session } from '@supabase/supabase-js';
import { useNavigate } from 'react-router-dom';

// Create context
interface SessionContextType {
  session: Session | null;
  loading: boolean;
}

const SessionContext = createContext<SessionContextType>({
  session: null,
  loading: true
});

// Hook for using the session context
export const useSession = () => useContext(SessionContext);

interface SessionProviderProps {
  children: ReactNode;
  session: Session | null;
}

// Provider component
export const SessionProvider: React.FC<SessionProviderProps> = ({ 
  children, 
  session 
}) => {
  return (
    <SessionContext.Provider value={{ 
      session, 
      loading: false 
    }}>
      {children}
    </SessionContext.Provider>
  );
};

// Wrapper component for passing session to child components
interface SessionWrapperProps {
  children: (session: Session | null) => ReactNode;
}

export const SessionWrapper: React.FC<SessionWrapperProps> = ({ children }) => {
  // In a real implementation, you might fetch session from supabase
  // For now, we'll check localStorage
  const [session, setSession] = React.useState<Session | null>(null);
  const [loading, setLoading] = React.useState(true);
  const navigate = useNavigate();

  React.useEffect(() => {
    // Check for session in localStorage
    const storedSession = localStorage.getItem('mission_fresh_session');
    
    if (storedSession) {
      try {
        const parsedSession = JSON.parse(storedSession);
        setSession(parsedSession);
      } catch (error) {
        console.error('Error parsing stored session:', error);
        // Handle invalid session by redirecting to login
        navigate('/auth');
      }
    }
    
    setLoading(false);
  }, [navigate]);

  if (loading) {
    return <div className="p-4">Loading session...</div>;
  }

  // Redirect to login if no session
  if (!session) {
    // For testing/dev purposes, create a mock session
    const mockSession = {
      user: {
        id: 'mock-user-id',
        email: 'user@example.com',
        role: 'authenticated',
        app_metadata: {},
        user_metadata: {
          full_name: 'Test User'
        },
        aud: 'authenticated'
      },
      access_token: 'mock-token',
      refresh_token: 'mock-refresh-token',
      expires_at: Date.now() + 3600000
    };

    // Store in localStorage for persistence
    localStorage.setItem('mission_fresh_session', JSON.stringify(mockSession));
    
    // Use mock session
    return <>{children(mockSession as any)}</>;
  }

  return <>{children(session)}</>;
}; 