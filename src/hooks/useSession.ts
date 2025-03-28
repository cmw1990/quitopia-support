import { useState, useEffect } from 'react';
import { supabaseRestCall, getCurrentSession, onAuthStateChange } from "../api/apiCompatibility";
import { Session } from '@supabase/supabase-js';

export interface SessionState {
  session: Session | null;
  isLoading: boolean;
  user: any | null;
}

export const useSession = (): SessionState => {
  const [session, setSession] = useState<Session | null>(null);
  const [isLoading, setIsLoading] = useState(true);

  useEffect(() => {
    // Get initial session
    const getInitialSession = async () => {
      try {
        const currentSession = await getCurrentSession();
        setSession(currentSession);
      } catch (error) {
        console.error('Error getting session:', error);
      } finally {
        setIsLoading(false);
      }
    };
    
    getInitialSession();

    // Set up listener for auth changes
    const subscription = onAuthStateChange((_event, session) => {
      setSession(session);
      setIsLoading(false);
    });

    return () => {
      subscription.unsubscribe();
    };
  }, []);

  return {
    session,
    isLoading,
    user: session?.user || null,
  };
}; 