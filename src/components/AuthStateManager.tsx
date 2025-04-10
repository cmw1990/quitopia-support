import React, { useEffect, useState } from 'react';
import { getUser } from '@/integrations/supabase/supabase-client'; // Correct import

// Define a simplified session type that's compatible with what we receive
interface SimpleSession {
  access_token: string;
  refresh_token?: string;
  expires_at?: number;
  user: {
    id: string;
    email?: string;
    [key: string]: any;
  };
}

interface AuthStateManagerProps {
  children: React.ReactNode;
}

/**
 * AuthStateManager is a component that handles authentication state for sub-apps
 * It provides a consistent authentication state across all sub-apps
 */
export const AuthStateManager: React.FC<AuthStateManagerProps> = ({ children }) => {
  const [session, setSession] = useState<SimpleSession | null>(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    // Check for existing session in localStorage
    const checkAuth = async () => {
      try {
        const storedSession = localStorage.getItem('supabase.auth.token');
        if (storedSession) {
          try {
            const { access_token } = JSON.parse(storedSession);

            // Validate the token by getting the user
            try {
              const sessionData = await getUser(); // Use the correct function
              if (sessionData && sessionData.id) {
                console.log('Auth state manager: Valid session found');
                // Create a simplified session object
                const simpleSession: SimpleSession = {
                  access_token: access_token,
                  user: {
                    id: sessionData.id,
                    email: sessionData.email
                  }
                }
                setSession(simpleSession);
              } else {
                console.log('Auth state manager: Invalid session token');
                setSession(null);
              }
            } catch (e) {
              console.error('Auth state manager: Error getting user:', e);
              localStorage.removeItem('supabase.auth.token');
              setSession(null);
            }
          } catch (e) {
            console.error('Auth state manager: Error parsing token:', e);
            localStorage.removeItem('supabase.auth.token');
            setSession(null);
          }
        } else {
          console.log('Auth state manager: No session token found');
          setSession(null);
        }
      } catch (err) {
        console.error('Auth state manager: Error checking auth:', err);
        setSession(null);
      } finally {
        setLoading(false);
      }
    };

    checkAuth();

    // Set up an event listener for auth state changes
    const handleStorageChange = (e: StorageEvent) => {
      if (e.key === 'supabase.auth.token') {
        checkAuth();
      }
    };

    window.addEventListener('storage', handleStorageChange);
    return () => window.removeEventListener('storage', handleStorageChange);
  }, []);

  // Clone children with session prop
  const childrenWithProps = React.Children.map(children, (child) => {
    if (React.isValidElement(child)) {
      // Use type assertion to bypass the TypeScript error
      return React.cloneElement(child as any, { session });
    }
    return child;
  });

  if (loading) {
    return (
      <div className="flex items-center justify-center min-h-screen">
        <div className="w-8 h-8 border-t-2 border-b-2 border-gray-900 rounded-full animate-spin"></div>
        <span className="ml-2">Loading authentication...</span>
      </div>
    );
  }

  return <>{childrenWithProps}</>;
};
