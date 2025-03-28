import React, { Component, ErrorInfo, ReactNode } from "react";
import { AlertTriangle, RefreshCw, Leaf } from "lucide-react";
import { Button } from "./ui/button";

interface Props {
  children: ReactNode;
  fallback?: ReactNode;
  onReset?: () => void;
}

interface State {
  hasError: boolean;
  error: Error | null;
  errorInfo: ErrorInfo | null;
}

class ErrorBoundary extends Component<Props, State> {
  public state: State = {
    hasError: false,
    error: null,
    errorInfo: null
  };

  public static getDerivedStateFromError(error: Error): Partial<State> {
    return { hasError: true, error };
  }

  public componentDidCatch(error: Error, errorInfo: ErrorInfo): void {
    this.setState({ errorInfo });
    console.error("Uncaught error:", error, errorInfo);
    
    // You could also send to an error reporting service here
    // e.g., Sentry, LogRocket, etc.
  }
  
  private handleReset = () => {
    // Reset the error boundary state
    this.setState({ 
      hasError: false, 
      error: null,
      errorInfo: null
    });
    
    // Call the optional onReset prop if provided
    if (this.props.onReset) {
      this.props.onReset();
    }
  };

  public render(): ReactNode {
    if (this.state.hasError) {
      if (this.props.fallback) {
        return this.props.fallback;
      }

      return (
        <div className="flex flex-col items-center justify-center p-8 border rounded-lg bg-amber-50 text-amber-800 max-w-md mx-auto my-6 shadow-md">
          <div className="mb-3 flex items-center justify-center">
            <Leaf className="w-8 h-8 text-emerald-500 mr-2" />
            <AlertTriangle className="w-8 h-8 text-amber-500" />
          </div>
          <h2 className="text-xl font-bold mb-2">Something went wrong</h2>
          <p className="text-sm text-center mb-4">
            {this.state.error?.message || "An unexpected error occurred"}
          </p>
          <div className="p-3 bg-amber-100 rounded-md mb-4 max-h-32 overflow-auto w-full text-xs font-mono">
            {this.state.errorInfo?.componentStack || ''}
          </div>
          <Button
            onClick={this.handleReset}
            className="px-4 py-2 bg-emerald-600 hover:bg-emerald-700 text-white rounded-md flex items-center"
          >
            <RefreshCw className="w-4 h-4 mr-2" />
            Try again
          </Button>
        </div>
      );
    }

    return this.props.children;
  }
}

export default ErrorBoundary; 