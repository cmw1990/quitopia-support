import { Component, ErrorInfo, ReactNode } from 'react';
import { Button } from './ui/button';
import { AlertCircle } from 'lucide-react';

interface Props {
  children: ReactNode;
  fallback?: ReactNode;
}

interface State {
  hasError: boolean;
  error: Error | null;
  errorInfo: ErrorInfo | null;
}

export class ErrorBoundary extends Component<Props, State> {
  public state: State = {
    hasError: false,
    error: null,
    errorInfo: null,
  };

  public static getDerivedStateFromError(error: Error): State {
    return { hasError: true, error, errorInfo: null };
  }

  public componentDidCatch(error: Error, errorInfo: ErrorInfo) {
    console.error('Uncaught error:', error, errorInfo);
    this.setState({
      error,
      errorInfo,
    });
  }

  private handleReload = () => {
    window.location.reload();
  };

  private handleGoHome = () => {
    window.location.href = '/';
  };

  public render() {
    if (this.state.hasError) {
      return (
        <div className="flex min-h-screen flex-col items-center justify-center p-4">
          <div className="flex flex-col items-center space-y-4 text-center">
            <AlertCircle className="h-12 w-12 text-destructive" />
            <h1 className="text-2xl font-bold">Something went wrong</h1>
            <p className="max-w-md text-muted-foreground">
              {this.state.error?.message || 'An unexpected error occurred'}
            </p>
            <div className="flex space-x-4">
              <Button onClick={this.handleReload} variant="default">
                Try Again
              </Button>
              <Button onClick={this.handleGoHome} variant="outline">
                Go Home
              </Button>
            </div>
            {process.env.NODE_ENV === 'development' && this.state.errorInfo && (
              <pre className="mt-4 max-h-96 w-full max-w-2xl overflow-auto rounded-lg bg-muted p-4 text-left text-sm">
                <code>{this.state.errorInfo.componentStack}</code>
              </pre>
            )}
          </div>
        </div>
      );
    }

    return this.props.children;
  }
}
