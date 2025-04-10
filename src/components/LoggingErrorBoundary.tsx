import React, { Component, ErrorInfo, ReactNode } from 'react';

interface Props {
  children: ReactNode;
  componentName?: string; // Optional name for context
}

interface State {
  hasError: boolean;
  error: Error | null;
  errorInfo: ErrorInfo | null;
}

class LoggingErrorBoundary extends Component<Props, State> {
  public state: State = {
    hasError: false,
    error: null,
    errorInfo: null,
  };

  public static getDerivedStateFromError(error: Error): State {
    // Update state so the next render will show the fallback UI.
    return { hasError: true, error: error, errorInfo: null }; // errorInfo comes from componentDidCatch
  }

  public componentDidCatch(error: Error, errorInfo: ErrorInfo) {
    const componentName = this.props.componentName || 'UnknownComponent';
    console.error(`[LoggingErrorBoundary caught error in ${componentName}]:`, error, errorInfo);
    this.setState({ error: error, errorInfo: errorInfo });
    // You can also log the error to an error reporting service here
    // logErrorToMyService(error, errorInfo);
  }

  public render() {
    if (this.state.hasError) {
      // You can render any custom fallback UI
      return (
          <div className="p-4 bg-red-100 border border-red-400 text-red-700 rounded">
              <h1 className="font-bold">Something went wrong rendering {this.props.componentName || 'this section'}.</h1>
              <details className="mt-2 text-sm">
                  <summary>Error Details</summary>
                  <pre className="mt-1 text-xs whitespace-pre-wrap">
                      {this.state.error && this.state.error.toString()}
                      <br />
                      {this.state.errorInfo && this.state.errorInfo.componentStack}
                  </pre>
              </details>
          </div>
      );
    }

    return this.props.children;
  }
}

export default LoggingErrorBoundary; 