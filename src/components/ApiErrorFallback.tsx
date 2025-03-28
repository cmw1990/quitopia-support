import React, { useState } from 'react';
import { AlertCircle, Wifi, WifiOff, RefreshCw, Cloud, CloudOff } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { useOffline } from '../context/OfflineContext';

type ApiErrorFallbackProps = {
  error: Error;
  onReset: () => void;
  onRetry: () => void;
  resourceName?: string;
};

/**
 * Get user-friendly error message based on error type
 */
const getErrorMessage = (error: Error, isOnline: boolean) => {
  // Network errors
  if (error.message.includes('NetworkError') || error.message.includes('Failed to fetch')) {
    return isOnline 
      ? 'Network error. The server might be unreachable.' 
      : 'You appear to be offline. Please check your internet connection.';
  }
  
  // CORS errors
  if (error.message.includes('CORS') || error.message.includes('cross-origin')) {
    return 'A cross-origin error occurred. This might be a temporary issue.';
  }
  
  // Authentication errors
  if (error.message.includes('401') || error.message.includes('403') || error.message.includes('authentication')) {
    return 'Authentication error. Please try logging in again.';
  }
  
  // Timeout errors
  if (error.message.includes('timeout') || error.message.includes('timed out')) {
    return 'Request timed out. The server might be busy.';
  }
  
  // Default message with the actual error for debugging
  return `An error occurred while loading data: ${error.message}`;
};

export const ApiErrorFallback: React.FC<ApiErrorFallbackProps> = ({ 
  error, 
  onReset, 
  onRetry,
  resourceName = 'resource'
}) => {
  const [isRetrying, setIsRetrying] = useState(false);
  const { 
    isOnline, 
    isOfflineModeEnabled, 
    setOfflineModeEnabled,
    pendingSyncCount
  } = useOffline();

  const handleRetry = async () => {
    setIsRetrying(true);
    try {
      console.log(`Retrying to load ${resourceName}...`);
      await onRetry();
    } catch (retryError) {
      console.error('Retry failed:', retryError);
    } finally {
      setIsRetrying(false);
    }
  };

  const toggleOfflineMode = () => {
    setOfflineModeEnabled(!isOfflineModeEnabled);
  };

  return (
    <div className="p-6 rounded-lg bg-amber-50 border border-amber-200 flex flex-col items-center space-y-4 text-center">
      <div className="flex items-center justify-center w-12 h-12 rounded-full bg-amber-100">
        <AlertCircle className="w-6 h-6 text-amber-800" />
      </div>
      
      <h3 className="text-lg font-semibold text-amber-800">
        Failed to load {resourceName}
      </h3>
      
      <p className="text-amber-700 max-w-md">
        {getErrorMessage(error, isOnline)}
      </p>
      
      <div className="flex items-center justify-center space-x-2 text-sm">
        {isOnline ? (
          <div className="flex items-center text-emerald-700">
            <Wifi className="w-4 h-4 mr-1" />
            <span>Online</span>
          </div>
        ) : (
          <div className="flex items-center text-amber-700">
            <WifiOff className="w-4 h-4 mr-1" />
            <span>Offline</span>
          </div>
        )}
        
        {isOfflineModeEnabled && (
          <div className="flex items-center text-amber-700 ml-3">
            <CloudOff className="w-4 h-4 mr-1" />
            <span>Offline Mode Active</span>
            {pendingSyncCount > 0 && (
              <span className="ml-1 px-1.5 py-0.5 text-xs bg-amber-200 rounded-full">
                {pendingSyncCount}
              </span>
            )}
          </div>
        )}
      </div>
      
      <div className="flex flex-wrap justify-center gap-3 mt-4">
        <Button 
          variant="outline"
          className="bg-white border-amber-300 text-amber-800 hover:bg-amber-100"
          onClick={onReset}
        >
          Reset
        </Button>
        
        <Button 
          variant="default"
          className="bg-emerald-600 hover:bg-emerald-700"
          onClick={handleRetry}
          disabled={isRetrying || (!isOnline && !isOfflineModeEnabled)}
        >
          {isRetrying ? (
            <>
              <RefreshCw className="w-4 h-4 mr-2 animate-spin" />
              Retrying...
            </>
          ) : (
            'Retry'
          )}
        </Button>
        
        {!isOnline && (
          <Button
            variant={isOfflineModeEnabled ? "default" : "outline"}
            className={isOfflineModeEnabled 
              ? "bg-amber-600 hover:bg-amber-700" 
              : "border-amber-300 text-amber-800 hover:bg-amber-100"
            }
            onClick={toggleOfflineMode}
          >
            {isOfflineModeEnabled ? (
              <>
                <Cloud className="w-4 h-4 mr-2" />
                Exit Offline Mode
              </>
            ) : (
              <>
                <CloudOff className="w-4 h-4 mr-2" />
                Enter Offline Mode
              </>
            )}
          </Button>
        )}
      </div>
    </div>
  );
}; 