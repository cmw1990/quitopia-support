import React from 'react';
import { useNavigate, useLocation } from 'react-router-dom';
import { Button } from '@/components/ui/button';

interface ErrorState {
  error: Error | null;
  errorInfo: React.ErrorInfo | null;
}

interface Props {
  children: React.ReactNode;
  fallback?: string;
  onError?: (error: Error, errorInfo: React.ErrorInfo) => void;
}

export class RouteErrorBoundary extends React.Component<Props, ErrorState> {
  constructor(props: Props) {
    super(props);
    this.state = { error: null, errorInfo: null };
  }

  static getDerivedStateFromError(error: Error) {
    return { error };
  }

  componentDidCatch(error: Error, errorInfo: React.ErrorInfo) {
    this.setState({
      error: error,
      errorInfo: errorInfo
    });

    // Call custom error handler if provided
    this.props.onError?.(error, errorInfo);

    // Log error to monitoring service
    this.logError(error, errorInfo);
  }

  private logError(error: Error, errorInfo: React.ErrorInfo) {
    // TODO: Implement error logging service
    console.error('Route Error:', {
      error: error,
      componentStack: errorInfo.componentStack,
      timestamp: new Date().toISOString()
    });
  }

  private handleRetry = () => {
    this.setState({ error: null, errorInfo: null });
  };

  render() {
    if (this.state.error) {
      return <ErrorFallback 
        error={this.state.error}
        fallback={this.props.fallback}
        onRetry={this.handleRetry}
      />;
    }

    return this.props.children;
  }
}

interface ErrorFallbackProps {
  error: Error;
  fallback?: string;
  onRetry: () => void;
}

function ErrorFallback({ error, fallback, onRetry }: ErrorFallbackProps) {
  const navigate = useNavigate();
  const location = useLocation();

  const handleNavigateHome = () => {
    navigate('/', { 
      state: { 
        from: location.pathname,
        error: error.message
      }
    });
  };

  const handleNavigateFallback = () => {
    if (fallback) {
      navigate(fallback, {
        state: {
          from: location.pathname,
          error: error.message
        }
      });
    }
  };

  return (
    <div className="flex min-h-screen items-center justify-center bg-background p-4">
      <div className="w-full max-w-md rounded-lg border bg-card p-6 shadow-lg">
        <h2 className="mb-4 text-2xl font-bold text-foreground">
          Oops! Something went wrong
        </h2>
        
        <div className="mb-4 rounded bg-muted p-3 text-sm text-muted-foreground">
          {error.message || 'An unexpected error occurred'}
        </div>

        <div className="space-y-2">
          <Button 
            onClick={onRetry}
            variant="default"
            className="w-full"
          >
            Try Again
          </Button>

          {fallback && (
            <Button
              onClick={handleNavigateFallback}
              variant="outline"
              className="w-full"
            >
              Go to Fallback Page
            </Button>
          )}

          <Button
            onClick={handleNavigateHome}
            variant="ghost"
            className="w-full"
          >
            Return Home
          </Button>
        </div>

        <p className="mt-4 text-center text-sm text-muted-foreground">
          If the problem persists, please contact support
        </p>
      </div>
    </div>
  );
}
