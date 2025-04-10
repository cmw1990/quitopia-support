import { useEffect, useState } from 'react';
import { onAuthStateChange, initAuth } from '../auth';

export function useAuth() {
  const [user, setUser] = useState<any>(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    // Initialize auth state
    initAuth().finally(() => setLoading(false));

    // Subscribe to auth changes
    const unsubscribe = onAuthStateChange((user) => {
      setUser(user);
      setLoading(false);
    });

    return unsubscribe;
  }, []);

  return { user, loading };
} 