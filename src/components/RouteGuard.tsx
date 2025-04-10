import { Navigate, Outlet } from 'react-router-dom';
import { useAuth } from './AuthProvider';
import { LoadingSpinner } from './ui/loading-spinner';

interface RouteGuardProps {
  requireAuth?: boolean;
  redirectTo?: string;
}

export const RouteGuard = ({ 
  requireAuth = true, 
  redirectTo = '/auth/login' 
}: RouteGuardProps) => {
  const { session, loading } = useAuth();

  // Don't show loading spinner for public routes
  if (loading && requireAuth) {
    return (
      <div className="flex h-screen w-screen items-center justify-center">
        <LoadingSpinner size={48} />
      </div>
    );
  }

  if (requireAuth && !session) {
    return <Navigate to={redirectTo} replace />;
  }

  return <Outlet />;
};
