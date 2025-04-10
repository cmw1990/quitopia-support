import React, { Component, ErrorInfo, ReactNode } from 'react';
import { GlobalErrorHandler } from '../utils/global-error-handler';

interface ErrorBoundaryProps {
  children: ReactNode;
  fallback?: ReactNode;
}

interface ErrorBoundaryState {
  hasError: boolean;
  error?: Error;
  errorInfo?: ErrorInfo;
}

class ErrorBoundary extends Component<ErrorBoundaryProps, ErrorBoundaryState> {
  constructor(props: ErrorBoundaryProps) {
    super(props);
    this.state = { 
      hasError: false 
    };
  }

  static getDerivedStateFromError(error: Error): ErrorBoundaryState {
    // Update state so the next render will show the fallback UI.
    return { 
      hasError: true,
      error 
    };
  }

  componentDidCatch(error: Error, errorInfo: ErrorInfo): void {
    // Log the error to global error handler
    GlobalErrorHandler.handleError(error, {
      type: 'ui',
      severity: 'high',
      source: 'React Error Boundary'
    });

    // You can also log the error to an error reporting service
    this.setState({ 
      error, 
      errorInfo 
    });
  }

  handleRecovery = (): void => {
    // Reset the error state, allowing the app to recover
    this.setState({ 
      hasError: false,
      error: undefined,
      errorInfo: undefined 
    });
  }

  renderDefaultFallback(): ReactNode {
    return (
      <div 
        style={{
          display: 'flex',
          flexDirection: 'column',
          alignItems: 'center',
          justifyContent: 'center',
          height: '100vh',
          backgroundColor: '#f8d7da',
          color: '#721c24',
          padding: '20px',
          textAlign: 'center'
        }}
      >
        <h1>Something Went Wrong</h1>
        <p>We're sorry, but an unexpected error occurred.</p>
        <details style={{ 
          whiteSpace: 'pre-wrap', 
          maxWidth: '800px', 
          margin: '20px',
          padding: '10px',
          backgroundColor: '#fff',
          border: '1px solid #ccc'
        }}>
          {this.state.error && this.state.error.toString()}
          <br />
          {this.state.errorInfo?.componentStack}
        </details>
        <div>
          <button 
            onClick={this.handleRecovery}
            style={{
              padding: '10px 20px',
              backgroundColor: '#007bff',
              color: 'white',
              border: 'none',
              borderRadius: '5px',
              cursor: 'pointer'
            }}
          >
            Try Again
          </button>
        </div>
      </div>
    );
  }

  render(): ReactNode {
    if (this.state.hasError) {
      // Render fallback UI
      return this.props.fallback || this.renderDefaultFallback();
    }

    return this.props.children;
  }
}

// Higher-order component to wrap components with error boundary
export const withErrorBoundary = <P extends object>(
  WrappedComponent: React.ComponentType<P>, 
  fallback?: ReactNode
) => {
  return (props: P) => (
    <ErrorBoundary fallback={fallback}>
      <WrappedComponent {...props} />
    </ErrorBoundary>
  );
};

export default ErrorBoundary;
