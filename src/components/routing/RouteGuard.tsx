import { useEffect } from 'react';
import { useNavigate, useLocation } from 'react-router-dom';
import { useRouteGuard, RouteRequirements } from '@/utils/route-guards';
import { LoadingSpinner } from '@/components/ui/loading-spinner';
import { RouteErrorBoundary } from './RouteErrorBoundary';

interface RouteGuardProps {
  children: React.ReactNode;
  requirements: RouteRequirements;
  fallback?: string;
  loadingComponent?: React.ReactNode;
  onAccessDenied?: (reason: string) => void;
  onError?: (error: Error, errorInfo: React.ErrorInfo) => void;
}

export function RouteGuard({
  children,
  requirements,
  fallback = '/',
  loadingComponent = <DefaultLoadingComponent />,
  onAccessDenied,
  onError
}: RouteGuardProps) {
  const { loading } = useRouteGuard(requirements);
  const navigate = useNavigate();
  const location = useLocation();

  useEffect(() => {
    // Track page views
    trackPageView(location.pathname);

    // Clean up navigation tracking on unmount
    return () => {
      cleanupNavigation();
    };
  }, [location]);

  if (loading) {
    return loadingComponent;
  }

  return (
    <RouteErrorBoundary 
      fallback={fallback}
      onError={(error, errorInfo) => {
        // Handle errors
        handleRouteError(error, errorInfo, navigate, location);
        onError?.(error, errorInfo);
      }}
    >
      {children}
    </RouteErrorBoundary>
  );
}

// Default loading component
function DefaultLoadingComponent() {
  return (
    <div className="flex min-h-screen items-center justify-center">
      <LoadingSpinner size="lg" />
    </div>
  );
}

// Page view tracking
function trackPageView(path: string) {
  try {
    // TODO: Implement analytics tracking
    console.log('Page view:', path);
  } catch (error) {
    console.error('Failed to track page view:', error);
  }
}

// Navigation cleanup
function cleanupNavigation() {
  try {
    // Clean up any navigation-related resources
    // For example, cancel pending requests
  } catch (error) {
    console.error('Failed to cleanup navigation:', error);
  }
}

// Error handling
function handleRouteError(
  error: Error,
  errorInfo: React.ErrorInfo,
  navigate: (path: string, options?: any) => void,
  location: { pathname: string }
) {
  // Log error
  console.error('Route Error:', {
    error,
    componentStack: errorInfo.componentStack,
    path: location.pathname,
    timestamp: new Date().toISOString()
  });

  // Navigate to error page with context
  navigate('/error', {
    state: {
      error: error.message,
      from: location.pathname,
      stack: errorInfo.componentStack
    }
  });
}
