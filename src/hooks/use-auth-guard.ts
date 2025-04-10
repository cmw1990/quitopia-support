import { useEffect, useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { useAuth } from '../components/AuthProvider';
import { toast } from 'sonner';
import { handleError } from '../utils/error-handler';

/**
 * Hook to protect routes that require authentication
 * @param redirectTo - Path to redirect to if not authenticated
 * @returns Object with loading state, user data, and authenticated status
 */
export const useAuthGuard = (redirectTo: string = '/login') => {
  const { user, isLoading, isAuthenticated } = useAuth();
  const navigate = useNavigate();
  const [guardLoading, setGuardLoading] = useState(true);

  useEffect(() => {
    try {
      // Wait for auth state to initialize
      if (!isLoading) {
        if (!isAuthenticated) {
          // Not authenticated, redirect
          toast.error('Please sign in to access this page', {
            id: 'auth-required',
          });
          navigate(redirectTo);
        }
        setGuardLoading(false);
      }
    } catch (error) {
      handleError(
        error, 
        'useAuthGuard', 
        'Authentication error'
      );
      navigate(redirectTo);
    }
  }, [isLoading, isAuthenticated, navigate, redirectTo]);

  return {
    loading: isLoading || guardLoading,
    user,
    isAuthenticated
  };
}; 